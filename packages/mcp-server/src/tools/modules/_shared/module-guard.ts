// Module Integration v1 Phase 1 — server-side MODULE_NOT_ACTIVE response builder.
//
// Typed helper for constructing MODULE_NOT_ACTIVE and MODULE_DEPENDENCY_NOT_ACTIVE
// error content on the mcp-server side, for consistency with the foundry-module
// guard (handlers/modules/_shared/require-module-active.ts).
//
// This is NOT a guard function — the foundry-module owns actual active-state checks
// (it has access to game.modules). This is a presentation helper for the tool layer.

/**
 * Build an MCP isError response indicating a module is not active.
 * Used by module-* tools when the foundry-module guard returns MODULE_NOT_ACTIVE.
 */
export function moduleNotActiveContent(toolName: string, message: string) {
    return {
        content: [
            {
                type: 'text' as const,
                text: `${toolName} failed: ${message}`,
            },
        ],
        isError: true,
    };
}
