// Phase 1 mcp_crud_expansion — Polymorphic ownership handlers.
//
// Foundry-side write/read surface for the polymorphic `ownership` MCP tool.
// Each exported function expects a Zod-validated input (the queries.ts adapter
// strict-parses first). Returns the standard `{success, data}` / `{success,
// error}` envelope.
//
// Anchors:
//   ADR-024 — Folder write-rejected (schema rejects at single-target; bulk
//             handler emits per_class.folder.failed entries).
//   ADR-025 — Bulk per-class atomic via static `<Class>.updateDocuments(...)`;
//             cross-class best-effort with `per_class` result envelope.
//   ADR-026 — Compendium UUIDs + META levels rejected at schema layer.
//
// CCR-Trust: every function starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.

import { wrappedWrite } from '../transaction-manager.js';
import { notify, type NotifyKind } from '../notify.js';
import type {
  DocumentType,
  SetDocumentOwnershipInputType,
  GetDocumentOwnershipInputType,
  BulkSetDocumentOwnershipInputType,
  ResetDocumentOwnershipInputType,
} from '@foundry-mcp/shared';

type AccessGate = { allowed: boolean };
type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

const OWNERSHIP_NOTIFY_KIND: Record<DocumentType, NotifyKind> = {
  actor: 'actor',
  item: 'item',
  journal: 'journal',
  scene: 'scene',
  rolltable: 'rolltable',
  folder: 'folder',
  macro: 'macro',
};

interface Target {
  documentType: DocumentType;
  uuid?: string | undefined;
  id?: string | undefined;
  name?: string | undefined;
}

interface ResolvedDoc {
  doc: any;
  resolvedId: string;
}

interface OwnershipPayload {
  documentType: DocumentType;
  resolvedId: string;
  ownership: Record<string, number>;
}

interface BulkPerClassFailure {
  target: Target;
  error: string;
}

interface BulkPerClassResult {
  documentType: DocumentType;
  succeeded: number;
  failed: BulkPerClassFailure[];
}

interface BulkResultEnvelope {
  overall_success: boolean;
  per_class: BulkPerClassResult[];
}

// CCR-Trust: GM-only access for every ownership handler.
function validateGMAccess(): AccessGate {
  if (!game.user?.isGM) return { allowed: false };
  return { allowed: true };
}

function getCollection(documentType: DocumentType): any {
  switch (documentType) {
    case 'actor':     return (game as any).actors;
    case 'item':      return (game as any).items;
    case 'journal':   return (game as any).journal;
    case 'scene':     return (game as any).scenes;
    case 'rolltable': return (game as any).tables; // game.tables, NOT game.rolltables (per research §B)
    case 'folder':    return (game as any).folders;
    case 'macro':     return (game as any).macros;
  }
}

function getDocumentClass(documentType: DocumentType): any {
  const cfg: any = (globalThis as any).CONFIG;
  switch (documentType) {
    case 'actor':     return cfg?.Actor?.documentClass;
    case 'item':      return cfg?.Item?.documentClass;
    case 'journal':   return cfg?.JournalEntry?.documentClass;
    case 'scene':     return cfg?.Scene?.documentClass;
    case 'rolltable': return cfg?.RollTable?.documentClass;
    case 'folder':    return cfg?.Folder?.documentClass;
    case 'macro':     return cfg?.Macro?.documentClass;
  }
}

async function resolveDocumentTarget(target: Target): Promise<{ doc: any | null; error: string | null }> {
  const collection = getCollection(target.documentType);
  if (!collection) {
    return { doc: null, error: `OWNERSHIP_COLLECTION_UNAVAILABLE: game collection for ${target.documentType} not initialised` };
  }
  if (target.uuid) {
    try {
      const doc = await (globalThis as any).fromUuid(target.uuid);
      if (!doc) return { doc: null, error: `OWNERSHIP_NOT_FOUND: UUID ${target.uuid} did not resolve to a ${target.documentType}` };
      // Reject embedded docs — Document.md L436: "Embedded Documents defer to their parent ownership".
      // Embedded UUIDs (e.g. `Actor.<aid>.Item.<iid>`) yield a doc that isn't a member of the
      // top-level world collection. Setting ownership on it would be silently ineffective.
      if (collection.get && doc.id && collection.get(doc.id) !== doc) {
        return { doc: null, error: 'OWNERSHIP_EMBEDDED_NOT_SUPPORTED: embedded documents defer to their parent ownership (Document.md L436); target the parent document instead' };
      }
      return { doc, error: null };
    } catch (err) {
      return { doc: null, error: `OWNERSHIP_UUID_RESOLVE_FAILED: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  if (target.id) {
    const doc = collection.get(target.id);
    if (!doc) return { doc: null, error: `OWNERSHIP_NOT_FOUND: no ${target.documentType} with id ${target.id}` };
    return { doc, error: null };
  }
  if (target.name) {
    const doc = collection.getName(target.name);
    if (!doc) return { doc: null, error: `OWNERSHIP_NOT_FOUND: no ${target.documentType} named "${target.name}"` };
    return { doc, error: null };
  }
  return { doc: null, error: 'OWNERSHIP_NO_IDENTIFIER: target has no uuid, id, or name (schema should have caught)' };
}

function readOwnership(doc: any): Record<string, number> {
  return { ...(doc?.ownership ?? {}) };
}

function buildMergedOwnership(
  current: Record<string, number>,
  input: { userId?: string | undefined; default?: boolean | undefined; level: number }
): Record<string, number> {
  const next = { ...current };
  if (input.default === true) {
    next.default = input.level;
  } else if (input.userId) {
    next[input.userId] = input.level;
  }
  return next;
}

// BUG-070 prevention (2026-05-14) — pre-validate userId; post-verify write persisted.
//
// Why this exists: Foundry's `DocumentOwnershipField._validateType` rejects ownership
// maps whose keys aren't valid User IDs (foundry_docs/data/classes/fields.DocumentOwnershipField.md).
// `doc.update()` returns `Promise<undefined | Document>` (foundry_docs/abstract/classes/Document.md
// L558-576) — when validation rejects the payload, the update resolves to **undefined** rather
// than throwing. Before this fix the handler returned a success envelope even though Foundry
// silently dropped the write; the only signal was a console DataModelValidationError that the
// caller never saw.
//
// resolveUserId catches invalid IDs (e.g. usernames like "Danny") UPFRONT with a clear error.
// verifyOwnershipWrite catches anything that slips through pre-validation by inspecting the
// update() return value AND re-reading the persisted state.

function resolveUserId(userIdInput: string): string {
  // Strip "User." UUID prefix if present (foundry_docs/utils/interfaces/types.ResolvedUUID.md).
  const id = userIdInput.startsWith('User.') ? userIdInput.slice(5) : userIdInput;
  const user = (game as any).users?.get(id);
  if (!user) {
    throw new Error(
      `OWNERSHIP_INVALID_USER: "${userIdInput}" is not a valid Foundry user ID. ` +
      `Pass a 16-char user ID or a User.<id> UUID — usernames are not accepted. ` +
      `To resolve a username from F12: \`game.users.find(u => u.name === "<name>")?.id\`.`
    );
  }
  return user.id as string;
}

function verifyOwnershipWrite(
  _updateResult: any,
  doc: any,
  expected: { userId?: string | undefined; default?: boolean | undefined; level: number }
): void {
  // Ground truth is the post-state, not the update() return value.
  // `doc.update()` returns `Promise<undefined | Document>` (foundry_docs/abstract/classes/Document.md
  // L558-576). It returns the doc on a state-changing write, **but also returns `undefined` on
  // idempotent no-ops** (payload identical to current state) AND on silent validation drops.
  // We can't distinguish "no-op-success" from "silent-drop-failure" by the return alone — only
  // by reading the post-state and checking it matches what we asked for. Idempotent no-ops are
  // success: caller asked for state X, state IS X, contract satisfied.
  const after = readOwnership(doc);
  if (expected.default === true) {
    if (after.default !== expected.level) {
      throw new Error(
        `OWNERSHIP_WRITE_NOT_PERSISTED: default level expected ${expected.level} ` +
        `but post-update map shows ${after.default ?? 'MISSING'}. Foundry dropped the write silently — ` +
        `check F12 console for DataModelValidationError. Common causes: invalid userId, invalid level, ` +
        `schema constraint violation.`
      );
    }
  } else if (expected.userId !== undefined) {
    if (after[expected.userId] !== expected.level) {
      throw new Error(
        `OWNERSHIP_WRITE_NOT_PERSISTED: user ${expected.userId} expected level ${expected.level} ` +
        `but post-update map shows ${after[expected.userId] ?? 'MISSING'}. Foundry dropped the write silently — ` +
        `check F12 console for DataModelValidationError. Common causes: invalid userId, invalid level, ` +
        `schema constraint violation.`
      );
    }
  }
}

// SET — single-target write.
export async function setDocumentOwnership(input: SetDocumentOwnershipInputType): Promise<Envelope<OwnershipPayload>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: setDocumentOwnership requires GM' };

  const { documentType, uuid, id, name, userId, default: isDefault, level } = input;
  // Schema rejects Folder for single-target writes (ADR-024); defensive runtime check.
  if (documentType === 'folder') {
    return { success: false, error: 'OWNERSHIP_FOLDER_NOT_SUPPORTED: BaseFolder has no `ownership` field (ADR-024)' };
  }

  const target: Target = { documentType, uuid, id, name };
  const resolution = await resolveDocumentTarget(target);
  if (!resolution.doc) return { success: false, error: resolution.error ?? 'OWNERSHIP_NOT_FOUND' };
  const doc = resolution.doc;

  return await wrappedWrite('setDocumentOwnership', async () => {
    // BUG-070 prevention: resolve userId BEFORE the merge so invalid IDs (usernames, etc.)
    // throw a clear error instead of getting silently dropped by Foundry's batch path.
    const resolvedUserId = userId !== undefined ? resolveUserId(userId) : undefined;
    const merged = buildMergedOwnership(readOwnership(doc), { userId: resolvedUserId, default: isDefault, level });
    const updateResult = await doc.update({ ownership: merged });
    // BUG-070 prevention: doc.update() returns undefined on silent rejection.
    verifyOwnershipWrite(updateResult, doc, { userId: resolvedUserId, default: isDefault, level });

    notify.updated(OWNERSHIP_NOTIFY_KIND[documentType], (doc.name as string | null) ?? `${documentType} ${doc.id}`, {
      summary: `ownership level ${level}`,
    });

    return {
      success: true as const,
      data: {
        documentType,
        resolvedId: doc.id as string,
        ownership: { ...(doc.ownership ?? merged) },
      },
    };
  });
}

// GET — single-target read.
export async function getDocumentOwnership(input: GetDocumentOwnershipInputType): Promise<Envelope<{
  documentType: DocumentType;
  resolvedId: string | null;
  ownership: Record<string, number> | null;
  reason?: string;
}>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: getDocumentOwnership requires GM' };

  const target: Target = { documentType: input.documentType, uuid: input.uuid, id: input.id, name: input.name };

  // Folder is read-allowed but has no `ownership` field; return null payload with reason (ADR-024).
  if (input.documentType === 'folder') {
    const resolution = await resolveDocumentTarget(target);
    if (!resolution.doc) return { success: false, error: resolution.error ?? 'OWNERSHIP_NOT_FOUND' };
    return {
      success: true,
      data: {
        documentType: 'folder',
        resolvedId: resolution.doc.id as string,
        ownership: null,
        reason: 'folder_no_ownership_field',
      },
    };
  }

  const resolution = await resolveDocumentTarget(target);
  if (!resolution.doc) return { success: false, error: resolution.error ?? 'OWNERSHIP_NOT_FOUND' };
  const doc = resolution.doc;

  return {
    success: true,
    data: {
      documentType: input.documentType,
      resolvedId: doc.id as string,
      ownership: readOwnership(doc),
    },
  };
}

// BULK — per-class atomic via static <Class>.updateDocuments(updates).
// Cross-class best-effort. Folder targets reported per_class[folder].failed.
export async function bulkSetDocumentOwnership(input: BulkSetDocumentOwnershipInputType): Promise<Envelope<BulkResultEnvelope>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: bulkSetDocumentOwnership requires GM' };

  const { targets, userId, default: isDefault, level } = input;

  // Group targets by documentType, preserving order for stable per_class output.
  const groups = new Map<DocumentType, Target[]>();
  for (const t of targets) {
    const list = groups.get(t.documentType) ?? [];
    list.push(t);
    groups.set(t.documentType, list);
  }

  const perClass: BulkPerClassResult[] = [];

  return await wrappedWrite('bulkSetDocumentOwnership', async () => {
    // BUG-070 prevention: resolve userId ONCE for the whole bulk call. Same ID used for all
    // targets; invalid ID should reject the bulk entirely, not silently per-class-drop.
    const resolvedUserId = userId !== undefined ? resolveUserId(userId) : undefined;

    for (const [documentType, group] of groups) {
      const failed: BulkPerClassFailure[] = [];

      // Folder: cannot apply ownership (ADR-024). Every target in this group fails.
      if (documentType === 'folder') {
        for (const t of group) {
          failed.push({
            target: t,
            error: 'OWNERSHIP_FOLDER_NOT_SUPPORTED: BaseFolder has no `ownership` field (ADR-024)',
          });
        }
        perClass.push({ documentType, succeeded: 0, failed });
        continue;
      }

      // Resolve each target to its document; collect updates for the per-class batch.
      const updates: any[] = [];
      const resolvedDocs: ResolvedDoc[] = [];
      for (const t of group) {
        const resolution = await resolveDocumentTarget(t);
        if (!resolution.doc) {
          failed.push({ target: t, error: resolution.error ?? 'OWNERSHIP_NOT_FOUND' });
          continue;
        }
        const merged = buildMergedOwnership(readOwnership(resolution.doc), { userId: resolvedUserId, default: isDefault, level });
        updates.push({ _id: resolution.doc.id, ownership: merged });
        resolvedDocs.push({ doc: resolution.doc, resolvedId: resolution.doc.id });
      }

      if (updates.length === 0) {
        perClass.push({ documentType, succeeded: 0, failed });
        continue;
      }

      // Per-class atomic batch (ADR-025) — one socket round-trip per documentType.
      try {
        const DocClass = getDocumentClass(documentType);
        if (!DocClass?.implementation?.updateDocuments) {
          for (const rd of resolvedDocs) {
            failed.push({
              target: { documentType, id: rd.resolvedId },
              error: `OWNERSHIP_BULK_UNAVAILABLE: CONFIG.${documentType} document class missing static updateDocuments`,
            });
          }
          perClass.push({ documentType, succeeded: 0, failed });
          continue;
        }
        // BUG-070 prevention: updateDocuments returns Promise<Document[]>; docs that
        // fail validation get DROPPED but so do no-op (state-already-matches) docs.
        // Can't distinguish from the return array alone — must check each target's
        // actual post-state against the expected ownership entry.
        await DocClass.implementation.updateDocuments(updates);
        let succeeded = 0;
        for (const rd of resolvedDocs) {
          const after = readOwnership(rd.doc);
          const matches = isDefault === true
            ? after.default === level
            : (resolvedUserId !== undefined && after[resolvedUserId] === level);
          if (matches) {
            succeeded += 1;
          } else {
            const observed = isDefault === true
              ? after.default
              : (resolvedUserId !== undefined ? after[resolvedUserId] : undefined);
            failed.push({
              target: { documentType, id: rd.resolvedId },
              error:
                `OWNERSHIP_WRITE_NOT_PERSISTED: expected level ${level} but post-update map shows ` +
                `${observed ?? 'MISSING'}. Foundry dropped this document from the batch (per ` +
                `foundry_docs/abstract/classes/Document.md L558-576). Check F12 console for ` +
                `DataModelValidationError. Most common causes: invalid userId, invalid level, ` +
                `or a downstream validation constraint.`,
            });
          }
        }
        if (succeeded > 0) {
          notify.updated(OWNERSHIP_NOTIFY_KIND[documentType], `${succeeded}/${group.length} ${documentType}`, {
            summary: `level ${level}`,
          });
        }
        perClass.push({ documentType, succeeded, failed });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        notify.error(
          `Ownership bulk failed: ${message}`,
          err instanceof Error ? err : new Error(String(err)),
        );
        for (const rd of resolvedDocs) {
          failed.push({
            target: { documentType, id: rd.resolvedId },
            error: `OWNERSHIP_BULK_BATCH_FAILED: ${message}`,
          });
        }
        perClass.push({ documentType, succeeded: 0, failed });
      }
    }

    const overall_success = perClass.every(c => c.failed.length === 0);
    return { success: true as const, data: { overall_success, per_class: perClass } };
  });
}

// RESET — clear all per-user ownership; restore default: 0 (NONE).
export async function resetDocumentOwnership(input: ResetDocumentOwnershipInputType): Promise<Envelope<OwnershipPayload>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: resetDocumentOwnership requires GM' };

  if (input.documentType === 'folder') {
    return { success: false, error: 'OWNERSHIP_FOLDER_NOT_SUPPORTED: BaseFolder has no `ownership` field to reset (ADR-024)' };
  }

  const target: Target = { documentType: input.documentType, uuid: input.uuid, id: input.id, name: input.name };
  const resolution = await resolveDocumentTarget(target);
  if (!resolution.doc) return { success: false, error: resolution.error ?? 'OWNERSHIP_NOT_FOUND' };
  const doc = resolution.doc;

  return await wrappedWrite('resetDocumentOwnership', async () => {
    const cleared: Record<string, number> = { default: 0 };
    const updateResult = await doc.update({ ownership: cleared });
    // BUG-070 prevention: verify the reset actually persisted.
    verifyOwnershipWrite(updateResult, doc, { default: true, level: 0 });

    notify.updated(OWNERSHIP_NOTIFY_KIND[input.documentType], (doc.name as string | null) ?? `${input.documentType} ${doc.id}`, {
      summary: 'ownership reset',
    });

    return {
      success: true as const,
      data: {
        documentType: input.documentType,
        resolvedId: doc.id as string,
        ownership: { ...(doc.ownership ?? cleared) },
      },
    };
  });
}
