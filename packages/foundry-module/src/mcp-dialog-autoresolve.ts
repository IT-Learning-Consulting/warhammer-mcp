// MCP dialog auto-resolve net — BUG-242.
//
// While an MCP request is in flight (isMcpActive() > 0), intercepts
// warhammer.apps.ItemDialog.create / createFromFilters / ValueDialog.create
// so they resolve deterministically instead of rendering a blocking UI dialog.
// Outside MCP activity (counter = 0) the originals run unchanged.
//
// WHY a dialog-layer net rather than per-talent pre-naming: catches every
// current, future, and homebrew spec-choice dialog generically, including
// apply-npc-career-advance and inline Actor.create clones that have no MCP
// injection point. Non-interference is structural: already-correct flows
// (encounter-builder, build-spellcaster, skipSpecialisationChoice) suppress
// their dialogs before creation — the net is never reached for them.
//
// GM-visibility layer: because the net picks SILENTLY (a deterministic first
// pick can be wrong, e.g. Size→Minimal on a Giant), every auto-resolved choice
// is recorded and surfaced to the GM as ONE aggregated notify.warn per MCP
// request (console + sticky popup + GM-whispered chat) asking them to verify.
// Aggregation uses the mcp-activity drain boundary so a single apply-template
// that resolves N dialogs emits one notice, not N toasts.

import { MODULE_ID } from './constants.js';
import { isMcpActive, onMcpActivityDrained, getMcpRequestContext } from './mcp-activity.js';
import { notify } from './notify.js';

// Module-level override map: consulted before the deterministic default.
// Keys are dialog titles; values are item ids or names to prefer.
// Capability only — no skill body wires to this in the current plan.
const choiceOverrides = new Map<string, string>();

/** Set caller overrides: keyed by dialog title, value = item id or name. */
export function setDialogChoiceOverrides(map: Record<string, string>): void {
  choiceOverrides.clear();
  for (const [k, v] of Object.entries(map)) {
    choiceOverrides.set(k, v);
  }
}

/** Clear all caller-supplied overrides, reverting to the deterministic default. */
export function clearDialogChoiceOverrides(): void {
  choiceOverrides.clear();
}

// ----------------------------------------------------------------------------
// GM-visibility: surface every silent auto-resolve once the MCP request
// finishes, so the GM can catch a wrong deterministic pick (the canonical
// foot-gun: Size→Minimal stamped on a Giant) instead of discovering it later.
//
// The dialog wrapper can only see the choice OPTIONS, not which talent/skill/
// trait triggered the dialog (wfrp4e fires it from an immediate AE script bound
// to the item — wfrp4e.js:22182/28499 — invisible to a static interceptor).
// So we use TWO signals: the wrapper records the auto-PICK (proof the net
// chose), and a createItem hook reads the item the script renamed to
// "Base (Choice)" — giving the type, the base name, AND the owning actor for a
// clickable @UUID link.  Correlated by pick⊂name so only net-resolved items
// (not pre-resolved build-skill siblings) are reported.
// ----------------------------------------------------------------------------

/** One enriched auto-resolved choice: what was modified, the pick, and on whom. */
export interface ResolvedChoice {
  actorUuid?: string | undefined;
  actorName?: string | undefined;
  type: string; // talent | skill | trait
  base: string; // e.g. "Strider"
  choice: string; // e.g. "Coastal"
}

// Picks the net made this request (chosen item name / ValueDialog value). The
// proof a dialog was auto-resolved; correlated to created items below.
const pendingPicks: string[] = [];
// Enriched choices ready for the GM notice (filled by the createItem hook).
const resolvedChoices: ResolvedChoice[] = [];

/** Best-effort display name for one ItemDialog entry (name → id → string). */
function toItemName(p: any): string {
  return typeof p === 'string' ? p : p?.name ?? p?.id ?? String(p);
}

/** Record a value the net auto-picked (chosen item name or ValueDialog value). */
export function recordAutoResolvePick(pick: string): void {
  if (pick) pendingPicks.push(pick);
}

/** Test access: snapshot the pending picks without draining. */
export function peekPendingPicks(): string[] {
  return [...pendingPicks];
}

/** Minimal HTML escape for dynamic text placed into the chat notice body. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Correlate a freshly-created spec item with a pending pick and capture it for
 * the GM notice.  Only talent/skill/trait items whose final name contains a
 * pending pick are taken (so pre-resolved build-skill items, which never opened
 * a dialog, are ignored).  Exported for unit testing.
 *
 * @returns true if the item matched a pick and was captured.
 */
export function correlateCreatedItem(item: {
  type?: string;
  name?: string;
  parent?: { uuid?: string; name?: string } | null;
}): boolean {
  if (pendingPicks.length === 0) return false;
  const type = item?.type ?? '';
  if (type !== 'talent' && type !== 'skill' && type !== 'trait') return false;
  const name = item?.name ?? '';
  const idx = pendingPicks.findIndex((p) => p && name.includes(p));
  if (idx === -1) return false;
  const pick = pendingPicks.splice(idx, 1)[0]!;
  const m = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  resolvedChoices.push({
    actorUuid: item?.parent?.uuid,
    actorName: item?.parent?.name,
    type,
    base: m ? m[1]!.trim() : name,
    choice: m ? m[2]!.trim() : pick,
  });
  return true;
}

/** Drain everything buffered this request (pure; testable). */
export function consumeAutoResolveResults(): { resolved: ResolvedChoice[]; leftover: string[] } {
  return {
    resolved: resolvedChoices.splice(0, resolvedChoices.length),
    leftover: pendingPicks.splice(0, pendingPicks.length),
  };
}

/**
 * Build the plain (toast/console) + chat-HTML notice bodies from buffered
 * results.  Pure + exported so the message shape is unit-tested without
 * Foundry.  Returns null when nothing was auto-resolved.
 *
 * Format (matches the GM's request): names what was modified and the pick —
 *   "[talent] Strider → Coastal" — on a clickable actor link, "via <op>".
 */
export function buildAutoResolveNotice(
  resolved: ResolvedChoice[],
  leftover: string[],
  method?: string
): { plain: string; chatHtml: string } | null {
  const n = resolved.length + leftover.length;
  if (n === 0) return null;
  const op = method ? ` via ${method}` : '';
  const actorName = resolved.find((r) => r.actorName)?.actorName;
  const actorUuid = resolved.find((r) => r.actorUuid)?.actorUuid;

  const plainLines = [
    ...resolved.map((r) => `[${r.type}] ${r.base} → ${r.choice}`),
    ...leftover.map((p) => `auto-picked "${p}"`),
  ];
  const htmlLines = [
    ...resolved.map(
      (r) => `[${escapeHtml(r.type)}] <strong>${escapeHtml(r.base)}</strong> → <strong>${escapeHtml(r.choice)}</strong>`
    ),
    ...leftover.map((p) => `auto-picked "${escapeHtml(p)}"`),
  ];

  const whoPlain = actorName ? `"${actorName}"` : 'an actor';
  // @UUID without a {label} renders the doc's live name as a clickable link in
  // chat (and dodges escaping the name); plain channels use the readable name.
  const whoHtml = actorUuid ? `@UUID[${actorUuid}]` : actorName ? `"${escapeHtml(actorName)}"` : 'an actor';

  const head = (who: string): string =>
    `Auto-resolved ${n} dialog choice${n === 1 ? '' : 's'} on ${who}${op} — GM please verify`;

  return {
    plain: `${head(whoPlain)}: ${plainLines.join('; ')}`,
    chatHtml: `${head(whoHtml)}: ${htmlLines.join('; ')}`,
  };
}

/**
 * Flush the buffered auto-resolve results as ONE GM notice (console + sticky
 * popup + GM-whispered chat record with a clickable actor link).  Runs on the
 * mcp-activity drain boundary so a multi-dialog apply-template emits one notice.
 */
export function flushAutoResolveNotices(): void {
  const { resolved, leftover } = consumeAutoResolveResults();
  const ctx = getMcpRequestContext();
  const notice = buildAutoResolveNotice(resolved, leftover, ctx?.method);
  if (!notice) return;
  try {
    // sticky: keep the popup until dismissed; chat: durable GM record; chatHtml
    // carries the @UUID actor link + markup the plain toast label can't.
    notify.warn(notice.plain, { sticky: true, chat: true, chatHtml: notice.chatHtml });
  } catch (err) {
    console.warn(`[${MODULE_ID}] dialog auto-resolve: GM notice flush failed`, err);
  }
}

/**
 * Normalize the items argument accepted by ItemDialog.create to a plain array.
 * Mirrors the normalization the class performs internally.
 */
function normalizeItemsToArray(ItemDialogClass: any, items: any): any[] {
  if (Array.isArray(items)) return items;
  if (!items) return [];
  // Foundry Collection: has a .contents array property
  if (Array.isArray((items as any).contents)) return (items as any).contents as any[];
  // Plain object → use the class's static helper when available (produces {id, name, img} entries)
  if (typeof ItemDialogClass?.objectToArray === 'function') {
    return (ItemDialogClass.objectToArray(items) as any[]) ?? [];
  }
  // Last resort: Object.values (items are likely string display-values)
  if (typeof items === 'object') return Object.values(items as Record<string, any>);
  return [];
}

/**
 * Deterministic item pick — no Foundry globals required.  Exported for unit testing.
 *
 * WHY: first-N pick ensures reproducible evals without blocking the UI.
 * "unlimited" → [] never over-adds optional qualities/traits.
 * Override by title gives deliberate builds a specific specialisation channel.
 */
export function pickItemDialogResult(
  items: any[],
  count: number | 'unlimited',
  overrides: Map<string, string>,
  title?: string
): any[] {
  // Caller-override by dialog title takes precedence over the deterministic default
  if (title && overrides.has(title)) {
    const val = overrides.get(title)!;
    const match = items.find((i: any) => i?.id === val || i?.name === val);
    if (match) return [match];
    // Override id not found → fall through to default
  }
  // "unlimited" means optional additions — never invent arbitrary content
  if (count === 'unlimited') return [];
  // Required count: first N items (deterministic, reproducible)
  const n = typeof count === 'number' ? count : 1;
  if (n <= 0 || items.length === 0) return [];
  return items.slice(0, n);
}

/**
 * Deterministic value pick — no Foundry globals required.  Exported for unit testing.
 *
 * WHY: defaultValue/first-key/empty-string ordering provides a sensible resolution
 * without leaving the promise pending indefinitely.
 */
export function pickValueDialogResult(
  defaultValue: string,
  values: Record<string, any>,
  overrides: Map<string, string>,
  title?: string
): string {
  // Caller-override by dialog title takes precedence
  if (title && overrides.has(title)) return overrides.get(title)!;
  if (defaultValue) return defaultValue;
  const firstKey = Object.keys(values ?? {})[0];
  return firstKey ?? '';
}

/**
 * Factory that wraps an ItemDialog.create-compatible function with the auto-resolve gate.
 * Uses the module-level choiceOverrides map (affected by setDialogChoiceOverrides).
 * Exported for unit testing: inject a mock activeCheck to exercise the gate.
 */
export function createItemDialogWrapper(
  original: (...args: any[]) => Promise<any[]>,
  activeCheck: () => boolean,
  ItemDialogClass?: any
): (...args: any[]) => Promise<any[]> {
  return async function wrappedItemDialogCreate(items: any, count: any = 1, opts: any = {}): Promise<any[]> {
    if (!activeCheck()) return original(items, count, opts);
    try {
      const itemsArr = normalizeItemsToArray(ItemDialogClass, items);
      const picks = pickItemDialogResult(itemsArr, count, choiceOverrides, opts?.title);
      for (const p of picks) recordAutoResolvePick(toItemName(p));
      return picks;
    } catch (err) {
      console.warn(`[${MODULE_ID}] dialog auto-resolve: ItemDialog.create error — falling back`, err);
      return original(items, count, opts);
    }
  };
}

/**
 * Register the MCP dialog auto-resolve net.
 *
 * Runs at ready so warhammer.apps is populated.  Guarded by an availability
 * check so a warhammer-lib update that moves the namespace can't crash the module.
 */
export function registerMcpDialogAutoResolve(): void {
  Hooks.once('ready', () => {
    try {
      const wh = (globalThis as any).warhammer;
      if (!wh?.apps?.ItemDialog) {
        console.warn(`[${MODULE_ID}] dialog auto-resolve: warhammer.apps.ItemDialog unavailable; skipping`);
        return;
      }

      const ItemDialog = wh.apps.ItemDialog;
      const ValueDialog = wh.apps.ValueDialog;

      // Capture originals before replacing so the delegate path always works
      const origCreate: (...args: any[]) => Promise<any[]> = ItemDialog.create.bind(ItemDialog);
      const origCreateFromFilters: (...args: any[]) => Promise<any[]> = ItemDialog.createFromFilters.bind(ItemDialog);
      const origValueCreate: ((...args: any[]) => Promise<string>) | undefined =
        ValueDialog?.create ? (ValueDialog.create.bind(ValueDialog) as (...args: any[]) => Promise<string>) : undefined;

      // Surface every silent auto-resolve to the GM once the MCP request drains
      onMcpActivityDrained(flushAutoResolveNotices);

      // Correlate the renamed spec item ("Strider (Coastal)") back to its pick so
      // the GM notice can name what was modified + the actor it landed on.
      Hooks.on('createItem', (item: any) => {
        if (!isMcpActive()) return;
        try {
          correlateCreatedItem(item);
        } catch (err) {
          console.warn(`[${MODULE_ID}] dialog auto-resolve: createItem correlation failed`, err);
        }
      });

      // Replace ItemDialog.create via the exported factory (testable gate)
      ItemDialog.create = createItemDialogWrapper(origCreate, isMcpActive, ItemDialog);

      // Replace ItemDialog.createFromFilters: resolve the item list then auto-pick
      ItemDialog.createFromFilters = async function (filters: any, count: any, opts: any = {}): Promise<any[]> {
        if (!isMcpActive()) return origCreateFromFilters(filters, count, opts);
        try {
          const items: any[] = (await (ItemDialog.filterItems as (f: any, i: any) => Promise<any[]>)(
            filters,
            opts?.items
          )) ?? [];
          const picks = pickItemDialogResult(items, count, choiceOverrides, opts?.title);
          for (const p of picks) recordAutoResolvePick(toItemName(p));
          return picks;
        } catch (err) {
          console.warn(`[${MODULE_ID}] dialog auto-resolve: ItemDialog.createFromFilters error — falling back`, err);
          return origCreateFromFilters(filters, count, opts);
        }
      };

      // Replace ValueDialog.create
      if (origValueCreate) {
        ValueDialog.create = async function (
          obj: { text?: string; title?: string } = {},
          defaultValue = '',
          values: Record<string, any> = {},
          options: Record<string, any> = {}
        ): Promise<string> {
          const { title } = obj ?? {};
          if (!isMcpActive()) return origValueCreate(obj, defaultValue, values, options);
          try {
            const value = pickValueDialogResult(defaultValue ?? '', values ?? {}, choiceOverrides, title);
            if (value) recordAutoResolvePick(value);
            return value;
          } catch (err) {
            console.warn(`[${MODULE_ID}] dialog auto-resolve: ValueDialog.create error — falling back`, err);
            return origValueCreate(obj, defaultValue, values, options);
          }
        };
      }
    } catch (err) {
      console.warn(`[${MODULE_ID}] dialog auto-resolve: ready-hook setup failed`, err);
    }
  });
}
