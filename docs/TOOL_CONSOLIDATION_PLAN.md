# MCP Tool Consolidation Plan

**Created:** January 31, 2026  
**Status:** Planning  
**Goal:** Reduce ~100 tools to ~60-65 tools (35-40% reduction)  
**Approach:** Entity-based unified tools with action parameters  
**Backward Compatibility:** None (clean break)

---

## Executive Summary

The current MCP server has ~100 tools spread across 22 files. This causes:
- Potential degradation in AI tool selection
- Cognitive overhead for users
- Maintenance burden with duplicate patterns

This plan consolidates tools using **entity-based grouping** where each game entity (fortune, corruption, mutations, etc.) gets a single unified management tool with an `action` parameter.

---

## Consolidation Strategy

### Pattern: Unified Management Tools

**Before:**
```
add-fortune, spend-fortune, get-fortune-status, refresh-fortune
add-fate, spend-fate, get-fate-status
```

**After:**
```
manage-fortune-fate (action: "add" | "spend" | "refresh" | "get-status")
```

### Schema Pattern

Each unified tool will use a discriminated union pattern:

```typescript
const ManageEntitySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    characterName: z.string(),
    amount: z.number().min(1).max(10),
    reason: z.string().optional()
  }),
  z.object({
    action: z.literal("remove"),
    characterName: z.string(),
    amount: z.number().min(1).max(10),
    reason: z.string().optional()
  }),
  z.object({
    action: z.literal("get-status"),
    characterName: z.string()
  })
]);
```

---

## Phase 1: High-Impact Consolidations

### 1.1 fate-resilience.ts (12 → 2 tools)

**Current Tools:**
| Tool | Action |
|------|--------|
| add-fortune | Add fortune points |
| spend-fortune | Spend fortune points |
| get-fortune-status | Get current fortune |
| refresh-fortune | Reset to max |
| add-fate | Add fate points |
| spend-fate | Spend fate points |
| get-fate-status | Get current fate |
| add-resolve | Add resolve points |
| spend-resolve | Spend resolve points |
| get-resolve-status | Get current resolve |
| refresh-resolve | Reset to max |
| add-resilience | Add resilience points |

**New Tools:**

#### `manage-fortune-fate`
```typescript
{
  name: "manage-fortune-fate",
  description: "Manage Fortune and Fate points for WFRP 4e characters. Fortune refreshes each session; Fate is permanent but can be spent to avoid death.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("add-fortune"),
      characterName: z.string(),
      amount: z.number().min(1).max(10),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("spend-fortune"),
      characterName: z.string(),
      amount: z.number().min(1).max(10).default(1),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("refresh-fortune"),
      characterName: z.string()
    }),
    z.object({
      action: z.literal("add-fate"),
      characterName: z.string(),
      amount: z.number().min(1).max(5),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("spend-fate"),
      characterName: z.string(),
      reason: z.string()  // Required - spending Fate is significant
    }),
    z.object({
      action: z.literal("get-status"),
      characterName: z.string()
    })
  ])
}
```

#### `manage-resolve-resilience`
```typescript
{
  name: "manage-resolve-resilience",
  description: "Manage Resolve and Resilience points for WFRP 4e characters. Resolve refreshes each session; Resilience is permanent but can be spent to resist Corruption.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("add-resolve"),
      characterName: z.string(),
      amount: z.number().min(1).max(10),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("spend-resolve"),
      characterName: z.string(),
      amount: z.number().min(1).max(10).default(1),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("refresh-resolve"),
      characterName: z.string()
    }),
    z.object({
      action: z.literal("add-resilience"),
      characterName: z.string(),
      amount: z.number().min(1).max(5),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("spend-resilience"),
      characterName: z.string(),
      reason: z.string()  // Required - spending Resilience is significant
    }),
    z.object({
      action: z.literal("get-status"),
      characterName: z.string()
    })
  ])
}
```

**Reduction:** 12 → 2 tools (**-10 tools**)

---

### 1.2 corruption-mutation.ts (6 → 2 tools)

**Current Tools:**
| Tool | Action |
|------|--------|
| get-corruption-status | Get corruption level |
| add-corruption | Add corruption points |
| remove-corruption | Remove corruption points |
| list-mutations | List character mutations |
| add-mutation | Add a mutation |
| remove-mutation | Remove a mutation |

**New Tools:**

#### `manage-corruption`
```typescript
{
  name: "manage-corruption",
  description: "Manage Corruption points for WFRP 4e characters. Corruption accumulates from Chaos exposure. When it exceeds thresholds (based on WP+T Bonus), mutations occur.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("add"),
      characterName: z.string(),
      amount: z.number().min(1).max(10),
      reason: z.string()
    }),
    z.object({
      action: z.literal("remove"),
      characterName: z.string(),
      amount: z.number().min(1).max(10),
      reason: z.string()
    }),
    z.object({
      action: z.literal("get-status"),
      characterName: z.string()
    })
  ])
}
```

#### `manage-mutation`
```typescript
{
  name: "manage-mutation",
  description: "Manage mutations for WFRP 4e characters. Mutations are permanent physical/mental changes from Corruption. Searches compendiums first, falls back to custom creation.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("add"),
      characterName: z.string(),
      mutationName: z.string(),
      mutationType: z.enum(["physical", "mental"]).optional(),
      description: z.string().optional()
    }),
    z.object({
      action: z.literal("remove"),
      characterName: z.string(),
      mutationName: z.string()
    }),
    z.object({
      action: z.literal("list"),
      characterName: z.string()
    })
  ])
}
```

**Reduction:** 6 → 2 tools (**-4 tools**)

---

### 1.3 advantage-tracker.ts (4 → 1 tool)

**Current Tools:**
| Tool | Action |
|------|--------|
| get-advantage | Get current advantage |
| add-advantage | Add advantage points |
| remove-advantage | Remove advantage points |
| clear-advantage | Reset to zero |

**New Tool:**

#### `manage-advantage`
```typescript
{
  name: "manage-advantage",
  description: "Manage Advantage for WFRP 4e combat. Advantage accumulates from successful attacks and is lost when hit or combat ends.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("add"),
      characterName: z.string(),
      amount: z.number().min(1).max(10).default(1),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("remove"),
      characterName: z.string(),
      amount: z.number().min(1).max(10).default(1),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("clear"),
      characterName: z.string(),
      reason: z.string().optional()
    }),
    z.object({
      action: z.literal("get"),
      characterName: z.string()
    })
  ])
}
```

**Reduction:** 4 → 1 tool (**-3 tools**)

---

## Phase 2: Medium-Impact Consolidations

### 2.1 critical-wounds.ts (5 → 2 tools)

**Current Tools:**
- roll-critical-wound
- apply-critical-wound
- list-critical-wounds
- remove-critical-wound
- get-critical-wound-details

**New Tools:**

#### `manage-critical-wound`
Actions: add, remove, list, get-details

#### `roll-critical-wound`
Keep separate - distinct dice-rolling behavior

**Reduction:** 5 → 2 tools (**-3 tools**)

---

### 2.2 inventory-management.ts (5 → 2 tools)

**Current Tools:**
- add-item-to-inventory
- remove-item-from-inventory
- get-inventory
- equip-item
- unequip-item

**New Tools:**

#### `manage-inventory`
Actions: add, remove, list, equip, unequip

**Reduction:** 5 → 1 tool (**-4 tools**)

---

### 2.3 item-creator.ts (5 → 1 tool)

**Current Tools:**
- create-weapon
- create-armour
- create-trapping
- create-ammunition
- create-container

**New Tool:**

#### `create-item`
```typescript
{
  name: "create-item",
  schema: z.discriminatedUnion("itemType", [
    z.object({ itemType: z.literal("weapon"), /* weapon fields */ }),
    z.object({ itemType: z.literal("armour"), /* armour fields */ }),
    z.object({ itemType: z.literal("trapping"), /* trapping fields */ }),
    z.object({ itemType: z.literal("ammunition"), /* ammo fields */ }),
    z.object({ itemType: z.literal("container"), /* container fields */ })
  ])
}
```

**Reduction:** 5 → 1 tool (**-4 tools**)

---

### 2.4 disease-management.ts (4 → 1 tool)

**Current Tools:**
- apply-disease
- list-diseases
- remove-disease
- progress-disease

**New Tool:**

#### `manage-disease`
Actions: apply, list, remove, progress

**Reduction:** 4 → 1 tool (**-3 tools**)

---

### 2.5 conditions.ts (4 → 1 tool)

**Current Tools:**
- apply-condition
- remove-condition
- list-conditions
- get-condition-info

**New Tool:**

#### `manage-condition`
Actions: apply, remove, list, get-info

**Reduction:** 4 → 1 tool (**-3 tools**)

---

## Phase 3: Lower-Impact Consolidations

### 3.1 social-status.ts (2 → 1 tool)

**Current Tools:**
- get-social-status
- calculate-social-modifier

**New Tool:**

#### `manage-social-status`
Actions: get, calculate-modifier

**Reduction:** 2 → 1 tool (**-1 tool**)

---

### 3.2 experience.ts (3 → 1 tool)

**Current Tools:**
- award-experience
- spend-experience
- get-experience-status

**New Tool:**

#### `manage-experience`
Actions: award, spend, get-status

**Reduction:** 3 → 1 tool (**-2 tools**)

---

### 3.3 money.ts (3 → 1 tool)

**Current Tools:**
- add-money
- remove-money
- get-money

**New Tool:**

#### `manage-money`
Actions: add, remove, get

**Reduction:** 3 → 1 tool (**-2 tools**)

---

## Tools to Keep Separate

Some tools should remain standalone due to distinct functionality:

| Tool | Reason |
|------|--------|
| `list-characters` | Discovery tool, no entity management |
| `search-compendium` | Search utility |
| `roll-*` tools | Dice rolling has unique mechanics |
| `get-character-sheet` | Read-only overview |
| `make-skill-test` | Complex roll mechanics |
| `make-characteristic-test` | Complex roll mechanics |

---

## Implementation Order

### Priority 1 (Highest Impact)
1. **fate-resilience.ts** - 12 → 2 tools (-10)
2. **corruption-mutation.ts** - 6 → 2 tools (-4)
3. **advantage-tracker.ts** - 4 → 1 tool (-3)

**Phase 1 Total: -17 tools**

### Priority 2 (Medium Impact)
4. **item-creator.ts** - 5 → 1 tool (-4)
5. **inventory-management.ts** - 5 → 1 tool (-4)
6. **critical-wounds.ts** - 5 → 2 tools (-3)
7. **conditions.ts** - 4 → 1 tool (-3)
8. **disease-management.ts** - 4 → 1 tool (-3)

**Phase 2 Total: -17 tools**

### Priority 3 (Polish)
9. **experience.ts** - 3 → 1 tool (-2)
10. **money.ts** - 3 → 1 tool (-2)
11. **social-status.ts** - 2 → 1 tool (-1)

**Phase 3 Total: -5 tools**

---

## Estimated Final Count

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| Phase 1 targets | 22 | 5 | -17 |
| Phase 2 targets | 23 | 6 | -17 |
| Phase 3 targets | 8 | 3 | -5 |
| Other tools | ~47 | ~47 | 0 |
| **TOTAL** | **~100** | **~61** | **~39** |

---

## Testing Strategy

For each consolidated tool:

1. **Unit Tests:** Test each action variant
2. **Integration Tests:** Verify Foundry communication
3. **Regression Tests:** Ensure same functionality as original tools
4. **AI Comprehension Test:** Verify Claude/GPT correctly selects actions

### Test Template

```markdown
## Test: manage-{entity}

### Action: add
- [ ] Valid input accepted
- [ ] Invalid input rejected (Zod validation)
- [ ] Character not found handled
- [ ] Success response formatted correctly

### Action: remove
- [ ] Valid input accepted
- [ ] Cannot remove below 0
- [ ] Character not found handled

### Action: get-status
- [ ] Returns correct current values
- [ ] Character not found handled
```

---

## Tool Reset Instructions

After implementing changes, to reset/reload tools:

### VS Code (Copilot)
1. Rebuild: `npm run build` in `packages/mcp-server`
2. VS Code auto-detects changes and reloads MCP tools
3. If not, reload window: `Ctrl+Shift+P` → "Developer: Reload Window"

### Claude Desktop
1. Edit `%APPDATA%\Claude\claude_desktop_config.json`
2. The config points to the built server:
   ```json
   {
     "mcpServers": {
       "wfrp4e-mcp": {
         "command": "node",
         "args": ["path/to/packages/mcp-server/dist/index.js"]
       }
     }
   }
   ```
3. Completely quit Claude Desktop (system tray too)
4. Restart Claude Desktop

---

## Migration Checklist

For each tool file:

- [ ] Create new unified tool schema
- [ ] Implement action router/handler
- [ ] Remove old individual tools
- [ ] Update index.ts exports
- [ ] Update tool registration
- [ ] Run tests
- [ ] Update documentation

---

## Next Steps

1. **Approve this plan** - Review and confirm approach
2. **Start Phase 1** - Begin with fate-resilience.ts or corruption-mutation.ts
3. **Test incrementally** - Verify each consolidation before proceeding
4. **Update docs** - Keep CLAUDE.md and tool docs in sync

---

## Appendix: File Locations

```
packages/mcp-server/src/tools/
├── advantage-tracker.ts      # Phase 1
├── character-creation.ts
├── character-lookup.ts
├── compendium.ts
├── conditions.ts             # Phase 2
├── corruption-mutation.ts    # Phase 1
├── critical-wounds.ts        # Phase 2
├── dice-roller.ts
├── disease-management.ts     # Phase 2
├── experience.ts             # Phase 3
├── fate-resilience.ts        # Phase 1
├── index.ts
├── inventory-management.ts   # Phase 2
├── item-creator.ts           # Phase 2
├── money.ts                  # Phase 3
├── skill-test.ts
├── social-status.ts          # Phase 3
├── spell-management.ts
├── talent-management.ts
├── token-management.ts
├── trappings.ts
└── wounds.ts
```
