// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 13A — package-local Zod schema for module-css.
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// `.strict()` per variant rejects unknown keys at the security boundary.
//
// 4 actions wrapping the custom-css module (dossier §3.1):
//   - get    { includeUserStylesheet? }   — read worldStylesheet (+ optional GM-own userStylesheet)
//   - set    { css, userStylesheet? }      — write worldStylesheet (+ optional GM-own user CSS), broadcast
//   - append { css, separator? }           — read-modify-write concatenation, broadcast
//   - reset  { }                           — write the empty sentinel, broadcast
//
// Design notes (dossier §3.1, §4.1):
//   - `css` is REQUIRED on set/append (the CSS to write). reset takes no params.
//   - All writes are GM-gated in the handler; NONE are confirm-gated (all reversible).
//   - `userStylesheet` is client-scoped → only the GM's own session; documented caveat.

import { z } from 'zod';

export const ModuleCssInput = z.discriminatedUnion('action', [
  // get — read world CSS; optionally the GM's own user CSS.
  z.object({
    action: z.literal('get'),
    includeUserStylesheet: z.boolean().optional(),
  }).strict(),

  // set — overwrite worldStylesheet; optionally the GM's own userStylesheet.
  z.object({
    action: z.literal('set'),
    css: z.string(),
    userStylesheet: z.string().optional(),
  }).strict(),

  // append — read worldStylesheet, concatenate, write back.
  z.object({
    action: z.literal('append'),
    css: z.string().min(1, 'css to append must be a non-empty string'),
    separator: z.string().optional(),
  }).strict(),

  // reset — write the empty sentinel "/* Custom CSS */".
  z.object({
    action: z.literal('reset'),
  }).strict(),
]);

export type ModuleCssInputType = z.infer<typeof ModuleCssInput>;
