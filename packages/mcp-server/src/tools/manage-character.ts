import { z } from "zod";
import { ErrorTokens, ActorId } from '@foundry-mcp/shared';
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

// Shared 10-characteristic DP-16 verify sub-map (RC1.1c) — spread into both handleUpdateStats branches below.
const CHARACTERISTIC_VERIFY_MAP: Record<string, string> = {
    weaponSkill: 'system.characteristics.ws.initial', ballisticSkill: 'system.characteristics.bs.initial',
    strength: 'system.characteristics.s.initial', toughness: 'system.characteristics.t.initial',
    initiative: 'system.characteristics.i.initial', agility: 'system.characteristics.ag.initial',
    dexterity: 'system.characteristics.dex.initial', intelligence: 'system.characteristics.int.initial',
    willpower: 'system.characteristics.wp.initial', fellowship: 'system.characteristics.fel.initial',
};

// Update stats schema — BUG-457: accepts actorId (branded, primary identity) +
// characterName (optional name fallback), matching get-career-info / roll-income.
// At least one is required — enforced in the handler via resolveCharacterOrError
// (a .refine() here would produce a ZodEffects wrapper that z.discriminatedUnion rejects).
const UpdateStatsSchema = z.object({
    action: z.literal("update-stats"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
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
}).strict();

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

// Add XP log schema — accepts actorId (branded, primary identity) + characterName
// (optional name fallback), matching the get-career-info / roll-income actions. At
// least one is required — enforced in the handler (a .refine() here would produce a
// ZodEffects wrapper that z.discriminatedUnion rejects).
const AddXPLogSchema = z.object({
    action: z.literal("add-xp-log"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
    amount: z.number(),
    reason: z.string(),
    type: z.enum(["earned", "spent"]).default("earned"),
    updateTotal: z.boolean().default(false)
});

// Get career-info schema (P-08) — read-only structured projection of the actor's
// current career. wfrp_layer_expansion_v1 Phase 4 (R7 / P-08).
// Accepts actorId (branded, precise) as the primary identity + characterName as an
// optional name fallback (matches the other 5 manage-character actions). At least one
// is required — enforced at runtime in the handler (a .refine() here would produce a
// ZodEffects wrapper that z.discriminatedUnion rejects).
// `.strict()` rejects unknown keys (CCR-W6). Read-only: no write / notify / verify.
const GetCareerInfoSchema = z.object({
    action: z.literal("get-career-info"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
}).strict();

// Roll-income schema (P-07) — payout-compute + coin-write for the in-play Earning
// Dramatic Test. wfrp_layer_expansion_v1 Phase 4 (R7 / P-07).
// HC2: this handler MUST NOT roll dice. The +20 Earning Dramatic Test is sheet-owned;
// the skill/sheet rolls it and passes the dice total here as `rolledTotal` plus the
// pass/fail `outcome`. The handler computes the Core-RAW payout and writes coin.
// `rolledTotal` is optional/ignored for Gold tier (flat `standing` GC, no dice).
const RollIncomeSchema = z.object({
    action: z.literal("roll-income"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
    rolledTotal: z.number().int().min(0).optional(),
    outcome: z.enum(["success", "fail", "astounding-fail"]),
    // GM overrides for the career tier/standing when the actor's current-career
    // projection is absent or the GM wants to force a specific basis.
    tierOverride: z.enum(["b", "s", "g"]).optional(),
    standingOverride: z.number().int().min(0).optional(),
}).strict();

// Phase 13 (wfrp_layer_expansion_v1 R16) — sheet-flow actions. All 4 follow the
// roll-income shape: actorId (branded, primary) + characterName (fallback) + .strict().
// HC2: apply-fear/apply-terror do NOT roll dice — they create the Fear extendedTest
// item (design B) and leave the Cool test to the sheet. apply-terror reuses the same
// `applyFear` foundry-module query key (Terror always inflicts Fear) and layers
// Cool-test -> Broken guidance onto the returned string.
const ApplyFearSchema = z.object({
    action: z.literal("apply-fear"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
    rating: z.number().int().min(1),
    sourceName: z.string().min(1),
}).strict();

const ApplyTerrorSchema = z.object({
    action: z.literal("apply-terror"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
    rating: z.number().int().min(1),
    sourceName: z.string().min(1),
}).strict();

// add-money: single-denomination MarketWFRP4e.addMoneyTo format ("5g"/"1.5g"/"12b").
const AddMoneySchema = z.object({
    action: z.literal("add-money"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
    amountString: z.string().min(1),
}).strict();

// direct-pay: multi-denomination MarketWFRP4e.directPayCommand format ("8gc6bp").
const DirectPaySchema = z.object({
    action: z.literal("direct-pay"),
    actorId: ActorId.optional(),
    characterName: z.string().optional(),
    amountString: z.string().min(1),
}).strict();

export const ManageCharacterSchema = z.discriminatedUnion("action", [
    UpdateStatsSchema,
    UpdateSkillTalentSchema,
    AddSkillTalentSchema,
    UpdateNotesSchema,
    AddXPLogSchema,
    GetCareerInfoSchema,
    RollIncomeSchema,
    ApplyFearSchema,
    ApplyTerrorSchema,
    AddMoneySchema,
    DirectPaySchema
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

Use this when:
- Setting a characteristic or status value directly (e.g. GM correction, character creation) via action:"update-stats".
- Adjusting an existing skill/talent's advances or modifier via action:"update-skill-talent", or adding a new one from the compendium via action:"add-skill-talent".
- Logging an XP award (action:"add-xp-log") or writing GM notes/biography prose (action:"update-notes").
- Resolving an Earning Dramatic Test payout (action:"roll-income") or crediting/deducting coin (action:"add-money" / action:"direct-pay").
- Reading the actor's current career projection (action:"get-career-info") or applying a Fear/Terror encounter (action:"apply-fear" / action:"apply-terror").

Do NOT use this for generic dot-path actor field writes outside these actions — use update-actor. For read-only full-sheet queries, use get-character instead of get-career-info's narrower projection.

**Actions:**
- **update-stats**: Set characteristics, status values, physical details, PC creation fields (GM override - no restrictions)
- **update-skill-talent**: Modify existing skill/talent advances or modifiers
- **add-skill-talent**: Add skill or talent from compendium
- **update-notes**: Update GM notes or biography
- **add-xp-log**: Add experience log entry; pass updateTotal:true to atomically increment experience.total alongside the log entry
- **get-career-info**: Read-only structured projection of the actor's current career (name, careergroup, level, class, status tier/standing, skills, talents, trappings, incomeSkill) + all career names
- **roll-income**: Compute + write the Earning Dramatic Test payout. Pass the already-rolled dice total (rolledTotal) and the pass/fail outcome — this action does NOT roll dice (the +20 Earning Dramatic Test is sheet-owned per HC2). Writes coin to the tier's money item.
- **apply-fear**: Create a Fear extendedTest item (SL.target=rating, source name preserved) so the sheet can resolve the Cool test. Does NOT roll dice and does NOT open a dialog (HC2 — reimplements the housekeeping instead of calling the dialog-side-effecting wfrp4e method).
- **apply-terror**: Same Fear-item creation as apply-fear, plus Cool-test-to-Broken guidance in the returned text. Does NOT roll dice, does NOT apply Broken directly — resolve the Cool test on the sheet, then apply Broken via update-actor/apply-condition once the GM reports the result.
- **add-money**: Credit a single denomination to the actor's coin item. Format "5g"/"1.5g"/"12b" (amount + b|s|g). Rejects a zero/invalid amount before writing (avoids zeroing all coins).
- **direct-pay**: Deduct a multi-denomination amount from the actor's coin items. Format "8gc6bp" (order-free). Rejects the payment before writing if funds are insufficient.

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
- Add XP with total increment: action="add-xp-log", characterName="Hans", amount=20, reason="Random species bonus", type="earned", updateTotal=true
- Get career info: action="get-career-info", actorId="abc123..." (or characterName="Hans")
- Roll income (Silver-2 PC, test passed, rolled 14 on 2d10): action="roll-income", actorId="abc123...", rolledTotal=14, outcome="success" → writes 14×2 Silver Shillings
- Apply fear: action="apply-fear", actorId="abc123...", rating=2, sourceName="Chaos Warrior"
- Apply terror: action="apply-terror", actorId="abc123...", rating=1, sourceName="Greater Daemon"
- Add money: action="add-money", actorId="abc123...", amountString="5g"
- Direct pay: action="direct-pay", actorId="abc123...", amountString="2gc4ss"

Performance Notes:
- Action-based umbrella, no response-mode variance: each action returns a small structured result scoped to the write/read it performed (e.g. updated fields, career projection, payout amount) — no full-sheet payload is echoed back.`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["update-stats", "update-skill-talent", "add-skill-talent", "update-notes", "add-xp-log", "get-career-info", "roll-income", "apply-fear", "apply-terror", "add-money", "direct-pay"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Character name. Fallback identity where actorId is accepted (update-stats, add-xp-log, get-career-info, roll-income, apply-fear/terror, add-money, direct-pay); still the sole identity for update-skill-talent / add-skill-talent / update-notes." },
                    actorId: { type: "string", description: "Actor document id — primary identity for update-stats (BUG-457), add-xp-log, get-career-info, roll-income, apply-fear/terror, add-money and direct-pay (characterName is an optional fallback; at least one required)" },
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
                    },
                    // roll-income fields
                    rolledTotal: {
                        type: "number",
                        description: "The already-rolled Earning Dramatic Test dice total (for roll-income). The handler does NOT roll — pass the sheet-rolled total. Ignored for Gold tier (flat standing GC)."
                    },
                    outcome: {
                        type: "string",
                        enum: ["success", "fail", "astounding-fail"],
                        description: "Earning Dramatic Test outcome (for roll-income): success=full payout, fail=half (round down), astounding-fail=0 / no write"
                    },
                    tierOverride: {
                        type: "string",
                        enum: ["b", "s", "g"],
                        description: "Override the career tier key for the payout basis (for roll-income), when the actor's current-career projection is absent or the GM forces a tier"
                    },
                    standingOverride: {
                        type: "number",
                        description: "Override the standing for the payout basis (for roll-income)"
                    },
                    // apply-fear / apply-terror fields
                    rating: {
                        type: "number",
                        description: "Fear/Terror rating (for apply-fear, apply-terror) — sets the Fear item's SL.target"
                    },
                    sourceName: {
                        type: "string",
                        description: "Name of the fear/terror source (for apply-fear, apply-terror), e.g. \"Chaos Warrior\""
                    },
                    // add-money / direct-pay fields
                    amountString: {
                        type: "string",
                        description: "Money amount. add-money: single-denomination \"5g\"/\"1.5g\"/\"12b\". direct-pay: multi-denomination \"8gc6bp\"."
                    }
                },
                required: ["action"]
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
            case "get-career-info":
                return this.handleGetCareerInfo(parsed);
            case "roll-income":
                return this.handleRollIncome(parsed);
            case "apply-fear":
                return this.handleApplyFear(parsed);
            case "apply-terror":
                return this.handleApplyTerror(parsed);
            case "add-money":
                return this.handleAddMoney(parsed);
            case "direct-pay":
                return this.handleDirectPay(parsed);
        }
    }

    private async handleUpdateStats(args: z.infer<typeof UpdateStatsSchema>): Promise<string> {
        const actorType = args.actorType ?? 'character';
        this.logger.info("Updating character stats", { identifier: args.actorId ?? args.characterName, actorType });

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

        // Get actor — BUG-457: actorId primary, characterName fallback; the resolver
        // enforces at-least-one-of at runtime.
        const character = await this.resolveCharacterOrError({ actorId: args.actorId, characterName: args.characterName }, "update-stats");
        if (typeof character === "string") return character;

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

        // DP-16 post-write verification (CCR-5 / Q1 lock). Character verifies 10 characteristics
        // + 5 status pools + 10 text fields (25 total); npc/creature is deliberately NUMERIC-ONLY
        // (Q&A 4) — do NOT fold the two branches' field sets together, only the characteristics sub-map.
        const fieldMap: Record<string, string> = actorType === 'character'
            ? {
                ...CHARACTERISTIC_VERIFY_MAP,
                fortune: 'system.status.fortune.value',
                fate: 'system.status.fate.value',
                resilience: 'system.status.resilience.value',
                resolve: 'system.status.resolve.value',
                currentWounds: 'system.status.wounds.value',
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
            }
            : {
                ...CHARACTERISTIC_VERIFY_MAP,
                currentWounds: 'system.status.wounds.value',
                advantage: 'system.status.advantage.value',
                criticalWounds: 'system.status.criticalWounds.value',
                sin: 'system.status.sin.value',
                corruption: 'system.status.corruption.value',
                statusTier: 'system.details.status.tier',
                statusStanding: 'system.details.status.standing',
            };
        // BUG-457: verify via the RESOLVED actor name (always defined post-resolution) so
        // actorId-only calls don't break the DP-16 re-read.
        const clampNotes = await this.verifyStatsPersisted(character.name, args.updates, fieldMap);

        let result = `✅ Updated stats for **${character.name}** (actorType: ${actorType})\n`;
        const updates = Object.entries(args.updates).filter(([_, v]) => v !== undefined);

        if (updates.length > 0) {
            result += `\n**Changes:**\n`;
            updates.forEach(([key, value]) => {
                result += `- ${key}: ${value}\n`;
            });
        }

        if (clampNotes.length > 0) {
            result += `\n⚠️ Clamped to derived bounds:\n`;
            clampNotes.forEach((note) => { result += `- ${note}\n`; });
        }

        await this.query<unknown>('notify', {
            severity: 'updated',
            message: `${character.name}`,
            summary: `stats updated via warhammer-mcp.manage-character`,
        });

        return result;
    }

    private async handleUpdateSkillTalent(args: z.infer<typeof UpdateSkillTalentSchema>): Promise<string> {
        this.logger.info("Updating skill/talent", { characterName: args.characterName, itemName: args.itemName });

        // Get character
        const character = await this.resolveCharacterOrError({ characterName: args.characterName }, "update-skill-talent");
        if (typeof character === "string") return character;

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
        await this.query<unknown>('notify', {
            severity: 'updated',
            message: `${character.name}: ${item.name}`,
            summary: `skill/talent updated via warhammer-mcp.manage-character`,
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
        const character = await this.resolveCharacterOrError({ characterName: args.characterName }, "add-skill-talent");
        if (typeof character === "string") return character;

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

        await this.query<unknown>('notify', {
            severity: 'created',
            message: `${character.name}: ${compendiumItem.name}`,
            summary: `skill/talent added via warhammer-mcp.manage-character`,
        });

        return `✅ Added **${compendiumItem.name}** (${args.itemType}) to ${character.name}` +
            (args.advances ? ` with ${args.advances} advances` : '');
    }

    private async handleUpdateNotes(args: z.infer<typeof UpdateNotesSchema>): Promise<string> {
        this.logger.info("Updating character notes", { characterName: args.characterName, noteType: args.noteType });

        // Get character
        const character = await this.resolveCharacterOrError({ characterName: args.characterName }, "update-notes");
        if (typeof character === "string") return character;

        const updateData: Record<string, any> = {};

        if (args.noteType === "gmnotes") {
            // BUG-390: gmnotes is canonically `system.details.gmnotes.value` for ALL actor types.
            // The wfrp4e `details` template defines gmnotes and character/npc/creature all include it
            // (template.json); the character sheet binds GM Notes to system.details.gmnotes.value
            // (character-notes.hbs), and get-character reads that path. The prior BUG-321 character→
            // system.gmnotes.value split wrote a non-schema top-level path the sheet + get-character
            // never read (and silently dropped any existing notes on append). Unified here.
            const currentNotes = character.system?.details?.gmnotes?.value || '';
            const newContent = args.append ? currentNotes + '\n\n' + args.content : args.content;
            updateData['system.details.gmnotes.value'] = newContent;
        } else {
            const currentBio = character.system?.details?.biography?.value || '';
            const newContent = args.append ? currentBio + '\n\n' + args.content : args.content;
            updateData['system.details.biography.value'] = newContent;
        }

        await this.query<WriteResult>("updateActor", {
            actorId: character.id,
            updateData
        });
        await this.query<unknown>('notify', {
            severity: 'updated',
            message: `${character.name}: ${args.noteType}`,
            summary: `notes updated via warhammer-mcp.manage-character`,
        });

        const action = args.append ? "Appended to" : "Updated";
        return `✅ ${action} ${args.noteType} for **${character.name}**`;
    }

    private async handleAddXPLog(args: z.infer<typeof AddXPLogSchema>): Promise<string> {
        this.logger.info("Adding XP log entry", { identifier: args.actorId ?? args.characterName, amount: args.amount, updateTotal: args.updateTotal });

        // Get character (by actorId primary, characterName fallback)
        const character = await this.resolveCharacterOrError(args, "add-xp-log");
        if (typeof character === "string") return character;

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
        await this.query<unknown>('notify', {
            severity: 'updated',
            message: `${character.name}: XP log`,
            summary: `xp log updated via warhammer-mcp.manage-character`,
        });

        // DP-16 post-write verification (CCR-5 / Q1 lock) — only when updateTotal:true.
        // Log-only path remains unverified to preserve legacy behavior (Rule 11).
        if (args.updateTotal && expectedTotal !== undefined) {
            const verifyActor = await this.query<CharacterInfoResult>("getCharacterInfo", {
                characterId: character.id,
            });
            const actualTotal = verifyActor?.system?.details?.experience?.total;
            if (actualTotal !== expectedTotal) {
                throw new Error(
                    `${ErrorTokens.XP_TOTAL_NOT_PERSISTED}: expected ${expectedTotal}, got ${actualTotal}`,
                );
            }
        }

        const sign = args.type === "earned" ? "+" : "-";
        const totalSuffix = args.updateTotal && expectedTotal !== undefined
            ? ` (total → ${expectedTotal})`
            : '';
        return `✅ Added XP log for **${character.name}**: ${sign}${args.amount} XP - ${args.reason}${totalSuffix}`;
    }

    // ── P-08: get-career-info (read-only) ───────────────────────────────────────
    // wfrp_layer_expansion_v1 Phase 4 (R7 / P-08). Structured projection of the actor's
    // CURRENT career, filtered mcp-server-side from getCharacterInfo's deep items[]
    // projection (QA-1 resolved DEEP: data-access.ts getCharacterInfo maps every item
    // with `system: sanitizeData(item.system)`, so a career Item carries its full
    // system.current/status/skills/incomeSkill — no foundry-module change needed).
    // No write / notify / verify (read-only). Returns career:null (not a throw) when the
    // actor has no current career.
    private async handleGetCareerInfo(args: z.infer<typeof GetCareerInfoSchema>): Promise<string> {
        this.logger.info("Getting career info", { identifier: args.actorId ?? args.characterName });

        const character = await this.resolveCharacterOrError(args, "get-career-info");
        if (typeof character === "string") return character;

        const careerItems = (character.items ?? []).filter((i: any) => i.type === "career");
        const allCareerNames = careerItems.map((i: any) => i.name);
        const current = careerItems.find((i: any) => i.system?.current?.value === true);

        if (!current) {
            // Not an error — the actor simply has no career flagged current.
            const result = {
                actorId: character.id,
                actorName: character.name,
                career: null,
                allCareerNames,
            };
            return JSON.stringify(result, null, 2);
        }

        const sys = current.system ?? {};
        const projection = {
            actorId: character.id,
            actorName: character.name,
            career: {
                id: current.id,
                name: current.name,
                careergroup: sys.careergroup?.value ?? null,
                class: sys.class?.value ?? null,
                level: sys.level?.value ?? null,
                complete: sys.complete?.value ?? false,
                statusTier: sys.status?.tier ?? null,
                statusStanding: sys.status?.standing ?? null,
                characteristics: sys.characteristics ?? [],
                skills: sys.skills ?? [],
                talents: sys.talents ?? [],
                trappings: sys.trappings ?? [],
                incomeSkill: sys.incomeSkill ?? [],
            },
            allCareerNames,
        };
        return JSON.stringify(projection, null, 2);
    }

    // ── P-07: roll-income (payout-compute + coin-write) ─────────────────────────
    // wfrp_layer_expansion_v1 Phase 4 (R7 / P-07). The in-play Earning Dramatic Test
    // payout engine. HC2: this handler does NOT roll dice — the +20 Earning Dramatic
    // Test is sheet-owned; the skill/sheet rolls it and passes `rolledTotal` + `outcome`.
    // It MUST NOT call MarketWFRP4e.rollIncome() (that method rolls — wfrp4e.js:1124) or
    // `new Roll(...)`. It reads the current career tier/standing, computes the Core-RAW
    // payout, and writes coin via the existing transaction-wrapped `updateItem` query.
    //
    // Payout (Core p.48/64): success = full = rolledTotal × standing of the tier coin
    // (Gold = standing flat, no dice); fail = half (round down); astounding-fail = 0
    // (no write — do NOT zero existing money).
    private async handleRollIncome(args: z.infer<typeof RollIncomeSchema>): Promise<string> {
        this.logger.info("Rolling income (payout-compute + write)", { identifier: args.actorId ?? args.characterName, outcome: args.outcome });

        const character = await this.resolveCharacterOrError(args, "roll-income");
        if (typeof character === "string") return character;

        // Resolve tier + standing — GM overrides win, else read the current career item.
        let tier: string | null = args.tierOverride ?? null;
        let standing: number | null = args.standingOverride ?? null;
        if (tier === null || standing === null) {
            const careerItems = (character.items ?? []).filter((i: any) => i.type === "career");
            const current = careerItems.find((i: any) => i.system?.current?.value === true);
            if (!current) {
                return `❌ ${character.name} has no current career; pass tierOverride + standingOverride to roll income`;
            }
            if (tier === null) tier = current.system?.status?.tier ?? null;
            if (standing === null) standing = Number(current.system?.status?.standing ?? 0);
        }
        // Normalize tier to a key (b|s|g). Career items store the single-letter key.
        const tierKey = (tier ?? '').toString().toLowerCase().charAt(0);
        const TIER_TO_MONEY: Record<string, string> = {
            b: "Brass Penny",
            s: "Silver Shilling",
            g: "Gold Crown",
        };
        const moneyName = TIER_TO_MONEY[tierKey];
        if (!moneyName) {
            return `❌ Unknown status tier "${tier}" — expected one of b (Brass), s (Silver), g (Gold)`;
        }
        if (standing === null || !Number.isFinite(standing) || standing < 0) {
            return `❌ Invalid standing "${standing}" for roll-income`;
        }

        // Compute the payout (NO dice — rolledTotal is supplied by the sheet/skill).
        // Gold: flat `standing` GC (no roll). Brass/Silver: rolledTotal × standing on success.
        let earnedAmount: number;
        if (args.outcome === "astounding-fail") {
            earnedAmount = 0;
        } else if (tierKey === "g") {
            // Gold is flat: standing GC; fail = half of standing (round down).
            earnedAmount = args.outcome === "fail" ? Math.floor(standing / 2) : standing;
        } else {
            const total = args.rolledTotal ?? 0;
            const full = total * standing;
            earnedAmount = args.outcome === "fail" ? Math.floor(full / 2) : full;
        }

        // Astounding-fail (or a computed 0): no write — do NOT zero existing money.
        if (earnedAmount <= 0) {
            return `💰 ${character.name}: Earning Dramatic Test ${args.outcome} → 0 ${moneyName} earned (no coin written)`;
        }

        // Find the tier's money item on the actor.
        const moneyItem = (character.items ?? []).find(
            (i: any) => i.type === "money" && i.name?.toLowerCase() === moneyName.toLowerCase(),
        );
        if (!moneyItem) {
            return `❌ ${character.name} has no "${moneyName}" money item to credit; add one before rolling income`;
        }
        const currentQty = Number(moneyItem.system?.quantity?.value ?? 0);
        const newQty = currentQty + earnedAmount;

        // Write coin via the existing transaction-wrapped + notify-wired updateItem path
        // (thin-primitive compliant — no new foundry-module query key).
        await this.query<WriteResult>("updateItem", {
            actorId: character.id,
            itemId: moneyItem.id,
            updateData: { "system.quantity.value": newQty },
        });

        // DP-16 post-write verification — re-read the money item quantity.
        const verifyActor = await this.query<CharacterInfoResult>("getCharacterInfo", {
            characterId: character.id,
        });
        const verifyItem = (verifyActor.items ?? []).find((i: any) => i.id === moneyItem.id);
        const actualQty = Number(verifyItem?.system?.quantity?.value ?? NaN);
        if (actualQty !== newQty) {
            throw new Error(
                `${ErrorTokens.ROLL_INCOME_NOT_PERSISTED}: ${moneyName} quantity expected ${newQty}, got ${actualQty}`,
            );
        }

        // notify Pattern B — post-write GM feedback through the notify.* channel.
        await this.query<unknown>('notify', {
            severity: 'updated',
            message: `${character.name}: +${earnedAmount} ${moneyName}`,
            summary: `income (${args.outcome}) written via warhammer-mcp.manage-character`,
        });

        // Unified-ledger append (Phase 2, wfrp_economy_system) — earn-tagged, fail-open: a
        // logging failure must never fail an already-persisted-and-verified roll-income.
        const BP_PER_TIER: Record<string, number> = { b: 1, s: 12, g: 240 };
        try {
            await this.query<unknown>('module-wfrp-economy', {
                action: 'record-transaction',
                actorId: character.id,
                amountBp: earnedAmount * (BP_PER_TIER[tierKey] ?? 1),
                source: 'earn',
                type: 'income',
                description: `Earning Dramatic Test (${args.outcome}, tier ${tier}, standing ${standing})`,
            });
        } catch (e) {
            this.logger.warn("record-transaction ledger append failed for roll-income (fail-open, coin write unaffected)", { error: e instanceof Error ? e.message : String(e) });
        }

        return `💰 ${character.name}: Earning Dramatic Test ${args.outcome} → +${earnedAmount} ${moneyName} ` +
            `(${currentQty} → ${newQty})`;
    }

    // ── Phase 13 (wfrp_layer_expansion_v1 R16): sheet-flow actions ──────────────
    // HC2: none of the 4 handlers below roll dice. apply-fear/apply-terror create the
    // Fear extendedTest item (design B — foundry-module skips setupExtendedTest, the
    // dialog/deadlock side effect); add-money/direct-pay wrap MarketWFRP4e with
    // load-bearing input validation ahead of the write (foundry-module owns the guards;
    // this layer just resolves identity + relays the typed result). notify already fires
    // foundry-module-side inside the dedicated query-key handler — no redundant
    // mcp-server-side notify call here (unlike update-actor/update-item, which are raw
    // primitives with no self-notify).
    private async resolveCharacterOrError(
        args: { actorId?: string | undefined; characterName?: string | undefined },
        actionLabel: string,
    ): Promise<CharacterInfoResult | string> {
        const identifier = args.actorId ?? args.characterName;
        if (!identifier) {
            return `❌ actorId or characterName is required for ${actionLabel}`;
        }
        let character: CharacterInfoResult;
        try {
            character = await this.query<CharacterInfoResult>("getCharacterInfo", {
                characterId: args.actorId,
                characterName: args.characterName,
            });
        } catch (err: any) {
            return `❌ Actor "${identifier}" not found: ${err?.message ?? err}`;
        }
        if (!character || !character.id) {
            return `❌ Actor "${identifier}" not found`;
        }
        return character;
    }

    // DP-16 post-write verification walker (RC1.1c dedup) — shared fetch/walk/compare/throw
    // body for handleUpdateStats' character + npc/creature branches. Callers pass their own
    // `fieldMap`; the two maps stay separate (npc/creature is deliberately numeric-only).
    // Returns clamp-note strings (BUG-434) for the caller to surface in the response text;
    // empty array when every field persisted at its literal requested value.
    private async verifyStatsPersisted(characterName: string | undefined, updates: Record<string, unknown>, fieldMap: Record<string, string>): Promise<string[]> {
        const fieldsInPayload = Object.entries(updates).filter(([k, v]) => v !== undefined && fieldMap[k] !== undefined);
        if (fieldsInPayload.length === 0) return [];
        const verifyActor = await this.query<CharacterInfoResult>('getCharacterInfo', { characterName });
        const clampNotes: string[] = [];
        for (const [apiKey, requestedValue] of fieldsInPayload) {
            const path = fieldMap[apiKey]!.split('.');
            let cursor: any = verifyActor;
            for (const segment of path) {
                cursor = cursor?.[segment];
                if (cursor === undefined) break;
            }
            const actual = cursor;
            // String coercion tolerance for `move` (number → string per Foundry StringField)
            // and any other string field receiving a numeric input.
            const equivalent = String(actual) === String(requestedValue);
            if (equivalent) continue;

            // BUG-434: bounded `.value` pools (wounds/fortune/fate/resilience/resolve/
            // advantage/criticalWounds) get clamped server-side to the derived [0, max]
            // range. A mismatch that equals the SAME sibling `.max` bound is a successful
            // clamped write, not a persistence failure — check before failing loud.
            const clampNote = this.clampedStatNote(verifyActor, path, requestedValue, actual);
            if (clampNote !== null) {
                clampNotes.push(`${apiKey}: ${clampNote}`);
                continue;
            }

            throw new Error(
                `${ErrorTokens.UPDATE_STATS_NOT_PERSISTED}: ${apiKey} expected ${JSON.stringify(requestedValue)}, got ${JSON.stringify(actual)}`,
            );
        }
        return clampNotes;
    }

    // BUG-434 clamp-aware compare helper. Only applies to numeric `.value` leaf paths whose
    // parent object also carries a numeric `.max` (wfrp4e's bounded-pool shape, e.g.
    // `system.status.wounds.{value,max}` — see character.ts:273-274, compendium.ts:749). A
    // non-`.value` path (text fields) or a parent without `.max` returns null unchanged, so
    // the caller's existing throw behavior is preserved for every non-clamp mismatch.
    private clampedStatNote(verifyActor: any, path: string[], requestedValue: unknown, actual: unknown): string | null {
        if (path[path.length - 1] !== 'value') return null;
        const requestedNum = Number(requestedValue);
        const actualNum = Number(actual);
        if (Number.isNaN(requestedNum) || Number.isNaN(actualNum)) return null;
        let parent: any = verifyActor;
        for (const segment of path.slice(0, -1)) {
            parent = parent?.[segment];
            if (parent === undefined) return null;
        }
        const max = typeof parent?.max === 'number' ? parent.max : undefined;
        if (max === undefined) return null;
        const min = typeof parent?.min === 'number' ? parent.min : 0;
        const clampedRequested = Math.min(max, Math.max(min, requestedNum));
        if (clampedRequested === requestedNum) return null; // nothing was clamped — not this case
        return actualNum === clampedRequested
            ? `requested ${requestedNum}, clamped to derived bound ${clampedRequested}`
            : null;
    }

    private async handleApplyFear(args: z.infer<typeof ApplyFearSchema>): Promise<string> {
        this.logger.info("Applying fear", { identifier: args.actorId ?? args.characterName, rating: args.rating, sourceName: args.sourceName });
        const character = await this.resolveCharacterOrError(args, "apply-fear");
        if (typeof character === "string") return character;

        const result = await this.query<{ fearItemId: string; itemName: string }>("applyFear", {
            actorId: character.id,
            rating: args.rating,
            sourceName: args.sourceName,
        });

        return `😨 **${character.name}** is now Fearful of **${args.sourceName}** (rating ${args.rating}).\n` +
            `Created **${result.itemName}** (Cool test, SL target ${args.rating}) — resolve the Cool test on the sheet.`;
    }

    private async handleApplyTerror(args: z.infer<typeof ApplyTerrorSchema>): Promise<string> {
        this.logger.info("Applying terror", { identifier: args.actorId ?? args.characterName, rating: args.rating, sourceName: args.sourceName });
        const character = await this.resolveCharacterOrError(args, "apply-terror");
        if (typeof character === "string") return character;

        // Terror always inflicts Fear (wfrp4e.js:13351-13359) — reuse the same
        // foundry-module query key; the Cool-test->Broken cascade is delegated to the
        // sheet + a confirm-gated apply-condition follow-up in the skill layer (HC2).
        const result = await this.query<{ fearItemId: string; itemName: string }>("applyFear", {
            actorId: character.id,
            rating: args.rating,
            sourceName: args.sourceName,
        });

        return `😱 **${character.name}** suffers Terror ${args.rating} from **${args.sourceName}**.\n` +
            `Created **${result.itemName}** (Cool test, SL target ${args.rating}) — resolve the Cool test on the sheet.\n` +
            `On a **failed** Cool test, apply **Broken(${args.rating} + |SL|)** — confirm with the GM-reported SL, then apply the condition.`;
    }

    private async handleAddMoney(args: z.infer<typeof AddMoneySchema>): Promise<string> {
        this.logger.info("Adding money", { identifier: args.actorId ?? args.characterName, amountString: args.amountString });
        const character = await this.resolveCharacterOrError(args, "add-money");
        if (typeof character === "string") return character;

        const result = await this.query<{ coins: Array<{ name: string; quantity: number }> }>("addMoney", {
            actorId: character.id,
            amountString: args.amountString,
        });

        const coinSummary = result.coins.map((c) => `${c.name}: ${c.quantity}`).join(", ");
        return `💰 Added **${args.amountString}** to ${character.name} (${coinSummary})`;
    }

    private async handleDirectPay(args: z.infer<typeof DirectPaySchema>): Promise<string> {
        this.logger.info("Direct pay", { identifier: args.actorId ?? args.characterName, amountString: args.amountString });
        const character = await this.resolveCharacterOrError(args, "direct-pay");
        if (typeof character === "string") return character;

        const result = await this.query<{ deductedBP: number; remainingBP: number }>("directPay", {
            actorId: character.id,
            amountString: args.amountString,
        });

        return `💸 ${character.name} paid **${args.amountString}** (${result.deductedBP} BP deducted, ${result.remainingBP} BP remaining)`;
    }
}
