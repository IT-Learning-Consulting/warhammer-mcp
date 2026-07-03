// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 7 — module-access-control handler schemas.
//
// Discriminated union over the access-control bundle: LocknKey (10 actions) +
// LockView (17 actions, get-lock-state shared with LnK) + get-bundle-status.
//
// Structure: each member exports a .strict() variant array; this file spreads them
// into the top-level discriminated union (mirrors scene-atmosphere bundle pattern).
//
// CCR-5: module-specific schemas stay package-local.
// .strict() rejects unknown top-level keys on every variant.

import { z } from 'zod';
import { locknkeyVariants } from './locknkey-schemas.js';
import { lockviewVariants } from './lockview-schemas.js';

// ── get-bundle-status ─────────────────────────────────────────────────────────
// Always succeeds (unguarded). Reports active-state for both bundle members.
const getBundleStatusInput = z.object({
  action: z.literal('get-bundle-status'),
}).strict();

// ── Discriminated union ───────────────────────────────────────────────────────
//
// locknkeyVariants includes the shared `get-lock-state` literal; lockviewVariants
// does NOT redeclare it (literals must be unique). The dispatcher routes
// get-lock-state to the LnK or LockView handler by input shape (documentId present?).

export const ModuleAccessControlInput = z.discriminatedUnion('action', [
  getBundleStatusInput,
  ...locknkeyVariants,
  ...lockviewVariants,
]);

export type ModuleAccessControlInputType = z.infer<typeof ModuleAccessControlInput>;

// ── Bundle member registry ───────────────────────────────────────────────────
// Module IDs match game.modules.get(id) exactly (capitalized per module.json).
export const BUNDLE_MEMBERS = ['LocknKey', 'LockView'] as const;
export type BundleMemberId = (typeof BUNDLE_MEMBERS)[number];
