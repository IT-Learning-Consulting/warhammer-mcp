// BUG-502 (Wave 2, plan D12) — description action-count drift guard.
//
// The BUG-466/467/502 class has now minted THREE times: a tool's prose description
// claims "N actions" while the inputSchema action enum carries M ≠ N, leaving real
// actions undiscoverable (an agent trusts the headline count). This guard regex-extracts
// every "N action(s)" claim from each swept tool's description and asserts it equals the
// action-enum length. Scoped to the 7 tools swept by BUG-502 (per D12's revisit clause —
// description styles vary too much repo-wide for a blanket rule).
//
// Verified to FAIL on drift during development via a deliberate local mutation of the
// macro description count (not committed).

import { describe, expect, it } from 'vitest';
import { MacroTool } from '../tools/macro.js';
import { SceneTool } from '../tools/scene.js';
import { ChatMessageTool } from '../tools/chat-message.js';
import { ModuleGathererTool } from '../tools/modules/gatherer/gatherer.js';
import { ModulePatrolTool } from '../tools/modules/patrol/patrol.js';
import { ModuleTimekeepingTool } from '../tools/modules/simple-timekeeping/timekeeping.js';
import { ModuleChatCommanderTool } from '../tools/modules/_chatcommands/chat-commander.js';

const stubLogger: any = {
  child: () => stubLogger,
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
const toolOptions = { foundryClient: {} as any, logger: stubLogger };

const SWEPT: Array<{ label: string; make: () => any }> = [
  { label: 'macro', make: () => new MacroTool(toolOptions) },
  { label: 'scene', make: () => new SceneTool(toolOptions) },
  { label: 'chat-message', make: () => new ChatMessageTool(toolOptions) },
  { label: 'module-gatherer', make: () => new ModuleGathererTool(toolOptions) },
  { label: 'module-patrol', make: () => new ModulePatrolTool(toolOptions) },
  { label: 'module-timekeeping', make: () => new ModuleTimekeepingTool(toolOptions) },
  { label: 'module-chat-commander', make: () => new ModuleChatCommanderTool(toolOptions) },
];

/** Extract every "N action(s)" claim from a description ("~16 actions" counts as 16). */
function actionCountClaims(description: string): number[] {
  const claims: number[] = [];
  const re = /~?(\d+)\s+actions?\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(description)) !== null) claims.push(Number(m[1]));
  return claims;
}

describe('BUG-502 guard: description "N actions" claims match the action enum', () => {
  for (const { label, make } of SWEPT) {
    it(`${label}: every count claim equals the enum length`, () => {
      const defs = make().getToolDefinitions();
      expect(defs.length).toBeGreaterThan(0);
      for (const def of defs) {
        const enumValues: string[] = def.inputSchema?.properties?.action?.enum ?? [];
        expect(enumValues.length).toBeGreaterThan(0);
        const claims = actionCountClaims(String(def.description ?? ''));
        // A tool without a count claim is fine (skip per D12); every claim present must be exact.
        for (const claim of claims) {
          expect(claim, `${def.name}: description claims ${claim} actions but the enum has ${enumValues.length} (${enumValues.join(', ')})`).toBe(enumValues.length);
        }
        // The 7 swept tools all carry at least one claim post-sweep — pin that so the
        // guard can't silently stop guarding if a rewrite drops the count line.
        expect(claims.length, `${def.name}: expected at least one "N actions" claim in the description`).toBeGreaterThan(0);
      }
    });
  }
});
