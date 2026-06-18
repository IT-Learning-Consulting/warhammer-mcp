// Third-party Foundry module IDs integrated by the warhammer-mcp module-* handlers
// (PRD MCP Code-Quality Hardening — Phase 13, R13.2).
//
// Centralizes the 13 per-handler `const MODULE_ID = '…'` declarations that were
// scattered across handlers/modules/**. Each handler imports its id from here
// (aliased to the local `MODULE_ID` so handler bodies are untouched).
//
// NOT the warhammer-mcp module's OWN id — that is `MODULE_ID` in `../constants.ts`
// ('warhammer-mcp'). These are the IDs of the THIRD-PARTY modules we integrate with.
//
// `requireModuleActive(...)` / `game.modules.get(...)` inline literals are NOT
// migrated here (out of R13.2 acceptance scope); ESLint `no-restricted-syntax`
// flags them for organic cleanup.

export const CUSTOM_CSS = 'custom-css';
export const FORIEN_ARMOURY = 'forien-armoury';
export const PARTY_RESOURCES = 'fvtt-party-resources';
export const GATHERER = 'gatherer';
export const MASTERCRAFTED = 'mastercrafted';
export const MONKS_ACTIVE_TILES = 'monks-active-tiles';
export const PATROL = 'patrol';
export const ROBAK_MACROS_AND_MORE = 'wfrp4e-macros-and-more';
export const DYNAMIC_SOUNDSCAPES = 'dynamic-soundscapes';
export const SIMPLE_TIMEKEEPING = 'simple-timekeeping';
export const MONKS_TOKENBAR = 'monks-tokenbar';
export const WFRP_GM_TOOLKIT = 'wfrp4e-gm-toolkit';
export const CHAT_COMMANDS = '_chatcommands';
