import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('BUG-154 build script contract', () => {
  it('build runs runtime bundling (build:bundle) before schema validation', () => {
    const pkgPath = resolve(__dirname, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const build = String(pkg.scripts?.build ?? '');
    const buildBundle = String(pkg.scripts?.['build:bundle'] ?? '');

    expect(build).toContain('build:bundle');
    expect(build).toContain('validate-tool-schemas');
    expect(buildBundle).toContain('esbuild dist/index.js');
    expect(buildBundle).toContain('esbuild dist/backend.js');
    expect(buildBundle).toContain('backend.bundle.cjs');
  });
});
