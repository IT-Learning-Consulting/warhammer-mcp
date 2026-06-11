// Module Integration v1 Phase 2 — unit tests for the MATT action catalog + validate-sequence.
//
// Pure logic — no Foundry globals, no world-churn. Encodes WHY each rule matters (Rule 9):
// the catalog is the single validation source for every authored/fired MATT sequence, so a
// silent gap here means unvalidated data:{} reaches a live tile (the exact risk the dossier §3
// validation standard exists to prevent).

import { describe, it, expect } from 'vitest';
import {
  ACTION_CATALOG,
  ACTION_KEYS,
  TRIGGER_MODES,
  isKnownAction,
  isKnownTrigger,
  isDangerousAction,
  validateSequence,
  makeMattId,
} from '../action-catalog.js';
import { normalizeActions } from '../matt.js';

describe('MATT action catalog — completeness (parity target, dossier §8)', () => {
  it('exposes the 78 source-verified native built-in actions', () => {
    // Why: HC9 capability-complete — under-counting silently drops authorable actions.
    // animate (actions.js:1955) re-verified live in MATT v13.06 — 2026-06-10 audit (BUG-333).
    expect(ACTION_KEYS.length).toBe(78);
    expect(isKnownAction('append')).toBe(true);
    expect(isKnownAction('permissions')).toBe(true);
    expect(isKnownAction('tokencount')).toBe(true);
    expect(isKnownAction('animate')).toBe(true);
  });

  it('exposes all 24 trigger modes (zero missing — audit §3)', () => {
    expect(TRIGGER_MODES.length).toBe(24);
    // A representative spread across the cache buckets.
    for (const t of ['enter', 'click', 'turn', 'ready', 'manual', 'darkness', 'time', 'door']) {
      expect(isKnownTrigger(t)).toBe(true);
    }
  });

  it('every action has a group in {actions, logic, filters}', () => {
    for (const key of ACTION_KEYS) {
      expect(['actions', 'logic', 'filters']).toContain(ACTION_CATALOG[key].group);
    }
  });

  it('flags the audit §13 dangerous actions as confirm-gated', () => {
    // Why: these author/fire destructive or arbitrary-code effects; missing the flag = no confirm gate.
    for (const k of ['runcode', 'runmacro', 'delete', 'permissions', 'resetfog', 'scene', 'gametime', 'url']) {
      expect(isDangerousAction(k)).toBe(true);
    }
    // attack is REPAIR_GATED — also dangerous.
    expect(isDangerousAction('attack')).toBe(true);
    // A benign action is NOT gated.
    expect(isDangerousAction('chatmessage')).toBe(false);
  });
});

describe('validateSequence — the write/fire gate', () => {
  it('accepts a valid ordered sequence (anchor/goto loop resolves)', () => {
    const r = validateSequence([
      { action: 'anchor', data: { tag: 'loop-start' } },
      { action: 'chatmessage', data: { text: 'tick' } },
      { action: 'delay', data: { delay: '1' } },
      { action: 'goto', data: { tag: 'loop-start' } },
    ]);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
    expect(r.anchors).toContain('loop-start');
    // goto resolves to a defined anchor → no warning about it.
    expect(r.warnings.filter((w) => w.includes('goto target'))).toHaveLength(0);
  });

  it('rejects an unknown built-in action key by name', () => {
    // Why: a typo'd action key would otherwise be written to a tile and silently never fire.
    const r = validateSequence([{ action: 'telyport', data: {} }]);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('unknown action "telyport"'))).toBe(true);
  });

  it('rejects a known action missing a required data field', () => {
    // Why: teleport without a location is a no-op trap that wastes a session debugging.
    const r = validateSequence([{ action: 'teleport', data: { entity: 'token' } }]);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('missing required data field "location"'))).toBe(true);
  });

  it('records dangerous actions for the confirm gate', () => {
    const r = validateSequence([
      { action: 'chatmessage', data: { text: 'hi' } },
      { action: 'runcode', data: { code: 'console.log(1)' } },
      { action: 'delete', data: { entity: 'token' } },
    ]);
    expect(r.valid).toBe(true); // valid shape — but dangerous, so the handler must gate on confirm.
    expect(r.dangerous).toEqual(expect.arrayContaining(['runcode', 'delete']));
  });

  it('passes a third-party namespaced action with a warning (raw-with-warning long tail)', () => {
    // Why: registered actions (e.g. forien-quest-log.openquest) can't be source-validated, but must
    // not hard-fail — they are authored raw with an explicit DEPENDENCY_GATED warning.
    const r = validateSequence([{ action: 'forien-quest-log.openquest', data: { quest: 'abc' } }]);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
    expect(r.warnings.some((w) => w.includes('third-party/registered action'))).toBe(true);
  });

  it('warns when a goto targets an anchor that is not in the sequence', () => {
    const r = validateSequence([{ action: 'goto', data: { tag: 'nowhere' } }]);
    expect(r.warnings.some((w) => w.includes('goto target "nowhere"'))).toBe(true);
  });

  it('rejects malformed strict-typed action data (runcode without code)', () => {
    const r = validateSequence([{ action: 'runcode', data: { notcode: 'x' } }]);
    expect(r.valid).toBe(false);
    // Either the required-field check or the strict Zod parse fires — both name `code`.
    expect(r.errors.some((e) => e.includes('runcode') && e.toLowerCase().includes('code'))).toBe(true);
  });

  it('accepts source-valid runmacro and scene alias shapes', () => {
    const runmacro = validateSequence([{ action: 'runmacro', data: { macroid: 'Macro.abc123' } }]);
    expect(runmacro.valid).toBe(true);
    expect(runmacro.dangerous).toContain('runmacro');

    const scene = validateSequence([{ action: 'scene', data: { sceneid: 'Scene.scene123' } }]);
    expect(scene.valid).toBe(true);
    expect(scene.dangerous).toContain('scene');
  });

  it('still rejects runmacro and scene when every source-valid target field is absent', () => {
    const runmacro = validateSequence([{ action: 'runmacro', data: {} }]);
    expect(runmacro.valid).toBe(false);
    expect(runmacro.errors.some((e) => e.includes('entity or macroid or macroUuid'))).toBe(true);

    const scene = validateSequence([{ action: 'scene', data: {} }]);
    expect(scene.valid).toBe(false);
    expect(scene.errors.some((e) => e.includes('entity or sceneid'))).toBe(true);
  });
});

describe('normalizeActions — MATT source defaults and aliases', () => {
  it('fills known action defaults before write validation', () => {
    const [chat, scroll, check] = normalizeActions([
      { action: 'chatmessage', data: { text: 'Hello' } },
      { action: 'scrollingtext', data: { entity: 'token', text: 'Click!' } },
      { action: 'checkvariable', data: { name: 'phase', value: '== 1' } },
    ]);

    expect(chat.data.language).toBe('');
    expect(scroll.data.content).toBe('Click!');
    expect(scroll.data.anchor).toBe(0);
    expect(scroll.data.direction).toBe(2);
    expect(scroll.data.duration).toBe(5);
    expect(check.data.type).toBe('all');
  });

  it('normalizes source-valid runmacro and scene aliases to the runtime fields MATT reads', () => {
    const [macro, scene] = normalizeActions([
      { action: 'runmacro', data: { macroUuid: 'Macro.abc123' } },
      { action: 'scene', data: { sceneid: 'scene123' } },
    ]);

    expect(macro.data.macroid).toBe('Macro.abc123');
    expect(scene.data.entity).toBe('Scene.scene123');
  });
});

describe('makeMattId — 16-char action id (monks-active-tiles.js:35)', () => {
  it('generates a 16-char alphanumeric id', () => {
    const id = makeMattId();
    expect(id).toMatch(/^[A-Za-z0-9]{16}$/);
  });

  it('generates distinct ids', () => {
    const a = makeMattId();
    const b = makeMattId();
    expect(a).not.toBe(b);
  });
});

describe('isKnownAction — catalog membership', () => {
  it('recognizes built-in keys and rejects garbage', () => {
    expect(isKnownAction('teleport')).toBe(true);
    expect(isKnownAction('hurtheal')).toBe(true);
    expect(isKnownAction('definitely-not-an-action')).toBe(false);
  });
});
