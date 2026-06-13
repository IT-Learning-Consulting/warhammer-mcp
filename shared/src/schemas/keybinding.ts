// Phase 10 mcp_coverage_expansion — keybinding tool schema.
//
// GM-client inspection + mutation of Foundry v13 `game.keybindings`
// (foundry.helpers.interaction.ClientKeybindings).
//
// 6 actions:
//   list           — enumerate every registered keybinding action + its current bindings.
//   get            — read one action's config + current bindings (namespace + keyAction).
//   set            — rebind one action (validated key/modifier shapes); re-read verify.
//   reset-action   — reset one action to its registered `editable` defaults (no native single
//                    reset method exists — emulated via set-to-defaults); re-read verify.
//   reset-all      — `resetDefaults()` — wipes ALL client customizations. Bulk-irreversible:
//                    dryRun preview (count of actions differing from default) + confirm gate.
//   find-conflicts — group `activeKeys` by (key, modifiers); report any combo bound to >1 action.
//
// CLIENT-ONLY: keybindings persist to the GM browser's localStorage (client-scope setting).
// A handler running on the GM client touches only THAT browser — other players are unreachable;
// registration is init-time, so only already-registered actions appear.
//
// Thin primitive (HC1 / CCR-3): no system-config reads, no game-rule logic.

import { z } from 'zod';

// A single keybinding: a KeyboardEvent.code (e.g. "KeyF", "Digit1", "F5") plus optional
// modifiers. Valid modifier VALUE strings come from KeyboardManager.MODIFIER_KEYS and are
// validated at runtime by the handler (not hard-coded here) so Foundry stays the source of truth.
const KeybindingBindingInput = z
  .object({
    key: z.string().min(1),
    modifiers: z.array(z.string()).optional(),
  })
  .strict();

// Precedence tiers map to CONST.KEYBINDING_PRECEDENCE (PRIORITY=0, NORMAL=1, DEFERRED=2).
const PRECEDENCE = ['PRIORITY', 'NORMAL', 'DEFERRED'] as const;

export const KeybindingListInput = z
  .object({
    action: z.literal('list'),
    namespace: z.string().min(1).optional(),
  })
  .strict();

export const KeybindingGetInput = z
  .object({
    action: z.literal('get'),
    namespace: z.string().min(1),
    keyAction: z.string().min(1),
  })
  .strict();

export const KeybindingSetInput = z
  .object({
    action: z.literal('set'),
    namespace: z.string().min(1),
    keyAction: z.string().min(1),
    bindings: z.array(KeybindingBindingInput),
  })
  .strict();

export const KeybindingResetActionInput = z
  .object({
    action: z.literal('reset-action'),
    namespace: z.string().min(1),
    keyAction: z.string().min(1),
  })
  .strict();

// reset-all is bulk-irreversible (CCR-4): dryRun previews the impact, confirm executes.
export const KeybindingResetAllInput = z
  .object({
    action: z.literal('reset-all'),
    dryRun: z.boolean().optional(),
    confirm: z.literal(true).optional(),
  })
  .strict();

export const KeybindingFindConflictsInput = z
  .object({
    action: z.literal('find-conflicts'),
    precedenceFilter: z.enum(PRECEDENCE).optional(),
  })
  .strict();

export const KeybindingToolInput = z.discriminatedUnion('action', [
  KeybindingListInput,
  KeybindingGetInput,
  KeybindingSetInput,
  KeybindingResetActionInput,
  KeybindingResetAllInput,
  KeybindingFindConflictsInput,
]);

export type KeybindingToolInputType = z.infer<typeof KeybindingToolInput>;
export type KeybindingListInputType = z.infer<typeof KeybindingListInput>;
export type KeybindingGetInputType = z.infer<typeof KeybindingGetInput>;
export type KeybindingSetInputType = z.infer<typeof KeybindingSetInput>;
export type KeybindingResetActionInputType = z.infer<typeof KeybindingResetActionInput>;
export type KeybindingResetAllInputType = z.infer<typeof KeybindingResetAllInput>;
export type KeybindingFindConflictsInputType = z.infer<typeof KeybindingFindConflictsInput>;

// ── Response interfaces (CCR-1: concrete generics on this.query, never <any>) ──

export interface KeybindingBinding {
  key: string;
  modifiers: string[];
}

export interface KeybindingActionView {
  id: string;
  namespace: string;
  name: string;
  hint?: string;
  precedence: number;
  restricted: boolean;
  editable: KeybindingBinding[];
  current: KeybindingBinding[];
  humanized: string[];
}

export interface KeybindingListResponse {
  actions: KeybindingActionView[];
  total: number;
}

export type KeybindingGetResponse = KeybindingActionView;

export interface KeybindingSetResponse {
  id: string;
  bindings: KeybindingBinding[];
}

export type KeybindingResetActionResponse = KeybindingSetResponse;

export interface KeybindingResetAllResponse {
  dryRun: boolean;
  reset: boolean;
  count: number;
  items?: Array<{ id: string; name: string }>;
}

export interface KeybindingConflict {
  key: string;
  modifiers: string[];
  actions: Array<{ id: string; name: string; precedence: number; restricted: boolean }>;
}

export interface KeybindingConflictsResponse {
  conflicts: KeybindingConflict[];
  total: number;
}
