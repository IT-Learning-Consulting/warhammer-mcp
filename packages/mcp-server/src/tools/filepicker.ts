// Phase 6.1 mcp_crud_expansion — FilePicker umbrella tool (3 actions).
//
// Actions:
//   upload  — convert (if applicable) + POST to Foundry /upload
//   list    — browse Foundry asset paths (with optional recursive fan-out)
//   convert — convert without uploading; return base64 (preview / dry-run)
//
// Conversion runs Node-side in mcp-server BEFORE the upload — sidesteps Foundry
// SharedArrayBuffer / libWrapper churn. See phase6_filepicker_design.md.
//
// CCR-Envelope-Consumer: typed-generic query<T>, no <any>, try/catch every handler.
// BUG-069 typed-generic discipline enforced.
// Description budget ≤2900 chars (F01).

import { z } from 'zod';
import {
  FilePickerToolInput,
  type FilePickerUploadResponse,
  type FilePickerListResponse,
  type FilePickerCreateDirectoryResponse,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';
import {
  resolveInput,
  routeConverter,
  rewriteFilenameExtension,
} from '../converters/router.js';

type FilePickerArgs = z.infer<typeof FilePickerToolInput>;
type ArgsFor<A extends FilePickerArgs['action']> = Extract<FilePickerArgs, { action: A }>;


export interface FilePickerToolOptions extends BaseToolOptions {}

export class FilePickerTool extends BaseTool {
  constructor(options: FilePickerToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'filepicker',
        title: 'FilePicker (upload + list + convert with auto-conversion)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: `Manage Foundry asset uploads, listing, and directory creation via 4 actions. Auto-converts PNG/JPG→WebP (sharp), MP4/MOV→WebM/VP9 (ffmpeg-static), MP3/WAV/FLAC→OGG/Vorbis (ffmpeg-static). Conversion runs Node-side in mcp-server before posting to Foundry /upload. Already-optimized formats (image/webp, video/webm, audio/ogg) pass through unchanged.

**Actions:**
- **upload**: Convert (if applicable) + POST to Foundry /upload. Required: source, file. Optional: target (default: 'default-converted-folder' world-setting OR worlds/<id>/assets/converted/), filename, skipConversion. Returns {path, original_size, converted_size, format, conversionWarnings: []}.
- **list**: Browse Foundry asset paths. Required: source, target. Optional options: {bucket, extensions[], recursive}. Recursive flattens subdirs via Promise.all fan-out. Returns Foundry FilePicker.browse shape {target, dirs[], files[], private, gridSize, privateDirs[], extensions[]}.
- **convert**: Run conversion pipeline without uploading. Returns base64 of converted buffer. Useful for preview / dry-run flows.
- **create-directory** (Phase 9C): Create a subdirectory (FilePicker.createDirectory). Required: source, path. Surfaces EEXIST as a clear error; verifies via re-browse. Returns {source, path, created}.

**Sources** (Foundry v13 enum): "data" (writable, default; userData/Data/), "public" (read-only; install/public/), "s3" (writable; requires awsConfig).

**Conversion failure UX**: lenient — converter throw triggers notify.warn round-trip to GM + populates conversionWarnings: [String] in envelope + uploads ORIGINAL buffer with original extension. GM workflow never blocks on a quirky codec.

**File input** accepts: URL (http:// | https://), data URL ("data:image/png;base64,..."), pure base64 string (no prefix), absolute local path.

**Examples:**
- upload from URL: {action:"upload", source:"data", target:"worlds/aitww/assets/maps", file:"https://example.com/map.png", filename:"tavern.png"} → returns {path: "worlds/aitww/assets/maps/tavern.webp", format: "webp", original_size: 1245678, converted_size: 312456, conversionWarnings: []}
- upload from base64: {action:"upload", source:"data", file:"data:audio/mpeg;base64,...", filename:"theme.mp3"} → {format: "ogg", path: ".../theme.ogg"}
- skip conversion: {action:"upload", source:"data", file:"/tmp/exact.png", skipConversion:true} → {format: "png", original_size = converted_size}
- list recursive: {action:"list", source:"data", target:"worlds/aitww/", options:{recursive:true}}
- convert dry-run: {action:"convert", file:"data:image/png;base64,...", filename:"icon.png"} → {data: "<base64>", format: "webp"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['upload', 'list', 'convert', 'create-directory'],
              description: 'The filepicker action to perform.',
            },
            source: {
              type: 'string',
              enum: ['data', 'public', 's3'],
              description: '[upload/list/create-directory] Foundry v13 source enum.',
            },
            target: {
              type: 'string',
              description:
                '[upload/list] Destination/browse directory. On upload, falls back to default-converted-folder world-setting OR worlds/<id>/assets/converted/.',
            },
            path: {
              type: 'string',
              description: '[create-directory] Directory path to create (must not already exist).',
            },
            file: {
              type: 'string',
              description:
                '[upload/convert] URL, data: URL, pure base64, or absolute local path. Conversion routes by magic-byte signature.',
            },
            filename: {
              type: 'string',
              description:
                '[upload/convert] Optional filename override. Extension auto-rewritten on conversion (.png → .webp).',
            },
            skipConversion: {
              type: 'boolean',
              description: '[upload] If true, bypass conversion router; upload original buffer unchanged.',
            },
            format: {
              type: 'string',
              enum: ['auto', 'webp', 'webm', 'ogg'],
              description: '[convert] Force converter choice (default "auto" routes by detected MIME).',
            },
            options: {
              type: 'object',
              description: '[list] {bucket?, extensions?: string[], recursive?: boolean}',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: FilePickerArgs) {
    this.logger.info('Executing filepicker action', { action: args.action });
    switch (args.action) {
      case 'upload':
        return this.handleUpload(args);
      case 'list':
        return this.handleList(args);
      case 'convert':
        return this.handleConvert(args);
      case 'create-directory':
        return this.handleCreateDirectory(args);
    }
  }

  // ── create-directory (Phase 9C) ────────────────────────────────────────────
  private async handleCreateDirectory(args: ArgsFor<'create-directory'>) {
    try {
      const data = await this.query<FilePickerCreateDirectoryResponse>('filepickerCreateDirectory', {
        source: args.source,
        path: args.path,
      });
      const text = `📂 **Directory Created**\n\n- Source: \`${data.source}\`\n- Path: \`${data.path}\``;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('create-directory', e instanceof Error ? e.message : String(e));
    }
  }

  // ── upload ────────────────────────────────────────────────────────────────
  private async handleUpload(args: ArgsFor<'upload'>) {
    try {
      const resolved = await resolveInput(
        args.filename !== undefined
          ? { file: args.file, filename: args.filename }
          : { file: args.file }
      );
      const originalSize = resolved.buffer.length;

      let buffer = resolved.buffer;
      let filename = resolved.originalFilename;
      let format = filenameExtension(filename);
      const conversionWarnings: string[] = [];

      const converter = routeConverter(resolved.detectedMime, args.skipConversion);
      if (converter) {
        try {
          const result = await converter(resolved.buffer);
          buffer = result.buffer;
          format = result.format;
          filename = rewriteFilenameExtension(filename, result.format);
        } catch (err) {
          // Lenient failure: notify.warn + conversionWarnings + upload original.
          const msg = err instanceof Error ? err.message : String(err);
          conversionWarnings.push(`Conversion failed for ${resolved.originalFilename}: ${msg}`);
          try {
            await this.query<{}>('filepickerNotifyWarn', {
              message: `Conversion failed for ${resolved.originalFilename} — uploaded original (${msg})`,
            });
          } catch {
            // notify.warn failure is non-fatal — warning still surfaces via conversionWarnings.
          }
          // buffer/filename/format remain as-original.
        }
      }

      const convertedSize = buffer.length;
      const fileBase64 = buffer.toString('base64');

      // uploadFile foundry handler also fires notify.warn for each warning — but
      // that's the upload-confirmation channel. The pre-upload notify above is
      // the failure-during-conversion channel. Both fire when conversion fails.
      const uploadResult = await this.query<{ path: string; status?: string }>('uploadFile', {
        source: args.source,
        target: args.target,
        file: fileBase64,
        filename,
        conversionWarnings,
      });

      const response: FilePickerUploadResponse = {
        success: true,
        path: uploadResult.path,
        original_size: originalSize,
        converted_size: convertedSize,
        format,
        conversionWarnings,
      };

      const warnLine =
        conversionWarnings.length > 0
          ? `\n\n⚠️ Conversion warnings:\n- ${conversionWarnings.join('\n- ')}`
          : '';

      const text = `📤 **File Uploaded**\n\n- Path: \`${response.path}\`\n- Format: ${response.format}\n- Original size: ${originalSize} bytes\n- Converted size: ${convertedSize} bytes (${
        originalSize > 0 ? Math.round((1 - convertedSize / originalSize) * 100) : 0
      }% reduction)${warnLine}`;
      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: response,
      };
    } catch (e) {
      return this.errorResponse('upload', e instanceof Error ? e.message : String(e));
    }
  }

  // ── list ──────────────────────────────────────────────────────────────────
  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<FilePickerListResponse>('listFiles', {
        source: args.source,
        target: args.target,
        options: args.options,
      });

      const dirsBlock = data.dirs.length
        ? `\n\n**Dirs** (${data.dirs.length}):\n- ${data.dirs.slice(0, 50).join('\n- ')}${
            data.dirs.length > 50 ? `\n_(+${data.dirs.length - 50} more)_` : ''
          }`
        : '\n\n_(no dirs)_';
      const filesBlock = data.files.length
        ? `\n\n**Files** (${data.files.length}):\n- ${data.files.slice(0, 50).join('\n- ')}${
            data.files.length > 50 ? `\n_(+${data.files.length - 50} more)_` : ''
          }`
        : '\n\n_(no files)_';

      const text = `📁 **Browse: ${data.target}**${dirsBlock}${filesBlock}`;
      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: data,
      };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }

  // ── convert ───────────────────────────────────────────────────────────────
  private async handleConvert(args: ArgsFor<'convert'>) {
    try {
      const resolved = await resolveInput(
        args.filename !== undefined
          ? { file: args.file, filename: args.filename }
          : { file: args.file }
      );
      const originalSize = resolved.buffer.length;

      let buffer = resolved.buffer;
      let filename = resolved.originalFilename;
      let format = filenameExtension(filename);
      const conversionWarnings: string[] = [];

      const forced = args.format && args.format !== 'auto' ? args.format : null;
      const converter = forced
        ? buildForcedConverter(forced)
        : routeConverter(resolved.detectedMime, false);

      if (converter) {
        try {
          const result = await converter(resolved.buffer);
          buffer = result.buffer;
          format = result.format;
          filename = rewriteFilenameExtension(filename, result.format);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          conversionWarnings.push(`Conversion failed for ${resolved.originalFilename}: ${msg}`);
          try {
            await this.query<{}>('filepickerNotifyWarn', {
              message: `Conversion failed for ${resolved.originalFilename}: ${msg}`,
            });
          } catch {
            // non-fatal.
          }
        }
      }

      const data = buffer.toString('base64');
      const response = {
        success: true as const,
        data,
        original_size: originalSize,
        converted_size: buffer.length,
        format,
        filename,
        conversionWarnings,
      };

      const warnLine =
        conversionWarnings.length > 0
          ? `\n\n⚠️ Conversion warnings:\n- ${conversionWarnings.join('\n- ')}`
          : '';
      const text = `🔁 **Convert Complete**\n\n- Filename: \`${filename}\`\n- Format: ${format}\n- Original size: ${originalSize} bytes\n- Converted size: ${buffer.length} bytes${warnLine}\n- base64 length: ${data.length} chars`;
      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: response,
      };
    } catch (e) {
      return this.errorResponse('convert', e instanceof Error ? e.message : String(e));
    }
  }
}

// ── helpers ─────────────────────────────────────────────────────────────────

function filenameExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot < 0) return '';
  return filename.slice(lastDot + 1).toLowerCase();
}

import { convertImageToWebP } from '../converters/image-converter.js';
import { convertVideoToWebM } from '../converters/video-converter.js';
import { convertAudioToOgg } from '../converters/audio-converter.js';

function buildForcedConverter(
  format: 'webp' | 'webm' | 'ogg'
): (buffer: Buffer) => Promise<{ buffer: Buffer; format: string }> {
  if (format === 'webp') {
    return async (buf) => ({ buffer: await convertImageToWebP(buf), format: 'webp' });
  }
  if (format === 'webm') {
    return async (buf) => ({ buffer: await convertVideoToWebM(buf), format: 'webm' });
  }
  return async (buf) => ({ buffer: await convertAudioToOgg(buf), format: 'ogg' });
}
