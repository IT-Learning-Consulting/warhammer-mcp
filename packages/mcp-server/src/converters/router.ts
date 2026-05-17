// Phase 6.1 mcp_crud_expansion — Conversion router.
//
// resolveInput: URL / base64 / local-path → Buffer + filename + MIME.
// routeConverter: MIME + skipConversion → converter fn | null (skip-list).
//
// Skip-list pattern lifted from phase6_media_optimizer.md:172 — never double-convert.
// GIF-image routes to video-converter (transparency preservation) per
// phase6_media_optimizer.md:128.

import { promises as fs } from 'fs';
import { convertImageToWebP } from './image-converter.js';
import { convertVideoToWebM } from './video-converter.js';
import { convertAudioToOgg } from './audio-converter.js';

export interface ResolvedInput {
  buffer: Buffer;
  originalFilename: string;
  detectedMime: string;
}

export type ConverterFn = (buffer: Buffer) => Promise<{ buffer: Buffer; format: string }>;

// ── Magic-byte signature detection ──────────────────────────────────────────
// Minimal coverage for the formats we accept (per phase6_filepicker_api.md §10
// CONST.UPLOADABLE_FILE_EXTENSIONS).
function detectMime(buffer: Buffer, filenameHint?: string): string {
  if (buffer.length >= 4) {
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return 'image/gif';
    }
    // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return 'image/webp';
    }
    // OGG: 4F 67 67 53 (OggS)
    if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
      return 'audio/ogg';
    }
    // WebM: 1A 45 DF A3 (EBML)
    if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
      return 'video/webm';
    }
    // MP4 / m4v / m4a: variable ftyp box at offset 4. Sniff for 'ftyp' at bytes 4-7.
    if (
      buffer.length >= 12 &&
      buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70
    ) {
      // distinguish audio (M4A) vs video by ftyp box brand bytes 8-11.
      const brand = buffer.slice(8, 12).toString('ascii');
      if (brand.startsWith('M4A')) return 'audio/mp4';
      return 'video/mp4';
    }
    // MP3: ID3 tag (49 44 33) or MPEG sync (FF Fx).
    if (
      (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) ||
      (buffer[0] === 0xff && (buffer[1] & 0xf0) === 0xf0)
    ) {
      return 'audio/mpeg';
    }
    // WAV: 52 49 46 46 ... 57 41 56 45 (RIFF...WAVE)
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45
    ) {
      return 'audio/wav';
    }
    // FLAC: 66 4C 61 43 (fLaC)
    if (buffer[0] === 0x66 && buffer[1] === 0x4c && buffer[2] === 0x61 && buffer[3] === 0x43) {
      return 'audio/flac';
    }
  }

  // Fallback to extension hint.
  if (filenameHint) {
    const ext = filenameHint.toLowerCase().split('.').pop() ?? '';
    const extMap: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml',
      mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
      m4a: 'audio/mp4', aac: 'audio/aac',
    };
    if (extMap[ext]) return extMap[ext];
  }
  return 'application/octet-stream';
}

function extractFilenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const last = pathname.split('/').filter(Boolean).pop();
    return last ?? 'download';
  } catch {
    return 'download';
  }
}

function extractFilenameFromPath(p: string): string {
  return p.split(/[\\/]/).filter(Boolean).pop() ?? 'file';
}

// ── resolveInput ────────────────────────────────────────────────────────────
export async function resolveInput(input: {
  file: string;
  filename?: string;
}): Promise<ResolvedInput> {
  const { file, filename } = input;

  // URL
  if (/^https?:\/\//i.test(file)) {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`fetch failed: HTTP ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resolvedFilename = filename ?? extractFilenameFromUrl(file);
    return {
      buffer,
      originalFilename: resolvedFilename,
      detectedMime: detectMime(buffer, resolvedFilename),
    };
  }

  // base64 (data: URL or pure base64)
  if (file.startsWith('data:')) {
    const commaIdx = file.indexOf(',');
    const base64Part = commaIdx >= 0 ? file.slice(commaIdx + 1) : file;
    const buffer = Buffer.from(base64Part, 'base64');
    const resolvedFilename = filename ?? 'data-url-input';
    return {
      buffer,
      originalFilename: resolvedFilename,
      detectedMime: detectMime(buffer, resolvedFilename),
    };
  }
  // Pure base64 (no data: prefix) — heuristic: only [A-Za-z0-9+/=] + length > 32.
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(file) && file.length > 32) {
    const buffer = Buffer.from(file, 'base64');
    const resolvedFilename = filename ?? 'base64-input';
    return {
      buffer,
      originalFilename: resolvedFilename,
      detectedMime: detectMime(buffer, resolvedFilename),
    };
  }

  // Local path
  const buffer = await fs.readFile(file);
  const resolvedFilename = filename ?? extractFilenameFromPath(file);
  return {
    buffer,
    originalFilename: resolvedFilename,
    detectedMime: detectMime(buffer, resolvedFilename),
  };
}

// ── routeConverter ──────────────────────────────────────────────────────────
// Returns null when conversion should be skipped (already-optimized format OR
// skipConversion=true OR unrecognized MIME).
export function routeConverter(mime: string, skipConversion?: boolean): ConverterFn | null {
  if (skipConversion === true) return null;

  // Already-optimized skip-list (phase6_media_optimizer.md:172).
  if (mime === 'image/webp' || mime === 'video/webm' || mime === 'audio/ogg') return null;

  // GIF routes to video-converter for transparency preservation.
  if (mime === 'image/gif') {
    return async (buffer: Buffer) => ({
      buffer: await convertVideoToWebM(buffer, { isGif: true }),
      format: 'webm',
    });
  }

  if (mime.startsWith('image/')) {
    return async (buffer: Buffer) => ({
      buffer: await convertImageToWebP(buffer),
      format: 'webp',
    });
  }

  if (mime.startsWith('video/')) {
    return async (buffer: Buffer) => ({
      buffer: await convertVideoToWebM(buffer),
      format: 'webm',
    });
  }

  if (mime.startsWith('audio/')) {
    return async (buffer: Buffer) => ({
      buffer: await convertAudioToOgg(buffer),
      format: 'ogg',
    });
  }

  // Unknown / unsupported → skip (upload original).
  return null;
}

// Filename-rewriting helper: replaces the extension to match the target format.
export function rewriteFilenameExtension(filename: string, newFormat: string): string {
  const lastDot = filename.lastIndexOf('.');
  const base = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  return `${base}.${newFormat}`;
}
