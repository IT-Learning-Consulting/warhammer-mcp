import { TradeItemInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface TradeItemToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class TradeItemTool {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: TradeItemToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'TradeItemTool' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'trade-item',
        description:
          'Move an embedded Item from one actor to another atomically. Transaction-wrapped — if the destination create fails, the source is not touched. Encumbrance on both actors recomputes automatically via the Foundry prepareData pipeline (HC3). Optional `quantity` supports partial transfers on stackable items (arrows, etc.) — source decrements; destination receives a new stack with the requested count. Both actors must exist; the item must be on the source actor. Used by GM workflows for item hand-off between PCs or NPC loot distribution.',
        inputSchema: {
          type: 'object',
          properties: {
            fromActorId: { type: 'string', description: 'Source actor ID (current owner of the item).' },
            toActorId: { type: 'string', description: 'Destination actor ID.' },
            itemId: { type: 'string', description: 'ID of the embedded item on the source actor.' },
            quantity: {
              type: 'number',
              description:
                'Optional partial-quantity transfer. If omitted or equal to the source item quantity, the item moves fully. If less than source quantity, source is decremented and destination receives a new stack.',
            },
          },
          required: ['fromActorId', 'toActorId', 'itemId'],
        },
      },
    ];
  }

  async handle(args: unknown): Promise<string> {
    const parsed = TradeItemInput.parse(args);
    this.logger.info('trade-item', {
      from: parsed.fromActorId,
      to: parsed.toActorId,
      itemId: parsed.itemId,
      quantity: parsed.quantity ?? null,
    });
    const result: any = await this.foundryClient.query<any>('warhammer-mcp.tradeItem', parsed);
    const data = result?.data ?? result ?? {};
    const q = data.quantities
      ? ` (source qty: ${data.quantities.from}, dest qty: ${data.quantities.to})`
      : '';
    return `Traded **${data.itemName ?? parsed.itemId}** from ${data.fromActorId ?? parsed.fromActorId} → ${data.toActorId ?? parsed.toActorId}${q}.`;
  }
}
