# Tool Consolidation - Implementation Status

## Phase 1: COMPLETED FILES

### New Consolidated Tools Created:
1. ✅ `manage-fortune-fate.ts` - Consolidates Fortune and Fate management
2. ✅ `manage-resolve-resilience.ts` - Consolidates Resolve and Resilience management  
3. ✅ `manage-corruption.ts` - Manages Corruption points
4. ✅ `manage-mutation.ts` - Manages mutations
5. ✅ `manage-advantage.ts` - Manages combat Advantage

### Backend.ts Updates COMPLETED:
1. ✅ Updated imports to use new consolidated tool classes
2. ✅ Updated tool instantiations
3. ✅ Updated getToolDefinitions() calls

## NEXT STEPS (Still Required):

### 1. Update Call Handlers in backend.ts

The switch statement in backend.ts (around line 1250-1500) needs to be updated to route tool calls to the new unified handlers:

**Old Handlers (TO REMOVE):**
```typescript
// Corruption & Mutation (old - 6 separate handlers)
case 'get-corruption-status': corruptionMutationTools.handleGetCorruptionStatus
case 'add-corruption': corruptionMutationTools.handleAddCorruption
case 'remove-corruption': corruptionMutationTools.handleRemoveCorruption
case 'list-mutations': corruptionMutationTools.handleListMutations
case 'add-mutation': corruptionMutationTools.handleAddMutation
case 'remove-mutation': corruptionMutationTools.handleRemoveMutation

// Fortune & Fate (old - 12 separate handlers)
case 'get-fortune-fate-status': fortuneFateTools.handleGetFortuneFateStatus
case 'spend-fortune': fortuneFateTools.handleSpendFortune
case 'burn-fate': fortuneFateTools.handleBurnFate
case 'refresh-fortune': fortuneFateTools.handleRefreshFortune
case 'foundry-add-fortune-point': fortuneFateTools.handleAddFortune
case 'foundry-add-fate-point': fortuneFateTools.handleAddFate
case 'get-resilience-resolve-status': fortuneFateTools.handleGetResilienceResolveStatus
case 'spend-resolve': fortuneFateTools.handleSpendResolve
case 'spend-resilience': fortuneFateTools.handleSpendResilience
case 'refresh-resolve': fortuneFateTools.handleRefreshResolve
case 'foundry-add-resolve-point': fortuneFateTools.handleAddResolve
case 'foundry-add-resilience-point': fortuneFateTools.handleAddResilience

// Advantage (old - 4 separate handlers)
case 'get-advantage': advantageTools.handleGetAdvantage
case 'add-advantage': advantageTools.handleAddAdvantage
case 'remove-advantage': advantageTools.handleRemoveAdvantage
case 'calculate-advantage-bonus': advantageTools.handleCalculateAdvantageBonus
```

**New Handlers (TO ADD):**
```typescript
// Corruption (consolidated - 1 handler)
case 'manage-corruption':
  result = await manageCorruptionTools.handle(args);
  break;

// Mutation (consolidated - 1 handler)
case 'manage-mutation':
  result = await manageMutationTools.handle(args);
  break;

// Fortune & Fate (consolidated - 1 handler)
case 'manage-fortune-fate':
  result = await manageFortuneFateTools.handle(args);
  break;

// Resolve & Resilience (consolidated - 1 handler)
case 'manage-resolve-resilience':
  result = await manageResolveResilienceTools.handle(args);
  break;

// Advantage (consolidated - 1 handler)
case 'manage-advantage':
  result = await manageAdvantageTools.handle(args);
  break;
```

### 2. Update index.ts Exports

Remove old exports and add new consolidated exports:

**Remove:**
- `export * from './fate-resilience.js';`
- `export * from './corruption-mutation.js';`
- `export * from './advantage-tracker.js';`

**Add:**
- `export * from './manage-fortune-fate.js';`
- `export * from './manage-resolve-resilience.js';`
- `export * from './manage-corruption.js';`
- `export * from './manage-mutation.js';`
- `export * from './manage-advantage.js';`

### 3. Delete Old Files

After testing, delete:
- `fate-resilience.ts` (1546 lines)
- `corruption-mutation.ts` (788 lines)
- `advantage-tracker.ts` (584 lines)

Total lines removed: ~2918 lines

### 4. Build and Test

```bash
cd packages/mcp-server
npm run build
```

Test all consolidated tools to ensure they work correctly.

## Summary

**Phase 1 Results:**
- **Tools before:** 22 tools (12 + 6 + 4)
- **Tools after:** 5 tools 
- **Reduction:** -17 tools (-77%)
- **Lines saved:** ~2918 lines in old files vs ~1200 lines in new files = ~1700 lines saved

**Next Phases:**
- Phase 2: inventory, items, wounds, conditions, diseases (-17 tools)
- Phase 3: XP, money, social status (-5 tools)
- **Total planned reduction:** ~39 tools (~39% overall)
