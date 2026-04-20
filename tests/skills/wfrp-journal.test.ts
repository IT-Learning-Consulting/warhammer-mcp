// wfrp-journal.test.ts — exercises /wfrp-journal list / create / complete
// + BUG-006 dead-key regression.
//
// SKILL.md sub-command primitive sequences:
//   list   → listJournals { filterQuests: true } + post-filter by body marker
//   create → createJournalEntry { name: "Quest: <title>", content: "…<!-- quest-active -->…" }
//   complete → getJournalContent + updateJournalContent (flip marker)
//
// BUG-006 regression: skill must NEVER call createQuestJournal, updateQuestJournal,
// linkQuestToNPC, or searchJournals — all dead keys from manage-journal.ts.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

interface ListResult {
  items: Array<{ id: string; name: string; state: 'active' | 'completed' | 'legacy' }>;
}

async function runListQuests(mode: 'active' | 'completed' | 'all'): Promise<ListResult> {
  const listEnv = (await callMcp('warhammer-mcp.listJournals', {
    filterQuests: true,
  })) as { success: boolean; data: Array<{ id: string; name: string }> };

  const items: ListResult['items'] = [];
  for (const j of listEnv.data ?? []) {
    const bodyEnv = (await callMcp('warhammer-mcp.getJournalContent', {
      journalId: j.id,
    })) as { success: boolean; data: { content: string } | null };
    const content = bodyEnv.data?.content ?? '';
    let state: 'active' | 'completed' | 'legacy' = 'legacy';
    if (content.includes('<!-- quest-active -->')) state = 'active';
    else if (content.includes('<!-- quest-completed -->')) state = 'completed';
    if (mode === 'all' || mode === state || (mode === 'active' && state === 'legacy')) {
      items.push({ id: j.id, name: j.name, state });
    }
  }
  return { items };
}

async function runCreateQuest(title: string, body = ''): Promise<string> {
  const name = `Quest: ${title}`;
  const content = `<p><em>Active</em></p><!-- quest-active -->${body}`;
  const env = (await callMcp('warhammer-mcp.createJournalEntry', {
    name,
    content,
  })) as { success: boolean; data: { id: string } };
  return env.data.id;
}

async function runCompleteQuest(journalId: string, resolution?: string): Promise<boolean> {
  const bodyEnv = (await callMcp('warhammer-mcp.getJournalContent', {
    journalId,
  })) as { success: boolean; data: { content: string } | null };
  if (!bodyEnv.data) return false;
  let newContent = bodyEnv.data.content
    .replace('<!-- quest-active -->', '<!-- quest-completed -->')
    .replace('<em>Active</em>', '<em>Completed</em>');
  if (!newContent.includes('<!-- quest-completed -->')) {
    // legacy: no marker existed — add one
    newContent += '<!-- quest-completed -->';
  }
  if (resolution) newContent += `<h3>Resolution</h3><p>${resolution}</p>`;
  const updEnv = (await callMcp('warhammer-mcp.updateJournalContent', {
    journalId,
    content: newContent,
  })) as { success: boolean };
  return updEnv.success;
}

describe('/wfrp-journal', () => {
  beforeEach(() => {
    clearMcpMocks();
  });

  it('1. create — writes Quest: prefix + quest-active marker', async () => {
    mockMcpCall('warhammer-mcp.createJournalEntry', {
      success: true,
      data: { id: 'journal-1' },
    });
    const id = await runCreateQuest('Find the Witch Hunter');
    expect(id).toBe('journal-1');
    const createCall = getCallLog().find(c => c.queryKey === 'warhammer-mcp.createJournalEntry');
    const payload = createCall!.input as { name: string; content: string };
    expect(payload.name).toBe('Quest: Find the Witch Hunter');
    expect(payload.content).toContain('<!-- quest-active -->');
  });

  it('2. list active — filters via listJournals filterQuests + body marker', async () => {
    mockMcpCall('warhammer-mcp.listJournals', {
      success: true,
      data: [
        { id: 'q1', name: 'Quest: Find the Witch Hunter' },
        { id: 'q2', name: 'Quest: Return the Relic' },
      ],
    });
    mockMcpCall('warhammer-mcp.getJournalContent', (input: any) => {
      const content = input.journalId === 'q1'
        ? '<p>…<!-- quest-active --></p>'
        : '<p>…<!-- quest-completed --></p>';
      return { success: true, data: { content } };
    });

    const result = await runListQuests('active');
    expect(result.items.map(i => i.id)).toEqual(['q1']);

    // Assert filterQuests: true was set on the list call
    const listCall = getCallLog().find(c => c.queryKey === 'warhammer-mcp.listJournals');
    const payload = listCall!.input as { filterQuests?: boolean };
    expect(payload.filterQuests).toBe(true);
  });

  it('3. complete — flips marker from active to completed', async () => {
    mockMcpCall('warhammer-mcp.getJournalContent', {
      success: true,
      data: { content: '<p><em>Active</em></p><!-- quest-active -->body' },
    });
    mockMcpCall('warhammer-mcp.updateJournalContent', { success: true });

    const ok = await runCompleteQuest('q1', 'They found him.');
    expect(ok).toBe(true);

    const updCall = getCallLog().find(c => c.queryKey === 'warhammer-mcp.updateJournalContent');
    const payload = updCall!.input as { journalId: string; content: string };
    expect(payload.journalId).toBe('q1');
    expect(payload.content).toContain('<!-- quest-completed -->');
    expect(payload.content).not.toContain('<!-- quest-active -->');
    expect(payload.content).toContain('Resolution');
  });

  it('4. BUG-006 regression — never calls the 4 dead manage-journal keys', async () => {
    mockMcpCall('warhammer-mcp.listJournals', { success: true, data: [] });
    mockMcpCall('warhammer-mcp.createJournalEntry', {
      success: true,
      data: { id: 'journal-1' },
    });
    mockMcpCall('warhammer-mcp.getJournalContent', {
      success: true,
      data: { content: '<!-- quest-active -->' },
    });
    mockMcpCall('warhammer-mcp.updateJournalContent', { success: true });

    await runListQuests('active');
    await runCreateQuest('Test');
    await runCompleteQuest('test-id');

    const deadKeys = getCallLog()
      .map(c => c.queryKey)
      .filter(k =>
        k === 'warhammer-mcp.createQuestJournal' ||
        k === 'warhammer-mcp.updateQuestJournal' ||
        k === 'warhammer-mcp.linkQuestToNPC' ||
        k === 'warhammer-mcp.searchJournals'
      );
    expect(deadKeys).toHaveLength(0);
  });

  it('5. legacy journal (no marker) — complete still adds the completed marker', async () => {
    mockMcpCall('warhammer-mcp.getJournalContent', {
      success: true,
      data: { content: '<p>Old quest body without marker</p>' },
    });
    mockMcpCall('warhammer-mcp.updateJournalContent', { success: true });

    await runCompleteQuest('legacy-1');
    const updCall = getCallLog().find(c => c.queryKey === 'warhammer-mcp.updateJournalContent');
    const payload = updCall!.input as { content: string };
    expect(payload.content).toContain('<!-- quest-completed -->');
  });

  it('6. empty quest pool — list returns empty cleanly', async () => {
    mockMcpCall('warhammer-mcp.listJournals', { success: true, data: [] });
    const result = await runListQuests('active');
    expect(result.items).toEqual([]);
  });
});
