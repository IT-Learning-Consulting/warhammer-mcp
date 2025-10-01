# Foundry VTT MCP Bridge

Connect Foundry VTT to Claude Desktop for AI-powered campaign management through the Model Context Protocol (MCP).

## Overview

The Foundry MCP Bridge enables natural AI conversations with your Foundry VTT game data. **Supports both D&D 5e and WFRP 4e game systems** (with extensibility for others):

- **Quest Creation**: [Create quests from prompts that incorporate what exists in your world and journals](https://www.youtube.com/watch?v=NqyB_z2AKME)
- **Character Management**: Query character stats, abilities (D&D) or characteristics (WFRP), and information
- **Compendium Search**: Find items, spells, and creatures using natural language with system-specific filtering
- **Content Creation**: Generate actors, NPCs, and quest journals from simple prompts
- **Scene Information**: Access current scene data and world details
- **Dice Coordination**: Interactive roll requests with player targeting (d20 for D&D, d100 for WFRP)
- **Campaign Management**: Multi-part quest and campaign tracking

This project was built with the assistance of Claude Code. If you like this project, consider [supporting it on Patreon](https://www.patreon.com/c/Adambdooley).

## Supported Game Systems

- **D&D 5e**: Full support for abilities, challenge rating, armor class, skills, and d20 rolls
- **WFRP 4e**: Full support for characteristics, threat levels, toughness/armor, skills, and d100 rolls
- **Extensible**: The architecture supports adding other game systems with minimal modifications

## Installation

### Prerequisites

- **Foundry VTT v13** 
- **Claude Desktop** with MCP support
- **Windows** (for automated installer) or **Node.js 18+** for manual installation
- **Game System**: D&D 5e or WFRP 4e installed in Foundry VTT

### Option 1: Windows Installer (Recommended)

[Video guide for Windows Installer](https://youtu.be/Se04A21wrbE)

1. Download the latest `FoundryMCPServer-Setup.exe` from [Releases](https://github.com/adambdooley/foundry-vtt-mcp/releases)
2. Run the installer - it will:
   - Install the MCP server with bundled Node.js runtime
   - Configure Claude Desktop automatically
   - Optionally install the Foundry module to your VTT installation
3. Restart Claude Desktop
4. Enable "Foundry MCP Bridge" in your Foundry Module Management

### Option 2: Manual Installation

#### Install the Foundry Module
1. Open Foundry VTT v13
2. Select install module in the Foundry Add-ons menu
2. At the bottom of the window, add the Manifest URL as: https://github.com/adambdooley/foundry-vtt-mcp/blob/master/packages/foundry-module/module.json and click install
3. Enable "Foundry MCP Bridge" in Module Management

#### Install the MCP Server
```bash
# Clone repository
git clone https://github.com/adambdooley/foundry-vtt-mcp.git
cd foundry-vtt-mcp

# Install dependencies and build
npm install
npm run build

```

#### Configure Claude Desktop
Add this to your Claude Desktop configuration (claude_desktop_config.json) file:

```json
{
  "mcpServers": {
    "foundry-mcp": {
      "command": "node",
      "args": ["path/to/foundry-vtt-mcp/packages/mcp-server/dist/index.js"],
      "env": {
        "FOUNDRY_HOST": "localhost",
        "FOUNDRY_PORT": "31415"
      }
    }
  }
}
```

Starting Claude Desktop will start the MCP Server.

### Getting Started

1. Start Foundry VTT and load your world
3. Open Claude Desktop
4. Chat with Claude about your currently loaded Foundry World 

## Example Usage

Once connected, ask Claude Desktop:

**D&D 5e Examples:**
- *"Show me my character Clark's stats"*
- *"Find all CR 12 humanoid creatures for an encounter"*  
- *"Create a quest about investigating missing villagers"*
- *"Roll a stealth check for Tulkas"*
- *"What's in the current Foundry scene?"*

**WFRP 4e Examples:**
- *"Show me my character Grunwald's characteristics"*
- *"Find all beastmen with threat level 10-15"*
- *"Create a quest about cultists in Altdorf"*
- *"Roll a Dodge test for Katerina"*
- *"List creatures with the Chaos trait"*

## Features

- **20 MCP Tools** that allow Claude to interact with Foundry
- **Multi-System Support**: Works with D&D 5e and WFRP 4e game systems
- **Character Management**: Access stats, abilities (D&D) / characteristics (WFRP), and inventory
- **Enhanced Compendium Search**: Instant filtering by CR/threat level, type/species, abilities, and more
- **Content Creation**: Generate actors, NPCs, and quest journals
- **Campaign Management**: Multi-part quest tracking with progress dashboards
- **Interactive Dice System**: Send different dice roll requests to players (d20 for D&D, d100 for WFRP)
- **Actor Ownership**: Manage player permissions for characters and tokens
- **GM-Only**: MCP Bridge only connects to Game Master users

## Settings

<img width="698" height="728" alt="image" src="https://github.com/user-attachments/assets/723d03a9-a559-443f-b9d0-5c23d6edf279" />

- **Enhanced Creature Index** Configure Enhanced Index button leads to Enhanced Creature Index sub-menu (Details below)
- **Enable MCP Bridge** This should be checked by default and the status should show as connected. It can be used to turn off the MCP Bridge connection within the game without the need to disable the add-on itself 
- **Server Host** IP Address of Claude Desktop MCP Server location. Defaults to localhost. Remote Foundry servers need to point claude desktop. [Port Forwarding knowledge may be required for Server Port](https://portforward.com/) 
**Server Port** Default port is 31415 and if it is changed here then the FOUNDRY_PORT environment variable will need to be chagned for the MCP server 
- **Allow Write Operations** This will prevent Claude from making any changes to world content and restrict it to reading only
- **Max Actors Per Request** This is a failsafe to stop a massive amount of actors being created from one single request. It does not limit the amount of characters being created by multiple requests
- **Show Connection Messages** This can turn off the banner messages for connections for Foundry MCP Bridge
- **Auto-Reconnect on Disconnect** Will automatically attempt to reconnect if the connection is lost
- **Connection Check Frequency** How often it will check connection status  

### Enhanced Creature Index Sub-menu

<img width="497" height="604" alt="image" src="https://github.com/user-attachments/assets/bf1a6fdb-9bd5-4256-b922-d28cf65b1e7d" />

- **Rebuild Creature Index** This button will rebuild the creature index if there is an issue or it is out of sync with changes in your compendiums
- **Enable Enhanced Creature Index** This should be left on as Claude builds additional metadata in the world files to give it better searches
- **Auto-Rebuild Index on Pack Changes** Experimental feature that hasn't been fully tested yet

## Architecture

```
Claude Desktop ↔ MCP Protocol ↔ MCP Server ↔ WebSocket ↔ Foundry Module ↔ Foundry VTT
```

- **Foundry Module**: Provides secure data access within Foundry VTT
- **MCP Server**: External Node.js server handling Claude Desktop communication  
- **No API Keys Required**: Uses your existing Claude Desktop subscription

## Security & Permissions

- **GM-Only Access**: All functionality restricted to Game Master users
- **Configurable Permissions**: Control what data Claude can access and modify
- **Session-Based Authentication**: Uses Foundry's built-in authentication system

## System Requirements

- **Foundry VTT**: Version 13
- **Claude Desktop**: Latest version with MCP support
- **Claude Pro/Max Plan**: Required to connect to MCP servers
- **Operating System**: Windows 10/11 (installer), or other OSes/manual Windows install with Node.js 18+ (manual)

## Support & Development

- **Issues**: Report bugs on [GitHub Issues](https://github.com/adambdooley/foundry-vtt-mcp/issues)
- **YouTube Channel**: [Subscribe for updates and tutorials](https://www.youtube.com/channel/UCVrSC-FzuAk5AgvfboJj0WA)
- **Support Development**: [Support on Patreon](https://www.patreon.com/c/Adambdooley)
- **Documentation**: Built with TypeScript, comprehensive documentation included
- **License**: MIT License
