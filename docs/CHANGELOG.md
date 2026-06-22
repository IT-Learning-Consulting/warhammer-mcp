# Changelog

## v1.0.0 (2026-06-22)

The 1.0 milestone. Everything since `v0.8.1` — the full third-party **module-integration tier**, the **code-quality hardening** PRD (Phases 0–14), two new tools, and the BUG-259→BUG-399 fix sprints — consolidated into a stable release. The runtime advertises `1.0.0` already (`SERVER_VERSION` default); this bump aligns the package metadata, module manifest, and docs.

> **Compatibility / restart policy**
> - **Foundry VTT v13** — pinned. v12 and v14 are not supported.
> - **Module manifest** version label refreshes on next Setup-screen open; no in-game reload required.
> - **No breaking changes** to existing tool surfaces from v0.8.x — only additions (two new tools), internal refactors, and bug fixes. Existing macros, skills, and client configs keep working.
> - **MCP server** still reads its advertised version from `SERVER_VERSION` (default `1.0.0`); restart the server only to pick up new code from `dist/`, not for this metadata bump.

### 🧩 Module Integration v1 — conditional `module-*` tool layer

- **30+ third-party WFRP4e modules** wired behind a `module-probe` pre-flight + `MODULE_NOT_ACTIVE` conditional contract, so the surface degrades gracefully when a module is absent: Item Piles, Monk's Active Tile (MATT), scene-atmosphere (fxmaster/tokenmagic/scenery/transitions), Sequencer, GM Toolkit, Forien's Armoury, Mastercrafted, Gatherer, Timekeeping, Patrol, Party Resources, Levels, Tagger, Tokenbar, Chat Commander, Access Control (LocknKey/LockView), Community Lighting, custom-css, auto-animations, and more.
- **Custom-CSS + advanced-drawings** integration; MATT automation authoring/inspection/fire surface.

### 🆕 New tools

- **`imperial-arcana`** — 4-action umbrella for the `wfrp-imperial-arcana` module: a 36-card WFRP4e divination deck (spread draw with Promise/Peril, Ninefold + Conjunction detection) and Reading Records. Read-only, additive, CONDITIONAL (`MODULE_NOT_ACTIVE` when the module is off).
- **`apply-token-casualties`** — battle-sim Phase 5: writes per-token wounds / conditions / criticals onto exact unlinked tokens by ID (the out-of-game `/wfrp-battle-simulator` apply path).

### 🧱 Code-Quality Hardening (Phases 0–14)

- **Behavior-freeze gate machinery** (Phase 0) + **branded ID infrastructure** (Phase 1).
- **Service extraction** — actor/item/effect/template-apply/scene-placement/combat/conditions pulled out of the monolithic `data-access.ts`; `updateActor` split.
- **Declarative tool registry** (Phase 8) — `backend.ts` hardcoded `register()` literals collapsed to a single loop over `buildTools()`; `registry-parity.test.ts` proves the surface byte-for-byte (now 96 registered names).
- **Hot-path DTO/view type layer** (Phase 9); **async + lifecycle hardening** (Phase 10).
- **Contract hardening** (Phases 11–12) — `outputSchema` + `structuredContent` on every tool, typed error-tokens, readonly-annotation checks, mutation-safety + `verifyPersistence` post-write guards, eval false-green hardening.
- **Build gates** — `check:registry`, `check:tool-contract-parity`, `check:envelope-consumer`, `check:source-pattern`, `check:factory-coverage`, `check:output-schema-conformance`, `check:readonly-annotations`, `check:dist-freshness` now run on every `npm run build`.

### 🐛 Bug fixes (selection)

- **BUG-399** — ownership reset + scene thumbnail regen.
- **BUG-396 / BUG-397** — `structuredContent` emission sweep + nullable-read guard.
- **BUG-390 / BUG-391** — gmnotes path unification + `structuredContent` on text-only tools.
- **BUG-264→BUG-388** — multi-batch static-review fix sprints (socket reconnect state machine, index race, MATT semantics, roll-request, tagger scene-pinning, schema-parity).

## v0.8.0 (2026-05-19)

Sixteen months of work folded into a single version bump. The previous numbering (0.2.x) stopped reflecting actual scope around late 2025; this release re-baselines to 0.8.0 to acknowledge the substrate, CRUD-expansion, and tooling work that landed since.

> **Compatibility / restart policy**
> - **Foundry VTT v13** — pinned. v12 and v14 are not supported.
> - **Module manifest** version label refreshes on next Setup-screen open; no in-game reload required.
> - **MCP server** reads its advertised version from `SERVER_VERSION` env (default `1.0.0`), not `package.json` — so a metadata bump alone does not change runtime behavior. Restart the MCP server when you next pick up code changes from `dist/`, not for this changelog.
> - **No breaking changes to existing tool surfaces** from v0.2.4; only additions, internal refactors, and bug fixes. Existing macros, skills, and client configs keep working.

### 🧱 Phase 3 — Substrate (envelope · transactions · creature-index)

- **Envelope contract** rolled out across handler responses; producer-side `verifyPersistence` post-write checks added to `data-access.ts` to catch silent drops in `Document.update()` no-ops (BUG-086).
- **Transaction manager** for embedded-doc batches (token / journal / scene / rolltable handlers).
- **Creature-index** substrate for cross-compendium creature lookup.
- **Strict-schema leak fixes** — BUG-035 / BUG-036 (tool-side forwarding into Foundry strict schemas).
- **Listing tools** — `listActors` gains type-filter; vitest scaffolding for handler-level coverage.

### 🛠️ Phase 4 — Tool Bundles (session-prep · combat · progression · magic · world-content)

- **Phase 4 bundles** — session-prep + combat + progression umbrellas land.
- **Phase 4d / 4e** — world content creation + delete primitives; BUG-047, BUG-049 fixed.
- **Phase 4f** — magic wrappers (arcane + divine cast/channel/blessing surface); BUG-057 live-smoke fix.

### 🔌 Phase 5 — Custom-content + GM Feedback

- **Phase 5 custom-content** — full embedded item + active-effect CRUD surface (Phase B).
- **Phase 5 MCP surface in-validate fix pass** — BUG-080 / BUG-082 fixed; BUG-081 partial guard in place.
- **GM Feedback Channel** (PIV `gm-feedback-channel-notify`, 15/15 acceptance, 14 unit tests + 1 grep guard):
  - New `notify.ts` four-channel helper (console + toast + chat + tooltip + Hooks event).
  - Migrated **46 `ui.notifications.*` call sites** across foundry-module.
  - Two new world settings: `auditWritesToChat` (default off), `mcpVerboseConsole` (default off).
  - Canvas-anchored tooltips on `apply-damage`, `apply-condition`, `add-active-effect`, `apply-template-to-token`.
  - B1 latent bug: `enableNotifications` setting now respected by every toast site.

### 🧩 mcp-crud-expansion (Phases 1–6)

- **Phase 1 — Ownership polymorphism** (PASS_WITH_NOTES). Refactor of ownership tool to handle actors / items / journals uniformly.
- **Phase 2 — RollTable umbrella** — 8 new actions + schema tightening.
- **Phase 3 — Journal + world tools** catch-up; parity script; eval-rig fixtures.
- **Phase 4 — Scene entity CRUD** (PASS_WITH_NOTES).
- **Phase 6.1 — FilePicker umbrella** with Node-side auto-conversion (audio/image/video/router converters in `mcp-server`).
- **embeddedCRUDFactory refactor** — 11 handlers rewired to a shared factory: `journal / light / note / ownership / region / rolltable / scene / sound / template / tile / token`. Policy enforcement via `scripts/check-factory-coverage.mjs` + `check-source-pattern.mjs`.

### 🆕 New tools / handlers

- **Compendium handler** (`packages/foundry-module/src/handlers/compendium.ts`, NEW) — 631 lines.
- **Cross-doc FK handler** (`handlers/cross-doc-fk.ts`, NEW) — 645 lines.
- **Macro handler** (`handlers/macro.ts`, NEW) — 424 lines.
- **Diagnostic** — large expansion (`handlers/diagnostic.ts` +645 lines) + Phase 2 fault-scan/validation fixtures.
- **MCP persistence + status helpers** — `install-shortcuts.ps1`, `README-PERSISTENCE.md`.
- **Multi-client configs** — `configs/clients/{claude-code, codex, gemini-cli, vscode-copilot}.{json,toml}`.
- **`create-actor.skipItems`** (HC9) — bypass auto-population for build pipelines that hydrate items themselves; `queries.ts handleCreateActor` 6th-site fix.
- **Apply-template walker** — `skipSpecialisationChoice:true` flag so bulk template application bypasses bare-Channelling spec dialogs.

### 🐛 Bug fixes (selection)

- **BUG-010** — replace hardcoded tool count with dynamic registered-methods count.
- **BUG-023** — partial fix (Phase 3 prep).
- **BUG-035 / BUG-036** — strict-schema leaks fixed tool-side.
- **BUG-047, BUG-049, BUG-057** — Phase 4 content-creation + magic-wrapper smoke fixes.
- **BUG-069** — `BaseTool.query()` unwrap contract documented; typed generic + JSDoc + CI guard.
- **BUG-070** — post-write field verification; `Document.update()` no-op vs silent-drop disambiguation.
- **BUG-080 / BUG-082** — Phase 5 MCP surface fixes; BUG-081 partial guard.
- **BUG-086** — envelope `UPDATE_ACTOR_NOT_PERSISTED` throw on drift, with `verifyPersistence:false` opt-out for auto-derived fields.
- **BUG-089** — closure-footprint fix in mcp-server tool layer.

### 🧹 Phase 2 cleanup — dead-code removal

- Removed **ComfyUI surface** entirely (`comfyui-client`, `job-queue`, `comfyui-manager`, `campaign-hooks`, foundry-connector dispatch).
- Removed `map-generation` and `campaign-management` server tools.
- Scene tools extracted to dedicated `scene.ts`.
- 4 orphan query handlers removed.

### 🗑️ v0.8 final cleanup (commit `bfc456f`)

- Deleted legacy NSIS installer scaffolding (`installer/build-nsis.js`, `installer/nsis/`, `installer/inetc_plugin/`).
- Removed dead `wfrp_system/wfrp.js` (~32k lines) and `wfrp_system/wfrp_system.js` (~5k lines).
- Pruned stale planning docs (`IMPLEMENTATION_STATUS.md`, `TOOL_CONSOLIDATION_PLAN.md`, `skills-mcp.md`).
- README expanded to current state.

### 📦 Version metadata bumps

- Root `package.json`: 0.2.4 → 0.8.0
- `packages/foundry-module/{package.json, module.json}`: 0.2.3 → 0.8.0
- `packages/mcp-server/package.json`: 0.2.3 → 0.8.0
- `shared/package.json`: 0.2.3 → 0.8.0
- `docs/INSTRUCTIONS.md`, `docs/standalone_server.md` version stamps refreshed.

---

## v0.2.4 (2025-01-31)

### 🔧 Tool Consolidation Phase 2 Complete

Major refactoring effort reducing tool count from 66 to **36 tools** (-30 tools, 45% reduction).

**Phase 6 - Divine Magic Consolidation**
- Created `manage-divine-magic.ts` (6 actions)
- Actions: get-blessings, invoke, check-favor, add-sin, penance, end-blessing
- Deleted: `prayer-blessing.ts` (~1048 lines)

**Phase 7 - Arcane Magic Consolidation**
- Created `manage-arcane-magic.ts` (6 actions)
- Actions: get-spells, cast, channel, check-miscast, memorize, learn
- Deleted: `spell-magic.ts` (~1265 lines)

**Phase 8 - Ownership Consolidation**
- Created `manage-ownership.ts` (3 actions)
- Actions: assign, remove, list
- Deleted: `ownership.ts` (~304 lines)

**Phase 9 - NPC Generator Consolidation**
- Created `manage-npc-generation.ts` (3 actions)
- Actions: create, list-archetypes, preview
- Deleted: `custom-npc-generator.ts` (~1198 lines)

**Phase 10 - Roll Table Consolidation**
- Created `manage-rolltable.ts` (5 actions)
- Actions: create, list, get, roll, delete
- Deleted: `rolltable-management.ts` (~404 lines)

**Phase 11 - Journal/Quest Consolidation**
- Created `manage-journal.ts` (5 actions)
- Actions: create, update, link-npc, list, search
- Deleted: `quest-creation.ts` (~1078 lines)

### 📊 Results Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Tools | 66 | 36 | -30 (45%) |
| Tool Files | 26 | 26 | 0 |
| Lines Deleted | - | ~5,293 | - |

### ✨ Benefits

- **Reduced Context Window**: 45% fewer tool definitions to parse
- **Cleaner API**: Action-based discriminated union pattern
- **Better Discoverability**: Related functions grouped logically
- **Maintainability**: Less code duplication, shared patterns

### 📦 Files Changed

**Created:**
- `packages/mcp-server/src/tools/manage-divine-magic.ts`
- `packages/mcp-server/src/tools/manage-arcane-magic.ts`
- `packages/mcp-server/src/tools/manage-ownership.ts`
- `packages/mcp-server/src/tools/manage-npc-generation.ts`
- `packages/mcp-server/src/tools/manage-rolltable.ts`
- `packages/mcp-server/src/tools/manage-journal.ts`

**Deleted:**
- `packages/mcp-server/src/tools/prayer-blessing.ts`
- `packages/mcp-server/src/tools/spell-magic.ts`
- `packages/mcp-server/src/tools/ownership.ts`
- `packages/mcp-server/src/tools/custom-npc-generator.ts`
- `packages/mcp-server/src/tools/rolltable-management.ts`
- `packages/mcp-server/src/tools/quest-creation.ts`

**Modified:**
- `packages/mcp-server/src/backend.ts` - Updated imports and routing

---

## v0.2.3 (2025-10-11)

### ✨ Enhanced Features

**Character Information Tool Improvements**

- **Unknown Field Warnings**: Tool now provides helpful feedback when invalid field names are used
  - Displays warning: `⚠️ Unknown field(s) ignored: [fieldName]. Valid fields include: ...`
  - Lists all valid field names for easy reference
  - Prevents silent failures - users know immediately if they made a typo
  - Test 1.18 validates mixed valid/invalid field handling ✅

- **Enhanced Characteristic Reporting**: Shows initial vs final values with modifier breakdown
  - Displays both `initial` value (what was set) and `final value` (after bonuses)
  - Calculates and shows modifiers from talents, items, and astrological signs
  - Example: `I: initial=32, final value=34 (+2 from talents/items)`
  - Helps users understand WFRP4e's automatic bonus calculations
  - Test 1.21 validates characteristic updates with sign/talent bonuses ✅

**Character Data Organization**

- **New Conditions Section**: Separated status effects from physical inventory
  - `conditions.injuries`: Wound-based afflictions with location tracking
  - `conditions.mutations`: Physical/mental mutations with type classification
  - `conditions.diseases`: Full disease data (contraction, incubation, symptoms)
  - `conditions.psychology`: Mental conditions and fears
  - Test 1.15 validates clean item separation ✅

- **Improved Item Filtering**: Physical inventory now excludes non-inventory items
  - Removed from items: careers, money, critical wounds, injuries, mutations, diseases, psychology
  - Items section now only shows: weapons, armor, trappings, containers
  - Career shown in `basicInfo.career`
  - Money aggregated in `basicInfo.money`
  - Critical wounds in `basicInfo.criticalWounds`
  - Status effects in new `conditions` section

**Fortune/Fate Mechanics Clarification**

- **Verified Correct Behavior**: Fortune can temporarily exceed Fate (not a bug!)
  - WFRP4e allows temporary Fortune > Fate from awards, items, or after Fate burn
  - Daily Fortune refresh naturally enforces cap by resetting to current Fate value
  - Character can use "excess" Fortune before next refresh
  - Test 1.23 validates Fortune/Fate management flow ✅

### 🐛 Bug Fixes

- **Character Retrieval**: Fixed empty items array when character has no physical inventory
- **Data Truncation**: Increased description length from 100 to 200 characters for better detail
- **Biography Extraction**: Added motivation and ambitions to character info

### 📝 Tool Description Updates

- Enhanced `get-character` tool description to clearly list all returned sections
- Added explicit guidance for AI filtering: tool returns comprehensive data, AI presents contextually
- Clarified that `items` = "physical inventory only" (weapons, armor, trappings)

### ✅ Testing

All tests passing (as of October 11, 2025):
- **Test 1.15**: Get Character With No Items ✅
- **Test 1.18**: Update Multiple Stats - Some Invalid ✅
- **Test 1.19**: Character Case-Insensitive Lookup ✅
- **Test 1.21**: Character Creation Flow (with sign/talent bonuses) ✅
- **Test 1.23**: Fortune/Fate Management Flow ✅

### 📦 Files Changed

- `packages/mcp-server/src/tools/character.ts`
  - Added `unknownFields` tracking array
  - Added `formatConditions()` method for status effects
  - Enhanced `formatItems()` to filter out non-inventory items
  - Added detailed characteristic reporting with initial vs final values
  - Added modifier calculation and display
  - Updated tool descriptions with clearer section breakdowns

### 🔍 Validation Findings

**Comprehensive Tool Analysis**:
- ✅ `character.ts` `handleUpdateCharacterInfo`: Enhanced with unknown field warnings and detailed reporting
- ✅ `character.ts` `handleUpdateSkillTalent`: Uses strict schema, no changes needed
- ✅ `career-advancement.ts` advance functions: Enum-based validation, no changes needed
- ✅ `corruption-mutation.ts` functions: Purpose-specific schemas, no changes needed
- ✅ `fate-resilience.ts` Fortune/Fate: Working as designed per WFRP4e rules

**Key Insight**: Only `handleUpdateCharacterInfo` needed enhancements because it accepts arbitrary field names via `z.record(z.any())`. All other tools use strict schemas with predefined enums that automatically reject invalid inputs.

---

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


