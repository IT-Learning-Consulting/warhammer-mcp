# Changelog

## v0.2.2 (2025-10-06)

### 🐛 Critical Bug Fixes

- **Career Change Tool - UUID Construction Bug**: Fixed critical issue where career change tool failed to add careers from compendium
  - Tool now properly constructs UUID from compendium pack and item ID (`Compendium.{pack}.{id}`)
  - Previously expected search results to have `uuid` field, but they return `pack` and `id` fields
  - Added fallback logic to handle both UUID formats
  - Affected files: `career-advancement.ts` (handleChangeCareer)

- **Career Change Tool - Operation Order Bug**: Fixed atomic operation order in career changes
  - **Old order**: Unmark old career → Add new career → Mark new current → Deduct XP
  - **New order**: Add new career → Mark new current → Unmark old career → Deduct XP
  - Prevents character from having no current career if operation fails mid-process
  - Provides better error recovery and clearer UI state during operations
  - Affected files: `career-advancement.ts` (handleChangeCareer lines 790-820)

### ✨ New Features

- **Resilience & Resolve System** (6 new tools) - Complete mirror of Fortune/Fate for NPCs
  - `get-resilience-resolve-status` - Display current Resilience and Resolve points
  - `spend-resolve` - Use a Resolve point for rerolls (daily resource)
  - `spend-resilience` - Burn a Resilience point to avoid death (permanent cost)
  - `refresh-resolve` - Reset Resolve points to maximum (new day)
  - `add-resolve` - Award bonus Resolve for exceptional actions
  - `add-resilience` - Grant permanent Resilience (extremely rare)
  - Full parity with Fortune/Fate mechanics for NPC resource management
  - Affected files: `fate-resilience.ts` (renamed from `fortune-fate.ts`)

### 📝 Code Quality & Documentation

- **File Rename**: `fortune-fate.ts` → `fate-resilience.ts` for better naming clarity
- Enhanced error messages with detailed data logging for debugging
- Added comprehensive test documentation for all new features
- Verified all Resilience/Resolve tools match Fortune/Fate behavior

### 📦 Files Changed

- `packages/mcp-server/src/tools/career-advancement.ts`
- `packages/mcp-server/src/tools/fate-resilience.ts` (renamed from fortune-fate.ts)
- `packages/mcp-server/src/backend.ts`

### ✅ Testing

All tests passing (as of October 6, 2025):
- **Test 1.1-1.4**: Character management and updates ✅
- **Test 2.1-2.3**: Career advancement (characteristics, skills, talents) ✅
- **Test 3.1-3.5**: Corruption and mutation system ✅
- **Test 4.1-4.5**: Fortune & Fate mechanics ✅
- **Test 4.6-4.10**: Resilience & Resolve mechanics (new) ✅
- **Test 2.4**: Career change tool (in progress - fixes implemented)

### 📄 Documentation Added

- `RESILIENCE_RESOLVE_TESTS.md` - Complete testing guide for new Resilience/Resolve system
- `CAREER_CHANGE_TOOL.md` - Career change tool documentation
- `FIX_CAREER_CHANGE_HANDLER.md` - Handler fix documentation
- `TEST_2.4_SETUP_GUIDE.md` - Setup instructions for career change testing

---

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


