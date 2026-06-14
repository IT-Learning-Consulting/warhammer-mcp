// Characterization snapshot — DiseaseTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: list, contract, start, increment, decrement, finish-duration, apply-symptom, cure

import { describe, it, expect } from 'vitest';
import { DiseaseTool } from '../../tools/disease.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new DiseaseTool(makeToolDeps(mockReturn));

const ACTOR_ID = 'actor001';
const DISEASE_ITEM_ID = 'dis001';

describe('DiseaseTool — characterization', () => {
  it('list — actor with diseases', async () => {
    const r = await tool({
      actorId: ACTOR_ID,
      total: 1,
      diseases: [
        {
          id: DISEASE_ITEM_ID,
          name: 'Bloody Flux',
          incubation: { value: 3, unit: 'days' },
          duration: { value: 7, unit: 'days', active: false },
          symptoms: 'Fever, Delirium',
        },
      ],
    }).execute({ action: 'list', actorId: ACTOR_ID });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — no diseases', async () => {
    const r = await tool({
      actorId: ACTOR_ID,
      total: 0,
      diseases: [],
    }).execute({ action: 'list', actorId: ACTOR_ID });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('contract — resisted', async () => {
    const r = await tool({
      resisted: true,
      diseaseName: 'Bloody Flux',
      disease: null,
    }).execute({ action: 'contract', actorId: ACTOR_ID, diseaseName: 'Bloody Flux' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('contract — contracted', async () => {
    const r = await tool({
      resisted: false,
      diseaseName: 'Bloody Flux',
      disease: {
        id: DISEASE_ITEM_ID,
        name: 'Bloody Flux',
        incubation: { value: '1d10', unit: 'days' },
        duration: { value: '2d10', unit: 'days', active: false },
        symptoms: null,
      },
    }).execute({ action: 'contract', actorId: ACTOR_ID, diseaseName: 'Bloody Flux', endured: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('start — resolve incubation timer', async () => {
    const r = await tool({
      diseaseName: 'Bloody Flux',
      incubation: { value: 4, unit: 'days' },
      duration: { value: '2d10', unit: 'days', active: false },
    }).execute({ action: 'start', actorId: ACTOR_ID, diseaseItemId: DISEASE_ITEM_ID, type: 'incubation' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('increment — incubation bumped', async () => {
    const r = await tool({
      diseaseName: 'Bloody Flux',
      incubation: { value: 5, unit: 'days' },
      duration: { value: 0, unit: 'days', active: false },
    }).execute({ action: 'increment', actorId: ACTOR_ID, diseaseItemId: DISEASE_ITEM_ID });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('decrement — duration active', async () => {
    const r = await tool({
      diseaseName: 'Bloody Flux',
      incubation: { value: 0, unit: 'days' },
      duration: { value: 6, unit: 'days', active: true },
    }).execute({ action: 'decrement', actorId: ACTOR_ID, diseaseItemId: DISEASE_ITEM_ID });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('finish-duration — cured', async () => {
    const r = await tool({
      diseaseName: 'Bloody Flux',
      resolved: true,
      newDuration: null,
      newDiseaseName: null,
      newDiseaseId: null,
    }).execute({ action: 'finish-duration', actorId: ACTOR_ID, diseaseItemId: DISEASE_ITEM_ID });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('finish-duration — extended with new disease', async () => {
    const r = await tool({
      diseaseName: 'Bloody Flux',
      resolved: false,
      newDuration: 5,
      newDiseaseName: 'The Pox',
      newDiseaseId: 'dis002',
    }).execute({ action: 'finish-duration', actorId: ACTOR_ID, diseaseItemId: DISEASE_ITEM_ID });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('apply-symptom — symptoms applied', async () => {
    const r = await tool({
      diseaseName: 'Bloody Flux',
      symptomsApplied: ['fever', 'delirium'],
      activeEffectCount: 2,
    }).execute({
      action: 'apply-symptom',
      actorId: ACTOR_ID,
      diseaseItemId: DISEASE_ITEM_ID,
      symptoms: [{ key: 'fever' }, { key: 'delirium' }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('cure — disease removed', async () => {
    const r = await tool({
      diseaseName: 'Bloody Flux',
      actorId: ACTOR_ID,
    }).execute({ action: 'cure', actorId: ACTOR_ID, diseaseItemId: DISEASE_ITEM_ID, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
