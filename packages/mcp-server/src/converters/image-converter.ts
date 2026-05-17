// Phase 6.1 — Image converter: PNG/JPG/static image → WebP via sharp.
//
// Defaults: quality=75, maxResolution=8192 — match media-optimizer settings table
// (phase6_media_optimizer.md:98-99).
// animated: true preserves frames for animated PNG / animated SVG.
// resize with fit=inside + withoutEnlargement only downscales; small images pass through.

import sharp from 'sharp';

export interface ImageConvertOpts {
  quality?: number;
  maxResolution?: number;
}

export async function convertImageToWebP(
  buffer: Buffer,
  opts: ImageConvertOpts = {}
): Promise<Buffer> {
  const quality = opts.quality ?? 75;
  const maxResolution = opts.maxResolution ?? 8192;

  return sharp(buffer, { animated: true })
    .resize({
      width: maxResolution,
      height: maxResolution,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();
}
