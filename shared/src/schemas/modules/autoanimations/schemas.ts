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
const VideoSlot = z.object({
  dbSection: DbSection.optional(),
  menuType: z.string().optional(),
  animation: z.string().optional(),
  variant: z.string().optional(),
  color: z.string().optional(),
  enableCustom: z.boolean().optional(),
  customPath: z.string().optional(),
}).strict();

// A sound slot.
const SoundSlot = z.object({
  enable: z.boolean().optional(),
  file: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
  delay: z.number().int().min(0).optional(),
  startTime: z.number().int().min(0).optional(),
  repeat: z.number().int().min(1).optional(),
  repeatDelay: z.number().int().min(0).optional(),
}).strict();

// An additional FX slot (secondary/source/target) — a video + optional sound + enable flag.
const FxSlot = z.object({
  enable: z.boolean().optional(),
  video: VideoSlot.optional(),
  sound: SoundSlot.optional(),
}).strict();

// The macro slot — gated behind confirmedMacro (dossier §5/§6).
const MacroSlot = z.object({
  enable: z.boolean().optional(),
  name: z.string().optional(),
  args: z.unknown().optional(),
  playWhen: z.enum(['0', '1', '2']).optional(),
}).strict();

// Melee→range auto-switch (dossier §3a meleeSwitch).
const MeleeSwitchSlot = z.object({
  video: VideoSlot.optional(),
  detect: z.enum(['automatic', 'manual']).optional(),
  range: z.number().int().min(0).optional(),
  isReturning: z.boolean().optional(),
  switchType: z.string().optional(),
}).strict();

// The simplified animation payload for set-item-animation / merge-autorec-entry.
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
}).strict();

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
  }).strict(),

  // ── Discovery (read-only, DEPENDENCY_GATED on aa.ready) ───────────────────
  z.object({
    action: z.literal('list-animations'),
    dbSection: DbSection.optional(),
    menuType: z.string().optional(),
  }).strict(),

  // ── Autorec world-config ─────────────────────────────────────────────────
  z.object({
    action: z.literal('get-autorec'),
  }).strict(),

  z.object({
    action: z.literal('merge-autorec-entry'),
    category: AutorecCategory,
    label: z.string().min(1),
    animation: AnimationPayload,
    confirmedMacro: z.boolean().optional(),
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
