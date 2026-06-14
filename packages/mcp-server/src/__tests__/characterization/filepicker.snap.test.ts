// Characterization snapshot — FilePickerTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: list, create-directory
//
// SKIPPED actions (require real filesystem/conversion pipeline, no source change allowed):
//   upload  — calls resolveInput() which fetches a real URL/file; cannot mock without source change.
//   convert — same: calls resolveInput() and routeConverter() which spawn real ffmpeg/sharp.

import { describe, it, expect } from 'vitest';
import { FilePickerTool } from '../../tools/filepicker.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new FilePickerTool(makeToolDeps(mockReturn));

describe('FilePickerTool — characterization', () => {
  it('list — dirs and files', async () => {
    const r = await tool({
      target: 'worlds/aitww/assets',
      dirs: ['worlds/aitww/assets/maps', 'worlds/aitww/assets/tokens'],
      files: ['worlds/aitww/assets/bg.webp', 'worlds/aitww/assets/icon.webp'],
      private: false,
      gridSize: null,
      privateDirs: [],
      extensions: ['.webp', '.png'],
    }).execute({ action: 'list', source: 'data', target: 'worlds/aitww/assets' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — empty directory', async () => {
    const r = await tool({
      target: 'worlds/aitww/empty',
      dirs: [],
      files: [],
      private: false,
      gridSize: null,
      privateDirs: [],
      extensions: [],
    }).execute({ action: 'list', source: 'data', target: 'worlds/aitww/empty' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('create-directory — success', async () => {
    const r = await tool({
      source: 'data',
      path: 'worlds/aitww/assets/new-folder',
      created: true,
    }).execute({ action: 'create-directory', source: 'data', path: 'worlds/aitww/assets/new-folder' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
