# Changelog

## v0.2.1 (2025-10-05)

### 🐛 Critical Bug Fixes

- **XP Calculation Bug**: Fixed critical bug in skill and characteristic advancement causing 1000% XP overcharge
  - Skills/characteristics now use correct tiered formula: `Math.floor(currentAdvances / 5)`
  - Example: 11th skill advance now costs 20 XP (was 220 XP)
  - Affected files: `career-advancement.ts` (handleAdvanceSkill, handleAdvanceCharacteristic, handleGetCareerAdvancement)

- **Missing Compendium Handler**: Implemented `foundry-mcp-bridge.addItemFromCompendium` handler
  - Enables adding items from compendiums with all official effects
  - Critical infrastructure for proper WFRP4e integration
  - Affected files: `packages/foundry-module/src/queries.ts`

### ✨ New Features

- **Direct Character Update Tool** (`foundry-update-character-info`)
  - Update characteristics, wounds, fortune, fate without XP costs
  - For character creation, GM corrections, and adjustments
  
- **Direct Skill/Talent Update Tool** (`foundry-update-skill-talent`)
  - Update skill/talent advances directly without XP costs
  - For character setup and GM adjustments

- **Add Skill/Talent from Compendium** (`add-skill-talent`)
  - Search WFRP4e compendiums for skills/talents
  - Add official items with all effects and mechanics
  - Fallback to basic entry if not found

- **Improved Mutation System** (`add-mutation`)
  - Now searches compendiums first for official mutations
  - Uses official WFRP4e mutation data with all effects
  - Fallback to custom entry only if not in compendium

### 📝 Code Quality

- Improved talent cost calculation clarity with better variable naming
- Added detailed comments explaining XP formulas with examples
- Enhanced error messages and user guidance
- Verified all formulas against WFRP4e rulebook

### 📦 Files Changed

- `packages/mcp-server/src/tools/career-advancement.ts`
- `packages/mcp-server/src/tools/character.ts`
- `packages/mcp-server/src/tools/corruption-mutation.ts`
- `packages/mcp-server/src/backend.ts`
- `packages/foundry-module/src/queries.ts`

### 📄 Documentation

- Added comprehensive changes report: `CHANGES_2025-10-05.md`
- Updated test documentation with new tools


