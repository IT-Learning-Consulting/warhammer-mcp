// Core subtype: weapon (WeaponModel). Includes damageToItem, qualities/flaws arrays.

import { z } from 'zod';
import { CreateCustomItemCommon, priceFields } from '../common.js';

const QualityOrFlaw = z.object({
  name: z.string(),
  value: z.number().optional(),
});

const Price = priceFields();

export const WeaponSchema = CreateCustomItemCommon.extend({
  itemType: z.literal('weapon'),
  quantity: z.number().optional(),
  encumbrance: z.number().optional(),
  price: Price.optional(),
  availability: z.string().optional(),
  location: z.number().optional(),
  damage: z.string().optional(),
  damageDice: z.string().optional(),
  reach: z.string().optional(),
  range: z.string().optional(),
  skill: z.string().optional(),
  modeOverride: z.string().optional(),
  twohanded: z.boolean().optional(),
  ammunitionGroup: z.string().optional(),
  consumesAmmo: z.boolean().optional(),
  weaponGroup: z.string().optional(),
  qualities: z.array(QualityOrFlaw).optional(),
  flaws: z.array(QualityOrFlaw).optional(),
  special: z.string().optional(),
  equipped: z.boolean().optional(),
  offhand: z.boolean().optional(),
});

export type WeaponInput = z.infer<typeof WeaponSchema>;

export function buildWeaponSystem(p: WeaponInput): Record<string, unknown> {
  const price = p.price ?? {};
  return {
    description: { value: p.description ?? '' },
    gmdescription: { value: p.gmdescription ?? '' },
    quantity: { value: p.quantity ?? 1 },
    encumbrance: { value: p.encumbrance ?? 0 },
    price: { gc: price.gc ?? 0, ss: price.ss ?? 0, bp: price.bp ?? 0 },
    availability: { value: p.availability ?? '' },
    location: { value: p.location ?? 0 },
    damageToItem: { value: 0, shield: 0 },
    damage: { value: p.damage ?? '', dice: p.damageDice ?? '' },
    reach: { value: p.reach ?? '' },
    range: { value: p.range ?? '' },
    skill: { value: p.skill ?? '' },
    modeOverride: { value: p.modeOverride ?? '' },
    twohanded: { value: p.twohanded ?? false },
    ammunitionGroup: { value: p.ammunitionGroup ?? '' },
    currentAmmo: { value: '' },
    consumesAmmo: { value: p.consumesAmmo ?? true },
    weaponGroup: { value: p.weaponGroup ?? 'basic' },
    qualities: { value: p.qualities ?? [] },
    flaws: { value: p.flaws ?? [] },
    special: { value: p.special ?? '' },
    equipped: p.equipped ?? false,
    loaded: { value: false, repeater: false, amt: 0 },
    offhand: { value: p.offhand ?? false },
  };
}
