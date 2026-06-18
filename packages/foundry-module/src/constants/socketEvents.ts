// Live Foundry socket channel names (PRD MCP Code-Quality Hardening — Phase 13, R13.2).
//
// These are the TWO socket channels actually emitted/listened on by the
// foundry-module at runtime:
//   - MODULE_WARHAMMER_MCP — the module's own bridge channel (main.ts, roll-button.ts).
//   - MODULE_CUSTOM_CSS    — payload-free broadcast that triggers the custom-css module
//                            to re-apply world CSS across clients (css.ts).
//
// NOTE: the legacy `SOCKET_EVENTS` map in `../constants.ts` (MCP_QUERY/MCP_RESPONSE/…)
// is a dead stub (no live references) and is intentionally left untouched here —
// retiring it is out of R13.2 acceptance scope.

export const MODULE_WARHAMMER_MCP = 'module.warhammer-mcp';
export const MODULE_CUSTOM_CSS = 'module.custom-css';
