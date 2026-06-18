// utils/sanitize-data.ts — MCP Code-Quality Hardening v1, Phase 13 (auditLog carry-in re-narrow).
//
// The pure data-sanitization cluster extracted VERBATIM from FoundryDataAccess (data-access.ts:205-328).
// It was private on DA but served 7 callers — 6 read-method formatters (getCharacterInfo /
// getCompendiumDocumentFull) plus the public auditLog. Because the 6 read callers needed it, the cluster
// could not move WITH auditLog; it had to become a shared util both DA and the relocated
// QueryHandlers.auditLog import. The cluster is stateless (no mutable DA instance state — `this.moduleId`
// was only used in console.warn labels), so the move is behavior-identical (Tier-A da-creatures /
// da-compendium snapshots are the regression net).

import { MODULE_ID } from '../constants.js';

/** Check if a field should be excluded from sanitized output. */
export function isSensitiveOrProblematicField(key: string): boolean {
  // BUG-386: 'key' removed from this list. In Foundry persisted document data the field literally
  // named `key` is legitimate, load-bearing data — most notably the ActiveEffect change target path
  // ({ key: "system.characteristics.s.initial", value, mode }) — never a credential. Stripping it
  // made correctly-keyed AE changes project as keyless, producing a false "BROKEN/keyless" diagnosis
  // that nearly triggered 15 destructive "fixes" on a locked pack. Foundry documents carry no secret
  // `key`; genuine credentials are covered by 'password'/'token'/'secret'/'auth'/'credential'/'session'.
  const sensitiveKeys = ['password', 'token', 'secret', 'auth', 'credential', 'session', 'cookie', 'private'];

  const problematicKeys = [
    'parent',
    '_parent',
    'collection',
    'apps',
    'document',
    '_document',
    'constructor',
    'prototype',
    '__proto__',
    'valueOf',
    'toString',
  ];

  // Skip deprecated ability save properties that trigger warnings
  const deprecatedKeys = [
    'save', // Skip the deprecated 'save' property on abilities
  ];

  return sensitiveKeys.includes(key) || problematicKeys.includes(key) || deprecatedKeys.includes(key);
}

/**
 * Remove sensitive fields from data object with circular reference protection.
 * Returns a sanitized copy instead of modifying the original.
 */
export function removeSensitiveFields(obj: any, visited: WeakSet<object> = new WeakSet(), depth: number = 0): any {
  // Handle primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Safety depth limit to prevent extremely deep recursion
  if (depth > 50) {
    console.warn(`[${MODULE_ID}] Sanitization depth limit reached at depth ${depth}`);
    return { $ref: 'maxDepth', depth };
  }

  // Check for circular reference
  if (visited.has(obj)) {
    return { $ref: 'cycle' };
  }

  // Mark this object as visited
  visited.add(obj);

  try {
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => removeSensitiveFields(item, visited, depth + 1));
    }

    // Create a new sanitized object
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive and problematic fields entirely
      if (isSensitiveOrProblematicField(key)) {
        continue;
      }

      // Skip most private properties except essential ones
      if (key.startsWith('_') && !['_id', '_stats', '_source'].includes(key)) {
        continue;
      }

      // Recursively sanitize the value
      sanitized[key] = removeSensitiveFields(value, visited, depth + 1);
    }

    return sanitized;
  } catch (error) {
    console.warn(`[${MODULE_ID}] Error during sanitization at depth ${depth}:`, error);
    return { $ref: 'sanitizationFailed', error: error instanceof Error ? error.message : 'Unknown' };
  }
}

/** Custom JSON serializer that handles Foundry objects safely. */
export function safeJSONStringify(obj: any): string {
  try {
    return JSON.stringify(obj, (key, value) => {
      // Skip deprecated properties during JSON serialization
      if (key === 'save' && typeof value === 'object' && value !== null) {
        // If this looks like a deprecated ability save object, skip it
        return undefined;
      }
      return value;
    });
  } catch (error) {
    console.warn(`[${MODULE_ID}] JSON stringify failed, using fallback:`, error);
    return '{}';
  }
}

/** Sanitize data to remove sensitive information and make it JSON-safe. */
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  try {
    // removeSensitiveFields returns a sanitized copy
    const sanitized = removeSensitiveFields(data);

    // Use custom JSON serializer to avoid deprecated property warnings
    const jsonString = safeJSONStringify(sanitized);
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(`[${MODULE_ID}] Failed to sanitize data:`, error);
    return {};
  }
}
