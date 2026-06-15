// Phase wfrp-disease — Disease umbrella dispatcher (8 actions).
//
// Architecture:
//   - dispatchDisease() is the single entry point registered in queries.ts.
//   - 8 per-action handlers: list / contract / start / increment / decrement /
//     finish-duration / apply-symptom / cure.
//   - contract uses Path A: server-side GM-rolled Endurance test (skipDialog).
//   - apply-symptom builds the comma-string DiseaseModel.updateSymptoms() expects
//     from typed input [{key, severity?}], validating against CONFIG.WFRP4E.symptoms.
//   - finish-duration infers outcome by diffing actor.items before/after.
//
// Trust gates:
//   - validateGMAccess() on every action.
//   - cure requires runtime truthy confirm + throws DISEASE_CURE_NOT_CONFIRMED.
//
// DP-16: every mutation re-reads the item via _source after write.
// Notify: every mutation fires notify.created/updated/deleted('item', ...).
// NEVER calls ChatMessage.create directly (notify-migration-guard).

import {
  DiseaseToolInput,
  type DiseaseToolInputType,
  type DiseaseListResponse,
  type DiseaseContractResponse,
  type DiseaseTimerResponse,
  type DiseaseFinishDurationResponse,
  type DiseaseApplySymptomResponse,
  type DiseaseCureResponse,
  type DiseaseItemView,
} from '@foundry-mcp/shared';
import { notify } from '../notify.js';
import { validateGMAccess, type Envelope } from '../utils/flatWorldCRUDFactory.js';
// BUG-295: disease mutations were the only handler family writing without
// wrappedWrite (no transaction serialization or permission gate at the write).
import { wrappedWrite } from '../transaction-manager.js';

type DiseaseHandlerEnvelope<T> = Envelope<T>;

const DENY = (op: string) => `Access denied: ${op} requires GM`;

// ── Serializer ───────────────────────────────────────────────────────────────

function serializeDiseaseItem(item: any): DiseaseItemView {
  return {
    id: item.id,
    name: item.name,
    incubation: {
      value: item.system?.incubation?.value ?? '',
      unit: item.system?.incubation?.unit ?? 'days',
      active: false,
    },
    duration: {
      value: item.system?.duration?.value ?? '',
      unit: item.system?.duration?.unit ?? 'days',
      active: item.system?.duration?.active ?? false,
    },
    symptoms: item.system?.symptoms?.value ?? '',
    contraction: item.system?.contraction?.value ?? '',
  };
}

// ── Helper: find disease in compendia ────────────────────────────────────────

async function findDiseaseByName(name: string): Promise<any | null> {
  const lowerName = name.toLowerCase();
  for (const pack of (game as any).packs.filter((p: any) => p.metadata.type === 'Item')) {
    try {
      const index = await pack.getIndex();
      // BUG-299: getIndex() may resolve to a plain Map rather than a Collection;
      // iterate defensively via .values() so both Collection.find() and Map work.
      let entry: any = null;
      const iter: Iterable<any> = typeof (index as any).values === 'function'
        ? (index as any).values()
        : (index as any);
      for (const e of iter) {
        if (e?.name?.toLowerCase() === lowerName) { entry = e; break; }
      }
      if (entry) {
        const doc = await pack.getDocument(entry._id);
        if (doc && doc.type === 'disease') return doc;
      }
    } catch (err) {
      // BUG-299: log pack errors instead of swallowing silently
      console.warn(`[warhammer-mcp] findDiseaseByName: error scanning pack "${pack.metadata?.id}":`, err);
    }
  }
  return null;
}

// ── Helper: get actor + gate ─────────────────────────────────────────────────

function getActorOrThrow(actorId: string): any {
  const actor = (game as any).actors?.get(actorId);
  if (!actor) throw new Error(`DISEASE_ACTOR_NOT_FOUND: no actor with id "${actorId}"`);
  return actor;
}

function getDiseaseItemOrThrow(actor: any, diseaseItemId: string): any {
  const item = actor.items.get(diseaseItemId);
  if (!item) throw new Error(`DISEASE_ITEM_NOT_FOUND: no item "${diseaseItemId}" on actor "${actor.id}"`);
  if (item.type !== 'disease') throw new Error(`DISEASE_ITEM_WRONG_TYPE: item "${diseaseItemId}" is type "${item.type}", expected "disease"`);
  return item;
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export async function dispatchDisease(data: unknown): Promise<DiseaseHandlerEnvelope<any>> {
  let input: DiseaseToolInputType;
  try {
    input = DiseaseToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'list':            return listDiseases(input);
    case 'contract':        return contractDisease(input);
    case 'start':           return startDiseaseTimer(input);
    case 'increment':       return incrementDisease(input);
    case 'decrement':       return decrementDisease(input);
    case 'finish-duration': return finishDiseaseDuration(input);
    case 'apply-symptom':   return applyDiseaseSymptom(input);
    case 'cure':            return cureDisease(input);
    default:
      throw new Error(`DISEASE_UNKNOWN_ACTION: ${(input as any).action}`);
  }
}

// ── 1. list ──────────────────────────────────────────────────────────────────

async function listDiseases(input: { actorId: string }): Promise<DiseaseHandlerEnvelope<DiseaseListResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('listDiseases') };

  const actor = getActorOrThrow(input.actorId);
  const diseases = actor.items.filter((i: any) => i.type === 'disease').map(serializeDiseaseItem);

  return {
    success: true,
    data: { actorId: input.actorId, diseases, total: diseases.length },
  };
}

// ── 2. contract ──────────────────────────────────────────────────────────────

async function contractDisease(input: {
  actorId: string;
  diseaseName: string;
  autoEnduranceTest?: boolean;
  endured?: boolean;
}): Promise<DiseaseHandlerEnvelope<DiseaseContractResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('contractDisease') };

  const actor = getActorOrThrow(input.actorId);

  // Resolve disease from compendia
  const diseaseDoc = await findDiseaseByName(input.diseaseName);
  if (!diseaseDoc) {
    throw new Error(`DISEASE_NOT_FOUND: no disease named "${input.diseaseName}" found in any compendium`);
  }

  const autoTest = input.autoEnduranceTest !== false;
  const alreadyEndured = input.endured === true;

  if (autoTest && !alreadyEndured) {
    // Path A: GM-rolled Endurance test with contraction difficulty
    const difficulty = diseaseDoc.system?.contraction?.value || 'challenging';
    const test = await actor.setupSkill(
      (game as any).i18n.localize('NAME.Endurance'),
      { fields: { difficulty }, skipTargets: true },
      { skipDialog: true },
    );
    await test.roll();

    if (!test.failed) {
      // Endurance passed — disease resisted
      return {
        success: true,
        data: { actorId: input.actorId, diseaseName: diseaseDoc.name, resisted: true },
      };
    }
  }

  // Add the disease to the actor (BUG-295: wrapped)
  const verified = await wrappedWrite('disease.contract', async () => {
    const diseaseData = diseaseDoc.toObject();
    const created = await actor.createEmbeddedDocuments('Item', [diseaseData]);
    const createdItem = created?.[0];

    if (!createdItem) {
      throw new Error(`DISEASE_CREATE_FAILED: createEmbeddedDocuments returned no item for "${input.diseaseName}"`);
    }

    // DP-16 post-verify: item must exist on actor
    const fresh = actor.items.get(createdItem.id);
    if (!fresh) {
      throw new Error(`DISEASE_WRITE_NOT_PERSISTED: item "${createdItem.id}" not found on actor after create`);
    }
    return fresh;
  });

  notify.created('item', `${actor.name}: ${verified.name}`, {
    summary: `disease contracted via warhammer-mcp.disease`,
  });

  return {
    success: true,
    data: {
      actorId: input.actorId,
      diseaseName: verified.name,
      resisted: false,
      disease: serializeDiseaseItem(verified),
    },
  };
}

// ── 3. start ─────────────────────────────────────────────────────────────────

async function startDiseaseTimer(input: {
  actorId: string;
  diseaseItemId: string;
  type: 'incubation' | 'duration';
}): Promise<DiseaseHandlerEnvelope<DiseaseTimerResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('startDiseaseTimer') };

  const actor = getActorOrThrow(input.actorId);
  const item = getDiseaseItemOrThrow(actor, input.diseaseItemId);

  // BUG-295: wrapped
  const { after, newValue } = await wrappedWrite('disease.start', async () => {
    await item.system.start(input.type);

    // DP-16 post-verify: value must be numeric now
    const fresh = actor.items.get(input.diseaseItemId);
    if (!fresh) throw new Error(`DISEASE_ITEM_DISAPPEARED: item gone after start`);
    const resolved = (fresh._source as any)?.system?.[input.type]?.value;
    if (isNaN(Number(resolved))) {
      throw new Error(`DISEASE_START_NOT_RESOLVED: ${input.type}.value is still "${resolved}" after start()`);
    }
    return { after: fresh, newValue: resolved };
  });

  notify.updated('item', `${actor.name}: ${item.name}`, {
    summary: `${input.type} started, resolved to ${newValue}`,
  });

  return {
    success: true,
    data: {
      actorId: input.actorId,
      diseaseItemId: input.diseaseItemId,
      diseaseName: after.name,
      incubation: { value: (after._source as any)?.system?.incubation?.value, unit: 'days', active: false },
      duration: {
        value: (after._source as any)?.system?.duration?.value,
        unit: 'days',
        active: (after._source as any)?.system?.duration?.active ?? false,
      },
    },
  };
}

// ── 4. increment ─────────────────────────────────────────────────────────────

async function incrementDisease(input: {
  actorId: string;
  diseaseItemId: string;
}): Promise<DiseaseHandlerEnvelope<DiseaseTimerResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('incrementDisease') };

  const actor = getActorOrThrow(input.actorId);
  const item = getDiseaseItemOrThrow(actor, input.diseaseItemId);

  const beforeDuration = item.system?.duration?.value;
  const beforeIncubation = item.system?.incubation?.value;

  // BUG-295: wrapped
  const { after, afterDuration, afterIncubation } = await wrappedWrite('disease.increment', async () => {
    await item.system.increment();

    // DP-16: item should still exist and value should have changed
    const fresh = actor.items.get(input.diseaseItemId);
    if (!fresh) throw new Error(`DISEASE_ITEM_DISAPPEARED: item gone after increment`);
    const dur = (fresh._source as any)?.system?.duration?.value;
    const inc = (fresh._source as any)?.system?.incubation?.value;
    const changed = dur !== beforeDuration || inc !== beforeIncubation;
    if (!changed) {
      throw new Error(
        `DISEASE_INCREMENT_NOT_PERSISTED: neither duration nor incubation value changed after increment`,
      );
    }
    return { after: fresh, afterDuration: dur, afterIncubation: inc };
  });

  notify.updated('item', `${actor.name}: ${item.name}`, { summary: 'incremented' });

  return {
    success: true,
    data: {
      actorId: input.actorId,
      diseaseItemId: input.diseaseItemId,
      diseaseName: after.name,
      incubation: { value: afterIncubation, unit: 'days', active: false },
      duration: { value: afterDuration, unit: 'days', active: (after._source as any)?.system?.duration?.active ?? false },
    },
  };
}

// ── 5. decrement ─────────────────────────────────────────────────────────────

async function decrementDisease(input: {
  actorId: string;
  diseaseItemId: string;
}): Promise<DiseaseHandlerEnvelope<DiseaseTimerResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('decrementDisease') };

  const actor = getActorOrThrow(input.actorId);
  const item = getDiseaseItemOrThrow(actor, input.diseaseItemId);

  const beforeDuration = item.system?.duration?.value;
  const beforeIncubation = item.system?.incubation?.value;

  // BUG-295: wrapped. The duration→0 cascade (item auto-deleted = cured) is a
  // legitimate outcome, not a failure — signalled via the discriminated return.
  const outcome = await wrappedWrite('disease.decrement', async () => {
    await item.system.decrement();

    // DP-16: item may have been deleted (duration→0 cascade) — check existence first
    const fresh = actor.items.get(input.diseaseItemId);
    if (!fresh) return { cured: true as const };

    const dur = (fresh._source as any)?.system?.duration?.value;
    const inc = (fresh._source as any)?.system?.incubation?.value;
    const changed = dur !== beforeDuration || inc !== beforeIncubation;
    if (!changed) {
      throw new Error(
        `DISEASE_DECREMENT_NOT_PERSISTED: neither duration nor incubation value changed after decrement`,
      );
    }
    return { cured: false as const, after: fresh, afterDuration: dur, afterIncubation: inc };
  });

  if (outcome.cured) {
    // disease was cured by cascade — treat as success with resolved state
    notify.deleted('item', `${actor.name}: ${item.name}`, { summary: 'decremented to zero, auto-cured' });
    return {
      success: true,
      data: {
        actorId: input.actorId,
        diseaseItemId: input.diseaseItemId,
        diseaseName: item.name,
        incubation: { value: 0, unit: 'days', active: false },
        duration: { value: 0, unit: 'days', active: false },
      },
    };
  }

  const { after, afterDuration, afterIncubation } = outcome;

  notify.updated('item', `${actor.name}: ${item.name}`, { summary: 'decremented' });

  return {
    success: true,
    data: {
      actorId: input.actorId,
      diseaseItemId: input.diseaseItemId,
      diseaseName: after.name,
      incubation: { value: afterIncubation, unit: 'days', active: false },
      duration: { value: afterDuration, unit: 'days', active: (after._source as any)?.system?.duration?.active ?? false },
    },
  };
}

// ── 6. finish-duration ───────────────────────────────────────────────────────

async function finishDiseaseDuration(input: {
  actorId: string;
  diseaseItemId: string;
}): Promise<DiseaseHandlerEnvelope<DiseaseFinishDurationResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('finishDiseaseDuration') };

  const actor = getActorOrThrow(input.actorId);
  const item = getDiseaseItemOrThrow(actor, input.diseaseItemId);
  const diseaseName = item.name;

  // BUG-229: capture beforeDuration for three-terminal-state post-verify.
  const beforeDuration = item.system?.duration?.value;

  // Snapshot disease IDs before, to detect newly-created Lingering diseases
  const diseaseIdsBefore = new Set(
    actor.items.filter((i: any) => i.type === 'disease').map((i: any) => i.id)
  );

  // BUG-295: wrapped
  const { after, resolved, newDisease } = await wrappedWrite('disease.finish-duration', async () => {
    // BUG-385: wfrp4e's item.system.finishDuration() (wfrp4e.js ~27339) opens a SkillDialog for the
    // Lingering Endurance test with NO skipDialog, deadlocking the MCP await until a human clicks.
    // Re-implement its Lingering branch headlessly. Faithful to the wfrp4e source EXCEPT:
    //   (a) skipDialog + skipTargets go in the setupSkill CONTEXT (2nd) arg — warhammer-lib
    //       _setupTest reads `context.skipDialog` (_setupTest:5677), i.e. setupSkill's 2nd arg, NOT
    //       the 3rd ("options") arg. wfrp4e's own call omits skipDialog entirely (hence the dialog).
    //   (b) GM feedback routes through notify.* below, never ChatMessage.create (module contract).
    // The Festering/Rot compendium UUIDs + SL thresholds are copied verbatim from the wfrp4e source.
    const g = game as any;
    const symptoms = String(item.system?.symptoms?.value ?? '').toLowerCase();
    let removeDisease = true;
    if (symptoms.includes(g.i18n.localize('NAME.Lingering').toLowerCase())) {
      const lingering = item.effects?.find(
        (e: any) => e.name?.includes(g.i18n.localize('WFRP4E.Symptom.Lingering')),
      );
      if (lingering) {
        const difficulty =
          (globalThis as any).warhammer?.utility?.findKey?.(
            (lingering as any).specifier,
            g.wfrp4e?.config?.difficultyNames,
            { caseInsensitive: true },
          ) || 'challenging';
        const test = await actor.setupSkill(
          g.i18n.localize('NAME.Endurance'),
          { appendTitle: ` - ${g.i18n.localize('NAME.Lingering')}`, fields: { difficulty }, skipTargets: true, skipDialog: true },
          { skipTargets: true },
        );
        await test.roll();
        if (test.failed) {
          const negSL = Math.abs(test.result?.SL ?? 0);
          if (negSL <= 1) {
            // Lingering extended: persist a fresh 1d10 duration (the wfrp4e source mutates in memory).
            const rollObj = new ((globalThis as any).Roll)('1d10');
            const roll = (await rollObj.roll({ allowInteractive: false })).total as number;
            await item.update({ 'system.duration.value': roll });
            removeDisease = false;
          } else {
            // negSL 2–5 → Festering; 6+ → Rot (wfrp4e-core compendium UUIDs, treated as stable constants).
            const uuid = negSL <= 5
              ? 'Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb'
              : 'Compendium.wfrp4e-core.items.M8XyRs9DN12XsFTQ';
            const template = await (globalThis as any).fromUuid(uuid);
            if (template) {
              const diseaseData = template.toObject();
              diseaseData.system.incubation.value = 0;
              diseaseData.system.duration.active = true;
              await (globalThis as any).Item.create(diseaseData, { parent: actor });
            }
          }
        }
      }
    }
    if (removeDisease) {
      await item.delete();
    }

    // Infer outcome from post-call state
    const fresh = actor.items.get(input.diseaseItemId);
    const gone = !fresh; // item deleted = cured

    // Find any new disease created (Lingering → Festering/Rot)
    const newDiseases = actor.items.filter(
      (i: any) => i.type === 'disease' && !diseaseIdsBefore.has(i.id)
    );

    // BUG-229: three-terminal-state verify (CN-1 from verifier: equality-throw false-positives
    // on Lingering escalation where duration is unchanged but a new disease item was created).
    // Throw only when NONE of the three legitimate outcomes holds.
    const afterDuration = (fresh as any)?._source?.system?.duration?.value;
    const cured = gone;                          // (a) item gone
    const extended = !gone && afterDuration !== beforeDuration;  // (b) duration changed
    const escalated = newDiseases.length > 0;    // (c) Lingering → new disease item
    if (!cured && !extended && !escalated) {
      throw new Error(
        `DISEASE_FINISH_NOT_PERSISTED: finishDuration() left no observable change — ` +
        `duration unchanged (${beforeDuration}→${afterDuration}), item still present, no new disease created`,
      );
    }
    return { after: fresh, resolved: gone, newDisease: newDiseases[0] ?? null };
  });

  if (resolved) {
    notify.deleted('item', `${actor.name}: ${diseaseName}`, { summary: 'duration finished, disease cured' });
  } else {
    const newDuration = (after as any)?._source?.system?.duration?.value;
    notify.updated('item', `${actor.name}: ${diseaseName}`, {
      summary: `duration extended to ${newDuration}${newDisease ? `, new disease: ${newDisease.name}` : ''}`,
    });
  }

  return {
    success: true,
    data: {
      actorId: input.actorId,
      diseaseItemId: input.diseaseItemId,
      diseaseName,
      resolved,
      newDuration: resolved ? undefined : Number((after as any)?._source?.system?.duration?.value ?? 0),
      newDiseaseId: newDisease?.id,
      newDiseaseName: newDisease?.name,
    },
  };
}

// ── 7. apply-symptom ─────────────────────────────────────────────────────────

async function applyDiseaseSymptom(input: {
  actorId: string;
  diseaseItemId: string;
  symptoms: Array<{ key: string; severity?: string | undefined }>;
}): Promise<DiseaseHandlerEnvelope<DiseaseApplySymptomResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('applyDiseaseSymptom') };

  const actor = getActorOrThrow(input.actorId);
  const item = getDiseaseItemOrThrow(actor, input.diseaseItemId);

  const symptomConfig: Record<string, string> = (game as any).wfrp4e?.config?.symptoms ?? {};

  // Validate all keys and build the comma-string DiseaseModel.updateSymptoms() expects
  const symptomParts: string[] = [];
  for (const { key, severity } of input.symptoms) {
    const label = symptomConfig[key];
    if (!label) {
      throw new Error(`DISEASE_UNKNOWN_SYMPTOM: "${key}" not found in CONFIG.WFRP4E.symptoms`);
    }
    symptomParts.push(severity ? `${label} (${severity})` : label);
  }
  const symptomString = symptomParts.join(', ');

  // BUG-110 fix: DiseaseModel.updateSymptoms() has REPLACE semantics — it deletes
  // existing symptom AEs (effects with flags.wfrp4e.symptom) then creates the new ones.
  // The right post-write invariant is "each requested symptom is present in the
  // resulting symptom AE set", not "total AE count increased".
  // BUG-295: wrapped
  const { after, symptomAEs } = await wrappedWrite('disease.apply-symptom', async () => {
    await item.system.updateSymptoms(symptomString);

    // DP-16: re-read item, verify each requested symptom landed as a symptom AE
    const fresh = actor.items.get(input.diseaseItemId);
    if (!fresh) throw new Error(`DISEASE_ITEM_DISAPPEARED: item gone after apply-symptom`);
    const aes: any[] = [];
    for (const effect of fresh.effects) {
      if ((effect as any).flags?.wfrp4e?.symptom) {
        aes.push(effect);
      }
    }
    const resultingNames = aes.map((e) => e.name);
    const missing = symptomParts.filter((s) => !resultingNames.includes(s));
    if (missing.length > 0) {
      throw new Error(
        `DISEASE_SYMPTOM_NOT_PERSISTED: requested symptoms not found in resulting AE set (missing: ${missing.join(', ')}; resulting: ${resultingNames.join(', ')})`,
      );
    }
    return { after: fresh, symptomAEs: aes };
  });

  notify.updated('item', `${actor.name}: ${item.name}`, {
    summary: `symptoms set: ${symptomString} (REPLACE — prior symptoms cleared)`,
  });

  return {
    success: true,
    data: {
      actorId: input.actorId,
      diseaseItemId: input.diseaseItemId,
      diseaseName: after.name,
      symptomsApplied: symptomParts,
      activeEffectCount: symptomAEs.length,
    },
  };
}

// ── 8. cure ──────────────────────────────────────────────────────────────────

async function cureDisease(input: {
  actorId: string;
  diseaseItemId: string;
  confirm: boolean;
  reason?: string | undefined;
}): Promise<DiseaseHandlerEnvelope<DiseaseCureResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('cureDisease') };

  if (!input.confirm) {
    throw new Error('DISEASE_CURE_NOT_CONFIRMED: set confirm: true to remove the disease');
  }

  const actor = getActorOrThrow(input.actorId);
  const item = getDiseaseItemOrThrow(actor, input.diseaseItemId);
  const diseaseName = item.name;

  // BUG-295: wrapped
  await wrappedWrite('disease.cure', async () => {
    await actor.deleteEmbeddedDocuments('Item', [input.diseaseItemId]);

    // DP-16 post-verify: item must be gone
    const stillExists = actor.items.get(input.diseaseItemId);
    if (stillExists) {
      throw new Error(
        `DISEASE_CURE_NOT_PERSISTED: item "${input.diseaseItemId}" still exists after deleteEmbeddedDocuments`,
      );
    }
  });

  notify.deleted('item', `${actor.name}: ${diseaseName}`, {
    summary: input.reason ? `cured — ${input.reason}` : 'cured via warhammer-mcp.disease',
  });

  return {
    success: true,
    data: {
      actorId: input.actorId,
      diseaseItemId: input.diseaseItemId,
      diseaseName,
      removed: true,
    },
  };
}
