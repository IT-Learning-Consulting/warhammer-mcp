import {
  CreateCustomItemInputSchema,
  buildSystemForSubtype,
  buildEffectPayload,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface CreateCustomItemToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class CreateCustomItemTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'create-custom-item',
        title: 'Create Custom Item',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: `Create a custom WFRP4e Item — world-scope (the Items sidebar, Foundry's canonical item library, see https://foundryvtt.com/article/items/) or actor-embedded. Supports 25 itemType branches (18 core + 7 module-contributed) with optional Active Effects at creation time and optional compendium-clone seeding.

**Destination (required, no default — caller decides):**
- World scope (primary use case): \`destination: { type: "world", folder?: ["Custom", "Weapons"] }\` — folder chain is auto-created if missing; omit \`folder\` for root placement.
- Actor scope: \`destination: { type: "actor", actorName: "Hans" }\` OR \`{ type: "actor", actorId: "<id>" }\` — embeds on the resolved actor.

**Core subtypes (18):**
weapon, armour, trapping, ammunition, container, spell, prayer, talent, career, skill, trait, mutation, critical, disease, template, cargo, injury, psychology.

**Module-contributed subtypes (require matching module active):**
- \`forien-armoury.grimoire\`, \`forien-armoury.scroll\` (Forien's Armoury)
- \`wfrp4e-dwarfs.rune\` (The Dwarfs — note: rune effects do NOT auto-transfer to the owning actor; they move onto the inscribed item on completion)
- \`wfrp4e-soc.chanty\` (Sea of Claws)
- \`wfrp4e-helf.technique\` (The High Elves — UI label "Sword Dance")
- \`wfrp4e-archives3.cant\`, \`wfrp4e-archives3.armour\` (Archives of the Empire III)

**Active Effects at creation time:** pass \`effects: [{ name, trigger, script, ... }]\`. Trigger keys are the 53 WFRP4e/warhammer-lib trigger slugs (e.g. \`rollWeaponTest\`, \`prePrepareData\`, \`immediate\`, \`endTurn\`). Scripts run in Foundry context — caller trust required.

**Compendium seeding:** \`fromCompendium: "Compendium.<pack>.Item.<id>"\` clones the source (preserving its effects), strips source IDs, then merges your overrides on top.

**Response:** lean by default — \`{itemId, itemName, itemType, scope, folderId?, folderPath?}\`. Pass \`returnFullPayload: true\` for the full itemData echo (opt-in to avoid bandwidth on bulk creates).

**Examples:**
- Spell at actor scope: \`{ itemType: "spell", name: "Firebolt", lore: "fire", cn: 5, destination: { type: "actor", actorName: "Hans" } }\`
- Weapon cloned at world scope: \`{ itemType: "weapon", name: "Fire Sword", fromCompendium: "Compendium.wfrp4e-core.items.Item.<longsword-id>", damage: "SB+6", destination: { type: "world", folder: ["Homebrew", "Armor"] } }\`
- Grimoire: \`{ itemType: "forien-armoury.grimoire", name: "Tome of Ulric", spells: [{name: "Wolf Form", uuid: "..."}], destination: { type: "world" } }\`

Security: script / preApplyScript / enableScript fields are executed by Foundry under GM authority. MCP does not sandbox script content. Only invoke with scripts you wrote or audited.`,
        inputSchema: {
          type: 'object',
          additionalProperties: true,
          properties: {
            itemType: {
              type: 'string',
              description:
                'Item subtype discriminator. One of 18 core names or 7 dotted module keys. See tool description.',
            },
            name: { type: 'string', description: 'Item name.' },
            img: { type: 'string', description: 'Icon path (optional).' },
            description: { type: 'string', description: 'Item description (optional).' },
            gmdescription: { type: 'string', description: 'GM-only description (optional).' },
            fromCompendium: {
              type: 'string',
              description:
                "Optional compendium UUID (\"Compendium.<pack>.Item.<id>\") to clone from. User fields override source fields.",
            },
            effects: {
              type: 'array',
              description:
                'Optional Active Effects to attach. Each entry: { name, trigger (one of 53 keys), script, ...optional system fields }.',
              items: { type: 'object', additionalProperties: true },
            },
            destination: {
              type: 'object',
              description:
                'Required. { type: "actor", actorId?/actorName? } OR { type: "world", folder?: ["Folder","Subfolder"] }. Folder chain auto-created.',
              additionalProperties: true,
            },
            returnFullPayload: {
              type: 'boolean',
              description: 'Opt-in full itemData + effectIds echo in response (default false).',
            },
            systemOverrides: {
              type: 'object',
              description:
                'Raw system field overrides merged on top of the generated system payload. Advanced use.',
              additionalProperties: true,
            },
          },
          required: ['itemType', 'name', 'destination'],
        },
      },
    ];
  }

  async handle(args: unknown): Promise<any> {
    const parsed = CreateCustomItemInputSchema.parse(args);

    const system = buildSystemForSubtype(parsed);
    const mergedSystem = parsed.systemOverrides
      ? { ...system, ...parsed.systemOverrides }
      : system;

    const itemData: Record<string, unknown> = {
      type: parsed.itemType,
      name: parsed.name,
      system: mergedSystem,
    };
    if (parsed.img) itemData.img = parsed.img;

    const effects = (parsed.effects ?? []).map(buildEffectPayload);
    if (effects.length > 0) itemData.effects = effects;

    const payload: Record<string, unknown> = {
      itemData,
      destination: parsed.destination,
      returnFullPayload: parsed.returnFullPayload === true,
    };
    if (parsed.fromCompendium) payload.fromCompendium = parsed.fromCompendium;

    this.logger.info('create-custom-item', {
      itemType: parsed.itemType,
      name: parsed.name,
      destinationType: parsed.destination.type,
      effectCount: effects.length,
      fromCompendium: parsed.fromCompendium ?? null,
    });

    const result: any = await this.query<any>('createItem', payload);

    return this.formatResult(result, parsed);
  }

  // TOOL-IDEA-010 (2026-05-14): return MCP content envelope with always-on
  // `structuredContent` carrying `{success, itemId, itemName, itemType, scope, folderId?,
  // folderPath?}`. Eliminates the follow-up search/list lookup callers had to do after
  // `create-custom-item` because itemId was buried in prose. `content[0].text` keeps
  // the human-readable prose for chat display; structured field is for chaining.
  private formatResult(
    result: any,
    parsed: ReturnType<typeof CreateCustomItemInputSchema.parse>
  ): any {
    const data = result?.data ?? result ?? {};
    const scope = data.scope ?? parsed.destination.type;
    const base = `Created **${data.itemName ?? parsed.name}** (${data.itemType ?? parsed.itemType})`;

    let prose: string;
    const structured: any = {
      success: data.success !== false,
      scope,
      itemId: data.itemId ?? null,
      itemName: data.itemName ?? parsed.name,
      itemType: data.itemType ?? parsed.itemType,
    };

    if (scope === 'world') {
      const path =
        parsed.destination.type === 'world' && parsed.destination.folder?.length
          ? parsed.destination.folder.join(' / ')
          : '(root)';
      prose = `${base} in the Items sidebar at **${path}**.`;
      if (data.folderId) prose += ` Folder ID: \`${data.folderId}\`.`;
      structured.folderId = data.folderId ?? null;
      structured.folderPath = data.folderPath ?? (parsed.destination.type === 'world' ? parsed.destination.folder ?? [] : []);
    } else {
      const who = data.actorName ?? 'actor';
      prose = `${base} on **${who}**.`;
      if (data.itemId) prose += ` Item ID: \`${data.itemId}\`.`;
      structured.actorId = data.actorId ?? null;
      structured.actorName = data.actorName ?? null;
    }

    if (parsed.returnFullPayload === true && data.itemData) {
      prose += `\n\nFull payload:\n\`\`\`json\n${JSON.stringify(data.itemData, null, 2)}\n\`\`\``;
      structured.itemData = data.itemData;
      if (data.effectIds) structured.effectIds = data.effectIds;
    }

    return {
      content: [{ type: 'text', text: prose }],
      structuredContent: structured,
    };
  }
}
