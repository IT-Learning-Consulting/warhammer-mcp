// services/index.ts — MCP Code-Quality Hardening v1, Phase 3.
//
// Barrel for the extracted data-access services. data-access.ts (the handler/composition layer, which
// lives OUTSIDE services/ so the no-cross-service-import boundary never binds it) imports through here,
// decoupling it from individual service file names for the Phase 4+ splits. Shared contracts/DTOs live
// in ../service-interfaces.js (outside services/).
//
// Populated by B.3 (creature-index) and C.4 (compendium-search).

export { PersistentCreatureIndex } from './creature-index.js';
export { CompendiumSearchService } from './compendium-search.js';
// Phase 4 (R4.1): player-rolls + roll-button state machine extracted three-way (D1).
export { RollRequestService } from './roll-request.js';
export { RollButtonService } from './roll-button.js';
export { PlayerLookupService } from './player-lookup.js';
