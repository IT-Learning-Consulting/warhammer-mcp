// Phase 2 mcp_crud_expansion — RollTable handlers (consolidated + extended).
//
// Foundry-side write/read surface for the RollTable MCP tools. Consolidates the
// 5 handlers previously inlined in queries.ts (lines 1034-1177) and adds 8 new
// handlers scoped in PRD Phase 2.
//
// Anchors:
//   ADR-027 — Phase 2 TableResult documentUuid path correction: v13 BaseTableResult
//             uses a single `documentUuid: DocumentUUIDField` for all document/compendium
//             results; MCP input accepts {documentCollection, documentId} as a builder
//             convenience and the handler assembles the UUID + validates via fromUuid().
//
// CCR-Trust: every function starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// BUG-070: all write handlers pre-validate inputs + post-verify the data layer.

import { z } from 'zod';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import type {
  CreateRollTableInputType,
  AddTableResultsInputType,
  UpdateRollTableInputType,
  UpdateTableResultsInputType,
  DeleteTableResultsInputType,
  NormalizeRollTableInputType,
  ResetRollTableInputType,
  DrawManyFromTableInputType,
  ImportRollTableFromCompendiumInputType,
  TableResultInputType,
} from '@foundry-mcp/shared';
import {
  CreateRollTableInput,
  AddTableResultsInput,
  ListRollTablesInput,
  GetRollTableInput,
  RollOnTableInput,
  DeleteRollTableInput,
  UpdateRollTableInput,
  UpdateTableResultsInput,
  DeleteTableResultsInput,
  NormalizeRollTableInput,
  ResetRollTableInput,
  DrawManyFromTableInput,
  ImportRollTableFromCompendiumInput,
} from '@foundry-mcp/shared';

// Inline inferred types for schemas that don't have named *Type exports in meta.ts.
type GetRollTableInputType = z.infer<typeof GetRollTableInput>;
type RollOnTableInputType = z.infer<typeof RollOnTableInput>;
type DeleteRollTableInputType = z.infer<typeof DeleteRollTableInput>;

// ── Local types ──────────────────────────────────────────────────────────────

type AccessGate = { allowed: boolean };
type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

interface RollTableResultPayload {
  id: string;
  type: string;
  text: string;
  documentUuid: string;
  name: string;
  img: string;
  description: string;
  range: number[];
  weight: number;
  drawn: boolean;
}

// ── Access gate ───────────────────────────────────────────────────────────────

// CCR-Trust: GM-only access for every RollTable handler.
function validateGMAccess(): AccessGate {
  if (!game.user?.isGM) return { allowed: false };
  return { allowed: true };
}

// ── UUID assembly helper ──────────────────────────────────────────────────────
//
// ADR-027: TableResult.documentUuid is a single DocumentUUIDField in v13.
// MCP input uses {documentCollection, documentId} as a builder convenience.
// Assembly heuristic:
//   - documentCollection with NO dot  → world document: "<DocumentCollection>.<documentId>"
//   - documentCollection with ONE+ dot → compendium:  "Compendium.<documentCollection>.<documentId>"

function resolveDocumentUuid(documentCollection: string, documentId: string): string {
  if (documentCollection.includes('.')) {
    // Compendium path: e.g. "wfrp4e-core.Actor" → "Compendium.wfrp4e-core.Actor.<id>"
    return `Compendium.${documentCollection}.${documentId}`;
  }
  // World path: e.g. "Actor" → "Actor.<id>"
  return `${documentCollection}.${documentId}`;
}

// ── Result input normalisation (for create + add-results) ────────────────────
//
// Transforms TableResultInputType (the MCP builder form) into the Foundry
// createEmbeddedDocuments payload shape. Document/compendium inputs carry
// {documentCollection, documentId}; Foundry expects {documentUuid} instead.
// Performs fromUuid validation BEFORE calling Foundry writes.
//
// F04 (silent-drop bug) — Foundry v13's TableResult validator silently drops
// results when optional fields like `range` are present-with-undefined (the
// schema default only applies when the key is absent). Strip undefined keys
// before returning so omitted optional inputs become absent keys on the
// payload, letting Foundry's defaults take effect.
//
// F06 (type enum drift) — v13's CONST.TABLE_RESULT_TYPES has only
// `{text, document}` (no `compendium`). Compendium-typed MCP inputs are an
// API-ergonomics shape — the handler collapses them to `type:'document'`
// for the Foundry payload (the compendium-ness is preserved in the UUID's
// `Compendium.<pack>.<DocType>.<id>` format vs world `<DocType>.<id>`).

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);
  return obj;
}

async function normaliseResultInput(r: TableResultInputType): Promise<any> {
  // F04 (corrected via F12 validation error): v13's TableResult.range is an
  // ArrayField<NumberField> with a length-2 constraint ("cannot have fewer
  // than 2 elements"). When absent OR empty `[]` (the ArrayField default),
  // the validator throws DataModelValidationError and Foundry silently drops
  // the result from createEmbeddedDocuments. Inject a placeholder `[1, 1]`
  // when no range is provided — this matches Foundry's RollTableConfig UI
  // behavior (newly-added results default to [1,1] until the user clicks
  // "normalize"). Callers wanting proportional ranges should:
  //   (a) supply explicit ranges per result, OR
  //   (b) call the `normalize` action after `create`/`add-results` to
  //       rebalance ranges from weights.
  const range = Array.isArray(r.range) && r.range.length === 2 ? r.range : [1, 1];

  if (r.type === 'text') {
    // F08: v13 BaseTableResult.defineSchema has no `text` field — displayable
    // text for text-typed results lives in `name` (StringField). The MCP
    // input keeps `text` as the ergonomic field name; the handler maps it
    // to `name` here. If both are supplied, `text` wins (it is the
    // documented user-facing field).
    return stripUndefined({
      type: 'text',
      name: r.text ?? r.name,
      img: r.img,
      description: r.description,
      range,
      weight: r.weight,
    });
  }
  // 'document' | 'compendium' — assemble documentUuid and validate
  const documentUuid = resolveDocumentUuid(r.documentCollection, r.documentId);
  try {
    const resolved = await (globalThis as any).fromUuid(documentUuid);
    if (!resolved) {
      throw new Error(
        `ROLLTABLE_INVALID_DOCUMENT_UUID: UUID "${documentUuid}" did not resolve to a document. ` +
        `Check documentCollection ("${r.documentCollection}") and documentId ("${r.documentId}").`,
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('ROLLTABLE_')) throw err;
    throw new Error(
      `ROLLTABLE_INVALID_DOCUMENT_UUID: fromUuid("${documentUuid}") threw — ` +
      `${err instanceof Error ? err.message : String(err)}`,
    );
  }
  return stripUndefined({
    type: 'document',
    documentUuid,
    name: r.name,
    img: r.img,
    description: r.description,
    range,
    weight: r.weight,
  });
}

// ── Result serialisation helper (for getRollTable / listRollTables) ───────────

function serialiseResult(r: any): RollTableResultPayload {
  // F08: v13 stores text-typed displayable text in `name`, not `text`.
  // Expose the persisted `name` as both `text` (MCP-side ergonomic field)
  // and `name` (Foundry-side canonical) for backward-compatible response shape.
  const displayText = r.name ?? r.text ?? '';
  return {
    id: r.id as string,
    type: r.type ?? 'text',
    text: displayText,
    documentUuid: r.documentUuid ?? '',
    name: r.name ?? '',
    img: r.img ?? '',
    description: r.description ?? '',
    range: r.range ?? [],
    weight: r.weight ?? 1,
    drawn: r.drawn ?? false,
  };
}

// ── 1. createRollTable ────────────────────────────────────────────────────────

export async function createRollTable(data: unknown): Promise<Envelope<{ id: string; name: string }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createRollTable requires GM' };

  const input: CreateRollTableInputType = CreateRollTableInput.strict().parse(data ?? {});

  // Pre-validate + normalise result inputs before entering the write transaction.
  const normalisedResults: any[] = [];
  for (const r of input.results ?? []) {
    normalisedResults.push(await normaliseResultInput(r));
  }

  return wrappedWrite('createRollTable', async () => {
    if (!input.name) {
      throw new Error('ROLLTABLE_EMPTY_PAYLOAD: Table name is required');
    }

    const tablePayload: any = {
      name: input.name,
      description: input.description,
      formula: input.formula,
      img: input.img,
      replacement: input.replacement,
      displayRoll: input.displayRoll,
      folder: input.folder,
      sort: input.sort,
    };
    // Strip undefined keys so Foundry defaults apply cleanly.
    Object.keys(tablePayload).forEach(k => tablePayload[k] === undefined && delete tablePayload[k]);

    const RollTableCls = (globalThis as any).RollTable as any;
    const table = await RollTableCls.create(tablePayload);
    if (!table) throw new Error('ROLLTABLE_TABLE_NOT_FOUND: RollTable.create returned null unexpectedly');

    if (normalisedResults.length > 0) {
      await table.createEmbeddedDocuments('TableResult', normalisedResults);

      // F05 BUG-070 post-verify: confirm embedded results actually persisted.
      // Without this check, Foundry can silently drop results (e.g. F04 range-undefined drop)
      // and the create handler would falsely report success with the input result count.
      const sizeAfter: number = table.results.size as number;
      if (sizeAfter !== normalisedResults.length) {
        throw new Error(
          `ROLLTABLE_WRITE_NOT_PERSISTED: createRollTable expected ${normalisedResults.length} ` +
          `embedded results but persisted ${sizeAfter}. Foundry may have silently dropped one or ` +
          `more results — check F12 console for validation errors.`,
        );
      }
    }

    notify.created('rolltable', table.name as string, { uuid: (table as any).uuid });

    return { success: true as const, data: { id: table.id as string, name: table.name as string } };
  });
}

// ── 2. addTableResults ────────────────────────────────────────────────────────

export async function addTableResults(data: unknown): Promise<Envelope<{ tableId: string; addedCount: number }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: addTableResults requires GM' };

  const input: AddTableResultsInputType = AddTableResultsInput.strict().parse(data ?? {});

  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  // Pre-validate + normalise result inputs.
  const normalisedResults: any[] = [];
  for (const r of input.results) {
    normalisedResults.push(await normaliseResultInput(r));
  }

  const sizeBefore: number = table.results.size as number;

  return wrappedWrite('addTableResults', async () => {
    await table.createEmbeddedDocuments('TableResult', normalisedResults);

    // BUG-070 post-verify: assert size increased by N.
    const sizeAfter: number = table.results.size as number;
    if (sizeAfter !== sizeBefore + normalisedResults.length) {
      throw new Error(
        `ROLLTABLE_WRITE_NOT_PERSISTED: expected ${sizeBefore + normalisedResults.length} results ` +
        `after addTableResults but found ${sizeAfter}. Foundry may have silently dropped one or more ` +
        `results — check F12 console for validation errors.`,
      );
    }

    if (normalisedResults.length > 0) {
      notify.created('rolltable', `${normalisedResults.length} result(s)`, {
        summary: `added to ${table.name}`,
      });
    }

    return {
      success: true as const,
      data: { tableId: input.tableId, addedCount: normalisedResults.length },
    };
  });
}

// ── 3. listRollTables ─────────────────────────────────────────────────────────

export async function listRollTables(data: unknown): Promise<Envelope<any[]>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: listRollTables requires GM' };

  ListRollTablesInput.strict().parse(data ?? {});

  const tables = ((game as any).tables as any).map((table: any) => ({
    id: table.id,
    name: table.name,
    formula: table.formula,
    description: table.description || '',
    results: (table.results as any).map(serialiseResult),
  }));

  return { success: true, data: tables };
}

// ── 4. getRollTable (Phase 2.2.2 — extended result shape) ────────────────────

export async function getRollTable(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: getRollTable requires GM' };

  const input: GetRollTableInputType = GetRollTableInput.strict().parse(data ?? {});

  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  const payload = {
    id: table.id,
    name: table.name,
    formula: table.formula,
    description: table.description || '',
    replacement: table.replacement,
    displayRoll: table.displayRoll,
    // Phase 2.2.2: extended result shape includes type, documentUuid, drawn, img, description.
    results: (table.results as any).map(serialiseResult),
  };

  return { success: true, data: payload };
}

// ── 5. rollOnTable ────────────────────────────────────────────────────────────
// Intentional notify silence: table.draw() posts a ChatMessage with the drawn
// result, which is the user-facing signal. A notify toast would duplicate.

export async function rollOnTable(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: rollOnTable requires GM' };

  const input: RollOnTableInputType = RollOnTableInput.strict().parse(data ?? {});

  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  const rollMode = input.rollMode || 'public';
  const draw = await table.draw({ rollMode: rollMode as any });
  if (!draw || !draw.results || draw.results.length === 0) {
    throw new Error('ROLLTABLE_POOL_EXHAUSTED: No result drawn from table — pool may be exhausted');
  }

  const drawResult = draw.results[0];
  const serialisedResult = serialiseResult(drawResult);
  return {
    success: true,
    data: {
      tableName: table.name,
      formula: table.formula,
      roll: draw.roll?.total || 0,
      text: serialisedResult.text,
      drawn: serialisedResult.drawn,
    },
  };
}

// ── 6. deleteRollTable ────────────────────────────────────────────────────────

export async function deleteRollTable(data: unknown): Promise<Envelope<{ tableId: string }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteRollTable requires GM' };

  const input: DeleteRollTableInputType = DeleteRollTableInput.strict().parse(data ?? {});

  return wrappedWrite('deleteRollTable', async () => {
    const table = (game as any).tables?.get(input.tableId);
    if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);
    const tableName = table.name as string;

    // Phase 10 cross-doc-fk cascade: catalog has no inbound FKs to RollTable
    // currently — `cascade:true` returns affectedDocs: [] (API-uniform no-op
    // per Phase 4.3 design decision). RollTable.folder is OUTBOUND not inbound;
    // TableResult.documentUuid lives on individual results, not the table itself.
    let affectedDocs: import('@foundry-mcp/shared').FkAffectedDocEntry[] | undefined;
    if ((input as any).cascade === true) {
      const { walkInboundFor, clearOrphanRef } = await import('./cross-doc-fk.js');
      const inbound = await walkInboundFor('RollTable', input.tableId);
      affectedDocs = [];
      for (const ref of inbound) {
        await clearOrphanRef({
          sourceDocType: ref.sourceDocType,
          sourceDocId: ref.sourceDocId,
          sourceField: ref.sourceField,
          refDocType: ref.refDocType,
          refId: ref.refId,
        });
        affectedDocs.push({
          type: ref.sourceDocType,
          id: ref.sourceDocId,
          name: ref.sourceDocName,
          fkField: ref.sourceField,
        });
      }
    }

    await table.delete();

    notify.deleted('rolltable', tableName);

    return {
      success: true as const,
      data: {
        tableId: input.tableId,
        ...(affectedDocs !== undefined ? { affectedDocs } : {}),
      } as { tableId: string; affectedDocs?: import('@foundry-mcp/shared').FkAffectedDocEntry[] },
    };
  });
}

// ── 7. updateRollTable (NEW) ──────────────────────────────────────────────────

export async function updateRollTable(data: unknown): Promise<Envelope<{ tableId: string; changes: Record<string, unknown> }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateRollTable requires GM' };

  const input: UpdateRollTableInputType = UpdateRollTableInput.strict().parse(data ?? {});

  // Pre-validate: table must exist.
  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  if (Object.keys(input.changes).length === 0) {
    throw new Error('ROLLTABLE_EMPTY_PAYLOAD: changes object must contain at least one field');
  }

  return wrappedWrite('updateRollTable', async () => {
    await table.update(input.changes);

    // BUG-070 post-verify: re-read each requested field and compare.
    // Deep-equality via JSON.stringify so array/object fields (e.g. `results`)
    // don't false-positive on reference identity (BUG-101 parallel pattern).
    for (const [field, requestedValue] of Object.entries(input.changes)) {
      const persistedValue = (table as any)[field];
      if (JSON.stringify(persistedValue) !== JSON.stringify(requestedValue)) {
        throw new Error(
          `ROLLTABLE_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
          `but post-update value is ${JSON.stringify(persistedValue)}. Foundry may have dropped ` +
          `the write silently — check F12 console for DataModelValidationError.`,
        );
      }
    }

    notify.updated('rolltable', table.name as string, {
      summary: Object.keys(input.changes).join(', '),
    });

    return { success: true as const, data: { tableId: input.tableId, changes: input.changes } };
  });
}

// ── 8. updateTableResults (NEW) ──────────────────────────────────────────────

export async function updateTableResults(
  data: unknown,
): Promise<Envelope<{ tableId: string; updatedCount: number }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateTableResults requires GM' };

  const input: UpdateTableResultsInputType = UpdateTableResultsInput.strict().parse(data ?? {});

  // Pre-validate: table + each result must exist.
  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  for (const update of input.updates) {
    const result = table.results.get(update._id);
    if (!result) {
      throw new Error(
        `ROLLTABLE_RESULT_NOT_FOUND: no result with id "${update._id}" on table "${input.tableId}"`,
      );
    }
  }

  return wrappedWrite('updateTableResults', async () => {
    await table.updateEmbeddedDocuments('TableResult', input.updates);

    // BUG-070 post-verify: re-read each result and compare changed fields.
    for (const update of input.updates) {
      const result = table.results.get(update._id);
      if (!result) {
        throw new Error(
          `ROLLTABLE_WRITE_NOT_PERSISTED: result "${update._id}" disappeared after updateEmbeddedDocuments`,
        );
      }
      const { _id, ...fields } = update;
      void _id; // used only for lookup
      for (const [field, requestedValue] of Object.entries(fields)) {
        const persistedValue = (result as any)[field];
        if (JSON.stringify(persistedValue) !== JSON.stringify(requestedValue)) {
          throw new Error(
            `ROLLTABLE_WRITE_NOT_PERSISTED: result "${update._id}" field "${field}" expected ` +
            `${JSON.stringify(requestedValue)} but post-update value is ${JSON.stringify(persistedValue)}.`,
          );
        }
      }
    }

    if (input.updates.length > 0) {
      notify.updated('rolltable', `${input.updates.length} result(s)`, {
        summary: `on ${table.name}`,
      });
    }

    return { success: true as const, data: { tableId: input.tableId, updatedCount: input.updates.length } };
  });
}

// ── 9. deleteTableResults (NEW) ──────────────────────────────────────────────

export async function deleteTableResults(
  data: unknown,
): Promise<Envelope<{ tableId: string; deletedCount: number }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteTableResults requires GM' };

  const input: DeleteTableResultsInputType = DeleteTableResultsInput.strict().parse(data ?? {});

  // Pre-validate: table + each resultId must exist.
  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  for (const resultId of input.resultIds) {
    if (!table.results.get(resultId)) {
      throw new Error(
        `ROLLTABLE_RESULT_NOT_FOUND: no result with id "${resultId}" on table "${input.tableId}"`,
      );
    }
  }

  const sizeBefore: number = table.results.size as number;

  return wrappedWrite('deleteTableResults', async () => {
    await table.deleteEmbeddedDocuments('TableResult', input.resultIds);

    // BUG-070 post-verify: assert each id is gone.
    for (const resultId of input.resultIds) {
      if (table.results.get(resultId) !== undefined) {
        throw new Error(
          `ROLLTABLE_WRITE_NOT_PERSISTED: result "${resultId}" still present after deleteEmbeddedDocuments`,
        );
      }
    }
    const sizeAfter: number = table.results.size as number;
    if (sizeAfter !== sizeBefore - input.resultIds.length) {
      throw new Error(
        `ROLLTABLE_WRITE_NOT_PERSISTED: expected ${sizeBefore - input.resultIds.length} results ` +
        `after deleteTableResults but found ${sizeAfter}.`,
      );
    }

    if (input.resultIds.length > 0) {
      notify.deleted('rolltable', `${input.resultIds.length} result(s)`, {
        summary: `from ${table.name}`,
      });
    }

    return { success: true as const, data: { tableId: input.tableId, deletedCount: input.resultIds.length } };
  });
}

// ── 10. normalizeRollTable (NEW) ──────────────────────────────────────────────
//
// WARNING (Risk 2.B): normalize() recalculates ALL result range values from
// weights, OVERWRITING any manually-set ranges. Do not call on tables with
// hand-crafted range assignments unless you want them recalculated.

export async function normalizeRollTable(
  data: unknown,
): Promise<Envelope<{ tableId: string; resultCount: number }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: normalizeRollTable requires GM' };

  const input: NormalizeRollTableInputType = NormalizeRollTableInput.strict().parse(data ?? {});

  // Pre-validate: table must exist and have at least one result.
  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);
  if ((table.results.size as number) < 1) {
    throw new Error(`ROLLTABLE_EMPTY_PAYLOAD: table "${input.tableId}" has no results to normalize`);
  }

  return wrappedWrite('normalizeRollTable', async () => {
    const normalized = await table.normalize();
    if (!normalized) {
      throw new Error(
        `ROLLTABLE_WRITE_NOT_PERSISTED: normalize() returned null/undefined for table "${input.tableId}"`,
      );
    }

    // BUG-070 post-verify: spot-check first result range is non-empty.
    const firstResult = table.results.contents[0];
    if (!firstResult || !Array.isArray(firstResult.range) || firstResult.range.length < 2) {
      throw new Error(
        `ROLLTABLE_WRITE_NOT_PERSISTED: normalize() did not populate result ranges — ` +
        `first result range is ${JSON.stringify(firstResult?.range)}`,
      );
    }

    notify.updated('rolltable', table.name as string, { summary: 'normalized' });

    return {
      success: true as const,
      data: { tableId: input.tableId, resultCount: table.results.size as number },
    };
  });
}

// ── 11. resetRollTableResults (NEW) ──────────────────────────────────────────
//
// Risk 2.C: calls resetResults() (clears drawn flags, persists to DB), NOT
// reset() (in-memory DataModel reset only, no DB write — wrong method).

export async function resetRollTableResults(
  data: unknown,
): Promise<Envelope<{ tableId: string; resultCount: number }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: resetRollTableResults requires GM' };

  const input: ResetRollTableInputType = ResetRollTableInput.strict().parse(data ?? {});

  // Pre-validate: table must exist.
  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  return wrappedWrite('resetRollTableResults', async () => {
    // CRITICAL: resetResults(), not reset() — see Risk 2.C in phase2_research.md §7.
    await table.resetResults();

    // BUG-070 post-verify: assert all drawn flags cleared.
    const allCleared: boolean = (table.results.contents as any[]).every(
      (r: any) => r.drawn === false,
    );
    if (!allCleared) {
      throw new Error(
        `ROLLTABLE_WRITE_NOT_PERSISTED: resetResults() did not clear all drawn flags on ` +
        `table "${input.tableId}". Check F12 console for errors.`,
      );
    }

    notify.updated('rolltable', table.name as string, { summary: 'reset draws' });

    return {
      success: true as const,
      data: { tableId: input.tableId, resultCount: table.results.size as number },
    };
  });
}

// ── 12. drawManyFromTable (NEW) ───────────────────────────────────────────────
// Intentional notify silence: table.drawMany() posts ChatMessages with the
// drawn results, which is the user-facing signal. A notify toast would duplicate.

export async function drawManyFromTable(
  data: unknown,
): Promise<Envelope<{
  results: any[];
  roll: number;
  tableName: string;
  exhausted?: boolean;
  requested?: number;
  returned?: number;
}>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: drawManyFromTable requires GM' };

  const input: DrawManyFromTableInputType = DrawManyFromTableInput.strict().parse(data ?? {});

  // Pre-validate: table must exist.
  const table = (game as any).tables?.get(input.tableId);
  if (!table) throw new Error(`ROLLTABLE_TABLE_NOT_FOUND: no table with id "${input.tableId}"`);

  const options: Record<string, unknown> = {};
  if (input.displayChat !== undefined) options.displayChat = input.displayChat;
  if (input.recursive !== undefined) options.recursive = input.recursive;
  if (input.rollMode !== undefined) options.rollMode = input.rollMode;

  const draw = await table.drawMany(input.number, options);

  const drawnResults: any[] = draw?.results ?? [];

  // Pool exhaustion handling for non-replacement tables.
  if (drawnResults.length === 0) {
    throw new Error(
      `ROLLTABLE_POOL_EXHAUSTED: drawMany(${input.number}) returned 0 results — ` +
      `non-replacement pool is exhausted. Call resetRollTableResults first.`,
    );
  }

  // Partial-return warning envelope for non-replacement exhaustion.
  if (!table.replacement && drawnResults.length < input.number) {
    return {
      success: true,
      data: {
        results: drawnResults.map(serialiseResult),
        roll: draw.roll?.total ?? 0,
        tableName: table.name as string,
        exhausted: true,
        requested: input.number,
        returned: drawnResults.length,
      },
    };
  }

  return {
    success: true,
    data: {
      results: drawnResults.map(serialiseResult),
      roll: draw.roll?.total ?? 0,
      tableName: table.name as string,
    },
  };
}

// ── 13. importRollTableFromCompendium (NEW) ───────────────────────────────────

export async function importRollTableFromCompendium(
  data: unknown,
): Promise<Envelope<{ newTableId: string; name: string; normalized: boolean }>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: importRollTableFromCompendium requires GM' };

  const input: ImportRollTableFromCompendiumInputType = ImportRollTableFromCompendiumInput.strict().parse(data ?? {});

  // Pre-validate: pack + source document must exist.
  const pack = (game as any).packs?.get(input.pack);
  if (!pack) {
    throw new Error(
      `ROLLTABLE_COMPENDIUM_PACK_NOT_FOUND: no compendium pack with id "${input.pack}". ` +
      `Check available packs via game.packs.keys().`,
    );
  }

  const sourceDoc = await pack.getDocument(input.documentId);
  if (!sourceDoc) {
    throw new Error(
      `ROLLTABLE_COMPENDIUM_DOC_NOT_FOUND: no document with id "${input.documentId}" in pack "${input.pack}"`,
    );
  }

  return wrappedWrite('importRollTableFromCompendium', async () => {
    // WorldCollection.importFromCompendium handles get + fromCompendium transform + create.
    const newDoc = await ((game as any).tables as any).importFromCompendium(
      pack,
      input.documentId,
      {},
      {},
    );

    if (!newDoc) {
      throw new Error(
        `ROLLTABLE_WRITE_NOT_PERSISTED: importFromCompendium returned null for "${input.documentId}" ` +
        `from pack "${input.pack}"`,
      );
    }

    if (input.normalize) {
      await newDoc.normalize();
    }

    // BUG-070 post-verify: assert world table exists.
    const worldTable = (game as any).tables?.get(newDoc.id);
    if (!worldTable) {
      throw new Error(
        `ROLLTABLE_WRITE_NOT_PERSISTED: world table "${newDoc.id}" not found after importFromCompendium`,
      );
    }

    // If normalize was requested, spot-check first result range populated.
    if (input.normalize && worldTable.results.size > 0) {
      const firstResult = worldTable.results.contents[0];
      if (!Array.isArray(firstResult?.range) || firstResult.range.length < 2) {
        throw new Error(
          `ROLLTABLE_WRITE_NOT_PERSISTED: normalize requested but first result range is ` +
          `${JSON.stringify(firstResult?.range)} — normalize may have silently failed`,
        );
      }
    }

    notify.created('rolltable', newDoc.name as string, {
      summary: `from compendium ${input.pack}`,
    });

    return {
      success: true as const,
      data: {
        newTableId: newDoc.id as string,
        name: newDoc.name as string,
        normalized: input.normalize,
      },
    };
  });
}
