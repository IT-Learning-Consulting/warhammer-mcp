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

  /**
   * Send a query to a Foundry-side handler.
   *
   * **Contract (PRD R3 / CCR-Envelope-Consumer; codified post-BUG-069 2026-05-14):**
   * - **Returns the UNWRAPPED `data` payload.** `foundry-client.ts:54-84` is the single
   *   unwrap site — the `{success, data}` envelope is stripped at the transport boundary.
   *   The return value is whatever the Foundry-side handler put in `data`.
   * - **Throws on failure.** A `{success:false}` envelope, a malformed envelope, or a
   *   transport error all throw. Do NOT check `.success` on the return value.
   * - Wrap callers in `try { ... } catch (e) { return this.errorResponse(action, e.message); }`
   *   to convert thrown failures into the MCP tool error envelope.
   *
   * **Anti-pattern that caused BUG-069:**
   * ```ts
   * const response = await this.query<any>("setDocumentOwnership", payload);
   * if (!response?.success) { ... }   // ← response.success is always undefined
   * const data = response.data;       // ← response IS data
   * ```
   *
   * **Correct pattern:**
   * ```ts
   * try {
   *   const data = await this.query<MyResponseShape>("setDocumentOwnership", payload);
   *   return { content: [{ type: "text", text: `... ${data.resolvedId} ...` }] };
   * } catch (e) {
   *   return this.errorResponse("assign", e instanceof Error ? e.message : String(e));
   * }
   * ```
   *
   * **Always parameterize T with a concrete response shape, not `any`.** `any` lets
   * `.success` typecheck and re-introduces BUG-069. See `tools/ownership.ts` for
   * exemplar inline response interfaces.
   */
  protected async query<T>(action: string, args?: unknown): Promise<T> {
    return this.foundryClient.query<T>(`warhammer-mcp.${action}`, args);
  }

  abstract getToolDefinitions(): any[];
}
