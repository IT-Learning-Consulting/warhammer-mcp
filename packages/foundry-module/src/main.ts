import { MODULE_ID } from './constants.js';
import { SocketBridge } from './socket-bridge.js';
import { QueryHandlers } from './queries.js';
import { ModuleSettings } from './settings.js';
import { runHealthCheck, captureInitError } from './health-check.js';
// Connection control now handled through settings menu

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

      this.isInitialized = true;
      console.log(`[${MODULE_ID}] Module initialized successfully`);

    } catch (error) {
      console.error(`[${MODULE_ID}] Failed to initialize:`, error);
      ui.notifications.error('Failed to initialize Warhammer MCP');
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
        ui.notifications.warn(`MCP Bridge settings validation failed: ${validation.errors.join(', ')}`);
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
          ui.notifications?.info('Building enhanced creature index for faster searches...');

          // Trigger index build through data access
          if (this.queryHandlers?.dataAccess?.rebuildEnhancedCreatureIndex) {
            await this.queryHandlers.dataAccess.rebuildEnhancedCreatureIndex();
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

      // Show connection notification based on user preference
      if (this.settings.getSetting('enableNotifications')) {
        ui.notifications.info('🔗 Warhammer MCP connected successfully');
      }
      console.log(`[${MODULE_ID}] GM connection established - Bridge active for user: ${game.user?.name}`);

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
            ui.notifications?.warn(
              'MCP Server not found. Install it from https://github.com/adambdooley/foundry-vtt-mcp'
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

      // Show disconnection notification based on user preference
      if (this.settings.getSetting('enableNotifications')) {
        ui.notifications.info('Warhammer MCP disconnected');
      }

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
        // Only log once per disconnection to avoid spam
        if (this.lastActivity && new Date().getTime() - this.lastActivity.getTime() > 60000) {
          console.warn(`[${MODULE_ID}] Heartbeat: Connection lost`);

          // Attempt auto-reconnection if enabled (with backoff)
          if (this.settings.getSetting('autoReconnectEnabled')) {
            console.log(`[${MODULE_ID}] Attempting auto-reconnection...`);
            await this.restart();
          }
        }
        return;
      }

      // Just update activity timestamp - no actual network ping needed
      // The socket bridge already handles connection state monitoring
      this.updateLastActivity();

    } catch (error) {
      // Only attempt reconnect once per failure cycle
      if (this.settings.getSetting('autoReconnectEnabled')) {
        console.log(`[${MODULE_ID}] Heartbeat failure - attempting single reconnection...`);
        try {
          await this.restart();
        } catch (reconnectError) {
          console.error(`[${MODULE_ID}] Auto-reconnection failed:`, reconnectError);
          // Disable further attempts until manual intervention
          await this.settings.setSetting('autoReconnectEnabled', false);
          if (this.settings.getSetting('enableNotifications')) {
            ui.notifications.warn('⚠️ Lost connection to AI model - Auto-reconnect disabled');
          }
        }
      }
    }
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    this.lastActivity = new Date();
    this.settings.setSetting('lastActivity', this.lastActivity.toISOString());
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

    console.log(`[${MODULE_ID}] Cleanup complete`);
  }

}

// Create global instance
const foundryMCPBridge = new FoundryMCPBridge();

// Make it available globally for settings callbacks
(window as any).foundryMCPBridge = foundryMCPBridge;

// Foundry VTT Hooks
Hooks.once('init', async () => {
  try {
    await foundryMCPBridge.initialize();
  } catch (error) {
    console.error(`[${MODULE_ID}] Initialization failed:`, error);
  }
});

Hooks.once('ready', async () => {
  try {
    await foundryMCPBridge.onReady();

    // Schedule the 2-minute post-ready health-check banner.
    try {
      const delayMs = (game.settings.get(MODULE_ID, 'healthCheckDelayMs') as number) ?? 120000;
      const expectedRaw = game.settings.get(MODULE_ID, 'expectedQueryCount') as number;
      const expected = expectedRaw && expectedRaw > 0 ? expectedRaw : undefined;
      if (delayMs > 0) {
        setTimeout(() => {
          try {
            runHealthCheck(expected);
          } catch (e) {
            console.error(`[${MODULE_ID}] health-check itself threw:`, e);
          }
        }, delayMs);
      }
    } catch (e) {
      captureInitError('ready-hook-health-check-schedule', e);
    }

    // Register socket listener for roll state management (after game.user is available)

    game.socket?.on('module.warhammer-mcp', async (data) => {

      try {
        // Handle ChatMessage update requests (GM only)
        if (data.type === 'requestMessageUpdate' && data.buttonId && data.messageId) {

          // Only GM can update ChatMessages for other users
          if (game.user?.isGM) {
            try {
              // Get the data access instance to update the message
              const queryHandlers = foundryMCPBridge['queryHandlers'] as any;
              if (queryHandlers && queryHandlers.dataAccess) {
                await queryHandlers.dataAccess.updateRollButtonMessage(data.buttonId, data.userId, data.rollLabel);
              }
            } catch (error) {
              console.error(`[${MODULE_ID}] GM failed to update message:`, error);
              // Notify GM about the failure
              if (game.user?.isGM) {
                ui.notifications?.error(`Failed to update player roll message: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                await queryHandlers.dataAccess.saveRollState(data.buttonId, data.rollState.rolledBy);
              }
            } catch (error) {
              console.error(`[${MODULE_ID}] GM failed to save LEGACY roll state:`, error);
              // Notify GM about the failure so they can take action
              if (game.user?.isGM) {
                ui.notifications?.error(`Failed to save player roll state: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
Hooks.on('closeSettingsConfig', () => {
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

// Global hook to handle MCP roll button rendering and state management
// Using renderChatMessageHTML for Foundry v13 compatibility (renderChatMessage is deprecated)
Hooks.on('renderChatMessageHTML', (message: any, html: HTMLElement) => {
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
          // Only attach handlers to active (non-rolled) buttons
          queryHandlers.dataAccess.attachRollButtonHandlers($html);
        }

      }
    } else if ($html.find('.mcp-roll-button').length > 0) {
      // Legacy message without flags - fall back to old behavior

      const queryHandlers = foundryMCPBridge['queryHandlers'] as any;
      if (queryHandlers && queryHandlers.dataAccess) {
        queryHandlers.dataAccess.attachRollButtonHandlers($html);

        // Check for legacy roll states
        setTimeout(() => {
          queryHandlers.dataAccess.ensureButtonStatesForMessage($html);
        }, 100);
      }
    }
  } catch (error) {
    console.warn(`[${MODULE_ID}] Error processing roll buttons in chat message:`, error);
  }
});

// Socket listener will be registered in the 'ready' hook when game.user is available

// Handle world close/reload
Hooks.on('canvasReady', () => {
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