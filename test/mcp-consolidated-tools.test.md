# Foundry VTT MCP Server Testing Guide - Consolidated Tools (v0.2.4)

## 🎯 Testing Overview

This document provides comprehensive test cases for all **36 consolidated MCP tools** integrated with Foundry VTT and Claude Desktop. After Phase 2 consolidation (January 2025), the tool count was reduced from 100+ to 36 tools through action-based routing.

**Date Created**: January 31, 2025  
**Version**: 0.2.4  
**System**: WFRP4e (Warhammer Fantasy Roleplay 4th Edition)  
**Testing Environment**: Foundry VTT + Claude Desktop/VS Code + MCP Server

---

## 📋 Pre-Testing Checklist

Before starting tests, verify:

- [ ] Foundry VTT is running (default port 30000)
- [ ] WFRP4e system is installed and active
- [ ] MCP Server is running and connected
- [ ] Test world has at least one test character created
- [ ] MCP connection shows in Claude Desktop/VS Code
- [ ] Browser console is open for debugging (F12 in Foundry)

**Test Character Requirements**:
- Create a character named "Test Character" or similar
- Character should have basic stats (characteristics, skills, talents)
- Character should have some inventory items
- Note the exact character name for testing

---

## 🗂️ Tool Inventory (36 Tools)

### Character Management (3 tools)
1. `get-character` - Retrieve character information
2. `list-characters` - List all characters  
3. `manage-character` - Update stats, skills, talents, notes, XP logs (5 actions)

### Career & Advancement (1 tool)
4. `manage-career` - Career progression and XP spending (5 actions)

### Corruption & Chaos (2 tools)
5. `manage-corruption` - Corruption tracking (3 actions)
6. `manage-mutation` - Mutation management (3 actions)

### Metacurrency (2 tools)
7. `manage-fortune-fate` - Fortune/Fate points (6 actions)
8. `manage-resolve-resilience` - Resolve/Resilience points (6 actions)

### Combat & Conditions (3 tools)
9. `manage-advantage` - Combat advantage (4 actions)
10. `manage-critical-wound` - Critical wounds (4 actions)
11. `roll-critical-wound` - Random critical wound rolling

### Health & Status (2 tools)
12. `manage-disease` - Disease tracking (4 actions)
13. `manage-inventory` - Inventory and encumbrance (5 actions)

### Items (1 tool)
14. `create-item` - Create weapons, armor, items (6 actions)

### Magic (2 tools)
15. `manage-divine-magic` - Prayers and blessings (6 actions)
16. `manage-arcane-magic` - Spells and channelling (6 actions)

### Social & Status (1 tool)
17. `manage-social-status` - Social standing (5 actions)

### NPC Management (1 tool)
18. `manage-npc-generation` - NPC creation with archetypes (3 actions)

### Compendium & Discovery (4 tools)
19. `search-compendium` - Search for items, creatures, spells
20. `get-compendium-item` - Get detailed item info
21. `list-creatures-by-criteria` - Filter creatures by CR, type, size
22. `list-compendium-packs` - List available compendiums

### Scene & World (3 tools)
23. `get-current-scene` - Get active scene info
24. `get-world-info` - Get game system info
25. `list-scenes` - List all scenes
26. `switch-scene` - Change active scene

### Actor Creation (2 tools)
27. `create-actor-from-compendium` - Create actors from compendium
28. `get-compendium-entry-full` - Get complete stat block

### Journals & Quests (1 tool)
29. `manage-journal` - Journal and quest management (5 actions)

### Player Interaction (1 tool)
30. `request-player-rolls` - Request dice rolls from players

### Campaign Tools (1 tool)
31. `create-campaign-dashboard` - Create campaign journals

### Permissions (1 tool)
32. `manage-ownership` - Actor permissions (3 actions)

### Map Generation (3 tools)
33. `generate-map` - AI map generation (async)
34. `check-map-status` - Check map job status
35. `cancel-map-job` - Cancel map generation

### Roll Tables (1 tool)
36. `manage-rolltable` - Roll table CRUD (5 actions)

---

## 🧪 Test Categories

## 1. CHARACTER MANAGEMENT TOOLS

### Tool: `get-character`

**Purpose**: Retrieve comprehensive character information.

#### Test Case 1.1: Basic Character Retrieval
```
Prompt: "Get information for Test Character"
```
**Expected Result**:
- Character name, species, career
- All 10 characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
- Current/max wounds, fortune, fate, resolve, resilience
- Skills list with advances
- Talents list with descriptions
- Physical inventory (weapons, armor, trappings)
- Conditions (injuries, mutations, diseases, psychology)
- Critical wounds count
- Money (brass, silver, gold)
- Experience (total, spent, available)
- Biography sections

**Success Criteria**: ✅ All character data returned in structured format

---

#### Test Case 1.2: Character Not Found
```
Prompt: "Get information for NonExistentCharacter"
```
**Expected Result**: Error message stating character not found

**Success Criteria**: ✅ Clear error message returned

---

### Tool: `list-characters`

#### Test Case 1.3: List All Characters
```
Prompt: "List all characters in the world"
```
**Expected Result**:
- Array of character objects
- Each with: id, name, type (character/npc/creature)
- Total count
- Filter status

**Success Criteria**: ✅ All characters listed with basic info

---

#### Test Case 1.4: Filter Player Characters Only
```
Prompt: "List only player characters"
```
**Expected Result**:
- Only characters with type="character"
- NPCs and creatures excluded
- Accurate count

**Success Criteria**: ✅ Filtered list returned

---

### Tool: `manage-character`

**Purpose**: Unified character editing tool with 5 actions.

**Actions**:
- `update-stats` - Set characteristics, status values, physical details
- `update-skill-talent` - Modify existing skill/talent advances or modifiers
- `add-skill-talent` - Add skill or talent from compendium
- `update-notes` - Update GM notes or biography
- `add-xp-log` - Add experience log entry

---

#### Test Case 1.5: Action - update-stats (Single Characteristic)
```
Prompt: "Update Test Character's Strength to 40"
```
**Expected Result**:
- Action: `update-stats`
- Strength initial value: → 40
- Advances unchanged (0)
- Total Strength: 40
- XP unchanged (no cost)
- Confirmation message

**Success Criteria**: ✅ Characteristic initial value updated

**Technical Details**: Updates `system.characteristics.s.initial`

---

#### Test Case 1.6: Action - update-stats (Multiple Characteristics)
```
Prompt: "Update Test Character: Strength to 35, Toughness to 40, Initiative to 30"
```
**Expected Result**:
- All three characteristics updated to initial values
- Advances remain at 0
- XP unchanged
- Confirmation for each

**Success Criteria**: ✅ Multiple characteristics updated

---

#### Test Case 1.7: Action - update-stats (Status Values)
```
Prompt: "Update Test Character: current wounds to 15, fortune to 3, resolve to 2"
```
**Expected Result**:
- Wounds set to 15
- Fortune set to 3 (capped at Fate max)
- Resolve set to 2 (capped at Resilience max)
- All values visible in character sheet

**Success Criteria**: ✅ Status values updated correctly

---

#### Test Case 1.8: Action - update-stats (Physical Details)
```
Prompt: "Update Test Character: age to 28, height to 6 feet, hair to brown"
```
**Expected Result**:
- Age: 28
- Height: 6 feet
- Hair color: brown
- Biography details updated
- No XP cost

**Success Criteria**: ✅ Physical appearance updated

---

#### Test Case 1.9: Action - update-skill-talent (Modify Advances)
```
Prompt: "Update Test Character's Melee (Basic) skill to 10 advances"
```
**Expected Result**:
- Action: `update-skill-talent`
- Skill advances set to 10
- No XP cost (direct override)
- Total skill value recalculated
- Confirmation message

**Success Criteria**: ✅ Skill advances modified directly

---

#### Test Case 1.10: Action - update-skill-talent (Add Modifier)
```
Prompt: "Add a +10 modifier to Test Character's Dodge skill"
```
**Expected Result**:
- Skill modifier: +10
- Affects skill tests
- Modifier visible in character sheet
- Confirmation with reason

**Success Criteria**: ✅ Skill modifier added

---

#### Test Case 1.11: Action - add-skill-talent (Add Skill from Compendium)
```
Prompt: "Add the Animal Care skill to Test Character with 5 advances"
```
**Expected Result**:
- Action: `add-skill-talent`
- Skill "Animal Care" found in compendium
- Added to character with 5 advances
- Skill appears in skill list
- Confirmation message

**Success Criteria**: ✅ Skill added from compendium

---

#### Test Case 1.12: Action - add-skill-talent (Add Talent)
```
Prompt: "Add the Combat Reflexes talent to Test Character"
```
**Expected Result**:
- Talent found in compendium
- Added to character
- Talent effects described
- No XP cost (direct add)
- Visible in talents list

**Success Criteria**: ✅ Talent added from compendium

---

#### Test Case 1.13: Action - update-notes (GM Notes)
```
Prompt: "Update Test Character's GM notes: Suspicious behavior around cult members"
```
**Expected Result**:
- Action: `update-notes`
- Note type: gmnotes
- GM notes updated with text
- Append option available
- Private to GM

**Success Criteria**: ✅ GM notes updated

---

#### Test Case 1.14: Action - update-notes (Biography)
```
Prompt: "Update Test Character's biography: Born in Altdorf, trained as a soldier"
```
**Expected Result**:
- Note type: biography
- Biography text updated
- Visible to players
- Can append or replace

**Success Criteria**: ✅ Biography updated

---

#### Test Case 1.15: Action - add-xp-log (Earned XP)
```
Prompt: "Add XP log for Test Character: 50 XP earned for defeating the ogre"
```
**Expected Result**:
- Action: `add-xp-log`
- Type: earned
- Amount: 50 XP
- Reason: "defeating the ogre"
- Total XP increased by 50
- Available XP increased by 50
- Log entry visible

**Success Criteria**: ✅ XP earned and logged

---

#### Test Case 1.16: Action - add-xp-log (Spent XP)
```
Prompt: "Add XP log: Test Character spent 25 XP on Weapon Skill advance"
```
**Expected Result**:
- Type: spent
- Amount: 25 XP
- Reason: "Weapon Skill advance"
- Available XP decreased by 25
- Spent XP increased by 25
- Total XP unchanged

**Success Criteria**: ✅ XP spending logged

---

#### Test Case 1.17: Invalid Action
```
Prompt: "Use invalid-action for Test Character"
```
**Expected Result**:
- Error: "Unknown action: invalid-action"
- List of valid actions shown
- No changes made

**Success Criteria**: ✅ Invalid action rejected

---

#### Test Case 1.18: Missing Required Parameters
```
Prompt: "Update Test Character's stats"
(no updates specified)
```
**Expected Result**:
- Error: "Missing required parameter: updates"
- Guidance on what to provide
- No changes made

**Success Criteria**: ✅ Validation prevents incomplete requests

---

### Integration Test: Character Creation Flow
```
Scenario: Complete character setup
1. "Update Test Character: Strength to 30, Toughness to 35, Agility to 33"
2. "Add Animal Care skill to Test Character with 0 advances"
3. "Add Combat Reflexes talent to Test Character"
4. "Update Test Character's GM notes: New character, first session"
5. "Add XP log: Test Character earned 100 XP for character creation"
6. "Get information for Test Character"
```
**Expected Result**: Fully configured character ready for play

**Success Criteria**: ✅ Complete character setup workflow

---

## 2. CAREER & ADVANCEMENT TOOLS

### Tool: `manage-career`

**Purpose**: Handle career progression and XP spending.

**Actions**:
- `get-advancement` - View available career advances and XP costs
- `advance-characteristic` - Spend XP to increase characteristic
- `advance-skill` - Spend XP to advance skill
- `advance-talent` - Spend XP to purchase talent
- `change-career` - Change to new career (costs 100/200 XP)

---

#### Test Case 2.1: Action - get-advancement
```
Prompt: "Show Test Character's career advancement options"
```
**Expected Result**:
- Action: `get-advancement`
- Current career name and level
- Available characteristic advances with XP costs
- Available skill advances with current tier costs
- Available talents with costs (100 XP each)
- Completion status
- Total XP needed for completion

**Success Criteria**: ✅ Complete advancement overview

---

#### Test Case 2.2: Action - advance-characteristic (In-Career)
```
Prompt: "Advance Test Character's Weapon Skill characteristic"
Setup: WS is in current career plan
```
**Expected Result**:
- Action: `advance-characteristic`
- XP cost: 25 XP × (advances tier multiplier)
- Advances increased by 1
- Initial value unchanged
- Total = initial + advances
- XP deducted

**Success Criteria**: ✅ Characteristic advanced with XP cost

---

#### Test Case 2.3: Action - advance-characteristic (Out-of-Career)
```
Prompt: "Advance Test Character's Intelligence by 1"
Setup: Intelligence NOT in current career
```
**Expected Result**:
- XP cost: 30 XP (out-of-career penalty)
- Higher cost than in-career
- Advances increased by 1
- Warning about out-of-career cost

**Success Criteria**: ✅ Out-of-career advancement costs more

---

#### Test Case 2.4: Action - advance-skill (Tier 0)
```
Prompt: "Advance Test Character's Melee (Basic) skill"
Setup: Skill has 0-4 advances
```
**Expected Result**:
- Action: `advance-skill`
- XP cost: 10 XP (in-career) or 15 XP (out-of-career)
- Tier 0: advances 0-4
- Skill advances +1
- Total skill value updated

**Success Criteria**: ✅ Skill advanced in Tier 0

**Technical Details**: Cost formula = Math.floor(advances / 5)

---

#### Test Case 2.5: Action - advance-skill (Tier 1)
```
Prompt: "Advance Test Character's Melee (Basic) skill"
Setup: Skill has 5-9 advances
```
**Expected Result**:
- XP cost: 20 XP (in-career) or 30 XP (out-of-career)
- Tier 1: advances 5-9
- Skill advances +1
- Message: "Skill in Tier 1"

**Success Criteria**: ✅ Skill advanced in Tier 1

---

#### Test Case 2.6: Action - advance-skill (Tier Boundary)
```
Prompt: "Advance Melee (Basic) from 4 to 5 advances"
```
**Expected Result**:
- 5th advance still costs Tier 0 price
- Next advance (6th) will cost Tier 1 price
- Warning: "Next advance enters Tier 1"

**Success Criteria**: ✅ Tier boundary handled correctly

---

#### Test Case 2.7: Action - advance-talent
```
Prompt: "Purchase Combat Reflexes talent for Test Character using career advancement"
```
**Expected Result**:
- Action: `advance-talent`
- Talent found in compendium
- XP cost: 100 XP per rank
- Talent added to character
- XP deducted
- Confirmation with talent effects

**Success Criteria**: ✅ Talent purchased with XP

---

#### Test Case 2.8: Action - change-career (Complete Career)
```
Prompt: "Change Test Character's career to Sergeant"
Setup: Current career is complete
```
**Expected Result**:
- Action: `change-career`
- Current career completion checked
- XP cost: 100 XP (completed discount)
- New career found and added
- Old career unmarked as current
- New career marked as current
- Career history preserved

**Success Criteria**: ✅ Career change with completed discount

---

#### Test Case 2.9: Action - change-career (Incomplete Career)
```
Setup: Current career NOT complete
Prompt: "Change Test Character's career to Sergeant"
```
**Expected Result**:
- XP cost: 200 XP (incomplete penalty)
- Warning: "Changing from incomplete career is expensive"
- Career change proceeds
- Higher cost deducted

**Success Criteria**: ✅ Incomplete career change costs 200 XP

---

#### Test Case 2.10: Insufficient XP
```
Prompt: "Advance Test Character's Strength 10 times"
Setup: Character has 50 XP available (need ~1000 XP)
```
**Expected Result**:
- Error: "Insufficient XP"
- Current XP: 50
- Required XP: calculated amount
- No changes made

**Success Criteria**: ✅ XP validation prevents advancement

---

### Integration Test: Career Progression
```
Scenario: Full career advancement
1. "Show Test Character's career advancement options"
2. "Advance Test Character's Weapon Skill characteristic"
3. "Advance Test Character's Melee (Basic) skill"
4. "Purchase Combat Reflexes talent for Test Character"
5. "Show Test Character's career progress"
6. [When complete] "Change Test Character's career to Sergeant"
```
**Expected Result**: Character progresses through career with XP spending

**Success Criteria**: ✅ Complete career workflow

---

## 3. CORRUPTION & MUTATION TOOLS

### Tool: `manage-corruption`

**Purpose**: Track corruption from Chaos exposure.

**Actions**:
- `add` - Add corruption points
- `remove` - Remove corruption points
- `get-status` - Check corruption and mutation threshold status

---

#### Test Case 3.1: Action - add (Minor Corruption)
```
Prompt: "Add 1 corruption to Test Character for witnessing dark magic"
```
**Expected Result**:
- Action: `add`
- Corruption +1
- Reason logged
- Threshold check performed
- Warning if approaching threshold

**Success Criteria**: ✅ Corruption point added

---

#### Test Case 3.2: Action - add (Reach Threshold)
```
Setup: Character has 3 corruption, TB = 4
Prompt: "Add 1 corruption to Test Character"
```
**Expected Result**:
- Corruption: 3 → 4
- Threshold reached: 4 = TB
- Warning: "Mutation threshold reached! Roll on Mutation Table!"
- No automatic mutation

**Success Criteria**: ✅ Threshold warning triggered

---

#### Test Case 3.3: Action - add (Exceed Threshold)
```
Setup: Character has 4 corruption, TB = 4
Prompt: "Add 1 corruption to Test Character"
```
**Expected Result**:
- Corruption: 4 → 5
- Exceeds threshold: 5 > 4
- Strong warning: "MUTATION REQUIRED!"
- Character marked for mutation

**Success Criteria**: ✅ Threshold exceeded warning

---

#### Test Case 3.4: Action - remove
```
Prompt: "Remove 2 corruption from Test Character through prayer ritual"
```
**Expected Result**:
- Action: `remove`
- Corruption -2
- Cannot go below 0
- Reason logged
- Threshold status updated

**Success Criteria**: ✅ Corruption removed

---

#### Test Case 3.5: Action - get-status
```
Prompt: "Check Test Character's corruption status"
```
**Expected Result**:
- Action: `get-status`
- Current corruption points
- Toughness Bonus
- Threshold value
- Distance to next threshold
- Mutation status
- Visual indicator (🔴 if corrupted)

**Success Criteria**: ✅ Complete corruption overview

---

### Tool: `manage-mutation`

**Purpose**: Track physical and mental mutations.

**Actions**:
- `add` - Add mutation from compendium or custom
- `remove` - Remove mutation (rare)
- `list` - List all character mutations

---

#### Test Case 3.6: Action - add (From Compendium)
```
Prompt: "Add mutation 'Animalistic Legs' to Test Character, type physical"
```
**Expected Result**:
- Action: `add`
- Mutation found in compendium
- Type: physical
- Added to character
- Effects from compendium applied
- Visible in mutations list

**Success Criteria**: ✅ Mutation added from compendium

---

#### Test Case 3.7: Action - add (Custom Mutation)
```
Prompt: "Add custom mutation 'Glowing Eyes' to Test Character, type mental, description: Eyes glow in darkness"
```
**Expected Result**:
- Custom mutation created
- Type: mental
- Description stored
- Added to character
- Fallback when not in compendium

**Success Criteria**: ✅ Custom mutation added

---

#### Test Case 3.8: Action - remove
```
Prompt: "Remove mutation 'Animalistic Legs' from Test Character"
```
**Expected Result**:
- Action: `remove`
- Mutation found and removed
- Warning: "Mutations are usually permanent in WFRP"
- Confirmation required

**Success Criteria**: ✅ Mutation removed (if possible)

---

#### Test Case 3.9: Action - list
```
Prompt: "List all mutations for Test Character"
```
**Expected Result**:
- Action: `list`
- All mutations listed
- Type (physical/mental) for each
- Effects described
- Count shown

**Success Criteria**: ✅ Complete mutation list

---

### Integration Test: Corruption to Mutation Flow
```
Scenario: Corruption leads to mutation
1. "Add 4 corruption to Test Character for chaos exposure"
2. "Check Test Character's corruption status"
3. "Add 1 more corruption to Test Character" (exceeds threshold)
4. "Add mutation 'Warped Face' to Test Character, physical"
5. "List Test Character's mutations"
```
**Expected Result**: Corruption triggers mutation warning, mutation added

**Success Criteria**: ✅ Corruption-mutation workflow

---

## 4. FORTUNE/FATE & RESOLVE/RESILIENCE TOOLS

### Tool: `manage-fortune-fate`

**Purpose**: Manage Fortune (daily resource) and Fate (permanent death saves).

**Actions**:
- `add-fortune` - Award bonus Fortune
- `spend-fortune` - Use Fortune for reroll
- `refresh-fortune` - Reset to Fate maximum
- `add-fate` - Permanently increase Fate (rare)
- `burn-fate` - Spend Fate to survive death (permanent)
- `get-status` - Check Fortune/Fate status

---

#### Test Case 4.1: Action - add-fortune
```
Prompt: "Award Test Character 1 fortune point for exceptional play"
```
**Expected Result**:
- Action: `add-fortune`
- Fortune +1
- Cannot exceed Fate maximum
- Reason logged
- Confirmation message

**Success Criteria**: ✅ Fortune point awarded

---

#### Test Case 4.2: Action - spend-fortune
```
Prompt: "Test Character spends fortune to reroll failed attack"
```
**Expected Result**:
- Action: `spend-fortune`
- Fortune -1
- Cannot go below 0
- Usage reason logged
- Confirmation message

**Success Criteria**: ✅ Fortune point spent

---

#### Test Case 4.3: Action - refresh-fortune
```
Prompt: "Refresh Test Character's fortune points for new session"
```
**Expected Result**:
- Action: `refresh-fortune`
- Fortune reset to Fate value
- Daily refresh mechanic
- Confirmation message

**Success Criteria**: ✅ Fortune refreshed

---

#### Test Case 4.4: Action - add-fate
```
Prompt: "Award Test Character 1 fate point for epic heroic deed"
```
**Expected Result**:
- Action: `add-fate`
- Fate permanently +1
- Fortune maximum also +1
- Dramatic confirmation
- Very rare occurrence noted

**Success Criteria**: ✅ Permanent Fate increase

---

#### Test Case 4.5: Action - burn-fate
```
Prompt: "Test Character burns fate point to survive certain death"
```
**Expected Result**:
- Action: `burn-fate`
- Fate permanently -1
- Fortune maximum also -1
- Dramatic confirmation
- Reason required
- Character survives mortal wound

**Success Criteria**: ✅ Fate burned, permanent reduction

---

#### Test Case 4.6: Action - get-status
```
Prompt: "Check Test Character's Fortune and Fate"
```
**Expected Result**:
- Action: `get-status`
- Current Fortune / Maximum (Fate)
- Current Fate value
- Available fortune points
- Status indicators

**Success Criteria**: ✅ Complete Fortune/Fate status

---

### Tool: `manage-resolve-resilience`

**Purpose**: NPC equivalent of Fortune/Fate system.

**Actions**:
- `add-resolve` - Award bonus Resolve
- `spend-resolve` - Use Resolve for resistance
- `refresh-resolve` - Reset to Resilience maximum
- `add-resilience` - Permanently increase Resilience (rare)
- `spend-resilience` - Burn Resilience for auto-success
- `get-status` - Check Resolve/Resilience status

---

#### Test Case 4.7: Action - add-resolve
```
Prompt: "Award Test Character 1 resolve point for following motivation"
```
**Expected Result**:
- Action: `add-resolve`
- Resolve +1
- Cannot exceed Resilience
- Confirmation message

**Success Criteria**: ✅ Resolve point awarded

---

#### Test Case 4.8: Action - spend-resolve
```
Prompt: "Test Character spends resolve to ignore Fear psychology"
```
**Expected Result**:
- Action: `spend-resolve`
- Resolve -1
- Usage logged
- Psychology effect ignored

**Success Criteria**: ✅ Resolve spent

---

#### Test Case 4.9: Action - refresh-resolve
```
Prompt: "Refresh Test Character's resolve for acting on motivation"
```
**Expected Result**:
- Action: `refresh-resolve`
- Resolve reset to Resilience
- Motivation-based refresh
- Thematic confirmation

**Success Criteria**: ✅ Resolve refreshed

---

#### Test Case 4.10: Action - spend-resilience
```
Prompt: "Test Character spends resilience to deny chaos mutation"
```
**Expected Result**:
- Action: `spend-resilience`
- Resilience permanently -1
- Resolve maximum also -1
- Dramatic confirmation
- Mutation prevented

**Success Criteria**: ✅ Resilience burned permanently

---

## 5. COMBAT & CONDITION TOOLS

### Tool: `manage-advantage`

**Purpose**: Track combat Advantage points.

**Actions**:
- `add` - Gain Advantage from successful attack
- `remove` - Lose Advantage (partial)
- `clear` - Reset to 0 (combat ended or hit)
- `get` - Check current Advantage

---

#### Test Case 5.1: Action - add
```
Prompt: "Test Character gains 1 Advantage for successful attack"
```
**Expected Result**:
- Action: `add`
- Advantage +1
- Each point adds +10 to combat tests
- Confirmation with current total

**Success Criteria**: ✅ Advantage point added

---

#### Test Case 5.2: Action - clear
```
Prompt: "Clear Test Character's Advantage (combat ended)"
```
**Expected Result**:
- Action: `clear`
- Advantage reset to 0
- Reason logged
- Confirmation message

**Success Criteria**: ✅ Advantage cleared

---

### Tool: `manage-critical-wound`

**Purpose**: Track critical wounds and death threshold.

**Actions**:
- `list` - Show all active critical wounds
- `add` - Add specific critical wound
- `remove` - Remove healed critical
- `check-death` - Check if wounds exceed TB limit

---

#### Test Case 5.3: Action - add
```
Prompt: "Add critical wound 'Minor Head Injury' to Test Character, location Head"
```
**Expected Result**:
- Action: `add`
- Critical wound added from compendium
- Location: Head
- Effects applied
- Visible in critical wounds list

**Success Criteria**: ✅ Critical wound added

---

#### Test Case 5.4: Action - check-death
```
Prompt: "Check if Test Character dies from critical wounds"
Setup: Character has 5 criticals, TB = 4
```
**Expected Result**:
- Action: `check-death`
- Critical count: 5
- Toughness Bonus: 4
- Result: Death (5 > 4)
- Option to burn Fate

**Success Criteria**: ✅ Death threshold checked

---

### Tool: `roll-critical-wound`

#### Test Case 5.5: Roll Random Critical
```
Prompt: "Roll a critical wound on Test Character's Body"
```
**Expected Result**:
- d100 roll on Body Critical Table
- Specific critical wound result
- Automatically added to character
- Effects described

**Success Criteria**: ✅ Random critical rolled and applied

---

### Tool: `manage-disease`

**Purpose**: Track diseases and infections.

**Actions**:
- `list` - Show active diseases
- `add` - Contract disease
- `remove` - Cure disease
- `check-resilience` - Make Resilience test for recovery

---

#### Test Case 5.6: Action - add
```
Prompt: "Test Character contracts The Bloody Flux, type acute, incubation 1 day, duration 7 days, difficulty challenging"
```
**Expected Result**:
- Action: `add`
- Disease added
- Type: acute
- Incubation: 1 day
- Duration: 7 days
- Symptoms tracked
- Recovery difficulty set

**Success Criteria**: ✅ Disease contracted

---

#### Test Case 5.7: Action - check-resilience
```
Prompt: "Test Character makes Resilience test to recover from The Bloody Flux"
```
**Expected Result**:
- Action: `check-resilience`
- Resilience test made
- Success: disease progresses toward cure
- Failure: disease continues
- Results logged

**Success Criteria**: ✅ Recovery test made

---

## 6. INVENTORY & ITEMS TOOLS

### Tool: `manage-inventory`

**Purpose**: Manage character inventory and encumbrance.

**Actions**:
- `get-status` - View inventory and encumbrance
- `add-item` - Add item to inventory
- `remove-item` - Remove item
- `track-ammunition` - Add/subtract ammunition
- `check-encumbrance` - Calculate carrying capacity

---

#### Test Case 6.1: Action - get-status
```
Prompt: "Show Test Character's inventory"
```
**Expected Result**:
- Action: `get-status`
- All items listed
- Encumbrance values
- Total weight
- Carrying capacity
- Encumbrance status (normal/encumbered/over)
- Ammunition counts

**Success Criteria**: ✅ Complete inventory overview

---

#### Test Case 6.2: Action - add-item
```
Prompt: "Add Longsword to Test Character's inventory, encumbrance 1"
```
**Expected Result**:
- Action: `add-item`
- Item added
- Weight tracked
- Total encumbrance updated
- Confirmation message

**Success Criteria**: ✅ Item added to inventory

---

#### Test Case 6.3: Action - track-ammunition
```
Prompt: "Test Character fires 3 arrows"
```
**Expected Result**:
- Action: `track-ammunition`
- Arrows: -3
- Remaining ammunition shown
- Warning if low (<5)

**Success Criteria**: ✅ Ammunition tracked

---

#### Test Case 6.4: Action - check-encumbrance
```
Prompt: "Check if Test Character is encumbered"
```
**Expected Result**:
- Action: `check-encumbrance`
- Total encumbrance calculated
- Maximum: Strength + TB
- Status: Normal/Encumbered/Over Encumbered
- Penalties noted

**Success Criteria**: ✅ Encumbrance calculated

---

### Tool: `create-item`

**Purpose**: Create items for characters.

**Actions** (discriminated by itemType):
- `weapon` - Create weapon
- `armour` - Create armor
- `trapping` - Create general equipment
- `ammunition` - Create ammunition
- `container` - Create storage container
- `modify-qualities` - Add/remove weapon qualities/flaws

---

#### Test Case 6.5: itemType - weapon
```
Prompt: "Create weapon Longsword for Test Character: group basic, damage SB+4, reach average, qualities: precise"
```
**Expected Result**:
- itemType: weapon
- Weapon created with specifications
- Group: basic
- Damage: SB+4
- Reach: average
- Qualities: precise
- Added to character

**Success Criteria**: ✅ Weapon created

---

#### Test Case 6.6: itemType - armour
```
Prompt: "Create Mail Coat armor for Test Character: type mail, locations body, armor points 3"
```
**Expected Result**:
- itemType: armour
- Armor created
- Type: mail
- Locations: body
- AP: 3
- Added to character

**Success Criteria**: ✅ Armor created

---

#### Test Case 6.7: itemType - modify-qualities
```
Prompt: "Add 'damaging' quality to Test Character's Longsword"
```
**Expected Result**:
- itemType: modify-qualities
- Item found: Longsword
- Quality added: damaging
- Item updated
- New quality visible

**Success Criteria**: ✅ Weapon quality modified

---

## 7. MAGIC TOOLS

### Tool: `manage-divine-magic`

**Purpose**: Handle prayers, blessings, and divine favor.

**Actions**:
- `get-blessings` - List active blessings
- `invoke` - Cast prayer/blessing
- `check-favor` - Get sin points and divine standing
- `add-sin` - Add sin points for transgressions
- `penance` - Perform penance to reduce sin
- `end-blessing` - Terminate blessing

---

#### Test Case 7.1: Action - invoke
```
Prompt: "Test Character invokes Blessing of Battle on ally, difficulty average"
```
**Expected Result**:
- Action: `invoke`
- Prayer: Blessing of Battle
- Target: specified ally
- Difficulty: average
- Pray skill test required
- Blessing applied if successful

**Success Criteria**: ✅ Prayer invoked

---

#### Test Case 7.2: Action - check-favor
```
Prompt: "Check Test Character's divine favor"
```
**Expected Result**:
- Action: `check-favor`
- Sin points shown
- Divine standing (good/minor/major/forsaken)
- Penalties from sin noted
- Current deity shown

**Success Criteria**: ✅ Divine favor status

---

#### Test Case 7.3: Action - add-sin
```
Prompt: "Test Character gains 2 sin points for lying to temple superior"
```
**Expected Result**:
- Action: `add-sin`
- Sin +2
- Reason logged
- Standing updated
- Warning if approaching forsaken

**Success Criteria**: ✅ Sin points added

---

### Tool: `manage-arcane-magic`

**Purpose**: Handle spells, channelling, and miscasts.

**Actions**:
- `get-spells` - List known spells
- `cast` - Cast spell with channelled SL
- `channel` - Use Channelling to accumulate power
- `check-miscast` - Determine miscast effects
- `memorize` - Memorize spell from spellbook
- `learn` - Learn new spell from compendium

---

#### Test Case 7.4: Action - cast
```
Prompt: "Test Character casts Fireball with 2 channelled SL"
```
**Expected Result**:
- Action: `cast`
- Spell: Fireball
- Channelled SL: 2
- Casting Number adjusted
- Language (Magick) test required
- Spell effects applied

**Success Criteria**: ✅ Spell cast

---

#### Test Case 7.5: Action - channel
```
Prompt: "Test Character uses Channelling for Fire lore, accumulated 2 SL"
```
**Expected Result**:
- Action: `channel`
- Lore: fire
- Channelling test made
- SL accumulated
- Can use for next spell

**Success Criteria**: ✅ Power channelled

---

#### Test Case 7.6: Action - check-miscast
```
Prompt: "Test Character miscasts with major severity"
```
**Expected Result**:
- Action: `check-miscast`
- Severity: major
- d100 roll on Miscast Table
- Effects applied
- Description shown

**Success Criteria**: ✅ Miscast effects determined

---

## 8. SOCIAL & NPC TOOLS

### Tool: `manage-social-status`

**Purpose**: Track social standing and reputation.

**Actions**:
- `get-status` - View status, tier, standing
- `change-status` - Change social standing
- `make-social-test` - Social interaction with modifiers
- `calculate-income` - Income based on status
- `check-reputation` - Public standing

---

#### Test Case 8.1: Action - get-status
```
Prompt: "Show Test Character's social status"
```
**Expected Result**:
- Action: `get-status`
- Status tier (Brass/Silver/Gold)
- Standing value (0-5)
- Social rank
- Modifiers for tests

**Success Criteria**: ✅ Status overview

---

#### Test Case 8.2: Action - change-status
```
Prompt: "Promote Test Character to Silver tier, standing 3, reason: knighted for heroism"
```
**Expected Result**:
- Action: `change-status`
- New standing: Silver 3
- Reason logged
- Income recalculated
- Social benefits noted

**Success Criteria**: ✅ Status changed

---

### Tool: `manage-npc-generation`

**Purpose**: Create NPCs with archetype-based XP distribution.

**Actions**:
- `create` - Generate NPC with archetype
- `list-archetypes` - Show available archetypes
- `preview` - Preview XP distribution

---

#### Test Case 8.3: Action - create
```
Prompt: "Create NPC named Brutus, archetype brutal-berserker, XP budget 1500"
```
**Expected Result**:
- Action: `create`
- NPC created: Brutus
- Archetype: brutal-berserker
- XP distributed: 1500
- Stats favor: S, WS, T
- Skills: Melee, Intimidate
- Talents: Frenzy-related
- Character sheet populated

**Success Criteria**: ✅ NPC generated with archetype

---

#### Test Case 8.4: Action - list-archetypes
```
Prompt: "Show available NPC archetypes"
```
**Expected Result**:
- Action: `list-archetypes`
- All 14 archetypes listed
- Each with description
- XP distribution pattern shown
- Usage examples

**Success Criteria**: ✅ Archetypes listed

---

## 9. COMPENDIUM & DISCOVERY TOOLS

### Tool: `search-compendium`

#### Test Case 9.1: Search Items
```
Prompt: "Search compendium for longsword"
```
**Expected Result**:
- Items matching "longsword"
- Pack name shown
- Item ID provided
- Brief description

**Success Criteria**: ✅ Search results returned

---

### Tool: `get-compendium-item`

#### Test Case 9.2: Get Item Details
```
Prompt: "Get details for longsword from wfrp4e-core.items pack"
```
**Expected Result**:
- Complete item data
- Stats, qualities, flaws
- Description
- Pack and ID

**Success Criteria**: ✅ Item details retrieved

---

### Tool: `list-creatures-by-criteria`

#### Test Case 9.3: Filter by Challenge Rating
```
Prompt: "Find creatures with threat level 10-15"
```
**Expected Result**:
- Creatures matching CR range
- Threat level (T + W/10) shown
- Species, size noted
- Pack IDs provided

**Success Criteria**: ✅ Creatures filtered by CR

---

#### Test Case 9.4: Filter by Type and Size
```
Prompt: "Find large beastmen creatures"
```
**Expected Result**:
- Creatures with:
  - Species: beastman
  - Size: large
- Sorted by threat
- Pack IDs included

**Success Criteria**: ✅ Multi-criteria filtering works

---

## 10. SCENE & WORLD TOOLS

### Tool: `get-current-scene`

#### Test Case 10.1: Get Active Scene
```
Prompt: "Show the current scene"
```
**Expected Result**:
- Scene name
- Dimensions
- Grid size
- Active tokens
- Background image info

**Success Criteria**: ✅ Scene info retrieved

---

### Tool: `get-world-info`

#### Test Case 10.2: Get Game System
```
Prompt: "What game system are we using?"
```
**Expected Result**:
- System: WFRP4e
- Version number
- World title
- Active modules

**Success Criteria**: ✅ World info shown

---

### Tool: `list-scenes`

#### Test Case 10.3: List All Scenes
```
Prompt: "List all available scenes"
```
**Expected Result**:
- All scenes listed
- Active scene marked
- Scene IDs provided
- Navigation info

**Success Criteria**: ✅ Scenes listed

---

### Tool: `switch-scene`

#### Test Case 10.4: Change Scene
```
Prompt: "Switch to Altdorf Market scene"
```
**Expected Result**:
- Scene found by name
- Scene activated
- View optimized
- Confirmation message

**Success Criteria**: ✅ Scene changed

---

## 11. ACTOR CREATION TOOLS

### Tool: `create-actor-from-compendium`

#### Test Case 11.1: Create Single Actor
```
Prompt: "Create a Goblin from compendium named Sneak"
```
**Expected Result**:
- Creature found: Goblin
- Actor created: Sneak
- Stats from compendium
- Added to actors list
- Optionally added to scene

**Success Criteria**: ✅ Actor created from compendium

---

#### Test Case 11.2: Create Multiple Actors
```
Prompt: "Create 3 Goblins named Sneak, Peek, and Squeak"
```
**Expected Result**:
- 3 actors created
- Names: Sneak, Peek, Squeak
- All from same compendium entry
- Independent actors

**Success Criteria**: ✅ Multiple actors created

---

### Tool: `get-compendium-entry-full`

#### Test Case 11.3: Get Complete Stat Block
```
Prompt: "Get full stat block for Goblin from compendium"
```
**Expected Result**:
- Complete creature data
- All items, spells, abilities
- Ready for actor creation
- Embedded items included

**Success Criteria**: ✅ Full stat block retrieved

---

## 12. JOURNAL & QUEST TOOLS

### Tool: `manage-journal`

**Purpose**: Manage journals and quests.

**Actions**:
- `create` - Create new journal/quest
- `update` - Update journal progress
- `link-npc` - Link journal to NPC
- `list` - List all journals
- `search` - Search journal content

---

#### Test Case 12.1: Action - create
```
Prompt: "Create quest journal: The Cult of the Purple Hand, description: Investigate cultist activity in Altdorf, location: Altdorf sewers, type: mystery, difficulty: hard"
```
**Expected Result**:
- Action: `create`
- Journal created
- AI-generated content
- Quest details populated
- Type: mystery
- Difficulty: hard

**Success Criteria**: ✅ Quest journal created

---

#### Test Case 12.2: Action - update
```
Prompt: "Update journal 'The Cult of the Purple Hand': Party discovered secret entrance"
```
**Expected Result**:
- Action: `update`
- Journal found
- Content added
- Update type: progress
- Timestamp recorded

**Success Criteria**: ✅ Journal updated

---

#### Test Case 12.3: Action - link-npc
```
Prompt: "Link NPC Captain Marcus to quest 'The Cult', relationship: quest_giver"
```
**Expected Result**:
- Action: `link-npc`
- NPC found: Captain Marcus
- Quest found: The Cult
- Relationship: quest_giver
- Link created

**Success Criteria**: ✅ NPC linked to quest

---

## 13. PLAYER INTERACTION TOOLS

### Tool: `request-player-rolls`

#### Test Case 13.1: Request Skill Test
```
Prompt: "Request public stealth roll from Test Character"
Setup: User confirmed "public" visibility
```
**Expected Result**:
- Roll type: skill
- Target: stealth
- Player: Test Character
- Visibility: public
- Interactive button created
- Player can click to roll

**Success Criteria**: ✅ Roll request sent

**Note**: Tool requires visibility confirmation (public/private)

---

#### Test Case 13.2: Request Characteristic Test
```
Prompt: "Request private Willpower test from Test Character"
Setup: User confirmed "private" visibility
```
**Expected Result**:
- Roll type: characteristic
- Target: WP
- Visibility: private (GM + player only)
- Interactive button created

**Success Criteria**: ✅ Private roll requested

---

## 14. CAMPAIGN TOOLS

### Tool: `create-campaign-dashboard`

#### Test Case 14.1: Create Campaign Journal
```
Prompt: "Create campaign dashboard: Shadows over Bögenhafen, description: Mystery and corruption in the merchant town, template: five-part-adventure, default location: Bögenhafen"
```
**Expected Result**:
- Campaign journal created
- Title: Shadows over Bögenhafen
- Template applied
- 5 parts with structure
- Navigation links
- Progress tracking

**Success Criteria**: ✅ Campaign dashboard created

---

## 15. PERMISSIONS TOOLS

### Tool: `manage-ownership`

**Purpose**: Manage actor permissions.

**Actions**:
- `assign` - Assign permission level
- `remove` - Remove permissions
- `list` - List current permissions

---

#### Test Case 15.1: Action - assign
```
Prompt: "Give player John owner permissions for Test Character"
```
**Expected Result**:
- Action: `assign`
- User: John
- Actor: Test Character
- Level: owner
- Player can now edit character

**Success Criteria**: ✅ Ownership assigned

---

#### Test Case 15.2: Action - remove
```
Prompt: "Remove all permissions for player John on Test Character"
```
**Expected Result**:
- Action: `remove`
- User: John
- Actor: Test Character
- Permissions revoked
- Player cannot access

**Success Criteria**: ✅ Permissions removed

---

## 16. MAP GENERATION TOOLS

### Tool: `generate-map`

#### Test Case 16.1: Generate Fantasy Map
```
Prompt: "Generate map: Altdorf market square with merchant stalls, scene name: Market Square, size: medium"
```
**Expected Result**:
- Job started (async)
- Job ID returned
- Prompt enhanced with style
- Estimated time: 25-40 seconds
- Status: pending

**Success Criteria**: ✅ Map generation started

---

### Tool: `check-map-status`

#### Test Case 16.2: Check Job Status
```
Prompt: "Check status of map job abc123"
Setup: Wait 30 seconds after starting
```
**Expected Result**:
- Job ID: abc123
- Status: complete (or in_progress)
- If complete: scene created
- Image URL provided

**Success Criteria**: ✅ Status checked

---

### Tool: `cancel-map-job`

#### Test Case 16.3: Cancel Generation
```
Prompt: "Cancel map job abc123"
```
**Expected Result**:
- Job found
- Job cancelled
- Resources freed
- Confirmation message

**Success Criteria**: ✅ Job cancelled

---

## 17. ROLL TABLE TOOLS

### Tool: `manage-rolltable`

**Purpose**: Create and use roll tables.

**Actions**:
- `create` - Create new roll table
- `list` - List all tables
- `get` - Get table details
- `roll` - Roll on table
- `delete` - Delete table

---

#### Test Case 17.1: Action - create
```
Prompt: "Create roll table: Random Encounters, formula: 1d20, entries: [Goblin ambush 1-5, Bandits 6-10, Merchant 11-15, Nothing 16-20]"
```
**Expected Result**:
- Action: `create`
- Table created
- Formula: 1d20
- 4 entries with ranges
- Table ID returned

**Success Criteria**: ✅ Roll table created

---

#### Test Case 17.2: Action - roll
```
Prompt: "Roll on Random Encounters table"
```
**Expected Result**:
- Action: `roll`
- Table found
- d20 rolled
- Result determined from range
- Result posted to chat

**Success Criteria**: ✅ Table rolled successfully

---

## 🔄 INTEGRATION TEST SCENARIOS

### Scenario 1: Complete Character Lifecycle
```
1. Create character stats (manage-character: update-stats)
2. Add skills from compendium (manage-character: add-skill-talent)
3. Award XP (manage-character: add-xp-log)
4. Advance characteristic (manage-career: advance-characteristic)
5. Advance skill (manage-career: advance-skill)
6. Purchase talent (manage-career: advance-talent)
7. Add equipment (manage-inventory: add-item)
8. Create weapon (create-item: weapon)
9. Check final character (get-character)
```
**Success Criteria**: ✅ Character fully developed from scratch

---

### Scenario 2: Combat Encounter Flow
```
1. Create enemies (create-actor-from-compendium)
2. Start combat - gain Advantage (manage-advantage: add)
3. Take damage - update wounds (manage-character: update-stats)
4. Take critical hit (roll-critical-wound)
5. Check if alive (manage-critical-wound: check-death)
6. Combat ends - clear Advantage (manage-advantage: clear)
7. Rest and heal (manage-character: update-stats)
```
**Success Criteria**: ✅ Complete combat resolution

---

### Scenario 3: Corruption and Redemption
```
1. Character exposed to chaos (manage-corruption: add)
2. Corruption reaches threshold
3. Gain mutation (manage-mutation: add)
4. Character seeks cleansing (manage-corruption: remove)
5. Perform penance (manage-divine-magic: penance)
6. Check final corruption status (manage-corruption: get-status)
```
**Success Criteria**: ✅ Corruption mechanics flow

---

### Scenario 4: Career Progression
```
1. Check career options (manage-career: get-advancement)
2. Advance multiple characteristics (manage-career: advance-characteristic)
3. Advance multiple skills (manage-career: advance-skill)
4. Purchase talents (manage-career: advance-talent)
5. Complete career
6. Change to new career (manage-career: change-career)
7. Verify XP spending (get-character)
```
**Success Criteria**: ✅ Full career advancement cycle

---

### Scenario 5: Quest Management
```
1. Create quest journal (manage-journal: create)
2. Link quest giver NPC (manage-journal: link-npc)
3. Update progress (manage-journal: update)
4. Award XP for completion (manage-character: add-xp-log)
5. Mark quest complete (manage-journal: update)
```
**Success Criteria**: ✅ Quest tracking workflow

---

### Scenario 6: Magic User Workflow
```
1. Learn spell (manage-arcane-magic: learn)
2. Memorize spell (manage-arcane-magic: memorize)
3. Channel power (manage-arcane-magic: channel)
4. Cast spell (manage-arcane-magic: cast)
5. Handle miscast (manage-arcane-magic: check-miscast)
6. Check known spells (manage-arcane-magic: get-spells)
```
**Success Criteria**: ✅ Complete spellcasting cycle

---

### Scenario 7: Divine Character Workflow
```
1. Invoke prayer (manage-divine-magic: invoke)
2. Commit sin (manage-divine-magic: add-sin)
3. Check divine favor (manage-divine-magic: check-favor)
4. Perform penance (manage-divine-magic: penance)
5. Bless ally (manage-divine-magic: invoke)
6. End blessing (manage-divine-magic: end-blessing)
```
**Success Criteria**: ✅ Divine magic and favor cycle

---

## 📊 TECHNICAL VALIDATION TESTS

### Test: Tool Count Verification
```
Expected: Exactly 36 tools registered
Verify: Check backend.ts switch cases
Count: All tools accounted for
```
**Success Criteria**: ✅ 36 tools confirmed

---

### Test: Action Routing
```
For each consolidated tool:
1. Test each action variant
2. Verify correct handler called
3. Check discriminated union validation
4. Ensure no action overlap
```
**Success Criteria**: ✅ All actions route correctly

---

### Test: Data Persistence
```
For each tool:
1. Make change
2. Verify in Foundry UI
3. Refresh Foundry
4. Verify data persists
5. Query via get-character
6. Confirm accuracy
```
**Success Criteria**: ✅ All changes persist

---

### Test: Error Handling
```
For each tool:
1. Test invalid parameters
2. Test missing parameters
3. Test wrong data types
4. Verify error messages
5. Confirm no data corruption
```
**Success Criteria**: ✅ Robust error handling

---

### Test: XP Calculations
```
1. Skill advances Tier 0-4
2. Characteristic advances with tiers
3. Talent costs (100 XP)
4. Career change costs (100/200 XP)
5. Verify formulas: Math.floor(advances / 5)
```
**Success Criteria**: ✅ All XP formulas correct

---

## 🎯 TESTING CHECKLIST

### Phase 1: Basic Tool Verification
- [ ] All 36 tools discoverable
- [ ] Each tool has proper description
- [ ] All required parameters documented
- [ ] Each tool responds without errors

### Phase 2: Action Verification (Consolidated Tools)
- [ ] manage-character (5 actions)
- [ ] manage-career (5 actions)
- [ ] manage-corruption (3 actions)
- [ ] manage-mutation (3 actions)
- [ ] manage-fortune-fate (6 actions)
- [ ] manage-resolve-resilience (6 actions)
- [ ] manage-advantage (4 actions)
- [ ] manage-critical-wound (4 actions)
- [ ] manage-disease (4 actions)
- [ ] manage-inventory (5 actions)
- [ ] create-item (6 actions)
- [ ] manage-divine-magic (6 actions)
- [ ] manage-arcane-magic (6 actions)
- [ ] manage-social-status (5 actions)
- [ ] manage-npc-generation (3 actions)
- [ ] manage-ownership (3 actions)
- [ ] manage-journal (5 actions)
- [ ] manage-rolltable (5 actions)

### Phase 3: Integration Testing
- [ ] Character lifecycle scenario
- [ ] Combat scenario
- [ ] Corruption scenario
- [ ] Career progression scenario
- [ ] Quest management scenario
- [ ] Magic user scenario
- [ ] Divine character scenario

### Phase 4: Technical Validation
- [ ] Tool count verified (36)
- [ ] Action routing tested
- [ ] Data persistence confirmed
- [ ] Error handling validated
- [ ] XP calculations verified
- [ ] Discriminated unions working

### Phase 5: Performance Testing
- [ ] Response time < 3 seconds per tool
- [ ] Bulk operations (10+ items) handled
- [ ] Large dataset retrieval (100+ characters)
- [ ] Concurrent operations safe
- [ ] Memory usage acceptable

---

## 📝 TEST REPORTING

### Test Result Template
```markdown
**Test ID**: [e.g., 1.5]
**Tool**: [e.g., manage-character]
**Action**: [e.g., update-stats]
**Date**: [test date]
**Result**: ✅ Pass / ❌ Fail
**Notes**: [observations]
**Issues**: [if any]
```

### Issue Template
```markdown
**Issue**: [brief description]
**Tool**: [affected tool]
**Action**: [if consolidated tool]
**Steps to Reproduce**:
1. [step 1]
2. [step 2]
**Expected**: [expected behavior]
**Actual**: [actual behavior]
**Severity**: Critical / High / Medium / Low
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Tool Not Found**
- Verify MCP server restarted
- Check tool count (should be 36)
- Ensure build completed successfully

**Action Not Working**
- Verify action name spelling
- Check required parameters
- Review discriminated union schema

**Data Not Persisting**
- Check Foundry permissions
- Verify character name correct
- Confirm `skipDialog: true` used

**XP Calculations Wrong**
- Verify using tier formula
- Check Math.floor(advances / 5)
- Confirm not using array index

---

## 📚 REFERENCE

### Tool Consolidation Summary
- **Phase 1**: Reduced 100 → 66 tools (-34)
- **Phase 2**: Reduced 66 → 36 tools (-30)
- **Total Reduction**: 64 tools (64%)

### Key Files
- `packages/mcp-server/src/backend.ts` - Tool registration
- `packages/mcp-server/src/tools/` - 26 tool files
- `packages/foundry-module/src/queries.ts` - Query handlers

### Documentation
- `CLAUDE.md` - Quick reference
- `docs/INSTRUCTIONS.md` - Development guide
- `docs/CHANGELOG.md` - Version history
- `docs/TOOL_CONSOLIDATION_PLAN_2.md` - Consolidation details

---

**End of Test Document**

*Last Updated: January 31, 2025*  
*Version: 0.2.4*  
*Total Tests: 100+*  
*Coverage: All 36 tools*
