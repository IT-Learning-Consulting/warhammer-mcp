// Phase wfrp-disease — bidirectional event-push transport schemas.
// EventEnvelope carries async events from the foundry-module to the mcp-server
// via the revived SocketBridge.emitToServer channel.

import { z } from 'zod';

export const RollResultPayloadSchema = z.object({
  outcome: z.string(),
  SL: z.number(),
  success: z.boolean(),
});

export type RollResultPayload = z.infer<typeof RollResultPayloadSchema>;

export const EventEnvelopeSchema = z.discriminatedUnion('event_type', [
  z.object({
    event_type: z.literal('roll-result'),
    requestId: z.string(), // not a document id — leave bare (Phase 1 design)
    payload: RollResultPayloadSchema,
  }),
]);

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
