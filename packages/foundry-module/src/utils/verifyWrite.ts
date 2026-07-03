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

export function verifyDocWrite(
  freshDoc: unknown,
  expectedFields: Record<string, unknown>,
  errorToken: string,
  options?: { readSource?: boolean; skipPaths?: string[] },
): void {
  const readSource = options?.readSource !== false; // default true (F08-safe)
  const skipPaths = options?.skipPaths ?? [];

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

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
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
