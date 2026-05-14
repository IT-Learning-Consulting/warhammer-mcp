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

import { MODULE_ID } from '../constants.js';
import { wrappedWrite } from '../transaction-manager.js';
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
    const merged = buildMergedOwnership(readOwnership(doc), { userId, default: isDefault, level });
    await doc.update({ ownership: merged });
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
        const merged = buildMergedOwnership(readOwnership(resolution.doc), { userId, default: isDefault, level });
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
        await DocClass.implementation.updateDocuments(updates);
        perClass.push({ documentType, succeeded: updates.length, failed });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[${MODULE_ID}] bulkSetDocumentOwnership ${documentType} batch failed:`, err);
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
    await doc.update({ ownership: cleared });
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
