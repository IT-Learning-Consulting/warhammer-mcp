// @ts-check
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import boundaries from 'eslint-plugin-boundaries';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

/*
 * ESLint v9 flat config — migrated from .eslintrc.json
 * (MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.3; user decision Q2 -> v9 flat + typescript-eslint v8).
 *
 * Preserves all 15 prior .eslintrc.json rules, and adds:
 *   - R0.5  async-safety: no-floating-promises + no-misused-promises at ERROR (typed; production .ts only).
 *           PRD correction - checksVoidReturn uses `arguments:false` (NOT `attributes`, which is JSX-only);
 *           Foundry Hooks.on(evt, asyncFn) passes async callbacks as fn ARGUMENTS.
 *   - R0.4  complexity caps at WARN globally; scripts/lint-ratchet.mjs re-lints changed files at ERROR.
 *           A services/ override caps file length at 600 (ERROR) - inert until the Phase-3 split.
 *   - R0.3/CCR-Domain-Boundary: eslint-plugin-boundaries registered; rules off (inert) until services/ exists.
 *
 * Type-aware linting (projectService) is scoped to PRODUCTION .ts only. Test files, *.config.ts, and the
 * root tests/ skill-harness live outside every tsconfig (each excludes *.test.* etc.), so type-aware rules
 * would throw "not found in project" on them; they get the non-typed TS ruleset instead.
 *
 * The 91 legacy errors that the v8 recommended set / broadened JS coverage surfaced on existing code are
 * demoted to WARN here (ratchet model: "legacy files warn"). The lint-ratchet (0.3.2) re-errors changed
 * files. The 10 plan-mandated promise-rule violations were FIXED at the source (user decision 2026-06-13),
 * so the promise rules stay at ERROR globally.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Files outside every tsconfig - excluded from type-aware linting (no projectService). */
const NON_PROJECT_TS = [
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/__tests__/**/*.ts',
  '**/*.bench.ts',
  '**/*.config.ts',
  'tests/**/*.ts',
];

/** Test/spec files - relaxed, non-typed. */
const TEST_GLOBS = ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts', '**/*.bench.ts', 'tests/**/*.ts'];

export default tseslint.config(
  // 1 - Global ignores (replaces .eslintrc.json `ignorePatterns` + build artifacts + generated/type-decl files).
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/*.tsbuildinfo',
      '**/coverage/**',
      '**/*.bundle.cjs',
      '**/*.d.ts',
      'packages/foundry-module/generated-maps/**',
    ],
  },

  // 2 - Base JS recommended (all linted files).
  js.configs.recommended,

  // 3 - Preserved base (non-plugin) rules from .eslintrc.json (all files).
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'warn',
      'object-shorthand': 'warn',
      'prefer-template': 'warn',
      'no-empty': 'warn',
      'no-async-promise-executor': 'warn',
    },
  },

  // 4 - TypeScript: recommended + preserved TS rules + complexity caps (all .ts, non-typed).
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    rules: {
      // TS resolves identifiers (incl. Foundry globals); base no-undef is redundant + false-positives.
      'no-undef': 'off',
      // typescript-eslint/recommended bumps core prefer-const to error; the old config had it at warn (preserved).
      'prefer-const': 'warn',
      // --- preserved @typescript-eslint rules from .eslintrc.json ---
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      // --- legacy debt demoted to WARN (ratchet model; not plan-mandated at error) ---
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      // --- R0.4 complexity caps (WARN globally; ratcheted to ERROR on changed files) ---
      // skipComments (user policy 2026-06-16): comments do NOT count toward the line caps.
      'max-lines-per-function': ['warn', { max: 60, skipComments: true }],
      complexity: ['warn', 10],
      'max-depth': ['warn', 3],
      'max-params': ['warn', 4],
      'max-lines': ['warn', { max: 400, skipComments: true }],
    },
  },

  // 4b - Phase 13 (R13.2) hygiene-sweep advisory rules. WARN-only — they NEVER gate the build
  //      (`npm run build` runs no lint step; lint-ratchet enforces the complexity caps ONLY, via its own
  //      self-contained config). They flag, for organic cleanup, the magic strings/numbers R13.2 did not
  //      mechanically migrate: residual inline module-id literals (the +27 requireModuleActive(...) /
  //      game.modules.get(...) sites the acceptance left alone) and raw numeric caps. Scoped to
  //      foundry-module src; constants/ (the named-constant home) + tests are exempt.
  //      Uses @typescript-eslint/no-magic-numbers (TS-aware superset of core no-magic-numbers — ignores
  //      numeric-literal types/enums that the core rule false-flags on .ts).
  {
    files: ['packages/foundry-module/src/**/*.ts'],
    ignores: ['**/constants/**', ...TEST_GLOBS],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: "CallExpression[callee.name='requireModuleActive'] > Literal[value]",
          message:
            'Inline module-id literal — import the named constant from constants/moduleIds.js (Phase 13 R13.2).',
        },
        {
          selector: "CallExpression[callee.property.name='get'][callee.object.property.name='modules'] > Literal[value]",
          message:
            'Inline module-id literal in game.modules.get(...) — import from constants/moduleIds.js (Phase 13 R13.2).',
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          enforceConst: false,
          detectObjects: false,
        },
      ],
    },
  },

  // 5 - Type-aware linting for PRODUCTION .ts only (R0.5). Existing violations were fixed, so these stay ERROR.
  {
    files: ['**/*.ts'],
    ignores: NON_PROJECT_TS,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false } }],
      '@typescript-eslint/await-thenable': 'error',
    },
  },

  // 6 - eslint-plugin-boundaries registered; rules INERT until the Phase-3 services/ split (CCR-Domain-Boundary).
  {
    files: ['packages/*/src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      // Phase-3 placeholder taxonomy; rules stay off so nothing is enforced yet.
      'boundaries/elements': [
        { type: 'shared', pattern: 'shared/src/**' },
        { type: 'handler', pattern: 'packages/foundry-module/src/handlers/**' },
        { type: 'tool', pattern: 'packages/mcp-server/src/tools/**' },
      ],
    },
    rules: {
      'boundaries/element-types': 'off',
      'boundaries/no-private': 'off',
      'boundaries/entry-point': 'off',
    },
  },

  // 7 - Test files: relaxed + non-typed (they sit outside every tsconfig -> no projectService).
  {
    files: TEST_GLOBS,
    languageOptions: {
      globals: {
        ...globals.node,
        // vitest globals (foundry-module enables vitest/globals; mcp-server imports explicitly).
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        suite: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      complexity: 'off',
      'no-console': 'off',
    },
  },

  // 8 - Node scripts + config files (.mjs/.cjs/.js): node globals, console allowed, no TS plugin.
  //     Legacy scripts were never linted by the old config (--ext .ts,.js + ignored *.js) -> base rules WARN.
  {
    files: ['**/*.{mjs,cjs,js}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'warn',
    },
  },

  // 9 - services/ override: hard 600-line cap at ERROR. Inert until Phase 3 creates services/ (CCR-Complexity-Caps).
  {
    files: ['**/services/**/*.ts'],
    rules: {
      'max-lines': ['error', { max: 600, skipComments: true }],
    },
  },

  // 9b - Phase 8 (R8.4): scene-atmosphere split grandfather (mirrors block 9). The 67-action bundle was
  // split into per-sub-family formatter files + a definitions.ts schema literal as a VERBATIM move; each
  // file keeps a hard 600-line cap. Per-function/complexity caps are relaxed here so the moved formatResult
  // switch + the 509-line definitions literal don't ERROR on the new-file caps.
  {
    files: ['**/tools/modules/scene-atmosphere/**/*.ts'],
    rules: {
      'max-lines': ['error', { max: 600, skipComments: true }],
      'max-lines-per-function': 'off',
      complexity: 'off',
      'max-depth': 'off',
      'max-params': 'off',
    },
  },

  // 9c - Phase 8 (R8.1/R8.2): tool-instantiation factory (build-tools.ts) — a flat declarative manifest
  // (one `new XTool(deps)` per tool). Per-function caps don't apply; keeps the 600-line file cap.
  {
    files: ['**/tools/factory/**/*.ts'],
    rules: {
      'max-lines': ['error', { max: 600, skipComments: true }],
      'max-lines-per-function': 'off',
      complexity: 'off',
    },
  },

  // 10 - Prettier: disable conflicting formatting rules, then run prettier as a WARN-level rule (preserved).
  eslintConfigPrettier,
  {
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
);
