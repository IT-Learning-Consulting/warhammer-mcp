import {
  ListJournalsInput,
  GetJournalContentInput,
  CreateJournalEntryInput,
  UpdateJournalContentInput,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { sanitizeHtml } from '../utils/sanitize-html.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface JournalToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class JournalTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'list-journals',
        title: 'List Journals',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'List world journal entries. Thin pass-through to the Foundry-module listJournals query. Used by /wfrp-journal + /wfrp-session-prep to find quest journals (set filterQuests: true for entries whose name starts with "Quest:"). Set includeContent: true to include each entry\'s first-page HTML body in the response.',
        inputSchema: {
          type: 'object',
          properties: {
            filterQuests: {
              type: 'boolean',
              description: 'Only return journals whose name starts with "Quest:" (case-insensitive).',
            },
            includeContent: {
              type: 'boolean',
              description: 'Include each journal\'s first-page content in the response.',
            },
          },
        },
      },
      {
        name: 'get-journal-content',
        title: 'Get Journal Content',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'Read a single journal entry\'s first-page HTML content by ID. Thin pass-through to getJournalContent. Used by /wfrp-journal read-quest + /wfrp-session-prep quest-body expand.',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'The JournalEntry document ID (Foundry _id).',
            },
          },
          required: ['journalId'],
        },
      },
      {
        name: 'create-journal-entry',
        title: 'Create Journal Entry',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Create a new world-level JournalEntry with a single HTML page. Thin pass-through to createJournalEntry. Used by /wfrp-journal create-quest (name prefix "Quest:") and /wfrp-encounter-builder for encounter summaries. Content accepts Foundry-flavored HTML including @UUID[Actor.X]{Name} enrichment tags.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Journal entry name (e.g. "Quest: Find the Witch Hunter").',
            },
            content: {
              type: 'string',
              description: 'HTML content for the journal\'s first page.',
            },
          },
          required: ['name', 'content'],
        },
      },
      {
        name: 'update-journal-content',
        title: 'Update Journal Content',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Replace the HTML content of an existing JournalEntry\'s first page by ID. Thin pass-through to updateJournalContent. Used by /wfrp-journal complete-quest + update-quest-body. Preserves page ID — does not recreate the page.',
        inputSchema: {
          type: 'object',
          properties: {
            journalId: {
              type: 'string',
              description: 'The JournalEntry document ID.',
            },
            content: {
              type: 'string',
              description: 'New HTML content for the first page.',
            },
          },
          required: ['journalId', 'content'],
        },
      },
    ];
  }

  async handleListJournals(args: any): Promise<any> {
    const parsed = ListJournalsInput.parse(args ?? {});
    this.logger.info('list-journals', { filterQuests: parsed.filterQuests, includeContent: parsed.includeContent });
    return await this.query<any>('listJournals', parsed);
  }

  async handleGetJournalContent(args: any): Promise<any> {
    const parsed = GetJournalContentInput.parse(args);
    this.logger.info('get-journal-content', { journalId: parsed.journalId });
    const result = await this.query<any>('getJournalContent', parsed);
    if (result && typeof result === 'object') {
      if (typeof result.content === 'string') result.content = sanitizeHtml(result.content);
      if (Array.isArray(result.pages)) {
        result.pages = result.pages.map((p: any) => ({
          ...p,
          content: sanitizeHtml(p.content),
          ...(p.text != null ? { text: sanitizeHtml(p.text) } : {}),
        }));
      }
    }
    return result;
  }

  async handleCreateJournalEntry(args: any): Promise<any> {
    const parsed = CreateJournalEntryInput.parse(args);
    this.logger.info('create-journal-entry', { name: parsed.name, contentLength: parsed.content.length });
    return await this.query<any>('createJournalEntry', parsed);
  }

  async handleUpdateJournalContent(args: any): Promise<any> {
    const parsed = UpdateJournalContentInput.parse(args);
    this.logger.info('update-journal-content', { journalId: parsed.journalId, contentLength: parsed.content.length });
    return await this.query<any>('updateJournalContent', parsed);
  }
}
