import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/skills/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@foundry-mcp/shared': resolve(__dirname, 'shared/src/index.ts'),
    },
  },
});
