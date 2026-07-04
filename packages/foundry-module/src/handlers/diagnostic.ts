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
  type DiagnosticValidateWfrpConfigInputType,
  type DiagnosticScanBrokenUuidsInputType,
  type DiagnosticScanCareerRefsInputType,
  type DiagnosticValidateAeScriptsInputType,
  type DiagnosticInspectDocumentInputType,
  type DiagnosticHookInventoryInputType,
  type DiagnosticModuleInventoryInputType,
  type DiagnosticSettingsInventoryInputType,
  type ScopeInputType,
  type RecentErrorsResponse,
  type WorldIssuesResponse,
  type SupportSnapshotResponse,
  type ValidateWfrpConfigResponse,
  type ConfigKeyFailure,
  type ScanBrokenUuidsResponse,
  type BrokenUuid,
  type ScanCareerRefsResponse,
  type UnresolvedCareerRef,
  type ValidateAeScriptsResponse,
  type InvalidAeScript,
  type InspectDocumentResponse,
  type InspectDocumentEffectPreview,
  type InspectDocumentItemPreview,
  type HookInventoryResponse,
  type HookInventoryEntry,
  type HookInventoryDriftSummary,
  type ModuleInventoryResponse,
  type ModuleInventoryEntry,
  type SettingsInventoryResponse,
  type SettingsInventoryEntry,
} from '@foundry-mcp/shared';
import { readRuntimeBuffer } from '../health-check.js';
import { MODULE_ID } from '../constants.js';
import { validateGMAccess } from '../utils/embeddedCRUDFactory.js';

// ── Local envelope types (mirror handlers/journal.ts) ───────────────────────

type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

// ── Gates (CCR-2 / HC2 dual gate) ───────────────────────────────────────────

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
): Promise<Envelope<
  | RecentErrorsResponse
  | WorldIssuesResponse
  | SupportSnapshotResponse
  | ValidateWfrpConfigResponse
  | ScanBrokenUuidsResponse
  | ScanCareerRefsResponse
  | ValidateAeScriptsResponse
  | InspectDocumentResponse
  | HookInventoryResponse
  | ModuleInventoryResponse
  | SettingsInventoryResponse
>> {
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
    case 'validate-wfrp-config':
      return handleValidateWfrpConfig(input);
    case 'scan-broken-uuids':
      return handleScanBrokenUuids(input);
    case 'scan-career-refs':
      return handleScanCareerRefs(input);
    case 'validate-ae-scripts':
      return handleValidateAeScripts(input);
    case 'inspect-document':
      return handleInspectDocument(input);
    case 'hook-inventory':
      return handleHookInventory(input);
    case 'module-inventory':
      return handleModuleInventory(input);
    case 'settings-inventory':
      return handleSettingsInventory(input);
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

// ── Phase 2 Tier 2: scope resolution helpers ───────────────────────────────

// Returns a list of top-level docs to walk per scope. Bare ID lookup uses
// game.actors.get() / game.items.get() (sync O(1) Map) — fromUuid reserved
// for dotted UUIDs (subagent D §D.2).
async function resolveActorScope(
  scope: ScopeInputType,
): Promise<Envelope<any[]>> {
  if (scope.type === 'world') {
    return { success: true, data: [...((game as any).actors?.contents ?? [])] };
  }
  if (!scope.id) {
    return {
      success: false,
      error: 'SCOPE_ID_REQUIRED: id required when type is actor|item|compendium',
    };
  }
  if (scope.type === 'actor') {
    const a = (game as any).actors?.get(scope.id);
    return a ? { success: true, data: [a] } : { success: false, error: `SCOPE_NOT_FOUND: actor ${scope.id}` };
  }
  if (scope.type === 'compendium') {
    const pack = (game as any).packs?.get(scope.id);
    if (!pack) return { success: false, error: `SCOPE_NOT_FOUND: pack ${scope.id}` };
    const docs = await pack.getDocuments();
    return { success: true, data: docs.filter((d: any) => d.documentName === 'Actor') };
  }
  // type === 'item' — not actor-iterable for career-refs scans
  return { success: true, data: [] };
}

async function resolveItemOrActorScope(
  scope: ScopeInputType,
): Promise<Envelope<any[]>> {
  if (scope.type === 'world') {
    return {
      success: true,
      data: [
        ...((game as any).actors?.contents ?? []),
        ...((game as any).items?.contents ?? []),
      ],
    };
  }
  if (!scope.id) {
    return {
      success: false,
      error: 'SCOPE_ID_REQUIRED: id required when type is actor|item|compendium',
    };
  }
  if (scope.type === 'actor') {
    const a = (game as any).actors?.get(scope.id);
    return a ? { success: true, data: [a] } : { success: false, error: `SCOPE_NOT_FOUND: actor ${scope.id}` };
  }
  if (scope.type === 'item') {
    const it = (game as any).items?.get(scope.id);
    return it ? { success: true, data: [it] } : { success: false, error: `SCOPE_NOT_FOUND: item ${scope.id}` };
  }
  // compendium
  const pack = (game as any).packs?.get(scope.id);
  if (!pack) return { success: false, error: `SCOPE_NOT_FOUND: pack ${scope.id}` };
  const docs = await pack.getDocuments();
  return { success: true, data: docs };
}

function isCountsOnly(scope: ScopeInputType): boolean {
  return scope.type === 'world' && scope.confirmExpensive !== true;
}

// ── Phase 2 Tier 2: validate-wfrp-config ──────────────────────────────────

async function handleValidateWfrpConfig(
  _input: DiagnosticValidateWfrpConfigInputType,
): Promise<Envelope<ValidateWfrpConfigResponse>> {
  const config: any = (game as any).wfrp4e?.config ?? {};
  const failures: ConfigKeyFailure[] = [];

  const sample = (v: any): string => {
    try { return JSON.stringify(v).slice(0, 80); } catch { return String(v).slice(0, 80); }
  };
  const pushFail = (key: string, expected: string, actual: any) =>
    failures.push({ key, expected, actual: sample(actual) });

  // xpCost shape — Advancement.calculateAdvCost depends on both arrays.
  if (!Array.isArray(config.xpCost?.characteristic) || config.xpCost.characteristic.length < 10) {
    pushFail('xpCost.characteristic', 'number[] length >= 10', config.xpCost?.characteristic ?? null);
  }
  if (!Array.isArray(config.xpCost?.skill) || config.xpCost.skill.length < 10) {
    pushFail('xpCost.skill', 'number[] length >= 10', config.xpCost?.skill ?? null);
  }
  // syncTriggers — record/object of trigger handlers.
  if (!config.syncTriggers || typeof config.syncTriggers !== 'object') {
    pushFail('syncTriggers', 'object (record of trigger handlers)', config.syncTriggers ?? null);
  }
  // corruptionTables — record/object keyed by table name.
  if (!config.corruptionTables || typeof config.corruptionTables !== 'object') {
    pushFail('corruptionTables', 'object (record of table names)', config.corruptionTables ?? null);
  }
  // magicLores — record/object keyed by lore name.
  if (!config.magicLores || typeof config.magicLores !== 'object') {
    pushFail('magicLores', 'object (record of lore names)', config.magicLores ?? null);
  }
  // scriptTriggers — record of trigger keys consumed by AE script bodies.
  if (!config.scriptTriggers || typeof config.scriptTriggers !== 'object') {
    pushFail('scriptTriggers', 'object (record of script trigger keys)', config.scriptTriggers ?? null);
  }
  // species / speciesSkills / speciesTalents — populated (non-empty) per PRD §4.1 item 10.
  if (!config.species || typeof config.species !== 'object' || Object.keys(config.species).length === 0) {
    pushFail('species', 'non-empty object (record of species)', config.species ?? null);
  }
  if (!config.speciesSkills || typeof config.speciesSkills !== 'object' || Object.keys(config.speciesSkills).length === 0) {
    pushFail('speciesSkills', 'non-empty object (record of species→skills)', config.speciesSkills ?? null);
  }
  if (!config.speciesTalents || typeof config.speciesTalents !== 'object' || Object.keys(config.speciesTalents).length === 0) {
    pushFail('speciesTalents', 'non-empty object (record of species→talents)', config.speciesTalents ?? null);
  }

  return { success: true, data: { ok: failures.length === 0, failures } };
}

// ── Phase 2 Tier 2: scan-broken-uuids ─────────────────────────────────────

const UUID_LINK_RE = /@UUID\[([^\]]+)\](?:\{([^}]*)\})?/g;

async function handleScanBrokenUuids(
  input: DiagnosticScanBrokenUuidsInputType,
): Promise<Envelope<ScanBrokenUuidsResponse>> {
  const t0 = performance.now();
  const scopeResult = await resolveItemOrActorScope(input.scope);
  if (!scopeResult.success) return scopeResult as EnvelopeErr;
  const docs = scopeResult.data;
  const countsOnly = isCountsOnly(input.scope);

  let checked = 0;
  let broken = 0;
  let uuidsBroken = 0;
  const details: BrokenUuid[] = [];

  // Iterate top-level docs; also walk actor.items[] for actors.
  type Frame = { doc: any; embeddedItemId?: string };
  const frames: Frame[] = [];
  for (const doc of docs) {
    frames.push({ doc });
    if (doc?.documentName === 'Actor' && doc.items?.contents) {
      for (const emb of doc.items.contents) {
        frames.push({ doc: emb, embeddedItemId: emb.id });
      }
    }
  }

  for (const frame of frames) {
    const d = frame.doc;
    checked++;
    const desc = d?.system?.description?.value;
    const gmdesc = d?.system?.gmdescription?.value;
    // BUG-388: character/npc biographies live at system.details.biography.value (NOT
    // system.description.value); a broken @UUID there went undetected before this walk.
    const bio = d?.system?.details?.biography?.value;
    const checks: Array<{ field: 'description' | 'gmdescription' | 'biography'; text: string }> = [];
    if (typeof desc === 'string') checks.push({ field: 'description', text: desc });
    if (typeof gmdesc === 'string') checks.push({ field: 'gmdescription', text: gmdesc });
    if (typeof bio === 'string') checks.push({ field: 'biography', text: bio });

    let docHadBroken = false;
    for (const { field, text } of checks) {
      // BUG-300: collect all matches synchronously BEFORE any await — the module-level
      // /g regex has shared lastIndex state that gets corrupted when awaits interleave
      // between exec() calls. Use matchAll on a fresh local regex copy instead.
      const localRe = new RegExp(UUID_LINK_RE.source, UUID_LINK_RE.flags);
      const matches = Array.from(text.matchAll(localRe));
      for (const m of matches) {
        const uuid = m[1];
        if (!uuid) continue;
        // fromUuid returns null on miss (Risk 2.B REFUTED — does not throw).
        const resolved = await (globalThis as any).fromUuid(uuid);
        if (resolved == null) {
          uuidsBroken++;
          docHadBroken = true;
          if (!countsOnly) {
            const entry: BrokenUuid = {
              docId: String(d.id ?? ''),
              docName: String(d.name ?? ''),
              field,
              uuid,
            };
            if (frame.embeddedItemId !== undefined) entry.embeddedItemId = frame.embeddedItemId;
            details.push(entry);
          }
        }
      }
    }
    if (docHadBroken) broken++;
  }

  const elapsedMs = Math.round(performance.now() - t0);
  const data: ScanBrokenUuidsResponse = { checked, broken, uuidsBroken, elapsedMs };
  if (!countsOnly) data.details = details;
  return { success: true, data };
}

// ── Phase 2 Tier 2: scan-career-refs ──────────────────────────────────────

async function handleScanCareerRefs(
  input: DiagnosticScanCareerRefsInputType,
): Promise<Envelope<ScanCareerRefsResponse>> {
  const t0 = performance.now();
  const scopeResult = await resolveActorScope(input.scope);
  if (!scopeResult.success) return scopeResult as EnvelopeErr;
  const actors = scopeResult.data;
  const countsOnly = isCountsOnly(input.scope);

  // Read-only fallback per Risk 2.A — WFRP_Utility.findSkill MAY rename-mutate
  // the source on near-match; we stick to exact-name lookup.
  const allItems: any[] = (game as any).items?.contents ?? [];
  const findByName = (name: string, type: 'skill' | 'talent') =>
    allItems.find((i: any) => i.name === name && i.type === type);

  let checked = 0;
  let unresolved = 0;
  const details: UnresolvedCareerRef[] = [];

  for (const actor of actors) {
    const careerItems = actor?.items?.contents?.filter((i: any) => i.type === 'career') ?? [];
    for (const career of careerItems) {
      checked++;
      const skills: string[] = Array.isArray(career?.system?.skills) ? career.system.skills : [];
      const talents: string[] = Array.isArray(career?.system?.talents) ? career.system.talents : [];

      for (const name of skills) {
        if (typeof name !== 'string' || name.length === 0) continue;
        if (!findByName(name, 'skill')) {
          unresolved++;
          if (!countsOnly) {
            details.push({
              actorName: String(actor.name ?? ''),
              careerName: String(career.name ?? ''),
              refType: 'skill',
              name,
            });
          }
        }
      }
      for (const name of talents) {
        if (typeof name !== 'string' || name.length === 0) continue;
        if (!findByName(name, 'talent')) {
          unresolved++;
          if (!countsOnly) {
            details.push({
              actorName: String(actor.name ?? ''),
              careerName: String(career.name ?? ''),
              refType: 'talent',
              name,
            });
          }
        }
      }
    }
  }

  const elapsedMs = Math.round(performance.now() - t0);
  const data: ScanCareerRefsResponse = { checked, unresolved, elapsedMs };
  if (!countsOnly) data.details = details;
  return { success: true, data };
}

// ── Phase 2 Tier 2: validate-ae-scripts ───────────────────────────────────
// HC4 carve-out: this is the ONLY use of `new Function(...)` in the diagnostic
// surface. Parses script bodies for SyntaxError detection; never .call()s them.

async function handleValidateAeScripts(
  input: DiagnosticValidateAeScriptsInputType,
): Promise<Envelope<ValidateAeScriptsResponse>> {
  const t0 = performance.now();
  const scopeResult = await resolveItemOrActorScope(input.scope);
  if (!scopeResult.success) return scopeResult as EnvelopeErr;
  const docs = scopeResult.data;
  const countsOnly = isCountsOnly(input.scope);

  const triggers = (game as any).wfrp4e?.config?.scriptTriggers;
  const validTriggers = new Set<string>(
    triggers && typeof triggers === 'object' ? Object.keys(triggers) : [],
  );

  let checked = 0;
  let invalid = 0;
  let schemaDrift = 0;
  const details: InvalidAeScript[] = [];

  // Iterate effects on every doc in scope (top-level + actor-embedded items).
  const allEffectsSources: any[] = [];
  for (const doc of docs) {
    allEffectsSources.push(doc);
    if (doc?.documentName === 'Actor' && doc.items?.contents) {
      for (const emb of doc.items.contents) allEffectsSources.push(emb);
    }
  }

  for (const src of allEffectsSources) {
    const effects = src?.effects?.contents ?? [];
    for (const effect of effects) {
      checked++;
      const scriptData = effect?.system?.scriptData;

      if (!Array.isArray(scriptData)) {
        if (scriptData != null) {
          schemaDrift++;
          if (!countsOnly) {
            details.push({
              docId: String(src.id ?? ''),
              docName: String(src.name ?? ''),
              aeId: String(effect.id ?? ''),
              aeName: String(effect.name ?? ''),
              issue: 'schema-drift',
              expected: `array (pre-v11 shape: ${typeof scriptData})`,
            });
          }
        }
        continue;
      }

      for (const entry of scriptData) {
        const script: string = typeof entry?.script === 'string' ? entry.script : '';
        const trigger: string = typeof entry?.trigger === 'string' ? entry.trigger : '';

        // SyntaxError parse — HC4 carve-out: parse only, never execute.
        if (script) {
          try {
            new Function(script);
          } catch (e) {
            invalid++;
            if (!countsOnly) {
              const entryOut: InvalidAeScript = {
                docId: String(src.id ?? ''),
                docName: String(src.name ?? ''),
                aeId: String(effect.id ?? ''),
                aeName: String(effect.name ?? ''),
                issue: 'syntax-error',
                error: e instanceof Error ? e.message : String(e),
              };
              if (trigger) entryOut.trigger = trigger;
              details.push(entryOut);
            }
            continue;
          }
        }

        if (trigger && validTriggers.size > 0 && !validTriggers.has(trigger)) {
          invalid++;
          if (!countsOnly) {
            details.push({
              docId: String(src.id ?? ''),
              docName: String(src.name ?? ''),
              aeId: String(effect.id ?? ''),
              aeName: String(effect.name ?? ''),
              issue: 'unknown-trigger',
              trigger,
            });
          }
        }
      }
    }
  }

  const elapsedMs = Math.round(performance.now() - t0);
  const data: ValidateAeScriptsResponse = { checked, invalid, schemaDrift, elapsedMs };
  if (!countsOnly) data.details = details;
  return { success: true, data };
}

// ── Phase 3 Tier 3: developer introspection point-reads ────────────────────
// All four handlers are point-reads against documented v13 public surfaces:
// fromUuid, Hooks.events, game.modules, game.settings.settings. No scope
// helpers used — these are not iteration scans. HC4 carve-out preserved
// (no `new Function(` here; only validate-ae-scripts uses it).

// research_memo.md line 83 — domain-knowledge thresholds. Foundry's
// updateToken/refreshToken hooks are known noisy; counts above these
// thresholds suggest a module attached a leak-y listener.
const HOOK_DRIFT_THRESHOLDS: Record<string, number> = {
  updateToken: 5,
  refreshToken: 3,
};

function resolveAvailabilityLabel(code: number): string {
  const codes: Record<string, unknown> | undefined = (globalThis as any).CONST?.PACKAGE_AVAILABILITY_CODES;
  if (!codes) return 'UNKNOWN';
  const entry = Object.entries(codes).find(([, v]) => v === code);
  return entry ? entry[0] : 'UNKNOWN';
}

function resolveTypeLabel(type: any): string {
  if (type === Boolean) return 'Boolean';
  if (type === String) return 'String';
  if (type === Number) return 'Number';
  if (type === Object) return 'Object';
  if (type && typeof type === 'function') {
    return `DataModel:${type.name || 'anonymous'}`;
  }
  return String(type?.name ?? typeof type);
}

async function handleInspectDocument(
  input: DiagnosticInspectDocumentInputType,
): Promise<Envelope<InspectDocumentResponse>> {
  try {
    const doc: any = await (globalThis as any).fromUuid(input.uuid);
    if (!doc) {
      return { success: false, error: `DIAGNOSTIC_INSPECT_DOCUMENT_NOT_FOUND: uuid=${input.uuid}` };
    }
    const serialized: any = typeof doc.toObject === 'function' ? doc.toObject() : {};
    const includeFull = input.includeFull === true;

    const effectsList: any[] = doc.effects?.contents ? [...doc.effects.contents] : [];
    const itemsList: any[] = doc.items?.contents ? [...doc.items.contents] : [];

    const effectsPreview: InspectDocumentEffectPreview[] = (includeFull ? effectsList : effectsList.slice(0, 10))
      .map((e: any) => {
        const entry: InspectDocumentEffectPreview = { id: String(e.id ?? ''), name: String(e.name ?? '') };
        if (e.disabled !== undefined) entry.disabled = Boolean(e.disabled);
        if (e.transfer !== undefined) entry.transfer = Boolean(e.transfer);
        return entry;
      });

    const itemsPreview: InspectDocumentItemPreview[] = (includeFull ? itemsList : itemsList.slice(0, 10))
      .map((i: any) => {
        const entry: InspectDocumentItemPreview = { id: String(i.id ?? ''), name: String(i.name ?? '') };
        if (i.type !== undefined) entry.type = String(i.type);
        if (i.img !== undefined) entry.img = String(i.img);
        return entry;
      });

    const out: InspectDocumentResponse = {
      uuid: input.uuid,
      documentName: String(doc.documentName ?? ''),
      type: String(doc.type ?? ''),
      name: String(doc.name ?? ''),
      system: (serialized.system as Record<string, unknown>) ?? {},
      flags: (serialized.flags as Record<string, unknown>) ?? {},
      ownership: (serialized.ownership as Record<string, number>) ?? {},
      effects: { count: effectsList.length, preview: effectsPreview },
      items: { count: itemsList.length, preview: itemsPreview },
    };

    const sheetName = (doc as any).sheet?.constructor?.name;
    if (sheetName !== undefined) out.sheetClassName = String(sheetName);
    if (serialized.prototypeToken !== undefined) {
      out.prototypeToken = serialized.prototypeToken as Record<string, unknown>;
    }

    return { success: true, data: out };
  } catch (e) {
    return {
      success: false,
      error: `DIAGNOSTIC_INSPECT_DOCUMENT_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

async function handleHookInventory(
  input: DiagnosticHookInventoryInputType,
): Promise<Envelope<HookInventoryResponse>> {
  try {
    const events: Record<string, unknown> = (globalThis as any).Hooks?.events ?? {};
    const filter = input.hookFilter;
    const wantNs = input.byNamespace === true;

    const hooks: HookInventoryEntry[] = [];
    const drift: HookInventoryDriftSummary[] = [];
    let totalListeners = 0;

    // BUG-098: Foundry v13 `Hooks.events` exposes hook names as non-enumerable
    // own properties; `Object.entries`/`Object.keys` returns 0. Use
    // `Object.getOwnPropertyNames` to enumerate. F12-verified 2026-05-18.
    for (const name of Object.getOwnPropertyNames(events)) {
      if (filter && !name.includes(filter)) continue;
      const listenersRaw = (events as Record<string, unknown>)[name];
      const listeners: any[] = Array.isArray(listenersRaw) ? (listenersRaw as any[]) : [];
      const count = listeners.length;
      totalListeners += count;

      const entry: HookInventoryEntry = { name, count };

      if (wantNs) {
        const buckets: Record<string, number> = {};
        for (const hf of listeners) {
          const raw = hf?.fn?.name;
          const ns = typeof raw === 'string' && raw.trim().length > 0 ? raw : '<unknown>';
          buckets[ns] = (buckets[ns] ?? 0) + 1;
        }
        entry.byNamespace = buckets;
      }

      const threshold = HOOK_DRIFT_THRESHOLDS[name];
      if (threshold !== undefined && count > threshold) {
        entry.drift = { threshold, actual: count };
        drift.push({ hook: name, count, threshold });
      }

      hooks.push(entry);
    }

    return {
      success: true,
      data: {
        totalHooks: hooks.length,
        totalListeners,
        hooks,
        drift,
      },
    };
  } catch (e) {
    return {
      success: false,
      error: `DIAGNOSTIC_HOOK_INVENTORY_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

async function handleModuleInventory(
  input: DiagnosticModuleInventoryInputType,
): Promise<Envelope<ModuleInventoryResponse>> {
  try {
    const modulesIter: Iterable<any> | undefined = (globalThis as any).game?.modules?.values?.();
    const onlyActive = input.onlyActive === true;
    const modules: ModuleInventoryEntry[] = [];
    let total = 0;
    let active = 0;

    if (modulesIter) {
      for (const m of modulesIter) {
        total++;
        if (m?.active) active++;
        if (onlyActive && !m?.active) continue;
        const availability = typeof m?.availability === 'number' ? m.availability : 0;
        modules.push({
          id: String(m?.id ?? ''),
          title: String(m?.title ?? ''),
          version: String(m?.version ?? ''),
          active: m?.active === true,
          availability,
          availabilityLabel: resolveAvailabilityLabel(availability),
          incompatibleWithCoreVersion: m?.incompatibleWithCoreVersion === true,
          unavailable: m?.unavailable === true,
        });
      }
    }

    return { success: true, data: { total, active, modules } };
  } catch (e) {
    return {
      success: false,
      error: `DIAGNOSTIC_MODULE_INVENTORY_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

async function handleSettingsInventory(
  input: DiagnosticSettingsInventoryInputType,
): Promise<Envelope<SettingsInventoryResponse>> {
  try {
    const reg: Map<string, any> | undefined = (globalThis as any).game?.settings?.settings;
    const filter = input.namespaceFilter;
    const settings: SettingsInventoryEntry[] = [];

    if (reg && typeof reg.entries === 'function') {
      for (const [, cfg] of reg.entries()) {
        if (!cfg) continue;
        const namespace = String(cfg.namespace ?? '');
        if (filter && namespace !== filter) continue;
        const key = String(cfg.key ?? '');
        let current: unknown;
        try {
          current = (globalThis as any).game.settings.get(namespace, key);
        } catch {
          current = '<error reading current value>';
        }
        settings.push({
          namespace,
          key,
          scope: String(cfg.scope ?? ''),
          typeLabel: resolveTypeLabel(cfg.type),
          default: cfg.default,
          current,
        });
      }
    }

    return { success: true, data: { total: settings.length, settings } };
  } catch (e) {
    return {
      success: false,
      error: `DIAGNOSTIC_SETTINGS_INVENTORY_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
