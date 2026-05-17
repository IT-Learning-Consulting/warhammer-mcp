// Drift guard — every handler async method that performs a Foundry document
// write must also fire a notify.* call. Bracket-counted method-body extraction
// (NOT AST) to mirror notify-migration-guard.test.ts style and stay under 5s.
//
// PRD: mcp_notify_coverage_v1 §5 Phase 3 R3.3.
// Plan: .agents/plans/features/mcp-notify-coverage-phase3.md task 3.10.

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const HANDLERS_DIR = path.resolve(__dirname, '..', 'handlers');

// Foundry write APIs that signal a state-changing call.
const WRITE_PATTERN = /\.(create|update|delete|createEmbeddedDocuments|deleteEmbeddedDocuments|updateEmbeddedDocuments)\s*\(/;

// Handler files that legitimately contain no writes. Each entry must justify
// why a notify call is not required.
const WRITE_EXEMPT = new Set<string>([
  'diagnostic.ts',   // CCR-1 — read-only diagnostic surface
  'filepicker.ts',   // notify.warn round-trip handler — no Foundry-document writes (only ui.notifications via notify dispatcher)
]);

function extractMethodBodies(source: string): string[] {
  const bodies: string[] = [];
  const asyncRe = /\basync\s+\w+\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = asyncRe.exec(source)) !== null) {
    const start = source.indexOf('{', m.index);
    if (start === -1) continue;
    let depth = 0;
    let i = start;
    for (; i < source.length; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    bodies.push(source.slice(start, i + 1));
  }
  return bodies;
}

describe('handler notify coverage', () => {
  it('every async handler method that performs a write also calls notify.*', () => {
    const handlerFiles = fs.readdirSync(HANDLERS_DIR)
      .filter((f) => f.endsWith('.ts') && !WRITE_EXEMPT.has(f));

    const violations: { file: string; snippet: string }[] = [];
    for (const filename of handlerFiles) {
      const src = fs.readFileSync(path.join(HANDLERS_DIR, filename), 'utf-8');
      for (const body of extractMethodBodies(src)) {
        if (WRITE_PATTERN.test(body) && !/\bnotify\./.test(body)) {
          const writeLine = body.split('\n').find((l) => WRITE_PATTERN.test(l))?.trim() ?? '(unknown)';
          violations.push({ file: filename, snippet: writeLine });
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Handler method(s) perform writes without paired notify:\n` +
        violations.map((v) => `  ${v.file}: ${v.snippet}`).join('\n'),
      );
    }
    expect(violations).toHaveLength(0);
  });
});
