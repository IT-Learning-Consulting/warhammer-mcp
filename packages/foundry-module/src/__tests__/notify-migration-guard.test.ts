// Migration guard — ensures `ui.notifications` calls go through src/notify.ts.
// Any direct call to `ui.notifications.info/warn/error/success/notify` outside
// the helper is a regression: it bypasses the enableNotifications setting, the
// chat audit channel, the tooltip channel, and the Hooks.callAll event surface.
// See plan: .agents/plans/features/gm-feedback-channel-notify.md Phase 3.6.

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '..');

// Regex matches a method-call shape: ui.notifications.info(...) or
// ui.notifications?.info(...). Bare references in comments / strings are
// filtered out below by walking line content.
const FORBIDDEN_PATTERN = /\bui\.notifications\??\.\w+\s*\(/;

// Files that are allowed to reference ui.notifications:
// - notify.ts itself (it's THE wrapper)
// - test files (they mock the surface)
// - the JSDoc/comment lines in notify.ts header
const ALLOWLIST = new Set<string>([
  'notify.ts',
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules' || entry.name === 'dist') continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

// PRD: mcp_notify_coverage_v1 §5 Phase 3 R3.4 — ChatMessage allowlist.
// Direct `ChatMessage.create` calls bypass the notify dispatcher's chat-audit
// channel. The two legitimate sites are notify.ts (emitChat dispatch) and
// data-access.ts (requestPlayerRolls roll-button, paired with notify.created('mcp', ...)).
const CHAT_FORBIDDEN = /\bChatMessage\.create\s*\(/;
const CHAT_ALLOWLIST = new Set<string>([
  'notify.ts',        // emitChat() — legitimate dispatch
  'data-access.ts',   // requestPlayerRolls roll-button (paired with notify.created('mcp',...))
]);

describe('migration guard — ui.notifications', () => {
  it('no source file outside notify.ts calls ui.notifications directly', () => {
    const tsFiles = walk(SRC_DIR);
    const offenders: { file: string; line: number; content: string }[] = [];

    for (const file of tsFiles) {
      const relative = path.relative(SRC_DIR, file).replace(/\\/g, '/');
      const basename = path.basename(file);
      if (ALLOWLIST.has(basename)) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comment lines (// and /*) when looking for actual calls.
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
        if (FORBIDDEN_PATTERN.test(line)) {
          offenders.push({ file: relative, line: i + 1, content: line.trim() });
        }
      }
    }

    if (offenders.length > 0) {
      const detail = offenders
        .map((o) => `  ${o.file}:${o.line} — ${o.content}`)
        .join('\n');
      throw new Error(
        `Direct ui.notifications call(s) found outside notify.ts. ` +
          `Route through notify.* instead:\n${detail}`,
      );
    }
    expect(offenders).toHaveLength(0);
  });

  it('no source file outside the allowlist calls ChatMessage.create directly', () => {
    const tsFiles = walk(SRC_DIR);
    const offenders: { file: string; line: number; content: string }[] = [];

    for (const file of tsFiles) {
      const relative = path.relative(SRC_DIR, file).replace(/\\/g, '/');
      if (CHAT_ALLOWLIST.has(path.basename(file))) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
        if (CHAT_FORBIDDEN.test(lines[i])) {
          offenders.push({ file: relative, line: i + 1, content: trimmed });
        }
      }
    }

    if (offenders.length > 0) {
      throw new Error(
        `Direct ChatMessage.create call(s) found outside the notify allowlist:\n` +
          offenders.map((o) => `  ${o.file}:${o.line} — ${o.content}`).join('\n'),
      );
    }
    expect(offenders).toHaveLength(0);
  });
});
