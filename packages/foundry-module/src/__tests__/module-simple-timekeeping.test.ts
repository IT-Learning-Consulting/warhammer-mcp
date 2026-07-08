// Module Integration v1 Phase 14 — Unit test for module-timekeeping dispatcher (simple-timekeeping).
//
// Deterministic: mocks globalThis.game.modules + game.user + game.time (advance/set/worldTime/
// components/calendar) + game.scenes. No live Foundry. Branches:
//   - module inactive          → MODULE_NOT_ACTIVE
//   - non-GM on a write        → TIMEKEEPING_ACCESS_DENIED
//   - advance missing units    → TIMEKEEPING_INVALID_INPUT
//   - get-time happy           → worldTime/components/moon phases
//   - advance happy            → game.time.advance called, new worldTime returned
//   - advance-to at target     → noOp surfaced (NOT swallowed) (§1.6)
//   - set-time month NAME      → resolveMonthIndex enumerates all months (no intercalary filter, drift #2)
//   - set-scene-sync           → flag written + DP-16 read-back verified

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleTimekeeping } from '../handlers/modules/simple-timekeeping/timekeeping.js';

const SECONDS_PER_DAY = 86400;

// Imperial-like calendar: 4 months incl. a 1-day "feast" with NO intercalary flag (drift #2 fixture).
const CAL_MONTHS = [
  { name: 'Nachexen', days: 32 },
  { name: 'Hexenstag', days: 1 }, // feast day — no `intercalary` property
  { name: 'Jahrdrung', days: 33 },
  { name: 'Pflugzeit', days: 33 },
];

function makeTime(initial: number) {
  let wt = initial;
  return {
    get worldTime() {
      return wt;
    },
    get components() {
      const day = Math.floor(wt / SECONDS_PER_DAY);
      const sod = wt % SECONDS_PER_DAY;
      return { year: 2512, month: 0, dayOfMonth: day, dayOfWeek: day % 8, hour: Math.floor(sod / 3600), minute: 0, second: 0, season: 'Spring' };
    },
    advance: vi.fn(async (s: number) => {
      wt += s;
      return wt;
    }),
    set: vi.fn(async (t: number) => {
      wt = t;
      return wt;
    }),
    calendar: {
      months: { values: CAL_MONTHS },
      days: { values: Array.from({ length: 8 }, (_, i) => ({ name: `Day${i}` })) },
      timeToComponents: (t: number) => ({ year: 2512, month: 0, dayOfMonth: Math.floor(t / SECONDS_PER_DAY), dayOfWeek: 0, hour: 0, minute: 0 }),
      componentsToTime: (c: any) => (c.dayOfMonth ?? 0) * SECONDS_PER_DAY + (c.hour ?? 0) * 3600 + (c.minute ?? 0) * 60,
    },
  };
}

function setGame(opts: { active: boolean; isGM?: boolean; worldTime?: number; scene?: any }) {
  const time = makeTime(opts.worldTime ?? 10 * 3600); // default 10:00 day 0
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === 'simple-timekeeping' ? { active: opts.active } : { active: true }) },
    user: { isGM: opts.isGM ?? true },
    time,
    scenes: { get: (id: string) => (opts.scene && opts.scene.id === id ? opts.scene : undefined) },
    journal: { contents: [] },
  };
  return time;
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).CONFIG = undefined;
});

describe('dispatchModuleTimekeeping', () => {
  it('returns MODULE_NOT_ACTIVE when the module is inactive', async () => {
    setGame({ active: false });
    const r = (await dispatchModuleTimekeeping({ action: 'get-time' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('MODULE_NOT_ACTIVE');
  });

  it('denies a write to a non-GM', async () => {
    setGame({ active: true, isGM: false });
    const r = (await dispatchModuleTimekeeping({ action: 'advance', hours: 1 })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('TIMEKEEPING_ACCESS_DENIED');
  });

  it('rejects advance with no time units', async () => {
    setGame({ active: true });
    const r = (await dispatchModuleTimekeeping({ action: 'advance' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('TIMEKEEPING_INVALID_INPUT');
  });

  it('get-time returns worldTime + moon phases', async () => {
    setGame({ active: true, worldTime: 5 * SECONDS_PER_DAY });
    const r = (await dispatchModuleTimekeeping({ action: 'get-time' })) as any;
    expect(r.success).toBe(true);
    expect(r.data.worldTime).toBe(5 * SECONDS_PER_DAY);
    expect(r.data.mannslieb.phase).toBeTypeOf('string');
    expect(r.data.morrslieb.phase).toBeTypeOf('string');
  });

  it('advance calls game.time.advance and returns the new time', async () => {
    const time = setGame({ active: true, worldTime: 0 });
    const r = (await dispatchModuleTimekeeping({ action: 'advance', hours: 4 })) as any;
    expect(r.success).toBe(true);
    expect(time.advance).toHaveBeenCalledWith(4 * 3600);
    expect(r.data.worldTime).toBe(4 * 3600);
    expect(r.data.advancedSeconds).toBe(4 * 3600);
  });

  it('advance-to surfaces a no-op when already at the target (§1.6)', async () => {
    // worldTime at exactly midday (12:00) → advance-to midday is a no-op.
    const time = setGame({ active: true, worldTime: 12 * 3600 });
    const r = (await dispatchModuleTimekeeping({ action: 'advance-to', target: 'midday' })) as any;
    expect(r.success).toBe(true);
    expect(r.data.noOp).toBe(true);
    expect(time.advance).not.toHaveBeenCalled();
  });

  it('advance-to advances forward to the next occurrence', async () => {
    const time = setGame({ active: true, worldTime: 6 * 3600 }); // 06:00 → to midday (+6h)
    const r = (await dispatchModuleTimekeeping({ action: 'advance-to', target: 'midday' })) as any;
    expect(r.success).toBe(true);
    expect(r.data.noOp).toBe(false);
    expect(time.advance).toHaveBeenCalledWith(6 * 3600);
  });

  it('set-time maps a month NAME to its index (enumerates all months, no intercalary filter)', async () => {
    const time = setGame({ active: true, worldTime: 0 });
    // "Hexenstag" is the 1-day feast at index 1 with NO intercalary flag — must still resolve.
    const r = (await dispatchModuleTimekeeping({ action: 'set-time', month: 'Hexenstag', dayOfMonth: 0, hour: 9 })) as any;
    expect(r.success).toBe(true);
    expect(time.set).toHaveBeenCalled();
  });

  it('set-time errors on an unknown month name', async () => {
    setGame({ active: true });
    const r = (await dispatchModuleTimekeeping({ action: 'set-time', month: 'Brumaire' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('TIMEKEEPING_MONTH_NOT_FOUND');
  });

  it('delete-event requires confirm:true', async () => {
    setGame({ active: true });
    const r = (await dispatchModuleTimekeeping({ action: 'delete-event', pageUuid: 'p1' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('TIMEKEEPING_INVALID_INPUT');
  });

  it('set-config requires confirm:true (can change calendar/secondsPerRound)', async () => {
    setGame({ active: true });
    const r = (await dispatchModuleTimekeeping({ action: 'set-config', changes: { dawn: 0.3 } })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('TIMEKEEPING_INVALID_INPUT');
  });

  it('set-clock-paused writes the paused setting', async () => {
    const time = setGame({ active: true });
    const sets: Record<string, any> = {};
    (globalThis as any).game.settings = { get: (m: string, k: string) => sets[k], set: vi.fn(async (m: string, k: string, v: any) => { sets[k] = v; }) };
    const r = (await dispatchModuleTimekeeping({ action: 'set-clock-paused', paused: true })) as any;
    expect(r.success).toBe(true);
    expect(r.data.paused).toBe(true);
  });

  it('set-scene-sync writes the flag and verifies the read-back (DP-16)', async () => {
    const flags: Record<string, any> = {};
    const scene = {
      id: 'scene1',
      name: 'Tavern',
      setFlag: vi.fn(async (scope: string, key: string, val: any) => {
        flags[`${scope}.${key}`] = val;
      }),
      getFlag: (scope: string, key: string) => flags[`${scope}.${key}`],
    };
    setGame({ active: true, scene });
    const r = (await dispatchModuleTimekeeping({ action: 'set-scene-sync', sceneId: 'scene1', sync: 'darknessOnly' })) as any;
    expect(r.success).toBe(true);
    expect(scene.setFlag).toHaveBeenCalledWith('simple-timekeeping', 'darknessSync', 'darknessOnly');
    expect(r.data.darknessSync).toBe('darknessOnly');
  });
});

// ── BUG-493 + BUG-501 (Wave 2) ─────────────────────────────────────────────────
// The original makeTime() mock had componentsToTime read `dayOfMonth` directly —
// a circular mock that could never reproduce the live silent drop. This block uses
// a V13-FAITHFUL mock: componentsToTime derives worldTime from year + `day`
// (day-of-YEAR) + hour/minute/second and IGNORES month/dayOfMonth, per
// foundry_docs/data/interfaces/types.TimeComponents.md (day = "number of days
// completed within the year") and the BUG-493 live 6-probe matrix.

const DAYS_PER_YEAR = CAL_MONTHS.reduce((a, m) => a + m.days, 0); // 99

function makeV13Time(initial: number) {
  let wt = initial;
  const toComponents = (t: number) => {
    const totalDays = Math.floor(t / SECONDS_PER_DAY);
    const year = 2512 + Math.floor(totalDays / DAYS_PER_YEAR);
    let day = totalDays % DAYS_PER_YEAR;
    let month = 0;
    let rem = day;
    while (month < CAL_MONTHS.length - 1 && rem >= CAL_MONTHS[month]!.days) {
      rem -= CAL_MONTHS[month]!.days;
      month++;
    }
    const sod = t % SECONDS_PER_DAY;
    return {
      year, day, month, dayOfMonth: rem, dayOfWeek: totalDays % 8,
      hour: Math.floor(sod / 3600), minute: Math.floor((sod % 3600) / 60), second: sod % 60,
      leapYear: false, season: 0,
    };
  };
  return {
    get worldTime() { return wt; },
    get components() { return toComponents(wt); },
    advance: vi.fn(async (s: number) => { wt += s; return wt; }),
    set: vi.fn(async (t: number) => { wt = t; return wt; }),
    calendar: {
      months: { values: CAL_MONTHS },
      days: { values: Array.from({ length: 8 }, (_, i) => ({ name: `Day${i}` })) },
      timeToComponents: toComponents,
      // v13-faithful: year/day/hour/minute/second only — month/dayOfMonth IGNORED.
      componentsToTime: (c: any) =>
        ((c.year ?? 2512) - 2512) * DAYS_PER_YEAR * SECONDS_PER_DAY +
        (c.day ?? 0) * SECONDS_PER_DAY +
        (c.hour ?? 0) * 3600 + (c.minute ?? 0) * 60 + (c.second ?? 0),
    },
  };
}

function setV13Game(opts: { worldTime?: number } = {}) {
  const time = makeV13Time(opts.worldTime ?? 10 * 3600);
  const sets: Record<string, any> = { configuration: { calendar: 'imperial' } };
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === 'simple-timekeeping' ? { active: true } : { active: true }) },
    user: { isGM: true },
    time,
    scenes: { get: () => undefined },
    journal: { contents: [] },
    settings: {
      get: (_m: string, k: string) => sets[k],
      set: vi.fn(async (_m: string, k: string, v: any) => { sets[k] = v; }),
    },
  };
  return { time, sets };
}

describe('BUG-493: set-time month/dayOfMonth actually move the clock', () => {
  it('month NAME + dayOfMonth recompute day-of-year and persist', async () => {
    const { time } = setV13Game({ worldTime: 10 * 3600 }); // day 0, 10:00
    const r = (await dispatchModuleTimekeeping({ action: 'set-time', month: 'Jahrdrung', dayOfMonth: 4 })) as any;
    expect(r.success).toBe(true);
    // Jahrdrung = index 2 → day-of-year 32 + 1 + 4 = 37, hour 10 preserved.
    expect(time.worldTime).toBe(37 * SECONDS_PER_DAY + 10 * 3600);
    expect(r.data.components.month).toBe(2);
    expect(r.data.components.dayOfMonth).toBe(4);
  });

  it('month INDEX alone moves the clock (dayOfMonth preserved from current)', async () => {
    const { time } = setV13Game({ worldTime: 0 }); // day 0 = Nachexen 0
    const r = (await dispatchModuleTimekeeping({ action: 'set-time', month: 3 })) as any;
    expect(r.success).toBe(true);
    // Pflugzeit (index 3) day 0 → day-of-year 32+1+33 = 66.
    expect(time.worldTime).toBe(66 * SECONDS_PER_DAY);
    expect(r.data.components.month).toBe(3);
  });

  it('dayOfMonth out of range for the month fails loud', async () => {
    setV13Game();
    const r = (await dispatchModuleTimekeeping({ action: 'set-time', month: 'Hexenstag', dayOfMonth: 1 })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('TIMEKEEPING_INVALID_INPUT');
    expect(r.error).toContain('Hexenstag');
  });
});

describe('BUG-501: activate-calendar preset validation', () => {
  it('bogus preset id fails with TIMEKEEPING_CALENDAR_UNKNOWN_PRESET and writes nothing', async () => {
    const { sets } = setV13Game();
    const r = (await dispatchModuleTimekeeping({ action: 'activate-calendar', calendar: 'totally-bogus', confirm: true })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('TIMEKEEPING_CALENDAR_UNKNOWN_PRESET');
    expect((globalThis as any).game.settings.set).not.toHaveBeenCalled();
    expect(sets.configuration.calendar).toBe('imperial'); // untouched
  });

  it('valid preset id persists and reports applied/note', async () => {
    const { sets } = setV13Game();
    const r = (await dispatchModuleTimekeeping({ action: 'activate-calendar', calendar: 'gregorian', confirm: true })) as any;
    expect(r.success).toBe(true);
    expect(sets.configuration.calendar).toBe('gregorian');
    expect(['live', 'on-reload']).toContain(r.data.applied);
    expect(r.data.indicatorCaveat).toContain('session-scoped');
  });
});
