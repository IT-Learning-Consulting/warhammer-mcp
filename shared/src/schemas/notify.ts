// Phase 4 mcp_notify_coverage — notify umbrella schema.
//
// Surfaces the foundry-module's notify.* dispatcher as an MCP tool so skills
// can emit GM-visible notifications (workflow bookends, ad-hoc info/warn lines).
//
// Discriminated union on `severity` — `'lifecycle'` requires `lifecycleEvent`;
// every other severity accepts message + optional summary/sticky/chat.
//
// Note: `notify.lifecycle()` itself does NOT accept summary/sticky/chat (those
// are hardcoded inside notify.ts). The schema allows them on non-lifecycle
// branches only.

import { z } from 'zod';

const NotifyMessage = z.string().min(1);
const NotifySummary = z.string().optional();
const NotifySticky = z.boolean().optional();
const NotifyChat = z.boolean().optional();

const NotifyCommonOpts = {
  message: NotifyMessage,
  summary: NotifySummary,
  sticky: NotifySticky,
  chat: NotifyChat,
};

export const NotifyCreatedInput = z
  .object({ severity: z.literal('created'), ...NotifyCommonOpts })
  .strict();

export const NotifyUpdatedInput = z
  .object({ severity: z.literal('updated'), ...NotifyCommonOpts })
  .strict();

export const NotifyDeletedInput = z
  .object({ severity: z.literal('deleted'), ...NotifyCommonOpts })
  .strict();

export const NotifyWarnInput = z
  .object({ severity: z.literal('warn'), ...NotifyCommonOpts })
  .strict();

export const NotifyErrorInput = z
  .object({ severity: z.literal('error'), ...NotifyCommonOpts })
  .strict();

export const NotifyInfoInput = z
  .object({ severity: z.literal('info'), ...NotifyCommonOpts })
  .strict();

export const NotifyLifecycleInput = z
  .object({
    severity: z.literal('lifecycle'),
    message: NotifyMessage,
    lifecycleEvent: z.enum(['init', 'connection-up', 'connection-down', 'workflow-end']),
  })
  .strict();

export const NotifyToolInput = z.discriminatedUnion('severity', [
  NotifyCreatedInput,
  NotifyUpdatedInput,
  NotifyDeletedInput,
  NotifyWarnInput,
  NotifyErrorInput,
  NotifyInfoInput,
  NotifyLifecycleInput,
]);

export type NotifyToolInputType = z.infer<typeof NotifyToolInput>;
export type NotifyCreatedInputType = z.infer<typeof NotifyCreatedInput>;
export type NotifyUpdatedInputType = z.infer<typeof NotifyUpdatedInput>;
export type NotifyDeletedInputType = z.infer<typeof NotifyDeletedInput>;
export type NotifyWarnInputType = z.infer<typeof NotifyWarnInput>;
export type NotifyErrorInputType = z.infer<typeof NotifyErrorInput>;
export type NotifyInfoInputType = z.infer<typeof NotifyInfoInput>;
export type NotifyLifecycleInputType = z.infer<typeof NotifyLifecycleInput>;

/**
 * Response envelope. `acknowledged: true` iff the foundry-module handler
 * invoked the underlying `notify.*` method without throwing. `false` only
 * when the dispatcher itself crashed — not when individual notify channels
 * (toast/chat/etc.) were suppressed by world settings.
 */
export interface NotifyResponse {
  acknowledged: boolean;
}
