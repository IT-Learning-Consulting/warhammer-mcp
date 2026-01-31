# Fix Plan: Career Advancement Tools (Tool 2)

**Date**: January 30, 2026  
**Based On**: test_result_character_tool_2.md  
**Scope**: Fix 3 failed tests and identified issues

---

## Executive Summary

The career advancement tools have 3 issues requiring fixes:
1. **CRITICAL**: Career search returns NPC templates instead of PC careers
2. **MEDIUM**: No in-career vs out-of-career XP cost distinction for characteristics  
3. **LOW**: Misleading tool description for `add-skill-talent`

---

## Issue 1: NPC Template vs PC Career Search (CRITICAL)

### Problem
The `change-career` tool searches for careers using `searchCompendium` but returns results from ALL compendiums, including NPC templates (`wfrp4e-core.templates`).

**Failed Test**: 2.21 - Career Change with "Sergeant"
- Expected: Find PC career from `wfrp4e-core.careers`
- Actual: Found NPC template from `wfrp4e-core.templates`
- Result: Career shows as "Unknown Career", blocking all subsequent career operations

### Root Cause
**File**: `packages/foundry-mcp-server/src/tools/wfrpCharacterTool.ts` (lines 763-766)

```typescript
const compendiumResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
    query: newCareerName,
    types: ['career'],  // <-- BUG: 'types' parameter is ignored by searchCompendium
});
```

The `searchCompendium` handler expects `packType` (e.g., 'Item', 'Actor') not item types like 'career'. The parameter is ignored, returning results from all packs.

### Solution

**Option A (Recommended)**: Post-filter results by pack name

Modify `change-career` to filter compendium results to only include items from career packs:

```typescript
const compendiumResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
    query: newCareerName,
});

// Filter to only PC career packs (not NPC templates)
const careerPacks = ['wfrp4e-core.careers', 'wfrp4e-up-in-arms.careers'];
const filteredResults = compendiumResults.filter(result => 
    careerPacks.some(pack => result.uuid?.includes(pack) || result.pack?.includes(pack))
);
```

**Option B (Alternative)**: Add `specificPack` parameter to `searchCompendium`

Enhance the compendium tool to accept a pack filter:

```typescript
// In wfrpCompendiumTool.ts searchCompendium handler
if (specificPack) {
    packs = packs.filter(pack => pack.metadata?.id === specificPack);
}
```

Then use in change-career:
```typescript
const compendiumResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
    query: newCareerName,
    specificPack: 'wfrp4e-core.careers'
});
```

### Files to Modify
| File | Lines | Change |
|------|-------|--------|
| `packages/foundry-mcp-server/src/tools/wfrpCharacterTool.ts` | 763-780 | Add pack filtering for career search |

### Verification
- Re-run Test 2.21: Change career to "Sergeant" should find PC career
- Re-run Test 2.22-2.25: Career change workflow should complete
- Verify: Career should show proper name, not "Unknown Career"

---

## Issue 2: In-Career vs Out-of-Career Characteristic Costs (MEDIUM)

### Problem
Characteristic advancements cost the same XP regardless of whether they're in the current career or not.

**Issue Noted**: Test 2.15
- Expected: Out-of-career Int/Fel costs 30 XP each (Tier 0 + 5 penalty)
- Actual: Both cost 25 XP (base Tier 0 cost)

### WFRP 4e Rules
- **In-Career**: Base tier cost (25/30/40/50/70 for tiers 0-4)
- **Out-of-Career**: Base tier cost + 5 XP per advance

### Root Cause
**File**: `packages/foundry-mcp-server/src/tools/wfrpCharacterTool.ts` (lines 488-510)

```typescript
// Current code uses fixed costs without career check
const characteristicXPCosts = [25, 30, 40, 50, 70, 90, 120, 150, 190, 230, 280, 330, 390, 450, 520];
for (let i = 0; i < advances; i++) {
    const tierIndex = Math.floor(advanceNumber / 5);
    totalCost += characteristicXPCosts[tierIndex];  // No in-career check!
}
```

### Solution

Add career characteristic lookup before cost calculation:

```typescript
// Get current career's allowed characteristics
const currentCareer = actor.items?.find(item => 
    item.type === 'career' && item.system?.current === true
);

const careerCharacteristics = currentCareer?.system?.characteristics || {};
const isInCareer = careerCharacteristics[characteristic] !== undefined;

// Apply out-of-career penalty
const baseCost = characteristicXPCosts[tierIndex];
const cost = isInCareer ? baseCost : baseCost + 5;
totalCost += cost;
```

### Files to Modify
| File | Lines | Change |
|------|-------|--------|
| `packages/foundry-mcp-server/src/tools/wfrpCharacterTool.ts` | 460-510 | Add in-career check and +5 XP penalty |

### Verification
- Re-run Test 2.15: Out-of-career Int should cost 30 XP, not 25 XP
- Verify: In-career characteristics (WS, BS, etc. for Soldier) still cost 25 XP

---

## Issue 3: Tool Description Clarification (LOW)

### Problem
The `add-skill-talent` tool doesn't deduct XP, which may confuse users expecting XP-based advancement.

**Test 2.19 Note**: `add-skill-talent` added Strong Back but didn't deduct XP

### Current Behavior (Working as Intended)
| Tool | XP Deduction | Use Case |
|------|--------------|----------|
| `add-skill-talent` | ❌ No | GM adjustments, adding items without cost |
| `advance-talent` | ✅ Yes | Player XP-based advancement |

### Solution

Update tool description to clarify intended use:

**File**: `packages/foundry-mcp-server/src/tools/wfrpCharacterTool.ts` (lines 128-130)

```typescript
// Current description
description: 'Add or update a skill/talent on a WFRP4e character'

// Updated description
description: 'Add or update a skill/talent on a WFRP4e character (GM adjustment - no XP cost). For XP-based advancement, use advance-skill or advance-talent.'
```

### Files to Modify
| File | Lines | Change |
|------|-------|--------|
| `packages/foundry-mcp-server/src/tools/wfrpCharacterTool.ts` | 128-130 | Update tool description |

---

## Implementation Order

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Career search (NPC template bug) | Medium | High - Unblocks all career tests |
| 2 | In-career cost distinction | Low-Medium | Medium - Correctness improvement |
| 3 | Tool description update | Low | Low - Documentation clarity |

---

## Testing Checklist

After implementing fixes, re-run these tests:

### Issue 1 Verification
- [ ] Test 2.21: Career change to "Sergeant" finds PC career
- [ ] Test 2.22: Complete career change workflow works
- [ ] Test 2.24: Invalid career name returns proper error
- [ ] Career displays correct name (not "Unknown Career")

### Issue 2 Verification
- [ ] Test 2.15: Out-of-career characteristic costs +5 XP
- [ ] Test 2.14: In-career characteristic costs base price
- [ ] Verify tier progression still works with penalty

### Issue 3 Verification
- [ ] Tool description updated in tool listing
- [ ] Documentation reflects correct usage pattern

---

## Related Files Reference

| File | Purpose |
|------|---------|
| `packages/foundry-mcp-server/src/tools/wfrpCharacterTool.ts` | Main character tool (all 3 fixes) |
| `packages/foundry-mcp-server/src/tools/wfrpCompendiumTool.ts` | Optional enhancement for pack filtering |
| `docs/WFRP4E_SYSTEM_GUIDE.md` | Reference for WFRP4e rules and XP costs |

---

## Notes

1. **Career packs to support**: `wfrp4e-core.careers`, `wfrp4e-up-in-arms.careers` (expand as needed for other modules)
2. **Characteristic abbreviations**: `ws`, `bs`, `s`, `t`, `i`, `ag`, `dex`, `int`, `wp`, `fel`
3. **The `advance-talent` tool already handles XP correctly** - no changes needed there
