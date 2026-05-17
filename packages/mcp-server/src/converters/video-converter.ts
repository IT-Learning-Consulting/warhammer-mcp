// Phase 6.1 — Video converter: MP4/MOV/AVI → WebM (VP9 + Opus) via ffmpeg-static.
//
// stdin → stdout pipes; zero temp files (sidesteps Windows path quoting issues).
// VP9 + Opus chosen over media-optimizer's VP8 + Vorbis for better compression
// at equivalent quality (ffmpeg-static binary supports VP9; legacy ffmpeg.wasm
// 0.10 used by media-optimizer did not).
// GIF-with-alpha case uses yuva420p + auto-alt-ref 0 per
// phase6_media_optimizer.md:131.

import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

export interface VideoConvertOpts {
  crf?: number; // Constant Rate Factor; lower=higher quality. VP9 sweet spot 28-35.
  isGif?: boolean; // GIF → WebM with transparency preserved.
}

export async function convertVideoToWebM(
  buffer: Buffer,
  opts: VideoConvertOpts = {}
): Promise<Buffer> {
  const crf = opts.crf ?? 32;
  const isGif = opts.isGif === true;

  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary path unavailable');
  }

  const args: string[] = ['-i', 'pipe:0', '-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0'];
  if (isGif) {
    args.push('-pix_fmt', 'yuva420p', '-auto-alt-ref', '0');
  } else {
    args.push('-c:a', 'libopus');
  }
  args.push('-f', 'webm', 'pipe:1');

  return new Promise<Buffer>((resolve, reject) => {
    const proc = spawn(ffmpegPath as string, args);
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    proc.stderr.on('data', (chunk: Buffer) => errChunks.push(chunk));
    proc.on('error', (err) => reject(new Error(`ffmpeg spawn error: ${err.message}`)));
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        const stderr = Buffer.concat(errChunks).toString('utf8');
        reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-500)}`));
      }
    });

    proc.stdin.write(buffer);
    proc.stdin.end();
  });
}
