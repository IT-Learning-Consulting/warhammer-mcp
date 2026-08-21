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
import { checkSchemaRule, checkBuilderUsageRule, checkCoverageAssertionRule, OUTCOME_VALUES } from '../../../../scripts/check-outcome-field.mjs';

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
