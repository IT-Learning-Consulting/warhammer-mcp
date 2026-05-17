import * as fs from 'fs';

import * as os from 'os';

import * as path from 'path';

import * as net from 'net';


import { config } from './config.js';

import { Logger } from './logger.js';

import { FoundryClient } from './foundry-client.js';

import { scrubError } from './utils/scrub-error.js';
import { ToolRegistry } from './tool-registry.js';

import { CharacterTools } from './tools/character.js';
import { ManageCharacterTool } from './tools/manage-character.js';

import { ManageInventoryTool } from './tools/manage-inventory.js';

import { CompendiumTools } from './tools/compendium.js';

// Phase 4 mcp_crud_expansion — single `scene` umbrella tool (11 actions)
// replaces SceneTools (5 legacy tools) + AddActorsToSceneTool + DeleteTokenTool.
// get-world-info extracted to a sibling `world` tool.
import { SceneTool } from './tools/scene.js';
import { WorldTool } from './tools/world.js';

import { ActorCreationTools } from './tools/actor-creation.js';

import { DiceRollTools } from './tools/dice-roll.js';

import { OwnershipTool } from './tools/ownership.js';

import { RollTableTool } from './tools/rolltable.js';

import { ManageCombatTools } from './tools/manage-combat.js';

import { ApplyDamageTool } from './tools/apply-damage.js';

import { ManageConditionsTools } from './tools/manage-conditions.js';

import { ListActiveEffectsTool } from './tools/list-active-effects.js';

import { UpdateActorTool } from './tools/update-actor.js';
import { UpdateItemTool } from './tools/update-item.js';
import { AddItemFromCompendiumTool } from './tools/add-item-from-compendium.js';
import { DeleteItemTool } from './tools/delete-item.js';
import { DuplicateActorTool } from './tools/duplicate-actor.js';
import { ListActorItemsTool } from './tools/list-actor-items.js';
import { ApplyNpcCareerAdvanceTool } from './tools/apply-npc-career-advance.js';
import { ApplyTemplateTool } from './tools/apply-template.js';
import { ApplyTemplateToTokenTool } from './tools/apply-template-to-token.js';
import { GetWfrpConfigTool } from './tools/get-wfrp-config.js';
import { JournalTools } from './tools/journal.js';
import { WorldDeleteTools } from './tools/world-delete.js';
// Phase 4 mcp_crud_expansion — AddActorsToSceneTool + DeleteTokenTool folded
// into the scene umbrella (actions: 'add-tokens' / 'delete-token').
import { CreateCustomItemTool } from './tools/create-custom-item.js';
import { TradeItemTool } from './tools/trade-item.js';
import { ModifyItemQualitiesTool } from './tools/modify-item-qualities.js';
import { AddActiveEffectTool } from './tools/add-active-effect.js';
import { UpdateActiveEffectTool } from './tools/update-active-effect.js';
import { DeleteActiveEffectTool } from './tools/delete-active-effect.js';
// TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
import { GetActiveEffectByNameTool } from './tools/get-active-effect-by-name.js';
// Phase 1 mcp_diagnostic_tool — read-only diagnostic umbrella (3 actions in v1).
import { DiagnosticTool } from './tools/diagnostic.js';
// Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
import { TokenTool } from './tools/token.js';
import { LightTool } from './tools/light.js';
import { NoteTool } from './tools/note.js';
import { SoundTool } from './tools/sound.js';
import { RegionTool } from './tools/region.js';
import { TileTool } from './tools/tile.js';
import { TemplateTool } from './tools/template.js';
// Phase 6.1 mcp_crud_expansion — FilePicker umbrella tool with Node-side auto-conversion.
import { FilePickerTool } from './tools/filepicker.js';
import { NotifyTool } from './tools/notify.js';

const CONTROL_HOST = '127.0.0.1';

const CONTROL_PORT = 31414;

const LOCK_FILE = path.join(os.tmpdir(), 'foundry-mcp-backend.lock');

// BUG-047: Claude Code's MCP client ships booleans / arrays / numbers as JSON-encoded
// strings. Each tool's Zod parser expects the native JSON type and rejects with
// "expected boolean, received string". Coerce per the tool's declared inputSchema
// before dispatch so Zod sees the right shape. Unknown / untyped props pass through
// unchanged — downstream Zod will still catch real errors.
export function coerceArgsBySchema(schema: any, args: any): any {
  if (!schema || schema.type !== 'object' || !schema.properties || !args || typeof args !== 'object' || Array.isArray(args)) {
    return args;
  }
  const out: any = { ...args };
  for (const [key, propSchemaRaw] of Object.entries(schema.properties as Record<string, any>)) {
    if (!(key in out)) continue;
    const propSchema = propSchemaRaw as any;
    const t = propSchema?.type;
    const val = out[key];
    if (typeof val === 'string' && t && t !== 'string') {
      if (t === 'boolean') {
        if (val === 'true') out[key] = true;
        else if (val === 'false') out[key] = false;
      } else if (t === 'number' || t === 'integer') {
        const n = Number(val);
        if (!Number.isNaN(n) && val.trim() !== '') out[key] = n;
      } else if (t === 'array' || t === 'object') {
        try {
          const parsed = JSON.parse(val);
          out[key] = parsed;
          if (t === 'object' && propSchema.properties) {
            out[key] = coerceArgsBySchema(propSchema, parsed);
          } else if (t === 'array' && propSchema.items && Array.isArray(parsed)) {
            out[key] = parsed.map((item: any) => coerceArgsBySchema(propSchema.items, item));
          }
        } catch {
          // leave as-is; Zod will produce a readable error downstream
        }
      }
    } else if (t === 'object' && propSchema.properties && val && typeof val === 'object' && !Array.isArray(val)) {
      out[key] = coerceArgsBySchema(propSchema, val);
    } else if (t === 'array' && propSchema.items && Array.isArray(val)) {
      out[key] = val.map((item: any) => coerceArgsBySchema(propSchema.items, item));
    }
  }
  return out;
}

let lockFd: number | null = null;

function acquireLock(): boolean {

  try {

    try {

      lockFd = fs.openSync(LOCK_FILE, 'wx');

    } catch (err: any) {

      if (err && err.code === 'EEXIST') {

        try {

          const lockData = fs.readFileSync(LOCK_FILE, 'utf8');

          const lockPid = parseInt(lockData.trim(), 10);

          try {

            process.kill(lockPid, 0);

            console.error(`Backend already running with PID ${lockPid}`);

            return false;

          } catch {

            console.error(`Removing stale backend lock for PID ${lockPid}`);

            try { fs.unlinkSync(LOCK_FILE); } catch { }

            lockFd = fs.openSync(LOCK_FILE, 'wx');

          }

        } catch (readErr) {

          console.error('Corrupt backend lock file, removing:', readErr);

          try { fs.unlinkSync(LOCK_FILE); } catch { }

          lockFd = fs.openSync(LOCK_FILE, 'wx');

        }

      } else {

        console.error('Failed to open backend lock file:', err);

        return false;

      }

    }

    if (lockFd === null) return false;

    fs.writeFileSync(lockFd, String(process.pid));

    try { fs.fsyncSync(lockFd); } catch { }

    console.error(`Acquired backend lock with PID ${process.pid}`);

    return true;

  } catch (error) {

    console.error('Failed to acquire backend lock:', error);

    return false;

  }

}

function releaseLock(): void {

  try {

    if (lockFd !== null) { try { fs.closeSync(lockFd); } catch { } lockFd = null; }

    if (fs.existsSync(LOCK_FILE)) { try { fs.unlinkSync(LOCK_FILE); } catch { } }

  } catch (error) {

    console.error('Failed to release backend lock:', error);

  }

}

async function startBackend(): Promise<void> {

  // Logger: file output allowed; avoid stdout noise

  const logger = new Logger({

    level: config.logLevel,

    format: config.logFormat,

    enableConsole: false,

    enableFile: true,

    filePath: path.join(os.tmpdir(), 'foundry-mcp-server', 'mcp-server.log'),

  });

  logger.info('Starting Foundry MCP Backend', {

    version: config.server.version,

    foundryHost: config.foundry.host,

    foundryPort: config.foundry.port,

  });

  // Initialize Foundry client and tools

  const foundryClient = new FoundryClient(config.foundry, logger);

  const characterTools = new CharacterTools({ foundryClient, logger });
  const manageCharacterTool = new ManageCharacterTool({ foundryClient, logger });

  const manageInventoryTool = new ManageInventoryTool({ foundryClient, logger });

  const compendiumTools = new CompendiumTools({ foundryClient, logger });

  const sceneTool = new SceneTool({ foundryClient, logger });
  const worldTool = new WorldTool({ foundryClient, logger });

  const actorCreationTools = new ActorCreationTools({ foundryClient, logger });

  const diceRollTools = new DiceRollTools({ foundryClient, logger });

  const ownershipTool = new OwnershipTool({ foundryClient, logger });

  const rollTableTool = new RollTableTool({ foundryClient, logger });

  const manageCombatTools = new ManageCombatTools({ foundryClient, logger });

  const applyDamageTool = new ApplyDamageTool({ foundryClient, logger });

  const manageConditionsTools = new ManageConditionsTools({ foundryClient, logger });

  const listActiveEffectsTool = new ListActiveEffectsTool({ foundryClient, logger });

  const updateActorTool = new UpdateActorTool({ foundryClient, logger });
  const updateItemTool = new UpdateItemTool({ foundryClient, logger });
  const addItemFromCompendiumTool = new AddItemFromCompendiumTool({ foundryClient, logger });
  const deleteItemTool = new DeleteItemTool({ foundryClient, logger });
  const getWfrpConfigTool = new GetWfrpConfigTool({ foundryClient, logger });
  const journalTools = new JournalTools({ foundryClient, logger });
  const worldDeleteTools = new WorldDeleteTools({ foundryClient, logger });
  // Phase 4 mcp_crud_expansion — addActorsToSceneTool + deleteTokenTool folded into sceneTool.
  const duplicateActorTool = new DuplicateActorTool({ foundryClient, logger });
  const listActorItemsTool = new ListActorItemsTool({ foundryClient, logger });
  const applyNpcCareerAdvanceTool = new ApplyNpcCareerAdvanceTool({ foundryClient, logger });
  const applyTemplateTool = new ApplyTemplateTool({ foundryClient, logger });
  const applyTemplateToTokenTool = new ApplyTemplateToTokenTool({ foundryClient, logger });
  const createCustomItemTool = new CreateCustomItemTool({ foundryClient, logger });
  const tradeItemTool = new TradeItemTool({ foundryClient, logger });
  const modifyItemQualitiesTool = new ModifyItemQualitiesTool({ foundryClient, logger });
  const addActiveEffectTool = new AddActiveEffectTool({ foundryClient, logger });
  const updateActiveEffectTool = new UpdateActiveEffectTool({ foundryClient, logger });
  const deleteActiveEffectTool = new DeleteActiveEffectTool({ foundryClient, logger });
  // TOOL-IDEA-003 (2026-05-14).
  const getActiveEffectByNameTool = new GetActiveEffectByNameTool({ foundryClient, logger });
  // Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
  const tokenTool = new TokenTool({ foundryClient, logger });
  const lightTool = new LightTool({ foundryClient, logger });
  const noteTool = new NoteTool({ foundryClient, logger });
  const soundTool = new SoundTool({ foundryClient, logger });
  const regionTool = new RegionTool({ foundryClient, logger });
  const tileTool = new TileTool({ foundryClient, logger });
  const templateTool = new TemplateTool({ foundryClient, logger });
  // Phase 6.1 mcp_crud_expansion — FilePicker tool with Node-side auto-conversion.
  const filePickerTool = new FilePickerTool({ foundryClient, logger });
  // Phase 1 mcp_diagnostic_tool — read-only diagnostic umbrella (Tier 1).
  const diagnosticTool = new DiagnosticTool({ foundryClient, logger });
  // Phase 4 mcp_notify_coverage — notify umbrella (skill bookends + ad-hoc GM events).
  const notifyTool = new NotifyTool({ foundryClient, logger });

  const registry = new ToolRegistry();
  registry.register('get-character', (args) => characterTools.handleGetCharacter(args));
  registry.register('list-characters', (args) => characterTools.handleListCharacters(args));
  registry.register('manage-character', (args) => manageCharacterTool.handle(args));
  registry.register('manage-inventory', (args) => manageInventoryTool.handle(args));
  registry.register('create-custom-item', (args) => createCustomItemTool.handle(args));
  registry.register('trade-item', (args) => tradeItemTool.handle(args));
  registry.register('modify-item-qualities', (args) => modifyItemQualitiesTool.handle(args));
  registry.register('add-active-effect', (args) => addActiveEffectTool.handle(args));
  registry.register('update-active-effect', (args) => updateActiveEffectTool.handle(args));
  registry.register('delete-active-effect', (args) => deleteActiveEffectTool.handle(args));
  // TOOL-IDEA-003 (2026-05-14).
  registry.register('get-active-effect-by-name', (args) => getActiveEffectByNameTool.handle(args));
  registry.register('search-compendium', (args) => compendiumTools.handleSearchCompendium(args));
  registry.register('get-compendium-item', (args) => compendiumTools.handleGetCompendiumItem(args));
  registry.register('list-creatures-by-criteria', (args) => compendiumTools.handleListCreaturesByCriteria(args));
  registry.register('list-compendium-packs', (args) => compendiumTools.handleListCompendiumPacks(args));
  // Phase 4 mcp_crud_expansion — single `scene` umbrella replaces 5 legacy tool keys
  // (get-current-scene, list-scenes, switch-scene, add-actors-to-scene, delete-token).
  // 11 actions dispatched server-side. get-world-info extracted to `world` tool.
  registry.register('scene', (args) => sceneTool.execute(args));
  registry.register('get-world-info', (args) => worldTool.handleGetWorldInfo(args));
  registry.register('create-actor', (args) => actorCreationTools.handleCreateActor(args));
  registry.register('create-actor-from-compendium', (args) => actorCreationTools.handleCreateActorFromCompendium(args));
  registry.register('get-compendium-entry-full', (args) => actorCreationTools.handleGetCompendiumEntryFull(args));
  registry.register('request-player-rolls', (args) => diceRollTools.handleRequestPlayerRolls(args));
  registry.register('ownership', (args) => ownershipTool.execute(args));
  // Phase 4 mcp_crud_expansion — list-scenes + switch-scene folded into scene umbrella.
  registry.register('rolltable', (args) => rollTableTool.execute(args));
  registry.register('get-combat', (args) => manageCombatTools.handleGetCombat(args));
  registry.register('list-combatants', (args) => manageCombatTools.handleListCombatants(args));
  registry.register('advance-combat', (args) => manageCombatTools.handleAdvanceCombat(args));
  registry.register('add-combatants', (args) => manageCombatTools.handleAddCombatants(args));
  registry.register('remove-combatants', (args) => manageCombatTools.handleRemoveCombatants(args));
  registry.register('end-combat', (args) => manageCombatTools.handleEndCombat(args));
  registry.register('apply-damage', (args) => applyDamageTool.handle(args));
  registry.register('apply-condition', (args) => manageConditionsTools.handleApplyCondition(args));
  registry.register('remove-condition', (args) => manageConditionsTools.handleRemoveCondition(args));
  registry.register('list-conditions', (args) => manageConditionsTools.handleListConditions(args));
  registry.register('list-active-effects', (args) => listActiveEffectsTool.handle(args));
  registry.register('update-actor', (args) => updateActorTool.handle(args));
  registry.register('update-item', (args) => updateItemTool.handle(args));
  registry.register('duplicate-actor', (args) => duplicateActorTool.handle(args));
  registry.register('list-actor-items', (args) => listActorItemsTool.handle(args));
  registry.register('apply-npc-career-advance', (args) => applyNpcCareerAdvanceTool.handle(args));
  registry.register('apply-template', (args) => applyTemplateTool.handle(args));
  registry.register('apply-template-to-token', (args) => applyTemplateToTokenTool.handle(args));
  registry.register('add-item-from-compendium', (args) => addItemFromCompendiumTool.handle(args));
  registry.register('delete-item', (args) => deleteItemTool.handle(args));
  registry.register('get-wfrp-config', (args) => getWfrpConfigTool.handle(args));
  // Phase 3 mcp_crud_expansion — single `journal` umbrella replaces 5 legacy tool keys
  // (list-journals / get-journal-content / create-journal-entry / update-journal-content /
  // delete-journal-entry). 13 actions dispatched server-side.
  registry.register('journal', (args) => journalTools.execute(args));
  // Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
  registry.register('token', (args) => tokenTool.execute(args));
  registry.register('light', (args) => lightTool.execute(args));
  registry.register('note', (args) => noteTool.execute(args));
  registry.register('sound', (args) => soundTool.execute(args));
  registry.register('region', (args) => regionTool.execute(args));
  registry.register('tile', (args) => tileTool.execute(args));
  registry.register('template', (args) => templateTool.execute(args));
  // Phase 6.1 mcp_crud_expansion — FilePicker umbrella (upload / list / convert).
  registry.register('filepicker', (args) => filePickerTool.execute(args));
  // Phase 1 mcp_diagnostic_tool — read-only diagnostic umbrella. Foundry-side
  // dispatcher gates on validateGMAccess + enableDiagnosticTools setting.
  registry.register('diagnostic', (args) => diagnosticTool.execute(args));
  // Phase 4 mcp_notify_coverage — single `notify` umbrella for skill bookends + GM-visible events.
  registry.register('notify', (args) => notifyTool.execute(args));
  // Phase 4 mcp_crud_expansion — add-actors-to-scene + delete-token folded into scene umbrella.
  registry.register('delete-actor', (args) => worldDeleteTools.handleDeleteActor(args));

  const allTools = [

    ...characterTools.getToolDefinitions(),
    ...manageCharacterTool.getToolDefinitions(),

    ...manageInventoryTool.getToolDefinitions(),

    ...compendiumTools.getToolDefinitions(),

    ...sceneTool.getToolDefinitions(),

    ...worldTool.getToolDefinitions(),

    ...actorCreationTools.getToolDefinitions(),

    ...diceRollTools.getToolDefinitions(),

    ...ownershipTool.getToolDefinitions(),

    ...rollTableTool.getToolDefinitions(),

    ...manageCombatTools.getToolDefinitions(),

    ...applyDamageTool.getToolDefinitions(),

    ...manageConditionsTools.getToolDefinitions(),

    ...listActiveEffectsTool.getToolDefinitions(),

    ...updateActorTool.getToolDefinitions(),

    ...updateItemTool.getToolDefinitions(),

    ...addItemFromCompendiumTool.getToolDefinitions(),

    ...deleteItemTool.getToolDefinitions(),

    ...getWfrpConfigTool.getToolDefinitions(),

    ...journalTools.getToolDefinitions(),

    ...worldDeleteTools.getToolDefinitions(),

    // Phase 4 mcp_crud_expansion — add-actors-to-scene + delete-token folded into scene umbrella.

    ...duplicateActorTool.getToolDefinitions(),
    ...listActorItemsTool.getToolDefinitions(),

    ...applyNpcCareerAdvanceTool.getToolDefinitions(),

    ...applyTemplateTool.getToolDefinitions(),

    ...applyTemplateToTokenTool.getToolDefinitions(),

    ...createCustomItemTool.getToolDefinitions(),
    ...tradeItemTool.getToolDefinitions(),
    ...modifyItemQualitiesTool.getToolDefinitions(),
    ...addActiveEffectTool.getToolDefinitions(),
    ...updateActiveEffectTool.getToolDefinitions(),
    ...deleteActiveEffectTool.getToolDefinitions(),
    // TOOL-IDEA-003 (2026-05-14).
    ...getActiveEffectByNameTool.getToolDefinitions(),
    // Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
    ...tokenTool.getToolDefinitions(),
    ...lightTool.getToolDefinitions(),
    ...noteTool.getToolDefinitions(),
    ...soundTool.getToolDefinitions(),
    ...regionTool.getToolDefinitions(),
    ...tileTool.getToolDefinitions(),
    ...templateTool.getToolDefinitions(),
    // Phase 6.1 mcp_crud_expansion — FilePicker umbrella (upload / list / convert).
    ...filePickerTool.getToolDefinitions(),
    // Phase 1 mcp_diagnostic_tool — diagnostic umbrella (3 actions in v1).
    ...diagnosticTool.getToolDefinitions(),

    ...notifyTool.getToolDefinitions(),

  ];

  // Start Foundry connector (owns app port 31415)

  foundryClient.connect().catch((e) => {

    logger.error('Foundry connector failed to start', e);

  });

  // Control channel (TCP JSON-lines)

  const server = net.createServer((socket) => {

    socket.setEncoding('utf8');

    let buffer = '';

    socket.on('data', async (chunk: string) => {

      buffer += chunk;

      let idx: number;

      while ((idx = buffer.indexOf('\n')) >= 0) {

        const line = buffer.slice(0, idx).trim();

        buffer = buffer.slice(idx + 1);

        if (!line) continue;

        try {

          const msg = JSON.parse(line) as { id: string; method: string; params?: any };

          if (msg.method === 'ping') {

            socket.write(JSON.stringify({ id: msg.id, result: { ok: true } }) + '\n');

            continue;

          }

          if (msg.method === 'list_tools') {

            socket.write(JSON.stringify({ id: msg.id, result: { tools: allTools } }) + '\n');

            continue;

          }

          if (msg.method === 'call_tool') {

            const { name, args: rawArgs } = (msg.params || {}) as { name: string; args?: any };

            const toolDef = allTools.find((t: any) => t.name === name);
            const args = coerceArgsBySchema((toolDef as any)?.inputSchema, rawArgs);

            try {

              const dispatchP = registry.dispatch(name, args);
              if (!dispatchP) {
                socket.write(JSON.stringify({ id: msg.id, error: { code: -32602, message: `Unknown tool: ${name}` } }) + '\n');
                continue;
              }
              const result = await dispatchP;
              let payload: any;
              if (result && typeof result === 'object' && 'structuredContent' in result && 'content' in result) {
                payload = result;
              } else {
                payload = { content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }] };
              }
              socket.write(JSON.stringify({ id: msg.id, result: payload }) + '\n');

            } catch (e: any) {

              socket.write(
                JSON.stringify({ id: msg.id, result: { content: [{ type: 'text', text: `Error: ${scrubError(e)}` }], isError: true } }) + '\n'
              );

            }

            continue;

          }

          // Unknown method

          socket.write(JSON.stringify({ id: msg.id, error: { message: 'Unknown method' } }) + '\n');

        } catch (e: any) {

          try { socket.write(JSON.stringify({ error: { message: e?.message || 'Bad request' } }) + '\n'); } catch { }

        }

      }

    });

  });

  await new Promise<void>((resolve, reject) => {

    server.listen(CONTROL_PORT, CONTROL_HOST, () => {

      logger.info(`Backend control channel listening on ${CONTROL_HOST}:${CONTROL_PORT}`);

      resolve();

    });

    server.on('error', reject);

  });

  // Shutdown hooks

  process.on('SIGINT', () => { foundryClient.disconnect(); releaseLock(); process.exit(0); });

  process.on('SIGTERM', () => { foundryClient.disconnect(); releaseLock(); process.exit(0); });

}

(async function main() {

  if (!acquireLock()) process.exit(0);

  process.on('exit', releaseLock);

  try {

    await startBackend();

  } catch (e: any) {

    console.error('Failed to start backend:', e?.message || e);

    releaseLock();

    process.exit(1);

  }

})();
