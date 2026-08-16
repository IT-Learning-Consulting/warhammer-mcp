// BUG-746 — GM-only MATT output leaking to players via the ignored generic `for` alias.
//
// Why: native MATT actions each read their own audience field (showto/showfor/animatefor,
// verified against monks-active-tiles/actions.js v13.06) — there is no generic `for` field.
// A skill-authored `for:"gm"` on chatmessage/notification/etc was silently ignored, so the
// action fell back to its native default audience (frequently "everyone"), disclosing
// GM-only text to players. This test proves `for` is translated to the correct native key
// per action, and never survives normalization as a dead field for the affected actions.

import { describe, it, expect } from 'vitest';
import { normalizeActionData } from '../matt-helpers.js';

describe('normalizeActionData — BUG-746 audience field translation', () => {
  it('translates chatmessage `for:"gm"` to `showto:"gm"` and removes `for`', () => {
    const data = normalizeActionData('chatmessage', { text: 'secret', for: 'gm' });
    expect(data.showto).toBe('gm');
    expect(data.for).toBeUndefined();
  });

  it('translates notification `for` to `showto`', () => {
    const data = normalizeActionData('notification', { text: 'warn', for: 'gm' });
    expect(data.showto).toBe('gm');
    expect(data.for).toBeUndefined();
  });

  it('translates showimage `for` to `showfor` (distinct native key)', () => {
    const data = normalizeActionData('showimage', { img: 'x.webp', for: 'players' });
    expect(data.showfor).toBe('players');
    expect(data.for).toBeUndefined();
  });

  it('translates playanimation `for` to `animatefor` (distinct native key)', () => {
    const data = normalizeActionData('playanimation', { entity: 'token', for: 'gm' });
    expect(data.animatefor).toBe('gm');
    expect(data.for).toBeUndefined();
  });

  it('translates openjournal / openactor / dialog / tempimage `for` to `showto`', () => {
    for (const action of ['openjournal', 'openactor', 'dialog', 'tempimage']) {
      const data = normalizeActionData(action, { entity: 'token', for: 'gm' });
      expect(data.showto).toBe('gm');
      expect(data.for).toBeUndefined();
    }
  });

  it('does not clobber an explicit native-key value already present alongside `for`', () => {
    const data = normalizeActionData('chatmessage', { text: 'x', showto: 'players', for: 'gm' });
    expect(data.showto).toBe('players');
    expect(data.for).toBeUndefined();
  });

  it('leaves `for` untouched for actions where it is the genuine native key (not in the audience map)', () => {
    const data = normalizeActionData('closedialog', { for: 'token' });
    expect(data.for).toBe('token');
  });

  it('is a no-op when `for` is absent', () => {
    const data = normalizeActionData('chatmessage', { text: 'x', showto: 'trigger' });
    expect(data.showto).toBe('trigger');
    expect(data.for).toBeUndefined();
  });
});
