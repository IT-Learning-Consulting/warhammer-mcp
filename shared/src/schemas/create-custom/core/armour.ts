// Core subtype: armour (ArmourModel). AP per-location object; qualities/flaws.

import { z } from 'zod';
import { CreateCustomItemCommon } from '../common.js';

const QualityOrFlaw = z.object({
  name: z.string(),
  value: z.number().optional(),
});

const Price = z.object({
  gc: z.number().optional(),
  ss: z.number().optional(),
  bp: z.number().optional(),
});

const APBlock = z.object({
  head: z.number().optional(),
  body: z.number().optional(),
  lArm: z.number().optional(),
  rArm: z.number().optional(),
  lLeg: z.number().optional(),
  rLeg: z.number().optional(),
});

export const ArmourSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('armour'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  price: Price.optional(),
  availability: z.string().optional(),
  location: z.number().optional(),
  worn: z.boolean().optional(),
  armorType: z.string().optional(),
  penalty: z.string().optional(),
  qualities: z.array(QualityOrFlaw).optional(),
  flaws: z.array(QualityOrFlaw).optional(),
  special: z.string().optional(),
  AP: APBlock.optional(),
});

export type ArmourInput = z.infer<typeof ArmourSchema>;

export function buildArmourSystem(p: ArmourInput): Record<string, unknown> {
  const price = p.price ?? {};
  const ap = p.AP ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    quantity: { value: p.quantity ?? 1 },
    encumbrance: { value: p.encumbrance ?? 0 },
    price: { gc: price.gc ?? 0, ss: price.ss ?? 0, bp: price.bp ?? 0 },
    availability: { value: p.availability ?? '' },
    location: { value: p.location ?? 0 },
    damageToItem: { value: 0, shield: 0 },
    worn: { value: p.worn ?? false },
    armorType: { value: p.armorType ?? '' },
    penalty: { value: p.penalty ?? '' },
    qualities: { value: p.qualities ?? [] },
    flaws: { value: p.flaws ?? [] },
    special: { value: p.special ?? '' },
    AP: {
      head: ap.head ?? 0,
      body: ap.body ?? 0,
      lArm: ap.lArm ?? 0,
      rArm: ap.rArm ?? 0,
      lLeg: ap.lLeg ?? 0,
      rLeg: ap.rLeg ?? 0,
    },
    APdamage: { head: 0, body: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0 },
  };
}
