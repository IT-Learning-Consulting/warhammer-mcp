import { FoundryClient } from './foundry-client.js';
import { Logger } from './logger.js';

export interface BaseToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export abstract class BaseTool {
  protected foundryClient: FoundryClient;
  protected logger: Logger;

  constructor({ foundryClient, logger }: BaseToolOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: this.constructor.name });
  }

  protected async query<T>(action: string, args?: any): Promise<T> {
    return this.foundryClient.query<T>(`warhammer-mcp.${action}`, args);
  }

  abstract getToolDefinitions(): any[];
}
