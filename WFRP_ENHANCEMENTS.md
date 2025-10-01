# WFRP 4e Support Enhancements

This document summarizes the WFRP-specific enhancements made to the Foundry VTT MCP integration to better support Warhammer Fantasy Roleplay 4th Edition alongside D&D 5e.

## Summary

The system now has comprehensive dual-system support with WFRP-specific examples, terminology, and prompts throughout the tool descriptions. All changes maintain full backward compatibility with D&D 5e while adding WFRP-flavored guidance.

## Files Modified

### 1. `packages/mcp-server/src/tools/quest-creation.ts`
**Changes:**
- Updated `create-quest-journal` description with WFRP quest examples
- Added WFRP-specific quest title examples (e.g., "The Cult of the Purple Hand")
- Enhanced quest description field with WFRP themes (Chaos cults, Skaven, Old World dangers)
- Updated location field with WFRP examples (Altdorf sewers, The Reikwald, Ubersreik)
- Added WFRP NPC name examples (Captain Marcus, Sister Elsbeth, Lord Rickard Aschaffenberg)

**Example Usage:**
```
"Create a quest about investigating cultists in Ubersreik"
"Generate a quest to recover a lost heirloom from the sewers"
```

### 2. `packages/mcp-server/src/tools/dice-roll.ts`
**Changes:**
- Updated tool description with WFRP d100 system examples
- Added `characteristic` to rollType enum for WFRP characteristic tests (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
- Enhanced rollTarget description with WFRP characteristics and skills
- Updated rollModifier description with WFRP d100 modifiers (+10, -20)
- Added WFRP flavor text examples

**Example Usage:**
```
"Roll Weapon Skill for Hans"
"Test Willpower against fear"
"Make a Channelling check with +10 modifier"
```

### 3. `packages/mcp-server/src/tools/compendium.ts`
**Changes:**
- Updated search query description with WFRP creature terms (beastman, daemon, greenskin)

**Example Usage:**
```
"Find all beastmen with high toughness"
"Show all chaos creatures with magic"
"Search for greenskin warriors"
```

### 4. `packages/mcp-server/src/tools/map-generation.ts`
**Changes:**
- Enhanced `generate-map` description with WFRP map examples
- Updated prompt field with Old World architecture and grim & perilous atmosphere guidance
- Added comprehensive WFRP scene name examples (Altdorf Market, The Reikwald, Temple of Sigmar)
- Clarified grid_size as supporting both systems (70 pixels recommended for both)

**Example Usage:**
```
"Generate Altdorf market square with merchant stalls"
"Create a Reikwald forest clearing with ancient standing stones"
"Make an underground sewer tunnel map"
```

### 5. `packages/mcp-server/src/tools/scene.ts`
**Changes:**
- Enhanced `get-current-scene` description for clarity
- Updated `get-world-info` to explicitly mention system detection (D&D 5e, WFRP 4e)

### 6. `packages/mcp-server/src/tools/campaign-management.ts`
**Changes:**
- Updated `create-campaign-dashboard` description to mention both systems
- Added WFRP campaign title examples (Shadows over Bögenhafen, Enemy Within Campaign)
- Enhanced campaign description field with WFRP themes (grim & perilous, Old World politics, Chaos corruption)
- Updated defaultLocation with WFRP examples (The Reikland, Altdorf and surrounding provinces)

**Example Usage:**
```
"Create a campaign dashboard for 'Shadows over Bögenhafen'"
"Track the Enemy Within campaign with multiple acts"
```

## System Support Matrix

| Feature | D&D 5e | WFRP 4e |
|---------|--------|---------|
| Dice Rolling | d20 system | d100 system |
| Attributes | Abilities (STR, DEX, etc.) | Characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel) |
| Combat Stats | AC, HP | Toughness, Wounds, Armor Points |
| Creature Power | Challenge Rating (CR) | Threat Level (calculated) |
| Creature Types | D&D types (humanoid, dragon, etc.) | WFRP species (human, beastman, daemon, etc.) |
| Magic | Spells & spell slots | Magic, Channelling skill |
| Special Abilities | Legendary actions | Traits & special abilities |
| Grid Size | 5 feet per square | 2 yards per square |

## Technical Implementation

All WFRP support is implemented through automatic system detection in the backend:

```typescript
const gameSystem = game.system?.id || '';
const isWFRP = gameSystem.includes('wfrp');
```

The system automatically:
- Extracts the correct stats based on game system
- Prioritizes the correct compendium packs
- Builds roll formulas using the appropriate dice (d20 vs d100)
- Maps skills and characteristics correctly
- Calculates threat levels for WFRP creatures

## User Benefits

1. **Natural Language Support**: Users can request actions using either D&D or WFRP terminology
2. **Contextual Examples**: Tool descriptions now show relevant examples for both systems
3. **Automatic Detection**: No need to manually specify which system is being used
4. **Seamless Integration**: Works identically for both systems with appropriate adaptations

## Testing Recommendations

When testing WFRP support:
1. Create a WFRP 4e world in Foundry VTT
2. Test creature searches with WFRP species (beastman, daemon, greenskin)
3. Test dice rolls with WFRP characteristics (WS, BS, WP, etc.)
4. Test map generation with Old World themed prompts
5. Test quest creation with WFRP-themed content
6. Verify automatic system detection with `get-world-info` tool

## Future Enhancements

Potential areas for additional WFRP support:
- WFRP-specific career progression tracking
- Corruption and mutation tracking
- Fortune/Fate point management
- Old World calendar and timeline tracking
- WFRP-specific content generation prompts
