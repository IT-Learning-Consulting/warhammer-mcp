// .dependency-cruiser.js — MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.5 (R0.3 / CCR-Domain-Boundary).
//
// Architectural boundary guard for the warhammer-mcp monorepo. Wired into the build via `audit:boundaries`.
// Four rules (PRD §8 CCR-Domain-Boundary):
//   - no-circular            (error)  — no import cycles anywhere.
//   - shared-no-runtime-deps (error)  — shared/ is the dependency leaf; it must not import from packages/.
//   - handler-isolation      (warn)   — a foundry-module handler should not import a sibling handler directly
//                                        (share via data-access / utils). WARN: surfaced, non-blocking, until
//                                        the Phase-3 refactor untangles existing cross-handler imports.
//   - no-cross-service-import (error) — STUBBED inert: matches `**/services/<svc>/**` importing a DIFFERENT
//                                        service. No services/ dirs exist yet (Phase 3 creates them), so the
//                                        rule matches nothing today and activates automatically when they do.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Import cycles make modules impossible to reason about / refactor in isolation.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'shared-no-runtime-deps',
      severity: 'error',
      comment: 'shared/ is the leaf dependency — it must not import from packages/ (would invert the graph).',
      from: { path: '^shared/src' },
      to: { path: '^packages/' },
    },
    {
      name: 'handler-isolation',
      severity: 'warn',
      comment: 'A handler must not import a sibling handler directly — share via data-access / utils instead.',
      from: { path: '^packages/foundry-module/src/handlers/([^/]+)\\.ts$' },
      to: {
        path: '^packages/foundry-module/src/handlers/([^/]+)\\.ts$',
        pathNot: ['^packages/foundry-module/src/handlers/$1\\.ts$'],
      },
    },
    {
      name: 'no-cross-service-import',
      severity: 'error',
      comment: 'A service must not import another service directly (STUBBED inert until Phase 3 creates services/).',
      from: { path: '^packages/[^/]+/src/services/([^/]+)/' },
      to: {
        path: '^packages/[^/]+/src/services/([^/]+)/',
        pathNot: ['^packages/[^/]+/src/services/$1/'],
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|node_modules)/|\\.(test|spec)\\.|/__tests__/|\\.bundle\\.cjs$|\\.d\\.ts$' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types'],
    },
  },
};
