# Foundry VTT MCP Server Testing Guide

## 🎯 Testing Overview

This document provides comprehensive test cases for all MCP tools integrated with Foundry VTT and Claude Desktop. Each tool category includes specific test scenarios, expected outcomes, and troubleshooting checkpoints.

**Date Created**: October 3, 2025  
**System**: WFRP4e (Warhammer Fantasy Roleplay 4th Edition)  
**Testing Environment**: Foundry VTT + Claude Desktop + MCP Server

---

## 📋 Pre-Testing Checklist

Before starting tests, verify:

- [ ] Foundry VTT is running (default port 30000)
- [ ] WFRP4e system is installed and active
- [ ] MCP Server is running and connected to Claude Desktop
- [ ] Test world has at least one test character created
- [ ] Claude Desktop shows MCP server connection (check status icon)
- [ ] Browser console is open for debugging (F12 in Foundry)

**Test Character Requirements**:
- Create a character named "Test Character" or similar
- Character should have basic stats (characteristics, skills, talents)
- Character should have some inventory items
- Note the exact character name for testing

---

## 🧪 Tool Categories and Test Cases

## 1. CHARACTER TOOLS

### Tool: `foundry-get-character-info`

**Purpose**: Retrieve complete character information including stats, skills, items, conditions.

#### Test Case 1.1: Basic Character Retrieval
```
Prompt: "Get me the information for Test Character"
```
**Expected Result**:
- Character name displayed
- All characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
- Current wounds, fortune, fate
- Skills list with advances
- Talents list
- Items/inventory
- Current conditions (if any)

**Success Criteria**: ✅ All character data returned in structured format

**Failure Indicators**: 
- ❌ "Character not found" - Check character name spelling
- ❌ Partial data - Check Foundry permissions
- ❌ Error message - Check MCP server logs

---

#### Test Case 1.2: Non-Existent Character
```
Prompt: "Get me the information for NonExistentCharacter123"
```
**Expected Result**: Error message stating character not found

**Success Criteria**: ✅ Clear error message returned

---

### Tool: `foundry-update-character-info`

**Purpose**: Update character characteristics, wounds, and basic stats.

#### Test Case 1.3: Update Single Characteristic
```
Prompt: "Update Test Character's Strength to 40"
```
**Expected Result**:
- Confirmation message
- Strength characteristic updated to 40
- Verify in Foundry VTT character sheet

**Success Criteria**: ✅ Characteristic visible in Foundry at new value

---

#### Test Case 1.4: Update Multiple Stats
```
Prompt: "Update Test Character: set current wounds to 10, fortune to 2, fate to 1"
```
**Expected Result**:
- All three values updated
- Confirmation for each change

**Success Criteria**: ✅ All values match in Foundry VTT

---

#### Test Case 1.5: Invalid Stat Update
```
Prompt: "Set Test Character's Strength to 999"
```
**Expected Result**: 
- Warning about unrealistic value OR
- Value capped at maximum (100 for WFRP4e)

**Success Criteria**: ✅ System handles extreme values appropriately

---

## 2. CAREER ADVANCEMENT TOOLS

### Tool: `foundry-advance-career`

**Purpose**: Handle career progression and experience spending.

#### Test Case 2.1: Advance Characteristic
```
Prompt: "Advance Test Character's Weapon Skill characteristic in their current career"
```
**Expected Result**:
- XP cost calculated (25 XP for in-career advance)
- XP deducted from character
- Characteristic increased by 1
- Confirmation message with new value

**Success Criteria**: ✅ XP spent, stat increased, recorded in Foundry

---

#### Test Case 2.2: Advance Skill
```
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- XP cost shown (5 XP for +1 advance)
- Skill advances increased by 1
- New skill value calculated

**Success Criteria**: ✅ Skill advances visible in character sheet

---

#### Test Case 2.3: Insufficient XP
```
Prompt: "Advance Test Character's Strength 10 times"
```
**Expected Result**: 
- Error message about insufficient XP
- No changes made to character

**Success Criteria**: ✅ System prevents invalid advancement

---

#### Test Case 2.4: Career Change
```
Prompt: "Change Test Character's career to Soldier"
```
**Expected Result**:
- Career updated on character sheet
- Career level set appropriately
- Status/tier updated if applicable

**Success Criteria**: ✅ New career visible in Foundry

---

## 3. CORRUPTION & MUTATION TOOLS

### Tool: `foundry-add-corruption`

**Purpose**: Add corruption points to characters.

#### Test Case 3.1: Add Minor Corruption
```
Prompt: "Add 1 corruption point to Test Character because they witnessed dark magic"
```
**Expected Result**:
- Corruption points increased by 1
- Reason logged (if system supports)
- Confirmation message

**Success Criteria**: ✅ Corruption visible on character sheet

---

#### Test Case 3.2: Check Mutation Threshold
```
Prompt: "Add 5 corruption points to Test Character"
```
**Expected Result**:
- If corruption reaches threshold (typically multiples of Toughness Bonus):
  - Mutation roll suggested or triggered
  - Warning message displayed

**Success Criteria**: ✅ System warns about mutation thresholds

---

### Tool: `foundry-add-mutation`

#### Test Case 3.3: Add Specific Mutation
```
Prompt: "Add the mutation 'Animalistic Legs' to Test Character"
```
**Expected Result**:
- Mutation added to character
- Mental or physical classification set
- Description/effects noted

**Success Criteria**: ✅ Mutation appears in character mutations list

---

### Tool: `foundry-remove-corruption`

#### Test Case 3.4: Remove Corruption
```
Prompt: "Remove 2 corruption points from Test Character"
```
**Expected Result**:
- Corruption reduced by 2
- Cannot go below 0
- Confirmation message

**Success Criteria**: ✅ Corruption value decreases appropriately

---

## 4. FORTUNE & FATE TOOLS

### Tool: `foundry-add-fortune-point`

#### Test Case 4.1: Add Fortune Point
```
Prompt: "Give Test Character 1 fortune point"
```
**Expected Result**:
- Fortune points increased by 1
- Cannot exceed maximum (based on Fate value)
- Confirmation message

**Success Criteria**: ✅ Fortune visible on character sheet

---

### Tool: `foundry-spend-fortune-point`

#### Test Case 4.2: Spend Fortune Point
```
Prompt: "Test Character spends a fortune point to reroll a failed test"
```
**Expected Result**:
- Fortune points decreased by 1
- Cannot go below 0
- Reason logged

**Success Criteria**: ✅ Fortune reduced by 1

---

### Tool: `foundry-add-fate-point`

#### Test Case 4.3: Add Fate Point (Rare)
```
Prompt: "Increase Test Character's fate by 1 for their heroic deed"
```
**Expected Result**:
- Fate permanently increased
- Fortune maximum also increases
- Significant confirmation message

**Success Criteria**: ✅ Both Fate and max Fortune increase

---

### Tool: `foundry-spend-fate-point`

#### Test Case 4.4: Burn Fate Point
```
Prompt: "Test Character burns a fate point to survive certain death"
```
**Expected Result**:
- Fate permanently reduced by 1
- Fortune maximum also reduces
- Dramatic confirmation message

**Success Criteria**: ✅ Permanent reduction recorded

---

## 5. CRITICAL WOUNDS TOOLS

### Tool: `foundry-add-critical-wound`

#### Test Case 5.1: Add Head Critical
```
Prompt: "Test Character takes a critical wound to the head with value 35"
```
**Expected Result**:
- Critical wound item created
- Type: 'critical' (not 'injury')
- Location: head
- Severity/value: 35
- Description from WFRP4e critical tables

**Success Criteria**: ✅ Critical wound appears in Foundry with correct details

---

#### Test Case 5.2: Add Multiple Criticals
```
Prompt: "Test Character takes arm critical value 22 and leg critical value 41"
```
**Expected Result**:
- Two separate critical wound items created
- Each with correct location and severity
- Both visible on character

**Success Criteria**: ✅ Both criticals tracked independently

---

### Tool: `foundry-heal-critical-wound`

#### Test Case 5.3: Heal Critical Wound
```
Prompt: "Heal Test Character's head critical wound"
```
**Expected Result**:
- Critical wound removed from character
- Confirmation of healing
- Location specified in message

**Success Criteria**: ✅ Critical wound no longer appears on sheet

---

## 6. ADVANTAGE TRACKER TOOLS

### Tool: `foundry-add-advantage`

#### Test Case 6.1: Add Advantage
```
Prompt: "Give Test Character 2 advantage"
```
**Expected Result**:
- Advantage increased by 2
- Maximum is usually 10 (or Intelligence Bonus)
- Current advantage value shown

**Success Criteria**: ✅ Advantage visible in combat tracker or character sheet

---

### Tool: `foundry-remove-advantage`

#### Test Case 6.2: Remove Advantage
```
Prompt: "Test Character loses 1 advantage"
```
**Expected Result**:
- Advantage decreased by 1
- Cannot go below 0
- Confirmation message

**Success Criteria**: ✅ Advantage reduced appropriately

---

### Tool: `foundry-reset-advantage`

#### Test Case 6.3: Reset Advantage
```
Prompt: "Reset all advantage for Test Character"
```
**Expected Result**:
- Advantage set to 0
- Typically used at end of combat

**Success Criteria**: ✅ Advantage reset to 0

---

## 7. DISEASE & INFECTION TOOLS

### Tool: `foundry-add-disease`

#### Test Case 7.1: Add Named Disease
```
Prompt: "Test Character contracts The Black Plague"
```
**Expected Result**:
- Disease item added to character
- Type: disease
- Name: The Black Plague
- Duration, incubation, symptoms tracked

**Success Criteria**: ✅ Disease appears in character effects/items

---

#### Test Case 7.2: Add Custom Disease
```
Prompt: "Test Character gets a disease called 'Swamp Fever' with duration 1d10 days, symptoms: fever and weakness"
```
**Expected Result**:
- Custom disease created
- All details recorded
- Added to character

**Success Criteria**: ✅ Custom disease with all details visible

---

### Tool: `foundry-remove-disease`

#### Test Case 7.3: Cure Disease
```
Prompt: "Cure Test Character of The Black Plague"
```
**Expected Result**:
- Disease removed from character
- Confirmation message
- Character no longer shows disease effects

**Success Criteria**: ✅ Disease removed from character sheet

---

## 8. INVENTORY MANAGEMENT TOOLS

### Tool: `foundry-add-item`

#### Test Case 8.1: Add Simple Item
```
Prompt: "Add a rope (10 yards) to Test Character's inventory"
```
**Expected Result**:
- Item created or found in compendium
- Added to character inventory
- Encumbrance updated
- Quantity set to 1

**Success Criteria**: ✅ Item visible in inventory tab

---

#### Test Case 8.2: Add Item with Quantity
```
Prompt: "Give Test Character 50 gold crowns"
```
**Expected Result**:
- Money item added
- Quantity: 50
- Encumbrance calculated
- Total wealth updated

**Success Criteria**: ✅ Gold visible in currency section

---

### Tool: `foundry-remove-item`

#### Test Case 8.3: Remove Item
```
Prompt: "Remove the rope from Test Character"
```
**Expected Result**:
- Item removed from inventory
- Encumbrance reduced
- Confirmation message

**Success Criteria**: ✅ Item no longer in inventory

---

#### Test Case 8.4: Reduce Item Quantity
```
Prompt: "Test Character spends 10 gold crowns"
```
**Expected Result**:
- Gold quantity reduced by 10
- Item remains if quantity > 0
- Item removed if quantity reaches 0

**Success Criteria**: ✅ Gold quantity updated correctly

---

### Tool: `foundry-update-item-quantity`

#### Test Case 8.5: Update Ammunition
```
Prompt: "Set Test Character's arrows to 15"
```
**Expected Result**:
- Arrow quantity set to exactly 15
- Encumbrance recalculated

**Success Criteria**: ✅ Arrow count shows 15

---

### Tool: `foundry-equip-item`

#### Test Case 8.6: Equip Weapon
```
Prompt: "Test Character equips their hand weapon"
```
**Expected Result**:
- Weapon marked as equipped
- Visible in equipped weapons section
- Ready for combat

**Success Criteria**: ✅ Weapon shows as equipped in Foundry

---

### Tool: `foundry-unequip-item`

#### Test Case 8.7: Unequip Item
```
Prompt: "Test Character unequips their hand weapon"
```
**Expected Result**:
- Weapon marked as unequipped
- Still in inventory
- No longer in equipped section

**Success Criteria**: ✅ Weapon shows as unequipped

---

## 9. ITEM CREATOR TOOLS

### Tool: `foundry-create-weapon-melee`

#### Test Case 9.1: Create Basic Melee Weapon
```
Prompt: "Create a melee weapon called 'Iron Longsword' for Test Character. Weapon group: basic, damage: SB+4, reach: average, encumbrance: 1, qualities: none, flaws: none"
```
**Expected Result**:
- Weapon item created
- Type: weapon (melee)
- All stats set correctly
- Added to character inventory
- Formatted response showing weapon stats

**Success Criteria**: ✅ Weapon appears in inventory with all correct properties

---

#### Test Case 9.2: Create Weapon with Qualities
```
Prompt: "Create a melee weapon 'Elven Rapier': group fencing, damage SB+3, reach average, encumbrance 0.5, qualities: Fast, Precise"
```
**Expected Result**:
- Weapon created with qualities
- system.properties.qualities contains Fast and Precise
- Qualities visible in weapon details

**Success Criteria**: ✅ Qualities properly attached and visible

---

### Tool: `foundry-create-weapon-ranged`

#### Test Case 9.3: Create Ranged Weapon
```
Prompt: "Create a ranged weapon 'Hunting Bow': group bow, damage 4, range 24, encumbrance 1, qualities: none"
```
**Expected Result**:
- Ranged weapon created
- Range value set to 24 yards
- Ammunition type: bow
- Damage not dependent on SB

**Success Criteria**: ✅ Ranged weapon with correct range and damage

---

#### Test Case 9.4: Create Weapon with Flaws
```
Prompt: "Create a melee weapon 'Rusty Sword': group basic, damage SB+3, reach average, encumbrance 1, flaws: Unreliable"
```
**Expected Result**:
- Weapon created with flaw
- system.properties.flaws contains Unreliable
- Flaw visible in weapon details

**Success Criteria**: ✅ Flaw properly tracked

---

### Tool: `foundry-create-armour`

#### Test Case 9.5: Create Full Plate Armor
```
Prompt: "Create armour 'Knight's Plate' for Test Character: type plate, locations head:2 body:5 lArm:3 rArm:3 lLeg:3 rLeg:3, encumbrance 8, qualities: none"
```
**Expected Result**:
- Armor item created
- Type: armour
- AP values set for all locations
- Total encumbrance: 8
- system.APDetails contains all location values

**Success Criteria**: ✅ Armor with correct AP per location visible

---

#### Test Case 9.6: Create Partial Armor
```
Prompt: "Create armour 'Leather Cap': type softLeather, locations head:1, encumbrance 0.1"
```
**Expected Result**:
- Armor created covering only head
- Other locations remain at 0 AP
- Lightweight armor

**Success Criteria**: ✅ Only specified location has AP value

---

### Tool: `foundry-create-trapping`

#### Test Case 9.7: Create Basic Trapping
```
Prompt: "Create a trapping 'Healing Poultice' for Test Character: type drugsPoisonsHerbsDraughts, encumbrance 0.1, quantity 3, description: Heals 1d10 wounds when applied"
```
**Expected Result**:
- Trapping item created
- Category: drugsPoisonsHerbsDraughts
- Quantity: 3
- Description included

**Success Criteria**: ✅ Trapping with description visible in inventory

---

#### Test Case 9.8: Create Trade Tools
```
Prompt: "Create 'Blacksmith Tools': type tradeTools, encumbrance 3, quantity 1, description: Required for Trade (Blacksmith) tests"
```
**Expected Result**:
- Tools created
- Category: tradeTools
- Heavy encumbrance

**Success Criteria**: ✅ Trade tools in inventory

---

### Tool: `foundry-create-ammunition`

#### Test Case 9.9: Create Arrows
```
Prompt: "Create ammunition 'Broadhead Arrows' for Test Character: type bow, quantity 20, encumbrance 0.1, description: High quality hunting arrows"
```
**Expected Result**:
- Ammunition item created
- Type: bow (matches bow weapons)
- Quantity: 20
- Description included

**Success Criteria**: ✅ Ammunition stackable and usable with bow weapons

---

#### Test Case 9.10: Create Bullets
```
Prompt: "Create ammunition 'Lead Bullets': type BPandEng, quantity 10, encumbrance 0.05"
```
**Expected Result**:
- Ammunition for blackpowder/engineering weapons
- Quantity tracked
- Low encumbrance per bullet

**Success Criteria**: ✅ Correct ammunition type for firearms

---

### Tool: `foundry-create-container`

#### Test Case 9.11: Create Backpack
```
Prompt: "Create container 'Large Backpack' for Test Character: capacity 20, encumbrance 0.5, description: Sturdy leather backpack"
```
**Expected Result**:
- Container item created
- Capacity: 20 Enc
- Own weight: 0.5 Enc
- Can store items inside (if Foundry supports)

**Success Criteria**: ✅ Container in inventory with capacity listed

---

### Tool: `foundry-modify-item-qualities`

#### Test Case 9.12: Add Quality to Existing Item
```
Prompt: "Add the 'Durable' quality to Test Character's Iron Longsword"
```
**Expected Result**:
- Existing weapon found
- Quality added to properties.qualities
- Confirmation of addition
- Quality visible in weapon details

**Success Criteria**: ✅ Quality added without overwriting existing properties

---

#### Test Case 9.13: Remove Flaw from Item
```
Prompt: "Remove the 'Unreliable' flaw from Test Character's Rusty Sword"
```
**Expected Result**:
- Flaw removed from properties.flaws
- Other properties unchanged
- Confirmation message

**Success Criteria**: ✅ Flaw removed successfully

---

#### Test Case 9.14: Add Multiple Qualities and Flaws
```
Prompt: "For Test Character's Iron Longsword: add qualities 'Balanced' and 'Fine', add flaw 'Heavy'"
```
**Expected Result**:
- Both qualities added
- Flaw added
- All modifications in one operation
- Complete listing of changes

**Success Criteria**: ✅ All modifications applied correctly

---

### Tool: `foundry-add-item-to-character`

#### Test Case 9.15: Add from Compendium
```
Prompt: "Add a 'Hand Weapon' from the compendium to Test Character, quantity 1"
```
**Expected Result**:
- Compendium searched for "Hand Weapon"
- Item found and copied
- Added to character inventory
- All stats from compendium preserved

**Success Criteria**: ✅ Compendium item successfully added

---

#### Test Case 9.16: Add and Equip from Compendium
```
Prompt: "Add 'Leather Jack' armor from compendium to Test Character and equip it"
```
**Expected Result**:
- Armor found in compendium
- Added to character
- Automatically equipped
- system.worn.value set to true

**Success Criteria**: ✅ Item added and equipped in one operation

---

### Tool: `foundry-remove-item-from-character`

#### Test Case 9.17: Remove Entire Item
```
Prompt: "Remove the 'Iron Longsword' from Test Character completely"
```
**Expected Result**:
- Item deleted from inventory
- Encumbrance reduced
- Item no longer visible

**Success Criteria**: ✅ Item completely removed

---

#### Test Case 9.18: Reduce Item Quantity
```
Prompt: "Remove 5 arrows from Test Character's Broadhead Arrows"
```
**Expected Result**:
- Arrow quantity reduced by 5
- Item remains with new quantity (15 if started with 20)
- Encumbrance adjusted proportionally

**Success Criteria**: ✅ Quantity reduced, item remains

---

## 10. PRAYER & BLESSING TOOLS

### Tool: `foundry-add-prayer`

#### Test Case 10.1: Add Divine Prayer
```
Prompt: "Add the prayer 'Blessing of Battle' to Test Character"
```
**Expected Result**:
- Prayer item added
- Type: prayer
- Target number and range set
- CN (Casting Number) specified

**Success Criteria**: ✅ Prayer visible in prayers section

---

#### Test Case 10.2: Add Custom Prayer
```
Prompt: "Create a custom prayer 'Sigmar's Shield' for Test Character: Range 6 yards, Target 1, Duration 6 rounds, Effect: Target gains +10 to all Tests to resist fear"
```
**Expected Result**:
- Custom prayer created
- All parameters set
- Description included

**Success Criteria**: ✅ Custom prayer with full details

---

### Tool: `foundry-add-blessing`

#### Test Case 10.3: Add Blessing
```
Prompt: "Give Test Character the blessing 'Fearless'"
```
**Expected Result**:
- Blessing item added
- Type: blessing
- Permanent effect
- Description of benefit

**Success Criteria**: ✅ Blessing tracked on character

---

## 11. SPELL & MAGIC TOOLS

### Tool: `foundry-add-spell`

#### Test Case 11.1: Add Petty Spell
```
Prompt: "Add the petty spell 'Magic Dart' to Test Character"
```
**Expected Result**:
- Spell item added
- Lore: petty
- CN (Casting Number) set
- Range, target, duration specified

**Success Criteria**: ✅ Spell in character's spell list

---

#### Test Case 11.2: Add Lore Spell
```
Prompt: "Add 'Fireball' spell from Lore of Fire to Test Character"
```
**Expected Result**:
- Spell added
- Lore: fire (lowercase in system)
- Higher CN than petty spells
- Description includes damage and effects

**Success Criteria**: ✅ Lore spell with correct lore association

---

#### Test Case 11.3: Verify All Lores Available
Test each of the 17 magic lores:
```
Prompts (test each):
- "Add a spell from Lore of Beasts"
- "Add a spell from Lore of Death"
- "Add a spell from Lore of Fire"
- "Add a spell from Lore of Heavens"
- "Add a spell from Lore of Life"
- "Add a spell from Lore of Light"
- "Add a spell from Lore of Metal"
- "Add a spell from Lore of Shadow"
- "Add a spell from Lore of Daemonology"
- "Add a spell from Lore of Necromancy"
- "Add a spell from Lore of Hedgecraft"
- "Add a spell from Lore of Witchcraft"
- "Add a spell from Lore of Tzeentch"
- "Add a spell from Lore of Nurgle"
- "Add a spell from Lore of Slaanesh"
- "Add a spell from Lore of Great Maw"
- "Add a spell from Lore of Little Waaagh"
```
**Expected Result**: All lores recognized and spells added correctly

**Success Criteria**: ✅ All 17 lores work without errors

---

### Tool: `foundry-cast-spell`

#### Test Case 11.4: Cast Simple Spell
```
Prompt: "Test Character casts Magic Dart with a Channelling test result of 45"
```
**Expected Result**:
- Spell casting recorded
- Success/failure based on CN and result
- Effects applied if successful
- SL (Success Level) calculated

**Success Criteria**: ✅ Spell cast resolved with correct outcome

---

#### Test Case 11.5: Cast with Critical Success
```
Prompt: "Test Character casts Fireball and rolls a critical success (double digits match)"
```
**Expected Result**:
- Critical success recognized
- Enhanced effects (if applicable)
- No miscasts

**Success Criteria**: ✅ Critical success benefits applied

---

#### Test Case 11.6: Miscast
```
Prompt: "Test Character fails their Channelling test for Fireball by 3 SL"
```
**Expected Result**:
- Miscast occurs
- Minor miscast table rolled (or suggested)
- Negative effects described

**Success Criteria**: ✅ Miscast handled appropriately

---

## 12. SOCIAL STATUS TOOLS

### Tool: `foundry-update-social-status`

#### Test Case 12.1: Increase Status
```
Prompt: "Increase Test Character's social status tier from Brass to Silver"
```
**Expected Result**:
- Status tier updated
- Standing within tier set (usually 1)
- Status implications noted

**Success Criteria**: ✅ New status visible on character sheet

---

#### Test Case 12.2: Change Standing
```
Prompt: "Set Test Character's status standing to 3 within their current tier"
```
**Expected Result**:
- Standing value updated
- Tier remains same
- Confirmation message

**Success Criteria**: ✅ Standing updated independently of tier

---

## 13. CUSTOM NPC GENERATOR TOOLS

### Tool: `foundry-generate-npc`

#### Test Case 13.1: Generate Random NPC
```
Prompt: "Generate a random NPC - a human townsperson"
```
**Expected Result**:
- New actor created
- Random name generated
- Random characteristics
- Random species/career if applicable
- Basic skills assigned

**Success Criteria**: ✅ NPC appears in actors directory

---

#### Test Case 13.2: Generate NPC with Template
```
Prompt: "Generate a Bretonnian Knight NPC with above-average combat stats"
```
**Expected Result**:
- NPC created with appropriate species
- Combat characteristics higher than average
- Knight-appropriate career
- Noble status tier

**Success Criteria**: ✅ NPC matches requested template

---

#### Test Case 13.3: Generate Enemy NPC
```
Prompt: "Generate an enemy NPC: Chaos Marauder with 30 wounds, WS 45, S 40"
```
**Expected Result**:
- Enemy actor created
- Specified stats set
- Appropriate weapons/armor
- Creature type or career set

**Success Criteria**: ✅ Combat-ready enemy NPC created

---

## 14. COMPENDIUM TOOLS

### Tool: `foundry-search-compendium`

#### Test Case 14.1: Search for Item
```
Prompt: "Search the compendium for 'hand weapon'"
```
**Expected Result**:
- List of matching items
- Item types specified
- Sources noted (which compendium)
- Multiple results if available

**Success Criteria**: ✅ Relevant items listed

---

#### Test Case 14.2: Search for Skill
```
Prompt: "Search compendium for 'Melee' skills"
```
**Expected Result**:
- All melee-related skills listed
- Base characteristic noted
- Specializations shown

**Success Criteria**: ✅ Skills with details returned

---

#### Test Case 14.3: Search for Talent
```
Prompt: "Find the 'Warrior Born' talent in the compendium"
```
**Expected Result**:
- Talent found
- Description provided
- Requirements/tests noted
- Max ranks indicated

**Success Criteria**: ✅ Talent with full description

---

#### Test Case 14.4: Search for Spell
```
Prompt: "Search for all Fire lore spells"
```
**Expected Result**:
- All Lore of Fire spells listed
- CN values shown
- Brief descriptions

**Success Criteria**: ✅ All lore spells returned

---

### Tool: `foundry-get-compendium-item`

#### Test Case 14.5: Get Specific Item Details
```
Prompt: "Get full details for 'Sword' from the compendium"
```
**Expected Result**:
- Complete item data
- All stats, qualities, flaws
- Full description
- Ready for adding to character

**Success Criteria**: ✅ Detailed item information returned

---

## 15. SCENE TOOLS

### Tool: `foundry-create-scene`

#### Test Case 15.1: Create Basic Scene
```
Prompt: "Create a new scene called 'Tavern Interior' with 20x15 grid"
```
**Expected Result**:
- New scene created
- Grid size: 20x15
- Default background
- Scene appears in scenes directory

**Success Criteria**: ✅ Scene visible and selectable in Foundry

---

#### Test Case 15.2: Create Scene with Background
```
Prompt: "Create scene 'Forest Path' with 30x20 grid and background image from url: [provide test image url]"
```
**Expected Result**:
- Scene created with dimensions
- Background image loaded
- Image scaled to fit

**Success Criteria**: ✅ Scene displays with background

---

### Tool: `foundry-activate-scene`

#### Test Case 15.3: Switch Active Scene
```
Prompt: "Activate the 'Tavern Interior' scene"
```
**Expected Result**:
- Scene becomes active
- Players see scene (if connected)
- Canvas updates
- Tokens on scene become visible

**Success Criteria**: ✅ GM and players see new scene

---

### Tool: `foundry-add-token-to-scene`

#### Test Case 15.4: Place Character Token
```
Prompt: "Add Test Character's token to the Tavern Interior scene at position x:5, y:3"
```
**Expected Result**:
- Token appears on scene
- Position: grid coordinates 5,3
- Token image from character
- Token linked to character

**Success Criteria**: ✅ Token visible on scene at correct position

---

#### Test Case 15.5: Place Multiple Tokens
```
Prompt: "Add three Goblin tokens to the Forest Path scene at positions (10,10), (12,10), (11,8)"
```
**Expected Result**:
- Three tokens placed
- All at different positions
- Each linked to same or different actors

**Success Criteria**: ✅ All three tokens visible

---

## 16. ACTOR CREATION TOOLS

### Tool: `foundry-create-character`

#### Test Case 16.1: Create Player Character
```
Prompt: "Create a new player character named 'Aldric the Brave', human, career: Soldier"
```
**Expected Result**:
- New character actor created
- Name: Aldric the Brave
- Species: Human
- Career: Soldier
- Default stats for human
- Basic career skills

**Success Criteria**: ✅ Complete character in actors directory

---

#### Test Case 16.2: Create Character with Custom Stats
```
Prompt: "Create character 'Elara Swift', elf, career: Scout, with Agility 45, Dexterity 40, Intelligence 35"
```
**Expected Result**:
- Character created
- Species: Elf
- Specified characteristics set
- Other stats at defaults

**Success Criteria**: ✅ Character with custom stats

---

### Tool: `foundry-create-npc`

#### Test Case 16.3: Create Named NPC
```
Prompt: "Create an NPC named 'Baron von Stirling', human noble"
```
**Expected Result**:
- NPC actor created
- Name set
- Noble status
- Appropriate stats for noble

**Success Criteria**: ✅ NPC appears in actors list

---

### Tool: `foundry-create-creature`

#### Test Case 16.4: Create Monster
```
Prompt: "Create a creature 'Giant Spider', wounds 18, WS 35, S 30, T 30, with weapon 'Bite' damage 4 and 'Web' ability"
```
**Expected Result**:
- Creature actor created
- Stats set
- Weapons/abilities added
- Type: creature

**Success Criteria**: ✅ Creature ready for combat

---

## 17. QUEST CREATION TOOLS

### Tool: `foundry-create-quest`

#### Test Case 17.1: Create Simple Quest
```
Prompt: "Create a quest 'Rescue the Merchant' with description: Find and rescue the kidnapped merchant from bandits. Reward: 50 gold crowns"
```
**Expected Result**:
- Quest journal entry created
- Title and description set
- Status: not started
- Visible in journal

**Success Criteria**: ✅ Quest in journal directory

---

#### Test Case 17.2: Create Quest with Objectives
```
Prompt: "Create quest 'Clear the Dungeon' with objectives: 1. Find entrance, 2. Defeat goblin leader, 3. Recover stolen artifacts"
```
**Expected Result**:
- Quest created
- Three objectives listed
- Each objective trackable
- Progress shown (0/3 complete)

**Success Criteria**: ✅ Quest with checklist objectives

---

### Tool: `foundry-update-quest`

#### Test Case 17.3: Update Quest Status
```
Prompt: "Update 'Rescue the Merchant' quest - mark objective 'Find and rescue' as complete"
```
**Expected Result**:
- Quest updated
- Objective marked complete
- Status changes to in-progress or complete
- Timestamp recorded

**Success Criteria**: ✅ Quest shows progress

---

## 18. DICE ROLL TOOLS

### Tool: `foundry-roll-dice`

#### Test Case 18.1: Simple Roll
```
Prompt: "Roll 2d10 for a basic test"
```
**Expected Result**:
- Two d10 dice rolled
- Result shown (sum)
- Roll visible in chat

**Success Criteria**: ✅ Roll appears in Foundry chat

---

#### Test Case 18.2: Skill Test Roll
```
Prompt: "Test Character rolls a Melee (Basic) test"
```
**Expected Result**:
- Skill value found
- Test roll made (typically d100)
- Success/failure determined
- SL calculated
- Chat message with results

**Success Criteria**: ✅ Complete test result in chat

---

#### Test Case 18.3: Characteristic Test
```
Prompt: "Roll a Strength test for Test Character"
```
**Expected Result**:
- Strength value retrieved
- d100 rolled
- Compared to characteristic
- Success/failure and SL shown

**Success Criteria**: ✅ Characteristic test resolved

---

#### Test Case 18.4: Damage Roll
```
Prompt: "Roll damage for Test Character's hand weapon attack"
```
**Expected Result**:
- Weapon damage found
- SB (Strength Bonus) added
- Roll made (e.g., SB+4)
- Total damage shown
- Chat message created

**Success Criteria**: ✅ Damage roll with bonus calculated

---

#### Test Case 18.5: Custom Formula Roll
```
Prompt: "Roll 3d10 + 5 for Test Character"
```
**Expected Result**:
- Formula parsed
- Roll executed
- Result calculated
- Chat shows roll breakdown

**Success Criteria**: ✅ Custom formula works

---

## 19. CAMPAIGN MANAGEMENT TOOLS

### Tool: `foundry-create-campaign-note`

#### Test Case 19.1: Create Session Note
```
Prompt: "Create campaign note: Session 5 - The party arrived in Altdorf and met with the magistrate"
```
**Expected Result**:
- Journal entry created
- Title: Session 5
- Content stored
- Timestamp added

**Success Criteria**: ✅ Note in journal

---

### Tool: `foundry-update-campaign-status`

#### Test Case 19.2: Update Campaign Progress
```
Prompt: "Update campaign status: Act 2 - Investigation Phase"
```
**Expected Result**:
- Campaign setting or flag updated
- Status visible to GM
- Possibly shared with players

**Success Criteria**: ✅ Status updated and visible

---

## 20. OWNERSHIP TOOLS

### Tool: `foundry-set-ownership`

#### Test Case 20.1: Give Player Ownership
```
Prompt: "Give player 'PlayerName' ownership of Test Character"
```
**Expected Result**:
- Character ownership updated
- Player can now control character
- Player sees character sheet
- Permissions: owner level

**Success Criteria**: ✅ Player has full control

---

#### Test Case 20.2: Set Limited Ownership
```
Prompt: "Give player 'PlayerName' observer access to Baron von Stirling NPC"
```
**Expected Result**:
- NPC visible to player
- Limited interaction (read-only)
- Player cannot edit

**Success Criteria**: ✅ Player sees but cannot edit

---

#### Test Case 20.3: Remove Ownership
```
Prompt: "Remove all player permissions from Test Character"
```
**Expected Result**:
- Ownership reverted to GM only
- Player can no longer see character
- Permissions: none

**Success Criteria**: ✅ Character hidden from player

---

## 21. MAP GENERATION TOOLS

### Tool: `foundry-generate-map`

#### Test Case 21.1: Generate Random Dungeon
```
Prompt: "Generate a random dungeon map, 40x30 grid, 5 rooms, cave theme"
```
**Expected Result**:
- Scene created with map
- Drawing tools used for walls/rooms
- 5 distinct rooms
- Cave-style layout
- Walls block vision

**Success Criteria**: ✅ Functional dungeon map created

---

#### Test Case 21.2: Generate Town Map
```
Prompt: "Generate a small town map with 10 buildings, roads, and a central square"
```
**Expected Result**:
- Town layout created
- Buildings placed
- Roads connecting areas
- Central square identifiable

**Success Criteria**: ✅ Town map layout functional

---

## 22. ROLLTABLE MANAGEMENT TOOLS

### Tool: `foundry-create-rolltable`

#### Test Case 22.1: Create Simple Rolltable
```
Prompt: "Create a roll table 'Random Encounters' with entries: 1. Bandits, 2. Wolves, 3. Travelling Merchant, 4. Nothing"
```
**Expected Result**:
- Rolltable created
- Name: Random Encounters
- Four entries
- Equal weights (or specified)

**Success Criteria**: ✅ Rolltable in tables directory

---

#### Test Case 22.2: Create Weighted Rolltable
```
Prompt: "Create rolltable 'Loot Table' with: Common Items (weight 50), Uncommon Items (weight 30), Rare Items (weight 15), Legendary Items (weight 5)"
```
**Expected Result**:
- Rolltable created
- Weights assigned
- More likely to roll common items

**Success Criteria**: ✅ Weighted rolls work correctly

---

### Tool: `foundry-roll-on-table`

#### Test Case 22.3: Roll on Table
```
Prompt: "Roll on the Random Encounters table"
```
**Expected Result**:
- Table rolled
- Result selected based on weights
- Result shown in chat
- Entry description displayed

**Success Criteria**: ✅ Result appears in chat

---

#### Test Case 22.4: Roll Multiple Times
```
Prompt: "Roll 3 times on the Loot Table"
```
**Expected Result**:
- Three separate rolls
- Three results shown
- Can get duplicates
- All results in chat

**Success Criteria**: ✅ Multiple results displayed

---

## 🔍 Advanced Integration Tests

### Integration Test 1: Complete Combat Scenario
```
Scenario: Test Character enters combat
1. "Roll initiative for Test Character" (Agility test)
2. "Test Character attacks with their hand weapon" (Melee test + damage)
3. "Enemy deals 8 damage to Test Character" (update wounds)
4. "Test Character gains 1 advantage"
5. "Test Character spends fortune point to reroll failed dodge"
6. Combat ends: "Reset Test Character's advantage"
```
**Expected Flow**: All steps execute in sequence, character state updates correctly

---

### Integration Test 2: Character Progression Session
```
Scenario: End of session advancement
1. "Give Test Character 150 XP for completing the quest"
2. "Advance Test Character's Weapon Skill characteristic"
3. "Advance Test Character's Melee (Basic) skill by 2"
4. "Add the talent 'Warrior Born' to Test Character"
5. "Test Character gains 1 fortune point"
```
**Expected Flow**: XP spent correctly, character grows stronger

---

### Integration Test 3: Equipment Management Workflow
```
Scenario: Visiting the market
1. "Add 100 gold crowns to Test Character"
2. "Search compendium for 'sword'"
3. "Add 'Sword' from compendium to Test Character"
4. "Test Character spends 10 gold crowns" (remove money)
5. "Test Character equips their new Sword"
6. "Unequip Test Character's old hand weapon"
```
**Expected Flow**: Shopping experience works smoothly

---

### Integration Test 4: Magic User Session
```
Scenario: Wizard casting spells
1. "Add 'Fireball' spell from Lore of Fire to Test Character"
2. "Test Character casts Fireball with Channelling test of 52"
3. "Roll damage for Fireball: 1d10"
4. "Add 1 corruption to Test Character due to miscast"
5. "Check if Test Character needs mutation"
```
**Expected Flow**: Magic system fully functional

---

### Integration Test 5: Complex Item Creation
```
Scenario: Crafting custom equipment
1. "Create melee weapon 'Dwarf Runic Axe': group twohanded, damage SB+6, reach average, qualities: Damaging, Hack, encumbrance 2"
2. "Add quality 'Durable' to the Dwarf Runic Axe"
3. "Create armour 'Gromril Plate': type otherMetal, all locations 4 AP, encumbrance 6, qualities: Durable"
4. "Test Character equips Dwarf Runic Axe"
5. "Test Character equips Gromril Plate"
```
**Expected Flow**: Complex items created and equipped

---

### Integration Test 6: Disease and Recovery
```
Scenario: Character gets sick and recovers
1. "Test Character contracts 'Galloping Trots'"
2. "Test Character loses 5 wounds due to disease"
3. "Roll Endurance test for Test Character to resist disease progression"
4. "After 7 days, cure Test Character of Galloping Trots"
5. "Restore Test Character's wounds to maximum"
```
**Expected Flow**: Disease mechanics work properly

---

### Integration Test 7: NPC Encounter and Combat
```
Scenario: Generate enemy and fight
1. "Generate enemy NPC: Beastman with WS 40, S 40, T 40, 15 wounds"
2. "Create melee weapon 'Crude Axe' for the Beastman: damage SB+4"
3. "Create scene 'Forest Clearing' 20x20 grid"
4. "Add Test Character token at position 5,5"
5. "Add Beastman token at position 15,5"
6. "Test Character attacks Beastman with Melee (Basic) test"
```
**Expected Flow**: Complete encounter setup and execution

---

### Integration Test 8: Quest and Rewards
```
Scenario: Complete quest and receive rewards
1. "Create quest 'Slay the Beastman': Find and defeat the beastman terrorizing the village"
2. "Update quest 'Slay the Beastman' - mark as in progress"
3. [Complete combat from Integration Test 7]
4. "Update quest 'Slay the Beastman' - mark as complete"
5. "Add 50 gold crowns to Test Character as quest reward"
6. "Give Test Character 100 XP for completing quest"
```
**Expected Flow**: Quest tracking works end-to-end

---

## 🐛 Error Handling Tests

### Error Test 1: Invalid Character Name
```
Prompt: "Get information for XxInvalidCharacterxX"
```
**Expected**: Clear error message, no crash

---

### Error Test 2: Insufficient Resources
```
Prompt: "Test Character spends 10 fortune points" (when they only have 2)
```
**Expected**: Error about insufficient fortune, no change

---

### Error Test 3: Invalid Item Type
```
Prompt: "Create weapon with invalid group 'lightsaber'"
```
**Expected**: Error listing valid weapon groups

---

### Error Test 4: Missing Required Field
```
Prompt: "Create armour without specifying any locations"
```
**Expected**: Error requesting location data

---

### Error Test 5: Non-existent Compendium Item
```
Prompt: "Add 'Laser Gun' from compendium to Test Character"
```
**Expected**: Error - item not found in compendium

---

### Error Test 6: Permission Issues
```
Prompt: "Give ownership of Test Character to non-existent player"
```
**Expected**: Error - player not found

---

### Error Test 7: Invalid Spell Lore
```
Prompt: "Add spell from Lore of Invalid"
```
**Expected**: Error listing valid lores

---

### Error Test 8: Scene Doesn't Exist
```
Prompt: "Activate scene 'NonExistentScene'"
```
**Expected**: Error - scene not found

---

## 📊 Performance Tests

### Performance Test 1: Bulk Operations
```
Prompt: "Add 20 different trapping items to Test Character"
```
**Expected**: All items added, reasonable response time (<10 seconds)

---

### Performance Test 2: Large Search
```
Prompt: "Search compendium for 'sword' across all compendiums"
```
**Expected**: Complete results, manageable response time

---

### Performance Test 3: Complex Character Query
```
Prompt: "Get complete information for Test Character including all items, spells, talents, skills, and conditions"
```
**Expected**: Full data returned, structured format

---

## 📝 Documentation and Response Quality Tests

### Response Test 1: Clear Formatting
**Check that tool responses include**:
- ✅ Clear headers with emoji icons
- ✅ Structured sections
- ✅ Bullet points for lists
- ✅ Bold for important values
- ✅ Tables where appropriate

---

### Response Test 2: Error Messages
**Check that errors include**:
- ✅ What went wrong
- ✅ Why it went wrong
- ✅ How to fix it
- ✅ What valid options are (if applicable)

---

### Response Test 3: Confirmations
**Check that successful operations confirm**:
- ✅ What was done
- ✅ Current state
- ✅ Any relevant warnings
- ✅ Next steps (if applicable)

---

## 🔄 State Persistence Tests

### Persistence Test 1: Server Restart
```
Steps:
1. Make changes to Test Character (add items, update stats)
2. Restart MCP server
3. Query Test Character information
```
**Expected**: All changes persisted in Foundry, still visible

---

### Persistence Test 2: Foundry Reload
```
Steps:
1. Make changes through Claude
2. Refresh Foundry browser window
3. Check character sheet
```
**Expected**: Changes visible immediately after refresh

---

## 🎭 Real World Scenario Tests

### Scenario 1: First Session Setup
```
"I'm starting a new WFRP campaign. Create 4 characters: a Human Soldier named Karl, a Dwarf Slayer named Gotrek, an Elf Scout named Alara, and a Human Wizard named Magnus with Lore of Fire spells."
```

---

### Scenario 2: Combat Encounter
```
"The party encounters 3 Goblins. Generate the goblins, create a combat scene, place all tokens, and roll initiative for everyone."
```

---

### Scenario 3: Shopping Trip
```
"The party visits a blacksmith. They want to buy: 2 hand weapons, 1 shield, 1 set of leather armor, and 20 arrows. Add these to Karl's inventory and deduct 25 gold crowns."
```

---

### Scenario 4: Skill Training
```
"Karl trains with the city guard for a month. Advance his Melee (Basic) by 3, Athletics by 2, and Endurance by 1. Deduct appropriate XP."
```

---

### Scenario 5: Magical Mishap
```
"Magnus fails to cast Fireball and rolls 98 on the miscast table. Add 3 corruption, roll for mutation, and create a minor curse effect."
```

---

## ✅ Test Results Template

For each test, record:

```
Test ID: [e.g., 1.1]
Test Name: [e.g., Basic Character Retrieval]
Date Tested: [date]
Tester: [name]
Claude Desktop Version: [version]
Foundry VTT Version: [version]
WFRP4e System Version: [version]

Status: [ ] Pass [ ] Fail [ ] Partial

Results:
[What happened]

Issues Found:
[Any problems encountered]

Error Messages:
[Copy any error messages]

Screenshots:
[If applicable]

Notes:
[Additional observations]
```

---

## 🚨 Critical Issues Checklist

If any of these fail, mark as **HIGH PRIORITY**:

- [ ] Cannot connect to Foundry VTT
- [ ] Cannot retrieve character information
- [ ] Cannot update character stats
- [ ] Cannot add items to inventory
- [ ] Cannot create basic items (weapons, armor)
- [ ] Cannot roll dice
- [ ] Server crashes on any command
- [ ] Data loss occurs
- [ ] Permissions bypass (security issue)

---

## 📞 Reporting Issues

When reporting issues, include:

1. **Test ID and Name**
2. **Exact prompt used**
3. **Expected result**
4. **Actual result**
5. **Error messages** (from Claude, MCP server logs, Foundry console)
6. **Character name** used for testing
7. **Foundry world name**
8. **Steps to reproduce**
9. **Frequency** (always, sometimes, once)
10. **Workaround** (if found)

---

## 🎓 Testing Tips

1. **Start Simple**: Test basic operations before complex ones
2. **Document Everything**: Keep notes of what works and what doesn't
3. **Use Consistent Test Data**: Same character name, same items
4. **Check Both Sides**: Verify in both Claude responses AND Foundry VTT
5. **Clear State**: Between tests, reset character to known state
6. **Test Edge Cases**: Empty values, maximum values, special characters
7. **Test Permissions**: Try operations with different user permissions
8. **Monitor Performance**: Note slow operations
9. **Check Logs**: Review MCP server logs and Foundry console
10. **Be Systematic**: Follow test order, don't skip sections

---

## 📈 Progress Tracking

Total Test Categories: 22  
Total Individual Tests: 150+  
Total Integration Tests: 8  
Total Error Tests: 8  
Total Performance Tests: 3  

**Testing Progress**:
- [ ] Category 1: Character Tools (7 tests)
- [ ] Category 2: Career Advancement (4 tests)
- [ ] Category 3: Corruption & Mutation (4 tests)
- [ ] Category 4: Fortune & Fate (4 tests)
- [ ] Category 5: Critical Wounds (3 tests)
- [ ] Category 6: Advantage Tracker (3 tests)
- [ ] Category 7: Disease & Infection (3 tests)
- [ ] Category 8: Inventory Management (7 tests)
- [ ] Category 9: Item Creator (18 tests)
- [ ] Category 10: Prayer & Blessing (3 tests)
- [ ] Category 11: Spell & Magic (6 tests)
- [ ] Category 12: Social Status (2 tests)
- [ ] Category 13: Custom NPC Generator (3 tests)
- [ ] Category 14: Compendium (5 tests)
- [ ] Category 15: Scene (5 tests)
- [ ] Category 16: Actor Creation (4 tests)
- [ ] Category 17: Quest Creation (3 tests)
- [ ] Category 18: Dice Roll (5 tests)
- [ ] Category 19: Campaign Management (2 tests)
- [ ] Category 20: Ownership (3 tests)
- [ ] Category 21: Map Generation (2 tests)
- [ ] Category 22: Rolltable Management (4 tests)
- [ ] Integration Tests (8 scenarios)
- [ ] Error Handling Tests (8 tests)
- [ ] Performance Tests (3 tests)

---

## 🎯 Priority Testing Order

### Phase 1: Core Functionality (Test First)
1. Character Tools (get/update)
2. Inventory Management (add/remove items)
3. Dice Roll Tools
4. Compendium Search

### Phase 2: Character Development
1. Career Advancement
2. Fortune & Fate
3. Spell & Magic (if wizard character)
4. Social Status

### Phase 3: Combat Systems
1. Advantage Tracker
2. Critical Wounds
3. Item Creator (weapons)
4. Corruption & Mutation

### Phase 4: World Building
1. Scene Tools
2. Actor Creation
3. Quest Creation
4. Rolltable Management

### Phase 5: Advanced Features
1. Custom NPC Generator
2. Map Generation
3. Campaign Management
4. Ownership Tools

---

## 📚 Appendix: Quick Reference

### Valid Weapon Groups
basic, cavalry, fencing, brawling, flail, parry, polearm, twohanded, blackpowder, bow, crossbow, entangling, engineering, explosives, sling, throwing, vehicle

### Valid Armor Types
softLeather, boiledLeather, mail, plate, other, otherMetal

### Valid Armor Locations
head, body, lArm, rArm, lLeg, rLeg

### Valid Trapping Categories
clothingAccessories, foodAndDrink, toolsAndKits, booksAndDocuments, tradeTools, drugsPoisonsHerbsDraughts, ingredient, misc

### Valid Ammunition Types
bow, crossbow, sling, BPandEng, throwing, entangling

### Valid Spell Lores
petty, beasts, death, fire, heavens, life, light, metal, shadow, daemonology, necromancy, hedgecraft, witchcraft, tzeentch, nurgle, slaanesh, greatmaw, littlewaaagh

### Valid Weapon Qualities
accurate, blackpowder, blast, damaging, dangerous, defensive, distract, entangle, fast, flexible, hack, impact, impale, penetrating, pistol, precise, pummel, repeater, shield, trapblade, unbreakable, undamaging, wrap

### Valid Weapon Flaws
dangerous, imprecise, reload, slow, tiring, undamaging

### Valid Weapon Reaches
personal, vshort, short, average, long, vLong, massive

---

**END OF TESTING GUIDE**

*Good luck with testing! Report back with results and any issues found.* 🎲🎭⚔️
