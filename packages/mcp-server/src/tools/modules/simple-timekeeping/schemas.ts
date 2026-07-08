// Module Integration v1 Phase 14 — module-timekeeping mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

import { SceneId } from '@foundry-mcp/shared';

export interface MoonPhase {
  phase: string;
  cycleDay: number;
}

export interface TimeResult {
  worldTime: number;
  components: Record<string, unknown>;
  dateText: string;
  dayTimePercent: number;
  season?: string | number;
  mannslieb: MoonPhase;
  morrslieb: MoonPhase;
  paused: boolean;
  activeCalendar?: string;
  note: string;
  // advance / set-time / advance-to add these:
  previousWorldTime?: number;
  advancedSeconds?: number;
  target?: string;
  noOp?: boolean;
  message?: string;
}

export interface CalendarEvent {
  name: string;
  pageUuid: string;
  journalName: string;
  eventTime: number;
  eventEnd?: number;
  repeat?: string;
  daysToEvent: number;
  expired: boolean;
}

export interface ListEventsResult {
  count: number;
  events: CalendarEvent[];
}

export interface SetSceneSyncResult {
  sceneId: SceneId;
  sceneName: string;
  darknessSync: string;
}

export interface AddEventResult {
  pageUuid: string;
  journalName: string;
  name: string;
  eventTime: number;
  eventEnd?: number;
  repeat?: string;
  daysToEvent: number;
}

// Phase 14 full-functionality expansion — generic structured results.
export interface GetConfigResult {
  configuration: Record<string, unknown>;
  paused: boolean;
  activeCalendar?: string;
}

export interface ActivateCalendarResult {
  calendar: string;
  activeCalendarId?: string; // not a branded id (polymorphic / non-document)
  monthCount?: number;
  // BUG-501 (Wave 2): rendered into text — "live" only for the custom calendar;
  // presets apply "on-reload". indicatorCaveat documents the session-scoped indicator.
  applied?: 'live' | 'on-reload';
  note?: string;
  indicatorCaveat?: string;
}

export interface GenericOkResult {
  [k: string]: unknown;
}
