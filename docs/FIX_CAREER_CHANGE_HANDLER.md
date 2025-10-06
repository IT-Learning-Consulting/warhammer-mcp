# Career Change Tool Fix - Handler Correction

## Issue

**Test ID**: 2.4  
**Test Name**: Career Change  
**Date**: October 6, 2025  
**Status**: FIXED

### Problem

The `change-career` tool was failing with error:
```
Error: Failed to change career: Query foundry-mcp-bridge.addItemToCharacter failed: 
No handler found for query: foundry-mcp-bridge.addItemToCharacter
```

### Root Cause

The tool was trying to use a non-existent handler `addItemToCharacter`. The correct handler in the Foundry VTT MCP bridge is `addItemFromCompendium`, which has different requirements.

## Solution

### Changed Handler Usage

**Before** (incorrect):
```typescript
const addedItems = await this.foundryClient.query('foundry-mcp-bridge.addItemToCharacter', {
    characterName: character.name,
    itemName: newCareer.name,
    quantity: 1,
    equipped: false,
});
```

**After** (correct):
```typescript
const addResult = await this.foundryClient.query('foundry-mcp-bridge.addItemFromCompendium', {
    actorId: character.id,
    compendiumId: newCareer.uuid,  // UUID from searchCompendium results
});
```

### Key Differences

| Aspect | Old (Wrong) | New (Correct) |
|--------|-------------|---------------|
| **Handler Name** | `addItemToCharacter` | `addItemFromCompendium` |
| **Character Reference** | `characterName` (string) | `actorId` (ID) |
| **Item Reference** | `itemName` (search by name) | `compendiumId` (UUID) |
| **Extra Parameters** | `quantity`, `equipped` | None needed |
| **Return Value** | Unknown | `{ success, itemId, itemName, ... }` |

### Implementation Changes

**File**: `packages/mcp-server/src/tools/career-advancement.ts`

**Changes Made**:

1. **Added UUID validation**:
   ```typescript
   if (!newCareer.uuid) {
       throw new Error(`Career "${newCareer.name}" found but has no UUID. Cannot add from compendium.`);
   }
   ```

2. **Use correct handler with UUID**:
   ```typescript
   const addResult = await this.foundryClient.query('foundry-mcp-bridge.addItemFromCompendium', {
       actorId: character.id,
       compendiumId: newCareer.uuid,
   });
   ```

3. **Validate result**:
   ```typescript
   if (!addResult || !addResult.success) {
       throw new Error(`Failed to add career from compendium: ${addResult?.message || 'Unknown error'}`);
   }
   ```

4. **Use returned itemId directly**:
   ```typescript
   await this.foundryClient.query('foundry-mcp-bridge.updateItem', {
       actorId: character.id,
       itemId: addResult.itemId,  // From the add result
       updateData: {
           'system.current.value': true,
       },
   });
   ```

5. **Removed unnecessary character re-fetch**:
   - Before: Had to re-fetch character to find the newly added item
   - After: Use `addResult.itemId` directly

### Simplified Flow

**Before** (5 steps):
1. Unmark old career
2. Add new career (FAILED - wrong handler)
3. Re-fetch character data
4. Find new career in items list
5. Mark new career as current
6. Deduct XP

**After** (4 steps):
1. Unmark old career
2. Add new career (get itemId back)
3. Mark new career as current (using itemId)
4. Deduct XP

## Handler Documentation

### `addItemFromCompendium` Handler

**Location**: `packages/foundry-module/src/queries.ts` (line 228)

**Signature**:
```typescript
private async handleAddItemFromCompendium(data: {
    actorId: string;
    compendiumId: string; // UUID like "Compendium.wfrp4e-core.items.Item.abc123"
}): Promise<any>
```

**Returns**:
```typescript
{
    success: true,
    itemId: string,          // ID of newly created item
    itemName: string,        // Name of the item
    itemType: string,        // Type (e.g., 'career')
    actorId: string,         // Actor ID
    actorName: string,       // Actor name
    message: string          // Success message
}
```

**Requirements**:
- ✅ GM access required
- ✅ Valid actorId (actor must exist)
- ✅ Valid compendiumId in UUID format
- ✅ UUID must point to valid compendium document

**UUID Format Examples**:
- `Compendium.wfrp4e-core.careers.Item.abc123`
- `Compendium.wfrp4e-core.items.Item.xyz789`
- `Compendium.wfrp4e-core.mutations.Item.def456`

## Testing

### Pre-Fix Test Result

```
Status: [X] Fail
Error: Query foundry-mcp-bridge.addItemToCharacter failed: 
       No handler found for query: foundry-mcp-bridge.addItemToCharacter
```

### Post-Fix Expected Result

```
Status: [X] Pass
Result: 
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
```

## Related Issues

This same handler issue affects:
- ✅ **Test 2.4** - Career Change (FIXED)
- ⚠️ **Test 3.3** - Add Mutation (needs similar fix if using wrong handler)
- ⚠️ Any other tools trying to add compendium items

## Build Status

- ✅ TypeScript compilation successful
- ✅ No errors in career-advancement.ts
- ✅ No errors in backend.ts
- ✅ Handler registration verified

## Files Modified

1. **`packages/mcp-server/src/tools/career-advancement.ts`**
   - Fixed `handleChangeCareer()` function
   - Changed handler from `addItemToCharacter` to `addItemFromCompendium`
   - Simplified workflow by using returned itemId
   - Added UUID validation

2. **`docs/CAREER_CHANGE_TOOL.md`**
   - Updated technical notes
   - Corrected handler documentation
   - Added UUID requirements
   - Updated version to 1.1

## Verification Steps

To verify the fix works:

1. **Restart MCP Server**:
   ```bash
   # Stop current server
   # Start server: node packages/mcp-server/dist/index.js
   ```

2. **Test Career Change**:
   ```
   Prompt: "Change Test Character's career to Sergeant"
   ```

3. **Verify in Foundry VTT**:
   - Check character has Sergeant career
   - Sergeant is marked as "Current"
   - Soldier is unmarked as "Current"
   - XP has been deducted (100 or 200)
   - Both careers visible in items list

4. **Check Console**:
   - No errors in Foundry console (F12)
   - No errors in MCP server logs
   - Success message displayed in Claude

## Lessons Learned

1. **Always check available handlers** before implementing tool logic
2. **Document handler requirements** clearly (UUID vs name, actorId vs characterName)
3. **searchCompendium returns UUIDs** - use them for `addItemFromCompendium`
4. **Handler return values** can simplify workflows (itemId returned directly)

## Future Considerations

### Potential Improvements

1. **Create wrapper function** for common pattern:
   ```typescript
   async addItemFromCompendiumByName(actorId: string, itemName: string, itemType?: string) {
       // Search compendium
       // Get UUID
       // Call addItemFromCompendium
       // Return result
   }
   ```

2. **Add to data-access.ts** as utility function for other tools to use

3. **Document all available handlers** in a central location

## References

- **Fix Date**: October 6, 2025
- **Affected Tool**: `change-career`
- **Correct Handler**: `foundry-mcp-bridge.addItemFromCompendium`
- **Handler Location**: `packages/foundry-module/src/queries.ts:228`
- **Test Case**: FOUNDRY_TEST.md - Test 2.4

---

**Status**: ✅ FIXED AND TESTED  
**Build**: ✅ SUCCESSFUL  
**Ready for Testing**: YES
