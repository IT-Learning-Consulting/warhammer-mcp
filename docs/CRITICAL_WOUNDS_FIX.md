# Critical Wounds Tool - Complete Rewrite

**Date**: October 7, 2025  
**Version**: v0.2.2.1 (hotfix)  
**Severity**: Critical - Previous implementation violated WFRP 4e rules  
**Status**: Fixed, awaiting testing

---

## Problem Summary

The previous `add-critical-wound` tool implementation was fundamentally wrong and violated WFRP 4e mechanics:

### What Was Wrong

1. **Created Fake Criticals**: Tool created generic "critical" items with user-provided names that don't exist in WFRP 4e
2. **Manually Subtracted Wounds**: Incorrectly reduced character wounds, mixing two separate game systems
3. **No Compendium Usage**: Didn't search for or use official WFRP 4e critical wounds from compendium
4. **Missing Official Effects**: Custom criticals had no mechanical effects, penalties, or healing times
5. **Verbose Output**: Generated excessive guidance text instead of concise confirmation

### Example of Old (Wrong) Behavior

**User**: "Add head critical to Test Character"  
**Tool**: Creates item named "Head Critical 35" with 35 wounds  
**Result**: 
- Fake critical that doesn't match any WFRP 4e table
- Character loses 35 wounds manually
- No official effects applied
- Pages of unnecessary guidance text

---

## WFRP 4e Critical Wounds Rules

### How Critical Wounds Work

1. **Trigger Conditions**:
   - Taking damage while at 0 Wounds
   - Suffering a Critical Hit in combat
   
2. **Resolution Process**:
   - GM determines hit location (Head, Body, Arm, Leg)
   - GM rolls on appropriate Critical Table
   - GM finds specific critical result (e.g., "Minor Head Injury", "Cracked Ribs")
   - GM applies that critical to character
   - GM separately tracks wound loss from the damage

3. **Two Separate Systems**:
   - **Wounds**: Health pool, can go to 0, recovers with rest
   - **Critical Wounds**: Specific injuries, count against Toughness Bonus limit, have unique effects

### Critical Wounds vs Wound Loss

**IMPORTANT**: These are NOT the same thing!

- **Losing Wounds**: Damage reduces wound bar (can go to 0)
- **Gaining Critical Wound**: Specific injury added to character with effects
- **Same Event**: An attack might cause BOTH wound loss AND a critical wound

**Example Flow**:
1. Hans at 0 Wounds takes 5 damage to head
2. GM rolls 45 on Head Critical Table → "Concussed"
3. GM uses tool: "Add Concussed to Hans at Head"
4. Tool adds official "Concussed" critical from compendium
5. GM separately tracks that Hans already at 0 wounds (no further reduction needed)

---

## Solution: Rewritten Tool

### New Implementation

**Tool searches compendium → Constructs UUID → Adds official critical**

### New Parameters

```typescript
{
  characterName: string,      // "Test Character"
  criticalName: string,       // "Minor Head Injury" (from Critical Table)
  location: enum              // Head, Body, Left Arm, Right Arm, Left Leg, Right Leg
}
```

**Removed Parameters**:
- ~~wounds~~ (not needed - critical has this data)
- ~~woundName~~ (renamed to criticalName for clarity)
- ~~description~~ (comes from compendium)

### How It Works Now

1. **Search Compendium**:
   ```typescript
   const results = await searchCompendium({
     query: criticalName,
     types: ['critical']
   });
   ```

2. **Find Match**:
   - Exact match preferred
   - Closest match if no exact match
   - Error if not found

3. **Construct UUID** (Same pattern as career change fix):
   ```typescript
   const uuid = criticalItem.uuid || 
     `Compendium.${criticalItem.pack}.${criticalItem.id || criticalItem._id}`;
   ```

4. **Add from Compendium**:
   ```typescript
   await addItemFromCompendium(character.id, uuid);
   ```

5. **Set Location**:
   ```typescript
   await updateItem(itemId, {
     'system.location.value': location
   });
   ```

6. **Update Count**:
   ```typescript
   await updateActor(character.id, {
     'system.status.criticalWounds.value': count + 1
   });
   ```

### Output

**Simplified, concise response**:
```
# Critical Wound Added

**Character**: Test Character
**Critical**: Minor Head Injury
**Location**: Head

**Critical Wound Count**: 1 / 4 (Toughness Bonus)

`█░░░`

Test Character can survive 3 more criticals before dying.
```

---

## Changes Made

### File: `packages/mcp-server/src/tools/critical-wounds.ts`

**Lines 51-73**: Updated tool definition
- Changed description to emphasize compendium search
- Changed parameters from 5 to 3
- Added clear examples
- Added enum for location validation

**Lines 304-450**: Rewrote `handleAddCriticalWound`
- Added compendium search logic
- Added UUID construction (pack + id pattern)
- Changed from createItem to addItemFromCompendium
- Removed wound subtraction logic
- Simplified response format
- Removed verbose guidance sections

### Testing Required

**Test ID**: 5.1  
**Test File**: `test/test_results.md`  
**Status**: Documented but not tested

**Test Cases**:
1. Add "Minor Head Injury" to Head
2. Add "Badly Jarred Arm" to Left Arm
3. Add "Cracked Ribs" to Body
4. Test with non-existent critical (should error)
5. Verify critical count increments
6. Verify official effects are applied
7. Verify wounds are NOT automatically subtracted

---

## Usage Examples

### Correct Usage

**Scenario**: Hans takes damage at 0 Wounds, GM rolls 35 on Head table

```
GM: "Add Minor Head Injury to Hans at Head"
```

Tool will:
- Search compendium for "Minor Head Injury"
- Find official critical with all effects
- Add to Hans at Head location
- Increment critical count
- Display confirmation

### What GM Does Separately

1. Track wound loss from damage (Hans already at 0)
2. Apply penalties from critical effect
3. Note healing time
4. Roleplay the injury

---

## Common Critical Wounds

### Head Criticals
- Minor Head Injury
- Concussed
- Major Head Injury
- Fractured Jaw
- Major Eye Wound

### Body Criticals
- Winded
- Cracked Ribs
- Torn Apart
- Gut Wound
- Internal Bleeding

### Arm Criticals
- Badly Jarred Arm
- Torn Muscles (Arm)
- Broken Collar Bone
- Mangled Arm
- Severed Hand

### Leg Criticals
- Torn Thigh
- Badly Bruised Leg
- Torn Hamstring
- Broken Knee
- Severed Foot

---

## Technical Notes

### UUID Construction Pattern

**This is the THIRD tool to need this pattern**:
1. `career-advancement.ts` (career change) - v0.2.2
2. `corruption-mutation.ts` (add mutation) - v0.2.1
3. `critical-wounds.ts` (add critical) - v0.2.2.1

**Pattern**:
```typescript
let itemUuid: string | null = null;
if (item.uuid) {
  itemUuid = item.uuid;
} else if (item.pack && (item.id || item._id)) {
  itemUuid = `Compendium.${item.pack}.${item.id || item._id}`;
}

if (!itemUuid) {
  throw new Error('Cannot construct UUID');
}
```

**Why This Works**:
- Compendium searches return `pack` and `id`, NOT `uuid`
- Foundry expects full UUID: `Compendium.pack-name.item-id`
- Must construct this format before calling `addItemFromCompendium`

### Handler Registration

No changes needed - existing registration works with new parameters:

```typescript
server.setRequestHandler(
  { method: 'tools/call', params: { name: 'add-critical-wound' } },
  async (request: any) => 
    await criticalTools.handleAddCriticalWound(request.params.arguments)
);
```

---

## Migration Impact

### Breaking Changes

**Old tool calls will fail**:
```javascript
// OLD (won't work)
add-critical-wound({
  characterName: "Hans",
  location: "Head",
  woundName: "Custom Critical",
  wounds: 35,
  description: "This is bad"
})
```

**New tool calls**:
```javascript
// NEW (correct)
add-critical-wound({
  characterName: "Hans",
  criticalName: "Minor Head Injury",
  location: "Head"
})
```

### User Impact

**Claude Desktop will handle this automatically** - users just need to:
- Specify the critical name from the tables
- Let Claude figure out the correct parameters

**Example natural language**:
- "Hans takes a Minor Head Injury"
- "Add Badly Jarred Arm to Gustav's left arm"
- "Test Character suffers Cracked Ribs"

---

## Testing Checklist

Before marking Test 5.1 as passing:

- [ ] Tool appears in Claude Desktop
- [ ] Can search and find common criticals
- [ ] UUID construction works correctly
- [ ] Critical added to character with official effects
- [ ] Location set correctly
- [ ] Critical wound count increments
- [ ] Does NOT subtract wounds automatically
- [ ] Response is concise and clear
- [ ] Works with all 6 locations
- [ ] Error handling for non-existent criticals

---

## Related Documentation

- `INSTRUCTIONS.md` - Updated with v0.2.2.1 hotfix notes
- `test/test_results.md` - Test 5.1 added with expected behavior
- `CHANGELOG.md` - Needs update for v0.2.2.1 release

---

## Conclusion

This fix aligns the tool with actual WFRP 4e rules and follows the established pattern of using compendium data with proper UUID construction. The tool is now simpler, more correct, and produces better results.

**Key Takeaway**: Always use official WFRP 4e compendium data when it exists. Don't create custom items that bypass the system's effects and modifiers.
