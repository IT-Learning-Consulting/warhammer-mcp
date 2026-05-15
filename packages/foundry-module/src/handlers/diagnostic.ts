// Phase 1 mcp_diagnostic_tool — Diagnostic umbrella dispatcher (Tier 1, 3 actions).
//
// Foundry-side read-only surface for the `diagnostic` MCP umbrella tool. Three
// v1 sub-actions: recent-errors / world-issues / support-snapshot. Phase 2
// adds Tier 2 content-health actions, Phase 3 adds Tier 3 dev-introspection.
//
// CCR-1 / HC1 read-only purity: ZERO writes. No notify.*, no wrappedWrite,
// no permissionManager — none are even imported. The whole handler module
// is a passive observer.
// CCR-2 / HC2 dual gate: validateGMAccess() THEN
// game.settings.get(MODULE_ID, 'enableDiagnosticTools'). Single fail-path on
// either; returns well-formed envelope, never throws.
// CCR-7 / ADR-009 open-shape seam: schema is a discriminatedUnion; Phases
// 2 + 3 extend the union additively without refactor here.

import {
  DiagnosticToolInput,
  type DiagnosticToolInputType,
  type DiagnosticRecentErrorsInputType,
  type DiagnosticWorldIssuesInputType,
  type DiagnosticSupportSnapshotInputType,
  type RecentErrorsResponse,
  type WorldIssuesResponse,
  type SupportSnapshotResponse,
} from '@foundry-mcp/shared';
import { readRuntimeBuffer } from '../health-check.js';
import { MODULE_ID } from '../constants.js';

// ── Local envelope types (mirror handlers/journal.ts) ───────────────────────

type AccessGate = { allowed: boolean };
type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

// ── Gates (CCR-2 / HC2 dual gate) ───────────────────────────────────────────

function validateGMAccess(): AccessGate {
  if (!game.user?.isGM) return { allowed: false };
  return { allowed: true };
}

// Returns whether the GM has opted into the diagnostic surface. Default false
// (HC2). Read-only — no notify.*; on read failure (e.g. setting not yet
// registered in a test harness) treats as disabled.
function isDiagnosticEnabled(): boolean {
  try {
    return Boolean((game as any).settings?.get(MODULE_ID, 'enableDiagnosticTools'));
  } catch {
    return false;
  }
}

// ── Dispatcher entry point ─────────────────────────────────────────────────

/**
 * Dispatch a `diagnostic` umbrella request to the appropriate Tier 1 handler.
 *
 * queries.ts registers `CONFIG.queries[`${MODULE_ID}.diagnostic`]` to forward
 * here. The discriminated-union schema enforces shape; this function routes
 * on `action`. The `_dataAccess` parameter is threaded for symmetry with the
 * other umbrella dispatchers (handlers/journal.ts, handlers/scene.ts) — Tier
 * 1 doesn't use it, but Phase 2 content scans will.
 */
export async function dispatchDiagnostic(
  data: unknown,
  _dataAccess?: unknown,
): Promise<Envelope<RecentErrorsResponse | WorldIssuesResponse | SupportSnapshotResponse>> {
  // CCR-2 / HC2 dual gate — both checks before any sub-action work.
  const gate = validateGMAccess();
  if (!gate.allowed) {
    return { success: false, error: 'DIAGNOSTIC_ACCESS_DENIED: GM required' };
  }
  if (!isDiagnosticEnabled()) {
    return {
      success: false,
      error:
        'DIAGNOSTIC_DISABLED: Diagnostic tools are off by default. ' +
        'GM may enable in module settings → "Enable Diagnostic Tools".',
    };
  }

  // Strict parse — discriminator-narrowed type for the switch below.
  let input: DiagnosticToolInputType;
  try {
    input = DiagnosticToolInput.parse(data ?? {});
  } catch (err) {
    return {
      success: false,
      error: `DIAGNOSTIC_INVALID_INPUT: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  switch (input.action) {
    case 'recent-errors':
      return handleRecentErrors(input);
    case 'world-issues':
      return handleWorldIssues(input);
    case 'support-snapshot':
      return handleSupportSnapshot(input);
    default: {
      // Exhaustiveness sentinel — if Phase 2/3 extends DiagnosticToolInput
      // and forgets to add a case here, TS will fail this assignment.
      const _exhaustive: never = input;
      return {
        success: false,
        error: `DIAGNOSTIC_UNKNOWN_ACTION: ${JSON.stringify((_exhaustive as any)?.action)}`,
      };
    }
  }
}

// ── Sub-action handlers ────────────────────────────────────────────────────

async function handleRecentErrors(
  input: DiagnosticRecentErrorsInputType,
): Promise<Envelope<RecentErrorsResponse>> {
  // readRuntimeBuffer() owns FIFO semantics; this handler is just the
  // discriminator-aware boundary. The buffer surface types are locally typed
  // (RuntimeEventRecord) but structurally identical to the shared
  // RuntimeEvent — TS will accept the assignment.
  // Build filter conditionally — exactOptionalPropertyTypes rejects explicit
  // `severity: undefined` even though the field is optional.
  const filter: Parameters<typeof readRuntimeBuffer>[0] = {};
  if (input.severity !== undefined) filter.severity = input.severity;
  if (input.source !== undefined) filter.source = input.source;
  if (input.limit !== undefined) filter.limit = input.limit;
  if (input.since !== undefined) filter.since = input.since;
  const result = readRuntimeBuffer(filter);
  const data: RecentErrorsResponse = {
    events: result.events as RecentErrorsResponse['events'],
    bufferSize: result.bufferSize,
    bufferFull: result.bufferFull,
  };
  return { success: true, data };
}

async function handleWorldIssues(
  input: DiagnosticWorldIssuesInputType,
): Promise<Envelope<WorldIssuesResponse>> {
  const issues = (game as any).issues;
  if (!issues) {
    // game.issues is documented as always populated post-init. If absent the
    // module is being called pre-ready — surface that clearly.
    return {
      success: false,
      error: 'DIAGNOSTIC_NOT_READY: game.issues is not yet populated (called pre-init?)',
    };
  }

  // Normalise each bucket to Record<string, unknown>. game.issues may use a
  // Map for validationFailures on some v13 builds (eval probe iii verifies);
  // handle both shapes.
  function normaliseBucket(raw: unknown): Record<string, unknown> {
    if (!raw) return {};
    if (raw instanceof Map) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of raw.entries()) out[String(k)] = v;
      return out;
    }
    if (typeof raw === 'object') return raw as Record<string, unknown>;
    return {};
  }

  const pkg = normaliseBucket(issues.packageCompatibilityIssues);
  const usability = normaliseBucket(issues.usabilityIssues);
  const validation = normaliseBucket(issues.validationFailures);

  const buckets = input.buckets ?? ['packageCompatibility', 'usability', 'validation'];
  const has = (b: 'packageCompatibility' | 'usability' | 'validation') => buckets.includes(b);

  const data: WorldIssuesResponse = {
    packageCompatibilityIssues: has('packageCompatibility') ? pkg : {},
    usabilityIssues: has('usability') ? usability : {},
    validationFailures: has('validation') ? validation : {},
    counts: {
      packageCompatibility: Object.keys(pkg).length,
      usability: Object.keys(usability).length,
      validation: Object.keys(validation).length,
    },
  };
  return { success: true, data };
}

async function handleSupportSnapshot(
  input: DiagnosticSupportSnapshotInputType,
): Promise<Envelope<SupportSnapshotResponse>> {
  // Resolve the live access path. Eval probe (ii) verified that one of these
  // candidates resolves in v13; we keep the ladder defensive.
  const SupportDetails: any =
    (globalThis as any).SupportDetails ??
    (foundry as any)?.applications?.sidebar?.apps?.SupportDetails ??
    (foundry as any)?.applications?.apps?.SupportDetails;

  if (!SupportDetails || typeof SupportDetails.generateSupportReport !== 'function') {
    // Fallback: hand-rolled minimum from game.version + game.system + game.world.
    // Tagged via raw._fallback so the MCP-side handler can surface it.
    const modulesMap: any = (game as any).modules;
    let activeCount = 0;
    if (modulesMap?.values) {
      for (const m of modulesMap.values()) {
        if (m?.active) activeCount++;
      }
    }
    const fallback: SupportSnapshotResponse = {
      coreVersion: String((game as any).version ?? 'unknown'),
      systemVersion: String((game as any).system?.version ?? 'unknown'),
      systemId: String((game as any).system?.id ?? 'unknown'),
      worldId: String((game as any).world?.id ?? 'unknown'),
      activeModuleCount: activeCount,
      raw: { _fallback: true, _reason: 'SupportDetails.generateSupportReport unavailable' },
    };
    const fallbackTitle = (game as any).world?.title;
    if (fallbackTitle !== undefined) fallback.worldTitle = fallbackTitle;
    return { success: true, data: fallback };
  }

  let report: any;
  try {
    report = await SupportDetails.generateSupportReport();
  } catch (err) {
    return {
      success: false,
      error: `DIAGNOSTIC_SUPPORT_REPORT_FAILED: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Normalise SupportReportData onto the typed surface. Whatever else
  // Foundry attached lands in `raw`. includeModules:false strips the breakdown.
  const includeModules = input.includeModules !== false;
  const modulesList: NonNullable<SupportSnapshotResponse['modules']> = includeModules
    ? Array.isArray(report?.modules)
      ? report.modules.map((m: any) => {
          const entry: { id: string; title?: string; version?: string } = { id: String(m.id) };
          if (m.title !== undefined) entry.title = m.title;
          if (m.version !== undefined) entry.version = m.version;
          return entry;
        })
      : []
    : [];

  const data: SupportSnapshotResponse = {
    coreVersion: String(report?.coreVersion ?? (game as any).version ?? ''),
    systemVersion: String(report?.systemVersion ?? (game as any).system?.version ?? ''),
    systemId: String(report?.systemId ?? (game as any).system?.id ?? ''),
    worldId: String(report?.worldId ?? (game as any).world?.id ?? ''),
    activeModuleCount:
      typeof report?.activeModuleCount === 'number'
        ? report.activeModuleCount
        : modulesList.length,
    raw: report,
  };
  const worldTitle = report?.worldTitle ?? (game as any).world?.title;
  if (worldTitle !== undefined) data.worldTitle = worldTitle;
  if (includeModules) data.modules = modulesList;
  return { success: true, data };
}
