// Phase 12 R12.3 — actor-field allow-list unit tests.
// Encodes WHY the allow-list exists: close the unbounded system.* write vector on update-actor while NEVER
// rejecting a field a real skill writes. A test that can't fail when the list drifts is wrong (Rule 9), so we
// assert BOTH directions (reject a derived sink, accept every observed field) AND the per-type split.

import { describe, it, expect } from 'vitest';
import {
  assertAllowedActorFields,
  selectActorAllowlist,
} from '../services/shared/actor-field-allowlist.js';

describe('assertAllowedActorFields — rejection (the write vector this closes)', () => {
  it('throws FIELD_NOT_ALLOWED for a derived characteristic value (the BUG-023 class)', () => {
    expect(() =>
      assertAllowedActorFields({ 'system.characteristics.ws.value': 99 }, 'character'),
    ).toThrow(/FIELD_NOT_ALLOWED/);
  });

  it('rejects a status .max write (auto-derived, must never be allow-listed)', () => {
    expect(() =>
      assertAllowedActorFields({ 'system.status.wounds.max': 50 }, 'character'),
    ).toThrow(/FIELD_NOT_ALLOWED/);
  });

  it('lists EVERY disallowed leaf in the message, not just the first', () => {
    try {
      assertAllowedActorFields(
        { 'system.characteristics.ws.value': 1, 'system.bogus.path': 2 },
        'npc',
      );
      throw new Error('should have thrown');
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain('system.characteristics.ws.value');
      expect(msg).toContain('system.bogus.path');
    }
  });

  it('flattens nested-object patches before checking (a nested .max is still rejected)', () => {
    expect(() =>
      assertAllowedActorFields({ system: { status: { wounds: { max: 10 } } } }, 'character'),
    ).toThrow(/FIELD_NOT_ALLOWED/);
  });
});

describe('assertAllowedActorFields — acceptance (cannot break a live skill)', () => {
  it('accepts the gmnotes canary on every type — character accepts BOTH paths (get-character reads system.details.gmnotes.value at character.ts:410)', () => {
    expect(() => assertAllowedActorFields({ 'system.gmnotes.value': 'x' }, 'character')).not.toThrow();
    // Phase-12 Gate-B fix: get-character surfaces character gmnotes from the DETAILS path,
    // and it is the plan's R12.3 union canary (eval actors#7/#18). Union-safe to allow on character.
    expect(() => assertAllowedActorFields({ 'system.details.gmnotes.value': 'x' }, 'character')).not.toThrow();
    expect(() => assertAllowedActorFields({ 'system.details.gmnotes.value': 'x' }, 'npc')).not.toThrow();
    expect(() => assertAllowedActorFields({ 'system.details.gmnotes.value': 'x' }, 'creature')).not.toThrow();
  });

  it('accepts every characteristic .advances / .initial leaf (wfrp-advance, build-*)', () => {
    for (const k of ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']) {
      expect(() => assertAllowedActorFields({ [`system.characteristics.${k}.advances`]: 5 }, 'creature')).not.toThrow();
      expect(() => assertAllowedActorFields({ [`system.characteristics.${k}.initial`]: 30 }, 'character')).not.toThrow();
    }
  });

  it('accepts the pools/standing/name/prototypeToken fields the live skills write', () => {
    expect(() =>
      assertAllowedActorFields(
        {
          name: 'Grik',
          'prototypeToken.name': 'Grik',
          'system.status.wounds.value': 12,
          'system.status.advantage.value': 2,
          'system.details.status.tier': 1,
        },
        'npc',
      ),
    ).not.toThrow();
  });
});

describe('assertAllowedActorFields — per-actor.type split', () => {
  it('experience.spent is character-only: passes on character, rejected on creature', () => {
    expect(() => assertAllowedActorFields({ 'system.details.experience.spent': 100 }, 'character')).not.toThrow();
    expect(() => assertAllowedActorFields({ 'system.details.experience.spent': 100 }, 'creature')).toThrow(/FIELD_NOT_ALLOWED/);
  });

  it('fate.value is character-only: passes on character, rejected on npc', () => {
    expect(() => assertAllowedActorFields({ 'system.status.fate.value': 2 }, 'character')).not.toThrow();
    expect(() => assertAllowedActorFields({ 'system.status.fate.value': 2 }, 'npc')).toThrow(/FIELD_NOT_ALLOWED/);
  });

  it('social standing is rejected on a creature (BUG-022) but allowed on npc/character', () => {
    expect(() => assertAllowedActorFields({ 'system.details.status.standing': 'x' }, 'creature')).toThrow(/FIELD_NOT_ALLOWED/);
    expect(() => assertAllowedActorFields({ 'system.details.status.standing': 'x' }, 'npc')).not.toThrow();
    expect(() => assertAllowedActorFields({ 'system.details.status.standing': 'x' }, 'character')).not.toThrow();
  });

  it('an unrecognized actor type falls back to the union (still blocks never-observed fields)', () => {
    expect(() => assertAllowedActorFields({ 'system.status.wounds.value': 1 }, 'vehicle')).not.toThrow();
    expect(() => assertAllowedActorFields({ 'system.characteristics.ws.value': 1 }, 'vehicle')).toThrow(/FIELD_NOT_ALLOWED/);
    expect(selectActorAllowlist('vehicle').size).toBeGreaterThan(selectActorAllowlist('creature').size);
  });

  it('an empty patch is a no-op (no fields to reject)', () => {
    expect(() => assertAllowedActorFields({}, 'character')).not.toThrow();
  });
});
