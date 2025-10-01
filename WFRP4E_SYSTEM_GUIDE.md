# Foundry VTT MCP Bridge - WFRP 4e System Guide

## 📖 Repository Overview

**Foundry VTT MCP Bridge** is an AI-powered integration that connects **Claude Desktop** to **Foundry VTT v13** using the **Model Context Protocol (MCP)**. It enables natural language conversations with Claude about your Foundry campaigns, allowing AI-assisted game mastering, content creation, and campaign management.

### **Dual-System Architecture**
The bridge was originally built for **D&D 5e** but has been **fully enhanced** to support **WFRP 4e** (Warhammer Fantasy Roleplay 4th Edition), with automatic system detection and context-aware tool descriptions.

---

## 🎯 What This Does For You (WFRP 4e GM)

As a WFRP 4e Game Master using this bridge, you can **talk to Claude about your Foundry campaign** and have it:

### **1. Character & NPC Management**
- *"Show me Grunwald's characteristics and skills"*
- *"What are Hans' current wounds and corruption points?"*
- *"Check Katerina's Fortune and Fate status"*
- Access WFRP-specific data: WS, BS, S, T, I, Ag, Dex, Int, WP, Fel

### **2. WFRP-Specific Mechanics (10 Specialized Tools)**
You now have **48+ AI-accessible tools** specifically for WFRP 4e mechanics:

#### **Career System**
- Track career advancement and XP costs
- Calculate progression requirements
- *"How much XP does Hans need to advance his Weapon Skill?"*

#### **Corruption & Mutation**
- Monitor corruption points and thresholds
- Track mutations (physical/mental)
- Calculate corruption-based insanity
- *"Add 2 corruption points to Grunwald for witnessing chaos ritual"*

#### **Fortune & Fate**
- Manage Fortune points (daily rerolls)
- Track Fate points (permanent death saves)
- Visual progress indicators (●○ for Fortune, ★☆ for Fate)
- *"Katerina wants to burn Fate to survive that critical hit"*

#### **Critical Wounds & Injuries**
- Track wounds by location (Head, Body, Arms, Legs)
- Death threshold calculations (criticals > Toughness Bonus)
- Healing management
- *"Hans took a critical wound to the head from that beastman"*

#### **Advantage Tracker**
- Combat advantage mechanics (+10 per point)
- Momentum tracking
- Tactical combat analysis
- *"Give Grunwald +2 Advantage for that successful parry"*

#### **Disease & Infection**
- Disease tracking with incubation periods
- Resilience tests for recovery
- Common WFRP diseases (Bloody Flux, Black Plague)
- *"Hans caught an infection from those swamp waters"*

#### **Inventory & Encumbrance**
- Encumbrance calculations (S Bonus + T Bonus)
- Ammunition tracking (arrows, bolts, bullets)
- Carrying capacity warnings
- *"How much can Grunwald carry with his armor and weapons?"*

#### **Prayer & Blessing System**
- Divine magic for priests
- Sin point tracking (deity transgressions)
- Penance mechanics (confession, pilgrimage, quests)
- Divine favor system (0-2 minor sins, 3-5 disfavored, 6-9 forsaken, 10+ damned)
- Deity-specific prayers (Sigmar, Ulric, Shallya, Morr, Ranald)
- *"Invoke a blessing of Sigmar for protection"*
- *"Check if my sins have angered my deity"*

#### **Magic & Spell System**
- Arcane magic for wizards
- Lores of Magic (Fire, Shadow, Metal, Beasts, Heavens, Life, Light, Death)
- Channelling power mechanics
- Casting Numbers (CN) and Language (Magick) tests
- Miscast severity (Minor/Major/Critical)
- Spell memorization (limited by Intelligence Bonus)
- *"Cast Fireball using Lore of Fire"*
- *"Channel power before attempting that difficult spell"*

#### **Social Status & Reputation**
- Status tiers (Brass/Silver/Gold)
- Social interaction modifiers
- Income calculations by status
- Reputation tracking (local/regional/national)
- NPC reaction modifiers
- *"Make a Charm test against the noble, accounting for status difference"*
- *"Calculate income for Hans as a Silver-tier craftsman"*

### **3. Encounter Building**
- *"Find all WFRP beastmen with threat level 10-15"*
- *"Show me creatures with the Chaos trait from the bestiary"*
- Filter by threat level (WFRP equivalent of CR)
- Search by species, traits, and abilities

### **4. Dice Rolling (d100 System)**
- Interactive roll buttons in Foundry chat
- WFRP characteristic tests (WS, BS, etc.)
- Skill tests with advances
- Public or private rolls
- *"Roll a Weapon Skill test for Hans"*
- *"Everyone roll Perception with +10 modifier"*

### **5. Content Creation**
- Generate NPCs with WFRP characteristics
- Create quests set in The Reikland, Altdorf, or other locations
- Auto-generate journals with WFRP lore
- *"Create a cultist NPC for my Chaos investigation"*
- *"Generate a quest about missing villagers in Averheim"*

### **6. Campaign Management**
- Multi-part campaign tracking
- Quest progress dashboards
- Session summaries with WFRP context
- *"Create a 3-part campaign about investigating corruption in Altdorf"*

---

## 🏗️ Technical Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│ Claude Desktop  │ ◄─MCP─► │  MCP Server  │ ◄─WS──► │  Foundry Module │
│  (Your AI)      │         │ (Node.js)    │         │  (In Foundry)   │
└─────────────────┘         └──────────────┘         └─────────────────┘
                                   ▲                          ▲
                                   │                          │
                            Port 31414                  Port 31415
                          (Control Channel)         (Foundry Bridge)
```

### **Repository Structure**
```
foundry-vtt-mcp/
├── packages/
│   ├── mcp-server/              # Node.js MCP server
│   │   ├── src/
│   │   │   ├── backend.ts       # Main server logic
│   │   │   ├── foundry-client.ts # WebSocket client
│   │   │   ├── tools/           # 48+ MCP tools
│   │   │   │   ├── career-advancement.ts      ⭐ WFRP
│   │   │   │   ├── corruption-mutation.ts     ⭐ WFRP
│   │   │   │   ├── fortune-fate.ts            ⭐ WFRP
│   │   │   │   ├── critical-wounds.ts         ⭐ WFRP
│   │   │   │   ├── advantage-tracker.ts       ⭐ WFRP
│   │   │   │   ├── disease-infection.ts       ⭐ WFRP
│   │   │   │   ├── inventory-management.ts    ⭐ WFRP
│   │   │   │   ├── prayer-blessing.ts         ⭐ WFRP
│   │   │   │   ├── spell-magic.ts             ⭐ WFRP
│   │   │   │   ├── social-status.ts           ⭐ WFRP
│   │   │   │   ├── character.ts               (Dual-system)
│   │   │   │   ├── compendium.ts              (Dual-system)
│   │   │   │   ├── dice-roll.ts               (Dual-system)
│   │   │   │   ├── actor-creation.ts          (Dual-system)
│   │   │   │   ├── quest-creation.ts
│   │   │   │   ├── scene.ts
│   │   │   │   ├── ownership.ts
│   │   │   │   └── campaign-management.ts
│   │   │   └── index.ts         # Entry point
│   │   └── package.json
│   │
│   ├── foundry-module/          # Foundry VTT Module
│   │   ├── src/
│   │   │   ├── main.ts          # Module initialization
│   │   │   ├── data-access.ts   # Foundry API wrapper
│   │   │   ├── socket-bridge.ts # WebSocket server
│   │   │   └── settings.ts      # Module configuration
│   │   ├── module.json          # Foundry manifest
│   │   └── package.json
│   │
│   └── shared/                  # Shared types/schemas
│       ├── src/
│       │   ├── types.ts         # TypeScript definitions
│       │   ├── schemas.ts       # Zod validation
│       │   └── constants.ts
│       └── package.json
│
├── installer/                   # Windows installer (NSIS)
│   ├── nsis/
│   │   └── foundry-mcp-server.nsi
│   └── build-nsis.js
│
├── README.md                    # Main documentation
├── CHANGELOG.md                 # Version history
├── INSTALLATION.md              # Setup guide
└── package.json                 # Root workspace config
```

---

## 🎮 How WFRP 4e Support Works

### **Automatic System Detection**
The bridge automatically detects your game system using `game.system.id`:
- **D&D 5e**: `dnd5e`
- **WFRP 4e**: `wfrp4e`

When WFRP is detected, all tools automatically:
- Use d100 rolls instead of d20
- Reference characteristics (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel) instead of abilities (STR, DEX, CON, etc.)
- Calculate threat levels instead of Challenge Rating
- Use WFRP-specific terminology (wounds, toughness, corruption, etc.)

### **Data Structure Adaptation**

#### **D&D 5e Character:**
```javascript
{
  system: {
    abilities: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
    attributes: { hp: { max: 45, value: 32 }, ac: { value: 17 } },
    skills: { perception: { total: 4 } }
  }
}
```

#### **WFRP 4e Character:**
```javascript
{
  system: {
    characteristics: { 
      ws: 45, bs: 38, s: 42, t: 47, i: 35, 
      ag: 40, dex: 38, int: 30, wp: 36, fel: 28 
    },
    status: { 
      wounds: { max: 14, value: 11 },
      corruption: { value: 3, threshold: 8 },
      fortune: { value: 2, max: 3 },
      fate: { value: 2, max: 2 }
    },
    skills: { 
      "Melee (Basic)": { total: 55, advances: 10 }
    }
  }
}
```

---

## 🚀 Getting Started with WFRP 4e

### **Prerequisites**
1. **Foundry VTT v13** with **WFRP 4e system** installed
2. **Claude Desktop** (Claude Pro or Max plan required for MCP)
3. **Windows 10/11** (for installer) or **Node.js 18+** (for manual install)

### **Installation Options**

#### **Option 1: Windows Installer (Recommended)**
1. Download `FoundryMCPServer-Setup.exe` from [GitHub Releases](https://github.com/adambdooley/foundry-vtt-mcp/releases)
2. Run installer (automatically configures Claude Desktop)
3. Start Foundry VTT and enable "Foundry MCP Bridge" module
4. Start Claude Desktop
5. Begin chatting! *"Show me my WFRP characters"*

#### **Option 2: Manual Installation**
```bash
# Clone repository
git clone https://github.com/adambdooley/foundry-vtt-mcp.git
cd foundry-vtt-mcp

# Install and build
npm install
npm run build

# Configure Claude Desktop
# Add to claude_desktop_config.json:
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

### **Foundry Module Setup**
1. In Foundry VTT, go to **Add-on Modules**
2. Install via manifest URL: `https://github.com/adambdooley/foundry-vtt-mcp/blob/master/packages/foundry-module/module.json`
3. Enable "Foundry MCP Bridge" in your world
4. Check settings to ensure **Connected** status

---

## 💬 Example WFRP 4e Conversations

### **Character Management**
```
You: "Show me Grunwald's current status"

Claude: *Uses get-character tool*
Here's Grunwald's status:
- Wounds: 11/14
- Corruption: 3 (Minor)
- Fortune: 2/3 ●●○
- Fate: 2/2 ★★
- Characteristics: WS 45, BS 38, S 42, T 47...
- Career: Soldier (Level 2)
```

### **Career Advancement**
```
You: "How much XP does Hans need to advance his Weapon Skill?"

Claude: *Uses get-career-advancement tool*
Hans needs 40 XP to advance WS from 40 to 45 (+5 advance).
Characteristic advancement costs: [25, 30, 40, 50, 70, 90...]
```

### **Combat Management**
```
You: "Grunwald parried successfully, give him advantage"

Claude: *Uses add-advantage tool*
Grunwald now has 2 Advantage (+20 to his next test).
With momentum on his side, he has a strong tactical position!
```

### **Divine Magic**
```
You: "My priest wants to invoke a blessing of Sigmar"

Claude: *Uses invoke-prayer tool*
Roll Pray skill test for blessing invocation.
Sigmar's blessing will provide:
- +1 SL to your next test
- Protection from evil (minor)
Your sin points: 1 (minor transgression, no penalty)
```

### **Arcane Magic**
```
You: "Cast Fireball from the Lore of Fire"

Claude: *Uses cast-spell tool*
Casting Fireball (CN 7) from Aqshy (Lore of Fire):
Roll Language (Magick) test with your channelled power (+2 SL).
On success: 1d10+5 damage in 6-yard radius.
Miscast risk: Watch for critical failures!
```

### **Encounter Building**
```
You: "Find me beastmen around threat level 12 for an encounter"

Claude: *Uses list-creatures-by-criteria tool*
Found 8 beastmen:
1. Gor (Threat 11) - Aggressive warrior
2. Bestigor (Threat 13) - Elite fighter
3. Ungor (Threat 9) - Weaker skirmisher
[Details for each...]
```

### **Social Interaction**
```
You: "I want to charm the noble. My character is a Silver-tier merchant."

Claude: *Uses make-social-test tool*
Your merchant (Status 3) vs Noble (Status 5):
Status difference: -2 (-20 penalty to Charm test)
Roll Charm at -20. The noble expects deference!
```

---

## 🔧 Module Settings (Foundry VTT)

Access via **Game Settings > Module Settings > Foundry MCP Bridge**:

- **Enable MCP Bridge**: Turn connection on/off
- **Server Host**: IP address (default: localhost)
- **Server Port**: WebSocket port (default: 31415)
- **Allow Write Operations**: Enable/disable AI making changes
- **Max Actors Per Request**: Safety limit for bulk creation
- **Enhanced Creature Index**: Metadata for better searches
- **Auto-Rebuild Index**: Experimental compendium syncing

---

## 🛡️ Security & Permissions

- **GM-Only Access**: All MCP tools require GM permission
- **Session-Based Auth**: Uses Foundry's built-in authentication
- **Configurable Write Access**: Can restrict to read-only mode
- **No API Keys**: Uses your Claude Desktop subscription (no external API calls)
- **Local Communication**: MCP server runs locally, connects via localhost

---

## 📊 Complete Tool List (48+ Methods)

### **WFRP 4e Specific Tools (37 methods)**
1. **Career Advancement** (1 method)
2. **Corruption & Mutation** (3 methods)
3. **Fortune & Fate** (4 methods)
4. **Critical Wounds** (4 methods)
5. **Advantage Tracker** (4 methods)
6. **Disease & Infection** (4 methods)
7. **Inventory Management** (5 methods)
8. **Prayer & Blessing** (6 methods)
9. **Spell & Magic** (6 methods)
10. **Social Status** (5 methods)

### **Dual-System Tools (11+ methods)**
- **Character Management** (2 methods)
- **Compendium Search** (3 methods)
- **Dice Rolling** (1 method)
- **Actor Creation** (1 method)
- **Scene Information** (2 methods)
- **Ownership Management** (2 methods)

### **Universal Tools**
- **Quest Creation** (1 method)
- **Campaign Management** (1 method)
- **Map Generation** (experimental)

---

## 🎓 Best Practices for WFRP 4e GMs

### **1. Start Conversations with Context**
```
❌ "Roll for the party"
✅ "Roll Perception tests for all characters in the current scene"
```

### **2. Use WFRP Terminology**
Claude understands WFRP 4e mechanics:
- "Weapon Skill" not "Attack"
- "Wounds" not "HP"
- "Corruption" not "Sanity"
- "Fortune" not "Inspiration"
- "Characteristic tests" not "Ability checks"

### **3. Leverage AI Knowledge**
Claude knows WFRP lore! Ask about:
- *"What's typical for a Ulric priest?"*
- *"Generate a mutant cultist appropriate for Altdorf"*
- *"Create a quest involving Skaven in the sewers"*

### **4. Combine Tools**
```
You: "Hans is attacked by a beastman. Roll initiative, then if he's hit, 
      track the critical wound and check if he gets an infection."

Claude: *Rolls initiative, tracks wounds, checks for disease*
```

### **5. Use Filters for Encounters**
```
Instead of: "Find monsters"
Try: "Find creatures with threat 10-15, Chaos trait, and physical attacks"
```

---

## 🐛 Troubleshooting

### **Connection Issues**
1. Check Foundry module is **enabled** and shows **Connected**
2. Restart Claude Desktop
3. Verify port 31415 is not blocked by firewall
4. Check `%TEMP%\foundry-mcp-server\mcp-server.log` for errors

### **WFRP Data Not Appearing**
1. Ensure **WFRP 4e system** is installed in Foundry
2. Check character sheets use WFRP 4e template
3. Verify compendiums are enabled in Foundry
4. Rebuild creature index in module settings

### **Tools Not Working**
1. Verify you're logged in as **GM** in Foundry
2. Check "Allow Write Operations" is enabled
3. Ensure character names match exactly
4. Try using character UUID instead of name

---

## 🔮 Future Enhancements

Potential WFRP-specific additions:
- Extended Test Tracker (deliberately skipped in v0.5.0)
- Insanity & Psychology tracking
- Armor damage & item quality
- Tavern brawl generator
- Random mutation tables
- Career path suggestions
- NPC relationship mapping

---

## 📚 Resources

- **GitHub**: https://github.com/adambdooley/foundry-vtt-mcp
- **Issues**: https://github.com/adambdooley/foundry-vtt-mcp/issues
- **YouTube Tutorials**: https://www.youtube.com/channel/UCVrSC-FzuAk5AgvfboJj0WA
- **Support Development**: https://www.patreon.com/c/Adambdooley
- **WFRP 4e System**: https://foundryvtt.com/packages/wfrp4e
- **Claude Desktop**: https://claude.ai/download

---

## 🎉 Summary: Why This is Amazing for WFRP 4e GMs

This MCP Bridge transforms how you run WFRP 4e games in Foundry VTT:

✅ **Natural Language Control**: Talk to your campaign data instead of clicking through menus
✅ **WFRP-Aware AI**: Claude understands d100 mechanics, corruption, Fortune/Fate, and Reikland lore
✅ **48+ Specialized Tools**: Career progression, corruption tracking, divine/arcane magic, social status, and more
✅ **Encounter Building**: Filter creatures by threat level, species, and traits instantly
✅ **Content Generation**: AI-powered NPCs, quests, and journals with WFRP context
✅ **Combat Support**: Track advantage, critical wounds, and disease with natural commands
✅ **Campaign Management**: Multi-session quest tracking and progress dashboards
✅ **Real-Time Integration**: Changes sync immediately with Foundry VTT
✅ **Zero Setup Burden**: Automatic system detection, works out of the box

**Example Session Flow:**
```
You: "Show my party's status"
Claude: *Shows all characters with wounds, corruption, fortune*

You: "We're entering Altdorf's sewers. Find me Skaven around threat 10"
Claude: *Lists appropriate enemies*

You: "Roll Perception for everyone, private rolls"
Claude: *Creates roll buttons in Foundry chat*

You: "Hans got hit by a rusty blade. Add a critical wound to his arm 
      and check for infection"
Claude: *Tracks wound, rolls resilience test*

You: "Grunwald invokes Sigmar's blessing for the fight"
Claude: *Checks divine favor, rolls Pray test, applies blessing*

You: "Create a cultist NPC for the boss fight"
Claude: *Generates WFRP NPC with characteristics, skills, mutations*
```

The bridge understands WFRP 4e deeply - from career advancement XP costs to the nuances of Channelling magic to the social hierarchy of the Empire. It's like having an AI assistant who's read the entire WFRP 4e rulebook and can instantly apply it to your Foundry game.

**Built with TypeScript. Tested with Foundry VTT v13. Licensed under MIT.**

---

*This guide created for Foundry VTT MCP Bridge v0.5.0 with comprehensive WFRP 4e support.*
