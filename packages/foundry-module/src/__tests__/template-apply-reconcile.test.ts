// Bugfix sprint 444-459 — BUG-451: template-apply per-item reconciliation.
//
// WHY (Rule 9): wfrp4e MERGES same-name skills/talents into existing embedded items on
// createEmbeddedDocuments (re-apply onto a pre-templated actor: requested 15, created 13,
// 2 merged) — the old `created.length !== items.length` compare threw
// TEMPLATE_APPLY_WRITE_NOT_PERSISTED after the writes had fully persisted, surfacing
// ROLLBACK_UNAVAILABLE on a SUCCESSFUL apply. The fix reconciles per requested item:
// created OR same-name+type present on the actor post-write.
//
// Mock-shape citations (PF-003):
//   - created docs {id, name, type} — the exact fields executeTemplatePlan itself reads
//     (itemsByType/itemIds), matching live wfrp4e createEmbeddedDocuments returns.
//   - requested items {name, type} — plan writes carry Item.toObject() shapes
//     (template-apply.ts planTemplateApply).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateApplyService } from '../services/template-apply.js';

function makePlan(actor: any, requested: any[]): any {
  return {
    actor,
    templateId: 'tmpl1',
    templateName: 'Shaman',
    newName: 'Test Shaman',
    characteristicDeltas: {},
    writes: [
      // updateData intentionally empty: verifyDocWrite iterates leaf paths (zero here) —
      // this spec isolates the createEmbeddedDocuments reconcile.
      { op: 'actor.update', updateData: {}, options: {} },
      { op: 'createEmbeddedDocuments', documentType: 'Item', items: requested, options: {} },
    ],
  };
}

describe('BUG-451: executeTemplatePlan per-item reconciliation', () => {
  beforeEach(() => {
    (globalThis as any).fromUuid = vi.fn().mockResolvedValue({});
  });

  it('PASSES when a requested item was merged into an existing embedded item (not created)', async () => {
    const requested = [
      { name: 'Melee (Basic)', type: 'skill' },
      { name: 'Dodge', type: 'skill' },
    ];
    const actor: any = {
      id: 'a1',
      name: 'Test Shaman',
      uuid: 'Actor.a1',
      update: vi.fn().mockResolvedValue(undefined),
      // wfrp4e merged "Dodge" into the pre-existing embedded skill — only Melee comes back.
      createEmbeddedDocuments: vi.fn().mockResolvedValue([{ id: 'i1', name: 'Melee (Basic)', type: 'skill' }]),
      // post-write collection: both names present (Dodge pre-existing, advances merged)
      items: [
        { id: 'i1', name: 'Melee (Basic)', type: 'skill' },
        { id: 'i0', name: 'Dodge', type: 'skill' },
      ],
    };
    const svc = new TemplateApplyService(() => {});

    const result = await svc.executeTemplatePlan(makePlan(actor, requested));

    expect(result.success).toBe(true);
    expect(result.applied.itemIds).toEqual(['i1']);
  });

  it('THROWS naming the item when a requested item is neither created nor present post-write', async () => {
    const requested = [{ name: 'Ghost Strike', type: 'talent' }];
    const actor: any = {
      id: 'a1',
      name: 'Test',
      uuid: 'Actor.a1',
      update: vi.fn().mockResolvedValue(undefined),
      createEmbeddedDocuments: vi.fn().mockResolvedValue([]),
      items: [{ id: 'i0', name: 'Dodge', type: 'skill' }],
    };
    const svc = new TemplateApplyService(() => {});

    await expect(svc.executeTemplatePlan(makePlan(actor, requested))).rejects.toThrow(
      /TEMPLATE_APPLY_WRITE_NOT_PERSISTED.*Ghost Strike/,
    );
  });

  it('clean-base regression: all requested items created → PASS (15/15 class)', async () => {
    const requested = [
      { name: 'Melee (Basic)', type: 'skill' },
      { name: 'Dodge', type: 'skill' },
    ];
    const created = [
      { id: 'i1', name: 'Melee (Basic)', type: 'skill' },
      { id: 'i2', name: 'Dodge', type: 'skill' },
    ];
    const actor: any = {
      id: 'a1',
      name: 'Test',
      uuid: 'Actor.a1',
      update: vi.fn().mockResolvedValue(undefined),
      createEmbeddedDocuments: vi.fn().mockResolvedValue(created),
      items: created,
    };
    const svc = new TemplateApplyService(() => {});

    const result = await svc.executeTemplatePlan(makePlan(actor, requested));

    expect(result.success).toBe(true);
    expect(result.applied.itemsByType.skill).toBe(2);
  });
});
