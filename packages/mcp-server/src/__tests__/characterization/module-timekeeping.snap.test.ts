// Characterization snapshot — ModuleTimekeepingTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers get-time, advance, list-events, set-scene-sync, add-event, get-config,
// a generic write action (set-weather), and MODULE_NOT_ACTIVE.

import { describe, it, expect } from 'vitest';
import { ModuleTimekeepingTool } from '../../tools/modules/simple-timekeeping/timekeeping.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any, mockThrow?: string) =>
  new ModuleTimekeepingTool(makeToolDeps(mockReturn, mockThrow));

describe('ModuleTimekeepingTool — characterization', () => {
  // ── MODULE_NOT_ACTIVE ────────────────────────────────────────────────────────
  it('MODULE_NOT_ACTIVE — get-time throws → moduleNotActiveContent format', async () => {
    const r = await tool(null, 'MODULE_NOT_ACTIVE: simple-timekeeping is not active').execute({
      action: 'get-time',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Reads ────────────────────────────────────────────────────────────────────
  it('get-time — full clock + moon phase output', async () => {
    const r = await tool({
      worldTime: 14400,
      components: { hour: 4, minute: 0, second: 0 },
      dateText: '4th of Nachexen, 2512 IC — 04:00',
      dayTimePercent: 0.1667,
      season: 'Winter',
      mannslieb: { phase: 'Full', cycleDay: 15 },
      morrslieb: { phase: 'New', cycleDay: 0 },
      paused: false,
      activeCalendar: 'imperial',
      note: 'Clock running.',
    }).execute({ action: 'get-time' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-events — events with repeat and expiry', async () => {
    const r = await tool({
      count: 2,
      events: [
        {
          name: 'Market Day',
          pageUuid: 'JournalEntry.abc.JournalEntryPage.p001',
          journalName: 'Calendar Events',
          eventTime: 86400,
          daysToEvent: 3,
          expired: false,
          repeat: 'week',
        },
        {
          name: 'Dead Night Watch',
          pageUuid: 'JournalEntry.abc.JournalEntryPage.p002',
          journalName: 'Calendar Events',
          eventTime: 50000,
          eventEnd: 54000,
          daysToEvent: 0,
          expired: true,
        },
      ],
    }).execute({ action: 'list-events', includeExpired: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-events — no events', async () => {
    const r = await tool({ count: 0, events: [] }).execute({ action: 'list-events' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── GM writes ─────────────────────────────────────────────────────────────────
  it('advance — time advanced with previousWorldTime', async () => {
    const r = await tool({
      worldTime: 28800,
      previousWorldTime: 14400,
      components: { hour: 8, minute: 0, second: 0 },
      dateText: '4th of Nachexen, 2512 IC — 08:00',
      dayTimePercent: 0.3333,
      season: 'Winter',
      mannslieb: { phase: 'Full', cycleDay: 15 },
      morrslieb: { phase: 'Waxing', cycleDay: 7 },
      paused: false,
      activeCalendar: 'imperial',
      note: 'Advanced 4 hours.',
      advancedSeconds: 14400,
    }).execute({ action: 'advance', hours: 4 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-scene-sync — darknessSync set on scene', async () => {
    const r = await tool({
      sceneId: 'scene001',
      sceneName: 'Market Square',
      darknessSync: 'sync',
    }).execute({ action: 'set-scene-sync', sceneId: 'scene001', sync: 'sync' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-event — new calendar event registered', async () => {
    const r = await tool({
      pageUuid: 'JournalEntry.abc.JournalEntryPage.p003',
      journalName: 'Calendar Events',
      name: 'Witchnight Ceremony',
      eventTime: 259200,
      daysToEvent: 5,
      repeat: 'year',
    }).execute({
      action: 'add-event',
      name: 'Witchnight Ceremony',
      eventTime: 259200,
      repeat: 'year',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-config — configuration summary', async () => {
    const r = await tool({
      configuration: {
        weatherLabel: 'Rain',
        darknessSync: true,
        secondsPerRound: 10,
      },
      paused: false,
      activeCalendar: 'imperial',
    }).execute({ action: 'get-config' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-weather — generic ok result (GenericOkResult path)', async () => {
    const r = await tool({
      label: 'Heavy Rain',
      color: '#334466',
      applied: true,
    }).execute({
      action: 'set-weather',
      label: 'Heavy Rain',
      color: '#334466',
      weatherEffect: 'weather.rain',
      sceneId: 'scene001',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
