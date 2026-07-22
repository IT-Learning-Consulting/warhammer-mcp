// Shared Active Effect input schema + payload builder.
// Accepts a flat, ergonomic user shape {name, trigger, script, ...} and
// transforms to the Foundry/WFRP4e-refactor ActiveEffect document shape
// with nested system.scriptData + system.transferData.

import { z } from 'zod';

const TRIGGER_KEYS = [
  'manual',
  'immediate',
  'addItems',
  'deleteEffect',
  'createToken',
  'dialog',
  'prePrepareData',
  'prePrepareItems',
  'prepareData',
  'prepareOwned',
  'prepareItem',
  'prePrepareItem',
  'computeCharacteristics',
  'computeEncumbrance',
  'preWoundCalc',
  'woundCalc',
  'calculateSize',
  'preAPCalc',
  'APCalc',
  'preApplyDamage',
  'applyDamage',
  'preTakeDamage',
  'takeDamage',
  'computeTakeDamageModifiers',
  'computeApplyDamageModifiers',
  'preApplyCondition',
  'applyCondition',
  'preRollTest',
  'rollTest',
  'preRollWeaponTest',
  'rollWeaponTest',
  'preRollCastTest',
  'rollCastTest',
  'preChannellingTest',
  'rollChannellingTest',
  'preRollPrayerTest',
  'rollPrayerTest',
  'preRollTraitTest',
  'rollTraitTest',
  'preOpposedAttacker',
  'preOpposedDefender',
  'opposedAttacker',
  'opposedDefender',
  'calculateOpposedDamage',
  'equipToggle',
  'getInitiativeFormula',
  'preUpdateDocument',
  'update',
  'startTurn',
  'endTurn',
  'endRound',
  'endCombat',
  'updateCombat',
  // BUG-645: 6 keys confirmed against the live WFRP4E.scriptTriggers config
  // (wfrp4e.js:24856-24915, 59 total) — `targeted` and `castSpellPrayer` also confirmed
  // as real live runScripts() call-sites (wfrp4e.js:6590/33357 and :33354).
  'targeted',
  'rollIncomeTest',
  'castSpellPrayer',
  'targetPrefillDialog',
  'startCombat',
  'startRound',
] as const;

export const ActiveEffectTrigger = z.enum(TRIGGER_KEYS);

// BUG-644 (full rewrite, 2026-07-21): the owner-transfer type is `document`, NOT
// `ownership`. warhammer-lib dispatches on `transferData.type == "document"` (verified
// live 2026-07-18 against warhammer-lib.js and the core wfrp4e Armour trait, which
// stores "document"). `ownership` is not a value the lib ever tests for, so an effect
// carrying it is silently never routed to the owning actor — it creates cleanly, reports
// success, and does nothing. Kept below as a DEPRECATED alias (normalized to `document`
// in buildEffectPayload) so existing callers are repaired rather than hard-rejected.
// Live-verified matrix: type=document works with transfer true OR false; type=ownership
// fails with transfer true OR false. The `transfer` flag is not load-bearing.
//
// The full 7-value type enum is the LIVE canonical `WFRP4E.transferTypes` config
// (wfrp4e.js:23197-23205) — document/damage/target/area/aura/crew/other. `crew` is real
// (confirmed via two independent live call-sites, wfrp4e.js:12310 and :26916) — a prior
// note in this bug's ledger entry calling it "unverified... no crew" was wrong. `zone` is
// NOT a `type` value — it's a separate top-level `system.zone` object (see
// buildEffectPayload), which is why adding it here would have been a no-op even if
// modelled as a type.
//
// Field NESTING below is corrected against wfrp4e.js's own `_migrateEffectFlags`
// (wfrp4e.js:25894-25963) — the function the system itself uses to repair effects
// created against an older shape, i.e. the authoritative "this is the current valid
// shape" reference. Prior to this fix, `testIndependent`/`preApplyScript`/
// `equipTransfer`/`enableScript`/`avoidTest` were written at the WRONG top-level
// `system.*` paths instead of nested under `system.transferData`, and `enableScript`
// was a dead name — the live field is `enableConditionScript`. `filter`'s exact leaf
// type could not be confirmed from static analysis alone (a sibling `filterValues`
// config exists in warhammer-lib.js, suggesting `filter` may key into it rather than
// being a plain boolean) — modelled permissively (boolean|string) rather than guessed
// wrong; flag for live verification.
const TransferData = z
  .object({
    type: z
      .enum(['document', 'damage', 'target', 'area', 'aura', 'crew', 'other', 'ownership'])
      .default('document'),
    documentType: z.enum(['Actor', 'Item']).default('Actor'),
    avoidable: z.boolean().optional(),
    avoidTest: z.record(z.unknown()).optional(),
    testIndependent: z.boolean().optional(),
    preApplyScript: z.string().optional(),
    equipTransfer: z.boolean().optional(),
    enableConditionScript: z.string().optional(),
    filter: z.union([z.boolean(), z.string()]).optional(),
    prompt: z.boolean().optional(),
    selfOnly: z.boolean().optional(),
    area: z
      .object({
        radius: z.union([z.number(), z.string()]).optional(), // can be a formula string (e.g. overcast-derived)
        templateData: z.string().optional(),
        duration: z.string().optional(),
        keep: z.boolean().optional(),
        aura: z
          .object({
            render: z.boolean().optional(),
            transferred: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .partial();

export const ActiveEffectDataSchema = z.object({
  name: z.string().min(1),
  img: z.string().optional(),
  trigger: ActiveEffectTrigger,
  script: z.string().default(''),
  label: z.string().optional(),
  // BUG-334: Foundry core ActiveEffect.description (HTMLField) — the user-facing
  // text shown on sheet expansion / tooltips. Without it effects are opaque to players.
  description: z.string().optional(),
  transfer: TransferData.optional(),
  disabled: z.boolean().optional(),
  // BUG-644: `transferDocument` (boolean) removed — it corresponded to nothing in the live
  // system (confirmed: warhammer-lib only exposes `transferDocumentTypes: {Actor, Item}`,
  // which is `transfer.documentType` above, already modelled). It was accepted then
  // silently dropped; there was nothing left to wire it to.
  changes: z
    .array(
      z.object({
        key: z.string(),
        mode: z.number(),
        value: z.string(),
        priority: z.number().optional(),
      })
    )
    .optional(),
  statuses: z.array(z.string()).optional(),
  duration: z.record(z.unknown()).optional(),
  flags: z.record(z.unknown()).optional(),
  // Flat convenience shortcuts for the equivalent `transfer.*` fields — buildEffectPayload
  // merges these into transferData if the caller didn't use the nested `transfer` form.
  // BUG-644: `enableScript` renamed to `enableConditionScript` to match the live wfrp4e
  // field name (wfrp4e.js:25926) — the old name was a dead key nothing ever read.
  equipTransfer: z.boolean().optional(),
  enableConditionScript: z.string().optional(),
  preApplyScript: z.string().optional(),
  testIndependent: z.boolean().optional(),
});

export type ActiveEffectInput = z.infer<typeof ActiveEffectDataSchema>;

/**
 * Build the full Foundry ActiveEffect payload from the ergonomic flat input.
 * Inflates `trigger` + `script` into system.scriptData[0]; applies transferData.
 */
export function buildEffectPayload(input: ActiveEffectInput): Record<string, unknown> {
  // BUG-644: normalize the deprecated `ownership` alias to the live `document` type.
  const rawType = input.transfer?.type ?? 'document';
  // BUG-644 (full rewrite): every field below is nested under system.transferData to
  // match wfrp4e.js's own `_migrateEffectFlags` output shape (wfrp4e.js:25919-25942) —
  // previously equipTransfer/enableScript(dead)/preApplyScript/testIndependent/avoidTest
  // were written at the wrong top-level system.* paths (see the removed lines below).
  // Flat top-level convenience fields (equipTransfer/enableConditionScript/preApplyScript/
  // testIndependent) win when the nested `transfer.*` form wasn't used for that key.
  const transferData = {
    type: rawType === 'ownership' ? 'document' : rawType,
    documentType: input.transfer?.documentType ?? 'Actor',
    avoidable: input.transfer?.avoidable ?? false,
    avoidTest: input.transfer?.avoidTest ?? {},
    testIndependent: input.transfer?.testIndependent ?? input.testIndependent ?? false,
    preApplyScript: input.transfer?.preApplyScript ?? input.preApplyScript ?? '',
    equipTransfer: input.transfer?.equipTransfer ?? input.equipTransfer ?? false,
    enableConditionScript: input.transfer?.enableConditionScript ?? input.enableConditionScript ?? '',
    filter: input.transfer?.filter ?? false,
    prompt: input.transfer?.prompt ?? false,
    selfOnly: input.transfer?.selfOnly ?? false,
    area: {
      radius: input.transfer?.area?.radius ?? 0,
      templateData: input.transfer?.area?.templateData ?? '',
      duration: input.transfer?.area?.duration ?? '',
      keep: input.transfer?.area?.keep ?? false,
      aura: {
        render: input.transfer?.area?.aura?.render ?? false,
        transferred: input.transfer?.area?.aura?.transferred ?? false,
      },
    },
  };

  const scriptData = [
    {
      label: input.label ?? input.name,
      trigger: input.trigger,
      script: input.script,
      options: {
        hideScript: '',
        activateScript: '',
        submissionScript: '',
        immediate: { deleteEffect: false },
        defer: false,
        tag: null as string | null,
      },
    },
  ];

  const effect: Record<string, unknown> = {
    name: input.name,
    img: input.img ?? 'icons/svg/aura.svg',
    description: input.description ?? '',
    transfer: false,
    disabled: input.disabled ?? false,
    statuses: input.statuses ?? [],
    changes: input.changes ?? [],
    duration: input.duration ?? {},
    flags: input.flags ?? {},
    system: {
      transferData,
      scriptData,
      // BUG-644: zone is an object (`{}`), not `null` — matches wfrp4e.js:25944's own
      // migration output. sourceData (item/test/area provenance) was entirely unmodelled
      // before; a newly-created effect has no source yet, so all three start null, matching
      // wfrp4e.js:25945-25949's own defaults for a fresh (non-migrated) effect.
      zone: {},
      sourceData: { item: null, test: null, area: null },
    },
  };
  return effect;
}
