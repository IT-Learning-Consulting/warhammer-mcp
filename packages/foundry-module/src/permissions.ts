import { MODULE_ID } from './constants.js';

/**
 * ADR-008: The 5-category permission granularity collapsed to a single
 * `allowWriteOperations` gate. Operation-name strings are retained for
 * transaction descriptions + logging, not routing.
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string | undefined;
  requiresConfirmation?: boolean | undefined;
  warnings?: string[] | undefined;
}

export class PermissionManager {
  private moduleId: string = MODULE_ID;

  /**
   * Check if a write operation is allowed.
   * Single gate: `allowWriteOperations` setting + GM check + bulk-quantity safeguard.
   */
  checkWritePermission(operationName: string, context?: { quantity?: number; targetIds?: string[] }): PermissionCheck {
    const settingAllowed = game.settings.get(this.moduleId, 'allowWriteOperations') as boolean;
    if (!settingAllowed) {
      return {
        allowed: false,
        reason: `Write operation '${operationName}' blocked: allowWriteOperations is disabled in module settings`,
      };
    }

    if (!game.user?.isGM) {
      return {
        allowed: false,
        reason: `Write operation '${operationName}' blocked: non-GM user`,
      };
    }

    if (context?.quantity && context.quantity > 1) {
      const maxActors = game.settings.get(this.moduleId, 'maxActorsPerRequest') as number;
      if (context.quantity > maxActors) {
        return {
          allowed: false,
          reason: `Quantity ${context.quantity} exceeds maximum allowed ${maxActors}`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Validate and sanitize operation parameters.
   */
  validateOperationParameters(operationName: string, parameters: any): { valid: boolean; errors: string[]; sanitized?: any } {
    const errors: string[] = [];
    let sanitized = { ...parameters };

    switch (operationName) {
      case 'createActor':
        if (!sanitized.creatureType || typeof sanitized.creatureType !== 'string') {
          errors.push('creatureType is required and must be a string');
        }

        if (sanitized.quantity) {
          const quantity = parseInt(sanitized.quantity);
          if (isNaN(quantity) || quantity < 1 || quantity > 10) {
            errors.push('quantity must be a number between 1 and 10');
          } else {
            sanitized.quantity = quantity;
          }
        }

        if (sanitized.customNames && !Array.isArray(sanitized.customNames)) {
          errors.push('customNames must be an array of strings');
        }
        break;

      case 'modifyScene':
        if (!sanitized.actorIds || !Array.isArray(sanitized.actorIds) || sanitized.actorIds.length === 0) {
          errors.push('actorIds must be a non-empty array');
        }

        if (sanitized.placement && !['random', 'grid', 'center'].includes(sanitized.placement)) {
          errors.push('placement must be one of: random, grid, center');
        }
        break;

      default:
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined,
    };
  }

  /**
   * Report the current write-permission status (single gate).
   */
  getOperationStatus(): { allowed: boolean; reason?: string } {
    const check = this.checkWritePermission('write');
    return {
      allowed: check.allowed,
      ...(check.reason ? { reason: check.reason } : {}),
    };
  }

  /**
   * Permission summary for debugging.
   */
  getPermissionSummary(): {
    user: { name: string; isGM: boolean };
    settings: Record<string, boolean>;
    writeAllowed: boolean;
  } {
    return {
      user: {
        name: game.user?.name || 'Unknown',
        isGM: game.user?.isGM || false,
      },
      settings: {
        allowWriteOperations: game.settings.get(this.moduleId, 'allowWriteOperations') as boolean,
      },
      writeAllowed: this.checkWritePermission('write').allowed,
    };
  }
}

// Export singleton instance
export const permissionManager = new PermissionManager();
