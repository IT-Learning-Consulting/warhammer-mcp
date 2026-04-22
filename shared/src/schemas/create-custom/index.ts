// create-custom-item discriminated-union assembly.
// 25 branches: 16 core PRIORITY + 2 OPTIONAL + 7 module-contributed.
// All core branches use a flat string as `itemType`; module branches use a
// dotted `<module-id>.<type>` key matching CONFIG.Item.dataModels registration.

import { z } from 'zod';

// Core subtypes (18)
import { WeaponSchema, buildWeaponSystem } from './core/weapon.js';
import { ArmourSchema, buildArmourSystem } from './core/armour.js';
import { TrappingSchema, buildTrappingSystem } from './core/trapping.js';
import { AmmunitionSchema, buildAmmunitionSystem } from './core/ammunition.js';
import { ContainerSchema, buildContainerSystem } from './core/container.js';
import { SpellSchema, buildSpellSystem } from './core/spell.js';
import { PrayerSchema, buildPrayerSystem } from './core/prayer.js';
import { TalentSchema, buildTalentSystem } from './core/talent.js';
import { CareerSchema, buildCareerSystem } from './core/career.js';
import { SkillSchema, buildSkillSystem } from './core/skill.js';
import { TraitSchema, buildTraitSystem } from './core/trait.js';
import { MutationSchema, buildMutationSystem } from './core/mutation.js';
import { CriticalSchema, buildCriticalSystem } from './core/critical.js';
import { DiseaseSchema, buildDiseaseSystem } from './core/disease.js';
import { TemplateSchema, buildTemplateSystem } from './core/template.js';
import { CargoSchema, buildCargoSystem } from './core/cargo.js';
import { InjurySchema, buildInjurySystem } from './core/injury.js';
import { PsychologySchema, buildPsychologySystem } from './core/psychology.js';

// Module-contributed subtypes (7)
import { GrimoireSchema, buildGrimoireSystem } from './module/grimoire.js';
import { ScrollSchema, buildScrollSystem } from './module/scroll.js';
import { RuneSchema, buildRuneSystem } from './module/rune.js';
import { ChantySchema, buildChantySystem } from './module/chanty.js';
import { TechniqueSchema, buildTechniqueSystem } from './module/technique.js';
import { CantSchema, buildCantSystem } from './module/cant.js';
import { Archives3ArmourSchema, buildArchives3ArmourSystem } from './module/archives3-armour.js';

export * from './destination.js';
export * from './effect.js';
export * from './common.js';

export const CreateCustomItemInputSchema = z.discriminatedUnion('itemType', [
  WeaponSchema,
  ArmourSchema,
  TrappingSchema,
  AmmunitionSchema,
  ContainerSchema,
  SpellSchema,
  PrayerSchema,
  TalentSchema,
  CareerSchema,
  SkillSchema,
  TraitSchema,
  MutationSchema,
  CriticalSchema,
  DiseaseSchema,
  TemplateSchema,
  CargoSchema,
  InjurySchema,
  PsychologySchema,
  GrimoireSchema,
  ScrollSchema,
  RuneSchema,
  ChantySchema,
  TechniqueSchema,
  CantSchema,
  Archives3ArmourSchema,
]);

export type CreateCustomItemInput = z.infer<typeof CreateCustomItemInputSchema>;

/**
 * Dispatch to the correct per-subtype system-payload builder.
 * Returns the `system` object to put into the Foundry Item document.
 */
export function buildSystemForSubtype(parsed: CreateCustomItemInput): Record<string, unknown> {
  switch (parsed.itemType) {
    case 'weapon':
      return buildWeaponSystem(parsed);
    case 'armour':
      return buildArmourSystem(parsed);
    case 'trapping':
      return buildTrappingSystem(parsed);
    case 'ammunition':
      return buildAmmunitionSystem(parsed);
    case 'container':
      return buildContainerSystem(parsed);
    case 'spell':
      return buildSpellSystem(parsed);
    case 'prayer':
      return buildPrayerSystem(parsed);
    case 'talent':
      return buildTalentSystem(parsed);
    case 'career':
      return buildCareerSystem(parsed);
    case 'skill':
      return buildSkillSystem(parsed);
    case 'trait':
      return buildTraitSystem(parsed);
    case 'mutation':
      return buildMutationSystem(parsed);
    case 'critical':
      return buildCriticalSystem(parsed);
    case 'disease':
      return buildDiseaseSystem(parsed);
    case 'template':
      return buildTemplateSystem(parsed);
    case 'cargo':
      return buildCargoSystem(parsed);
    case 'injury':
      return buildInjurySystem(parsed);
    case 'psychology':
      return buildPsychologySystem(parsed);
    case 'forien-armoury.grimoire':
      return buildGrimoireSystem(parsed);
    case 'forien-armoury.scroll':
      return buildScrollSystem(parsed);
    case 'wfrp4e-dwarfs.rune':
      return buildRuneSystem(parsed);
    case 'wfrp4e-soc.chanty':
      return buildChantySystem(parsed);
    case 'wfrp4e-helf.technique':
      return buildTechniqueSystem(parsed);
    case 'wfrp4e-archives3.cant':
      return buildCantSystem(parsed);
    case 'wfrp4e-archives3.armour':
      return buildArchives3ArmourSystem(parsed);
  }
}
