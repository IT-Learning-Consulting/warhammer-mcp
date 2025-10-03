# Item Creator Tool - Implementation Summary

## Overview

Created a comprehensive **Advanced Item Creator and Manager** tool for WFRP 4e that handles creation, modification, and management of all item types with full specifications including qualities, flaws, and system-specific properties.

## Tool Capabilities

### 8 Tool Definitions Created

1. **create-weapon** ⚔️
   - Creates melee or ranged weapons
   - Supports all 17 weapon groups (basic, cavalry, fencing, blackpowder, bow, etc.)
   - Configurable damage, reach, range
   - 20+ weapon qualities (accurate, blast, damaging, fast, hack, impale, penetrating, etc.)
   - 6 weapon flaws (dangerous, imprecise, reload, slow, tiring, undamaging)
   - Encumbrance system
   - Auto-determines melee vs ranged from group

2. **create-armour** 🛡️
   - Creates armor pieces with location coverage
   - 6 armor types (softLeather, boiledLeather, mail, plate, other, otherMetal)
   - Multi-location support (head, body, lArm, rArm, lLeg, rLeg)
   - Independent AP values per location
   - 3 armor qualities (flexible, impenetrable, magical)
   - 2 armor flaws (partial, weakpoints)

3. **create-trapping** 🎒
   - Creates general equipment/items
   - 8 trapping categories (clothingAccessories, foodAndDrink, toolsAndKits, booksAndDocuments, tradeTools, drugsPoisonsHerbsDraughts, ingredient, misc)
   - Quantity/stacking support
   - 4 item qualities (durable, fine, lightweight, practical)
   - 4 item flaws (ugly, shoddy, unreliable, bulky)

4. **create-ammunition** 🏹
   - Creates ammunition for ranged weapons
   - 6 ammunition types (bow, crossbow, sling, BPandEng, throwing, entangling)
   - Quantity tracking
   - Compatible with specific weapon groups

5. **create-container** 📦
   - Creates storage containers
   - Capacity system
   - Encumbrance management
   - Types: backpacks, sacks, chests, pouches

6. **modify-item-qualities** ✨
   - Add/remove qualities from existing items
   - Add/remove flaws from existing items
   - Supports all item types (weapons, armor, trappings)
   - Useful for enchantments, repairs, damage, wear

7. **add-item-to-character** ➕
   - Add items from compendium to characters
   - Auto-equip option
   - Quantity support for stackable items

8. **remove-item-from-character** ➖
   - Remove items from inventory
   - Partial quantity removal for stackables
   - Complete deletion option

## System Constants Referenced

### Weapon Groups (17)
```typescript
const weaponGroups = {
    // Melee (8)
    basic, cavalry, fencing, brawling, flail, parry, polearm, twohanded,
    // Ranged (9)
    blackpowder, bow, crossbow, entangling, engineering, explosives, sling, throwing, vehicle
};
```

### Weapon Reach (7)
```typescript
const weaponReaches = {
    personal, vshort, short, average, long, vLong, massive
};
```

### Weapon Qualities (20)
```typescript
const weaponQualities = {
    accurate, blackpowder, blast, damaging, defensive, distract, entangle,
    fast, hack, impact, impale, magical, penetrating, pistol, precise,
    pummel, repeater, shield, trapblade, unbreakable, wrap
};
```

### Weapon Flaws (6)
```typescript
const weaponFlaws = {
    dangerous, imprecise, reload, slow, tiring, undamaging
};
```

### Armor Types (6)
```typescript
const armorTypes = {
    softLeather, boiledLeather, mail, plate, other, otherMetal
};
```

### Armor Qualities (3)
```typescript
const armorQualities = {
    flexible, impenetrable, magical
};
```

### Armor Flaws (2)
```typescript
const armorFlaws = {
    partial, weakpoints
};
```

### Item Qualities (4)
```typescript
const itemQualities = {
    durable, fine, lightweight, practical
};
```

### Item Flaws (4)
```typescript
const itemFlaws = {
    ugly, shoddy, unreliable, bulky
};
```

### Trapping Categories (8)
```typescript
const trappingCategories = {
    clothingAccessories, foodAndDrink, toolsAndKits, booksAndDocuments,
    tradeTools, drugsPoisonsHerbsDraughts, ingredient, misc
};
```

### Ammunition Groups (6)
```typescript
const ammunitionGroups = {
    bow, crossbow, sling, BPandEng, throwing, entangling
};
```

### Hit Locations (6)
```typescript
const locations = {
    head, body, lArm, rArm, lLeg, rLeg
};
```

## Implementation Status

### ✅ Completed
- [x] Tool definitions with comprehensive descriptions
- [x] Input schemas with validation
- [x] Enum constraints for all system constants
- [x] Weapon creation handler (fully implemented)
- [x] Response formatting for weapon creation
- [x] Integration with backend.ts (import, instantiation, registration, handlers)
- [x] Type-safe schemas with Zod validation

### ⚠️ Partial Implementation
- [ ] **Armor creation handler** (handleCreateArmour) - needs implementation
- [ ] **Trapping creation handler** (handleCreateTrapping) - needs implementation
- [ ] **Ammunition creation handler** (handleCreateAmmunition) - needs implementation
- [ ] **Container creation handler** (handleCreateContainer) - needs implementation
- [ ] **Modify qualities handler** (handleModifyItemQualities) - needs implementation
- [ ] **Add item to character handler** (handleAddItemToCharacter) - needs implementation
- [ ] **Remove item handler** (handleRemoveItemFromCharacter) - needs implementation

## Data Structure Examples

### Weapon Data Structure
```typescript
{
  name: "Longsword",
  type: "weapon",
  system: {
    damage: { value: "SB+4" },
    reach: { value: "average" },
    weaponGroup: { value: "basic" },
    range: { value: 0 },
    equipped: { value: false },
    encumbrance: { value: 1 },
    properties: {
      qualities: {
        damaging: true,
        hack: true
      },
      flaws: {}
    },
    description: { value: "A well-balanced sword..." }
  }
}
```

### Armor Data Structure
```typescript
{
  name: "Mail Coat",
  type: "armour",
  system: {
    armorType: { value: "mail" },
    encumbrance: { value: 3 },
    properties: {
      qualities: {},
      flaws: {}
    },
    APDetails: {
      head: { value: 0 },
      body: { value: 3 },
      lArm: { value: 3 },
      rArm: { value: 3 },
      lLeg: { value: 0 },
      rLeg: { value: 0 }
    },
    worn: { value: false },
    description: { value: "Heavy mail protecting torso..." }
  }
}
```

### Trapping Data Structure
```typescript
{
  name: "Rope (50 yards)",
  type: "trapping",
  system: {
    trappingType: { value: "misc" },
    encumbrance: { value: 1 },
    quantity: { value: 1 },
    properties: {
      qualities: {
        durable: 2  // rating value
      },
      flaws: {}
    },
    description: { value: "Sturdy hempen rope..." }
  }
}
```

## Handler Implementation Pattern

Each handler follows this pattern:

1. **Schema Validation** - Zod schema with type checking
2. **Logger Info** - Log the operation
3. **Character Lookup** - Find character if specified
4. **Data Structure Building** - Create proper WFRP4e item data
5. **Foundry Client Call** - Use `createItem` query
6. **Response Formatting** - Return markdown formatted result

Example structure:
```typescript
async handleCreateX(args: any): Promise<any> {
    const schema = z.object({...});
    const parsed = schema.parse(args);
    
    // Build item data
    const itemData = {
        name: parsed.name,
        type: 'item-type',
        system: {...}
    };
    
    // Add to character if specified
    if (parsed.characterName) {
        const character = await this.foundryClient.query(...);
        await this.foundryClient.query('foundry-mcp-bridge.createItem', {
            actorId: character.id,
            itemData: itemData
        });
    }
    
    return this.formatResponse(parsed, 'Item created');
}
```

## Quality/Flaw Value System

Some qualities/flaws have numeric values:

### With Values
- **blast**: radius in yards (e.g., blast: 3)
- **durable**: durability rating (e.g., durable: 2)
- **fine**: quality rating (e.g., fine: 1)
- **reload**: reload time in actions (e.g., reload: 2)
- **repeater**: shots per action (e.g., repeater: 2)
- **shield**: AP bonus when blocking (e.g., shield: 2)

### Without Values (Boolean)
- **fast**, **hack**, **impale**, **penetrating**, **precise**, etc.
- Just presence indicates the quality/flaw applies

## Integration Points

### Backend Registration
```typescript
// Import
import { ItemCreatorTools } from './tools/item-creator.js';

// Instantiate
const itemCreatorTools = new ItemCreatorTools({ foundryClient, logger });

// Register definitions
...itemCreatorTools.getToolDefinitions(),

// Add handlers in switch statement
case 'create-weapon':
  result = await itemCreatorTools.handleCreateWeapon(args);
  break;
// ... (8 cases total)
```

### Foundry Module Bridge
Uses existing bridge methods:
- `foundry-mcp-bridge.getCharacterInfo` - Find character
- `foundry-mcp-bridge.createItem` - Create item on actor
- `foundry-mcp-bridge.updateItem` - Modify existing items
- `foundry-mcp-bridge.deleteItem` - Remove items

## Usage Examples

### Create a Longsword
```json
{
  "name": "create-weapon",
  "args": {
    "characterName": "Gustav",
    "weaponName": "Longsword",
    "weaponGroup": "basic",
    "damage": "SB+4",
    "reach": "average",
    "encumbrance": 1,
    "qualities": [
      {"name": "damaging"},
      {"name": "hack"}
    ]
  }
}
```

### Create Plate Armor
```json
{
  "name": "create-armour",
  "args": {
    "characterName": "Hans",
    "armourName": "Plate Breastplate",
    "armourType": "plate",
    "locations": [
      {"location": "body", "value": 5}
    ],
    "encumbrance": 4,
    "qualities": ["impenetrable"]
  }
}
```

### Create Healing Potion
```json
{
  "name": "create-trapping",
  "args": {
    "characterName": "Elara",
    "trappingName": "Healing Draught",
    "trappingType": "drugsPoisonsHerbsDraughts",
    "encumbrance": 0,
    "quantity": 3,
    "description": "Restores 1d10 wounds"
  }
}
```

### Add Magical Quality
```json
{
  "name": "modify-item-qualities",
  "args": {
    "characterName": "Gustav",
    "itemName": "Longsword",
    "addQualities": [
      {"name": "magical"},
      {"name": "penetrating"}
    ]
  }
}
```

## Next Steps

To complete the implementation:

1. **Implement remaining handlers** following the weapon handler pattern
2. **Test with Foundry VTT** to verify data structures
3. **Add error handling** for edge cases
4. **Create response formatters** for each item type
5. **Add validation** for quality/flaw combinations (some are mutually exclusive)
6. **Document special cases** (e.g., shield quality only for certain weapon groups)

## Benefits

- **Type-safe**: Zod validation ensures correctness
- **Comprehensive**: Covers all WFRP4e item types and properties
- **Flexible**: Can create custom items or add from compendium
- **Integrated**: Works with existing inventory management
- **Documented**: Extensive descriptions and examples in tool definitions

## File Locations

- **Tool Implementation**: `packages/mcp-server/src/tools/item-creator.ts`
- **Backend Integration**: `packages/mcp-server/src/backend.ts` (lines added for import, instantiation, registration, handlers)
- **This Documentation**: `docs/ITEM_CREATOR_IMPLEMENTATION.md`

---

*Created*: January 2025  
*Status*: Partially Implemented - Weapon creation complete, 6 handlers need implementation  
*Integration*: Fully registered in backend
