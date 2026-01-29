# Character Tools Test Plan

**Date**: January 29, 2026  
**Tester**: Claude (Automated)  
**Scope**: Test Cases 1.1 - 1.30 (Character Tools)  
**Test Character**: To be identified from Foundry

---

## Pre-Test Setup

Before executing tests, the following must be verified:
1. [ ] Foundry VTT is running on port 30000
2. [ ] MCP connection is active
3. [ ] Test character exists with basic stats
4. [ ] Character has skills, talents, and items for testing

---

## Test Execution Plan

### Phase 1: Basic Retrieval (1.1 - 1.2)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.1 | Basic Character Retrieval | Character exists |
| 1.2 | Non-Existent Character | None |

### Phase 2: Single Updates (1.3 - 1.5)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.3 | Update Single Characteristic | Character exists |
| 1.3b | Advance Characteristic (XP-Based) | Character has XP |
| 1.4 | Update Multiple Stats | Character exists |
| 1.5 | Invalid Stat Update (999) | Character exists |

### Phase 3: Multiple Updates (1.6 - 1.7)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.6 | Update Multiple Characteristics | Character exists |
| 1.7 | Update Status Values | Character exists |

### Phase 4: Edge Cases (1.8 - 1.12)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.8 | Set Characteristic to Zero | Character exists |
| 1.9 | Set Characteristic Below Zero | Character exists |
| 1.10 | Set Wounds Above Maximum | Character exists |
| 1.11 | Fortune Above Fate Maximum | Character has Fate |
| 1.12 | Resolve Above Resilience Maximum | Character has Resilience |

### Phase 5: Information Retrieval (1.13 - 1.16)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.13 | Get Complete Details | Character exists |
| 1.14 | Get Specific Sections | Character has skills/talents |
| 1.15 | Get Character With No Items | Remove items first |
| 1.16 | Get Character With Conditions | Add condition first |

### Phase 6: Input Variations (1.17 - 1.19)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.17 | Partial Name Match (WS) | Character exists |
| 1.18 | Mixed Valid/Invalid Stats | Character exists |
| 1.19 | Case Insensitive Name | Character exists |

### Phase 7: Persistence & Integration (1.20 - 1.23)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.20 | Verify Persistence | Character exists |
| 1.21 | Character Creation Flow | Character exists |
| 1.22 | Combat Damage Flow | Character exists |
| 1.23 | Fortune/Fate Management | Character has Fortune/Fate tools |

### Phase 8: Technical Validation (1.24 - 1.30)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 1.24 | WFRP Data Structure Verification | Character exists |
| 1.25 | Update vs Advance Tool Selection | Character has XP |
| 1.26 | Character Type Validation | WFRP character exists |
| 1.27 | Concurrent Update Handling | Character exists |
| 1.28 | Empty Character Name Handling | None |
| 1.29 | Special Characters in Names | Create test characters |
| 1.30 | Maximum Data Load Test | Character with extensive data |

---

## Test Case Details

### Test 1.1: Basic Character Retrieval
**Prompt**: "Get me the information for [Test Character]"  
**Expected**: All characteristics, wounds, fortune, fate, skills, talents, items returned  
**Tool**: `foundry-get-character-info`

### Test 1.2: Non-Existent Character
**Prompt**: "Get me the information for NonExistentCharacter123"  
**Expected**: Clear error message stating character not found  
**Tool**: `foundry-get-character-info`

### Test 1.3: Update Single Characteristic (Direct Set)
**Prompt**: "Update [Character]'s Strength to 40"  
**Expected**: Strength initial=40, advances=0, XP unchanged  
**Tool**: `foundry-update-character-info`

### Test 1.3b: Advance Characteristic (XP-Based)
**Prompt**: "Advance [Character]'s Strength by 9 advances"  
**Expected**: XP deducted (~765), advances increased by 9  
**Tool**: `advance-characteristic`

### Test 1.4: Update Multiple Stats
**Prompt**: "Update [Character]: set current wounds to 10, fortune to 2, fate to 1"  
**Expected**: All three values updated  
**Tool**: `foundry-update-character-info`

### Test 1.5: Invalid Stat Update
**Prompt**: "Set [Character]'s Strength to 999"  
**Expected**: Warning about unrealistic value or capped at 100  
**Tool**: `foundry-update-character-info`

### Test 1.6: Update Multiple Characteristics
**Prompt**: "Update [Character]: Strength to 35, Toughness to 40, Initiative to 30"  
**Expected**: All three characteristics updated, advances=0, XP unchanged  
**Tool**: `foundry-update-character-info`

### Test 1.7: Update Status Values
**Prompt**: "Update [Character]: current wounds to 15, fortune to 3, resolve to 2"  
**Expected**: All status values updated (capped if exceeding max)  
**Tool**: `foundry-update-character-info`

### Test 1.8: Update Characteristic to Zero
**Prompt**: "Set [Character]'s Strength initial to 0"  
**Expected**: Value accepted with warning about unusual value  
**Tool**: `foundry-update-character-info`

### Test 1.9: Update Characteristic Below Zero
**Prompt**: "Set [Character]'s Agility to -10"  
**Expected**: Error or value clamped to 0  
**Tool**: `foundry-update-character-info`

### Test 1.10: Update Wounds Above Maximum
**Prompt**: "Set [Character]'s current wounds to 100"  
**Expected**: Updated or capped at max with warning  
**Tool**: `foundry-update-character-info`

### Test 1.11: Fortune Above Fate Maximum
**Prompt**: "Give [Character] 10 fortune points"  
**Expected**: Fortune capped at Fate maximum  
**Tool**: `foundry-update-character-info` or Fortune tool

### Test 1.12: Resolve Above Resilience Maximum
**Prompt**: "Set [Character]'s resolve to 10"  
**Expected**: Resolve capped at Resilience maximum  
**Tool**: `foundry-update-character-info`

### Test 1.13: Get Complete Details
**Prompt**: "Show me complete information for [Character]"  
**Expected**: Identity, characteristics, status, skills, talents, items, conditions, XP, biography, corruption  
**Tool**: `foundry-get-character-info`

### Test 1.14: Get Specific Sections
**Prompt**: "Show me [Character]'s skills and talents only"  
**Expected**: Filtered output with only skills and talents  
**Tool**: `foundry-get-character-info`

### Test 1.15: Get Character With No Items
**Setup**: Remove all items from character  
**Prompt**: "Get info for [Character]"  
**Expected**: Items section shows empty, no errors  
**Tool**: `foundry-get-character-info`

### Test 1.16: Get Character With Conditions
**Setup**: Add condition (Bleeding, Stunned, etc.)  
**Prompt**: "Show [Character]'s status"  
**Expected**: Conditions listed with name, value, duration  
**Tool**: `foundry-get-character-info`

### Test 1.17: Partial Name Match (Abbreviation)
**Prompt**: "Update [Character]'s WS to 45"  
**Expected**: Weapon Skill recognized and updated  
**Tool**: `foundry-update-character-info`

### Test 1.18: Mixed Valid/Invalid Stats
**Prompt**: "Update [Character]: Strength to 35, InvalidStat to 50, Toughness to 40"  
**Expected**: Valid stats updated, InvalidStat rejected with error  
**Tool**: `foundry-update-character-info`

### Test 1.19: Case Insensitive Name
**Prompt**: "Get info for [character name in lowercase]"  
**Expected**: Character found despite case mismatch  
**Tool**: `foundry-get-character-info`

### Test 1.20: Verify Persistence
**Steps**:
1. Update Strength to 42
2. Get character info (verify 42)
3. Request Foundry refresh
4. Get character info again (verify still 42)  
**Expected**: Data persists across calls and refreshes

### Test 1.21: Character Creation Flow
**Steps**:
1. Update S=30, T=35, Ag=33
2. Update I=32, WP=28, Fel=35
3. Set wounds=13, fortune=2, fate=2
4. Get complete info  
**Expected**: Full character setup completed

### Test 1.22: Combat Damage Flow
**Steps**:
1. Get current wounds
2. Set wounds to 8 (damage)
3. Verify 8 wounds
4. Set wounds back to max (heal)
5. Verify healed  
**Expected**: Wounds tracking works correctly

### Test 1.23: Fortune/Fate Management Flow
**Steps**:
1. Get fortune status
2. Spend fortune point
3. Verify fortune decreased
4. Add fortune point
5. Burn fate point
6. Verify both reduced  
**Expected**: Fortune/Fate system works

### Test 1.24: WFRP Data Structure Verification
**Technical**: Verify data paths:
- `system.characteristics.s.initial`
- `system.status.wounds.value`
- `system.status.fortune.value`  
**Expected**: All paths return correct data

### Test 1.25: Update vs Advance Tool Selection
**Steps**:
1. "Update Strength to 40" → update-character-info
2. "Advance Strength by 5" → advance-characteristic  
**Expected**: Correct tool selected by phrasing

### Test 1.26: Character Type Validation
**Test**: Get/update WFRP vs non-WFRP actor  
**Expected**: WFRP works, non-WFRP handled gracefully

### Test 1.27: Concurrent Update Handling
**Prompt**: Update 8 characteristics in one call  
**Expected**: All 8 updated without race conditions

### Test 1.28: Empty Character Name Handling
**Prompt**: "Get info for ''"  
**Expected**: Error about empty name

### Test 1.29: Special Characters in Names
**Test**: Characters with hyphen, apostrophe, exclamation  
**Expected**: Names handled correctly

### Test 1.30: Maximum Data Load Test
**Setup**: Character with 50+ skills, 30+ talents, 100+ items  
**Prompt**: "Get complete info"  
**Expected**: All data retrieved without truncation

---

## Results Summary

Results will be documented in [test_result.md](test_result.md)

| Phase | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| 1 | 1.1-1.2 | - | - | - |
| 2 | 1.3-1.5 | - | - | - |
| 3 | 1.6-1.7 | - | - | - |
| 4 | 1.8-1.12 | - | - | - |
| 5 | 1.13-1.16 | - | - | - |
| 6 | 1.17-1.19 | - | - | - |
| 7 | 1.20-1.23 | - | - | - |
| 8 | 1.24-1.30 | - | - | - |
| **Total** | **30** | **-** | **-** | **-** |
