// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 2 — MATT action catalog (single validation source).
//
// Pure, unit-testable. Derived from the source-verified audit
// (.agents/research/module_integration/capability_audit/monks-active-tiles.md §3/§4/§13).
// No Foundry globals are touched here — this file is the catalog + validate-sequence logic
// that both the handler dispatch and the Vitest suite consume.
//
// Validation standard (dossier §3): strict-ish Zod for the high-value/dangerous actions
// (STRICT_ACTION_DATA) + catalog-validated raw-with-warning for the long tail. No unvalidated
// arbitrary data:{} without the catalog gating the action key + required fields.

import { z } from 'zod';

// ── Trigger modes (24) — audit §3 (monks-active-tiles.js:141 getter) ──────────

export const TRIGGER_MODES = [
  'enter', 'exit', 'movement', 'stop', 'elevation', 'rotation', 'click', 'rightclick',
  'dblclick', 'dblrightclick', 'create', 'hoverin', 'hoverout', 'combatstart', 'round',
  'turn', 'turnend', 'combatend', 'ready', 'manual', 'door', 'darkness', 'lighting', 'time',
] as const;

export type TriggerMode = (typeof TRIGGER_MODES)[number];

// Deprecated aliases still accepted by getTrigger() (audit §3) — author with the modern pair.
export const DEPRECATED_TRIGGER_ALIASES: ReadonlySet<string> = new Set(['both', 'hover']);

const TRIGGER_SET: ReadonlySet<string> = new Set(TRIGGER_MODES);

export function isKnownTrigger(key: string): boolean {
  return TRIGGER_SET.has(key);
}

// ── Action catalog (77 native keys across 3 groups) — audit §4 + BUG-333/BUG-757 ──
// BUG-757: 'animate' removed — its entire actions.js block (~1954-2018) is dead,
// block-commented source, never registered with MATT's live action registry. BUG-333
// (2026-06-10) incorrectly treated the commented-out source text as a live registration;
// this is the confirmed regression fix.

export interface ActionSpec {
  /** MATT action group. */
  group: 'actions' | 'logic' | 'filters';
  /** SUPPORTED_WITH_CONFIRMATION — author/fire requires confirm:true (audit §13). */
  danger: boolean;
  /** No WFRP4e adapter — authorable raw, warned (audit §16 / actions.js:4568). */
  repairGated?: boolean;
  /** Best-effort required data field keys (audit §4); enforced by validateSequence. */
  required?: string[];
  /** Alternative required fields for source-valid aliases (e.g. entity OR macroid). */
  requiredAny?: string[];
}

// danger = audit §2 SUPPORTED_WITH_CONFIRMATION set (8) + attack (REPAIR_GATED, also dangerous).
// NOTE: globalvolume is SUPPORTED in audit §2 (not SWC); the plan's 2C.3 list mentioned it but the
// source-verified audit governs (Rule 7). It is NOT marked danger here.
export const ACTION_CATALOG: Record<string, ActionSpec> = {
  // group: actions
  pause: { group: 'actions', danger: false, required: ['pause'] },
  delay: { group: 'actions', danger: false, required: ['delay'] },
  movement: { group: 'actions', danger: false },
  pancanvas: { group: 'actions', danger: false, required: ['location'] },
  ping: { group: 'actions', danger: false, required: ['location'] },
  teleport: { group: 'actions', danger: false, required: ['entity', 'location'] },
  movetoken: { group: 'actions', danger: false, required: ['entity', 'location'] },
  rotation: { group: 'actions', danger: false, required: ['entity', 'rotation'] },
  showhide: { group: 'actions', danger: false, required: ['entity', 'hidden'] },
  create: { group: 'actions', danger: false, required: ['entity'] },
  createjournal: { group: 'actions', danger: false, required: ['name'] },
  activate: { group: 'actions', danger: false, required: ['entity', 'activate'] },
  alter: { group: 'actions', danger: false, required: ['entity', 'attribute', 'value'] },
  tempimage: { group: 'actions', danger: false, required: ['entity', 'img'] },
  hurtheal: { group: 'actions', danger: false, required: ['entity', 'value'] },
  playsound: { group: 'actions', danger: false, required: ['src'] },
  playlist: { group: 'actions', danger: false, required: ['entity', 'action'] },
  stopsound: { group: 'actions', danger: false },
  showimage: { group: 'actions', danger: false, required: ['img'] },
  changedoor: { group: 'actions', danger: false, required: ['entity', 'state'] },
  notification: { group: 'actions', danger: false, required: ['text'] },
  chatmessage: { group: 'actions', danger: false, required: ['text'] },
  runmacro: { group: 'actions', danger: true, requiredAny: ['entity', 'macroid', 'macroUuid'] },
  runcode: { group: 'actions', danger: true, required: ['code'] },
  rolltable: { group: 'actions', danger: false, required: ['rolltable'] },
  resetfog: { group: 'actions', danger: true },
  // BUG-748: native MATT `activeeffect` reads `effectid` (CONFIG.statusEffects id) + optional
  // `addeffect` ('add'|'remove'|'toggle', defaults to 'add') — verified against
  // monks-active-tiles/actions.js:3660-3690 (`token.object.toggleEffect(effect, {overlay:false})`).
  // There is no `effect`/`action` field pair; that was a fictional arbitrary-AE-UUID contract.
  activeeffect: { group: 'actions', danger: false, required: ['entity', 'effectid'] },
  playanimation: { group: 'actions', danger: false, required: ['entity'] },
  openjournal: { group: 'actions', danger: false, required: ['entity'] },
  openactor: { group: 'actions', danger: false, required: ['entity'] },
  additem: { group: 'actions', danger: false, required: ['entity', 'item'] },
  removeitem: { group: 'actions', danger: false, required: ['entity', 'item'] },
  permissions: { group: 'actions', danger: true, required: ['entity', 'permission'] },
  attack: { group: 'actions', danger: true, repairGated: true, required: ['entity'] },
  trigger: { group: 'actions', danger: false, required: ['entity'] },
  scene: { group: 'actions', danger: true, requiredAny: ['entity', 'sceneid'] },
  scenebackground: { group: 'actions', danger: false, required: ['entity', 'img'] },
  addtocombat: { group: 'actions', danger: false, required: ['entity'] },
  elevation: { group: 'actions', danger: false, required: ['entity', 'value'] },
  resethistory: { group: 'actions', danger: false, required: ['entity'] },
  preloadtileimage: { group: 'actions', danger: false, required: ['entity'] },
  tileimage: { group: 'actions', danger: false, required: ['entity'] },
  delete: { group: 'actions', danger: true, required: ['entity'] },
  target: { group: 'actions', danger: false, required: ['entity'] },
  scenelighting: { group: 'actions', danger: false, required: ['darkness'] },
  globalvolume: { group: 'actions', danger: false, required: ['type', 'volume'] },
  gametime: { group: 'actions', danger: true, required: ['time'] },
  dialog: { group: 'actions', danger: false, required: ['content'] },
  closedialog: { group: 'actions', danger: false },
  scrollingtext: { group: 'actions', danger: false, required: ['entity', 'content'] },
  preload: { group: 'actions', danger: false, required: ['entity'] },
  append: { group: 'actions', danger: false, required: ['entity', 'text'] },
  // group: logic
  runbatch: { group: 'logic', danger: false },
  checkdata: { group: 'logic', danger: false, required: ['attribute', 'value'] },
  playertype: { group: 'logic', danger: false },
  method: { group: 'logic', danger: false, required: ['method'] },
  anchor: { group: 'logic', danger: false, required: ['tag'] },
  goto: { group: 'logic', danger: false, required: ['tag'] },
  loop: { group: 'logic', danger: false, required: ['entity'] },
  stop: { group: 'logic', danger: false },
  stoptriggers: { group: 'logic', danger: false },
  setvariable: { group: 'logic', danger: false, required: ['entity', 'name', 'value'] },
  setcurrent: { group: 'logic', danger: false, required: ['entity'] },
  shuffle: { group: 'logic', danger: false, required: ['entity'] },
  url: { group: 'logic', danger: true, required: ['src'] },
  // group: filters
  distance: { group: 'filters', danger: false, required: ['entity'] },
  visibility: { group: 'filters', danger: false, required: ['entity'] },
  exists: { group: 'filters', danger: false, required: ['entity'] },
  triggercount: { group: 'filters', danger: false, required: ['count'] },
  tokencount: { group: 'filters', danger: false, required: ['count'] },
  first: { group: 'filters', danger: false, required: ['entity'] },
  attribute: { group: 'filters', danger: false, required: ['entity', 'attribute'] },
  inventory: { group: 'filters', danger: false, required: ['entity', 'item'] },
  condition: { group: 'filters', danger: false, required: ['entity', 'effectid'] },
  random: { group: 'filters', danger: false, required: ['number'] },
  checkvariable: { group: 'filters', danger: false, required: ['name'] },
  checkvalue: { group: 'filters', danger: false, required: ['name'] },
};

export const ACTION_KEYS = Object.keys(ACTION_CATALOG);

export function isKnownAction(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(ACTION_CATALOG, key);
}

export function getActionSpec(key: string): ActionSpec | undefined {
  return ACTION_CATALOG[key];
}

/** A third-party registered action key is `namespace.actionname` (audit §11). */
export function isThirdPartyActionKey(key: string): boolean {
  return key.includes('.');
}

export function isDangerousAction(key: string): boolean {
  return ACTION_CATALOG[key]?.danger === true || ACTION_CATALOG[key]?.repairGated === true;
}

// ── Strict Zod for the high-value / dangerous actions (dossier §3) ────────────
// .passthrough() keeps the long-tail fields; the required fields above + these refine
// the actions a GM most commonly mis-authors or that carry the most risk.

const entityField = z.union([z.string(), z.record(z.unknown())]);

export const STRICT_ACTION_DATA: Record<string, z.ZodTypeAny> = {
  teleport: z.object({ entity: entityField, location: z.union([z.string(), z.record(z.unknown())]) }).passthrough(),
  movetoken: z.object({ entity: entityField, location: z.union([z.string(), z.record(z.unknown())]) }).passthrough(),
  hurtheal: z.object({ entity: entityField, value: z.union([z.string(), z.number()]) }).passthrough(),
  alter: z.object({ entity: entityField, attribute: z.string(), value: z.union([z.string(), z.number()]) }).passthrough(),
  runcode: z.object({ code: z.string().min(1) }).passthrough(),
  runmacro: z
    .object({
      entity: entityField.optional(),
      macroid: z.string().min(1).optional(),
      macroUuid: z.string().min(1).optional(),
    })
    .passthrough()
    .refine((d) => d.entity != null || d.macroid != null || d.macroUuid != null, {
      message: 'runmacro requires one of entity, macroid, or macroUuid',
    }),
  delete: z.object({ entity: entityField }).passthrough(),
  scene: z
    .object({ entity: entityField.optional(), sceneid: z.string().min(1).optional() })
    .passthrough()
    .refine((d) => d.entity != null || d.sceneid != null, {
      message: 'scene requires one of entity or sceneid',
    }),
  permissions: z.object({ entity: entityField, permission: z.union([z.string(), z.number()]) }).passthrough(),
  changedoor: z.object({ entity: entityField, state: z.string() }).passthrough(),
  activeeffect: z.object({ entity: entityField, effectid: z.string().min(1), addeffect: z.enum(['add', 'remove', 'toggle']).optional() }).passthrough(),
};

// ── makeid — MATT's 16-char alphanumeric action id (monks-active-tiles.js:35) ──

const MAKEID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function makeMattId(): string {
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += MAKEID_CHARS.charAt(Math.floor(Math.random() * MAKEID_CHARS.length));
  }
  return id;
}

// ── validate-sequence (pure) ──────────────────────────────────────────────────

export interface MattActionInput {
  id?: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface SequenceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  /** Action keys in the sequence that require confirm:true (danger/repair). */
  dangerous: string[];
  /** anchor tags defined in the sequence (for goto resolution). */
  anchors: string[];
}

/**
 * Validate a full ordered MATT action sequence against the catalog.
 *
 * - unknown action key (no namespace dot) → error
 * - third-party key (namespace.action) → warning (can't verify schema; raw-with-warning)
 * - missing required field → error
 * - strict-typed action with malformed data → error (Zod message)
 * - goto whose tag has no matching anchor in this sequence → warning (anchor may be elsewhere)
 * - dangerous/repair-gated action present → recorded in `dangerous`
 */
export function validateSequence(actions: MattActionInput[]): SequenceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dangerous: string[] = [];
  const anchors: string[] = [];

  if (!Array.isArray(actions)) {
    return { valid: false, errors: ['actions must be an array'], warnings, dangerous, anchors };
  }

  // First pass — collect anchor tags.
  for (const a of actions) {
    if (a?.action === 'anchor' && typeof a.data?.tag === 'string') {
      anchors.push(a.data.tag as string);
    }
  }

  actions.forEach((a, idx) => {
    const where = `actions[${idx}]`;
    if (!a || typeof a.action !== 'string' || a.action.length === 0) {
      errors.push(`${where}: missing "action" key`);
      return;
    }
    const key = a.action;

    if (!isKnownAction(key)) {
      if (isThirdPartyActionKey(key)) {
        warnings.push(`${where}: "${key}" is a third-party/registered action — schema not source-verified; authored raw (DEPENDENCY_GATED on its module).`);
      } else {
        errors.push(`${where}: unknown action "${key}" (not in the built-in catalog).`);
      }
      return;
    }

    const spec = ACTION_CATALOG[key]!;
    const data = (a.data ?? {}) as Record<string, unknown>;

    // Required-field check.
    for (const req of spec.required ?? []) {
      if (!hasPresent(data, req)) {
        errors.push(`${where}: action "${key}" missing required data field "${req}".`);
      }
    }
    if (spec.requiredAny && !spec.requiredAny.some((req) => hasPresent(data, req))) {
        errors.push(
          `${where}: action "${key}" missing required data field alternative (${spec.requiredAny.join(' or ')}).`,
        );
    }

    // Strict Zod for high-value actions.
    const strict = STRICT_ACTION_DATA[key];
    if (strict) {
      const parsed = strict.safeParse(data);
      if (!parsed.success) {
        errors.push(`${where}: action "${key}" data invalid — ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }
    }

    if (spec.repairGated) {
      warnings.push(`${where}: action "${key}" is REPAIR_GATED — no WFRP4e adapter; will fire generic or error at runtime.`);
    }
    if (spec.danger || spec.repairGated) {
      dangerous.push(key);
    }
  });

  // Second pass — goto/anchor resolution.
  actions.forEach((a, idx) => {
    if (a?.action === 'goto' && typeof a.data?.tag === 'string') {
      const tag = a.data.tag as string;
      if (!anchors.includes(tag)) {
        warnings.push(`actions[${idx}]: goto target "${tag}" has no matching anchor in this sequence (may be defined elsewhere).`);
      }
    }
  });

  return { valid: errors.length === 0, errors, warnings, dangerous, anchors };
}

function hasPresent(data: Record<string, unknown>, key: string): boolean {
  return data[key] !== undefined && data[key] !== null && data[key] !== '';
}
