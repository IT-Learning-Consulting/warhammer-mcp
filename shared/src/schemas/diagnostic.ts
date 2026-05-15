// Phase 1 mcp_diagnostic_tool — Diagnostic umbrella schemas (Tier 1: 3 actions).
//
// Single `diagnostic` MCP tool with v1 actions: recent-errors / world-issues /
// support-snapshot. Action enum is intentionally open (CCR-7 / PRD ADR-009):
// Phase 2 adds Tier 2 content-health actions, Phase 3 adds Tier 3 dev-
// introspection actions, v2 adds Tier 4 exec-script. The discriminated-union
// shape lets each phase land additively without refactor.
//
// CCR-1 / HC1 read-only purity: NO write-side fields anywhere (no payloads,
// no _id, no changes). Inputs are pure filters; outputs are pure data.
// CCR-3 / BUG-069: every response interface is a concrete shape, no <any>.
// CCR-Schema-Fidelity: foundry-side fields mirror the canonical v13 surfaces —
//   - game.issues.{packageCompatibilityIssues, usabilityIssues, validationFailures}
//   - Hooks.on('error') payload: (location: string, error: Error, data?: object)
//   - SupportDetails.generateSupportReport() -> SupportReportData

import { z } from 'zod';

// ── Capture-surface enums (reused by foundry-module RuntimeEventStore) ──────

// Severity narrowing for recent-errors. Match the union the foundry-module
// RuntimeEventStore writes; keep them as discriminator-friendly literals so
// TS can narrow on the wire shape.
export const RECENT_ERROR_SEVERITIES = ['error', 'warn'] as const;
export const RECENT_ERROR_SOURCES = [
  'window',             // window.addEventListener('error')
  'unhandledrejection', // window.addEventListener('unhandledrejection')
  'hooks',              // Hooks.on('error', ...)
  'console.warn',       // console.warn wrap
  'init',               // captureInitError() — pre-existing init-phase channel
] as const;

export type RuntimeEventSeverity = (typeof RECENT_ERROR_SEVERITIES)[number];
export type RuntimeEventSource = (typeof RECENT_ERROR_SOURCES)[number];

// ── Per-action input schemas ────────────────────────────────────────────────

export const DiagnosticRecentErrorsInput = z.object({
  action: z.literal('recent-errors'),
  severity: z.enum(RECENT_ERROR_SEVERITIES).optional(),
  source: z.enum(RECENT_ERROR_SOURCES).optional(),
  // FIFO cap is 200 server-side; limit only narrows what we return.
  limit: z.number().int().positive().max(200).optional(),
  // Returns events with ts >= since (epoch ms). Optional.
  since: z.number().int().nonnegative().optional(),
}).strict();

export const DiagnosticWorldIssuesInput = z.object({
  action: z.literal('world-issues'),
  // Filter to specific buckets. Default = all three.
  buckets: z
    .array(z.enum(['packageCompatibility', 'usability', 'validation']))
    .nonempty()
    .optional(),
}).strict();

export const DiagnosticSupportSnapshotInput = z.object({
  action: z.literal('support-snapshot'),
  // SupportDetails.generateSupportReport() includes per-module breakdown by
  // default; pass false to omit the modules[] section if the LLM only needs
  // version / world / system identifiers.
  includeModules: z.boolean().optional(),
}).strict();

// ── Discriminated union (open shape per CCR-7) ─────────────────────────────

export const DiagnosticToolInput = z.discriminatedUnion('action', [
  DiagnosticRecentErrorsInput,
  DiagnosticWorldIssuesInput,
  DiagnosticSupportSnapshotInput,
]);

export type DiagnosticToolInputType = z.infer<typeof DiagnosticToolInput>;
export type DiagnosticRecentErrorsInputType = z.infer<typeof DiagnosticRecentErrorsInput>;
export type DiagnosticWorldIssuesInputType = z.infer<typeof DiagnosticWorldIssuesInput>;
export type DiagnosticSupportSnapshotInputType = z.infer<typeof DiagnosticSupportSnapshotInput>;

// ── Response shapes (concrete typed; CCR-3 / BUG-069 anti-`any`) ───────────

export interface RuntimeEvent {
  ts: number;           // Date.now() at capture
  severity: RuntimeEventSeverity;
  source: RuntimeEventSource;
  message: string;
  stack?: string;
  // Best-effort location string (file:line:col or hook-name); always serialisable.
  location?: string;
  // 'init' for entries mirrored from the pre-existing captureInitError() path;
  // 'runtime' for entries pushed by installRuntimeCapture surfaces.
  phase?: 'init' | 'runtime';
}

export interface RecentErrorsResponse {
  events: RuntimeEvent[];
  // Total entries currently held in the ring buffer (<= 200). Useful to detect
  // FIFO eviction client-side without burning a follow-up call.
  bufferSize: number;
  // True if the buffer reached its cap at least once this session. Doesn't
  // distinguish stable-at-cap vs has-evicted; useful as a "you may have lost
  // older events" signal.
  bufferFull: boolean;
}

// game.issues shape per v13 ClientIssues. Each bucket is a record of
// id -> issue. Values are kept as Record<string, unknown> on the wire (the
// LLM consumer doesn't need the typed shape, and the inner structure is
// system-dependent). Concrete enough to satisfy CCR-3 without overcommitting
// to v13-internal types.
export interface WorldIssuesResponse {
  packageCompatibilityIssues: Record<string, unknown>;
  usabilityIssues: Record<string, unknown>;
  validationFailures: Record<string, unknown>;
  // Convenience totals — sum of keys in each bucket. Saves the LLM a count.
  counts: {
    packageCompatibility: number;
    usability: number;
    validation: number;
  };
}

// SupportReportData shape — minimum guaranteed v13 fields per
// foundry_docs/_global/interfaces/SupportReportData.md. We pass through
// whatever Foundry hands us; the typed surface here is the floor, not the
// ceiling. `modules` is gated by input.includeModules.
export interface SupportSnapshotResponse {
  coreVersion: string;
  systemVersion: string;
  systemId: string;
  worldId: string;
  worldTitle?: string;
  // Active module count is always present. Per-module breakdown only when
  // includeModules is omitted or true.
  activeModuleCount: number;
  modules?: Array<{ id: string; title?: string; version?: string }>;
  // Catch-all for any other fields SupportDetails attaches (performance
  // metrics, client info, etc.). LLM can introspect as needed.
  raw?: Record<string, unknown>;
}

// Filter input the foundry-module readRuntimeBuffer() accepts. Mirrors the
// DiagnosticRecentErrorsInput shape without the discriminator — handlers
// strip `action` before forwarding.
export interface RuntimeEventFilter {
  severity?: RuntimeEventSeverity;
  source?: RuntimeEventSource;
  limit?: number;
  since?: number;
}
