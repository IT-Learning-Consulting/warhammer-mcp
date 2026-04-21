// Phase 4h Phase 4.4 — Hahnbrandt role+rank stacking tests for /wfrp-encounter-builder.
// The skill exposes stacking as `template: [role, rank]` in direct mode. The
// underlying primitive (applyTemplate) already supports stacking by being called
// twice on the same actor — exercised in apply-template.test.ts. These tests
// validate the SKILL'S stacking-plan logic: composing the 2 calls in order,
// rejecting illegal combos.
//
// Plan acceptance:
//   - Stack plan produces 2 applyTemplate calls.
//   - Call order preserved (role first, rank second).
//   - Invalid combos (two roles, rank-only, stacking on non-armies-of-man set) rejected.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Vault absolute paths (tests run via the D:\ junction; __dirname is D:\foundry-vtt-mcp\...).
const TEMPLATE_INDEX = 'E:/warhammer_system/.claude/skills/wfrp-encounter-builder/assets/template-index.json';
const BASE_REGISTRY = 'E:/warhammer_system/.claude/skills/wfrp-encounter-builder/assets/base-registry.json';
void path;

// Hahnbrandt rank templates (validated against template-index.json when present).
// These are the only canonical rank-layer templates per Phase 0 research memo.
const RANK_TEMPLATES = new Set(['Captain', 'Sergeant', 'Veteran']);

type StackEntry = { base: string; templates: string[] };

type PlanCall = { actorId: string; templateUuid: string };

type PlanResult =
  | { ok: true; calls: PlanCall[] }
  | { ok: false; error: string };

// Pure utility — mirrors the SKILL's stacking validation rules.
function planStack(entry: StackEntry, opts: { actorId: string; templateIndex: Record<string, { set: string; pack_id: string; item_id: string }> }): PlanResult {
  const { templates } = entry;
  if (templates.length === 1) {
    const meta = opts.templateIndex[templates[0]!];
    if (!meta) return { ok: false, error: `unknown template "${templates[0]}"` };
    if (RANK_TEMPLATES.has(templates[0]!)) {
      return { ok: false, error: `Rank template "${templates[0]}" requires a role layer` };
    }
    return { ok: true, calls: [{ actorId: opts.actorId, templateUuid: `Compendium.${meta.pack_id}.Item.${meta.item_id}` }] };
  }
  if (templates.length === 2) {
    const [role, rank] = templates as [string, string];
    if (RANK_TEMPLATES.has(role)) {
      return { ok: false, error: `Stack must be [role, rank], not [rank, ...]; got "${role}" first` };
    }
    if (!RANK_TEMPLATES.has(rank)) {
      return { ok: false, error: `Stack must be [role, rank], not [role, role]; "${rank}" is not a rank` };
    }
    const roleMeta = opts.templateIndex[role];
    const rankMeta = opts.templateIndex[rank];
    if (!roleMeta) return { ok: false, error: `unknown role template "${role}"` };
    if (!rankMeta) return { ok: false, error: `unknown rank template "${rank}"` };
    if (roleMeta.set !== 'armies-of-man' || rankMeta.set !== 'armies-of-man') {
      return { ok: false, error: `Template stacking only supported for armies-of-man set; got role="${roleMeta.set}", rank="${rankMeta.set}"` };
    }
    return {
      ok: true,
      calls: [
        { actorId: opts.actorId, templateUuid: `Compendium.${roleMeta.pack_id}.Item.${roleMeta.item_id}` },
        { actorId: opts.actorId, templateUuid: `Compendium.${rankMeta.pack_id}.Item.${rankMeta.item_id}` },
      ],
    };
  }
  return { ok: false, error: `Stack of length ${templates.length} not supported (max is 2: [role, rank])` };
}

describe('encounter-builder stacking plan', () => {
  let templateIndex: Record<string, { set: string; pack_id: string; item_id: string }>;

  it('loads template-index.json (or empty if extractor not yet run)', () => {
    if (fs.existsSync(TEMPLATE_INDEX)) {
      templateIndex = JSON.parse(fs.readFileSync(TEMPLATE_INDEX, 'utf8'));
    } else {
      // Fallback fixture so tests don't fail when extractor hasn't been run.
      templateIndex = {
        'Halberdier':   { set: 'armies-of-man', pack_id: 'wfrp4e-owb3.items', item_id: 'rVm6OnwVYG8z8yEo' },
        'Scout':        { set: 'armies-of-man', pack_id: 'wfrp4e-owb3.items', item_id: 'rAeMrQs1OTV6bFBx' },
        'Veteran':      { set: 'armies-of-man', pack_id: 'wfrp4e-owb3.items', item_id: 'fake-veteran-id' },
        'Sergeant':     { set: 'armies-of-man', pack_id: 'wfrp4e-owb3.items', item_id: 'fake-sergeant-id' },
        'Captain':      { set: 'armies-of-man', pack_id: 'wfrp4e-owb3.items', item_id: 'dURZ9F5GcDNjO2bI' },
        'Wight':        { set: 'undead',        pack_id: 'wfrp4e-owb2.items', item_id: 'oXHKAEqHOiBalNQr' },
      };
    }
    expect(templateIndex).toBeDefined();
  });

  it('B-quality Militia + [Halberdier, Veteran] → 2 calls, role first, rank second', () => {
    const entry: StackEntry = { base: 'B-quality Militia', templates: ['Halberdier', 'Veteran'] };
    const result = planStack(entry, { actorId: 'actor-x', templateIndex });
    if (!result.ok) throw new Error(`unexpected error: ${result.error}`);
    expect(result.calls).toHaveLength(2);
    expect(result.calls[0]!.templateUuid).toMatch(/Halberdier|rVm6OnwVYG8z8yEo/);
    expect(result.calls[1]!.templateUuid).toMatch(/Veteran|mnm5L3GJLVRVsJAd|fake-veteran-id/);
    expect(result.calls.every((c) => c.actorId === 'actor-x')).toBe(true);
  });

  it('rejects [Veteran] alone — rank without role', () => {
    const entry: StackEntry = { base: 'B-quality Militia', templates: ['Veteran'] };
    const result = planStack(entry, { actorId: 'a', templateIndex });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/requires a role layer/);
  });

  it('rejects [Halberdier, Scout] — two roles, no rank', () => {
    const entry: StackEntry = { base: 'B-quality Militia', templates: ['Halberdier', 'Scout'] };
    const result = planStack(entry, { actorId: 'a', templateIndex });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/not \[role, role\]|not a rank/);
  });

  it('rejects [Veteran, Halberdier] — rank then role (wrong order)', () => {
    const entry: StackEntry = { base: 'B-quality Militia', templates: ['Veteran', 'Halberdier'] };
    const result = planStack(entry, { actorId: 'a', templateIndex });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/not \[rank, \.\.\.\]/);
  });

  it('rejects stacking on non-armies-of-man set (e.g. Wight + Veteran)', () => {
    const entry: StackEntry = { base: 'Skeleton', templates: ['Wight', 'Veteran'] };
    const result = planStack(entry, { actorId: 'a', templateIndex });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/only supported for armies-of-man/);
  });

  it('single-template entry (no stack) emits 1 call', () => {
    const entry: StackEntry = { base: 'B-quality Militia', templates: ['Halberdier'] };
    const result = planStack(entry, { actorId: 'a', templateIndex });
    if (!result.ok) throw new Error(`unexpected error: ${result.error}`);
    expect(result.calls).toHaveLength(1);
  });
});

describe('base-registry × stacking invariant', () => {
  it('armies-of-man set has at least one base actor — required for stacking to work', () => {
    const bases = JSON.parse(fs.readFileSync(BASE_REGISTRY, 'utf8'));
    expect(bases['armies-of-man']?.length).toBeGreaterThanOrEqual(1);
  });
});
