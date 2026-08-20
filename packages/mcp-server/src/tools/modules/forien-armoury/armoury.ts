// Module Integration v1 Phase 10 — module-armoury MCP tool (Forien's Armoury).
//
// Always-registered umbrella. The foundry-module handler guards on forien-armoury being active;
// when inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active forien-armoury to pre-flight.
//
// 14 actions: reads (get-me, read-scroll, read-grimoire-spells, check-damage, read-ammo-queue,
// read-combat-fatigue, add-species-career-content) + GM-gated writes (spend-me, create-scroll,
// create-grimoire, equip-grimoire, repair-item, configure-integration, cantrip).
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>); R2.4 (errors via BaseTool.errorResponse).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleArmouryInput } from '@foundry-mcp/shared';

type ModuleArmouryArgs = z.infer<typeof ModuleArmouryInput>;
import type {
  ArmouryMeResult,
  ArmourySpendMeResult,
  ArmouryScrollResult,
  ArmouryGrimoireSpellsResult,
  ArmouryEquipGrimoireResult,
  ArmouryCheckDamageResult,
  ArmouryRepairResult,
  ArmouryAmmoQueueResult,
  ArmouryCombatFatigueResult,
  ArmouryContentResult,
  ArmouryIntegrationResult,
  ArmouryCantripResult,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });


// ── Per-action formatters ─────────────────────────────────────────────────────

function formatMe(d: ArmouryMeResult): string {
  const max = d.maximum ?? '?';
  const tag = d.virtual ? ' (no ME history — non-caster)' : '';
  return `module-armoury.get-me: ${d.actorName ?? d.actorId} — ME ${d.value}/${max}, regen ${d.regen ?? '?'}/hr${tag}.`;
}
function formatSpendMe(d: ArmourySpendMeResult): string {
  const warn = d.willTriggerEnduranceTest ? ' ⚠ Endurance test triggered (ME below 0)' : '';
  return `module-armoury.spend-me: ${d.actorName ?? d.actorId} — ME ${d.previousValue} → ${d.value} (spent ${d.amount}).${warn}`;
}
function formatScroll(d: ArmouryScrollResult): string {
  return `module-armoury scroll: "${d.name}" (${d.scope}${d.actorId ? ` on ${d.actorId}` : ''}) — spell ${d.spellUuid ?? '?'}, qty ${d.quantity}, language ${d.language}, canUse ${d.canUse ?? '?'}.`;
}
function formatGrimoireSpells(d: ArmouryGrimoireSpellsResult): string {
  return `module-armoury grimoire: "${d.name}" — ${d.spells.length} spell(s), equipped ${d.equipped}, granted ${d.grantedSpells.length} on actor.`;
}
function formatEquip(d: ArmouryEquipGrimoireResult): string {
  return `module-armoury.equip-grimoire: "${d.name}" ${d.equipped ? 'equipped' : 'unequipped'} → ${d.equipped ? `granted ${d.grantedSpells.length} spell(s)` : `removed ${d.removedSpellCount} spell(s)`}.`;
}
function formatCheckDamage(d: ArmouryCheckDamageResult): string {
  if (!d.damaged.length) return `module-armoury.check-damage: ${d.actorName ?? d.actorId} — no damaged items.`;
  const lines = d.damaged.map((x) => `  • ${x.name} (${x.type}): ${x.damage} damage, repair ~${x.repairCost}d`);
  return `module-armoury.check-damage: ${d.actorName ?? d.actorId} — ${d.damaged.length} damaged item(s), total ~${d.totalRepairCost}d:\n${lines.join('\n')}`;
}
function formatRepair(d: ArmouryRepairResult): string {
  return `module-armoury.repair-item: "${d.name}" ${d.field} ${d.previousValue} → ${d.newValue}.`;
}
function formatAmmo(d: ArmouryAmmoQueueResult): string {
  return `module-armoury.read-ammo-queue: combat ${d.combatId ?? '(active)'} — ${d.entryCount} queued ammo entr${d.entryCount === 1 ? 'y' : 'ies'} across ${Object.keys(d.queue).length} actor(s).`;
}
function formatFatigue(d: ArmouryCombatFatigueResult): string {
  if (!d.combatants.length) return `module-armoury.read-combat-fatigue: combat ${d.combatId ?? '(active)'} — no combatants.`;
  const lines = d.combatants.map((c) => `  • ${c.name ?? c.combatantId}: test in ${c.roundsBeforeTest ?? '(TB default)'}, passout in ${c.roundsBeforePassOut ?? '—'}`);
  return `module-armoury.read-combat-fatigue: combat ${d.combatId ?? '(active)'}:\n${lines.join('\n')}`;
}
function formatContent(d: ArmouryContentResult): string {
  return `module-armoury content (${d.pack}): ${d.species.length} species, ${d.careers.length} careers, ${d.talents.length} talents. Embed via add-item-from-compendium.`;
}
function formatIntegration(d: ArmouryIntegrationResult): string {
  return `module-armoury.configure-integration: ${d.integration} — ${d.triggered ? 'triggered' : 'no-op'}. ${d.note}`;
}
function formatCantrip(d: ArmouryCantripResult): string {
  return `module-armoury.cantrip: ${d.actorName ?? d.tokenId} (${d.lore}, SL ${d.requiredSL}) — ${d.success ? 'spent' : 'no-op'}. ${d.note}`;
}

export interface ModuleArmouryToolOptions extends BaseToolOptions {}

export class ModuleArmouryTool extends BaseTool {
  constructor(options: ModuleArmouryToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-armoury', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-armoury',
        title: "Forien's Armoury integration",
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate Forien's Armoury (WFRP4e): Magical Endurance, Magic Scrolls, Grimoires, Item Repair, Ammo Reclamation queue, Combat Fatigue, content packs, and integrations.
Conditional: returns MODULE_NOT_ACTIVE when forien-armoury is absent/inactive.
Pre-flight: module-probe.is-active forien-armoury before using this tool.

Use this when:
- Tracking a caster's Magical Endurance pool (reading or spending ME) instead of Wounds/Fate for spellcasting cost.
- Creating or reading a Magic Scroll or Grimoire item, or equipping/unequipping a Grimoire to grant/remove its bound spells.
- Recording weapon/armour damage-and-repair state, or resolving an item repair.
- Managing the ammo-reclamation queue or combat-fatigue tracking for an active combat.
- Firing a one-shot Armoury integration (currency setup, rolltable import, ATL preset reset) or resolving a cantrip cast.

14 actions:
Reads — get-me { actorId }; read-scroll { actorId, itemId }; read-grimoire-spells { actorId, itemId }; check-damage { actorId }; read-ammo-queue { combatId? }; read-combat-fatigue { combatId?, combatantId? }; add-species-career-content { filter? } (catalogs the forien-armoury pack — embed via add-item-from-compendium).
Writes (GM) — spend-me { actorId, amount } (returns willTriggerEnduranceTest when ME drops below 0 — the module fires a silent Endurance test); create-scroll { spellUuid, actorId?, language?, quantity? }; create-grimoire { spells[], actorId? }; repair-item { actorId, itemId, location?, newValue }.
Confirm-gated writes (GM + confirm:true) — equip-grimoire { actorId, itemId, equipped?, confirm } (auto-grants/removes spells); configure-integration { integration, confirm } (irreversible one-shot currency/preset/rolltable rewrite); cantrip { tokenId, requiredSL?, lore?, confirm } (controls the token, spends channelled SL, posts chat).

Example: { action: "get-me", actorId: "Actor.abc123" }

Do NOT use this tool for generic actor resource or currency edits — use \`update-actor\` for those. module-armoury is specifically Forien's Armoury mechanics (Magical Endurance, scrolls/grimoires, item repair, ammo/fatigue tracking); it has no general-purpose actor-field write.

Performance Notes:
- All 14 actions return a small fixed-shape result (a resource value, an item record, or a per-combat list bounded by combatant count) — no response modes, no pagination; cost does not scale with world size.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-me', 'spend-me', 'create-scroll', 'read-scroll', 'create-grimoire',
                'read-grimoire-spells', 'equip-grimoire', 'check-damage', 'repair-item',
                'read-ammo-queue', 'read-combat-fatigue', 'add-species-career-content',
                'configure-integration', 'cantrip',
              ],
              description: 'Armoury action to perform.',
            },
            actorId: { type: 'string', description: 'Target actor UUID or world-document id.' },
            itemId: { type: 'string', description: 'Target embedded item id (scroll/grimoire/damaged item).' },
            amount: { type: 'number', description: 'spend-me: positive ME points to drain.' },
            spellUuid: { type: 'string', description: 'create-scroll: the spell the scroll casts.' },
            name: { type: 'string', description: 'create-scroll/create-grimoire: item name.' },
            language: { type: 'string', description: 'Scroll/grimoire language (default "Magick").' },
            quantity: { type: 'number', description: 'create-scroll: starting quantity (default 1).' },
            encumbrance: { type: 'number', description: 'create-scroll: encumbrance override.' },
            availability: { type: 'string', description: 'create-scroll: availability override.' },
            spells: {
              type: 'array',
              description: 'create-grimoire: spells to bind { name?, uuid }.',
              items: { type: 'object', properties: { name: { type: 'string' }, uuid: { type: 'string' } }, required: ['uuid'] },
            },
            twohanded: { type: 'boolean', description: 'create-grimoire: two-handed flag.' },
            equipped: { type: 'boolean', description: 'equip-grimoire: true=equip (grant spells), false=unequip (remove).' },
            location: { type: 'string', enum: ['head', 'body', 'lArm', 'rArm', 'lLeg', 'rLeg'], description: 'repair-item: armour hit location (omit for weapons/trappings).' },
            newValue: { type: 'number', description: 'repair-item: new damage value (0 = full repair).' },
            combatId: { type: 'string', description: 'read-ammo-queue/read-combat-fatigue: combat id (default active).' },
            combatantId: { type: 'string', description: 'read-combat-fatigue: single combatant (omit for all).' },
            filter: { type: 'string', enum: ['species', 'careers', 'talents', 'all'], description: 'add-species-career-content: content filter (default all).' },
            integration: { type: 'string', enum: ['setCurrencies', 'rolltablesImport', 'atlResetPresets'], description: 'configure-integration: which one-shot to fire.' },
            tokenId: { type: 'string', description: 'cantrip: token to control (the actor is derived from it).' },
            requiredSL: { type: 'number', description: 'cantrip: SL to spend (default 1).' },
            lore: { type: 'string', description: 'cantrip: spell lore (default "fire").' },
            confirm: { type: 'boolean', description: 'Required (true) for equip-grimoire, configure-integration, cantrip.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: ModuleArmouryArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-armoury action', { action });
    switch (action) {
      case 'get-me': return this.run<ArmouryMeResult>(action, rawArgs, formatMe);
      case 'spend-me': return this.run<ArmourySpendMeResult>(action, rawArgs, formatSpendMe);
      case 'create-scroll': return this.run<ArmouryScrollResult>(action, rawArgs, formatScroll);
      case 'read-scroll': return this.run<ArmouryScrollResult>(action, rawArgs, formatScroll);
      case 'create-grimoire': return this.run<ArmouryGrimoireSpellsResult>(action, rawArgs, formatGrimoireSpells);
      case 'read-grimoire-spells': return this.run<ArmouryGrimoireSpellsResult>(action, rawArgs, formatGrimoireSpells);
      case 'equip-grimoire': return this.run<ArmouryEquipGrimoireResult>(action, rawArgs, formatEquip);
      case 'check-damage': return this.run<ArmouryCheckDamageResult>(action, rawArgs, formatCheckDamage);
      case 'repair-item': return this.run<ArmouryRepairResult>(action, rawArgs, formatRepair);
      case 'read-ammo-queue': return this.run<ArmouryAmmoQueueResult>(action, rawArgs, formatAmmo);
      case 'read-combat-fatigue': return this.run<ArmouryCombatFatigueResult>(action, rawArgs, formatFatigue);
      case 'add-species-career-content': return this.run<ArmouryContentResult>(action, rawArgs, formatContent);
      case 'configure-integration': return this.run<ArmouryIntegrationResult>(action, rawArgs, formatIntegration);
      case 'cantrip': return this.run<ArmouryCantripResult>(action, rawArgs, formatCantrip);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-armoury', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-armoury', msg);
      return this.errorResponse(action, msg);
    }
  }
}
