// Module Integration v2 Phase 9 — module-polyglot MCP tool (Polyglot v2.8.2, language obfuscation).
//
// Always-registered umbrella. The foundry-module handler guards on polyglot being active; when inactive
// it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active polyglot.
//
// 9 actions across 3 write/verify shapes (Speak-language/literacy item grant+revoke, ChatMessage flag,
// journal-page span). Anchors: DP-15 (concrete this.query<PolyglotResult> — never <any>); R2.4 (errors
// via errorResponse). formatResult exhaustiveness is real — NO `as never` suppression
// ([[feedback_single_action_module_umbrella_exhaustiveness]]).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { POLYGLOT_ACTIONS, type PolyglotResult } from './schemas.js';
import { z } from 'zod';
import { PolyglotInput } from '@foundry-mcp/shared';

type PolyglotArgs = z.infer<typeof PolyglotInput>;

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: PolyglotResult): string {
  const p = 'module-polyglot';
  switch (d.action) {
    case 'list-world-languages':
      return `${p}.list-world-languages: ${d.count} language(s)${d.note ? ` (${d.note})` : ''}.`;
    case 'check-knows-language':
      return `${p}.check-knows-language: ${d.entityId} ${d.knows ? 'knows' : 'does NOT know'} "${d.language}" (${d.known.length} known total).`;
    case 'check-literacy':
      return `${p}.check-literacy: ${d.entityId} literate=${d.literate} (${d.literateLanguages.length} readable language(s)).`;
    case 'send-in-language':
      return `${p}.send-in-language: message ${d.messageId} sent in "${d.language}".`;
    case 'grant-language':
      return `${p}.grant-language: "${d.language}" ${d.alreadyKnown ? 'already known' : 'granted'} to ${d.entityId} (item ${d.itemId}).`;
    case 'revoke-language':
      return `${p}.revoke-language: "${d.language}" removed from ${d.entityId} (${d.count} item(s)).`;
    case 'grant-literacy':
      return `${p}.grant-literacy: Read/Write ${d.alreadyKnown ? 'already known' : 'granted'} to ${d.entityId} (item ${d.itemId}).`;
    case 'revoke-literacy':
      return `${p}.revoke-literacy: Read/Write removed from ${d.entityId} (${d.count} item(s)).`;
    case 'tag-journal-page':
      return `${p}.tag-journal-page: page ${d.pageUuid} tagged in "${d.language}".`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModulePolyglotToolOptions extends BaseToolOptions {}

export class ModulePolyglotTool extends BaseTool {
  constructor(options: ModulePolyglotToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-polyglot', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-polyglot',
        title: 'Polyglot integration — WFRP4e language obfuscation (chat scrambling, literacy, journal tagging)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Polyglot module — chat/journal scrambling into fantasy fonts gated on the reader's Speak-language skills and Read/Write literacy. Raw Foundry document/setting writes only — zero game.polyglot.* runtime calls. Three write/verify shapes: (1) Speak-language / Read-Write-talent grant+revoke = embedded Item create/delete, verified against actor.items; (2) send-in-language = ChatMessage.create with a DUAL write of flags.polyglot.language AND a top-level language field (the top-level field survives a live GM's stale TomSelect selector), verified via the created message's flag; (3) tag-journal-page = page.update wrapping a <span class="polyglot-journal" data-language> marker, verified by re-reading the page content.
Conditional: returns MODULE_NOT_ACTIVE when polyglot is absent/inactive. Pre-flight: module-probe.is-active polyglot.

ACCENT-INSENSITIVE RESOLUTION: grant-language/revoke-language resolve free-text input (e.g. "Eltharin") against the live wfrp4e-core.items/wfrp4e.basic compendium Language(X) skills first (canonical accented spelling, e.g. "Elthárin"), then a built-in 17-language font-map fallback, then a homebrew hand-built skill as a last resort. Always creates/matches using the resolved canonical name.

IDEMPOTENT: grant-language/grant-literacy pre-check actor.items for a same-name item — compendium items ship advances.value:0, so a double-grant would otherwise silently create two items.

CONFIRM-GATED (CCR-4): revoke-language, revoke-literacy (destructive item-delete) — require confirm:true. grant-language, grant-literacy, send-in-language, tag-journal-page stay UNGATED (additive/reversible).

9 actions:
reads: list-world-languages {} · check-knows-language { entityId, language } · check-literacy { entityId }.
writes (ungated): send-in-language { content, language, speaker?, whisper?, rollMode?, style? } (style default OTHER) · grant-language { entityId, language } · grant-literacy { entityId } · tag-journal-page { pageUuid, language, text? } (text omitted = wrap whole page content).
writes (confirm-gated): revoke-language { entityId, language, confirm } · revoke-literacy { entityId, confirm }.

Example: { action: "grant-language", entityId: "abc123", language: "Reikspiel" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...POLYGLOT_ACTIONS], description: 'Polyglot action to perform.' },
            entityId: { type: 'string', description: 'Actor id (check-knows-language/check-literacy/grant-*/revoke-* — all except list-world-languages, send-in-language, tag-journal-page).' },
            language: { type: 'string', description: 'Free-text language name, e.g. "Reikspiel" or "Eltharin" (accent-insensitive; resolves to the canonical compendium spelling).' },
            content: { type: 'string', description: 'send-in-language: chat message HTML/text content.' },
            speaker: { type: 'string', description: 'send-in-language: actorId to speak as (optional; omitted = no speaker set).' },
            whisper: { type: 'array', items: { type: 'string' }, description: 'send-in-language: recipient user ids for a whispered message.' },
            rollMode: { type: 'string', enum: ['publicroll', 'gmroll', 'blindroll', 'selfroll'], description: 'send-in-language: Foundry roll/chat visibility mode.' },
            style: { type: 'string', enum: ['OTHER', 'IC', 'OOC', 'EMOTE'], description: 'send-in-language: CONST.CHAT_MESSAGE_STYLES key (default OTHER — bypasses the TomSelect dropdown overwrite).' },
            pageUuid: { type: 'string', description: 'tag-journal-page: JournalEntryPage UUID to tag.' },
            text: { type: 'string', description: 'tag-journal-page: substring within the page content to wrap (first occurrence). Omitted = wrap the entire page content.' },
            confirm: { type: 'boolean', description: 'revoke-language / revoke-literacy: must be true to execute the gated delete.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: PolyglotArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-polyglot action', { action });
    if (!(POLYGLOT_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<PolyglotResult>('module-polyglot', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-polyglot', msg);
      return this.errorResponse(action, msg);
    }
  }
}
