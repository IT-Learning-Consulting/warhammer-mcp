# D&D References Removal Analysis

## Summary
This document analyzes all D&D-related references in the codebase and categorizes them by whether they can be safely removed without breaking functionality.

---

## ✅ SAFE TO REMOVE (Documentation/Examples Only)

### 1. **Documentation Files** - Safe to Edit
These files contain D&D references for documentation purposes only. Removing them won't break functionality.

#### `README.md`
- **Line 7**: "Supports both D&D 5e and WFRP 4e" → Change to focus on WFRP 4e
- **Line 9**: Character abilities mention (D&D) → Keep WFRP only
- **Line 15**: d20 for D&D mention → Remove
- **Line 21**: "D&D 5e: Full support..." → Remove entire line
- **Line 32**: "D&D 5e or WFRP 4e installed" → Change to "WFRP 4e installed"
- **Line 96**: "D&D 5e Examples:" section → Remove entire section
- **Line 113**: "Works with D&D 5e and WFRP 4e" → Change to "Works with WFRP 4e"

#### `WFRP_EXAMPLES.md`
- **Line 57**: "Supports both D&D 5e (d20 system) and WFRP 4e" → Remove D&D mention
- **Line 174**: "(e.g., D&D 5e, WFRP 4e)" → Just say "WFRP 4e"

#### `WFRP_ENHANCEMENTS.md`
- **Line 3**: "alongside D&D 5e" → Remove
- **Line 7**: "maintain full backward compatibility with D&D 5e" → Remove phrase
- **Line 68**: "system detection (D&D 5e, WFRP 4e)" → Just WFRP 4e
- **Line 85**: Comparison table with D&D column → Remove D&D column
- **Line 85**: Table shows features for both systems → Keep WFRP only

#### `WFRP4E_SYSTEM_GUIDE.md`
- **Line 8**: "originally built for D&D 5e" → Remove or rephrase
- **Line 199**: "D&D 5e: dnd5e" example → Remove
- **Line 210**: "D&D 5e Character:" example → Remove entire section

---

## ⚠️ KEEP BUT MODIFY (Functional Code with D&D Examples)

### 2. **Tool Descriptions** - Keep Generic, Remove D&D Examples

#### `packages/mcp-server/src/tools/actor-creation.ts`
- **Line 36**: `description: 'ID of the compendium pack containing the creature (D&D 5e: "dnd5e.monsters"; WFRP 4e: "wfrp4e.bestiary" or similar)'`
- **Action**: Remove the D&D example, keep format: `'ID of the compendium pack containing the creature (e.g., "wfrp4e.bestiary")'`

---

## 🔒 KEEP UNCHANGED (Critical Functionality)

### 3. **Compendium Priority System** - Keep for Compatibility

#### `packages/foundry-module/src/data-access.ts`
- **Lines 1561-1562**:
```typescript
{ pattern: /^dnd5e\.monsters/, priority: 100 },           // Core D&D 5e monsters 
{ pattern: /^dnd5e\.actors/, priority: 95 },             // Core D&D 5e actors
```

**Why Keep**: This is a priority system that automatically ranks compendium packs. Even if you're only using WFRP 4e, these patterns won't match anything and won't cause errors. Removing them could break the generic compendium search functionality if someone uses a different system. The code is system-agnostic and simply prioritizes known packs.

**Alternative**: Could be commented out but not removed, with a note that they're legacy patterns for other systems.

---

## 🎨 KEEP (Map Generation Assets)

### 4. **ComfyUI/Map Generation** - Keep DnD Model

#### `packages/mcp-server/src/comfyui-client.ts`
- **Line 414**: `const enhancedPrompt = \`2d DnD battlemap of ${input.prompt}, top-down view, overhead perspective, aerial\`;`

**Why Keep**: This uses "DnD battlemap" as a **style descriptor** for the AI image generation model. It's not about D&D the game system, but rather the visual style of top-down tactical battlemaps that D&D popularized. The AI model was trained on "DnD battlemap" as a keyword and changing it may reduce quality.

**Why It Works for WFRP**: WFRP uses the same tactical battlemap style (top-down, grid-based combat). The visual style is identical regardless of rule system.

#### `LICENSE` and `installer/nsis/LICENSE.txt`
- **Lines 27, 29**: References to `dnd-battlemaps-sdxl-1.0-mirror` model

**Why Keep**: This is the AI model used for map generation. The model name contains "dnd" because it was trained on D&D-style battlemaps, but the visual output works perfectly for any tactical RPG including WFRP.

#### `installer/nsis/foundry-mcp-server.nsi`
- **Lines 226, 272-330**: Multiple references to downloading/installing the D&D Battlemaps model

**Why Keep**: This is installer code that downloads the ComfyUI model. The model creates tactical battlemaps that work for any tabletop RPG. Just because it has "dnd" in the filename doesn't mean it only works for D&D.

---

## 🗑️ IGNORE (Not User-Facing)

### 5. **Generated/Compiled Files** - Don't Edit

#### `wfrp.js` and `wfrp_system.js`
- These are generated/compiled WFRP system files
- Don't contain actual D&D content (just random matching strings)
- Not part of your codebase

#### `package-lock.json`
- **Line 8607**: Random string match, not actual D&D reference
- Don't edit lock files manually

---

## 📋 Recommendation Summary

### **Files to Modify (Safe)**
1. ✅ `README.md` - Remove D&D examples, focus on WFRP
2. ✅ `WFRP_EXAMPLES.md` - Remove D&D mentions
3. ✅ `WFRP_ENHANCEMENTS.md` - Remove backward compatibility language
4. ✅ `WFRP4E_SYSTEM_GUIDE.md` - Remove D&D examples
5. ✅ `packages/mcp-server/src/tools/actor-creation.ts` - Remove D&D example from description

### **Files to Keep Unchanged**
1. 🔒 `packages/foundry-module/src/data-access.ts` - Compendium priority patterns (harmless even if unused)
2. 🎨 `packages/mcp-server/src/comfyui-client.ts` - "DnD battlemap" is a style descriptor for AI
3. 🎨 `LICENSE` files - Model attribution (required)
4. 🎨 `installer/nsis/foundry-mcp-server.nsi` - Installer for map generation model (works for all RPGs)

---

## Implementation Order

### Phase 1: Documentation Cleanup (Zero Risk)
1. Update `README.md` to remove D&D examples and focus on WFRP
2. Clean up `WFRP_EXAMPLES.md` references
3. Simplify `WFRP_ENHANCEMENTS.md` to remove "dual-system" language
4. Update `WFRP4E_SYSTEM_GUIDE.md` to remove D&D comparison examples

### Phase 2: Tool Descriptions (Low Risk)
5. Update `actor-creation.ts` description to remove D&D compendium example

### Phase 3: Optional (Consider Carefully)
6. **Optional**: Comment out (don't delete) D&D compendium patterns in `data-access.ts` with note explaining they're legacy patterns
7. **Do Not Change**: Map generation code and installer (functional for all systems)

---

## Testing After Changes

After making documentation changes:
1. ✅ Build should succeed (no code changes)
2. ✅ All tools should work identically
3. ✅ Map generation should continue working
4. ✅ Compendium search should work with WFRP packs

After removing D&D examples from `actor-creation.ts`:
1. ✅ Build and test actor creation tool
2. ✅ Verify description displays correctly
3. ✅ Test with WFRP compendium packs

---

## Conclusion

**Most D&D references are in documentation and can be safely removed.**

**The only code references are:**
- Tool description examples (safe to remove)
- Compendium priority patterns (safe to keep, harmless even if unused)
- Map generation AI model references (keep - works for all RPG systems)

**Recommended approach:** Clean up documentation first, then decide if you want to modify the compendium patterns. Leave map generation code untouched as it's system-agnostic despite the naming.
