// services/scene-placement.ts — MCP Code-Quality Hardening v1, Phase 5 (R5.1).
//
// The scene/token-placement cluster, extracted verbatim from data-access.ts (branch-by-abstraction
// Migrate; FoundryDataAccess keeps thin facade delegates until the Phase 6 Contract step). The only
// seams are the injected validateState + auditLog callbacks (were this.validateFoundryState / this.auditLog).
// Zero behavioral change. applyTemplateToToken (template-apply-coupled) is deferred to Phase 6;
// createActorFromSource / getOrCreateFolder (actor-creation domain) stay on FoundryDataAccess (Phase 7).

import { ERROR_MESSAGES, TOKEN_DISPOSITIONS } from '../constants.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { notify } from '../notify.js';
import { buildOperationReceipt } from './shared/operation-receipt.js';
import type { SceneInfo, SceneTokenPlacement, TokenPlacementResult } from '../service-interfaces.js';

export class ScenePlacementService {
  constructor(
    private readonly validateState: () => void,
    private readonly auditLog: (operation: string, data: any, result: 'success' | 'failure', error?: string) => void,
  ) {}

  async getActiveScene(options: { sceneId?: string } = {}): Promise<SceneInfo> {

    const scene = options.sceneId
      ? (game.scenes as any).get(options.sceneId)
      : (game.scenes as any).current;
    if (!scene) {
      throw new Error(
        options.sceneId
          ? `Scene not found: ${options.sceneId}`
          : ERROR_MESSAGES.SCENE_NOT_FOUND
      );
    }

    const sceneData: SceneInfo = {
      id: scene.id,
      name: scene.name,
      img: scene.img || undefined,
      background: scene.background?.src || undefined,
      width: scene.width,
      height: scene.height,
      padding: scene.padding,
      active: scene.active,
      navigation: scene.navigation,
      tokens: scene.tokens.map((token: any) => ({
        id: token.id,
        name: token.name,
        x: token.x,
        y: token.y,
        width: token.width,
        height: token.height,
        actorId: token.actorId || undefined,
        img: token.texture?.src || '',
        hidden: token.hidden,
        disposition: this.getTokenDisposition(token.disposition),
      })),
      walls: scene.walls.size,
      lights: scene.lights.size,
      sounds: scene.sounds.size,
      notes: scene.notes.map((note: any) => ({
        id: note.id,
        text: note.text || '',
        x: note.x,
        y: note.y,
      })),
    };

    return sceneData;
  }

  /**
   * Get token disposition as number
   */
  private getTokenDisposition(disposition: any): number {
    if (typeof disposition === 'number') {
      return disposition;
    }

    // Default to neutral if unknown
    return TOKEN_DISPOSITIONS.NEUTRAL;
  }

  /**
   * Add actors to the current scene as tokens
   */
  async addActorsToScene(placement: SceneTokenPlacement): Promise<TokenPlacementResult> {
    this.validateState();

    // TOOL-IDEA-004 (2026-05-14): optional `sceneId` targets a non-active scene.
    // `scene.createEmbeddedDocuments('Token', ...)` is a DB write that works regardless
    // of canvas/active state — tokens become visible when the GM later views the scene.
    const scene = (placement as any).sceneId
      ? (game.scenes as any).get((placement as any).sceneId)
      : (game.scenes as any).current;
    if (!scene) {
      throw new Error(
        (placement as any).sceneId
          ? `Scene not found: ${(placement as any).sceneId}`
          : 'No active scene found'
      );
    }

    try {
      const tokenData: any[] = [];
      const errors: string[] = [];
      // RC1.2 — additive-only per-item failure detail, pushed alongside every `errors.push`.
      const failedItems: Array<{ id: string; reason: string }> = [];
      // BUG-270: compute total token count up-front so grid cols is stable across the batch.
      const totalTokenCount = placement.actorIds.reduce((sum, _, ai) =>
        sum + Math.max(1, placement.quantities?.[ai] ?? 1), 0);

      for (let ai = 0; ai < placement.actorIds.length; ai++) {
        const actorId = placement.actorIds[ai]!;
        const qty = Math.max(1, placement.quantities?.[ai] ?? 1);
        try {
          const actor = game.actors.get(actorId);
          if (!actor) {
            const reason = `Actor ${actorId} not found`;
            errors.push(reason);
            failedItems.push({ id: actorId, reason });
            continue;
          }

          // BUG-051 hotfix: if actor uses linked tokens, note it in the audit log — user may
          // have wanted unlinked (prototype) tokens for per-token independent HP. Proceed anyway.
          if ((actor as any).prototypeToken?.actorLink === true && qty > 1) {
            this.auditLog('addActorsToScene', { actorId, quantity: qty }, 'success', 'actor.prototypeToken.actorLink=true — N tokens share one ActorDelta');
          }

          for (let i = 0; i < qty; i++) {
            const tokenDoc = (actor as any).prototypeToken.toObject();
            const position = this.calculateTokenPosition(placement.placement, scene, tokenData.length, placement.coordinates, totalTokenCount);

            if (tokenDoc.texture?.src?.startsWith('http')) {
              notify.warn(`Token texture still remote: ${tokenDoc.texture.src} — placement may render poorly`);
              tokenDoc.texture.src = null;
            }

            tokenData.push({
              ...tokenDoc,
              x: position.x,
              y: position.y,
              actorId: actorId,
              hidden: placement.hidden,
            });
          }
        } catch (error) {
          const reason = `Failed to prepare token for actor ${actorId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(reason);
          failedItems.push({ id: actorId, reason });
        }
      }

      const createdTokens = await scene.createEmbeddedDocuments('Token', tokenData);
      // RC1.1a — assert against `tokenData` (what we actually SENT to create), never against
      // the caller's raw actorIds/errors[]: `tokenData` already excludes upstream placement
      // failures (missing actor / per-token prep errors, tracked separately in `errors[]`), so
      // any shortfall here is a genuine create-time drop, not a double-count of an upstream skip.
      if (createdTokens.length !== tokenData.length) {
        throw new Error(
          `${ErrorTokens.SCENE_PLACEMENT_TOKEN_NOT_PERSISTED}: expected ${tokenData.length} token(s), got ${createdTokens.length}`,
        );
      }

      if (createdTokens.length > 0) {
        notify.created('token', `${createdTokens.length} token(s)`, {
          summary: `on ${scene.name}`,
        });
      }

      // TOOL-IDEA-005 (2026-05-14): surface placed token names alongside IDs so callers
      // chaining encounter-builder workflows can read auto-counter-renamed names (e.g.
      // "Skeleton (3)") without a follow-up `get-current-scene` over-fetch. `tokenIds`
      // is preserved for back-compat with existing skill prompts.
      // RC1.2 — additive receipt: BATCH_PARTIAL_FAILURE only when SOME (not all, not none) of the
      // requested actors failed placement; `errors` legacy field is untouched above.
      const requestedCount = placement.actorIds.length;
      const receiptWarnings = failedItems.length > 0 && failedItems.length < requestedCount
        ? [ErrorTokens.BATCH_PARTIAL_FAILURE]
        : [];
      const result: TokenPlacementResult = {
        success: createdTokens.length > 0,
        tokensCreated: createdTokens.length,
        tokenIds: createdTokens.map((token: any) => token.id),
        tokens: createdTokens.map((token: any) => ({
          id: token.id,
          name: token.name,
          actorId: token.actorId,
        })),
        sceneId: scene.id,
        sceneName: scene.name,
        ...(errors.length > 0 ? { errors } : {}),
        ...buildOperationReceipt({
          created: createdTokens.map((token: any) => token.id),
          warnings: receiptWarnings,
          failed: failedItems,
        }),
      };

      // BUG-265: audit after the operation; report partial failure when per-token errors occurred.
      if (errors.length > 0) {
        this.auditLog('addActorsToScene', placement, 'failure', `partial: ${errors.join('; ')}`);
      } else {
        this.auditLog('addActorsToScene', placement, 'success');
      }
      return result;

    } catch (error) {
      this.auditLog('addActorsToScene', placement, 'failure', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Calculate token position based on placement strategy
   */
  // BUG-270: accept total token count so grid cols is fixed for the whole batch.
  private calculateTokenPosition(placement: 'random' | 'grid' | 'center' | 'coordinates', scene: any, index: number, coordinates?: { x: number; y: number }[], total?: number): { x: number; y: number } {
    const gridSize = scene.grid?.size || 100;
    // BUG-270: cols must be derived from the full batch size, not per-index.
    const effectiveTotal = (total != null && total > 0) ? total : (index + 1);
    const fixedCols = Math.ceil(Math.sqrt(effectiveTotal));

    switch (placement) {
      case 'coordinates':
        if (coordinates && coordinates[index]) {
          return coordinates[index];
        }
        // Fallback to grid if coordinates not provided or insufficient
        const fallbackRow = Math.floor(index / fixedCols);
        const fallbackCol = index % fixedCols;
        return {
          x: gridSize + (fallbackCol * gridSize * 2),
          y: gridSize + (fallbackRow * gridSize * 2),
        };

      case 'center':
        return {
          x: (scene.width / 2) + (index * gridSize),
          y: scene.height / 2,
        };

      case 'grid':
        const row = Math.floor(index / fixedCols);
        const col = index % fixedCols;
        return {
          x: gridSize + (col * gridSize * 2),
          y: gridSize + (row * gridSize * 2),
        };

      case 'random':
      default:
        return {
          x: Math.random() * (scene.width - gridSize),
          y: Math.random() * (scene.height - gridSize),
        };
    }
  }

  /**
   * List all scenes with filtering options
   * TOOL-IDEA-001 (2026-05-14): pagination + count-only mode. Bare-array response
   * preserved when none of page/pageSize/countOnly is provided (back-compat).
   * When any pagination param is set, returns `{total, page, pageSize, pageCount, scenes}`.
   * When countOnly is set, returns `{total, filterApplied}` only.
   */
  async listScenes(options: {
    filter?: string;
    include_active_only?: boolean;
    page?: number;
    pageSize?: number;
    countOnly?: boolean;
  } = {}): Promise<any> {
    this.validateState();

    try {
      let scenes = game.scenes?.contents || [];

      // Filter by active only if requested
      if (options.include_active_only) {
        scenes = scenes.filter((scene: any) => scene.active);
      }

      // Filter by name if provided
      if (options.filter) {
        const filterLower = options.filter.toLowerCase();
        scenes = scenes.filter((scene: any) =>
          scene.name.toLowerCase().includes(filterLower)
        );
      }

      const total = scenes.length;
      const filterApplied = !!(options.filter || options.include_active_only);

      // Count-only short-circuit: caller wants to probe inventory size before paging.
      if (options.countOnly) {
        return { total, filterApplied };
      }

      const projectScene = (scene: any) => ({
        id: scene.id,
        name: scene.name,
        active: scene.active,
        dimensions: {
          width: scene.dimensions?.width || (scene as any).width || 0,
          height: scene.dimensions?.height || (scene as any).height || 0
        },
        gridSize: scene.grid?.size || 100,
        background: scene.background?.src || scene.img || '',
        walls: scene.walls?.size || 0,
        tokens: scene.tokens?.size || 0,
        lighting: scene.lights?.size || 0,
        sounds: scene.sounds?.size || 0,
        navigation: scene.navigation || false
      });

      const paginate = options.page !== undefined || options.pageSize !== undefined;
      if (paginate) {
        const pageSize = options.pageSize ?? 50;
        const page = options.page ?? 1;
        const start = (page - 1) * pageSize;
        const pageScenes = scenes.slice(start, start + pageSize).map(projectScene);
        return {
          total,
          page,
          pageSize,
          pageCount: Math.max(1, Math.ceil(total / pageSize)),
          scenes: pageScenes,
        };
      }

      // Back-compat: bare array when no pagination/count params are set.
      return scenes.map(projectScene);
    } catch (error) {
      throw new Error(`Failed to list scenes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch to a different scene
   */
  async switchScene(options: { scene_identifier: string; optimize_view?: boolean | undefined }): Promise<any> {
    this.validateState();

    try {
      // Find the target scene by ID or name
      const scenes = game.scenes?.contents || [];
      const targetScene = scenes.find((scene: any) =>
        scene.id === options.scene_identifier ||
        scene.name.toLowerCase() === options.scene_identifier.toLowerCase()
      );

      if (!targetScene) {
        throw new Error(`Scene not found: "${options.scene_identifier}"`);
      }

      // Activate the scene
      await targetScene.activate();

      // Optimize view if requested (default true)
      if (options.optimize_view !== false && typeof canvas !== 'undefined' && canvas?.scene) {
        const dimensions = targetScene.dimensions || {
          width: (targetScene as any).width || 0,
          height: (targetScene as any).height || 0
        };
        const width = (dimensions as any).width || 0;
        const height = (dimensions as any).height || 0;

        if (width && height) {
          // Center the view on the scene (canvas.pan is synchronous in v13 — no await)
          canvas.pan({
            x: width / 2,
            y: height / 2,
            scale: Math.min(
              (canvas as any).screenDimensions?.[0] / width || 1,
              (canvas as any).screenDimensions?.[1] / height || 1,
              1
            )
          });
        }
      }

      return {
        success: true,
        sceneId: targetScene.id,
        sceneName: targetScene.name,
        dimensions: {
          width: (targetScene.dimensions as any)?.width || (targetScene as any).width || 0,
          height: (targetScene.dimensions as any)?.height || (targetScene as any).height || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to switch scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // BUG-051 hotfix companion — delete a single scene token. Pairs with addActorsToScene.
  async deleteToken(data: { sceneId: string; tokenId: string }): Promise<any> {
    this.validateState();

    try {
      const scene: any = (game.scenes as any)?.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found with ID: ${data.sceneId}`);
      }

      const token: any = scene.tokens?.get(data.tokenId);
      if (!token) {
        throw new Error(`Token not found with ID: ${data.tokenId} on scene ${scene.name}`);
      }

      const tokenName = token.name;

      await scene.deleteEmbeddedDocuments('Token', [data.tokenId]);
      if (scene.tokens?.get(data.tokenId)) {
        throw new Error(`${ErrorTokens.SCENE_PLACEMENT_TOKEN_NOT_PERSISTED}: token ${data.tokenId} still present on scene ${scene.name} after delete`);
      }

      notify.deleted('token', tokenName, { summary: `from scene ${scene.name}` });

      return {
        success: true,
        sceneId: scene.id,
        tokenId: data.tokenId,
        tokenName,
      };
    } catch (error) {
      throw new Error(`Failed to delete token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
