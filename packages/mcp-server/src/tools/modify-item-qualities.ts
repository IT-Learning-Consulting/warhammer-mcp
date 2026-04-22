import { ModifyItemQualitiesV2Input } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ModifyItemQualitiesToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ModifyItemQualitiesTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: ModifyItemQualitiesToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ModifyItemQualitiesTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'modify-item-qualities',
        description:
          'Add or remove qualities / flaws on an existing weapon, armour, trapping, etc. Works on actor-embedded items (destination.type="actor" + actorId/actorName + itemName/itemId) or world-scope items (destination.type="world" + itemName/itemId). Qualities and flaws are WFRP4e-canonical (damaging, accurate, fast, slow, tiring, etc.); arbitrary strings accepted but rule effects only apply to known keys. Pass-through to the Foundry-module modifyItemQualities query.',
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
        },
      },
    ];
  }

  async handle(args: unknown): Promise<string> {
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
    const result: any = await this.foundryClient.query<any>(
      'warhammer-mcp.modifyItemQualities',
      parsed
    );
    const data = result?.data ?? result ?? {};
    const parts: string[] = [`Modified **${data.itemName ?? parsed.itemName ?? parsed.itemId}**.`];
    if (parsed.addQualities.length)
      parts.push(`Added qualities: ${parsed.addQualities.map((q) => q.name).join(', ')}`);
    if (parsed.removeQualities.length)
      parts.push(`Removed qualities: ${parsed.removeQualities.join(', ')}`);
    if (parsed.addFlaws.length)
      parts.push(`Added flaws: ${parsed.addFlaws.map((f) => f.name).join(', ')}`);
    if (parsed.removeFlaws.length) parts.push(`Removed flaws: ${parsed.removeFlaws.join(', ')}`);
    return parts.join('\n');
  }
}
