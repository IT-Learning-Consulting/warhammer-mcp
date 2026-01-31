# MCP Tool Consolidation Plan - Phase 2

**Created:** January 31, 2025  
**Status:** ✅ COMPLETE  
**Previous Work:** Phases 1-3 complete (51 → 12 tools consolidated)  
**Starting Tool Count:** 66 tools  
**Final Tool Count:** 36 tools  
**Achievement:** 30 tool reduction (45% reduction from Phase 2 start)

---

## Executive Summary

The original consolidation plan (Phases 1-3) has been **successfully completed**, reducing tools from ~100 to ~66. **Phase 2 (Phases 4-11) is now also COMPLETE**, achieving the aggressive target of 36 tools.

### Completed Work (Phases 1-3)

| Phase | Consolidation | Before | After | Reduction |
|-------|--------------|--------|-------|-----------|
| Phase 1 | Fortune/Fate, Resolve/Resilience, Corruption, Mutation, Advantage | 22 | 5 | -17 |
| Phase 2 | Inventory, Item Creation, Critical Wounds, Disease | 19 | 5 | -14 |
| Phase 3 | Social Status, Career Advancement | 10 | 2 | -8 |
| **Total** | | **51** | **12** | **-39** |

### New Phases (4-11)

| Phase | Focus | Reduction |
|-------|-------|-----------|
| Phase 4 | Remove duplicate tools | -4 |
| Phase 5 | Character management | -4 |
| Phase 6 | Divine magic | -5 |
| Phase 7 | Arcane magic | -5 |
| Phase 8 | Ownership management | -2 |
| Phase 9 | NPC generation (optional) | -2 |
| Phase 10 | RollTables (optional) | -4 |
| Phase 11 | Quests/Journals (optional) | -4 |
| **Total** | | **-30** |

---

## Current Tool Inventory (66 Tools)

### Already Consolidated Tools (12 tools)

| File | Tool | Actions |
|------|------|---------|
| manage-fortune-fate.ts | `manage-fortune-fate` | add-fortune, spend-fortune, refresh-fortune, add-fate, burn-fate, get-status |
| manage-resolve-resilience.ts | `manage-resolve-resilience` | add-resolve, spend-resolve, refresh-resolve, add-resilience, spend-resilience, get-status |
| manage-corruption.ts | `manage-corruption` | add, remove, get-status |
| manage-mutation.ts | `manage-mutation` | add, remove, list |
| manage-advantage.ts | `manage-advantage` | add, remove, clear, get |
| manage-inventory.ts | `manage-inventory` | get-status, add-item, remove-item, track-ammunition, check-encumbrance |
| create-item.ts | `create-item` | weapon, armour, trapping, ammunition, container |
| manage-critical-wound.ts | `manage-critical-wound` | list, add, remove, check-death |
| roll-critical-wound.ts | `roll-critical-wound` | (standalone) |
| manage-disease.ts | `manage-disease` | list, add, remove, check-resilience |
| manage-social-status.ts | `manage-social-status` | get-status, change-status, make-social-test, calculate-income, check-reputation |
| manage-career.ts | `manage-career` | get-advancement, advance-characteristic, advance-skill, advance-talent, change-career |

### Tools Requiring Consolidation

| File | Tools | Count | Target Phase |
|------|-------|-------|--------------|
| item-creator.ts | create-weapon, create-armour, add-item-to-character, remove-item-from-character, modify-item-qualities | 5 | Phase 4 (duplicates) |
| character.ts | get-character-data, list-characters, foundry-update-character-info, foundry-update-skill-talent, add-skill-talent, foundry-update-character-notes, foundry-add-experience-log-entry | 7 | Phase 5 |
| prayer-blessing.ts | get-active-blessings, invoke-prayer, check-divine-favor, add-sin-point, perform-penance, end-blessing | 6 | Phase 6 |
| spell-magic.ts | get-known-spells, cast-spell, channel-power, check-miscast, memorize-spell, learn-spell | 6 | Phase 7 |
| ownership.ts | assign-actor-permissions, remove-actor-permissions, list-actor-permissions | 3 | Phase 8 |
| custom-npc-generator.ts | create-custom-npc, list-npc-archetypes, preview-xp-distribution | 3 | Phase 9 |
| rolltable-management.ts | create-rolltable, list-rolltables, get-rolltable, roll-on-table, delete-rolltable | 5 | Phase 10 |
| quest-creation.ts | create-journal-entry, link-quest-to-npc, update-journal-entry, list-journal-entries, search-journal-entries | 5 | Phase 11 |

### Standalone Tools (Keep As-Is)

| File | Tools | Reason |
|------|-------|--------|
| compendium.ts | search-compendium, get-compendium-skills, get-compendium-talents, get-compendium-creatures | Core discovery tools |
| scene.ts | get-current-scene, get-world-info | Simple read-only utilities |
| actor-creation.ts | create-actor-from-compendium, get-compendium-entry-full | Complex batch operations |
| dice-roll-request.ts | dice-roll-request | Interactive UI feature |
| campaign-dashboard.ts | create-campaign-dashboard | One-off campaign setup |
| map-generation.ts | generate-map, check-map-status, cancel-map-job, list-scenes, switch-scene | Async job handling |

---

## Phase 4: Remove Duplicate Tools

**Priority:** IMMEDIATE  
**Impact:** -4 tools (quick win)

### Problem

`item-creator.ts` contains 5 tools that duplicate functionality already in consolidated tools:

| Duplicate Tool | Already Exists In |
|---------------|-------------------|
| `create-weapon` | `create-item` (itemType: "weapon") |
| `create-armour` | `create-item` (itemType: "armour") |
| `add-item-to-character` | `manage-inventory` (action: "add-item") |
| `remove-item-from-character` | `manage-inventory` (action: "remove-item") |

### Action Plan

1. **Keep only `modify-item-qualities`** from item-creator.ts (unique functionality)
2. Remove the 4 duplicate tool definitions
3. Update backend.ts to remove duplicate registrations
4. Consider moving `modify-item-qualities` to a better location (or add as action to `create-item`)

### Implementation

```typescript
// item-creator.ts - AFTER cleanup
// Only exports: modify-item-qualities

// OR move to create-item.ts as new action:
// create-item actions: weapon, armour, trapping, ammunition, container, modify-qualities
```

**Reduction:** 5 → 1 tool (**-4 tools**)

---

## Phase 5: Character Management Consolidation

**Priority:** HIGH  
**Impact:** -4 tools

### Current Tools in character.ts (7 tools)

| Tool | Purpose | Consolidation |
|------|---------|---------------|
| `get-character-data` | Retrieve full character sheet | ❌ Keep standalone |
| `list-characters` | List all characters | ❌ Keep standalone |
| `foundry-update-character-info` | Update stats/characteristics | ✅ → `manage-character` |
| `foundry-update-skill-talent` | GM direct skill/talent update | ✅ → `manage-character` |
| `add-skill-talent` | Add skill/talent from compendium | ✅ → `manage-character` |
| `foundry-update-character-notes` | Update GM Notes/Biography | ✅ → `manage-character` |
| `foundry-add-experience-log-entry` | Add XP log entry | ✅ → `manage-character` |

### New Tool: `manage-character`

```typescript
{
  name: "manage-character",
  description: "Unified character management for WFRP 4e - update stats, skills, talents, notes, and experience logs. Use get-character-data for reading and list-characters for discovery.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("update-stats"),
      characterName: z.string(),
      updates: z.object({
        characteristics: z.record(z.number()).optional(),
        details: z.object({
          species: z.string().optional(),
          gender: z.string().optional(),
          age: z.string().optional(),
          height: z.string().optional(),
          weight: z.string().optional(),
          eyeColour: z.string().optional(),
          hairColour: z.string().optional()
        }).optional(),
        status: z.object({
          wounds: z.number().optional(),
          advantage: z.number().optional()
        }).optional()
      })
    }),
    z.object({
      action: z.literal("update-skill-talent"),
      characterName: z.string(),
      itemName: z.string(),
      updates: z.object({
        advances: z.number().optional(),
        modifier: z.number().optional()
      })
    }),
    z.object({
      action: z.literal("add-skill-talent"),
      characterName: z.string(),
      itemName: z.string(),
      itemType: z.enum(["skill", "talent"]),
      advances: z.number().optional()
    }),
    z.object({
      action: z.literal("update-notes"),
      characterName: z.string(),
      noteType: z.enum(["gmnotes", "biography"]),
      content: z.string(),
      append: z.boolean().default(false)
    }),
    z.object({
      action: z.literal("add-xp-log"),
      characterName: z.string(),
      amount: z.number(),
      reason: z.string(),
      type: z.enum(["earned", "spent"]).default("earned")
    })
  ])
}
```

### Files After Phase 5

- `character.ts` → Only exports: `get-character-data`, `list-characters`
- `manage-character.ts` → New file with consolidated tool

**Reduction:** 7 → 3 tools (**-4 tools**)

---

## Phase 6: Divine Magic Consolidation

**Priority:** HIGH  
**Impact:** -5 tools

### Current Tools in prayer-blessing.ts (6 tools)

| Tool | Purpose |
|------|---------|
| `get-active-blessings` | List active blessings/prayers |
| `invoke-prayer` | Cast a prayer or blessing |
| `check-divine-favor` | Get sin points and divine standing |
| `add-sin-point` | Add sin points for transgressions |
| `perform-penance` | Perform penance to reduce sin |
| `end-blessing` | End an active blessing effect |

### New Tool: `manage-divine-magic`

```typescript
{
  name: "manage-divine-magic",
  description: "Manage divine magic for WFRP 4e priests and religious characters. Handle prayers, blessings, sin points, and divine favor.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("get-blessings"),
      characterName: z.string()
    }),
    z.object({
      action: z.literal("invoke"),
      characterName: z.string(),
      prayerName: z.string(),
      targetName: z.string().optional(),
      difficulty: z.enum(["easy", "average", "challenging", "difficult", "very-hard"]).optional()
    }),
    z.object({
      action: z.literal("check-favor"),
      characterName: z.string()
    }),
    z.object({
      action: z.literal("add-sin"),
      characterName: z.string(),
      amount: z.number().min(1).max(10).default(1),
      reason: z.string()
    }),
    z.object({
      action: z.literal("penance"),
      characterName: z.string(),
      penanceType: z.string(),
      sinReduction: z.number().min(1).max(10)
    }),
    z.object({
      action: z.literal("end-blessing"),
      characterName: z.string(),
      blessingName: z.string()
    })
  ])
}
```

**Reduction:** 6 → 1 tool (**-5 tools**)

---

## Phase 7: Arcane Magic Consolidation

**Priority:** HIGH  
**Impact:** -5 tools

### Current Tools in spell-magic.ts (6 tools)

| Tool | Purpose |
|------|---------|
| `get-known-spells` | List known spells by lore |
| `cast-spell` | Cast a spell with channelled SL |
| `channel-power` | Use Channelling to accumulate power |
| `check-miscast` | Determine miscast effects |
| `memorize-spell` | Memorize a spell from spellbook |
| `learn-spell` | Learn a new spell from compendium |

### New Tool: `manage-arcane-magic`

```typescript
{
  name: "manage-arcane-magic",
  description: "Manage arcane magic for WFRP 4e wizards. Handle spells, channelling, miscasts, and spell memorization.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("get-spells"),
      characterName: z.string(),
      lore: z.string().optional()
    }),
    z.object({
      action: z.literal("cast"),
      characterName: z.string(),
      spellName: z.string(),
      channelledSL: z.number().default(0),
      targetName: z.string().optional(),
      overcast: z.boolean().default(false)
    }),
    z.object({
      action: z.literal("channel"),
      characterName: z.string(),
      lore: z.string(),
      accumulatedSL: z.number().default(0)
    }),
    z.object({
      action: z.literal("check-miscast"),
      characterName: z.string(),
      severity: z.enum(["minor", "major", "catastrophic"]),
      rollResult: z.number().optional()
    }),
    z.object({
      action: z.literal("memorize"),
      characterName: z.string(),
      spellName: z.string()
    }),
    z.object({
      action: z.literal("learn"),
      characterName: z.string(),
      spellName: z.string(),
      lore: z.string()
    })
  ])
}
```

**Reduction:** 6 → 1 tool (**-5 tools**)

---

## Phase 8: Ownership Consolidation

**Priority:** MEDIUM  
**Impact:** -2 tools

### Current Tools in ownership.ts (3 tools)

| Tool | Purpose |
|------|---------|
| `assign-actor-permissions` | Assign permissions to actors |
| `remove-actor-permissions` | Remove permissions |
| `list-actor-permissions` | List current permissions |

### New Tool: `manage-ownership`

```typescript
{
  name: "manage-ownership",
  description: "Manage actor ownership and permissions in Foundry VTT. Control which players can view, edit, or control actors.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("assign"),
      actorName: z.string(),
      userId: z.string(),
      level: z.enum(["none", "limited", "observer", "owner"])
    }),
    z.object({
      action: z.literal("remove"),
      actorName: z.string(),
      userId: z.string()
    }),
    z.object({
      action: z.literal("list"),
      actorName: z.string()
    })
  ])
}
```

**Reduction:** 3 → 1 tool (**-2 tools**)

---

## Phase 9: NPC Generator Consolidation (Optional)

**Priority:** LOW  
**Impact:** -2 tools

### Current Tools in custom-npc-generator.ts (3 tools)

| Tool | Purpose |
|------|---------|
| `create-custom-npc` | Create NPC with archetype and XP budget |
| `list-npc-archetypes` | List available archetypes |
| `preview-xp-distribution` | Preview how XP would be distributed |

### New Tool: `manage-npc-generation`

```typescript
{
  name: "manage-npc-generation",
  description: "Generate custom NPCs using archetypes and XP budgets for WFRP 4e.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("create"),
      name: z.string(),
      archetype: z.string(),
      xpBudget: z.number(),
      customizations: z.object({...}).optional()
    }),
    z.object({
      action: z.literal("list-archetypes")
    }),
    z.object({
      action: z.literal("preview"),
      archetype: z.string(),
      xpBudget: z.number()
    })
  ])
}
```

**Reduction:** 3 → 1 tool (**-2 tools**)

---

## Phase 10: RollTable Consolidation (Optional)

**Priority:** LOW  
**Impact:** -4 tools

### Current Tools in rolltable-management.ts (5 tools)

| Tool | Purpose |
|------|---------|
| `create-rolltable` | Create new roll table |
| `list-rolltables` | List all tables |
| `get-rolltable` | Get table details |
| `roll-on-table` | Roll on a table |
| `delete-rolltable` | Delete a table |

### New Tool: `manage-rolltable`

```typescript
{
  name: "manage-rolltable",
  description: "Manage roll tables in Foundry VTT - create, list, roll, and delete tables.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("create"),
      name: z.string(),
      formula: z.string(),
      results: z.array(z.object({
        range: z.tuple([z.number(), z.number()]),
        text: z.string()
      }))
    }),
    z.object({
      action: z.literal("list")
    }),
    z.object({
      action: z.literal("get"),
      tableName: z.string()
    }),
    z.object({
      action: z.literal("roll"),
      tableName: z.string()
    }),
    z.object({
      action: z.literal("delete"),
      tableName: z.string()
    })
  ])
}
```

**Reduction:** 5 → 1 tool (**-4 tools**)

---

## Phase 11: Quest/Journal Consolidation (Optional)

**Priority:** LOW  
**Impact:** -4 tools

### Current Tools in quest-creation.ts (5 tools)

| Tool | Purpose |
|------|---------|
| `create-journal-entry` | Create new quest/journal |
| `link-quest-to-npc` | Link quest to NPC |
| `update-journal-entry` | Update quest progress |
| `list-journal-entries` | List all journals |
| `search-journal-entries` | Search journal content |

### New Tool: `manage-journal`

```typescript
{
  name: "manage-journal",
  description: "Manage journal entries and quests in Foundry VTT.",
  schema: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("create"),
      name: z.string(),
      content: z.string(),
      folder: z.string().optional(),
      questStatus: z.enum(["active", "completed", "failed"]).optional()
    }),
    z.object({
      action: z.literal("update"),
      journalName: z.string(),
      content: z.string().optional(),
      questStatus: z.enum(["active", "completed", "failed"]).optional()
    }),
    z.object({
      action: z.literal("link-npc"),
      journalName: z.string(),
      npcName: z.string()
    }),
    z.object({
      action: z.literal("list"),
      folder: z.string().optional()
    }),
    z.object({
      action: z.literal("search"),
      query: z.string()
    })
  ])
}
```

**Reduction:** 5 → 1 tool (**-4 tools**)

---

## Implementation Order

### Completed Phases

| Order | Phase | Impact | Complexity | Status |
|-------|-------|--------|------------|--------|
| 1 | Phase 4: Remove Duplicates | -4 | Low | ✅ Complete |
| 2 | Phase 5: Character | -4 | Medium | ✅ Complete |
| 3 | Phase 6: Divine Magic | -5 | Medium | ✅ Complete |
| 4 | Phase 7: Arcane Magic | -5 | Medium | ✅ Complete |
| 5 | Phase 8: Ownership | -2 | Low | ✅ Complete |
| 6 | Phase 9: NPC Generator | -2 | Medium | ✅ Complete |
| 7 | Phase 10: RollTables | -4 | Low | ✅ Complete |
| 8 | Phase 11: Journals | -4 | Low | ✅ Complete |

**All Phases Total: -30 tools (66 → 36)** ✅ ACHIEVED

---

## Tool Count Summary

| Milestone | Tool Count | Reduction | Status |
|-----------|------------|-----------|--------|
| Original (pre-Phase 1) | ~100 | - | ✅ |
| After Phases 1-3 | 66 | -34 | ✅ |
| After Phase 4 (duplicates) | 62 | -4 | ✅ |
| After Phase 5 (character) | 58 | -4 | ✅ |
| After Phase 6 (divine) | 53 | -5 | ✅ |
| After Phase 7 (arcane) | 48 | -5 | ✅ |
| After Phase 8 (ownership) | 46 | -2 | ✅ |
| After Phase 9 (NPC) | 44 | -2 | ✅ |
| After Phase 10 (rolltable) | 40 | -4 | ✅ |
| After Phase 11 (journal) | 36 | -4 | ✅ |
| **FINAL COUNT** | **36** | **-64 total** | ✅ **ACHIEVED** |

---

## Tools to Keep Standalone

These tools should NOT be consolidated:

| Tool | File | Reason |
|------|------|--------|
| `get-character-data` | character.ts | Core read operation, frequently used |
| `list-characters` | character.ts | Discovery tool |
| `search-compendium` | compendium.ts | Complex search with many options |
| `get-compendium-skills` | compendium.ts | Specialized discovery |
| `get-compendium-talents` | compendium.ts | Specialized discovery |
| `get-compendium-creatures` | compendium.ts | Specialized discovery |
| `create-actor-from-compendium` | actor-creation.ts | Complex batch operation |
| `get-compendium-entry-full` | actor-creation.ts | Deep data retrieval |
| `dice-roll-request` | dice-roll-request.ts | Interactive UI feature |
| `create-campaign-dashboard` | campaign-dashboard.ts | One-off complex setup |
| `generate-map` | map-generation.ts | Async job with status tracking |
| `check-map-status` | map-generation.ts | Job status polling |
| `cancel-map-job` | map-generation.ts | Job cancellation |
| `list-scenes` | map-generation.ts | Scene management |
| `switch-scene` | map-generation.ts | Scene management |
| `get-current-scene` | scene.ts | Simple utility |
| `get-world-info` | scene.ts | Simple utility |
| `roll-critical-wound` | roll-critical-wound.ts | Dice rolling mechanics |

---

## Migration Checklist

For each phase:

- [ ] Create new consolidated tool file
- [ ] Implement discriminatedUnion schema
- [ ] Implement action router/handler
- [ ] Update backend.ts imports
- [ ] Update backend.ts getToolDefinitions()
- [ ] Update backend.ts switch case handlers
- [ ] Delete old tool files (or remove old exports)
- [ ] Run `npm run build`
- [ ] Test each action
- [ ] Update documentation

---

## Files to Create

| Phase | New File | Replaces |
|-------|----------|----------|
| Phase 5 | manage-character.ts | (partial) character.ts |
| Phase 6 | manage-divine-magic.ts | prayer-blessing.ts |
| Phase 7 | manage-arcane-magic.ts | spell-magic.ts |
| Phase 8 | manage-ownership.ts | ownership.ts |
| Phase 9 | manage-npc-generation.ts | custom-npc-generator.ts |
| Phase 10 | manage-rolltable.ts | rolltable-management.ts |
| Phase 11 | manage-journal.ts | quest-creation.ts |

---

## Files to Delete/Modify

| Phase | Action | File |
|-------|--------|------|
| Phase 4 | Remove duplicates | item-creator.ts (keep only modify-item-qualities) |
| Phase 5 | Remove 5 tools | character.ts |
| Phase 6 | Delete | prayer-blessing.ts |
| Phase 7 | Delete | spell-magic.ts |
| Phase 8 | Delete | ownership.ts |
| Phase 9 | Delete | custom-npc-generator.ts |
| Phase 10 | Delete | rolltable-management.ts |
| Phase 11 | Delete | quest-creation.ts |

---

## Completion Summary

✅ **All phases completed on January 31, 2025**

### Files Created
- `manage-character.ts` - Character editing consolidation
- `manage-divine-magic.ts` - Prayer/blessing consolidation  
- `manage-arcane-magic.ts` - Spell/magic consolidation
- `manage-ownership.ts` - Permission management consolidation
- `manage-npc-generation.ts` - NPC generator consolidation
- `manage-rolltable.ts` - Roll table consolidation
- `manage-journal.ts` - Journal/quest consolidation

### Files Deleted
- `prayer-blessing.ts` (~1048 lines)
- `spell-magic.ts` (~1265 lines)
- `ownership.ts` (~304 lines)
- `custom-npc-generator.ts` (~1198 lines)
- `rolltable-management.ts` (~404 lines)
- `quest-creation.ts` (~1078 lines)
- **Total: ~5,293 lines removed**

### Documentation Updated
- `CLAUDE.md` - Tool count and recent changes
- `docs/INSTRUCTIONS.md` - Version and tool list
- `docs/CHANGELOG.md` - v0.2.4 entry
- `package.json` - Version bump to 0.2.4

---

## Appendix: Current File Structure

```
packages/mcp-server/src/tools/
├── actor-creation.ts           # Keep as-is
├── campaign-dashboard.ts       # Keep as-is
├── character.ts                # Phase 5 (partial consolidation)
├── compendium.ts               # Keep as-is
├── create-item.ts              # ✅ Already consolidated
├── custom-npc-generator.ts     # Phase 9 (optional)
├── dice-roll-request.ts        # Keep as-is
├── item-creator.ts             # Phase 4 (remove duplicates)
├── manage-advantage.ts         # ✅ Already consolidated
├── manage-career.ts            # ✅ Already consolidated
├── manage-corruption.ts        # ✅ Already consolidated
├── manage-critical-wound.ts    # ✅ Already consolidated
├── manage-disease.ts           # ✅ Already consolidated
├── manage-fortune-fate.ts      # ✅ Already consolidated
├── manage-inventory.ts         # ✅ Already consolidated
├── manage-mutation.ts          # ✅ Already consolidated
├── manage-resolve-resilience.ts # ✅ Already consolidated
├── manage-social-status.ts     # ✅ Already consolidated
├── map-generation.ts           # Keep as-is
├── ownership.ts                # Phase 8
├── prayer-blessing.ts          # Phase 6
├── quest-creation.ts           # Phase 11 (optional)
├── roll-critical-wound.ts      # ✅ Already consolidated
├── rolltable-management.ts     # Phase 10 (optional)
├── scene.ts                    # Keep as-is
└── spell-magic.ts              # Phase 7
```
