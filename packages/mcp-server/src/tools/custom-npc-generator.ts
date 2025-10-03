import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class CustomNPCGeneratorTools {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [
            {
                name: "create-custom-npc",
                description: `Create a custom WFRP 4e NPC with specific XP budget and personality archetype.

This tool generates balanced NPCs by distributing XP across characteristics, skills, and talents based on the chosen archetype. Perfect for creating unique NPCs without manually calculating advancement costs.

**Archetypes** (determines XP distribution):
- **Aggressive Fighter**: Prioritizes WS, S, T, combat skills (Melee, Dodge), aggressive talents
- **Ranged Combatant**: Prioritizes BS, Ag, Dex, ranged skills (Ranged, Perception), sharpshooter talents
- **Defensive Warrior**: Prioritizes T, WP, defensive skills (Endurance, Cool), resilient talents
- **Agile Rogue**: Prioritizes Ag, Dex, I, stealth skills (Stealth, Climb, Pick Lock), cunning talents
- **Cunning Thief**: Prioritizes Dex, Int, Fel, criminal skills (Sleight of Hand, Charm), deceptive talents
- **Wise Priest**: Prioritizes WP, Int, Fel, religious skills (Pray, Lore), divine talents
- **Powerful Wizard**: Prioritizes Int, WP, magical skills (Channelling, Language Magick), arcane talents
- **Charismatic Leader**: Prioritizes Fel, WP, social skills (Leadership, Charm, Intimidate), inspiring talents
- **Scholarly Sage**: Prioritizes Int, academic skills (Lore specializations), knowledge talents
- **Hardy Survivalist**: Prioritizes T, outdoor skills (Track, Survival, Animal Care), wilderness talents
- **Brutal Berserker**: Maximizes S, WS, T, minimal defensive skills, frenzied combat style
- **Swift Duelist**: Prioritizes Ag, I, WS, finesse combat (Melee Fencing), precision talents
- **Intimidating Thug**: Prioritizes S, T, Fel, intimidation and brawling skills, menacing presence
- **Sneaky Assassin**: Prioritizes Ag, Dex, WS, stealth and poison skills, deadly precision

**XP Distribution Formula**:
- Starting human: All characteristics at 20 + 2d10
- XP Costs: Characteristics [25,30,40,50,70,90,120,150,190,240], Skills [10,15,20,30,40,60,80,110,140,180], Talents 100/rank
- Archetype determines priority: Primary (50%), Secondary (30%), Tertiary (20%)

**Personality Traits** (optional modifiers):
- Brave/Cowardly, Aggressive/Peaceful, Cunning/Simple, Honorable/Treacherous
- Greedy/Generous, Loyal/Disloyal, Ambitious/Content, Cruel/Kind

Returns complete NPC data including:
- Distributed characteristics with advances
- Learned skills with advances
- Acquired talents
- Personality traits
- Suggested equipment based on archetype
- Total XP spent breakdown`,
                inputSchema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "Name for the NPC (e.g., 'Brutalus the Berserker', 'Katerina the Thief')",
                        },
                        totalXP: {
                            type: "number",
                            description: "Total XP budget for advancement (typical ranges: 500-1000 novice, 1000-2000 experienced, 2000-4000 veteran, 4000+ master)",
                            minimum: 0,
                            maximum: 10000,
                        },
                        archetype: {
                            type: "string",
                            enum: [
                                "aggressive-fighter",
                                "ranged-combatant",
                                "defensive-warrior",
                                "agile-rogue",
                                "cunning-thief",
                                "wise-priest",
                                "powerful-wizard",
                                "charismatic-leader",
                                "scholarly-sage",
                                "hardy-survivalist",
                                "brutal-berserker",
                                "swift-duelist",
                                "intimidating-thug",
                                "sneaky-assassin"
                            ],
                            description: "Archetype determining XP distribution priorities",
                        },
                        personalityTraits: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            description: "Optional personality traits (e.g., ['brave', 'aggressive', 'greedy'])",
                        },
                        species: {
                            type: "string",
                            enum: ["human", "halfling", "dwarf", "high-elf", "wood-elf"],
                            description: "Species (affects starting characteristics)",
                            default: "human",
                        },
                        career: {
                            type: "string",
                            description: "Optional specific career (e.g., 'Soldier', 'Thief', 'Wizard'). If not specified, will be suggested based on archetype.",
                        },
                        description: {
                            type: "string",
                            description: "Optional physical description or background notes",
                        },
                        createInFoundry: {
                            type: "boolean",
                            description: "If true, actually creates the NPC in Foundry with all characteristics, skills, and talents. If false, just returns a preview.",
                            default: true,
                        },
                    },
                    required: ["name", "totalXP", "archetype"],
                },
            },
            {
                name: "list-npc-archetypes",
                description: `List all available NPC archetypes with their characteristic priorities and typical careers.

Returns detailed information about each archetype including:
- Primary/secondary/tertiary characteristics
- Typical skill focuses
- Common talents
- Suggested careers
- XP efficiency ratings
- Role descriptions

Useful for planning NPC creation or understanding archetype options.`,
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "calculate-npc-xp-distribution",
                description: `Preview how XP would be distributed for an archetype before creating the NPC.

Useful for planning or understanding how the XP budget will be allocated across characteristics, skills, and talents without actually creating the NPC.

Returns breakdown showing:
- Characteristic advances and costs
- Skill advances and costs
- Talent acquisitions and costs
- Total XP spent vs budget
- Remaining XP`,
                inputSchema: {
                    type: "object",
                    properties: {
                        totalXP: {
                            type: "number",
                            description: "XP budget to preview",
                            minimum: 0,
                        },
                        archetype: {
                            type: "string",
                            enum: [
                                "aggressive-fighter",
                                "ranged-combatant",
                                "defensive-warrior",
                                "agile-rogue",
                                "cunning-thief",
                                "wise-priest",
                                "powerful-wizard",
                                "charismatic-leader",
                                "scholarly-sage",
                                "hardy-survivalist",
                                "brutal-berserker",
                                "swift-duelist",
                                "intimidating-thug",
                                "sneaky-assassin"
                            ],
                            description: "Archetype to preview",
                        },
                    },
                    required: ["totalXP", "archetype"],
                },
            },
        ];
    }

    async handleCreateCustomNPC(args: {
        name: string;
        totalXP: number;
        archetype: string;
        personalityTraits?: string[];
        species?: string;
        career?: string;
        description?: string;
        createInFoundry?: boolean;
    }) {
        this.logger.info("Creating custom NPC", {
            name: args.name,
            xp: args.totalXP,
            archetype: args.archetype,
            createInFoundry: args.createInFoundry ?? true
        });

        const species = args.species || "human";
        const archetypeData = this.getArchetypeData(args.archetype);

        // Generate base characteristics by species
        const baseCharacteristics = this.generateBaseCharacteristics(species);

        // Distribute XP according to archetype
        const xpDistribution = this.distributeXP(
            args.totalXP,
            archetypeData,
            baseCharacteristics,
            species
        );

        // Generate suggested equipment
        const equipment = this.generateEquipment(args.archetype);

        // Calculate derived stats
        const wounds = this.calculateWounds(
            xpDistribution.characteristics.s.final,
            xpDistribution.characteristics.t.final,
            xpDistribution.characteristics.wp.final,
            species
        );

        let createdActorId: string | null = null;

        // CREATE NPC IN FOUNDRY if requested
        if (args.createInFoundry !== false) {
            try {
                // Build actor data structure for WFRP4e
                const actorData: any = {
                    name: args.name,
                    type: "character", // WFRP uses "character" type for both PCs and NPCs
                    system: {
                        details: {
                            species: {
                                value: species
                            },
                            biography: {
                                value: args.description || `${archetypeData.name} archetype NPC generated with ${args.totalXP} XP.`
                            },
                            experience: {
                                current: xpDistribution.summary.remaining,
                                total: args.totalXP,
                                spent: xpDistribution.summary.totalSpent
                            }
                        },
                        characteristics: {},
                        status: {
                            wounds: {
                                value: wounds,
                                max: wounds
                            },
                            fortune: {
                                value: this.getFortune(species),
                                max: this.getFortune(species)
                            },
                            fate: {
                                value: this.getFate(species),
                                max: this.getFate(species)
                            }
                        }
                    }
                };

                // Set characteristics with advances
                // WFRP 4e system: value = initial + advances + modifier
                // - initial: Base characteristic from species (20 + 2d10 for humans, etc.)
                // - advances: Number of advances bought with XP (each advance = +1 to stat)
                // - Each advance costs progressively more XP [25,30,40,50,70,90,120,150,190,240]
                const charOrder = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
                for (const char of charOrder) {
                    actorData.system.characteristics[char] = {
                        initial: xpDistribution.characteristics[char].base,
                        advances: xpDistribution.characteristics[char].advances, // Number of advances (not multiplied!)
                        modifier: 0
                    };
                }

                // Create the actor
                const actor = await this.foundryClient.query('foundry-mcp-bridge.createActor', {
                    actorData: actorData
                });

                createdActorId = actor.id;
                this.logger.info("Created NPC actor", { actorId: createdActorId, name: args.name });

                // Add skills as items
                for (const skill of xpDistribution.skills) {
                    try {
                        const skillData = {
                            name: skill.name,
                            type: 'skill',
                            system: {
                                advanced: {
                                    value: 'bsc' // Most skills are basic; could be improved by checking against advanced skill list
                                },
                                grouped: {
                                    value: 'noSpec' // Most skills don't have specializations
                                },
                                characteristic: {
                                    value: skill.linkedCharacteristic || 'ws'
                                },
                                advances: {
                                    value: skill.advances, // Number of advances bought (each adds +1 to skill)
                                    costModifier: 0,
                                    force: false
                                },
                                modifier: {
                                    value: 0
                                },
                                total: {
                                    value: skill.total
                                }
                            }
                        };

                        await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                            actorId: createdActorId,
                            itemData: skillData
                        });
                    } catch (skillError) {
                        this.logger.warn("Failed to add skill", { skill: skill.name, error: skillError });
                    }
                }

                // Add talents as items
                for (const talent of xpDistribution.talents) {
                    try {
                        const talentData = {
                            name: talent.name,
                            type: 'talent',
                            system: {
                                max: {
                                    value: 'none' // Most talents can be taken multiple times; could be improved with specific max values
                                },
                                advances: {
                                    value: talent.rank || 1,
                                    force: false
                                },
                                tests: {
                                    value: talent.description || ''
                                }
                            }
                        };

                        await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                            actorId: createdActorId,
                            itemData: talentData
                        });
                    } catch (talentError) {
                        this.logger.warn("Failed to add talent", { talent: talent.name, error: talentError });
                    }
                }

                this.logger.info("Completed NPC creation", {
                    actorId: createdActorId,
                    skillsAdded: xpDistribution.skills.length,
                    talentsAdded: xpDistribution.talents.length
                });

            } catch (error) {
                this.logger.error("Failed to create NPC in Foundry", error);
                createdActorId = null;
            }
        }

        // Build NPC summary
        let npcReport = createdActorId
            ? `✅ **Custom NPC Created in Foundry: ${args.name}**\n\n`
            : `📋 **Custom NPC Preview: ${args.name}**\n\n`;

        if (createdActorId) {
            npcReport += `🎭 **Actor ID**: ${createdActorId}\n`;
            npcReport += `The NPC has been created in Foundry VTT with all characteristics, skills, and talents!\n\n`;
        }

        npcReport += `**Species:** ${species.charAt(0).toUpperCase() + species.slice(1)}\n`;
        npcReport += `**Archetype:** ${archetypeData.name}\n`;
        if (args.career) {
            npcReport += `**Career:** ${args.career}\n`;
        } else {
            npcReport += `**Suggested Career:** ${archetypeData.suggestedCareer}\n`;
        }
        npcReport += `**Total XP:** ${args.totalXP}\n`;
        if (args.description) {
            npcReport += `**Description:** ${args.description}\n`;
        }
        npcReport += `\n`;

        // Characteristics
        npcReport += `## 📊 Characteristics\n`;
        const charOrder = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
        const charNames: { [key: string]: string } = {
            ws: 'Weapon Skill',
            bs: 'Ballistic Skill',
            s: 'Strength',
            t: 'Toughness',
            i: 'Initiative',
            ag: 'Agility',
            dex: 'Dexterity',
            int: 'Intelligence',
            wp: 'Willpower',
            fel: 'Fellowship'
        };

        for (const char of charOrder) {
            const data = xpDistribution.characteristics[char];
            const isPrimary = archetypeData.primaryCharacteristics.includes(char);
            const isSecondary = archetypeData.secondaryCharacteristics.includes(char);
            const marker = isPrimary ? '⭐' : isSecondary ? '✦' : '';

            npcReport += `- **${charNames[char]}**: ${data.final} `;
            npcReport += `(base ${data.base}, +${data.advances} advances, ${data.xpSpent} XP) ${marker}\n`;
        }

        // Skills
        npcReport += `\n## 🎯 Skills\n`;
        if (xpDistribution.skills.length > 0) {
            for (const skill of xpDistribution.skills) {
                npcReport += `- **${skill.name}**: ${skill.total}% `;
                npcReport += `(+${skill.advances} advances, ${skill.xpSpent} XP)\n`;
            }
        } else {
            npcReport += `*No skills acquired with this XP budget*\n`;
        }

        // Talents
        npcReport += `\n## ⚡ Talents\n`;
        if (xpDistribution.talents.length > 0) {
            for (const talent of xpDistribution.talents) {
                npcReport += `- **${talent.name}**`;
                if (talent.rank > 1) npcReport += ` (Rank ${talent.rank})`;
                npcReport += ` - ${talent.description}\n`;
            }
        } else {
            npcReport += `*No talents acquired with this XP budget*\n`;
        }

        // Personality
        if (args.personalityTraits && args.personalityTraits.length > 0) {
            npcReport += `\n## 🎭 Personality Traits\n`;
            for (const trait of args.personalityTraits) {
                npcReport += `- ${trait.charAt(0).toUpperCase() + trait.slice(1)}\n`;
            }
        }

        // Equipment suggestions
        npcReport += `\n## 🛡️ Suggested Equipment\n`;
        for (const item of equipment) {
            npcReport += `- ${item}\n`;
        }

        // XP Summary
        npcReport += `\n## 💰 XP Breakdown\n`;
        npcReport += `- **Characteristics:** ${xpDistribution.summary.characteristicsXP} XP\n`;
        npcReport += `- **Skills:** ${xpDistribution.summary.skillsXP} XP\n`;
        npcReport += `- **Talents:** ${xpDistribution.summary.talentsXP} XP\n`;
        npcReport += `- **Total Spent:** ${xpDistribution.summary.totalSpent} XP\n`;
        npcReport += `- **Remaining:** ${xpDistribution.summary.remaining} XP\n`;

        // Derived stats
        npcReport += `\n## 🩸 Derived Statistics\n`;
        npcReport += `- **Wounds:** ${wounds}\n`;
        npcReport += `- **Movement:** ${this.getMovement(species)}\n`;
        npcReport += `- **Fortune Points:** ${this.getFortune(species)}\n`;
        npcReport += `- **Fate Points:** ${this.getFate(species)}\n`;
        npcReport += `- **Resilience:** ${Math.floor(xpDistribution.characteristics.t.final / 10) + Math.floor(xpDistribution.characteristics.wp.final / 10)}\n`;

        npcReport += `\n---\n`;
        if (createdActorId) {
            npcReport += `✅ NPC successfully created in Foundry VTT! You can now find "${args.name}" in your Actors directory.`;
        } else {
            npcReport += `💡 **Note:** This is a preview. Set \`createInFoundry: true\` to actually create the NPC in Foundry VTT.`;
        }

        return {
            content: [{ type: "text", text: npcReport }],
        };
    }

    async handleListNPCArchetypes(args: {}) {
        this.logger.info("Listing NPC archetypes");

        const archetypes = this.getAllArchetypes();

        let report = `⚔️ **WFRP 4e NPC Archetypes**\n\n`;
        report += `Use these archetypes with \`create-custom-npc\` to generate balanced NPCs.\n\n`;

        for (const archetype of archetypes) {
            report += `## ${archetype.name}\n`;
            report += `**ID:** \`${archetype.id}\`\n`;
            report += `**Description:** ${archetype.description}\n`;
            report += `**Suggested Career:** ${archetype.suggestedCareer}\n\n`;

            report += `**Primary Characteristics** (50% of XP): `;
            report += archetype.primaryCharacteristics.map((c: string) => c.toUpperCase()).join(', ') + '\n';

            report += `**Secondary Characteristics** (30% of XP): `;
            report += archetype.secondaryCharacteristics.map((c: string) => c.toUpperCase()).join(', ') + '\n';

            report += `**Tertiary Characteristics** (20% of XP): `;
            report += archetype.tertiaryCharacteristics.map((c: string) => c.toUpperCase()).join(', ') + '\n\n';

            report += `**Key Skills:** ${archetype.primarySkills.join(', ')}\n`;
            report += `**Typical Talents:** ${archetype.typicalTalents.slice(0, 3).join(', ')}\n`;
            report += `\n---\n\n`;
        }

        report += `**XP Guidelines:**\n`;
        report += `- **500-1000 XP**: Novice (starting adventurer level)\n`;
        report += `- **1000-2000 XP**: Experienced (seasoned professional)\n`;
        report += `- **2000-4000 XP**: Veteran (battle-hardened expert)\n`;
        report += `- **4000+ XP**: Master (legendary hero level)\n`;

        return {
            content: [{ type: "text", text: report }],
        };
    }

    async handleCalculateXPDistribution(args: {
        totalXP: number;
        archetype: string;
    }) {
        this.logger.info("Calculating XP distribution preview", {
            xp: args.totalXP,
            archetype: args.archetype
        });

        const archetypeData = this.getArchetypeData(args.archetype);
        const baseCharacteristics = this.generateBaseCharacteristics("human");
        const distribution = this.distributeXP(
            args.totalXP,
            archetypeData,
            baseCharacteristics,
            "human"
        );

        let report = `📊 **XP Distribution Preview: ${archetypeData.name}**\n\n`;
        report += `**Total XP Budget:** ${args.totalXP}\n\n`;

        report += `## Characteristics (${distribution.summary.characteristicsXP} XP)\n`;
        const charOrder = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
        for (const char of charOrder) {
            const data = distribution.characteristics[char];
            if (data.advances > 0) {
                report += `- **${char.toUpperCase()}**: ${data.base} → ${data.final} (+${data.advances}, ${data.xpSpent} XP)\n`;
            }
        }

        report += `\n## Skills (${distribution.summary.skillsXP} XP)\n`;
        if (distribution.skills.length > 0) {
            for (const skill of distribution.skills) {
                report += `- **${skill.name}**: +${skill.advances} advances (${skill.xpSpent} XP) → ${skill.total}%\n`;
            }
        } else {
            report += `*No skills with this XP budget*\n`;
        }

        report += `\n## Talents (${distribution.summary.talentsXP} XP)\n`;
        if (distribution.talents.length > 0) {
            for (const talent of distribution.talents) {
                report += `- **${talent.name}**`;
                if (talent.rank > 1) report += ` (Rank ${talent.rank})`;
                report += ` (${talent.xpSpent} XP)\n`;
            }
        } else {
            report += `*No talents with this XP budget*\n`;
        }

        report += `\n## Summary\n`;
        report += `- **Total Spent:** ${distribution.summary.totalSpent} XP\n`;
        report += `- **Remaining:** ${distribution.summary.remaining} XP\n`;
        report += `- **Efficiency:** ${Math.round((distribution.summary.totalSpent / args.totalXP) * 100)}%\n`;

        return {
            content: [{ type: "text", text: report }],
        };
    }

    // ===== HELPER METHODS =====

    private getArchetypeData(archetypeId: string) {
        const archetypes: { [key: string]: any } = {
            "aggressive-fighter": {
                id: "aggressive-fighter",
                name: "Aggressive Fighter",
                description: "Melee combatant focused on dealing damage",
                primaryCharacteristics: ['ws', 's', 't'],
                secondaryCharacteristics: ['ag', 'i', 'wp'],
                tertiaryCharacteristics: ['bs', 'dex', 'int', 'fel'],
                primarySkills: ['Melee (Basic)', 'Melee (Brawling)', 'Dodge', 'Intimidate', 'Endurance'],
                typicalTalents: ['Strike Mighty Blow', 'Combat Reflexes', 'Fearless', 'Warrior Born', 'Strike to Injure'],
                suggestedCareer: "Soldier"
            },
            "ranged-combatant": {
                id: "ranged-combatant",
                name: "Ranged Combatant",
                description: "Expert with bows, crossbows, and firearms",
                primaryCharacteristics: ['bs', 'dex', 'ag'],
                secondaryCharacteristics: ['i', 'int', 'ws'],
                tertiaryCharacteristics: ['s', 't', 'wp', 'fel'],
                primarySkills: ['Ranged (Bow)', 'Ranged (Crossbow)', 'Perception', 'Track', 'Dodge'],
                typicalTalents: ['Sharpshooter', 'Marksman', 'Rapid Reload', 'Sure Shot', 'Fast Shot'],
                suggestedCareer: "Huntsman"
            },
            "defensive-warrior": {
                id: "defensive-warrior",
                name: "Defensive Warrior",
                description: "Tank focused on absorbing damage and protecting others",
                primaryCharacteristics: ['t', 'wp', 's'],
                secondaryCharacteristics: ['ws', 'ag', 'i'],
                tertiaryCharacteristics: ['bs', 'dex', 'int', 'fel'],
                primarySkills: ['Melee (Basic)', 'Endurance', 'Cool', 'Dodge', 'Melee (Parry)'],
                typicalTalents: ['Shieldmaster', 'Tenacious', 'Robust', 'Iron Jaw', 'Resolute'],
                suggestedCareer: "Pit Fighter"
            },
            "agile-rogue": {
                id: "agile-rogue",
                name: "Agile Rogue",
                description: "Quick and nimble, specializes in evasion and mobility",
                primaryCharacteristics: ['ag', 'dex', 'i'],
                secondaryCharacteristics: ['ws', 'bs', 'fel'],
                tertiaryCharacteristics: ['s', 't', 'int', 'wp'],
                primarySkills: ['Stealth (Urban)', 'Climb', 'Athletics', 'Dodge', 'Perception'],
                typicalTalents: ['Catfall', 'Fleet Footed', 'Nimble Fingered', 'Step Aside', 'Sprint'],
                suggestedCareer: "Thief"
            },
            "cunning-thief": {
                id: "cunning-thief",
                name: "Cunning Thief",
                description: "Master of stealth, lockpicking, and deception",
                primaryCharacteristics: ['dex', 'int', 'fel'],
                secondaryCharacteristics: ['ag', 'i', 'wp'],
                tertiaryCharacteristics: ['ws', 'bs', 's', 't'],
                primarySkills: ['Sleight of Hand', 'Pick Lock', 'Stealth (Urban)', 'Charm', 'Perception'],
                typicalTalents: ['Nimble Fingered', 'Luck', 'Shadow', 'Criminal', 'Etiquette (Criminals)'],
                suggestedCareer: "Thief"
            },
            "wise-priest": {
                id: "wise-priest",
                name: "Wise Priest",
                description: "Divine spellcaster and spiritual leader",
                primaryCharacteristics: ['wp', 'int', 'fel'],
                secondaryCharacteristics: ['t', 'i', 'ag'],
                tertiaryCharacteristics: ['ws', 'bs', 's', 'dex'],
                primarySkills: ['Pray', 'Lore (Theology)', 'Heal', 'Intuition', 'Cool'],
                typicalTalents: ['Bless', 'Holy Visions', 'Savvy', 'Read/Write', 'Etiquette (Cultists)'],
                suggestedCareer: "Priest"
            },
            "powerful-wizard": {
                id: "powerful-wizard",
                name: "Powerful Wizard",
                description: "Arcane spellcaster with devastating magic",
                primaryCharacteristics: ['int', 'wp', 'i'],
                secondaryCharacteristics: ['dex', 'fel', 'ag'],
                tertiaryCharacteristics: ['ws', 'bs', 's', 't'],
                primarySkills: ['Channelling', 'Language (Magick)', 'Lore (Magic)', 'Intuition', 'Perception'],
                typicalTalents: ['Aethyric Attunement', 'Instinctive Diction', 'Magical Sense', 'Petty Magic', 'Arcane Magic'],
                suggestedCareer: "Wizard"
            },
            "charismatic-leader": {
                id: "charismatic-leader",
                name: "Charismatic Leader",
                description: "Natural leader who inspires and commands others",
                primaryCharacteristics: ['fel', 'wp', 'int'],
                secondaryCharacteristics: ['i', 'ag', 't'],
                tertiaryCharacteristics: ['ws', 'bs', 's', 'dex'],
                primarySkills: ['Leadership', 'Charm', 'Intimidate', 'Intuition', 'Lore (Heraldry)'],
                typicalTalents: ['Inspiring', 'Read/Write', 'Etiquette (Nobles)', 'Savvy', 'Noble Blood'],
                suggestedCareer: "Noble"
            },
            "scholarly-sage": {
                id: "scholarly-sage",
                name: "Scholarly Sage",
                description: "Expert in knowledge and lore",
                primaryCharacteristics: ['int', 'wp', 'i'],
                secondaryCharacteristics: ['fel', 'dex', 'ag'],
                tertiaryCharacteristics: ['ws', 'bs', 's', 't'],
                primarySkills: ['Lore (History)', 'Lore (Theology)', 'Research', 'Language (Classical)', 'Perception'],
                typicalTalents: ['Read/Write', 'Savvy', 'Linguistics', 'Bookish', 'Etiquette (Scholars)'],
                suggestedCareer: "Scholar"
            },
            "hardy-survivalist": {
                id: "hardy-survivalist",
                name: "Hardy Survivalist",
                description: "Wilderness expert and tracker",
                primaryCharacteristics: ['t', 's', 'i'],
                secondaryCharacteristics: ['ag', 'int', 'bs'],
                tertiaryCharacteristics: ['ws', 'dex', 'wp', 'fel'],
                primarySkills: ['Track', 'Outdoor Survival', 'Animal Care', 'Endurance', 'Perception'],
                typicalTalents: ['Rover', 'Tenacious', 'Hardy', 'Trapper', 'Strider'],
                suggestedCareer: "Scout"
            },
            "brutal-berserker": {
                id: "brutal-berserker",
                name: "Brutal Berserker",
                description: "Raging warrior who sacrifices defense for overwhelming offense",
                primaryCharacteristics: ['s', 'ws', 't'],
                secondaryCharacteristics: ['ag', 'wp', 'i'],
                tertiaryCharacteristics: ['bs', 'dex', 'int', 'fel'],
                primarySkills: ['Melee (Two-handed)', 'Melee (Basic)', 'Intimidate', 'Endurance', 'Consume Alcohol'],
                typicalTalents: ['Frenzy', 'Strike Mighty Blow', 'Fearless', 'Very Strong', 'Furious Assault'],
                suggestedCareer: "Berserker"
            },
            "swift-duelist": {
                id: "swift-duelist",
                name: "Swift Duelist",
                description: "Finesse fighter using speed and precision",
                primaryCharacteristics: ['ag', 'i', 'ws'],
                secondaryCharacteristics: ['dex', 'fel', 't'],
                tertiaryCharacteristics: ['bs', 's', 'int', 'wp'],
                primarySkills: ['Melee (Fencing)', 'Dodge', 'Athletics', 'Cool', 'Perception'],
                typicalTalents: ['Combat Reflexes', 'Ambidextrous', 'Strike to Stun', 'Lightning Reflexes', 'Reaction Strike'],
                suggestedCareer: "Duellist"
            },
            "intimidating-thug": {
                id: "intimidating-thug",
                name: "Intimidating Thug",
                description: "Brutal enforcer who uses fear and violence",
                primaryCharacteristics: ['s', 't', 'fel'],
                secondaryCharacteristics: ['ws', 'wp', 'ag'],
                tertiaryCharacteristics: ['bs', 'i', 'dex', 'int'],
                primarySkills: ['Intimidate', 'Melee (Brawling)', 'Endurance', 'Consume Alcohol', 'Cool'],
                typicalTalents: ['Menacing', 'Strike Mighty Blow', 'Criminal', 'Dirty Fighting', 'Fearless'],
                suggestedCareer: "Bounty Hunter"
            },
            "sneaky-assassin": {
                id: "sneaky-assassin",
                name: "Sneaky Assassin",
                description: "Silent killer specializing in lethal precision strikes",
                primaryCharacteristics: ['ag', 'dex', 'ws'],
                secondaryCharacteristics: ['i', 'int', 'bs'],
                tertiaryCharacteristics: ['s', 't', 'wp', 'fel'],
                primarySkills: ['Stealth (Urban)', 'Melee (Basic)', 'Ranged (Throwing)', 'Perception', 'Climb'],
                typicalTalents: ['Assassin', 'Strike to Stun', 'Shadow', 'Backstab', 'Accurate Shot'],
                suggestedCareer: "Assassin"
            }
        };

        return archetypes[archetypeId] || archetypes["aggressive-fighter"];
    }

    private getAllArchetypes() {
        const ids = [
            "aggressive-fighter", "ranged-combatant", "defensive-warrior",
            "agile-rogue", "cunning-thief", "wise-priest", "powerful-wizard",
            "charismatic-leader", "scholarly-sage", "hardy-survivalist",
            "brutal-berserker", "swift-duelist", "intimidating-thug", "sneaky-assassin"
        ];
        return ids.map(id => this.getArchetypeData(id));
    }

    private generateBaseCharacteristics(species: string) {
        // Simplified: Generate average starting values
        // In real implementation, would roll 2d10 for each
        const baseValues: { [key: string]: any } = {
            human: { ws: 30, bs: 30, s: 30, t: 30, i: 30, ag: 30, dex: 30, int: 30, wp: 30, fel: 30 },
            halfling: { ws: 20, bs: 35, s: 15, t: 25, i: 35, ag: 35, dex: 35, int: 35, wp: 40, fel: 35 },
            dwarf: { ws: 35, bs: 25, s: 30, t: 40, i: 25, ag: 20, dex: 35, int: 30, wp: 45, fel: 25 },
            "high-elf": { ws: 35, bs: 35, s: 25, t: 25, i: 40, ag: 35, dex: 35, int: 35, wp: 35, fel: 30 },
            "wood-elf": { ws: 35, bs: 35, s: 25, t: 25, i: 40, ag: 35, dex: 35, int: 30, wp: 35, fel: 30 }
        };

        return baseValues[species] || baseValues.human;
    }

    private distributeXP(
        totalXP: number,
        archetype: any,
        baseCharacteristics: any,
        species: string = "human"
    ) {
        // XP costs per advance for each tier (every 5 advances, cost increases)
        // Advances 0-5 cost 25 each, 6-10 cost 30 each, 11-15 cost 40 each, etc.
        const characteristicXPCosts = [25, 30, 40, 50, 70, 90, 120, 150, 190, 240];
        const skillXPCosts = [10, 15, 20, 30, 40, 60, 80, 110, 140, 180];
        const talentXPCost = 100;

        // Allocate XP: 60% characteristics, 25% skills, 15% talents
        const charXP = Math.floor(totalXP * 0.6);
        const skillXP = Math.floor(totalXP * 0.25);
        const talentXP = totalXP - charXP - skillXP;

        // Distribute characteristic XP
        const characteristics: any = {};
        let charXPSpent = 0;

        // Priority percentages
        const primaryShare = 0.5; // 50% to primary
        const secondaryShare = 0.3; // 30% to secondary
        const tertiaryShare = 0.2; // 20% to tertiary

        const allChars = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];

        for (const char of allChars) {
            const isPrimary = archetype.primaryCharacteristics.includes(char);
            const isSecondary = archetype.secondaryCharacteristics.includes(char);

            let charBudget = 0;
            if (isPrimary) {
                charBudget = Math.floor(charXP * primaryShare / archetype.primaryCharacteristics.length);
            } else if (isSecondary) {
                charBudget = Math.floor(charXP * secondaryShare / archetype.secondaryCharacteristics.length);
            } else {
                charBudget = Math.floor(charXP * tertiaryShare / archetype.tertiaryCharacteristics.length);
            }

            // Calculate how many advances we can afford with this budget
            // Tier ranges: 0-5 (tier 0), 6-10 (tier 1), 11-15 (tier 2), etc.
            let advances = 0;
            let spent = 0;

            while (spent < charBudget && advances < 50) {
                // Determine cost tier: 0-5 is tier 0, then every 5 advances after that
                const tier = advances <= 5 ? 0 : Math.floor((advances - 1) / 5);
                const costPerAdvance = characteristicXPCosts[tier] || characteristicXPCosts[characteristicXPCosts.length - 1];

                if (spent + costPerAdvance <= charBudget) {
                    spent += costPerAdvance;
                    advances++;
                } else {
                    break; // Can't afford next advance
                }
            }

            characteristics[char] = {
                base: baseCharacteristics[char],
                advances: advances,
                final: baseCharacteristics[char] + advances, // Each advance adds +1, not +5
                xpSpent: spent
            };
            charXPSpent += spent;
        }

        // Distribute skill XP
        const skills = [];
        let skillXPSpent = 0;
        const skillsPerChar = archetype.primarySkills.length;
        const xpPerSkill = Math.floor(skillXP / skillsPerChar);

        for (const skillName of archetype.primarySkills) {
            let advances = 0;
            let spent = 0;

            // Calculate skill advances: 0-5 (tier 0), 6-10 (tier 1), 11-15 (tier 2), etc.
            while (spent < xpPerSkill && advances < 50) {
                const tier = advances <= 5 ? 0 : Math.floor((advances - 1) / 5);
                const costPerAdvance = skillXPCosts[tier] || skillXPCosts[skillXPCosts.length - 1];

                if (spent + costPerAdvance <= xpPerSkill) {
                    spent += costPerAdvance;
                    advances++;
                } else {
                    break;
                }
            }

            if (advances > 0) {
                // Skill total = characteristic value + advances + modifier
                const linkedChar = this.getLinkedCharacteristic(skillName);
                const charValue = characteristics[linkedChar]?.final || 30;

                skills.push({
                    name: skillName,
                    advances: advances,
                    xpSpent: spent,
                    total: charValue + advances, // Each skill advance adds +1, not +5
                    linkedCharacteristic: linkedChar
                });
                skillXPSpent += spent;
            }
        }

        // Acquire talents
        const talents = [];
        let talentXPSpent = 0;

        // Add species-specific talents (these don't cost XP - they're innate)
        const speciesTalents = this.getSpeciesTalents(species);
        for (const talentName of speciesTalents) {
            talents.push({
                name: talentName,
                rank: 1,
                xpSpent: 0, // Species talents are free
                description: this.getTalentDescription(talentName)
            });
        }

        // Add archetype talents with XP budget
        const numTalents = Math.floor(talentXP / talentXPCost);

        for (let i = 0; i < numTalents && i < archetype.typicalTalents.length; i++) {
            talents.push({
                name: archetype.typicalTalents[i],
                rank: 1,
                xpSpent: talentXPCost,
                description: this.getTalentDescription(archetype.typicalTalents[i])
            });
            talentXPSpent += talentXPCost;
        }

        const totalSpent = charXPSpent + skillXPSpent + talentXPSpent;

        return {
            characteristics,
            skills,
            talents,
            summary: {
                characteristicsXP: charXPSpent,
                skillsXP: skillXPSpent,
                talentsXP: talentXPSpent,
                totalSpent,
                remaining: totalXP - totalSpent
            }
        };
    }

    private getLinkedCharacteristic(skillName: string): string {
        const skillMap: { [key: string]: string } = {
            'Melee (Basic)': 'ws',
            'Melee (Brawling)': 'ws',
            'Melee (Cavalry)': 'ws',
            'Melee (Fencing)': 'ws',
            'Melee (Flail)': 'ws',
            'Melee (Parry)': 'ws',
            'Melee (Polearm)': 'ws',
            'Melee (Two-handed)': 'ws',
            'Ranged (Bow)': 'bs',
            'Ranged (Crossbow)': 'bs',
            'Ranged (Blackpowder)': 'bs',
            'Ranged (Engineering)': 'bs',
            'Ranged (Entangling)': 'bs',
            'Ranged (Explosives)': 'bs',
            'Ranged (Sling)': 'bs',
            'Ranged (Throwing)': 'bs',
            'Athletics': 'ag',
            'Climb': 'ag',
            'Dodge': 'ag',
            'Stealth (Urban)': 'ag',
            'Stealth (Rural)': 'ag',
            'Endurance': 't',
            'Consume Alcohol': 't',
            'Perception': 'i',
            'Track': 'i',
            'Intuition': 'i',
            'Pick Lock': 'dex',
            'Sleight of Hand': 'dex',
            'Channelling': 'wp',
            'Cool': 'wp',
            'Pray': 'wp',
            'Leadership': 'fel',
            'Charm': 'fel',
            'Intimidate': 'fel',
            'Animal Care': 'int',
            'Language (Magick)': 'int',
            'Language (Classical)': 'int',
            'Lore (History)': 'int',
            'Lore (Magic)': 'int',
            'Lore (Theology)': 'int',
            'Lore (Heraldry)': 'int',
            'Research': 'int',
            'Heal': 'int',
            'Outdoor Survival': 'int'
        };

        return skillMap[skillName] || 'ws';
    }

    private getTalentDescription(talentName: string): string {
        const descriptions: { [key: string]: string } = {
            'Strike Mighty Blow': 'Add SL to melee damage',
            'Combat Reflexes': '+10 Initiative in combat',
            'Fearless': 'Immune to mundane fear',
            'Warrior Born': 'Reroll failed Melee tests once per round',
            'Strike to Injure': 'Critical hits inflict additional Wounds',
            'Sharpshooter': 'Ignore range penalties to short range',
            'Marksman': 'Add +1 Damage with ranged weapons',
            'Rapid Reload': 'Reload as free action',
            'Sure Shot': 'Reroll missed Ranged tests',
            'Fast Shot': 'Make extra ranged attack',
            'Shieldmaster': '+2 SL when using shield to defend',
            'Tenacious': 'Reroll failed Endurance tests',
            'Robust': '+Toughness Bonus to Wounds',
            'Iron Jaw': 'Ignore stunned condition once per round',
            'Resolute': 'Gain +10 Willpower for resisting',
            'Catfall': 'Reduce falling damage by Initiative Bonus',
            'Fleet Footed': 'Movement increased by +1',
            'Nimble Fingered': '+1 SL to Sleight of Hand and Pick Lock',
            'Step Aside': 'May Dodge as free action once per round',
            'Sprint': 'Can Run twice movement in combat',
            'Luck': 'Reroll any failed test once per day',
            'Shadow': '+1 SL to Stealth tests',
            'Criminal': 'Etiquette with criminals and underworld',
            'Bless': 'Can cast minor blessings',
            'Holy Visions': 'Receive divine guidance',
            'Savvy': 'Can evaluate social situations',
            'Read/Write': 'Literate in chosen language',
            'Aethyric Attunement': 'Sense magic in area',
            'Instinctive Diction': 'Cast one spell without speaking',
            'Magical Sense': 'Detect magical effects',
            'Petty Magic': 'Know minor magic spells',
            'Arcane Magic': 'Can learn arcane spells',
            'Inspiring': 'Grant bonus to Leadership tests',
            'Noble Blood': 'Recognized nobility',
            'Linguistics': 'Learn languages easily',
            'Bookish': '+1 SL to Research tests',
            'Rover': 'Ignore movement penalties in wilderness',
            'Hardy': 'Ignore effects of exposure',
            'Trapper': 'Set and find traps',
            'Strider': 'Move through difficult terrain',
            'Frenzy': 'Enter berserk rage in combat',
            'Very Strong': 'Add +1 to Strength',
            'Furious Assault': 'Make extra attacks when frenzied',
            'Ambidextrous': 'Use both hands equally',
            'Strike to Stun': 'Knock enemies unconscious',
            'Lightning Reflexes': '+5 to Initiative',
            'Reaction Strike': 'Free attack when enemy closes',
            'Menacing': 'Frightening appearance',
            'Dirty Fighting': 'Ignore dishonorable combat penalties',
            'Assassin': 'Lethal critical hits',
            'Backstab': 'Extra damage from behind',
            'Accurate Shot': 'Ignore cover penalties',
            'Small': 'Smaller hitbox, advantages in confined spaces',
            'Resistance (Chaos)': 'Bonus to resist Chaos corruption',
            'Magic Resistance': 'Bonus to resist magic',
            'Sturdy': 'Will not fall prone from Impact criticals',
            'Second Sight': 'Can perceive invisible or ethereal creatures',
            'Acute Sense (Sight)': 'Exceptional vision'
        };

        return descriptions[talentName] || 'Special ability';
    }

    private generateEquipment(archetype: string): string[] {
        const equipment: { [key: string]: string[] } = {
            "aggressive-fighter": [
                "Hand Weapon (Sword or Axe)",
                "Shield",
                "Mail Shirt (3 AP Body)",
                "Leather Jack (1 AP Arms, Legs)",
                "Helmet (2 AP Head)"
            ],
            "ranged-combatant": [
                "Bow or Crossbow",
                "20 Arrows/Bolts",
                "Dagger",
                "Leather Jerkin (1 AP Body)",
                "Cloak"
            ],
            "defensive-warrior": [
                "Hand Weapon",
                "Shield",
                "Full Plate (5 AP All Locations)",
                "Helmet",
                "Great Weapon"
            ],
            "agile-rogue": [
                "Dagger",
                "Rope (10 yards)",
                "Grappling Hook",
                "Dark Clothing",
                "Lockpicks"
            ],
            "cunning-thief": [
                "Dagger",
                "Sling and Stones",
                "Lockpicks",
                "Dark Cloak",
                "Crowbar"
            ],
            "wise-priest": [
                "Religious Symbol",
                "Staff",
                "Religious Text",
                "Healing Draught",
                "Robes"
            ],
            "powerful-wizard": [
                "Wizard's Staff",
                "Grimoire",
                "Arcane Focus",
                "Component Pouch",
                "Robes"
            ],
            "charismatic-leader": [
                "Quality Sword",
                "Noble Clothing",
                "Signet Ring",
                "Letter of Introduction",
                "Fine Wine"
            ],
            "scholarly-sage": [
                "Multiple Books",
                "Writing Kit",
                "Reading Glasses",
                "Scholar's Robes",
                "Lantern"
            ],
            "hardy-survivalist": [
                "Bow",
                "Hunting Knife",
                "Rope",
                "Tent and Bedroll",
                "Rations (1 week)"
            ],
            "brutal-berserker": [
                "Great Axe or Great Hammer",
                "No Armor (frenzied)",
                "Healing Draught",
                "Trophy Necklace",
                "Alcohol (plentiful)"
            ],
            "swift-duelist": [
                "Rapier",
                "Main Gauche",
                "Leather Jerkin",
                "Fine Clothing",
                "Dueling Gloves"
            ],
            "intimidating-thug": [
                "Cudgel or Knuckledusters",
                "Leather Jack",
                "Manacles",
                "Flask of Spirits",
                "Hood"
            ],
            "sneaky-assassin": [
                "Poisoned Dagger",
                "Garrote",
                "Throwing Knives (3)",
                "Dark Clothing",
                "Poison Kit"
            ]
        };

        return equipment[archetype] || equipment["aggressive-fighter"];
    }

    private calculateWounds(s: number, t: number, wp: number, species: string): number {
        const sBonus = Math.floor(s / 10);
        const tBonus = Math.floor(t / 10);
        const wpBonus = Math.floor(wp / 10);

        // Halflings use (2 × TB)+WPB, others use SB+(2 × TB)+WPB
        let baseWounds: number;
        if (species === "halfling") {
            baseWounds = (2 * tBonus) + wpBonus;
        } else {
            baseWounds = sBonus + (2 * tBonus) + wpBonus;
        }

        return Math.max(baseWounds, 1);
    }

    private getMovement(species: string): number {
        const movement: { [key: string]: number } = {
            human: 4,
            halfling: 3,
            dwarf: 3,
            "high-elf": 5,
            "wood-elf": 5
        };
        return movement[species] || 4;
    }

    private getFortune(species: string): number {
        const fortune: { [key: string]: number } = {
            human: 2,
            halfling: 3,
            dwarf: 2,
            "high-elf": 2,
            "wood-elf": 2
        };
        return fortune[species] || 2;
    }

    private getFate(species: string): number {
        const fate: { [key: string]: number } = {
            human: 2,
            halfling: 3,
            dwarf: 2,
            "high-elf": 1,
            "wood-elf": 1
        };
        return fate[species] || 2;
    }

    private getSpeciesTalents(species: string): string[] {
        // Species-specific innate talents based on WFRP 4e rules
        const speciesTalents: { [key: string]: string[] } = {
            human: [], // Humans don't have mandatory species talents (they get random talents)
            halfling: ['Night Vision', 'Resistance (Chaos)', 'Small'],
            dwarf: ['Magic Resistance', 'Night Vision', 'Resolute', 'Sturdy'],
            "high-elf": ['Acute Sense (Sight)', 'Coolheaded', 'Night Vision', 'Second Sight', 'Read/Write'],
            "wood-elf": ['Acute Sense (Sight)', 'Hardy', 'Night Vision', 'Read/Write', 'Rover']
        };
        return speciesTalents[species] || [];
    }
}
