// Characterization snapshot — ChatMessageTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Note: formatChatMessageView uses `new Date(msg.timestamp).toISOString()` — stabilize with a fixed
// timestamp (1000000000000 → "2001-09-09T01:46:40.000Z") so snapshots are deterministic.

import { describe, it, expect } from 'vitest';
import { ChatMessageTool } from '../../tools/chat-message.js';
import { makeToolDeps } from '../test-utils.js';

const FIXED_TIMESTAMP = 1000000000000; // 2001-09-09T01:46:40.000Z — deterministic

const MSG_VIEW = {
  id: 'msg001',
  author: 'userId001',
  style: 0,
  whisper: [],
  blind: false,
  speaker: { alias: 'Narrator', scene: null, actor: null, token: null },
  title: null,
  content: '<p>The bray-shaman raises its staff.</p>',
  timestamp: FIXED_TIMESTAMP,
  flags: {},
  rolls: [],
};

const tool = (mockReturn: any) => new ChatMessageTool(makeToolDeps(mockReturn));

describe('ChatMessageTool — characterization', () => {
  it('create — message created summary', async () => {
    const r = await tool({
      messageId: 'msg001',
      message: MSG_VIEW,
      requestedChanges: { content: '<p>The bray-shaman raises its staff.</p>', rollMode: 'publicroll' },
    }).execute({ action: 'create', content: '<p>The bray-shaman raises its staff.</p>', speaker: { alias: 'Narrator' }, rollMode: 'publicroll' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('create — whisper message', async () => {
    const r = await tool({
      messageId: 'msg002',
      message: { ...MSG_VIEW, id: 'msg002', whisper: ['gmUserId'], blind: false, content: '[SECRET] Hans is a Chaos cultist.' },
      requestedChanges: {},
    }).execute({ action: 'create', content: '[SECRET] Hans is a Chaos cultist.', whisper: ['Gamemaster'], rollMode: 'gmroll' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + full view', async () => {
    const r = await tool({
      messageId: 'msg001',
      message: { ...MSG_VIEW, content: '<p>Updated narration.</p>' },
      requestedChanges: { content: '<p>Updated narration.</p>' },
      changedFields: ['content'],
    }).execute({ action: 'update', messageId: 'msg001', changes: { content: '<p>Updated narration.</p>' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — message removed', async () => {
    const r = await tool({ deletedId: 'msg001', remainingCount: 42 }).execute({ action: 'delete', messageId: 'msg001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — full message view', async () => {
    const r = await tool({ message: MSG_VIEW }).execute({ action: 'get', messageId: 'msg001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated message list', async () => {
    const r = await tool({
      items: [
        { id: 'msg001', alias: 'Narrator', whisper: [], content: '<p>The bray-shaman raises its staff.</p>' },
        { id: 'msg002', alias: null, whisper: ['gmUserId'], content: '[SECRET] Hans is a Chaos cultist.' },
      ],
      total: 100,
      page: 1,
      pageSize: 2,
      pageCount: 50,
    }).execute({ action: 'list', pageSize: 2 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — no messages found', async () => {
    const r = await tool({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 0 }).execute({ action: 'list', filters: { author: 'nobody' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('export-chat-log — text format', async () => {
    const r = await tool({
      format: 'text',
      messageCount: 3,
      content: 'Narrator: The bray-shaman raises its staff.\nGM: Roll for initiative.\n',
    }).execute({ action: 'export-chat-log', format: 'text' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clear-chat-log — dryRun preview', async () => {
    const r = await tool({
      dryRun: true,
      totalCount: 150,
      byVisibility: { public: 100, gmOnly: 30, whispered: 20 },
      oldest: FIXED_TIMESTAMP - 3600000,
      newest: FIXED_TIMESTAMP,
      deletedCount: 0,
    }).execute({ action: 'clear-chat-log', dryRun: true, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clear-chat-log — confirmed delete', async () => {
    const r = await tool({
      dryRun: false,
      totalCount: 0,
      byVisibility: { public: 100, gmOnly: 30, whispered: 20 },
      deletedCount: 150,
      oldest: null,
      newest: null,
    }).execute({ action: 'clear-chat-log', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
