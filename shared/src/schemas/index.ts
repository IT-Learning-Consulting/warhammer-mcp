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
// Phase 1 mcp_diagnostic_tool — diagnostic umbrella (recent-errors / world-issues / support-snapshot).
export * from './diagnostic.js';
// Phase 6.1 mcp_crud_expansion — filepicker umbrella (upload / list / convert).
export * from './filepicker.js';
// Phase 4 mcp_notify_coverage — notify umbrella (GM-visible workflow events).
export * from './notify.js';
// Phase 7 mcp_crud_expansion — playlist umbrella (Playlist + PlaylistSound; 10 actions).
export * from './playlist.js';
// Phase 8 mcp_crud_expansion — macro umbrella (6 actions; execute carries confirmedExecution gate).
export * from './macro.js';
// Phase 11 mcp_crud_expansion — user umbrella (9 actions; hotbar + flags + role).
export * from './user.js';
// Phase 10 mcp_crud_expansion — cross-doc FK audit + repair umbrella (3 actions).
export * from './cross-doc-fk.js';
// Phase wfrp-disease — bidirectional event-push transport (EventEnvelope + RollResultPayload).
export * from './event-envelope.js';
// Phase wfrp-disease — Disease umbrella (8 actions).
export * from './disease.js';
// Phase 4 mcp_completion_v1 — Folder umbrella (6 actions; delete has confirm gate + deleteContents cascade).
export * from './folder.js';
// Phase 4 mcp_completion_v1 — Setting umbrella (4 actions; set has force gate + blocklist + onChange-advisory).
export * from './setting.js';
// Phase 5 mcp_completion_v1 — ChatMessage umbrella (5 actions; delete confirm gate; rollMode resolution; rolls-immutability).
export * from './chat-message.js';
