import {
  AddItemFromCompendiumInput,
  AddItemFromCompendiumOutput,
  type AddItemFromCompendiumOutputType,
  ADD_ITEM_FROM_COMPENDIUM_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface AddItemFromCompendiumToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AddItemFromCompendiumTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'add-item-from-compendium', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-item-from-compendium',
        title: 'Add Item From Compendium',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Embed a compendium item onto an actor. Accepts the full Foundry UUID via itemUuid (preferred) or the legacy compendiumId alias (deprecated). Thin pass-through to the Foundry-module addItemFromCompendium query — preserves the source item's Active Effects chain (e.g. critical-wound bleeding, mutation stat penalties, disease incubation). Used by /wfrp-critical, /wfrp-mutation, /wfrp-disease, /wfrp-corruption. Does not enforce WFRP rules. Exactly one of {itemUuid, compendiumId} must be supplied. Pass skipSpecialisationChoice:true when adding bare isSpec skills (e.g. "Lore ()") to suppress the WFRP4e specialisation-choice dialog that would otherwise block autonomous flows.

Use this when:
- Applying a published critical wound, mutation, disease, or corruption item (with its full Active Effects chain intact) to an actor.
- Embedding an unmodified published compendium item (weapon, armor, trapping, talent, skill) onto a character or NPC.
- Adding a bare specialisation skill (e.g. "Lore ()") autonomously via skipSpecialisationChoice:true, bypassing the WFRP4e dialog.

Do NOT use this to author a homebrew item not sourced from a compendium — use create-custom-item instead.

Retry contract: a repeat call with the same {actorId, itemUuid/compendiumId} is dedupe-gated by
default — if a matching item (by resolved sourceUuid, or {name, type} for legacy items) already
exists on the actor, no new item is created; the response reports outcome:"alreadyApplied" and the
existing item's id. Safe to retry after a timeout. Pass allowDuplicate:true to force a genuine
second copy (e.g. two identical daggers).

Performance Notes:
- Single small response: the embedded item's id/name, no full item payload echoed back. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            itemUuid: {
              type: 'string',
              description: 'Full Foundry document UUID of the compendium item to embed, e.g. "Compendium.wfrp4e-core.items.Item.sgBDLL1iLenHJ5um". Skills resolve this by calling search-compendium and constructing the UUID from pack.id + itemId. (Preferred over the deprecated `compendiumId` alias.)',
            },
            compendiumId: {
              type: 'string',
              description: 'Deprecated alias for itemUuid. Accepted for backwards compatibility — prefer itemUuid in new code.',
            },
            skipSpecialisationChoice: {
              type: 'boolean',
              description: 'When true, suppresses the WFRP4e specialisation-choice dialog for bare isSpec skills (e.g. "Lore ()", "Language ()"). Required for autonomous NPC/PC builds that embed specialisation skills without user interaction. Default false.',
            },
            allowDuplicate: {
              type: 'boolean',
              description: 'When true, bypasses the dedupe gate and creates a genuine second copy even if a matching item (by sourceUuid, or {name, type} for legacy items) already exists on the actor. Default false — a repeat call is treated as an idempotent retry and returns outcome:"alreadyApplied" against the existing item instead of duplicating it.',
            },
          },
          required: ['actorId'],
        },
        outputSchema: ADD_ITEM_FROM_COMPENDIUM_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = AddItemFromCompendiumInput.parse(args);
    const uuid = parsed.itemUuid ?? parsed.compendiumId;
    if (!uuid) {
      throw new Error('add-item-from-compendium: one of {itemUuid, compendiumId} is required.');
    }
    this.logger.info('add-item-from-compendium', {
      actorId: parsed.actorId,
      uuid,
    });
    // BUG-869 (D5): envelope wrap; content[0].text === JSON.stringify(data) preserves
    // the prior auto-wrapped wire text (additive structuredContent) — see add-active-effect.ts.
    const data = await this.query<AddItemFromCompendiumOutputType>('addItemFromCompendium', parsed);
    AddItemFromCompendiumOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }
}
