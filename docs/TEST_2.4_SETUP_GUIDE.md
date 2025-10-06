# Test 2.4 Setup Guide - Career Change

## Issue

Test 2.4 (Career Change) requires a character with:
1. At least one career item
2. One career marked as "current" (`system.current.value = true`)

## Current Status

**Test Character** does not have any career marked as current, which is why the test fails with:
```
Error: No current career found for Test Character. Please mark a career as current first.
```

This is **correct error handling** - the tool should not allow career changes if there's no current career.

## Setup Options

### Option 1: Use Foundry VTT UI (Recommended)

1. **Open Test Character's sheet** in Foundry VTT
2. **Find the Careers section**
3. **Check the "Current" checkbox** on one of the existing careers (e.g., Soldier)
4. **Retry the test**

### Option 2: Use MCP Tools to Mark Current Career

If the character has careers but none are marked as current:

```
Prompt: "Update Test Character's Soldier career item to mark it as current"
```

This uses the `foundry-update-item` tool:
```typescript
{
  characterName: "Test Character",
  itemName: "Soldier",
  updateData: {
    "system.current.value": true
  }
}
```

### Option 3: Add a Career from Compendium

If the character has **no careers at all**:

```
Prompt: "Search for Soldier career in the compendium and add it to Test Character"
```

Then mark it as current using Option 2.

### Option 4: Check Character's Current State

First, verify what careers the character has:

```
Prompt: "Get Test Character's information, specifically their careers"
```

This will show:
- All career items
- Which (if any) are marked as current
- Which (if any) are marked as complete

## Expected Setup for Test 2.4

For the test to work properly, Test Character should have:

```
Items:
- Recruit (career)
  - system.current.value: false
  - system.complete.value: true
  
- Soldier (career)  
  - system.current.value: true   ← MUST BE TRUE
  - system.complete.value: true or false (affects XP cost)
```

## Test Scenarios

### Scenario A: Complete Career Change (100 XP)

**Setup**:
- Current Career: Soldier
- `system.complete.value`: **true**
- Available XP: 450+

**Command**: `"Change Test Character's career to Sergeant"`

**Expected Result**:
- Soldier unmarked as current
- Sergeant added and marked as current
- **100 XP** deducted
- Success message

### Scenario B: Incomplete Career Change (200 XP)

**Setup**:
- Current Career: Soldier  
- `system.complete.value`: **false**
- Available XP: 450+

**Command**: `"Change Test Character's career to Sergeant"`

**Expected Result**:
- Soldier unmarked as current
- Sergeant added and marked as current
- **200 XP** deducted (penalty for incomplete career)
- Warning message about completing careers

## Verification Commands

### 1. Check Current Character State
```
"Get Test Character's information"
```

Look for:
```
**Career Items:**
- Recruit (complete: true, current: false)
- Soldier (complete: false, current: true)  ← Should have ONE current career
```

### 2. Mark Career as Current (if needed)
```
"Update Test Character's Soldier career item, set system.current.value to true"
```

### 3. Run Career Change Test
```
"Change Test Character's career to Sergeant"
```

### 4. Verify Result
```
"Get Test Character's information"
```

Look for:
```
**Career Items:**
- Recruit (complete: true, current: false)
- Soldier (complete: false, current: false)   ← Unmarked
- Sergeant (complete: false, current: true)   ← New current career
```

## Troubleshooting

### Error: "No current career found"

**Cause**: No career has `system.current.value = true`

**Solution**: Mark one career as current using Option 2 above

### Error: "No careers found"

**Cause**: Character has no career items at all

**Solution**: Add a career from compendium first (Option 3)

### Error: "Insufficient XP"

**Cause**: Character doesn't have 100 XP (complete) or 200 XP (incomplete)

**Solution**: Add XP to character:
```
"Update Test Character's experience, set system.details.experience.current to 500"
```

## Complete Setup Script

If starting from scratch:

```bash
# Step 1: Check current state
"Get Test Character's information"

# Step 2: Add XP if needed
"Update Test Character, set system.details.experience.current to 500"

# Step 3: Add Soldier career if missing
"Search compendium for Soldier career and add it to Test Character"

# Step 4: Mark Soldier as current
"Update Test Character's Soldier career, set system.current.value to true"

# Step 5: Optionally mark as complete (for 100 XP test)
"Update Test Character's Soldier career, set system.complete.value to true"

# Step 6: Run the test
"Change Test Character's career to Sergeant"
```

## WFRP 4e Career Rules Reference

### Career Completion Requirements

A career is "complete" when:
- **Level 1**: 5 characteristic advances + 8 skill advances + 1 talent
- **Level 2**: 10 characteristic advances + 8 skill advances + 1 talent
- **Level 3**: 15 characteristic advances + 8 skill advances + 1 talent
- **Level 4**: 20 characteristic advances + 8 skill advances + 1 talent

### Career Change Costs

| Current Career Status | XP Cost |
|----------------------|---------|
| Complete ✅ | 100 XP |
| Incomplete ⚠️ | 200 XP |
| Different Class | +100 XP additional |

## Test Case 2.4 - Expected Results

### Pass Criteria

✅ **Must achieve ALL**:
1. Old career unmarked as "current"
2. New career added from compendium
3. New career marked as "current"
4. Correct XP deducted (100 or 200)
5. XP totals updated
6. Confirmation message displayed
7. Both careers visible in character's items

### Fail Criteria

❌ **Any of these**:
1. Error: "No current career found"
2. Error: "Insufficient XP"
3. Error: "Career not found in compendium"
4. XP not deducted
5. Career not marked correctly
6. System allows multiple "current" careers

## Quick Reference

**Minimum Requirements**:
- ✅ 1+ career item on character
- ✅ 1 career marked as `current: true`
- ✅ 100-200 available XP
- ✅ Target career exists in compendium

**Optional Setup**:
- Mark current career as `complete: true` (for 100 XP test)
- Mark current career as `complete: false` (for 200 XP test)

---

**Date**: October 6, 2025  
**Status**: Setup Guide Complete  
**Next Step**: Configure Test Character with a current career
