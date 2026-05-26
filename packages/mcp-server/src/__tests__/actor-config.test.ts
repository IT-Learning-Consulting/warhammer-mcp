// Phase 1 mcp_coverage_expansion — ActorConfig tool schema tests (CCR-13).
//
// Tests: action enum (4 values), missing required fields → throw, unknown key → throw (strict),
// art target discriminant, set-art missing src → throw, empty changes → throw,
// placement-omitted fields NOT modeled, invalid discriminant → safeParse false.

import { describe, it, expect, vi } from 'vitest';
import { ActorConfigToolInput } from '@foundry-mcp/shared';
import { ActorConfigTool } from '../tools/actor-config.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn ?? { actorId: 'a1', actorName: 'Test', prototypeToken: {} };
    }),
  };
  return new ActorConfigTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('ActorConfigToolInput schema', () => {
  it('action enum contains exactly 4 values', () => {
    const actions = ActorConfigToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(['get-art', 'get-prototype-token', 'set-art', 'update-prototype-token']);
  });

  it('get-prototype-token requires actorId', () => {
    expect(() => ActorConfigToolInput.parse({ action: 'get-prototype-token' })).toThrow();
    expect(() =>
      ActorConfigToolInput.parse({ action: 'get-prototype-token', actorId: 'eRf6DiZhFzEL5alu' }),
    ).not.toThrow();
  });

  it('update-prototype-token requires actorId + changes', () => {
    expect(() => ActorConfigToolInput.parse({ action: 'update-prototype-token' })).toThrow();
    expect(() =>
      ActorConfigToolInput.parse({ action: 'update-prototype-token', actorId: 'a1' }),
    ).toThrow();
  });

  it('update-prototype-token rejects empty changes object', () => {
    expect(() =>
      ActorConfigToolInput.parse({ action: 'update-prototype-token', actorId: 'a1', changes: {} }),
    ).toThrow();
  });

  it('update-prototype-token accepts valid changes', () => {
    expect(() =>
      ActorConfigToolInput.parse({
        action: 'update-prototype-token',
        actorId: 'a1',
        changes: { disposition: -1, displayName: 50 },
      }),
    ).not.toThrow();
  });

  it('update-prototype-token accepts extraFields passthrough', () => {
    expect(() =>
      ActorConfigToolInput.parse({
        action: 'update-prototype-token',
        actorId: 'a1',
        changes: { disposition: 0 },
        extraFields: { 'randomUnmodeledKey': true },
      }),
    ).not.toThrow();
  });

  it('update-prototype-token rejects unknown key in changes (strict)', () => {
    // changes is strict, so unknown keys inside changes throw.
    expect(() =>
      ActorConfigToolInput.parse({
        action: 'update-prototype-token',
        actorId: 'a1',
        changes: { disposition: 0, x: 100 }, // x is placement-omitted (NOT modeled in changes)
      }),
    ).toThrow();
  });

  it('update-prototype-token does NOT model placement-omitted fields', () => {
    // y, elevation, _movementHistory must NOT parse through changes.
    for (const field of ['y', 'elevation', '_movementHistory']) {
      const result = ActorConfigToolInput.safeParse({
        action: 'update-prototype-token',
        actorId: 'a1',
        changes: { [field]: 0 },
      });
      expect(result.success).toBe(false);
    }
  });

  it('get-art requires target with type + id', () => {
    expect(() => ActorConfigToolInput.parse({ action: 'get-art' })).toThrow();
    expect(() =>
      ActorConfigToolInput.parse({ action: 'get-art', target: { type: 'actor', id: 'a1' } }),
    ).not.toThrow();
    expect(() =>
      ActorConfigToolInput.parse({ action: 'get-art', target: { type: 'item', id: 'i1' } }),
    ).not.toThrow();
  });

  it('get-art target rejects invalid type discriminant', () => {
    const result = ActorConfigToolInput.safeParse({
      action: 'get-art',
      target: { type: 'scene', id: 's1' },
    });
    expect(result.success).toBe(false);
  });

  it('set-art requires target + src', () => {
    expect(() => ActorConfigToolInput.parse({ action: 'set-art' })).toThrow();
    expect(() =>
      ActorConfigToolInput.parse({ action: 'set-art', target: { type: 'actor', id: 'a1' } }),
    ).toThrow(); // missing src
    expect(() =>
      ActorConfigToolInput.parse({ action: 'set-art', src: 'icons/test.svg' }),
    ).toThrow(); // missing target
  });

  it('set-art accepts empty src (art-clear)', () => {
    expect(() =>
      ActorConfigToolInput.parse({ action: 'set-art', target: { type: 'actor', id: 'a1' }, src: '' }),
    ).not.toThrow();
  });

  it('set-art accepts which enum values', () => {
    for (const which of ['img', 'texture', 'both'] as const) {
      expect(() =>
        ActorConfigToolInput.parse({
          action: 'set-art',
          target: { type: 'actor', id: 'a1' },
          src: 'icons/test.svg',
          which,
        }),
      ).not.toThrow();
    }
  });

  it('set-art rejects invalid which value', () => {
    const result = ActorConfigToolInput.safeParse({
      action: 'set-art',
      target: { type: 'actor', id: 'a1' },
      src: 'icons/test.svg',
      which: 'invalid-value',
    });
    expect(result.success).toBe(false);
  });

  it('invalid action discriminant → safeParse false', () => {
    const result = ActorConfigToolInput.safeParse({ action: 'set-disposition' });
    expect(result.success).toBe(false);
  });

  it('unknown top-level key → throw (strict mode)', () => {
    expect(() =>
      ActorConfigToolInput.parse({
        action: 'get-prototype-token',
        actorId: 'a1',
        unknownTopLevelKey: true,
      }),
    ).toThrow();
  });
});

// ── Tool behavior tests ───────────────────────────────────────────────────────

describe('ActorConfigTool.execute', () => {
  it('get-prototype-token formats prototypeToken JSON', async () => {
    const tool = makeTool({ actorId: 'a1', actorName: 'Grimgor', prototypeToken: { disposition: -1 } });
    const result = await tool.execute({ action: 'get-prototype-token', actorId: 'a1' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('Grimgor');
  });

  it('update-prototype-token formats changed fields', async () => {
    const tool = makeTool({
      actorId: 'a1',
      actorName: 'Grimgor',
      requestedChanges: { disposition: -1 },
      extraFields: null,
      prototypeToken: { disposition: -1 },
    });
    const result = await tool.execute({
      action: 'update-prototype-token',
      actorId: 'a1',
      changes: { disposition: -1 },
    });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('disposition');
  });

  it('get-art actor returns img + texture.src', async () => {
    const tool = makeTool({
      target: { type: 'actor', id: 'a1' },
      actorImg: 'icons/svg/mystery-man.svg',
      prototypeTokenTextureSrc: 'icons/svg/mystery-man.svg',
    });
    const result = await tool.execute({ action: 'get-art', target: { type: 'actor', id: 'a1' } });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('actor.img');
  });

  it('set-art formats written fields + src', async () => {
    const tool = makeTool({
      target: { type: 'actor', id: 'a1' },
      src: 'icons/svg/mystery-man.svg',
      which: 'both',
      written: ['actor.img', 'prototypeToken.texture.src'],
    });
    const result = await tool.execute({
      action: 'set-art',
      target: { type: 'actor', id: 'a1' },
      src: 'icons/svg/mystery-man.svg',
    });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('mystery-man.svg');
  });

  it('set-art formats art-clear (empty src) as reset-to-default and surfaces the resolved path', async () => {
    // BUG-246: empty src cannot persist as "" — Foundry cleans it to the document-type default
    // icon. The handler returns the resolved (post-clean) path; the formatter must report the
    // clear as a reset-to-default AND surface what it actually resolved to, so the caller is not
    // misled into thinking the art became literally empty.
    const tool = makeTool({
      target: { type: 'actor', id: 'a1' },
      src: '',
      which: 'img',
      written: ['actor.img'],
      resolved: { img: 'icons/svg/mystery-man.svg' },
    });
    const result = await tool.execute({
      action: 'set-art',
      target: { type: 'actor', id: 'a1' },
      src: '',
      which: 'img',
    });
    expect(result.isError).toBeFalsy();
    const text = result.content[0].text;
    expect(text).toContain('reset to default'); // not "literally emptied"
    expect(text).toContain('icons/svg/mystery-man.svg'); // resolved default surfaced (DP-19)
  });

  it('get-prototype-token returns isError on tool throw', async () => {
    const tool = makeTool(null, 'Actor not found with id "bad"');
    const result = await tool.execute({ action: 'get-prototype-token', actorId: 'bad' });
    expect(result.isError).toBe(true);
  });
});
