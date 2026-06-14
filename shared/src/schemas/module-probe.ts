// Module Integration v1 Phase 1 — module-probe shared schemas.
//
// Generic types consumed by BOTH mcp-server and foundry-module packages.
// CCR-5: only generic/reused types live here. Module-specific schemas go in
// package-local tools/modules/<id>/schemas.ts files.
//
// Two actions:
//   is-active  { moduleId } — returns { id, active, title?, version? }
//   list-active             — returns { modules: Array<{id,title,version}> }
//
// Anchors:
//   - Phase 1 module_integration_v1 acceptance criterion #1.
//   - CCR-5: module-specific Zod stays package-local.
//   - shared/src/schemas/setting.ts pattern: per-action .strict() objects.

import { z } from 'zod';

// ── Per-action Input schemas ─────────────────────────────────────────────────

export const ModuleProbeIsActiveInput = z.object({
  action: z.literal('is-active'),
  moduleId: z.string().min(1, 'moduleId is required for is-active'), // not a document id — leave bare (Phase 1 design)
}).strict();

export const ModuleProbeListActiveInput = z.object({
  action: z.literal('list-active'),
}).strict();

// ── Discriminated union ──────────────────────────────────────────────────────

export const ModuleProbeInput = z.discriminatedUnion('action', [
  ModuleProbeIsActiveInput,
  ModuleProbeListActiveInput,
]);

// ── Inferred types ───────────────────────────────────────────────────────────

export type ModuleProbeIsActiveInputType = z.infer<typeof ModuleProbeIsActiveInput>;
export type ModuleProbeListActiveInputType = z.infer<typeof ModuleProbeListActiveInput>;
export type ModuleProbeInputType = z.infer<typeof ModuleProbeInput>;

// ── Response interfaces ──────────────────────────────────────────────────────

export interface ModuleIsActiveResult {
  id: string;
  active: boolean;
  title?: string;
  version?: string;
}

export interface ModuleListActiveResult {
  modules: Array<{ id: string; title: string; version: string }>;
}
