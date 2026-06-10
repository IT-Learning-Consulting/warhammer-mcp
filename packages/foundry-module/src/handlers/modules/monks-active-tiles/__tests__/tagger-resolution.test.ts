// Module Integration v1 Phase 5C.2 — MATT tagger selector resolution tests.
//
// Why: resolveTaggerSelectorsInSequence replaces the soft optionalDeps.tagger boolean
// with real author-time validation data. A gap here means tagger:typo silently passes
// instead of surfacing ZERO_MATCH — defeating the purpose of the 5C.1 revision.
//
// Tests via the exported helper directly so we avoid tile-creation mocking complexity.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveTaggerSelectorsInSequence } from '../matt.js';

// ── Mock Foundry globals ──────────────────────────────────────────────────────

const getByTagMock = vi.fn();

function mockTaggerActive(matchCount = 1) {
  (globalThis as any).Tagger = {
    getByTag: getByTagMock.mockImplementation(([tag]: string[]) => {
      const count = tag.includes('zero_match') ? 0 : matchCount;
      return Promise.resolve(Array.from({ length: count }, (_, i) => ({ uuid: `token${i}`, name: `T${i}` })));
    }),
  };
}

function mockTaggerInactive() {
  delete (globalThis as any).Tagger;
}

beforeEach(() => { getByTagMock.mockClear(); });
afterEach(() => { delete (globalThis as any).Tagger; });

// ── Test actions with tagger: entity selectors ────────────────────────────────

const actionsWithStringEntity = [
  { id: 'a1', action: 'chatmessage', data: { entity: 'tagger:enemy', content: 'msg' } },
];

const actionsWithObjectEntity = [
  { id: 'a1', action: 'teleport', data: { entity: { id: 'tagger:guard', sceneId: 'sc1' } } },
];

const actionsWithZeroMatch = [
  { id: 'a1', action: 'chatmessage', data: { entity: 'tagger:zero_match_tag', content: 'msg' } },
];

const actionsNoTagger = [
  { id: 'a1', action: 'chatmessage', data: { entity: 'Token.abc123', content: 'msg' } },
];

const actionsMultiField = [
  { id: 'a1', action: 'teleport', data: { entity: 'tagger:enemy', location: 'tagger:waypoint' } },
];

// ── Tagger active + match found ───────────────────────────────────────────────

describe('resolveTaggerSelectorsInSequence — tagger active, match found', () => {
  it('resolves a tagger: string in data.entity, returns matchedCount', async () => {
    // Why: string-value entity selector is the most common form in MATT tile configs.
    mockTaggerActive(2);

    const { taggerResolution, warnings } = await resolveTaggerSelectorsInSequence(
      actionsWithStringEntity, true, 'scene1',
    );

    expect(taggerResolution).toHaveLength(1);
    expect(taggerResolution[0].tag).toBe('enemy');
    expect(taggerResolution[0].matchedCount).toBe(2);
    expect(taggerResolution[0].warn).toBeUndefined();
    expect(taggerResolution[0].field).toBe('entity');
    expect(warnings).toHaveLength(0);
    expect(getByTagMock).toHaveBeenCalledWith(['enemy'], { sceneId: 'scene1' });
  });

  it('resolves a tagger: selector inside data.entity.id (object form)', async () => {
    // Why: MATT entity selectors can be objects with {id, sceneId} shape.
    mockTaggerActive(1);

    const { taggerResolution } = await resolveTaggerSelectorsInSequence(
      actionsWithObjectEntity, true, 'scene1',
    );

    expect(taggerResolution).toHaveLength(1);
    expect(taggerResolution[0].tag).toBe('guard');
    expect(taggerResolution[0].matchedCount).toBe(1);
  });

  it('resolves multiple tagger: fields in one action', async () => {
    // Why: an action can have tagger: in both entity and location fields.
    mockTaggerActive(1);

    const { taggerResolution } = await resolveTaggerSelectorsInSequence(
      actionsMultiField, true, 'scene1',
    );

    expect(taggerResolution.length).toBeGreaterThanOrEqual(2);
    const enemy = taggerResolution.find((r) => r.tag === 'enemy');
    const waypoint = taggerResolution.find((r) => r.tag === 'waypoint');
    expect(enemy).toBeDefined();
    expect(waypoint).toBeDefined();
  });

  it('ignores non-tagger entity selectors', async () => {
    // Why: Token.uuid selectors must not trigger a getByTag call.
    mockTaggerActive(1);

    const { taggerResolution } = await resolveTaggerSelectorsInSequence(
      actionsNoTagger, true, 'scene1',
    );

    expect(taggerResolution).toHaveLength(0);
    expect(getByTagMock).not.toHaveBeenCalled();
  });
});

// ── Tagger active + zero match → ZERO_MATCH warn ─────────────────────────────

describe('resolveTaggerSelectorsInSequence — tagger active, zero match', () => {
  it('returns ZERO_MATCH warn when tag matches no documents', async () => {
    // Why: tagger:typo is the canonical authoring mistake; this surfaces it before deploy.
    mockTaggerActive(0);

    const { taggerResolution, warnings } = await resolveTaggerSelectorsInSequence(
      actionsWithZeroMatch, true, 'scene1',
    );

    expect(taggerResolution).toHaveLength(1);
    expect(taggerResolution[0].matchedCount).toBe(0);
    expect(taggerResolution[0].warn).toBe('ZERO_MATCH');
    expect(warnings.length).toBeGreaterThan(0);
    // Still returns the entry — WARN only, not an error (fail-open for tag setup flows)
    expect(taggerResolution[0].tag).toContain('zero_match');
  });
});

// ── Tagger inactive → resolution omitted, no Tagger calls ────────────────────

describe('resolveTaggerSelectorsInSequence — tagger inactive', () => {
  it('returns empty resolution when taggerActive=false (fail-open)', async () => {
    // Why: existing MATT tiles with tagger: selectors must keep working without Tagger installed.
    mockTaggerInactive();

    const { taggerResolution, warnings } = await resolveTaggerSelectorsInSequence(
      actionsWithStringEntity, false, 'scene1',
    );

    expect(taggerResolution).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(getByTagMock).not.toHaveBeenCalled();
  });

  it('makes zero Tagger API calls when inactive', async () => {
    // Why: the fail-open guard must not call Tagger.getByTag at all when tagger is off.
    mockTaggerInactive();

    await resolveTaggerSelectorsInSequence(actionsMultiField, false, 'scene1');

    expect(getByTagMock).not.toHaveBeenCalled();
  });
});
