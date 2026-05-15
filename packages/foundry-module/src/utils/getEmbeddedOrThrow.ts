// Phase 5 mcp_crud_expansion — Generalized embedded-document accessor.
//
// Lifts the `getSceneOrThrow` pattern (handlers/scene.ts:129-135) into a
// per-collection embedded-doc accessor. Used by all 7 Phase 5 handlers
// (token, light, note, sound, region, tile, template) to resolve an
// embedded document inside a Scene with structured throw on missing.
//
// Three failure modes are surfaced as distinct error prefixes so callers can
// route into specific error envelopes per CCR-Envelope-Consumer.

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Resolve an embedded document inside a Scene by collection name + id.
 *
 * @param scene         The Scene document to look inside (caller's `getSceneOrThrow` output).
 * @param collectionName  The Foundry collection accessor name on Scene (e.g. 'tokens', 'lights', 'notes').
 * @param embeddedId    The embedded document's id.
 * @param docType       Document type string for error messages (e.g. 'Token', 'AmbientLight').
 *
 * @throws SCENE_NOT_A_DOCUMENT if `scene` is not an object with the expected shape.
 * @throws COLLECTION_NOT_FOUND if the named collection accessor does not exist on the scene.
 * @throws <DOCTYPE>_NOT_FOUND if the collection exists but no doc with that id is in it.
 */
export function getEmbeddedOrThrow<T = unknown>(
  scene: unknown,
  collectionName: string,
  embeddedId: string,
  docType: string,
): T {
  if (!isObject(scene)) {
    throw new Error(`SCENE_NOT_A_DOCUMENT: cannot read collection "${collectionName}" from non-object scene`);
  }
  const collection = (scene as Record<string, unknown>)[collectionName];
  if (!collection || typeof (collection as { get?: unknown }).get !== 'function') {
    throw new Error(`COLLECTION_NOT_FOUND: scene has no "${collectionName}" collection`);
  }
  const doc = (collection as { get(id: string): unknown }).get(embeddedId);
  if (!doc) {
    throw new Error(`${docType.toUpperCase()}_NOT_FOUND: no ${docType} with id "${embeddedId}" in scene.${collectionName}`);
  }
  return doc as T;
}
