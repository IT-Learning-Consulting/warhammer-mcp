// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// tokenizer-2-integration plan Phase 2 — Zod schema for module-tokenizer.
//
// CCR-5: module-specific schemas live in @foundry-mcp/shared (ADR-020).
// `.strict()` at each union member rejects unknown keys (CCR-5).
//
// Popout / borderless-token support (kb/modules-docs/tokenizer-2/audit.md §5):
// `export-layers` accepts EITHER a declarative `layers[]` (paths + transforms) OR an
// opaque `layerStack` blob captured from one interactive editor session and replayed
// across actors — the module's internal layer-object field shape (maskType/clip/order)
// is only visible in the minified bundle and may prove too unstable to pin, so the
// opaque passthrough is the safety valve.

import { z } from 'zod';

// Shared `tokenize`/`tokenize-batch` opts subset — kept in one object so both
// single and batch actions parse identically (data-fields per audit.md §4).
const TokenizeOpts = {
  frameSrc: z.string().optional(),
  maskSrc: z.string().optional(),
  backgroundSrc: z.string().optional(),
  skipRing: z.boolean().optional(),
  skipBackground: z.boolean().optional(),
  disposition: z.string().optional(),
  exportSize: z.number().int().positive().max(4096).optional(),
  exportFormat: z.enum(['webp', 'png']).optional(),
  saveFolder: z.string().optional(),
  filename: z.string().optional(),
  updateActor: z.boolean().optional(),
  useActorImg: z.boolean().optional(),
  forceDynamicRing: z.boolean().optional(),
  forceBakedRing: z.boolean().optional(),
  wildcardMode: z.boolean().optional(),
} as const;

// Declarative layer entry (paths + transform); intentionally loose (record) since the
// module's exact per-layer field names are only visible in the minified bundle —
// the handler passes this through to `hydrate()`/`exportLayers()` largely unmodified.
const LayerEntry = z.record(z.string(), z.unknown());

export const ModuleTokenizerInput = z.discriminatedUnion('action', [
  // tokenize — api.tokenize(actor, opts). Writes prototypeToken.texture.src + avatar
  // + FS image unless opts.updateActor === false.
  z.object({
    action: z.literal('tokenize'),
    actorUuid: z.string().min(1),
    ...TokenizeOpts,
  }).strict(),

  // tokenize-batch — many actors, same opts shape. Bulk write: confirm:true required
  // (CCR-4). Partial-failure shape: [{actorUuid,result}|{actorUuid,error}, ...].
  z.object({
    action: z.literal('tokenize-batch'),
    actorUuids: z.array(z.string().min(1)).min(1),
    confirm: z.boolean().optional(),
    ...TokenizeOpts,
  }).strict(),

  // export-layers — api.exportLayers(layers, opts). FS image only, no actor write.
  // Accepts EITHER a declarative layers[] OR an opaque layerStack passthrough.
  z.object({
    action: z.literal('export-layers'),
    layers: z.array(LayerEntry).optional(),
    layerStack: z.unknown().optional(),
    exportSize: z.number().int().positive().max(4096).optional(),
    exportFormat: z.enum(['webp', 'png']).optional(),
    saveFolder: z.string().optional(),
    filename: z.string().optional(),
  }).strict(),

  // register-custom-frame — api.registerCustomFrame(name, path, config). Persists the
  // custom-frames world setting.
  z.object({
    action: z.literal('register-custom-frame'),
    name: z.string().min(1),
    path: z.string().min(1),
    config: z.record(z.string(), z.unknown()).optional(),
  }).strict(),

  // cleanup-flags — api.cleanupActorFlags(actors?). Bulk maintenance write:
  // confirm:true required (CCR-4). Omit actorUuids to sweep world-wide.
  z.object({
    action: z.literal('cleanup-flags'),
    actorUuids: z.array(z.string().min(1)).optional(),
    confirm: z.boolean().optional(),
  }).strict(),

  // get-settings — read-only game.settings.get("tokenizer-2", key) snapshot.
  z.object({
    action: z.literal('get-settings'),
    keys: z.array(z.string().min(1)).optional(),
  }).strict(),

  // list-registered — read-only frameRegistry/pluginRegistry snapshot.
  z.object({
    action: z.literal('list-registered'),
  }).strict(),
]);

export type ModuleTokenizerInputType = z.infer<typeof ModuleTokenizerInput>;
