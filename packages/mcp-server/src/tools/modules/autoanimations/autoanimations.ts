// Module Integration v1 Phase 8 — module-autoanimations MCP tool.
//
// 9-action umbrella for Automated Animations: per-item flag authoring, animation
// discovery, world-level Autorec config, and manual director play.
// Conditional: MODULE_NOT_ACTIVE / MODULE_DEPENDENCY_NOT_ACTIVE returned when
// autoanimations (or sequencer/socketlib) is absent/inactive.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any>.
//   - R2.4: errors route through the shared BaseTool.errorResponse.
//   - F03 (Phase 5 carry-forward): the formatter must emit EVERY data field the
//       handler returns — a field computed but not surfaced is invisible to callers.
//
// GATE-SUPPRESS[success-semantics]: systemic_bug_class_prevention v2 Phase 1 (BUG-813) touches only
// the clear-item-animation confirm-gate description/schema here — this tool's outcome-field
// retrofit (HC4/check-outcome-field allowlist membership) is out of scope; owned by v2 Phase 3 (C2).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleAutoAnimationsInput } from '@foundry-mcp/shared';

type ModuleAutoAnimationsArgs = z.infer<typeof ModuleAutoAnimationsInput>;

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

interface AAAutorecEntry {
  id?: string | null;
  label?: string | null;
  isEnabled?: boolean | null;
  isCustomized?: boolean | null;
  fromAmmo?: boolean | null;
  menu?: string | null;
  version?: number | null;
  animation?: string;
}

interface AAAutorecResult {
  counts?: Record<string, number>;
  version?: number | null;
  category?: string;
  label?: string;
  added?: boolean;
  // BUG-812(a): present only on a filtered/paginated get-autorec call (category/label/limit/
  // offset supplied) — a parameterless call keeps returning ONLY counts/version (CCR-7).
  entries?: AAAutorecEntry[];
  totalAvailable?: number;
  truncated?: boolean;
  offset?: number;
  limit?: number;
  // BUG-812(c): update-autorec-entry / remove-autorec-entry results.
  id?: string;
  updated?: boolean;
  removed?: boolean;
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
    // BUG-812(a): F03 — emit every field the handler returns. A filtered/paginated call
    // (category/label/limit/offset supplied) returns an `entries` page instead of the
    // counts-only shape; print that page + its pagination metadata. A parameterless call
    // keeps the original counts-only line unchanged (CCR-7).
    if (r.entries !== undefined) {
      const lines = r.entries.map((e) =>
        `  id=${e.id ?? '?'} label="${e.label ?? '?'}" menu=${e.menu ?? '?'} isEnabled=${e.isEnabled ?? '?'} isCustomized=${e.isCustomized ?? '?'} fromAmmo=${e.fromAmmo ?? '?'} version=${e.version ?? '?'} animation=${e.animation ?? '?'}`,
      );
      return `module-autoanimations.get-autorec: ${r.totalAvailable ?? 0} matching entr${(r.totalAvailable ?? 0) === 1 ? 'y' : 'ies'} (showing ${r.entries.length}, offset=${r.offset ?? 0}, limit=${r.limit ?? '?'}, truncated=${r.truncated ?? false}):\n${lines.join('\n')}`;
    }
    const c = r.counts ?? {};
    const lines = Object.keys(c).map((k) => `  ${k}: ${c[k]}`);
    return `module-autoanimations.get-autorec: Autorec entries by category (version ${r.version ?? '?'}):\n${lines.join('\n')}`;
  }
  if (action === 'update-autorec-entry') {
    return `module-autoanimations.update-autorec-entry: updated id="${r.id}" (label="${r.label}") in category "${r.category}" (updated=${r.updated}).`;
  }
  if (action === 'remove-autorec-entry') {
    return `module-autoanimations.remove-autorec-entry: removed id="${r.id}" from category "${r.category}" (removed=${r.removed}).`;
  }
  return `module-autoanimations.merge-autorec-entry: added "${r.label}" to category "${r.category}" (added=${r.added}).`;
}

function formatPlay(r: AAPlayResult): string {
  return `module-autoanimations.play-animation: played=${r.played} from token ${r.sourceToken} on ${r.targetCount ?? 0} target(s).`;
}

// Phase 3 (systemic_bug_class_prevention v2, task 5.2, D8): empty-passthrough outputSchema,
// mirroring module-matt's MattMutationOutput/MATT_MUTATION_OUTPUT_JSON_SCHEMA precedent
// (z.object({}).passthrough() run through zodToJsonSchema). Inlined here rather than added to
// shared/src/schemas/mutation-outputs.ts — this task's declared file set is this file +
// apply-npc-career-advance.ts/item-piles.ts/sequencer.ts only.
const AUTOANIMATIONS_MUTATION_OUTPUT_JSON_SCHEMA = {
  type: 'object',
  properties: {},
  additionalProperties: true,
} as const;

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
          // BUG-809: clear-item-animation permanently deletes authored flags and
          // merge-autorec-entry/play-animation mutate world Autorec config / broadcast to
          // clients — matches the destructiveHint:true convention used by every other
          // mixed read/write module-* umbrella (item-piles, matt, mortal-needs, macro-trigger).
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Author Automated Animations (AA) so WFRP4e rolls play JB2A/Sequencer animations.
Conditional: returns MODULE_NOT_ACTIVE (autoanimations) or MODULE_DEPENDENCY_NOT_ACTIVE (sequencer/socketlib) when inactive.
Pre-flight: module-probe.is-active autoanimations before using this tool.

AA fires animations AUTOMATICALLY on every roll once per-item flags or Autorec name-maps exist;
this tool AUTHORS those flags/maps — it does not intercept rolls.

Use this when:
- Wiring a specific Item to a JB2A/Sequencer animation so future rolls with it fire automatically (set-item-animation).
- Bulk-configuring name-based animation matching for a whole item category via the world Autorec map (merge-autorec-entry).
- Browsing the AA animation database to find a valid dbSection/menuType/animation key before authoring a flag.
- Auditing what animation (if any) is currently configured on an Item, or clearing a misconfigured one.
- Manually firing an animation outside of a roll, e.g. for a cutscene beat or GM-narrated moment (play-animation).

9 actions:
PER-ITEM FLAGS:
- get-item-animation  { uuid }                          — read flags.autoanimations from an Item
- set-item-animation  { uuid, animation, confirmedMacro? } — write v5 flags (two-step; forces version:5 + isCustomized:true)
    animation = { menu?, primary:{dbSection,menuType,animation,variant?,color?}, sound?, secondary?, source?, target?, soundOnly?, macro?, meleeSwitch?, fromAmmo? }
    macro.enable:true REQUIRES confirmedMacro:true (AA runs an arbitrary world macro on every roll).
- clear-item-animation { uuid, confirm:true }           — delete flags.autoanimations (verified; confirm-gated, no undo)
DISCOVERY (read-only, needs aa.ready):
- list-animations     { dbSection?, menuType? }         — list AA animation keys (reads aaDatabase tree; AA's namespace is private to Sequencer.searchFor)
AUTOREC (world-level name→animation maps):
- get-autorec            { category?, label?, limit?, offset? } — no filter/pagination param: entry counts per category (melee/range/ontoken/templatefx/aura/preset/aefx). ANY of category/label/limit/offset supplied: bounded, filtered per-entry page instead (id/label/isEnabled/isCustomized/fromAmmo/menu/version/animation summary + totalAvailable/truncated/offset/limit).
- merge-autorec-entry    { category, label, animation, confirmedMacro? } — add ONE name-keyed entry (dup-label rejected; the error names the existing entry's id/label/menu/animation so you can inspect it via get-autorec)
- update-autorec-entry   { category, id, label?, animation?, confirmedMacro?, confirm:true } — patch a stored entry by id (needs ≥1 of label/animation; confirm-gated, previews the entry before the gate; verified + rolled back on a failed re-read)
- remove-autorec-entry   { category, id, confirm:true } — delete a stored entry by id (confirm-gated, previews the entry before the gate; verified + rolled back on a failed re-read)
DIRECTOR:
- play-animation      { sourceTokenUuid, itemUuid|itemName, targetUuids?, confirm:true } — fire a manual animation (no roll)

GM required for all actions. Destructive/transient ops are confirm-gated.

Examples:
- { action: "set-item-animation", uuid: "Actor.x.Item.y", animation: { primary: { dbSection: "melee", menuType: "weapon", animation: "sword", variant: "01", color: "white" } } }
- { action: "merge-autorec-entry", category: "melee", label: "Hand Weapon", animation: { primary: { dbSection: "melee", menuType: "weapon", animation: "sword" } } }
- { action: "update-autorec-entry", category: "melee", id: "abc123", label: "Hand Weapon (renamed)", confirm: true }
- { action: "remove-autorec-entry", category: "melee", id: "abc123", confirm: true }
- { action: "list-animations", dbSection: "melee", menuType: "weapon" }
- { action: "play-animation", sourceTokenUuid: "Scene.s.Token.t", itemName: "Fireball", confirm: true }

Do NOT use this tool expecting it to intercept or replay live combat rolls — AA's automatic playback fires from the flags/Autorec maps THIS tool writes, but the actual roll-to-animation dispatch happens inside AA itself outside MCP's reach; this tool only authors those flags/maps and drives one-off manual plays via play-animation.

Performance Notes:
- get-item-animation/set-item-animation/clear-item-animation/merge-autorec-entry/update-autorec-entry/remove-autorec-entry/play-animation: small fixed-shape responses (a flag record, an add/update/remove/play confirmation) — no pagination.
- get-autorec: the parameterless call returns a small fixed-shape counts-only response; passing ANY of category/label/limit/offset switches to a bounded, paginated per-entry response instead (limit defaults to 50, max 500 — same boundList() convention as item-directory.search) — pass those params to narrow a large Autorec category.
- list-animations: size scales with the aaDatabase subtree matched by dbSection/menuType filters — unfiltered calls can return a large key list; always pass dbSection/menuType to narrow it.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-item-animation', 'set-item-animation', 'clear-item-animation',
                'list-animations', 'get-autorec', 'merge-autorec-entry',
                'update-autorec-entry', 'remove-autorec-entry', 'play-animation',
              ],
            },
            uuid: { type: 'string', description: '[get/set/clear-item-animation] Item document UUID.' },
            animation: { type: 'object', description: '[set-item-animation/merge-autorec-entry] Simplified v5 animation payload — { menu?, primary:{dbSection,menuType,animation,variant?,color?}, sound?, secondary?, source?, target?, soundOnly?, macro?, meleeSwitch?, fromAmmo? }. [update-autorec-entry] Optional — same shape; when supplied, fully replaces the entry\'s animation (need ≥1 of label/animation).' },
            confirmedMacro: { type: 'boolean', description: '[set-item-animation/merge-autorec-entry/update-autorec-entry] Required true when animation.macro.enable is true.' },
            dbSection: { type: 'string', enum: ['melee', 'range', 'return', 'static', 'templatefx'], description: '[list-animations] Filter the animation tree to one section.' },
            menuType: { type: 'string', description: '[list-animations] Filter to one menuType (e.g. "weapon", "spell").' },
            category: { type: 'string', enum: ['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset', 'aefx'], description: '[merge-autorec-entry/update-autorec-entry/remove-autorec-entry] Autorec category to write into. [get-autorec] Optional — scope the filtered read to one category (omit to search all 7).' },
            label: { type: 'string', description: '[merge-autorec-entry] Item-name label to match (whitespace-normalized, case-insensitive). [get-autorec] Optional — substring filter (whitespace-normalized, case-insensitive) against stored entry labels; supplying this (or category/limit/offset) switches the response from counts-only to a filtered per-entry page. [update-autorec-entry] Optional — new label for the entry (need ≥1 of label/animation).' },
            id: { type: 'string', description: '[update-autorec-entry/remove-autorec-entry] The stored entry\'s id (from get-autorec\'s filtered per-entry page or a prior merge-autorec-entry/update-autorec-entry response).' },
            limit: { type: 'number', description: '[get-autorec] Optional — max entries per filtered page (default 50, max 500). Supplying this (with or without category/label) switches the response from counts-only to a filtered per-entry page.' },
            offset: { type: 'number', description: '[get-autorec] Optional — page offset into the filtered entry set (default 0).' },
            sourceTokenUuid: { type: 'string', description: '[play-animation] Source token UUID.' },
            itemUuid: { type: 'string', description: '[play-animation] Item UUID to route the animation (or use itemName).' },
            itemName: { type: 'string', description: '[play-animation] Item name for Autorec-only lookup (or use itemUuid).' },
            targetUuids: { type: 'array', items: { type: 'string' }, description: '[play-animation] Target token UUIDs (empty array = no targets, avoids silent game.user.targets fallback).' },
            confirm: { type: 'boolean', description: '[play-animation] Required true (transient effect, no undo). [clear-item-animation] Required true — permanently deletes the item\'s animation config (no undo); omit/false returns CONFIRM_REQUIRED with a preview of what would be deleted. [update-autorec-entry/remove-autorec-entry] Required true — omit/false returns CONFIRM_REQUIRED with a preview of the entry that would be changed/deleted; a failed post-write verify auto-restores the pre-write category array.' },
          },
          required: ['action'],
          // BUG-808 (D1 — tighten in place, never anyOf): per-branch required sets generated
          // from ModuleAutoAnimationsInput's own Zod discriminated union.
          allOf: [
            { if: { properties: { action: { const: 'get-item-animation' } } }, then: { required: ['uuid'] } },
            { if: { properties: { action: { const: 'set-item-animation' } } }, then: { required: ['animation', 'uuid'] } },
            { if: { properties: { action: { const: 'clear-item-animation' } } }, then: { required: ['uuid'] } },
            { if: { properties: { action: { const: 'merge-autorec-entry' } } }, then: { required: ['animation', 'category', 'label'] } },
            { if: { properties: { action: { const: 'update-autorec-entry' } } }, then: { required: ['category', 'id'] } },
            { if: { properties: { action: { const: 'remove-autorec-entry' } } }, then: { required: ['category', 'id'] } },
            { if: { properties: { action: { const: 'play-animation' } } }, then: { required: ['sourceTokenUuid'] } },
          ],
        },
        outputSchema: AUTOANIMATIONS_MUTATION_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async execute(args: ModuleAutoAnimationsArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-autoanimations action', { action });
    try {
      const data = await this.query<AAResult>('module-autoanimations', args);
      let text: string;
      if (['get-item-animation', 'set-item-animation', 'clear-item-animation'].includes(action)) {
        text = formatItem(data as AAItemResult, action);
      } else if (action === 'list-animations') {
        text = formatList(data as AAListResult);
      } else if (
        action === 'get-autorec' || action === 'merge-autorec-entry'
        || action === 'update-autorec-entry' || action === 'remove-autorec-entry'
      ) {
        text = formatAutorec(data as AAAutorecResult, action);
      } else {
        text = formatPlay(data as AAPlayResult);
      }
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE) || msg.includes(ErrorTokens.MODULE_DEPENDENCY_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-autoanimations', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
