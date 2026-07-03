// Folder helper — extracted VERBATIM from FoundryDataAccess.getOrCreateFolder (Phase 7.3.1, R7.1).
//
// Used by the actor-creation cluster (createActorFromCompendium / createActorFromCompendiumEntry,
// which move to services/actor.ts in Phase 7.6).
//
// PLACEMENT (Phase 7 user decision, 2026-06-16): services/shared/ — caps-exempt under the
// lint-ratchet `**/services/**` glob (getOrCreateFolder is complexity 11, over the utils/ cap of 10),
// and not a flat services/<svc>.ts so dep-cruiser permits cross-service import.
//
// HC1: body is byte-identical to the original. The only change is `this.moduleId` → the imported
// MODULE_ID constant — `this.moduleId` was initialised to `MODULE_ID` at the class field
// (data-access.ts: `private moduleId: string = MODULE_ID`), so this is behaviour-identical.

import { MODULE_ID } from '../../constants.js';
import { notify } from '../../notify.js';

export async function getOrCreateFolder(folderName: string, type: 'Actor' | 'JournalEntry'): Promise<string | null> {
  try {
    // Look for existing folder
    const existingFolder = game.folders?.find((f: any) =>
      f.name === folderName && f.type === type
    );

    if (existingFolder) {
      return existingFolder.id;
    }

    // Create appropriate descriptions
    let description = '';
    if (type === 'Actor') {
      if (folderName === 'Foundry MCP Creatures') {
        description = 'Creatures and monsters created via Foundry MCP Bridge';
      } else {
        description = `NPCs and creatures related to: ${folderName}`;
      }
    } else {
      description = `Quest and content for: ${folderName}`;
    }

    // Create new folder
    const folderData = {
      name: folderName,
      type: type,
      description: description,
      color: type === 'Actor' ? '#4a90e2' : '#f39c12', // Blue for actors, orange for journals
      sort: 0,
      parent: null,
      flags: {
        'foundry-mcp-bridge': {
          mcpGenerated: true,
          createdAt: new Date().toISOString(),
          questContext: type === 'JournalEntry' ? folderName : undefined
        }
      }
    };

    const folder = await Folder.create(folderData);
    if (folder) notify.created('folder', folderName);
    return folder?.id || null;
  } catch (error) {
    // RC1.1a logging upgrade ONLY (documented fail-open contract — do NOT throw here; the
    // caller falls back to no-folder rather than failing the whole create).
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[${MODULE_ID}] Failed to create folder "${folderName}":`, error);
    notify.warn(`Failed to create folder "${folderName}": ${message} — continuing without a folder`);
    // Return null so items are created without folders rather than failing
    return null;
  }
}
