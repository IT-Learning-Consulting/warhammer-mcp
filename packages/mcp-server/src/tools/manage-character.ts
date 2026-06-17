import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";
import { BaseTool, BaseToolOptions } from "../base-tool.js";

// BUG-077 fix — typed-generic interfaces for BaseTool.query() callers per BUG-069 prevention stack.
// Mirrors the module-level convention introduced for CreateActorSchema/Result in actor-creation.ts.
interface CharacterInfoResult {
    id: string;
    name: string;
    type: string;
    system: any;  // wfrp4e actor.system tree — broad; per-handler narrowing belongs in a later hygiene pass
    items?: Array<{ id: string; name: string; type: string; [key: string]: any }>;
    [key: string]: any;
}

interface CompendiumSearchItem {
    type: string;
    name: string;
    pack: string;
    id?: string;
    _id?: string;
    [key: string]: any;
}

// updateActor / updateItem / addItemFromCompendium return values are unused by callers (fire-and-forget writes).
// `unknown` (not `any`) forces a future explicit narrow if any handler starts reading the result.
type WriteResult = unknown;

// Update stats schema
const UpdateStatsSchema = z.object({
    action: z.literal("update-stats"),
    characterName: z.string(),
    // Back-compat (HC5): actorType defaults to 'character' so existing callers are unaffected.
    // Pass 'npc' or 'creature' to route to the NPC/creature-shared branch.
    actorType: z.enum(['character', 'npc', 'creature']).optional().default('character'),
    updates: z.object({
        // Characteristics (all actor types)
        weaponSkill: z.number().optional(),
        ballisticSkill: z.number().optional(),
        strength: z.number().optional(),
        toughness: z.number().optional(),
        initiative: z.number().optional(),
        agility: z.number().optional(),
        dexterity: z.number().optional(),
        intelligence: z.number().optional(),
        willpower: z.number().optional(),
        fellowship: z.number().optional(),
        // Status — shared
        currentWounds: z.number().optional(),
        // Character-only pools (rejected on npc/creature at runtime)
        fortune: z.number().optional(),
        fate: z.number().optional(),
        resilience: z.number().optional(),
        resolve: z.number().optional(),
        // Physical details (character-only)
        age: z.union([z.string(), z.number()]).optional(),
        height: z.string().optional(),
        weight: z.string().optional(),
        hair: z.string().optional(),
        eyes: z.string().optional(),
        distinguishingMarks: z.string().optional(),
        starSign: z.string().optional(),
        // PC creation details (character-only)
        motivation: z.string().optional(),
        class: z.string().optional(),
        career: z.string().optional(),
        careerlevel: z.string().optional(),
        personalAmbitionShort: z.string().optional(),
        personalAmbitionLong: z.string().optional(),
        partyAmbitionName: z.string().optional(),
        partyAmbitionShort: z.string().optional(),
        partyAmbitionLong: z.string().optional(),
        // NPC/creature-specific fields (rejected on character at runtime)
        species: z.string().optional(),
        subspecies: z.string().optional(),
        biography: z.string().optional(),
        gmnotes: z.string().optional(),
        size: z.enum(['avg', 'sml', 'lrg', 'grg', 'enor', 'mnst']).optional(),
        god: z.string().optional(),
        statusTier: z.number().optional(),
        statusStanding: z.string().optional(),
        advantage: z.number().optional(),
        criticalWounds: z.number().optional(),
        sin: z.number().optional(),
        corruption: z.number().optional(),
        // Shared across all types (move: character uses it for career/creation; npc/creature for actual movement)
        gender: z.string().optional(),
        move: z.union([z.string(), z.number()]).optional(),
    })
});

// Update skill/talent schema
const UpdateSkillTalentSchema = z.object({
    action: z.literal("update-skill-talent"),
    characterName: z.string(),
    itemName: z.string(),
    updates: z.object({
        advances: z.number().optional(),
        modifier: z.number().optional()
    })
});

// Add skill/talent schema
const AddSkillTalentSchema = z.object({
    action: z.literal("add-skill-talent"),
    characterName: z.string(),
    itemName: z.string(),
    itemType: z.enum(["skill", "talent"]),
    advances: z.number().optional()
});

// Update notes schema
const UpdateNotesSchema = z.object({
    action: z.literal("update-notes"),
    characterName: z.string(),
    noteType: z.enum(["gmnotes", "biography"]),
    content: z.string(),
    append: z.boolean().default(false)
});

// Add XP log schema
const AddXPLogSchema = z.object({
    action: z.literal("add-xp-log"),
    characterName: z.string(),
    amount: z.number(),
    reason: z.string(),
    type: z.enum(["earned", "spent"]).default("earned"),
    updateTotal: z.boolean().default(false)
});

export const ManageCharacterSchema = z.discriminatedUnion("action", [
    UpdateStatsSchema,
    UpdateSkillTalentSchema,
    AddSkillTalentSchema,
    UpdateNotesSchema,
    AddXPLogSchema
]);

type ManageCharacterArgs = z.infer<typeof ManageCharacterSchema>;

export interface ManageCharacterToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ManageCharacterTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

    // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
    getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
      return [
          { name: 'manage-character', handler: (args: any) => this.handle(args) },
      ];
    }

    getToolDefinitions() {
        return [{
            name: "manage-character",
            title: "Manage Character",
            annotations: {
              readOnlyHint: false,
              destructiveHint: false,
              idempotentHint: false,
              openWorldHint: true,
            },
            description: `Unified character management for WFRP 4e - update stats, skills, talents, notes, and experience logs.

**Actions:**
- **update-stats**: Set characteristics, status values, physical details, PC creation fields (GM override - no restrictions)
- **update-skill-talent**: Modify existing skill/talent advances or modifiers
- **add-skill-talent**: Add skill or talent from compendium
- **update-notes**: Update GM notes or biography
- **add-xp-log**: Add experience log entry; pass updateTotal:true to atomically increment experience.total alongside the log entry

**Update Stats** (Direct value setting):
Use for quick stat changes, character creation, testing, or corrections where you just need to SET a value.
- Characteristics: weaponSkill, ballisticSkill, strength, toughness, initiative, agility, dexterity, intelligence, willpower, fellowship (0-100)
- Status: currentWounds, fortune, fate, resilience, resolve
- Physical: age, height, weight, hair, eyes, gender, distinguishingMarks, starSign
- PC creation: motivation, move, class, career, careerlevel, personalAmbitionShort, personalAmbitionLong, partyAmbitionName, partyAmbitionShort, partyAmbitionLong

**Note:** For awarding bonus Fortune/Fate with proper narrative ceremony, use the /wfrp-resources skill (grant-fate / spend-fortune actions).

**Examples:**
- Update stats: action="update-stats", characterName="Hans", updates={strength: 40, fortune: 3}
- Update PC creation fields: action="update-stats", characterName="Hans", updates={career: "Soldier", careerlevel: "Sergeant", personalAmbitionShort: "Find my missing brother"}
- Update skill: action="update-skill-talent", characterName="Hans", itemName="Melee (Basic)", updates={advances: 5}
- Add talent: action="add-skill-talent", characterName="Hans", itemName="Strike Mighty Blow", itemType="talent"
- Update notes: action="update-notes", characterName="Hans", noteType="gmnotes", content="Suspicious behavior"
- Add XP: action="add-xp-log", characterName="Hans", amount=50, reason="Defeated ogre", type="earned"
- Add XP with total increment: action="add-xp-log", characterName="Hans", amount=20, reason="Random species bonus", type="earned", updateTotal=true`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["update-stats", "update-skill-talent", "add-skill-talent", "update-notes", "add-xp-log"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Character name" },
                    actorType: {
                        type: "string",
                        enum: ["character", "npc", "creature"],
                        default: "character",
                        description: "Actor type discriminator for update-stats. Defaults to character for back-compat. Pass npc or creature to route to the NPC/creature-shared branch (different DataModel fields)."
                    },
                    // update-stats fields
                    updates: {
                        type: "object",
                        description: "Stats to update (for update-stats or update-skill-talent)",
                        properties: {
                            // Characteristics
                            weaponSkill: { type: "number" },
                            ballisticSkill: { type: "number" },
                            strength: { type: "number" },
                            toughness: { type: "number" },
                            initiative: { type: "number" },
                            agility: { type: "number" },
                            dexterity: { type: "number" },
                            intelligence: { type: "number" },
                            willpower: { type: "number" },
                            fellowship: { type: "number" },
                            // Status
                            currentWounds: { type: "number" },
                            fortune: { type: "number" },
                            fate: { type: "number" },
                            resilience: { type: "number" },
                            resolve: { type: "number" },
                            // Physical
                            age: { type: ["string", "number"] },
                            height: { type: "string" },
                            weight: { type: "string" },
                            hair: { type: "string" },
                            eyes: { type: "string" },
                            gender: { type: "string" },
                            distinguishingMarks: { type: "string" },
                            starSign: { type: "string" },
                            // PC creation details
                            motivation: { type: "string" },
                            move: { type: ["string", "number"] },
                            class: { type: "string" },
                            career: { type: "string" },
                            careerlevel: { type: "string" },
                            personalAmbitionShort: { type: "string" },
                            personalAmbitionLong: { type: "string" },
                            partyAmbitionName: { type: "string" },
                            partyAmbitionShort: { type: "string" },
                            partyAmbitionLong: { type: "string" },
                            // Skill/talent updates
                            advances: { type: "number" },
                            modifier: { type: "number" },
                            // NPC/creature-specific fields (actorType=npc|creature)
                            species: { type: "string", description: "Species name (npc/creature)" },
                            subspecies: { type: "string", description: "Subspecies label (npc/creature)" },
                            biography: { type: "string", description: "Biography text (npc/creature)" },
                            gmnotes: { type: "string", description: "GM notes (npc/creature)" },
                            size: { type: "string", enum: ["avg", "sml", "lrg", "grg", "enor", "mnst"], description: "Creature size (npc/creature)" },
                            god: { type: "string", description: "God/patron deity (npc/creature)" },
                            statusTier: { type: "number", description: "Status tier numeric (npc/creature; 1=brass, 2=silver, 3=gold)" },
                            statusStanding: { type: "string", description: "Status standing value (npc/creature)" },
                            advantage: { type: "number", description: "Advantage counter (npc/creature)" },
                            criticalWounds: { type: "number", description: "Critical wounds count (npc/creature)" },
                            sin: { type: "number", description: "Sin points (npc/creature)" },
                            corruption: { type: "number", description: "Corruption points (npc/creature)" }
                        }
                    },
                    // add-skill-talent fields
                    itemName: { type: "string", description: "Skill/talent name (for update-skill-talent or add-skill-talent)" },
                    itemType: {
                        type: "string",
                        enum: ["skill", "talent"],
                        description: "Type of item to add (for add-skill-talent)"
                    },
                    advances: { type: "number", description: "Number of advances (for add-skill-talent)" },
                    // update-notes fields
                    noteType: {
                        type: "string",
                        enum: ["gmnotes", "biography"],
                        description: "Type of note (for update-notes)"
                    },
                    content: { type: "string", description: "Note content (for update-notes) or reason (for add-xp-log)" },
                    append: { type: "boolean", description: "Append to existing notes (for update-notes)" },
                    // add-xp-log fields
                    amount: { type: "number", description: "XP amount (for add-xp-log)" },
                    reason: { type: "string", description: "Reason for XP change (for add-xp-log)" },
                    type: {
                        type: "string",
                        enum: ["earned", "spent"],
                        description: "XP type (for add-xp-log)"
                    },
                    updateTotal: {
                        type: "boolean",
                        description: "When true, atomically increment experience.total alongside the log entry (for add-xp-log). Default false preserves existing log-only behavior.",
                        default: false
                    }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async handle(args: ManageCharacterArgs): Promise<string> {
        const parsed = ManageCharacterSchema.parse(args);

        switch (parsed.action) {
            case "update-stats":
                return this.handleUpdateStats(parsed);
            case "update-skill-talent":
                return this.handleUpdateSkillTalent(parsed);
            case "add-skill-talent":
                return this.handleAddSkillTalent(parsed);
            case "update-notes":
                return this.handleUpdateNotes(parsed);
            case "add-xp-log":
                return this.handleAddXPLog(parsed);
        }
    }

    private async handleUpdateStats(args: z.infer<typeof UpdateStatsSchema>): Promise<string> {
        const actorType = args.actorType ?? 'character';
        this.logger.info("Updating character stats", { characterName: args.characterName, actorType });

        // Characteristics mapping shared across all actor types
        const charMap: Record<string, string> = {
            weaponSkill: 'ws', ballisticSkill: 'bs', strength: 's', toughness: 't',
            initiative: 'i', agility: 'ag', dexterity: 'dex', intelligence: 'int',
            willpower: 'wp', fellowship: 'fel'
        };

        // Character-only fields — rejected on npc/creature (MCP Completion v1 Phase 1 R1.1)
        const CHARACTER_ONLY_FIELDS = new Set(['fate', 'fortune', 'resilience', 'resolve',
            'age', 'height', 'weight', 'hair', 'eyes', 'distinguishingmarks', 'starsign',
            'motivation', 'class', 'career', 'careerlevel',
            'personalambitionshort', 'personalambitionlong',
            'partyambitionname', 'partyambitionshort', 'partyambitionlong']);

        if (actorType === 'npc' || actorType === 'creature') {
            const charOnlyPresent = Object.entries(args.updates)
                .filter(([k, v]) => v !== undefined && CHARACTER_ONLY_FIELDS.has(k.toLowerCase()))
                .map(([k]) => k);
            if (charOnlyPresent.length > 0) {
                throw new Error(
                    `UPDATE_STATS_TYPE_MISMATCH: ${charOnlyPresent.join(', ')} is character-only; actorType="${actorType}" does not support these fields`
                );
            }
        }

        // Get actor
        const character = await this.query<CharacterInfoResult>("getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const updateData: Record<string, any> = {};

        if (actorType === 'npc' || actorType === 'creature') {
            // NPC/creature branch — MCP Completion v1 Phase 1 (R1.1)
            for (const [key, value] of Object.entries(args.updates)) {
                if (value === undefined) continue;
                const lowerKey = key.toLowerCase();

                // Characteristics (same paths as character)
                if (charMap[key as keyof typeof charMap]) {
                    updateData[`system.characteristics.${charMap[key as keyof typeof charMap]}.initial`] = value;
                }
                // Shared status pools
                else if (lowerKey === 'currentwounds') { updateData['system.status.wounds.value'] = value; }
                else if (lowerKey === 'advantage') { updateData['system.status.advantage.value'] = value; }
                else if (lowerKey === 'criticalwounds') { updateData['system.status.criticalWounds.value'] = value; }
                else if (lowerKey === 'sin') { updateData['system.status.sin.value'] = value; }
                else if (lowerKey === 'corruption') { updateData['system.status.corruption.value'] = value; }
                // Shared detail fields
                else if (lowerKey === 'gender') { updateData['system.details.gender.value'] = value; }
                else if (lowerKey === 'move') { updateData['system.details.move.value'] = value; }
                // NPC/creature-specific details
                else if (lowerKey === 'species') { updateData['system.details.species.value'] = value; }
                else if (lowerKey === 'subspecies') { updateData['system.details.species.subspecies'] = value; }
                else if (lowerKey === 'biography') { updateData['system.details.biography.value'] = value; }
                else if (lowerKey === 'gmnotes') { updateData['system.details.gmnotes.value'] = value; }
                else if (lowerKey === 'size') { updateData['system.details.size.value'] = value; }
                else if (lowerKey === 'god') { updateData['system.details.god.value'] = value; }
                else if (lowerKey === 'statustier') { updateData['system.details.status.tier'] = value; }
                else if (lowerKey === 'statusstanding') { updateData['system.details.status.standing'] = value; }
            }
        } else {
            // Character branch — existing logic (back-compat for all pre-Phase-1 callers)
            for (const [key, value] of Object.entries(args.updates)) {
                if (value === undefined) continue;
                const lowerKey = key.toLowerCase();

                if (charMap[key as keyof typeof charMap]) {
                    updateData[`system.characteristics.${charMap[key as keyof typeof charMap]}.initial`] = value;
                }
                else if (lowerKey === 'currentwounds') { updateData['system.status.wounds.value'] = value; }
                else if (lowerKey === 'fortune') { updateData['system.status.fortune.value'] = value; }
                else if (lowerKey === 'fate') { updateData['system.status.fate.value'] = value; }
                else if (lowerKey === 'resilience') { updateData['system.status.resilience.value'] = value; }
                else if (lowerKey === 'resolve') { updateData['system.status.resolve.value'] = value; }
                else if (lowerKey === 'age') { updateData['system.details.age.value'] = value; }
                else if (lowerKey === 'height') { updateData['system.details.height.value'] = value; }
                else if (lowerKey === 'weight') { updateData['system.details.weight.value'] = value; }
                else if (lowerKey === 'hair') { updateData['system.details.haircolour.value'] = value; }
                else if (lowerKey === 'eyes') { updateData['system.details.eyecolour.value'] = value; }
                else if (lowerKey === 'gender') { updateData['system.details.gender.value'] = value; }
                else if (lowerKey === 'distinguishingmarks') { updateData['system.details.distinguishingmark.value'] = value; }
                else if (lowerKey === 'starsign') { updateData['system.details.starsign.value'] = value; }
                // PC creation details — Phase 1 wfrp_pc_creation.
                // Note the .value vs flat-hyphenated asymmetry: motivation/move/class/career/careerlevel
                // use a `.value` sub-key; the 5 ambition fields store the string directly at a
                // hyphenated path (wfrp4e.js:5385-5393).
                else if (lowerKey === 'motivation') { updateData['system.details.motivation.value'] = value; }
                else if (lowerKey === 'move') { updateData['system.details.move.value'] = value; }
                else if (lowerKey === 'class') { updateData['system.details.class.value'] = value; }
                else if (lowerKey === 'career') { updateData['system.details.career.value'] = value; }
                else if (lowerKey === 'careerlevel') { updateData['system.details.careerlevel.value'] = value; }
                else if (lowerKey === 'personalambitionshort') { updateData['system.details.personal-ambitions.short-term'] = value; }
                else if (lowerKey === 'personalambitionlong') { updateData['system.details.personal-ambitions.long-term'] = value; }
                else if (lowerKey === 'partyambitionname') { updateData['system.details.party-ambitions.name'] = value; }
                else if (lowerKey === 'partyambitionshort') { updateData['system.details.party-ambitions.short-term'] = value; }
                else if (lowerKey === 'partyambitionlong') { updateData['system.details.party-ambitions.long-term'] = value; }
            }
        }

        await this.query<WriteResult>("updateActor", {
            actorId: character.id,
            updateData
        });

        if (actorType === 'character') {
            // DP-16 post-write verification (CCR-5 / Q1 lock — applied to the 10 new fields only;
            // backfilling the 12 legacy fields is v2 hygiene).
            const newFieldVerifyMap: Record<string, string> = {
                motivation: 'system.details.motivation.value',
                move: 'system.details.move.value',
                class: 'system.details.class.value',
                career: 'system.details.career.value',
                careerlevel: 'system.details.careerlevel.value',
                personalAmbitionShort: 'system.details.personal-ambitions.short-term',
                personalAmbitionLong: 'system.details.personal-ambitions.long-term',
                partyAmbitionName: 'system.details.party-ambitions.name',
                partyAmbitionShort: 'system.details.party-ambitions.short-term',
                partyAmbitionLong: 'system.details.party-ambitions.long-term',
            };
            const newFieldsInPayload = Object.entries(args.updates).filter(
                ([k, v]) => v !== undefined && newFieldVerifyMap[k] !== undefined,
            );
            if (newFieldsInPayload.length > 0) {
                const verifyActor = await this.query<CharacterInfoResult>("getCharacterInfo", {
                    characterName: args.characterName,
                });
                for (const [apiKey, requestedValue] of newFieldsInPayload) {
                    const path = newFieldVerifyMap[apiKey]!.split('.');
                    let cursor: any = verifyActor;
                    for (const segment of path) {
                        cursor = cursor?.[segment];
                        if (cursor === undefined) break;
                    }
                    const actual = cursor;
                    // String coercion tolerance for `move` (number → string per Foundry StringField)
                    // and any other string field receiving a numeric input.
                    const equivalent = String(actual) === String(requestedValue);
                    if (!equivalent) {
                        throw new Error(
                            `UPDATE_STATS_NOT_PERSISTED: ${apiKey} expected ${JSON.stringify(requestedValue)}, got ${JSON.stringify(actual)}`,
                        );
                    }
                }
            }
        }

        let result = `✅ Updated stats for **${character.name}** (actorType: ${actorType})\n`;
        const updates = Object.entries(args.updates).filter(([_, v]) => v !== undefined);

        if (updates.length > 0) {
            result += `\n**Changes:**\n`;
            updates.forEach(([key, value]) => {
                result += `- ${key}: ${value}\n`;
            });
        }

        return result;
    }

    private async handleUpdateSkillTalent(args: z.infer<typeof UpdateSkillTalentSchema>): Promise<string> {
        this.logger.info("Updating skill/talent", { characterName: args.characterName, itemName: args.itemName });

        // Get character
        const character = await this.query<CharacterInfoResult>("getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        // Find the item (skill or talent)
        const item = character.items?.find((i: any) =>
            i.name.toLowerCase().includes(args.itemName.toLowerCase())
        );

        if (!item) {
            return `❌ Item "${args.itemName}" not found on ${character.name}`;
        }

        // Build update data
        const updateData: Record<string, any> = {};
        if (args.updates.advances !== undefined) {
            updateData['system.advances.value'] = args.updates.advances;
        }
        if (args.updates.modifier !== undefined) {
            updateData['system.modifier.value'] = args.updates.modifier;
        }

        await this.query<WriteResult>("updateItem", {
            actorId: character.id,
            itemId: item.id,
            updateData
        });

        let result = `✅ Updated **${item.name}** for ${character.name}\n`;

        if (args.updates.advances !== undefined) {
            result += `- Advances: ${args.updates.advances}\n`;
        }
        if (args.updates.modifier !== undefined) {
            result += `- Modifier: ${args.updates.modifier}\n`;
        }

        return result;
    }

    private async handleAddSkillTalent(args: z.infer<typeof AddSkillTalentSchema>): Promise<string> {
        this.logger.info("Adding skill/talent", { characterName: args.characterName, itemName: args.itemName });

        // Get character
        const character = await this.query<CharacterInfoResult>("getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        // Check if already exists
        const existingItem = character.items?.find((i: any) =>
            i.type === args.itemType && i.name.toLowerCase() === args.itemName.toLowerCase()
        );

        if (existingItem) {
            return `⚠️ ${character.name} already has the ${args.itemType} "${existingItem.name}"`;
        }

        // Search compendium
        const searchResults = await this.query<CompendiumSearchItem[]>("searchCompendium", {
            query: args.itemName,
            packType: "Item"
        });

        if (!searchResults || searchResults.length === 0) {
            return `❌ ${args.itemType} "${args.itemName}" not found in compendiums`;
        }

        // Filter for the specific type
        const typeResults = searchResults.filter((item: any) => item.type === args.itemType);

        if (typeResults.length === 0) {
            return `❌ No ${args.itemType}s matching "${args.itemName}" found`;
        }

        // Find exact or best match
        const compendiumItem = typeResults.find((item: any) =>
            item.name.toLowerCase() === args.itemName.toLowerCase()
        ) || typeResults[0]!;

        // Construct UUID
        const compendiumUuid = `Compendium.${compendiumItem.pack}.${compendiumItem.id || compendiumItem._id}`;

        // Add from compendium
        await this.query<WriteResult>("addItemFromCompendium", {
            actorId: character.id,
            compendiumId: compendiumUuid
        });

        // BUG-320: use !== undefined so advances=0 is not skipped
        if (args.advances !== undefined) {
            // Get the newly added item
            const updatedCharacter = await this.query<CharacterInfoResult>("getCharacterInfo", {
                characterName: args.characterName
            });

            const newItem = updatedCharacter.items?.find((i: any) =>
                i.type === args.itemType && i.name.toLowerCase() === args.itemName.toLowerCase()
            );

            if (newItem) {
                await this.query<WriteResult>("updateItem", {
                    actorId: character.id,
                    itemId: newItem.id,
                    updateData: {
                        'system.advances.value': args.advances
                    }
                });
            }
        }

        return `✅ Added **${compendiumItem.name}** (${args.itemType}) to ${character.name}` +
            (args.advances ? ` with ${args.advances} advances` : '');
    }

    private async handleUpdateNotes(args: z.infer<typeof UpdateNotesSchema>): Promise<string> {
        this.logger.info("Updating character notes", { characterName: args.characterName, noteType: args.noteType });

        // Get character
        const character = await this.query<CharacterInfoResult>("getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const updateData: Record<string, any> = {};

        if (args.noteType === "gmnotes") {
            // BUG-321: character actors use system.gmnotes.value;
            // npc/creature actors use system.details.gmnotes.value — mirror handleUpdateStats branching
            const isCharacterType = character.type === 'character';
            const gmnotesPath = isCharacterType ? 'system.gmnotes.value' : 'system.details.gmnotes.value';
            const currentNotes = isCharacterType
                ? (character.system?.gmnotes?.value || '')
                : (character.system?.details?.gmnotes?.value || '');
            const newContent = args.append ? currentNotes + '\n\n' + args.content : args.content;
            updateData[gmnotesPath] = newContent;
        } else {
            const currentBio = character.system?.details?.biography?.value || '';
            const newContent = args.append ? currentBio + '\n\n' + args.content : args.content;
            updateData['system.details.biography.value'] = newContent;
        }

        await this.query<WriteResult>("updateActor", {
            actorId: character.id,
            updateData
        });

        const action = args.append ? "Appended to" : "Updated";
        return `✅ ${action} ${args.noteType} for **${character.name}**`;
    }

    private async handleAddXPLog(args: z.infer<typeof AddXPLogSchema>): Promise<string> {
        this.logger.info("Adding XP log entry", {
            characterName: args.characterName,
            amount: args.amount,
            updateTotal: args.updateTotal,
        });

        // Get character
        const character = await this.query<CharacterInfoResult>("getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        // Get existing log
        const existingLog = character.system?.details?.experience?.log || [];

        // Create new entry
        const newEntry = {
            amount: Math.abs(args.amount),
            reason: args.reason,
            type: args.type
        };

        // Update log
        const updatedLog = [...existingLog, newEntry];

        // BUG-043 merge-once: pack log append + optional total increment into one updateActor call.
        const updateData: Record<string, any> = {
            'system.details.experience.log': updatedLog,
        };
        let expectedTotal: number | undefined;
        if (args.updateTotal) {
            const currentTotal = character.system?.details?.experience?.total ?? 0;
            const delta = args.type === "earned" ? Math.abs(args.amount) : -Math.abs(args.amount);
            expectedTotal = currentTotal + delta;
            updateData['system.details.experience.total'] = expectedTotal;
        }

        await this.query<WriteResult>("updateActor", {
            actorId: character.id,
            updateData,
        });

        // DP-16 post-write verification (CCR-5 / Q1 lock) — only when updateTotal:true.
        // Log-only path remains unverified to preserve legacy behavior (Rule 11).
        if (args.updateTotal && expectedTotal !== undefined) {
            const verifyActor = await this.query<CharacterInfoResult>("getCharacterInfo", {
                characterName: args.characterName,
            });
            const actualTotal = verifyActor?.system?.details?.experience?.total;
            if (actualTotal !== expectedTotal) {
                throw new Error(
                    `XP_TOTAL_NOT_PERSISTED: expected ${expectedTotal}, got ${actualTotal}`,
                );
            }
        }

        const sign = args.type === "earned" ? "+" : "-";
        const totalSuffix = args.updateTotal && expectedTotal !== undefined
            ? ` (total → ${expectedTotal})`
            : '';
        return `✅ Added XP log for **${character.name}**: ${sign}${args.amount} XP - ${args.reason}${totalSuffix}`;
    }
}
