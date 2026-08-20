// Phase wfrp-disease — Disease umbrella tool (8 actions).
//
// Wraps warhammer-mcp.disease Foundry handler (dispatchDisease).
// Actions: list / contract / start / increment / decrement /
//          finish-duration / apply-symptom / cure.
//
// CCR-Envelope-Consumer: every handler uses concrete typed generics on
// this.query<...> — no <any>. BUG-069 compliance.
// cure carries a runtime confirm: boolean gate (CCR-Delete-Safety precedent).

import { z } from 'zod';
import {
  DiseaseToolInput,
  type DiseaseListResponse,
  type DiseaseContractResponse,
  type DiseaseTimerResponse,
  type DiseaseFinishDurationResponse,
  type DiseaseApplySymptomResponse,
  type DiseaseCureResponse,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type DiseaseArgs = z.infer<typeof DiseaseToolInput>;
type ArgsFor<A extends DiseaseArgs['action']> = Extract<DiseaseArgs, { action: A }>;


export interface DiseaseToolOptions extends BaseToolOptions {}

export class DiseaseTool extends BaseTool {
  constructor(options: DiseaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'disease', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'disease',
        title: 'Manage Diseases',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage WFRP4e disease Items on actors via 8 actions. Thin wrapper over DiseaseModel.

Use this when:
- Contracting a disease on an actor by compendium name, optionally rolling a server-side Endurance test to resist it (action:"contract").
- Advancing a disease's incubation/duration timer day by day (action:"increment" / action:"decrement"), including the auto-cascade from incubation to duration.
- Resolving an incubation or duration dice-string timer to a numeric value (action:"start"), or manually triggering end-of-duration resolution (action:"finish-duration").
- Setting or replacing a disease's active symptom set (action:"apply-symptom"), or curing/removing a disease item with explicit confirmation (action:"cure").

Do NOT use this for WFRP status-effect conditions (Fatigued, Poisoned, Broken, etc.) — those are distinct from disease Items; use apply-condition / remove-condition instead.

**Actions:**
- **list**: List all disease items on an actor. Returns id, name, incubation/duration timers, symptoms.
- **contract**: Add a disease to an actor. Looks up disease by name from compendia. By default (autoEnduranceTest: true) rolls a server-side GM Endurance test; if it passes, disease is resisted. Set endured: true to skip the test and force contraction.
- **start**: Resolve the dice-string timer (incubation or duration) to a numeric value. Call this after contracting to roll incubation, or when incubation hits zero to roll duration. NOTE (BUG-475): the wfrp4e system may PRE-RESOLVE incubation to a numeric on contract, so list/read can already show a number here before you call start — start is idempotent on an already-numeric timer.
- **increment**: Increment the active timer by 1 day.
- **decrement**: Decrement the active timer by 1 day. Auto-cascades: incubation→0 starts duration; duration→0 calls finishDuration.
- **finish-duration**: Manually trigger the end-of-duration resolution. Rolls Lingering Endurance test if applicable; may cure, extend, or create a new disease.
- **apply-symptom**: Set the disease's symptom set. REPLACE semantics — wraps WFRP4e DiseaseModel.updateSymptoms() which deletes existing symptom AEs and creates new ones from the specified set. To preserve existing symptoms while adding more, the caller must pass the full target set (existing + new). Input: symptoms array [{key, severity?}] where key matches CONFIG.WFRP4E.symptoms (e.g. "fever", "delirium"). Severity is an optional difficulty modifier (e.g. "Hard").
- **cure**: Remove a disease item from the actor. Requires confirm: true; an omitted or false confirm returns the friendly DISEASE_CURE_NOT_CONFIRMED (never a raw Zod error).

Performance Notes:
- Action-based umbrella, no response-mode variance: each action returns a small structured result (disease list, contraction outcome, timer value, or cure confirmation) scoped to one actor's disease items — never a full sheet payload.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'contract', 'start', 'increment', 'decrement', 'finish-duration', 'apply-symptom', 'cure'],
              description: 'Disease action to perform',
            },
            actorId: { type: 'string', description: 'Foundry actor ID' },
            diseaseItemId: { type: 'string', description: 'ID of the disease item on the actor (required for start/increment/decrement/finish-duration/apply-symptom/cure)' },
            diseaseName: { type: 'string', description: 'Disease name EXACTLY as it appears in the compendium (findDiseaseByName is exact-match), e.g. "The Bloody Flux" (contract only)' },
            autoEnduranceTest: { type: 'boolean', description: 'When true (default), rolls a server-side Endurance test before contracting (contract only)' },
            endured: { type: 'boolean', description: 'Set to true to skip the Endurance test and force disease contraction (contract only)' },
            type: { type: 'string', enum: ['incubation', 'duration'], description: 'Which timer to resolve (start only)' },
            symptoms: {
              type: 'array',
              description: 'Symptom array (apply-symptom only)',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', description: 'Symptom key from CONFIG.WFRP4E.symptoms, e.g. "fever"' },
                  severity: { type: 'string', description: 'Optional difficulty modifier, e.g. "Hard"' },
                },
                required: ['key'],
              },
            },
            confirm: { type: 'boolean', default: false, description: 'Must be true to confirm cure (cure only). Omitted defaults to false → friendly DISEASE_CURE_NOT_CONFIRMED (BUG-475).' },
            reason: { type: 'string', description: 'Optional cure reason for audit log (cure only)' },
          },
          required: ['action', 'actorId'],
        },
      },
    ];
  }

  async execute(args: DiseaseArgs) {
    this.logger.info('Executing disease action', { action: args.action });
    switch (args.action) {
      case 'list':            return this.handleList(args);
      case 'contract':        return this.handleContract(args);
      case 'start':           return this.handleStart(args);
      case 'increment':       return this.handleIncrement(args);
      case 'decrement':       return this.handleDecrement(args);
      case 'finish-duration': return this.handleFinishDuration(args);
      case 'apply-symptom':   return this.handleApplySymptom(args);
      case 'cure':            return this.handleCure(args);
      default:
        // BUG-439: an unknown action must throw (clean isError envelope via the
        // dispatch catch) instead of falling through to an undefined result.
        throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: list, contract, start, increment, decrement, finish-duration, apply-symptom, cure`);
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<DiseaseListResponse>('disease', args);
      const lines = data.diseases.length
        ? data.diseases.map(
            (d) =>
              `- **${d.name}** \`${d.id}\`\n` +
              `  incubation: ${d.incubation.value} ${d.incubation.unit} · ` +
              `duration: ${d.duration.value} ${d.duration.unit}${d.duration.active ? ' (active)' : ''}\n` +
              `  symptoms: ${d.symptoms || '_(none)_'}`
          )
        : ['_(no diseases)_'];
      return {
        content: [
          {
            type: 'text' as const,
            text: `🦠 **Diseases on actor \`${data.actorId}\`** (${data.total})\n\n${lines.join('\n')}`,
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleContract(args: ArgsFor<'contract'>) {
    try {
      const data = await this.query<DiseaseContractResponse>('disease', args);
      if (data.resisted) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `✅ **${args.actorId} resisted ${data.diseaseName}** — Endurance test passed.`,
            },
          ],
          structuredContent: data as unknown as Record<string, unknown>,
        };
      }
      const d = data.disease;
      return {
        content: [
          {
            type: 'text' as const,
            text:
              `🦠 **${data.diseaseName} contracted**\n\n` +
              (d
                ? `**ID:** \`${d.id}\`\n` +
                  `**Incubation:** ${d.incubation.value} ${d.incubation.unit} _(unresolved — call start: incubation)_\n` +
                  `**Duration:** ${d.duration.value} ${d.duration.unit}\n` +
                  `**Symptoms:** ${d.symptoms || '_(none yet)_'}`
                : ''),
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('contract', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleStart(args: ArgsFor<'start'>) {
    try {
      const data = await this.query<DiseaseTimerResponse>('disease', args);
      return {
        content: [
          {
            type: 'text' as const,
            text:
              `🎲 **${data.diseaseName} — ${args.type} resolved**\n\n` +
              `Incubation: **${data.incubation.value}** ${data.incubation.unit}\n` +
              `Duration: **${data.duration.value}** ${data.duration.unit}${data.duration.active ? ' _(active)_' : ''}`,
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('start', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleIncrement(args: ArgsFor<'increment'>) {
    try {
      const data = await this.query<DiseaseTimerResponse>('disease', args);
      return {
        content: [
          {
            type: 'text' as const,
            text:
              `⬆️ **${data.diseaseName} incremented**\n\n` +
              `Incubation: ${data.incubation.value} · Duration: ${data.duration.value}${data.duration.active ? ' (active)' : ''}`,
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('increment', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDecrement(args: ArgsFor<'decrement'>) {
    try {
      const data = await this.query<DiseaseTimerResponse>('disease', args);
      return {
        content: [
          {
            type: 'text' as const,
            text:
              `⬇️ **${data.diseaseName} decremented**\n\n` +
              `Incubation: ${data.incubation.value} · Duration: ${data.duration.value}${data.duration.active ? ' (active)' : ''}`,
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('decrement', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleFinishDuration(args: ArgsFor<'finish-duration'>) {
    try {
      const data = await this.query<DiseaseFinishDurationResponse>('disease', args);
      let text: string;
      if (data.resolved) {
        text = `✅ **${data.diseaseName} — duration finished, disease cured.**`;
      } else {
        text = `⏳ **${data.diseaseName} — duration extended** to **${data.newDuration}** days.`;
        if (data.newDiseaseName) {
          text += `\n\n⚠️ New disease created: **${data.newDiseaseName}** \`${data.newDiseaseId}\``;
        }
      }
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('finish-duration', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleApplySymptom(args: ArgsFor<'apply-symptom'>) {
    try {
      const data = await this.query<DiseaseApplySymptomResponse>('disease', args);
      return {
        content: [
          {
            type: 'text' as const,
            text:
              `🩹 **${data.diseaseName} — symptoms applied**\n\n` +
              `Applied: ${data.symptomsApplied.join(', ')}\n` +
              `Active effects: ${data.activeEffectCount}`,
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('apply-symptom', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleCure(args: ArgsFor<'cure'>) {
    try {
      // BUG-475(b): default confirm to false so an OMITTED confirm reaches the foundry gate and yields
      // the friendly DISEASE_CURE_NOT_CONFIRMED, matching the confirm:false shape — not a raw "Required"
      // Zod error. Kept mcp-server-side (the shared Zod stays required) to avoid a 2nd foundry build (D7).
      const data = await this.query<DiseaseCureResponse>('disease', { ...args, confirm: (args as any).confirm ?? false });
      return {
        content: [
          {
            type: 'text' as const,
            text: `💊 **${data.diseaseName} cured** — removed from actor \`${data.actorId}\`.`,
          },
        ],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('cure', e instanceof Error ? e.message : String(e));
    }
  }
}
