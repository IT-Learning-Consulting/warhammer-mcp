import { MODULE_ID, CONNECTION_STATES } from './constants.js';
import { notify, type ProgressHandle } from './notify.js';

export interface BridgeConfig {
  enabled: boolean;
  serverHost: string;
  serverPort: number;
  namespace: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  connectionTimeout: number;
  debugLogging: boolean;
}

/**
 * Browser-compatible socket bridge that uses native WebSocket and fetch
 * instead of socket.io-client which doesn't work in Foundry VTT
 */
export class SocketBridge {
  private ws: WebSocket | null = null;
  private connectionState: string = CONNECTION_STATES.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: any = null;
  private reconnectHandle: ProgressHandle | null = null;

  constructor(private config: BridgeConfig) {
    this.maxReconnectAttempts = config.reconnectAttempts;
  }

  async connect(): Promise<void> {
    if (this.connectionState === CONNECTION_STATES.CONNECTED || 
        this.connectionState === CONNECTION_STATES.CONNECTING) {
      return;
    }

    this.connectionState = CONNECTION_STATES.CONNECTING;
    this.log('Connecting to MCP server...');

    // Use WebSocket instead of socket.io
    const wsUrl = `ws://${this.config.serverHost}:${this.config.serverPort}${this.config.namespace}`;
    
    return new Promise((resolve, reject) => {
      const connectTimeout = setTimeout(() => {
        this.log('Connection timeout');
        this.connectionState = CONNECTION_STATES.DISCONNECTED;
        reject(new Error('Connection timeout'));
      }, this.config.connectionTimeout * 1000);

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.connectionState = CONNECTION_STATES.CONNECTED;
          this.reconnectAttempts = 0;
          if (this.reconnectHandle) {
            this.reconnectHandle.done('MCP reconnected');
            this.reconnectHandle = null;
          }
          this.log('Connected to MCP server');
          this.setupEventHandlers();
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          // Use more informative message for connection failures
          const isFirstAttempt = this.reconnectAttempts === 0;
          const errorMsg = isFirstAttempt ?
            'MCP server not available (this is normal if server isn\'t running)' :
            `Connection error after ${this.reconnectAttempts} attempts: ${error}`;
          this.log(errorMsg);
          if (!isFirstAttempt) {
            notify.error(`MCP WebSocket error: ${errorMsg}`);
          }
          this.connectionState = CONNECTION_STATES.DISCONNECTED;
          this.scheduleReconnect();
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = (event) => {
          this.log(`Disconnected: ${event.reason || 'Connection closed'}`);
          this.connectionState = CONNECTION_STATES.DISCONNECTED;

          if (event.wasClean) {
            // Clean disconnect (manual stop() via code 1000) — stop() already
            // emitted notify.lifecycle('connection-down', ...). Don't double-fire.
            return;
          }

          notify.lifecycle(
            'connection-down',
            `MCP disconnected: ${event.reason || 'connection closed'}`,
          );
          this.scheduleReconnect();
        };

      } catch (error) {
        clearTimeout(connectTimeout);
        this.log(`Failed to create WebSocket: ${error}`);
        this.connectionState = CONNECTION_STATES.DISCONNECTED;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.connectionState = CONNECTION_STATES.DISCONNECTED;
    this.log('Disconnected from MCP server');
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // R1.8 — every inbound message proves the connection is live.
        // Bridge is wired into window.foundryMCPBridge at main.ts:437;
        // call the public updateLastActivity() method when available.
        try {
          (window as any).foundryMCPBridge?.updateLastActivity?.();
        } catch {
          // Bridge not yet wired (init race) — heartbeat will recover.
        }
        this.handleMessage(message);
      } catch (error) {
        this.log(`Failed to parse message: ${error}`);
      }
    };
  }

  private async handleMessage(message: any): Promise<void> {
    try {
      if (message.type === 'mcp-query') {
        await this.handleMCPQuery(message.data, (response) => {
          this.sendMessage({
            type: 'mcp-response',
            id: message.id,
            data: response
          });
        });
      } else if (message.type === 'ping') {
        this.sendMessage({
          type: 'pong',
          id: message.id,
          data: { timestamp: Date.now(), status: 'ok' }
        });
      } else if (message.type === 'job-completed') {
        await this.handleJobCompleted(message.data);
      }
    } catch (error) {
      console.error(`[foundry-mcp-bridge] ERROR in handleJobCompleted:`, error);
      this.log(`Error handling message: ${error}`);
    }
  }

  private async handleMCPQuery(data: any, callback: (response: any) => void): Promise<void> {
    try {
      this.log(`Handling MCP query: ${data.method}`);

      // Check if the query handler exists in CONFIG.queries
      const queryKey = data.method; // Method already includes full path like 'foundry-mcp-bridge.listActors'
      const handler = CONFIG.queries[queryKey];

      if (!handler || typeof handler !== 'function') {
        throw new Error(`No handler found for query: ${data.method}`);
      }

      // Execute the query handler
      const result = await handler(data.data || {});
      
      this.log(`Query completed: ${data.method}`);
      callback({ success: true, data: result });

    } catch (error) {
      this.log(`Query failed: ${data.method} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      callback({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async handleJobCompleted(data: any): Promise<void> {
    try {
      console.log(`[foundry-mcp-bridge] Map generation completed, creating scene...`);
      console.log(`[foundry-mcp-bridge] Job completion data:`, data);

      // Handle mapgen-style data structure
      if (!data.result) {
        console.error(`[foundry-mcp-bridge] ERROR: No scene result data provided`);
        throw new Error('No scene result data provided');
      }

      if (!data.image_path) {
        console.error(`[foundry-mcp-bridge] ERROR: No image path provided for scene creation`);
        throw new Error('No image path provided for scene creation');
      }

      // Use the complete scene data from backend (like mapgen does)
      const sceneData = data.result;

      console.log(`[foundry-mcp-bridge] Scene data to create:`, sceneData);
      console.log(`[foundry-mcp-bridge] Scene name: "${sceneData.name}"`);

      // Ensure "AI Generated Maps" folder exists and get its ID
      console.log(`[foundry-mcp-bridge] Ensuring AI Generated Maps folder exists...`);
      const folderId = await this.ensureAIMapsFolderExists();
      console.log(`[foundry-mcp-bridge] Folder ID:`, folderId);

      // Add folder to scene data
      if (folderId) {
        sceneData.folder = folderId;
        console.log(`[foundry-mcp-bridge] Added folder ID to scene data`);
      }

      // Create the scene using the complete payload from backend
      console.log(`[foundry-mcp-bridge] Attempting to create scene...`);
      const scene = await (globalThis as any).Scene.create(sceneData);
      console.log(`[foundry-mcp-bridge] Scene created successfully:`, scene);

      // CRITICAL: Foundry v13 bug workaround (like working mapgen system)
      if (!scene.img && sceneData.img) {
        await scene.update({
          img: sceneData.img,
          background: { src: sceneData.img }
        });
      }

      if (sceneData.walls && sceneData.walls.length > 0) {
        await this.createSceneWalls(scene, sceneData.walls);
      }

      notify.created('scene', sceneData.name);

      // Auto-activate the scene if enabled
      const autoActivate = true; // You might want to make this configurable
      if (autoActivate) {
        await scene.activate();
        notify.info(`Switched to scene "${sceneData.name}" — ready for token placement`);
      }

      this.log(`Scene "${sceneData.name}" created and activated`);

    } catch (error) {
      this.log(`Failed to create scene from generated map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      notify.error('Failed to create scene', error instanceof Error ? error : new Error('Unknown error'));
    }
  }


  private async createSceneWalls(scene: any, wallsData: any[]): Promise<void> {
    if (!wallsData || !Array.isArray(wallsData) || wallsData.length === 0) {
      this.log('No wall data provided');
      return;
    }

    try {
      this.log(`Creating ${wallsData.length} walls for scene ${scene.name}`);

      // Filter out walls with invalid coordinates
      const validWalls = wallsData.filter((wall: any) => {
        if (!wall.c || !Array.isArray(wall.c) || wall.c.length !== 4) {
          this.log(`Invalid wall coordinates: ${JSON.stringify(wall)}`);
          return false;
        }
        if (!wall.c.every((coord: any) => typeof coord === 'number' && !isNaN(coord))) {
          this.log(`Invalid coordinate values: ${JSON.stringify(wall.c)}`);
          return false;
        }
        return true;
      });

      this.log(`${validWalls.length} valid walls out of ${wallsData.length} total`);

      const wallDocuments = validWalls.map((wall: any) => ({
        c: wall.c, // Wall coordinates [x1, y1, x2, y2]
        move: wall.movement || 0,
        sense: wall.sight || 0,
        doorSound: "",
        dir: wall.direction || 0,
        door: wall.door || 0,
        ds: wall.doorState || 0,
        flags: wall.flags || {}
      }));

      if (wallDocuments.length > 0) {
        await scene.createEmbeddedDocuments("Wall", wallDocuments);
        notify.created('wall', `${wallDocuments.length} walls`, { summary: `in scene "${scene.name}"` });
      } else {
        this.log('No valid walls to create');
        notify.warn('No valid walls could be created from detection data');
      }

    } catch (error) {
      this.log(`Failed to create walls: ${error instanceof Error ? error.message : 'Unknown error'}`);
      notify.warn(`Some walls could not be created: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ensure "AI Generated Maps" folder exists for organizing generated scenes
   */
  private async ensureAIMapsFolderExists(): Promise<string | null> {
    try {
      const folderName = 'AI Generated Maps';

      // Check if folder already exists
      const existingFolder = (globalThis as any).game.folders.find((f: any) =>
        f.type === 'Scene' && f.name === folderName
      );

      if (existingFolder) {
        this.log(`AI Generated Maps folder already exists with ID: ${existingFolder.id}`);
        return existingFolder.id;
      }

      // Create the folder
      this.log('Creating AI Generated Maps folder...');
      const folder = await (globalThis as any).Folder.create({
        name: folderName,
        type: 'Scene',
        description: 'Scenes created by AI Map Generation',
        color: '#4a90e2', // Nice blue color
        sorting: 'a' // Sort alphabetically
      });

      if (folder) {
        this.log(`Created AI Generated Maps folder with ID: ${folder.id}`);
        return folder.id;
      }

      this.log('Failed to create AI Generated Maps folder');
      return null;

    } catch (error) {
      this.log(`Error managing AI Generated Maps folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log(`Max reconnection attempts reached (${this.maxReconnectAttempts})`);
      // R1.5 — terminal lifecycle event when retries are exhausted.
      if (this.reconnectHandle) {
        this.reconnectHandle.fail(`MCP failed to reconnect after ${this.maxReconnectAttempts} attempts`);
        this.reconnectHandle = null;
      }
      notify.lifecycle(
        'connection-down',
        `MCP failed to reconnect after ${this.maxReconnectAttempts} attempts`,
      );
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
    this.reconnectAttempts++;

    // R1.4 — rolling sticky toast that updates in place across attempts.
    const message = `MCP reconnecting... attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`;
    if (!this.reconnectHandle) {
      this.reconnectHandle = notify.progress(message);
    } else {
      this.reconnectHandle.update(
        this.reconnectAttempts / this.maxReconnectAttempts,
        message,
      );
    }

    this.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    this.connectionState = CONNECTION_STATES.RECONNECTING;

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        // Connection failed, scheduleReconnect will be called again from connect()
      }
    }, delay);
  }

  private sendMessage(message: any): void {
    if (!this.ws || this.connectionState !== CONNECTION_STATES.CONNECTED) {
      this.log(`Cannot send message - not connected`);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.log(`Sent message: ${message.type}`);
    } catch (error) {
      this.log(`Failed to send message: ${error}`);
    }
  }

  emitToServer(event: string, data?: any): void {
    this.sendMessage({
      type: event,
      data: data,
      timestamp: Date.now()
    });
  }

  isConnected(): boolean {
    return this.connectionState === CONNECTION_STATES.CONNECTED;
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  getConnectionInfo(): any {
    return {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      config: {
        host: this.config.serverHost,
        port: this.config.serverPort,
        namespace: this.config.namespace,
      },
    };
  }

  private log(message: string): void {
    if (this.config.debugLogging) {
      console.log(`[${MODULE_ID}] Socket Bridge: ${message}`);
    }
  }
}