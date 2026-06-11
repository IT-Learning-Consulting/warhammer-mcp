// Phase 6.1 mcp_crud_expansion — FilePicker handlers (Foundry-side).
//
// Two query keys: uploadFile, listFiles.
// uploadFile delegates to foundry.applications.apps.FilePicker.implementation.upload
//   (phase6_filepicker_api.md §1) and handles the default-converted-folder fallback
//   when caller omits `target`.
// listFiles wraps FilePicker.browse (phase6_filepicker_api.md §2) with optional
//   recursive fan-out (A1).
//
// MCP-server's filepicker tool calls these via game.user.query() (per
// reference_foundry_v13_query_api memory: game.user.query NOT game.query).
//
// CCR-Trust: validateGMAccess() gate on every handler.
// CCR-Envelope: returns {success, data} or {success, error}.

import { MODULE_ID } from '../constants.js';
import { notify } from '../notify.js';

// ── Local types ─────────────────────────────────────────────────────────────
// CCR-1 envelope contract: success returns { success: true, data: T }.
// foundry-client.ts unwrap returns envelope.data — flat {success, ...fields}
// shape causes data=undefined at the call site (BUG-087, fixed 2026-05-16).
type EnvelopeOK<T extends object> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };

interface UploadFilePayload {
  source: 'data' | 'public' | 's3';
  target?: string;
  // file is base64-encoded content (already converted if conversion happened mcp-server-side).
  file: string;
  filename: string;
  // Surfaced when conversion failed mcp-server-side — handler raises notify.warn.
  conversionWarnings?: string[];
}

interface UploadFileResponse {
  path: string; // canonical Foundry path returned by /upload
  status?: string;
}

interface ListFilesPayload {
  source: 'data' | 'public' | 's3';
  target: string;
  options?: {
    bucket?: string;
    extensions?: string[];
    recursive?: boolean;
  };
}

interface ListFilesResponse {
  target: string;
  dirs: string[];
  files: string[];
  private: boolean;
  gridSize: number | null;
  privateDirs: string[];
  extensions: string[];
}

// ── Access gate ─────────────────────────────────────────────────────────────
function validateGMAccess(): { allowed: boolean } {
  if (!(game as any).user?.isGM) return { allowed: false };
  return { allowed: true };
}

// ── Target-folder resolution (tier 2 + tier 3 of design (e)) ────────────────
// Revised 2026-05-16 (user spec): per-MIME-type routing under user-data Data/
// tree, NOT under worlds/<id>/ — world updates wipe per-world data, so storing
// converted assets there causes silent data loss on world rewrite. Plan's
// Design Decisions table flagged this revisit-trigger explicitly.
//
// Resolution order:
//   1. World-setting `default-converted-folder` (single-folder override; if set)
//   2. MIME-aware routing by output filename extension (default)
//      - audio (ogg/mp3/wav/flac/m4a/aac/opus) → `audio/converted/`
//      - animated/video (webm/mp4/mov/gif/avi/mkv) → `images/Animated/converted/`
//      - static images (everything else) → `images/converted/`
function resolveDefaultTarget(filename: string): string {
  try {
    const setting = (game as any)?.settings?.get?.(MODULE_ID, 'default-converted-folder');
    if (typeof setting === 'string' && setting.trim().length > 0) {
      return setting;
    }
  } catch {
    // settings not yet registered; fall through.
  }

  const ext = (filename.toLowerCase().split('.').pop() ?? '').trim();
  if (['webm', 'mp4', 'mov', 'gif', 'avi', 'mkv'].includes(ext)) {
    return 'images/Animated/converted/';
  }
  if (['ogg', 'mp3', 'wav', 'flac', 'm4a', 'aac', 'opus'].includes(ext)) {
    return 'audio/converted/';
  }
  return 'images/converted/';
}

// ── Recursive directory creation ────────────────────────────────────────────
// FilePicker.upload does NOT auto-create missing target directories — caller
// hits "FilePicker.upload returned no result" (smoke 1b 2026-05-16). For the
// new MIME-aware defaults (audio/converted/, images/converted/, images/
// Animated/converted/) we must ensure the path exists before upload. Walk the
// path and createDirectory each level; ignore "already exists" failures.
async function ensureDirectoryExists(source: string, target: string): Promise<void> {
  const FilePicker: any = (foundry as any)?.applications?.apps?.FilePicker?.implementation;
  if (!FilePicker?.createDirectory) return;

  const parts = target.replace(/\/+$/, '').split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    stack.push(part);
    const path = stack.join('/');
    try {
      await FilePicker.createDirectory(source, path);
    } catch {
      // EEXIST / permission / unsupported source — fall through; the
      // subsequent upload call will surface a real error if relevant.
    }
  }
}

// ── base64 → File helper ────────────────────────────────────────────────────
// FilePicker.implementation.upload expects a browser File object.
// We have base64 from the mcp-server query payload — decode to Uint8Array, wrap.
function base64ToFile(base64: string, filename: string): File {
  // Strip data-URL prefix if present.
  const commaIdx = base64.indexOf(',');
  const raw = commaIdx >= 0 && base64.startsWith('data:') ? base64.slice(commaIdx + 1) : base64;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  // Type is irrelevant — Foundry's server-side check uses extension, not MIME.
  return new File([bytes], filename, { type: 'application/octet-stream' });
}

// ── uploadFile handler ──────────────────────────────────────────────────────
export async function uploadFile(
  data: unknown
): Promise<EnvelopeOK<UploadFileResponse> | EnvelopeErr> {
  try {
    const gmCheck = validateGMAccess();
    if (!gmCheck.allowed) return { success: false, error: 'Access denied (GM-only)' };

    const payload = data as UploadFilePayload;
    if (!payload?.source || !payload?.file || !payload?.filename) {
      return { success: false, error: 'uploadFile: missing required fields (source, file, filename)' };
    }

    // Surface mcp-server-side conversion warnings via notify.warn (design (d)).
    if (Array.isArray(payload.conversionWarnings) && payload.conversionWarnings.length > 0) {
      for (const warning of payload.conversionWarnings) {
        notify.warn(`FilePicker conversion: ${warning}`);
      }
    }

    const target =
      payload.target && payload.target.length > 0
        ? payload.target
        : resolveDefaultTarget(payload.filename);

    await ensureDirectoryExists(payload.source, target);

    const file = base64ToFile(payload.file, payload.filename);

    const FilePicker: any = (foundry as any)?.applications?.apps?.FilePicker?.implementation;
    if (!FilePicker?.upload) {
      return { success: false, error: 'FilePicker.implementation.upload unavailable in this Foundry version' };
    }

    // phase6_filepicker_api.md:20-37 — upload(source, path, file, body, options).
    const result = await FilePicker.upload(payload.source, target, file, {}, { notify: false });

    if (!result || result === false) {
      return { success: false, error: 'FilePicker.upload returned no result (likely 413 too-large or path-containment violation)' };
    }
    if (typeof result === 'object' && (result as any).path) {
      return { success: true, data: { path: (result as any).path, status: (result as any).status } };
    }
    return { success: false, error: 'FilePicker.upload returned malformed response' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown upload error' };
  }
}

// ── listFiles handler ───────────────────────────────────────────────────────
export async function listFiles(
  data: unknown
): Promise<EnvelopeOK<ListFilesResponse> | EnvelopeErr> {
  try {
    const gmCheck = validateGMAccess();
    if (!gmCheck.allowed) return { success: false, error: 'Access denied (GM-only)' };

    const payload = data as ListFilesPayload;
    if (!payload?.source || typeof payload?.target !== 'string') {
      return { success: false, error: 'listFiles: missing required fields (source, target)' };
    }

    const FilePicker: any = (foundry as any)?.applications?.apps?.FilePicker?.implementation;
    if (!FilePicker?.browse) {
      return { success: false, error: 'FilePicker.browse unavailable in this Foundry version' };
    }

    const opts = payload.options ?? {};
    const recursive = opts.recursive === true;

    const result = await FilePicker.browse(payload.source, payload.target, {
      bucket: opts.bucket,
      extensions: opts.extensions,
    });

    if (!recursive) {
      return {
        success: true,
        data: {
          target: result.target,
          dirs: result.dirs ?? [],
          files: result.files ?? [],
          private: !!result.private,
          gridSize: result.gridSize ?? null,
          privateDirs: result.privateDirs ?? [],
          extensions: result.extensions ?? [],
        },
      };
    }

    // BUG-296: use Sets for dedup so concurrent Promise.all branches can't both pass
    // an includes()-check before either has pushed — Set.add is synchronous and atomic.
    const dirsSet: Set<string> = new Set(result.dirs ?? []);
    const filesSet: Set<string> = new Set(result.files ?? []);
    const privateDirsSet: Set<string> = new Set(result.privateDirs ?? []);

    async function descend(target: string): Promise<void> {
      const sub = await FilePicker.browse(payload.source, target, {
        bucket: opts.bucket,
        extensions: opts.extensions,
      });
      const newDirs: string[] = [];
      for (const d of sub.dirs ?? []) {
        if (!dirsSet.has(d)) {
          dirsSet.add(d);  // add synchronously before any await to prevent races
          newDirs.push(d);
        }
      }
      for (const f of sub.files ?? []) {
        filesSet.add(f);
      }
      for (const d of sub.privateDirs ?? []) {
        privateDirsSet.add(d);
      }
      // Recurse into newly-discovered subdirs (already registered in the Set).
      await Promise.all(newDirs.map((d) => descend(d)));
    }

    await Promise.all((result.dirs ?? []).map((d: string) => descend(d)));

    return {
      success: true,
      data: {
        target: result.target,
        dirs: Array.from(dirsSet),
        files: Array.from(filesSet),
        private: !!result.private,
        gridSize: result.gridSize ?? null,
        privateDirs: Array.from(privateDirsSet),
        extensions: result.extensions ?? [],
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown list error' };
  }
}

// ── createDirectory handler (Phase 9C R9C.6 — Option A named export) ─────────
// MCP-server invokes this via game.user.query('warhammer-mcp.filepickerCreateDirectory', {source, path}).
// Surfaces an EEXIST as a clear error (unlike the private ensureDirectoryExists which swallows it).
// CCR-2a: verify via re-browse of the parent dir.
interface CreateDirectoryPayload {
  source: 'data' | 'public' | 's3';
  path: string;
}

export async function createDirectory(
  data: unknown,
): Promise<EnvelopeOK<{ source: string; path: string; created: true }> | EnvelopeErr> {
  try {
    const gmCheck = validateGMAccess();
    if (!gmCheck.allowed) return { success: false, error: 'Access denied (GM-only)' };

    const payload = data as CreateDirectoryPayload;
    if (!payload?.source || typeof payload?.path !== 'string' || payload.path.length === 0) {
      return { success: false, error: 'createDirectory: missing required fields (source, path)' };
    }

    const FilePicker: any = (foundry as any)?.applications?.apps?.FilePicker?.implementation;
    if (!FilePicker?.createDirectory || !FilePicker?.browse) {
      return { success: false, error: 'FilePicker.createDirectory/browse unavailable in this Foundry version' };
    }

    const normalized = payload.path.replace(/\/+$/, '');
    try {
      await FilePicker.createDirectory(payload.source, normalized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Surface EEXIST clearly rather than swallowing (unlike ensureDirectoryExists).
      return { success: false, error: `FILEPICKER_CREATE_DIRECTORY_FAILED: ${msg}` };
    }

    // CCR-2a: re-browse the parent and confirm the new dir is listed.
    const slash = normalized.lastIndexOf('/');
    const parent = slash >= 0 ? normalized.slice(0, slash) : '';
    const browseResult = await FilePicker.browse(payload.source, parent);
    const dirs: string[] = browseResult?.dirs ?? [];
    if (!dirs.includes(normalized)) {
      return {
        success: false,
        error: `FILEPICKER_CREATE_DIRECTORY_NOT_PERSISTED: "${normalized}" not listed under "${parent}" after create`,
      };
    }

    notify.info(`Created directory "${normalized}" (${payload.source})`);
    return { success: true, data: { source: payload.source, path: normalized, created: true } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown createDirectory error' };
  }
}

// ── notify.warn round-trip handler (design (d)) ─────────────────────────────
// MCP-server invokes this via game.user.query('warhammer-mcp.filepickerNotifyWarn', {message}).
// Required for the conversion-failure UX even when no upload occurs (filepicker.convert).
export async function notifyWarn(
  data: unknown
): Promise<{ success: true } | EnvelopeErr> {
  try {
    const gmCheck = validateGMAccess();
    if (!gmCheck.allowed) return { success: false, error: 'Access denied (GM-only)' };
    const payload = data as { message?: string };
    if (typeof payload?.message !== 'string' || payload.message.length === 0) {
      return { success: false, error: 'notifyWarn: missing message' };
    }
    notify.warn(payload.message);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown notify error' };
  }
}
