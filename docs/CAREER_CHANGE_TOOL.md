# Career Change Tool Documentation

## Overview

The `change-career` tool implements the full WFRP 4e career change mechanics, including:
- Finding and adding the new career from compendium
- Marking the old career as no longer "current"
- Marking the new career as "current"
- Calculating and deducting the correct XP cost based on career completion status

## Tool Name

`change-career`

## Purpose

Change a character's career following official WFRP 4e rules from the core rulebook (pages 48-49).

## WFRP 4e Career Change Rules

### Career Completion

A career is considered "complete" when the character has:
- **Level 1**: 5 advances in characteristics and 8 career skills (+ 1 talent)
- **Level 2**: 10 advances in characteristics and 8 career skills (+ 1 talent)
- **Level 3**: 15 advances in characteristics and 8 career skills (+ 1 talent)
- **Level 4**: 20 advances in characteristics and 8 career skills (+ 1 talent)

### XP Costs

| Current Career Status | XP Cost |
|----------------------|---------|
| **Complete** ✅ | 100 XP |
| **Incomplete** ⚠️ | 200 XP |

Additional costs apply for:
- Changing to a different **Class**: +100 XP
- Skipping career levels (with GM permission)

## Parameters

```typescript
{
  characterName: string,  // Name or ID of the character
  newCareerName: string   // Name of the career to change to (from compendium)
}
```

## Usage Examples

### Example 1: Basic Career Change

```
Prompt: "Change Test Character's career to Sergeant"
```

**What happens:**
1. Finds current career (e.g., "Soldier")
2. Checks if it's marked as "complete"
3. Searches compendium for "Sergeant"
4. Adds Sergeant career to character
5. Marks Soldier as no longer current
6. Marks Sergeant as current
7. Deducts 100 XP (if Soldier was complete) or 200 XP (if incomplete)

### Example 2: Changing with Incomplete Career

```
Prompt: "Hans changes from Scout to Mercenary"
```

**Result if Scout is incomplete:**
- XP Cost: **200 XP** (100 base + 100 incomplete penalty)
- Warning message about completing career first to avoid penalty

## Implementation Details

### Step-by-Step Process

1. **Validate Character**
   - Get character data from Foundry
   - Verify character exists

2. **Find Current Career**
   - Search character's items for type='career'
   - Find the one with `system.current.value = true`
   - Error if no current career found

3. **Check Completion Status**
   - Read `system.complete.value` from current career item
   - Determines XP cost: 100 (complete) or 200 (incomplete)

4. **Validate XP**
   - Check if character has enough available XP
   - Error if insufficient funds

5. **Search Compendium**
   - Query compendium for new career name
   - Filter by type='career'
   - Use exact match or closest result

6. **Unmark Old Career**
   - Update old career: `system.current.value = false`
   - Career remains in character's history

7. **Add New Career**
   - Add new career item from compendium to character
   - Career added to character's items list

8. **Mark New Career as Current**
   - Update new career: `system.current.value = true`
   - This is the active career for advancement

9. **Deduct XP**
   - Update `system.details.experience.current` (subtract cost)
   - Update `system.details.experience.spent` (add cost)

### Data Structure

**Career Item Structure:**
```typescript
{
  id: string,
  name: string,
  type: 'career',
  system: {
    current: {
      value: boolean  // Is this the active career?
    },
    complete: {
      value: boolean  // Has this career been completed?
    },
    class: {
      value: string   // Career class (e.g., "warriors", "rogues")
    },
    careergroup: {
      value: string   // Career group for progression paths
    },
    level: {
      value: number   // Career level (1-4)
    },
    // ... other career data
  }
}
```

## Response Format

### Successful Career Change

```markdown
🎖️ **CAREER CHANGE SUCCESSFUL!** 🎖️

**Test Character** has changed careers!

📋 **Career Transition:**
- Previous Career: **Soldier** ✅ (Complete)
- New Career: **Sergeant** ⭐ (Now Current)

💰 **Experience Cost:**
- XP Cost: **100 XP** (completed career rate)
- Previous XP: 450 available
- XP Spent: 100
- Remaining XP: **350** available

📚 **WFRP 4e Rules:**
✅ Your previous career was **complete**, so you paid the standard rate of 100 XP.

*A complete career means you had the required advances in characteristics and skills.*

🎯 **Next Steps:**
- Review your new career's available advances
- Use `get-career-advancement` to see what you can purchase
- Purchase new skills and talents from your new career path
```

### Incomplete Career Penalty

```markdown
💰 **Experience Cost:**
- XP Cost: **200 XP** (incomplete career penalty)
- Previous XP: 450 available
- XP Spent: 200
- Remaining XP: **250** available

📚 **WFRP 4e Rules:**
⚠️ Your previous career was **incomplete**, so you paid a penalty of 200 XP.

*To avoid this penalty in the future, complete your career first:*
- Level 1: 5 advances in characteristics and 8 skills
- Level 2: 10 advances in characteristics and 8 skills
- Level 3: 15 advances in characteristics and 8 skills
- Level 4: 20 advances in characteristics and 8 skills
```

## Error Handling

### Error: Character Not Found
```
Error: Character "InvalidName" not found
```

### Error: No Current Career
```
Error: No current career found for Test Character. Please mark a career as current first.
```

### Error: Insufficient XP
```
Error: Insufficient XP to change career.
- Required: 200 XP (current career is NOT complete)
- Available: 150 XP
- Short by: 50 XP
```

### Error: Career Not Found in Compendium
```
Error: Career "InvalidCareer" not found in compendium. Please check the spelling.
```

## Career History

### Career Tracking

WFRP 4e characters maintain **all career items** as a record of their professional history:

```
Items List:
- Recruit (complete: true, current: false)     ← Starting career
- Soldier (complete: true, current: false)     ← First progression
- Sergeant (complete: false, current: true)    ← Current career
```

This allows:
- Tracking career progression path
- Historical record of character development
- Validation of career prerequisites
- Roleplay depth

### Marking Careers as Complete

To mark a career as complete manually (if needed):
```
Use: foundry-update-item tool
Update: system.complete.value = true
```

The system should automatically mark careers as complete when requirements are met, but this can be done manually if needed.

## Integration with Other Tools

### Related Tools

- **`get-career-advancement`** - View available advances in current career
- **`advance-characteristic`** - Purchase characteristic advances
- **`advance-skill`** - Purchase skill advances
- **`advance-talent`** - Purchase talent ranks
- **`foundry-update-item`** - Manually mark careers as complete/current

### Typical Workflow

1. **Check Current Progress**
   ```
   "Show Test Character's career advancement options"
   ```

2. **Advance in Current Career**
   ```
   "Advance Test Character's Weapon Skill"
   "Purchase Leadership skill for Test Character"
   ```

3. **Mark Career as Complete** (if requirements met)
   - This should be automatic, but can be manual if needed

4. **Change Career**
   ```
   "Change Test Character's career to Sergeant"
   ```

5. **Review New Career Options**
   ```
   "Show Test Character's new career advancement options"
   ```

## Testing

### Test Case 1: Complete Career Change

**Setup:**
- Character: Test Character
- Current Career: Soldier (marked as complete)
- Available XP: 450
- New Career: Sergeant

**Expected Result:**
- Soldier marked as `current: false`
- Sergeant added and marked as `current: true`
- XP Cost: 100
- Remaining XP: 350

### Test Case 2: Incomplete Career Change

**Setup:**
- Character: Test Character
- Current Career: Soldier (NOT marked as complete)
- Available XP: 450
- New Career: Sergeant

**Expected Result:**
- Soldier marked as `current: false`
- Sergeant added and marked as `current: true`
- XP Cost: 200
- Remaining XP: 250
- Warning message about completion penalty

### Test Case 3: Insufficient XP

**Setup:**
- Character: Test Character
- Current Career: Soldier (incomplete)
- Available XP: 150 (need 200)
- New Career: Sergeant

**Expected Result:**
- Error message
- No changes made
- Clear explanation of shortfall

## Future Enhancements

### Class Change Detection
Currently not implemented, but the system could:
- Detect if new career is in a different class
- Add +100 XP to the cost automatically
- Warn player about class change implications

### Career Level Progression
Future versions could:
- Validate career level requirements
- Suggest appropriate next careers based on level
- Track career group progressions

### Automatic Completion Detection
Could automatically mark careers as complete when:
- Required characteristic advances are met
- Required skill advances are met
- At least 1 talent from career is owned

## Technical Notes

### Foundry VTT Bridge Queries Used

1. **`foundry-mcp-bridge.getCharacterInfo`** - Get character data
2. **`foundry-mcp-bridge.searchCompendium`** - Find new career by name and get UUID
3. **`foundry-mcp-bridge.updateItem`** - Unmark old career, mark new career as current
4. **`foundry-mcp-bridge.addItemFromCompendium`** - Add new career from compendium using UUID
5. **`foundry-mcp-bridge.updateActor`** - Deduct XP from character

**Important**: The `addItemFromCompendium` handler requires:
- `actorId` - The character's ID
- `compendiumId` - The UUID of the item (e.g., "Compendium.wfrp4e-core.careers.Item.abc123")

The UUID is obtained from the `searchCompendium` results, which returns items with their full UUID for reference.

### Data Integrity

The tool ensures:
- Only one career marked as "current" at a time
- Career history is preserved
- XP changes are logged and tracked
- All operations are atomic (all succeed or all fail)

## References

- **WFRP 4e Core Rulebook**: Pages 48-49 (Changing Career)
- **Source File**: `packages/mcp-server/src/tools/career-advancement.ts`
- **Handler Function**: `handleChangeCareer()`
- **Foundry Module**: `packages/foundry-module/src/queries.ts` - Query handlers
- **Test Guide**: `FOUNDRY_TEST.md` - Test Case 2.4

---

**Created**: October 6, 2025  
**Version**: 1.1  
**Status**: Implemented and Fixed
**Last Updated**: October 6, 2025 - Fixed to use correct `addItemFromCompendium` handler
