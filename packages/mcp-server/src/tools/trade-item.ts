import { TradeItemInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface TradeItemToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class TradeItemTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'trade-item', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'trade-item',
        title: 'Trade Item',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
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
    const result: any = await this.query<any>('tradeItem', parsed);
    // BUG-325: BaseTool.query() already unwraps the envelope; drop the dead ?.data operand
    const data = result ?? {};
    const q = data.quantities
      ? ` (source: ${data.quantities.from === 0 ? 'item fully removed (was qty ' + (parsed.quantity ?? 'all') + ')' : 'qty ' + data.quantities.from + ' remaining'}; destination: qty ${data.quantities.to})`
      : '';
    return `Traded **${data.itemName ?? parsed.itemId}** from ${data.fromActorId ?? parsed.fromActorId} → ${data.toActorId ?? parsed.toActorId}${q}.`;
  }
}
