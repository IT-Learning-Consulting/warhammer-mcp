// Module Integration v1 Phase 14 — module-timekeeping mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

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
  sceneId: string;
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
  activeCalendarId?: string;
  monthCount?: number;
}

export interface GenericOkResult {
  [k: string]: unknown;
}
