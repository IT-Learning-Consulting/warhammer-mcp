/**
 * BUG-490 (bugfix sprint Wave 2, D2) — bounded-response helper + global size-guard.
 *
 * Two halves:
 *  (a) `boundList()` — per-surface pagination applied where overflow is live-proven
 *      (rolltable list, chat-message export-chat-log, compendium read-document-from-pack,
 *      document-io export, gmtoolkit run-group-test, syrinscape lists,
 *      item-directory search — BUG-528). Returns the
 *      fixed envelope contract: `items` + `totalAvailable` + `truncated`.
 *  (b) `wrapWithSizeGuard()` — installed at the single registration choke point
 *      (queries.ts registerHandlers) over EVERY query handler. A response whose JSON
 *      serialization exceeds the budget becomes a typed RESPONSE_TOO_LARGE error
 *      envelope naming the surface's limit/filter params instead of a transport-level
 *      hard failure (the pre-fix behavior: 11.2 MB rolltable list spilled to disk /
 *      timed out the query window).
 *
 * Budget rationale: the MCP client rejects tool responses around ~25k tokens; JSON
 * at ~3 chars/token puts the practical ceiling near 75k chars (the live 72.5k-char
 * compendium read already overflowed). 64k chars keeps headroom below that ceiling.
 */

export const DEFAULT_LIST_LIMIT = 50;
export const MAX_LIST_LIMIT = 500;
export const DEFAULT_RESPONSE_BUDGET_CHARS = 64_000;

export interface BoundListOptions {
  limit?: number | undefined;
  offset?: number | undefined;
  /** Per-surface default page size when the caller passes no limit. */
  defaultLimit?: number;
  maxLimit?: number;
}

export interface BoundedList<T> {
  items: T[];
  totalAvailable: number;
  truncated: boolean;
  offset: number;
  limit: number;
}

export function boundList<T>(items: readonly T[], opts: BoundListOptions = {}): BoundedList<T> {
  const defaultLimit = opts.defaultLimit ?? DEFAULT_LIST_LIMIT;
  const maxLimit = opts.maxLimit ?? MAX_LIST_LIMIT;
  const offset = Math.max(0, Math.floor(opts.offset ?? 0));
  const requested = opts.limit === undefined || opts.limit === null ? defaultLimit : Math.floor(opts.limit);
  const limit = Math.min(Math.max(1, requested), maxLimit);
  const slice = items.slice(offset, offset + limit);
  return {
    items: slice,
    totalAvailable: items.length,
    truncated: offset + slice.length < items.length,
    offset,
    limit,
  };
}

/**
 * Per-query-key guidance appended to the RESPONSE_TOO_LARGE error so the caller
 * knows which params bound the surface. Keys are handlerTable keys (queries.ts).
 */
const LIMIT_PARAM_HINTS: Record<string, string> = {
  'listRollTables': 'Pass limit/offset — list returns summary rows (id/name/formula/resultCount); use getRollTable for one table\'s results.',
  'chat-message': 'For export-chat-log pass limit/offset to page the message window.',
  'compendium': 'For read-document-from-pack pass projection:"summary"; request the full document only when needed.',
  'document-io': 'Export is whole-document by nature — export a smaller document, or use the preview action first.',
  'module-gmtoolkit': 'run-group-test returns compact per-target rows; narrow targetGroup if the party is very large.',
  'module-syrinscape': 'Pass limit/offset and/or a name filter to list-soundsets / list-moods.',
  'item-directory': 'For search pass limit/offset (default 50) and/or a query term; for list pass page/pageSize.',
  'module-itempiles': 'For get-contents pass limit/offset to page items and logLimit/logOffset to page the audit log independently (BUG-788); re-call with the returned itemsNextOffset/logNextOffset.',
};

const GENERIC_HINT = 'Use the tool\'s limit/offset/filter/projection parameters, or narrow the request.';

export interface ResponseTooLargeEnvelope {
  success: false;
  error: string;
  sizeChars: number;
  budgetChars: number;
}

/**
 * Returns the response unchanged when within budget; otherwise the typed
 * RESPONSE_TOO_LARGE envelope. Never throws — a non-serializable response is
 * passed through untouched (the transport already owns that failure mode).
 */
export function guardResponseSize(
  queryKey: string,
  response: unknown,
  budgetChars: number = DEFAULT_RESPONSE_BUDGET_CHARS,
): unknown {
  let size: number;
  try {
    const json = JSON.stringify(response);
    size = typeof json === 'string' ? json.length : 0;
  } catch {
    return response;
  }
  if (size <= budgetChars) return response;
  const hint = LIMIT_PARAM_HINTS[queryKey] ?? GENERIC_HINT;
  const envelope: ResponseTooLargeEnvelope = {
    success: false,
    error:
      `RESPONSE_TOO_LARGE: '${queryKey}' response is ${size} chars (budget ${budgetChars}). ${hint} ` +
      'NOTE: the underlying operation may have already completed — for writes, re-read state before retrying.',
    sizeChars: size,
    budgetChars,
  };
  return envelope;
}

/** Choke-point wrapper installed over every registered query handler. */
export function wrapWithSizeGuard(
  queryKey: string,
  handler: (data: unknown) => Promise<any>,
  budgetChars: number = DEFAULT_RESPONSE_BUDGET_CHARS,
): (data: unknown) => Promise<any> {
  return async (data: unknown) => guardResponseSize(queryKey, await handler(data), budgetChars);
}
