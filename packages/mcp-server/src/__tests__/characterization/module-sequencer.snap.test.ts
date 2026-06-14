// Characterization snapshot — ModuleSequencerTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers play, effects, sounds, database, preload, permissions, and MODULE_NOT_ACTIVE.

import { describe, it, expect } from 'vitest';
import { ModuleSequencerTool } from '../../tools/modules/sequencer/sequencer.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any, mockThrow?: string) =>
  new ModuleSequencerTool(makeToolDeps(mockReturn, mockThrow));

describe('ModuleSequencerTool — characterization', () => {
  // ── MODULE_NOT_ACTIVE ────────────────────────────────────────────────────────
  it('MODULE_NOT_ACTIVE — get-effects throws → moduleNotActiveContent format', async () => {
    const r = await tool(null, 'MODULE_NOT_ACTIVE: sequencer is not active').execute({
      action: 'get-effects',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Play actions ─────────────────────────────────────────────────────────────
  it('play-sequence-json — section count result', async () => {
    const r = await tool({
      sectionCount: 2,
      note: '',
    }).execute({
      action: 'play-sequence-json',
      sequence: [
        { type: 'effect', file: 'jb2a.flames.orange' },
        { type: 'sound', file: 'sounds/effects/fire.ogg' },
      ],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('play-sound — sound file result', async () => {
    const r = await tool({
      played: true,
      file: 'sounds/effects/fire.ogg',
    }).execute({
      action: 'play-sound',
      file: 'sounds/effects/fire.ogg',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Effects actions ──────────────────────────────────────────────────────────
  it('get-effects — active effects list', async () => {
    const r = await tool({
      effects: [
        { id: 'eff001', name: 'Fireball', origin: null, source: 'token001', target: null, sceneId: 'scene001', persist: true, file: 'jb2a.fireball', temporary: null },
        { id: 'eff002', name: null, origin: null, source: null, target: 'token002', sceneId: 'scene001', persist: false, file: 'jb2a.smoke', temporary: null },
      ],
      count: 2,
    }).execute({ action: 'get-effects' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-effects — no effects running', async () => {
    const r = await tool({ effects: [], count: 0 }).execute({ action: 'get-effects' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('end-all-effects — scene-scoped clear', async () => {
    const r = await tool({ ended: true, sceneId: 'scene001' }).execute({
      action: 'end-all-effects',
      sceneId: 'scene001',
      confirm: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('end-all-sounds — global clear (Sequencer 4.2.x)', async () => {
    const r = await tool({ ended: true }).execute({
      action: 'end-all-sounds',
      confirm: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Database reads ────────────────────────────────────────────────────────────
  it('database-entry-exists — entry found', async () => {
    const r = await tool({
      path: 'autoanimations.melee',
      exists: true,
    }).execute({ action: 'database-entry-exists', path: 'autoanimations.melee' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('database-search — search results', async () => {
    const r = await tool({
      path: 'autoanimations.melee',
      results: ['autoanimations.melee.weapon', 'autoanimations.melee.unarmed'],
    }).execute({ action: 'database-search', path: 'autoanimations.melee' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Permissions ───────────────────────────────────────────────────────────────
  it('permission-write — key, value, verified', async () => {
    const r = await tool({
      key: 'permissions-effect-create',
      value: 1,
      verified: 1,
    }).execute({
      action: 'permission-write',
      key: 'permissions-effect-create',
      value: 1,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
