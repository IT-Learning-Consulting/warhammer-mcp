// Module Integration v1 Phase 10 — module-armoury handler (Forien's Armoury v4.0.4).
//
// Always-registered umbrella. requireModuleActive('forien-armoury') is the FIRST executable
// statement — RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase 1 carry-forward).
//
// 14 actions over the verified server-reachable surface (dossier forien-armoury.md §7 +
// capability-manifest.json):
//   reads:  get-me, read-scroll, read-grimoire-spells, check-damage, read-ammo-queue,
//           read-combat-fatigue, add-species-career-content
//   writes: spend-me, create-scroll, create-grimoire, equip-grimoire, repair-item,
//           configure-integration, cantrip   (GM-gated; notify.* on each)
//
// ADR-9.1 accessor (Phase 9 carry-forward): Forien exposes its API as a Class-1 `game.X`
// assignment — `game.modules.get('forien-armoury').api` (a ForienArmoury instance, assigned at the
// init hook; ESM module). getArmouryApi() resolves it and throws ARMOURY_API_UNAVAILABLE on absence;
// live smoke is mandatory (the vitest mock provides the API; prod may differ).
//
// Anchors: DP-15 (typed), DP-16 (post-write verify), CCR-3 (notify on writes), CCR-4 (confirm on
// equip/cantrip/configure-integration via z.literal(true)). Source: phase10_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleArmouryInput, type ModuleArmouryInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'forien-armoury';
const PACK_ID = 'forien-armoury.forien-armoury';

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

/** Resolve `game.modules.get('forien-armoury').api` (ADR-9.1 Class-1 accessor), or throw. */
function getArmouryApi(): any {
  const api = (globalThis as any).game?.modules?.get?.(MODULE_ID)?.api;
  if (!api) {
    throw new Error(
      'ARMOURY_API_UNAVAILABLE: game.modules.get("forien-armoury").api is not bound — the module may not have reached its init hook',
    );
  }
  return api;
}

/** Resolve actorId (UUID or world-document id) to an Actor, or null. */
function resolveActor(actorId: string): any {
  const game = (globalThis as any).game;
  const sync = (globalThis as any).fromUuidSync;
  let actor: any = null;
  if (typeof sync === 'function' && actorId.includes('.')) {
    try {
      actor = sync(actorId);
    } catch {
      actor = null;
    }
  }
  if (!actor) actor = game?.actors?.get?.(actorId) ?? null;
  return actor;
}

/** Resolve an embedded item on an actor by id. */
function resolveItem(actor: any, itemId: string): any {
  return actor?.items?.get?.(itemId) ?? null;
}

/** wfrp4e item price → pennies (gc×240 + ss×12 + bp). */
function priceInPennies(item: any): number {
  const p = item?.system?.price ?? {};
  const gc = Number(p.gc ?? 0) || 0;
  const ss = Number(p.ss ?? 0) || 0;
  const bp = Number(p.bp ?? 0) || 0;
  return gc * 240 + ss * 12 + bp;
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set([
  'spend-me',
  'create-scroll',
  'create-grimoire',
  'equip-grimoire',
  'repair-item',
  'configure-integration',
  'cantrip',
]);

export async function dispatchModuleArmoury(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws (carry-forward).
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModuleArmouryInputType;
  try {
    input = ModuleArmouryInput.parse(data);
  } catch (e) {
    return { success: false, error: `ARMOURY_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `ARMOURY_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'get-me':
        return handleGetMe(input);
      case 'spend-me':
        return handleSpendMe(input);
      case 'create-scroll':
        return handleCreateScroll(input);
      case 'read-scroll':
        return handleReadScroll(input);
      case 'create-grimoire':
        return handleCreateGrimoire(input);
      case 'read-grimoire-spells':
        return handleReadGrimoireSpells(input);
      case 'equip-grimoire':
        return handleEquipGrimoire(input);
      case 'check-damage':
        return handleCheckDamage(input);
      case 'repair-item':
        return handleRepairItem(input);
      case 'read-ammo-queue':
        return handleReadAmmoQueue(input);
      case 'read-combat-fatigue':
        return handleReadCombatFatigue(input);
      case 'add-species-career-content':
        return handleAddSpeciesCareerContent(input);
      case 'configure-integration':
        return handleConfigureIntegration(input);
      case 'cantrip':
        return handleCantrip(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `ARMOURY_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `ARMOURY_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Magical Endurance ───────────────────────────────────────────────────────────

type GetMeInput = Extract<ModuleArmouryInputType, { action: 'get-me' }>;
function handleGetMe(input: GetMeInput): Envelope<unknown> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  // Canonical live values (recomputes max + regen). Falls back to the raw flag if the API call fails.
  const api = getArmouryApi();
  const raw = actor.getFlag?.(MODULE_ID, 'magical-endurance') ?? {};
  let data: any = raw;
  try {
    const model = api.castingFatigue?.getMagicalEnduranceData?.(actor);
    if (model) data = model;
  } catch {
    /* fall back to the raw flag */
  }
  return {
    success: true,
    data: {
      actorId: input.actorId,
      actorName: actor.name ?? null,
      value: Number(data.value ?? 0),
      regen: data.regen != null ? Number(data.regen) : null,
      maximum: data.maximum != null ? Number(data.maximum) : null,
      lastRegen: data.lastRegen != null ? Number(data.lastRegen) : null,
      virtual: typeof data.virtual === 'boolean' ? data.virtual : null,
    },
  };
}

type SpendMeInput = Extract<ModuleArmouryInputType, { action: 'spend-me' }>;
async function handleSpendMe(input: SpendMeInput): Promise<Envelope<unknown>> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const api = getArmouryApi();
  const cf = api.castingFatigue;
  if (!cf || typeof cf.spendMagicalEndurance !== 'function') {
    throw new Error('ARMOURY_API_UNAVAILABLE: castingFatigue.spendMagicalEndurance is not bound');
  }
  const before = cf.getMagicalEnduranceData?.(actor) ?? actor.getFlag?.(MODULE_ID, 'magical-endurance') ?? {};
  const previousValue = Number(before.value ?? 0);
  const willTriggerEnduranceTest = previousValue - input.amount < 0;
  let value: number;
  let note: string | undefined;

  if (willTriggerEnduranceTest) {
    // Crossing below 0 makes Forien's spendMagicalEndurance fire setupSkill(Endurance), which opens a
    // BLOCKING UI dialog the MCP socket cannot drive ("server cannot pre-empt" — dossier §5.1). Calling
    // the real API here deadlocks the query. So for the threshold-crossing case we persist the ME drop
    // directly (the dossier's prescribed idiom-1 UX) and tell the GM to resolve the Endurance test on the
    // sheet. Non-crossing spends below still call the real API (authentic, no dialog).
    value = previousValue - input.amount;
    const raw = (actor.getFlag?.(MODULE_ID, 'magical-endurance') as Record<string, unknown>) ?? {};
    await actor.setFlag(MODULE_ID, 'magical-endurance', { ...raw, value });
    note = 'ME dropped below 0 — resolve the Endurance test on the actor sheet in Foundry (the module opens a dialog MCP cannot drive).';
  } else {
    // Real Forien behavior for a non-crossing spend — no dialog fires.
    await cf.spendMagicalEndurance(actor, input.amount);
    const after = cf.getMagicalEnduranceData?.(actor) ?? actor.getFlag?.(MODULE_ID, 'magical-endurance') ?? {};
    value = Number(after.value ?? previousValue - input.amount);
  }

  notify.updated('armoury', actor.name ?? input.actorId, {
    summary: `ME ${previousValue} → ${value} (spent ${input.amount}${willTriggerEnduranceTest ? '; Endurance test pending — resolve on sheet' : ''})`,
  });

  return {
    success: true,
    data: { actorId: input.actorId, actorName: actor.name ?? null, previousValue, amount: input.amount, value, willTriggerEnduranceTest, ...(note ? { note } : {}) },
  };
}

// ── Scrolls ─────────────────────────────────────────────────────────────────────

type CreateScrollInput = Extract<ModuleArmouryInputType, { action: 'create-scroll' }>;
async function handleCreateScroll(input: CreateScrollInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const settings = game?.settings;
  const defEnc = (() => {
    try { return Number(settings?.get?.(MODULE_ID, 'scrolls.defaultEncumbrance') ?? 0.05); } catch { return 0.05; }
  })();
  const defAvail = (() => {
    try { return String(settings?.get?.(MODULE_ID, 'scrolls.defaultAvailability') ?? 'exotic'); } catch { return 'exotic'; }
  })();

  const data = {
    name: input.name ?? 'Magic Scroll',
    type: `${MODULE_ID}.scroll`,
    system: {
      spellUuid: input.spellUuid,
      language: input.language ?? 'Magick',
      quantity: { value: input.quantity ?? 1 },
      encumbrance: { value: input.encumbrance ?? defEnc },
      availability: { value: input.availability ?? defAvail },
    },
  };

  let created: any;
  let scope: 'world' | 'actor';
  let actorId: string | null = null;
  // {skipAsk:true} suppresses Forien's spellUuid name-change Dialog.confirm (research gotcha 5).
  if (input.actorId) {
    const actor = resolveActor(input.actorId);
    if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
    const [doc] = await actor.createEmbeddedDocuments('Item', [data], { skipAsk: true });
    created = doc;
    scope = 'actor';
    actorId = input.actorId;
  } else {
    const ItemCls = (globalThis as any).Item;
    created = await ItemCls.create(data, { skipAsk: true });
    scope = 'world';
  }
  if (!created) return { success: false, error: 'ARMOURY_CREATE_FAILED: scroll Item.create returned nothing' };

  notify.created('armoury', created.name ?? 'Magic Scroll', { summary: `scroll (${scope}) → spell ${input.spellUuid}` });
  return {
    success: true,
    data: {
      itemId: created.id,
      name: created.name,
      scope,
      actorId,
      spellUuid: created.system?.spellUuid ?? input.spellUuid,
      language: created.system?.language ?? 'Magick',
      quantity: Number(created.system?.quantity?.value ?? input.quantity ?? 1),
      canUse: typeof created.system?.canUse === 'boolean' ? created.system.canUse : null,
    },
  };
}

type ReadScrollInput = Extract<ModuleArmouryInputType, { action: 'read-scroll' }>;
function handleReadScroll(input: ReadScrollInput): Envelope<unknown> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const item = resolveItem(actor, input.itemId);
  if (!item) return { success: false, error: `ITEM_NOT_FOUND: no item "${input.itemId}" on "${input.actorId}"` };
  return {
    success: true,
    data: {
      itemId: item.id,
      name: item.name,
      scope: 'actor' as const,
      actorId: input.actorId,
      spellUuid: item.system?.spellUuid ?? null,
      language: item.system?.language ?? 'Magick',
      quantity: Number(item.system?.quantity?.value ?? 0),
      canUse: typeof item.system?.canUse === 'boolean' ? item.system.canUse : null,
    },
  };
}

// ── Grimoires ─────────────────────────────────────────────────────────────────

/** Spells on the actor granted by a given grimoire (flags.forien-armoury.sourceGrimoire). */
function grantedSpellsFor(actor: any, grimoireId: string): Array<{ id: string; name: string }> {
  const spells = actor?.itemTypes?.spell ?? actor?.items?.filter?.((i: any) => i.type === 'spell') ?? [];
  return spells
    .filter((s: any) => s.flags?.[MODULE_ID]?.sourceGrimoire === grimoireId)
    .map((s: any) => ({ id: s.id, name: s.name }));
}

type CreateGrimoireInput = Extract<ModuleArmouryInputType, { action: 'create-grimoire' }>;
async function handleCreateGrimoire(input: CreateGrimoireInput): Promise<Envelope<unknown>> {
  const data = {
    name: input.name ?? 'Grimoire',
    type: `${MODULE_ID}.grimoire`,
    system: {
      spells: input.spells.map((s) => ({ name: s.name ?? '', uuid: s.uuid })),
      language: input.language ?? 'Magick',
      twohanded: { value: input.twohanded ?? false },
      equipped: { value: false },
    },
  };
  let created: any;
  let actorId: string | null = null;
  if (input.actorId) {
    const actor = resolveActor(input.actorId);
    if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
    const [doc] = await actor.createEmbeddedDocuments('Item', [data]);
    created = doc;
    actorId = input.actorId;
  } else {
    const ItemCls = (globalThis as any).Item;
    created = await ItemCls.create(data);
  }
  if (!created) return { success: false, error: 'ARMOURY_CREATE_FAILED: grimoire Item.create returned nothing' };
  notify.created('armoury', created.name ?? 'Grimoire', { summary: `grimoire with ${input.spells.length} spell(s)` });
  return {
    success: true,
    data: {
      itemId: created.id,
      name: created.name,
      actorId,
      equipped: Boolean(created.system?.equipped?.value),
      language: created.system?.language ?? 'Magick',
      spells: (created.system?.spells ?? []).map((s: any) => ({ name: s.name ?? null, uuid: s.uuid })),
      grantedSpells: actorId ? grantedSpellsFor(resolveActor(actorId), created.id) : [],
    },
  };
}

type ReadGrimoireInput = Extract<ModuleArmouryInputType, { action: 'read-grimoire-spells' }>;
function handleReadGrimoireSpells(input: ReadGrimoireInput): Envelope<unknown> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const item = resolveItem(actor, input.itemId);
  if (!item) return { success: false, error: `ITEM_NOT_FOUND: no item "${input.itemId}" on "${input.actorId}"` };
  return {
    success: true,
    data: {
      itemId: item.id,
      name: item.name,
      actorId: input.actorId,
      equipped: Boolean(item.system?.equipped?.value),
      language: item.system?.language ?? 'Magick',
      spells: (item.system?.spells ?? []).map((s: any) => ({ name: s.name ?? null, uuid: s.uuid })),
      grantedSpells: grantedSpellsFor(actor, item.id),
    },
  };
}

type EquipGrimoireInput = Extract<ModuleArmouryInputType, { action: 'equip-grimoire' }>;
async function handleEquipGrimoire(input: EquipGrimoireInput): Promise<Envelope<unknown>> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const item = resolveItem(actor, input.itemId);
  if (!item) return { success: false, error: `ITEM_NOT_FOUND: no grimoire "${input.itemId}" on "${input.actorId}"` };
  if (item.type !== `${MODULE_ID}.grimoire`) {
    return { success: false, error: `ARMOURY_WRONG_TYPE: item "${input.itemId}" is ${item.type}, not a grimoire` };
  }
  const before = grantedSpellsFor(actor, item.id).length;
  // Writing equipped.value fires Forien's onEquipToggle → applySpells()/removeSpells() on the GM client.
  await item.update({ 'system.equipped.value': input.equipped });
  const grantedSpells = grantedSpellsFor(resolveActor(input.actorId), item.id);
  const removedSpellCount = input.equipped ? 0 : Math.max(0, before - grantedSpells.length);
  notify.updated('armoury', item.name ?? 'Grimoire', {
    summary: input.equipped ? `equipped → granted ${grantedSpells.length} spell(s)` : `unequipped → removed ${removedSpellCount} spell(s)`,
  });
  return {
    success: true,
    data: { itemId: item.id, name: item.name, actorId: input.actorId, equipped: input.equipped, grantedSpells, removedSpellCount },
  };
}

// ── Item Repair ───────────────────────────────────────────────────────────────

const AP_LOCATIONS = ['head', 'body', 'lArm', 'rArm', 'lLeg', 'rLeg'] as const;

type CheckDamageInput = Extract<ModuleArmouryInputType, { action: 'check-damage' }>;
function handleCheckDamage(input: CheckDamageInput): Envelope<unknown> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const damaged: any[] = [];
  for (const item of actor.items ?? []) {
    const pennies = priceInPennies(item);
    if (item.type === 'armour') {
      const ap = item.system?.APdamage ?? {};
      const locations: Record<string, number> = {};
      let total = 0;
      for (const loc of AP_LOCATIONS) {
        const v = Number(ap[loc] ?? 0) || 0;
        if (v > 0) { locations[loc] = v; total += v; }
      }
      if (total > 0) {
        damaged.push({ itemId: item.id, name: item.name, type: 'armour', damage: total, locations, repairCost: Math.round(pennies * 0.1 * total) });
      }
    } else {
      const v = Number(item.system?.damageToItem?.value ?? 0) || 0;
      if (v > 0) {
        damaged.push({ itemId: item.id, name: item.name, type: item.type, damage: v, repairCost: Math.round(pennies * 0.1 * v) });
      }
    }
  }
  const totalRepairCost = damaged.reduce((s, d) => s + d.repairCost, 0);
  return { success: true, data: { actorId: input.actorId, actorName: actor.name ?? null, damaged, totalRepairCost } };
}

type RepairItemInput = Extract<ModuleArmouryInputType, { action: 'repair-item' }>;
async function handleRepairItem(input: RepairItemInput): Promise<Envelope<unknown>> {
  const actor = resolveActor(input.actorId);
  if (!actor) return { success: false, error: `ACTOR_NOT_FOUND: no actor resolves for "${input.actorId}"` };
  const item = resolveItem(actor, input.itemId);
  if (!item) return { success: false, error: `ITEM_NOT_FOUND: no item "${input.itemId}" on "${input.actorId}"` };
  const field = input.location ? `system.APdamage.${input.location}` : 'system.damageToItem.value';
  const previousValue = input.location
    ? Number(item.system?.APdamage?.[input.location] ?? 0)
    : Number(item.system?.damageToItem?.value ?? 0);
  await item.update({ [field]: input.newValue });
  // DP-16 post-write verify.
  const fresh = resolveItem(resolveActor(input.actorId), input.itemId);
  const confirmed = input.location
    ? Number(fresh?.system?.APdamage?.[input.location] ?? -1)
    : Number(fresh?.system?.damageToItem?.value ?? -1);
  if (confirmed !== input.newValue) {
    return { success: false, error: `ARMOURY_REPAIR_NOT_PERSISTED: ${field} read back ${confirmed}, expected ${input.newValue}` };
  }
  notify.updated('armoury', item.name ?? 'item', { summary: `${field}: ${previousValue} → ${input.newValue}` });
  return { success: true, data: { itemId: item.id, name: item.name, field, previousValue, newValue: input.newValue } };
}

// ── Ammo Reclamation queue ──────────────────────────────────────────────────────

function resolveCombat(combatId?: string): any {
  const game = (globalThis as any).game;
  if (combatId) return game?.combats?.get?.(combatId) ?? null;
  return game?.combat ?? null;
}

type ReadAmmoInput = Extract<ModuleArmouryInputType, { action: 'read-ammo-queue' }>;
function handleReadAmmoQueue(input: ReadAmmoInput): Envelope<unknown> {
  const combat = resolveCombat(input.combatId);
  if (!combat) return { success: false, error: 'COMBAT_NOT_FOUND: no active combat (and no combatId given)' };
  const queue = combat.getFlag?.(MODULE_ID, 'ammoReplenish') ?? {};
  const entryCount = Object.values(queue).reduce((s: number, arr: any) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  return { success: true, data: { combatId: combat.id ?? null, queue, entryCount } };
}

// ── Combat Fatigue ──────────────────────────────────────────────────────────────

type ReadFatigueInput = Extract<ModuleArmouryInputType, { action: 'read-combat-fatigue' }>;
function handleReadCombatFatigue(input: ReadFatigueInput): Envelope<unknown> {
  const combat = resolveCombat(input.combatId);
  if (!combat) return { success: false, error: 'COMBAT_NOT_FOUND: no active combat (and no combatId given)' };
  const all = combat.combatants ?? [];
  const list = input.combatantId ? all.filter((c: any) => c.id === input.combatantId) : [...all];
  const combatants = list.map((c: any) => ({
    combatantId: c.id,
    name: c.name ?? c.token?.name ?? null,
    roundsBeforeTest: c.getFlag?.(MODULE_ID, 'roundsBeforeTest') ?? null,
    roundsBeforePassOut: c.getFlag?.(MODULE_ID, 'roundsBeforePassOut') ?? null,
  }));
  return { success: true, data: { combatId: combat.id ?? null, combatants } };
}

// ── Species / career content catalog ────────────────────────────────────────────

type ContentInput = Extract<ModuleArmouryInputType, { action: 'add-species-career-content' }>;
async function handleAddSpeciesCareerContent(input: ContentInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const pack = game?.packs?.get?.(PACK_ID);
  if (!pack) return { success: false, error: `ARMOURY_PACK_NOT_FOUND: ${PACK_ID}` };
  const index = pack.index?.size ? [...pack.index] : await pack.getIndex();
  const byType = (t: string) => index.filter((e: any) => e.type === t).map((e: any) => e.name).sort();
  const careers = byType('career');
  const talents = byType('talent');
  // Runebound species is config-injected (Species.applyWfrp4eConfig), not a pack Item type; surface any
  // pack docs whose name flags them as species content as a best-effort, plus a note.
  const species = index.filter((e: any) => e.type === 'species' || /runebound/i.test(e.name)).map((e: any) => e.name).sort();
  const want = input.filter;
  return {
    success: true,
    data: {
      pack: PACK_ID,
      species: want === 'all' || want === 'species' ? species : [],
      careers: want === 'all' || want === 'careers' ? careers : [],
      talents: want === 'all' || want === 'talents' ? talents : [],
    },
  };
}

// ── Integration one-shot settings ───────────────────────────────────────────────

const INTEGRATION_KEYS: Record<string, string> = {
  setCurrencies: 'itempiles.setCurrencies',
  rolltablesImport: 'itempiles.rolltablesImport',
  atlResetPresets: 'atl.resetPresets',
};

type IntegrationInput = Extract<ModuleArmouryInputType, { action: 'configure-integration' }>;
async function handleConfigureIntegration(input: IntegrationInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const key = INTEGRATION_KEYS[input.integration];
  // setCurrencies/rolltablesImport require item-piles active; surface a clear error rather than a no-op.
  if (input.integration !== 'atlResetPresets' && !game?.modules?.get?.('item-piles')?.active) {
    return { success: false, error: `MODULE_DEPENDENCY_NOT_ACTIVE: "item-piles" is required for ${input.integration}` };
  }
  await game.settings.set(MODULE_ID, key, true);
  notify.updated('armoury', `integration:${input.integration}`, { summary: `one-shot ${key} fired` });
  return {
    success: true,
    data: {
      integration: input.integration,
      triggered: true,
      note: `Set forien-armoury "${key}" = true (one-shot; the module resets it to false after firing).`,
    },
  };
}

// ── Cantrip ─────────────────────────────────────────────────────────────────────

type CantripInput = Extract<ModuleArmouryInputType, { action: 'cantrip' }>;
async function handleCantrip(input: CantripInput): Promise<Envelope<unknown>> {
  const canvas = (globalThis as any).canvas;
  const sync = (globalThis as any).fromUuidSync;
  let token: any = canvas?.tokens?.get?.(input.tokenId) ?? null;
  if (!token && typeof sync === 'function' && input.tokenId.includes('.')) {
    try { token = sync(input.tokenId)?.object ?? sync(input.tokenId); } catch { token = null; }
  }
  if (!token) return { success: false, error: `TOKEN_NOT_FOUND: no token "${input.tokenId}" on the canvas` };

  const api = getArmouryApi();
  if (!api.macros || typeof api.macros.cantrip !== 'function') {
    throw new Error('ARMOURY_API_UNAVAILABLE: macros.cantrip is not bound');
  }
  // cantrip derives the actor from the canvas speaker → control the token first (research gotcha 2).
  try {
    token.control?.({ releaseOthers: true });
  } catch {
    /* control is best-effort; cantrip falls back to user.character */
  }
  let success = false;
  try {
    // macro arg is unused for scope resolution (cantrip reads ChatMessage.getSpeaker); pass null.
    success = Boolean(await api.macros.cantrip(null, { requiredSL: input.requiredSL, lore: input.lore }));
  } catch (e) {
    return { success: false, error: `ARMOURY_CANTRIP_FAILED: ${e instanceof Error ? e.message : String(e)}` };
  }
  const actorName = token.actor?.name ?? null;
  notify.updated('armoury', actorName ?? input.tokenId, { summary: `cantrip (${input.lore}, SL ${input.requiredSL}) → ${success ? 'spent' : 'no-op'}` });
  return {
    success: true,
    data: {
      tokenId: input.tokenId,
      actorName,
      lore: input.lore,
      requiredSL: input.requiredSL,
      success,
      note: success ? 'Cantrip spent channelled SL and posted to chat.' : 'Cantrip returned no-op (no actor, WoM channelling off, or insufficient SL).',
    },
  };
}
