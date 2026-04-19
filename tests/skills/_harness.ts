// tests/skills/_harness.ts — shared mocking harness for wfrp-* skill integration tests.
//
// Skills consume MCP primitives (CONFIG.queries["warhammer-mcp.X"]) and compose them
// into briefings, summaries, or workflows. The harness lets test files:
//   1. Register canned responses per query key (mockMcpCall)
//   2. Inspect what the skill called and in what order (getCallLog)
//   3. Drive a programmatic skill entrypoint when one exists (invokeSkill)
//
// Skill execution model: skills are Markdown spec + LLM workflow at runtime, so
// `invokeSkill` here is a thin shim — tests typically call the underlying primitive
// sequence directly via the registered mocks and assert on getCallLog().

export interface CallLogEntry {
  queryKey: string;
  input: unknown;
  timestamp: number;
}

export interface SkillInvocationResult {
  callLog: CallLogEntry[];
  output: unknown;
}

interface MockEntry {
  queryKey: string;
  returnValue: unknown | ((input: unknown) => unknown);
}

const mocks = new Map<string, MockEntry>();
const callLog: CallLogEntry[] = [];

export function mockMcpCall(
  queryKey: string,
  returnValue: unknown | ((input: unknown) => unknown),
): void {
  mocks.set(queryKey, { queryKey, returnValue });
}

export function clearMcpMocks(): void {
  mocks.clear();
  callLog.length = 0;
}

export function getCallLog(): ReadonlyArray<CallLogEntry> {
  return callLog.slice();
}

export async function callMcp(queryKey: string, input: unknown = {}): Promise<unknown> {
  callLog.push({ queryKey, input, timestamp: Date.now() });
  const mock = mocks.get(queryKey);
  if (!mock) {
    throw new Error(`No mock registered for query "${queryKey}"`);
  }
  const value = typeof mock.returnValue === 'function'
    ? (mock.returnValue as (i: unknown) => unknown)(input)
    : mock.returnValue;
  return value;
}

// invokeSkill — for skills with a programmatic entrypoint. Most wfrp-* skills are
// pure Markdown specs read at runtime by the LLM; tests can just call the documented
// primitive sequence via callMcp() and assert on getCallLog(). This shim exists for
// future skills that ship a TS module alongside SKILL.md.
export async function invokeSkill(
  skillName: string,
  args: Record<string, unknown>,
  runner?: (args: Record<string, unknown>) => Promise<unknown>,
): Promise<SkillInvocationResult> {
  if (!runner) {
    throw new Error(
      `invokeSkill("${skillName}") called without a runner. Pass the skill's primitive sequence as the third argument, ` +
      `or call callMcp() directly in your test.`,
    );
  }
  const output = await runner(args);
  return { callLog: getCallLog(), output };
}
