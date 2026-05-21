import { Logger } from './logger.js';
import { Config } from './config.js';
import { FoundryConnector } from './foundry-connector.js';
import type { HandlerEnvelope } from '@foundry-mcp/shared';

export interface FoundryQuery {
  method: string;
  data?: any;
}

export interface FoundryResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class FoundryClient {
  private logger: Logger;
  private config: Config['foundry'];
  private connector: FoundryConnector;

  constructor(config: Config['foundry'], logger: Logger) {
    this.config = config;
    this.logger = logger.child({ component: 'FoundryClient' });

    // Initialize the socket connector
    this.connector = new FoundryConnector({
      config: this.config,
      logger: this.logger
    });
  }

  async connect(): Promise<void> {
    this.logger.info('Starting Foundry connector socket.io server');

    try {
      // Start the socket.io server that Foundry will connect to
      await this.connector.start();
      this.logger.info('Foundry connector started, waiting for module connection...');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      this.logger.error('Failed to start Foundry connector', { error: errorMessage });
      throw new Error(`Failed to start Foundry connector: ${errorMessage}`);
    }
  }

  disconnect(): void {
    this.logger.info('Stopping Foundry connector...');
    this.connector.stop().catch(error => {
      this.logger.error('Error stopping connector', error);
    });
  }

  async query<T = unknown>(method: string, data?: any): Promise<T> {
    if (!this.connector.isConnected()) {
      throw new Error('Foundry VTT module not connected. Please ensure Foundry is running and the MCP Bridge module is enabled.');
    }

    this.logger.debug('Sending query to Foundry module', { method, data });

    let envelope: HandlerEnvelope<T>;
    try {
      envelope = (await this.connector.query(method, data)) as HandlerEnvelope<T>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown query error';
      this.logger.error('Query transport failed', { method, error: errorMessage });
      throw new Error(`Query ${method} failed: ${errorMessage}`);
    }

    // Single unwrap site (PRD R3, CCR-1). Every handler must emit {success, data?, error?}.
    if (!envelope || typeof envelope.success !== 'boolean') {
      const preview = JSON.stringify(envelope).slice(0, 200);
      this.logger.error('Malformed envelope from Foundry', { method, preview });
      throw new Error(`Query ${method} returned malformed envelope: ${preview}`);
    }
    if (!envelope.success) {
      const message = envelope.error ?? 'no error message';
      this.logger.error('Query failed', { method, error: message });
      throw new Error(`Query ${method} failed: ${message}`);
    }

    this.logger.debug('Query successful', { method });
    return envelope.data as T;
  }

  ping(): Promise<any> {
    return this.query('warhammer-mcp.ping');
  }

  getConnectionInfo(): any {
    return this.connector.getConnectionInfo();
  }

  getConnectionState(): string {
    return this.connector.isConnected() ? 'connected' : 'disconnected';
  }

  isReady(): boolean {
    return this.connector.isConnected();
  }

  get pendingEvents() {
    return this.connector.pendingEvents;
  }

  sendMessage(message: any): void {
    this.logger.debug('Sending message to Foundry', { type: message.type, requestId: message.requestId });
    this.connector.sendToFoundry(message);
  }

  broadcastMessage(message: any): void {
    this.logger.debug('Broadcasting message to Foundry', { type: message.type });
    this.connector.broadcastMessage(message);
  }

  isConnected(): boolean {
    return this.connector.isConnected();
  }
}