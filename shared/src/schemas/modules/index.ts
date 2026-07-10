// mcp_code_quality_v2 Phase C2 task 3.1 (user decision 2026-07-04) — module-schema sub-barrel.
// Every module's Zod schema (previously foundry-module package-local per CCR-5) now lives here
// as the single source of truth; foundry-module keeps re-export shims at the old paths and
// mcp-server tools z.infer the same schemas. Two symbol pairs were renamed to avoid flat-barrel
// collisions (BUNDLE_MEMBERS/BundleMemberId in access-control vs scene-atmosphere — see those
// files); everything else is exported verbatim.
export * from './_chatcommands/schemas.js';
export * from './access-control/locknkey-schemas.js';
export * from './access-control/lockview-schemas.js';
export * from './access-control/schemas.js';
export * from './augur-nexus/schemas.js';
export * from './autoanimations/schemas.js';
export * from './backpack/schemas.js';
export * from './community-lighting/schemas.js';
export * from './conversation-hud/schemas.js';
export * from './custom-css/schemas.js';
export * from './forien-armoury/schemas.js';
export * from './fvtt-party-resources/schemas.js';
export * from './gatherer/schemas.js';
export * from './imperial-arcana/schemas.js';
export * from './item-piles/schemas.js';
export * from './levels/schemas.js';
export * from './macro-trigger/schemas.js';
export * from './mastercrafted/schemas.js';
export * from './monks-active-tiles/action-catalog.js';
export * from './monks-active-tiles/schemas.js';
export * from './mortal-needs/schemas.js';
export * from './narrator/schemas.js';
export * from './patrol/schemas.js';
export * from './perceptive/schemas.js';
export * from './polyglot/schemas.js';
export * from './portal/schemas.js';
export * from './puzzle-locks/schemas.js';
export * from './robak/schemas.js';
export * from './scene-atmosphere/dynamic-soundscapes-schemas.js';
export * from './scene-atmosphere/fxmaster-schemas.js';
export * from './scene-atmosphere/multiface-tiles-schemas.js';
export * from './scene-atmosphere/scene-transitions-schemas.js';
export * from './scene-atmosphere/scenery-schemas.js';
export * from './scene-atmosphere/schemas.js';
export * from './scene-atmosphere/tokenmagic-schemas.js';
export * from './sequencer/schemas.js';
export * from './simple-quest/schemas.js';
export * from './simple-timekeeping/schemas.js';
export * from './syrinscape/schemas.js';
export * from './tagger/schemas.js';
export * from './token-attacher/schemas.js';
export * from './token-presentation/schemas.js';
export * from './tokenbar/schemas.js';
export * from './trading-places/schemas.js';
export * from './wfrp-economy/schemas.js';
export * from './wfrp4e-gm-toolkit/schemas.js';
