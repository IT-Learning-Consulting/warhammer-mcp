// BUG-256 — Sequencer.Database.getEntry() returns SequencerFile objects (or an array of
// them), NOT plain path strings. sequencerEntryToPath maps each element to a readable string
// so the database-get-entry response's `files: string[]` contract holds instead of rendering
// `[object Object]`. These cases mirror the real SequencerFile shape observed in
// sequencer/dist/sequencer.js (dbPath set at construction; getAllFiles() accessor).
import { describe, it, expect } from 'vitest';
import { sequencerEntryToPath } from '../sequencer.js';

describe('sequencerEntryToPath — BUG-256 readable path extraction', () => {
  it('prefers the dbPath (the database key, what database-get-paths returns)', () => {
    const file = { dbPath: 'jb2a.melee_attack.01.trail.01.blue', file: 'modules/jb2a/x.webm', getAllFiles: () => ['modules/jb2a/x.webm'] };
    expect(sequencerEntryToPath(file)).toBe('jb2a.melee_attack.01.trail.01.blue');
  });

  it('falls back to getAllFiles() join when dbPath is absent (SequencerFilePlain has no dbPath)', () => {
    const plain = { getAllFiles: () => ['modules/jb2a/a.webm', 'modules/jb2a/b.webm'] };
    expect(sequencerEntryToPath(plain)).toBe('modules/jb2a/a.webm, modules/jb2a/b.webm');
  });

  it('falls back to a string file when neither dbPath nor getAllFiles produce a result', () => {
    expect(sequencerEntryToPath({ file: 'modules/jb2a/only.webm' })).toBe('modules/jb2a/only.webm');
  });

  it('passes a raw string straight through', () => {
    expect(sequencerEntryToPath('modules/jb2a/raw.webm')).toBe('modules/jb2a/raw.webm');
  });

  it('never emits "[object Object]" for a SequencerFile-shaped object (the bug)', () => {
    const file = { dbPath: 'jb2a.cure_wounds.400px.blue', file: { '5ft': 'x.webm' }, getAllFiles: () => ['x.webm'] };
    expect(sequencerEntryToPath(file)).not.toContain('[object Object]');
  });

  it('survives a getAllFiles() that throws, falling through to other accessors', () => {
    const file = {
      file: 'modules/jb2a/safe.webm',
      getAllFiles: () => {
        throw new Error('range-find resolution failed');
      },
    };
    expect(sequencerEntryToPath(file)).toBe('modules/jb2a/safe.webm');
  });
});
