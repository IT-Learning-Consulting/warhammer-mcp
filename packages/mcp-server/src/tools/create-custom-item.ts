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

// BUG-100 fix (2026-05-18): qualities/flaws normalization for systemOverrides path.
// wfrp4e weapon/armour data models expect qualities.value / flaws.value as
// Array<{ name: string, value: number | null }>. Callers passing the convenience
// shape `qualities: { value: "impale, precise, fine 2" }` previously had their
// string silently overwrite the typed default via the shallow spread merge —
// Foundry stored `qualities: { value: [{}] }` (one empty object per entry) with
// `success: true` returned. Normalize here BEFORE the merge so both shapes work
// and the canonical array-of-objects shape always lands in storage.
const QUALITY_FIELDS = ['qualities', 'flaws'] as const;

function toCanonicalKey(raw: string): string {
  // "Hack" → "hack"; "Barbed Bolt" → "barbedBolt"; "fine" → "fine"
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const words = trimmed.toLowerCase().split(/\s+/);
  return words[0] + words.slice(1).map(w => (w ? w[0].toUpperCase() + w.slice(1) : '')).join('');
}

function parseQualityEntry(raw: string): { name: string; value: number | null } | null {
  const s = raw.trim();
  if (!s) return null;
  // Trailing integer → numeric quality (Fine 2, Repeater 3, Reload 9)
  const m = s.match(/^(.+?)\s+(\d+)$/);
  if (m) return { name: toCanonicalKey(m[1]), value: parseInt(m[2], 10) };
  return { name: toCanonicalKey(s), value: null };
}

function normalizeQualitiesValue(raw: unknown): Array<{ name: string; value: number | null }> {
  // Already canonical: array of {name, value}
  if (Array.isArray(raw)) {
    const out: Array<{ name: string; value: number | null }> = [];
    for (const item of raw) {
      if (typeof item === 'string') {
        const parsed = parseQualityEntry(item);
        if (parsed) out.push(parsed);
      } else if (item && typeof item === 'object' && typeof (item as any).name === 'string') {
        const obj = item as { name: string; value?: number | null };
        out.push({ name: toCanonicalKey(obj.name), value: obj.value ?? null });
      }
      // else: skip silently (drop garbage entries instead of producing [{}])
    }
    return out;
  }
  // Comma-separated string convenience: "impale, precise, fine 2"
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map(s => parseQualityEntry(s))
      .filter((x): x is { name: string; value: number | null } => x !== null);
  }
  // null/undefined/other → empty array (never produce [{}])
  return [];
}

/**
 * Normalize qualities/flaws inside systemOverrides into the canonical wfrp4e
 * shape. Returns a NEW object — does not mutate the caller's input.
 *
 * Accepts (per field):
 *   - `{ value: "impale, precise, fine 2" }`           (string)
 *   - `{ value: ["impale", "precise", "fine 2"] }`     (array of strings)
 *   - `{ value: [{ name: "impale", value: null }] }`   (canonical — passes through)
 *
 * Always emits `{ value: Array<{ name, value }> }`. Empty input → `{ value: [] }`
 * (never `[{}]`).
 */
function normalizeSystemOverrides(overrides: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...overrides };
  for (const field of QUALITY_FIELDS) {
    const fieldValue = out[field];
    if (fieldValue && typeof fieldValue === 'object') {
      const inner = (fieldValue as { value?: unknown }).value;
      out[field] = { value: normalizeQualitiesValue(inner) };
    } else if (typeof fieldValue === 'string' || Array.isArray(fieldValue)) {
      // Callers who skip the `{value: ...}` wrapper and put the list directly under
      // `qualities`/`flaws` — coerce to the canonical wrapper shape.
      out[field] = { value: normalizeQualitiesValue(fieldValue) };
    }
  }
  return out;
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
        description: `Create a custom WFRP4e Item — world-scope (the Items sidebar, Foundry's canonical item library, see https://foundryvtt.com/article/items/) or actor-embedded. Supports 26 subtypes (19 core + 7 module-contributed) with optional Active Effects at creation time and optional compendium-clone seeding.

**Destination (required, no default — caller decides):**
- World scope (primary use case): \`destination: { type: "world", folder?: ["Custom", "Weapons"] }\` — folder chain is auto-created if missing; omit \`folder\` for root placement.
- Actor scope: \`destination: { type: "actor", actorName: "Hans" }\` OR \`{ type: "actor", actorId: "<id>" }\` — embeds on the resolved actor.

**Core subtypes (19):**
weapon, armour, trapping, ammunition, container, spell, prayer, talent, career, skill, trait, mutation, critical, disease, template, cargo, injury, money, psychology.

**Subtype-specific required fields (top-level, beyond \`itemType\` / \`name\` / \`destination\`):**
- \`prayer\` — \`type: "blessing" | "miracle"\` is REQUIRED (Core p.213 prayer category discriminator). Pass at top-level alongside \`itemType\`, NOT inside \`systemOverrides\`. Example: \`{ itemType: "prayer", type: "miracle", name: "Sigmar's Fiery Hammer", god: "Sigmar", destination: { type: "world" } }\`. Omitting \`type\` causes Zod-parse rejection.

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
                'Item subtype discriminator. One of 19 core names or 7 dotted module keys. See tool description.',
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
                'Raw system field overrides merged on top of the generated system payload. Advanced use. **For known typed fields, prefer the top-level shorthand fields** (`damage`, `weaponGroup`, `qualities`, `flaws`, etc.) — those are Zod-validated. `systemOverrides` is an unvalidated escape hatch. **qualities/flaws auto-normalize**: if you pass `{ value: "impale, precise, fine 2" }` (string) or `{ value: ["impale", "fine 2"] }` (array of strings) or `{ value: [{ name: "impale", value: null }, { name: "fine", value: 2 }] }` (canonical), all three coerce to the canonical `Array<{ name, value }>` shape before write. Numeric-trailing qualities like "Fine 2" / "Repeater 3" parse to `{ name: "fine", value: 2 }`. Multi-word like "Barbed Bolt" lowercases the first word and camelCases the rest → `"barbedBolt"`.',
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
    const normalizedOverrides = parsed.systemOverrides
      ? normalizeSystemOverrides(parsed.systemOverrides)
      : null;
    const mergedSystem = normalizedOverrides
      ? { ...system, ...normalizedOverrides }
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
