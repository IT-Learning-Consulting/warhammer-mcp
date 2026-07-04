// mcp_code_quality_v2 Phase C2 (task 6.1) — F04 regression fixture for check-inputschema-nonscalar.mjs.
//
// PERMANENT fixture (deliberate — the plan keeps this one, unlike the transient gate-proof
// fixtures): shaped exactly like the pre-fix narrate `message` property (description-only,
// no type/oneOf, accepting a string-or-array union). The vitest spec feeds this file through
// the gate script's single-file mode and asserts EXACTLY ONE violation naming this tool +
// property — the negative-path proof the detection method catches the F04 defect class.
//
// NOT imported by any production code; lives outside the script's default TOOLS_DIR scan
// (fixtures under __tests__/ are excluded from the tsc build via the workspace tsconfig
// `exclude` of test files at build time, and the gate script only walks tools/**).

export const F04_FIXTURE_TOOL_DEFINITION = {
  name: 'fixture-untyped-param-tool',
  description: 'F04 fixture: message accepts a string OR an array of strings but declares neither.',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['narrate'], description: 'typed control property (must NOT be flagged).' },
      message: {
        // VIOLATION (deliberate): no type / enum / oneOf / anyOf / const key present.
        description: 'Narration text, or an array of lines to queue in order.',
      },
    },
    required: ['action'],
  },
};
