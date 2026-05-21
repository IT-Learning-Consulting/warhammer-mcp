// Phase wfrp-disease — Disease umbrella schema (8 actions).
// Discriminated union mirrors the WFRP4e DiseaseModel method surface.

import { z } from 'zod';

const FOUNDRY_ID = z.string().min(1);

// ── Per-action input schemas ──────────────────────────────────────────────────

export const DiseaseListInput = z.object({
  action: z.literal('list'),
  actorId: FOUNDRY_ID,
}).strict();

export const DiseaseContractInput = z.object({
  action: z.literal('contract'),
  actorId: FOUNDRY_ID,
  diseaseName: z.string().min(1).describe('Disease name as it appears in the compendium (e.g. "Bloody Flux")'),
  autoEnduranceTest: z.boolean().optional().default(true).describe('When true (default), automatically rolls a server-side Endurance test. If the test passes the disease is resisted.'),
  endured: z.boolean().optional().default(false).describe('Set to true to skip the Endurance test and add the disease directly.'),
}).strict();

export const DiseaseStartInput = z.object({
  action: z.literal('start'),
  actorId: FOUNDRY_ID,
  diseaseItemId: FOUNDRY_ID,
  type: z.enum(['incubation', 'duration']).describe('Which timer to resolve: incubation (initial) or duration (active disease).'),
}).strict();

export const DiseaseIncrementInput = z.object({
  action: z.literal('increment'),
  actorId: FOUNDRY_ID,
  diseaseItemId: FOUNDRY_ID,
}).strict();

export const DiseaseDecrementInput = z.object({
  action: z.literal('decrement'),
  actorId: FOUNDRY_ID,
  diseaseItemId: FOUNDRY_ID,
}).strict();

export const DiseaseFinishDurationInput = z.object({
  action: z.literal('finish-duration'),
  actorId: FOUNDRY_ID,
  diseaseItemId: FOUNDRY_ID,
}).strict();

export const DiseaseApplySymptomInput = z.object({
  action: z.literal('apply-symptom'),
  actorId: FOUNDRY_ID,
  diseaseItemId: FOUNDRY_ID,
  symptoms: z.array(
    z.object({
      key: z.string().min(1).describe('Symptom key from CONFIG.WFRP4E.symptoms (e.g. "fever", "delirium")'),
      severity: z.string().optional().describe('Optional difficulty modifier in parens, e.g. "Hard"'),
    })
  ).min(1),
}).strict();

export const DiseaseCureInput = z.object({
  action: z.literal('cure'),
  actorId: FOUNDRY_ID,
  diseaseItemId: FOUNDRY_ID,
  confirm: z.boolean().describe('Must be true to confirm removal. Throws DISEASE_CURE_NOT_CONFIRMED if false.'),
  reason: z.string().optional(),
}).strict();

// ── Umbrella discriminated union ──────────────────────────────────────────────

export const DiseaseToolInput = z.discriminatedUnion('action', [
  DiseaseListInput,
  DiseaseContractInput,
  DiseaseStartInput,
  DiseaseIncrementInput,
  DiseaseDecrementInput,
  DiseaseFinishDurationInput,
  DiseaseApplySymptomInput,
  DiseaseCureInput,
]);

export type DiseaseToolInputType = z.infer<typeof DiseaseToolInput>;
export type DiseaseListInputType = z.infer<typeof DiseaseListInput>;
export type DiseaseContractInputType = z.infer<typeof DiseaseContractInput>;
export type DiseaseStartInputType = z.infer<typeof DiseaseStartInput>;
export type DiseaseIncrementInputType = z.infer<typeof DiseaseIncrementInput>;
export type DiseaseDecrementInputType = z.infer<typeof DiseaseDecrementInput>;
export type DiseaseFinishDurationInputType = z.infer<typeof DiseaseFinishDurationInput>;
export type DiseaseApplySymptomInputType = z.infer<typeof DiseaseApplySymptomInput>;
export type DiseaseCureInputType = z.infer<typeof DiseaseCureInput>;

// ── Response types ────────────────────────────────────────────────────────────

export interface DiseaseItemView {
  id: string;
  name: string;
  incubation: { value: string | number; unit: string; active: boolean };
  duration: { value: string | number; unit: string; active: boolean };
  symptoms: string;
  contraction: string;
}

export interface DiseaseListResponse {
  actorId: string;
  diseases: DiseaseItemView[];
  total: number;
}

export interface DiseaseContractResponse {
  actorId: string;
  diseaseName: string;
  resisted: boolean;
  disease?: DiseaseItemView;
}

export interface DiseaseTimerResponse {
  actorId: string;
  diseaseItemId: string;
  diseaseName: string;
  incubation: { value: string | number; unit: string; active: boolean };
  duration: { value: string | number; unit: string; active: boolean };
}

export interface DiseaseFinishDurationResponse {
  actorId: string;
  diseaseItemId: string;
  diseaseName: string;
  resolved: boolean;
  newDuration?: number | undefined;
  newDiseaseId?: string | undefined;
  newDiseaseName?: string | undefined;
}

export interface DiseaseApplySymptomResponse {
  actorId: string;
  diseaseItemId: string;
  diseaseName: string;
  symptomsApplied: string[];
  activeEffectCount: number;
}

export interface DiseaseCureResponse {
  actorId: string;
  diseaseItemId: string;
  diseaseName: string;
  removed: boolean;
}

export type DiseaseResponse =
  | DiseaseListResponse
  | DiseaseContractResponse
  | DiseaseTimerResponse
  | DiseaseFinishDurationResponse
  | DiseaseApplySymptomResponse
  | DiseaseCureResponse;
