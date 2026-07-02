// wfrp_layer_expansion_v1 Phase 6 (P-10) — availability-test tool (single-action primitive).
//
// Wraps the warhammer-mcp.availability-test Foundry handler (dispatchAvailabilityTest).
// HC2: the d100 is rolled by the sheet/GM and passed in as `rolledTotal`; this tool +
// its handler NEVER roll. The handler posts a GM market-result ChatMessage (the
// verifiable write) and returns the resolved availability.
//
// CCR-Envelope-Consumer: execute() uses a concrete typed generic on this.query<...> —
// no <any>, no `.success` check (BaseTool.query returns bare unwrapped data, throws on
// failure). BUG-069 compliance.

import { z } from 'zod';
import {
  AvailabilityTestInput,
  type AvailabilityTestResponse,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions, type ToolRegistration } from '../base-tool.js';

type AvailabilityTestArgs = z.infer<typeof AvailabilityTestInput>;

export interface AvailabilityTestToolOptions extends BaseToolOptions {}

export class AvailabilityTestTool extends BaseTool {
  constructor(options: AvailabilityTestToolOptions) {
    super(options);
  }

  getRegistration(): ToolRegistration[] {
    return [{ name: 'availability-test', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'availability-test',
        title: 'WFRP4e Market Availability Test',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Resolve WFRP4e market availability (Core p.293 / MarketWFRP4e) for an item of a given rarity in a settlement, from a PRE-ROLLED d100. Posts a GM-visible market-result chat card and returns the resolved availability + stock.

This tool NEVER rolls — the d100 Availability Test is a sheet/GM roll (HC2). Roll it (e.g. via dice-roll or the sheet) and pass the modified total as \`rolledTotal\`. For dice-formula stock (Town stock is "2d10"/"1d10"/"1d5"), also pre-roll the quantity and pass it as \`stockRolled\`; Village/Rare static stock and City "∞" need no \`stockRolled\`.

**Lookup:** village/town/city × common/scarce/rare/exotic → {test target, stock}. Item is available when target > 0 and rolledTotal <= target. **Exotic is never available** (target 0) in any settlement.

**Errors:** AVAILABILITY_TEST_INVALID_SETTLEMENT / _INVALID_RARITY (bad key); AVAILABILITY_TEST_STOCK_ROLL_REQUIRED (dice-formula stock with no stockRolled); AVAILABILITY_TEST_NOT_PERSISTED (the result chat message failed to post).`,
        inputSchema: {
          type: 'object',
          properties: {
            settlement: {
              type: 'string',
              enum: ['village', 'town', 'city'],
              description: 'Settlement size.',
            },
            rarity: {
              type: 'string',
              enum: ['common', 'scarce', 'rare', 'exotic'],
              description: 'Item rarity. Exotic is never available.',
            },
            rolledTotal: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Pre-rolled (already modified) d100 Availability Test total. This tool never rolls.',
            },
            stockRolled: {
              type: 'integer',
              minimum: 0,
              description: 'Pre-rolled stock quantity. Required only for dice-formula stock (Town).',
            },
            itemName: {
              type: 'string',
              description: 'Optional item name for the chat-card flavor.',
            },
          },
          required: ['settlement', 'rarity', 'rolledTotal'],
        },
      },
    ];
  }

  async execute(args: AvailabilityTestArgs) {
    this.logger.info('Executing availability-test', {
      settlement: args.settlement,
      rarity: args.rarity,
    });
    try {
      const data = await this.query<AvailabilityTestResponse>('availability-test', args);
      const stockLine =
        data.quantity === '∞'
          ? 'unlimited (city)'
          : `${data.quantity}`;
      const text = data.isAvailable
        ? `🛒 **Available** — ${args.itemName ?? data.rarity} in a ${data.settlement}\n\n` +
          `Rolled **${data.rolledTotal}** ≤ target **${data.targetNumber}** → in stock: **${stockLine}**\n` +
          `_Market card posted_ \`${data.messageId}\``
        : `🚫 **Unavailable** — ${args.itemName ?? data.rarity} in a ${data.settlement}\n\n` +
          (data.targetNumber === 0
            ? `Exotic items are never available in any settlement.`
            : `Rolled **${data.rolledTotal}** > target **${data.targetNumber}**.`) +
          `\n_Market card posted_ \`${data.messageId}\``;
      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('availability-test', e instanceof Error ? e.message : String(e));
    }
  }
}
