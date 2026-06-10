// Phase 6.1 — Audio converter: MP3/WAV/FLAC/M4A → OGG (Vorbis) via ffmpeg-static.
//
// stdin → stdout pipes; zero temp files.
// libvorbis q:a 3 (~112 kbps VBR) per phase6_media_optimizer.md:139.

import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

export interface AudioConvertOpts {
  quality?: number; // libvorbis q:a 0-10 (10 highest). Default 3 ≈ 112 kbps VBR.
}

export async function convertAudioToOgg(
  buffer: Buffer,
  opts: AudioConvertOpts = {}
): Promise<Buffer> {
  const quality = opts.quality ?? 3;

  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary path unavailable');
  }

  const args = [
    '-i', 'pipe:0',
    '-c:a', 'libvorbis',
    '-q:a', String(quality),
    '-vn', // drop any video stream
    '-f', 'ogg',
    'pipe:1',
  ];

  return new Promise<Buffer>((resolve, reject) => {
    const proc = spawn(ffmpegPath as string, args);
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    let settled = false;
    const settle = (fn: () => void) => { if (!settled) { settled = true; fn(); } };

    proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    proc.stderr.on('data', (chunk: Buffer) => errChunks.push(chunk));
    proc.on('error', (err) => settle(() => reject(new Error(`ffmpeg spawn error: ${err.message}`))));
    // BUG-316: catch stdin EPIPE so early ffmpeg exit doesn't become an unhandled stream error
    proc.stdin.on('error', (err) => settle(() => reject(new Error(`ffmpeg stdin error: ${err.message}`))));
    proc.on('close', (code) => {
      if (code === 0) {
        settle(() => resolve(Buffer.concat(chunks)));
      } else {
        const stderr = Buffer.concat(errChunks).toString('utf8');
        settle(() => reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-500)}`)));
      }
    });

    proc.stdin.write(buffer);
    proc.stdin.end();
  });
}
