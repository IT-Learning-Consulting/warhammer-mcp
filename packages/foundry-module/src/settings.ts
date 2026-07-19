import { MODULE_ID, DEFAULT_CONFIG } from './constants.js';
import type { BridgeConfig } from './socket-bridge.js';
import { notify } from './notify.js';
import { playDialogChime } from './hooks/mcp-dialog-chime.js';

export class ModuleSettings {
  private moduleId: string = MODULE_ID;

  /**
   * Register all module settings with Foundry
   */
  registerSettings(): void {
    // ============================================================================
    // SETTINGS MENU - Detailed Configuration Dialog
    // ============================================================================

    // Enhanced Creature Index submenu
    (game.settings as any).registerMenu(this.moduleId, 'enhancedIndexMenu', {
      name: 'Enhanced Creature Index',
      label: 'Configure Enhanced Index',
      hint: 'The Enhanced Creature Index pre-computes creature statistics for instant filtering by species, traits, and abilities. This enables AI models to quickly find creatures matching specific criteria without loading every compendium entry.',
      icon: 'fas fa-search-plus',
      type: class extends FormApplication {
        static get defaultOptions() {
          return foundry.utils.mergeObject(super.defaultOptions, {
            title: "Enhanced Creature Index Settings",
            template: `modules/${MODULE_ID}/templates/enhanced-index-menu.html`,
            width: 500,
            height: 'auto',
            resizable: false,
            closeOnSubmit: false
          } as any);
        }

        getData(): any {
          return {
            enableEnhancedCreatureIndex: game.settings.get(MODULE_ID, 'enableEnhancedCreatureIndex'),
            autoRebuildIndex: game.settings.get(MODULE_ID, 'autoRebuildIndex')
          };
        }

        activateListeners(html: JQuery) {
          super.activateListeners(html);
          html.find('.rebuild-index-btn').click(() => {
            const bridge = (globalThis as any).foundryMCPBridge;
            if (bridge?.creatureIndex?.rebuildEnhancedIndex) {
              notify.info('Rebuilding enhanced creature index...');
              bridge.creatureIndex.rebuildEnhancedIndex();
            }
          });
        }

        async _updateObject(_event: Event, formData: any) {
          await game.settings.set(MODULE_ID, 'enableEnhancedCreatureIndex', formData.enableEnhancedCreatureIndex);
          await game.settings.set(MODULE_ID, 'autoRebuildIndex', formData.autoRebuildIndex);
        }
      },
      restricted: true
    });

    // Dialog Chime test-button submenu
    (game.settings as any).registerMenu(this.moduleId, 'dialogChimeMenu', {
      name: 'MCP Dialog Chime',
      label: 'Test Dialog Chime',
      hint: 'Play the configured chime sound on demand to verify your settings.',
      icon: 'fas fa-bell',
      type: class extends FormApplication {
        static get defaultOptions() {
          return foundry.utils.mergeObject(super.defaultOptions, {
            title: 'MCP Dialog Chime',
            template: `modules/${MODULE_ID}/templates/dialog-chime-menu.html`,
            width: 420,
            height: 'auto',
            resizable: false,
            closeOnSubmit: true,
          } as any);
        }

        getData(): any {
          return {
            dialogChimeEnabled: game.settings.get(MODULE_ID, 'dialogChimeEnabled'),
            dialogChimeSound: game.settings.get(MODULE_ID, 'dialogChimeSound'),
            dialogChimeVolume: game.settings.get(MODULE_ID, 'dialogChimeVolume'),
          };
        }

        activateListeners(html: JQuery) {
          super.activateListeners(html);
          html.find('.play-test-chime').click(() => {
            playDialogChime();
          });
        }

        async _updateObject(_event: Event, _formData: any) {
          // No form fields to save — settings are managed via the main config panel.
        }
      },
      restricted: true,
    });

    // ============================================================================
    // SECTION 1: BASIC SETTINGS
    // ============================================================================

    game.settings.register(this.moduleId, 'enabled', {
      name: 'Enable MCP Bridge',
      hint: 'Master switch to enable/disable the MCP bridge connection',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: this.onEnabledChange.bind(this),
    });

    game.settings.register(this.moduleId, 'serverHost', {
      name: 'Server Host',
      hint: 'IP address where the MCP server runs (usually localhost)',
      scope: 'world',
      config: true,
      type: String,
      default: DEFAULT_CONFIG.MCP_HOST,
      onChange: this.onConnectionChange.bind(this),
    });

    game.settings.register(this.moduleId, 'serverPort', {
      name: 'Server Port',
      hint: 'Port number for MCP server communication',
      scope: 'world',
      config: true,
      type: Number,
      default: DEFAULT_CONFIG.MCP_PORT,
      onChange: this.onConnectionChange.bind(this),
    });


    // ============================================================================
    // SECTION 2: WRITE PERMISSIONS
    // ============================================================================

    game.settings.register(this.moduleId, 'allowWriteOperations', {
      name: 'Allow Write Operations',
      hint: 'Let AI model create actors, NPCs, and modify world content. Reading is always allowed.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
    });

    // Phase 1 mcp_diagnostic_tool — opt-in gate for the diagnostic MCP surface.
    // HC2 / CCR-2: read-only diagnostic tools (recent-errors, world-issues,
    // support-snapshot, and future Tier 2/3 actions) are GATED behind this
    // setting AND validateGMAccess(). Default OFF — only power-user GMs +
    // developers should enable.
    game.settings.register(this.moduleId, 'enableDiagnosticTools', {
      name: 'Enable Diagnostic Tools',
      hint: 'Allow Claude / AI tools to call the warhammer-mcp.diagnostic surface. Read-only — exposes errors, world-issues, support snapshot, content scans, dev introspection. Off by default — recommended for power-user GMs and developers only.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    });

    // ============================================================================
    // SECTION 3: SAFETY CONTROLS - Limits on AI model's Actions
    // ============================================================================

    game.settings.register(this.moduleId, 'maxActorsPerRequest', {
      name: 'Max Actors Per Request',
      hint: 'Maximum number of actors AI model can create in a single request',
      scope: 'world',
      config: true,
      type: Number,
      default: 10,
      range: {
        min: 1,
        max: 50,
        step: 1,
      },
    });

    // Removed 'enableWriteAuditLog' setting as it provides no rollback functionality
    // and only creates log entries without user-actionable features

    // Enhanced Creature Index settings (configured via submenu only)
    game.settings.register(this.moduleId, 'enableEnhancedCreatureIndex', {
      scope: 'world',
      config: false, // Hidden from main config, accessible via submenu only
      type: Boolean,
      default: true,
    });

    game.settings.register(this.moduleId, 'autoRebuildIndex', {
      scope: 'world',
      config: false, // Hidden from main config, accessible via submenu only
      type: Boolean,
      default: true,
    });

    // ============================================================================
    // SECTION 4: CONNECTION BEHAVIOR
    // ============================================================================

    game.settings.register(this.moduleId, 'enableNotifications', {
      name: 'Show Connection Messages',
      hint: 'Display notifications when connecting/disconnecting from AI model',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register(this.moduleId, 'auditWritesToChat', {
      name: 'Audit MCP writes to chat',
      hint: 'When enabled, every create / update / delete operation performed by Warhammer MCP also writes a GM-whispered chat message. Useful for keeping a durable session log. Connection events and errors always go to chat; this setting controls routine writes.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    });

    game.settings.register(this.moduleId, 'mcpVerboseConsole', {
      name: 'Verbose MCP console',
      hint: 'When enabled, each Warhammer MCP operation expands into a grouped console block with UUID, duration, and user. Devs can also enable this via `_dev-mode` or `localStorage.warhammer_mcp_verbose = "1"`.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    });

    game.settings.register(this.moduleId, 'autoReconnectEnabled', {
      name: 'Auto-Reconnect on Disconnect',
      hint: 'Automatically try to reconnect if the connection to AI model is lost',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register(this.moduleId, 'heartbeatInterval', {
      name: 'Connection Check Frequency',
      hint: 'How often to check if AI model is still connected (seconds)',
      scope: 'world',
      config: true,
      type: Number,
      default: 30,
      range: {
        min: 10,
        max: 120,
        step: 5,
      },
    });

    // Non-configurable settings for internal state
    game.settings.register(this.moduleId, 'lastConnectionState', {
      scope: 'world',
      config: false,
      type: String,
      default: 'disconnected',
    });

    game.settings.register(this.moduleId, 'lastActivity', {
      scope: 'world',
      config: false,
      type: String,
      default: '',
    });

    // Track when we last showed the MCP server notification to avoid spam
    game.settings.register(this.moduleId, 'lastMCPServerNotification', {
      scope: 'world',
      config: false,
      type: String,
      default: '',
    });

    // Roll state storage for persistent roll button states
    game.settings.register(this.moduleId, 'rollStates', {
      scope: 'world',
      config: false,
      type: Object,
      default: {},
      onChange: this.onRollStatesChanged.bind(this),
    });

    // Button to message ID mapping for ChatMessage updates
    game.settings.register(this.moduleId, 'buttonMessageMap', {
      scope: 'world',
      config: false,
      type: Object,
      default: {},
    });

    // Phase 7g: the warhammer-mcp-namespaced price-dial setting registration is retired along with the
    // module-trading-places umbrella it backed. The price dial now lives entirely under the fork's own
    // world-settings namespace (registered by wfrp4e-economy itself, D8), consumed by
    // module-wfrp-economy's trading-get/set-price-modifiers actions — the D2 seed-once migration already
    // copied this namespace's last value across before this registration was removed.

    // ============================================================================
    // SECTION: DIALOG CHIME — audible alert for MCP-triggered blocking dialogs
    // ============================================================================

    game.settings.register(this.moduleId, 'dialogChimeEnabled', {
      name: 'MCP Dialog Chime: Enable',
      hint: 'Play a chime when a blocking dialog appears during an MCP request (e.g. specialisation-choice popups). Never beeps for manual dialogs.',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register(this.moduleId, 'dialogChimeSound', {
      name: 'MCP Dialog Chime: Sound',
      hint: 'Audio file to play when the chime fires. Defaults to Foundry\'s built-in notify sound.',
      scope: 'client',
      config: true,
      type: String,
      default: 'sounds/notify.wav',
      filePicker: 'audio',
    } as any);

    game.settings.register(this.moduleId, 'dialogChimeVolume', {
      name: 'MCP Dialog Chime: Volume',
      hint: 'Playback volume (0 = silent, 1 = full). Uses the Interface audio channel.',
      scope: 'client',
      config: true,
      type: Number,
      default: 0.8,
      range: {
        min: 0,
        max: 1,
        step: 0.05,
      },
    });

    game.settings.register(this.moduleId, 'dialogChimeClasses', {
      name: 'MCP Dialog Chime: Extra Dialog Classes',
      hint: 'Comma-separated list of ApplicationV2 class names that should trigger the chime in addition to DialogV2 and its subclasses.',
      scope: 'client',
      config: true,
      type: String,
      default: 'ItemDialog,ValueDialog,DialogV2',
    });

  }

  /**
   * Handle roll states setting changes - fires on all clients for world-scoped settings
   */
  private onRollStatesChanged(_newValue: any): void {
    // No action needed - ChatMessage.update() handles state synchronization automatically
  }

  /**
   * Update connection status display in settings
   */
  updateConnectionStatusDisplay(connected: boolean, _toolCount: number): void {
    try {
      const statusText = connected
        ? `✅ Connected`
        : `❌ Disconnected - Use connection panel to connect`;

      // Update the hint for the enabled setting to show status
      const enabledSetting = (game.settings as any).settings.get(`${this.moduleId}.enabled`);
      if (enabledSetting) {
        enabledSetting.hint = `${enabledSetting.hint.split(' |')[0]} | Status: ${statusText}`;
      }

    } catch (error) {
      console.warn(`[${this.moduleId}] Failed to update status display:`, error);
    }
  }

  /**
   * Get current bridge configuration from settings
   */
  getBridgeConfig(): BridgeConfig {
    return {
      enabled: this.getSetting('enabled'),
      serverHost: this.getSetting('serverHost'),
      serverPort: this.getSetting('serverPort'),
      namespace: '/warhammer-mcp', // Fixed namespace - no user configuration needed
      reconnectAttempts: DEFAULT_CONFIG.RECONNECT_ATTEMPTS, // Use sensible default
      reconnectDelay: DEFAULT_CONFIG.RECONNECT_DELAY, // Use sensible default
      connectionTimeout: DEFAULT_CONFIG.CONNECTION_TIMEOUT, // Use sensible default
      debugLogging: false, // Always false - use browser console for debugging
    };
  }

  /**
   * Get a specific setting value
   */
  getSetting(key: string): any {
    return game.settings.get(this.moduleId, key);
  }

  /**
   * Set a specific setting value
   */
  async setSetting(key: string, value: any): Promise<any> {
    return game.settings.set(this.moduleId, key, value);
  }

  /**
   * Get all settings as an object
   */
  getAllSettings(): Record<string, any> {
    const settingKeys = [
      // Basic Settings
      'enabled', 'serverHost', 'serverPort',
      // Permissions
      'allowWriteOperations',
      // Diagnostic surface (Phase 1 mcp_diagnostic_tool)
      'enableDiagnosticTools',
      // Safety Controls
      'maxActorsPerRequest',
      // Enhanced Creature Index
      'enableEnhancedCreatureIndex', 'autoRebuildIndex',
      // Connection Behavior
      'enableNotifications', 'autoReconnectEnabled', 'heartbeatInterval'
    ];

    const settings: Record<string, any> = {};
    for (const key of settingKeys) {
      settings[key] = this.getSetting(key);
    }

    return settings;
  }

  /**
   * Validate settings for consistency
   */
  validateSettings(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const host = this.getSetting('serverHost');
    if (!host || typeof host !== 'string' || host.trim().length === 0) {
      errors.push('Server host cannot be empty');
    }

    const port = this.getSetting('serverPort');
    if (!port || typeof port !== 'number' || port < 1024 || port > 65535) {
      errors.push('Server port must be between 1024 and 65535');
    }

    const maxActors = this.getSetting('maxActorsPerRequest');
    if (!maxActors || typeof maxActors !== 'number' || maxActors < 1 || maxActors > 50) {
      // BUG-280: ceiling aligned to 50 to match the registered range: {min:1, max:50}
      errors.push('Max actors per request must be between 1 and 50');
    }

    const heartbeat = this.getSetting('heartbeatInterval');
    if (!heartbeat || typeof heartbeat !== 'number' || heartbeat < 10 || heartbeat > 120) {
      errors.push('Heartbeat interval must be between 10 and 120 seconds');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Handle enabled setting change
   */
  private onEnabledChange(enabled: boolean): void {

    // Trigger bridge state change through global event
    if (window.foundryMCPBridge) {
      if (enabled) {
        window.foundryMCPBridge.start?.();
      } else {
        window.foundryMCPBridge.stop?.();
      }
    }
  }

  /**
   * Handle connection setting changes
   */
  private onConnectionChange(): void {

    // If bridge is running, restart it with new settings
    if (window.foundryMCPBridge && this.getSetting('enabled')) {
      window.foundryMCPBridge.restart?.();
    }
  }


  /**
   * Create settings migration for version updates
   */
  /**
   * Get write operation permissions
   */
  getWritePermissions(): {
    allowWriteOperations: boolean;
    maxActorsPerRequest: number;
  } {
    return {
      allowWriteOperations: this.getSetting('allowWriteOperations'),
      maxActorsPerRequest: this.getSetting('maxActorsPerRequest'),
    };
  }

  /**
   * Check if AI model is allowed to perform write operations
   */
  isWriteOperationAllowed(_operation?: string): boolean {
    // Simplified - single permission covers all write operations
    return this.getSetting('allowWriteOperations');
  }

  migrateSettings(_fromVersion: string, _toVersion: string): void {

    // Add migration logic here for future versions
    // For now, no migrations needed as this is initial version
  }

  /**
   * Reset all settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    const settingKeys = [
      // Basic Settings
      'enabled', 'serverHost', 'serverPort',
      // Permissions
      'allowWriteOperations',
      // Diagnostic surface (Phase 1 mcp_diagnostic_tool)
      'enableDiagnosticTools',
      // Safety Controls
      'maxActorsPerRequest',
      // Enhanced Creature Index
      'enableEnhancedCreatureIndex', 'autoRebuildIndex',
      // Connection Behavior
      'enableNotifications', 'autoReconnectEnabled', 'heartbeatInterval'
    ];

    for (const key of settingKeys) {
      // Get the default value from the setting registration
      const setting = (game.settings as any).settings.get(`${this.moduleId}.${key}`);
      if (setting && 'default' in setting) {
        await this.setSetting(key, setting.default);
      }
    }

    notify.info('MCP Bridge settings have been reset to defaults');
  }
}