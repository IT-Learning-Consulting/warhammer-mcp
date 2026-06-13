// Module Integration v1 Phase 10 — module-armoury mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

export interface ArmouryMeResult {
  actorId: string;
  actorName: string | null;
  value: number;
  regen: number | null;
  maximum: number | null;
  lastRegen: number | null;
  virtual: boolean | null; // true = actor has no ME history (non-caster)
}

export interface ArmourySpendMeResult {
  actorId: string;
  actorName: string | null;
  previousValue: number;
  amount: number;
  value: number;
  willTriggerEnduranceTest: boolean; // true when the drain pushed ME below 0 (auto-roll fires)
}

export interface ArmouryScrollResult {
  itemId: string;
  name: string;
  scope: 'world' | 'actor';
  actorId: string | null;
  spellUuid: string | null;
  language: string;
  quantity: number;
  canUse: boolean | null;
}

export interface ArmouryGrimoireSpellsResult {
  itemId: string;
  name: string;
  actorId: string | null;
  equipped: boolean;
  language: string;
  spells: Array<{ name: string | null; uuid: string }>;
  grantedSpells: Array<{ id: string; name: string }>; // actor spells tagged sourceGrimoire
}

export interface ArmouryEquipGrimoireResult {
  itemId: string;
  name: string;
  actorId: string;
  equipped: boolean;
  grantedSpells: Array<{ id: string; name: string }>;
  removedSpellCount: number;
}

export interface ArmouryDamageEntry {
  itemId: string;
  name: string;
  type: string; // weapon | armour | trapping
  damage: number; // total damage points (weapon/trapping) or summed AP damage (armour)
  locations?: Partial<Record<'head' | 'body' | 'lArm' | 'rArm' | 'lLeg' | 'rLeg', number>>;
  repairCost: number; // pennies (10% of price per damage point)
}

export interface ArmouryCheckDamageResult {
  actorId: string;
  actorName: string | null;
  damaged: ArmouryDamageEntry[];
  totalRepairCost: number;
}

export interface ArmouryRepairResult {
  itemId: string;
  name: string;
  field: string; // the path written
  previousValue: number;
  newValue: number;
}

export interface ArmouryAmmoQueueResult {
  combatId: string | null;
  queue: Record<string, Array<{ _id: string; user: string; quantity: number }>>; // keyed by actorId
  entryCount: number;
}

export interface ArmouryCombatFatigueResult {
  combatId: string | null;
  combatants: Array<{
    combatantId: string;
    name: string | null;
    roundsBeforeTest: number | null;
    roundsBeforePassOut: number | null;
  }>;
}

export interface ArmouryContentResult {
  pack: string;
  species: string[];
  careers: string[];
  talents: string[];
}

export interface ArmouryIntegrationResult {
  integration: string;
  triggered: boolean;
  note: string;
}

export interface ArmouryCantripResult {
  tokenId: string;
  actorName: string | null;
  lore: string;
  requiredSL: number;
  success: boolean;
  note: string;
}
