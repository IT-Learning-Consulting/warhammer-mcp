// DP-16 / CCR-1 — shared post-write persistence guard for the field-drift verify shape.
//
// Re-reads are the CALLER'S job; this helper compares each requested field against
// the persisted value. Idempotent no-ops (actual already equals expected) are SUCCESS.
//
// _source read (readSource:true, the default) is F08-safe: derived getters can return
// Foundry objects (Color, TextureData, embedded FK getters) that !== the raw stored
// string, causing false-positive drift. embeddedCRUDFactory.ts:10-16 is canonical.

/**
 * Post-write persistence guard (DP-16 / CCR-1).
 * Compares each key in expectedFields against the persisted value on freshDoc.
 * Throws errorToken on drift; returns void on success (including idempotent no-ops).
 *
 * @param freshDoc       Re-read Foundry Document (caller must re-fetch before calling).
 * @param expectedFields Flat dot-path → expected value map (e.g. { 'text.content': 'Hello' }).
 * @param errorToken     Error prefix, e.g. 'UPDATE_ACTIVE_EFFECT_NOT_PERSISTED'.
 * @param options        readSource: compare via doc._source path (default true, F08-safe).
 *                       skipPaths: additional dot-paths to skip beyond '.-=' markers.
 */
/**
 * Flatten nested plain-object values to dot-path leaves (arrays and non-plain objects
 * stay terminal). Needed because callers legitimately hold NESTED update objects at
 * verify time — Foundry's Document.update() expands dot-path keys in the SAME object
 * reference it was handed, so even an update built flat ({'flags.levels.x': 1}) arrives
 * here nested ({flags: {levels: {x: 1}}}). Comparing a nested PARTIAL against the
 * fully-defaulted stored bag false-fires drift (live-caught 2026-07-03: false
 * TEMPLATE_APPLY_WRITE_NOT_PERSISTED on prototypeToken partials + false
 * LEVELS_WRITE_NOT_PERSISTED on scene flags). Leaf-path comparison IS this helper's
 * documented semantics ("compares each requested field"). Local implementation rather
 * than foundry.utils.flattenObject so unit tests need no extra global. Note: empty-object
 * values stay terminal (compared as {}), deletion-marker paths (.-=) stay terminal.
 */
function flattenLeafPaths(
  obj: Record<string, unknown>,
  prefix = '',
  out: Record<string, unknown> = {},
): Record<string, unknown> {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    const isPlainObject = v !== null && typeof v === 'object' && !Array.isArray(v)
      && (v as object).constructor === Object && Object.keys(v as object).length > 0;
    if (isPlainObject && !path.includes('.-=')) {
      flattenLeafPaths(v as Record<string, unknown>, path, out);
    } else {
      out[path] = v;
    }
  }
  return out;
}

/**
 * BUG-499 (Wave 2, plan D6) — dimension-normalizing comparator for the
 * BUG-445/451/191/499 wrong-dimension family. A live-document direct read can
 * legitimately return a DIFFERENT DIMENSION of the same persisted value than the
 * request carried:
 *   - FK getters return the linked Document object while the request carried the
 *     scalar id (actor `folder` moves → false UPDATE_ACTOR_NOT_PERSISTED);
 *   - prepared numerics can round-trip as strings (system.status.advantage.value).
 * Structural equality stays the FIRST check; normalization only rescues these
 * known same-value dimension mismatches. Exported for unit tests.
 */
export function normalizedEquals(actual: unknown, expected: unknown): boolean {
  if (JSON.stringify(actual) === JSON.stringify(expected)) return true;
  // FK unwrap: document-object getter vs requested scalar id.
  const actualId = (actual as any)?.id ?? (actual as any)?._id;
  if (typeof expected === 'string' && typeof actualId === 'string') return actualId === expected;
  // Numeric coercion: "3" vs 3 (both sides must be cleanly numeric).
  if (
    (typeof expected === 'number' || typeof expected === 'string') &&
    (typeof actual === 'number' || typeof actual === 'string') &&
    String(actual).trim() !== '' &&
    String(expected).trim() !== '' &&
    Number.isFinite(Number(actual)) &&
    Number.isFinite(Number(expected))
  ) {
    return Number(actual) === Number(expected);
  }
  // FK clear: null/'' request vs null/undefined/'' persisted.
  if ((expected === null || expected === '') && (actual === null || actual === undefined || actual === '')) {
    return true;
  }
  return false;
}

export function verifyDocWrite(
  freshDoc: unknown,
  expectedFields: Record<string, unknown>,
  errorToken: string,
  options?: { readSource?: boolean; skipPaths?: string[]; normalizeDimensions?: boolean },
): void {
  const readSource = options?.readSource !== false; // default true (F08-safe)
  const skipPaths = options?.skipPaths ?? [];
  // BUG-499: opt-in per call site — default false keeps the stricter structural
  // semantics for _source-based verifies (which never see derived dimensions).
  const normalize = options?.normalizeDimensions === true;

  const drift: string[] = [];
  for (const [path, expected] of Object.entries(flattenLeafPaths(expectedFields))) {
    // Always skip Foundry's deletion-marker syntax (e.g. "system.foo.-=key": null) —
    // re-read cannot validate "key absent" via value comparison.
    if (path.includes('.-=')) continue;
    // Skip caller-declared paths (e.g. system-derived fields that auto-compute back).
    if (skipPaths.includes(path)) continue;

    const actual = readSource
      ? (foundry as any).utils.getProperty((freshDoc as any)?._source, path)
      : (foundry as any).utils.getProperty(freshDoc, path);

    const matches = normalize
      ? normalizedEquals(actual, expected)
      : JSON.stringify(actual) === JSON.stringify(expected);
    if (!matches) {
      drift.push(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  if (drift.length > 0) {
    throw new Error(
      `${errorToken}: ${drift.length} field(s) did not persist. Drift: ${drift.slice(0, 3).join('; ')}${drift.length > 3 ? `; +${drift.length - 3} more` : ''}`,
    );
  }
}

/**
 * R2.5 — verify a single flag write persisted. Flags live under
 * `flags.<scope>.<key>` and round-trip through `doc.getFlag(scope, key)` (the raw
 * stored value — no Color/TextureData derived-getter F08 hazard, so a flat _source
 * dot-path is unnecessary and a hyphenated scope key would mis-split anyway). Throws
 * errorToken on drift; idempotent no-ops (already-equal) pass.
 *
 * Co-located with verifyDocWrite (its sibling) rather than a separate postVerify.ts —
 * the planned `withPostVerify` re-fetch wrapper found zero genuine adopters (every
 * direct-write site holds a live in-memory Document and calls verifyDocWrite directly),
 * so only this flag-compare cleared the HC11 ≥2-site bar (patrol enable/resume).
 *
 * @param doc        The (already re-read / live) Foundry Document carrying the flag.
 * @param scope      Flag scope (module / system id).
 * @param key        Flag key.
 * @param expected   Expected flag value.
 * @param errorToken Error prefix, e.g. 'PATROL_FLAG_NOT_PERSISTED'.
 */
export function verifyFlagWrite(
  doc: unknown,
  scope: string,
  key: string,
  expected: unknown,
  errorToken: string,
): void {
  const actual = (doc as any)?.getFlag?.(scope, key);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${errorToken}: flag "${scope}.${key}" did not persist. ` +
        `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

/**
 * mcp_code_quality_v2 Phase C2 (RC2.4) — coercion-tolerant scalar-write verify.
 *
 * Generalizes the `String(a) !== String(b)` idiom independently converged on at 3
 * call sites (narrator's F03 fix, manage-character.ts:1065 Number() wrap,
 * wfrp-economy.ts:860 Boolean() wrap). Use this for module-API accessor writes where
 * the round-trip read can arrive already-coerced by the module's own setting/schema
 * (e.g. `game.settings.set` coercing a string "1.5" input to the registered Number
 * type), so a strict `!==` against the raw MCP-boundary input would false-fail a
 * landed write (F03 class — see warhammer-mcp-quality-contract.md §8 sibling gotcha).
 *
 * Deliberately NOT layered onto verifyDocWrite/flattenLeafPaths — those stay
 * unmodified (their JSON.stringify structural-equality semantics are the correct,
 * stricter tool for raw-Document field verification). This is a separate, narrower
 * helper for the scalar/module-API-accessor write class.
 *
 * @param actual     The re-read value (already coerced by the module's own setter).
 * @param expected   The expected value, in whatever type the caller/input arrived as.
 * @param errorToken Error prefix, e.g. 'NARRATOR_VALUE_NOT_PERSISTED'.
 */
export function verifyScalarWrite(actual: unknown, expected: unknown, errorToken: string): void {
  if (String(actual) !== String(expected)) {
    throw new Error(
      `${errorToken}: value did not persist. expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}
