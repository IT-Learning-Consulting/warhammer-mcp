// mcp_code_quality_v2 Phase C2 (task 6.1) — F04 regression test for check-inputschema-nonscalar.mjs.
//
// New precedent (deliberate, plan-stated): first gate script with an automated regression test.
// Proves the detection method actually catches the F04 defect class (untyped array param shaped
// like the pre-fix narrate `message`) — not just a happy-path smoke of the swept tree.

import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'check-inputschema-nonscalar.mjs');
const FIXTURE = path.join(HERE, 'fixtures', 'inputschema-untyped-param.fixture.ts');

function runGate(target?: string): { code: number; output: string } {
  try {
    const output = execFileSync('node', target ? [SCRIPT, target] : [SCRIPT], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, output };
  } catch (e: any) {
    return { code: e.status ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('check-inputschema-nonscalar (CCR-V8 gate)', () => {
  it('flags EXACTLY 1 violation on the F04 untyped-array fixture, attributing tool + property', () => {
    const { code, output } = runGate(FIXTURE);
    expect(code).toBe(1);
    expect(output).toMatch(/1 violation\(s\)/);
    expect(output).toContain('fixture-untyped-param-tool');
    expect(output).toContain('"message"');
    // the typed sibling property must NOT be flagged
    expect(output).not.toContain('"action"');
  });

  it('passes clean on the real swept tools tree (green-on-land)', () => {
    const { code, output } = runGate();
    expect(code).toBe(0);
    expect(output).toContain('OK');
  });
});
