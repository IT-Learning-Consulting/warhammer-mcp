# WFRP4e Character Creation via MCP - Skills Integration Guide

## Overview

This document outlines the complete workflow for creating WFRP4e characters in Foundry VTT through the Model Context Protocol (MCP), designed for integration with a Claude skill that performs character generation calculations.

---

## Character JSON Output Format

### Proposed Structure

The Claude character generation skill should output JSON in the following format:

```json
{
  "meta": {
    "version": "1.0",
    "system": "wfrp4e",
    "generatedBy": "claude-character-skill"
  },
  
  "basicInfo": {
    "name": "Test Character",
    "species": "Human",
    "subspecies": "Reiklander",
    "gender": "Female",
    "age": "18",
    "height": "5'8",
    "hair": "Light Brown",
    "eyes": "Grey",
    "distinguishingMark": "",
    "starSign": "The Limner's Line",
    "motivation": "Charity"
  },
  
  "ambitions": {
    "shortTerm": "Kill the Witch",
    "longTerm": "Unite the Empire",
    "partyShortTerm": "",
    "partyLongTerm": ""
  },
  
  "characteristics": {
    "ws":  { "initial": 33, "advances": 2 },
    "bs":  { "initial": 33, "advances": 0 },
    "s":   { "initial": 35, "advances": 0 },
    "t":   { "initial": 27, "advances": 3 },
    "i":   { "initial": 27, "advances": 0 },
    "ag":  { "initial": 27, "advances": 11 },
    "dex": { "initial": 30, "advances": 0 },
    "int": { "initial": 35, "advances": 1 },
    "wp":  { "initial": 24, "advances": 0 },
    "fel": { "initial": 37, "advances": 1 }
  },
  
  "status": {
    "fate": 4,
    "fortune": 4,
    "resilience": 2,
    "resolve": 2
  },
  
  "careers": [
    { "name": "Recruit", "completed": true, "current": false },
    { "name": "Soldier", "completed": false, "current": true }
  ],
  
  "skills": [
    { "name": "Athletics", "advances": 5 },
    { "name": "Charm", "advances": 3 },
    { "name": "Charm Animal", "advances": 1 },
    { "name": "Cool", "advances": 13 },
    { "name": "Dodge", "advances": 10 },
    { "name": "Gamble", "advances": 1 },
    { "name": "Melee (Basic)", "advances": 17 },
    { "name": "Language (Battle)", "advances": 5 },
    { "name": "Stealth", "advances": 21 },
    { "name": "Animal Care", "advances": 3 },
    { "name": "Evaluate", "advances": 5 }
  ],
  
  "talents": [
    { "name": "Craftsman ()", "taken": 1 },
    { "name": "Suave", "taken": 1 },
    { "name": "Acute Sense (Hearing)", "taken": 1 },
    { "name": "Warrior Born", "taken": 1 },
    { "name": "Luck", "taken": 1 },
    { "name": "Strong Back", "taken": 2 },
    { "name": "Doomed", "taken": 1 }
  ],
  
  "trappings": [
    { "name": "Hand Weapon", "equipped": true, "quantity": 1 },
    { "name": "Dagger", "equipped": true, "quantity": 2 },
    { "name": "Boiled Leather Breastplate", "worn": true, "quantity": 1 },
    { "name": "Clothing", "worn": true, "quantity": 1 },
    { "name": "Uniform", "worn": true, "quantity": 1 },
    { "name": "Pouch", "worn": true, "quantity": 1 }
  ],
  
  "money": {
    "gc": 1,
    "ss": 10,
    "bp": 0
  },
  
  "experience": {
    "total": 5000,
    "log": [
      { "amount": 4925, "reason": "Starting XP", "type": "total" },
      { "amount": -75, "reason": "Species Skills & Talents", "type": "spent" },
      { "amount": -265, "reason": "Stealth (5)", "type": "spent" },
      { "amount": -345, "reason": "Stealth (4)", "type": "spent" }
    ]
  },
  
  "traits": [],
  
  "biography": ""
}
```

---

## Available MCP Tools

### 1. Actor Creation Tools

#### `create-custom-npc`
Creates a WFRP 4e NPC/character from scratch with XP-based stat distribution.

**Parameters:**
- `name` (string, required): NPC/character name
- `xpBudget` (number, required): XP budget (0-10000)
- `archetype` (string, required): Distribution archetype
- `species` (string, optional): "human", "halfling", "dwarf", "high-elf", "wood-elf"
- `career` (string, optional): Career name
- `personality` (string[], optional): Personality descriptors
- `background` (string, optional): Background/description
- `dryRun` (boolean, optional): Preview vs actually create

**Archetypes:** `aggressive-fighter`, `ranged-combatant`, `defensive-warrior`, `agile-rogue`, `cunning-thief`, `wise-priest`, `powerful-wizard`, `charismatic-leader`, `scholarly-sage`, `hardy-survivalist`, `brutal-berserker`, `swift-duelist`, `intimidating-thug`, `sneaky-assassin`

---

### 2. Character Information Tools

#### `foundry-get-character-info`
Retrieves comprehensive character information.

**Parameters:**
- `characterName` (string, required): Character name or ID

#### `foundry-list-characters`
Lists all available characters.

**Parameters:**
- `actorType` (string, optional): Filter by type ("character", "npc")

---

### 3. Character Update Tools

#### `foundry-update-character-info`
**GM Override tool** - Directly sets character stats without XP costs.

**Parameters:**
- `characterName` (string, required): Character name or ID
- `updates` (object, required): Fields to update

**Supported update fields:**
- **Characteristics**: `weaponSkill`, `ballisticSkill`, `strength`, `toughness`, `initiative`, `agility`, `dexterity`, `intelligence`, `willpower`, `fellowship` (or abbreviations: `ws`, `bs`, `s`, `t`, `i`, `ag`, `dex`, `int`, `wp`, `fel`)
- **Characteristic Advances**: `wsAdvances`, `bsAdvances`, `sAdvances`, `tAdvances`, `iAdvances`, `agAdvances`, `dexAdvances`, `intAdvances`, `wpAdvances`, `felAdvances`
- **Status**: `fate`, `fortune`, `resilience`, `resolve`, `wounds`
- **Physical**: `age`, `height`, `weight`, `hair`, `eyes`, `distinguishingMark`, `gender`, `starSign`

#### `foundry-update-skill-talent`
Directly sets skill/talent advances (no XP cost).

**Parameters:**
- `characterName` (string, required): Character name or ID
- `itemName` (string, required): Skill/talent name
- `itemType` (string, required): "skill" or "talent"
- `advances` (number, required): Advance value to set

#### `add-skill-talent`
Adds a skill/talent from compendium to a character (no XP cost).

**Parameters:**
- `characterName` (string, required): Character name or ID
- `itemName` (string, required): Skill/talent name
- `itemType` (string, required): "skill" or "talent"

#### `foundry-update-character-notes`
Updates GM Notes or Biography.

**Parameters:**
- `characterName` (string, required): Character name or ID
- `gmNotes` (string, optional): GM notes content
- `biography` (string, optional): Biography content
- `append` (boolean, optional): Append vs replace

#### `foundry-add-experience-log-entry`
Adds an entry to the experience log.

**Parameters:**
- `characterName` (string, required): Character name or ID
- `amount` (number, required): XP amount (+/-)
- `reason` (string, required): Log entry reason
- `type` (string, optional): "spent" or "total"

---

### 4. Career Advancement Tools

#### `view-career-advances`
View available career advances and XP costs.

**Parameters:**
- `characterName` (string, required): Character name or ID

#### `purchase-characteristic-advance`
Spend XP to advance a characteristic.

**Parameters:**
- `characterName` (string, required): Character name or ID
- `characteristic` (string, required): ws, bs, s, t, i, ag, dex, int, wp, fel
- `advances` (number, optional): Number of advances (default: 1)

#### `purchase-skill-advance`
Spend XP to advance a skill.

**Parameters:**
- `characterName` (string, required): Character name or ID
- `skillName` (string, required): Skill name
- `advances` (number, optional): Number of advances (default: 1)

#### `purchase-talent`
Spend XP to purchase/upgrade a talent.

**Parameters:**
- `characterName` (string, required): Character name or ID
- `talentName` (string, required): Talent name
- `ranks` (number, optional): Number of ranks (default: 1)

#### `change-career`
Change character's career (costs 100-200 XP).

**Parameters:**
- `characterName` (string, required): Character name or ID
- `newCareer` (string, required): New career name

---

### 5. Item Creation Tools

#### `create-weapon`
Creates a custom weapon.

**Parameters:**
- `characterName` (string, optional): Add to character (optional)
- `name` (string, required): Weapon name
- `weaponGroup` (string, required): basic, cavalry, fencing, etc.
- `damage` (string, required): "SB+4", "7", etc.
- `reach` (string, required): personal, vshort, short, average, long, vLong, massive
- `range` (number, optional): For ranged weapons
- `quantity` (number, optional): Default: 1
- `qualities` (array, optional): Weapon qualities
- `flaws` (array, optional): Weapon flaws
- `description` (string, optional): Description

#### `create-armour`
Creates custom armor.

**Parameters:**
- `characterName` (string, optional): Add to character (optional)
- `name` (string, required): Armor name
- `armorType` (string, required): softLeather, boiledLeather, mail, plate, etc.
- `locations` (array, required): [{location, value}] for each covered location
- `quantity` (number, optional): Default: 1
- `qualities` (array, optional): Armor qualities
- `flaws` (array, optional): Armor flaws

#### `create-trapping`
Creates general equipment.

**Parameters:**
- `characterName` (string, optional): Add to character (optional)
- `name` (string, required): Item name
- `trappingType` (string, required): clothingAccessories, foodAndDrink, toolsAndKits, etc.
- `encumbrance` (number, optional): Default: 1
- `quantity` (number, optional): Default: 1

#### `create-ammunition`
Creates ammunition.

**Parameters:**
- `characterName` (string, required): Character to add to
- `name` (string, required): Ammo name
- `ammunitionType` (string, required): bow, crossbow, sling, BPandEng, throwing, entangling
- `quantity` (number, optional): Default: 10

#### `create-container`
Creates a container.

**Parameters:**
- `characterName` (string, required): Character to add to
- `name` (string, required): Container name
- `carries` (number, required): Max encumbrance it can hold
- `quantity` (number, optional): Default: 1

#### `add-item-to-character`
Adds item from compendium to character.

**Parameters:**
- `characterName` (string, required): Character name
- `itemName` (string, required): Item name to search
- `quantity` (number, optional): Default: 1
- `equip` (boolean, optional): Equip immediately

#### `remove-item-from-character`
Removes item from inventory.

**Parameters:**
- `characterName` (string, required): Character name
- `itemName` (string, required): Item to remove
- `quantity` (number, optional): Partial removal

---

### 6. Fate/Resilience/Fortune Tools

- `check-fortune`: Check current Fortune points
- `check-fate`: Check current Fate points
- `spend-fortune`: Spend Fortune point
- `spend-fate`: Permanently spend Fate point
- `restore-fortune`: Restore Fortune to maximum
- `award-bonus-fortune`: Award bonus Fortune points
- `award-fate`: Award Fate points (rare)
- `check-resilience`: Check Resilience
- `check-resolve`: Check Resolve
- `spend-resilience`: Permanently spend Resilience
- `spend-resolve`: Spend Resolve point

---

## Character Import Workflow

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLAUDE CHARACTER SKILL                               │
│  • Rolls/calculates characteristics                                          │
│  • Selects species skills/talents                                           │
│  • Calculates XP expenditure                                                │
│  • Outputs JSON                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CHARACTER JSON OUTPUT                                │
│  { name, species, characteristics, skills[], talents[], trappings[], etc. } │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MCP ORCHESTRATION LAYER (NEW)                            │
│  Parses JSON → Sequences tool calls → Handles errors                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│ Phase 1: Create │      │ Phase 2: Configure  │      │ Phase 3: Equip  │
│ Actor           │ ───► │ Stats & Skills      │ ───► │ & Finalize      │
└─────────────────┘      └─────────────────────┘      └─────────────────┘
```

---

### Step-by-Step Tool Sequence

#### **Phase 1: Create Base Actor**

**Step 1.1:** Create Actor

**Tool:** `create-custom-npc`

**JSON Fields:** `name`, `species`, `subspecies`

**Example:**
```json
{
  "tool": "create-custom-npc",
  "params": {
    "name": "Test Character",
    "species": "human",
    "xpBudget": 0,
    "archetype": "aggressive-fighter",
    "dryRun": false
  }
}
```

**Result:** Actor created in Foundry

---

#### **Phase 2: Set Characteristics & Details**

**Step 2.1:** Update All Stats

**Tool:** `foundry-update-character-info`

**JSON Fields:** `characteristics.*`, `basicInfo.*`, `status.*`

**Example:**
```json
{
  "tool": "foundry-update-character-info",
  "params": {
    "characterName": "Test Character",
    "updates": {
      "ws": 33, "wsAdvances": 2,
      "bs": 33, "bsAdvances": 0,
      "s": 35, "sAdvances": 0,
      "t": 27, "tAdvances": 3,
      "i": 27, "iAdvances": 0,
      "ag": 27, "agAdvances": 11,
      "dex": 30, "dexAdvances": 0,
      "int": 35, "intAdvances": 1,
      "wp": 24, "wpAdvances": 0,
      "fel": 37, "felAdvances": 1,
      "fate": 4,
      "fortune": 4,
      "resilience": 2,
      "resolve": 2,
      "age": "18",
      "height": "5'8",
      "hair": "Light Brown",
      "eyes": "Grey",
      "starSign": "The Limner's Line",
      "gender": "Female"
    }
  }
}
```

**Result:** All stats set

---

#### **Phase 3: Add Career**

**Step 3.1-3.2:** Set Career History

**Tool:** `change-career` (called for each career in order)

**JSON Fields:** `careers[]`

**Example:**
```json
// First career
{
  "tool": "change-career",
  "params": {
    "characterName": "Test Character",
    "newCareer": "Recruit"
  }
}

// Current career
{
  "tool": "change-career",
  "params": {
    "characterName": "Test Character",
    "newCareer": "Soldier"
  }
}
```

**Result:** Career items added

---

#### **Phase 4: Add Skills**

**For each skill in `skills[]`:**

**Step 4.1:** Add Skill from Compendium

**Tool:** `add-skill-talent`

**Example:**
```json
{
  "tool": "add-skill-talent",
  "params": {
    "characterName": "Test Character",
    "itemName": "Melee (Basic)",
    "itemType": "skill"
  }
}
```

**Step 4.2:** Set Advances

**Tool:** `foundry-update-skill-talent`

**Example:**
```json
{
  "tool": "foundry-update-skill-talent",
  "params": {
    "characterName": "Test Character",
    "itemName": "Melee (Basic)",
    "itemType": "skill",
    "advances": 17
  }
}
```

**Result:** Skill added with correct advance level

---

#### **Phase 5: Add Talents**

**For each talent in `talents[]`:**

**Step 5.1:** Add Talent from Compendium

**Tool:** `add-skill-talent`

**Example:**
```json
{
  "tool": "add-skill-talent",
  "params": {
    "characterName": "Test Character",
    "itemName": "Strong Back",
    "itemType": "talent"
  }
}
```

**Step 5.2:** Set Ranks (if > 1)

**Tool:** `foundry-update-skill-talent`

**Example:**
```json
{
  "tool": "foundry-update-skill-talent",
  "params": {
    "characterName": "Test Character",
    "itemName": "Strong Back",
    "itemType": "talent",
    "advances": 2
  }
}
```

**Result:** Talent added with correct rank

---

#### **Phase 6: Add Trappings**

**For each trapping in `trappings[]`:**

**Tool:** `add-item-to-character`

**JSON Fields:** `trappings[n].name`, `quantity`, `equipped`

**Example:**
```json
{
  "tool": "add-item-to-character",
  "params": {
    "characterName": "Test Character",
    "itemName": "Hand Weapon",
    "quantity": 1,
    "equip": true
  }
}
```

**Result:** Item added and equipped/worn

---

#### **Phase 7: Set Money**

**Money is handled as inventory items with quantity:**

**For each currency type:**

**Tool:** `add-item-to-character`

**JSON Fields:** `money.gc`, `money.ss`, `money.bp`

**Example:**
```json
// Gold Crowns
{
  "tool": "add-item-to-character",
  "params": {
    "characterName": "Test Character",
    "itemName": "Gold Crown",
    "quantity": 1
  }
}

// Silver Shillings
{
  "tool": "add-item-to-character",
  "params": {
    "characterName": "Test Character",
    "itemName": "Silver Shilling",
    "quantity": 10
  }
}

// Brass Pennies (if > 0)
{
  "tool": "add-item-to-character",
  "params": {
    "characterName": "Test Character",
    "itemName": "Brass Penny",
    "quantity": 0
  }
}
```

**Result:** Currency items added

---

#### **Phase 8: Record Experience Log**

**For each log entry in `experience.log[]`:**

**Tool:** `foundry-add-experience-log-entry`

**Example:**
```json
// Starting XP
{
  "tool": "foundry-add-experience-log-entry",
  "params": {
    "characterName": "Test Character",
    "amount": 4925,
    "reason": "Starting XP",
    "type": "total"
  }
}

// Expenditure
{
  "tool": "foundry-add-experience-log-entry",
  "params": {
    "characterName": "Test Character",
    "amount": -75,
    "reason": "Species Skills & Talents",
    "type": "spent"
  }
}
```

**Result:** XP history recorded

---

#### **Phase 9: Set Notes/Biography**

**Tool:** `foundry-update-character-notes`

**JSON Fields:** `biography`, `ambitions`

**Example:**
```json
{
  "tool": "foundry-update-character-notes",
  "params": {
    "characterName": "Test Character",
    "biography": "",
    "gmNotes": "Short Term: Kill the Witch\nLong Term: Unite the Empire\nMotivation: Charity"
  }
}
```

**Result:** Notes saved

---

## Fields Requiring Manual Input After Import

| Field | Reason | Workaround |
|-------|--------|------------|
| **Portrait Image** | No MCP tool for file upload | User drag/drop or URL if hosted |
| **Star Sign Trait** | Trait item needs manual add | Could add `add-trait` tool |
| **Doomed Prophecy** | Custom text in talent notes | Edit talent after creation |
| **Craftsman Specialization** | Generic "Craftsman ()" needs specification | Edit talent name after creation |
| **Container Contents** | Item-to-container assignment | Add `move-to-container` tool |
| **Party Ambitions** | Typically set at the table | Can be added to gmNotes |

---

## Implementation Considerations

### 1. Orchestrator Implementation Options

**Option A: Single Orchestrator Tool**
- Create one MCP tool: `import-character-from-json`
- Takes JSON as input, handles all phases internally
- Provides atomicity and rollback on failure

**Option B: Separate Tools Called by Claude**
- Claude calls each tool individually in sequence
- More transparent but requires more coordination
- Harder to maintain state if failures occur

**Recommendation:** Option A - Single orchestrator tool for better error handling and atomicity.

---

### 2. Validation Layer

**Should validate:**
- Required JSON fields are present
- Species/careers exist in compendium
- Skills/talents exist in compendium
- Characteristic values are within bounds (0-100)
- XP log adds up correctly

**Recommendation:** Yes, fail fast with clear error messages listing issues.

---

### 3. Rollback on Failure

**Strategy:**
- Create actor in "draft" state initially
- Only finalize (make visible) on complete success
- On failure, delete partially-created actor automatically
- Return detailed error report

**Recommendation:** Implement full rollback to avoid orphaned partial characters.

---

### 4. XP Calculation vs Direct Setting

**The Skill's Responsibility:**
- Calculate all characteristic initial values
- Calculate all advances
- Track XP expenditure
- Generate XP log entries

**The MCP's Responsibility:**
- Set values directly (no calculation)
- Preserve XP log for audit trail
- Use GM override tools to bypass XP costs

**Recommendation:** Skill does all calculations; MCP just sets final values.

---

### 5. Compendium Item Handling

**Preference Order:**
1. **Compendium Lookup** (preferred) - Preserves official effects
2. **Fuzzy Matching** - Handle slight name variations
3. **Manual Creation** - For homebrew/custom items only

**Skill Output:**
- Use exact compendium names where possible
- Document any custom/homebrew items clearly
- Flag items that may need manual creation

---

### 6. Error Reporting

**JSON validation errors should report:**
- Missing required fields
- Invalid field values
- Items not found in compendium
- Line numbers in JSON (if possible)

**Example error format:**
```json
{
  "success": false,
  "errors": [
    {
      "phase": "Phase 4: Add Skills",
      "field": "skills[5].name",
      "value": "Lore (Cheeze)",
      "error": "Skill not found in compendium. Did you mean 'Lore (Cheese)'?"
    }
  ]
}
```

---

## Future Enhancements

### Additional Tools Needed

1. **`add-trait`** - Add species/career traits
2. **`move-to-container`** - Organize inventory
3. **`set-item-location`** - Specify worn armor locations
4. **`upload-portrait`** - Set character image (if API supports)
5. **`create-critical-wound`** - Add injuries
6. **`create-mutation`** - Add mutations

### Skill Enhancements

1. **Career Path Validation** - Ensure career progression is legal
2. **Equipment Automation** - Auto-add career starting trappings
3. **Random Generation Options** - Roll vs point-buy characteristics
4. **Backstory Generation** - AI-generated biography text
5. **Companion Generation** - Create mounts, pets, followers

---

## Example Complete Workflow

### Input: Claude Skill Output
```json
{
  "meta": { "version": "1.0", "system": "wfrp4e" },
  "basicInfo": { "name": "Günther Steinhelm", "species": "Human", "subspecies": "Reiklander" },
  "characteristics": {
    "ws": { "initial": 35, "advances": 5 },
    "bs": { "initial": 28, "advances": 0 }
    // ... etc
  },
  "skills": [
    { "name": "Melee (Basic)", "advances": 15 },
    { "name": "Athletics", "advances": 10 }
  ],
  // ... etc
}
```

### Processing: MCP Tool Calls
```
1. create-custom-npc → Actor created
2. foundry-update-character-info → Stats set
3. change-career (Recruit) → Career added
4. change-career (Soldier) → Career changed
5. add-skill-talent (Melee Basic) → Skill added
6. foundry-update-skill-talent (Melee Basic, 15) → Advances set
7. add-skill-talent (Athletics) → Skill added
8. foundry-update-skill-talent (Athletics, 10) → Advances set
... (continue for all items)
```

### Output: Complete Character Sheet
- Character appears in Foundry VTT
- All stats correctly set
- Skills/talents with proper advances
- Equipment equipped
- XP log documented
- Biography/notes populated

---

## Conclusion

This workflow provides a complete path from Claude skill JSON output to a fully-formed character in Foundry VTT via the MCP. The single-tool orchestrator approach with comprehensive validation and rollback ensures reliability and ease of use.

Key benefits:
- ✅ No manual XP calculations needed
- ✅ Compendium items preserve official effects
- ✅ XP log maintains full audit trail
- ✅ Atomicity prevents partial imports
- ✅ Clear error messages for troubleshooting
