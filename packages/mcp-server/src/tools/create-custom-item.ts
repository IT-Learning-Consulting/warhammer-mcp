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
  return words[0]! + words.slice(1).map(w => (w ? w[0]!.toUpperCase() + w.slice(1) : '')).join('');
}

function parseQualityEntry(raw: string): { name: string; value: number | null } | null {
  const s = raw.trim();
  if (!s) return null;
  // Trailing integer → numeric quality (Fine 2, Repeater 3, Reload 9)
  const m = s.match(/^(.+?)\s+(\d+)$/);
  if (m) return { name: toCanonicalKey(m[1]!), value: parseInt(m[2]!, 10) };
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
    if (Array.isArray(fieldValue) || typeof fieldValue === 'string') {
      // Bare list/string directly under `qualities`/`flaws` (no `{value:...}` wrapper).
      // NOTE: this check MUST precede the generic object check below — an array is
      // also `typeof === 'object'`, so the old ordering silently dropped bare arrays.
      out[field] = { value: normalizeQualitiesValue(fieldValue) };
    } else if (fieldValue && typeof fieldValue === 'object') {
      // Nested `{ value: ... }` wrapper.
      const inner = (fieldValue as { value?: unknown }).value;
      out[field] = { value: normalizeQualitiesValue(inner) };
    }
    // BUG-337: dotted-key form `"qualities.value": "salvo 3, …"`. This rides as a
    // LITERAL property key, bypassing the nested-object check above; Foundry's
    // expandObject later splits it into `qualities.value`, but the raw string would
    // then be coerced by the wfrp4e data model into `[{}]` (silent data loss with
    // success:true). Normalize the dotted key's value here so expandObject yields the
    // canonical array. The dotted key is preserved (expandObject handles the nesting).
    const dottedKey = `${field}.value`;
    if (dottedKey in out) {
      out[dottedKey] = normalizeQualitiesValue(out[dottedKey]);
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

**Active Effects at creation time:** pass \`effects: [{ name, trigger, script, description?, ... }]\`. Trigger keys are the 53 WFRP4e/warhammer-lib trigger slugs (e.g. \`rollWeaponTest\`, \`prePrepareData\`, \`immediate\`, \`endTurn\`). ALWAYS set \`description\` (HTML ok) — it is the user-facing text players/GMs see when expanding the effect on the sheet; without it the effect is opaque (BUG-334). Scripts run in Foundry context — caller trust required.

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
                'Optional Active Effects to attach. Each entry: { name, trigger (one of 53 keys), script, description (user-facing sheet text — always set it), ...optional system fields }.',
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
                'Raw system field overrides merged on top of the generated system payload. **qualities / flaws / weaponGroup: set them HERE via the nested-object form** — `systemOverrides: { qualities: { value: "impale, precise, fine 2" }, weaponGroup: "twohanded" }`. Do NOT use a top-level `qualities: [...]` array (rides additionalProperties and can arrive stringified → ZodError), and do NOT use the dotted form for qualities/flaws (`"qualities.value": "…"`) historically dropped to `[{}]`. The nested-object form is the verified-working shape. **qualities/flaws auto-normalize**: `{ value: "impale, precise, fine 2" }` (string), `{ value: ["impale", "fine 2"] }` (array of strings), `{ value: [{ name: "impale", value: null }, { name: "fine", value: 2 }] }` (canonical), AND the dotted `"qualities.value": "…"` form all coerce to the canonical `Array<{ name, value }>` before write (never `[{}]`). Numeric-trailing qualities like "Fine 2" / "Repeater 3" parse to `{ name: "fine", value: 2 }`. Multi-word like "Barbed Bolt" lowercases the first word and camelCases the rest → `"barbedBolt"`. Use systemOverrides for any non-typed field too (advanced escape hatch).',
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
    // BUG-325: BaseTool.query() already unwraps the envelope; drop the dead ?.data operand
    const data = result ?? {};
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
