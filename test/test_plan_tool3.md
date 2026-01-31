# Corruption & Mutation Tools Test Plan

**Date**: January 31, 2026  
**Tester**: Claude (Automated)  
**Scope**: Test Cases 3.1 - 3.35 (Corruption & Mutation Tools)  
**Test Character**: Test Character (to be verified)

---

## Pre-Test Setup

Before executing tests, the following must be verified:
1. [ ] Foundry VTT is running on port 30000
2. [ ] MCP connection is active
3. [ ] Backend server running (`npm run mcp:start`)
4. [ ] Test character exists with WFRP 4e system
5. [ ] Character has known Toughness Bonus (TB) and Willpower Bonus (WP)
6. [ ] Character corruption set to 0 (clean starting state)
7. [ ] No mutations on character initially (or document existing ones)

---

## Threshold Reference

### WFRP 4e Corruption Thresholds
Thresholds are calculated as **WP Bonus + Toughness Bonus**:

| Threshold | Formula | Example (WP 3 + T 4) |
|-----------|---------|----------------------|
| Minor | WP Bonus + T Bonus | 7 |
| Moderate | 2 × (WP Bonus + T Bonus) | 14 |
| Major | 3 × (WP Bonus + T Bonus) | 21 |

### Warning Levels
| Level | Condition |
|-------|-----------|
| ✅ Uncorrupted | corruption < minor threshold |
| ⚠️ Tainted | corruption >= minor && < moderate |
| 🔶 Corrupted | corruption >= moderate && < major |
| ☠️ Lost | corruption >= major |

---

## Tools Under Test

| Tool | Purpose |
|------|---------|
| `get-corruption-status` | Check corruption points and mutation status |
| `add-corruption` | Add corruption points from Chaos exposure |
| `remove-corruption` | Remove corruption via cleansing/rituals |
| `list-mutations` | List all active mutations on a character |
| `add-mutation` | Add a mutation from compendium or custom |
| `remove-mutation` | Remove a mutation from a character |

---

## Test Execution Plan

### Phase 1: Initial State & Basic Retrieval (3.1-3.3)

| Test | Description | Automated |
|------|-------------|-----------|
| 3.1 | Get corruption status - Clean state | ✅ Yes |
| 3.2 | List mutations - Empty list | ✅ Yes |
| 3.3 | Get corruption status - Verify threshold calculation | ✅ Yes |

### Phase 2: Adding Corruption (3.4-3.11)

| Test | Description | Automated |
|------|-------------|-----------|
| 3.4 | Add minor corruption (1 point) | ✅ Yes |
| 3.5 | Add corruption with reason | ✅ Yes |
| 3.6 | Add corruption - Reach minor threshold | ✅ Yes |
| 3.7 | Add corruption - Exceed threshold | ✅ Yes |
| 3.8 | Add corruption - Multiple thresholds | ✅ Yes |
| 3.9 | Add corruption - Large amount (10 points) | ✅ Yes |
| 3.10 | Add corruption - Zero amount (validation) | ✅ Yes |
| 3.11 | Add corruption - Negative amount (validation) | ✅ Yes |

### Phase 3: Removing Corruption (3.12-3.18)

| Test | Description | Automated |
|------|-------------|-----------|
| 3.12 | Remove corruption - Partial removal | ✅ Yes |
| 3.13 | Remove corruption - Complete cleansing | ✅ Yes |
| 3.14 | Remove corruption - More than current | ✅ Yes |
| 3.15 | Remove corruption - At zero | ✅ Yes |
| 3.16 | Remove corruption - Below threshold | ✅ Yes |
| 3.17 | Remove corruption - Zero amount (validation) | ✅ Yes |
| 3.18 | Remove corruption - Negative amount (validation) | ✅ Yes |

### Phase 4: Adding Mutations (3.19-3.26)

| Test | Description | Automated |
|------|-------------|-----------|
| 3.19 | Add mutation - From compendium (physical) | ✅ Yes |
| 3.20 | Add mutation - From compendium (mental) | ✅ Yes |
| 3.21 | Add mutation - UUID construction verify | ✅ Yes |
| 3.22 | Add mutation - Not found in compendium | ✅ Yes |
| 3.23 | Add mutation - Duplicate prevention | ✅ Yes |
| 3.24 | Add mutation - Custom with type/description | ✅ Yes |
| 3.25 | Add mutation - Custom missing type (validation) | ✅ Yes |
| 3.26 | List mutations - After adding multiple | ✅ Yes |

### Phase 5: Removing Mutations (3.27-3.30)

| Test | Description | Automated |
|------|-------------|-----------|
| 3.27 | Remove mutation - By exact name | ✅ Yes |
| 3.28 | Remove mutation - By partial name | ✅ Yes |
| 3.29 | Remove mutation - Not found | ✅ Yes |
| 3.30 | List mutations - After removal | ✅ Yes |

### Phase 6: Integration & Edge Cases (3.31-3.35)

| Test | Description | Automated |
|------|-------------|-----------|
| 3.31 | Full corruption/mutation workflow | ✅ Yes |
| 3.32 | Non-existent character handling | ✅ Yes |
| 3.33 | Empty character name handling | ✅ Yes |
| 3.34 | Data persistence verification | ✅ Yes |
| 3.35 | Threshold recalculation after stat change | ⚠️ Partial |

---

## Detailed Test Procedures

### Phase 1: Initial State & Basic Retrieval

#### Test 3.1: Get Corruption Status - Clean State
**Setup**: Ensure Test Character has 0 corruption

**Execution**:
```
Tool: get-corruption-status
Parameters: characterName = "Test Character"
```

**Expected Result**:
- Current corruption: 0
- Warning level: "Uncorrupted" (✅)
- No threshold warnings
- Shows WP Bonus and T Bonus values
- Shows calculated thresholds

**Verification Points**:
- [ ] Corruption value = 0
- [ ] Warning level is clean/uncorrupted
- [ ] Threshold values displayed
- [ ] Character found successfully

---

#### Test 3.2: List Mutations - Empty List
**Setup**: Character has no mutations

**Execution**:
```
Tool: list-mutations
Parameters: characterName = "Test Character"
```

**Expected Result**:
- Message: "No mutations" or empty list
- Physical mutations: 0
- Mental mutations: 0
- Clean character state confirmed

**Verification Points**:
- [ ] Empty mutation list
- [ ] No errors
- [ ] Character found

---

#### Test 3.3: Get Corruption Status - Verify Threshold Calculation
**Setup**: Note character's WP Bonus and T Bonus

**Execution**:
```
Tool: get-corruption-status
Parameters: characterName = "Test Character"
```

**Expected Result**:
- If WP Bonus = 3, T Bonus = 4:
  - Minor threshold = 7
  - Moderate threshold = 14
  - Major threshold = 21
- Formula: threshold = WP Bonus + T Bonus

**Verification Points**:
- [ ] Minor = WP + T
- [ ] Moderate = 2 × (WP + T)
- [ ] Major = 3 × (WP + T)

---

### Phase 2: Adding Corruption

#### Test 3.4: Add Minor Corruption (1 Point)
**Setup**: Character at 0 corruption

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = 1
  reason = "Witnessed dark magic ritual"
```

**Expected Result**:
- Corruption: 0 → 1
- Severity: Minor (1 point)
- Reason logged
- Confirmation message
- Still below minor threshold (if threshold > 1)

**Verification Points**:
- [ ] Corruption increased by exactly 1
- [ ] Reason displayed in response
- [ ] No threshold warning (if threshold > 1)

---

#### Test 3.5: Add Corruption With Reason
**Setup**: Continue from Test 3.4 (corruption = 1)

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = 2
  reason = "Touched Chaos artifact while investigating cultist lair"
```

**Expected Result**:
- Corruption: 1 → 3
- Severity: Moderate (2-3 points)
- Reason clearly shown
- Narrative reason for corruption recorded
- GM can track corruption sources

**Verification Points**:
- [ ] Corruption = 3
- [ ] Reason text preserved
- [ ] Severity indicator shown

---

#### Test 3.6: Add Corruption - Reach Minor Threshold
**Setup**: Set corruption to (threshold - 1)
- If threshold = 7, ensure corruption = 6

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = 1
  reason = "Breathing corrupted air"
```

**Expected Result**:
- Corruption reaches exact threshold
- ⚠️ "Minor threshold reached!"
- Warning: "Roll on Minor Mutation Table!"
- GM notification to roll for mutation
- Warning level changes to "Tainted"

**Verification Points**:
- [ ] Threshold reached message
- [ ] Mutation roll suggestion
- [ ] Warning level updated

---

#### Test 3.7: Add Corruption - Exceed Threshold
**Setup**: Character at threshold (e.g., 7)

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = 1
  reason = "Prolonged chaos exposure"
```

**Expected Result**:
- Corruption exceeds threshold
- ⚠️ "Corruption above minor threshold!"
- Strong warning about mutation requirement
- Character marked as Tainted
- Points until next threshold shown

**Verification Points**:
- [ ] Warning about exceeding threshold
- [ ] Clear mutation guidance
- [ ] Progress to next threshold shown

---

#### Test 3.8: Add Corruption - Multiple Thresholds
**Setup**: Character below moderate threshold

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = 10
  reason = "Consumed by warp rift"
```

**Expected Result**:
- Multiple thresholds potentially crossed
- Strong warning: "Multiple mutation thresholds!"
- Suggestion for multiple mutation rolls
- Dramatic escalation warning
- "Corrupted" or "Lost" warning level

**Verification Points**:
- [ ] Multiple threshold warnings
- [ ] Appropriate severity response
- [ ] Character status update

---

#### Test 3.9: Add Corruption - Large Amount (10 Points)
**Setup**: Any corruption state

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = 10
  reason = "Direct daemon contact"
```

**Expected Result**:
- 10 corruption points added (maximum allowed)
- Severity: Severe (4+ points)
- Major corruption event warning
- Dramatic narrative message
- Strongly suggests mutation rolls

**Verification Points**:
- [ ] 10 points added successfully
- [ ] Maximum amount accepted
- [ ] Appropriate severity messaging

---

#### Test 3.10: Add Corruption - Zero Amount (Validation)
**Setup**: Any corruption state

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = 0
  reason = "Testing zero"
```

**Expected Result**:
- Error: "Amount must be between 1 and 10"
- OR: "Corruption amount must be greater than 0"
- No change to character
- Validation prevents invalid input

**Verification Points**:
- [ ] Error message displayed
- [ ] No corruption change
- [ ] Helpful guidance provided

---

#### Test 3.11: Add Corruption - Negative Amount (Validation)
**Setup**: Any corruption state

**Execution**:
```
Tool: add-corruption
Parameters:
  characterName = "Test Character"
  amount = -5
  reason = "Testing negative"
```

**Expected Result**:
- Error: "Amount must be positive" or "Use remove-corruption"
- No change to character
- Validation prevents negative input
- Guidance to use correct tool

**Verification Points**:
- [ ] Error about negative value
- [ ] Guidance to use remove-corruption
- [ ] No corruption change

---

### Phase 3: Removing Corruption

#### Test 3.12: Remove Corruption - Partial Removal
**Setup**: Character has 10 corruption points

**Execution**:
```
Tool: remove-corruption
Parameters:
  characterName = "Test Character"
  amount = 3
  reason = "Cleansing ritual by Priest of Shallya"
```

**Expected Result**:
- Corruption: 10 → 7
- Reason logged
- Partial cleansing confirmed
- Remaining corruption shown
- Progress toward purity noted

**Verification Points**:
- [ ] Exactly 3 points removed
- [ ] Reason displayed
- [ ] Remaining corruption correct

---

#### Test 3.13: Remove Corruption - Complete Cleansing
**Setup**: Character has 5 corruption points

**Execution**:
```
Tool: remove-corruption
Parameters:
  characterName = "Test Character"
  amount = 5
  reason = "Completed pilgrimage to sacred shrine"
```

**Expected Result**:
- Corruption: 5 → 0
- ✅ "Character fully cleansed!"
- Dramatic purification message
- Character returns to "Uncorrupted" status
- Warning level reset

**Verification Points**:
- [ ] Corruption = 0
- [ ] Full cleansing message
- [ ] Status updated to clean

---

#### Test 3.14: Remove Corruption - More Than Current
**Setup**: Character has 3 corruption points

**Execution**:
```
Tool: remove-corruption
Parameters:
  characterName = "Test Character"
  amount = 10
  reason = "Powerful divine intervention"
```

**Expected Result**:
- Corruption: 3 → 0 (clamped)
- Warning: "Only had 3 corruption to remove"
- Cannot go negative
- Character fully cleansed
- Shows actual amount removed

**Verification Points**:
- [ ] Clamped to 0
- [ ] Warning about excess removal
- [ ] Actual removal amount shown

---

#### Test 3.15: Remove Corruption - At Zero
**Setup**: Character has 0 corruption

**Execution**:
```
Tool: remove-corruption
Parameters:
  characterName = "Test Character"
  amount = 1
  reason = "Unnecessary cleansing"
```

**Expected Result**:
- Error: "Character has no corruption to remove"
- OR: "Character is already pure"
- No changes made
- Clear message about current state

**Verification Points**:
- [ ] Error or info message
- [ ] No change (still 0)
- [ ] Helpful context provided

---

#### Test 3.16: Remove Corruption - Below Threshold
**Setup**: Character has 10 corruption (above threshold of 7)

**Execution**:
```
Tool: remove-corruption
Parameters:
  characterName = "Test Character"
  amount = 5
  reason = "Extended prayers and fasting"
```

**Expected Result**:
- Corruption: 10 → 5
- Now below threshold (5 < 7)
- Message: "Corruption reduced below mutation threshold"
- Note: Existing mutations remain
- Warning level improves

**Verification Points**:
- [ ] Below threshold message
- [ ] Warning about existing mutations
- [ ] Status improvement noted

---

#### Test 3.17: Remove Corruption - Zero Amount (Validation)
**Setup**: Character has corruption points

**Execution**:
```
Tool: remove-corruption
Parameters:
  characterName = "Test Character"
  amount = 0
  reason = "Testing zero removal"
```

**Expected Result**:
- Error: "Amount must be positive"
- No change to character
- Validation prevents invalid input

**Verification Points**:
- [ ] Error message
- [ ] No corruption change

---

#### Test 3.18: Remove Corruption - Negative Amount (Validation)
**Setup**: Character has corruption points

**Execution**:
```
Tool: remove-corruption
Parameters:
  characterName = "Test Character"
  amount = -3
  reason = "Testing negative removal"
```

**Expected Result**:
- Error: "Amount must be positive"
- Guidance to use positive number
- No changes to character

**Verification Points**:
- [ ] Error about negative value
- [ ] No corruption change

---

### Phase 4: Adding Mutations

#### Test 3.19: Add Mutation - From Compendium (Physical)
**Setup**: Character has no "Animalistic Legs" mutation

**Execution**:
```
Tool: add-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "Animalistic Legs"
```

**Expected Result**:
- Mutation found in compendium
- Added to character as physical type
- Full description from compendium
- Effects applied
- Visible in mutations list

**Verification Points**:
- [ ] Mutation added
- [ ] Type = physical
- [ ] Description present
- [ ] From official compendium

---

#### Test 3.20: Add Mutation - From Compendium (Mental)
**Setup**: Character has no "Irrational Hatred" mutation

**Execution**:
```
Tool: add-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "Irrational Hatred"
```

**Expected Result**:
- Mutation found in compendium
- Added as mental type
- Behavioral effects noted
- Roleplay guidance included

**Verification Points**:
- [ ] Mutation added
- [ ] Type = mental
- [ ] Mental effects described

---

#### Test 3.21: Add Mutation - UUID Construction Verify
**Setup**: Technical verification test

**Execution**:
```
Tool: add-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "Warped Body"
```

**Expected Result**:
- UUID format: `Compendium.{pack}.Item.{id}`
- Same pattern as career change fix
- Successfully added from compendium
- No UUID errors in logs

**Verification Points**:
- [ ] No UUID errors
- [ ] Mutation added successfully
- [ ] Compendium integration works

---

#### Test 3.22: Add Mutation - Not Found in Compendium
**Setup**: Use non-existent mutation name

**Execution**:
```
Tool: add-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "NonExistentMutation123XYZ"
```

**Expected Result**:
- Error: "Mutation not found in compendium"
- Suggestion to check spelling
- OR: Prompt for custom mutation details
- Examples of available mutations
- No changes to character

**Verification Points**:
- [ ] Clear error message
- [ ] Spelling suggestion
- [ ] No partial changes

---

#### Test 3.23: Add Mutation - Duplicate Prevention
**Setup**: Character already has "Animalistic Legs" from Test 3.19

**Execution**:
```
Tool: add-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "Animalistic Legs"
```

**Expected Result**:
- Error: "Character already has this mutation"
- No duplicate created
- Clear warning message
- Current mutation unaffected

**Verification Points**:
- [ ] Duplicate prevented
- [ ] Clear error message
- [ ] Only one instance exists

---

#### Test 3.24: Add Mutation - Custom With Type/Description
**Setup**: Creating custom homebrew mutation

**Execution**:
```
Tool: add-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "Glowing Eyes"
  mutationType = "physical"
  description = "Eyes glow with an eerie green light in darkness. -10 to Stealth tests in dark environments."
```

**Expected Result**:
- Custom mutation created
- Type: physical
- Description saved
- Visible in mutations list
- No compendium required

**Verification Points**:
- [ ] Custom mutation created
- [ ] Type = physical
- [ ] Description preserved
- [ ] Listed with other mutations

---

#### Test 3.25: Add Mutation - Custom Missing Type (Validation)
**Setup**: Attempt custom mutation without required fields

**Execution**:
```
Tool: add-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "AnotherCustomMutation"
  # Missing: mutationType and description
```

**Expected Result**:
- If not in compendium AND no type/description:
- Error: "Custom mutations require type and description"
- Guidance on required parameters
- No partial creation

**Verification Points**:
- [ ] Error about missing fields
- [ ] Guidance on requirements
- [ ] No partial mutation

---

#### Test 3.26: List Mutations - After Adding Multiple
**Setup**: Character has mutations from Tests 3.19, 3.20, 3.24

**Execution**:
```
Tool: list-mutations
Parameters:
  characterName = "Test Character"
```

**Expected Result**:
- All mutations listed
- Separated by type (physical/mental)
- Shows:
  - Animalistic Legs (physical)
  - Irrational Hatred (mental)
  - Glowing Eyes (physical, custom)
- Descriptions included
- Effects noted

**Verification Points**:
- [ ] All mutations shown
- [ ] Correct type categorization
- [ ] Descriptions present

---

### Phase 5: Removing Mutations

#### Test 3.27: Remove Mutation - By Exact Name
**Setup**: Character has "Glowing Eyes" mutation

**Execution**:
```
Tool: remove-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "Glowing Eyes"
```

**Expected Result**:
- Mutation removed successfully
- Note: "Mutation removal is extremely rare in WFRP 4e"
- Confirmation of removal
- No longer in mutations list

**Verification Points**:
- [ ] Mutation removed
- [ ] Rarity note shown
- [ ] Not in list anymore

---

#### Test 3.28: Remove Mutation - By Partial Name
**Setup**: Character has "Animalistic Legs" mutation

**Execution**:
```
Tool: remove-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "Animalistic"
```

**Expected Result**:
- Finds mutation by partial match (case-insensitive)
- "Animalistic Legs" removed
- Confirmation shows full name
- Partial matching works

**Verification Points**:
- [ ] Partial match found
- [ ] Correct mutation removed
- [ ] Full name in confirmation

---

#### Test 3.29: Remove Mutation - Not Found
**Setup**: Character doesn't have specified mutation

**Execution**:
```
Tool: remove-mutation
Parameters:
  characterName = "Test Character"
  mutationName = "NonExistentMutation"
```

**Expected Result**:
- Error: "Mutation not found on character"
- List of current mutations shown
- Suggestion to check spelling
- No changes made

**Verification Points**:
- [ ] Error message
- [ ] Current mutations listed
- [ ] No changes

---

#### Test 3.30: List Mutations - After Removal
**Setup**: After removing mutations in Tests 3.27, 3.28

**Execution**:
```
Tool: list-mutations
Parameters:
  characterName = "Test Character"
```

**Expected Result**:
- Only remaining mutations shown
- "Irrational Hatred" (mental) should remain
- Removed mutations not listed
- Accurate current state

**Verification Points**:
- [ ] Only remaining mutations
- [ ] Removed ones gone
- [ ] Accurate count

---

### Phase 6: Integration & Edge Cases

#### Test 3.31: Full Corruption/Mutation Workflow
**Setup**: Clean character state (reset corruption to 0, remove mutations)

**Execution Sequence**:
1. `get-corruption-status` → Verify clean
2. `add-corruption` (amount: 3, reason: "Explored Chaos temple")
3. `get-corruption-status` → Verify 3 corruption
4. `add-corruption` (amount: 5, reason: "Touched Chaos artifact")
5. `get-corruption-status` → Check threshold warning (8 total)
6. `add-mutation` ("Warped Face") → Add mutation
7. `list-mutations` → Verify mutation added
8. `remove-corruption` (amount: 4, reason: "Cleansing ritual")
9. `get-corruption-status` → Verify 4 remaining
10. `remove-mutation` ("Warped Face") → Remove mutation
11. `list-mutations` → Verify empty

**Expected Result**:
- Complete workflow successful
- All operations in sequence
- State changes persist
- Threshold warnings at appropriate times

**Verification Points**:
- [ ] All steps complete
- [ ] State consistent throughout
- [ ] No errors in sequence

---

#### Test 3.32: Non-Existent Character Handling
**Setup**: None

**Execution**:
```
Tool: get-corruption-status
Parameters:
  characterName = "NonExistentCharacter12345"
```

**Expected Result**:
- Error: "Character not found"
- Clear error message
- Suggestion to check name
- No crashes

**Verification Points**:
- [ ] Error message
- [ ] No crash
- [ ] Helpful suggestion

---

#### Test 3.33: Empty Character Name Handling
**Setup**: None

**Execution**:
```
Tool: get-corruption-status
Parameters:
  characterName = ""
```

**Expected Result**:
- Error: "Character name cannot be empty"
- Validation prevents operation
- Helpful message

**Verification Points**:
- [ ] Validation error
- [ ] No crash
- [ ] Clear guidance

---

#### Test 3.34: Data Persistence Verification
**Setup**: Add corruption and mutations

**Execution Sequence**:
1. `add-corruption` (amount: 5)
2. `add-mutation` ("Beast's Mark")
3. Refresh Foundry VTT (F5)
4. `get-corruption-status` → Verify 5 corruption
5. `list-mutations` → Verify Beast's Mark present

**Expected Result**:
- All changes persist after refresh
- Foundry VTT shows correct values
- MCP reads back saved data

**Verification Points**:
- [ ] Corruption persists
- [ ] Mutations persist
- [ ] Foundry shows same values

---

#### Test 3.35: Threshold Recalculation After Stat Change
**Setup**: Note current thresholds based on WP/T Bonus

**Execution**:
1. `get-corruption-status` → Note threshold (e.g., 7)
2. Manually change T Bonus in Foundry (increase by 1)
3. `get-corruption-status` → Verify threshold increased (e.g., 8)

**Expected Result**:
- Thresholds dynamically calculated
- Not cached from previous calls
- Reflects current WP + T Bonus
- Warning levels adjust accordingly

**Verification Points**:
- [ ] Threshold changes with stats
- [ ] Dynamic calculation
- [ ] Warning levels update

**Note**: This test requires manual Foundry intervention

---

## Test Execution Commands Summary

### Quick Reference - All Tool Calls

```
# Phase 1: Initial State
get-corruption-status: characterName="Test Character"
list-mutations: characterName="Test Character"

# Phase 2: Adding Corruption
add-corruption: characterName="Test Character", amount=1, reason="..."
add-corruption: characterName="Test Character", amount=2, reason="..."
add-corruption: characterName="Test Character", amount=10, reason="..."
add-corruption: characterName="Test Character", amount=0, reason="..."  # Expect error
add-corruption: characterName="Test Character", amount=-5, reason="..." # Expect error

# Phase 3: Removing Corruption
remove-corruption: characterName="Test Character", amount=3, reason="..."
remove-corruption: characterName="Test Character", amount=10, reason="..." # Clamps
remove-corruption: characterName="Test Character", amount=0, reason="..."  # Expect error

# Phase 4: Adding Mutations
add-mutation: characterName="Test Character", mutationName="Animalistic Legs"
add-mutation: characterName="Test Character", mutationName="Irrational Hatred"
add-mutation: characterName="Test Character", mutationName="Custom", mutationType="physical", description="..."
add-mutation: characterName="Test Character", mutationName="NonExistent" # Expect error

# Phase 5: Removing Mutations
remove-mutation: characterName="Test Character", mutationName="Glowing Eyes"
remove-mutation: characterName="Test Character", mutationName="Animalistic"  # Partial match
remove-mutation: characterName="Test Character", mutationName="NonExistent"  # Expect error

# Phase 6: Integration
# Run workflow sequence
```

---

## Results Summary Template

| Phase | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| 1 - Initial State | 3 | - | - | - |
| 2 - Adding Corruption | 8 | - | - | - |
| 3 - Removing Corruption | 7 | - | - | - |
| 4 - Adding Mutations | 8 | - | - | - |
| 5 - Removing Mutations | 4 | - | - | - |
| 6 - Integration | 5 | - | - | - |
| **TOTAL** | **35** | **-** | **-** | **-** |

---

## Notes

### Automated Test Sequence
Tests can be run sequentially without human intervention except:
- Test 3.35 requires manual Foundry stat change
- Initial setup requires verifying character state
- Final cleanup may need manual reset

### Character State Tracking
Track corruption throughout:
- Start: 0
- After Phase 2: Will vary based on test sequence
- After Phase 3: Should be near 0
- Mutations: Track adds/removes

### Common Mutations in WFRP4e Compendiums
For testing, these are commonly available:
- Physical: Animalistic Legs, Warped Body, Beast's Mark, Horns
- Mental: Irrational Hatred, Overwhelming Obsession, Bestial Rage

---

## Cleanup Procedure

After all tests:
1. Remove all test mutations
2. Set corruption to 0
3. Verify character is in clean state
4. Document any persistent issues

---

**Last Updated**: January 31, 2026  
**Version**: 1.0
