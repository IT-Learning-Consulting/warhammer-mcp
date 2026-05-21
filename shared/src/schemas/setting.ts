// Phase 4 mcp_completion_v1 — Setting umbrella shared schemas.
//
// 4 actions: get, set, list, list-world-db.
// `register` and `delete` are intentionally excluded (register: un-marshalable
// onChange/type constructor; delete: no legitimate use case — set-to-default achieves same).
// `value: z.unknown()` is required to faithfully represent JSONField broadness (CCR-Schema-Fidelity T1).
// `force: boolean` on set gates the blocklist (enabled/serverHost/serverPort) + onChange-advisory.
//
// Anchors:
//   - DP-15: typed inputs and response interfaces.
//   - CCR-Schema-Fidelity T1: value uses z.unknown() not z.any().
//   - Design Decision R4.4: no register/delete actions.
//   - Design Decision Q3: force:boolean + blocklist + onChange-advisory.

import { z } from 'zod';

// ── Per-action Input schemas ─────────────────────────────────────────────────

export const SettingGetInput = z.object({
  action: z.literal('get'),
  namespace: z.string().min(1),
  key: z.string().min(1),
  scope: z.enum(['world', 'client', 'user']).optional(),
}).strict();

export const SettingSetInput = z.object({
  action: z.literal('set'),
  namespace: z.string().min(1),
  key: z.string().min(1),
  value: z.unknown(),
  force: z.boolean().default(false),
}).strict();

export const SettingListInput = z.object({
  action: z.literal('list'),
  namespacePrefix: z.string().optional(),
  scopeFilter: z.enum(['world', 'client', 'user']).optional(),
  countOnly: z.boolean().optional(),
}).strict();

export const SettingListWorldDbInput = z.object({
  action: z.literal('list-world-db'),
  namespacePrefix: z.string().optional(),
  countOnly: z.boolean().optional(),
}).strict();

// ── Discriminated union ──────────────────────────────────────────────────────

export const SettingToolInput = z.discriminatedUnion('action', [
  SettingGetInput,
  SettingSetInput,
  SettingListInput,
  SettingListWorldDbInput,
]);

// ── Inferred types ───────────────────────────────────────────────────────────

export type SettingGetInputType = z.infer<typeof SettingGetInput>;
export type SettingSetInputType = z.infer<typeof SettingSetInput>;
export type SettingListInputType = z.infer<typeof SettingListInput>;
export type SettingListWorldDbInputType = z.infer<typeof SettingListWorldDbInput>;
export type SettingToolInputType = z.infer<typeof SettingToolInput>;

// ── Response interfaces ──────────────────────────────────────────────────────

export interface SettingViewModel {
  namespace: string;
  key: string;
  fullKey: string;
  value: unknown;
  scope: string;
  typeLabel: string;
  hasOnChange: boolean;
}

export interface SettingListItem {
  namespace: string;
  key: string;
  fullKey: string;
  scope: string;
  typeLabel: string;
  hasOnChange: boolean;
}

export interface SettingWorldDbItem {
  key: string;
  value: unknown;
  id: string;
}
