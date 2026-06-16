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
import { FoundryUuid } from './branded-ids.js';

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

// ── Scope discriminator (Phase 2 Tier 2 scans) ─────────────────────────────
// Flat shape (NOT a nested discriminatedUnion) — handler-layer enforces
// id-required when type !== 'world'. See plan §Design Decisions + subagent D.
export const ScopeInput = z.object({
  type: z.enum(['actor', 'item', 'compendium', 'world']),
  id: z.string().optional(),
  confirmExpensive: z.boolean().optional(),
});
export type ScopeInputType = z.infer<typeof ScopeInput>;

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

// ── Phase 2 Tier 2 inputs (content-health scans) ───────────────────────────

export const DiagnosticValidateWfrpConfigInput = z.object({
  action: z.literal('validate-wfrp-config'),
}).strict();

export const DiagnosticScanBrokenUuidsInput = z.object({
  action: z.literal('scan-broken-uuids'),
  scope: ScopeInput,
}).strict();

export const DiagnosticScanCareerRefsInput = z.object({
  action: z.literal('scan-career-refs'),
  scope: ScopeInput,
}).strict();

export const DiagnosticValidateAeScriptsInput = z.object({
  action: z.literal('validate-ae-scripts'),
  scope: ScopeInput,
}).strict();

// ── Phase 3 Tier 3 inputs (developer introspection) ────────────────────────
// HC4: action enum closes at exactly 11 literals with Phase 3. The
// `_exhaustive: never` sentinel in handlers/diagnostic.ts dispatchDiagnostic
// switch enforces match-up at compile time.

export const DiagnosticInspectDocumentInput = z.object({
  action: z.literal('inspect-document'),
  uuid: FoundryUuid,
  // Default: counts + first-10 preview of items/effects. true returns full arrays.
  includeFull: z.boolean().optional(),
}).strict();

export const DiagnosticHookInventoryInput = z.object({
  action: z.literal('hook-inventory'),
  // Substring filter on hook name. Case-sensitive.
  hookFilter: z.string().optional(),
  // Opt-in best-effort namespace breakdown via fn.name parse (Q&A 2026-05-18 Q2).
  // Anonymous arrows bucket under '<unknown>'. Default false (tight envelope).
  byNamespace: z.boolean().optional(),
}).strict();

export const DiagnosticModuleInventoryInput = z.object({
  action: z.literal('module-inventory'),
  // Omit inactive modules. Default false (full inventory).
  onlyActive: z.boolean().optional(),
}).strict();

export const DiagnosticSettingsInventoryInput = z.object({
  action: z.literal('settings-inventory'),
  // Exact-match namespace filter (e.g. 'warhammer-mcp' returns only that namespace).
  namespaceFilter: z.string().optional(),
}).strict();

// ── Discriminated union (open shape per CCR-7; HC4 enum-bounded at 11) ─────

export const DiagnosticToolInput = z.discriminatedUnion('action', [
  DiagnosticRecentErrorsInput,
  DiagnosticWorldIssuesInput,
  DiagnosticSupportSnapshotInput,
  DiagnosticValidateWfrpConfigInput,
  DiagnosticScanBrokenUuidsInput,
  DiagnosticScanCareerRefsInput,
  DiagnosticValidateAeScriptsInput,
  DiagnosticInspectDocumentInput,
  DiagnosticHookInventoryInput,
  DiagnosticModuleInventoryInput,
  DiagnosticSettingsInventoryInput,
]);

export type DiagnosticToolInputType = z.infer<typeof DiagnosticToolInput>;
export type DiagnosticRecentErrorsInputType = z.infer<typeof DiagnosticRecentErrorsInput>;
export type DiagnosticWorldIssuesInputType = z.infer<typeof DiagnosticWorldIssuesInput>;
export type DiagnosticSupportSnapshotInputType = z.infer<typeof DiagnosticSupportSnapshotInput>;
export type DiagnosticValidateWfrpConfigInputType = z.infer<typeof DiagnosticValidateWfrpConfigInput>;
export type DiagnosticScanBrokenUuidsInputType = z.infer<typeof DiagnosticScanBrokenUuidsInput>;
export type DiagnosticScanCareerRefsInputType = z.infer<typeof DiagnosticScanCareerRefsInput>;
export type DiagnosticValidateAeScriptsInputType = z.infer<typeof DiagnosticValidateAeScriptsInput>;
export type DiagnosticInspectDocumentInputType = z.infer<typeof DiagnosticInspectDocumentInput>;
export type DiagnosticHookInventoryInputType = z.infer<typeof DiagnosticHookInventoryInput>;
export type DiagnosticModuleInventoryInputType = z.infer<typeof DiagnosticModuleInventoryInput>;
export type DiagnosticSettingsInventoryInputType = z.infer<typeof DiagnosticSettingsInventoryInput>;

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

// ── Phase 2 Tier 2 response shapes ─────────────────────────────────────────

export interface ConfigKeyFailure {
  key: string;
  expected: string;
  actual: string;
}
export interface ValidateWfrpConfigResponse {
  ok: boolean;
  failures: ConfigKeyFailure[];
}

export interface BrokenUuid {
  docId: string;
  docName: string;
  field: 'description' | 'gmdescription' | 'biography';
  uuid: string;
  // Present when the broken UUID lives on actor.items[i] rather than the
  // top-level doc itself.
  embeddedItemId?: string;
}
export interface ScanBrokenUuidsResponse {
  checked: number;
  broken: number;
  uuidsBroken: number;
  // Wall-time for the walk (ms). Surfaced for HC3 / NF2 soft-threshold reporting.
  elapsedMs?: number;
  // Counts-only mode (world scope without confirmExpensive) omits `details`.
  details?: BrokenUuid[];
}

export interface UnresolvedCareerRef {
  actorName: string;
  careerName: string;
  refType: 'skill' | 'talent';
  name: string;
}
export interface ScanCareerRefsResponse {
  checked: number;
  unresolved: number;
  elapsedMs?: number;
  details?: UnresolvedCareerRef[];
}

export interface InvalidAeScript {
  docId: string;
  docName: string;
  aeId: string;
  aeName: string;
  issue: 'syntax-error' | 'unknown-trigger' | 'schema-drift';
  trigger?: string;
  error?: string;     // syntax-error message body
  expected?: string;  // shape note (schema-drift)
}
export interface ValidateAeScriptsResponse {
  checked: number;
  invalid: number;
  // Pre-v11 non-array scriptData docs — separate finding per Q&A.
  schemaDrift: number;
  elapsedMs?: number;
  details?: InvalidAeScript[];
}

// ── Phase 3 Tier 3 response shapes (developer introspection) ───────────────

export interface InspectDocumentEffectPreview {
  id: string;
  name: string;
  disabled?: boolean;
  transfer?: boolean;
}
export interface InspectDocumentItemPreview {
  id: string;
  name: string;
  type?: string;
  img?: string;
}
export interface InspectDocumentResponse {
  uuid: string;
  documentName: string;
  type: string;
  name: string;
  sheetClassName?: string;
  system: Record<string, unknown>;
  flags: Record<string, unknown>;
  ownership: Record<string, number>;
  effects: { count: number; preview: InspectDocumentEffectPreview[] };
  items: { count: number; preview: InspectDocumentItemPreview[] };
  // Present on Actor docs; absent on Item / JournalEntry / etc.
  prototypeToken?: Record<string, unknown>;
}

export interface HookDriftEntry {
  threshold: number;
  actual: number;
}
export interface HookInventoryEntry {
  name: string;
  count: number;
  // Present only when input.byNamespace === true (opt-in, Q&A 2026-05-18 Q2).
  byNamespace?: Record<string, number>;
  drift?: HookDriftEntry;
}
export interface HookInventoryDriftSummary {
  hook: string;
  count: number;
  threshold: number;
}
export interface HookInventoryResponse {
  totalHooks: number;
  totalListeners: number;
  hooks: HookInventoryEntry[];
  // Always present (may be empty). Separate from per-entry .drift so the
  // consumer can fast-scan flagged hooks without walking the full list.
  drift: HookInventoryDriftSummary[];
}

export interface ModuleInventoryEntry {
  id: string;
  title: string;
  version: string;
  active: boolean;
  // Raw numeric code from CONST.PACKAGE_AVAILABILITY_CODES.
  availability: number;
  // Resolved label (e.g. 'VERIFIED', 'REQUIRES_UPDATE') or 'UNKNOWN' on miss.
  availabilityLabel: string;
  incompatibleWithCoreVersion: boolean;
  unavailable: boolean;
}
export interface ModuleInventoryResponse {
  total: number;
  active: number;
  modules: ModuleInventoryEntry[];
}

export interface SettingsInventoryEntry {
  namespace: string;
  key: string;
  scope: string;
  // Best-effort label: 'Boolean' | 'String' | 'Number' | 'Object' |
  // 'DataModel:<name>' | fallback string.
  typeLabel: string;
  default: unknown;
  current: unknown;
}
export interface SettingsInventoryResponse {
  total: number;
  settings: SettingsInventoryEntry[];
}
