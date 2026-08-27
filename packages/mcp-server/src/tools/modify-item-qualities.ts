import {
  ModifyItemQualitiesV2Input,
  ModifyItemQualitiesOutput,
  type ModifyItemQualitiesOutputType,
  MODIFY_ITEM_QUALITIES_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ModifyItemQualitiesToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ModifyItemQualitiesTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'modify-item-qualities', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'modify-item-qualities',
        title: 'Modify Item Qualities',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Add or remove qualities / flaws on an existing weapon, armour, trapping, etc. Works on actor-embedded items (destination.type="actor" + actorId/actorName + itemName/itemId) or world-scope items (destination.type="world" + itemName/itemId). Qualities and flaws are WFRP4e-canonical (damaging, accurate, fast, slow, tiring, etc.); arbitrary strings accepted but rule effects only apply to known keys. Pass-through to the Foundry-module modifyItemQualities query.

Use this when:
- Adding a quality to an existing weapon/armour item (e.g. enchanting a sword with "damaging", or fitting armour with "impenetrable").
- Removing a quality or flaw that no longer applies (e.g. a curse lifted, a repair removing "shoddy").
- Adjusting a parameterized quality's value (e.g. changing Impact from 1 to 2) by re-adding it with a new value.
- Making this change on either an actor-embedded item or a world-scope item, using the same destination discriminator as create-custom-item.

Do NOT use this for generic item field edits outside qualities/flaws — use update-item instead.

Performance Notes:
- Single small response: the item's updated qualities/flaws lists, no full item payload echoed back. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            destination: {
              type: 'object',
              description:
                '{ type: "actor", actorId?/actorName? } OR { type: "world" } — same discriminator as create-custom-item.',
              additionalProperties: true,
            },
            itemName: {
              type: 'string',
              description: 'Item name (optional — itemId takes precedence if both supplied).',
            },
            itemId: { type: 'string', description: 'Item ID (optional).' },
            addQualities: {
              type: 'array',
              items: {
                type: 'object',
                properties: { name: { type: 'string' }, value: { type: 'number' } },
                required: ['name'],
              },
              description: 'Qualities to add. Optional value for parameterized qualities (e.g. Impact 2).',
            },
            removeQualities: {
              type: 'array',
              items: { type: 'string' },
              description: 'Quality names to remove.',
            },
            addFlaws: {
              type: 'array',
              items: {
                type: 'object',
                properties: { name: { type: 'string' }, value: { type: 'number' } },
                required: ['name'],
              },
              description: 'Flaws to add.',
            },
            removeFlaws: {
              type: 'array',
              items: { type: 'string' },
              description: 'Flaw names to remove.',
            },
          },
          required: ['destination'],
          allOf: [
            {
              anyOf: [
                {
                  properties: { itemName: { type: 'string' } },
                  required: ['itemName'],
                },
                {
                  properties: { itemId: { type: 'string' } },
                  required: ['itemId'],
                },
              ],
              description: 'One of itemName or itemId is required.',
            },
          ],
        },
        outputSchema: MODIFY_ITEM_QUALITIES_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: unknown): Promise<any> {
    const parsed = ModifyItemQualitiesV2Input.parse(args);
    this.logger.info('modify-item-qualities', {
      destination: parsed.destination.type,
      itemName: parsed.itemName ?? null,
      itemId: parsed.itemId ?? null,
      addQ: parsed.addQualities.length,
      rmQ: parsed.removeQualities.length,
      addF: parsed.addFlaws.length,
      rmF: parsed.removeFlaws.length,
    });
    const result: any = await this.query<ModifyItemQualitiesOutputType>(
      'modifyItemQualities',
      parsed
    );
    // BUG-325: BaseTool.query() already unwraps the envelope; drop the dead ?.data operand
    const data = result ?? {};
    // BUG-869 (D5): parse against the shared output schema so `outcome` (already computed by
    // the foundry-module handler) is validated before it reaches the wire as structuredContent.
    const structuredContent = ModifyItemQualitiesOutput.parse(data);
    const parts: string[] = [`Modified **${data.itemName ?? parsed.itemName ?? parsed.itemId}**.`];
    if (parsed.addQualities.length)
      parts.push(`Added qualities: ${parsed.addQualities.map((q) => q.name).join(', ')}`);
    if (parsed.removeQualities.length)
      parts.push(`Removed qualities: ${parsed.removeQualities.join(', ')}`);
    if (parsed.addFlaws.length)
      parts.push(`Added flaws: ${parsed.addFlaws.map((f) => f.name).join(', ')}`);
    if (parsed.removeFlaws.length) parts.push(`Removed flaws: ${parsed.removeFlaws.join(', ')}`);
    const text = parts.join('\n');
    return { content: [{ type: 'text' as const, text }], structuredContent };
  }
}
