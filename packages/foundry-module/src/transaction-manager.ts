import { MODULE_ID } from './constants.js';
import { permissionManager } from './permissions.js';

export interface TransactionAction {
  type: 'create' | 'update' | 'delete';
  entityType: 'Actor' | 'Token' | 'Scene' | 'Item';
  entityId?: string;
  originalData?: any;
  newData?: any;
  rollbackAction?: () => Promise<void>;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  description: string;
  actions: TransactionAction[];
  completed: boolean;
  rolledBack: boolean;
  // Phase 6.3 BUG-081 — scene tracking for parallel-activate race guard.
  sceneId?: string | undefined;
}

export class TransactionManager {
  private moduleId: string = MODULE_ID;
  private activeTransactions: Map<string, Transaction> = new Map();
  private transactionHistory: Transaction[] = [];
  // Phase 6.3 BUG-081 — per-scene pending-write tracking.
  // Map<sceneId, Set<transactionId>>. Populated by wrappedWrite when called
  // with opts.sceneId; consumed by awaitPendingWritesForScene before
  // scene.activate to prevent parallel-write / activate races.
  private pendingSceneWrites: Map<string, Set<string>> = new Map();

  /**
   * Start a new transaction.
   * Phase 6.3 BUG-081: opts.sceneId registers the transaction in
   * pendingSceneWrites for that scene; commit/rollback/cancel deregister.
   */
  startTransaction(description: string, opts?: { sceneId?: string }): string {
    const transactionId = foundry.utils.randomID();
    const transaction: Transaction = {
      id: transactionId,
      timestamp: new Date(),
      description,
      actions: [],
      completed: false,
      rolledBack: false,
      sceneId: opts?.sceneId,
    };

    this.activeTransactions.set(transactionId, transaction);

    if (opts?.sceneId) {
      let set = this.pendingSceneWrites.get(opts.sceneId);
      if (!set) {
        set = new Set();
        this.pendingSceneWrites.set(opts.sceneId, set);
      }
      set.add(transactionId);
    }

    return transactionId;
  }

  /**
   * Internal helper to deregister a transaction from pendingSceneWrites.
   * Idempotent — safe to call multiple times.
   */
  private deregisterSceneTracking(transaction: Transaction): void {
    if (!transaction.sceneId) return;
    const set = this.pendingSceneWrites.get(transaction.sceneId);
    if (set) {
      set.delete(transaction.id);
      if (set.size === 0) this.pendingSceneWrites.delete(transaction.sceneId);
    }
  }

  /**
   * Add an action to an active transaction
   */
  addAction(transactionId: string, action: TransactionAction): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found or already completed`);
    }

    transaction.actions.push(action);
  }

  /**
   * Commit a transaction (mark as completed)
   */
  commitTransaction(transactionId: string): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    transaction.completed = true;
    this.activeTransactions.delete(transactionId);
    this.deregisterSceneTracking(transaction);

    // Add to history (keep last 50 transactions)
    this.transactionHistory.push(transaction);
    if (this.transactionHistory.length > 50) {
      this.transactionHistory.shift();
    }

  }

  /**
   * Rollback a transaction (undo all actions)
   */
  async rollbackTransaction(transactionId: string): Promise<{ success: boolean; errors: string[]; actionsRolledBack: number }> {
    let transaction = this.activeTransactions.get(transactionId);
    
    // Also check completed transactions for rollback
    if (!transaction) {
      transaction = this.transactionHistory.find(t => t.id === transactionId);
    }

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (transaction.rolledBack) {
      throw new Error(`Transaction ${transactionId} has already been rolled back`);
    }

    
    const errors: string[] = [];

    // Rollback actions in reverse order
    for (let i = transaction.actions.length - 1; i >= 0; i--) {
      const action = transaction.actions[i]!;

      try {
        await this.rollbackAction(action);
      } catch (error) {
        const errorMsg = `Failed to rollback action ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`[${this.moduleId}]`, errorMsg);
      }
    }

    transaction.rolledBack = true;

    // Remove from active transactions if it was there
    this.activeTransactions.delete(transactionId);
    this.deregisterSceneTracking(transaction);

    const success = errors.length === 0;

    // BUG-287: report how many actions were actually undone. success:true with
    // zero actions means "nothing to roll back", not "the world was restored" —
    // wrappedWrite uses this to flag possibly-persisted writes.
    return { success, errors, actionsRolledBack: transaction.actions.length };
  }

  /**
   * Rollback a specific action
   */
  private async rollbackAction(action: TransactionAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await this.rollbackCreate(action);
        break;
      case 'update':
        await this.rollbackUpdate(action);
        break;
      case 'delete':
        await this.rollbackDelete(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Rollback a create action (delete the created entity)
   */
  private async rollbackCreate(action: TransactionAction): Promise<void> {
    if (!action.entityId) {
      throw new Error('Cannot rollback create action: missing entityId');
    }

    switch (action.entityType) {
      case 'Actor':
        const actor = game.actors.get(action.entityId);
        if (actor) {
          await actor.delete();
        }
        break;
        
      case 'Token':
        // Find token in current scene
        const scene = (game.scenes as any).current;
        if (scene) {
          const token = scene.tokens.get(action.entityId);
          if (token) {
            await token.delete();
          }
        }
        break;
        
      default:
        throw new Error(`Rollback not implemented for entity type: ${action.entityType}`);
    }
  }

  /**
   * Rollback an update action (restore original data)
   */
  private async rollbackUpdate(action: TransactionAction): Promise<void> {
    if (!action.entityId || !action.originalData) {
      throw new Error('Cannot rollback update action: missing entityId or originalData');
    }

    switch (action.entityType) {
      case 'Actor':
        const actor = game.actors.get(action.entityId);
        if (actor) {
          await actor.update(action.originalData);
        }
        break;
        
      default:
        throw new Error(`Rollback not implemented for entity type: ${action.entityType}`);
    }
  }

  /**
   * Rollback a delete action (recreate the entity)
   */
  private async rollbackDelete(action: TransactionAction): Promise<void> {
    if (!action.originalData) {
      throw new Error('Cannot rollback delete action: missing originalData');
    }

    switch (action.entityType) {
      case 'Actor':
        await Actor.create(action.originalData);
        break;
        
      default:
        throw new Error(`Rollback not implemented for entity type: ${action.entityType}`);
    }
  }

  /**
   * Get active transactions
   */
  getActiveTransactions(): Transaction[] {
    return Array.from(this.activeTransactions.values());
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(): Transaction[] {
    return [...this.transactionHistory];
  }

  /**
   * Clear old transactions from history
   */
  clearHistory(): void {
    this.transactionHistory = [];
  }

  /**
   * Cancel an active transaction without rollback (use for cleanup)
   */
  cancelTransaction(transactionId: string): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (transaction) {
      this.activeTransactions.delete(transactionId);
      this.deregisterSceneTracking(transaction);
    }
  }

  /**
   * Phase 6.3 BUG-081 — return active transaction IDs registered to a scene.
   */
  getPendingWritesForScene(sceneId: string): string[] {
    const set = this.pendingSceneWrites.get(sceneId);
    return set ? Array.from(set) : [];
  }

  /**
   * Phase 6.3 BUG-081 — resolve when all pending scene writes complete.
   * Polls every 10ms; defaults to 5s timeout. Throws on timeout.
   * Use BEFORE scene.activate to prevent parallel-write / activate races.
   */
  async awaitPendingWritesForScene(sceneId: string, timeoutMs: number = 5000): Promise<void> {
    const start = Date.now();
    while (true) {
      const pending = this.getPendingWritesForScene(sceneId);
      if (pending.length === 0) return;
      if (Date.now() - start >= timeoutMs) {
        throw new Error(
          `awaitPendingWritesForScene: timeout after ${timeoutMs}ms — ${pending.length} pending writes remain on scene "${sceneId}"`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  /**
   * Create rollback action for actor creation
   */
  createActorCreationAction(actorId: string): TransactionAction {
    return {
      type: 'create',
      entityType: 'Actor',
      entityId: actorId,
    };
  }

  /**
   * Create rollback action for token creation
   */
  createTokenCreationAction(tokenId: string): TransactionAction {
    return {
      type: 'create',
      entityType: 'Token',
      entityId: tokenId,
    };
  }
}

// Export singleton instance
export const transactionManager = new TransactionManager();

/**
 * Wrap a write operation in a permission check + transaction.
 * Permission denial throws before the transaction starts.
 * Handler throw rolls back the transaction and re-throws the original error.
 * Rollback-time errors are logged but do not mask the original throw.
 */
// BUG-291: scene-scoped operation families whose barrier depends on sceneId being
// threaded through opts.sceneId; warn when callers omit it.
const SCENE_SCOPED_OP_RE = /\b(light|sound|tile|template)\b/i;

export async function wrappedWrite<T>(
  operation: string,
  fn: () => Promise<T>,
  opts?: { sceneId?: string },
): Promise<T> {
  const permCheck = permissionManager.checkWritePermission(operation);
  if (!permCheck.allowed) {
    throw new Error(permCheck.reason ?? `Permission denied for ${operation}`);
  }
  // BUG-291: debug hint when a scene-scoped op omits sceneId (barrier is silently
  // bypassed for awaitPendingWritesForScene callers that pass the right sceneId).
  if (!opts?.sceneId && SCENE_SCOPED_OP_RE.test(operation)) {
    console.debug(`[${MODULE_ID}] [wrappedWrite] "${operation}" looks scene-scoped but no sceneId was passed — awaitPendingWritesForScene barrier will not track this write`);
  }
  const txId = transactionManager.startTransaction(operation, opts);
  try {
    const result = await fn();
    transactionManager.commitTransaction(txId);
    return result;
  } catch (err) {
    let zeroActionRollback = false;
    try {
      const rollback = await transactionManager.rollbackTransaction(txId);
      zeroActionRollback = rollback.actionsRolledBack === 0;
    } catch (rollbackErr) {
      console.error(`[${MODULE_ID}] [wrappedWrite] Rollback of ${operation} failed:`, rollbackErr);
    }
    // BUG-287: a post-write verify failure (DP-16 *_NOT_PERSISTED / *_VERIFY_FAILED
    // sentinels) means the Foundry write already happened — and if the handler
    // registered no undo actions, "rollback" undid nothing. Don't let the error
    // imply the world was restored. Pre-write throws (validation, not-found)
    // don't match the sentinel pattern and pass through unchanged.
    const message = err instanceof Error ? err.message : String(err);
    if (zeroActionRollback && /NOT_PERSISTED|VERIFY_FAILED/.test(message)) {
      throw new Error(
        `${message} [ROLLBACK_UNAVAILABLE: no undo actions were registered for "${operation}" — the underlying write may have persisted]`,
      );
    }
    throw err;
  }
}