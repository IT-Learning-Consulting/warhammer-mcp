// creature-index-lifecycle.test.ts — MCP Code-Quality Hardening v1, Phase 10 (R10.1/R10.3).
//
// Proves PersistentCreatureIndex's 5 cache-invalidation hooks are now paired with Hooks.off via the
// utils/lifecycle.ts registry. Pre-Phase-10 they leaked — the service registered 5 Hooks.on and never
// tore them down, so every world reload doubled them. Asserted with the installHookRegistry() pattern
// (a Map-backed trackable Hooks that records on/off; mirrors apply-damage.test.ts:18-43), since happy-dom
// can't count live listeners — the Hooks.off CALL COUNT is the mechanism-level proof.

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import * as lifecycle from '../utils/lifecycle.js';
import { PersistentCreatureIndex } from '../services/creature-index.js';

type HookHandler = (...args: any[]) => void;
interface HookRegistry {
  next: number;
  byId: Map<number, { event: string; fn: HookHandler }>;
  register(event: string, fn: HookHandler): number;
  off(event: string, id: number): void;
}

function installHookRegistry(): HookRegistry {
  const reg: HookRegistry = {
    next: 1,
    byId: new Map(),
    register(event, fn) {
      const id = this.next++;
      this.byId.set(id, { event, fn });
      return id;
    },
    off(_event, id) {
      this.byId.delete(id);
    },
  };
  (globalThis as any).Hooks = {
    on: (event: string, fn: HookHandler) => reg.register(event, fn),
    off: (event: string, id: number) => reg.off(event, id),
    once: () => 0,
    call: () => {},
    callAll: () => {},
  };
  return reg;
}

// The 5 compendium cache-invalidation events PersistentCreatureIndex.registerFoundryHooks attaches.
const INDEX_EVENTS = [
  'createCompendium',
  'createDocument',
  'deleteCompendium',
  'deleteDocument',
  'updateDocument',
];

describe('creature-index lifecycle (R10.1/R10.3)', () => {
  let hooks: HookRegistry;

  beforeEach(() => {
    hooks = installHookRegistry();
  });

  afterEach(() => {
    // Reset module-scope owner controllers so each test starts with a clean registry.
    lifecycle.teardownAll();
  });

  it('registers all 5 cache-invalidation hooks through the lifecycle registry', () => {
    new PersistentCreatureIndex();
    expect(hooks.byId.size).toBe(5);
    const events = [...hooks.byId.values()].map((e) => e.event).sort();
    expect(events).toEqual(INDEX_EVENTS);
  });

  it('lifecycle.abort("creature-index") deregisters all 5 — every Hooks.on is paired with a Hooks.off', () => {
    new PersistentCreatureIndex();
    expect(hooks.byId.size).toBe(5);

    lifecycle.abort('creature-index');

    expect(hooks.byId.size).toBe(0); // zero live entries — no leak survives teardown
  });

  it('destroy() tears down and resets the guard so a fresh index re-attaches cleanly', () => {
    const idx = new PersistentCreatureIndex();
    expect(hooks.byId.size).toBe(5);

    idx.destroy();
    expect(hooks.byId.size).toBe(0);

    // destroy() reset hooksRegistered=false; a new index re-registers its 5 hooks on a fresh controller.
    new PersistentCreatureIndex();
    expect(hooks.byId.size).toBe(5);
  });

  it('the hooksRegistered guard makes a repeat registerFoundryHooks() a no-op (no double-attach)', () => {
    const idx = new PersistentCreatureIndex();
    expect(hooks.byId.size).toBe(5);

    (idx as any).registerFoundryHooks(); // guard short-circuits — must not add 5 more
    expect(hooks.byId.size).toBe(5);
  });
});
