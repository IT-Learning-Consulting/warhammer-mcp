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

**Purpose**: Update character characteristics, wounds, and basic stats **DIRECTLY** (without XP costs).

**⚡ BOTH TOOLS COEXIST**: This tool and `advance-characteristic` both exist and serve different purposes:
- **`foundry-update-character-info`**: "Update WP to 40" → Sets initial value to 40 (0 XP)
- **`advance-characteristic`**: "Advance WP by 10" → Adds 10 advances (costs XP)

**When to Use This Tool**:
- Character creation: Setting starting characteristics
- GM adjustments: Story-driven changes (mutations, blessings, curses)
- Corrections: Fixing errors in character sheets
- Trigger phrases: "update to", "set to", "change to"

This tool updates the following WFRP4e data:
- **Characteristics**: Sets the `initial` value (base stat before advances), not the `advances` value
- **Status Values**: Current wounds, fortune, fate, resilience, resolve
- **Does NOT** spend XP or add advances - it directly modifies the base values

#### Test Case 1.3: Update Single Characteristic (Direct Set)
```
Prompt: "Update Test Character's Strength to 40"
```
**Expected Result**:
- Tool used: `foundry-update-character-info`
- Confirmation message
- Strength characteristic **initial value** updated to 40
- Characteristic advances remain unchanged (0)
- Total Strength: 40 (initial 40 + advances 0)
- XP unchanged (no cost)
- Verify in Foundry VTT character sheet

**Success Criteria**: ✅ Characteristic initial value = 40, advances = 0, XP unchanged

**Technical Details**: Updates `system.characteristics.s.initial` (not `advances`)

---

#### Test Case 1.3b: Advance Characteristic (XP-Based)
```
Prompt: "Advance Test Character's Strength by 9 advances"
```
**Expected Result**:
- Tool used: `advance-characteristic`
- XP cost calculated (~765 XP total for 9 advances)
- If sufficient XP: XP deducted, advances increased by 9
- If insufficient XP: Error message about XP shortage
- Initial value unchanged
- Total Strength: initial + 9 advances

**Success Criteria**: ✅ Tool correctly uses XP-based advancement, not direct update

**Technical Details**: Updates `system.characteristics.s.advances` and spends XP

**Comparison**:
| Request | Tool | Initial | Advances | Total | XP Cost |
|---------|------|---------|----------|-------|---------|
| "Update Strength to 40" | update-character-info | 31→40 | 0→0 | 40 | 0 XP |
| "Advance Strength by 9" | advance-characteristic | 31→31 | 0→9 | 40 | ~765 XP |

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

#### Test Case 1.6: Update Multiple Characteristics
```
Prompt: "Update Test Character: Strength to 35, Toughness to 40, Initiative to 30"
```
**Expected Result**:
- All three characteristics updated to initial values
- Each characteristic shows new value
- Advances remain at 0 for all
- XP unchanged (no cost)
- Confirmation for each change

**Success Criteria**: ✅ Multiple characteristics updated simultaneously

---

#### Test Case 1.7: Update Status Values
```
Prompt: "Update Test Character: current wounds to 15, fortune to 3, resolve to 2"
```
**Expected Result**:
- Current wounds set to 15
- Fortune set to 3 (must be ≤ Fate maximum)
- Resolve set to 2 (must be ≤ Resilience maximum)
- All values visible in character sheet
- If values exceed maximums, should be capped

**Success Criteria**: ✅ All status values updated correctly

---

#### Test Case 1.8: Update Single Characteristic to Zero
```
Prompt: "Set Test Character's Strength initial to 0"
```
**Expected Result**:
- Strength initial value set to 0
- Warning: "Setting characteristic to 0 is unusual"
- Character sheet shows Strength: 0 + advances
- Mechanical implications noted

**Success Criteria**: ✅ Zero value accepted with warning

---

#### Test Case 1.9: Update Characteristic Below Zero
```
Prompt: "Set Test Character's Agility to -10"
```
**Expected Result**:
- Error: "Characteristic cannot be negative"
- OR: Value clamped to 0
- No changes made to character
- Validation message displayed

**Success Criteria**: ✅ Negative values rejected or clamped

---

#### Test Case 1.10: Update Wounds Above Maximum
```
Prompt: "Set Test Character's current wounds to 100"
```
**Expected Result**:
- Current wounds set to 100
- OR: Capped at maximum wounds value
- Warning if value exceeds calculated maximum
- Character sheet reflects change

**Success Criteria**: ✅ Wounds updated with appropriate validation

---

#### Test Case 1.11: Update Fortune Above Fate Maximum
```
Prompt: "Give Test Character 10 fortune points"
```
**Expected Result**:
- Fortune increased
- If exceeds Fate value: capped at Fate maximum
- Warning: "Fortune cannot exceed Fate"
- Current fortune ≤ Fate value

**Success Criteria**: ✅ Fortune capped at Fate maximum

---

#### Test Case 1.12: Update Resolve Above Resilience Maximum
```
Prompt: "Set Test Character's resolve to 10"
```
**Expected Result**:
- Resolve increased
- If exceeds Resilience value: capped at Resilience maximum
- Warning: "Resolve cannot exceed Resilience"
- Current resolve ≤ Resilience value

**Success Criteria**: ✅ Resolve capped at Resilience maximum

---

#### Test Case 1.13: Get Character Info - Complete Details
```
Prompt: "Show me complete information for Test Character"
```
**Expected Result**:
- **Identity**: Name, species, class, career
- **Characteristics**: All 10 with initial + advances + total
- **Status**: Wounds (current/max), Fortune (current/max), Fate, Resolve (current/max), Resilience
- **Skills**: All skills with advances and total value
- **Talents**: All talents with description
- **Traits**: Special abilities and traits
- **Items**: Weapons, armor, equipment with quantities
- **Conditions**: Active conditions and effects
- **Experience**: Total XP, spent XP, available XP
- **Biography**: Motivation, short/long term ambitions
- **Corruption**: Current corruption and mutations
- **Critical Wounds**: Count and list

**Success Criteria**: ✅ Comprehensive character data dump

---

#### Test Case 1.14: Get Character Info - Specific Sections
```
Prompt: "Show me Test Character's skills and talents only"
```
**Expected Result**:
- Filtered output showing only requested sections
- Skills list with all advances
- Talents list with descriptions
- Other sections omitted for brevity
- Well-formatted output

**Success Criteria**: ✅ Selective information retrieval

---

#### Test Case 1.15: Get Character With No Items
```
Prompt: "Get info for Test Character"
Setup: Character has no items in inventory
```
**Expected Result**:
- All other data displayed normally
- Items section shows: "No items"
- No errors about missing items
- Clean empty state handling

**Success Criteria**: ✅ Graceful handling of empty inventory

---

#### Test Case 1.16: Get Character With Conditions
```
Prompt: "Show Test Character's status"
Setup: Character has active conditions (Bleeding, Stunned, etc.)
```
**Expected Result**:
- Conditions section lists all active effects
- Each condition shows: name, value/level, duration
- Status effects clearly displayed
- Mechanical implications noted

**Success Criteria**: ✅ Conditions properly listed

---

#### Test Case 1.17: Update Characteristic - Partial Name Match
```
Prompt: "Update Test Character's WS to 45"
```
**Expected Result**:
- Tool recognizes "WS" as "Weapon Skill"
- Weapon Skill initial updated to 45
- Confirmation uses full characteristic name
- Abbreviation handling works

**Success Criteria**: ✅ Abbreviations recognized

---

#### Test Case 1.18: Update Multiple Stats - Some Invalid
```
Prompt: "Update Test Character: Strength to 35, InvalidStat to 50, Toughness to 40"
```
**Expected Result**:
- Strength updated successfully
- Toughness updated successfully
- Error for "InvalidStat": "Unknown stat name"
- Valid updates applied, invalid ones rejected
- Partial success reported

**Success Criteria**: ✅ Mixed validation handled gracefully

---

#### Test Case 1.19: Get Character - Case Insensitive Name
```
Prompt: "Get info for test character"
```
**Expected Result**:
- Character found despite lowercase
- Full information returned
- Case-insensitive search works
- Exact name displayed in response

**Success Criteria**: ✅ Case insensitive character lookup

---

#### Test Case 1.20: Update Character - Verify Persistence
```
Scenario: Update and verify persistence across tool calls
1. "Update Test Character's Strength to 42"
2. "Get Test Character's info"
3. Verify Strength shows 42
4. Refresh Foundry VTT
5. "Get Test Character's info" again
6. Verify Strength still shows 42
```
**Expected Result**:
- Updates persist immediately
- Values survive Foundry refresh
- No data loss between tool calls
- Changes written to database

**Success Criteria**: ✅ Data persistence verified

---

### 🧪 Integration Test Scenarios

#### Test Case 1.21: Character Creation Flow
```
Scenario: Set up new character with multiple updates
1. "Update Test Character: Strength to 30, Toughness to 35, Agility to 33"
2. "Update Test Character: Initiative to 32, Willpower to 28, Fellowship to 35"
3. "Set Test Character's wounds to 13, fortune to 2, fate to 2"
4. "Show me Test Character's complete information"
```
**Expected Result**:
- All characteristics set to initial values
- All status values configured
- Complete character sheet populated
- Ready for game play

**Success Criteria**: ✅ Full character setup workflow

---

#### Test Case 1.22: Combat Damage Flow
```
Scenario: Character takes damage and recovers
1. "Get Test Character's current wounds" → e.g., 15/15
2. "Update Test Character's current wounds to 8" → Took 7 damage
3. "Get Test Character's info" → Verify 8/15 wounds
4. "Update Test Character's current wounds to 15" → Healed
5. "Get Test Character's info" → Verify 15/15 wounds
```
**Expected Result**:
- Wounds update correctly
- Damage tracking works
- Healing restores wounds
- Max wounds unchanged

**Success Criteria**: ✅ Wounds management workflow

---

#### Test Case 1.23: Fortune/Fate Management Flow
```
Scenario: Using and refreshing Fortune points
1. "Get Test Character's fortune" → e.g., 3/3
2. "Spend a fortune point for Test Character" → 2/3
3. "Get Test Character's info" → Verify 2/3
4. "Add a fortune point to Test Character" → 3/3
5. "Burn a fate point for Test Character" → Fate reduced, Fortune max reduced
6. "Get Test Character's info" → Verify Fate and Fortune both reduced
```
**Expected Result**:
- Fortune spending tracked
- Fortune restoration works
- Fate burning affects maximum
- Persistent changes verified

**Success Criteria**: ✅ Fortune/Fate system workflow

---

### 📊 Technical Validation Tests

#### Test Case 1.24: WFRP 4e Data Structure Verification
```
Technical check: Verify correct data paths
1. Update characteristic - check `system.characteristics.s.initial`
2. Update wounds - check `system.status.wounds.value`
3. Update fortune - check `system.status.fortune.value`
4. Get character - verify all paths return data
```
**Expected Result**:
- All WFRP 4e data paths correct
- Initial vs advances separation maintained
- Status values in correct locations
- No data path errors

**Success Criteria**: ✅ Data structure compliance

---

#### Test Case 1.25: Update vs Advance Tool Selection
```
Technical check: Verify tool routing
1. "Update Test Character's Strength to 40" → Uses update-character-info
2. "Advance Test Character's Strength by 5" → Uses advance-characteristic
3. "Set Test Character's WP to 35" → Uses update-character-info
4. "Increase Test Character's WP by 10" → Uses advance-characteristic
```
**Expected Result**:
- Correct tool selected based on phrasing
- "Update/set/change" triggers update tool
- "Advance/increase" triggers advancement tool
- No tool confusion

**Success Criteria**: ✅ Tool routing works correctly

---

#### Test Case 1.26: Character Type Validation
```
Technical check: Verify WFRP character type
1. Get character info for WFRP character → Success
2. Get character info for non-WFRP actor → Error or warning
3. Update WFRP character → Success
4. Update non-WFRP actor → Validation error
```
**Expected Result**:
- WFRP characters work normally
- Non-WFRP characters handled gracefully
- Type validation prevents errors
- Clear messages about system requirements

**Success Criteria**: ✅ Type validation enforced

---

#### Test Case 1.27: Concurrent Update Handling
```
Technical check: Multiple rapid updates
1. "Update Test Character: Strength to 30, Toughness to 35, Agility to 32, Dexterity to 30, Initiative to 28, Willpower to 33, Intelligence to 32, Fellowship to 35"
```
**Expected Result**:
- All 8 characteristics updated
- No race conditions
- All changes persist
- Single transaction if possible

**Success Criteria**: ✅ Bulk updates handled safely

---

#### Test Case 1.28: Empty Character Name Handling
```
Technical check: Edge case handling
1. "Get info for ''" (empty string)
2. "Update character '' strength to 40"
```
**Expected Result**:
- Clear error: "Character name cannot be empty"
- No crashes or undefined behavior
- Helpful message about providing name

**Success Criteria**: ✅ Empty input validated

---

#### Test Case 1.29: Special Characters in Names
```
Technical check: Character name edge cases
1. "Get info for Test-Character" (hyphen)
2. "Get info for Test Character!" (exclamation)
3. "Get info for Test's Character" (apostrophe)
```
**Expected Result**:
- Special characters handled
- Exact match search works
- No SQL injection or errors
- Names with punctuation supported

**Success Criteria**: ✅ Special character handling

---

#### Test Case 1.30: Maximum Data Load Test
```
Technical check: Character with extensive data
Setup: Character with 50+ skills, 30+ talents, 100+ items
Prompt: "Get complete info for Test Character"
```
**Expected Result**:
- All data retrieved successfully
- No truncation of long lists
- Reasonable response time (<5 seconds)
- No memory errors
- Well-formatted despite size

**Success Criteria**: ✅ Large dataset handling

---

## 2. CAREER ADVANCEMENT TOOLS

### Tool: `advance-characteristic` (and related advancement tools)

**Purpose**: Handle career progression and experience spending (XP-based).

**⚡ BOTH TOOLS COEXIST**: This tool and `foundry-update-character-info` both exist and serve different purposes:
- **`advance-characteristic`**: "Advance WP by 10" → Adds 10 advances (costs XP)
- **`foundry-update-character-info`**: "Update WP to 40" → Sets initial value to 40 (0 XP)

**When to Use This Tool**:
- Normal character progression through XP spending
- Following WFRP4e career advancement rules
- Career-based character development
- Trigger phrases: "advance by", "increase", "spend XP on"

#### Test Case 2.1: Advance Characteristic (XP-Based)
```
Prompt: "Advance Test Character's Weapon Skill characteristic in their current career"
```
**Expected Result**:
- Tool used: `advance-characteristic`
- XP cost calculated (25 XP for in-career advance)
- XP deducted from character
- Characteristic **advances** increased by 1 (not initial value)
- Initial value unchanged
- Confirmation message with new value

**Success Criteria**: ✅ XP spent, advances increased, initial unchanged

**Technical Details**: Updates `system.characteristics.ws.advances` and spends XP

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

**⚠️ SETUP REQUIRED**: Character must have a career marked as "current" before this test can run.

**Setup Steps**:
1. Verify Test Character has at least one career item (e.g., "Soldier")
2. Ensure one career is marked with "Current" checkbox in Foundry VTT
3. OR use: `"Update Test Character's Soldier career, set system.current.value to true"`
4. Verify character has 200+ available XP
5. See `docs/TEST_2.4_SETUP_GUIDE.md` for detailed setup instructions

```
Prompt: "Change Test Character's career to Sergeant"
```

**Expected Result**:
- Current career (e.g., "Soldier") found and checked for completion status
- If current career is **complete**: 100 XP deducted
- If current career is **NOT complete**: 200 XP deducted
- New career "Sergeant" found in compendium and added to character
- Old career unmarked as "current" (checkbox unchecked)
- New career marked as "current" (checkbox checked)
- XP deducted from available experience
- Confirmation message shows:
  - Previous career name and completion status
  - New career name
  - XP cost and remaining XP
  - WFRP 4e rules explanation

**Success Criteria**: 
- ✅ New career visible in Foundry as "current"
- ✅ Old career still in items list but not marked as current
- ✅ Correct XP amount deducted (100 or 200 based on completion)
- ✅ Experience totals updated properly

**Common Setup Errors**:
- ❌ "No current career found" - No career has `current: true` (see setup guide)
- ❌ "No careers found" - Character has no career items (add one first)
- ❌ "Insufficient XP" - Character needs 100-200 available XP

**Technical Details**:
- Uses `change-career` tool (not `foundry-update-character-info`)
- Implements full WFRP 4e career change mechanics
- Career history preserved (all careers remain in items)
- See `docs/CAREER_CHANGE_TOOL.md` for complete documentation
- See `docs/TEST_2.4_SETUP_GUIDE.md` for setup instructions

---

#### Test Case 2.5: Advance Skill - First Advance
```
Prompt: "Advance Test Character's Melee (Basic) skill from 0 to 1"
```
**Expected Result**:
- XP cost: 5 XP (Tier 0: advances 0-4)
- Skill advances: 0 → 1
- Total skill value: characteristic + 1
- XP deducted from available
- Confirmation shows new skill value

**Success Criteria**: ✅ First skill advance costs 5 XP

**Technical Details**: Uses Math.floor(0 / 5) = 0, cost = 5 XP

---

#### Test Case 2.6: Advance Skill - Tier Boundary (5th Advance)
```
Setup: Skill has 4 advances
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- Current advances: 4
- XP cost: 5 XP (still Tier 0)
- New advances: 5
- Next advance will cost 10 XP (Tier 1)
- Confirmation shows tier transition warning

**Success Criteria**: ✅ 5th advance costs 5 XP, 6th will cost 10 XP

**Technical Details**: Math.floor(4 / 5) = 0 → 5 XP

---

#### Test Case 2.7: Advance Skill - Tier Boundary (6th Advance)
```
Setup: Skill has 5 advances
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- Current advances: 5
- XP cost: 10 XP (Tier 1: advances 5-9)
- New advances: 6
- Cost increased from previous tier
- Message: "Skill entered Tier 1 (10 XP per advance)"

**Success Criteria**: ✅ 6th advance costs 10 XP (tier change)

**Technical Details**: Math.floor(5 / 5) = 1 → 10 XP

---

#### Test Case 2.8: Advance Skill - Tier 2 (11th Advance)
```
Setup: Skill has 10 advances
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- Current advances: 10
- XP cost: 20 XP (Tier 2: advances 10-14)
- New advances: 11
- Message: "Skill in Tier 2 (20 XP per advance)"

**Success Criteria**: ✅ 11th advance costs 20 XP

**Technical Details**: Math.floor(10 / 5) = 2 → 20 XP
**CRITICAL**: This was the bug - used to cost 220 XP (array[10] instead of tier)

---

#### Test Case 2.9: Advance Skill - Tier 3 (16th Advance)
```
Setup: Skill has 15 advances
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- Current advances: 15
- XP cost: 30 XP (Tier 3: advances 15-19)
- New advances: 16
- Message: "Skill in Tier 3 (30 XP per advance)"

**Success Criteria**: ✅ 16th advance costs 30 XP

**Technical Details**: Math.floor(15 / 5) = 3 → 30 XP

---

#### Test Case 2.10: Advance Skill - Tier 4 (21st Advance)
```
Setup: Skill has 20 advances
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- Current advances: 20
- XP cost: 40 XP (Tier 4: advances 20+)
- New advances: 21
- Warning: "High skill level - advancing becomes very expensive"

**Success Criteria**: ✅ 21st advance costs 40 XP

**Technical Details**: Math.floor(20 / 5) = 4 → 40 XP

---

#### Test Case 2.11: Advance Multiple Skills
```
Prompt: "Advance Test Character's Melee (Basic), Dodge, and Perception skills"
```
**Expected Result**:
- Each skill advanced by 1
- XP costs calculated individually per skill's tier
- Total XP cost shown
- If insufficient XP: error before any changes
- All three confirmations displayed

**Success Criteria**: ✅ Multiple skills advanced in single request

---

#### Test Case 2.12: Advance Skill - Insufficient XP
```
Setup: Character has 3 XP available, skill advance costs 5 XP
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- Error: "Insufficient XP"
- Current XP: 3
- Required XP: 5
- Shortage: 2 XP
- No changes made to character
- Skill advances unchanged

**Success Criteria**: ✅ Insufficient XP prevents advancement

---

#### Test Case 2.13: Advance Skill - Exact XP Amount
```
Setup: Character has exactly 5 XP available
Prompt: "Advance Test Character's Melee (Basic) skill"
```
**Expected Result**:
- XP cost: 5 XP
- Skill advanced successfully
- Available XP: 5 → 0
- Message: "All available XP spent"
- Advance confirmed

**Success Criteria**: ✅ Exact XP amount works

---

#### Test Case 2.14: Advance Characteristic - In-Career
```
Setup: Weapon Skill is in character's current career
Prompt: "Advance Test Character's Weapon Skill characteristic"
```
**Expected Result**:
- XP cost: 25 XP (in-career cost)
- Characteristic advances increased by 1
- Initial value unchanged
- Total = initial + advances
- Career-based discount applied
- Confirmation shows "in-career advance"

**Success Criteria**: ✅ In-career characteristic costs 25 XP

---

#### Test Case 2.15: Advance Characteristic - Out-of-Career
```
Setup: Intelligence is NOT in character's current career
Prompt: "Advance Test Character's Intelligence characteristic"
```
**Expected Result**:
- XP cost: 30 XP (out-of-career cost)
- Characteristic advances increased by 1
- Initial value unchanged
- Higher cost than in-career
- Confirmation shows "out-of-career advance (more expensive)"

**Success Criteria**: ✅ Out-of-career characteristic costs 30 XP

---

#### Test Case 2.16: Advance Characteristic - Tier Boundaries
```
Setup: Test advances at different levels
1. Advance WS from 0 → 1 advance (25 XP)
2. Advance WS from 4 → 5 advances (25 XP, still Tier 0)
3. Advance WS from 5 → 6 advances (50 XP, Tier 1)
4. Advance WS from 10 → 11 advances (100 XP, Tier 2)
```
**Expected Result**:
- Tier 0 (0-4 advances): 25 XP in-career
- Tier 1 (5-9 advances): 50 XP in-career
- Tier 2 (10-14 advances): 100 XP in-career
- Each tier doubles the cost
- Clear tier transition messages

**Success Criteria**: ✅ Characteristic tiers work correctly

**Technical Details**: Uses Math.floor(advances / 5) formula

---

#### Test Case 2.17: Advance Characteristic - Multiple Advances
```
Prompt: "Advance Test Character's Strength by 3 advances"
```
**Expected Result**:
- Calculates cost for 3 separate advances
- If crossing tier boundary, costs change
- Example: 0→1 (25), 1→2 (25), 2→3 (25) = 75 XP total
- All 3 advances applied if sufficient XP
- Confirmation shows total XP spent

**Success Criteria**: ✅ Multiple advances calculated correctly

---

#### Test Case 2.18: Advance Characteristic - Insufficient XP Mid-Advancement
```
Setup: Character has 60 XP, try to advance 3 times (25+25+25=75 XP)
Prompt: "Advance Test Character's Strength by 3"
```
**Expected Result**:
- Error: "Insufficient XP"
- Need: 75 XP
- Have: 60 XP
- No partial advances applied (all-or-nothing)
- Character unchanged

**Success Criteria**: ✅ Insufficient XP prevents partial advancement

---

#### Test Case 2.19: Advance Talent - Basic Talent
```
Prompt: "Advance Test Character's Combat Reflexes talent"
```
**Expected Result**:
- Talent found in compendium
- XP cost: 100 XP (standard talent cost)
- Talent added to character
- XP deducted
- Talent appears in character sheet
- Confirmation with talent effects

**Success Criteria**: ✅ Talent purchased successfully

---

#### Test Case 2.20: Advance Talent - Already Owned
```
Setup: Character already has Combat Reflexes
Prompt: "Advance Test Character's Combat Reflexes talent"
```
**Expected Result**:
- Error: "Character already has this talent"
- OR: If talent has ranks, increase rank
- No duplicate talents created
- Clear message about current status

**Success Criteria**: ✅ Duplicate talents prevented

---

#### Test Case 2.21: Career Change - Incomplete Career
```
Setup: Current career is NOT complete
Prompt: "Change Test Character's career to Sergeant"
```
**Expected Result**:
- Current career: Soldier (incomplete)
- XP cost: 200 XP (incomplete penalty)
- Warning: "Changing from incomplete career costs 200 XP"
- New career added and marked current
- Old career unmarked but preserved
- Confirmation shows cost reason

**Success Criteria**: ✅ Incomplete career change costs 200 XP

---

#### Test Case 2.22: Career Change - Complete Career
```
Setup: Current career IS complete (all advances done)
Prompt: "Change Test Character's career to Sergeant"
```
**Expected Result**:
- Current career: Soldier (complete)
- XP cost: 100 XP (completed discount)
- Message: "Completed career - reduced cost"
- New career added
- Career history preserved
- Confirmation shows completion benefit

**Success Criteria**: ✅ Complete career change costs 100 XP

---

#### Test Case 2.23: Career Change - Insufficient XP
```
Setup: Character has 50 XP, change requires 100/200 XP
Prompt: "Change Test Character's career to Sergeant"
```
**Expected Result**:
- Error: "Insufficient XP for career change"
- Current XP: 50
- Required: 100 or 200
- No changes made
- Suggestion to earn more XP

**Success Criteria**: ✅ Career change prevented by XP shortage

---

#### Test Case 2.24: Career Change - Career Not Found
```
Prompt: "Change Test Character's career to NonExistentCareer"
```
**Expected Result**:
- Error: "Career 'NonExistentCareer' not found in compendium"
- Suggestion to check spelling
- Examples of available careers
- No changes made
- Current career remains

**Success Criteria**: ✅ Invalid career name handled

---

#### Test Case 2.25: Career Change - No Current Career
```
Setup: Character has no career marked as current
Prompt: "Change Test Character's career to Sergeant"
```
**Expected Result**:
- Error: "No current career found"
- Instructions to set a current career first
- Reference to setup guide
- No changes made

**Success Criteria**: ✅ Missing current career detected

---

#### Test Case 2.26: Get Career Advancement Progress
```
Prompt: "Show Test Character's career advancement progress"
```
**Expected Result**:
- Current career name
- Career level/tier
- Advances in each career attribute:
  - Characteristics: which ones, how many advances
  - Skills: which ones, advances in each
  - Talents: which ones acquired
- Completion percentage
- XP spent on current career
- Career completion status

**Success Criteria**: ✅ Complete career progress overview

---

#### Test Case 2.27: Get Career Advancement Costs
```
Prompt: "What would it cost to advance Test Character's career?"
```
**Expected Result**:
- List of available career advances
- Characteristics with costs (25 XP in-career)
- Skills with current tier costs
- Talents with costs (100 XP each)
- Total XP needed for full completion
- Current XP available
- Recommendations for next advance

**Success Criteria**: ✅ Cost breakdown displayed

---

#### Test Case 2.28: XP Calculation Verification
```
Technical check: Verify XP formula correctness
1. Skill at 0 advances → costs 5 XP (Tier 0)
2. Skill at 5 advances → costs 10 XP (Tier 1)
3. Skill at 10 advances → costs 20 XP (Tier 2)
4. Skill at 15 advances → costs 30 XP (Tier 3)
5. Skill at 20 advances → costs 40 XP (Tier 4)
```
**Expected Result**:
- All costs match formula: (Math.floor(advances / 5) + 1) * 5
- No array index errors
- Consistent across all skill types
- Bug from v0.2.2.1 fixed (11th advance = 20 XP, not 220 XP)

**Success Criteria**: ✅ XP formula working correctly

**Reference**: See FIX_XP_COST_CALCULATION.md for bug details

---

### 🧪 Integration Test Scenarios

#### Test Case 2.29: Full Career Progression Flow
```
Scenario: Character advances through career
1. "Show Test Character's career progress"
2. "Advance Test Character's Weapon Skill" (in-career)
3. "Advance Test Character's Melee (Basic) skill"
4. "Advance Test Character's Dodge skill"
5. "Purchase Combat Reflexes talent for Test Character"
6. "Show Test Character's career progress"
```
**Expected Result**:
- Each advance successful
- XP deducted progressively
- Career progress increases
- All changes persist
- Final status shows progression

**Success Criteria**: ✅ Career advancement workflow

---

#### Test Case 2.30: Career Change Workflow
```
Scenario: Complete career and change
1. "Show Test Character's Soldier career progress"
2. [Complete all required advances]
3. "Check if Test Character's Soldier career is complete"
4. "Change Test Character's career to Sergeant" (100 XP)
5. "Show Test Character's career history"
```
**Expected Result**:
- Career completion tracked
- Career change applies correct cost
- Both careers in character history
- New career marked as current
- Old career preserved

**Success Criteria**: ✅ Career change progression

---

#### Test Case 2.31: Multi-Tier Skill Advancement
```
Scenario: Advance skill from 0 to 11 advances
1. Note starting XP (need 115 XP: 5+5+5+5+5+10+10+10+10+10+20)
2. "Advance Test Character's Melee (Basic) skill 11 times"
```
**Expected Result**:
- Advances 0→1 through 10→11
- Costs transition through tiers:
  - Tier 0 (0-4): 5 XP × 5 = 25 XP
  - Tier 1 (5-9): 10 XP × 5 = 50 XP
  - Tier 2 (10): 20 XP × 1 = 20 XP
  - Total: 95 XP
- Final skill advances: 11
- XP deducted: 95 XP
- Clear progression messages

**Success Criteria**: ✅ Multi-tier progression works

---

#### Test Case 2.32: XP Management Flow
```
Scenario: Track XP spending across multiple advances
1. "Show Test Character's XP" → e.g., 500 total, 100 spent, 400 available
2. "Advance WS" → 400 - 25 = 375 available
3. "Advance Melee (Basic)" → 375 - 5 = 370 available
4. "Purchase Combat Reflexes" → 370 - 100 = 270 available
5. "Show Test Character's XP" → Verify 270 available
```
**Expected Result**:
- XP tracking accurate
- Spent XP accumulates
- Available XP decreases
- Total XP unchanged
- Math adds up correctly

**Success Criteria**: ✅ XP accounting correct

---

### 📊 Technical Validation Tests

#### Test Case 2.33: UUID Construction for Career Change
```
Technical check: Verify career UUID pattern
1. Change career to Sergeant
2. Check Foundry logs for UUID
3. Verify format: `Compendium.${pack}.${id}`
4. Confirm uses pack + id (not uuid field)
```
**Expected Result**:
- UUID: `Compendium.wfrp4e-core.careers.abc123`
- Same pattern as critical wounds fix (v0.2.2)
- Career successfully added from compendium
- No UUID errors

**Success Criteria**: ✅ UUID construction correct

---

#### Test Case 2.34: Career Completion Status Check
```
Technical check: Verify completion detection
1. Check career with partial advances → incomplete
2. Check career with all required advances → complete
3. Verify completion affects XP cost
4. Test edge cases (all but one advance)
```
**Expected Result**:
- Completion detected accurately
- 100 XP cost when complete
- 200 XP cost when incomplete
- Status clearly indicated

**Success Criteria**: ✅ Completion logic works

---

#### Test Case 2.35: In-Career vs Out-of-Career Detection
```
Technical check: Verify career attribute checking
1. Advance characteristic in career plan → 25 XP
2. Advance characteristic not in career plan → 30 XP
3. Advance skill in career → lower cost
4. Advance skill not in career → higher cost
```
**Expected Result**:
- Correct career membership detection
- Appropriate costs applied
- Clear indication of in/out status
- Career plan respected

**Success Criteria**: ✅ Career attribute detection correct

---

#### Test Case 2.36: Advances vs Initial Separation
```
Technical check: Verify update vs advance distinction
1. Update WS to 40 → sets initial, 0 advances, 0 XP
2. Advance WS by 5 → keeps initial, adds 5 advances, costs XP
3. Result: total = initial + advances
4. Verify both systems work independently
```
**Expected Result**:
- Update tool: changes initial value
- Advance tool: changes advances value
- No interference between tools
- Total calculated correctly

**Success Criteria**: ✅ Two systems independent

---

#### Test Case 2.37: Concurrent Advancement Prevention
```
Technical check: Test race condition handling
1. Attempt to advance same skill twice simultaneously
2. Attempt to change career while advancing
```
**Expected Result**:
- Operations serialized
- No double-spending XP
- No data corruption
- Clear operation order

**Success Criteria**: ✅ No race conditions

---

#### Test Case 2.38: Career History Preservation
```
Technical check: Verify career tracking
1. Start with Soldier career
2. Change to Sergeant
3. Change to Captain
4. Get character info
5. Verify all three careers in items
6. Only Captain marked as current
```
**Expected Result**:
- All past careers preserved
- Only one current career
- Career progression history intact
- No careers lost

**Success Criteria**: ✅ Career history maintained

---

#### Test Case 2.39: XP Total Recalculation
```
Technical check: Verify XP math
1. Award 100 XP to character
2. Spend 25 XP on advance
3. Verify: spent = 25, available = 75, total = 100
4. Award 50 more XP
5. Verify: spent = 25, available = 125, total = 150
```
**Expected Result**:
- Total XP = spent + available (always)
- XP accounting consistent
- Awards increase total and available
- Spending increases spent, decreases available

**Success Criteria**: ✅ XP math correct

---

#### Test Case 2.40: Maximum Advancement Limits
```
Technical check: Test high advancement levels
1. Advance skill to 50+ advances
2. Advance characteristic to 30+ advances
3. Verify costs scale correctly
4. No overflow errors
```
**Expected Result**:
- No maximum limit enforced (or very high)
- Costs continue scaling by tier
- No integer overflow
- System handles high values

**Success Criteria**: ✅ High advancement levels work

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

#### Test Case 3.5: Add Corruption - Threshold Check
```
Setup: Character has 2 corruption, Toughness Bonus = 4
Prompt: "Add 2 corruption points to Test Character for reading forbidden texts"
```
**Expected Result**:
- Corruption: 2 → 4
- Threshold reached: 4 (= TB)
- Warning: "Corruption at threshold! Roll on Mutation Table!"
- Mutation roll suggested
- Reason logged if supported
- No automatic mutation (GM decides)

**Success Criteria**: ✅ Threshold warning triggered

**Technical Details**: Threshold typically = Toughness Bonus in WFRP 4e

---

#### Test Case 3.6: Add Corruption - Exceed Threshold
```
Setup: Character has 4 corruption, Toughness Bonus = 4
Prompt: "Add 1 corruption point to Test Character"
```
**Expected Result**:
- Corruption: 4 → 5
- Exceeds threshold: 5 > 4
- ⚠️ "MUTATION REQUIRED! Corruption exceeded Toughness Bonus!"
- Strong warning to roll mutation
- Character marked for mutation
- Corruption continues to increase

**Success Criteria**: ✅ Threshold exceeded warning

---

#### Test Case 3.7: Add Corruption - Multiple Thresholds
```
Setup: Character has 7 corruption, TB = 4
Prompt: "Add 1 corruption point to Test Character"
```
**Expected Result**:
- Corruption: 7 → 8
- Threshold: 8 = 2 × TB (second threshold)
- Warning: "Second mutation threshold! Roll again!"
- Multiple mutations possible
- Escalating corruption severity

**Success Criteria**: ✅ Multiple thresholds tracked

---

#### Test Case 3.8: Add Corruption - With Reason
```
Prompt: "Add 3 corruption to Test Character because they made a dark pact with chaos"
```
**Expected Result**:
- Corruption increased by 3
- Reason recorded: "made a dark pact with chaos"
- Reason visible in character log/journal
- Source tracking for narrative purposes
- Confirmation includes reason

**Success Criteria**: ✅ Corruption reason logged

---

#### Test Case 3.9: Add Corruption - Large Amount
```
Prompt: "Add 10 corruption points to Test Character for prolonged chaos exposure"
```
**Expected Result**:
- Corruption increased by 10
- Multiple threshold warnings
- Suggestion for multiple mutations
- Character heavily corrupted
- Dramatic warnings about corruption level

**Success Criteria**: ✅ Large corruption increase handled

---

#### Test Case 3.10: Add Corruption - Zero Amount
```
Prompt: "Add 0 corruption points to Test Character"
```
**Expected Result**:
- Error: "Corruption amount must be greater than 0"
- OR: No change, confirmation of no change
- No corruption added
- Current corruption unchanged

**Success Criteria**: ✅ Zero amount handled

---

#### Test Case 3.11: Add Corruption - Negative Amount
```
Prompt: "Add -5 corruption points to Test Character"
```
**Expected Result**:
- Error: "Use remove-corruption to reduce corruption"
- OR: Automatic conversion to remove operation
- Prevents confusion between add/remove
- Clear guidance on correct tool

**Success Criteria**: ✅ Negative amount rejected

---

#### Test Case 3.12: Remove Corruption - Partial Removal
```
Setup: Character has 5 corruption points
Prompt: "Remove 2 corruption points from Test Character"
```
**Expected Result**:
- Corruption: 5 → 3
- Confirmation of removal
- Reason: cleansing, prayer, ritual, etc. (if logged)
- Character still has corruption
- Progress toward cleansing noted

**Success Criteria**: ✅ Partial corruption removed

---

#### Test Case 3.13: Remove Corruption - Complete Cleansing
```
Setup: Character has 3 corruption points
Prompt: "Remove 3 corruption points from Test Character"
```
**Expected Result**:
- Corruption: 3 → 0
- ✅ "Character fully cleansed of corruption!"
- Dramatic confirmation
- Threshold status reset
- Character pure again

**Success Criteria**: ✅ Full corruption removal

---

#### Test Case 3.14: Remove Corruption - More Than Current
```
Setup: Character has 2 corruption
Prompt: "Remove 5 corruption points from Test Character"
```
**Expected Result**:
- Corruption: 2 → 0 (clamped at minimum)
- Warning: "Only had 2 corruption to remove"
- Cannot go negative
- Character cleansed fully
- Confirmation shows actual amount removed

**Success Criteria**: ✅ Excess removal clamped to zero

---

#### Test Case 3.15: Remove Corruption - At Zero
```
Setup: Character has 0 corruption
Prompt: "Remove 1 corruption point from Test Character"
```
**Expected Result**:
- Error: "Character has no corruption to remove"
- Current corruption: 0
- No change made
- Message: "Character is already pure"

**Success Criteria**: ✅ Zero corruption state handled

---

#### Test Case 3.16: Remove Corruption - Below Threshold
```
Setup: Character has 5 corruption (above TB of 4)
Prompt: "Remove 2 corruption points from Test Character"
```
**Expected Result**:
- Corruption: 5 → 3
- Now below threshold: 3 < 4
- Message: "Corruption reduced below mutation threshold"
- Note: Mutations already gained remain
- Threshold status updated

**Success Criteria**: ✅ Threshold crossing downward handled

---

#### Test Case 3.17: Add Mutation - Mental Type
```
Prompt: "Add mutation 'Animalistic Legs' to Test Character, type mental"
```
**Expected Result**:
- Mutation "Animalistic Legs" added
- Type: Mental
- Description and effects from compendium
- Mutation count incremented
- Visible in character mutations list
- Mechanical effects noted

**Success Criteria**: ✅ Mental mutation added

---

#### Test Case 3.18: Add Mutation - Physical Type
```
Prompt: "Add mutation 'Warped Face' to Test Character, type physical"
```
**Expected Result**:
- Mutation "Warped Face" added
- Type: Physical
- Description includes appearance changes
- Fellowship penalties noted
- Social implications described
- Mutation visible on character

**Success Criteria**: ✅ Physical mutation added

---

#### Test Case 3.19: Add Mutation - UUID Construction
```
Technical check: Verify mutation added from compendium
1. Add mutation "Animalistic Legs"
2. Check Foundry logs for UUID
3. Verify format: `Compendium.${pack}.${id}`
4. Confirm uses pack + id pattern
```
**Expected Result**:
- UUID: `Compendium.wfrp4e-core.mutations.abc123`
- Same pattern as career change (v0.2.2)
- Mutation successfully added from compendium
- Official effects from compendium applied

**Success Criteria**: ✅ UUID construction correct

**Reference**: Third tool using this pattern (career, critical wounds, mutations)

---

#### Test Case 3.20: Add Mutation - Not Found
```
Prompt: "Add mutation 'NonExistentMutation123' to Test Character"
```
**Expected Result**:
- Error: "Mutation 'NonExistentMutation123' not found in compendium"
- Suggestion to check spelling
- Examples of common mutations listed
- No changes to character
- Search suggestions provided

**Success Criteria**: ✅ Invalid mutation name handled

---

#### Test Case 3.21: Add Mutation - Duplicate Check
```
Setup: Character already has "Animalistic Legs"
Prompt: "Add mutation 'Animalistic Legs' to Test Character"
```
**Expected Result**:
- Warning: "Character already has this mutation"
- OR: If stackable, increase severity
- No exact duplicates
- Mutation list remains clean
- Current status shown

**Success Criteria**: ✅ Duplicate mutations prevented

---

#### Test Case 3.22: Add Mutation - Auto-Assignment from Corruption
```
Scenario: Corruption triggers mutation
1. "Add 5 corruption to Test Character" (exceeds threshold)
2. "Roll random mutation for Test Character"
```
**Expected Result**:
- Corruption increase triggers warning
- Mutation rolled from appropriate table
- Random mutation added
- Type (mental/physical) determined
- Full integration of corruption and mutation

**Success Criteria**: ✅ Corruption-to-mutation flow

---

#### Test Case 3.23: Remove Mutation
```
Setup: Character has mutation "Animalistic Legs"
Prompt: "Remove mutation 'Animalistic Legs' from Test Character"
```
**Expected Result**:
- Mutation found and removed
- Mutation count decremented
- Effects no longer apply
- Confirmation message
- Note: Usually permanent in WFRP 4e
- Warning about rarity of mutation removal

**Success Criteria**: ✅ Mutation removed (if tool exists)

---

#### Test Case 3.24: Get Corruption Status
```
Prompt: "Show Test Character's corruption and mutations"
```
**Expected Result**:
- Current corruption points
- Toughness Bonus threshold
- Distance to next threshold
- Visual indicator (e.g., 🔴 if above threshold)
- List of all mutations:
  - Name
  - Type (mental/physical)
  - Effects
  - Description
- Corruption history (if tracked)
- Cleansing recommendations

**Success Criteria**: ✅ Complete corruption overview

---

#### Test Case 3.25: Corruption and Toughness Bonus Interaction
```
Scenario: Character's Toughness changes
Setup: Character has 5 corruption, TB = 4 (above threshold)
1. "Show corruption status" → Above threshold
2. "Advance Test Character's Toughness by 5" → TB increases to 5
3. "Show corruption status" → Now at threshold (5 = 5)
```
**Expected Result**:
- Threshold dynamically calculated from current TB
- Threshold status updates when TB changes
- Corruption value unchanged
- Relative status changes (above → at threshold)

**Success Criteria**: ✅ Dynamic threshold calculation

---

### 🧪 Integration Test Scenarios

#### Test Case 3.26: Corruption Accumulation Over Campaign
```
Scenario: Character gains corruption from multiple sources
1. "Add 1 corruption to Test Character for witnessing dark magic"
2. "Add 2 corruption to Test Character for entering chaos shrine"
3. "Add 1 corruption to Test Character for touching warpstone"
4. "Show Test Character's corruption" → Total: 4
5. "Add 1 corruption to Test Character" → Threshold exceeded
6. "Add mutation 'Warped Face' to Test Character, physical"
```
**Expected Result**:
- Corruption accumulates over time
- Each source tracked (if supported)
- Threshold warning at appropriate point
- Mutation added when threshold exceeded
- Complete narrative tracking

**Success Criteria**: ✅ Corruption campaign tracking

---

#### Test Case 3.27: Multiple Mutations Workflow
```
Scenario: Character gains multiple mutations
1. "Add 4 corruption to Test Character" (first threshold)
2. "Add mutation 'Animalistic Legs' mental"
3. "Add 4 more corruption" (8 total, second threshold)
4. "Add mutation 'Warped Face' physical"
5. "Show Test Character's mutations"
```
**Expected Result**:
- Both mutations added
- Corruption at 8 (2× threshold)
- Mutation list shows both
- Types correctly categorized
- Cumulative effects described

**Success Criteria**: ✅ Multiple mutations tracked

---

#### Test Case 3.28: Cleansing Ritual Workflow
```
Scenario: Character undergoes cleansing
Setup: Character has 8 corruption, 2 mutations
1. "Show Test Character's corruption" → 8 corruption
2. "Remove 4 corruption from Test Character" → 4 remaining
3. "Show corruption status" → Below second threshold
4. Note: Mutations remain (permanent)
```
**Expected Result**:
- Corruption reduced
- Threshold status improves
- Mutations persist (as per WFRP rules)
- Partial redemption achieved
- Character less likely to gain more mutations

**Success Criteria**: ✅ Cleansing reduces future risk

---

#### Test Case 3.29: Corruption Death Spiral
```
Scenario: Character becomes heavily corrupted
1. Add corruption to 12+ points (3× TB)
2. Add 3+ mutations
3. Show status → Severely mutated
```
**Expected Result**:
- High corruption tracked
- Multiple thresholds crossed
- Many mutations listed
- Character transformation evident
- Warnings about chaos influence

**Success Criteria**: ✅ Extreme corruption handled

---

### 📊 Technical Validation Tests

#### Test Case 3.30: Corruption Data Persistence
```
Technical check: Verify corruption saves
1. Add 5 corruption points
2. Get character info → Verify 5 corruption
3. Refresh Foundry VTT
4. Get character info again → Still 5 corruption
```
**Expected Result**:
- Corruption persists across sessions
- No data loss
- Value stored in character data
- Mutations also persist

**Success Criteria**: ✅ Data persistence verified

---

#### Test Case 3.31: Mutation Compendium Integration
```
Technical check: Verify compendium access
1. Search for mutation "Animalistic Legs"
2. Verify found in compendium
3. Check UUID construction
4. Verify effects loaded from compendium
```
**Expected Result**:
- Compendium search works
- Mutations found by name
- UUID pattern correct
- Official data used

**Success Criteria**: ✅ Compendium integration working

---

#### Test Case 3.32: Threshold Calculation Accuracy
```
Technical check: Verify threshold math
1. Character with TB = 3 → thresholds at 3, 6, 9, 12
2. Character with TB = 5 → thresholds at 5, 10, 15, 20
3. Character with TB = 0 → threshold at 0 (immediate mutation)
```
**Expected Result**:
- Thresholds = TB × multiplier
- First threshold at TB
- Subsequent thresholds at multiples
- TB = 0 handled as edge case

**Success Criteria**: ✅ Threshold formula correct

---

#### Test Case 3.33: Corruption Type Handling
```
Technical check: Verify data types
1. Add corruption with integer → works
2. Add corruption with decimal → rounded or error
3. Add corruption with string → error
4. Add corruption with negative → error or remove operation
```
**Expected Result**:
- Integer values accepted
- Type validation prevents errors
- Clear error messages for wrong types
- Robust input handling

**Success Criteria**: ✅ Type validation working

---

#### Test Case 3.34: Mutation Type Validation
```
Technical check: Verify mutation types
1. Add mutation with type "mental" → accepted
2. Add mutation with type "physical" → accepted
3. Add mutation with type "invalid" → error
4. Add mutation with no type → default or error
```
**Expected Result**:
- Only "mental" and "physical" accepted
- Invalid types rejected
- Clear error messages
- Type enforcement working

**Success Criteria**: ✅ Mutation type validation

---

#### Test Case 3.35: Corruption and Mutation Separation
```
Technical check: Verify independent tracking
1. Add corruption without mutation → corruption increases
2. Add mutation without corruption → mutation added
3. Remove corruption → mutations remain
4. Remove mutation → corruption remains
```
**Expected Result**:
- Corruption and mutations independent
- Can have corruption without mutations
- Can have mutations without high corruption
- Separate data fields

**Success Criteria**: ✅ Independent tracking verified

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

### Tool: `foundry-add-resolve-point`

#### Test Case 4.6: Add Resolve Point
```
Prompt: "Give Test Character 1 resolve point"
```
**Expected Result**:
- Resolve points increased by 1
- Cannot exceed maximum (based on Resilience value)
- Confirmation message

**Success Criteria**: ✅ Resolve visible on character sheet

---

### Tool: `spend-resolve`

#### Test Case 4.7: Spend Resolve Point
```
Prompt: "Test Character spends a resolve point to ignore Psychology effects from Fear"
```
**Expected Result**:
- Resolve points decreased by 1
- Cannot go below 0
- Usage type logged (ignore-psychology)
- Appropriate mechanical guidance provided

**Success Criteria**: ✅ Resolve reduced by 1

---

### Tool: `foundry-add-resilience-point`

#### Test Case 4.8: Add Resilience Point (Rare)
```
Prompt: "Increase Test Character's resilience by 1 for nourishing their soul with their Motivation"
```
**Expected Result**:
- Resilience permanently increased
- Resolve maximum also increases
- Significant confirmation message

**Success Criteria**: ✅ Both Resilience and max Resolve increase

---

### Tool: `spend-resilience`

#### Test Case 4.9: Spend Resilience Point
```
Prompt: "Test Character spends a resilience point to deny a Chaos mutation"
```
**Expected Result**:
- Resilience permanently reduced by 1
- Resolve maximum also reduces
- Dramatic confirmation message
- Usage type logged (deny-mutation or auto-succeed)

**Success Criteria**: ✅ Permanent reduction recorded

---

### Tool: `refresh-resolve`

#### Test Case 4.10: Refresh Resolve Points
```
Prompt: "Test Character refreshes their resolve points by acting on their Motivation"
```
**Expected Result**:
- Resolve restored to maximum (equal to Resilience value)
- Confirmation message
- Thematic messaging about Motivation

**Success Criteria**: ✅ Resolve refreshed to maximum

---

#### Test Case 4.11: Add Fortune - At Maximum
```
Setup: Character has Fortune = Fate (e.g., 3/3)
Prompt: "Add 1 fortune point to Test Character"
```
**Expected Result**:
- Error: "Fortune already at maximum (Fate value)"
- Current: 3/3
- Cannot exceed Fate value
- No change made
- Message explains Fortune cap

**Success Criteria**: ✅ Fortune capped at Fate maximum

---

#### Test Case 4.12: Add Fortune - Below Maximum
```
Setup: Character has Fortune = 1, Fate = 3 (1/3)
Prompt: "Add 1 fortune point to Test Character"
```
**Expected Result**:
- Fortune: 1 → 2
- Still below maximum (2/3)
- Confirmation message
- Can continue adding until reaches Fate

**Success Criteria**: ✅ Fortune increased below maximum

---

#### Test Case 4.13: Add Multiple Fortune Points
```
Setup: Character has Fortune = 0, Fate = 3 (0/3)
Prompt: "Add 3 fortune points to Test Character"
```
**Expected Result**:
- Fortune: 0 → 3
- Now at maximum (3/3)
- Confirmation of full restoration
- Ready for challenges

**Success Criteria**: ✅ Multiple fortune points added

---

#### Test Case 4.14: Add Fortune - Exceed Maximum
```
Setup: Character has Fortune = 2, Fate = 3 (2/3)
Prompt: "Add 5 fortune points to Test Character"
```
**Expected Result**:
- Fortune: 2 → 3 (capped)
- Warning: "Fortune capped at Fate value (3)"
- Only added 1 point (to maximum)
- Excess ignored
- Message shows actual amount added

**Success Criteria**: ✅ Excess fortune capped at maximum

---

#### Test Case 4.15: Spend Fortune - Normal Use
```
Setup: Character has Fortune = 3/3
Prompt: "Test Character spends a fortune point to reroll a failed Weapon Skill test"
```
**Expected Result**:
- Fortune: 3 → 2
- Reason logged: "reroll failed Weapon Skill test"
- Confirmation message
- Mechanical guidance on reroll
- Fortune still available (2 remaining)

**Success Criteria**: ✅ Fortune spent with reason

---

#### Test Case 4.16: Spend Fortune - Last Point
```
Setup: Character has Fortune = 1/3
Prompt: "Test Character spends fortune to add +1 SL"
```
**Expected Result**:
- Fortune: 1 → 0
- Warning: "No fortune points remaining!"
- Reason logged
- Message about being vulnerable
- Suggestion to rest or find blessing

**Success Criteria**: ✅ Last fortune point spent

---

#### Test Case 4.17: Spend Fortune - Already at Zero
```
Setup: Character has Fortune = 0/3
Prompt: "Test Character spends a fortune point"
```
**Expected Result**:
- Error: "No fortune points available to spend"
- Current: 0/3
- No change made
- Suggestion to rest or earn fortune
- Cannot spend what you don't have

**Success Criteria**: ✅ Cannot spend zero fortune

---

#### Test Case 4.18: Spend Fortune - Multiple Uses
```
Setup: Character has Fortune = 3/3
Scenario: Combat encounter
1. "Spend fortune to reroll attack" → 2/3
2. "Spend fortune to ignore wound" → 1/3
3. "Spend fortune to add +1 SL" → 0/3
```
**Expected Result**:
- Each use decrements by 1
- Each reason logged separately
- Progressive depletion
- All uses valid
- Final state: 0/3

**Success Criteria**: ✅ Multiple fortune expenditures

---

#### Test Case 4.19: Add Fate - Permanent Increase
```
Prompt: "Increase Test Character's fate by 1 for their heroic sacrifice"
```
**Expected Result**:
- Fate: e.g., 3 → 4
- Fortune maximum: also 4
- Current fortune unchanged (unless auto-filled)
- ⭐ Dramatic confirmation: "Fate permanently increased!"
- Reason logged: "heroic sacrifice"
- Rare and significant event

**Success Criteria**: ✅ Fate permanently increased

---

#### Test Case 4.20: Add Fate - Multiple Increases (Rare)
```
Prompt: "Increase Test Character's fate by 2 for legendary deeds"
```
**Expected Result**:
- Fate: e.g., 3 → 5
- Fortune maximum: also 5
- Warning: "Multiple Fate increases are extremely rare!"
- Epic confirmation message
- Requires exceptional circumstances

**Success Criteria**: ✅ Multiple fate increases handled

---

#### Test Case 4.21: Spend Fate - Cheat Death
```
Prompt: "Test Character burns a fate point to survive certain death from critical wounds"
```
**Expected Result**:
- Fate: e.g., 3 → 2 (permanent reduction)
- Fortune maximum: also reduced to 2
- Current fortune: reduced if above new maximum
- ☠️➡️✅ Dramatic message: "FATE POINT BURNED! Character survives death!"
- Reason logged: "survive certain death from critical wounds"
- Mechanical explanation of survival
- Warning: Permanent loss

**Success Criteria**: ✅ Fate point burned, character survives

---

#### Test Case 4.22: Spend Fate - At Zero Fate
```
Setup: Character has Fate = 0
Prompt: "Test Character burns a fate point"
```
**Expected Result**:
- Error: "No fate points remaining to burn"
- Current: 0
- Character cannot cheat death
- ☠️ "Character has no fate points left - death is final!"
- Grave warning
- No change made

**Success Criteria**: ✅ Cannot burn zero fate

---

#### Test Case 4.23: Spend Fate - Fortune Adjustment
```
Setup: Character has Fate = 3, Fortune = 3/3
Prompt: "Test Character burns a fate point"
```
**Expected Result**:
- Fate: 3 → 2
- Fortune maximum: 3 → 2
- Current fortune: 3 → 2 (auto-adjusted)
- Both values decrease together
- Fortune cannot exceed new maximum
- Clear explanation of both changes

**Success Criteria**: ✅ Fortune adjusted with fate burn

---

#### Test Case 4.24: Add Resolve - Below Maximum
```
Setup: Character has Resolve = 1, Resilience = 3 (1/3)
Prompt: "Add 1 resolve point to Test Character"
```
**Expected Result**:
- Resolve: 1 → 2
- Still below Resilience maximum (2/3)
- Confirmation message
- Can continue adding until reaches Resilience

**Success Criteria**: ✅ Resolve increased below maximum

---

#### Test Case 4.25: Add Resolve - At Maximum
```
Setup: Character has Resolve = 3, Resilience = 3 (3/3)
Prompt: "Add 1 resolve point to Test Character"
```
**Expected Result**:
- Error: "Resolve already at maximum (Resilience value)"
- Current: 3/3
- Cannot exceed Resilience
- No change made
- Explanation of resolve cap

**Success Criteria**: ✅ Resolve capped at Resilience maximum

---

#### Test Case 4.26: Add Resolve - Multiple Points
```
Setup: Character has Resolve = 0, Resilience = 3 (0/3)
Prompt: "Add 3 resolve points to Test Character"
```
**Expected Result**:
- Resolve: 0 → 3
- Now at maximum (3/3)
- Full restoration
- Ready for mental challenges

**Success Criteria**: ✅ Multiple resolve points added

---

#### Test Case 4.27: Spend Resolve - Ignore Psychology
```
Setup: Character has Resolve = 3/3
Prompt: "Test Character spends a resolve point to ignore Fear from the Daemon"
```
**Expected Result**:
- Resolve: 3 → 2
- Usage type: "ignore-psychology"
- Reason: "ignore Fear from the Daemon"
- Mechanical guidance: automatically pass Fear test
- Confirmation with rules explanation
- Resolve still available (2 remaining)

**Success Criteria**: ✅ Resolve spent for psychology

---

#### Test Case 4.28: Spend Resolve - Remove Condition
```
Setup: Character has Resolve = 2/3, has Broken condition
Prompt: "Test Character spends resolve to remove Broken condition"
```
**Expected Result**:
- Resolve: 2 → 1
- Usage type: "remove-condition"
- Broken condition removed immediately
- Character can act again
- Powerful recovery option
- Confirmation of condition removal

**Success Criteria**: ✅ Resolve spent to remove condition

---

#### Test Case 4.29: Spend Resolve - At Zero
```
Setup: Character has Resolve = 0/3
Prompt: "Test Character spends a resolve point"
```
**Expected Result**:
- Error: "No resolve points available to spend"
- Current: 0/3
- No change made
- Suggestion to refresh resolve via Motivation
- Cannot spend without points

**Success Criteria**: ✅ Cannot spend zero resolve

---

#### Test Case 4.30: Add Resilience - Permanent Increase
```
Prompt: "Increase Test Character's resilience by 1 for nourishing their soul through Motivation"
```
**Expected Result**:
- Resilience: e.g., 3 → 4
- Resolve maximum: also 4
- Current resolve unchanged (unless auto-filled)
- ⭐ Dramatic confirmation: "Resilience permanently increased!"
- Reason: "nourishing soul through Motivation"
- Rare event, tied to character growth

**Success Criteria**: ✅ Resilience permanently increased

---

#### Test Case 4.31: Spend Resilience - Deny Mutation
```
Prompt: "Test Character spends a resilience point to deny a Chaos mutation"
```
**Expected Result**:
- Resilience: e.g., 3 → 2 (permanent reduction)
- Resolve maximum: also reduced to 2
- Current resolve: reduced if above new maximum
- Usage type: "deny-mutation"
- ☠️➡️✅ "RESILIENCE BURNED! Mutation denied!"
- Mutation NOT added to character
- Reason logged: "deny Chaos mutation"
- Permanent sacrifice for purity

**Success Criteria**: ✅ Resilience burned, mutation prevented

---

#### Test Case 4.32: Spend Resilience - Auto-Succeed
```
Prompt: "Test Character spends resilience to automatically succeed at Cool test against Terror"
```
**Expected Result**:
- Resilience: e.g., 3 → 2 (permanent)
- Resolve maximum: also reduced to 2
- Usage type: "auto-succeed"
- Test automatically passed
- No roll needed
- Dramatic confirmation
- Warning about permanent loss

**Success Criteria**: ✅ Resilience burned for auto-success

---

#### Test Case 4.33: Spend Resilience - At Zero
```
Setup: Character has Resilience = 0
Prompt: "Test Character spends a resilience point"
```
**Expected Result**:
- Error: "No resilience points remaining to burn"
- Current: 0
- Cannot burn resilience
- ☠️ "Character has no resilience left!"
- Grave warning about vulnerability
- No change made

**Success Criteria**: ✅ Cannot burn zero resilience

---

#### Test Case 4.34: Spend Resilience - Resolve Adjustment
```
Setup: Character has Resilience = 3, Resolve = 3/3
Prompt: "Test Character burns resilience to deny mutation"
```
**Expected Result**:
- Resilience: 3 → 2
- Resolve maximum: 3 → 2
- Current resolve: 3 → 2 (auto-adjusted)
- Both values decrease together
- Resolve cannot exceed new maximum
- Clear explanation of both changes

**Success Criteria**: ✅ Resolve adjusted with resilience burn

---

#### Test Case 4.35: Refresh Resolve - To Maximum
```
Setup: Character has Resolve = 0, Resilience = 3 (0/3)
Prompt: "Test Character refreshes their resolve by acting on their Motivation"
```
**Expected Result**:
- Resolve: 0 → 3 (full restoration)
- Message: "Resolve fully refreshed!"
- Thematic text about Motivation
- Character ready for challenges
- Encouragement to roleplay Motivation

**Success Criteria**: ✅ Resolve fully refreshed

---

#### Test Case 4.36: Refresh Resolve - Partial Use
```
Setup: Character has Resolve = 1, Resilience = 3 (1/3)
Prompt: "Refresh Test Character's resolve"
```
**Expected Result**:
- Resolve: 1 → 3
- Message: "Resolve refreshed to maximum!"
- 2 points restored
- Motivation-based recovery
- Confirmation of full restoration

**Success Criteria**: ✅ Resolve refreshed from partial

---

#### Test Case 4.37: Refresh Resolve - Already at Maximum
```
Setup: Character has Resolve = 3, Resilience = 3 (3/3)
Prompt: "Refresh Test Character's resolve"
```
**Expected Result**:
- Resolve: 3 (unchanged)
- Message: "Resolve already at maximum"
- No change needed
- Confirmation of full resolve
- No waste of action

**Success Criteria**: ✅ Refresh at maximum handled

---

#### Test Case 4.38: Refresh Resolve - After Resilience Burn
```
Setup: Character burned resilience, now has Resilience = 2, Resolve = 0/2
Prompt: "Refresh Test Character's resolve"
```
**Expected Result**:
- Resolve: 0 → 2 (to new maximum)
- Refreshes to current Resilience value
- Permanent resilience loss reflected
- Can only restore to new maximum
- Clear explanation of limits

**Success Criteria**: ✅ Refresh respects lowered maximum

---

### 🧪 Integration Test Scenarios

#### Test Case 4.39: Fortune/Fate Cycle - Complete Flow
```
Scenario: Character uses and restores Fortune
1. "Show Test Character's fortune" → 3/3
2. "Spend fortune to reroll" → 2/3
3. "Spend fortune to ignore wound" → 1/3
4. "Spend fortune for +1 SL" → 0/3
5. "Add 3 fortune points" → 3/3 (after rest)
6. "Show fortune status" → Verify 3/3
```
**Expected Result**:
- Fortune depletes through use
- Can be restored to maximum
- Fate maximum unchanged
- Complete cycle functional
- Ready for next adventure

**Success Criteria**: ✅ Fortune cycle works

---

#### Test Case 4.40: Fate Point Burn - Death and Survival
```
Scenario: Character dies and burns Fate
Setup: Character at 0 wounds, would die from critical
1. "Check Test Character's death status" → Would die
2. "Test Character burns a fate point to survive" → Fate reduced
3. "Show Test Character's fate" → Permanent reduction
4. Character survives, wounds set to 1
```
**Expected Result**:
- Death prevented by Fate burn
- Fate permanently reduced
- Fortune maximum also reduced
- Character survives but scarred
- Dramatic survival narration

**Success Criteria**: ✅ Fate burn saves life

---

#### Test Case 4.41: Resolve/Resilience Cycle - Complete Flow
```
Scenario: Character uses and refreshes Resolve
1. "Show Test Character's resolve" → 3/3
2. "Spend resolve to ignore Fear" → 2/3
3. "Spend resolve to remove Broken" → 1/3
4. "Spend resolve to ignore Terror" → 0/3
5. "Refresh Test Character's resolve" → 3/3
6. "Show resolve status" → Verify 3/3
```
**Expected Result**:
- Resolve depletes through challenges
- Can be refreshed via Motivation
- Resilience maximum unchanged
- Complete cycle functional
- Psychological resilience maintained

**Success Criteria**: ✅ Resolve cycle works

---

#### Test Case 4.42: Resilience Burn - Mutation Prevention
```
Scenario: Character prevents mutation via Resilience
Setup: Character at corruption threshold, would gain mutation
1. "Add corruption to trigger mutation" → Threshold exceeded
2. "Test Character burns resilience to deny mutation" → Resilience reduced
3. "Show Test Character's resilience" → Permanent reduction
4. "Show mutations" → No new mutation added
```
**Expected Result**:
- Mutation prevented by Resilience burn
- Resilience permanently reduced
- Resolve maximum also reduced
- Corruption remains but no mutation
- Character preserves purity

**Success Criteria**: ✅ Resilience burn prevents mutation

---

#### Test Case 4.43: Multiple Resource Management
```
Scenario: Character manages all four resources
1. "Show Test Character's Fortune, Fate, Resolve, Resilience"
2. "Spend fortune" → Fortune decreases
3. "Spend resolve" → Resolve decreases
4. "Burn fate" → Fate & Fortune max decrease
5. "Burn resilience" → Resilience & Resolve max decrease
6. "Show all resources" → Verify all changes
```
**Expected Result**:
- All four resources tracked independently
- Burning affects maximums appropriately
- Spending affects current values
- Complete resource economy visible
- Strategic decision-making supported

**Success Criteria**: ✅ All resources managed correctly

---

#### Test Case 4.44: Fortune Restoration After Fate Burn
```
Scenario: Fate burn reduces Fortune maximum
Setup: Fate = 3, Fortune = 3/3
1. "Burn fate point" → Fate = 2, Fortune max = 2
2. Current Fortune = 2/2 (auto-adjusted)
3. "Spend fortune" → 1/2
4. "Add fortune" → 2/2 (to new maximum)
```
**Expected Result**:
- Fortune can be restored to new maximum
- Cannot exceed reduced Fate value
- System adapts to new limits
- No attempting to restore above cap

**Success Criteria**: ✅ Fortune respects new maximum

---

#### Test Case 4.45: Resolve Restoration After Resilience Burn
```
Scenario: Resilience burn reduces Resolve maximum
Setup: Resilience = 3, Resolve = 3/3
1. "Burn resilience" → Resilience = 2, Resolve max = 2
2. Current Resolve = 2/2 (auto-adjusted)
3. "Spend resolve" → 1/2
4. "Refresh resolve" → 2/2 (to new maximum)
```
**Expected Result**:
- Resolve refreshes to new maximum
- Cannot exceed reduced Resilience value
- System adapts to permanent loss
- Refresh still functional

**Success Criteria**: ✅ Resolve respects new maximum

---

### 📊 Technical Validation Tests

#### Test Case 4.46: Fortune-Fate Maximum Linkage
```
Technical check: Verify Fortune capped by Fate
1. Set Fate = 2
2. Try to add Fortune to 3 → Capped at 2
3. Increase Fate to 4
4. Add Fortune to 4 → Success
5. Verify Fortune ≤ Fate always
```
**Expected Result**:
- Fortune maximum = Fate value
- Hard cap enforced
- Dynamic adjustment when Fate changes
- No Fortune > Fate ever

**Success Criteria**: ✅ Fortune-Fate linkage correct

---

#### Test Case 4.47: Resolve-Resilience Maximum Linkage
```
Technical check: Verify Resolve capped by Resilience
1. Set Resilience = 2
2. Try to add Resolve to 3 → Capped at 2
3. Increase Resilience to 4
4. Add Resolve to 4 → Success
5. Verify Resolve ≤ Resilience always
```
**Expected Result**:
- Resolve maximum = Resilience value
- Hard cap enforced
- Dynamic adjustment when Resilience changes
- No Resolve > Resilience ever

**Success Criteria**: ✅ Resolve-Resilience linkage correct

---

#### Test Case 4.48: Data Persistence Across Sessions
```
Technical check: Verify persistence
1. Spend Fortune to 1/3
2. Burn Fate to 2
3. Spend Resolve to 1/3
4. Burn Resilience to 2
5. Refresh Foundry VTT
6. Verify all values persist
```
**Expected Result**:
- All current values persist
- All maximum values persist
- No data loss on refresh
- Permanent burns remain permanent

**Success Criteria**: ✅ All data persists

---

#### Test Case 4.49: Negative Value Prevention
```
Technical check: Verify cannot go negative
1. Try to spend Fortune at 0 → Error
2. Try to spend Resolve at 0 → Error
3. Try to remove Fate at 0 → Error
4. Try to remove Resilience at 0 → Error
```
**Expected Result**:
- All values clamped at 0 minimum
- Clear errors when attempting negative
- No undefined behavior
- Zero state handled gracefully

**Success Criteria**: ✅ Negative values prevented

---

#### Test Case 4.50: Reason Logging Verification
```
Technical check: Verify reasons tracked
1. Spend Fortune with reason → Logged
2. Burn Fate with reason → Logged
3. Spend Resolve with reason → Logged
4. Burn Resilience with reason → Logged
5. Query logs → All reasons visible
```
**Expected Result**:
- Reasons stored in character data
- Retrievable for narrative review
- Helps track character story
- GM can review usage history

**Success Criteria**: ✅ Reason logging functional

---

## 5. CRITICAL WOUNDS TOOLS

**WFRP 4e Critical Wounds System Overview**:
- Critical wounds are **separate from regular Wounds** (health pool)
- Triggered by: (1) Taking damage at 0 Wounds, or (2) Suffering a Critical Hit
- Four Critical Tables: Head, Body, Arm, Leg (each with d100 results)
- Each critical has specific name, effects, and penalties from compendium
- Character dies when **critical wounds > Toughness Bonus**
- **IMPORTANT**: Critical wounds do NOT subtract from wound pool

---

### Tool: `get-critical-wounds`

**Purpose**: Check a character's critical wound status, count, and all active criticals.

#### Test Case 5.1: Check Character With No Criticals
```
Prompt: "Check Test Character's critical wounds"
```
**Expected Result**:
- Status: ✅ Healthy
- Critical wound count: 0 / [Toughness Bonus]
- Visual bar showing empty slots
- Message: "No critical wounds"
- Shows how many criticals character can survive

**Success Criteria**: ✅ Clean status report with threshold information

---

#### Test Case 5.2: Check Character With Multiple Criticals
```
Prompt: "Show me Test Character's injuries"
```
**Expected Result** (assuming character has criticals):
- Status icon based on severity (🩹 Injured / 🔴 Critical / 💀 Dying)
- Current count vs Toughness Bonus threshold
- Visual bar: `███░░` (filled = current criticals)
- List of all active criticals grouped by location:
  - Head: [list criticals]
  - Body: [list criticals]
  - Left Arm: [list criticals]
  - Right Arm: [list criticals]
  - Left Leg: [list criticals]
  - Right Leg: [list criticals]
- Each critical shows: name, description, penalties, duration
- Recovery guidance and recommendations

**Success Criteria**: ✅ Complete overview of all critical wounds with details

---

### Tool: `add-critical-wound`

**Purpose**: Add a specific critical wound from the WFRP 4e compendium (GM already rolled on table).

**⚠️ SETUP REQUIRED**: 
- Character must be WFRP 4e type
- Character needs available capacity (criticals < Toughness Bonus)
- Critical wound name must match compendium entry

#### Test Case 5.3: Add Specific Head Critical
```
Prompt: "Add Minor Head Injury to Test Character at the Head"
```
**Expected Result**:
- Tool searches compendium for "Minor Head Injury"
- Critical found and UUID constructed
- Item added from compendium with all official effects
- Location set to "Head"
- Critical wound count incremented by 1
- Visual bar updated
- Confirmation shows:
  - Character name
  - Critical name
  - Location
  - New count vs Toughness Bonus
  - Remaining capacity before death
- **Character's Wounds stat unchanged** (NOT subtracted)

**Success Criteria**: 
- ✅ Critical visible in Foundry character sheet
- ✅ Location correctly set
- ✅ Count incremented
- ✅ Wounds NOT reduced
- ✅ Official effects from compendium present

**Common Errors**:
- ❌ "Critical wound not found" - Check spelling matches table exactly
- ❌ "Not WFRP character" - Character must use WFRP 4e system

---

#### Test Case 5.4: Add Body Critical
```
Prompt: "Test Character suffers Cracked Ribs to the Body"
```
**Expected Result**:
- Critical "Cracked Ribs" found in compendium
- Added to character with Body location
- Count incremented
- All penalties from compendium applied
- Wounds unchanged

**Success Criteria**: ✅ Body critical added with correct location

---

#### Test Case 5.5: Add Left Arm Critical
```
Prompt: "Add Badly Jarred Arm to Test Character's Left Arm"
```
**Expected Result**:
- Critical found in compendium
- Location set to "Left Arm" (specific side)
- Count incremented
- Arm-specific penalties applied

**Success Criteria**: ✅ Left arm critical added, not generic "Arm"

---

#### Test Case 5.6: Add Right Leg Critical
```
Prompt: "Test Character takes Torn Thigh to the Right Leg"
```
**Expected Result**:
- Critical from compendium
- Location: "Right Leg"
- Leg-specific movement penalties applied
- Count incremented

**Success Criteria**: ✅ Right leg critical with correct side

---

#### Test Case 5.7: Add Critical at Death Threshold
```
Setup: Set character to have criticals = Toughness Bonus - 1
Prompt: "Add Minor Head Injury to Test Character at Head"
```
**Expected Result**:
- Critical added successfully
- New count = Toughness Bonus (exactly)
- ⚠️ Warning: "CRITICAL! One more critical wound will be fatal!"
- Character still alive but at threshold

**Success Criteria**: ✅ Warning displayed, character at death's door

---

#### Test Case 5.8: Add Critical Beyond Death Threshold
```
Setup: Set character to have criticals = Toughness Bonus
Prompt: "Add Minor Head Injury to Test Character at Head"
```
**Expected Result**:
- Critical added
- New count > Toughness Bonus
- ☠️ "DEATH!" message
- "Character DIES IMMEDIATELY"
- "Only burning a Fate point can save them now!"

**Success Criteria**: ✅ Death message displayed, count exceeds threshold

---

#### Test Case 5.9: Add Non-Existent Critical
```
Prompt: "Add FakeWoundName123 to Test Character at Head"
```
**Expected Result**:
- Error: "Critical wound 'FakeWoundName123' not found in compendium"
- Helpful message: "Please check spelling or use exact name from Critical Tables"
- Examples of common criticals provided
- No changes to character

**Success Criteria**: ✅ Clear error with guidance

---

#### Test Case 5.10: Verify Wounds NOT Subtracted
```
Setup: Note character's current Wounds value (e.g., 12/15)
Prompt: "Add Minor Head Injury to Test Character at Head"
```
**Expected Result**:
- Critical added successfully
- **Current Wounds: Still 12/15** (unchanged!)
- Only critical wound count increased
- Wounds stat completely separate

**Success Criteria**: ✅ Wounds value identical before and after

**Technical Verification**:
- Check `system.status.wounds.value` before and after
- Check `system.status.criticalWounds.value` increments by 1
- Confirm tool does NOT call updateActor with wounds changes

---

### Tool: `roll-critical-wound`

**Purpose**: Automatically roll d100 on a Critical Table and add the result (automates GM rolling).

**⚠️ SETUP REQUIRED**:
- Character must be WFRP 4e type
- Character needs capacity (criticals < Toughness Bonus)
- Compendium must have Critical Tables loaded

#### Test Case 5.11: Roll Head Critical (No Modifier)
```
Prompt: "Roll a head critical for Test Character"
```
**Expected Result**:
- Tool rolls d100 (1-100)
- Searches compendium for Head criticals
- Attempts to match roll to table range (01-10, 11-20, etc.)
- If no range match, picks random Head critical
- Adds critical using add-critical-wound logic
- Response shows:
  - Roll result (e.g., "Rolled: 47")
  - Critical selected
  - Location: Head
  - Count incremented
  - Effects from compendium

**Success Criteria**: ✅ Random Head critical added based on roll

---

#### Test Case 5.12: Roll Body Critical With Modifier
```
Prompt: "Roll a body critical for Test Character with -20 modifier"
```
**Expected Result**:
- Base roll: d100 (e.g., 35)
- Modifier applied: 35 + (-20) = 15
- Final roll clamped to 1-100
- Body critical matching roll 15 found
- Critical added to character
- Response shows base roll, modifier, and final roll

**Success Criteria**: ✅ Modifier correctly applied to roll

**Technical Details**:
- Formula: `Math.floor(Math.random() * 100) + 1 + modifier`
- Clamped: `Math.max(1, Math.min(100, roll))`
- -20 modifier typical when damage < Toughness Bonus in negative wounds

---

#### Test Case 5.13: Roll Arm Critical (Random L/R)
```
Prompt: "Roll an arm critical for Test Character"
```
**Expected Result**:
- Roll d100 for Arm table
- Find matching Arm critical in compendium
- **Random determination**: Left Arm OR Right Arm (50/50)
- Specific side set on critical
- Response shows which arm was determined

**Success Criteria**: ✅ Random left/right selection, critical added

**Technical Details**:
- Tool uses: `Math.random() < 0.5 ? 'Left' : 'Right'`
- Run test multiple times to verify randomness
- Both Left Arm and Right Arm outcomes should occur

---

#### Test Case 5.14: Roll Leg Critical (Random L/R)
```
Prompt: "Test Character takes a random leg critical"
```
**Expected Result**:
- Roll d100 for Leg table
- Find matching Leg critical
- Random determination: Left Leg OR Right Leg (50/50)
- Specific leg set on critical
- Both legs possible outcomes

**Success Criteria**: ✅ Random left/right selection for leg

---

#### Test Case 5.15: Roll With High Modifier (Over 100)
```
Prompt: "Roll a head critical for Test Character with +80 modifier"
```
**Expected Result**:
- Base roll: e.g., 75
- Modified: 75 + 80 = 155
- Clamped to maximum: 100
- Critical matching roll 100 found
- Highest severity critical from table

**Success Criteria**: ✅ Roll capped at 100, highest critical selected

---

#### Test Case 5.16: Roll With Low Modifier (Below 1)
```
Prompt: "Roll a body critical for Test Character with -50 modifier"
```
**Expected Result**:
- Base roll: e.g., 30
- Modified: 30 + (-50) = -20
- Clamped to minimum: 1
- Critical matching roll 1 found
- Lowest severity critical from table

**Success Criteria**: ✅ Roll capped at 1, lowest critical selected

---

#### Test Case 5.17: Roll When Compendium Empty
```
Setup: Test with world that has no critical table compendium loaded
Prompt: "Roll a head critical for Test Character"
```
**Expected Result**:
- Error: "No critical wounds found for location: Head"
- Message suggests compendium isn't loaded
- No changes to character

**Success Criteria**: ✅ Clear error about missing compendium data

---

### Tool: `remove-critical-wound`

**Purpose**: Remove a healed critical wound from character after recovery time.

#### Test Case 5.18: Remove Specific Critical
```
Setup: Character has "Minor Head Injury" critical
Prompt: "Remove Minor Head Injury from Test Character"
```
**Expected Result**:
- Critical wound found in character's items
- Item deleted from character sheet
- Critical wound count decremented by 1
- Visual bar updated
- Response shows:
  - Healed critical name
  - Location
  - Previous count
  - New count
  - Status update (healthy/injured)
  - Next steps and recommendations

**Success Criteria**: 
- ✅ Critical removed from Foundry
- ✅ Count decremented
- ✅ Confirmation message

---

#### Test Case 5.19: Remove Last Critical (Recovery Complete)
```
Setup: Character has exactly 1 critical wound
Prompt: "Heal Test Character's [critical name]"
```
**Expected Result**:
- Critical removed
- Count reduced to 0
- Status: ✅ Healthy
- Message: "Fully recovered from all critical wounds!"
- Visual bar empty

**Success Criteria**: ✅ Character returned to healthy state

---

#### Test Case 5.20: Remove Non-Existent Critical
```
Prompt: "Remove FakeWound123 from Test Character"
```
**Expected Result**:
- Error: "Critical wound 'FakeWound123' not found"
- Lists all current criticals character has
- Suggests exact names to use
- No changes to character

**Success Criteria**: ✅ Helpful error with current critical list

---

#### Test Case 5.21: Remove Critical From Wrong Character
```
Prompt: "Remove Minor Head Injury from NonExistentCharacter"
```
**Expected Result**:
- Error: "Character 'NonExistentCharacter' not found"
- No changes to any character

**Success Criteria**: ✅ Character validation error

---

### Tool: `check-death-from-criticals`

**Purpose**: Explicitly check if character's critical count exceeds death threshold.

#### Test Case 5.22: Check Healthy Character
```
Setup: Character has 0 critical wounds
Prompt: "Check if Test Character dies from criticals"
```
**Expected Result**:
- Status: ✅ ALIVE
- Current criticals: 0
- Death threshold: [Toughness Bonus]
- Visual bar empty
- Message: "No critical wounds. Character is healthy."
- Can survive [TB] criticals before dying

**Success Criteria**: ✅ Clean bill of health

---

#### Test Case 5.23: Check Injured Character (Below Threshold)
```
Setup: Character has 2 criticals, Toughness Bonus = 4
Prompt: "Check death threshold for Test Character"
```
**Expected Result**:
- Status: 🩹 INJURED
- Current: 2 criticals
- Threshold: 4 (Toughness Bonus)
- Visual: `██░░`
- Message: "Character has 2 critical wounds. Can survive 2 more."
- Tactical advice provided

**Success Criteria**: ✅ Safe below threshold

---

#### Test Case 5.24: Check At Death Threshold (Equal)
```
Setup: Character has criticals = Toughness Bonus
Prompt: "Check if Test Character dies from criticals"
```
**Expected Result**:
- Status: 🔴 AT DEATH THRESHOLD
- Current: 4 criticals
- Threshold: 4 (exactly equal)
- Visual: `████` (full bar)
- ⚠️ "Character is at death threshold. Still alive but one more kills them!"
- Urgent warnings about avoiding combat

**Success Criteria**: ✅ Clear warning, still alive

---

#### Test Case 5.25: Check Dead Character (Exceeded Threshold)
```
Setup: Character has criticals > Toughness Bonus
Prompt: "Check death status for Test Character"
```
**Expected Result**:
- Status: ☠️ DEAD
- Current: 5 criticals
- Threshold: 4 (exceeded!)
- Visual: `████X` (over limit)
- ☠️ "CHARACTER IS DEAD"
- "Critical wounds exceeded Toughness Bonus"
- "Only Fate point can save them"
- Dramatic death confirmation

**Success Criteria**: ✅ Death status clearly indicated

---

#### Test Case 5.26: Check Non-WFRP Character
```
Setup: Character is not WFRP 4e type
Prompt: "Check if D&D Character dies from criticals"
```
**Expected Result**:
- Error: "Character is not using WFRP 4e system"
- Message: "Critical wound tracking only available for WFRP"

**Success Criteria**: ✅ System type validation

---

### 🧪 Integration Test Scenarios

#### Test Case 5.27: Full Combat Critical Flow
```
Scenario: Character at 0 wounds takes damage
1. "Test Character is at 0 wounds"
2. "Roll a body critical for Test Character with -20 modifier"
3. "Check Test Character's critical wounds"
4. "Show me Test Character's injuries"
```
**Expected Result**:
- Random body critical added
- Modifier applied to roll
- Full status report shows the new critical
- Detailed injury information displayed

**Success Criteria**: ✅ Complete combat critical workflow

---

#### Test Case 5.28: Multiple Criticals, Multiple Locations
```
Scenario: Character accumulates various injuries
1. "Add Minor Head Injury to Test Character at Head"
2. "Add Cracked Ribs to Test Character at Body"
3. "Roll an arm critical for Test Character"
4. "Check Test Character's critical wounds"
```
**Expected Result**:
- Three criticals added (two specific, one rolled)
- Each at different location
- Status shows all three grouped by location
- Count: 3 / [TB]
- Full details for each critical

**Success Criteria**: ✅ Multiple criticals tracked correctly

---

#### Test Case 5.29: Critical Death Sequence
```
Scenario: Character dies from accumulated criticals
Setup: Character has criticals = Toughness Bonus - 1
1. "Check death threshold for Test Character"
   - Shows: One away from death
2. "Add Minor Head Injury to Test Character at Head"
   - Result: At threshold, still alive
3. "Check if Test Character dies from criticals"
   - Shows: At threshold
4. "Roll a leg critical for Test Character"
   - Result: ☠️ DEATH
5. "Check death status for Test Character"
   - Confirms: Dead
```
**Expected Result**:
- Progressive warnings as death approaches
- Clear death indication when exceeded
- Threshold mechanics work correctly

**Success Criteria**: ✅ Death threshold properly enforced

---

#### Test Case 5.30: Recovery Over Time
```
Scenario: Character heals multiple criticals
Setup: Character has 3 criticals
1. "Show Test Character's injuries"
   - Lists all 3 criticals
2. "Remove [Critical 1] from Test Character"
   - Count: 3 → 2
3. "Remove [Critical 2] from Test Character"
   - Count: 2 → 1
4. "Remove [Critical 3] from Test Character"
   - Count: 1 → 0, Status: Healthy
5. "Check Test Character's critical wounds"
   - Result: No criticals, fully recovered
```
**Expected Result**:
- Each removal decrements count
- Last removal returns to healthy
- Status updates at each stage

**Success Criteria**: ✅ Full recovery progression

---

### 📊 Technical Validation Tests

#### Test Case 5.31: UUID Construction Verification
```
Technical check: Verify UUID pattern
1. Add critical and check Foundry logs
2. Verify UUID format: `Compendium.${pack}.${id}`
3. Confirm UUID construction uses pack + id (not uuid field)
4. Verify same pattern as career change fix (v0.2.2)
```
**Expected Result**:
- UUID correctly constructed from pack and id
- Pattern: `Compendium.wfrp4e-core.criticals.abc123`
- Item successfully added from compendium

**Success Criteria**: ✅ UUID construction matches v0.2.2 pattern

---

#### Test Case 5.32: Compendium Search Validation
```
Technical check: Verify compendium search
1. Search for "Minor Head Injury" - should find
2. Search for "minoR HeAd injURY" - case insensitive
3. Search for partial match - finds closest
4. Search for non-existent - error
```
**Expected Result**:
- Exact matches found
- Case-insensitive search works
- Best match logic functions
- Clear errors for no matches

**Success Criteria**: ✅ Robust compendium search

---

#### Test Case 5.33: Wounds vs Critical Wounds Separation
```
Technical check: Verify complete separation
1. Character at 10/15 Wounds, 0 Criticals
2. Add critical
3. Check: Wounds still 10/15, Criticals now 1
4. Add another critical
5. Check: Wounds still 10/15, Criticals now 2
```
**Expected Result**:
- Wounds stat NEVER changes when adding criticals
- Critical count tracked separately
- Two completely independent systems

**Success Criteria**: ✅ Wounds and criticals are separate

---

#### Test Case 5.34: Location String Handling
```
Technical check: Verify all location variations
1. Test "Head" - works
2. Test "Body" - works
3. Test "Left Arm" - works
4. Test "Right Arm" - works
5. Test "Left Leg" - works
6. Test "Right Leg" - works
7. Test "Arm" (for rolling) - randomly becomes L/R
8. Test "Leg" (for rolling) - randomly becomes L/R
```
**Expected Result**:
- All specific locations handled
- General locations (Arm/Leg) randomized correctly
- Location stored in system.location.value

**Success Criteria**: ✅ All location types work

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

## 📋 ACTUAL TEST RESULTS

### Test Case 1.1: Basic Character Retrieval

**Test ID**: 1.1  
**Test Name**: Basic Character Retrieval  
**Date Tested**: October 5, 2025  
**Tester**: Claude  
**Claude Desktop Version**: Claude Sonnet 4.5  
**Foundry VTT Version**: [Connected]  
**WFRP4e System Version**: WFRP4e-core  

**Status**: ❌ **FAIL**

**Results**:
Character information was partially retrieved. The tool returned:
- ✅ Character name: Test Character
- ✅ All 10 characteristics with values, advances, and bonuses
- ✅ Current wounds: 15/15
- ✅ Talents list (6 talents: Marksman, Doomed, Warrior Born, Suave, Strong Back, Savvy)
- ⚠️ Partial inventory (weapons, armor, money, clothing)
- ✅ Active conditions: Fatigued
- ❌ Skills list incomplete - only 2 skills returned (Dodge, Entertain) with no advances data shown
- ❌ Fortune and Fate points not returned

**Issues Found**:
1. **Missing Fortune/Fate Data**: Fortune and Fate points not returned in data structure
2. **Incomplete Skills List**: Only 2 skills returned (Dodge, Entertain) without advance values
   - For a WFRP4e Soldier career character, expected additional career skills like:
     - Melee (Basic)
     - Athletics
     - Endurance
     - Intimidate
     - Leadership
     - etc.
3. **Missing Skills Advances**: Skills returned don't show advances count

**Error Messages**: None

**Root Cause Analysis**:
The MCP tool `foundry-get-character-info` is not querying the complete character data structure from Foundry VTT. Possible causes:
1. Query may not be accessing `actor.system.skills` properly
2. Fortune/Fate might be in a different data path than expected
3. Skills array might be filtered incorrectly or have incorrect property access

**Priority**: 🔴 **HIGH** - Core functionality failure. Skills are fundamental to WFRP4e gameplay.

**Recommended Fix**:
1. Review `packages/mcp-server/src/tools/character.ts` - `handleGetCharacterInfo` method
2. Check data access paths:
   - Skills: `actor.system.skills` or `actor.items` (filter type='skill')
   - Fortune: `actor.system.status.fortune.value`
   - Fate: `actor.system.status.fate.value`
3. Ensure all skills are being iterated and advances are accessed correctly
4. Add logging to verify data structure being received from Foundry

**Next Steps**:
- [X] Investigate character.ts data extraction
- [X] Fix skills query to return all skills with advances
- [X] Add Fortune/Fate to response
- [ ] Rebuild MCP server (`npm run build` in packages/mcp-server)
- [ ] Restart MCP server
- [ ] Retest Test Case 1.1
- [ ] Update test status once fixed

**Fix Applied**: October 5, 2025 (Second Iteration)
- Modified `extractBasicInfo()` to include Fortune and Fate from `system.status.fortune` and `system.status.fate`
- Added Experience tracking (current, total, spent)
- Modified `extractStats()` to extract skills from items array (filter `type === 'skill'`) instead of non-existent `system.skills` object
- Modified `extractStats()` to extract talents from items array (filter `type === 'talent'`) instead of `system.talents`
- Fixed skills to include: characteristic, advances, total, and modifier
- Fixed talents to include: name, advances, tests, and description
- Modified `formatItems()` to exclude skills and talents (now in stats section)
- Increased items limit from 20 to 50 for better inventory visibility
- Added equipped/worn status to items

**Second Fix Applied**: October 5, 2025
- ✅ **Fixed Fortune/Fate Structure**: Changed from object with current/max to single numeric value (Fortune and Fate don't have separate max properties - they ARE the max values for Fortune/Resolve pools)
- ✅ **Added Resilience and Resolve**: New WFRP4e properties representing determination and personal drive
- ✅ **Added Corruption Tracking**: Displays current and max corruption points from `system.status.corruption`
- ✅ **Added Critical Wounds Tracking**: Filters items with `type === 'critical'` and displays count, location, severity, and descriptions
- ✅ **Fixed Money Display**: Properly filters `type === 'money'` items and displays only items with quantity > 0, using item name as currency name (e.g., "Gold Crown", "Silver Shilling", "Brass Penny")
- ✅ **Improved Data Accuracy**: All values now correctly extracted from WFRP4e data model structure verified in wfrp.js

**Data Structure Corrections Based on wfrp.js Analysis**:
```typescript
// Fortune/Fate - Single value, no max property
system.status.fortune.value  // e.g., 4
system.status.fate.value     // e.g., 4

// Resilience/Resolve - Single value
system.status.resilience.value  // e.g., 3
system.status.resolve.value     // e.g., 3

// Corruption - Has value and max
system.status.corruption.value  // Current corruption
system.status.corruption.max    // Maximum before mutation

// Critical Wounds - Items, not status property
items.filter(item => item.type === 'critical')

// Money - Items with coinValue
items.filter(item => item.type === 'money')
item.system.quantity.value  // Amount of this coin type
```

---

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
