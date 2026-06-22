# Development Instructions & Context

**Last Updated**: June 22, 2026  
**Current Version**: 1.0.0  
**Project**: Warhammer Fantasy Roleplay MCP Bridge for Foundry VTT

---

## 🎯 Project Overview

**Warhammer MCP** is a **WFRP4e-specialized rewrite** derived from `adambdooley/foundry-vtt-mcp` (MIT, kept upstream credit in `README.md` and `package.json` `contributors`). The two histories share a merge base (`45b8af2`) but have run in parallel since the split — there are zero merged upstream commits in this codebase. Treat it as a sibling project, not an active fork:

- **Domain**: WFRP 4e only (D&D5e / PF2e / DSA5 / Cosmere support, present upstream, has been removed)
- **Foundry module id**: `warhammer-mcp` (upstream is `foundry-mcp-bridge`)
- **Architectural changes**: dedicated `packages/foundry-module/src/handlers/` layer; umbrella/action tool pattern; unified GM-feedback channel (`notify.ts`); cross-doc FK audit/repair; persistence runbook; multi-client configs (`configs/clients/`); skills harness (`test:skills`, `lint:skills`)
- **Removed from upstream**: ComfyUI map-generation pipeline, WebRTC transport

It connects **Claude Desktop / Claude Code / Codex / Gemini-CLI / VS Code Copilot** to Foundry VTT through the Model Context Protocol (MCP), enabling AI-powered game mastering.

**Key Components:**
- **MCP Server** (`packages/mcp-server/`) — Node.js server handling MCP client communication (port 31414)
- **Foundry Module** (`packages/foundry-module/`) — Runs inside Foundry VTT, provides data access (port 31415)
- **Shared Library** (`shared/`) — Common types and Zod schemas
- **~48 tool files / ~18 handler files** — see `docs/WFRP4E_SYSTEM_GUIDE.md` for the full surface (umbrella tools expose multiple actions each, so the action count is significantly larger)

---

## 🏗️ Architecture & Data Flow

```
Claude Desktop ↔ MCP Protocol ↔ MCP Server ↔ WebSocket (port 31415) ↔ Foundry Module ↔ Foundry VTT
```

### How Tools Work

1. **Tool Definition** (MCP Server): `packages/mcp-server/src/tools/your-tool.ts`
   - Defines tool schema (name, description, parameters)
   - Implements handler method
   - Calls Foundry handlers via WebSocket

2. **Handler Registration** (MCP Server): `packages/mcp-server/src/backend.ts`
   - Registers tool with MCP protocol
   - Routes requests to appropriate handler

3. **Query Handler** (Foundry Module): `packages/foundry-module/src/queries.ts`
   - Receives WebSocket query from MCP server
   - Accesses Foundry VTT data safely
   - Returns results to MCP server

4. **Data Access Layer** (Foundry Module): `packages/foundry-module/src/data-access.ts`
   - Direct interaction with Foundry VTT game object
   - GM-only security enforcement
   - CRUD operations on actors, items, scenes

---

## 🔧 Development Workflow

### Building the Project

```bash
# Install dependencies (first time only)
npm install

# Build all packages
npm run build

# Build specific package
npm run build --workspace=@foundry-mcp/server
npm run build --workspace=@foundry-mcp/module
npm run build --workspace=@foundry-mcp/shared

# Watch mode for development
npm run dev --workspace=@foundry-mcp/server
```

**Build Order**: Shared → Server/Module (parallel)

### Testing Workflow

1. **Make code changes** in appropriate tool file
2. **Build the project**: `npm run build`
3. **Restart MCP server**: Close and reopen Claude Desktop
4. **Reload Foundry VTT**: Press F5 in browser
5. **Test in Claude Desktop**: Use natural language commands
6. **Check logs**:
   - MCP Server: `%TEMP%\foundry-mcp-server\wrapper.log` (Windows)
   - Foundry Console: F12 Developer Tools → Console tab

### Common Issues

**Problem**: "No handler found for query"  
**Solution**: Handler not registered in `backend.ts` or `queries.ts`

**Problem**: Tool not appearing in Claude Desktop  
**Solution**: Restart Claude Desktop completely, check MCP config

**Problem**: TypeScript errors  
**Solution**: Check imports, ensure shared types are built first

---

## 📁 Critical Files & Their Roles

### MCP Server Tools (`packages/mcp-server/src/tools/`)

Each tool file exports a class with:
- `getToolDefinitions()` - Returns MCP tool schema array
- `handle{ToolName}()` - Implementation methods
- Uses `this.foundryClient.query()` to call Foundry handlers

**Key Tool Files:**
- `character.ts` - Character retrieval, direct updates, skills/talents
- `manage-character.ts` - Consolidated character editing (update-stats, add-skill-talent, etc.)
- `manage-career.ts` - XP-based advancement, career changes
- `manage-fortune-fate.ts` - Fortune/Fate resources
- `manage-resolve-resilience.ts` - Resilience/Resolve (NPC equivalent)
- `manage-corruption.ts` - Corruption tracking
- `manage-mutation.ts` - Physical/mental mutations
- `manage-npc-generation.ts` - Species-specific NPC creation with archetypes
- `manage-arcane-magic.ts` - Spell casting, channelling, miscasts
- `manage-divine-magic.ts` - Prayers, divine favor, sin
- `manage-rolltable.ts` - Random table creation and rolling
- `manage-journal.ts` - Journal entries and quest management
- `compendium.ts` - Compendium searches
- `dice-roll.ts` - Player test requests

### Backend Registration (`packages/mcp-server/src/backend.ts`)

**Line ~100-200**: Import tool classes  
**Line ~1300-1450**: Register handlers with pattern:
```typescript
server.setRequestHandler(
  { method: 'tools/call', params: { name: 'tool-name' } },
  async (request: any) => await toolInstance.handleMethod(request.params.arguments)
);
```

### Foundry Module Queries (`packages/foundry-module/src/queries.ts`)

**Line ~50-150**: Handler switch statement  
**Line ~150-1500**: Individual handler implementations

**Pattern:**
```typescript
case 'foundry-mcp-bridge.handlerName': {
  // Validate user is GM
  // Access game data
  // Transform/update data
  // Return results
}
```

### Data Access Layer (`packages/foundry-module/src/data-access.ts`)

Exports utility functions:
- `getCharacterByName()` - Find actor by name
- `updateActorData()` - Modify actor properties
- `addItemToActor()` - Add item to character
- `searchCompendiumPacks()` - Search compendiums

---

## 🧪 Testing System

### Test Documentation (`test/test_results.md`)

Comprehensive test results organized by tool category:
- **1.x**: Character management (get, update, multi-field)
- **2.x**: Career advancement (characteristics, skills, talents, career change)
- **3.x**: Corruption & mutations
- **4.1-4.5**: Fortune & Fate
- **4.6-4.10**: Resilience & Resolve
- **5.x+**: Magic, prayers, inventory, etc.

**Test Format:**
```markdown
Test ID: X.Y
Test Name: Descriptive Name
Date Tested: YYYY-MM-DD
Status: [X] Pass [ ] Fail [ ] Partial
Results: What happened
Issues Found: Any problems
Error Messages: Exact error text
Notes: Additional context
```

### Running Tests

**In Claude Desktop:**
1. Ensure Foundry VTT is running with test world loaded
2. Test character "Test Character" should exist with known state
3. Use natural language: *"Advance Test Character's Melee (Basic) skill by 5"*
4. Verify results in Foundry VTT character sheet
5. Document results in `test_results.md`

**Test Character Setup:**
- Species: Human
- Career: Soldier (or other WFRP4e career)
- Has current career marked
- Has some XP available (1000-2000 recommended)
- Has corruption points (for corruption tests)
- Has Fortune/Fate points (for resource tests)

---

## 🎲 WFRP 4e Mechanics Implementation

### XP Costs (CRITICAL - Fixed in v0.2.1)

**Tiered Advancement Formula:**
```typescript
const tier = Math.floor(currentAdvances / 5);
const xpCost = TIER_COSTS[tier]; // [10, 15, 20, 30, 40, 50, 70, 90, 110, 130]
```

**Cost by Advances:**
- 1-5: 10 XP each
- 6-10: 15 XP each
- 11-15: 20 XP each
- 16-20: 30 XP each
- 21-25: 40 XP each
- etc.

**Talent Costs:**
```typescript
const talentCost = 100 + (currentRanks * 100);
// Rank 1: 100 XP
// Rank 2: 200 XP
// Rank 3: 300 XP
```

**Career Change Costs:**
- Current career **complete**: 100 XP
- Current career **incomplete**: 200 XP

### Compendium UUID Format (CRITICAL - Fixed in v0.2.2)

**Search results return:**
```typescript
{
  name: "Item Name",
  pack: "wfrp4e-core.items",
  id: "abc123xyz", // or _id
  uuid: undefined // NOT present in search results
}
```

**Must construct UUID:**
```typescript
const uuid = `Compendium.${item.pack}.${item.id || item._id}`;
// Example: "Compendium.wfrp4e-core.items.abc123xyz"
```

**Use with:**
```typescript
await foundryClient.query('foundry-mcp-bridge.addItemFromCompendium', {
  actorId: character.id,
  compendiumId: uuid, // Must be full UUID format
});
```

### Species-Specific Mechanics

**Wounds Calculation:**
```typescript
// Most species
wounds = 2 * TB + WPB + SB + speciesBonus;

// Halfling special case (only species with exact formula)
if (species === 'halfling') {
  wounds = 2 * TB + 2 * WPB;
}
```

**Species Bonuses:**
- Human: Fate +1, Fortune +1
- Dwarf: Magic Resistance (2), Night Vision, Read/Write
- High Elf: Acute Sense (Sight), Read/Write, Second Sight
- Wood Elf: Acute Sense (Hearing), Night Vision
- Halfling: Acute Sense (Taste), Night Vision

### Fortune/Fate vs Resilience/Resolve

**Player Characters**: Fortune (daily) & Fate (permanent)  
**NPCs**: Resolve (daily) & Resilience (permanent)

**Identical Mechanics:**
- Daily resource resets after rest
- Permanent resource burns to avoid death
- Adding permanent increases daily maximum
- Current cannot exceed maximum

---

## 🔍 Common Patterns & Best Practices

### Adding a New Tool

1. **Create tool file**: `packages/mcp-server/src/tools/your-feature.ts`

```typescript
import { z } from 'zod';
import type { FoundryClient } from '../foundry-client.js';

export class YourFeatureTools {
  constructor(
    private foundryClient: FoundryClient,
    private logger: any
  ) {}

  getToolDefinitions() {
    return [
      {
        name: 'your-tool-name',
        description: 'Clear description for Claude',
        inputSchema: {
          type: 'object',
          properties: {
            characterName: {
              type: 'string',
              description: 'Character name',
            },
            // ... other params
          },
          required: ['characterName'],
        },
      },
    ];
  }

  async handleYourTool(args: any): Promise<any> {
    // Validate args with Zod
    const schema = z.object({
      characterName: z.string().min(1),
    });
    const { characterName } = schema.parse(args);

    try {
      // Call Foundry handler
      const result = await this.foundryClient.query(
        'foundry-mcp-bridge.yourHandler',
        { characterName }
      );

      // Format response
      return { content: [{ type: 'text', text: 'Success message' }] };
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }
}
```

2. **Register in backend.ts**:

```typescript
// Import (line ~100)
import { YourFeatureTools } from './tools/your-feature.js';

// Initialize (line ~1100)
const yourTools = new YourFeatureTools(foundryClient, logger);

// Register definitions (line ~1200)
tools.push(...yourTools.getToolDefinitions());

// Register handlers (line ~1400)
server.setRequestHandler(
  { method: 'tools/call', params: { name: 'your-tool-name' } },
  async (request: any) => await yourTools.handleYourTool(request.params.arguments)
);
```

3. **Add Foundry handler in queries.ts**:

```typescript
case 'foundry-mcp-bridge.yourHandler': {
  if (!game.user?.isGM) {
    return { error: 'GM access required' };
  }

  const { characterName } = queryData;
  const actor = game.actors?.getName(characterName);
  
  if (!actor) {
    return { error: 'Character not found' };
  }

  // Perform operation
  await actor.update({ /* ... */ });

  return { success: true, data: /* ... */ };
}
```

4. **Build, restart, test**

### Error Handling Pattern

**Always include:**
- Character name in error message
- Current state information
- What was attempted
- Specific error details

```typescript
throw new Error(
  `Failed to advance skill for ${characterName}.\n` +
  `- Skill: ${skillName}\n` +
  `- Current advances: ${currentAdvances}\n` +
  `- Attempted: Add ${amount} advances\n` +
  `- Error: ${error.message}`
);
```

### Logging Pattern

```typescript
this.logger.info('Operation started', {
  characterName,
  skillName,
  currentAdvances,
});

this.logger.debug('Intermediate step', {
  calculatedValue,
  xpCost,
});

this.logger.error('Operation failed', {
  error: error.message,
  stack: error.stack,
});
```

---

## 📊 Recent Changes & Bug Fixes

### v0.2.2 (October 6, 2025)

**Critical Fixes:**
1. **Career Change UUID Bug**: Compendium search returns `pack` + `id`, not `uuid`
   - Must construct: `Compendium.${pack}.${id}`
   - Location: `career-advancement.ts` lines 788-810

2. **Career Change Operation Order**: Atomic transaction pattern
   - OLD: Unmark old → Add new → Mark new → Deduct XP
   - NEW: Add new → Mark new → Unmark old → Deduct XP
   - Prevents invalid state (no current career)
   - Location: `career-advancement.ts` lines 810-850

**New Features:**
1. **Resilience/Resolve System**: 6 new tools for NPC resources
   - Mirror of Fortune/Fate mechanics
   - File: `fate-resilience.ts` (renamed from `fortune-fate.ts`)
   - Tools: get-status, spend, burn, refresh, add

### v0.2.2.1 (October 7, 2025) - HOTFIX

**Critical Fix:**
1. **Critical Wounds Tool - Complete Rewrite**
   - **Problem**: Old implementation created fake criticals and subtracted wounds incorrectly
   - **WFRP 4e Rules**: Critical wounds are specific injuries from compendium, not generic damage
   - **Solution**: Tool now:
     - Searches compendium for actual critical (e.g., "Minor Head Injury")
     - Constructs UUID from pack/id (same pattern as career change fix)
     - Adds official critical with all effects/modifiers
     - Sets location but DOES NOT subtract wounds (GM does separately)
     - Simplified response without verbose guidance
   - Location: `critical-wounds.ts` handleAddCriticalWound
   - **Old parameters**: characterName, location, woundName, wounds, description
   - **New parameters**: characterName, criticalName, location
   - Status: Needs testing (Test 5.1)

**Why This Matters:**
- WFRP 4e separates wound loss from critical wounds
- Critical wounds are specific conditions from Critical Tables
- Each has unique effects, penalties, healing times
- Must use official compendium data, not custom descriptions

### v0.2.1 (October 5, 2025)

**Critical Fixes:**
1. **XP Calculation Bug**: Skills/characteristics overcharged 1000%
   - Was using array index directly: `COSTS[10] = 110`
   - Now uses tier formula: `Math.floor(10 / 5) = 2`, `COSTS[2] = 20`
   - Example: 11th advance was 220 XP, now correctly 20 XP

2. **Missing Handler**: `addItemFromCompendium` not implemented
   - Added to `queries.ts` line ~800
   - Enables adding items with all official effects

**New Tools:**
- `foundry-update-character-info` - Direct stat updates (no XP)
- `foundry-update-skill-talent` - Direct skill/talent updates (no XP)
- `add-skill-talent` - Add from compendium with official effects
- Enhanced `add-mutation` - Searches compendium first

---

## 🐛 Known Issues & Gotchas

### UUID Construction

**❌ WRONG:**
```typescript
const uuid = searchResult.uuid; // undefined!
await addItemFromCompendium(actorId, uuid); // FAILS
```

**✅ CORRECT:**
```typescript
const uuid = searchResult.uuid || 
  `Compendium.${searchResult.pack}.${searchResult.id || searchResult._id}`;
await addItemFromCompendium(actorId, uuid);
```

### State Management

**Issue**: Changes don't persist or appear stale  
**Cause**: Foundry uses cached data  
**Solution**: Always query fresh data, use `actor.update()` not direct assignment

### WebSocket Connection

**Issue**: "Connection failed" errors  
**Cause**: Foundry module not enabled or WebSocket not listening  
**Solution**: 
1. Enable "Foundry MCP Bridge" module in Foundry
2. Check port 31415 not blocked
3. Restart Foundry VTT (F5)

### TypeScript Build Errors

**Issue**: "Cannot find module '@foundry-mcp/shared'"  
**Cause**: Shared package not built  
**Solution**: Build shared first: `npm run build --workspace=@foundry-mcp/shared`

---

## 🎯 Current Development Status

### Completed & Tested ✅
- Character management (get, update, multi-field)
- Career advancement (characteristics, skills, talents)
- Corruption & mutation system
- Fortune & Fate mechanics
- Resilience & Resolve mechanics (NEW)
- Compendium searches
- NPC generation
- RollTable management
- Spell casting
- Prayer system

### In Progress 🔄
- Career change tool (fixes implemented, needs retest with Test 2.4)
- Disease progression system (partially implemented)
- **Critical wounds tool (rewritten Oct 7 - needs testing)**

### Known Test Failures ❌
- Test 5.1: Critical wounds (old implementation wrong - now fixed, awaiting retest)

### Backlog 📋
- Inventory weight/encumbrance calculations
- Advanced social status mechanics
- Campaign dashboard enhancements
- Map generation improvements

---

## 💡 Quick Reference Commands

### Build & Deploy
```bash
npm run build                    # Build all packages
npm run build:foundry           # Build Foundry module only
npm run build:server            # Build MCP server only
npm run dev                     # Watch mode (server)
```

### Testing in Claude Desktop
```
"Show me Test Character's stats"
"Advance Test Character's Melee (Basic) by 5"
"Add 2 corruption to Test Character for witnessing Chaos"
"Change Test Character's career to Sergeant"
"Create a Dwarf mercenary NPC with 100 XP"
"Roll a Dodge test for all players"
```

### File Locations
- **Tool Implementation**: `packages/mcp-server/src/tools/`
- **Handler Registration**: `packages/mcp-server/src/backend.ts`
- **Foundry Handlers**: `packages/foundry-module/src/queries.ts`
- **Test Results**: `test/test_results.md`
- **Documentation**: `docs/`

### Common Queries in Foundry Console (F12)
```javascript
// Get character
game.actors.getName("Test Character")

// Check current career
game.actors.getName("Test Character").items.find(i => i.type === 'career' && i.system.current.value)

// List all actors
game.actors.contents.map(a => a.name)

// Check module status
game.modules.get('foundry-mcp-bridge').active
```

---

## 🔐 Security & Permissions

**GM-Only Access**: All write operations require GM permissions  
**Read-Only Mode**: Can be enabled in module settings  
**Session-Based**: Uses Foundry's authentication  
**WebSocket**: Local connection only (localhost:31415)

**Module Settings** (Foundry VTT):
- Enable/disable MCP Bridge
- Allow/disallow write operations
- Connection host/port
- Auto-reconnect settings

---

## 📚 Additional Resources

**Documentation Files:**
- `README.md` - Overview, installation, features
- `CHANGELOG.md` - Version history
- `WFRP4E_SYSTEM_GUIDE.md` - WFRP 4e mechanics reference
- `ROLLTABLE_USAGE.md` - Random table examples
- `INSTALLATION.md` - Detailed setup guide

**Test Documentation:**
- `test/test_results.md` - Complete test results
- `docs/RESILIENCE_RESOLVE_TESTS.md` - Resilience/Resolve test guide
- `docs/TEST_2.4_SETUP_GUIDE.md` - Career change test setup

**External Resources:**
- [WFRP 4e Core Rulebook](https://cubicle7games.com/wfrp) - Official rules
- [Foundry VTT API](https://foundryvtt.com/api/) - Foundry documentation
- [MCP Protocol](https://modelcontextprotocol.io/) - MCP specification

---

## 🎬 Starting a New Development Session

### 1. **Environment Check**
```bash
# Ensure you're in project root
cd /d/foundry-vtt-mcp

# Check current version
cat package.json | grep version

# Check git status
git status
```

### 2. **Read Recent Changes**
- Review `docs/CHANGELOG.md` for latest version changes
- Check `test/test_results.md` for current test status
- Read any new documentation in `docs/`

### 3. **Understand Current State**
- What was the last feature added?
- Are there any failing tests?
- What's in the backlog?

### 4. **Set Up for Work**
```bash
# Pull latest changes (if working from repo)
git pull

# Install dependencies (if needed)
npm install

# Build everything
npm run build

# Start Foundry VTT
# Enable "Foundry MCP Bridge" module
# Load test world with "Test Character"

# Start Claude Desktop
# Verify MCP connection (hammer icon)
```

### 5. **Test Current Functionality**
- Run a simple test: *"Show me Test Character's stats"*
- Verify connection is working
- Check no regressions from last session

### 6. **Plan Next Work**
- Review backlog or test failures
- Identify next feature/fix
- Check if similar tools exist (copy pattern)
- Update this file if workflow changes

---

## 🧠 Development Philosophy

**Key Principles:**
1. **Mirror WFRP 4e Rules**: Always consult rulebook for mechanics
2. **Test Thoroughly**: Every tool should have corresponding test case
3. **Error Handling**: Clear, helpful error messages with context
4. **Logging**: Log operations for debugging without being verbose
5. **Atomic Operations**: Avoid invalid states during multi-step changes
6. **UUID Construction**: Always construct compendium UUIDs, never assume
7. **Documentation**: Update docs when adding features or fixing bugs
8. **Versioning**: Bump version on significant changes

**Before Committing:**
- [ ] Code builds without errors
- [ ] Tests pass (documented in test_results.md)
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated (if needed)
- [ ] Documentation updated
- [ ] No console errors in Foundry

---

## 📝 Template for Adding New Tools

```typescript
// FILE: packages/mcp-server/src/tools/new-feature.ts

import { z } from 'zod';
import type { FoundryClient } from '../foundry-client.js';

export class NewFeatureTools {
  constructor(
    private foundryClient: FoundryClient,
    private logger: any
  ) {}

  getToolDefinitions() {
    return [
      {
        name: 'tool-name',
        description: 'What this tool does (Claude sees this)',
        inputSchema: {
          type: 'object',
          properties: {
            characterName: { type: 'string', description: 'Character name' },
            amount: { type: 'number', description: 'How much' },
          },
          required: ['characterName'],
        },
      },
    ];
  }

  async handleToolName(args: any): Promise<any> {
    const schema = z.object({
      characterName: z.string().min(1, 'Character name required'),
      amount: z.number().int().positive().optional().default(1),
    });
    
    const { characterName, amount } = schema.parse(args);

    try {
      const result = await this.foundryClient.query(
        'foundry-mcp-bridge.handlerName',
        { characterName, amount }
      );

      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      return {
        content: [{
          type: 'text',
          text: `✅ Success!\n\n` +
                `Character: ${characterName}\n` +
                `Result: ${result.message}`
        }]
      };
    } catch (error) {
      this.logger.error('Tool failed', { error: error.message, characterName });
      throw new Error(`Failed to execute: ${error.message}`);
    }
  }
}

// FILE: packages/foundry-module/src/queries.ts (add to switch)

case 'foundry-mcp-bridge.handlerName': {
  if (!game.user?.isGM) {
    return { success: false, error: 'GM access required' };
  }

  const { characterName, amount } = queryData;
  
  const actor = game.actors?.getName(characterName);
  if (!actor) {
    return { success: false, error: `Character not found: ${characterName}` };
  }

  // Perform operation
  const result = await actor.update({
    'system.some.path': newValue
  });

  return {
    success: true,
    message: 'Operation completed',
    data: result
  };
}

// FILE: packages/mcp-server/src/backend.ts (add registration)

// Import (line ~100)
import { NewFeatureTools } from './tools/new-feature.js';

// Initialize (line ~1100)
const newFeatureTools = new NewFeatureTools(foundryClient, logger);

// Add to tools array (line ~1200)
tools.push(...newFeatureTools.getToolDefinitions());

// Register handler (line ~1400)
server.setRequestHandler(
  { method: 'tools/call', params: { name: 'tool-name' } },
  async (request: any) => await newFeatureTools.handleToolName(request.params.arguments)
);
```

---

## 🎓 Learning Resources

**Understanding MCP:**
- Tools expose capabilities to Claude
- Each tool has name, description, schema
- Claude interprets natural language → tool calls
- Tools return structured responses

**Understanding Foundry VTT:**
- `game.actors` - All actors in world
- `game.items` - All items in world
- `game.scenes` - All scenes in world
- `actor.items` - Items owned by actor
- `actor.update()` - Modify actor data
- `actor.createEmbeddedDocuments()` - Add items to actor

**WFRP 4e System:**
- Characteristics: WS, BS, S, T, I, Ag, Dex, Int, WP, Fel
- Skills have advances (0-100+)
- Talents have ranks (1-4 typically)
- Careers have completion status
- Species determine starting stats and talents

---

## ✨ Success Criteria

**Before marking work complete:**
1. Tool appears in Claude Desktop
2. Tool executes without errors
3. Changes visible in Foundry VTT
4. Test documented in test_results.md
5. Changes committed to git
6. CHANGELOG.md updated
7. Version numbers updated (if applicable)

**Quality Checks:**
- Error messages are helpful and specific
- Edge cases handled (character not found, insufficient XP, etc.)
- Logging provides debugging context
- Code follows existing patterns
- TypeScript types are correct

---

**END OF INSTRUCTIONS**

*This document should be the first thing read when starting a new development session. It contains everything needed to understand the project structure, current state, development workflow, and how to add new features.*

*When in doubt, search this file for keywords related to your task. If something is missing, add it to help future sessions.*
