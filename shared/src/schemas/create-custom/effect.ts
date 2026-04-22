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
] as const;

export const ActiveEffectTrigger = z.enum(TRIGGER_KEYS);

const TransferData = z
  .object({
    type: z.enum(['ownership', 'damage', 'target', 'area', 'aura', 'other']).default('ownership'),
    documentType: z.enum(['Actor', 'Item']).default('Actor'),
    avoidable: z.boolean().optional(),
    prompt: z.boolean().optional(),
    filter: z.boolean().optional(),
    preApply: z.boolean().optional(),
    area: z
      .object({
        radius: z.number().optional(),
        template: z.string().optional(),
      })
      .optional(),
    aura: z
      .object({
        range: z.number().optional(),
        selfAffect: z.boolean().optional(),
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
  transfer: TransferData.optional(),
  disabled: z.boolean().optional(),
  transferDocument: z.boolean().optional(),
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
  equipTransfer: z.boolean().optional(),
  enableScript: z.string().optional(),
  preApplyScript: z.string().optional(),
  testIndependent: z.boolean().optional(),
});

export type ActiveEffectInput = z.infer<typeof ActiveEffectDataSchema>;

/**
 * Build the full Foundry ActiveEffect payload from the ergonomic flat input.
 * Inflates `trigger` + `script` into system.scriptData[0]; applies transferData.
 */
export function buildEffectPayload(input: ActiveEffectInput): Record<string, unknown> {
  const transferData = {
    type: input.transfer?.type ?? 'ownership',
    documentType: input.transfer?.documentType ?? 'Actor',
    avoidable: input.transfer?.avoidable ?? false,
    prompt: input.transfer?.prompt ?? false,
    filter: input.transfer?.filter ?? false,
    preApply: input.transfer?.preApply ?? false,
    area: input.transfer?.area ?? { radius: 0, template: '' },
    aura: input.transfer?.aura ?? { range: 0, selfAffect: false },
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
    transfer: false,
    disabled: input.disabled ?? false,
    statuses: input.statuses ?? [],
    changes: input.changes ?? [],
    duration: input.duration ?? {},
    flags: input.flags ?? {},
    system: {
      transferData,
      scriptData,
      avoidTest: {},
      filter: '',
      prompt: { enabled: false, label: '', multiple: false },
      equipTransfer: input.equipTransfer ?? false,
      enableScript: input.enableScript ?? '',
      preApplyScript: input.preApplyScript ?? '',
      testIndependent: input.testIndependent ?? false,
      zone: null,
    },
  };
  return effect;
}
