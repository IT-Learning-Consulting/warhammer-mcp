// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 14 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-timekeeping
// (simple-timekeeping v1.1.5).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every variant rejects unknown top-level keys.
//
// 7 actions over the verified server-reachable surface (dossier thin-session.md §1.7):
//   reads:  get-time, list-events
//   GM writes: advance, set-time, advance-to, set-scene-sync, add-event
//
// Accessor: core `game.time` (advance/set/components/calendar) + world setting
// `simple-timekeeping.configuration`. No confirm gates — none of these are irreversible-destructive
// (advance/set-time mutate the world clock but are reversible by another set; GM-gated per CCR-4).
//
// Drift corrections baked into the handler (pre-plan §dossier-drift):
//   - Imperial Calendar feast days carry NO `intercalary:true` flag → month-name mapping enumerates
//     all 18 months.values[] by name, never filters intercalary.
//   - `configuration` is an opaque object → writes read+deep-merge (preserve secondsPerRound).
//   - advance-to at-target is a no-op → surfaced, not swallowed.
//
// Source: .agents/research/module_integration/phase14_pre_plan.md + dossiers/thin-session.md §1.

import { z } from 'zod';

const SyncMode = z.enum(['sync', 'darknessOnly', 'weatherOnly', 'noSync', 'default']);
const GlobalSyncMode = z.enum(['sync', 'darknessOnly', 'weatherOnly', 'noSync']);
const Repeat = z.enum(['day', 'week', 'month', 'year']);
const TimeOfDay = z.enum(['dawn', 'dusk', 'midday', 'midnight']);
const MacroTrigger = z.enum(['dawn', 'dusk', 'midday', 'newDay']);

export const ModuleTimekeepingInput = z.discriminatedUnion('action', [
  // ── Reads ─────────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('get-time'),
    })
    .strict(),
  z
    .object({
      action: z.literal('list-events'),
      includeExpired: z.boolean().optional(), // default false
      journalName: z.string().min(1).optional(),
    })
    .strict(),

  // ── GM writes ───────────────────────────────────────────────────────────────
  z
    .object({
      // Advance the world clock. seconds OR any of {minutes,hours,days} (summed). Negative = reverse.
      action: z.literal('advance'),
      seconds: z.number().int().optional(),
      minutes: z.number().optional(),
      hours: z.number().optional(),
      days: z.number().optional(),
    })
    .strict(),
  z
    .object({
      // Set absolute world time. worldTime (seconds, may be fractional) OR component fields.
      action: z.literal('set-time'),
      worldTime: z.number().optional(),
      year: z.number().int().optional(),
      month: z.union([z.string().min(1), z.number().int()]).optional(), // name or 0-indexed index
      dayOfMonth: z.number().int().optional(),
      hour: z.number().int().min(0).max(23).optional(),
      minute: z.number().int().min(0).max(59).optional(),
      second: z.number().int().min(0).max(59).optional(),
    })
    .strict(),
  z
    .object({
      // Jump to a named time of day. dawn/dusk default to 6h/18h unless overridden.
      action: z.literal('advance-to'),
      target: TimeOfDay,
      dawnHour: z.number().min(0).max(23.999).optional(),
      duskHour: z.number().min(0).max(23.999).optional(),
    })
    .strict(),
  z
    .object({
      // Per-scene darkness-sync mode flag.
      action: z.literal('set-scene-sync'),
      sceneId: z.string().min(1),
      sync: SyncMode,
    })
    .strict(),
  z
    .object({
      // Create a calendar event (JournalEntryPage in the events journal).
      action: z.literal('add-event'),
      name: z.string().min(1),
      eventTime: z.number().int(), // worldTime seconds
      eventEnd: z.number().int().optional(),
      repeat: Repeat.optional(),
      journalName: z.string().min(1).optional(),
    })
    .strict(),

  // ── Phase 14 full-functionality expansion ───────────────────────────────────
  z
    .object({
      action: z.literal('update-event'),
      pageUuid: z.string().min(1),
      name: z.string().min(1).optional(),
      eventTime: z.number().int().optional(),
      eventEnd: z.number().int().optional(),
      repeat: Repeat.optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('delete-event'),
      pageUuid: z.string().min(1),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'delete-event requires confirm:true (irreversibly deletes the event page)' }),
      }),
    })
    .strict(),
  z
    .object({ action: z.literal('get-config') })
    .strict(),
  z
    .object({
      action: z.literal('set-config'),
      changes: z.record(z.string(), z.any()),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'set-config requires confirm:true (deep-merges world configuration; can change calendar / secondsPerRound)' }),
      }),
    })
    .strict(),
  z
    .object({
      action: z.literal('activate-calendar'),
      calendar: z.string().min(1), // e.g. "imperial"
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'activate-calendar requires confirm:true (hot-swaps the world calendar)' }),
      }),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-clock-paused'),
      paused: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-darkness-sync-global'),
      sync: GlobalSyncMode,
    })
    .strict(),
  z
    .object({
      action: z.literal('set-weather'),
      label: z.string(),
      color: z.string().optional(),
      weatherEffect: z.string().optional(), // core scene.weather effect id, or "" to clear
      sceneId: z.string().optional(), // if set, also write scene.weather on this scene
    })
    .strict(),
  z
    .object({
      action: z.literal('generate-weather'),
      latitude: z.number().optional(),
      dayOfYear: z.number().int().optional(),
      seasonIndex: z.number().int().optional(),
      apply: z.boolean().optional(), // also set the weather badge
    })
    .strict(),
  z
    .object({
      action: z.literal('set-moon-badge'),
      label: z.string(),
      color: z.string().optional(),
      tooltip: z.string().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-custom-badge'),
      badgeId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      label: z.string().optional(),
      color: z.string().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-macro-triggers'),
      trigger: MacroTrigger,
      op: z.enum(['add', 'remove']),
      macroUuid: z.string().min(1),
    })
    .strict(),
]);

export type ModuleTimekeepingInputType = z.infer<typeof ModuleTimekeepingInput>;
