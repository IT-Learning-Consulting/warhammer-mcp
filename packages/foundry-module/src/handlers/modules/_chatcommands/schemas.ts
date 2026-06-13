// Module Integration v1 Phase 12 — package-local Zod schema for module-chat-commander
// (_chatcommands v2.0.5 + chat-commander-wfrp4e v1.0.0).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on
// every variant rejects unknown top-level keys.
//
// 4 actions over the verified server-reachable surface (dossier §4.2):
//   reads:  list-commands, get-command
//   confirm-gated writes: register-command (raw JS callbackBody → SUPPORTED_WITH_CONFIRMATION),
//                         unregister-command (CCR-Delete-Safety).
//
// ADR-9.1 accessor (Phase-11 carry-forward): _chatcommands exposes `game.chatCommands` (Class-1).
// register()/unregister() are INSTANCE methods using `this` → handler calls them BOUND, never
// destructured (pre-plan §Live-state, subagent 5). register-command persistence is DEPENDENCY_GATED
// on advanced-macros (the world-script flag). register() is synchronous → no read-back race.
//
// Source: .agents/research/module_integration/phase12_pre_plan.md + dossiers/macros-commands.md.

import { z } from 'zod';

const Role = z.enum(['NONE', 'PLAYER', 'TRUSTED', 'ASSISTANT', 'GAMEMASTER']);
const CommandName = z.string().min(1);

export const ModuleChatCommanderInput = z.discriminatedUnion('action', [
  // ── Reads ─────────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list-commands'),
      filter: z
        .object({
          module: z.string().min(1).optional(),
          requiredRole: Role.optional(),
          nameSubstring: z.string().min(1).optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('get-command'),
      name: CommandName, // primary name or alias; lowercased before lookup
    })
    .strict(),

  // ── Confirm-gated writes (CCR-4) ────────────────────────────────────────────
  z
    .object({
      // SUPPORTED_WITH_CONFIRMATION — callbackBody is raw JS run in Foundry macro scope.
      // DEPENDENCY_GATED on advanced-macros for the world-script persistence.
      action: z.literal('register-command'),
      name: CommandName, // must start with "/"
      callbackBody: z.string().min(1),
      module: z.string().min(1).optional(), // default "warhammer-mcp"
      description: z.string().optional(),
      icon: z.string().optional(), // HTML string, e.g. "<i class='fas fa-radiation'></i>"
      requiredRole: Role.optional(), // default "NONE"
      aliases: z.array(z.string().min(1)).optional(),
      closeOnComplete: z.boolean().optional(), // default true
      autocompleteBody: z.string().optional(),
      confirm: z.literal(true, {
        errorMap: () => ({
          message: 'register-command requires confirm:true (raw JS callbackBody runs on chatCommandsReady)',
        }),
      }),
    })
    .strict(),
  z
    .object({
      // CCR-Delete-Safety — unregisters the command and optionally deletes the backing macro.
      action: z.literal('unregister-command'),
      name: CommandName,
      deleteWorldScript: z.boolean().optional(), // default true
      immediateUnregister: z.boolean().optional(), // default true
      confirm: z.literal(true, {
        errorMap: () => ({
          message: 'unregister-command requires confirm:true (removes the command and optionally deletes the backing macro)',
        }),
      }),
    })
    .strict(),
]);

export type ModuleChatCommanderInputType = z.infer<typeof ModuleChatCommanderInput>;
