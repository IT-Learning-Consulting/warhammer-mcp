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
export function verifyDocWrite(
  freshDoc: unknown,
  expectedFields: Record<string, unknown>,
  errorToken: string,
  options?: { readSource?: boolean; skipPaths?: string[] },
): void {
  const readSource = options?.readSource !== false; // default true (F08-safe)
  const skipPaths = options?.skipPaths ?? [];

  const drift: string[] = [];
  for (const [path, expected] of Object.entries(expectedFields)) {
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
