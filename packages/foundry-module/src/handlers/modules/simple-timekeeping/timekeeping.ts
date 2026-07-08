// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 14 — module-timekeeping handler (simple-timekeeping v1.1.5).
//
// Always-registered umbrella. requireModuleActive('simple-timekeeping') is the FIRST executable
// statement — RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase-1 carry-forward).
//
// 7 actions over the verified server-reachable surface (dossier thin-session.md §1.7):
//   reads:  get-time, list-events
//   GM writes: advance, set-time, advance-to, set-scene-sync, add-event
//
// Accessor (pre-plan §accessor): core `game.time` (advance/set/worldTime/components/calendar) +
// world setting `simple-timekeeping.configuration`. `ui.simpleTimekeeping.advanceToTimePercent` is a
// UI-instance method; we DON'T depend on it — advance-to computes the day-fraction delta server-side.
//
// Drift corrections (pre-plan §dossier-drift, verified vs live source):
//   #2 Imperial Calendar feast days carry NO `intercalary:true` flag → set-time month-name mapping
//      enumerates ALL months.values[] by name, never filters intercalary.
//   No action writes `configuration` here, so the partial-set zero-defaults risk (§1.4) does not
//   arise; if a future action writes it, it MUST read+deep-merge (preserve secondsPerRound).
//   advance-to at-target (within 1% of the target fraction) is a no-op → surfaced, not swallowed (§1.6).
//
// Anchors: DP-15 (typed), DP-16 (post-write verify on scene-sync/add-event), CCR-3 (notify on writes),
// CCR-4 (GM-gated writes). Source: phase14_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { ModuleTimekeepingInput, type ModuleTimekeepingInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { SIMPLE_TIMEKEEPING as MODULE_ID } from '../../../constants/moduleIds.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';


const SECONDS_PER_DAY = 86400;

// Imperial Calendar moon cycles (days). Phase is best-effort from worldTime day-count (offset-naive).
const MANNSLIEB_CYCLE = 25;
const MORRSLIEB_CYCLE = 15;
const MOON_PHASES = [
  'New',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

// ── Local helpers ──────────────────────────────────────────────────────────────

function gameTime(): any {
  const t = (globalThis as any).game?.time;
  if (!t) throw new Error('TIMEKEEPING_TIME_UNAVAILABLE: game.time is not available');
  return t;
}

/** Current world time (integer seconds since the calendar epoch). */
function worldTime(): number {
  return Number(gameTime().worldTime ?? 0);
}

/** Decompose a timestamp into calendar components (defensive — prefers live getter for "now"). */
function componentsAt(ts: number): any {
  const t = gameTime();
  const now = worldTime();
  if (ts === now && t.components) return t.components;
  const cal = t.calendar;
  if (cal?.timeToComponents) return cal.timeToComponents(ts);
  return t.components ?? {};
}

/** Moon phase name from a worldTime + cycle length (offset-naive day-count). */
function moonPhase(ts: number, cycleLength: number): { phase: string; cycleDay: number } {
  const day = Math.floor(ts / SECONDS_PER_DAY);
  const cycleDay = ((day % cycleLength) + cycleLength) % cycleLength;
  const idx = Math.floor((cycleDay / cycleLength) * MOON_PHASES.length) % MOON_PHASES.length;
  return { phase: MOON_PHASES[idx]!, cycleDay };
}

/** Best-effort human date text from components + calendar month/weekday names. */
function dateText(c: any): string {
  if (!c) return '(unknown)';
  const cal = gameTime().calendar;
  const monthName =
    cal?.months?.values?.[c.month]?.name ?? (c.month != null ? `Month ${Number(c.month) + 1}` : '?');
  const weekday =
    cal?.days?.values?.[c.dayOfWeek]?.name ?? (c.dayOfWeek != null ? `Day ${c.dayOfWeek}` : '');
  const day = (c.dayOfMonth ?? c.day ?? 0) + 1;
  const hh = String(c.hour ?? 0).padStart(2, '0');
  const mm = String(c.minute ?? 0).padStart(2, '0');
  const wk = weekday ? `${weekday}, ` : '';
  return `${wk}${day} ${monthName} ${c.year ?? '?'} — ${hh}:${mm}`;
}

interface TimeResult {
  worldTime: number;
  components: any;
  dateText: string;
  dayTimePercent: number;
  season: string | number | undefined;
  mannslieb: { phase: string; cycleDay: number };
  morrslieb: { phase: string; cycleDay: number };
  paused: boolean;
  activeCalendar: string | undefined;
  note: string;
}

/** Read the opaque world configuration object. */
function readConfig(): any {
  return (globalThis as any).game?.settings?.get?.(MODULE_ID, 'configuration') ?? {};
}

/** Deep-merge changes into the configuration and write back (preserves secondsPerRound + all defaults). */
async function writeConfig(changes: Record<string, unknown>): Promise<any> {
  const current = readConfig();
  const mergeObject = (globalThis as any).foundry?.utils?.mergeObject;
  const merged = mergeObject ? mergeObject(current, changes, { inplace: false }) : { ...current, ...changes };
  await (globalThis as any).game.settings.set(MODULE_ID, 'configuration', merged);
  return merged;
}

/**
 * Apply the selected calendar. The module's `setCalendarJSON` is NOT server-reachable — it lives in a
 * circularly-imported ESM module (main.js ↔ config.js); a dynamic re-import re-evaluates it and hits a
 * temporal-dead-zone crash. So we write the `configuration.calendar` setting (persisted) and, for the
 * `custom` calendar whose definition is inline JSON, swap CONFIG.time.worldCalendarConfig live; other
 * presets apply on the next world reload (the module reads configuration.calendar on init).
 */
async function applyCalendar(calendarId: string): Promise<{ applied: 'live' | 'on-reload'; note?: string }> {
  const cfg = readConfig();
  const CONFIG = (globalThis as any).CONFIG;
  const gameTimeApi = (globalThis as any).game?.time;
  if (calendarId === 'custom' && typeof cfg?.customCalendar === 'string' && CONFIG?.time) {
    try {
      const parsed = JSON.parse(cfg.customCalendar);
      CONFIG.time.worldCalendarConfig = parsed;
      if (typeof gameTimeApi?.initializeCalendar === 'function') await gameTimeApi.initializeCalendar();
      return { applied: 'live' };
    } catch {
      /* fall through to reload note */
    }
  }
  return {
    applied: 'on-reload',
    note: `Calendar "${calendarId}" written to configuration; it applies on the next world reload (live hot-swap of module-preset calendars is not server-reachable).`,
  };
}

function buildTimeResult(ts: number): TimeResult {
  const c = componentsAt(ts);
  const secondsIntoDay = ((ts % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;
  const cfg = readConfig();
  return {
    worldTime: ts,
    components: c,
    dateText: dateText(c),
    dayTimePercent: secondsIntoDay / SECONDS_PER_DAY,
    season: c?.season,
    mannslieb: moonPhase(ts, MANNSLIEB_CYCLE),
    morrslieb: moonPhase(ts, MORRSLIEB_CYCLE),
    paused: Boolean((globalThis as any).game?.settings?.get?.(MODULE_ID, 'paused')),
    activeCalendar: (globalThis as any).CONFIG?.time?.worldCalendarConfig?.id ?? cfg?.calendar,
    note: 'Darkness sync only updates scenes currently active/viewed on the GM client (§1.5). Moon phases are offset-naive day-count estimates.',
  };
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set([
  'advance', 'set-time', 'advance-to', 'set-scene-sync', 'add-event',
  'update-event', 'delete-event', 'set-config', 'activate-calendar', 'set-clock-paused',
  'set-darkness-sync-global', 'set-weather', 'generate-weather', 'set-moon-badge', 'set-custom-badge',
  'set-macro-triggers',
]);

export async function dispatchModuleTimekeeping(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws (carry-forward).
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModuleTimekeepingInputType;
  try {
    input = ModuleTimekeepingInput.parse(data);
  } catch (e) {
    return { success: false, error: `TIMEKEEPING_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `TIMEKEEPING_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'get-time':
        return await handleGetTime(input);
      case 'list-events':
        return await handleListEvents(input);
      case 'advance':
        return await handleAdvance(input);
      case 'set-time':
        return await handleSetTime(input);
      case 'advance-to':
        return await handleAdvanceTo(input);
      case 'set-scene-sync':
        return await handleSetSceneSync(input);
      case 'add-event':
        return await handleAddEvent(input);
      case 'update-event':
        return await handleUpdateEvent(input);
      case 'delete-event':
        return await handleDeleteEvent(input);
      case 'get-config':
        return await handleGetConfig(input);
      case 'set-config':
        return await handleSetConfig(input);
      case 'activate-calendar':
        return await handleActivateCalendar(input);
      case 'set-clock-paused':
        return await handleSetClockPaused(input);
      case 'set-darkness-sync-global':
        return await handleSetDarknessSyncGlobal(input);
      case 'set-weather':
        return await handleSetWeather(input);
      case 'generate-weather':
        return await handleGenerateWeather(input);
      case 'set-moon-badge':
        return await handleSetMoonBadge(input);
      case 'set-custom-badge':
        return await handleSetCustomBadge(input);
      case 'set-macro-triggers':
        return await handleSetMacroTriggers(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `TIMEKEEPING_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `TIMEKEEPING_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Reads ───────────────────────────────────────────────────────────────────────

type GetTimeInput = Extract<ModuleTimekeepingInputType, { action: 'get-time' }>;
async function handleGetTime(_input: GetTimeInput): Promise<Envelope<unknown>> {
  return { success: true, data: buildTimeResult(worldTime()) };
}

type ListEventsInput = Extract<ModuleTimekeepingInputType, { action: 'list-events' }>;
async function handleListEvents(input: ListEventsInput): Promise<Envelope<unknown>> {
  const now = worldTime();
  const out: any[] = [];
  const journals = (globalThis as any).game?.journal?.contents ?? [];
  for (const je of journals) {
    if (input.journalName && je.name !== input.journalName) continue;
    const pages = je.pages?.contents ?? je.pages ?? [];
    for (const page of pages) {
      const ev = page.getFlag?.(MODULE_ID, 'eventTime');
      if (ev == null) continue;
      const eventTime = Number(ev);
      const eventEnd = page.getFlag?.(MODULE_ID, 'eventEnd');
      const repeat = page.getFlag?.(MODULE_ID, 'repeat');
      const expired = eventEnd != null ? Number(eventEnd) < now : eventTime < now;
      if (expired && !input.includeExpired) continue;
      out.push({
        name: page.name,
        pageUuid: page.uuid,
        journalName: je.name,
        eventTime,
        eventEnd: eventEnd != null ? Number(eventEnd) : undefined,
        repeat: repeat ?? undefined,
        daysToEvent: Math.round(((eventTime - now) / SECONDS_PER_DAY) * 10) / 10,
        expired,
      });
    }
  }
  out.sort((a, b) => a.eventTime - b.eventTime);
  return { success: true, data: { count: out.length, events: out } };
}

// ── Writes ─────────────────────────────────────────────────────────────────────

type AdvanceInput = Extract<ModuleTimekeepingInputType, { action: 'advance' }>;
async function handleAdvance(input: AdvanceInput): Promise<Envelope<unknown>> {
  if (input.seconds === undefined && input.minutes === undefined && input.hours === undefined && input.days === undefined) {
    return { success: false, error: 'TIMEKEEPING_INVALID_INPUT: advance requires at least one of seconds / minutes / hours / days' };
  }
  const delta =
    (input.seconds ?? 0) +
    (input.minutes ?? 0) * 60 +
    (input.hours ?? 0) * 3600 +
    (input.days ?? 0) * SECONDS_PER_DAY;
  const before = worldTime();
  await gameTime().advance(Math.round(delta));
  const after = worldTime();
  notify.updated('timekeeping', 'world time', {
    summary: `advanced ${Math.round(delta)}s (${before} → ${after})`,
  });
  return { success: true, data: { ...buildTimeResult(after), advancedSeconds: Math.round(delta), previousWorldTime: before } };
}

type SetTimeInput = Extract<ModuleTimekeepingInputType, { action: 'set-time' }>;
async function handleSetTime(input: SetTimeInput): Promise<Envelope<unknown>> {
  if (
    input.worldTime === undefined &&
    input.year === undefined &&
    input.month === undefined &&
    input.dayOfMonth === undefined &&
    input.hour === undefined &&
    input.minute === undefined &&
    input.second === undefined
  ) {
    return { success: false, error: 'TIMEKEEPING_INVALID_INPUT: set-time requires worldTime OR at least one component (year/month/dayOfMonth/hour/minute)' };
  }
  const before = worldTime();
  let target: number;

  if (input.worldTime !== undefined) {
    target = input.worldTime;
  } else {
    // Component path — start from current components, overlay provided fields.
    const cur = { ...componentsAt(before) };
    if (input.year !== undefined) cur.year = input.year;
    if (input.month !== undefined) cur.month = resolveMonthIndex(input.month);
    if (input.dayOfMonth !== undefined) cur.dayOfMonth = input.dayOfMonth;
    if (input.hour !== undefined) cur.hour = input.hour;
    if (input.minute !== undefined) cur.minute = input.minute;
    if (input.second !== undefined) cur.second = input.second;
    const cal = gameTime().calendar;
    if (!cal?.componentsToTime) {
      return { success: false, error: 'TIMEKEEPING_CALENDAR_UNAVAILABLE: game.time.calendar.componentsToTime is not available; pass worldTime instead' };
    }
    // BUG-493 (Wave 2): componentsToTime derives worldTime from `day` (the DAY-OF-YEAR
    // ordinal — TimeComponents.day, foundry_docs/data/interfaces/types.TimeComponents.md),
    // treating month/dayOfMonth as derived OUTPUT fields it ignores — which is why the
    // live 6-probe matrix showed year/hour/minute/second moving the clock while
    // month/dayOfMonth silently no-oped. Recompute `day` from the overlaid
    // month/dayOfMonth so those components actually land.
    if (input.month !== undefined || input.dayOfMonth !== undefined) {
      const months: any[] = cal.months?.values ?? [];
      if (months.length === 0) {
        return { success: false, error: 'TIMEKEEPING_CALENDAR_UNAVAILABLE: active calendar defines no months; pass worldTime instead' };
      }
      const targetMonth = Number(cur.month ?? 0);
      const dayOfMonth = Number(cur.dayOfMonth ?? 0);
      const isLeap = Boolean(cur.leapYear);
      const monthDays = (m: any): number => Number((isLeap ? m?.leapDays ?? m?.days : m?.days) ?? 0);
      const monthDef = months[targetMonth];
      if (!monthDef) {
        return { success: false, error: `TIMEKEEPING_MONTH_NOT_FOUND: month index ${targetMonth} out of range (calendar has ${months.length} months)` };
      }
      if (dayOfMonth < 0 || dayOfMonth >= monthDays(monthDef)) {
        return {
          success: false,
          error: `TIMEKEEPING_INVALID_INPUT: dayOfMonth ${dayOfMonth} out of range for ${monthDef.name ?? `month ${targetMonth}`} (0-based; month has ${monthDays(monthDef)} days)`,
        };
      }
      let dayOfYear = 0;
      for (let i = 0; i < targetMonth; i++) dayOfYear += monthDays(months[i]);
      cur.day = dayOfYear + dayOfMonth;
    }
    target = cal.componentsToTime(cur);
  }

  await gameTime().set(target);
  const after = worldTime();
  notify.updated('timekeeping', 'world time', { summary: `set to ${after} (${dateText(componentsAt(after))})` });
  return { success: true, data: { ...buildTimeResult(after), previousWorldTime: before } };
}

/** Map a month NAME or index to its 0-based index — enumerates ALL months.values[], never filters intercalary (drift #2). */
function resolveMonthIndex(month: string | number): number {
  if (typeof month === 'number') return month;
  const values = gameTime().calendar?.months?.values ?? [];
  const needle = month.toLowerCase();
  for (let i = 0; i < values.length; i++) {
    const m = values[i];
    if (String(m?.name ?? '').toLowerCase() === needle || String(m?.abbreviation ?? '').toLowerCase() === needle) {
      return i;
    }
  }
  throw new Error(`TIMEKEEPING_MONTH_NOT_FOUND: no month named "${month}" in the active calendar (${values.length} months)`);
}

type AdvanceToInput = Extract<ModuleTimekeepingInputType, { action: 'advance-to' }>;
async function handleAdvanceTo(input: AdvanceToInput): Promise<Envelope<unknown>> {
  const before = worldTime();
  const cfg = readConfig();
  // Effective dawn/dusk: explicit override → module configuration fraction → 6h/18h fallback.
  const dawnFrac = input.dawnHour !== undefined ? input.dawnHour / 24 : typeof cfg?.dawn === 'number' ? cfg.dawn : 6 / 24;
  const duskFrac = input.duskHour !== undefined ? input.duskHour / 24 : typeof cfg?.dusk === 'number' ? cfg.dusk : 18 / 24;
  const targetFrac =
    input.target === 'midnight' ? 0 : input.target === 'dawn' ? dawnFrac : input.target === 'midday' ? 0.5 : duskFrac;

  const curFrac = (((before % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY) / SECONDS_PER_DAY;
  let deltaFrac = ((targetFrac - curFrac) % 1 + 1) % 1; // forward to next occurrence in [0,1)

  // At-target no-op: within 1% of the target fraction (matches the module's advanceToTimePercent boundary §1.6).
  const atTarget = deltaFrac < 0.01 || deltaFrac > 0.99;
  if (atTarget) {
    return {
      success: true,
      data: {
        ...buildTimeResult(before),
        target: input.target,
        noOp: true,
        message: `Already at ${input.target} (within 1% of target) — no advance performed.`,
      },
    };
  }

  const advanceSeconds = Math.round(deltaFrac * SECONDS_PER_DAY);
  await gameTime().advance(advanceSeconds);
  const after = worldTime();
  notify.updated('timekeeping', 'world time', { summary: `advanced to ${input.target} (+${advanceSeconds}s)` });
  return { success: true, data: { ...buildTimeResult(after), target: input.target, noOp: false, advancedSeconds: advanceSeconds, previousWorldTime: before } };
}

type SetSceneSyncInput = Extract<ModuleTimekeepingInputType, { action: 'set-scene-sync' }>;
async function handleSetSceneSync(input: SetSceneSyncInput): Promise<Envelope<unknown>> {
  const scene = (globalThis as any).game?.scenes?.get(input.sceneId);
  if (!scene) return { success: false, error: `TIMEKEEPING_SCENE_NOT_FOUND: no scene "${input.sceneId}"` };
  await scene.setFlag(MODULE_ID, 'darknessSync', input.sync);
  // DP-16 — post-write verify.
  const persisted = scene.getFlag(MODULE_ID, 'darknessSync');
  if (persisted !== input.sync) {
    return { success: false, error: `${ErrorTokens.TIMEKEEPING_SYNC_NOT_PERSISTED}: read back "${persisted}" after writing "${input.sync}"` };
  }
  notify.updated('timekeeping', scene.name, { summary: `darknessSync = ${input.sync}` });
  return { success: true, data: { sceneId: input.sceneId, sceneName: scene.name, darknessSync: persisted } };
}

type AddEventInput = Extract<ModuleTimekeepingInputType, { action: 'add-event' }>;
async function handleAddEvent(input: AddEventInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  // Prefer the journal that already holds simple-timekeeping events; else the named one; else create one.
  let journal: any;
  if (input.journalName) {
    journal = game?.journal?.contents?.find((j: any) => j.name === input.journalName);
  }
  if (!journal) {
    journal = game?.journal?.contents?.find((j: any) =>
      (j.pages?.contents ?? []).some((p: any) => p.getFlag?.(MODULE_ID, 'eventTime') != null),
    );
  }
  if (!journal) {
    // Consult the module's configured events journal name before falling back.
    const configuredName = readConfig()?.journalEntryEvents;
    if (configuredName) journal = game?.journal?.contents?.find((j: any) => j.name === configuredName);
  }
  if (!journal) {
    const JE = (globalThis as any).CONFIG?.JournalEntry?.documentClass ?? (globalThis as any).JournalEntry;
    journal = await JE.create({ name: input.journalName ?? readConfig()?.journalEntryEvents ?? 'Calendar Events' });
  }
  if (!journal) return { success: false, error: 'TIMEKEEPING_EVENTS_JOURNAL_UNAVAILABLE: could not resolve or create an events journal' };

  const [page] = await journal.createEmbeddedDocuments('JournalEntryPage', [
    {
      name: input.name,
      type: 'text',
      text: { content: `<p>${input.name}</p>` },
      flags: {
        [MODULE_ID]: {
          eventTime: input.eventTime,
          ...(input.eventEnd !== undefined ? { eventEnd: input.eventEnd } : {}),
          ...(input.repeat !== undefined ? { repeat: input.repeat } : {}),
        },
      },
    },
  ]);
  if (!page) return { success: false, error: 'TIMEKEEPING_EVENT_NOT_CREATED: JournalEntryPage was not created' };
  // DP-16 — verify the flag round-trip.
  const persistedTime = page.getFlag(MODULE_ID, 'eventTime');
  if (Number(persistedTime) !== input.eventTime) {
    return { success: false, error: `${ErrorTokens.TIMEKEEPING_EVENT_FLAG_NOT_PERSISTED}: read back ${persistedTime} after writing ${input.eventTime}` };
  }
  notify.created('timekeeping', input.name, { summary: `event @ worldTime ${input.eventTime}` });
  return {
    success: true,
    data: {
      pageUuid: page.uuid,
      journalName: journal.name,
      name: input.name,
      eventTime: input.eventTime,
      eventEnd: input.eventEnd,
      repeat: input.repeat,
      daysToEvent: Math.round(((input.eventTime - worldTime()) / SECONDS_PER_DAY) * 10) / 10,
    },
  };
}

// ── Phase 14 full-functionality handlers ──────────────────────────────────────

type UpdateEventInput = Extract<ModuleTimekeepingInputType, { action: 'update-event' }>;
async function handleUpdateEvent(input: UpdateEventInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `TIMEKEEPING_EVENT_NOT_FOUND: ${input.pageUuid}` };
  const flagChanges: Record<string, unknown> = {};
  if (input.eventTime !== undefined) flagChanges.eventTime = input.eventTime;
  if (input.eventEnd !== undefined) flagChanges.eventEnd = input.eventEnd;
  if (input.repeat !== undefined) flagChanges.repeat = input.repeat;
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (Object.keys(flagChanges).length) updateData[`flags.${MODULE_ID}`] = flagChanges;
  await page.update(updateData);
  notify.updated('timekeeping', page.name, { summary: 'event updated' });
  return { success: true, data: { pageUuid: input.pageUuid, name: page.name, updated: Object.keys(updateData) } };
}

type DeleteEventInput = Extract<ModuleTimekeepingInputType, { action: 'delete-event' }>;
async function handleDeleteEvent(input: DeleteEventInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `TIMEKEEPING_EVENT_NOT_FOUND: ${input.pageUuid}` };
  const name = page.name;
  await page.delete();
  notify.deleted('timekeeping', name, { summary: 'event deleted' });
  return { success: true, data: { pageUuid: input.pageUuid, name, deleted: true } };
}

type GetConfigInput = Extract<ModuleTimekeepingInputType, { action: 'get-config' }>;
async function handleGetConfig(_input: GetConfigInput): Promise<Envelope<unknown>> {
  const cfg = readConfig();
  return {
    success: true,
    data: {
      configuration: cfg,
      paused: Boolean((globalThis as any).game?.settings?.get?.(MODULE_ID, 'paused')),
      activeCalendar: (globalThis as any).CONFIG?.time?.worldCalendarConfig?.id ?? cfg?.calendar,
    },
  };
}

type SetConfigInput = Extract<ModuleTimekeepingInputType, { action: 'set-config' }>;
async function handleSetConfig(input: SetConfigInput): Promise<Envelope<unknown>> {
  const merged = await writeConfig(input.changes);
  let calendarApply: { applied: 'live' | 'on-reload'; note?: string } | undefined;
  if ('calendar' in input.changes || 'customCalendar' in input.changes) {
    calendarApply = await applyCalendar(String(input.changes.calendar ?? merged.calendar ?? 'custom'));
  }
  notify.updated('timekeeping', 'configuration', { summary: `merged ${Object.keys(input.changes).join(', ')}` });
  return { success: true, data: { changed: Object.keys(input.changes), calendarApplied: calendarApply?.applied, calendarNote: calendarApply?.note, secondsPerRound: merged.secondsPerRound } };
}

// BUG-501 (Wave 2) fallback preset list — source-verified against the installed
// module's scripts/calendars.js (15 preset ids); used only when the runtime
// CALENDARS static (SimpleTimekeeping app class, main.js:20) is unreachable.
const FALLBACK_CALENDAR_PRESET_IDS = [
  'gregorian', 'harptos', 'barovian', 'galifar', 'golarion', 'thyatian', 'commonyear',
  'athasian', 'drag_solamnia', 'ansalon', 'cerilian', 'exandrian', 'drakkenheim',
  'imperial', 'forbiddenlands',
];

type ActivateCalendarInput = Extract<ModuleTimekeepingInputType, { action: 'activate-calendar' }>;
// BUG-501 KNOWN LIMITATION (documented, not engineered around — plan D8): the
// `activeCalendar` indicator in get-time/`buildTimeResult` reads
// CONFIG.time.worldCalendarConfig.id, which flips IMMEDIATELY on any activate even
// when applied:'on-reload', and cannot be restored in-session (re-activating the
// original id or set-config only fixes the PERSISTED setting). The indicator is
// session-scoped-until-reload; the functional time math is unaffected.
async function handleActivateCalendar(input: ActivateCalendarInput): Promise<Envelope<unknown>> {
  // BUG-501 (Wave 2): validate the preset id BEFORE any write — pre-fix, a bogus id
  // "succeeded" (applied:'on-reload') and one-way-flipped the session indicator.
  // Decision (plan D8): the phantom TIMEKEEPING_CALENDAR_SWAP_UNAVAILABLE token is
  // DELETED from the docs (Phase 3 re-sync); unknown presets fail with
  // TIMEKEEPING_CALENDAR_UNKNOWN_PRESET.
  const runtimeCalendars: any[] =
    (globalThis as any).ui?.simpleTimekeeping?.constructor?.CALENDARS ?? [];
  const knownIds: string[] = runtimeCalendars.length > 0
    ? runtimeCalendars.map((c: any) => String(c?.id ?? '')).filter((s: string) => s.length > 0)
    : FALLBACK_CALENDAR_PRESET_IDS;
  if (input.calendar !== 'custom' && !knownIds.includes(input.calendar)) {
    return {
      success: false,
      error:
        `TIMEKEEPING_CALENDAR_UNKNOWN_PRESET: "${input.calendar}" is not a known calendar preset. ` +
        `Known presets: ${[...knownIds, 'custom'].join(', ')}`,
    };
  }

  await writeConfig({ calendar: input.calendar });
  const apply = await applyCalendar(input.calendar);
  const active = (globalThis as any).CONFIG?.time?.worldCalendarConfig;
  notify.updated('timekeeping', input.calendar, { summary: `calendar ${apply.applied === 'live' ? 'activated' : 'queued (reload)'}` });
  return {
    success: true,
    data: {
      calendar: input.calendar,
      applied: apply.applied,
      note: apply.note,
      activeCalendarId: active?.id,
      monthCount: active?.months?.values?.length,
      indicatorCaveat:
        'activeCalendarId reflects the session indicator, which flips immediately and is session-scoped-until-reload; the persisted setting is `calendar`.',
    },
  };
}

type SetClockPausedInput = Extract<ModuleTimekeepingInputType, { action: 'set-clock-paused' }>;
async function handleSetClockPaused(input: SetClockPausedInput): Promise<Envelope<unknown>> {
  await (globalThis as any).game.settings.set(MODULE_ID, 'paused', input.paused);
  const persisted = Boolean((globalThis as any).game?.settings?.get?.(MODULE_ID, 'paused'));
  notify.updated('timekeeping', 'auto-clock', { summary: input.paused ? 'paused' : 'unpaused' });
  return { success: true, data: { paused: persisted } };
}

type SetDarknessGlobalInput = Extract<ModuleTimekeepingInputType, { action: 'set-darkness-sync-global' }>;
async function handleSetDarknessSyncGlobal(input: SetDarknessGlobalInput): Promise<Envelope<unknown>> {
  await writeConfig({ darknessSync: input.sync });
  notify.updated('timekeeping', 'global darkness sync', { summary: input.sync });
  return { success: true, data: { darknessSync: input.sync } };
}

type SetWeatherInput = Extract<ModuleTimekeepingInputType, { action: 'set-weather' }>;
async function handleSetWeather(input: SetWeatherInput): Promise<Envelope<unknown>> {
  const changes: Record<string, unknown> = { weatherLabel: input.label };
  if (input.color !== undefined) changes.weatherColor = input.color;
  await writeConfig(changes);
  let sceneWeather: string | undefined;
  if (input.sceneId && input.weatherEffect !== undefined) {
    const scene = (globalThis as any).game?.scenes?.get(input.sceneId);
    if (!scene) return { success: false, error: `TIMEKEEPING_SCENE_NOT_FOUND: ${input.sceneId}` };
    await scene.update({ weather: input.weatherEffect });
    sceneWeather = input.weatherEffect;
  }
  notify.updated('timekeeping', 'weather', { summary: input.label });
  return { success: true, data: { label: input.label, color: input.color, sceneId: input.sceneId, sceneWeather } };
}

type GenerateWeatherInput = Extract<ModuleTimekeepingInputType, { action: 'generate-weather' }>;
async function handleGenerateWeather(input: GenerateWeatherInput): Promise<Envelope<unknown>> {
  const ui = (globalThis as any).ui?.simpleTimekeeping;
  if (!ui || typeof ui.generateWeather !== 'function') {
    return { success: false, error: 'TIMEKEEPING_WEATHER_GEN_UNAVAILABLE: ui.simpleTimekeeping.generateWeather is not available (GM client widget required); use set-weather to set a badge directly' };
  }
  const weather = ui.generateWeather(input.latitude, input.dayOfYear, input.seasonIndex);
  let applied = false;
  if (input.apply && weather) {
    await writeConfig({ weatherLabel: weather.label, weatherColor: weather.color });
    applied = true;
  }
  notify.updated('timekeeping', 'weather', { summary: applied ? `generated + applied: ${weather?.label}` : `generated: ${weather?.label}` });
  return { success: true, data: { weather, applied } };
}

type SetMoonBadgeInput = Extract<ModuleTimekeepingInputType, { action: 'set-moon-badge' }>;
async function handleSetMoonBadge(input: SetMoonBadgeInput): Promise<Envelope<unknown>> {
  const changes: Record<string, unknown> = { moonLabel: input.label, moonTooltip: input.tooltip ?? '' };
  if (input.color !== undefined) changes.moonColor = input.color;
  await writeConfig(changes);
  notify.updated('timekeeping', 'moon badge', { summary: input.label });
  // BUG-371: with moonAutomation on (the default) the module recomputes moonLabel from the moon
  // phase on the next config change/tick, so this manual label will not persist visibly. Warn the
  // caller rather than report a silent false success.
  const moonAutomation = Boolean(readConfig().moonAutomation);
  const warning = moonAutomation
    ? 'moonAutomation is ON: the module auto-recomputes the moon label from the moon phase, so this manual label will be overwritten. Set moonAutomation:false (via set-config) for the manual label to persist.'
    : undefined;
  return { success: true, data: { label: input.label, color: input.color, tooltip: input.tooltip, moonAutomation, warning } };
}

type SetCustomBadgeInput = Extract<ModuleTimekeepingInputType, { action: 'set-custom-badge' }>;
async function handleSetCustomBadge(input: SetCustomBadgeInput): Promise<Envelope<unknown>> {
  const key = `badge${input.badgeId - 1}`;
  const cfg = readConfig();
  const badge = { ...(cfg?.[key] ?? {}) };
  if (input.label !== undefined) badge.label = input.label;
  if (input.color !== undefined) badge.color = input.color;
  await writeConfig({ [key]: badge });
  notify.updated('timekeeping', `custom badge ${input.badgeId}`, { summary: input.label ?? '(color)' });
  return { success: true, data: { badgeId: input.badgeId, key, ...badge } };
}

type SetMacroTriggersInput = Extract<ModuleTimekeepingInputType, { action: 'set-macro-triggers' }>;
async function handleSetMacroTriggers(input: SetMacroTriggersInput): Promise<Envelope<unknown>> {
  const arrayKey = `${input.trigger}Macros`;
  const cfg = readConfig();
  const arr: string[] = Array.isArray(cfg?.[arrayKey]) ? [...cfg[arrayKey]] : [];
  if (input.op === 'add') {
    if (!arr.includes(input.macroUuid)) arr.push(input.macroUuid);
  } else {
    const i = arr.indexOf(input.macroUuid);
    if (i >= 0) arr.splice(i, 1);
  }
  await writeConfig({ [arrayKey]: arr });
  notify.updated('timekeeping', `${input.trigger} macros`, { summary: `${input.op} ${input.macroUuid}` });
  return { success: true, data: { trigger: input.trigger, arrayKey, op: input.op, macros: arr } };
}
