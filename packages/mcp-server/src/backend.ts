import * as fs from 'fs';

import * as os from 'os';

import * as path from 'path';

import * as net from 'net';


import { config } from './config.js';

import { Logger } from './logger.js';

import { FoundryClient } from './foundry-client.js';

import { CharacterTools } from './tools/character.js';
import { ManageCharacterTool } from './tools/manage-character.js';

import { ManageCorruptionTools } from './tools/manage-corruption.js';

import { ManageMutationTools } from './tools/manage-mutation.js';

import { ManageCriticalWoundTool } from './tools/manage-critical-wound.js';
import { RollCriticalWoundTool } from './tools/roll-critical-wound.js';

import { ManageDiseaseTool } from './tools/manage-disease.js';

import { ManageInventoryTool } from './tools/manage-inventory.js';

import { CreateItemTool } from './tools/create-item.js';

import { ManageDivineMagicTool } from './tools/manage-divine-magic.js';

import { ManageArcaneMagicTool } from './tools/manage-arcane-magic.js';

import { ManageNPCGenerationTool } from './tools/manage-npc-generation.js';

import { CompendiumTools } from './tools/compendium.js';

import { SceneTools } from './tools/scene.js';

import { ActorCreationTools } from './tools/actor-creation.js';

import { ManageJournalTool } from './tools/manage-journal.js';

import { DiceRollTools } from './tools/dice-roll.js';

import { OwnershipTool } from './tools/ownership.js';

import { RollTableTool } from './tools/rolltable.js';

import { ManageCombatTools } from './tools/manage-combat.js';

import { ApplyDamageTool } from './tools/apply-damage.js';

import { ManageConditionsTools } from './tools/manage-conditions.js';

import { ListActiveEffectsTool } from './tools/list-active-effects.js';

import { UpdateActorTool } from './tools/update-actor.js';
import { UpdateItemTool } from './tools/update-item.js';
import { GetWfrpConfigTool } from './tools/get-wfrp-config.js';

const CONTROL_HOST = '127.0.0.1';

const CONTROL_PORT = 31414;

const LOCK_FILE = path.join(os.tmpdir(), 'foundry-mcp-backend.lock');

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
  const manageCharacterTool = new ManageCharacterTool(foundryClient, logger);

  const manageCorruptionTools = new ManageCorruptionTools({ foundryClient, logger });

  const manageMutationTools = new ManageMutationTools({ foundryClient, logger });

  const manageCriticalWoundTool = new ManageCriticalWoundTool(foundryClient, logger);
  const rollCriticalWoundTool = new RollCriticalWoundTool(foundryClient, logger);

  const manageDiseaseTool = new ManageDiseaseTool(foundryClient, logger);

  const manageInventoryTool = new ManageInventoryTool(foundryClient, logger);

  const createItemTool = new CreateItemTool(foundryClient, logger);

  const manageDivineMagicTool = new ManageDivineMagicTool(foundryClient, logger);

  const manageArcaneMagicTool = new ManageArcaneMagicTool(foundryClient, logger);

  const manageNPCGenerationTool = new ManageNPCGenerationTool(foundryClient, logger);

  const compendiumTools = new CompendiumTools({ foundryClient, logger });

  const sceneTools = new SceneTools({ foundryClient, logger });

  const actorCreationTools = new ActorCreationTools({ foundryClient, logger });

  const manageJournalTool = new ManageJournalTool(foundryClient, logger);

  const diceRollTools = new DiceRollTools({ foundryClient, logger });

  const ownershipTool = new OwnershipTool(foundryClient, logger);

  const rollTableTool = new RollTableTool(foundryClient, logger);

  const manageCombatTools = new ManageCombatTools({ foundryClient, logger });

  const applyDamageTool = new ApplyDamageTool({ foundryClient, logger });

  const manageConditionsTools = new ManageConditionsTools({ foundryClient, logger });

  const listActiveEffectsTool = new ListActiveEffectsTool({ foundryClient, logger });

  const updateActorTool = new UpdateActorTool({ foundryClient, logger });
  const updateItemTool = new UpdateItemTool({ foundryClient, logger });
  const getWfrpConfigTool = new GetWfrpConfigTool({ foundryClient, logger });

  const allTools = [

    ...characterTools.getToolDefinitions(),
    ...manageCharacterTool.getToolDefinitions(),

    ...manageCorruptionTools.getToolDefinitions(),

    ...manageMutationTools.getToolDefinitions(),

    ...manageCriticalWoundTool.getToolDefinitions(),
    ...rollCriticalWoundTool.getToolDefinitions(),

    ...manageDiseaseTool.getToolDefinitions(),

    ...manageInventoryTool.getToolDefinitions(),

    ...createItemTool.getToolDefinitions(),

    ...manageDivineMagicTool.getToolDefinitions(),

    ...manageArcaneMagicTool.getToolDefinitions(),

    ...manageNPCGenerationTool.getToolDefinitions(),

    ...compendiumTools.getToolDefinitions(),

    ...sceneTools.getToolDefinitions(),

    ...actorCreationTools.getToolDefinitions(),

    ...manageJournalTool.getToolDefinitions(),

    ...diceRollTools.getToolDefinitions(),

    ...ownershipTool.getToolDefinitions(),

    ...rollTableTool.getToolDefinitions(),

    ...manageCombatTools.getToolDefinitions(),

    ...applyDamageTool.getToolDefinitions(),

    ...manageConditionsTools.getToolDefinitions(),

    ...listActiveEffectsTool.getToolDefinitions(),

    ...updateActorTool.getToolDefinitions(),

    ...updateItemTool.getToolDefinitions(),

    ...getWfrpConfigTool.getToolDefinitions(),

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

            const { name, args } = (msg.params || {}) as { name: string; args?: any };

            try {

              let result: any;

              switch (name) {

                // Character tools

                case 'get-character':

                  result = await characterTools.handleGetCharacter(args);

                  break;

                case 'list-characters':

                  result = await characterTools.handleListCharacters(args);

                  break;

                // Character management (consolidated)

                case 'manage-character':

                  result = await manageCharacterTool.handle(args);

                  break;

                // Corruption & Mutation tools (consolidated)

                case 'manage-corruption':

                  result = await manageCorruptionTools.handle(args);

                  break;

                case 'manage-mutation':

                  result = await manageMutationTools.handle(args);

                  break;

                // Critical Wounds tools (consolidated)

                case 'manage-critical-wound':

                  result = await manageCriticalWoundTool.handle(args);

                  break;

                case 'roll-critical-wound':

                  result = await rollCriticalWoundTool.handle(args);

                  break;

                // Disease & Infection tools (consolidated)

                case 'manage-disease':

                  result = await manageDiseaseTool.handle(args);

                  break;

                // Inventory Management tools (consolidated)

                case 'manage-inventory':

                  result = await manageInventoryTool.handle(args);

                  break;

                // Item Creator tools (consolidated)

                case 'create-item':

                  result = await createItemTool.handle(args);

                  break;

                // Divine Magic tool (consolidated)

                case 'manage-divine-magic':

                  result = await manageDivineMagicTool.execute(args);

                  break;

                // Arcane Magic tool (consolidated)

                case 'manage-arcane-magic':

                  result = await manageArcaneMagicTool.execute(args);

                  break;

                // NPC Generation tool (consolidated)

                case 'manage-npc-generation':

                  result = await manageNPCGenerationTool.execute(args);

                  break;

                // Compendium tools

                case 'search-compendium':

                  result = await compendiumTools.handleSearchCompendium(args);

                  break;

                case 'get-compendium-item':

                  result = await compendiumTools.handleGetCompendiumItem(args);

                  break;

                case 'list-creatures-by-criteria':

                  result = await compendiumTools.handleListCreaturesByCriteria(args);

                  break;

                case 'list-compendium-packs':

                  result = await compendiumTools.handleListCompendiumPacks(args);

                  break;

                // Scene tools

                case 'get-current-scene':

                  result = await sceneTools.handleGetCurrentScene(args);

                  break;

                case 'get-world-info':

                  result = await sceneTools.handleGetWorldInfo(args);

                  break;

                // Actor creation tools

                case 'create-actor-from-compendium':

                  result = await actorCreationTools.handleCreateActorFromCompendium(args);

                  break;

                case 'get-compendium-entry-full':

                  result = await actorCreationTools.handleGetCompendiumEntryFull(args);

                  break;

                // Journal tool (consolidated)

                case 'manage-journal':

                  result = await manageJournalTool.execute(args);

                  break;

                // Dice roll tools

                case 'request-player-rolls':

                  result = await diceRollTools.handleRequestPlayerRolls(args);

                  break;

                // Ownership tool (consolidated)

                case 'ownership':

                  result = await ownershipTool.execute(args);

                  break;

                case 'list-scenes':

                  result = await sceneTools.listScenes(args);

                  break;

                case 'switch-scene':

                  result = await sceneTools.switchScene(args);

                  break;

                // Roll Table tool (consolidated)

                case 'rolltable':

                  result = await rollTableTool.execute(args);

                  break;

                // Combat tools (Phase 4b — 6 queries)

                case 'get-combat':

                  result = await manageCombatTools.handleGetCombat(args);

                  break;

                case 'list-combatants':

                  result = await manageCombatTools.handleListCombatants(args);

                  break;

                case 'advance-combat':

                  result = await manageCombatTools.handleAdvanceCombat(args);

                  break;

                case 'add-combatants':

                  result = await manageCombatTools.handleAddCombatants(args);

                  break;

                case 'remove-combatants':

                  result = await manageCombatTools.handleRemoveCombatants(args);

                  break;

                case 'end-combat':

                  result = await manageCombatTools.handleEndCombat(args);

                  break;

                // Damage tool (Phase 4b)

                case 'apply-damage':

                  result = await applyDamageTool.handle(args);

                  break;

                // Condition tools (Phase 4b — 3 queries)

                case 'apply-condition':

                  result = await manageConditionsTools.handleApplyCondition(args);

                  break;

                case 'remove-condition':

                  result = await manageConditionsTools.handleRemoveCondition(args);

                  break;

                case 'list-conditions':

                  result = await manageConditionsTools.handleListConditions(args);

                  break;

                // Active effects tool (Phase 4b)

                case 'list-active-effects':

                  result = await listActiveEffectsTool.handle(args);

                  break;

                // Phase 4c.0 — primitives for skill-side rule composition
                case 'update-actor':

                  result = await updateActorTool.handle(args);

                  break;

                case 'update-item':

                  result = await updateItemTool.handle(args);

                  break;

                case 'get-wfrp-config':

                  result = await getWfrpConfigTool.handle(args);

                  break;

                default:

                  throw new Error(`Unknown tool: ${name}`);

              }

              const payload = {

                content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }],

              };

              socket.write(JSON.stringify({ id: msg.id, result: payload }) + '\n');

            } catch (e: any) {

              const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';

              socket.write(

                JSON.stringify({ id: msg.id, result: { content: [{ type: 'text', text: `Error: ${errorMessage}` }], isError: true } }) + '\n'

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
