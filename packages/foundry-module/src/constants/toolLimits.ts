// Tool pagination / slice / ring-buffer caps (PRD MCP Code-Quality Hardening — Phase 13, R13.2).
//
// Centralizes the raw page-size and slice magic numbers scattered across the
// list/search handlers. Values are the existing live defaults — this is a
// rename-to-named-constant, NOT a behavior change (characterization snapshots
// must stay zero-diff).
//
// Per-handler list defaults historically vary (20 / 50 / 100); the three are
// named distinctly so each handler keeps its own default. ESLint
// `no-magic-numbers` (warn) flags any residual inline numeric caps for organic
// cleanup; not every site is rewired this phase (R13.2 acceptance = file exists +
// the high-value search-path sites resolve).

/** Small list default — cards / playlist / template list handlers. */
export const SMALL_PAGE_SIZE = 20;

/** Default list page size — note / region / tile / token list handlers. */
export const DEFAULT_PAGE_SIZE = 50;

/** Max list page size — item-directory / compendium caps. */
export const MAX_PAGE_SIZE = 100;

/** Hard cap on compendium-search result rows returned to the caller. */
export const SEARCH_RESULT_LIMIT = 50;

/** Number of top packs surfaced by compendium-search's pack summary. */
export const TOP_PACKS_LIMIT = 5;

/** Audit-log ring buffer size on the `auditLogs` world flag. */
export const AUDIT_LOG_RING_BUFFER = 100;
