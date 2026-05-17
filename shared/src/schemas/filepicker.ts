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

// ── Umbrella discriminated union ────────────────────────────────────────────
export const FilePickerToolInput = z.discriminatedUnion('action', [
  FilePickerUploadInput,
  FilePickerListInput,
  FilePickerConvertInput,
]);

export type FilePickerToolInputType = z.infer<typeof FilePickerToolInput>;
export type FilePickerUploadInputType = z.infer<typeof FilePickerUploadInput>;
export type FilePickerListInputType = z.infer<typeof FilePickerListInput>;
export type FilePickerConvertInputType = z.infer<typeof FilePickerConvertInput>;

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
