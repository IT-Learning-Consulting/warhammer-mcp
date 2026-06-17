// Module Integration v1 Phase 8 — module-autoanimations MCP tool.
//
// 7-action umbrella for Automated Animations: per-item flag authoring, animation
// discovery, world-level Autorec config, and manual director play.
// Conditional: MODULE_NOT_ACTIVE / MODULE_DEPENDENCY_NOT_ACTIVE returned when
// autoanimations (or sequencer/socketlib) is absent/inactive.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any>.
//   - R2.4: errors route through the shared BaseTool.errorResponse.
//   - F03 (Phase 5 carry-forward): the formatter must emit EVERY data field the
//       handler returns — a field computed but not surfaced is invisible to callers.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';

// ── Response shapes (DP-15 — concrete, never <any>) ──────────────────────────

interface AAItemResult {
  uuid?: string;
  name?: string | null;
  flags?: Record<string, unknown> | null;
  isCustomized?: boolean | null;
  version?: number | null;
  menu?: string;
  cleared?: boolean;
}

interface AAListResult {
  trail?: string[];
  keys?: string[];
  count?: number;
  note?: string;
}

interface AAAutorecResult {
  counts?: Record<string, number>;
  version?: number | null;
  category?: string;
  label?: string;
  added?: boolean;
}

interface AAPlayResult {
  played?: boolean;
  sourceToken?: string;
  targetCount?: number;
}

type AAResult = AAItemResult | AAListResult | AAAutorecResult | AAPlayResult;

// ── Error helper (CCR-G2) ────────────────────────────────────────────────────


// ── Format helpers (F03 — emit every field) ──────────────────────────────────

function formatItem(r: AAItemResult, action: string): string {
  if (action === 'get-item-animation') {
    if (!r.flags) return `module-autoanimations.get-item-animation: no animation flags on ${r.name ?? r.uuid}.`;
    return `module-autoanimations.get-item-animation: ${r.name ?? r.uuid} → version=${r.version}, isCustomized=${r.isCustomized}, menu=${(r.flags as any)?.menu ?? '?'}, animation=${(r.flags as any)?.primary?.video?.animation ?? '?'}.`;
  }
  if (action === 'clear-item-animation') {
    return `module-autoanimations.clear-item-animation: cleared from ${r.name ?? r.uuid} (verified absent).`;
  }
  return `module-autoanimations.set-item-animation: set on ${r.name ?? r.uuid} (v${r.version}, isCustomized=${r.isCustomized}, menu=${r.menu}).`;
}

function formatList(r: AAListResult): string {
  const trail = (r.trail ?? []).join('.') || '(root)';
  const keys = r.keys ?? [];
  const note = r.note ? ` — ${r.note}` : '';
  if (keys.length === 0) return `module-autoanimations.list-animations: ${trail} → 0 keys${note}.`;
  return `module-autoanimations.list-animations: ${trail} → ${keys.length} key(s):\n${keys.join(', ')}`;
}

function formatAutorec(r: AAAutorecResult, action: string): string {
  if (action === 'get-autorec') {
    const c = r.counts ?? {};
    const lines = Object.keys(c).map((k) => `  ${k}: ${c[k]}`);
    return `module-autoanimations.get-autorec: Autorec entries by category (version ${r.version ?? '?'}):\n${lines.join('\n')}`;
  }
  return `module-autoanimations.merge-autorec-entry: added "${r.label}" to category "${r.category}" (added=${r.added}).`;
}

function formatPlay(r: AAPlayResult): string {
  return `module-autoanimations.play-animation: played=${r.played} from token ${r.sourceToken} on ${r.targetCount ?? 0} target(s).`;
}

export interface ModuleAutoAnimationsToolOptions extends BaseToolOptions {}

export class ModuleAutoAnimationsTool extends BaseTool {
  constructor(options: ModuleAutoAnimationsToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-autoanimations', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-autoanimations',
        title: 'Automated Animations — item-flag authoring, Autorec config, director play',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Author Automated Animations (AA) so WFRP4e rolls play JB2A/Sequencer animations.
Conditional: returns MODULE_NOT_ACTIVE (autoanimations) or MODULE_DEPENDENCY_NOT_ACTIVE (sequencer/socketlib) when inactive.
Pre-flight: module-probe.is-active autoanimations before using this tool.

AA fires animations AUTOMATICALLY on every roll once per-item flags or Autorec name-maps exist;
this tool AUTHORS those flags/maps — it does not intercept rolls.

7 actions:
PER-ITEM FLAGS:
- get-item-animation  { uuid }                          — read flags.autoanimations from an Item
- set-item-animation  { uuid, animation, confirmedMacro? } — write v5 flags (two-step; forces version:5 + isCustomized:true)
    animation = { menu?, primary:{dbSection,menuType,animation,variant?,color?}, sound?, secondary?, source?, target?, soundOnly?, macro?, meleeSwitch?, fromAmmo? }
    macro.enable:true REQUIRES confirmedMacro:true (AA runs an arbitrary world macro on every roll).
- clear-item-animation { uuid }                         — delete flags.autoanimations (verified)
DISCOVERY (read-only, needs aa.ready):
- list-animations     { dbSection?, menuType? }         — list AA animation keys (reads aaDatabase tree; AA's namespace is private to Sequencer.searchFor)
AUTOREC (world-level name→animation maps):
- get-autorec         { }                               — entry counts per category (melee/range/ontoken/templatefx/aura/preset/aefx)
- merge-autorec-entry { category, label, animation, confirmedMacro? } — add ONE name-keyed entry (dup-label rejected)
DIRECTOR:
- play-animation      { sourceTokenUuid, itemUuid|itemName, targetUuids?, confirm:true } — fire a manual animation (no roll)

GM required for all actions. Destructive/transient ops are confirm-gated.

Examples:
- { action: "set-item-animation", uuid: "Actor.x.Item.y", animation: { primary: { dbSection: "melee", menuType: "weapon", animation: "sword", variant: "01", color: "white" } } }
- { action: "merge-autorec-entry", category: "melee", label: "Hand Weapon", animation: { primary: { dbSection: "melee", menuType: "weapon", animation: "sword" } } }
- { action: "list-animations", dbSection: "melee", menuType: "weapon" }
- { action: "play-animation", sourceTokenUuid: "Scene.s.Token.t", itemName: "Fireball", confirm: true }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-item-animation', 'set-item-animation', 'clear-item-animation',
                'list-animations', 'get-autorec', 'merge-autorec-entry', 'play-animation',
              ],
            },
            uuid: { type: 'string', description: '[get/set/clear-item-animation] Item document UUID.' },
            animation: { type: 'object', description: '[set-item-animation/merge-autorec-entry] Simplified v5 animation payload — { menu?, primary:{dbSection,menuType,animation,variant?,color?}, sound?, secondary?, source?, target?, soundOnly?, macro?, meleeSwitch?, fromAmmo? }.' },
            confirmedMacro: { type: 'boolean', description: '[set-item-animation/merge-autorec-entry] Required true when animation.macro.enable is true.' },
            dbSection: { type: 'string', enum: ['melee', 'range', 'return', 'static', 'templatefx'], description: '[list-animations] Filter the animation tree to one section.' },
            menuType: { type: 'string', description: '[list-animations] Filter to one menuType (e.g. "weapon", "spell").' },
            category: { type: 'string', enum: ['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset', 'aefx'], description: '[merge-autorec-entry] Autorec category to merge into.' },
            label: { type: 'string', description: '[merge-autorec-entry] Item-name label to match (whitespace-normalized, case-insensitive).' },
            sourceTokenUuid: { type: 'string', description: '[play-animation] Source token UUID.' },
            itemUuid: { type: 'string', description: '[play-animation] Item UUID to route the animation (or use itemName).' },
            itemName: { type: 'string', description: '[play-animation] Item name for Autorec-only lookup (or use itemUuid).' },
            targetUuids: { type: 'array', items: { type: 'string' }, description: '[play-animation] Target token UUIDs (empty array = no targets, avoids silent game.user.targets fallback).' },
            confirm: { type: 'boolean', description: '[play-animation] Required true (transient effect, no undo).' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: Record<string, unknown>) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-autoanimations action', { action });
    try {
      const data = await this.query<AAResult>('module-autoanimations', args);
      let text: string;
      if (['get-item-animation', 'set-item-animation', 'clear-item-animation'].includes(action)) {
        text = formatItem(data as AAItemResult, action);
      } else if (action === 'list-animations') {
        text = formatList(data as AAListResult);
      } else if (action === 'get-autorec' || action === 'merge-autorec-entry') {
        text = formatAutorec(data as AAAutorecResult, action);
      } else {
        text = formatPlay(data as AAPlayResult);
      }
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('MODULE_NOT_ACTIVE') || msg.includes('MODULE_DEPENDENCY_NOT_ACTIVE')) {
        return moduleNotActiveContent('module-autoanimations', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
