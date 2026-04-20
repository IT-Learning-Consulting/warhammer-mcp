// world-delete.test.ts — exercises deleteActor + deleteJournalEntry primitives.
//
// Phase 4e.1 adds two thin pass-through MCP tools mirroring delete-item. These
// tests assert the query keys are called with the expected { id } payload and
// that the envelope shapes (happy, nonexistent, permission-denied) round-trip
// unchanged through the tool layer.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  callMcp,
  clearMcpMocks,
  getCallLog,
  mockMcpCall,
} from './_harness.js';

describe('world-delete primitives', () => {
  beforeEach(() => {
    clearMcpMocks();
  });

  it('1. happy — deleteActor returns { success: true }', async () => {
    mockMcpCall('warhammer-mcp.deleteActor', {
      success: true,
      data: { success: true },
    });
    const env = (await callMcp('warhammer-mcp.deleteActor', {
      id: 'actor-1',
    })) as { success: boolean; data: { success: boolean } };
    expect(env.success).toBe(true);
    expect(env.data.success).toBe(true);
    const call = getCallLog().find(c => c.queryKey === 'warhammer-mcp.deleteActor');
    expect((call!.input as any).id).toBe('actor-1');
  });

  it('2. happy — deleteJournalEntry returns { success: true }', async () => {
    mockMcpCall('warhammer-mcp.deleteJournalEntry', {
      success: true,
      data: { success: true },
    });
    const env = (await callMcp('warhammer-mcp.deleteJournalEntry', {
      id: 'journal-1',
    })) as { success: boolean; data: { success: boolean } };
    expect(env.success).toBe(true);
    expect(env.data.success).toBe(true);
    const call = getCallLog().find(c => c.queryKey === 'warhammer-mcp.deleteJournalEntry');
    expect((call!.input as any).id).toBe('journal-1');
  });

  it('3. nonexistent id — envelope success but data.success false; no throw', async () => {
    mockMcpCall('warhammer-mcp.deleteActor', {
      success: true,
      data: { success: false },
    });
    const env = (await callMcp('warhammer-mcp.deleteActor', {
      id: 'doesNotExist',
    })) as { success: boolean; data: { success: boolean } };
    expect(env.success).toBe(true);
    expect(env.data.success).toBe(false);
  });

  it('4. permission gate — server-side GM denial surfaces unchanged', async () => {
    mockMcpCall('warhammer-mcp.deleteJournalEntry', {
      success: false,
      error: 'Access denied',
    });
    const env = (await callMcp('warhammer-mcp.deleteJournalEntry', {
      id: 'journal-1',
    })) as { success: boolean; error?: string };
    expect(env.success).toBe(false);
    expect(env.error).toBe('Access denied');
  });
});
