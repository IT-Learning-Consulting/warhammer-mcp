// Phase 5 mcp_crud_expansion — Shared formatFKLink helper (A2 supplemental).
//
// Codifies the FK-orphan recovery pattern surfaced by Phase 4 carry-forward §38-39:
// when an embedded-document FK field references a deleted target, the Foundry
// getter returns `null` but `_source.<field>` retains the stale ID. Consumers
// (Token formatter, Note formatter) need a tri-state response that distinguishes
// "no FK set" from "FK set but target missing".
//
// Token.actorLinked  ← formatFKLink(token.actorId, game.actors)
// Note.entryLinked   ← formatFKLink(note.entryId, game.journal)
// Note.pageLinked    ← formatFKLink(note.pageId, journalEntry.pages) (when entry resolves)
//
// Type signature is intentionally narrow so the helper compiles against the
// foundry-module workspace's runtime types (Collection<T>) without dragging the
// full @league-of-foundry-developers/foundry-vtt-types surface into `shared`.

export interface FKLinkResult {
  /** The id as stored on the source document; null if never set. */
  id: string | null;
  /** True if the id is set AND the target document currently exists. */
  linked: boolean;
}

/**
 * Resolve an FK against a Collection-like map and report whether the target exists.
 *
 * Accepts any object with a `.get(id)` method (Foundry Collection, Map, plain object index).
 * The helper does NOT throw on missing target — `linked: false` is a normal outcome
 * encoding the orphan-FK case.
 */
export function formatFKLink(
  id: string | null | undefined,
  collection: { get(id: string): unknown },
): FKLinkResult {
  if (!id) return { id: null, linked: false };
  const found = collection.get(id);
  return { id, linked: found != null };
}
