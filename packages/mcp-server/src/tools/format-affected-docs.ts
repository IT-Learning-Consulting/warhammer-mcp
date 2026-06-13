import type { FkAffectedDocEntry } from '@foundry-mcp/shared';

/**
 * Render the `### Affected docs` section appended to umbrella delete formatters
 * when cascade:true was honored. Returns an empty string when affectedDocs is
 * undefined or empty (cascade:false path, R10.6 backward-compat).
 *
 * Phase 10 cascade contract: cascade-enabled deletes return a populated
 * affectedDocs array; the formatter surfaces it so the LLM caller can audit
 * which docs were touched without a separate audit-document call.
 */
export function formatAffectedDocs(affectedDocs?: FkAffectedDocEntry[]): string {
    // undefined = cascade:false (not requested) → no section (R10.6 backward-compat).
    if (affectedDocs === undefined) return '';
    // BUG-353: [] = cascade:true ran but found no inbound FK refs. Surface "Affected docs (0)"
    // so a cascade delete is distinguishable from a plain delete in the response (R10.6 / Phase 4.3).
    if (affectedDocs.length === 0) {
        return '\n\n### Affected docs (0)\n_(cascade:true ran; no inbound FK references to clear)_';
    }
    const lines = affectedDocs.map(
        (d) => `- ${d.type} \`${d.id}\`${d.name ? ` ${d.name}` : ''}: field \`${d.fkField}\` cleared`,
    );
    return `\n\n### Affected docs (${affectedDocs.length})\n${lines.join('\n')}`;
}
