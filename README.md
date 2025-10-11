# Warhammer MCP

**AI-Powered Game Master Assistant for WFRP 4e in Foundry VTT**

**Current Version**: 0.2.3 | [Changelog](docs/CHANGELOG.md)

Connect Claude Desktop to your Foundry VTT game for intelligent campaign management, NPC generation, and Old World content creation through the Model Context Protocol (MCP).

---

## 🆕 What's New in v0.2.3 (October 11, 2025)

### Enhanced Features
- **Unknown Field Warnings**: Character update tool now provides helpful feedback for invalid field names
  - Shows which fields were ignored and lists all valid options
  - Prevents silent failures - users know immediately if they made a typo
  
- **Enhanced Characteristic Reporting**: Shows initial vs final values with modifier breakdown
  - Displays both requested initial value and calculated final value
  - Shows modifiers from talents, items, and astrological signs
  - Example: `I: initial=32, final value=34 (+2 from talents/items)`
  - Helps understand WFRP4e's automatic bonus calculations

- **Improved Character Data Organization**: New `conditions` section separates status effects from inventory
  - Injuries, mutations, diseases, and psychology now in dedicated section
  - Items section now only shows physical inventory (weapons, armor, trappings)
  - Cleaner, more intuitive data structure matching WFRP4e concepts

- **Fortune/Fate Mechanics Clarified**: Verified that Fortune can temporarily exceed Fate (not a bug!)
  - WFRP4e allows temporary excess from awards or after Fate burn
  - Daily refresh naturally enforces cap

### Bug Fixes
- Fixed empty items array handling
- Enhanced description truncation (200 chars)
- Added biography extraction (motivation, ambitions)

### Testing
All tests passing: Character retrieval (1.15), mixed validation (1.18), case-insensitive lookup (1.19), creation flow (1.21), Fortune/Fate management (1.23) ✅

See [CHANGELOG.md](docs/CHANGELOG.md) for complete details.

---

## 🔄 Previous Release: v0.2.2 (October 6, 2025)

### Critical Bug Fixes
- **Fixed Career Change Tool UUID Bug**: Career changes now work correctly - tool properly constructs UUIDs from compendium pack/id data
- **Fixed Career Change Operation Order**: Atomic operation order prevents characters from having no current career during career changes

### New Features
- **Resilience & Resolve System**: Complete NPC resource management system mirroring Fortune/Fate (6 new tools)
  - Spend Resolve for daily rerolls (like Fortune)
  - Burn Resilience to avoid death (like Fate)
  - Award bonus Resolve for exceptional NPC actions
  - Grant permanent Resilience for epic achievements
- **File Rename**: `fortune-fate.ts` renamed to `fate-resilience.ts` for better clarity (now contains all 12 tools)

### Testing & Quality
- All character management tests passing ✅
- All career advancement tests passing ✅  
- All corruption/mutation tests passing ✅
- All Fortune/Fate tests passing ✅
- All Resilience/Resolve tests passing ✅ (new)
- Enhanced error messages with detailed debugging data

See [CHANGELOG.md](docs/CHANGELOG.md) for complete details.

---

## 🔄 Previous Release: v0.2.1 (October 5, 2025)

### Critical Bug Fixes
- **Fixed XP Calculation Bug**: Corrected critical issue where skill/characteristic advancement charged 1000% too much XP (e.g., 11th skill advance now costs 20 XP instead of 220 XP)
- **Implemented Missing Compendium Handler**: Added `addItemFromCompendium` infrastructure for proper WFRP4e integration

### New Features
- **Direct Character Updates**: New `foundry-update-character-info` tool for GM adjustments without XP costs
- **Direct Skill/Talent Updates**: New `foundry-update-skill-talent` tool for character setup and corrections
- **Compendium Integration**: New `add-skill-talent` tool adds skills/talents from compendium with all official effects
- **Enhanced Mutations**: `add-mutation` now searches compendiums first for official mutations with proper mechanics

See [CHANGES_2025-10-05.md](CHANGES_2025-10-05.md) for detailed technical information.

---

## About This Project

This project is a **fork and enhancement** of the original [Foundry VTT MCP Bridge](https://github.com/adambdooley/foundry-vtt-mcp) by **Adam Dooley**, adapted and specialized exclusively for **Warhammer Fantasy Roleplay 4th Edition**.

### Credits

**Original Project**: [Foundry VTT MCP Bridge](https://github.com/adambdooley/foundry-vtt-mcp)  
**Original Author**: Adam Dooley ([Patreon](https://www.patreon.com/c/Adambdooley) | [YouTube](https://www.youtube.com/channel/UCVrSC-FzuAk5AgvfboJj0WA))  
**Fork Maintainer**: Danny Castillo ([IT Learning Consulting](https://github.com/IT-Learning-Consulting))  
**License**: MIT License (see [LICENSE](LICENSE) for details)

*Special thanks to Adam Dooley for creating the original MCP Bridge infrastructure that made this WFRP-focused fork possible.*

### What Makes This Fork Different

- **WFRP 4e Exclusive**: Removed D&D support, now 100% focused on Warhammer Fantasy Roleplay
- **65+ WFRP-Specific Tools**: Career advancement, corruption, mutations, Fortune/Fate, Resilience/Resolve
- **Custom NPC Generator**: Create balanced NPCs with XP-based advancement and species-specific traits
- **Species-Accurate Mechanics**: Proper wounds calculation and innate talents for Humans, Dwarfs, Elves, and Halflings
- **RollTable System**: Create and manage random tables for encounters, loot, events, and Old World flavor
- **Enhanced WFRP Documentation**: Comprehensive guides, examples, and test results specific to WFRP 4e mechanics
- **UI Notifications**: Real-time toast notifications in Foundry when Claude makes changes

---

## Overview

The Warhammer MCP connects Claude Desktop to your WFRP 4e game in Foundry VTT, turning Claude into your intelligent game master assistant. Through natural language conversations, Claude can:

- **Character & NPC Management**: Access characteristics, skills, talents, corruption, fortune/fate
- **Content Generation**: Create custom NPCs, quests, and campaign content with WFRP flavor
- **Compendium Search**: Find creatures, items, spells, and prayers using natural language
- **Dice Coordination**: Request d100 tests from players with interactive chat buttons
- **Campaign Tracking**: Multi-quest campaigns with progress dashboards
- **Random Tables**: Create and roll on tables for encounters, events, loot, and more
- **WFRP Mechanics**: Corruption, mutations, critical wounds, advantage, diseases, and more

---

## Features at a Glance

### 🎭 Core Features (65+ Tools)

**Character Management** (5 tools) - **UPDATED!**
- Get character details (characteristics, skills, talents, corruption, wounds)
- List all player characters and NPCs
- **NEW**: Direct character updates (stats, fortune, fate) without XP costs
- **NEW**: Add skills/talents from compendium with official effects
- **NEW**: Direct skill/talent advance updates for GM adjustments

**Career & Advancement** (4 tools) - **FIXED!**
- Track career progression and XP requirements
- Advance characteristics, skills, and talents with **corrected XP calculations**
- Calculate XP costs based on WFRP 4e rules (now using proper tiered formula)
- **NEW**: Change career tool with proper UUID handling and atomic operations

**Combat & Conditions** (6 tools) - **ENHANCED!**
- Critical wounds tracking by location
- Advantage system management
- Corruption and mutation tracking
- **UPDATED**: Add mutations from compendium with official effects
- Disease and infection management

**Fortune & Fate** (12 tools) - **EXPANDED!**
- Manage Fortune points (daily rerolls)
- Track Fate points (death saves)
- Burn Fate to survive lethal damage
- Award bonus Fortune for exceptional roleplay
- Grant Fate for epic achievements (auto-updates Fortune max)
- **NEW**: Complete Resilience/Resolve system for NPCs (6 tools)
  - `get-resilience-resolve-status` - Check NPC Resilience/Resolve
  - `spend-resolve` - NPC daily reroll resource
  - `spend-resilience` - NPC death save resource
  - `refresh-resolve` - Reset daily Resolve points
  - `add-resolve` - Award bonus Resolve
  - `add-resilience` - Grant permanent Resilience (rare)

**Magic & Religion** (11 tools)
- Spell casting and channelling
- Prayer invocation and divine favor
- Miscast effects and corruption
- Learn and memorize new spells
- Track Sin points and perform penance

**Inventory & Economy** (5 tools)
- Manage character inventory
- Check encumbrance and penalties
- Social status and income calculation
- Reputation effects

**Content Creation** (8 tools)
- **Custom NPC Generator**: Create balanced NPCs with species, career, and XP budget
- Create actors from compendium entries
- Quest journal creation with WFRP themes
- Campaign dashboard management
- Map generation with Old World aesthetics

**Random Tables** (5 tools) - **NEW!**
- Create custom RollTables with d100 ranges
- List and view all tables in your world
- Roll on tables for random encounters, loot, events
- Delete tables

**Compendium & Search** (3 tools)
- Natural language creature search with WFRP-specific filters
- List available compendium packs
- Query rich creature data from compendiums (stats, abilities, traits)
- Enhanced creature indexing for faster searches
- Flexible search: name, type, traits, abilities

**Dice & Tests** (1 tool)
- Request characteristic or skill tests from players
- Interactive d100 roll buttons in chat
- Automatic success/failure calculation

**Scene & World** (2 tools)
- Get current scene information
- Query world details and system version

**Permissions** (3 tools)
- Manage actor ownership for players
- Assign and remove permissions
- List friendly NPCs and party members

---

## Supported Game Systems

- **WFRP 4e**: Full native support with all system-specific mechanics
- **Extensible**: Architecture supports adding other systems (requires development)

---

## Installation

### Prerequisites

- **Foundry VTT v13** or higher
- **WFRP 4e System** installed in Foundry VTT
- **Claude Desktop** with MCP support
- **Claude Pro/Max Plan** (required for MCP connections)
- **Windows** (for installer) or **Node.js 18+** (for manual installation)

### Option 1: Windows Installer (Recommended)

[Video Guide](https://youtu.be/Se04A21wrbE) (from original project - basic process is the same)

1. Download the latest `WarhammerMCP-Setup.exe` from [Releases](https://github.com/IT-Learning-Consulting/warhammer-mcp/releases)
2. Run the installer - it will:
   - Install the MCP server with bundled Node.js
   - Configure Claude Desktop automatically
   - Optionally install the Foundry module
3. Restart Claude Desktop
4. In Foundry VTT, enable **"Warhammer MCP"** in Module Management
5. Start playing!

### Option 2: Manual Installation

#### Step 1: Install the Foundry Module

**Method A: From Manifest URL**
1. In Foundry VTT, go to Add-on Modules
2. Click "Install Module"
3. Paste this URL: `https://raw.githubusercontent.com/IT-Learning-Consulting/warhammer-mcp/main/packages/foundry-module/module.json`
4. Click Install
5. Enable the module in your world

**Method B: Manual Build**
```bash
# Clone this repository
git clone https://github.com/IT-Learning-Consulting/warhammer-mcp.git
cd warhammer-mcp

# Install dependencies
npm install

# Build all packages
npm run build

# Copy module to Foundry
cp -r packages/foundry-module/* /path/to/foundry/Data/modules/warhammer-mcp/
```

#### Step 2: Install the MCP Server

```bash
# Still in the warhammer-mcp directory
cd packages/mcp-server

# The server is already built from step 1
# Just note the path: /path/to/warhammer-mcp/packages/mcp-server/dist/index.js
```

#### Step 3: Configure Claude Desktop

Add this to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "warhammer-mcp": {
      "command": "node",
      "args": [
        "C:\\path\\to\\warhammer-mcp\\packages\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "FOUNDRY_HOST": "localhost",
        "FOUNDRY_PORT": "31415"
      }
    }
  }
}
```

**Important**: 
- Replace `C:\\path\\to\\warhammer-mcp` with your actual path
- Use double backslashes (`\\`) on Windows
- Use forward slashes (`/`) on macOS/Linux

#### Step 4: Start Everything

1. Start Foundry VTT and load your WFRP 4e world
2. Enable the **"Warhammer MCP"** module
3. Start Claude Desktop (the MCP server starts automatically)
4. Look for the 🔌 hammer icon in Claude Desktop (indicates connected)

--- 

## Example Usage

Once connected, you can ask Claude Desktop about your WFRP campaign:

### Character Information
- *"Show me Grunwald's characteristics and current wounds"*
- *"What's Katerina's corruption level and mutations?"*
- *"List all Fortune and Fate points for the party"*
- *"Check Hans' career advancement progress"*

### NPC & Content Creation
- *"Create a Dwarf mercenary NPC with 100 XP who specializes in crossbow"*
- *"Generate a Human charlatan with 50 XP and some corruption"*
- *"Make me 3 Halfling townsfolk NPCs for a village encounter"*
- *"Create a quest about investigating Chaos cultists in Altdorf"*

### Combat & Mechanics
- *"Roll a Dodge test for everyone in combat"*
- *"Add 2 corruption points to Grunwald for witnessing a daemon"*
- *"Give Hans a critical wound to his right arm"*
- *"Track advantage for the current combat"*

### Magic & Religion
- *"What spells does Elara know?"*
- *"Have Elara cast Aethyric Armor"*
- *"Father Wilhelm wants to invoke a prayer to Sigmar"*
- *"Check for miscasts on that channelling test"*

### Random Tables
- *"Create a random Reikland encounter table for d100 with 10 entries"*
- *"Make a treasure hoard table with various Old World coins and items"*
- *"Roll on the Drakwald Events table"*
- *"List all my random tables"*

### Exploration & Campaign
#### Search & Compendium

- *"Search the compendium for all chaos cultist NPCs"*
- *"Find all creatures with the Corruption trait"*
- *"Show me all Undead creatures in the bestiary"*
- *"What items grant bonus to Weapon Skill?"*
- *"What's in the current scene? Any enemies present?"*
- *"Create a campaign dashboard for 'The Enemy Within'"*
- *"Show me creatures with the Chaos trait"*

### Economy & Status
- *"Calculate monthly income for a character with Status Silver 3"*
- *"Make a social status test for Hans negotiating with nobles"*
- *"Change Katerina's status to Brass 4 after losing her position"*

---

## Tool Reference

### Character & Career Tools

**get-character** - Retrieve full character sheet with all WFRP stats  
**list-characters** - Show all actors in the world  
**get-career-advancement** - Check career progress and XP requirements  
**advance-characteristic** - Increase a characteristic (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)  
**advance-skill** - Improve a skill with XP  
**advance-talent** - Purchase a new talent  
**change-career** - Change to a new career with proper XP costs (100/200 based on completion)  

### Combat & Conditions

**get-critical-wounds** - List all critical wounds by location  
**add-critical-wound** - Apply a critical injury  
**heal-critical-wound** - Remove or heal a critical wound  
**get-advantage** - Check current advantage in combat  
**modify-advantage** - Add or remove advantage points  
**reset-advantage** - Clear advantage (end of combat)  

### Corruption & Mutations

**get-corruption-status** - Check corruption points and threshold  
**add-corruption** - Increase corruption (witnessing Chaos, dark magic, etc.)  
**remove-corruption** - Decrease corruption through purification  
**list-mutations** - Show all mutations  
**add-mutation** - Apply a physical or mental mutation  
**remove-mutation** - Remove a mutation through treatment  

### Fortune & Fate

**get-fortune-fate-status** - Display current Fortune and Fate points  
**spend-fortune** - Use a Fortune point for a reroll  
**burn-fate** - Spend a Fate point to avoid death  
**restore-fortune** - Reset Fortune points (new day)  
**modify-fate** - Adjust permanent Fate (rare)  
**add-fortune** - Award bonus Fortune for exceptional roleplay  

### Resilience & Resolve (NEW!)

**get-resilience-resolve-status** - Display current Resilience and Resolve points for NPCs  
**spend-resolve** - Use a Resolve point for NPC rerolls (daily resource)  
**spend-resilience** - Burn a Resilience point for NPC to avoid death (permanent cost)  
**refresh-resolve** - Reset Resolve points to maximum (new day)  
**add-resolve** - Award bonus Resolve for exceptional NPC actions  
**add-resilience** - Grant permanent Resilience increase (extremely rare)  

### Magic & Channelling

**get-known-spells** - List all spells a character knows  
**cast-spell** - Cast a memorized spell with casting roll  
**channel-power** - Make a Channelling test to gather power  
**check-miscast** - Roll on Minor/Major Miscast tables  
**memorize-spell** - Memorize a spell for casting  
**learn-new-spell** - Add a new spell to known spells  

### Religion & Prayers

**get-active-blessings** - Show active divine blessings  
**invoke-prayer** - Call upon divine favor  
**check-divine-favor** - Verify blessing status  
**add-sin-point** - Track sins against deity  
**perform-penance** - Atone for sins  
**end-blessing** - Remove an active blessing  

### Disease & Afflictions

**get-disease-status** - Check current diseases and progress  
**contract-disease** - Apply a disease or infection  
**disease-progression** - Roll for disease getting worse  
**recover-from-disease** - Make recovery test  
**cure-disease** - Remove disease through treatment  

### Inventory & Economics

**get-inventory** - List all items carried  
**check-encumbrance** - Calculate encumbrance penalties  
**add-inventory-item** - Add item to character  
**remove-inventory-item** - Remove item from character  
**get-social-status** - Show social standing and tier  
**change-social-status** - Modify social rank  
**calculate-income** - Determine monthly earnings  
**check-reputation** - Query standing in society  
**make-social-test** - Roll for social interaction  

### Content Creation

**create-custom-npc** - Generate balanced NPCs with:
  - Species (Human, Dwarf, High Elf, Wood Elf, Halfling)
  - Career selection
  - XP budget for advancement
  - Species-specific talents (Night Vision, Magic Resistance, etc.)
  - Accurate wounds calculation by species
  - Skills and talents from career

**create-actor-from-compendium** - Instance creatures from compendiums  
**create-quest-journal** - Generate quest journal entries with WFRP themes  
**create-campaign-dashboard** - Set up multi-quest campaign tracker  
**generate-map** - Create battle maps with Old World aesthetics  

### Random Tables (NEW!)

**create-rolltable** - Create custom RollTables with:
  - d100 ranges for each entry
  - Weighted probability options
  - Table formulas (1d100, 1d20, etc.)
  - Multiple entries with descriptions

**list-rolltables** - View all RollTables in the world  
**get-rolltable** - See detailed entries for a specific table  
**roll-on-table** - Roll and get a random result  
**delete-rolltable** - Remove a table from the world  

### Search & Compendium

**search-compendium** - Natural language creature/item search with filters:
  - Species (beastman, daemon, greenskin, undead, etc.)
  - Traits (Chaos, Weapon +X, Armor, etc.)
  - Size and role
  - Name and description text

**list-creatures-by-criteria** - Advanced filtering  
**get-available-packs** - List all compendium packs  

### Dice & Tests

**request-player-rolls** - Create interactive d100 test buttons:
  - Characteristic tests (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
  - Skill tests (Melee, Ranged, Channelling, Charm, etc.)
  - Custom formulas
  - Modifiers (+10, -20, etc.)
  - Targeted to specific players or party

### Scene & World

**get-current-scene** - View active scene details and tokens  
**get-world-info** - Query game system, world name, and version  

### Permissions

**assign-actor-ownership** - Grant player access to characters  
**remove-actor-ownership** - Revoke actor permissions  
**list-actor-ownership** - Show current ownership settings  

---

## Module Settings

In Foundry VTT, go to **Module Settings > Warhammer MCP** to configure:

### Connection Settings
- **Enable Warhammer MCP**: Toggle the connection on/off without disabling the module
- **Server Host**: IP address of the MCP server (default: `localhost`)
- **Server Port**: Port for communication (default: `31415`)
- **Auto-Reconnect**: Automatically reconnect if connection is lost
- **Connection Check Frequency**: How often to verify connection (in seconds)
- **Show Connection Messages**: Display banner notifications for connection status

### Security & Safety
- **Allow Write Operations**: Control whether Claude can modify world content (read-only mode available)
- **Max Actors Per Request**: Limit simultaneous actor creation (failsafe against bulk operations)

### Enhanced Creature Index
- **Enable Enhanced Creature Index**: Build metadata for better creature searches (recommended)
- **Rebuild Creature Index**: Manual rebuild if index is out of sync
- **Auto-Rebuild on Pack Changes**: Experimental automatic index updating

---

## Architecture

```
Claude Desktop ↔ MCP Protocol ↔ MCP Server ↔ WebSocket ↔ Foundry Module ↔ Foundry VTT
```

### Components

- **Foundry Module** (`packages/foundry-module/`): Runs inside Foundry VTT, provides secure data access
- **MCP Server** (`packages/mcp-server/`): External Node.js server handling Claude Desktop communication
- **Shared Library** (`shared/`): Common types and schemas used by both sides
- **No API Keys Required**: Uses your existing Claude Desktop subscription

### Security Features

- **GM-Only Access**: All operations restricted to Game Master users
- **Session-Based Auth**: Uses Foundry's built-in authentication
- **Configurable Permissions**: Granular control over read/write access
- **WebSocket Communication**: Encrypted local connection between server and Foundry

---

## Development & Contributing

### Project Structure

```
warhammer-mcp/
├── packages/
│   ├── foundry-module/     # Foundry VTT module (TypeScript)
│   │   ├── src/
│   │   │   ├── main.ts             # Module entry point
│   │   │   ├── queries.ts          # Query handlers
│   │   │   ├── data-access.ts      # Foundry data access layer
│   │   │   └── socket-bridge.ts    # WebSocket server
│   │   └── module.json
│   │
│   ├── mcp-server/          # MCP server (TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts            # MCP server entry
│   │   │   ├── backend.ts          # Main backend logic
│   │   │   ├── foundry-client.ts   # WebSocket client
│   │   │   └── tools/              # 48+ MCP tools
│   │   │       ├── character.ts
│   │   │       ├── custom-npc-generator.ts
│   │   │       ├── rolltable-management.ts
│   │   │       └── ...
│   │   └── package.json
│   │
│   └── shared/              # Shared types
│       ├── src/
│       │   ├── types.ts
│       │   └── schemas.ts
│       └── package.json
│
├── docs/                    # Documentation
│   ├── WFRP4E_SYSTEM_GUIDE.md
│   ├── WFRP_ENHANCEMENTS.md
│   ├── ROLLTABLE_USAGE.md
│   └── ...
│
├── installer/               # Windows installer
└── README.md
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/IT-Learning-Consulting/warhammer-mcp.git
cd warhammer-mcp

# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Build specific package
npm run build --workspace=@foundry-mcp/server
```

### Adding New Tools

1. Create new tool file in `packages/mcp-server/src/tools/your-tool.ts`
2. Implement `getToolDefinitions()` and handler methods
3. Register tool in `packages/mcp-server/src/backend.ts`
4. Add corresponding handler in `packages/foundry-module/src/queries.ts`
5. Build and test

See existing tools for examples.

### Testing

- **Manual Testing**: Use Claude Desktop with your development build
- **Foundry Console**: Check F12 Developer Console for errors
- **MCP Server Logs**: Located in `%TEMP%\foundry-mcp-server\wrapper.log` (Windows)

---

## Troubleshooting

### Connection Issues

**Problem**: Claude Desktop shows no MCP tools  
**Solution**: 
- Check `claude_desktop_config.json` syntax
- Verify path to `index.js` is correct
- Restart Claude Desktop completely
- Check MCP server logs for errors

**Problem**: "Connection failed" in Foundry  
**Solution**:
- Ensure Foundry VTT is running before starting Claude Desktop
- Check Module Settings > MCP Bridge is enabled
- Verify port 31415 isn't blocked by firewall
- Try disabling and re-enabling the module

### Tool Errors

**Problem**: "No handler found for query"  
**Solution**:
- Rebuild the Foundry module: `npm run build`
- Copy new build to Foundry modules folder
- Reload Foundry VTT (F5)
- Check browser console for errors

**Problem**: "Access denied"  
**Solution**:
- Ensure you're logged in as GM
- Check "Allow Write Operations" is enabled for write tools

### Performance

**Problem**: Slow compendium searches  
**Solution**:
- Rebuild creature index: Module Settings > Rebuild Creature Index
- Enable "Enhanced Creature Index"
- Limit search to specific compendium packs

---

## System Requirements

- **Foundry VTT**: Version 13 or higher
- **WFRP 4e System**: Latest version recommended
- **Claude Desktop**: Latest version with MCP support
- **Claude Subscription**: Pro or Max plan required
- **Operating System**: 
  - Windows 10/11 (installer available)
  - macOS (manual installation)
  - Linux (manual installation)
- **Node.js**: Version 18 or higher (for manual installation)

---

## Support & Resources

### This Fork (Warhammer MCP)

- **GitHub Repository**: [IT-Learning-Consulting/warhammer-mcp](https://github.com/IT-Learning-Consulting/warhammer-mcp)
- **Issues**: [Report bugs or request features](https://github.com/IT-Learning-Consulting/warhammer-mcp/issues)
- **Maintainer**: Danny (IT-Learning-Consulting)

### Original Project (Foundry VTT MCP Bridge)

- **Original Author**: Adam Dooley
- **Original Repository**: [adambdooley/foundry-vtt-mcp](https://github.com/adambdooley/foundry-vtt-mcp)
- **Patreon**: [Support Adam's work](https://www.patreon.com/c/Adambdooley)
- **YouTube**: [Tutorials and updates](https://www.youtube.com/channel/UCVrSC-FzuAk5AgvfboJj0WA)

### Documentation

- **WFRP 4e System Guide**: `docs/WFRP4E_SYSTEM_GUIDE.md`
- **RollTable Usage**: `docs/ROLLTABLE_USAGE.md`
- **Installation Guide**: `docs/INSTALLATION.md`
- **Changelog**: `docs/CHANGELOG.md`

---

## License

MIT License

Copyright (c) 2024 Adam Dooley (Original Project)  
Copyright (c) 2025 Danny / IT-Learning-Consulting (This Fork)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Acknowledgments

- **Adam Dooley**: Creator of the original Foundry VTT MCP Bridge
- **Anthropic**: Claude Desktop and Model Context Protocol
- **Foundry VTT**: Amazing virtual tabletop platform
- **WFRP Community**: Playtesters and feedback providers
- **Cubicle 7**: Warhammer Fantasy Roleplay 4th Edition

---

## Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for complete version history and updates.

### Recent Updates

**v0.2.2** (2025-10-06) - **CAREER CHANGE FIXES & RESILIENCE/RESOLVE SYSTEM**
- **FIXED**: Career change tool UUID construction bug (now properly builds `Compendium.{pack}.{id}` format)
- **FIXED**: Career change operation order for atomic transactions (add new career first, then unmark old)
- **NEW SYSTEM**: Complete Resilience/Resolve mechanics for NPCs (6 new tools mirroring Fortune/Fate)
- **RENAMED**: `fortune-fate.ts` → `fate-resilience.ts` for clarity (now contains 12 tools total)
- **TESTING**: All character, career, corruption, Fortune/Fate, and Resilience/Resolve tests passing ✅
- See [CHANGELOG.md](docs/CHANGELOG.md) for detailed technical information

**v0.2.1** (2025-10-05) - **CRITICAL BUG FIXES**
- **FIXED**: Critical XP calculation bug (skills/characteristics overcharged by 1000%)
- **ADDED**: Missing compendium handler infrastructure for proper WFRP4e integration
- **NEW TOOL**: `foundry-update-character-info` - Direct character stat updates without XP
- **NEW TOOL**: `foundry-update-skill-talent` - Direct skill/talent updates for GM adjustments
- **NEW TOOL**: `add-skill-talent` - Add skills/talents from compendium with official effects
- **ENHANCED**: `add-mutation` now searches compendiums first for official mutations

**v0.5.0** (2025-01-03)
- Added RollTable tools (create, list, roll, delete)
- Custom NPC Generator with species-specific features
- Accurate wounds calculation for all species (including Halfling special case)
- Species-specific innate talents (Night Vision, Magic Resistance, etc.)
- Fixed XP tier calculation for WFRP 4e advancement
- Removed all D&D references, now 100% WFRP-focused
- Reorganized documentation into docs/ folder
- Updated README with comprehensive tool reference
