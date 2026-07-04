// Phase 6.1 mcp_crud_expansion — FilePicker umbrella schema.
//
// Three actions: upload / list / convert.
// Upload + convert can route through the conversion pipeline (sharp + ffmpeg-static)
// Node-side in mcp-server BEFORE posting to Foundry's /upload endpoint.
// List passes through to FilePicker.browse with optional recursive fan-out.
//
// References:
//   .agents/research/mcp_crud_expansion/phase6_filepicker_api.md §1-3, §10
//   .agents/research/mcp_crud_expansion/phase6_filepicker_design.md (a-f)
//
// Per BUG-069 typed-generic discipline: no z.any() in input schemas.
// Per user veto 2026-05-16: no workspace-containment path restriction (B5 NOT IMPLEMENTED).

import { z } from 'zod';

// ── Source enum ──────────────────────────────────────────────────────────────
// phase6_filepicker_api.md:62-69 — v13 source enum (legacy v10/v11 values removed).
export const FilePickerSource = z.enum(['data', 'public', 's3']);
export type FilePickerSourceType = z.infer<typeof FilePickerSource>;

// ── upload ──────────────────────────────────────────────────────────────────
export const FilePickerUploadInput = z
  .object({
    action: z.literal('upload'),
    source: FilePickerSource,
    // target: destination directory (NOT including filename).
    // When omitted, foundry-module handler falls back to:
    //   game.settings.get(MODULE_ID, 'default-converted-folder')  OR
    //   `worlds/${game.world.id}/assets/converted/`
    target: z.string().optional(),
    // file: URL ("http://" | "https://") | base64 ("data:..." or pure base64) | local absolute path.
    file: z.string().min(1),
    // filename: optional override. If omitted, derived from URL path or local path.
    // The conversion pipeline appends `.webp`/`.webm`/`.ogg` as appropriate.
    filename: z.string().optional(),
    // skipConversion: true forces upload of original buffer without conversion routing.
    // phase6_media_optimizer.md:175 — equivalent to media-optimizer CONFIG.SUPPRESS_MEDIA_OPTIMIZER.
    skipConversion: z.boolean().optional(),
  })
  .strict();

// ── list ────────────────────────────────────────────────────────────────────
export const FilePickerListInput = z
  .object({
    action: z.literal('list'),
    source: FilePickerSource,
    target: z.string(),
    options: z
      .object({
        bucket: z.string().optional(),
        extensions: z.array(z.string()).optional(),
        recursive: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

// ── convert ─────────────────────────────────────────────────────────────────
// Conversion without upload — returns base64 of the converted buffer.
// Useful for preview / dry-run flows.
export const FilePickerConvertInput = z
  .object({
    action: z.literal('convert'),
    file: z.string().min(1),
    filename: z.string().optional(),
    format: z.enum(['auto', 'webp', 'webm', 'ogg']).optional(),
  })
  .strict();

// ── create-directory (Phase 9C R9C.6) ──────────────────────────────────────
// Standalone directory creation (the private ensureDirectoryExists swallows EEXIST;
// this surfaces it). CCR-2a verified via re-browse on the foundry side.
export const FilePickerCreateDirectoryInput = z
  .object({
    action: z.literal('create-directory'),
    source: FilePickerSource,
    path: z.string().min(1),
  })
  .strict();

// ── Umbrella discriminated union ────────────────────────────────────────────
export const FilePickerToolInput = z.discriminatedUnion('action', [
  FilePickerUploadInput,
  FilePickerListInput,
  FilePickerConvertInput,
  FilePickerCreateDirectoryInput,
]);

export type FilePickerToolInputType = z.infer<typeof FilePickerToolInput>;
export type FilePickerUploadInputType = z.infer<typeof FilePickerUploadInput>;
export type FilePickerListInputType = z.infer<typeof FilePickerListInput>;
export type FilePickerConvertInputType = z.infer<typeof FilePickerConvertInput>;
export type FilePickerCreateDirectoryInputType = z.infer<typeof FilePickerCreateDirectoryInput>;

// ── wire payloads (mcp_code_quality_v2 Phase C2, task 3.3 — XPK-04 bypass closure) ──────────
// The foundry-module uploadFile/listFiles handlers previously cast `data as <Payload>` with only
// truthy checks. These are the WIRE shapes the mcp-server tool actually sends over the query
// boundary (post-conversion, `action` discriminant stripped) — DERIVED from the tool-input
// schemas above rather than redeclared, so field drift is impossible.
export const FilePickerUploadWirePayload = FilePickerUploadInput
  .omit({ action: true, skipConversion: true })
  .extend({
    // filename is always present on the wire (mcp-server derives it pre-upload).
    filename: z.string().min(1),
    // Conversion warnings surfaced handler-side via notify.warn (design (d)).
    conversionWarnings: z.array(z.string()).optional(),
  })
  .strict();
export type FilePickerUploadWirePayloadType = z.infer<typeof FilePickerUploadWirePayload>;

export const FilePickerListWirePayload = FilePickerListInput.omit({ action: true }).strict();
export type FilePickerListWirePayloadType = z.infer<typeof FilePickerListWirePayload>;

export interface FilePickerCreateDirectoryResponse {
  source: string;
  path: string;
  created: true;
}

// ── Response shapes ─────────────────────────────────────────────────────────
// FilePickerUploadResponse follows the producer-side envelope-extension pattern
// from feedback_mcp_post_write_verification: conversionWarnings is ALWAYS present
// (empty array when no warnings), so consumers can rely on its presence.

export interface FilePickerUploadResponse {
  success: true;
  path: string;
  original_size: number;
  converted_size: number;
  format: string; // 'webp' | 'webm' | 'ogg' | original extension when skipConversion / fallback
  conversionWarnings: string[];
}

// phase6_filepicker_api.md:50-54 — FilePicker.browse return shape.
export interface FilePickerListResponse {
  success: true;
  target: string;
  dirs: string[];
  files: string[];
  private: boolean;
  // gridSize is nullable in Foundry's response; surfaced for parity.
  gridSize: number | null;
  privateDirs: string[];
  extensions: string[];
}

export interface FilePickerConvertResponse {
  success: true;
  data: string; // base64
  original_size: number;
  converted_size: number;
  format: string;
  filename: string;
  conversionWarnings: string[];
}

export type FilePickerResponse =
  | FilePickerUploadResponse
  | FilePickerListResponse
  | FilePickerConvertResponse;
