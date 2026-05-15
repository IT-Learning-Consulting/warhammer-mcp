// Barrel re-export for CCR-4 per-domain schema split.
export * from './actor.js';
export * from './item.js';
export * from './compendium.js';
export * from './scene.js';
export * from './combat.js';
export * from './conditions.js';
export * from './meta.js';
export * from './journal.js';
export * from './create-custom/index.js';
export * from './trade-item.js';
export * from './modify-item-qualities.js';
export * from './item-target.js';
export * from './add-active-effect.js';
export * from './update-active-effect.js';
export * from './delete-active-effect.js';
export * from './get-active-effect-by-name.js';
export * from './ownership.js';
export * from './targets.js';
export * from './outputs.js';
// Phase 5 mcp_crud_expansion — shared embedded-doc sub-schemas + helpers.
export * from './light-data.js';
export * from './texture-data.js';
export * from './region-shape.js';
export * from './format-fk-link.js';
// Phase 5 mcp_crud_expansion — 7 per-doc-type umbrella schemas.
export * from './token.js';
export * from './light.js';
export * from './note.js';
export * from './sound.js';
export * from './region.js';
export * from './tile.js';
export * from './template.js';
