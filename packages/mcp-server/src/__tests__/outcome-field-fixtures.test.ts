// Task 1.3 acceptance — check-outcome-field.mjs (Phase 3, systemic_bug_class_prevention) must go RED
// on each seeded defect and GREEN on a matching correct case, for all three rules. Imports the rule
// functions directly (exported for this purpose) rather than shelling out to a full dist build /
// git diff, so these fixtures are fast and independent of build freshness or working-tree state.
//
// No-Zod-introspection note (per task 1.3's instruction): this checker does zero Zod-schema
// introspection — rule 1 (schema) reads the already-generated outputSchema JSON literal directly, so
// the ZodEffects-masks-ZodOptional trap (Phase 2 carry-forward's explicit warning) does not apply here.
// This is a deliberate omission, not an oversight — see check-outcome-field.mjs's own header comment.

import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain .mjs script, not part of this package's TS project.
import {
  checkSchemaRule,
  checkBuilderUsageRule,
  checkCoverageAssertionRule,
  checkRule1b,
  collectToolDefs,
  loadAllowlist,
  OUTCOME_VALUES,
} from '../../../../scripts/check-outcome-field.mjs';

describe('check-outcome-field — rule 1: schema (R3.x)', () => {
  it('goes red: outputSchema.properties.outcome.enum is missing a value from the 5-set', () => {
    const allowlist = ['seeded-tool'];
    const defsByName = new Map([
      ['seeded-tool', { outputSchema: { properties: { outcome: { enum: ['applied', 'failed'] } } } }],
    ]);
    const offenders = checkSchemaRule(allowlist, defsByName);
    expect(offenders.length).toBe(1);
    expect(offenders[0].detail).toContain('seeded-tool');
  });

  it('goes green: outputSchema.properties.outcome.enum matches the 5-value set exactly', () => {
    const allowlist = ['seeded-tool'];
    const defsByName = new Map([
      ['seeded-tool', { outputSchema: { properties: { outcome: { enum: [...OUTCOME_VALUES] } } } }],
    ]);
    const offenders = checkSchemaRule(allowlist, defsByName);
    expect(offenders.length).toBe(0);
  });

  it('goes green: a tool with no outputSchema at all is skipped, not an offender', () => {
    const allowlist = ['seeded-tool-no-schema'];
    const defsByName = new Map([['seeded-tool-no-schema', {}]]);
    expect(checkSchemaRule(allowlist, defsByName).length).toBe(0);
  });

  it('goes green: an empty-passthrough outputSchema (region/MATT/imperial-arcana D5 carve-out) is skipped', () => {
    const allowlist = ['seeded-passthrough-tool'];
    const defsByName = new Map([['seeded-passthrough-tool', { outputSchema: { type: 'object' } }]]);
    expect(checkSchemaRule(allowlist, defsByName).length).toBe(0);
  });
});

describe('check-outcome-field — rule 1b: schema-presence + structuredContent-emission (D6, Phase 3 task 5.1)', () => {
  it('goes red: allowlisted tool declares no outputSchema at all (BUG-869-shaped gap)', () => {
    // Rule 1's own `checkSchemaRule` would SKIP this tool (no outputSchema = out of rule 1's scope) —
    // rule 1b exists precisely because that skip hid modify-item-qualities' pre-fix BUG-869 shape.
    // Uses a REAL allowlisted/mapped tool name (add-active-effect) so only the schema-presence half is
    // red — an unmapped tool name would ALSO red the structuredContent-file-mapping check, conflating
    // the two independent failure modes this test is isolating.
    const offenders = checkRule1b(
      ['add-active-effect'],
      new Map([['add-active-effect', { name: 'add-active-effect' }]]), // no outputSchema key at all
      () => "return { content: [{ type: 'text', text }], structuredContent: data };", // structuredContent present, only the schema half is red
    );
    expect(offenders.length).toBe(1);
    expect(offenders[0].detail).toContain('add-active-effect');
    expect(offenders[0].detail).toContain('no outputSchema declared at all');
  });

  it('goes red: allowlisted tool\'s mcp-server tool source never emits structuredContent', () => {
    const offenders = checkRule1b(
      ['add-active-effect'],
      new Map([['add-active-effect', { outputSchema: { type: 'object', properties: {}, additionalProperties: true } }]]), // outputSchema present, only the wire half is red
      () => "return { content: [{ type: 'text' as const, text }] };", // no structuredContent anywhere
    );
    expect(offenders.length).toBe(1);
    expect(offenders[0].detail).toContain('add-active-effect');
    expect(offenders[0].detail).toContain('no structuredContent emission found');
  });

  it('goes green: a carved-out tool is skipped entirely, even though both checks would otherwise go red', () => {
    // Proves the carve-out mechanism via the injectable `carveOuts` param (task 5.1's own suggested
    // approach) rather than mutating the real, always-empty-by-default exported RULE_1B_CARVEOUTS list.
    const offenders = checkRule1b(
      ['seeded-carved-out-tool'],
      new Map([['seeded-carved-out-tool', {}]]), // no outputSchema — would red
      () => "return { content: [{ type: 'text', text }] };", // no structuredContent — would ALSO red
      ['seeded-carved-out-tool'],
    );
    expect(offenders.length).toBe(0);
  });

  it('reflects the real, built tree: all 11 allowlisted tools pass rule 1b — task 5.2 (Danny-directed, ' +
    'post this task\'s original finding) added the missing empty-passthrough outputSchema to the 4 ' +
    'pre-existing legacy tools this fixture originally caught (apply-npc-career-advance/module-itempiles/' +
    'module-sequencer/module-autoanimations)',
  async () => {
    // collectToolDefs() imports every registered tool's compiled definition — ~1.4s in
    // isolation, but can tip past vitest's 5000ms default under full-suite CPU contention
    // (136 files). Explicit timeout, not a logic issue — same shape as BUG-866's fix
    // bumping apply-npc-career-advance.test.ts's timeout for its own added retry window.
    const allowlist = loadAllowlist();
    expect(allowlist.length).toBe(11);
    const defsByName = await collectToolDefs();
    const offenders = checkRule1b(allowlist, defsByName);
    const offendingToolNames = [...new Set(
      offenders.map((o) => o.detail.match(/tool "([^"]+)"/)?.[1]).filter(Boolean),
    )].sort();
    // This is the CURRENT, VERIFIED state of the real tree, post task 5.2 — not a fabricated green.
    // Originally (task 5.1) this asserted the 4 legacy offenders as a disclosed, out-of-scope gap;
    // Danny directed task 5.2 to fix them, so the tree is now genuinely clean.
    expect(offendingToolNames).toEqual([]);
  }, 15000);
});

describe('check-outcome-field — rule 2: builder-usage', () => {
  it('goes red: allowlisted tool\'s handler file(s) never call buildOutcomeResponse(', () => {
    const offenders = checkBuilderUsageRule(['add-active-effect'], () => 'export function foo() { return { success: true }; }');
    expect(offenders.length).toBe(1);
    expect(offenders[0].detail).toContain('add-active-effect');
  });

  it('goes green: handler file calls buildOutcomeResponse(', () => {
    const offenders = checkBuilderUsageRule(['add-active-effect'], () => "return buildOutcomeResponse('applied', { id });");
    expect(offenders.length).toBe(0);
  });
});

describe('check-outcome-field — rule 3: coverage-assertion (ratcheted, never hard-fails)', () => {
  it('flags a diffed handler file that is neither allowlist-mapped nor GATE-SUPPRESS-anchored', () => {
    const offenders = checkCoverageAssertionRule(
      ['add-active-effect'],
      ['packages/foundry-module/src/handlers/some-other-handler.ts'],
    );
    expect(offenders.length).toBe(1);
    expect(offenders[0].file).toBe('packages/foundry-module/src/handlers/some-other-handler.ts');
  });

  it('goes green: a diffed file already mapped by the allowlist is not re-flagged', () => {
    const offenders = checkCoverageAssertionRule(['add-active-effect'], ['packages/foundry-module/src/services/effects.ts']);
    expect(offenders.length).toBe(0);
  });

  it('goes green: a diffed file outside handlers/services/tools scope is ignored', () => {
    const offenders = checkCoverageAssertionRule(['add-active-effect'], ['packages/foundry-module/src/utils/verifyWrite.ts']);
    expect(offenders.length).toBe(0);
  });
});
