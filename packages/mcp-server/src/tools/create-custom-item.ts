import {
  CreateCustomItemInputSchema,
  buildSystemForSubtype,
  buildEffectPayload,
  CreateCustomItemOutput,
  CREATE_CUSTOM_ITEM_OUTPUT_JSON_SCHEMA,
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

// BUG-643: every subtype builder returns a FULLY populated system object (unsupplied fields
// fall back to hardcoded defaults inside buildXSystem, e.g. `p.wounds ?? '1'`). When cloning
// from a compendium source, sending that fully-populated object to the foundry-module's
// `mergeObject(cloned, itemData, {recursive:true, overwrite:true})` stomps every field the
// caller never mentioned back to its bare default — live-confirmed: cloning Core Hand Weapon
// while overriding only selected fields reset the source's encumbrance/price/availability/
// reach/ammunitionGroup to zero/empty. Only used when `fromCompendium` is set — a brand-new
// (non-clone) item legitimately wants the full default-populated system.
//
// Fix: build the system TWICE — once from the caller's actual `parsed`, once from a "bare"
// parsed stripped to only the structurally-required keys (itemType/name/destination, plus
// prayer's required `type` discriminator) — then keep only the leaves that DIFFER. A leaf
// equal to the bare default is treated as "caller didn't actually customize this," so the
// clone source's own value survives the merge instead of being stomped.
const STRUCTURAL_KEYS = new Set(['itemType', 'name', 'destination', 'type']);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function sparseDiff(full: Record<string, unknown>, bare: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(full)) {
    const fv = full[key];
    const bv = bare[key];
    if (isPlainObject(fv) && isPlainObject(bv)) {
      const nested = sparseDiff(fv, bv);
      if (Object.keys(nested).length > 0) out[key] = nested;
    } else if (JSON.stringify(fv) !== JSON.stringify(bv)) {
      out[key] = fv;
    }
  }
  return out;
}

function buildSparseCloneSystem(parsed: any): Record<string, unknown> {
  const full = buildSystemForSubtype(parsed);
  const bareParsed = Object.fromEntries(
    Object.entries(parsed).filter(([k]) => STRUCTURAL_KEYS.has(k)),
  );
  const bare = buildSystemForSubtype(bareParsed as any);
  return sparseDiff(full, bare);
}

export class CreateCustomItemTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'create-custom-item', handler: (args: any) => this.handle(args) },
    ];
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

Use this when:
- Authoring a homebrew item (weapon, spell, talent, etc.) that has no compendium source — e.g. a custom magic sword or a GM-invented mutation.
- Cloning a compendium item and then overriding specific fields (fromCompendium + field overrides), rather than embedding the unmodified published item.
- Creating a world-scope item in a specific folder for later distribution, or an actor-embedded item directly on a character/NPC.
- Attaching custom Active Effects at creation time (e.g. a bespoke magic item's on-hit script).

Do NOT use this to embed an unmodified published compendium item — use add-item-from-compendium instead (simpler call, preserves the item's own Active Effects chain without re-specifying fields).

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

**Active Effects at creation time:** pass \`effects: [{ name, trigger, script, description?, ... }]\`. Trigger keys are the 59 WFRP4e/warhammer-lib trigger slugs (e.g. \`rollWeaponTest\`, \`prePrepareData\`, \`immediate\`, \`endTurn\`). ALWAYS set \`description\` (HTML ok) — it is the user-facing text players/GMs see when expanding the effect on the sheet; without it the effect is opaque (BUG-334). Scripts run in Foundry context — caller trust required.

**Compendium seeding:** \`fromCompendium: "Compendium.<pack>.Item.<id>"\` clones the source (preserving its effects), strips source IDs, then merges your overrides on top.

**Response:** lean by default — \`{itemId, itemName, itemType, scope, folderId?, folderPath?}\`. Pass \`returnFullPayload: true\` for the full itemData echo (opt-in to avoid bandwidth on bulk creates).

Performance Notes:
- Default response is a small lean summary (\`{itemId, itemName, itemType, scope, folderId?, folderPath?}\`) — cheap on bulk creates.
- \`returnFullPayload: true\` echoes the complete created itemData — larger response, opt-in only when the caller needs to inspect the full item shape.

**Examples:**
- Spell at actor scope: \`{ itemType: "spell", name: "Firebolt", lore: "fire", cn: 5, destination: { type: "actor", actorName: "Hans" } }\`
- Weapon cloned at world scope: \`{ itemType: "weapon", name: "Fire Sword", fromCompendium: "Compendium.wfrp4e-core.items.Item.<longsword-id>", damage: "SB+6", destination: { type: "world", folder: ["Homebrew", "Armor"] } }\`
- Grimoire: \`{ itemType: "forien-armoury.grimoire", name: "Tome of Ulric", spells: [{name: "Wolf Form", uuid: "..."}], destination: { type: "world" } }\`

Security: script / preApplyScript / enableConditionScript fields are executed by Foundry under GM authority. MCP does not sandbox script content. Only invoke with scripts you wrote or audited.`,
        inputSchema: {
          type: 'object',
          additionalProperties: true,
          properties: {
            itemType: {
              type: 'string',
              // BUG-660: previously no enum — any string passed the published schema and only
              // failed at the Zod discriminated-union parse. Generated from the live Zod union.
              enum: [
                'weapon', 'armour', 'trapping', 'ammunition', 'container', 'spell', 'prayer',
                'talent', 'career', 'skill', 'trait', 'mutation', 'critical', 'disease',
                'template', 'cargo', 'injury', 'money', 'psychology',
                'forien-armoury.grimoire', 'forien-armoury.scroll', 'wfrp4e-dwarfs.rune',
                'wfrp4e-soc.chanty', 'wfrp4e-helf.technique', 'wfrp4e-archives3.cant',
                'wfrp4e-archives3.armour',
              ],
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
                'Optional Active Effects to attach. Each entry: { name, trigger (one of 59 keys), script, description (user-facing sheet text — always set it), ...optional system fields }.',
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
                'Raw system field overrides merged on top of the generated system payload — the advanced escape hatch for fields with no typed top-level declaration. Typed top-level fields (qualities/flaws arrays, AP, cn, career arrays, …) are declared in this schema (BUG-450) and are the preferred path. **qualities/flaws auto-normalize** here AND at top level: `{ value: "impale, precise, fine 2" }` (string), `{ value: ["impale", "fine 2"] }` (array of strings), `{ value: [{ name: "impale", value: null }, { name: "fine", value: 2 }] }` (canonical), and the dotted `"qualities.value": "…"` form all coerce to the canonical `Array<{ name, value }>` before write (never `[{}]`). Numeric-trailing qualities like "Fine 2" / "Repeater 3" parse to `{ name: "fine", value: 2 }`. Multi-word like "Barbed Bolt" lowercases the first word and camelCases the rest → `"barbedBolt"`.',
              additionalProperties: true,
            },
            // ── BUG-450: per-subtype typed fields, mechanically derived from
            // shared/src/schemas/create-custom/ (every Zod branch's top-level fields).
            // coerce-args.ts only JSON-parses stringified values for keys DECLARED here —
            // undeclared typed fields rode additionalProperties, arrived stringified, and
            // Zod-rejected ("Expected array/number/object, received string"), making the
            // documented typed surface unusable via MCP. Union-typed fields (noted in their
            // descriptions) are declared WITHOUT `type` so coercion cannot corrupt either
            // branch. The inputschema-zod-parity test locks this list to the Zod union.
            // Shared physical-item fields:
            quantity: { type: 'number', description: '[weapon/armour/trapping/ammunition/container/money/grimoire/scroll/archives3.armour] Stack quantity.' },
            encumbrance: { type: 'number', description: '[physical subtypes + cargo] Encumbrance per unit.' },
            price: { type: 'object', properties: { gc: { type: 'number' }, ss: { type: 'number' }, bp: { type: 'number' } }, description: '[priced physical subtypes + cargo] Price as { gc?, ss?, bp? }.' },
            availability: { type: 'string', description: '[physical subtypes] Availability tier (e.g. "common", "scarce", "rare", "exotic", "unique").' },
            location: { oneOf: [{ type: 'number' }, { type: 'string' }], description: '[physical subtypes] carry location as a NUMBER; [critical/injury] hit location as a STRING (e.g. "Head").' },
            worn: { type: 'boolean', description: '[armour/trapping/container/grimoire/archives3.armour] Currently worn.' },
            equipped: { type: 'boolean', description: '[weapon/grimoire] Currently equipped.' },
            twohanded: { type: 'boolean', description: '[weapon/grimoire] Two-handed.' },
            special: { type: 'string', description: '[weapon/armour/ammunition/archives3.armour] Special rules text.' },
            qualities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'number' } } }, description: '[weapon/armour/trapping/ammunition/trait/archives3.armour] Item qualities as [{ name, value? }] (e.g. [{name:"impale"},{name:"fine",value:2}]).' },
            flaws: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'number' } } }, description: '[weapon/armour/trapping/ammunition/trait/archives3.armour] Item flaws as [{ name, value? }].' },
            // Weapon:
            damage: { type: 'string', description: '[weapon/ammunition/spell/prayer] Damage expression (e.g. "SB+4").' },
            damageDice: { type: 'string', description: '[weapon/ammunition/spell/prayer] Extra damage dice (e.g. "1d10").' },
            reach: { type: 'string', description: '[weapon] Reach key (e.g. "average", "long").' },
            range: { type: 'string', description: '[weapon/ammunition/spell/prayer] Range expression.' },
            skill: { type: 'string', description: '[weapon] governing skill name; [spell] casting skill name.' },
            modeOverride: { type: 'string', description: '[weapon] Force melee/ranged mode.' },
            ammunitionGroup: { type: 'string', description: '[weapon] Ammunition group the weapon CONSUMES (e.g. "bow"). This is a weapon field — ammunition items use ammunitionType.' },
            consumesAmmo: { type: 'boolean', description: '[weapon] Whether attacks consume ammunition.' },
            weaponGroup: { type: 'string', description: '[weapon] Weapon group key (e.g. "basic", "twohanded").' },
            offhand: { type: 'boolean', description: '[weapon] Held off-hand.' },
            // Armour (core + wfrp4e-archives3.armour):
            armorType: { type: 'string', description: '[armour/archives3.armour] Armour type key (e.g. "mail", "plate").' },
            penalty: { type: 'string', description: '[armour/archives3.armour/injury] Penalty text.' },
            AP: { type: 'object', properties: { head: { type: 'number' }, body: { type: 'number' }, lArm: { type: 'number' }, rArm: { type: 'number' }, lLeg: { type: 'number' }, rLeg: { type: 'number' } }, description: '[armour/archives3.armour] Armour points per location, e.g. { body: 3 }.' },
            fit: { type: 'string', description: '[wfrp4e-archives3.armour] Armour fit key (CONFIG.WFRP4E.armourFits).' },
            // Ammunition / trapping / container:
            ammunitionType: { type: 'string', description: '[ammunition] Ammunition group key (e.g. "bow", "crossbow").' },
            trappingType: { type: 'string', description: '[trapping] Trapping category key.' },
            spellIngredient: { type: 'string', description: '[trapping] Spell name this ingredient serves.' },
            wearable: { type: 'boolean', description: '[container] Can be worn.' },
            carries: { type: 'number', description: '[container] Carrying capacity (enc).' },
            countEnc: { type: 'boolean', description: '[container] Contents count toward carrier encumbrance.' },
            // Spell / prayer:
            lore: { type: 'string', description: '[spell] Lore key (e.g. "fire"); [wfrp4e-archives3.cant] lore the cant draws SL from.' },
            cn: { type: 'number', description: '[spell] Casting Number.' },
            target: { type: 'string', description: '[spell/prayer] Target expression.' },
            duration: { oneOf: [{ type: 'string' }, { type: 'object', properties: { value: { type: 'string' }, unit: { type: 'string' }, active: { type: 'boolean' } } }], description: '[spell/prayer] duration STRING; [disease] { value?, unit?, active? } OBJECT. BUG-648: unit is an unconstrained string (live wfrp4e interpolates it directly, no validation) — the published corpus includes "minutes" and blank "" alongside hours/days/weeks.' },
            magicMissile: { type: 'boolean', description: '[spell] Magic missile.' },
            memorized: { type: 'boolean', description: '[spell] Memorized.' },
            ingredients: { type: 'array', items: { type: 'string' }, description: '[spell] Ingredient names.' },
            wind: { type: 'string', description: '[spell] Wind of magic.' },
            ritual: { type: 'object', properties: { value: { type: 'boolean' }, type: { type: 'string' }, xp: { type: 'number' } }, description: '[spell] Ritual block.' },
            overcast: { type: 'object', additionalProperties: true, description: '[spell/prayer] Overcast block: { enabled?, label?, valuePerOvercast?: {type,value,SL,characteristic,bonus}, initial?: {...} }.' },
            type: { type: 'string', description: '[prayer — REQUIRED] "blessing" | "miracle" (Core p.213 discriminator).' },
            god: { type: 'string', description: '[prayer] Deity name.' },
            // Talent / skill:
            max: { oneOf: [{ type: 'string' }, { type: 'number' }], description: '[talent] Max advances — characteristic key STRING (e.g. "ws") or NUMBER.' },
            advances: { oneOf: [{ type: 'number' }, { type: 'object', properties: { value: { type: 'number' }, force: { type: 'boolean' }, costModifier: { type: 'number' } } }], description: '[talent/skill] NUMBER, or { value?, force?, costModifier? } object (costModifier skill-only).' },
            career: { type: 'string', description: '[talent] Related career text.' },
            tests: { type: 'string', description: '[talent] Tests the talent applies to.' },
            characteristic: { type: 'string', enum: ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'], description: '[skill] Governing characteristic key.' },
            advanced: { type: 'string', enum: ['', 'adv'], description: '[skill] "" basic / "adv" advanced.' },
            grouped: { type: 'string', enum: ['noSpec', 'isSpec'], description: '[skill] Specialisation grouping.' },
            modifier: { oneOf: [{ type: 'number' }, { type: 'string' }], description: '[skill] NUMBER test modifier; [critical/mutation] STRING modifier text.' },
            // Career:
            careergroup: { type: 'string', description: '[career] Career group name (e.g. "Soldier").' },
            class: { type: 'string', description: '[career] Class name (e.g. "Warriors").' },
            level: { oneOf: [{ type: 'string' }, { type: 'number' }], description: '[career] Career level — NUMBER or STRING.' },
            current: { type: 'boolean', description: '[career] Is the current career.' },
            complete: { type: 'boolean', description: '[career] Career completed.' },
            statusTier: { type: 'string', enum: ['b', 's', 'g'], description: '[career] Status tier: brass/silver/gold.' },
            statusStanding: { type: 'number', description: '[career] Status standing.' },
            characteristics: { oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'object', additionalProperties: true }], description: '[career] ARRAY of characteristic keys (e.g. ["ws","t"]); [template] RECORD object.' },
            skills: { oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'object', additionalProperties: true }], description: '[career] ARRAY of skill names; [template] RECORD object.' },
            talents: { oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'object', additionalProperties: true }], description: '[career] ARRAY of talent names; [template] RECORD object.' },
            trappings: { oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'object', additionalProperties: true }], description: '[career] ARRAY of trapping names; [template] RECORD object.' },
            incomeSkill: { type: 'array', items: { type: 'number' }, description: '[career] Indices into skills[] marking income skills.' },
            // Trait:
            rollable: { type: 'object', additionalProperties: true, description: '[trait] Rollable block: { value?, damage?, skill?, rollCharacteristic?, bonusCharacteristic?, dice?, defaultDifficulty?, SL?, attackType?("melee"|"ranged") }.' },
            specification: { oneOf: [{ type: 'string' }, { type: 'number' }], description: '[trait] Specification — STRING or NUMBER (e.g. Weapon +8 → 8).' },
            // Mutation / critical / disease / injury:
            mutationType: { type: 'string', enum: ['physical', 'mental'], description: '[mutation] REQUIRED for itemType:"mutation" — omitting it throws CREATE_CUSTOM_ITEM_MUTATION_TYPE_REQUIRED (BUG-649: previously the Zod schema, handler, and docs disagreed on this; the handler-level requirement is now the single source of truth).' },
            modifiesSkills: { type: 'boolean', description: '[mutation] Modifies skills.' },
            wounds: { type: 'string', description: '[critical] A plain integer as a string (e.g. "4") or the literal "death". NOT a dice formula — WFRP4e never rolls this field, it only parses the leading integer (BUG-646). Rejected if it looks like dice notation (e.g. "1d10+SB").' },
            contraction: { type: 'string', description: '[disease] Contraction text.' },
            incubation: { type: 'object', properties: { value: { type: 'string' }, unit: { type: 'string' } }, description: '[disease] Incubation { value (formula string), unit }. BUG-648: unit is unconstrained (e.g. "minutes", "" are both real published values, not just hours/days/weeks).' },
            symptoms: { type: 'string', description: '[disease] Symptom names (comma-separated).' },
            permanent: { type: 'string', description: '[disease] Permanent effect text.' },
            // Cargo / money:
            cargoType: { type: 'string', description: '[cargo] Cargo type key.' },
            unitPrice: { type: 'number', description: '[cargo] Price per unit.' },
            origin: { type: 'string', description: '[cargo] Origin region.' },
            quality: { type: 'string', enum: ['poor', 'average', 'good', 'exceptional'], description: '[cargo] Cargo quality.' },
            coinValue: { type: 'number', description: '[money] Denomination in pence: BP=1, SS=12, GC=240.' },
            // Template:
            traits: { type: 'object', additionalProperties: true, description: '[template] Traits record.' },
            lores: { type: 'object', additionalProperties: true, description: '[template] Lores record.' },
            alterName: { type: 'object', properties: { pre: { type: 'string' }, post: { type: 'string' } }, description: '[template] Name prefix/suffix.' },
            notes: { type: 'string', description: '[template] Notes text.' },
            templateData: { type: 'object', additionalProperties: true, description: '[template] Raw composite payload.' },
            // Module subtypes:
            spells: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, uuid: { type: 'string' } } }, description: '[forien-armoury.grimoire] Contained spells as [{ name, uuid }].' },
            language: { type: 'string', description: '[forien-armoury.grimoire/scroll] Written language.' },
            spellUuid: { type: 'string', description: '[forien-armoury.scroll] UUID of the inscribed spell.' },
            SL: { type: 'object', properties: { value: { type: 'number' }, required: { type: 'number' } }, description: '[wfrp4e-dwarfs.rune] SL block { value?, required? }.' },
            category: { type: 'string', description: '[wfrp4e-dwarfs.rune] Rune category.' },
            master: { type: 'boolean', description: '[wfrp4e-dwarfs.rune] Master rune.' },
            item: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, uuid: { type: 'string' } }, description: '[wfrp4e-dwarfs.rune] Inscribed item reference.' },
            usage: { type: 'object', properties: { establish: { type: 'number' }, duration: { type: 'number' }, skill: { type: 'string' } }, description: '[wfrp4e-soc.chanty] Usage block.' },
            sl: { type: 'number', description: '[wfrp4e-helf.technique] SL cost (lowercase key — distinct from rune SL).' },
            cost: { type: 'object', properties: { value: { type: 'number' }, variable: { type: 'boolean' }, max: { type: 'string' } }, description: '[wfrp4e-archives3.cant] SL cost block.' },
          },
          required: ['itemType', 'name', 'destination'],
          // BUG-660 (D1 — tighten in place, never anyOf): of the 26 branches, 25 need nothing
          // beyond the globally-required itemType/name/destination above; 'prayer' additionally
          // requires 'type' (blessing|miracle, PrayerSchema — no default). BUG-649: 'mutation'
          // requires 'mutationType' — enforced at the HANDLER level (not Zod, see mutation.ts's
          // own comment for why), but declared here too so the published contract accurately
          // reflects real behavior rather than silently under-claiming it.
          allOf: [
            // AJV strictRequired needs a local `properties` stub for each `then.required` key on
            // THIS tool's schema, even when the property is already declared at the top level
            // (unlike item-piles.ts's 17 allOf clauses, which don't need this — root cause not
            // fully isolated; empirically required here, harmless to include either way).
            { if: { properties: { itemType: { const: 'prayer' } } }, then: { required: ['type'], properties: { type: { type: 'string' } } } },
            { if: { properties: { itemType: { const: 'mutation' } } }, then: { required: ['mutationType'], properties: { mutationType: { type: 'string' } } } },
          ],
        },
        outputSchema: CREATE_CUSTOM_ITEM_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: unknown): Promise<any> {
    const parsed = CreateCustomItemInputSchema.parse(args);

    // BUG-475(c): a mutation without mutationType silently defaulted to "physical" (shared
    // buildMutationSystem ?? 'physical'). Refuse explicitly with a typed token — matches the skill's
    // documented contract that mutationType is required for the mutation subtype.
    if (parsed.itemType === 'mutation' && !(parsed as { mutationType?: string }).mutationType) {
      throw new Error(
        'CREATE_CUSTOM_ITEM_MUTATION_TYPE_REQUIRED: the mutation subtype requires an explicit mutationType ("physical" | "mental").',
      );
    }

    // BUG-643: when cloning, use a sparse (caller-customized-only) system object so the
    // clone-merge in item.ts doesn't stomp source fields the caller never mentioned.
    // A non-clone create still wants the full default-populated system.
    const system = parsed.fromCompendium ? buildSparseCloneSystem(parsed) : buildSystemForSubtype(parsed);
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
      // R2.1/D1 ALLOWLIST: grandfathered wire field (snapshot-locked, TOOL-IDEA-010 structuredContent).
      // `data.success` is the unwrapped domain result's own field, not an envelope-consumer guard; kept verbatim.
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

    // Phase 12 R12.2: forward the operation receipt the foundry-module service emitted (hand-assembled
    // structuredContent does NOT auto-passthrough — each field is explicitly carried into `structured`).
    structured.operationId = data.operationId;
    structured.createdDocumentIds = data.createdDocumentIds;
    structured.updatedDocumentIds = data.updatedDocumentIds;
    structured.deletedDocumentIds = data.deletedDocumentIds;
    structured.warnings = data.warnings;

    CreateCustomItemOutput.parse(structured);
    return {
      content: [{ type: 'text', text: prose }],
      structuredContent: structured,
    };
  }
}
