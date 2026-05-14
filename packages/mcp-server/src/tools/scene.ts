import { z } from 'zod';
import { GetCurrentSceneOutput, GET_CURRENT_SCENE_OUTPUT_JSON_SCHEMA } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface SceneToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class SceneTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  /**
   * Tool definitions for scene operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'get-current-scene',
        title: 'Get Current Scene',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'Get information about a Foundry scene — the currently active scene by default, or any scene by ID via the optional `sceneId` parameter. TOOL-IDEA-007 (2026-05-14): pass `sceneId` to inspect a non-active scene without disrupting the GM\'s canvas view. The response includes an `active` boolean so callers can tell whether the returned scene is the live one.',
        inputSchema: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'Optional Scene document ID to inspect. Omit to read the currently active scene (back-compat).',
            },
            includeTokens: {
              type: 'boolean',
              description: 'Whether to include detailed token information (default: true)',
              default: true,
            },
            includeHidden: {
              type: 'boolean',
              description: 'Whether to include hidden tokens and elements (default: false)',
              default: false,
            },
          },
        },
        outputSchema: GET_CURRENT_SCENE_OUTPUT_JSON_SCHEMA,
      },
      {
        name: 'get-world-info',
        title: 'Get World Info',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'Get basic information about the Foundry world and game system (e.g., D&D 5e, WFRP 4e). Use this to understand what system is being used and tailor responses accordingly.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list-scenes',
        title: 'List Scenes',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'List Foundry VTT scenes. TOOL-IDEA-001 (2026-05-14): pagination + count-only mode for large worlds (200+ scenes overflow the transport at ~68k chars). Pass `countOnly: true` to probe inventory size before committing to a filter. Pass `page` and/or `pageSize` to paginate. When neither is set, returns the bare array as before (back-compat). Sort order = Foundry insertion order; for deterministic paging combine with `filter` or sort post-hoc.',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter to search scene names (case-insensitive)',
              default: ''
            },
            include_active_only: {
              type: 'boolean',
              description: 'Only return the currently active scene',
              default: false
            },
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Page number (1-based). When set, response shape becomes `{total, page, pageSize, pageCount, scenes}` instead of a bare array.'
            },
            pageSize: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Items per page (default 50, max 100). Triggers paginated response shape.'
            },
            countOnly: {
              type: 'boolean',
              description: 'If true, return `{total, filterApplied}` only (no scene data). Cheap inventory probe.'
            }
          }
        }
      },
      {
        name: 'switch-scene',
        title: 'Switch Scene',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'Switch to a different Foundry VTT scene by name or ID',
        inputSchema: {
          type: 'object',
          properties: {
            scene_identifier: {
              type: 'string',
              description: 'Scene name or ID to switch to'
            },
            optimize_view: {
              type: 'boolean',
              description: 'Automatically optimize the view for the scene',
              default: true
            }
          },
          required: ['scene_identifier']
        }
      }
    ];
  }

  async handleGetCurrentScene(args: any): Promise<any> {
    // TOOL-IDEA-007 (2026-05-14): accept and forward optional sceneId.
    const schema = z.object({
      sceneId: z.string().optional(),
      includeTokens: z.boolean().default(true),
      includeHidden: z.boolean().default(false),
    });

    const { sceneId, includeTokens, includeHidden } = schema.parse(args);

    this.logger.info('Getting current scene information', { sceneId, includeTokens, includeHidden });

    try {
      const sceneData = await this.query<any>(
        'getActiveScene',
        sceneId ? { sceneId } : {}
      );

      this.logger.debug('Successfully retrieved scene data', {
        sceneId: sceneData.id,
        sceneName: sceneData.name,
        tokenCount: sceneData.tokens?.length || 0,
      });

      const output = this.formatSceneResponse(sceneData, includeTokens, includeHidden);
      GetCurrentSceneOutput.parse(output);
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      };

    } catch (error) {
      this.logger.error('Failed to get current scene', error);
      throw new Error(`Failed to get current scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetWorldInfo(_args: any): Promise<any> {
    this.logger.info('Getting world information');

    try {
      const worldData = await this.query<any>('getWorldInfo');

      this.logger.debug('Successfully retrieved world data', {
        worldId: worldData.id,
        system: worldData.system,
      });

      return this.formatWorldResponse(worldData);

    } catch (error) {
      this.logger.error('Failed to get world information', error);
      throw new Error(`Failed to get world information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listScenes(input: any): Promise<any> {
    const safeInput = input ?? {};
    try {
      // TOOL-IDEA-001 (2026-05-14): pass through pagination + countOnly. Foundry-module
      // side returns a bare array when none of page/pageSize/countOnly is set
      // (back-compat) and an envelope otherwise — we forward whatever it returns.
      const params: Record<string, any> = {
        filter: typeof safeInput.filter === 'string' ? safeInput.filter : undefined,
        include_active_only: Boolean(safeInput.include_active_only),
      };
      if (safeInput.page !== undefined) params.page = safeInput.page;
      if (safeInput.pageSize !== undefined) params.pageSize = safeInput.pageSize;
      if (safeInput.countOnly !== undefined) params.countOnly = safeInput.countOnly;
      return await this.query<any>('list-scenes', params);
    } catch (error: any) {
      this.logger.error('List scenes failed', { error, input: safeInput });
      return { success: false, error: error?.message ?? 'Unknown error' };
    }
  }

  async switchScene(input: any): Promise<any> {
    const safeInput = input ?? {};
    try {
      const sceneIdentifier = typeof safeInput.scene_identifier === 'string' ? safeInput.scene_identifier : safeInput.sceneId;
      if (!sceneIdentifier || typeof sceneIdentifier !== 'string' || !sceneIdentifier.trim()) {
        return { success: false, error: 'scene_identifier is required' };
      }

      const params = {
        scene_identifier: sceneIdentifier,
        optimize_view: safeInput.optimize_view !== false,
      };

      return await this.query<any>('switch-scene', params);
    } catch (error: any) {
      this.logger.error('Switch scene failed', { error, input: safeInput });
      return { success: false, error: error?.message ?? 'Unknown error' };
    }
  }

  private formatSceneResponse(sceneData: any, includeTokens: boolean, includeHidden: boolean): any {
    const response: any = {
      id: sceneData.id,
      name: sceneData.name,
      active: sceneData.active,
      dimensions: {
        width: sceneData.width,
        height: sceneData.height,
        padding: sceneData.padding,
      },
      hasBackground: !!sceneData.background,
      navigation: sceneData.navigation,
      elements: {
        walls: sceneData.walls || 0,
        lights: sceneData.lights || 0,
        sounds: sceneData.sounds || 0,
        notes: sceneData.notes?.length || 0,
      },
    };

    if (includeTokens && sceneData.tokens) {
      response.tokens = this.formatTokens(sceneData.tokens, includeHidden);
      response.tokenSummary = this.createTokenSummary(sceneData.tokens, includeHidden);
    }

    if (sceneData.notes && sceneData.notes.length > 0) {
      response.notes = sceneData.notes.map((note: any) => ({
        id: note.id,
        text: this.truncateText(note.text, 100),
        position: { x: note.x, y: note.y },
      }));
    }

    return response;
  }

  private formatTokens(tokens: any[], includeHidden: boolean): any[] {
    return tokens
      .filter(token => includeHidden || !token.hidden)
      .map(token => ({
        id: token.id,
        name: token.name,
        position: {
          x: token.x,
          y: token.y,
        },
        size: {
          width: token.width,
          height: token.height,
        },
        actorId: token.actorId,
        disposition: this.getDispositionName(token.disposition),
        hidden: token.hidden,
        hasImage: !!token.img,
      }));
  }

  private createTokenSummary(tokens: any[], includeHidden: boolean): any {
    const visibleTokens = includeHidden ? tokens : tokens.filter(t => !t.hidden);

    const summary = {
      total: visibleTokens.length,
      byDisposition: {
        friendly: 0,
        neutral: 0,
        hostile: 0,
        unknown: 0,
      },
      hasActors: 0,
      withoutActors: 0,
    };

    visibleTokens.forEach(token => {
      // Count by disposition
      const disposition = this.getDispositionName(token.disposition);
      if (disposition in summary.byDisposition) {
        summary.byDisposition[disposition as keyof typeof summary.byDisposition]++;
      } else {
        summary.byDisposition.unknown++;
      }

      // Count actor association
      if (token.actorId) {
        summary.hasActors++;
      } else {
        summary.withoutActors++;
      }
    });

    return summary;
  }

  private formatWorldResponse(worldData: any): any {
    return {
      id: worldData.id,
      title: worldData.title,
      system: {
        id: worldData.system,
        version: worldData.systemVersion,
      },
      foundry: {
        version: worldData.foundryVersion,
      },
      users: {
        total: worldData.users?.length || 0,
        active: worldData.users?.filter((u: any) => u.active).length || 0,
        gms: worldData.users?.filter((u: any) => u.isGM).length || 0,
        players: worldData.users?.filter((u: any) => !u.isGM).length || 0,
      },
      activeUsers: worldData.users
        ?.filter((u: any) => u.active)
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          isGM: u.isGM,
        })) || [],
    };
  }

  private getDispositionName(disposition: number): string {
    switch (disposition) {
      case -1:
        return 'hostile';
      case 0:
        return 'neutral';
      case 1:
        return 'friendly';
      default:
        return 'unknown';
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}