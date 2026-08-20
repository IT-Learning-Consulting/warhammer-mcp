// Phase 5 mcp_crud_expansion — Token umbrella tool (9 actions).
//
// Wraps the `token` Foundry-side handler (dispatchToken).
// Actions: create / update / delete / get / list / add / delete-token / mount / dismount.
// add + delete-token were migrated from the scene umbrella; mount + dismount
// (BUG-190) replicate wfrp4e's native mount linkage.
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through this.errorResponse().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.
//
// **actorLinked:** ViewModel surfaces this FK-orphan flag. Surfaces in get
// (stale-FK warning when false) and in list formatter.

import { z } from 'zod';
import {
  TokenToolInput,
  type TokenViewModel,
  type TokenListItem,
  SceneId,
  TokenId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type TokenArgs = z.infer<typeof TokenToolInput>;
type ArgsFor<A extends TokenArgs['action']> = Extract<TokenArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler data payloads) ──

interface TokenCreateResponse {
  token: TokenViewModel;
  requestedChanges: Record<string, unknown>;
}
interface TokenUpdateResponse {
  token: TokenViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface TokenDeleteResponse {
  deletedId: string; // not a branded id (polymorphic / non-document)
  deletedName: string;
  sceneId: SceneId;
  remainingTokens: number;
}
interface TokenGetResponse {
  token: TokenViewModel;
}
interface TokenListResponse {
  tokens: TokenListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: false;
  filterApplied?: string | null;
}
// BUG-435: canonical LEAN countOnly shape (discriminated by countOnly:true).
interface TokenListCountResponse {
  total: number;
  filterApplied: string | null;
  countOnly: true;
}
interface TokenAddResponse {
  sceneId: SceneId;
  added: number;
  tokenIds: TokenId[];
  placement: string;
  // RC1.2 (mcp_code_quality_v2 Phase C1) — additive batch partial-failure detail.
  failedItems?: Array<{ id: string; reason: string }>;
  warnings?: string[];
}
// BUG-190 — mount/dismount (wfrp4e native mount linkage).
interface TokenMountResponse {
  sceneId: SceneId;
  riderTokenId: TokenId;
  mountTokenId: TokenId;
  riderName: string;
  mountName: string;
  mountData: Record<string, unknown>;
  dryRun: boolean;
  warnings: string[];
  updatedDocumentIds?: string[];
}
interface TokenDismountResponse {
  sceneId: SceneId;
  riderTokenId: TokenId;
  riderName: string;
  previousMountTokenId: string | null;
  dryRun: boolean;
  warnings: string[];
  updatedDocumentIds?: string[];
}

// ── Utilities ────────────────────────────────────────────────────────────────


const DISPOSITION_LABEL: Record<number, string> = {
  [-2]: 'SECRET',
  [-1]: 'HOSTILE',
  0: 'NEUTRAL',
  1: 'FRIENDLY',
};

function dispositionLabel(d: number): string {
  return DISPOSITION_LABEL[d] ?? String(d);
}

function formatTokenView(t: TokenViewModel): string {
  const orphanWarn = !t.actorLinked && t.actorId
    ? `\n> ⚠️ **Stale FK:** actorId \`${t.actorId}\` no longer exists in game.actors.`
    : '';
  const combat = t.combatSnapshot
    ? [
        `### Effective Combat Snapshot`,
        `- schema: ${t.combatSnapshot.schema} · actor type: ${t.combatSnapshot.actorType}`,
        `- Wounds: ${t.combatSnapshot.wounds.value}/${t.combatSnapshot.wounds.max} · ` +
          `WS: ${t.combatSnapshot.characteristics.ws?.value ?? '—'} · BS: ${t.combatSnapshot.characteristics.bs?.value ?? '—'}`,
        `- Conditions: ${t.combatSnapshot.conditions.map((c) => `${c.key}${c.value > 1 ? ` ${c.value}` : ''}`).join(', ') || '(none)'}`,
        `- Equipped weapons: ${t.combatSnapshot.weapons.filter((w) => w.equipped).map((w) => `${w.name} [${w.attackType}, Damage ${w.damage}]`).join(', ') || '(none)'}`,
        `- Active Effects captured: ${t.combatSnapshot.effects.filter((effect) => !effect.disabled).length}`,
        ``,
      ]
    : [];
  return [
    `## Token \`${t.id}\``,
    `**Scene:** \`${t.sceneId}\``,
    orphanWarn,
    ``,
    `### Identity`,
    `- Name: **${t.name || '(unnamed)'}** · Disposition: ${dispositionLabel(t.disposition)} (${t.disposition})`,
    `- actorId: ${t.actorId ? `\`${t.actorId}\`` : '_(none)_'} · actorLinked: ${t.actorLinked ? 'yes' : 'no'} · actorLink: ${t.actorLink ? 'yes' : 'no'}`,
    `- delta overrides: ${t.delta ? (t.delta.hasOverrides ? 'yes' : 'no') : 'n/a'}`,
    ``,
    `### Position & Geometry`,
    `- x: ${t.x}, y: ${t.y}, elevation: ${t.elevation}, sort: ${t.sort}`,
    `- width: ${t.width}, height: ${t.height}, shape: ${t.shape}, rotation: ${t.rotation}°, alpha: ${t.alpha}`,
    ``,
    `### Display`,
    `- displayName: ${t.displayName} · displayBars: ${t.displayBars}`,
    `- hidden: ${t.hidden ? 'yes' : 'no'} · locked: ${t.locked ? 'yes' : 'no'} · lockRotation: ${t.lockRotation ? 'yes' : 'no'}`,
    `- bar1: ${t.bar1.attribute ?? '_(none)_'} · bar2: ${t.bar2.attribute ?? '_(none)_'}`,
    ``,
    `### Sight`,
    `- enabled: ${t.sight.enabled ? 'yes' : 'no'} · range: ${t.sight.range ?? '_(none)_'} · angle: ${t.sight.angle}°`,
    `- visionMode: ${t.sight.visionMode} · color: ${t.sight.color ?? '_(none)_'}`,
    `- attenuation: ${t.sight.attenuation}, brightness: ${t.sight.brightness}, saturation: ${t.sight.saturation}, contrast: ${t.sight.contrast}`,
    ``,
    `### Texture`,
    `- src: ${t.texture.src ? `\`${t.texture.src}\`` : '_(none)_'}`,
    `  - anchor: (${t.texture.anchorX}, ${t.texture.anchorY}), offset: (${t.texture.offsetX}, ${t.texture.offsetY})`,
    `  - scale: (${t.texture.scaleX}, ${t.texture.scaleY}), rotation: ${t.texture.rotation}°, tint: ${t.texture.tint}`,
    ``,
    `### Movement`,
    `- movementAction: ${t.movementAction ?? '_(none)_'}`,
    ...(combat.length ? [``, ...combat] : []),
  ].filter((l) => l !== undefined).join('\n');
}

function formatTokenListItem(t: TokenListItem): string {
  const orphan = !t.actorLinked && t.actorId ? ' ⚠️stale-FK' : '';
  const actor = t.actorId ? ` → actor \`${t.actorId}\`${orphan}` : ' _(unlinked)_';
  return (
    `- **${t.name || '(unnamed)'}** \`${t.id}\` @ scene \`${t.sceneId}\`` +
    ` · ${dispositionLabel(t.disposition)}` +
    actor +
    (t.hidden ? ' · _hidden_' : '')
  );
}

export interface TokenToolOptions extends BaseToolOptions {}

export class TokenTool extends BaseTool {
  constructor(options: TokenToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'token', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'token',
        title: 'Manage Tokens',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT TokenDocument objects via 9 actions (embedded-doc CRUD + list + bulk-add + delete-token + wfrp4e mount/dismount). Tokens live on scenes (scene.tokens collection).

Use this when:
- Placing, updating, or removing a raw TokenDocument's placement/art/vision/disposition fields on a scene (create/update/delete/delete-token).
- Reading a single token's state, optionally including its effective synthetic WFRP Actor combat snapshot (get + includeCombatSnapshot:true).
- Listing/filtering tokens on a scene cheaply via countOnly:true, or with full pagination for a detailed roster.
- Bulk-placing prototype tokens for one or more actors in one call (add).
- Linking/unlinking a rider token to a mount using the wfrp4e system's native mount mechanics (mount/dismount).

Do NOT use this for WFRP advancement writes to a token's ActorDelta (e.g. applying a template) — use apply-template-to-token instead, which targets the synthetic actor's advancement data rather than raw TokenDocument fields.

**Actions:**
- **create**: Place a new Token on a scene. Required: sceneId, name, x, y. Optional: full write surface (actorId, actorLink, width/height, texture, shape, elevation, sort, locked, lockRotation, rotation, alpha, hidden, disposition, displayName, displayBars, bar1, bar2, light, sight, occludable, ring, turnMarker, movementAction, flags). Returns full TokenViewModel.
- **update**: Partial-diff update. sceneId + tokenId + changes (≥1 field). Same writable surface as create.
- **delete**: Remove a single Token from the scene (embedded-CRUD style, requires sceneId + tokenId). ⚠️ Irreversible.
- **get**: Fetch a single token by sceneId + tokenId. Returns full TokenViewModel. Warns on stale actorId FK (actorLinked: false). Set includeCombatSnapshot:true to include the effective synthetic WFRP Actor state (ActorDelta + active effects, characteristics, Wounds, armour, conditions, skills, traits, weapons).
- **list**: List tokens on a scene. sceneId optional (defaults to active scene). Filters: hidden (boolean), onlyLinked (boolean), filter (name substring). Pagination: page/pageSize (1-100). countOnly=true for cheap inventory probe.
- **add**: Bulk-drop prototype tokens for one or more actors. Required: actorIds[]. Optional: quantities[] (per-actor count, defaults 1), placement (random/grid/center), hidden, sceneId. Returns placed tokenIds + per-actor summary.
- **delete-token**: Remove a token by sceneId + tokenId (migrated from scene umbrella). Action key is 'delete-token' (distinct from 'delete').
- **mount**: Link a rider token onto a mount token using the wfrp4e system's NATIVE mount mechanics (same writes as the token-HUD horse button). Required: sceneId, riderTokenId, mountTokenId. Optional: dryRun (preview, zero writes). Once linked the SYSTEM handles everything: the mount token follows the rider's movement, the rider inherits the mount's Move/Walk/Run, charge math uses mount speed, and the rider auto-dismounts if the mount drops to 0 wounds. Explicit roles are honored — a rider LARGER than its mount is allowed with a SIZE_INVERSION warning (the HUD auto-swaps; this API does not). Both tokens must have actors.
- **dismount**: Clear a rider token's mount linkage (full system.status.mount reset + flags.wfrp4e.mount removal). Required: sceneId, riderTokenId. Optional: dryRun. Rejects with TOKEN_DISMOUNT_NOT_MOUNTED when no linkage exists.

**actorLinked:** True iff actorId is set AND the referenced Actor currently exists. False = stale FK (actor was deleted). Surfaced in get (with warning) and list.

**Disposition** (CONST.TOKEN_DISPOSITIONS): -2=SECRET, -1=HOSTILE, 0=NEUTRAL, 1=FRIENDLY.
**DisplayName/DisplayBars** (CONST.TOKEN_DISPLAY_MODES): 0=NONE, 10=CONTROL, 20=OWNER_HOVER, 30=HOVER, 40=OWNER, 50=ALWAYS.
**Shape** (CONST.TOKEN_SHAPES): 0–5 (4=RECTANGLE_1 default).

**Examples:**
- create: {action:"create", sceneId:"abc", name:"Goblin", x:200, y:300, actorId:"xyz", disposition:-1}
- update: {action:"update", sceneId:"abc", tokenId:"tok1", changes:{hidden:true, disposition:0}}
- delete: {action:"delete", sceneId:"abc", tokenId:"tok1"}
- get: {action:"get", sceneId:"abc", tokenId:"tok1"}
- list: {action:"list", sceneId:"abc", hidden:false, onlyLinked:true}
- add: {action:"add", actorIds:["actor1","actor2"], quantities:[2,1], placement:"grid"}
- delete-token: {action:"delete-token", sceneId:"abc", tokenId:"tok1"}
- mount: {action:"mount", sceneId:"abc", riderTokenId:"tokKnight", mountTokenId:"tokHorse"}
- dismount: {action:"dismount", sceneId:"abc", riderTokenId:"tokKnight"}

Performance Notes:
- get: full TokenViewModel by default; includeCombatSnapshot:true adds the synthetic Actor combat state (characteristics, wounds, armour, conditions, skills, traits, weapons) — noticeably larger response, opt-in only when needed.
- list: countOnly:true returns just {total} for a cheap probe; otherwise paginated (page/pageSize, max 100 per page).
- create/update/delete/delete-token/add/mount/dismount: single small response scoped to the affected token(s), no scene-wide payload.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list', 'add', 'delete-token', 'mount', 'dismount'],
              description: 'The token action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[create/update/delete/get/delete-token/mount/dismount] Required scene ID. [list/add] Optional — defaults to active scene.',
            },
            tokenId: {
              type: 'string',
              description: '[update/delete/get/delete-token] Token document ID.',
            },
            includeCombatSnapshot: {
              type: 'boolean',
              description: '[get] Include the effective synthetic WFRP Actor combat state (larger read payload).',
            },
            // create writable fields (flat)
            name: { type: 'string', description: '[create] Required token name.' },
            x: { type: 'number', description: '[create] Required x-coordinate.' },
            y: { type: 'number', description: '[create] Required y-coordinate.' },
            actorId: { type: ['string', 'null'], description: '[create/update.changes] Linked actor document ID.' },
            actorLink: { type: 'boolean', description: '[create/update.changes] Whether token is linked to actor data.' },
            width: { type: 'number', description: '[create/update.changes] Token width in grid units.' },
            height: { type: 'number', description: '[create/update.changes] Token height in grid units.' },
            texture: {
              type: 'object',
              description: '[create/update.changes] TextureData: {src?, anchorX?, anchorY?, offsetX?, offsetY?, fit?, scaleX?, scaleY?, rotation?, tint?, alphaThreshold?}',
            },
            shape: { type: 'integer', minimum: 0, maximum: 5, description: '[create/update.changes] TOKEN_SHAPES 0-5 (4=RECTANGLE_1).' },
            elevation: { type: 'number', description: '[create/update.changes] Token elevation.' },
            sort: { type: 'integer', description: '[create/update.changes] Rendering sort order.' },
            locked: { type: 'boolean', description: '[create/update.changes] Lock the token in place.' },
            lockRotation: { type: 'boolean', description: '[create/update.changes] Prevent manual rotation.' },
            rotation: { type: 'number', minimum: 0, maximum: 360, description: '[create/update.changes] Facing rotation 0-360°.' },
            alpha: { type: 'number', minimum: 0, maximum: 1, description: '[create/update.changes] Transparency 0-1.' },
            hidden: { type: 'boolean', description: '[create/update.changes/list] Hidden from players.' },
            disposition: {
              type: 'integer',
              minimum: -2,
              maximum: 1,
              description: '[create/update.changes] TOKEN_DISPOSITIONS: -2=SECRET,-1=HOSTILE,0=NEUTRAL,1=FRIENDLY.',
            },
            displayName: {
              type: 'integer',
              description: '[create/update.changes] TOKEN_DISPLAY_MODES: 0/10/20/30/40/50.',
            },
            displayBars: {
              type: 'integer',
              description: '[create/update.changes] TOKEN_DISPLAY_MODES: 0/10/20/30/40/50.',
            },
            bar1: { type: 'object', description: '[create/update.changes] {attribute: string|null}.' },
            bar2: { type: 'object', description: '[create/update.changes] {attribute: string|null}.' },
            light: {
              type: 'object',
              description: '[create/update.changes] LightData sub-object (dim, bright, color, angle, animation, darkness, etc).',
            },
            sight: {
              type: 'object',
              description: '[create/update.changes] {enabled?, range?, angle?, visionMode?, color?, attenuation?, brightness?, saturation?, contrast?}.',
            },
            occludable: { type: 'object', description: '[create/update.changes] {radius?: number}.' },
            ring: {
              type: 'object',
              description: '[create/update.changes] {enabled?, colors?:{ring?,background?}, effects?, subject?:{scale?,texture?}}.',
            },
            turnMarker: {
              type: 'object',
              description: '[create/update.changes] {mode?, animation?, src?, disposition?}.',
            },
            movementAction: { type: ['string', 'null'], description: '[create/update.changes] Movement action string (nullable).' },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // update
            changes: {
              type: 'object',
              description: '[update] Partial-diff of writable Token fields. Must contain ≥1 field.',
            },
            // list
            filter: { type: 'string', description: '[list] Substring match on token name.' },
            onlyLinked: { type: 'boolean', description: '[list] Show only tokens with actorLink=true.' },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 50, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total} only.' },
            // add
            actorIds: {
              type: 'array',
              items: { type: 'string' },
              description: '[add] Required. Actor document IDs to place as tokens.',
            },
            quantities: {
              type: 'array',
              items: { type: 'integer' },
              description: '[add] Per-actor token count. Must match actorIds length; defaults to 1 each.',
            },
            placement: {
              type: 'string',
              enum: ['random', 'grid', 'center'],
              description: '[add] Token placement strategy (default: random).',
            },
            // mount / dismount (BUG-190)
            riderTokenId: {
              type: 'string',
              description: '[mount/dismount] Rider token document ID (the token that sits ON the mount). Must have an actor.',
            },
            mountTokenId: {
              type: 'string',
              description: '[mount] Mount token document ID (the creature being ridden). Must have an actor.',
            },
            dryRun: {
              type: 'boolean',
              description: '[mount/dismount] Preview the planned writes without persisting anything.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: TokenArgs) {
    this.logger.info('Executing token action', { action: args.action });
    switch (args.action) {
      case 'create':
        return this.handleCreate(args);
      case 'update':
        return this.handleUpdate(args);
      case 'delete':
        return this.handleDelete(args);
      case 'get':
        return this.handleGet(args);
      case 'list':
        return this.handleList(args);
      case 'add':
        return this.handleAdd(args);
      case 'delete-token':
        return this.handleDeleteToken(args);
      case 'mount':
        return this.handleMount(args);
      case 'dismount':
        return this.handleDismount(args);
      default:
        // BUG-439: an unknown action must throw (clean isError envelope via the
        // dispatch catch) instead of falling through to an undefined result.
        throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: create, update, delete, get, list, add, delete-token, mount, dismount`);
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<TokenCreateResponse>('token', args);
      const reqFields = Object.keys(data.requestedChanges)
        .filter((k) => k !== 'action' && k !== 'sceneId')
        .join(', ') || '(name/x/y only)';
      const text =
        `🎭 **Token Created**\n\n${formatTokenView(data.token)}\n\n` +
        `_Requested fields: ${reqFields}_`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<TokenUpdateResponse>('token', args);
      const text =
        `✏️ **Token Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatTokenView(data.token)}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<TokenDeleteResponse>('token', args);
      const text =
        `🗑️ **Token Deleted**\n\n` +
        `**ID:** \`${data.deletedId}\` · **Name:** ${data.deletedName}\n` +
        `**Scene:** \`${data.sceneId}\` · **Remaining tokens:** ${data.remainingTokens}\n\n` +
        `⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<TokenGetResponse>('token', args);
      return { content: [{ type: 'text' as const, text: formatTokenView(data.token) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<TokenListResponse | TokenListCountResponse>('token', args);

      if (data.countOnly) {
        const text = `🎭 **Token count**\n\n**Total:** ${data.total}${data.filterApplied ? `\n**Filter:** \`${data.filterApplied}\`` : ''}`;
        return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
      }

      if (data.tokens.length === 0) {
        return { content: [{ type: 'text' as const, text: '🎭 **No Tokens Found**' }], structuredContent: data as unknown as Record<string, unknown> };
      }

      const pageInfo = `page ${data.page} · ${data.tokens.length} of ${data.total} total`;
      const lines = data.tokens.map(formatTokenListItem);
      const text = `🎭 **Tokens** (${pageInfo})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleAdd(args: ArgsFor<'add'>) {
    try {
      const data = await this.query<TokenAddResponse>('token', args);
      const idList = data.tokenIds.length > 0
        ? data.tokenIds.map((id) => `  - \`${id}\``).join('\n')
        : '  _(none)_';
      // RC1.2 (mcp_code_quality_v2 Phase C1) — surface failedItems[]/BATCH_PARTIAL_FAILURE in the
      // TEXT rendering, not just structuredContent (PF-013: a real MCP-client grading/consumer
      // agent only observes content[].text). CCR-V4: never bury a partial failure in freetext only.
      const failedItemsBlock = data.failedItems && data.failedItems.length > 0
        ? `\n\n⚠️ **${data.failedItems.length} target(s) did not apply:**\n` +
          data.failedItems.map((f) => `  - \`${f.id}\`: ${f.reason}`).join('\n')
        : '';
      // RC1.2 — coarse signal alongside the failedItems detail above (never the ONLY
      // partial-failure surface, per CCR-V4; mirrors ownership.ts).
      const batchBlock = data.warnings?.includes('BATCH_PARTIAL_FAILURE')
        ? `\n\n⚠️ BATCH_PARTIAL_FAILURE — ${data.failedItems?.length ?? 0} target(s) did not apply (see detail above).`
        : '';
      const text =
        `🎭 **Tokens Added**\n\n` +
        `**Scene:** \`${data.sceneId}\`\n` +
        `**Placed:** ${data.added} token(s) · **Placement:** ${data.placement}\n\n` +
        `**Token IDs:**\n${idList}` +
        failedItemsBlock +
        batchBlock;
      // Phase 12 R12.2: expose the operation receipt (+ add fields) via structuredContent. token.add has no
      // outputSchema/DTO (plan decision), so the raw query result flows through untyped; text is unchanged.
      return { content: [{ type: 'text' as const, text }], structuredContent: data };
    } catch (e) {
      return this.errorResponse('add', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeleteToken(args: ArgsFor<'delete-token'>) {
    try {
      const data = await this.query<TokenDeleteResponse>('token', args);
      const text =
        `🗑️ **Token Removed**\n\n` +
        `**ID:** \`${data.deletedId}\` · **Name:** ${data.deletedName}\n` +
        `**Scene:** \`${data.sceneId}\` · **Remaining tokens:** ${data.remainingTokens}\n\n` +
        `⚠️ Permanent.`;
      // BUG-436: additive structuredContent (byte-identical text) so structured-field assertions on
      // remainingTokens/deletedId observe the field directly instead of inferring from prose.
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('delete-token', e instanceof Error ? e.message : String(e));
    }
  }

  // ── mount / dismount (BUG-190 — wfrp4e native mount linkage) ─────────────

  private async handleMount(args: ArgsFor<'mount'>) {
    try {
      const data = await this.query<TokenMountResponse>('token', args);
      const warningsBlock = data.warnings.length > 0
        ? `\n\n**Warnings:**\n${data.warnings.map((w) => `- ⚠️ ${w}`).join('\n')}`
        : '';
      const writesBlock = Object.entries(data.mountData)
        .map(([k, v]) => `- \`${k}\` → \`${JSON.stringify(v)}\``)
        .join('\n');
      const header = data.dryRun ? '🐎 **Mount (dry run — nothing written)**' : '🐎 **Mounted**';
      const text =
        `${header}\n\n` +
        `**Rider:** ${data.riderName} \`${data.riderTokenId}\`\n` +
        `**Mount:** ${data.mountName} \`${data.mountTokenId}\` · **Scene:** \`${data.sceneId}\`\n\n` +
        `**Rider-actor writes${data.dryRun ? ' (planned)' : ''}:**\n${writesBlock}\n` +
        `**Rider-token writes${data.dryRun ? ' (planned)' : ''}:** \`flags.wfrp4e.mount\` → \`"${data.mountTokenId}"\` + snap to mount x/y` +
        warningsBlock +
        (data.dryRun ? '' : `\n\n_The wfrp4e system now handles follow-movement, shared Move/Walk/Run, charge math, and auto-dismount at 0 mount wounds natively._`);
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('mount', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDismount(args: ArgsFor<'dismount'>) {
    try {
      const data = await this.query<TokenDismountResponse>('token', args);
      const warningsBlock = data.warnings.length > 0
        ? `\n\n**Warnings:**\n${data.warnings.map((w) => `- ⚠️ ${w}`).join('\n')}`
        : '';
      const header = data.dryRun ? '🐎 **Dismount (dry run — nothing written)**' : '🐎 **Dismounted**';
      const text =
        `${header}\n\n` +
        `**Rider:** ${data.riderName} \`${data.riderTokenId}\` · **Scene:** \`${data.sceneId}\`\n` +
        `**Previous mount token:** ${data.previousMountTokenId ? `\`${data.previousMountTokenId}\`` : '_(actor-side linkage only)_'}\n\n` +
        `${data.dryRun ? 'Planned' : 'Applied'}: full \`system.status.mount\` reset on the rider actor + \`flags.wfrp4e.mount\` removal on the rider token.` +
        warningsBlock;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('dismount', e instanceof Error ? e.message : String(e));
    }
  }
}
