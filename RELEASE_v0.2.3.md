# Release Notes: Warhammer MCP v0.2.3

**Release Date**: October 11, 2025  
**Focus**: Character Information Tool Enhancements, Data Organization, Validation Improvements

---

## 🎯 Overview

Version 0.2.3 focuses on improving the character information tool's user experience with better validation feedback, enhanced reporting, and cleaner data organization. This release includes comprehensive testing validation and clarification of WFRP4e mechanics.

---

## ✨ Key Features

### 1. Unknown Field Warnings

**Problem Solved**: Previously, when users provided invalid field names to the character update tool, they were silently ignored with no feedback.

**Solution**: Tool now provides helpful warnings:
```
⚠️ Unknown field(s) ignored: invalidStat, wrongField
Valid fields include: characteristic names (ws, bs, s, t, i, ag, dex, int, wp, fel), 
currentWounds, fortune, fate, resilience, resolve.
```

**Benefits**:
- Users immediately know if they made a typo
- Helpful list of valid fields guides correct usage
- Prevents confusion from silent failures
- Improves learning curve for new users

**Test Coverage**: Test 1.18 validates mixed valid/invalid field handling ✅

---

### 2. Enhanced Characteristic Reporting

**Problem Solved**: Users couldn't see why their requested characteristic values differed from final displayed values.

**Solution**: Tool now shows detailed breakdown:
```
Characteristic Updates:
- I: initial=32, final value=34 (+2 from talents/items)
- FEL: initial=35, final value=42 (+7 from talents/items)
```

**Benefits**:
- Transparency: Users see both initial and calculated values
- Understanding: Clear explanation of where modifiers come from
- Validation: Confirms requested values were set correctly
- WFRP4e Education: Helps users learn how bonuses work

**How It Works**:
1. Tool sets `initial` characteristic to requested value
2. WFRP4e automatically adds bonuses from:
   - Astrological signs (e.g., Wymenos: +2 Fellowship, +2 Initiative)
   - Talents (e.g., Suave: +5 Fellowship)
   - Items and other effects
3. Tool displays both values with calculated modifier

**Test Coverage**: Test 1.21 validates creation flow with sign/talent bonuses ✅

---

### 3. Improved Character Data Organization

**Problem Solved**: Character items array was cluttered with non-inventory items like careers, money, and status effects.

**Solution**: Reorganized character data structure:

**New Structure**:
```javascript
{
  basicInfo: {
    name, species, career,      // Identity
    money: {                     // Aggregated currency
      "Gold Crown": 10,
      "Silver Shilling": 5
    },
    criticalWounds: {           // Wound tracking
      count: 2,
      wounds: [...]
    },
    wounds, fortune, fate...    // Status values
  },
  stats: {
    characteristics,            // WS, BS, S, T, etc.
    skills,                     // All skills with advances
    talents,                    // All talents
    traits,                     // Creature traits
    experience                  // XP tracking
  },
  conditions: {                 // NEW SECTION
    injuries: [...],            // Wound-based afflictions
    mutations: [...],           // Physical/mental changes
    diseases: [...],            // Infections and plagues
    psychology: [...]           // Mental conditions
  },
  items: [                      // CLEANED UP
    // Only physical inventory:
    // weapons, armor, trappings, containers
  ],
  effects: [...]                // Active effects
}
```

**Benefits**:
- **Cleaner Items Array**: Only physical inventory (weapons, armor, trappings)
- **Logical Grouping**: Status conditions separated from physical items
- **Better Organization**: Money aggregated, career in basicInfo
- **WFRP4e Alignment**: Matches conceptual model of character sheet

**Test Coverage**: Test 1.15 validates item filtering and organization ✅

---

### 4. Fortune/Fate Mechanics Clarification

**Question Raised**: Is Fortune exceeding Fate a bug?

**Answer**: No - it's correct WFRP4e behavior!

**How It Works**:
1. **Standard Rule**: Fortune maximum = Fate value
2. **Temporary Excess Allowed**: Fortune can exceed Fate from:
   - GM awards for exceptional roleplay
   - Special blessings or magical items
   - Fate being burned while Fortune is high
3. **Natural Enforcement**: Daily Fortune refresh resets to Fate value
4. **Player Benefit**: Can use excess Fortune before next refresh

**Example**:
```
Day 1: Fortune 2, Fate 2
Character faces death, burns Fate → Fortune 2, Fate 1
Uses both Fortune points during the day
Day 2: Fortune refreshes to 1 (matches new Fate maximum)
```

**Benefits**:
- Allows temporary bonuses without breaking game balance
- Rewards are meaningful but temporary
- Natural mechanics enforce limits
- No manual intervention needed

**Test Coverage**: Test 1.23 validates Fortune/Fate management flow ✅

---

## 🐛 Bug Fixes

### Character Data Retrieval
- **Fixed**: Empty items array when character has no physical inventory
- **Fixed**: Biography fields (motivation, ambitions) not included
- **Enhanced**: Description truncation increased to 200 characters (from 100)

---

## 📝 Tool Description Updates

### Enhanced `get-character` Tool Description

**Old Description**: Generic mention of "character data"

**New Description**: Explicitly lists all sections:
- Identity (name, species, status)
- Characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
- Status (wounds, fortune, fate, resilience, resolve, corruption, money, toughness)
- Critical wounds (count and details)
- Biography (motivation, ambitions)
- Skills (with advances and totals)
- Talents (with descriptions)
- Traits (creature traits)
- **Conditions** (injuries, mutations, diseases, psychology) ← NEW
- **Items** (physical inventory only - weapons, armor, trappings) ← CLARIFIED
- Experience

**Also Added**: Explicit AI filtering guidance
> "Use this tool when the user asks for character info - you can then present only 
> the sections they requested (e.g., if they ask for 'skills and talents only', 
> retrieve all data but present only those sections in your response)."

**Benefits**:
- Clear expectations of what data is returned
- Guidance for AI on contextual filtering
- Documentation of new `conditions` section
- Clarification that `items` = physical inventory only

---

## 🔍 Comprehensive Tool Validation

We performed a complete audit of all update functions to ensure consistency:

### Tools Enhanced ✅
- **character.ts - handleUpdateCharacterInfo**
  - Added unknown field warnings
  - Added enhanced characteristic reporting
  - Added initial vs final value display

### Tools Validated (No Changes Needed) ✅
- **character.ts - handleUpdateSkillTalent**: Uses strict schema (itemName, itemType enum, advances)
- **career-advancement.ts - All functions**: Enum-based validation, XP calculations
- **corruption-mutation.ts - All functions**: Purpose-specific schemas
- **fate-resilience.ts - All functions**: Working as designed per WFRP4e rules

**Key Finding**: Only `handleUpdateCharacterInfo` needed enhancements because it accepts arbitrary field names via `z.record(z.any())`. All other tools use strict schemas with predefined enums that automatically reject invalid inputs.

---

## ✅ Testing Results

All tests passing as of October 11, 2025:

| Test ID | Test Name | Status | Focus |
|---------|-----------|--------|-------|
| 1.15 | Get Character With No Items | ✅ Pass | Item filtering, conditions section |
| 1.18 | Update Multiple Stats - Some Invalid | ✅ Pass | Unknown field warnings |
| 1.19 | Character Case-Insensitive Lookup | ✅ Pass | Name matching |
| 1.21 | Character Creation Flow | ✅ Pass | Sign/talent modifier calculation |
| 1.23 | Fortune/Fate Management Flow | ✅ Pass | Fortune > Fate behavior |

**Previous Tests Still Passing**:
- Test 1.1-1.14: Character management ✅
- Test 2.1-2.4: Career advancement ✅
- Test 3.1-3.5: Corruption/mutation ✅
- Test 4.1-4.10: Fortune/Fate/Resilience/Resolve ✅

---

## 📦 Files Changed

### Package Versions
- `package.json`: 0.2.2 → 0.2.3
- `packages/mcp-server/package.json`: 0.2.2 → 0.2.3
- `packages/foundry-module/package.json`: 0.2.2 → 0.2.3
- `packages/foundry-module/module.json`: 0.2.2 → 0.2.3
- `shared/package.json`: 0.2.2 → 0.2.3

### Source Code
- `packages/mcp-server/src/tools/character.ts`
  - Added `unknownFields` tracking array (line 581)
  - Added unknown field warning generation (lines 697-700)
  - Added `formatConditions()` method (lines 490-534)
  - Enhanced `formatItems()` filtering (lines 469-488)
  - Added post-update character retrieval (line 702)
  - Added characteristic update details extraction (lines 710-725)
  - Added enhanced message building (lines 738-752)
  - Updated tool description with section details (line 28)

### Documentation
- `docs/CHANGELOG.md`: Added v0.2.3 section
- `README.md`: Updated to v0.2.3, new features highlighted
- `RELEASE_v0.2.3.md`: This file (new)
- `test/test_results.md`: Added tests 1.15, 1.18, 1.21, 1.23

---

## 🚀 Upgrade Instructions

### For Users

1. **Update NPM packages**:
   ```bash
   cd /path/to/foundry-vtt-mcp
   npm install
   npm run build
   ```

2. **Restart Claude Desktop** to load new tool definitions

3. **Reload Foundry VTT** (F5) to load updated module

4. **Test the changes**:
   - Try updating a characteristic with an invalid field name to see the new warning
   - Update a characteristic and observe the detailed initial vs final value reporting
   - Retrieve a character and check the new `conditions` section
   - Verify `items` array only contains physical inventory

### For Developers

**Breaking Changes**: None - all changes are backwards compatible

**New Features to Integrate**:
- `formatConditions()` method available for extracting status effects
- Enhanced `formatItems()` with better filtering
- Unknown field tracking pattern for other tools if needed

---

## 🎓 What We Learned

### WFRP4e Mechanics Insights

1. **Characteristic System**:
   - `initial`: Base value set during character creation
   - `advances`: XP-purchased improvements
   - `modifiers`: Automatic bonuses from signs, talents, items
   - `value`: Calculated total (initial + advances + modifiers)

2. **Fortune/Fate Flexibility**:
   - Fortune can temporarily exceed Fate
   - Daily refresh enforces cap naturally
   - Design allows meaningful temporary bonuses

3. **Data Organization**:
   - WFRP4e distinguishes between physical items and status conditions
   - Money is aggregated, not itemized
   - Critical wounds are tracked separately from general injuries

### Development Best Practices

1. **Validation Patterns**:
   - Tools with `z.record(z.any())` need runtime validation
   - Tools with strict schemas get automatic validation
   - User feedback is critical for arbitrary field tools

2. **Transparency**:
   - Show users both input and output values
   - Explain calculated values with source attribution
   - Help users understand system mechanics through tool output

3. **Testing Philosophy**:
   - Apparent bugs may be correct behavior
   - Verify against source rules before "fixing"
   - Document expected behavior clearly

---

## 🔮 Future Considerations

### Potential Enhancements

1. **Modifier Attribution**: Could enhance to show specific source of each modifier
   - Example: `+2 from Wymenos Sign, +5 from Suave Talent`

2. **Validation Warnings**: Could add suggestions for common typos
   - Example: "Did you mean 'weaponSkill' instead of 'weapon_skill'?"

3. **Bulk Updates**: Could optimize multiple characteristic updates in single call

4. **Preset Validation**: Could add presets for common character creation patterns

### Monitoring

- Watch for user feedback on new warning messages
- Monitor if enhanced reporting clarity reduces support questions
- Track if cleaner data structure improves AI response quality

---

## 📞 Support

- **Issues**: https://github.com/IT-Learning-Consulting/warhammer-mcp/issues
- **Documentation**: See `docs/` folder for detailed guides
- **Testing**: See `test/test_results.md` for validation examples

---

## 🙏 Credits

**Original Project**: Foundry VTT MCP Bridge by Adam Dooley  
**WFRP4e Fork**: Danny Castillo (IT Learning Consulting)  
**Testing**: Comprehensive test suite validation  
**Community**: Thanks for bug reports and feature suggestions

---

**Happy Gaming in the Old World! 🎲⚔️**
