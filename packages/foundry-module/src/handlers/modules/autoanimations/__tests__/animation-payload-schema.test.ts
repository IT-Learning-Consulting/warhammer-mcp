// BUG-799 — malformed AA slots (animation:{}, enabled sound with no file, enabled macro with no
// name, incomplete video tuples) previously passed the shared schema silently. AA's own expansion/
// path-builder fills blanks with defaults or substitutes an arbitrary fallback rather than
// rejecting them, so a malformed request could report success while playing the wrong thing (or
// nothing at all). These refinements catch the malformed shapes at the schema boundary, before any
// write happens.

import { describe, it, expect } from 'vitest';
import { ModuleAutoAnimationsInput } from '@foundry-mcp/shared';

function setItemPayload(animation: Record<string, unknown>) {
  return { action: 'set-item-animation', uuid: 'Item.x', animation };
}

describe('ModuleAutoAnimationsInput — BUG-799 slot refinements', () => {
  it('rejects animation:{} (fully empty payload)', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({}))).toThrow(/EMPTY_ANIMATION_PAYLOAD/);
  });

  it('accepts a payload with at least one slot set', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ soundOnly: { enable: true, file: 'sounds/boom.ogg' } }))).not.toThrow();
  });

  it('rejects an incomplete DB-driven video tuple (dbSection set, menuType/animation missing)', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ primary: { dbSection: 'melee' } }))).toThrow(/INCOMPLETE_VIDEO_SLOT/);
  });

  it('accepts a complete DB-driven video tuple', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ primary: { dbSection: 'melee', menuType: 'weapon', animation: 'sword' } }))).not.toThrow();
  });

  it('accepts a fully empty video slot (no video configured is valid)', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ primary: {}, soundOnly: { enable: true, file: 'x.ogg' } }))).not.toThrow();
  });

  it('rejects enableCustom:true with no customPath', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ primary: { enableCustom: true } }))).toThrow(/INCOMPLETE_VIDEO_SLOT/);
  });

  it('rejects an enabled sound with no file', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ sound: { enable: true } }))).toThrow(/INCOMPLETE_SOUND_SLOT/);
  });

  it('accepts a disabled sound with no file (nothing to play, nothing malformed)', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ sound: { enable: false }, soundOnly: { enable: true, file: 'x.ogg' } }))).not.toThrow();
  });

  it('rejects an enabled macro with no name', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ macro: { enable: true } }))).toThrow(/INCOMPLETE_MACRO_SLOT/);
  });

  it('accepts an enabled macro with a name', () => {
    expect(() => ModuleAutoAnimationsInput.parse(setItemPayload({ macro: { enable: true, name: 'MyMacro' } }))).not.toThrow();
  });
});
