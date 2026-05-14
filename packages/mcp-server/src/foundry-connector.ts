import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { Logger } from './logger.js';
import { Config } from './config.js';

export interface FoundryConnectorOptions {
  config: Config['foundry'];
  logger: Logger;
}

interface PendingQuery {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export class FoundryConnector {
  private wss: WebSocketServer | null = null;
  private httpServer: any;
  private logger: Logger;
  private config: Config['foundry'];
  private isStarted = false;
  private foundrySocket: WebSocket | null = null;
  private pendingQueries = new Map<string, PendingQuery>();
  private queryIdCounter = 0;

  constructor({ config, logger }: FoundryConnectorOptions) {
    this.config = config;
    this.logger = logger.child({ component: 'FoundryConnector' });
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      this.logger.debug('Foundry connector already started');
      return;
    }

    this.logger.info('Starting Foundry connector WebSocket server', {
      port: this.config.port
    });

    // Create HTTP server for WebSocket upgrade
    this.httpServer = createServer();

    // Create WebSocket server
    this.wss = new WebSocketServer({
      server: this.httpServer,
      path: this.config.namespace || '/'
    });

    // Handle WebSocket connections
    this.wss.on('connection', (ws) => {
      this.logger.info('Foundry module connected via WebSocket');
      this.foundrySocket = ws;

      ws.on('close', () => {
        this.logger.info('Foundry module disconnected');
        this.foundrySocket = null;
        // Reject all pending queries
        this.pendingQueries.forEach(({ reject, timeout }) => {
          clearTimeout(timeout);
          reject(new Error('Connection closed'));
        });
        this.pendingQueries.clear();
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message).catch((error) => {
            this.logger.error('Error handling WebSocket message', error);
          });
        } catch (error) {
          this.logger.error('Failed to parse WebSocket message', error);
        }
      });

      ws.on('error', (error) => {
        this.logger.error('WebSocket error from Foundry module', error);
      });
    });

    // Start the HTTP server
    await new Promise<void>((resolve, reject) => {
      this.httpServer.listen(this.config.port, '127.0.0.1', () => {
        this.isStarted = true;
        this.logger.info('Foundry connector listening', { port: this.config.port });
        resolve();
      });

      this.httpServer.on('error', (error: Error) => {
        this.logger.error('Failed to start Foundry connector', error);
        reject(error);
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.isStarted) {
      return;
    }

    this.logger.info('Stopping Foundry connector...');

    // Reject all pending queries
    this.pendingQueries.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Server shutting down'));
    });
    this.pendingQueries.clear();

    if (this.foundrySocket) {
      this.foundrySocket.close();
      this.foundrySocket = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => {
          resolve();
        });
      });
      this.httpServer = null;
    }

    this.isStarted = false;
    this.logger.info('Foundry connector stopped');
  }

  private async handleMessage(message: any): Promise<void> {
    if (message.type === 'mcp-response' && message.id) {
      const pending = this.pendingQueries.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingQueries.delete(message.id);

        if (message.data.success) {
          this.logger.debug('Query response received', { id: message.id, hasData: !!message.data.data });
          pending.resolve(message.data.data);
        } else {
          this.logger.error('Query failed', { id: message.id, error: message.data.error });
          pending.reject(new Error(message.data.error || 'Query failed'));
        }
      }
      return;
    }

    if (message.type === 'pong') {
      const pending = this.pendingQueries.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingQueries.delete(message.id);
        pending.resolve(message.data);
      }
      return;
    }

    this.logger.debug('Received unknown message type', { type: message.type });
  }


  async query(method: string, data?: any): Promise<any> {
    if (!this.foundrySocket || this.foundrySocket.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Foundry VTT module');
    }

    const queryId = `query-${++this.queryIdCounter}`;
    this.logger.debug('Sending query to Foundry', { method, data, queryId });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingQueries.delete(queryId);
        reject(new Error(`Query timeout: ${method}`));
      }, 180000); // 180 second timeout (increased for WFRP4e advancement dialogs)

      this.pendingQueries.set(queryId, { resolve, reject, timeout });

      const message = {
        type: 'mcp-query',
        id: queryId,
        data: { method, data }
      };

      this.foundrySocket!.send(JSON.stringify(message));
    });
  }

  sendToFoundry(message: any): void {
    if (!this.foundrySocket || this.foundrySocket.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Foundry VTT module');
    }
    this.foundrySocket.send(JSON.stringify(message));
  }

  isConnected(): boolean {
    return this.isStarted && this.foundrySocket !== null && this.foundrySocket.readyState === WebSocket.OPEN;
  }

  getConnectionInfo(): any {
    return {
      started: this.isStarted,
      connected: this.isConnected(),
      readyState: this.foundrySocket?.readyState || 'CLOSED',
      config: {
        port: this.config.port,
        namespace: this.config.namespace
      }
    };
  }

  /**
   * Send a message to the connected Foundry module
   */
  sendMessage(message: any): void {
    if (!this.foundrySocket || this.foundrySocket.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Foundry VTT module');
    }

    try {
      this.foundrySocket.send(JSON.stringify(message));
      this.logger.debug('Sent message to Foundry module', { type: message.type });
    } catch (error) {
      this.logger.error('Failed to send message to Foundry module', error);
      throw error;
    }
  }

  /**
   * Broadcast a message to all connected Foundry clients (alias for sendMessage for single connection)
   */
  broadcastMessage(message: any): void {
    this.sendMessage(message);
  }
}