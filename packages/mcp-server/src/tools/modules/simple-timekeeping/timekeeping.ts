// Module Integration v1 Phase 14 — module-timekeeping MCP tool (simple-timekeeping integration).
//
// Always-registered umbrella. The foundry-module handler guards on simple-timekeeping being active;
// when inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active simple-timekeeping to pre-flight.
//
// 19 actions: reads (get-time, list-events, get-config) + GM writes (advance, set-time,
// advance-to, set-scene-sync, add-event, update-event, set-clock-paused,
// set-darkness-sync-global, set-weather, generate-weather, set-moon-badge,
// set-custom-badge, set-macro-triggers) + confirm-gated (delete-event, set-config,
// activate-calendar).
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleTimekeepingInput } from '@foundry-mcp/shared';

type ModuleTimekeepingArgs = z.infer<typeof ModuleTimekeepingInput>;
import type {
  TimeResult,
  ListEventsResult,
  SetSceneSyncResult,
  AddEventResult,
  CalendarEvent,
  GetConfigResult,
  ActivateCalendarResult,
  GenericOkResult,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });


// ── Per-action formatters (surface every handler-returned field) ─────────────

function formatTime(d: TimeResult): string {
  const lines = [
    `module-timekeeping: ${d.dateText}`,
    `- worldTime: ${d.worldTime}${d.previousWorldTime !== undefined ? ` (was ${d.previousWorldTime})` : ''}`,
    `- dayTimePercent: ${(d.dayTimePercent * 100).toFixed(1)}% · season: ${d.season ?? '?'}`,
    `- Mannslieb: ${d.mannslieb.phase} (day ${d.mannslieb.cycleDay}) · Morrslieb: ${d.morrslieb.phase} (day ${d.morrslieb.cycleDay})`,
  ];
  if (d.advancedSeconds !== undefined) lines.push(`- advanced: ${d.advancedSeconds}s${d.target ? ` → ${d.target}` : ''}`);
  if (d.noOp) lines.push(`- NO-OP: ${d.message ?? 'already at target'}`);
  return lines.join('\n');
}

function evLine(e: CalendarEvent): string {
  const end = e.eventEnd !== undefined ? `–${e.eventEnd}` : '';
  const rep = e.repeat ? ` repeat=${e.repeat}` : '';
  const exp = e.expired ? ' [expired]' : '';
  return `  • ${e.name} @ ${e.eventTime}${end} (${e.daysToEvent}d)${rep}${exp} [${e.journalName}]`;
}

function formatEvents(d: ListEventsResult): string {
  if (!d.count) return 'module-timekeeping.list-events: no events.';
  return `module-timekeeping.list-events: ${d.count} event(s):\n${d.events.map(evLine).join('\n')}`;
}

function formatSceneSync(d: SetSceneSyncResult): string {
  return `module-timekeeping.set-scene-sync: "${d.sceneName}" darknessSync = ${d.darknessSync}`;
}

function formatAddEvent(d: AddEventResult): string {
  return [
    `module-timekeeping.add-event: ${d.name}`,
    `- page: \`${d.pageUuid}\` [${d.journalName}]`,
    `- eventTime: ${d.eventTime}${d.eventEnd !== undefined ? ` → ${d.eventEnd}` : ''} (${d.daysToEvent}d)${d.repeat ? ` repeat=${d.repeat}` : ''}`,
  ].join('\n');
}

function formatConfig(d: GetConfigResult): string {
  const keys = Object.keys(d.configuration ?? {}).length;
  return [
    `module-timekeeping.get-config: ${keys} configuration key(s)`,
    `- activeCalendar: ${d.activeCalendar ?? '?'} · auto-clock paused: ${d.paused}`,
    `- weather: ${(d.configuration as any)?.weatherLabel ?? '(none)'} · darknessSync: ${(d.configuration as any)?.darknessSync ?? '?'}`,
  ].join('\n');
}

function formatActivateCalendar(d: ActivateCalendarResult): string {
  // BUG-501 (Wave 2): render applied/note so the on-reload caveat is visible in text —
  // pre-fix a GM couldn't see that a preset only applies on the next world reload.
  const lines = [
    `module-timekeeping.activate-calendar: "${d.calendar}" — applied: ${d.applied ?? '?'} (indicator id=${d.activeCalendarId ?? '?'}, ${d.monthCount ?? '?'} months)`,
  ];
  if (d.note) lines.push(`- note: ${d.note}`);
  if (d.indicatorCaveat) lines.push(`- caveat: ${d.indicatorCaveat}`);
  return lines.join('\n');
}

function formatGeneric(action: string) {
  return (d: GenericOkResult): string => {
    const parts = Object.entries(d)
      .filter(([k]) => k !== 'note')
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
    return `module-timekeeping.${action}: ${parts.join(' · ')}`;
  };
}

export interface ModuleTimekeepingToolOptions extends BaseToolOptions {}

export class ModuleTimekeepingTool extends BaseTool {
  constructor(options: ModuleTimekeepingToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-timekeeping', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-timekeeping',
        title: 'Simple Timekeeping & Calendar integration',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate simple-timekeeping: advance/read the world clock, jump to a time of day, configure per-scene darkness sync, and manage calendar events. Built on core game.time + the Imperial Calendar.
Conditional: returns MODULE_NOT_ACTIVE when simple-timekeeping is absent/inactive.
Pre-flight: module-probe.is-active simple-timekeeping before using this tool.

19 actions:
Reads — get-time {} (worldTime, components, date text, dayTimePercent, season, Mannslieb/Morrslieb phase, activeCalendar); list-events { includeExpired?, journalName? }; get-config {} (the module's world configuration object).
GM writes — advance { seconds? | minutes? | hours? | days? } (negative = reverse; one required); set-time { worldTime? | year?, month? (name or 0-index), dayOfMonth?, hour?, minute?, second? } (month/dayOfMonth persist — the handler recomputes the day-of-year ordinal Foundry actually consumes, BUG-493; out-of-range dayOfMonth fails loud); advance-to { target: dawn|dusk|midday|midnight, dawnHour?, duskHour? } (surfaces a no-op when already at target); set-scene-sync { sceneId, sync: sync|darknessOnly|weatherOnly|noSync|default }; add-event { name, eventTime (worldTime seconds), eventEnd?, repeat?: day|week|month|year, journalName? }; update-event { pageUuid, name?, eventTime?, eventEnd?, repeat? }; set-clock-paused { paused }; set-darkness-sync-global { sync }; set-weather { label, color?, sceneId?, weatherEffect? }; generate-weather { latitude?, dayOfYear?, seasonIndex? } (GM-client widget required); set-moon-badge { … }; set-custom-badge { badgeId: 1|2|3, … }; set-macro-triggers { trigger: dawn|dusk|midday|newDay, op: add|remove, macroUuid }.
Confirm-gated writes — delete-event { pageUuid, confirm:true }; set-config { changes, confirm:true } (can change calendar/secondsPerRound); activate-calendar { calendar, confirm:true } (preset ids VALIDATED against the module's calendar list — unknown ids fail with TIMEKEEPING_CALENDAR_UNKNOWN_PRESET; response carries applied ("live" only for custom; presets apply "on-reload") + note + indicatorCaveat — the activeCalendar indicator flips immediately and is session-scoped-until-reload, BUG-501).

NOTE: advance/set-time mutate the LIVE world clock — capture get-time first if you intend to restore it. Darkness sync only updates scenes active/viewed on the GM client. Month-name set-time enumerates all calendar months (Imperial feast days have no intercalary flag).

Example: { action: "advance", hours: 4 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-time', 'list-events', 'advance', 'set-time', 'advance-to', 'set-scene-sync', 'add-event',
                'update-event', 'delete-event', 'get-config', 'set-config', 'activate-calendar', 'set-clock-paused',
                'set-darkness-sync-global', 'set-weather', 'generate-weather', 'set-moon-badge', 'set-custom-badge',
                'set-macro-triggers',
              ],
              description: 'Timekeeping action to perform.',
            },
            includeExpired: { type: 'boolean', description: 'list-events: include events whose time has passed (default false).' },
            journalName: { type: 'string', description: 'list-events: restrict to one journal. add-event: target journal (default the existing events journal or "Calendar Events").' },
            seconds: { type: 'number', description: 'advance: integer seconds (negative = reverse).' },
            minutes: { type: 'number', description: 'advance: minutes (summed with other units).' },
            hours: { type: 'number', description: 'advance: hours (summed).' },
            days: { type: 'number', description: 'advance: days (summed).' },
            worldTime: { type: 'number', description: 'set-time: absolute worldTime in integer seconds.' },
            year: { type: 'number', description: 'set-time: calendar year.' },
            month: { type: ['string', 'number'], description: 'set-time: month NAME (e.g. "Nachexen") or 0-based index.' },
            dayOfMonth: { type: 'number', description: 'set-time: 0-based day of month.' },
            hour: { type: 'number', description: 'set-time: hour 0-23.' },
            minute: { type: 'number', description: 'set-time: minute 0-59.' },
            second: { type: 'number', description: 'set-time: second 0-59.' },
            target: { type: 'string', enum: ['dawn', 'dusk', 'midday', 'midnight'], description: 'advance-to: time of day to jump to.' },
            dawnHour: { type: 'number', description: 'advance-to: dawn hour override (default 6).' },
            duskHour: { type: 'number', description: 'advance-to: dusk hour override (default 18).' },
            sceneId: { type: 'string', description: 'set-scene-sync: scene id.' },
            sync: { type: 'string', enum: ['sync', 'darknessOnly', 'weatherOnly', 'noSync', 'default'], description: 'set-scene-sync / set-darkness-sync-global: darkness-sync mode. set-time also accepts `second` (integer seconds) alongside year/month/dayOfMonth/hour/minute (BUG-514).' },
            name: { type: 'string', description: 'add-event/update-event: event name.' },
            eventTime: { type: 'number', description: 'add-event/update-event: event worldTime in seconds.' },
            eventEnd: { type: 'number', description: 'add-event/update-event: optional end worldTime.' },
            repeat: { type: 'string', enum: ['day', 'week', 'month', 'year'], description: 'add-event/update-event: optional recurrence.' },
            pageUuid: { type: 'string', description: 'update-event/delete-event: the event JournalEntryPage UUID.' },
            changes: { type: 'object', description: 'set-config: configuration keys to deep-merge (preserves all other defaults incl. secondsPerRound).' },
            calendar: { type: 'string', description: 'activate-calendar: calendar id (e.g. "imperial" for the WFRP Imperial Calendar).' },
            paused: { type: 'boolean', description: 'set-clock-paused: pause (true) / unpause (false) the auto-clock.' },
            label: { type: 'string', description: 'set-weather/set-moon-badge/set-custom-badge: badge label.' },
            color: { type: 'string', description: 'set-weather/set-moon-badge/set-custom-badge: hex color.' },
            weatherEffect: { type: 'string', description: 'set-weather: core scene.weather effect id (with sceneId); "" clears.' },
            tooltip: { type: 'string', description: 'set-moon-badge: tooltip text.' },
            badgeId: { type: 'number', enum: [1, 2, 3], description: 'set-custom-badge: which custom badge slot.' },
            latitude: { type: 'number', description: 'generate-weather: latitude override.' },
            dayOfYear: { type: 'number', description: 'generate-weather: day-of-year override.' },
            seasonIndex: { type: 'number', description: 'generate-weather: season index override.' },
            apply: { type: 'boolean', description: 'generate-weather: also set the weather badge.' },
            trigger: { type: 'string', enum: ['dawn', 'dusk', 'midday', 'newDay'], description: 'set-macro-triggers: which time-of-day macro array.' },
            op: { type: 'string', enum: ['add', 'remove'], description: 'set-macro-triggers: add or remove the macro UUID.' },
            macroUuid: { type: 'string', description: 'set-macro-triggers: the Macro UUID to add/remove.' },
            confirm: { type: 'boolean', description: 'Required (true) for delete-event, set-config, activate-calendar.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: ModuleTimekeepingArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-timekeeping action', { action });
    switch (action) {
      case 'get-time': return this.run<TimeResult>(action, rawArgs, formatTime);
      case 'advance': return this.run<TimeResult>(action, rawArgs, formatTime);
      case 'set-time': return this.run<TimeResult>(action, rawArgs, formatTime);
      case 'advance-to': return this.run<TimeResult>(action, rawArgs, formatTime);
      case 'list-events': return this.run<ListEventsResult>(action, rawArgs, formatEvents);
      case 'set-scene-sync': return this.run<SetSceneSyncResult>(action, rawArgs, formatSceneSync);
      case 'add-event': return this.run<AddEventResult>(action, rawArgs, formatAddEvent);
      case 'get-config': return this.run<GetConfigResult>(action, rawArgs, formatConfig);
      case 'activate-calendar': return this.run<ActivateCalendarResult>(action, rawArgs, formatActivateCalendar);
      case 'update-event':
      case 'delete-event':
      case 'set-config':
      case 'set-clock-paused':
      case 'set-darkness-sync-global':
      case 'set-weather':
      case 'generate-weather':
      case 'set-moon-badge':
      case 'set-custom-badge':
      case 'set-macro-triggers':
        return this.run<GenericOkResult>(action, rawArgs, formatGeneric(action));
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-timekeeping', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-timekeeping', msg);
      return this.errorResponse(action, msg);
    }
  }
}
