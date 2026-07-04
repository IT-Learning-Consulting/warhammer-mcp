import { MODULE_ID } from './constants.js';
import { MODULE_WARHAMMER_MCP } from './constants/socketEvents.js';
import { SocketBridge } from './socket-bridge.js';
import { QueryHandlers } from './queries.js';
import { ModuleSettings } from './settings.js';
import { runHealthCheck, captureInitError, installRuntimeCapture } from './health-check.js';
import { notify } from './notify.js';
import { registerRollRelayHook } from './hooks/createChatMessage-roll-relay.js';
import { registerMcpDialogChimeHook } from './hooks/mcp-dialog-chime.js';
import { registerMcpDialogAutoResolve } from './mcp-dialog-autoresolve.js';
// Phase 4.3 (R4.2): per-message AbortController registry for the roll-button listener-leak fix.
import { bindMessageController, releaseMessageController } from './utils/message-lifecycle.js';
// Phase 10 (R10.1): generic per-owner lifecycle registry — owns the Hooks.on/off + socket on/off
// pairing for every persistent listener below, with teardownAll() wired into cleanup().
import * as lifecycle from './utils/lifecycle.js';
// Connection control now handled through settings menu

// Phase 10 (R10.1): the 2-minute post-ready health-check banner timer (T-03). Stored at module scope
// so cleanup() can cancel it — previously unstored, it could fire after the world was torn down.
let healthCheckTimer: ReturnType<typeof setTimeout> | undefined;

// CORE-13 (mcp_code_quality_v2 Phase C2) — shared disease-contraction apply, previously duplicated
// byte-identically between the `wfrpContractDisease` socket-message handler (GM-received relay) and
// `runWfrpTestAction`'s `contractDisease` case's local-apply branch (GM client, or no GM online
// fallback). Both call sites embed the disease Item then gmroll-whisper a "contracted" note —
// wfrp4e's _onCreate auto-starts incubation. Returns true if applied (src resolved), false otherwise.
async function applyDiseaseContraction(
  actor: any,
  uuid: string,
  name: string | undefined,
  alias: string | undefined,
  g: any,
): Promise<boolean> {
  const src = await g.fromUuid(uuid);
  if (!actor || !src) return false;
  await actor.createEmbeddedDocuments('Item', [src.toObject()]);
  const gmIds = g.game.users?.filter((u: any) => u.isGM).map((u: any) => u.id) ?? [];
  await g.ChatMessage.create({
    speaker: { alias: alias || 'Disease' },
    whisper: gmIds,
    content: `<div class="grim-gmnote"><b>${actor.name}</b> has <b>contracted ${name || src.name}</b>.</div>`,
  });
  return true;
}

/**
 * Main Foundry MCP Bridge Module Class
 */
class FoundryMCPBridge {
  private settings: ModuleSettings;
  private queryHandlers: QueryHandlers;
  private socketBridge: SocketBridge | null = null;
  private isInitialized = false;
  private heartbeatInterval: number | null = null;
  private lastActivity: Date = new Date();
  private isConnecting = false;
  // BUG-282: heartbeat restart budget. Each restart() builds a fresh
  // SocketBridge whose own attempt counter starts at 0, so the bridge-level
  // cap alone can never terminate. This counter survives bridge replacement;
  // when exhausted the heartbeat stops auto-restarting until a successful
  // connect (or manual start) resets it.
  private consecutiveRestartFailures = 0;
  private reconnectBudgetExhausted = false;
  private static readonly MAX_HEARTBEAT_RESTART_FAILURES = 5;

  constructor() {
    this.settings = new ModuleSettings();
    this.queryHandlers = new QueryHandlers();
  }

  /**
   * Check if current user is a GM (silent check for security)
   */
  private isGMUser(): boolean {
    return game.user?.isGM || false;
  }

  /**
   * Initialize the module during Foundry's init hook
   */
  async initialize(): Promise<void> {
    try {
      console.log(`[${MODULE_ID}] Initializing Warhammer MCP...`);

      // Register module settings
      try {
        this.settings.registerSettings();
      } catch (e) {
        captureInitError('settings-register', e);
        throw e;
      }

      // Register health-check client/world settings (HC10 self-diagnostic)
      try {
        game.settings.register(MODULE_ID, 'healthCheckDelayMs', {
          name: 'Health check delay (ms)',
          hint: 'Time after Foundry ready event to post the MCP self-diagnostic summary. Default 120000 (2 min). Set 0 to disable.',
          scope: 'client',
          config: true,
          type: Number,
          default: 120000,
          range: { min: 0, max: 600000, step: 5000 },
        });
        game.settings.register(MODULE_ID, 'expectedQueryCount', {
          name: 'Expected query count (health check)',
          hint: 'If > 0, self-diagnostic warns when fewer queries are registered. Default 40 (current Phase 4 in-flight count). Will raise to 51 when Phase 4 final sub-plan closes. Set 0 to skip.',
          scope: 'world',
          config: true,
          type: Number,
          default: 40,
        });
      } catch (e) {
        captureInitError('healthcheck-settings-register', e);
      }

      // Phase 6.1 mcp_crud_expansion — FilePicker default-converted-folder target.
      // Tier 2 of caller-passed → world-setting → hard-default fallback chain
      // (phase6_filepicker_design.md §e). When blank, foundry-module's uploadFile
      // handler falls through to `worlds/${game.world.id}/assets/converted/`.
      try {
        game.settings.register(MODULE_ID, 'default-converted-folder', {
          name: 'Default converted-asset folder',
          hint: 'Where filepicker.upload writes converted media when no target is specified. Leave blank to use worlds/<activeWorld>/assets/converted/.',
          scope: 'world',
          config: true,
          type: String,
          default: '',
        });
      } catch (e) {
        captureInitError('default-converted-folder-register', e);
      }

      // HC1 / BUG-019: Hard system-id guard. Non-wfrp4e worlds register zero handlers.
      const systemId = (game as any).system?.id;
      if (systemId !== 'wfrp4e') {
        console.log(`[${MODULE_ID}] Module requires wfrp4e system; detected ${systemId ?? 'unknown'}. Module inactive.`);
        this.isInitialized = false;
        return;
      }

      // Register query handlers
      try {
        this.queryHandlers.registerHandlers();
      } catch (e) {
        captureInitError('queryhandlers-register', e);
        throw e;
      }

      // Expose data access globally for settings UI
      (window as any).foundryMCPBridge.dataAccess = this.queryHandlers.dataAccess;
      // Phase 4 (R3.3): expose the creature index for the Settings-UI rebuild button + ready-hook build
      // (the rebuild wrapper left FoundryDataAccess for PersistentCreatureIndex.rebuildEnhancedIndex()).
      (window as any).foundryMCPBridge.creatureIndex = this.queryHandlers.creatureIndex;
      // Expose emitRollEvent for data-access roll-result relay.
      (window as any).foundryMCPBridge.emitRollEvent = (requestId: string, payload: any) =>
        this.socketBridge?.emitRollEvent(requestId, payload);

      this.isInitialized = true;
      notify.lifecycle('init', 'Warhammer MCP initialized');
      console.log(`[${MODULE_ID}] Module initialized successfully`);

    } catch (error) {
      console.error(`[${MODULE_ID}] Failed to initialize:`, error);
      notify.error('Failed to initialize Warhammer MCP');
      throw error;
    }
  }

  /**
   * Start the module after Foundry is ready
   */
  async onReady(): Promise<void> {
    try {
      // SECURITY: Silent GM-only check - non-GM users get no access and no messages
      if (!this.isGMUser()) {
        console.log(`[${MODULE_ID}] Module ready (user access restricted)`);
        return;
      }

      console.log(`[${MODULE_ID}] Foundry ready, checking bridge status...`);

      // Connection control now handled through settings menu

      // Validate settings
      const validation = this.settings.validateSettings();
      if (!validation.valid) {
        console.warn(`[${MODULE_ID}] Invalid settings:`, validation.errors);
        notify.warn(`MCP Bridge settings validation failed: ${validation.errors.join(', ')}`);
        // BUG-292: skip start() on validation failure so the GM sees one coherent
        // warning instead of a warn followed immediately by a thrown error from start().
        return;
      }

      // Auto-connect when enabled (always automatic)
      const enabled = this.settings.getSetting('enabled');

      if (enabled) {
        await this.start();
      }

      // Auto-build enhanced creature index if enabled and not exists
      await this.checkAndBuildEnhancedIndex();

      console.log(`[${MODULE_ID}] Module ready`);

    } catch (error) {
      console.error(`[${MODULE_ID}] Failed during ready:`, error);
    }
  }

  /**
   * Check if enhanced creature index exists and build if needed (better UX)
   */
  private async checkAndBuildEnhancedIndex(): Promise<void> {
    try {
      // Only for GM users
      if (!this.isGMUser()) return;

      // Check if enhanced index is enabled
      const enhancedIndexEnabled = this.settings.getSetting('enableEnhancedCreatureIndex');
      if (!enhancedIndexEnabled) return;

      // Check if index file exists
      const indexFilename = 'enhanced-creature-index.json';
      try {
        const browseResult = await (foundry as any).applications.apps.FilePicker.implementation.browse('data', `worlds/${game.world.id}`);
        const indexExists = browseResult.files.some((f: any) => f.endsWith(indexFilename));

        if (!indexExists) {
          console.log(`[${MODULE_ID}] Enhanced creature index not found, building automatically for better UX...`);
          notify.info('Building enhanced creature index for faster searches...');

          // Trigger index build through the creature index (Phase 4 R3.3)
          if (this.queryHandlers?.creatureIndex?.rebuildEnhancedIndex) {
            await this.queryHandlers.creatureIndex.rebuildEnhancedIndex();
          }
        } else {
          console.log(`[${MODULE_ID}] Enhanced creature index exists, ready for instant searches`);
        }
      } catch (error) {
        // World directory might not exist yet, that's okay
        console.log(`[${MODULE_ID}] Could not check for enhanced index file (world directory may not exist yet)`);
      }
    } catch (error) {
      console.warn(`[${MODULE_ID}] Failed to auto-build enhanced index:`, error);
    }
  }

  /**
   * Start the MCP bridge connection
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module not initialized');
    }

    // SECURITY: Double-check GM access (safety measure)
    if (!this.isGMUser()) {
      console.warn(`[${MODULE_ID}] Attempted to start bridge without GM access`);
      return;
    }

    if (this.socketBridge?.isConnected() || this.isConnecting) {
      console.log(`[${MODULE_ID}] Bridge already running or connecting`);
      return;
    }

    this.isConnecting = true;

    try {
      console.log(`[${MODULE_ID}] Starting Warhammer MCP...`);

      const config = this.settings.getBridgeConfig();

      // Validate configuration
      const validation = this.settings.validateSettings();
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      // Create and connect socket bridge
      this.socketBridge = new SocketBridge(config);
      await this.socketBridge.connect();

      await this.settings.setSetting('lastConnectionState', 'connected');
      await this.settings.setSetting('lastActivity', new Date().toISOString());
      this.updateLastActivity();

      // Update settings display with connection status
      this.settings.updateConnectionStatusDisplay(true, this.queryHandlers.getRegisteredMethods().length);

      console.log(`[${MODULE_ID}] Bridge started successfully`);

      // Start heartbeat monitoring if enabled
      this.startHeartbeat();

      // Connection lifecycle — sticky toast + GM-whispered chat audit via notify.
      notify.lifecycle('connection-up', 'Warhammer MCP connected successfully');
      console.log(`[${MODULE_ID}] GM connection established - Bridge active for user: ${game.user?.name}`);

      // BUG-282: a successful connect refunds the heartbeat restart budget.
      this.consecutiveRestartFailures = 0;
      this.reconnectBudgetExhausted = false;

    } catch (error) {
      // Log as warning instead of error for initial connection failures
      console.warn(`[${MODULE_ID}] Failed to start bridge:`, error);

      // Show helpful message for GM users when MCP server isn't available
      if (this.isGMUser()) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if it's a connection refusal (MCP server not running)
        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect ECONNREFUSED')) {
          // Only show this notification if it's been more than 30 seconds since last shown
          const lastShown = this.settings.getSetting('lastMCPServerNotification') as string;
          const now = new Date().getTime();
          const thirtySecondsAgo = now - (30 * 1000);

          if (!lastShown || new Date(lastShown).getTime() < thirtySecondsAgo) {
            notify.warn(
              'MCP Server not found. Install it from https://github.com/adambdooley/foundry-vtt-mcp',
              { sticky: true },
            );

            // Remember when we showed this notification
            this.settings.setSetting('lastMCPServerNotification', new Date().toISOString()).catch(() => {
              // Ignore settings save errors during startup
            });
          }
        }
      }

      await this.settings.setSetting('lastConnectionState', 'error');
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Stop the MCP bridge connection
   */
  async stop(): Promise<void> {
    if (!this.socketBridge) {
      console.log(`[${MODULE_ID}] Bridge not running`);
      return;
    }

    try {
      console.log(`[${MODULE_ID}] Stopping Warhammer MCP...`);

      // Stop heartbeat monitoring
      this.stopHeartbeat();

      this.socketBridge.disconnect();
      this.socketBridge = null;

      await this.settings.setSetting('lastConnectionState', 'disconnected');

      // Update settings display with disconnected status
      this.settings.updateConnectionStatusDisplay(false, 0);

      console.log(`[${MODULE_ID}] Bridge stopped`);

      // Connection lifecycle — sticky toast + GM-whispered chat audit via notify.
      notify.lifecycle('connection-down', 'Warhammer MCP disconnected');

    } catch (error) {
      console.error(`[${MODULE_ID}] Error stopping bridge:`, error);
    }
  }

  /**
   * Restart the bridge with current settings
   */
  async restart(): Promise<void> {
    console.log(`[${MODULE_ID}] Restarting bridge...`);

    await this.stop();

    // Small delay to ensure clean disconnect
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.settings.getSetting('enabled')) {
      await this.start();
    }
  }

  /**
   * Get current bridge status
   */
  getStatus(): any {
    return {
      initialized: this.isInitialized,
      enabled: this.settings.getSetting('enabled'),
      connected: this.socketBridge?.isConnected() ?? false,
      connectionState: this.socketBridge?.getConnectionState() ?? 'disconnected',
      connectionInfo: this.socketBridge?.getConnectionInfo(),
      settings: this.settings.getAllSettings(),
      registeredMethods: this.queryHandlers.getRegisteredMethods(),
      lastConnectionState: this.settings.getSetting('lastConnectionState'),
      lastActivity: this.lastActivity.toISOString(),
      heartbeatActive: this.heartbeatInterval !== null,
    };
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Ensure no duplicate intervals

    const interval = this.settings.getSetting('heartbeatInterval') * 1000; // Convert to milliseconds

    this.heartbeatInterval = window.setInterval(async () => {
      await this.performHeartbeat();
    }, interval);

    console.log(`[${MODULE_ID}] Heartbeat monitoring started (${interval}ms interval)`);
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log(`[${MODULE_ID}] Heartbeat monitoring stopped`);
    }
  }

  /**
   * Perform heartbeat check
   */
  private async performHeartbeat(): Promise<void> {
    try {
      // Lightweight connection check - just verify socket state
      if (!this.socketBridge || !this.socketBridge.isConnected()) {
        const intervalMs = (this.settings.getSetting('heartbeatInterval') as number) * 1000;
        // R1.8 part 2 — parameterize threshold to 2x heartbeat interval.
        // Default settings.heartbeatInterval=30s -> 60000ms (preserves prior behavior).
        const threshold = (intervalMs && intervalMs > 0) ? intervalMs * 2 : 60000;
        // Only log once per disconnection to avoid spam
        if (this.lastActivity && new Date().getTime() - this.lastActivity.getTime() > threshold) {
          console.warn(`[${MODULE_ID}] Heartbeat: Connection lost — MCP heartbeat timeout, connection may be lost`);

          // Attempt auto-reconnection if enabled (with backoff)
          if (this.settings.getSetting('autoReconnectEnabled')) {
            // BUG-282: respect the cross-restart failure budget. Without it,
            // every heartbeat tick spawned a fresh SocketBridge with a reset
            // attempt counter — an unbounded reconnect loop while the MCP
            // server is down.
            if (this.reconnectBudgetExhausted) {
              return;
            }
            if (this.consecutiveRestartFailures >= FoundryMCPBridge.MAX_HEARTBEAT_RESTART_FAILURES) {
              this.reconnectBudgetExhausted = true;
              notify.lifecycle(
                'connection-down',
                `MCP auto-reconnect paused after ${FoundryMCPBridge.MAX_HEARTBEAT_RESTART_FAILURES} failed attempts — reconnect manually from module settings once the MCP server is back`,
              );
              return;
            }
            console.log(`[${MODULE_ID}] Attempting auto-reconnection (${this.consecutiveRestartFailures + 1}/${FoundryMCPBridge.MAX_HEARTBEAT_RESTART_FAILURES})...`);
            try {
              await this.restart();
            } catch (restartError) {
              this.consecutiveRestartFailures++;
              console.warn(`[${MODULE_ID}] Auto-reconnection attempt failed:`, restartError);
            }
          } else {
            // R1.7 — autoReconnect off: there is no other code path to inform
            // the GM. Fire lifecycle here so the disconnect is never silent.
            notify.lifecycle(
              'connection-down',
              'MCP heartbeat timeout - connection may be lost',
            );
          }
        }
        return;
      }

      // Just update activity timestamp - no actual network ping needed
      // The socket bridge already handles connection state monitoring
      this.updateLastActivity();

    } catch (error) {
      // BUG-284: never punish an in-flight connect. restart() → start()
      // silently bails when isConnecting is true, so the old code could
      // permanently disable autoReconnectEnabled without ever attempting
      // a reconnect.
      if (this.isConnecting) {
        console.log(`[${MODULE_ID}] Heartbeat exception while a connect is in flight — skipping restart`, error);
        return;
      }
      // Only attempt reconnect once per failure cycle
      if (this.settings.getSetting('autoReconnectEnabled')) {
        console.log(`[${MODULE_ID}] Heartbeat failure - attempting single reconnection...`);
        try {
          await this.restart();
        } catch (reconnectError) {
          // BUG-282: count against the restart budget instead of permanently
          // flipping the autoReconnectEnabled setting (which required the GM
          // to find and re-toggle it). The budget pauses retries and a
          // successful connect refunds it.
          this.consecutiveRestartFailures++;
          console.error(`[${MODULE_ID}] Auto-reconnection failed:`, reconnectError);
        }
      }
    }
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    this.lastActivity = new Date();
    void this.settings.setSetting('lastActivity', this.lastActivity.toISOString());
  }

  /**
   * Get query handlers for campaign hooks
   */
  getQueryHandlers(): QueryHandlers {
    return this.queryHandlers;
  }

  /**
   * Connection control is now handled through the settings menu
   */

  /**
   * Cleanup when module is disabled or world is closed
   */
  async cleanup(): Promise<void> {
    console.log(`[${MODULE_ID}] Cleaning up...`);

    await this.stop();
    this.queryHandlers.unregisterHandlers();

    // Phase 10 (R10.1): cancel the post-ready health-check banner timer (T-03) and abort every
    // owner controller so all persistent hooks / socket / window listeners deregister. Done here
    // (not in stop()) because stop() early-returns when the bridge isn't running, and because
    // restart() routes through stop() — clearing T-03 there would cancel the banner on every
    // reconnect rather than only on teardown.
    if (healthCheckTimer !== undefined) {
      clearTimeout(healthCheckTimer);
      healthCheckTimer = undefined;
    }
    lifecycle.teardownAll();

    console.log(`[${MODULE_ID}] Cleanup complete`);
  }

}

// Create global instance
const foundryMCPBridge = new FoundryMCPBridge();

// Make it available globally for settings callbacks
(window as any).foundryMCPBridge = foundryMCPBridge;

// Foundry VTT Hooks
Hooks.once('init', async () => {
  // Phase 1 mcp_diagnostic_tool — install runtime error/warning capture as
  // early as possible so even initialize() failures land in the buffer. Wrap
  // in try/catch so a defect in the installer doesn't kill module init
  // (Phase 1 Risk: capture surface itself failing). Capture is OPT-IN to
  // READ (handlers/diagnostic.ts gates on enableDiagnosticTools), but
  // installation is unconditional — turning the setting on mid-session
  // should immediately have history.
  try {
    installRuntimeCapture();
  } catch (e) {
    captureInitError('installRuntimeCapture', e);
  }

  try {
    await foundryMCPBridge.initialize();
  } catch (error) {
    console.error(`[${MODULE_ID}] Initialization failed:`, error);
  }
});

// Register debug flag with the _dev-mode community module (if installed).
// Lets devs toggle our verbose console output via the _dev-mode panel; falls
// back to localStorage.warhammer_mcp_verbose / world setting mcpVerboseConsole.
(Hooks as any).once?.('devModeReady', ({ registerPackageDebugFlag }: { registerPackageDebugFlag: (id: string) => void }) => {
  try {
    registerPackageDebugFlag(MODULE_ID);
  } catch (e) {
    console.warn(`[${MODULE_ID}] _dev-mode registration failed:`, e);
  }
});

Hooks.once('ready', async () => {
  try {
    // Chromium >=123 check — notify.ts uses `light-dark(oklch(...))` which
    // requires Chromium 123+ (shipped 2024). Foundry v13's Electron meets this
    // in practice. Warn (not fail) if below so console colors still degrade
    // gracefully.
    try {
      const ua = (typeof navigator !== 'undefined' && navigator?.userAgent) || '';
      const m = /Chrome\/(\d+)/.exec(ua);
      const chromiumMajor = m ? parseInt(m[1]!, 10) : 0;
      if (chromiumMajor && chromiumMajor < 123) {
        console.warn(`[${MODULE_ID}] Chromium ${chromiumMajor} detected — notify.ts console colors require Chromium 123+ for full theme-safe rendering. Colors will degrade gracefully.`);
      }
    } catch (e) {
      // Non-fatal — version detection failed.
    }

    await foundryMCPBridge.onReady();

    // Schedule the 2-minute post-ready health-check banner.
    try {
      const delayMs = (game.settings.get(MODULE_ID, 'healthCheckDelayMs') as number) ?? 120000;
      const expectedRaw = game.settings.get(MODULE_ID, 'expectedQueryCount') as number;
      const expected = expectedRaw && expectedRaw > 0 ? expectedRaw : undefined;
      if (delayMs > 0) {
        healthCheckTimer = setTimeout(() => {
          try {
            const result = runHealthCheck(expected);
            // R1.9 — surface HC10 outcome to the GM via notify channel.
            if (!result.ok) {
              notify.warn(`Health check: ${result.issues.join('; ')}`, { sticky: true });
            } else {
              notify.info('MCP self-check OK');
            }
          } catch (e) {
            console.error(`[${MODULE_ID}] health-check itself threw:`, e);
          }
        }, delayMs);
      }
    } catch (e) {
      captureInitError('ready-hook-health-check-schedule', e);
    }

    // Register socket listener for roll state management (after game.user is available).
    // Phase 10 (R10.1): routed through lifecycle.registerSocket so cleanup()/teardownAll() calls
    // socket.off — previously this listener was never removed and survived reconnects.

    lifecycle.registerSocket('main', MODULE_WARHAMMER_MCP, async (data: any) => {

      try {
        // Handle ChatMessage update requests (GM only)
        if (data.type === 'requestMessageUpdate' && data.buttonId && data.messageId) {

          // Only GM can update ChatMessages for other users
          if (game.user?.isGM) {
            try {
              // Get the data access instance to update the message
              const queryHandlers = foundryMCPBridge['queryHandlers'] as any;
              if (queryHandlers && queryHandlers.dataAccess) {
                await queryHandlers.rollButton.updateRollButtonMessage(data.buttonId, data.userId, data.rollLabel);
              }
            } catch (error) {
              console.error(`[${MODULE_ID}] GM failed to update message:`, error);
              // Notify GM about the failure
              if (game.user?.isGM) {
                notify.error('Failed to update player roll message', error instanceof Error ? error : new Error('Unknown error'));
              }
            }
          } else {
          }
          return;
        }

        // Handle roll state save requests (GM only) - LEGACY
        if (data.type === 'requestRollStateSave' && data.buttonId && data.rollState) {

          // Only GM can save to world settings
          if (game.user?.isGM) {
            try {
              // Get the data access instance to save the roll state
              const queryHandlers = foundryMCPBridge['queryHandlers'] as any;
              if (queryHandlers && queryHandlers.dataAccess) {
                await queryHandlers.rollButton.saveRollState(data.buttonId, data.rollState.rolledBy);
              }
            } catch (error) {
              console.error(`[${MODULE_ID}] GM failed to save LEGACY roll state:`, error);
              // Notify GM about the failure so they can take action
              if (game.user?.isGM) {
                notify.error('Failed to save player roll state', error instanceof Error ? error : new Error('Unknown error'));
              }
            }
          } else {
          }
          return;
        }

        // Handle real-time roll state updates - LEGACY (now handled by ChatMessage.update())
        if (data.type === 'rollStateUpdate' && data.buttonId && data.rollState) {
          // No longer needed - ChatMessage.update() automatically syncs across all clients
        }

        // Contract a disease on a patient GM-side (routed from a player's wfrp-test-button click).
        // Applying it here means wfrp4e's incubation/duration cards and our "contracted" note are
        // authored by the GM and gmroll-whispered — the player never sees the disease outcome.
        if (data.type === 'wfrpContractDisease' && data.actorId && data.uuid) {
          if (game.user?.isGM && (game as any).users?.activeGM?.isSelf) {
            try {
              const g = globalThis as any;
              const actor = game.actors?.get(data.actorId);
              await applyDiseaseContraction(actor, data.uuid, data.name, data.alias, g);
            } catch (e) {
              console.error(`[${MODULE_ID}] wfrpContractDisease (GM) failed:`, e);
            }
          }
          return;
        }

        // Note: rollStateSaved confirmations removed - not needed since rollStateUpdate handles UI sync
      } catch (error) {
        console.error(`[${MODULE_ID}] Error handling socket message:`, error);
      }
    });

  } catch (error) {
    console.error(`[${MODULE_ID}] Ready failed:`, error);
  }
});

// Handle settings menu close to check for changes
lifecycle.registerHook('main', 'closeSettingsConfig', () => {
  try {
    const enabled = foundryMCPBridge.getStatus().enabled;
    const connected = foundryMCPBridge.getStatus().connected;

    if (enabled && !connected) {
      // Setting was enabled but not connected, try to start
      foundryMCPBridge.start().catch(error => {
        console.error(`[${MODULE_ID}] Failed to start after settings change:`, error);
      });
    } else if (!enabled && connected) {
      // Setting was disabled but still connected, stop
      foundryMCPBridge.stop().catch(error => {
        console.error(`[${MODULE_ID}] Failed to stop after settings change:`, error);
      });
    }
  } catch (error) {
    console.error(`[${MODULE_ID}] Error handling settings change:`, error);
  }
});

// Register roll-result relay for WFRP4e test messages (awaitResult round-trip).
registerRollRelayHook();

// Register audible chime for MCP-triggered blocking dialogs.
registerMcpDialogChimeHook();

// Register dialog auto-resolve net — suppresses blocking spec-choice dialogs during MCP requests.
registerMcpDialogAutoResolve();

// Generic WFRP4e chat "roll-and-react" button. Runs a real wfrp4e test (characteristic or skill)
// on the CLICKING user's character, then fires outcome-keyed actions. Lives in module code so it is
// present on every connected client and survives reloads (world-scripts only register at each
// client's own page-load, so they never reach already-connected players). Posted by world content
// (e.g. the tavern food-poisoning service).
//
// The <button class="wfrp-test-button"> carries ONE attribute, data-wfrp-test, holding a JSON spec:
//   {
//     "actorId": "<id>",            // optional; default = clicking user's assigned character
//     "type": "characteristic"|"skill",   // default "characteristic"
//     "test": "t" | "Cool",         // characteristic key or skill name
//     "difficulty": "easy",         // wfrp difficulty key ("easy" = +40), OR
//     "modifier": 40,               // raw numeric modifier
//     "label": "Resist Galloping Trots",
//     "on": {                        // actions to run, by outcome; each is one of the types below
//       "always":  [ ... ],
//       "fail":    [ {"action":"contractDisease","uuid":"Compendium...","name":"Galloping Trots"} ],
//       "success": [ {"action":"chat","text":"You keep it down."} ]
//     }
//   }
// Action types (all owner-safe document ops so they work on a player's client):
//   contractDisease {uuid,name?} · addItem {uuid,quantity?} · addCondition {key,value?}
//   removeCondition {key} · damage {amount} (raw wound loss) · chat {text,public?,alias?}
//   macro {name,args?}  <-- escape hatch; needs the clicking player to have the MACRO_SCRIPT permission
function attachWfrpTestButtons(html: HTMLElement): void {
  const g = globalThis as any;
  const buttons = html.querySelectorAll('button.wfrp-test-button');
  buttons.forEach((el: any) => {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async (ev: any) => {
      ev.preventDefault();
      if (el.dataset.done) return;
      const game = g.game; const ui = g.ui;
      let spec: any = {};
      try { spec = JSON.parse(el.dataset.wfrpTest || '{}'); }
      catch (e) { console.error(`[${MODULE_ID}] wfrp-test-button: invalid data-wfrp-test JSON`, e); return; }
      const actor = spec.actorId ? game.actors?.get(spec.actorId) : game.user?.character;
      if (!actor) { ui?.notifications?.warn('WFRP test: no character found for this button.'); return; }
      if (!actor.isOwner) { ui?.notifications?.warn("Only this character's owner (or the GM) can make this test."); return; }
      el.disabled = true;
      const gameRef = g.game;
      const prevRollMode = spec.blind ? gameRef.settings?.get('core', 'rollMode') : null;
      let rmRestored = false;
      const restoreRollMode = async () => {
        if (spec.blind && !rmRestored && prevRollMode != null) {
          rmRestored = true;
          try { await gameRef.settings?.set('core', 'rollMode', prevRollMode); } catch (e) { /* ignore */ }
        }
      };
      try {
        const fields: any = {};
        if (spec.difficulty) fields.difficulty = spec.difficulty;
        if (spec.modifier != null) fields.modifier = Number(spec.modifier);
        const label = spec.label || 'Test';
        const ctx: any = { fields, skipTargets: true, appendTitle: ` – ${label}` };
        if (spec.skipDialog) ctx.skipDialog = true;
        // Blind: the roll result + dice are hidden from the player (gmroll/blind). The test object
        // still computes pass/fail locally, so the GM-routed consequence (e.g. disease) still fires —
        // the player simply never sees the outcome.
        if (spec.blind) await gameRef.settings?.set('core', 'rollMode', 'blindroll');
        const test = (spec.type === 'skill')
          ? await actor.setupSkill(spec.test, ctx)
          : await actor.setupCharacteristic(spec.test || 't', ctx);
        if (!test) { await restoreRollMode(); el.disabled = false; return; } // dialog cancelled
        await test.roll();
        await restoreRollMode();
        const failed = (test.failed ?? (test.result?.outcome === 'failure')) === true;
        const scope = { actor, test, outcome: failed ? 'failure' : 'success', failed, succeeded: !failed, sl: test.result?.SL ?? null, args: spec.args ?? {} };
        const actions: any[] = ([] as any[]).concat(
          spec.on?.always || [],
          failed ? (spec.on?.fail || []) : (spec.on?.success || []),
        );
        for (const a of actions) await runWfrpTestAction(a, actor, scope, g);
        el.dataset.done = '1';
        // Neutral — never reveal pass/fail to the player (the outcome is GM information).
        el.textContent = '✓ Test made';
      } catch (err) {
        console.error(`[${MODULE_ID}] wfrp-test-button error:`, err);
        await restoreRollMode();
        el.disabled = false;
      }
    });
  });
}

// Execute one declarative action from a wfrp-test-button spec. All branches are owner-permitted
// document operations (the lone exception is `macro`, which needs MACRO_SCRIPT for non-GM clients).
async function runWfrpTestAction(a: any, actor: any, scope: any, g: any): Promise<void> {
  const game = g.game;
  const recipients = game.users.filter((u: any) => u.isGM || actor.testUserPermission(u, 'OWNER')).map((u: any) => u.id);
  try {
    switch (a?.action) {
      case 'contractDisease': {
        if (!a.uuid) break;
        // Disease contraction is GM information (the player must not see the "contracted" note or
        // wfrp4e's incubation/duration timer cards). When a player clicks, route the embed to the
        // GM so those cards are authored GM-side and gmroll-whispered; the player never sees them.
        const amActiveGM = game.user?.isGM && game.users?.activeGM?.isSelf;
        if (game.users?.activeGM && !amActiveGM) {
          game.socket?.emit(MODULE_WARHAMMER_MCP, { type: 'wfrpContractDisease', actorId: actor.id, uuid: a.uuid, name: a.name, alias: a.alias });
        } else {
          // GM client (or no GM online — fallback): apply locally. wfrp4e _onCreate auto-starts incubation.
          await applyDiseaseContraction(actor, a.uuid, a.name, a.alias, g);
        }
        break;
      }
      case 'addItem': {
        const src = a.uuid ? await g.fromUuid(a.uuid) : null;
        if (src) {
          const obj = src.toObject();
          if (a.quantity != null && obj.system?.quantity) obj.system.quantity.value = Number(a.quantity);
          await actor.createEmbeddedDocuments('Item', [obj]);
        }
        break;
      }
      case 'addCondition': { if (actor.addCondition) await actor.addCondition(a.key, a.value ?? 1); break; }
      case 'removeCondition': { if (actor.removeCondition) await actor.removeCondition(a.key); break; }
      case 'damage': {
        const wounds = actor.system?.status?.wounds;
        if (wounds) await actor.update({ 'system.status.wounds.value': Math.max(0, Number(wounds.value) - Number(a.amount || 0)) });
        break;
      }
      case 'chat': {
        await g.ChatMessage.create({ speaker: { alias: a.alias || actor.name }, whisper: a.public ? [] : recipients, content: a.text || '' });
        break;
      }
      case 'macro': {
        const m = game.macros?.getName(a.name);
        if (m) await m.execute({ actor, ...scope, ...(a.args || {}) });
        else console.warn(`[${MODULE_ID}] wfrp-test-button: macro "${a.name}" not found`);
        break;
      }
      default: console.warn(`[${MODULE_ID}] wfrp-test-button: unknown action "${a?.action}"`);
    }
  } catch (e) {
    console.error(`[${MODULE_ID}] wfrp-test-button action "${a?.action}" failed:`, e);
  }
}

// Global hook to handle MCP roll button rendering and state management
// Using renderChatMessageHTML for Foundry v13 compatibility (renderChatMessage is deprecated)
lifecycle.registerHook('main', 'renderChatMessageHTML', (message: any, html: HTMLElement) => {
  try {
    // Convert HTMLElement to jQuery for compatibility with existing handler code
    const $html = $(html);

    // Check if this message has MCP roll button flags
    const rollButtons = message.getFlag?.(MODULE_ID, 'rollButtons');

    if (rollButtons) {

      // Get the data access instance
      const queryHandlers = foundryMCPBridge['queryHandlers'] as any;
      if (queryHandlers && queryHandlers.dataAccess) {

        // Check if any buttons in this message are already rolled
        for (const [_buttonId, buttonData] of Object.entries(rollButtons as any)) {
          if (buttonData && typeof buttonData === 'object' && (buttonData as any).rolled) {
            break;
          }
        }

        // If message has rolled buttons, the content should already be updated
        // Just attach any necessary handlers for active buttons
        if ($html.find('.mcp-roll-button').length > 0) {
          // Only attach handlers to active (non-rolled) buttons. Phase 4.3 (R4.2): bind a per-message
          // AbortController so this render's listeners supersede (not stack on) the prior render's.
          const signal = bindMessageController(message.id);
          queryHandlers.rollButton.attachRollButtonHandlers($html, signal);
        }

      }
    } else if ($html.find('.mcp-roll-button').length > 0) {
      // Legacy message without flags - fall back to old behavior

      const queryHandlers = foundryMCPBridge['queryHandlers'] as any;
      if (queryHandlers && queryHandlers.dataAccess) {
        // Phase 4.3 (R4.2): per-message AbortController so re-renders don't stack click listeners.
        const signal = bindMessageController(message.id);
        queryHandlers.rollButton.attachRollButtonHandlers($html, signal);
      }
    }

    // Generic WFRP test buttons — independent of the MCP roll-button flow.
    attachWfrpTestButtons(html);
  } catch (error) {
    console.warn(`[${MODULE_ID}] Error processing roll buttons in chat message:`, error);
  }
});

// Phase 4.3 (R4.2): release the per-message AbortController when a chat message is deleted, so the
// controller registry doesn't grow unbounded across a long session (and the message's live click
// listener is torn down with it).
lifecycle.registerHook('main', 'deleteChatMessage', (message: any) => {
  releaseMessageController(message.id);
});

// When a disease's DURATION begins (symptoms manifest), whisper the patient a vague "you feel
// unwell" omen. Incubation is silent and the disease stays hidden until diagnosed, so the player
// learns they have caught SOMETHING — never what. Fires once, GM-side, when system.duration.active
// flips true (wfrp4e DiseaseModel.start("duration")). Player-facing flavor, drawn from a 1d20 table.
const DISEASE_ONSET_TABLE_ID = '6u30TrMQ0L9ZknvT';
lifecycle.registerHook('main', 'updateItem', async (item: any, change: any, _options: any, _userId: string) => {
  try {
    if (item?.type !== 'disease') return;
    const g = globalThis as any;
    if (g.foundry?.utils?.getProperty(change, 'system.duration.active') !== true) return;
    // Only the primary active GM posts, so the omen appears exactly once.
    if (!(game.user?.isGM && (game as any).users?.activeGM?.isSelf)) return;
    const actor = item.parent;
    if (!actor) return;
    const owners = game.users?.filter((u: any) => !u.isGM && actor.testUserPermission?.(u, 'OWNER')).map((u: any) => u.id) ?? [];
    const gmIds = game.users?.filter((u: any) => u.isGM).map((u: any) => u.id) ?? [];
    let omen = 'A creeping sickness settles into you — something is not right.';
    const tbl = game.tables?.get(DISEASE_ONSET_TABLE_ID) || game.tables?.find((t: any) => t.name === 'Disease Onset Omens');
    if (tbl) {
      try { const d = await tbl.draw({ displayChat: false }); const r = d?.results?.[0]; const t = (r?.name || r?.text || r?.description || '').toString().trim(); if (t) omen = t; } catch (e) { /* fall back */ }
    }
    const card = `<div class="grim-page grim-codex"><div class="grim-header"><div class="grim-eyebrow">&mdash;</div><div class="grim-title">Something Is Wrong</div></div><p style="text-align:center;font-style:italic;">${omen}</p></div>`;
    await g.ChatMessage.create({ speaker: { alias: actor.name }, whisper: [...new Set([...owners, ...gmIds])], content: card });
  } catch (e) {
    console.error(`[${MODULE_ID}] disease-onset omen failed:`, e);
  }
});

// Re-enable disease symptoms that were temporarily suppressed by the Treat Disease service.
// The service disables symptom AEs and stamps flags["warhammer-mcp"].symptomsSuppressedUntil
// (= worldTime + ~1 day) on the disease item. When that time passes, restore the symptoms.
lifecycle.registerHook('main', 'updateWorldTime', async (worldTime: number) => {
  try {
    if (!(game.user?.isGM && (game as any).users?.activeGM?.isSelf)) return;
    const now = Number((game as any).time?.worldTime ?? worldTime ?? 0);
    for (const actor of (game.actors as any)?.contents ?? []) {
      for (const d of actor.items?.filter((i: any) => i.type === 'disease') ?? []) {
        const until = d.getFlag('warhammer-mcp', 'symptomsSuppressedUntil');
        if (until == null || now < Number(until)) continue;
        const sym = d.effects?.filter((e: any) => e.getFlag('wfrp4e', 'symptom') && e.disabled) ?? [];
        if (sym.length) await d.updateEmbeddedDocuments('ActiveEffect', sym.map((e: any) => ({ _id: e.id, disabled: false })));
        await d.unsetFlag('warhammer-mcp', 'symptomsSuppressedUntil');
      }
    }
  } catch (e) {
    console.error(`[${MODULE_ID}] symptom re-enable failed:`, e);
  }
});

// Socket listener will be registered in the 'ready' hook when game.user is available

// Handle world close/reload
lifecycle.registerHook('main', 'canvasReady', () => {
  // Canvas ready indicates the world is fully loaded
  // Good time to ensure bridge is in correct state
  try {
    const status = foundryMCPBridge.getStatus();
    if (status.enabled && !status.connected) {
      foundryMCPBridge.start().catch(error => {
        console.warn(`[${MODULE_ID}] Failed to reconnect on canvas ready:`, error);
      });
    }
  } catch (error) {
    console.error(`[${MODULE_ID}] Error on canvas ready:`, error);
  }
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  foundryMCPBridge.cleanup().catch(error => {
    console.error(`[${MODULE_ID}] Cleanup failed:`, error);
  });
});

// Development helpers (only in debug mode)
if (typeof window !== 'undefined') {
  (window as any).foundryMCPDebug = {
    bridge: foundryMCPBridge,
    getStatus: () => foundryMCPBridge.getStatus(),
    start: () => foundryMCPBridge.start(),
    stop: () => foundryMCPBridge.stop(),
    restart: () => foundryMCPBridge.restart(),
  };
}

export { foundryMCPBridge };