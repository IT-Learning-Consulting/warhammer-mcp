// BUG-462 (Wave 2, D4) — play-sequence-json simplified-section expander.
// Pre-fix, EVERY taught payload ([{type:"effect", file:"jb2a.flames.orange"}] — the
// skill idioms, SKILL routing example, and the tool description's own example) was
// rejected with SEQUENCER_PLAY_ERROR (toJSON-only contract). Post-fix the simplified
// shape builds through Sequencer's own fluent API (effect()/sound() chains), so the
// module applies its own serialization defaults — no hand-crafted sectionData.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleSequencer } from '../sequencer.js';

// Fluent chain mocks — every builder method returns the builder (live Sequencer shape).
function makeChain(methods: string[]) {
  const chain: Record<string, any> = {};
  for (const m of methods) chain[m] = vi.fn(() => chain);
  return chain;
}

const effectChain = makeChain([
  'file', 'atLocation', 'attachTo', 'stretchTo', 'scale', 'duration', 'fadeIn', 'fadeOut',
  'opacity', 'delay', 'rotate', 'tint', 'name', 'origin', 'repeats', 'persist', 'belowTokens', 'waitUntilFinished',
]);
const soundChain = makeChain([
  'file', 'volume', 'duration', 'fadeInAudio', 'fadeOutAudio', 'delay', 'repeats', 'waitUntilFinished',
]);

const fromJsonMock = vi.fn();
const playMock = vi.fn().mockResolvedValue(undefined);
class SequenceMock {
  fromJSON = fromJsonMock;
  play = playMock;
  effect = vi.fn(() => effectChain);
  sound = vi.fn(() => soundChain);
}

beforeEach(() => {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: { get: (id: string) => (id === 'sequencer' ? { active: true } : null) },
  };
  (globalThis as any).Sequencer = { EffectManager: {}, SoundManager: {}, Preloader: {}, Database: {} };
  (globalThis as any).Sequence = SequenceMock;
  (globalThis as any).canvas = { tokens: { get: vi.fn(), placeables: [] }, templates: { get: vi.fn() } };
  vi.clearAllMocks();
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).Sequencer;
  delete (globalThis as any).Sequence;
  delete (globalThis as any).canvas;
});

describe('BUG-462: simplified-section expander', () => {
  it('the exact taught payload plays (regression probe of the ledger repro)', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'jb2a.flames.orange' }],
    });
    expect(result.success).toBe(true);
    expect(result.data.mode).toBe('simplified');
    expect(effectChain.file).toHaveBeenCalledWith('jb2a.flames.orange');
    expect(playMock).toHaveBeenCalledTimes(1);
    expect(fromJsonMock).not.toHaveBeenCalled(); // fluent path, not toJSON
  });

  it('effect options map onto the fluent chain (atLocation literal + scale + duration)', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'jb2a.explosion.01', atLocation: { x: 100, y: 200 }, scale: 1.5, duration: 3000 }],
    });
    expect(result.success).toBe(true);
    expect(effectChain.atLocation).toHaveBeenCalledWith({ x: 100, y: 200 });
    expect(effectChain.scale).toHaveBeenCalledWith(1.5);
    expect(effectChain.duration).toHaveBeenCalledWith(3000);
  });

  it('sound sections build through sound().file()', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'sound', file: 'sounds/thunder.ogg', volume: 0.6 }],
    });
    expect(result.success).toBe(true);
    expect(soundChain.file).toHaveBeenCalledWith('sounds/thunder.ogg');
    expect(soundChain.volume).toHaveBeenCalledWith(0.6);
  });

  it('unsupported simple type fails loud naming the two supported types', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'canvasPan', duration: 500 }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('SEQUENCER_UNSUPPORTED_SIMPLE_SECTION');
    expect(result.error).toContain('"effect" and "sound"');
    expect(playMock).not.toHaveBeenCalled();
  });

  it('mixed simplified + serialized payload is rejected with guidance', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [
        { type: 'effect', file: 'a.webm', repetitionsDelay: [0, 0] },
        { type: 'effect', file: 'b.webm' },
      ],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('mixed payload');
  });

  it('missing file on a simplified section fails loud', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect' }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('requires a non-empty "file"');
  });

  it('unresolvable string location fails loud with SEQUENCER_LOCATION_UNRESOLVED', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'a.webm', atLocation: 'no-such-token' }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('SEQUENCER_LOCATION_UNRESOLVED');
  });

  it('fully-serialized payloads still route through fromJSON (toJSON passthrough intact)', async () => {
    const result: any = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'a.webm', repetitionsDelay: [0, 0] }],
    });
    expect(result.success).toBe(true);
    expect(fromJsonMock).toHaveBeenCalledTimes(1);
  });
});
