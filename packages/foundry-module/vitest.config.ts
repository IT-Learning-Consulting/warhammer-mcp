import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // Phase 0 (MCP Code-Quality Hardening v1, 0.7.3): the characterization suite added many
    // files that import the 6372-line data-access.ts, inflating the parallel collect/transform
    // load. Under that contention, import-heavy beforeAll/init hooks (effect-crud's dynamic
    // @foundry-mcp/shared pre-warm; system-guard's init import) exceed the vitest defaults
    // (5s test / 10s hook). The tests pass in <2s in isolation — these are pure load headroom,
    // not masking a hang. Raised so the full-suite L2/CI gate is reliable on dev + 2-core CI.
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.*', '**/*.spec.*'],
    },
  },
  resolve: {
    alias: {
      '@foundry-mcp/shared': resolve(__dirname, '../../shared/src/index.ts'),
    },
  },
});
