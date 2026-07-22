// BUG-809 — annotation-to-action safety census guard.
//
// module-autoanimations and module-sequencer both advertised destructiveHint:false despite
// exposing actions that delete authored flags, remove persistent effects/sounds, mutate world
// Autorec config, or change world permissions. Every other mixed read/write module-* umbrella
// (item-piles, matt, mortal-needs, macro-trigger, ...) declares destructiveHint:true. This test
// classifies each action in both tools' enums as read-only or mutating/destructive by name, and
// asserts: (a) the classification covers every action currently in the enum (so an enum growth
// that adds a new destructive action can't silently go unclassified), and (b) if ANY action is
// mutating, the umbrella-level destructiveHint annotation must be true — the false-safety-signal
// this bug reported.

import { describe, expect, it } from 'vitest';
import { ModuleAutoAnimationsTool } from '../tools/modules/autoanimations/autoanimations.js';
import { ModuleSequencerTool } from '../tools/modules/sequencer/sequencer.js';

const stubLogger: any = {
  child: () => stubLogger,
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
const toolOptions = { foundryClient: {} as any, logger: stubLogger };

// Read-only actions: pure reads/lookups with no world mutation and no broadcast.
const READ_ONLY_ACTIONS = new Set([
  // module-autoanimations
  'get-item-animation', 'list-animations', 'get-autorec',
  // module-sequencer
  'get-effects', 'get-sounds', 'database-search', 'database-get-paths',
  'database-entry-exists', 'database-get-entry',
]);

// Mutating actions: writes, deletes, world-config changes, or client broadcasts.
const MUTATING_ACTIONS = new Set([
  // module-autoanimations
  'set-item-animation', 'clear-item-animation', 'merge-autorec-entry', 'play-animation',
  // module-sequencer
  'play-sequence-json', 'end-effects', 'end-all-effects', 'update-effects',
  'play-sound', 'end-sounds', 'end-all-sounds',
  'preload', 'preload-for-clients', 'permission-write',
]);

const CENSUS: Array<{ label: string; make: () => any }> = [
  { label: 'module-autoanimations', make: () => new ModuleAutoAnimationsTool(toolOptions) },
  { label: 'module-sequencer', make: () => new ModuleSequencerTool(toolOptions) },
];

describe('BUG-809 guard: destructiveHint matches the real action census', () => {
  for (const { label, make } of CENSUS) {
    it(`${label}: every action is classified, and any mutating action forces destructiveHint:true`, () => {
      const def = make().getToolDefinitions()[0];
      const actions: string[] = def.inputSchema?.properties?.action?.enum ?? [];
      expect(actions.length).toBeGreaterThan(0);

      const unclassified = actions.filter((a) => !READ_ONLY_ACTIONS.has(a) && !MUTATING_ACTIONS.has(a));
      expect(unclassified, `${label}: unclassified action(s) — add to READ_ONLY_ACTIONS or MUTATING_ACTIONS`).toEqual([]);

      const hasMutatingAction = actions.some((a) => MUTATING_ACTIONS.has(a));
      expect(hasMutatingAction).toBe(true);
      expect(def.annotations?.destructiveHint, `${label}: has mutating/destructive action(s) but destructiveHint is not true`).toBe(true);
    });
  }
});
