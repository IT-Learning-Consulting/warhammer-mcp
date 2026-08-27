// Task 4.1 acceptance — check-formatter-completeness.mjs (Phase 4, systemic_bug_class_prevention v2)
// must go RED on each seeded defect and GREEN on a matching correct case, for both rules, plus the
// root-absent loud-failure (FATAL) case for each rule. Imports the rule functions directly (exported
// for this purpose) rather than shelling out to the CLI, mirroring outcome-field-fixtures.test.ts /
// check-outcome-field.mjs's own fixture-test convention.
//
// Rule 1 fixtures reuse a REAL allowlisted target's `cfg` object (so `existsSync()` on the real file
// passes) with an injected `readFile` returning seeded content instead of the real file's content —
// the same trick outcome-field-fixtures.test.ts uses for checkBuilderUsageRule's injectable readFile.
//
// Rule 2 fixtures build a small in-memory TS program via a virtual CompilerHost (no real files touched,
// so a deliberately-red fixture can never leak into the real-tree scan the way a real fixture .ts file
// living under packages/*/src/ would).

import { describe, expect, it, beforeAll } from 'vitest';
import ts from 'typescript';
// @ts-expect-error — plain .mjs script, not part of this package's TS project.
import {
  FORMATTER_COMPLETENESS_ALLOWLIST,
  checkFormatterKeys,
  runRule1,
  runRule2,
  findObjectKeysOffenders,
} from '../../../../scripts/check-formatter-completeness.mjs';

/** Builds a small in-memory ts.Program from `files` (virtualPath -> source text), using a custom
 *  CompilerHost so no real files on disk are involved — a seeded fixture can never be picked up by
 *  the real-tree scan (which walks packages/{foundry-module,mcp-server}/src/** from tsconfig.json). */
function buildVirtualProgram(files: Record<string, string>) {
  const options: ts.CompilerOptions = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, strict: true };
  const host = ts.createCompilerHost(options);
  const origGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersionOrOptions, ...rest: any[]) => {
    if (files[fileName] !== undefined) {
      return ts.createSourceFile(fileName, files[fileName], languageVersionOrOptions as any, true);
    }
    return (origGetSourceFile as any)(fileName, languageVersionOrOptions, ...rest);
  };
  const origFileExists = host.fileExists.bind(host);
  host.fileExists = (fileName) => files[fileName] !== undefined || origFileExists(fileName);
  const origReadFile = host.readFile.bind(host);
  host.readFile = (fileName) => files[fileName] ?? origReadFile(fileName);
  const program = ts.createProgram({ rootNames: Object.keys(files), options, host });
  return { program, checker: program.getTypeChecker() };
}

describe('check-formatter-completeness — rule 1: formatter-key-completeness', () => {
  it('goes red: a seeded formatter omits a declared output key', () => {
    // Reuses the real module-tokenizer allowlist cfg (file exists on disk, keys=[frames,plugins]) —
    // only the CONTENT is faked via the injected readFile, so existsSync() passes on the real path.
    const cfg = FORMATTER_COMPLETENESS_ALLOWLIST['module-tokenizer'];
    const seededSrc = `
function formatListRegistered(r) {
  const frames = (r.frames ?? []).map((f) => f.label ?? f.id).join(', ');
  return \`Frames: [\${frames}]\`; // omits plugins entirely
}
`;
    const result = checkFormatterKeys('module-tokenizer', cfg, () => seededSrc);
    expect(result).not.toBeNull();
    expect(result.fatal).toBe(false);
    expect(result.detail).toContain('plugins');
    expect(result.detail).not.toContain('omits declared output key(s): frames');
  });

  it('goes green: a same-file GATE-SUPPRESS[formatter-completeness] anchor skips the target even with a missing key', () => {
    const cfg = FORMATTER_COMPLETENESS_ALLOWLIST['module-tokenizer'];
    const seededSrc = `
// GATE-SUPPRESS[formatter-completeness]: seeded fixture — plugins intentionally omitted for this test
function formatListRegistered(r) {
  const frames = (r.frames ?? []).map((f) => f.label ?? f.id).join(', ');
  return \`Frames: [\${frames}]\`;
}
`;
    const result = checkFormatterKeys('module-tokenizer', cfg, () => seededSrc);
    expect(result).toBeNull();
  });

  it('goes fatal: an allowlisted file that does not resolve on disk is a hard FATAL, never a silent skip', () => {
    const cfg = {
      file: 'packages/mcp-server/src/tools/does-not-exist-fixture.ts',
      functionName: 'formatSeeded',
      paramName: 'r',
      keys: ['alpha'],
      sourceType: 'n/a — fixture',
    };
    const result = checkFormatterKeys('seeded-missing-file', cfg);
    expect(result).not.toBeNull();
    expect(result.fatal).toBe(true);
    expect(result.detail).toContain('does not exist on disk');
  });

  it('reflects the real, built tree: all 4 allowlisted rule-1 targets pass (verified 2026-08-26, ' +
    'post tasks 1.2/2.1/2.2/3.1/3.2 landing get-contents/get-autorec/list-registered/wall-flags)',
  () => {
    const allowlist = FORMATTER_COMPLETENESS_ALLOWLIST;
    expect(Object.keys(allowlist)).toEqual(['wall', 'module-autoanimations', 'module-itempiles', 'module-tokenizer']);
    const { offenders, fatals } = runRule1();
    expect(fatals).toEqual([]);
    expect(offenders).toEqual([]);
  });
});

describe('check-formatter-completeness — rule 2: object-keys-on-class-instance (virtual-program fixtures)', () => {
  it('goes red: Object.keys() called on a class-instance-typed value', () => {
    const { program, checker } = buildVirtualProgram({
      '/virtual/seeded-red.ts': `
class Foo { a = 1; b = 2; }
const f = new Foo();
const keys = Object.keys(f);
`,
    });
    const offenders = findObjectKeysOffenders(program, checker);
    expect(offenders.length).toBe(1);
    expect(offenders[0].classification).toBe('class-instance');
    expect(offenders[0].line).toBe(4);
  });

  it('goes red: an unresolvable (any-typed) argument defaults to FLAGGED (conservative posture)', () => {
    const { program, checker } = buildVirtualProgram({
      '/virtual/seeded-any.ts': `
function test(anyArg: any) {
  return Object.keys(anyArg);
}
`,
    });
    const offenders = findObjectKeysOffenders(program, checker);
    expect(offenders.length).toBe(1);
    expect(offenders[0].classification).toBe('unresolved');
  });

  it('goes green: Object.keys() on a plain object / Record / interface-shaped value is not flagged', () => {
    const { program, checker } = buildVirtualProgram({
      '/virtual/seeded-green.ts': `
interface Bar { x: number; }
const bar: Bar = { x: 1 };
const keys1 = Object.keys(bar);
const rec: Record<string, unknown> = {};
const keys2 = Object.keys(rec);
`,
    });
    const offenders = findObjectKeysOffenders(program, checker);
    expect(offenders.length).toBe(0);
  });

  it('goes green: a same-line GATE-SUPPRESS[formatter-completeness] anchor skips a class-instance call', () => {
    const { program, checker } = buildVirtualProgram({
      '/virtual/seeded-suppressed.ts': `
class Foo { a = 1; }
const f = new Foo();
const keys = Object.keys(f); // GATE-SUPPRESS[formatter-completeness]: seeded fixture, verified-safe
`,
    });
    const offenders = findObjectKeysOffenders(program, checker);
    expect(offenders.length).toBe(0);
  });

  it('goes green: a line-above GATE-SUPPRESS[formatter-completeness] anchor also skips a class-instance call', () => {
    const { program, checker } = buildVirtualProgram({
      '/virtual/seeded-suppressed-above.ts': `
class Foo { a = 1; }
const f = new Foo();
// GATE-SUPPRESS[formatter-completeness]: seeded fixture, verified-safe
const keys = Object.keys(f);
`,
    });
    const offenders = findObjectKeysOffenders(program, checker);
    expect(offenders.length).toBe(0);
  });
});

describe('check-formatter-completeness — rule 2: real tree (2026-08-26, feeds task 4.2\'s baseline seed)', () => {
  let result: { offenders: any[]; fatals: any[] };

  beforeAll(() => {
    result = runRule2();
  }, 60000);

  it('has zero fatals — both package src dirs and tsconfigs resolve on disk', () => {
    expect(result.fatals).toEqual([]);
  });

  it('D15: wall.ts\'s Object.keys(w.flags ?? {}) plain-bag call is NOT flagged — Rule 2 correctly ' +
    'discriminates a plain-object Object.keys() call from a class-instance one', () => {
    const wallOffenders = result.offenders.filter((o) => o.file === 'packages/mcp-server/src/tools/wall.ts');
    expect(wallOffenders).toEqual([]);
  });

  it('discloses the real-tree legacy offender count for task 4.2\'s gates-baseline.json seed: 36 as of ' +
    '2026-08-26, ALL classification=unresolved (any-typed arguments) — zero true class-instance hits ' +
    '(BUG-849\'s registryNames() pattern is already fixed by task 3.1, a dependency of this task)',
  () => {
    expect(result.offenders.length).toBe(36);
    expect(result.offenders.every((o) => o.classification === 'unresolved')).toBe(true);
  });

  it('goes fatal: a scan root that does not exist on disk is a hard FATAL, never a silent clean read', () => {
    const { offenders, fatals } = runRule2([
      { name: 'bogus', tsconfig: 'packages/bogus-package/tsconfig.json', srcDir: 'packages/bogus-package/src' },
    ]);
    expect(offenders).toEqual([]);
    expect(fatals.length).toBe(1);
    expect(fatals[0].detail).toContain('does not exist on disk');
  });
}, 60000);
