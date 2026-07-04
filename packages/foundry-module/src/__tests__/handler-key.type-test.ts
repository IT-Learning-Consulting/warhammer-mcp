// mcp_code_quality_v2 Phase C2 (RC2.2) — HandlerKey compile-guard type-test.
//
// This file is a TYPE-ONLY proof: it asserts that `HandlerKey` (derived via
// `keyof ReturnType<QueryHandlers['buildHandlerTable']>`) rejects a misspelled
// key at compile time. Not a runtime test — `tsc --noEmit` failing when the
// `@ts-expect-error` directive is removed IS the proof (per the task's
// acceptance criterion). No vitest assertions needed; this file is picked up
// by the workspace `tsc` project, not by the vitest runner.

import type { HandlerKey } from '../queries.js';

// A valid key compiles cleanly (sanity check the type isn't `never`/`any`).
const validKey: HandlerKey = 'getCharacterInfo';
void validKey;

// @ts-expect-error — 'gettCharacterInfo' is a misspelling; HandlerKey must reject it.
const misspelledKey: HandlerKey = 'gettCharacterInfo';
void misspelledKey;
