import { buildTools } from './tools/factory/build-tools.js';
import * as fs from 'fs';

import * as os from 'os';

import * as path from 'path';

import * as net from 'net';


import { config } from './config.js';

import { Logger } from './logger.js';

import { FoundryClient } from './foundry-client.js';

import { scrubError } from './utils/scrub-error.js';
import { ToolRegistry } from './tool-registry.js';




// Phase 4 mcp_crud_expansion — single `scene` umbrella tool (11 actions)
// replaces SceneTools (5 legacy tools) + AddActorsToSceneTool + DeleteTokenTool.
// get-world-info extracted to a sibling `world` tool.










// Phase 4 mcp_crud_expansion — AddActorsToSceneTool + DeleteTokenTool folded
// into the scene umbrella (actions: 'add-tokens' / 'delete-token').
// TOOL-IDEA-003 (2026-05-14): read-only AE-by-name resolver.
// Phase 1 mcp_diagnostic_tool — read-only diagnostic umbrella (3 actions in v1).
// Phase 5 mcp_crud_expansion — 7 per-doc-type embedded-CRUD umbrellas.
// Phase 7 mcp_crud_expansion — Playlist + PlaylistSound umbrella (10 actions).
// Phase 9 mcp_crud_expansion — Compendium umbrella (10 actions: 6 pack/doc CRU + 4 in-pack folder; NO pack/document DELETE per HC3).
// Coexists with the existing flat read-only CompendiumTools (D10 — back-compat).
// Phase 10 mcp_crud_expansion — Cross-doc FK audit + repair umbrella (3 actions; closes PRD).
// Phase 5 mcp_coverage_expansion — drawing umbrella (CRUD + list + duplicate).
// Phase 7 mcp_coverage_expansion — cards umbrella (stack + embedded-card CRUD + gameplay verbs).
// Phase 8 mcp_coverage_expansion — document-io umbrella (export/import-as-new/preview over 8 world doc types).
// Phase 6.1 mcp_crud_expansion — FilePicker umbrella tool with Node-side auto-conversion.
// Phase wfrp-disease — Disease umbrella tool (8 actions).
// Phase 4 mcp_completion_v1 — Folder umbrella (6 actions; delete confirm + deleteContents cascade).
// Phase 4 mcp_completion_v1 — Setting umbrella (4 actions; force gate + blocklist + onChange-advisory).
// Phase 5 mcp_completion_v1 — ChatMessage umbrella (5 actions; delete confirm; rollMode resolution; rolls-immutability).
// Phase 1 mcp_coverage_expansion — item-directory umbrella (5 actions: list/get/search/duplicate/import-from-compendium).
// Phase 1 mcp_coverage_expansion — actor-config umbrella (4 actions: get/update-prototype-token + get/set-art).
// Phase 3 mcp_coverage_expansion — combatant umbrella (7 per-combatant actions).
// Phase 1 module_integration_v1 — always-registered module-probe + conditional module-matt stub.
// Phase 5 module_integration_v1 — conditional module-tagger + module-sequencer umbrellas.
// Phase 4 module_integration_v1 — conditional module-levels umbrella.
// Phase 8 module_integration_v1 — conditional module-autoanimations umbrella.
// Phase 9 module_integration_v1 — WFRP mechanic delegates: module-robak + module-tokenbar (conditional).
// Phase 10 module_integration_v1 — module-armoury (Forien's Armoury, conditional).
// Phase 11 module_integration_v1 — module-party-resources + module-gmtoolkit (conditional).
// Phase 12 module_integration_v1 — module-chat-commander (_chatcommands conditional).
// Phase 14 module_integration_v1 — thin-session modules (conditional).
// Phase 6 module_integration_v1 — conditional module-scene-atmosphere bundle umbrella.
// Phase 7 module_integration_v1 — conditional module-access-control bundle umbrella (LocknKey + LockView).
// Phase 13A module_integration_v1 — conditional module-css umbrella.
// Phase 15 module_integration_v1 — conditional module-lighting umbrella (CommunityLighting).
// Phase 3 module_integration_v1 — conditional module-itempiles umbrella (Item Piles economy surface).
// BUG-107: extracted to side-effect-free module so test imports don't boot backend.
import { coerceArgsBySchema } from './coerce-args.js';

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

  const allToolInstances = buildTools({ foundryClient, logger });

  const registry = new ToolRegistry();
  // Phase 8 (R8.2): declarative single-loop registration — replaces the former 94 hardcoded
  // registry.register(...) literals. Each tool contributes its own (name, handler) pairs.
  for (const tool of allToolInstances) {
    for (const { name, handler } of tool.getRegistration()) {
      registry.register(name, handler);
    }
  }

  // Phase 8 (R8.2): tool definitions assembled by flatMap over the same instances; order is
  // preserved from build-tools.ts so the tools/list response stays byte-identical (HC8).
  const allTools = allToolInstances.flatMap((tool) => tool.getToolDefinitions());

  // Start Foundry connector (owns app port 31415)

  foundryClient.connect().catch((e) => {

    logger.error('Foundry connector failed to start', e);

  });

  // Control channel (TCP JSON-lines)

  const server = net.createServer((socket) => {

    socket.setEncoding('utf8');

    let buffer = '';

    const writeResponse = (payload: unknown): boolean => {
      if (socket.destroyed || !socket.writable) {
        return false;
      }

      try {
        socket.write(JSON.stringify(payload) + '\n');
        return true;
      } catch (e: any) {
        logger.debug('Backend control socket write failed', {
          code: e?.code,
          error: e?.message || String(e),
        });
        return false;
      }
    };

    socket.on('error', (e: NodeJS.ErrnoException) => {
      const meta = { code: e.code, error: e.message };
      if (e.code === 'ECONNRESET' || e.code === 'EPIPE') {
        logger.debug('Backend control socket closed unexpectedly', meta);
      } else {
        logger.warn('Backend control socket error', meta);
      }
    });

    socket.on('close', () => {
      buffer = '';
    });

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

            writeResponse({ id: msg.id, result: { ok: true } });

            continue;

          }

          if (msg.method === 'list_tools') {

            writeResponse({ id: msg.id, result: { tools: allTools } });

            continue;

          }

          if (msg.method === 'call_tool') {

            const { name, args: rawArgs } = (msg.params || {}) as { name: string; args?: any };

            const toolDef = allTools.find((t: any) => t.name === name);
            const args = coerceArgsBySchema((toolDef as any)?.inputSchema, rawArgs);

            try {

              const dispatchP = registry.dispatch(name, args);
              if (!dispatchP) {
                writeResponse({ id: msg.id, error: { code: -32602, message: `Unknown tool: ${name}` } });
                continue;
              }
              const result = await dispatchP;
              let payload: any;
              if (result && typeof result === 'object' && 'structuredContent' in result && 'content' in result) {
                payload = result;
              } else {
                payload = { content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }] };
              }
              writeResponse({ id: msg.id, result: payload });

            } catch (e: any) {

              logger.error('Tool dispatch threw', { name, error: scrubError(e) });
              writeResponse({ id: msg.id, result: { content: [{ type: 'text', text: `Error: ${scrubError(e)}` }], isError: true } });

            }

            continue;

          }

          // Unknown method

          writeResponse({ id: msg.id, error: { message: 'Unknown method' } });

        } catch (e: any) {

          // BUG-315: include id when it could be salvaged so the client can dispatch the error
          let salvageId: string | null = null;
          try { salvageId = (JSON.parse(line) as any)?.id ?? null; } catch { /* wholly unparseable */ }
          writeResponse({ id: salvageId, error: { message: e?.message || 'Bad request' } });

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

void (async function main() {

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
