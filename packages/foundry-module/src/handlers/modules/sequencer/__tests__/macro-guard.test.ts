// Module Integration v1 Phase 5B — vitest: macro-node guard in play-sequence-json.
//
// Why: The macro-guard is a safety invariant — .macro() creates a FunctionSection
// that is NOT serializable (Sequence.toJSON() throws on it), so type:"macro" never
// appears in valid JSON. The ALLOWLIST (effect/sound/scrollingText/canvasPan/wait)
// is the real defense: any unanticipated type is rejected by default.
// A silent gap here means arbitrary macro execution could reach live Foundry (SA2).
//
// These tests are deterministic — no live Foundry, no world-churn. The module guard
// is mocked to return "active" so we isolate the allowlist logic only.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleSequencer } from '../sequencer.js';

// ── Mock Foundry globals ──────────────────────────────────────────────────────

// Live Sequencer v4.0.1: fromJSON + play are INSTANCE methods (new Sequence().fromJSON(data).play()).
// Modelling Sequence as a constructor — not a static-bearing object — is what keeps this test honest:
// a mock with a static fromJSON masked the real instance-method API (F02, /agent-validate smoke 2026-06-09).
const fromJsonMock = vi.fn();
const playMock = vi.fn().mockResolvedValue(undefined);
class SequenceMock {
  fromJSON = fromJsonMock;
  play = playMock;
}

function mockGlobalsActive() {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: {
      get: (id: string) => id === 'sequencer' ? { active: true } : null,
    },
  };
  (globalThis as any).Sequencer = {
    EffectManager: {},
    SoundManager: {},
    Preloader: {},
    Database: { entryExists: vi.fn().mockReturnValue(false) },
  };
  (globalThis as any).Sequence = SequenceMock;
}

function mockGlobalsInactive() {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: {
      get: (id: string) => id === 'sequencer' ? { active: false } : null,
    },
  };
  delete (globalThis as any).Sequencer;
  delete (globalThis as any).Sequence;
}

beforeEach(() => {
  mockGlobalsActive();
  fromJsonMock.mockClear();
  playMock.mockClear();
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).Sequencer;
  delete (globalThis as any).Sequence;
});

// ── UNSAFE section types (must be rejected BEFORE fromJSON) ───────────────────

describe('play-sequence-json macro-node guard — ALLOWLIST (SA2, Phase 5B)', () => {
  it('rejects type:"macro" with UNSAFE_SECTION_EXCLUDED', async () => {
    // Why: .macro() creates FunctionSection — not serializable; arbitrary execution risk.
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'macro', id: 'SomeMacroId' }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNSAFE_SECTION_EXCLUDED');
    expect(fromJsonMock).not.toHaveBeenCalled();
  });

  it('rejects type:"animation" with UNSAFE_SECTION_EXCLUDED', async () => {
    // Why: AnimationSection has no _serialize method — toJSON() throws; deny-by-default.
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'animation', target: 'some-token' }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNSAFE_SECTION_EXCLUDED');
    expect(fromJsonMock).not.toHaveBeenCalled();
  });

  it('rejects type:"crosshair" with UNSAFE_SECTION_EXCLUDED', async () => {
    // Why: CrosshairSection is UI-only (interactive canvas placement); not server-automatable.
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'crosshair', name: 'targetPicker' }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNSAFE_SECTION_EXCLUDED');
    expect(fromJsonMock).not.toHaveBeenCalled();
  });

  it('rejects an unknown type with UNSAFE_SECTION_EXCLUDED (deny-by-default)', async () => {
    // Why: Allowlist denies anything not explicitly approved — protects against future types.
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'unknown_future_section', data: {} }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNSAFE_SECTION_EXCLUDED');
    expect(fromJsonMock).not.toHaveBeenCalled();
  });

  it('rejects a mixed sequence where any section has a disallowed type', async () => {
    // Why: One unsafe section in a multi-section sequence must block the whole play.
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [
        { type: 'effect', file: 'jb2a.flames' },
        { type: 'macro', id: 'EvilMacro' },
      ],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('UNSAFE_SECTION_EXCLUDED');
    expect(fromJsonMock).not.toHaveBeenCalled();
  });
});

// ── Allowed section types (must PASS the guard) ───────────────────────────────

describe('play-sequence-json macro-node guard — allowed types pass', () => {
  it('allows type:"effect" and feeds the wrapped {options,sections} shape to fromJSON', async () => {
    // Sections carry repetitionsDelay:[min,max] — every real Sequence.toJSON() section does, and the
    // play-sequence-json structural pre-check rejects sections that lack it (a hand-authored stub would
    // otherwise escape the try/catch as a detached unhandled rejection). Mirror real toJSON output here.
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'jb2a.flames.orange', repetitionsDelay: [0, 0] }],
    });
    // fromJSON called means the guard passed; success means no UNSAFE_SECTION_EXCLUDED
    expect(fromJsonMock).toHaveBeenCalledTimes(1);
    // Why: live Sequencer.fromJSON consumes { options, sections:[...] }, NOT a bare array.
    // Locking in the F02 fix — the bare input.sequence must be wrapped under `sections`.
    expect(fromJsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ moduleName: 'warhammer-mcp' }),
        sections: [{ type: 'effect', file: 'jb2a.flames.orange', repetitionsDelay: [0, 0] }],
      }),
    );
    expect(playMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('allows type:"sound"', async () => {
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'sound', file: 'sounds/thunder.ogg', repetitionsDelay: [0, 0] }],
    });
    expect(fromJsonMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('allows type:"canvasPan"', async () => {
    await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'canvasPan', duration: 1000, repetitionsDelay: [0, 0] }],
    });
    expect(fromJsonMock).toHaveBeenCalledTimes(1);
  });

  it('allows type:"wait"', async () => {
    await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'wait', duration: 500, repetitionsDelay: [0, 0] }],
    });
    expect(fromJsonMock).toHaveBeenCalledTimes(1);
  });
});

// ── MODULE_NOT_ACTIVE when sequencer is inactive ──────────────────────────────

describe('MODULE_NOT_ACTIVE guard', () => {
  it('returns MODULE_NOT_ACTIVE when sequencer module is not active', async () => {
    mockGlobalsInactive();
    const result = await dispatchModuleSequencer({
      action: 'play-sequence-json',
      sequence: [{ type: 'effect', file: 'test.webm' }],
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('MODULE_NOT_ACTIVE');
  });
});
