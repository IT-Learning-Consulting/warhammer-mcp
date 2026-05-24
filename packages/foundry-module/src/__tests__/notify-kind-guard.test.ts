import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC_DIR, rel), 'utf-8');
}

describe('NotifyKind drift guards (BUG-141)', () => {
  it('forbids documentLabel-as-NotifyKind fallback casts in CRUD factories', () => {
    const embeddedFactory = read('utils/embeddedCRUDFactory.ts');
    const worldFactory = read('utils/worldCRUDFactory.ts');
    expect(embeddedFactory).not.toMatch(/documentLabel\s+as\s+NotifyKind/);
    expect(worldFactory).not.toMatch(/documentLabel\s+as\s+NotifyKind/);
  });

  it('forbids direct "as NotifyKind" casts in ownership handler', () => {
    const ownership = read('handlers/ownership.ts');
    expect(ownership).not.toMatch(/\bas\s+NotifyKind\b/);
  });
});
