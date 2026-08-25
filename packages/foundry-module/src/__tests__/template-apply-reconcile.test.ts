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

// BUG-677 (systemic_bug_class_prevention v2 Phase 2, task 2.1): executeTemplatePlan's WRITE#1 now
// additionally stamps `flags.warhammer-mcp.appliedTemplates` and verifies it via verifyDocWrite
// against the re-fetched (`fromUuid`) doc's `_source` — these fixtures' actor mocks must round-trip
// that flag write like the other template-apply test files (apply-template.test.ts,
// characterization/da-template.snap.test.ts) already do, or the verify spuriously drifts. Mechanical
// fixture fidelity fix only — no assertion/intent changes.
function applyDotPath(target: Record<string, any>, updateData: Record<string, any>): void {
  for (const [path, value] of Object.entries(updateData)) {
    const parts = path.split('.');
    let cur = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i]!;
      if (cur[key] == null) cur[key] = {};
      cur = cur[key];
    }
    cur[parts[parts.length - 1]!] = value;
  }
}

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
  // BUG-677 fixture fidelity (see applyDotPath doc-comment above): freshDocShadow is the object
  // `fromUuid` returns post-update; each test's `actor.update` mock writes onto its `_source`.
  let freshDocShadow: any;
  beforeEach(() => {
    freshDocShadow = { _source: {} };
    (globalThis as any).fromUuid = vi.fn().mockImplementation(async () => freshDocShadow);
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
      update: vi.fn(async (updateData: Record<string, any>) => {
        applyDotPath(freshDocShadow._source, updateData);
      }),
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
      update: vi.fn(async (updateData: Record<string, any>) => {
        applyDotPath(freshDocShadow._source, updateData);
      }),
      createEmbeddedDocuments: vi.fn().mockResolvedValue([]),
      items: [{ id: 'i0', name: 'Dodge', type: 'skill' }],
    };
    const svc = new TemplateApplyService(() => {});

    await expect(svc.executeTemplatePlan(makePlan(actor, requested))).rejects.toThrow(
      /TEMPLATE_APPLY_WRITE_NOT_PERSISTED.*Ghost Strike/,
    );
  });

  // BUG-460 (sprint 460-525): the pre-merge converts a same-name skill/talent re-apply into an explicit
  // actor.updateEmbeddedDocuments advance-bump (existing + incoming), drops it from the create batch, and
  // DP-16-verifies the bump landed on the embedded item — so wfrp4e's broken world-scope merge never fires.
  // Mock citations (PF-003): items {id,name,type,system.advances.value} match live wfrp4e embedded skill
  // shapes; updateEmbeddedDocuments mutates the referenced item, mirroring Foundry's in-place embedded update.
  it('BUG-460: re-apply of a same-name skill advance-bumps in place instead of duplicating', async () => {
    const chan = { id: 'i0', name: 'Channelling', type: 'skill', system: { advances: { value: 10 } } };
    const requested = [{ name: 'Channelling', type: 'skill', system: { advances: { value: 10 } } }];
    const actor: any = {
      id: 'a1',
      name: 'Test Shaman',
      uuid: 'Actor.a1',
      update: vi.fn(async (updateData: Record<string, any>) => {
        applyDotPath(freshDocShadow._source, updateData);
      }),
      createEmbeddedDocuments: vi.fn().mockResolvedValue([]),
      updateEmbeddedDocuments: vi.fn().mockImplementation(async (_type: string, updates: any[]) => {
        for (const u of updates) if (u._id === chan.id) chan.system.advances.value = u['system.advances.value'];
        return updates;
      }),
      items: [chan],
    };
    const svc = new TemplateApplyService(() => {});

    const result = await svc.executeTemplatePlan(makePlan(actor, requested));

    // Advance-bump routed to the EMBEDDED collection (existing 10 + incoming 10 = 20), not a create.
    expect(actor.updateEmbeddedDocuments).toHaveBeenCalledWith('Item', [{ _id: 'i0', 'system.advances.value': 20 }]);
    // The dup was dropped from the create batch → the create fires with an EMPTY array (no new docs).
    expect(actor.createEmbeddedDocuments).toHaveBeenCalledWith('Item', [], expect.anything());
    expect(chan.system.advances.value).toBe(20);
    expect(result.applied.merged).toEqual([{ name: 'Channelling', type: 'skill', from: 10, to: 20 }]);
    expect(result.applied.itemIds).toEqual([]); // nothing newly created
    expect(result.success).toBe(true);
  });

  it('BUG-460 verify snapshot: Foundry mutating the update objects in place does NOT false-fail the DP-16 verify', async () => {
    // Live-caught 2026-07-07 (validate smoke): Foundry's updateEmbeddedDocuments EXPANDS the
    // dotted-key update objects in place ({'system.advances.value': N} → {system:{advances:{value:N}}}),
    // so a verify reading bump['system.advances.value'] post-await saw undefined and threw
    // TEMPLATE_APPLY_WRITE_NOT_PERSISTED on a fully-persisted merge. The verify must compare
    // against a pre-write snapshot. This mock mutates its inputs exactly like Foundry.
    const chan = { id: 'i0', name: 'Channelling', type: 'skill', system: { advances: { value: 10 } } };
    const requested = [{ name: 'Channelling', type: 'skill', system: { advances: { value: 10 } } }];
    const actor: any = {
      id: 'a1',
      name: 'Test Shaman',
      uuid: 'Actor.a1',
      update: vi.fn(async (updateData: Record<string, any>) => {
        applyDotPath(freshDocShadow._source, updateData);
      }),
      createEmbeddedDocuments: vi.fn().mockResolvedValue([]),
      updateEmbeddedDocuments: vi.fn().mockImplementation(async (_type: string, updates: any[]) => {
        for (const u of updates) {
          if (u._id === chan.id) chan.system.advances.value = u['system.advances.value'];
          // Foundry-faithful in-place expansion of the dotted key on the CALLER'S object.
          u.system = { advances: { value: u['system.advances.value'] } };
          delete u['system.advances.value'];
        }
        return updates;
      }),
      items: [chan],
    };
    const svc = new TemplateApplyService(() => {});

    const result = await svc.executeTemplatePlan(makePlan(actor, requested));

    expect(chan.system.advances.value).toBe(20);
    expect(result.applied.merged).toEqual([{ name: 'Channelling', type: 'skill', from: 10, to: 20 }]);
    expect(result.success).toBe(true);
  });

  it('BUG-460: DP-16 throws when the advance-bump does not persist (world-scope merge simulation)', async () => {
    const chan = { id: 'i0', name: 'Channelling', type: 'skill', system: { advances: { value: 10 } } };
    const requested = [{ name: 'Channelling', type: 'skill', system: { advances: { value: 10 } } }];
    const actor: any = {
      id: 'a1',
      name: 'Test',
      uuid: 'Actor.a1',
      update: vi.fn(async (updateData: Record<string, any>) => {
        applyDotPath(freshDocShadow._source, updateData);
      }),
      createEmbeddedDocuments: vi.fn().mockResolvedValue([]),
      // Simulate the BUG-460 failure: the update is accepted but the embedded value never changes
      // (routed to the world Items collection where the id doesn't resolve).
      updateEmbeddedDocuments: vi.fn().mockResolvedValue([]),
      items: [chan],
    };
    const svc = new TemplateApplyService(() => {});

    await expect(svc.executeTemplatePlan(makePlan(actor, requested))).rejects.toThrow(
      /TEMPLATE_APPLY_WRITE_NOT_PERSISTED.*advance-bump/,
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
      update: vi.fn(async (updateData: Record<string, any>) => {
        applyDotPath(freshDocShadow._source, updateData);
      }),
      createEmbeddedDocuments: vi.fn().mockResolvedValue(created),
      items: created,
    };
    const svc = new TemplateApplyService(() => {});

    const result = await svc.executeTemplatePlan(makePlan(actor, requested));

    expect(result.success).toBe(true);
    expect(result.applied.itemsByType.skill).toBe(2);
  });
});
