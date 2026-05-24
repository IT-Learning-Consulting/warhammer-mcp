// Phase 5 mcp_completion_v1 — ChatMessage tool schema + dispatch tests.
//
// Tests: action enum (5 values), confirm gate, rolls-immutability guard,
// rollMode pass-through, whisper resolution surfacing, author-not-user trap,
// pagination, and happy-path per action.
// Business logic (CHATMESSAGE_DELETE_NOT_CONFIRMED, CHATMESSAGE_ROLLS_IMMUTABLE,
// rollMode resolution, whisper name→ID) lives in the Foundry-side handler.
// These tests assert: schema parse, action dispatch, and error formatting when
// foundryClient returns/throws failure.

import { describe, it, expect, vi } from 'vitest';
import { ChatMessageToolInput } from '@foundry-mcp/shared';
import { ChatMessageTool } from '../tools/chat-message.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

const MOCK_MESSAGE = {
  id: 'msg-123',
  author: 'user-abc123456789',
  content: 'The bray-shaman raises its staff.',
  type: 'base',
  style: 0,
  speaker: { scene: null, actor: null, token: null, alias: 'Narrator' },
  whisper: [],
  blind: false,
  rolls: [],
  flags: {},
  flavor: '',
  sound: '',
  timestamp: 1716220800000,
  title: '',
  system: {},
};

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn ?? { messageId: 'msg-123', message: MOCK_MESSAGE, requestedChanges: {} };
    }),
  };
  return new ChatMessageTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('ChatMessageToolInput schema', () => {
  it('action enum contains exactly 5 values', () => {
    const actions = ChatMessageToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(['create', 'delete', 'get', 'list', 'update']);
  });

  it('create has no required fields beyond action', () => {
    expect(() => ChatMessageToolInput.parse({ action: 'create' })).not.toThrow();
  });

  it('create accepts author field (R5.2)', () => {
    expect(() =>
      ChatMessageToolInput.parse({ action: 'create', author: 'user-abc123456789', content: 'Hello' }),
    ).not.toThrow();
  });

  it('create rejects unknown "user" legacy field (R5.2 strict-mode)', () => {
    // .strict() on the schema rejects unknown keys
    expect(() =>
      ChatMessageToolInput.parse({ action: 'create', user: 'some-user-id', content: 'Hello' }),
    ).toThrow();
  });

  it('create accepts rollMode enum values (R5.3)', () => {
    for (const mode of ['publicroll', 'gmroll', 'blindroll', 'selfroll', 'roll']) {
      expect(() =>
        ChatMessageToolInput.parse({ action: 'create', content: 'Test', rollMode: mode }),
      ).not.toThrow();
    }
  });

  it('delete requires confirm field', () => {
    expect(() =>
      ChatMessageToolInput.parse({ action: 'delete', messageId: 'msg-123' }),
    ).toThrow(); // confirm is required
    expect(() =>
      ChatMessageToolInput.parse({ action: 'delete', messageId: 'msg-123', confirm: true }),
    ).not.toThrow();
    expect(() =>
      ChatMessageToolInput.parse({ action: 'delete', messageId: 'msg-123', confirm: false }),
    ).not.toThrow(); // confirm:false valid — returns CHATMESSAGE_DELETE_NOT_CONFIRMED
  });

  it('delete confirm has no default — must be explicitly provided', () => {
    // z.boolean() without .default() — undefined should fail
    const result = ChatMessageToolInput.safeParse({ action: 'delete', messageId: 'msg-123' });
    expect(result.success).toBe(false);
  });

  it('update requires messageId and changes', () => {
    expect(() =>
      ChatMessageToolInput.parse({ action: 'update', messageId: 'msg-123', changes: { content: 'New' } }),
    ).not.toThrow();
  });

  it('update changes schema accepts rolls so the handler CHATMESSAGE_ROLLS_IMMUTABLE guard stays reachable', () => {
    // Rolls is intentionally accepted at the schema layer: .strict() would otherwise
    // reject it at parse time, making the handler's CHATMESSAGE_ROLLS_IMMUTABLE token
    // unreachable. Immutability is enforced in the Foundry-side preUpdateTransform, not here.
    expect(() =>
      ChatMessageToolInput.parse({ action: 'update', messageId: 'msg-123', changes: { rolls: [] as any } }),
    ).not.toThrow();
  });

  it('list defaults page=1, pageSize=20, sortOrder=desc', () => {
    const parsed = ChatMessageToolInput.parse({ action: 'list' });
    if (parsed.action === 'list') {
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(20);
      expect(parsed.sortOrder).toBe('desc');
    }
  });
});

// ── ChatMessageTool dispatch — happy paths ────────────────────────────────────

describe('ChatMessageTool create — publicroll (whisper=[], blind=false)', () => {
  it('returns created message ID and public visibility', async () => {
    const tool = makeTool({
      messageId: 'msg-pub',
      message: { ...MOCK_MESSAGE, id: 'msg-pub', whisper: [], blind: false },
      requestedChanges: {},
    });
    const result = await tool.execute({ action: 'create', content: 'Public announcement', rollMode: 'publicroll' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Chat Message Created');
    expect(text).toContain('msg-pub');
    expect(text).toContain('public');
  });
});

describe('ChatMessageTool create — gmroll (whisper=[GM ID], blind=false)', () => {
  it('passes rollMode to handler and surfaces whisper note', async () => {
    const queries: any[] = [];
    const foundryClient: any = {
      query: vi.fn(async (_key: string, args: any) => {
        queries.push(args);
        return {
          messageId: 'msg-gm',
          message: { ...MOCK_MESSAGE, id: 'msg-gm', whisper: ['gm-user-id12345'], blind: false },
          requestedChanges: {},
        };
      }),
    };
    const tool = new ChatMessageTool({ foundryClient, logger: makeLogger() });
    const result = await tool.execute({ action: 'create', content: 'GM roll', rollMode: 'gmroll' });
    // Verify rollMode was passed to handler
    expect(queries[0]).toMatchObject({ action: 'create', rollMode: 'gmroll' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('whisper to 1 user(s)');
  });
});

describe('ChatMessageTool create — blindroll (whisper=[GM ID], blind=true)', () => {
  it('surfaces blind flag in output', async () => {
    const tool = makeTool({
      messageId: 'msg-blind',
      message: { ...MOCK_MESSAGE, id: 'msg-blind', whisper: ['gm-user-id12345'], blind: true },
      requestedChanges: {},
    });
    const result = await tool.execute({ action: 'create', content: 'Blind roll', rollMode: 'blindroll' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('[BLIND]');
    expect(text).toContain('whisper to 1 user(s)');
  });
});

describe('ChatMessageTool create — selfroll (whisper=[author], blind=false)', () => {
  it('surfaces self-whisper note', async () => {
    const tool = makeTool({
      messageId: 'msg-self',
      message: { ...MOCK_MESSAGE, id: 'msg-self', whisper: ['user-abc123456789'], blind: false },
      requestedChanges: {},
    });
    const result = await tool.execute({ action: 'create', content: 'Self roll', rollMode: 'selfroll' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('whisper to 1 user(s)');
    // blind=false so no [BLIND] tag
    expect(text).not.toContain('[BLIND]');
  });
});

describe('ChatMessageTool delete — confirm gate', () => {
  it('surfaces CHATMESSAGE_DELETE_NOT_CONFIRMED when handler rejects', async () => {
    const tool = makeTool(null, 'CHATMESSAGE_DELETE_NOT_CONFIRMED: pass confirm:true to proceed');
    const result = await tool.execute({ action: 'delete', messageId: 'msg-123', confirm: false });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('CHATMESSAGE_DELETE_NOT_CONFIRMED');
    expect((result as any).isError).toBe(true);
  });

  it('delete with confirm:true returns success', async () => {
    const tool = makeTool({ deletedId: 'msg-123', remainingCount: 42 });
    const result = await tool.execute({ action: 'delete', messageId: 'msg-123', confirm: true });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Chat Message Deleted');
    expect(text).toContain('msg-123');
    expect(text).toContain('42');
  });
});

describe('ChatMessageTool update — rolls-immutability', () => {
  it('rolls in changes passes schema parse and reaches the handler guard (not rejected at parse)', async () => {
    // The schema deliberately accepts rolls so the request reaches the Foundry-side
    // preUpdateTransform guard. If rolls were rejected at parse, execute() would surface
    // a validation error instead of the handler's CHATMESSAGE_ROLLS_IMMUTABLE token.
    const tool = makeTool(null, 'CHATMESSAGE_ROLLS_IMMUTABLE: rolls cannot be modified after creation');
    const result = await tool.execute({ action: 'update', messageId: 'abc', changes: { rolls: [] as any } });
    expect((result as any).isError).toBe(true);
    expect((result as any).content[0].text).toContain('CHATMESSAGE_ROLLS_IMMUTABLE');
  });

  it('surfaces CHATMESSAGE_ROLLS_IMMUTABLE when handler rejects', async () => {
    const tool = makeTool(null, 'CHATMESSAGE_ROLLS_IMMUTABLE: rolls cannot be modified after creation');
    const result = await tool.execute({ action: 'update', messageId: 'msg-123', changes: { content: 'Updated' } });
    expect((result as any).isError).toBe(true);
    expect((result as any).content[0].text).toContain('CHATMESSAGE_ROLLS_IMMUTABLE');
  });
});

describe('ChatMessageTool create — whisper name resolution', () => {
  it('passes whisper names to handler (resolution happens Foundry-side)', async () => {
    const queries: any[] = [];
    const foundryClient: any = {
      query: vi.fn(async (_key: string, args: any) => {
        queries.push(args);
        return {
          messageId: 'msg-whisper',
          message: { ...MOCK_MESSAGE, id: 'msg-whisper', whisper: ['gm-resolved-id1234'], blind: false },
          requestedChanges: {},
        };
      }),
    };
    const tool = new ChatMessageTool({ foundryClient, logger: makeLogger() });
    await tool.execute({ action: 'create', content: 'Secret', whisper: ['Gamemaster'] });
    // Whisper name is passed as-is; Foundry-side handler resolves via getWhisperRecipients
    expect(queries[0]).toMatchObject({ action: 'create', whisper: ['Gamemaster'] });
  });

  it('surfaces CHATMESSAGE_WHISPER_RECIPIENT_NOT_FOUND when handler rejects', async () => {
    const tool = makeTool(null, 'CHATMESSAGE_WHISPER_RECIPIENT_NOT_FOUND: no user found with name "NonexistentUser"');
    const result = await tool.execute({ action: 'create', content: 'Secret', whisper: ['NonexistentUser'] });
    expect((result as any).isError).toBe(true);
    expect((result as any).content[0].text).toContain('CHATMESSAGE_WHISPER_RECIPIENT_NOT_FOUND');
  });
});

describe('ChatMessageTool get — happy path', () => {
  it('formats message view with speaker alias', async () => {
    const tool = makeTool({ message: { ...MOCK_MESSAGE, speaker: { ...MOCK_MESSAGE.speaker, alias: 'Hans Gruber' } } });
    const result = await tool.execute({ action: 'get', messageId: 'msg-123' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('msg-123');
    expect(text).toContain('Hans Gruber');
  });
});

describe('ChatMessageTool list — pagination', () => {
  it('formats paginated response', async () => {
    const tool = makeTool({
      items: [
        { id: 'msg-1', author: 'user-abc', alias: 'Narrator', content: 'First message', style: 0, timestamp: 1000, whisper: [] },
        { id: 'msg-2', author: 'user-abc', alias: '', content: 'Second message', style: 0, timestamp: 2000, whisper: [] },
      ],
      total: 10,
      page: 1,
      pageSize: 2,
      pageCount: 5,
    });
    const result = await tool.execute({ action: 'list', pageSize: 2, sortOrder: 'desc' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Page 1 of 5');
    expect(text).toContain('10 total');
    expect(text).toContain('msg-1');
  });

  it('passes sortOrder to handler', async () => {
    const queries: any[] = [];
    const foundryClient: any = {
      query: vi.fn(async (_key: string, args: any) => {
        queries.push(args);
        return { items: [], total: 0, page: 1, pageSize: 5, pageCount: 0 };
      }),
    };
    const tool = new ChatMessageTool({ foundryClient, logger: makeLogger() });
    await tool.execute({ action: 'list', pageSize: 5, sortOrder: 'asc' });
    expect(queries[0]).toMatchObject({ action: 'list', sortOrder: 'asc', pageSize: 5 });
  });
});

describe('ChatMessageTool create — author round-trip (R5.2)', () => {
  it('author field passes through in response', async () => {
    const tool = makeTool({
      messageId: 'msg-author',
      message: { ...MOCK_MESSAGE, id: 'msg-author', author: 'specificuser12345' },
      requestedChanges: { author: 'specificuser12345' },
    });
    const result = await tool.execute({ action: 'create', author: 'specificuser12345', content: 'Test' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Chat Message Created');
    expect(text).toContain('specificuser12345');
  });
});
