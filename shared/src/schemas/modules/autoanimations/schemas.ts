// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 8 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-autoanimations.
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2).
// .strict() rejects unknown top-level keys on every action variant.
//
// The animation surface is Automated Animations' v5 `flags.autoanimations` object
// (dossier §3a). The MCP accepts a SIMPLIFIED, structured input here; the handler
// (autoanimations.ts `expandToV5`) expands it to the full v5 object, forcing
// version:5 + isCustomized:true (the silent-failure guards from dossier §3a).
//
// Safety (dossier §5):
//   - macro.enable === true requires confirmedMacro:true (SUPPORTED_WITH_CONFIRMATION):
//       AA runs `new Sequence().macro(name,args).play()` on every roll — arbitrary code.
//   - play-animation is GM + confirm (transient, no undo).

import { z } from 'zod';

// dbSection values AA registers under (dossier §3b).
const DbSection = z.enum(['melee', 'range', 'return', 'static', 'templatefx']);

// Autorec category keys (dossier §3g — the 7 world-scoped autorec stores).
const AutorecCategory = z.enum(['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset', 'aefx']);

// menu routing keys (dossier §3a).
const MenuRoute = z.enum(['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset', 'aefx']);

// A single animation "video" slot — the dbSection/menuType/animation/variant/color tuple
// AA resolves against its Sequencer.Database namespace, OR a custom file path.
//
// BUG-799: an incomplete DB-driven tuple (e.g. dbSection set but menuType/animation missing)
// previously passed this schema silently. AA's path builder does NOT reject an incomplete/invalid
// key — it silently substitutes the first available database choice, so a typo'd or partial tuple
// plays an ARBITRARY fallback animation while the write still reports success. Require the
// DB-driven fields all-or-nothing (a fully empty video slot is still valid — "no video configured"),
// and require a non-empty customPath whenever enableCustom:true.
const VideoSlot = z.object({
  dbSection: DbSection.optional(),
  menuType: z.string().optional(),
  animation: z.string().optional(),
  variant: z.string().optional(),
  color: z.string().optional(),
  enableCustom: z.boolean().optional(),
  customPath: z.string().optional(),
}).strict().refine((v) => {
  if (v.enableCustom === true) return typeof v.customPath === 'string' && v.customPath.length > 0;
  const dbFields = [v.dbSection, v.menuType, v.animation];
  const anySet = dbFields.some((f) => f !== undefined);
  return !anySet || dbFields.every((f) => f !== undefined);
}, {
  message: 'INCOMPLETE_VIDEO_SLOT: a video slot needs either (enableCustom:true + a non-empty customPath) or all of (dbSection + menuType + animation) — a partial DB tuple silently falls back to AA\'s first database choice instead of being rejected',
});

// A sound slot.
//
// BUG-799: enable:true with an omitted/empty file previously passed silently — AA plays nothing
// for it while the write still reports success.
const SoundSlot = z.object({
  enable: z.boolean().optional(),
  file: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
  delay: z.number().int().min(0).optional(),
  startTime: z.number().int().min(0).optional(),
  repeat: z.number().int().min(1).optional(),
  repeatDelay: z.number().int().min(0).optional(),
}).strict().refine((v) => v.enable !== true || (typeof v.file === 'string' && v.file.length > 0), {
  message: 'INCOMPLETE_SOUND_SLOT: enable:true requires a non-empty file — an enabled sound with no file plays nothing while reporting success',
});

// An additional FX slot (secondary/source/target) — a video + optional sound + enable flag.
const FxSlot = z.object({
  enable: z.boolean().optional(),
  video: VideoSlot.optional(),
  sound: SoundSlot.optional(),
}).strict();

// The macro slot — gated behind confirmedMacro (dossier §5/§6).
//
// BUG-799: enable:true with an omitted/empty name previously passed silently, storing a
// permanently broken roll hook that runs nothing while reporting success.
const MacroSlot = z.object({
  enable: z.boolean().optional(),
  name: z.string().optional(),
  args: z.unknown().optional(),
  playWhen: z.enum(['0', '1', '2']).optional(),
}).strict().refine((v) => v.enable !== true || (typeof v.name === 'string' && v.name.length > 0), {
  message: 'INCOMPLETE_MACRO_SLOT: enable:true requires a non-empty name — an enabled macro with no name runs nothing while reporting success',
});

// Melee→range auto-switch (dossier §3a meleeSwitch).
const MeleeSwitchSlot = z.object({
  video: VideoSlot.optional(),
  detect: z.enum(['automatic', 'manual']).optional(),
  range: z.number().int().min(0).optional(),
  isReturning: z.boolean().optional(),
  switchType: z.string().optional(),
}).strict();

// The simplified animation payload for set-item-animation / merge-autorec-entry.
//
// BUG-799: `animation:{}` previously passed this schema silently, producing a v5 write that
// configures nothing at all while still reporting isCustomized:true / a successful write.
const AnimationPayload = z.object({
  menu: MenuRoute.optional(),
  primary: VideoSlot.optional(),
  sound: SoundSlot.optional(),
  secondary: FxSlot.optional(),
  source: FxSlot.optional(),
  target: FxSlot.optional(),
  soundOnly: SoundSlot.optional(),
  macro: MacroSlot.optional(),
  meleeSwitch: MeleeSwitchSlot.optional(),
  fromAmmo: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  // size/elevation/opacity tuning on the primary slot's options (dossier §3a)
  size: z.number().positive().optional(),
  elevation: z.number().optional(),
  delay: z.number().int().min(0).optional(),
}).strict().refine(
  (v) => v.primary !== undefined || v.sound !== undefined || v.secondary !== undefined
    || v.source !== undefined || v.target !== undefined || v.soundOnly !== undefined || v.macro !== undefined,
  { message: 'EMPTY_ANIMATION_PAYLOAD: at least one of primary/sound/secondary/source/target/soundOnly/macro must be set — an empty payload configures nothing while still reporting a customized write' },
);

export const ModuleAutoAnimationsInput = z.discriminatedUnion('action', [
  // ── Per-item flag authoring ──────────────────────────────────────────────
  z.object({
    action: z.literal('get-item-animation'),
    uuid: z.string().min(1),
  }).strict(),

  z.object({
    action: z.literal('set-item-animation'),
    uuid: z.string().min(1),
    animation: AnimationPayload,
    // Required true when animation.macro.enable === true (handler enforces).
    confirmedMacro: z.boolean().optional(),
  }).strict(),

  z.object({
    action: z.literal('clear-item-animation'),
    uuid: z.string().min(1),
    confirm: z.boolean().optional(), // CONFIRM-GATE(clear-item-animation):
  }).strict(),

  // ── Discovery (read-only, DEPENDENCY_GATED on aa.ready) ───────────────────
  z.object({
    action: z.literal('list-animations'),
    dbSection: DbSection.optional(),
    menuType: z.string().optional(),
  }).strict(),

  // ── Autorec world-config ─────────────────────────────────────────────────
  //
  // BUG-812(a): a parameterless call keeps returning the pre-fix counts-only shape
  // (CCR-7 — existing callers unaffected); supplying ANY of category/label/limit/offset
  // switches to a bounded, filtered, per-entry payload (boundList() paging, matching the
  // item-directory.ts filter->paginate->serialize recipe).
  z.object({
    action: z.literal('get-autorec'),
    category: AutorecCategory.optional(),
    label: z.string().min(1).optional(),
    // BUG-528-style bounding params (boundList pattern) — same limit/offset shape as
    // ItemDirectorySearchInput.
    limit: z.number().int().min(1).max(500).optional(),
    offset: z.number().int().min(0).optional(),
  }).strict(),

  z.object({
    action: z.literal('merge-autorec-entry'),
    category: AutorecCategory,
    label: z.string().min(1),
    animation: AnimationPayload,
    confirmedMacro: z.boolean().optional(),
  }).strict(),

  // BUG-812(c): patch a stored entry's label and/or animation by id, preserving the id.
  // NOTE: "at least one of label/animation" is enforced at the HANDLER layer, not via
  // `.refine()` here — zod's discriminatedUnion requires every branch to be a plain ZodObject;
  // `.refine()` returns ZodEffects, which breaks union membership (destination.ts:9-13 /
  // cards.ts:274-277 / document-io.ts:76-78 precedent — repeated constraint across this repo's
  // own schemas, not a one-off).
  z.object({
    action: z.literal('update-autorec-entry'),
    category: AutorecCategory,
    id: z.string().min(1),
    label: z.string().min(1).optional(),
    animation: AnimationPayload.optional(),
    confirmedMacro: z.boolean().optional(),
    confirm: z.boolean().optional(), // CONFIRM-GATE(update-autorec-entry):
  }).strict(),

  // BUG-812(c): remove a stored entry by id — direct game.settings.get/.set on
  // "aaAutorec-<category>", filtered/replaced by id (qa.md second research pass LAW; never
  // mergeMenus, which is add-only and silently no-ops on a reduced array).
  z.object({
    action: z.literal('remove-autorec-entry'),
    category: AutorecCategory,
    id: z.string().min(1),
    confirm: z.boolean().optional(), // CONFIRM-GATE(remove-autorec-entry):
  }).strict(),

  // ── Manual director play (GM + confirm) ──────────────────────────────────
  z.object({
    action: z.literal('play-animation'),
    sourceTokenUuid: z.string().min(1),
    itemUuid: z.string().optional(),
    itemName: z.string().optional(),
    targetUuids: z.array(z.string()).optional(),
    // BUG-366: optional so an omitted confirm parses and hits the runtime gate
    // (handlePlayAnimation → clean CONFIRM_REQUIRED) instead of surfacing a raw Zod
    // missing-field error. confirm:false and omit both route to the same clean token.
    confirm: z.boolean().optional(),
  }).strict(),
]);

export type ModuleAutoAnimationsInputType = z.infer<typeof ModuleAutoAnimationsInput>;
export type AnimationPayloadType = z.infer<typeof AnimationPayload>;
