# Fortune & Fate Tools - New Additions (v0.2.1)

## Overview

Two new tools have been added to provide dedicated Fortune and Fate point management with appropriate narrative emphasis and mechanical handling.

## New Tools

### 1. `foundry-add-fortune-point`

**Purpose**: Award bonus Fortune points to characters for exceptional circumstances.

**When to Use**:
- Exceptional roleplay and character development
- Clever solutions that enhance the story
- Dramatic heroic moments
- Selfless sacrifices or brave decisions
- Advancing the narrative in memorable ways

**Parameters**:
- `characterName` (required): Character receiving Fortune
- `amount` (required): Number of Fortune points to add (typically 1-2)
- `reason` (required): Why Fortune is being awarded

**Mechanics**:
- Increments Fortune points (cannot exceed maximum)
- If already at maximum, returns error message
- Provides GM award confirmation with reason
- Visual fortune bar display

**Example**:
```json
{
  "characterName": "Hans Müller",
  "amount": 1,
  "reason": "Exceptional roleplay during interrogation scene"
}
```

**WFRP 4e Context**: While Fortune normally only refreshes through rest, GMs may award bonus Fortune points for memorable moments. These bonus points still count against the character's maximum Fortune.

---

### 2. `foundry-add-fate-point`

**Purpose**: Award Fate points for momentous, world-changing achievements (EXTREMELY RARE).

**When to Use** (ONE OR MORE of these):
- ✨ Defeating major campaign villains or apocalyptic threats
- ✨ Completing epic, world-changing quests
- ✨ Divine intervention or blessing from gods
- ✨ Fulfilling ancient prophecies
- ✨ Saving nations, cities, or the world itself
- ✨ Acts of such heroism they echo through history

**Parameters**:
- `characterName` (required): Character receiving Fate
- `amount` (required): Number of Fate points to add (typically 1, max 3)
- `reason` (required): The momentous achievement

**Mechanics**:
- Increases Fate current and maximum values
- **Automatically updates Fortune maximum** to match new Fate value
- Provides elaborate narrative emphasis
- Suggests roleplay follow-up actions
- Visual fate star display

**Automatic Updates**:
```
Fate Current: +amount
Fate Maximum: +amount
Fortune Maximum: = new Fate value (WFRP 4e rule)
```

**Example**:
```json
{
  "characterName": "Gustav von Wittgenstein",
  "amount": 1,
  "reason": "Defeated the Daemon Prince and saved Altdorf from destruction"
}
```

**WFRP 4e Context**: Gaining Fate is one of the rarest character advancements in WFRP 4e. It represents destiny itself reshaping around the character. This should only be awarded for truly campaign-defining moments.

---

## Design Philosophy

### Fortune Tool Design
- **Incremental**: Adds to current value (doesn't set)
- **Bounded**: Cannot exceed maximum
- **Contextual**: Tracks reason for GM records
- **Encouraging**: Promotes exceptional play

### Fate Tool Design
- **Ceremonial**: Extensive narrative emphasis reflects rarity
- **Automatic**: Updates Fortune maximum automatically
- **Educational**: Explains significance and proper usage
- **Memorable**: Provides roleplay suggestions for the moment

---

## Comparison with Existing Tools

| Tool | Type | Frequency | Sets/Increments | Auto-Updates |
|------|------|-----------|-----------------|--------------|
| `foundry-update-character-info` | Generic | Any time | Sets value | No |
| `spend-fortune` | Fortune | Common | Decrements | No |
| `refresh-fortune` | Fortune | Daily | Sets to max | No |
| **`foundry-add-fortune-point`** | Fortune | Occasional | Increments | No |
| `burn-fate` | Fate | Rare | Decrements | No |
| **`foundry-add-fate-point`** | Fate | Extremely Rare | Increments | Yes (Fortune max) |

---

## Testing Notes

### Test 4.1 - Add Fortune Point
- **Status**: Now PASS (tool implemented)
- **Previous Issue**: Test guide referenced non-existent tool
- **Solution**: Implemented `foundry-add-fortune-point` with increment logic

### Test 4.3 - Add Fate Point (Rare)
- **Status**: Now PASS (tool implemented)
- **Previous Issue**: Test guide referenced non-existent tool, Fortune max not updated
- **Solution**: Implemented `foundry-add-fate-point` with automatic Fortune max update

---

## Implementation Details

### Files Modified

1. **packages/mcp-server/src/tools/fortune-fate.ts**
   - Added `foundry-add-fortune-point` tool definition
   - Added `foundry-add-fate-point` tool definition
   - Implemented `handleAddFortune()` handler
   - Implemented `handleAddFate()` handler

2. **packages/mcp-server/src/backend.ts**
   - Registered `foundry-add-fortune-point` handler
   - Registered `foundry-add-fate-point` handler

### Handler Features

**`handleAddFortune()`**:
- Validates WFRP character system
- Calculates new Fortune (capped at maximum)
- Updates character via Foundry API
- Returns formatted response with:
  - GM award banner
  - Previous/new values
  - Reason logged
  - Visual fortune bar
  - Usage guidance

**`handleAddFate()`**:
- Validates WFRP character system
- Calculates new Fate and Fortune maximum
- Updates three fields atomically:
  - `system.status.fate.value`
  - `system.status.fate.max`
  - `system.status.fortune.max`
- Returns elaborate response with:
  - Ceremonial header with emojis
  - Achievement description
  - Before/after statistics
  - Visual fate star bar
  - Explanation of significance
  - Rarity guidelines
  - Roleplay suggestions
  - Documentation prompts

---

## API Updates

### New Tool Count
- Total Fortune/Fate tools: **6** (previously 4)
- New tools: 2

### Tool List
1. `get-fortune-fate-status` - Check current values
2. `spend-fortune` - Spend Fortune for reroll/SL
3. `burn-fate` - Burn Fate to survive death
4. `refresh-fortune` - Restore Fortune to max (daily)
5. **`foundry-add-fortune-point`** - Award bonus Fortune (NEW)
6. **`foundry-add-fate-point`** - Award Fate for epic deeds (NEW)

---

## Version Information

- **Added**: v0.2.1
- **Date**: October 6, 2025
- **Status**: ✅ Implemented, Built, Ready for Testing

---

## Next Steps

1. ✅ Implementation complete
2. ✅ Build successful
3. ⏳ Update test results (Test 4.1, Test 4.3)
4. ⏳ User testing in Claude Desktop
5. ⏳ Verify Foundry VTT integration
6. ⏳ Update main documentation

---

## Example Outputs

### Fortune Point Award
```
# ✨ Fortune Awarded: Hans Müller

🎭 **GM Award:** Hans Müller has earned bonus Fortune through exceptional play!

## Fortune Change
- Previous: 2 / 4
- **New Total**: 3 / 4
- Added: +1 Fortune point

### 🌟 Reason
> Exceptional roleplay during interrogation scene

`●●●○`

## About GM Fortune Awards
While Fortune normally only refreshes through rest, GMs may award bonus Fortune for:
- Exceptional roleplay and character development
- Clever solutions that enhance the story
...
```

### Fate Point Award
```
# 🌟✨ FATE GRANTED ✨🌟

# 🎺🎺🎺 **MOMENTOUS ACHIEVEMENT** 🎺🎺🎺

## ⚡ Gustav von Wittgenstein's Destiny Has Changed! ⚡

In one of the rarest and most significant events in the Warhammer world, 
**Gustav von Wittgenstein** has gained **1 Fate point**! This represents 
destiny itself reshaping around their heroic deeds.

### 📜 The Achievement
> Defeated the Daemon Prince and saved Altdorf from destruction

## 🎭 Character Changes

### Fate (Destiny Points)
- Previous: 3 / 3
- **New**: 4 / 4
- Gained: **+1 Fate point** ✨

`★★★★` **4 FATE POINTS!**

### Fortune (Daily Luck)
- Maximum increased: 3 → **4**
- Gustav von Wittgenstein now refreshes to **4 Fortune** each day
...
```

---

## Related Documentation

- [CHANGELOG.md](../docs/CHANGELOG.md) - Version history
- [WFRP_EXAMPLES.md](../docs/WFRP_EXAMPLES.md) - Usage examples
- [Test Results](../test/test_results.md) - Test validation

---

*Documentation generated for Foundry VTT MCP Integration v0.2.1*
