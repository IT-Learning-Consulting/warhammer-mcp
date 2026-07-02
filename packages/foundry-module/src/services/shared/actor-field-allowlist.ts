// services/shared/actor-field-allowlist.ts — MCP Code-Quality Hardening v1, Phase 12 (R12.3).
//
// `update-actor` previously accepted an arbitrary `updateData: z.record(z.unknown())` patch that flowed
// straight to `actor.update()` with ZERO field validation — an unbounded `system.*` write vector. This module
// is the runtime allow-list that closes it: the per-`actor.type` UNION of every field path observed written
// across the WFRP skill corpus + the composing MCP tools (manage-character, build-npc/pc, template-apply, …).
//
// DESIGN (PRD R12.3 + user Q&A 2026-06-18 "observed-field union"):
//   - It is an ALLOW-list (reject-on-unknown), not a block-list — leaf paths are ENUMERATED, never `system.*`
//     prefix-allowed, so auto-derived sinks (`*.max`, `characteristics.*.value/.bonus`, `experience.total/
//     current`) stay rejected even though they look like "system" writes.
//   - By construction the union ACCEPTS every field a current skill writes → it cannot break a live workflow.
//     (Completeness is the load-bearing property; verified by Gate B regression + live smoke. Over-inclusion is
//     harmless — the allow-list only GATES; it never forces a write to persist.)
//   - Per-type: `character` is the progression/pool superset; `npc` drops character-only pools+progression but
//     ADDS npc-only details (status.value composite, size, god, subspecies); `creature` drops social standing.
//   - gmnotes path is type-split (BUG-321): character writes `system.gmnotes.value`; npc/creature write
//     `system.details.gmnotes.value`.
//   - `vehicle` (wfrp_layer_expansion Phase 7) has its OWN narrow set: wounds.value + the cargo/crew sheet
//     fields (status.carries.max, details.move.value, details.man). It does NOT include derived encumbrance
//     (*.current/.max are recomputed from contents) nor passengers/roles (array-update syntax DEPENDENCY_GATED
//     pending a post-restart live probe — see the Phase-7 plan task 7.3).
//   - Unknown/unexpected actor types (e.g. loot, base) fall back to the UNION of all three — still blocks truly
//     never-observed fields without breaking an unanticipated type.
//
// Sourced from a corpus-wide grep (skills + manage-character + build-* + template-apply); see the Phase-12
// pre-plan memo §R12.3 and the execution report. NOTE: no XML eval corpus exists in this repo, so the memo's
// "gmnotes eval canary in actors.xml" is moot — gmnotes is allow-listed because live skills write it.

import { ErrorTokens } from '@foundry-mcp/shared';

const TOP_LEVEL = ['name', 'img', 'folder', 'prototypeToken.name'] as const;

const CHARACTERISTIC_KEYS = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'] as const;
// `.initial` (creation / manage-character update-stats) + `.advances` (wfrp-advance, build-* species bumps).
// NEVER `.value` / `.bonus` — those are derived (FORBIDDEN; see module doc).
const CHARACTERISTIC_FIELDS = CHARACTERISTIC_KEYS.flatMap((k) => [
  `system.characteristics.${k}.initial`,
  `system.characteristics.${k}.advances`,
]);

// Physical details shared by character + npc (StandardDetailsModel). Creatures don't surface these on the
// sheet, so writes are schema-dropped there — excluded from CREATURE for per-type fidelity.
const SHARED_PHYSICAL_DETAILS = [
  'system.details.age.value',
  'system.details.height.value',
  'system.details.weight.value',
  'system.details.haircolour.value',
  'system.details.eyecolour.value',
  'system.details.gender.value',
  'system.details.distinguishingmark.value',
  'system.details.move.value',
  'system.details.species.value',
];

export const ACTOR_ALLOWED_FIELDS_CHARACTER = new Set<string>([
  ...TOP_LEVEL,
  ...CHARACTERISTIC_FIELDS,
  ...SHARED_PHYSICAL_DETAILS,
  // Status pools — `.value` only (NEVER `.max`).
  'system.status.wounds.value',
  'system.status.fate.value',          // character-only pool
  'system.status.fortune.value',       // character-only pool
  'system.status.resilience.value',    // character-only pool
  'system.status.resolve.value',       // character-only pool
  'system.status.advantage.value',
  'system.status.corruption.value',
  'system.status.sin.value',
  'system.status.criticalWounds.value',
  'system.status.encumbrance.value',   // observed in update-actor characterization (defensive incl.)
  // Experience (character-only schema).
  'system.details.experience.spent',
  'system.details.experience.log',
  'system.details.experience.total',   // manage-character add-xp-log updateTotal:true (NOT wfrp-advance)
  // Character-only narrative / progression details.
  'system.details.starsign.value',
  'system.details.motivation.value',
  'system.details.class.value',
  'system.details.career.value',
  'system.details.careerlevel.value',
  'system.details.personal-ambitions.short-term',
  'system.details.personal-ambitions.long-term',
  'system.details.party-ambitions.name',
  'system.details.party-ambitions.short-term',
  'system.details.party-ambitions.long-term',
  // Social standing (character: computeCareer re-derives → wfrp-status writes with verifyPersistence:false).
  'system.details.status.tier',
  'system.details.status.standing',
  // Status modifier — the persistent decay lever for Keeping Up Appearances (wfrp-status lifestyle-check,
  // wfrp_layer_expansion Phase 4). On characters, tier/standing revert via computeCareer; modifier persists
  // and the engine auto-cascades the derived tier-drop (reference_wfrp_status_modifier_cascade).
  'system.details.status.modifier',
  // gmnotes — character writes system.gmnotes.value (BUG-321), but get-character
  // READS character gmnotes from system.details.gmnotes.value (character.ts:410), so
  // allow BOTH (the plan's R12.3 union "eval canary", acceptance criterion 5).
  // Union-safe: widening the allow-list breaks no caller. (Phase-12 /agent-validate
  // Gate-B fix — the details path was the round-trip path get-character surfaces.)
  'system.gmnotes.value',
  'system.details.gmnotes.value',
  'system.details.biography.value',
]);

export const ACTOR_ALLOWED_FIELDS_NPC = new Set<string>([
  ...TOP_LEVEL,
  ...CHARACTERISTIC_FIELDS,
  ...SHARED_PHYSICAL_DETAILS,
  'system.details.starsign.value',     // build-npc schema split table lists starsign on NPC
  // Status pools NPC actually has (no fate/fortune/resilience/resolve).
  'system.status.wounds.value',
  'system.status.advantage.value',
  'system.status.corruption.value',
  'system.status.sin.value',
  'system.status.criticalWounds.value',
  'system.status.encumbrance.value',
  // Social standing — NPC writes persist (NPCModel has no computeCareer); build-npc writes the value composite.
  'system.details.status.tier',
  'system.details.status.standing',
  'system.details.status.value',
  // Status modifier — wfrp-status lifestyle-check decay lever (Phase 4); recommended for NPCs for parity with characters.
  'system.details.status.modifier',
  // NPC-only details (manage-character npc/creature branch).
  'system.details.species.subspecies',
  'system.details.biography.value',
  'system.details.gmnotes.value',      // npc path (vs system.gmnotes.value on character)
  'system.details.size.value',
  'system.details.god.value',
]);

export const ACTOR_ALLOWED_FIELDS_CREATURE = new Set<string>([
  ...TOP_LEVEL,
  ...CHARACTERISTIC_FIELDS,
  // Status pools creature has.
  'system.status.wounds.value',
  'system.status.advantage.value',
  'system.status.corruption.value',
  'system.status.sin.value',
  'system.status.criticalWounds.value',
  'system.status.encumbrance.value',
  // Creature uses numeric tier only — NO standing, NO value composite (BUG-022).
  'system.details.status.tier',
  // Creature details.
  'system.details.move.value',
  'system.details.species.value',
  'system.details.species.subspecies',
  'system.details.gender.value',
  'system.details.gmnotes.value',
  'system.details.size.value',
  'system.details.god.value',
  'system.details.biography.value',
]);

// Vehicle (VehicleModel) — wfrp_layer_expansion Phase 7. A NARROW set, NOT the union: only the
// crew/cargo sheet fields /wfrp-travel writes via update-actor.
//   - status.wounds.value      → vehicle hull damage (wound/heal sub-actions).
//   - status.carries.max       → cargo capacity override (carries.current is DERIVED — never written).
//   - details.move.value       → vehicle Movement (the engine recomputes encumbrance-gated speed).
//   - details.man              → crew/manning requirement.
// Deliberately EXCLUDED: encumbrance.{current,max} (derived from contents — cargo loading is an item-move,
// not an allow-listed write), and system.passengers / system.roles (the array-update dot-path form is
// DEPENDENCY_GATED pending a post-restart live probe — Phase-7 plan task 7.3; do NOT guess the syntax).
export const ACTOR_ALLOWED_FIELDS_VEHICLE = new Set<string>([
  ...TOP_LEVEL,
  'system.status.wounds.value',
  'system.status.carries.max',
  'system.details.move.value',
  'system.details.man',
]);

// Union fallback for unrecognized actor types — blocks never-observed fields without breaking an unanticipated
// type (e.g. loot, base).
const ACTOR_ALLOWED_FIELDS_ANY = new Set<string>([
  ...ACTOR_ALLOWED_FIELDS_CHARACTER,
  ...ACTOR_ALLOWED_FIELDS_NPC,
  ...ACTOR_ALLOWED_FIELDS_CREATURE,
]);

export function selectActorAllowlist(actorType: string | undefined): Set<string> {
  switch (actorType) {
    case 'character': return ACTOR_ALLOWED_FIELDS_CHARACTER;
    case 'npc':       return ACTOR_ALLOWED_FIELDS_NPC;
    case 'creature':  return ACTOR_ALLOWED_FIELDS_CREATURE;
    case 'vehicle':   return ACTOR_ALLOWED_FIELDS_VEHICLE;
    default:          return ACTOR_ALLOWED_FIELDS_ANY;
  }
}

// Flattens the patch to leaf dot-paths (handles both pre-dotted keys AND nested objects; arrays are leaf
// values, so `system.details.experience.log` stays one key) and throws FIELD_NOT_ALLOWED listing EVERY
// disallowed leaf at once (better than failing on the first). Called BEFORE actor.update() in updateActor.
export function assertAllowedActorFields(updateData: Record<string, unknown> | undefined, actorType: string | undefined): void {
  const allowed = selectActorAllowlist(actorType);
  const flat = (foundry.utils as any).flattenObject(updateData ?? {}) as Record<string, unknown>;
  const disallowed = Object.keys(flat).filter((key) => !allowed.has(key));
  if (disallowed.length > 0) {
    throw new Error(
      `${ErrorTokens.FIELD_NOT_ALLOWED}: update-actor rejected field(s) not in the allow-list for actor.type ` +
      `"${actorType ?? 'unknown'}": ${disallowed.join(', ')}. update-actor accepts only the union of fields ` +
      `observed across the WFRP skill+tool corpus; auto-derived sinks (e.g. *.max, characteristics.*.value/` +
      `.bonus, experience.total/current) are intentionally excluded.`,
    );
  }
}
