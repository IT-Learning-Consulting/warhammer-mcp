// Barrel re-export for CCR-4 per-domain schema split.
// Branded Foundry document-ID types (Phase 1 — R1.1) — exported first so every
// schema module and tool can import them through the barrel.
export * from './branded-ids.js';
// Phase 13 — R13.3: canonical polymorphic (un-branded) doc-id primitive (FOUNDRY_ID).
export * from './primitives.js';
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
// Phase 4 mcp_coverage_expansion — AE-only discriminated-union target (adds actor-direct scope).
export * from './active-effect-target.js';
export * from './add-active-effect.js';
export * from './update-active-effect.js';
export * from './delete-active-effect.js';
export * from './get-active-effect-by-name.js';
export * from './ownership.js';
export * from './targets.js';
export * from './outputs.js';
// Phase 11 mcp_code_quality_hardening — mutation-tool output DTOs + 18 outputSchema consts (R11.1).
export * from './mutation-outputs.js';
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
// Phase 1 mcp_coverage_expansion — item-directory umbrella (5 actions: list/get/search/duplicate/import-from-compendium).
export * from './item-directory.js';
// Phase 1 mcp_coverage_expansion — actor-config umbrella (4 actions: get/update-prototype-token + get/set-art).
export * from './actor-config.js';
// Phase 2 mcp_coverage_expansion — dice-roll tool (roll/validate/simulate over Foundry Roll).
export * from './dice-roll.js';
// Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
export * from './combatant.js';
// Phase 5 mcp_coverage_expansion — drawing umbrella (CRUD + list + duplicate over scene.drawings).
export * from './drawing.js';
// Phase 7 mcp_coverage_expansion — cards umbrella (stack + embedded-card CRUD + gameplay verbs over game.cards).
export * from './cards.js';
// Phase 8 mcp_coverage_expansion — document-io umbrella (export/import-as-new/preview over 8 world doc types).
export * from './document-io.js';
// Phase 10 mcp_coverage_expansion — keybinding tool (list/get/set/reset-action/reset-all/find-conflicts over game.keybindings).
export * from './keybinding.js';
// Phase 1 module_integration_v1 — module-probe umbrella (is-active / list-active).
// Generic types only; module-specific schemas live in package-local tools/modules/<id>/schemas.ts.
export * from './module-probe.js';
// Phase 5 wfrp_battle_simulator — apply-token-casualties (batch per-token ActorDelta casualty writer).
export * from './apply-token-casualties.js';
