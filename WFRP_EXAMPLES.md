# WFRP Enhancement Examples - Before & After

This document shows specific before/after examples of the WFRP enhancements to help understand the improvements.

---

## Quest Creation Tool

### Before:
```
description: 'Create a new quest journal entry with AI-generated content based on natural language description'

questTitle: 'The title of the quest'
questDescription: 'Detailed description of what the quest should accomplish'
location: 'Where the quest takes place (optional)'
```

### After:
```
description: 'Create a new quest journal entry with AI-generated content based on natural language description. 
Examples: "Investigate cultists in Ubersreik" (WFRP), "Recover a lost heirloom from the sewers" (WFRP), 
"Investigate missing villagers in Phandalin" (D&D)'

questTitle: 'The title of the quest (e.g., "The Cult of the Purple Hand", "Lost in the Old World", 
"Missing Merchant Caravan")'

questDescription: 'Detailed description of what the quest should accomplish. 
For WFRP: consider Chaos cults, Skaven activity, political intrigue, or Old World dangers. 
For D&D: dungeons, monsters, magic artifacts'

location: 'Where the quest takes place (e.g., "Altdorf sewers", "The Reikwald", "Ubersreik", 
"Neverwinter", "Waterdeep")'
```

**Impact:** Users now see concrete examples of WFRP quests and understand the types of content appropriate for the system.

---

## Dice Roll Tool

### Before:
```
description: 'Request dice rolls from players with interactive buttons...'

rollType: 'Type of roll to request (ability, skill, save, attack, initiative, custom)'
enum: ['ability', 'skill', 'save', 'attack', 'initiative', 'custom']

rollTarget: 'Target for the roll - can be ability name (str, dex, con, int, wis, cha), 
skill name (perception, insight, stealth, etc.), or custom roll formula'

rollModifier: 'Optional modifier to add to the roll (e.g., "+2", "-1", "+1d4")'
```

### After:
```
description: 'Request dice rolls from players with interactive buttons. Creates roll buttons in 
Foundry chat that players can click. Supports both D&D 5e (d20 system) and WFRP 4e (d100 system). 
Examples: "Roll Weapon Skill for Hans" (WFRP), "Test Willpower against fear" (WFRP), 
"Roll stealth for Clark" (D&D), "Make a perception check" (D&D)...'

rollType: 'Type of roll to request. D&D: ability, skill, save, attack, initiative. 
WFRP: characteristic (for WS/BS/S/T/I/Ag/Dex/Int/WP/Fel tests), skill (for WFRP skills like 
Melee/Ranged/Channelling), custom'
enum: ['ability', 'characteristic', 'skill', 'save', 'attack', 'initiative', 'custom']

rollTarget: 'Target for the roll. D&D: ability name (str, dex, con, int, wis, cha), 
skill name (perception, insight, stealth, etc.). WFRP: characteristic code (ws, bs, s, t, i, ag, 
dex, int, wp, fel) or skill name (melee, ranged, channelling, charm, etc.), or custom roll formula 
(e.g., "1d100<=50")'

rollModifier: 'Optional modifier to add to the roll. D&D: "+2", "-1", "+1d4". 
WFRP: "+10", "-20" (modifies target number for d100 rolls)'
```

**Impact:** 
- Added `characteristic` rollType for WFRP tests
- Clear examples showing d100 rolls for WFRP
- Explains how modifiers work differently in each system

---

## Map Generation Tool

### Before:
```
description: 'Start AI map generation using fantasy battlemap style (async). 
Supports maps for D&D, WFRP, and other fantasy RPG systems.'

prompt: 'Map description (will be enhanced with "2d fantasy battlemap" trigger and top-down perspective)'

scene_name: 'Short, creative name for the Foundry scene (e.g., "Harbor District", "Moonlit Tavern", 
"Crystal Caverns", "Altdorf Market"). Be creative and evocative!'
```

### After:
```
description: 'Start AI map generation using fantasy battlemap style (async). 
Supports maps for D&D, WFRP, and other fantasy RPG systems. Examples: "Altdorf market square with 
merchant stalls" (WFRP), "Reikwald forest clearing with ancient standing stones" (WFRP), 
"Tavern interior with fireplace" (Universal), "Underground sewer tunnels" (Universal).'

prompt: 'Map description (will be enhanced with "2d fantasy battlemap" trigger and top-down perspective). 
For WFRP: consider Old World architecture, grim & perilous atmosphere. 
For D&D: classic fantasy dungeons, taverns, wilderness.'

scene_name: 'Short, creative name for the Foundry scene. 
WFRP examples: "Altdorf Market", "The Reikwald", "Ubersreik Gate", "Temple of Sigmar". 
D&D examples: "Harbor District", "Moonlit Tavern", "Crystal Caverns". 
Be creative and evocative!'
```

**Impact:** Users now see complete map prompt examples and understand how to craft WFRP-appropriate atmospheric descriptions.

---

## Compendium Search Tool

### Before:
```
description: 'Search query to find items in compendiums (searches names and descriptions). 
TIP: For creature discovery, use broad terms like "knight", "warrior", "beast" or even "*" 
and rely primarily on filters for specificity.'
```

### After:
```
description: 'Search query to find items in compendiums (searches names and descriptions). 
TIP: For creature discovery, use broad terms like "knight", "warrior", "beast", "beastman", 
"daemon", "greenskin" or even "*" and rely primarily on filters for specificity.'
```

**Impact:** Simple but effective - adds WFRP creature types to the search tips.

---

## Campaign Management Tool

### Before:
```
campaignTitle: 'Title of the campaign (e.g., "The Whisperstone Conspiracy")'

campaignDescription: 'Brief description of the campaign theme and scope'

defaultLocation: 'Default campaign location/setting (optional)'
```

### After:
```
campaignTitle: 'Title of the campaign. Examples: "The Whisperstone Conspiracy" (D&D), 
"Shadows over Bögenhafen" (WFRP), "Enemy Within Campaign" (WFRP), "Curse of Strahd" (D&D)'

campaignDescription: 'Brief description of the campaign theme and scope. 
For WFRP: consider grim & perilous themes, Old World politics, Chaos corruption. 
For D&D: classic fantasy themes, dungeons, epic quests.'

defaultLocation: 'Default campaign location/setting. Examples: "The Reikland" (WFRP), 
"Altdorf and surrounding provinces" (WFRP), "Sword Coast" (D&D), "Waterdeep" (D&D)'
```

**Impact:** Users can now reference famous WFRP campaigns and understand appropriate themes for the system.

---

## Scene Tools

### Before:
```
'get-world-info': 'Get basic information about the Foundry world and system'
```

### After:
```
'get-world-info': 'Get basic information about the Foundry world and game system 
(e.g., D&D 5e, WFRP 4e). Use this to understand what system is being used and tailor 
responses accordingly.'
```

**Impact:** Makes it clear that Claude can detect which system is being used and adapt.

---

## Key Improvements Summary

1. **Concrete Examples**: Every tool now has WFRP-specific examples
2. **System-Specific Guidance**: Prompts explain what works well for each system
3. **WFRP Terminology**: Uses authentic WFRP terms (Reikland, Altdorf, Chaos, Skaven, etc.)
4. **Dual-System Clarity**: Always shows both D&D and WFRP usage side-by-side
5. **Atmospheric Guidance**: Helps users create appropriate content for the "grim & perilous" WFRP setting

## Usage Pattern Changes

### Before (Generic):
```
User: "Create a quest about investigating a cult"
Claude: Uses generic fantasy tropes
```

### After (System-Aware):
```
User: "Create a quest about investigating a cult"
Claude: Detects WFRP system, uses:
- Cult of the Purple Hand or other Chaos references
- Old World locations (Ubersreik, Altdorf)
- Appropriate tone (grim, perilous, morally grey)
- WFRP-specific rewards and consequences
```

The enhancements make Claude much more immersive and accurate when working with WFRP campaigns!
