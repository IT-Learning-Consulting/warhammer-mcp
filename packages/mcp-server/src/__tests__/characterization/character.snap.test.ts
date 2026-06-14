// Characterization snapshot — CharacterTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// handleGetCharacter wraps output in content[0].text (JSON-stringified).
// handleListCharacters returns a plain object (no content wrapper).

import { describe, it, expect } from 'vitest';
import { CharacterTools } from '../../tools/character.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new CharacterTools(makeToolDeps(mockReturn));

/** Minimal character data that exercises all extractBasicInfo + extractStats branches. */
const FULL_CHARACTER_DATA = {
  id: 'abc1234567890123',
  name: 'Aldric Schwarzmann',
  type: 'character',
  img: 'icons/svg/mystery-man.svg',
  system: {
    characteristics: {
      ws:  { initial: 35, advances: 5, value: 40 },
      bs:  { initial: 30, advances: 0, value: 30 },
      s:   { initial: 32, advances: 0, value: 32 },
      t:   { initial: 28, advances: 2, value: 30 },
      i:   { initial: 40, advances: 0, value: 40 },
      ag:  { initial: 35, advances: 0, value: 35 },
      dex: { initial: 25, advances: 0, value: 25 },
      int: { initial: 30, advances: 0, value: 30 },
      wp:  { initial: 33, advances: 0, value: 33 },
      fel: { initial: 28, advances: 0, value: 28 },
    },
    status: {
      wounds:     { value: 12, max: 15 },
      fortune:    { value: 2 },
      fate:       { value: 3 },
      resilience: { value: 1 },
      resolve:    { value: 2 },
      corruption: { value: 0, max: 3 },
      armour:     { value: 1 },
    },
    details: {
      species:   { value: 'Human' },
      gender:    { value: 'Male' },
      age:       { value: '28' },
      height:    { value: '5\'10"' },
      haircolour:{ value: 'Brown' },
      eyecolour: { value: 'Green' },
      move:      { value: 4 },
      status:    { value: 'Brass 2', tier: 1, standing: 2 },
      experience: { current: 50, total: 200, spent: 150, log: [] },
      motivation: { value: 'Protect the innocent' },
      'personal-ambitions': {
        'short-term': 'Find the stolen relic',
        'long-term': 'Become a knight',
      },
      'party-ambitions': {
        name: 'The Hammer and the Anvil',
        'short-term': 'Defeat the Chaos cultists',
        'long-term': 'Restore the city',
      },
      hitLocationTable: { value: 'hitloc' },
      starsign: { value: 'Dragomas the Drake' },
    },
    gmnotes: { value: 'Suspected of heresy' },
  },
  items: [
    {
      id: 'item001',
      name: 'Melee (Basic)',
      type: 'skill',
      system: {
        characteristic: { key: 'ws' },
        advances: { value: 5 },
        total: { value: 45 },
        modifier: { value: 0 },
      },
    },
    {
      id: 'item002',
      name: 'Strike Mighty Blow',
      type: 'talent',
      system: {
        advances: { value: 1 },
        tests: { value: 'WS' },
        description: { value: 'Add SB to damage rolls.' },
      },
    },
    {
      id: 'item003',
      name: 'Sword',
      type: 'weapon',
      img: 'icons/weapons/sword.svg',
      system: {
        quantity: { value: 1 },
        equipped: { value: true },
        description: { value: 'A standard sword.' },
      },
    },
    {
      id: 'item004',
      name: 'Gold Crown',
      type: 'money',
      system: { quantity: { value: 5 } },
    },
    {
      id: 'item005',
      name: 'Guard Career',
      type: 'career',
      system: { current: { value: true }, class: { value: 'Warrior' }, level: { value: 1 } },
    },
    {
      id: 'item006',
      name: 'Broken Arm',
      type: 'injury',
      system: { location: { value: 'rArm' }, description: { value: 'Fractured.' } },
    },
  ],
  effects: [
    {
      id: 'effect001',
      name: 'Fatigued',
      disabled: false,
      duration: { type: 'none', remaining: null },
      system: { condition: { value: 2 } },
      flags: {},
    },
  ],
};

describe('CharacterTools — characterization', () => {
  it('get-character — full character JSON snapshot (sections omitted)', async () => {
    const r = await tool(FULL_CHARACTER_DATA).handleGetCharacter({
      identifier: 'Aldric Schwarzmann',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-character — sections filter (characteristics only)', async () => {
    const r = await tool(FULL_CHARACTER_DATA).handleGetCharacter({
      identifier: 'Aldric Schwarzmann',
      sections: ['characteristics'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-character — sections filter (vitals + identity)', async () => {
    const r = await tool(FULL_CHARACTER_DATA).handleGetCharacter({
      identifier: 'Aldric Schwarzmann',
      sections: ['vitals', 'identity'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-characters — plain object with total count', async () => {
    const r = await tool([
      { id: 'abc1234567890123', name: 'Aldric Schwarzmann', type: 'character', img: 'icons/svg/mystery-man.svg' },
      { id: 'def4567890123456', name: 'Brenna Faust', type: 'npc', img: '' },
    ]).handleListCharacters({});
    expect(r).toMatchSnapshot();
  });

  it('list-characters — filtered by type=npc', async () => {
    const r = await tool([
      { id: 'npc001abc2345678', name: 'Town Guard', type: 'npc', img: '' },
    ]).handleListCharacters({ type: 'npc' });
    expect(r).toMatchSnapshot();
  });
});
