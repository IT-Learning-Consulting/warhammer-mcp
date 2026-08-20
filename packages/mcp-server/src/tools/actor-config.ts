// Phase 1 mcp_coverage_expansion — Actor-config umbrella tool.
//
// Validated replacement for the update-actor dot-path contract.
// Covers 4 actions: get-prototype-token / update-prototype-token / get-art / set-art.
//
// CCR-1 / BUG-069: all this.query<T> calls use concrete response interfaces, never <any>.
// CCR-6: write actions (update-prototype-token, set-art) trigger notify.updated on the Foundry side.
// CCR-9: set-art covers actor.img / item.img / actor.prototypeToken.texture.src ONLY.
//   Placed-token texture.src → token {action:"update", changes:{texture:{src}}}.
//   Note: actorLink:true does not automatically sync prototypeToken.texture.src to placed tokens.

import { z } from 'zod';
import { ActorConfigToolInput, ActorId } from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type ActorConfigArgs = z.infer<typeof ActorConfigToolInput>;
type ArgsFor<A extends ActorConfigArgs['action']> = Extract<ActorConfigArgs, { action: A }>;

// ── Inline response interfaces ────────────────────────────────────────────────

interface ActorConfigGetPrototypeTokenResponse {
  actorId: ActorId;
  actorName: string;
  prototypeToken: Record<string, unknown>;
}

interface ActorConfigUpdatePrototypeTokenResponse {
  actorId: ActorId;
  actorName: string;
  requestedChanges: Record<string, unknown>;
  extraFields: Record<string, unknown> | null;
  prototypeToken: Record<string, unknown> | null;
}

interface ActorConfigGetArtResponseActor {
  target: { type: 'actor'; id: string };
  actorImg: string | null;
  prototypeTokenTextureSrc: string | null;
}

interface ActorConfigGetArtResponseItem {
  target: { type: 'item'; id: string };
  img: string | null;
}

type ActorConfigGetArtResponse = ActorConfigGetArtResponseActor | ActorConfigGetArtResponseItem;

interface ActorConfigSetArtResponse {
  target: { type: 'actor' | 'item'; id: string };
  src: string;
  which?: string;
  written: string[];
  resolvedImg?: string; // item targets — persisted img after Foundry's blank→default clean
  resolved?: Record<string, string>; // actor targets — persisted value per written path
}

// ── Utilities ─────────────────────────────────────────────────────────────────


// ── Tool class ────────────────────────────────────────────────────────────────

export interface ActorConfigToolOptions extends BaseToolOptions {}

export class ActorConfigTool extends BaseTool {
  constructor(options: ActorConfigToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'actor-config', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'actor-config',
        title: 'Actor Configuration (Prototype Token + Art)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Validated replacement for update-actor dot-path writes. Manages actor prototype-token configuration and artwork via 4 actions.

Use this when:
- Reading or writing an actor's prototype-token fields (disposition, displayName, bars, ring, movementAction, etc.) via action:"get-prototype-token" / action:"update-prototype-token".
- Reading or setting an actor's or item's artwork path via action:"get-art" / action:"set-art".
- Resetting an actor's or item's art to the document-type default icon (empty-string src).
- Making any prototype-token or art change where the field is modeled here, in preference to a raw update-actor dot-path write.

Do NOT use this for generic actor field writes outside prototype-token/art (system-tree stats, career, biography, etc.) — use update-actor for those. Do NOT use set-art to change an already-placed scene token's art — use \`token {action:"update", changes:{texture:{src}}}\` instead (see CCR-9 boundary below).

**Actions:**
- **get-prototype-token**: Read the full prototypeToken object for an actor. Required: actorId.
- **update-prototype-token**: Write validated prototype-token fields. Required: actorId, changes (≥1 field). Optional: extraFields (passthrough for unmodeled fields). Post-write verify via verifyDocWrite({readSource:true}).
- **get-art**: Read artwork paths. Required: target ({type:"actor"|"item", id}). Returns actor.img + prototypeToken.texture.src for actor targets; item.img for item targets.
- **set-art**: Write artwork paths. Required: target, src (empty string = reset art to the document-type default icon — Foundry cleans "" to mystery-man.svg / item-bag.svg; it never persists as literal ""). For actor targets, optional: which ("img"|"texture"|"both", default "both"). Writes actor.img and/or prototypeToken.texture.src. For item targets, always writes item.img. Post-write verify confirms persistence; the resolved (post-clean) path is returned in resolvedImg/resolved.

**CCR-9 / Placed-token boundary:**
set-art writes the ACTOR document (prototypeToken.texture.src), NOT placed scene tokens.
For placed-token art → use \`token {action:"update", changes:{texture:{src}}}\`.
With actorLink:true, placed tokens inherit the prototype — but Foundry does NOT automatically push prototypeToken.texture.src changes to already-placed tokens. Issue a separate token {update} if needed.

**Modeled prototype-token fields (update-prototype-token.changes):**
name, displayName, actorLink, width, height, texture, lockRotation, rotation, alpha,
disposition, displayBars, bar1, bar2, light, sight, occludable, ring, turnMarker,
movementAction, flags.
Omitted (placement-specific): x, y, elevation, shape, sort, hidden, locked, _movementHistory, _regions.
Use extraFields for any unmodeled field.

**Examples:**
- get-prototype-token: {action:"get-prototype-token", actorId:"eRf6DiZhFzEL5alu"}
- update-prototype-token: {action:"update-prototype-token", actorId:"abc", changes:{disposition:-1, displayName:50}}
- get-art: {action:"get-art", target:{type:"actor", id:"abc"}}
- set-art: {action:"set-art", target:{type:"actor", id:"abc"}, src:"icons/svg/mystery-man.svg", which:"both"}
- set-art (item): {action:"set-art", target:{type:"item", id:"xyz"}, src:"icons/equipment/sword.webp"}
- set-art (art-clear): {action:"set-art", target:{type:"actor", id:"abc"}, src:"", which:"img"}

Performance Notes:
- Action-based umbrella, no response-mode variance: each action returns a small structured result (the prototype-token object, or the resolved art path(s)) scoped to one actor/item — never a full sheet payload.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['get-prototype-token', 'update-prototype-token', 'get-art', 'set-art'],
              description: 'The actor-config action to perform.',
            },
            actorId: {
              type: 'string',
              description: '[get-prototype-token/update-prototype-token] World actor document id.',
            },
            changes: {
              type: 'object',
              description:
                '[update-prototype-token] Validated prototype-token fields to write (≥1 required). ' +
                'Modeled: name, displayName, actorLink, width, height, texture, lockRotation, rotation, alpha, ' +
                'disposition, displayBars, bar1, bar2, light, sight, occludable, ring, turnMarker, movementAction, flags.',
            },
            extraFields: {
              type: 'object',
              description:
                '[update-prototype-token] Passthrough for unmodeled fields. Keys written as prototypeToken.<key>.',
            },
            target: {
              type: 'object',
              description: '[get-art/set-art] Target discriminator: {type:"actor"|"item", id}.',
              properties: {
                type: { type: 'string', enum: ['actor', 'item'] },
                id: { type: 'string' },
              },
              required: ['type', 'id'],
            },
            src: {
              type: 'string',
              description: '[set-art] Art path to write. Empty string = reset art to the document-type default icon (Foundry cleans "" to the default; never persists "").',
            },
            which: {
              type: 'string',
              enum: ['img', 'texture', 'both'],
              description:
                '[set-art, actor targets only] Which art field to write: ' +
                '"img" = actor.img only, "texture" = prototypeToken.texture.src only, "both" = both (default).',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: ActorConfigArgs) {
    this.logger.info('Executing actor-config action', { action: args.action });
    switch (args.action) {
      case 'get-prototype-token':
        return this.handleGetPrototypeToken(args);
      case 'update-prototype-token':
        return this.handleUpdatePrototypeToken(args);
      case 'get-art':
        return this.handleGetArt(args);
      case 'set-art':
        return this.handleSetArt(args);
      default:
        // BUG-439: an unknown action must throw (clean isError envelope via the
        // dispatch catch) instead of falling through to an undefined result.
        throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: get-prototype-token, update-prototype-token, get-art, set-art`);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  private async handleGetPrototypeToken(args: ArgsFor<'get-prototype-token'>) {
    try {
      const data = await this.query<ActorConfigGetPrototypeTokenResponse>('actor-config', args);
      const text =
        `🎭 **Prototype Token** — ${data.actorName} (\`${data.actorId}\`)\n\n` +
        `\`\`\`json\n${JSON.stringify(data.prototypeToken, null, 2)}\n\`\`\``;
      // BUG-436: additive structuredContent (byte-identical text) so structured-field graders/consumers
      // observe prototypeToken/disposition/etc. directly instead of parsing the embedded-JSON text.
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('get-prototype-token', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdatePrototypeToken(args: ArgsFor<'update-prototype-token'>) {
    try {
      const data = await this.query<ActorConfigUpdatePrototypeTokenResponse>('actor-config', args);
      const changedFields = Object.keys(data.requestedChanges);
      const text =
        `✅ **Prototype Token Updated** — ${data.actorName} (\`${data.actorId}\`)\n\n` +
        `**Changed fields:** ${changedFields.join(', ')}` +
        (data.extraFields && Object.keys(data.extraFields).length > 0
          ? `\n**Extra fields:** ${Object.keys(data.extraFields).join(', ')}`
          : '');
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('update-prototype-token', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGetArt(args: ArgsFor<'get-art'>) {
    try {
      const data = await this.query<ActorConfigGetArtResponse>('actor-config', args);
      let text: string;
      if (data.target.type === 'actor') {
        const d = data as ActorConfigGetArtResponseActor;
        text =
          `🖼️ **Actor Art** — \`${d.target.id}\`\n\n` +
          `- **actor.img:** ${d.actorImg ?? '_(none)_'}\n` +
          `- **prototypeToken.texture.src:** ${d.prototypeTokenTextureSrc ?? '_(none)_'}`;
      } else {
        const d = data as ActorConfigGetArtResponseItem;
        text = `🖼️ **Item Art** — \`${d.target.id}\`\n\n- **item.img:** ${d.img ?? '_(none)_'}`;
      }
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('get-art', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSetArt(args: ArgsFor<'set-art'>) {
    try {
      const data = await this.query<ActorConfigSetArtResponse>('actor-config', args);
      const cleared = data.src === '';
      const artLabel = cleared ? '_(cleared → reset to default)_' : `\`${data.src}\``;
      let text =
        `✅ **Art ${cleared ? 'Cleared' : 'Set'}** — ${data.target.type} \`${data.target.id}\`\n\n` +
        `- **src:** ${artLabel}\n` +
        `- **Written fields:** ${data.written.join(', ')}`;
      // Surface the post-clean persisted path(s) so the caller sees what "clear" resolved to.
      if (data.resolvedImg !== undefined) {
        text += `\n- **Resolved img:** \`${data.resolvedImg}\``;
      }
      if (data.resolved && Object.keys(data.resolved).length > 0) {
        const parts = Object.entries(data.resolved).map(([k, v]) => `${k}=\`${v || '(empty)'}\``);
        text += `\n- **Resolved:** ${parts.join(', ')}`;
      }
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('set-art', e instanceof Error ? e.message : String(e));
    }
  }
}
