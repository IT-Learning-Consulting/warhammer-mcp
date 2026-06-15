// Template schema color-constraint contract (BUG-384 / BUG-363 sub-issue a).
//
// Foundry v13's MeasuredTemplate ColorField stores 6-char hex only. Passing an
// 8-char alpha-hex (#RRGGBBAA) lets Foundry silently corrupt/replace the value, so
// the F09 Zod constraint rejects it up front with a clear typed error. These tests
// pin that deliberate reject-clean decision so a future "be lenient" change cannot
// silently regress it (which is exactly how BUG-384's stale eval answer-key drifted).

import { describe, it, expect } from 'vitest';
import { TemplateCreateInput } from '@foundry-mcp/shared';

const base = { action: 'create' as const, sceneId: 'scene-id-0000001', x: 800, y: 600 };

describe('TemplateCreateInput — color constraints (BUG-384/BUG-363)', () => {
  it('rejects 8-char alpha-hex fillColor with the typed error', () => {
    const r = TemplateCreateInput.safeParse({ ...base, fillColor: '#0000ff80' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toContain('6-char hex');
    }
  });

  it('rejects 8-char alpha-hex borderColor with the typed error', () => {
    const r = TemplateCreateInput.safeParse({ ...base, borderColor: '#ff000080' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toContain('Alpha-hex not supported');
    }
  });

  it('accepts a valid 6-char fillColor', () => {
    const r = TemplateCreateInput.safeParse({ ...base, t: 'circle', distance: 15, fillColor: '#0000ff' });
    expect(r.success).toBe(true);
  });
});
