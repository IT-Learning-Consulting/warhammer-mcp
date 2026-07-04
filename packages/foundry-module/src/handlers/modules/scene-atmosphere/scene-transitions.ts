// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 6B — scene-transitions action handlers.
//
// All play/end handlers call game.modules.get('scene-transitions').api.macro(options, showMe)
// DIRECTLY in-handler (handlers run inside Foundry via CONFIG.queries — no macro-execute bridge needed).
// Confirmed by sequencer precedent: handlers that need module API calls invoke them in-handler.
//
// Transport confirmation:
//   The scene-transitions module's api.macro() is a live JavaScript function reference accessible
//   at: game.modules.get('scene-transitions').api.macro
//   When called from inside a CONFIG.queries handler, it runs in the same Foundry browser context.
//   socketlib is required for the socket broadcast; this is confirmed as active by the
//   SOCKETLIB_ACTIONS dispatcher guard before these handlers are reached.
//
// CRITICAL — fromSocket field:
//   NEVER set options.fromSocket=true in outbound calls. The macro() routing function sets it
//   automatically when dispatching. Setting it would cause macro() to execute locally instead
//   of broadcasting via socketlib.
//
// Per-scene flag operations (set/get/delete-scene-transition) use standard scene.setFlag/getFlag/unsetFlag.
// No socketlib required for flag operations — only play-transition and end-transition need it.
//
// Notify contract:
//   - play-transition, end-transition: notify.updated('scene', '<current scene>', { summary }) after success.
//   - set-scene-transition per-scene: notify.updated('scene', sceneName, { summary }) after write.
//   - delete-scene-transition: notify.deleted('scene', sceneName, { summary }) after unset.
//   - get-scene-transition, read operations: silent.
//
// Post-write verify (DP-16):
//   After setFlag/unsetFlag, re-read the flag and include verified state in response.
//
// Anchors:
//   - scene-transitions/audit.md §3 + §4 + §6 + §7
//   - scene-transitions/capability-manifest.json
//   - CCR-4 confirm gate on delete-scene-transition

import { notify } from '../../../notify.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import type { ModuleSceneAtmosphereInputType } from '@foundry-mcp/shared';
import { Envelope, getGame, getCanvas } from '../_shared/handler-utils.js';


// ── API accessors ─────────────────────────────────────────────────────────────

function getSceneTransitionsAPI(): any {
  const api = getGame()?.modules?.get?.('scene-transitions')?.api;
  if (!api) {
    throw new Error('SCENE_TRANSITIONS_API_UNAVAILABLE: game.modules.get("scene-transitions").api not bound (module may not be fully initialised)');
  }
  return api;
}

// ── Scene resolution ──────────────────────────────────────────────────────────

function resolveScene(sceneId: string): any {
  const game = getGame();
  const byId = game?.scenes?.get?.(sceneId);
  if (byId) return byId;
  const byUuid = game?.scenes?.find?.((s: any) => s.uuid === sceneId);
  if (byUuid) return byUuid;
  throw new Error(`SCENE_NOT_FOUND: No scene with id/UUID "${sceneId}"`);
}

function getCurrentSceneName(): string {
  try {
    return getCanvas()?.scene?.name ?? 'current scene';
  } catch {
    return 'current scene';
  }
}

// ── Type aliases ──────────────────────────────────────────────────────────────

type PlayTransitionInput = Extract<ModuleSceneAtmosphereInputType, { action: 'play-transition' }>;
type EndTransitionInput = Extract<ModuleSceneAtmosphereInputType, { action: 'end-transition' }>;
type SetSceneTransitionInput = Extract<ModuleSceneAtmosphereInputType, { action: 'set-scene-transition' }>;
type GetSceneTransitionInput = Extract<ModuleSceneAtmosphereInputType, { action: 'get-scene-transition' }>;
type DeleteSceneTransitionInput = Extract<ModuleSceneAtmosphereInputType, { action: 'delete-scene-transition' }>;

// ── play-transition ───────────────────────────────────────────────────────────

export async function handlePlayTransition(input: PlayTransitionInput): Promise<Envelope<unknown>> {
  try {
    const API = getSceneTransitionsAPI();
    const showMe = input.showMe ?? true;

    // Build the options object — never include fromSocket in outbound calls.
    // The macro() function sets fromSocket=true internally when dispatching.
    const options: Record<string, unknown> = { ...input.transitionOptions };

    // Invoke the primary programmatic entry point for socket broadcast
    await API.macro(options, showMe);

    const sceneName = getCurrentSceneName();
    const contentSnippet = typeof options.content === 'string' && options.content
      ? options.content.slice(0, 60).replace(/<[^>]+>/g, '').trim()
      : null;
    const summary = [
      `play-transition: showMe=${showMe}`,
      contentSnippet ? `content="${contentSnippet}"` : null,
      options.bgImg ? `bgImg set` : null,
      Array.isArray(options.users) && (options.users as string[]).length > 0
        ? `users=[${(options.users as string[]).join(',')}]`
        : null,
    ].filter(Boolean).join(', ');

    notify.updated('scene', sceneName, { summary });

    return {
      success: true,
      data: {
        played: true,
        showMe,
        options,
        note: 'Transition broadcast via API.macro(). Transient — no document written. Use set-scene-transition to persist a default.',
      },
    };
  } catch (e) {
    return { success: false, error: `PLAY_TRANSITION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── end-transition ────────────────────────────────────────────────────────────

export async function handleEndTransition(_input: EndTransitionInput): Promise<Envelope<unknown>> {
  try {
    const API = getSceneTransitionsAPI();

    // End-transition: broadcast action:"end" to all via executeForEveryone
    await API.macro({ action: 'end' }, true);

    const sceneName = getCurrentSceneName();
    notify.updated('scene', sceneName, {
      summary: 'end-transition: broadcast action:end to all clients via executeForEveryone',
    });

    return {
      success: true,
      data: {
        ended: true,
        note: 'Sent action:"end" via API.macro() with showMe=true — broadcasts to all clients via executeForEveryone.',
      },
    };
  } catch (e) {
    return { success: false, error: `END_TRANSITION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-scene-transition ──────────────────────────────────────────────────────

export async function handleSetSceneTransition(input: SetSceneTransitionInput): Promise<Envelope<unknown>> {
  try {
    const game = getGame();

    switch (input.subAction) {
      case 'per-scene': {
        if (!input.sceneId) {
          return { success: false, error: 'SET_SCENE_TRANSITION_ERROR: sceneId required for subAction=per-scene' };
        }
        if (!input.transitionOptions) {
          return { success: false, error: 'SET_SCENE_TRANSITION_ERROR: options required for subAction=per-scene' };
        }
        const scene = resolveScene(input.sceneId);
        const flagValue = { options: input.transitionOptions };
        await scene.setFlag('scene-transitions', 'transition', flagValue);

        // Post-write verify
        const verified = scene.getFlag?.('scene-transitions', 'transition') ?? null;
        const verifiedHasOptions = Boolean(verified && typeof verified === 'object' && 'options' in verified);

        notify.updated('scene', scene.name ?? input.sceneId, {
          summary: `set-scene-transition per-scene: saved transition options on scene "${scene.name ?? input.sceneId}"`,
        });

        return {
          success: true,
          data: {
            subAction: 'per-scene',
            sceneId: scene.id,
            sceneName: scene.name ?? input.sceneId,
            savedOptions: input.transitionOptions,
            verifiedHasOptions,
            note: 'Saved as flags["scene-transitions"].transition. Use play-transition to broadcast, or end-transition to clear.',
          },
        };
      }

      case 'world-default': {
        if (!input.transitionOptions) {
          return { success: false, error: 'SET_SCENE_TRANSITION_ERROR: options required for subAction=world-default' };
        }
        await game?.settings?.set?.('scene-transitions', 'default-options', input.transitionOptions);

        // Post-write verify
        let verifiedSettings: unknown = null;
        try {
          verifiedSettings = game?.settings?.get?.('scene-transitions', 'default-options') ?? null;
        } catch {
          verifiedSettings = null;
        }

        notify.updated('setting', 'scene-transitions default-options', {
          summary: 'set-scene-transition world-default: updated world default transition options',
        });

        return {
          success: true,
          data: {
            subAction: 'world-default',
            savedOptions: input.transitionOptions,
            verified: verifiedSettings !== null,
            note: 'Saved as game.settings("scene-transitions","default-options"). Applied as base for all new SceneTransitionOptions instances.',
          },
        };
      }

      case 'show-journal': {
        if (input.showJournal === undefined) {
          return { success: false, error: 'SET_SCENE_TRANSITION_ERROR: showJournal required for subAction=show-journal' };
        }
        await game?.settings?.set?.('scene-transitions', 'show-journal-header-transition', input.showJournal);

        // Post-write verify (mirrors the per-scene/world-default siblings above — this site had
        // none at baseline; RC1.1b consistency fix). Boolean() coercion tolerance (settle-poll
        // §8 F03 sibling gotcha): game.settings.get() coerces to the registered type.
        let verifiedShowJournal: unknown = null;
        try {
          verifiedShowJournal = game?.settings?.get?.('scene-transitions', 'show-journal-header-transition') ?? null;
        } catch {
          verifiedShowJournal = null;
        }
        if (Boolean(verifiedShowJournal) !== Boolean(input.showJournal)) {
          return {
            success: false,
            error: `${ErrorTokens.SCENE_ATMOSPHERE_TRANSITION_NOT_PERSISTED}: show-journal-header-transition expected ${input.showJournal}, got ${verifiedShowJournal}`,
          };
        }

        notify.updated('setting', 'scene-transitions show-journal-header-transition', {
          summary: `set-scene-transition show-journal: showJournal=${input.showJournal}`,
        });

        return {
          success: true,
          data: {
            subAction: 'show-journal',
            showJournal: input.showJournal,
            verified: Boolean(verifiedShowJournal) === Boolean(input.showJournal),
            note: 'Controls whether the "Play as Transition" button appears in Journal window headers.',
          },
        };
      }

      default: {
        const _never: never = input.subAction;
        return { success: false, error: `SET_SCENE_TRANSITION_ERROR: Unknown subAction "${String(_never)}"` };
      }
    }
  } catch (e) {
    return { success: false, error: `SET_SCENE_TRANSITION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-scene-transition ──────────────────────────────────────────────────────

export async function handleGetSceneTransition(input: GetSceneTransitionInput): Promise<Envelope<unknown>> {
  try {
    const game = getGame();

    switch (input.subAction) {
      case 'per-scene': {
        if (!input.sceneId) {
          return { success: false, error: 'GET_SCENE_TRANSITION_ERROR: sceneId required for subAction=per-scene' };
        }
        const scene = resolveScene(input.sceneId);
        const saved = scene.getFlag?.('scene-transitions', 'transition') ?? null;

        return {
          success: true,
          data: {
            subAction: 'per-scene',
            sceneId: scene.id,
            sceneName: scene.name ?? input.sceneId,
            hasTransition: saved !== null && saved !== undefined,
            transition: saved,
            note: saved ? 'Use play-transition to broadcast this saved transition.' : 'No per-scene transition saved. Use set-scene-transition to define one.',
          },
        };
      }

      case 'world-default': {
        let settings: unknown = null;
        try {
          settings = game?.settings?.get?.('scene-transitions', 'default-options') ?? null;
        } catch {
          settings = null;
        }

        return {
          success: true,
          data: {
            subAction: 'world-default',
            defaultOptions: settings,
            hasDefault: settings !== null,
            note: 'World default options applied as base for all new SceneTransitionOptions instances. Per-scene options override these.',
          },
        };
      }

      default: {
        const _never: never = input.subAction;
        return { success: false, error: `GET_SCENE_TRANSITION_ERROR: Unknown subAction "${String(_never)}"` };
      }
    }
  } catch (e) {
    return { success: false, error: `GET_SCENE_TRANSITION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── delete-scene-transition ───────────────────────────────────────────────────

export async function handleDeleteSceneTransition(input: DeleteSceneTransitionInput): Promise<Envelope<unknown>> {
  try {
    const scene = resolveScene(input.sceneId);

    // Check if a transition exists before deleting
    const existing = scene.getFlag?.('scene-transitions', 'transition') ?? null;
    const hadTransition = existing !== null && existing !== undefined;

    await scene.unsetFlag?.('scene-transitions', 'transition');

    // Post-write verify
    const verified = scene.getFlag?.('scene-transitions', 'transition') ?? null;
    const verifiedDeleted = verified === null || verified === undefined;

    notify.deleted('scene', scene.name ?? input.sceneId, {
      summary: `delete-scene-transition: unset flags["scene-transitions"].transition on "${scene.name ?? input.sceneId}"`,
    });

    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName: scene.name ?? input.sceneId,
        hadTransition,
        deleted: true,
        verifiedDeleted,
        note: 'Per-scene default transition flag removed. World default-options setting is unaffected.',
      },
    };
  } catch (e) {
    return { success: false, error: `DELETE_SCENE_TRANSITION_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
