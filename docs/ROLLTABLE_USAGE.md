# RollTable Tool Usage Guide

The RollTable tool allows you to create, manage, and roll on random tables in Foundry VTT through the MCP interface.

## Available Operations

### 1. Create RollTable (`create-rolltable`)

Create a new RollTable with custom entries.

**Parameters:**
- `name` (required): Name of the table
- `description` (optional): Description of what the table is for
- `formula` (optional): Dice formula (default: "1d20"). Examples: "1d100", "1d6", "2d6"
- `entries` (required): Array of table entries
  - Each entry requires:
    - `text` (required): The result text
    - `weight` (optional): Probability weight (higher = more likely)
    - `range` (optional): Explicit range [min, max] like [1, 5]
- `replacement` (optional): Allow same result multiple times (default: true)
- `displayRoll` (optional): Show roll publicly in chat (default: true)

**Example:**
```
Create a random encounter table with these entries:
- 1-20: Goblin Scout (weight: 20)
- 21-50: Bandit Group (weight: 30)
- 51-80: Merchant Caravan (weight: 30)
- 81-100: Wandering Beast (weight: 20)
Formula: 1d100
```

**Natural Language Example:**
```
Create a treasure hoard table with formula 1d6:
1. 5 gold coins
2. 10 gold coins
3. A rusty sword
4. A healing potion
5. A mysterious gemstone
6. A magical scroll
```

### 2. List RollTables (`list-rolltables`)

List all RollTables in the current world.

**Parameters:** None

**Example:**
```
Show me all available roll tables
```

### 3. Get RollTable Details (`get-rolltable`)

Get detailed information about a specific table.

**Parameters:**
- `tableId` (required): The ID of the table to retrieve

**Example:**
```
Show me the details of table "abc123"
```

### 4. Roll on Table (`roll-on-table`)

Roll on a RollTable and get a random result.

**Parameters:**
- `tableId` (required): The ID of the table to roll on
- `rollMode` (optional): How to display the result
  - `"public"` (default): Everyone sees the result
  - `"private"`: GM and player see it
  - `"blind"`: Only GM sees it
  - `"self"`: Only the roller sees it

**Example:**
```
Roll on the random encounters table (ID: abc123)
```

### 5. Delete RollTable (`delete-rolltable`)

Permanently delete a RollTable from the world.

**Parameters:**
- `tableId` (required): The ID of the table to delete

**Example:**
```
Delete the table with ID "abc123"
```

## Common Use Cases

### Random Encounters
```
Create a random wilderness encounter table:
Formula: 1d100
Entries:
- 1-10: Nothing (peaceful travel)
- 11-25: 2d4 Goblins
- 26-40: 1d6 Bandits
- 41-55: Traveling Merchant
- 56-70: Wild Animals (1d4 Wolves)
- 71-85: Environmental Hazard
- 86-95: Fellow Adventurers
- 96-100: Legendary Creature
```

### Loot Tables
```
Create a basic treasure table:
Formula: 1d20
Entries:
- 1-5: Nothing
- 6-10: 1d10 gold coins
- 11-15: 2d10 gold coins + minor item
- 16-18: 3d10 gold coins + magic item
- 19-20: Rare magic item
```

### Critical Hit Effects
```
Create a critical hit effects table:
Formula: 1d6
Entries:
- 1: Stunned for 1 round
- 2: Bleeding (1d4 damage per round)
- 3: Knocked prone
- 4: Weapon damaged
- 5: Armor damaged
- 6: Fatal wound (immediate death saving throw)
```

### NPC Names
```
Create a random NPC name table:
Formula: 1d10
Entries:
- 1: Gustav Thunderbeard
- 2: Elara Moonshadow
- 3: Thorgrim Ironfoot
- 4: Lyra Silverwind
- 5: Brundle Swiftaxe
- 6: Seraphina Brightmane
- 7: Krag Stonefist
- 8: Althea Nightwhisper
- 9: Borin Goldenhammer
- 10: Mystral Starweaver
```

### Weather Table
```
Create a daily weather table:
Formula: 1d12
Entries:
- 1-3: Clear skies
- 4-6: Partly cloudy
- 7-8: Overcast
- 9-10: Light rain
- 11: Heavy rain
- 12: Storm
```

## Tips

1. **Use appropriate dice formulas:** 
   - d100 for percentile tables with many entries
   - d20 for standard tables with ~20 entries
   - d6 for simple tables with 6 outcomes
   - 2d6 for bell curve probability (2-12, average 7)

2. **Weights vs Ranges:**
   - Use `weight` for simple relative probability
   - Use explicit `range` for precise control over d100 tables

3. **Table Organization:**
   - Create tables for different aspects (encounters, loot, events)
   - Use descriptive names to easily find tables later
   - Add descriptions to document what the table is for

4. **Replacement Setting:**
   - Set `replacement: false` for "draw from hat" style tables (no repeats)
   - Keep `replacement: true` (default) for standard random tables

5. **Roll Modes:**
   - Use "public" for open rolls everyone should see
   - Use "blind" for secret GM rolls (reactions, random events)
   - Use "private" for player-specific results

## Security

- Creating, modifying, and deleting RollTables requires GM access
- All players can view and roll on existing tables
- Invalid operations return error messages without crashing

## Example Workflow

1. **Create the table:**
   ```
   Create a random encounter table called "Forest Encounters" with formula 1d20:
   1-5: Nothing
   6-10: 2d4 Goblins
   11-15: 1d6 Bandits
   16-18: Traveling Merchant
   19-20: Owlbear
   ```

2. **List all tables to find the ID:**
   ```
   List all roll tables
   ```

3. **View table details:**
   ```
   Show me the details of the Forest Encounters table
   ```

4. **Roll on the table:**
   ```
   Roll on the Forest Encounters table
   ```

5. **Roll secretly (GM only):**
   ```
   Roll on the Forest Encounters table in blind mode
   ```

## Integration with WFRP 4e

The RollTable system works great with Warhammer Fantasy Roleplay 4e for:

- **Random Encounters:** Create region-specific encounter tables
- **Critical Hits/Fumbles:** Custom critical effect tables
- **Chaos Corruption:** Random mutation/corruption tables  
- **Loot/Treasure:** Career-specific loot tables
- **Miscast Effects:** Spell miscasting consequences
- **Random Events:** Session hooks and plot twists
- **NPC Generation:** Random names, traits, motivations
- **Weather/Travel:** Journey complications

Example WFRP tables:
- Old World Travel Encounters (by region)
- Chaos Corruption Effects
- Critical Wound Locations
- Random Mutation Table
- Tavern Rumors
- Career-Specific Equipment
- Random NPC Personality Traits
