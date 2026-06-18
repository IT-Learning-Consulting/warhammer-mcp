import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const GetCharacterOutput = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  basicInfo: z.record(z.any()).optional(),
  stats: z.record(z.any()).optional(),
  conditions: z.object({
    injuries: z.array(z.any()).optional(),
    mutations: z.array(z.any()).optional(),
    diseases: z.array(z.any()).optional(),
    psychology: z.array(z.any()).optional(),
  }).passthrough().optional(),
  items: z.array(z.any()).optional(),
  effects: z.array(z.any()).optional(),
  hasImage: z.boolean().optional(),
}).passthrough();

export const SearchCompendiumOutput = z.object({
  query: z.string(),
  results: z.array(z.object({ id: z.string(), name: z.string() }).passthrough()),
  totalFound: z.number(),
  showing: z.number(),
  hasMore: z.boolean(),
}).passthrough();

export const GetCurrentSceneOutput = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  active: z.boolean().optional(),
}).passthrough();

export const GetWfrpConfigOutput = z.record(z.any());

export const GET_CHARACTER_OUTPUT_JSON_SCHEMA = zodToJsonSchema(GetCharacterOutput, { target: 'jsonSchema7' });
export const SEARCH_COMPENDIUM_OUTPUT_JSON_SCHEMA = zodToJsonSchema(SearchCompendiumOutput, { target: 'jsonSchema7' });
export const GET_CURRENT_SCENE_OUTPUT_JSON_SCHEMA = zodToJsonSchema(GetCurrentSceneOutput, { target: 'jsonSchema7' });
export const GET_WFRP_CONFIG_OUTPUT_JSON_SCHEMA = zodToJsonSchema(GetWfrpConfigOutput, { target: 'jsonSchema7' });

// ─────────────────────────────────────────────────────────────────────────────
// Phase 9 (R9.1 / R9.2): hot-path response DTOs + internal formatter view types.
//
// The DTOs below are Zod `.passthrough()` schemas (+ exported `z.infer` type
// aliases) describing the SUCCESS-path data shape of the still-untyped hot-path
// tools, derived field-for-field from the characterization snapshots. They are
// applied as TYPE ANNOTATIONS ONLY — there is deliberately NO `.parse()` on these
// tools' outputs and NO `outputSchema` wired into their `getToolDefinitions()`
// (that is Phase 11). Zero runtime change; Tier-A snapshots stay byte-identical.
// `.passthrough()` keeps them forward-compatible against future Foundry fields.
//
// The four schemas above (GetCharacterOutput / SearchCompendiumOutput /
// GetCurrentSceneOutput / GetWfrpConfigOutput) are NOT modified — they are
// `.parse()`-backed at runtime, so tightening them would change behavior.
// ─────────────────────────────────────────────────────────────────────────────

// --- character.ts ---
export const ListCharactersOutput = z.object({
  characters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    hasImage: z.boolean(),
  }).passthrough()),
  total: z.number(),
  filtered: z.string(),
}).passthrough();
export type ListCharactersOutputType = z.infer<typeof ListCharactersOutput>;

// --- compendium.ts ---
export const ListCompendiumPacksOutput = z.object({
  packs: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.string(),
    system: z.string().optional(),
    private: z.boolean().optional(),
  }).passthrough()),
  total: z.number(),
  availableTypes: z.array(z.string()),
}).passthrough();
export type ListCompendiumPacksOutputType = z.infer<typeof ListCompendiumPacksOutput>;

export const GetCompendiumItemOutput = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  pack: z.object({ id: z.string().optional(), label: z.string().optional() }).passthrough(),
  description: z.string(),
  hasImage: z.boolean(),
  imageUrl: z.string().nullish(),
  items: z.array(z.any()),
  properties: z.record(z.any()),
  mode: z.string(),
  // full-mode-only fields (absent in compact mode)
  stats: z.record(z.any()).optional(),
  system: z.record(z.any()).optional(),
  effects: z.array(z.any()).optional(),
  fullDescription: z.string().optional(),
  fullData: z.any().optional(),
}).passthrough();
export type GetCompendiumItemOutputType = z.infer<typeof GetCompendiumItemOutput>;

export const ListCreaturesByCriteriaOutput = z.object({
  // each entry differs by mode: compact = {id,name,type,pack:string}; full adds
  // creatureType/size/threatLevel/flags and pack:{id,label} — kept permissive.
  creatures: z.array(z.record(z.any())),
  totalCount: z.number(),
  criteria: z.record(z.any()),
  searchSummary: z.object({
    packsSearched: z.number().optional(),
    topPacks: z.array(z.string()).optional(),
    totalCreaturesFound: z.number().optional(),
    searchStrategy: z.string().optional(),
    note: z.string().optional(),
  }).passthrough(),
  optimizationNote: z.string(),
}).passthrough();
export type ListCreaturesByCriteriaOutputType = z.infer<typeof ListCreaturesByCriteriaOutput>;

// --- manage-combat.ts ---
const CombatantSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  initiative: z.number().nullable(),
  defeated: z.boolean(),
  hidden: z.boolean(),
}).passthrough();

export const GetCombatOutput = z.object({
  id: z.string(),
  round: z.number(),
  turn: z.number().nullable(),
  started: z.boolean(),
  active: z.boolean(),
  combatants: z.array(CombatantSummarySchema),
}).passthrough().nullable();
export type GetCombatOutputType = z.infer<typeof GetCombatOutput>;

export const ListCombatantsOutput = z.object({
  combatId: z.string().nullable(),
  combatants: z.array(CombatantSummarySchema.extend({
    actorId: z.string().optional(),
    tokenId: z.string().optional(),
  })),
}).passthrough();
export type ListCombatantsOutputType = z.infer<typeof ListCombatantsOutput>;

// Phase 11 fix (BUG-390): CombatService.advanceCombat returns
// { combatId, round, turn, combatantId } where turn AND combatantId are `null`
// when the combat is not started / has no current combatant. `.optional()` rejects
// an explicit null, so the nullable leaves are required for the real return.
export const AdvanceCombatOutput = z.object({
  round: z.number(),
  turn: z.number().nullable().optional(),
  combatantId: z.string().nullable().optional(),
  currentCombatantId: z.string().nullable().optional(),
  combatId: z.string().optional(),
  rolled: z.array(z.string()).optional(),
}).passthrough();
export type AdvanceCombatOutputType = z.infer<typeof AdvanceCombatOutput>;

// Phase 11 fix (BUG-390): CombatService.addCombatants returns { added } only
// (services/combat.ts:159) — combatId is not emitted; make it optional.
export const AddCombatantsOutput = z.object({
  added: z.array(z.string()),
  combatId: z.string().optional(),
}).passthrough();
export type AddCombatantsOutputType = z.infer<typeof AddCombatantsOutput>;

// Phase 11 fix (BUG-390): CombatService.removeCombatants returns { removed } only
// (services/combat.ts:184) — combatId is not emitted; make it optional.
export const RemoveCombatantsOutput = z.object({
  combatId: z.string().optional(),
  removed: z.array(z.string()),
}).passthrough();
export type RemoveCombatantsOutputType = z.infer<typeof RemoveCombatantsOutput>;

// Phase 11 fix (BUG-390): CombatService.endCombat returns { ended: <id> }
// (services/combat.ts:194), NOT { combatId, deleted }.
export const EndCombatOutput = z.object({
  ended: z.string(),
  combatId: z.string().optional(),
  deleted: z.boolean().optional(),
}).passthrough();
export type EndCombatOutputType = z.infer<typeof EndCombatOutput>;

// --- manage-conditions.ts ---
// Phase 11 fix (BUG-390): faithful to the real ConditionsService.applyCondition
// return (services/conditions.ts:55) — { actorId, conditionKey, stackCount }. The
// prior {applied, value} shape was invented from a snapshot mock and threw on every
// real call. `.passthrough()` tolerates future fields.
export const ApplyConditionOutput = z.object({
  actorId: z.string(),
  conditionKey: z.string(),
  stackCount: z.number(),
}).passthrough();
export type ApplyConditionOutputType = z.infer<typeof ApplyConditionOutput>;

// Phase 11 fix (BUG-390): faithful to ConditionsService.removeCondition
// (services/conditions.ts:83) — { actorId, conditionKey, remainingCount }.
export const RemoveConditionOutput = z.object({
  actorId: z.string(),
  conditionKey: z.string(),
  remainingCount: z.number(),
}).passthrough();
export type RemoveConditionOutputType = z.infer<typeof RemoveConditionOutput>;

// server shape: {id,name,statuses,disabled}[] — NOT the DA {conditionKey,effectId,value}
export const ListConditionsOutput = z.array(z.object({
  id: z.string(),
  name: z.string(),
  statuses: z.array(z.string()),
  disabled: z.boolean(),
}).passthrough());
export type ListConditionsOutputType = z.infer<typeof ListConditionsOutput>;

// --- list-active-effects.ts / get-active-effect-by-name.ts ---
const ActiveEffectProjectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  statuses: z.array(z.string()),
  disabled: z.boolean(),
  duration: z.record(z.any()),
  origin: z.string(),
  changes: z.array(z.any()),
  parentType: z.string().optional(),
  parentId: z.string().optional(),
  parentName: z.string().optional(),
}).passthrough();

export const ListActiveEffectsOutput = z.object({
  actorId: z.string(),
  actorName: z.string().nullable(),
  effects: z.array(ActiveEffectProjectionSchema),
}).passthrough();
export type ListActiveEffectsOutputType = z.infer<typeof ListActiveEffectsOutput>;

export const GetActiveEffectByNameOutput = z.object({
  success: z.boolean(),
  scope: z.string(),
  actorId: z.string().nullable(),
  itemId: z.string().nullable(),
  itemName: z.string().nullable(),
  effectId: z.string(),
  effectName: z.string(),
  parentType: z.string(),
  parentId: z.string(),
  parentName: z.string(),
  effect: z.object({
    id: z.string(),
    name: z.string(),
    img: z.string().nullish(),
    statuses: z.array(z.string()),
    disabled: z.boolean(),
    duration: z.record(z.any()),
    origin: z.string(),
    changes: z.array(z.any()),
  }).passthrough(),
}).passthrough();
export type GetActiveEffectByNameOutputType = z.infer<typeof GetActiveEffectByNameOutput>;

// --- list-actor-items.ts ---
export const ListActorItemsOutput = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    system: z.record(z.any()), // item-type-dependent — stays passthrough
  }).passthrough()),
  total: z.number(),
}).passthrough();
export type ListActorItemsOutputType = z.infer<typeof ListActorItemsOutput>;

// --- apply-template.ts (structuredContent shape, from da-template.snap) ---
// Phase 11 (R11.1): the real foundry return is always complete, but the mcp-server
// apply-template formatter is deliberately DEFENSIVE — it tolerates an absent
// actorName (→ actorId fallback) and a partial/empty itemsByType (→ 0 counts), and
// the characterization tests lock exactly those degenerate paths. Wiring `.parse()`
// (Phase 11) on a strict version threw on those tolerated shapes (PRD over-narrowing
// Risk). The fields stay DECLARED (faithful) but degenerate-tolerable ones are
// `.optional()` so `.parse()` never throws on an output the tool legitimately emits.
export const ApplyTemplateOutput = z.object({
  success: z.boolean().optional(),
  actorId: z.string(),
  actorName: z.string().optional(),
  templateId: z.string(),
  templateName: z.string().optional(),
  applied: z.object({
    name: z.string().optional(),
    characteristics: z.record(z.number()).optional(),
    itemIds: z.array(z.string()).optional(),
    itemsByType: z.object({
      skill: z.number().optional(),
      spell: z.number().optional(),
      talent: z.number().optional(),
      trait: z.number().optional(),
      trapping: z.number().optional(),
    }).passthrough(),
  }).passthrough(),
  sceneId: z.string().optional(),
  tokenId: z.string().optional(),
}).passthrough();
export type ApplyTemplateOutputType = z.infer<typeof ApplyTemplateOutput>;

// --- actor-creation.ts ---
// Phase 11 fix (BUG-390): the createActorFromCompendium query returns actor
// summaries as { id, name, originalName } — there is NO `type` field, so it must
// be optional (the prior required `type: z.string()` threw on every real create).
const CreatedActorSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
  originalName: z.string().optional(),
}).passthrough();

export const CreateActorFromCompendiumOutput = z.object({
  summary: z.string(),
  success: z.boolean(),
  details: z.object({
    actors: z.array(CreatedActorSummarySchema),
    sourceEntry: z.object({ packId: z.string(), itemId: z.string() }).passthrough(),
    tokensPlaced: z.number(),
    errors: z.array(z.any()).optional(),
  }).passthrough(),
  message: z.string(),
}).passthrough();
export type CreateActorFromCompendiumOutputType = z.infer<typeof CreateActorFromCompendiumOutput>;

export const GetCompendiumEntryFullOutput = z.object({
  name: z.string(),
  type: z.string(),
  pack: z.string().optional(),
  items: z.array(z.any()),
  effects: z.array(z.any()),
  summary: z.string(),
  mode: z.string().optional(),       // 'summary_only' only
  system: z.any().optional(),        // full-mode only
  fullData: z.any().optional(),      // full-mode only
}).passthrough();
export type GetCompendiumEntryFullOutputType = z.infer<typeof GetCompendiumEntryFullOutput>;

// ─────────────────────────────────────────────────────────────────────────────
// Internal formatter view + raw-input types (Phase 9, Task 1.2).
//
// These are annotation-only TypeScript types used to type the character.ts /
// compendium.ts / actor-creation.ts formatter chains. They are SEPARATE from the
// `.parse()`-backed Zod schemas above and are never `.parse()`d, so they carry no
// runtime cost. The deep Foundry trees they read (`system`, `flags`, `duration`)
// are genuinely Foundry-untyped, so they stay `any` HERE (in shared) — this keeps
// the formatters' deep reads permissive without leaking bare `: any` into the
// mcp-server tool files (the R9.2 reduction target). The incrementally-assembled
// projection views are deliberately loose (`Record<string, any>`): the formatters
// build them by dynamic property assignment, and the byte-identical Tier-A
// snapshots — not the type — are the proof the emitted values are unchanged.
// ─────────────────────────────────────────────────────────────────────────────

// Loose raw Foundry document shapes the formatters READ as input.
export interface FoundryRawEffect {
  id: string;
  name: string;
  disabled: boolean;
  icon?: string | null;
  statuses?: string[];
  origin?: string;
  changes?: unknown[];
  duration?: any;
  system?: any;
  flags?: any;
  parentType?: string;
  parentId?: string;
  parentName?: string;
  [key: string]: any;
}

export interface FoundryRawItem {
  id: string;
  name: string;
  type: string;
  img?: string | null;
  pack?: string;
  packLabel?: string;
  system?: any;
  fullData?: any;
  // nested `items`/`effects` arrays are reached via the index signature (`any`) so
  // that the formatters' loose truthy/length checks on possibly-absent nested
  // collections do not trip `exactOptionalPropertyTypes`.
  [key: string]: any;
}

export interface FoundryRawActor {
  id: string;
  name: string;
  type: string;
  img?: string | null;
  system?: any;
  items?: FoundryRawItem[];
  effects?: FoundryRawEffect[];
  packLabel?: string;
  [key: string]: any;
}

// Loose Foundry pack descriptor (list-compendium-packs input rows).
export interface FoundryRawPack {
  id: string;
  label: string;
  type: string;
  system?: string;
  private?: boolean;
  [key: string]: any;
}

// Incrementally-assembled projection views (loose — built by dynamic assignment;
// snapshots are the value-level proof). Used to annotate the formatter internals.
export type CharacterBasicInfoView = Record<string, any>;
export type CharacterStatsView = Record<string, any>;
export type CharacterConditionsView = Record<string, any>;
export type CharacterSectionsView = Record<string, any>;
export type CompendiumItemView = Record<string, any>;
export type CompendiumStatsView = Record<string, any>;
export type CompendiumPropertiesView = Record<string, any>;
export type CreatureListItemView = Record<string, any>;
export type CompactCreatureStatsView = Record<string, any>;
export type ActorCreationFormattedView = Record<string, any>;

// Precise leaf views (built by a single object-literal map/return).
export interface CharacterItemView {
  id: string;
  name: string;
  type: string;
  quantity: number;
  equipped: boolean;
  description: string;
  hasImage: boolean;
}

export interface CharacterEffectView {
  id: string;
  name: string;
  disabled?: boolean;
  duration: { type: any; remaining: any } | null;
  hasIcon: boolean;
  conditionValue?: any;
  displayName?: string;
}

export interface CharacterResponseView {
  id: string;
  name: string;
  type: string;
  basicInfo: CharacterBasicInfoView;
  stats: CharacterStatsView;
  conditions: CharacterConditionsView;
  items: CharacterItemView[];
  effects: CharacterEffectView[];
  hasImage: boolean;
}
