// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file.
// Module Integration v1 Phase 2 — module-matt shared helpers (scene/tile resolution,
// action-payload normalization, tagger selector resolution, impact reporting).
// mcp_code_quality_v2 Phase C3 (19b split): extracted verbatim from matt.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { deepStripUndefined } from '../../../utils/embeddedCRUDFactory.js';
import { ACTION_CATALOG, isDangerousAction, makeMattId, type MattActionInput } from '@foundry-mcp/shared';
import type { MattActionObjType } from '@foundry-mcp/shared';

export const MATT_FLAG = 'monks-active-tiles';

// BUG-746: native MATT actions each read their own audience/visibility field — there is no
// generic `for` field. Verified against monks-active-tiles/actions.js (v13.06):
//   notification (2866), chatmessage (2931), tempimage (1881), dialog (5881),
//   openjournal (3830), openactor (4054) all read `data.showto`.
//   showimage (2626) reads `data.showfor`. playanimation (3691) reads `data.animatefor`.
// The skill previously authored a generic `for` (including `for:"gm"`), which every one of
// these actions silently ignores — falling back to each action's own default audience
// (frequently "everyone"/"all"), which is how a GM-only chatmessage/notification/dialog
// leaked to players. This map translates the skill's `for` alias to the correct native key
// per action; actions NOT in this map are left untouched (either they have no audience concept,
// or — like closedialog/scrollingtext/preload — they natively read `for` already).
const AUDIENCE_FIELD_BY_ACTION: Record<string, string> = {
  notification: 'showto',
  chatmessage: 'showto',
  tempimage: 'showto',
  dialog: 'showto',
  openjournal: 'showto',
  openactor: 'showto',
  showimage: 'showfor',
  playanimation: 'animatefor',
};

// ── Local helpers (mirror region.ts; kept package-local, CCR-5) ───────────────

export function getSceneOrThrow(sceneId: string): any {
  const scene = (globalThis as any).game?.scenes?.get(sceneId);
  if (!scene) throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  return scene;
}

export function getActiveSceneOrThrow(): any {
  const scene = (globalThis as any).game?.scenes?.active;
  if (!scene) throw new Error('NO_ACTIVE_SCENE: no scene is currently active');
  return scene;
}

/** Resolve a tile UUID (Scene.<sid>.Tile.<tid>) to its scene + tile document. */
export function getTileByUuidOrThrow(uuid: string): { scene: any; tile: any } {
  const sync = (globalThis as any).fromUuidSync;
  if (typeof sync === 'function') {
    try {
      const tile = sync(uuid);
      if (tile) {
        const scene = tile.parent ?? tile.scene ?? null;
        if (scene) return { scene, tile };
      }
    } catch {
      // fall through to manual parse
    }
  }
  const m = /^Scene\.([^.]+)\.Tile\.([^.]+)$/.exec(uuid);
  if (m) {
    const scene = (globalThis as any).game?.scenes?.get(m[1]);
    const tile = scene?.tiles?.get(m[2]);
    if (scene && tile) return { scene, tile };
  }
  throw new Error(`MATT_TILE_NOT_FOUND: no Tile resolvable from uuid "${uuid}"`);
}

/** Read the persisted MATT flag block from _source (F08-safe). */
export function readMattFlags(tile: any): Record<string, any> {
  return (tile._source?.flags?.[MATT_FLAG] ?? tile.flags?.[MATT_FLAG] ?? {}) as Record<string, any>;
}

/** Extract a Macro UUID/id from an entity value if it refers to a Macro, else null (BUG-754). */
function extractMacroRef(entity: unknown): string | null {
  if (typeof entity === 'string') {
    return entity.startsWith('Macro.') ? entity : null;
  }
  if (entity && typeof entity === 'object' && !Array.isArray(entity)) {
    const id = (entity as Record<string, unknown>).id;
    if (typeof id === 'string' && id.startsWith('Macro.')) return id;
  }
  return null;
}

/** Fill source-observed MATT defaults and aliases before catalog validation/write. */
export function normalizeActionData(action: string, raw: Record<string, unknown> | undefined, sceneId?: string): Record<string, unknown> {
  const data = deepStripUndefined({ ...(raw ?? {}) }) as Record<string, unknown>;

  if (action === 'chatmessage' && data.language === undefined) {
    data.language = '';
  }

  // BUG-746: translate the ambiguous `for` alias to the action's real native audience field,
  // then remove `for` so it can never silently pass through as an inert/ignored key.
  const audienceField = AUDIENCE_FIELD_BY_ACTION[action];
  if (audienceField !== undefined && data.for !== undefined) {
    if (data[audienceField] === undefined) {
      data[audienceField] = data.for;
    }
    delete data.for;
  }

  if (action === 'scrollingtext') {
    const content = typeof data.content === 'string' ? data.content : (typeof data.text === 'string' ? data.text : undefined);
    if (content !== undefined) {
      if (data.content === undefined) data.content = content;
      if (data.text === undefined) data.text = content;
    }
    if (data.anchor === undefined) data.anchor = 0;
    if (data.direction === undefined) data.direction = 2;
    if (data.duration === undefined) data.duration = 5;
  }

  if (action === 'checkvariable' && data.type === undefined) {
    data.type = 'all';
  }

  if (action === 'runmacro' && data.macroid === undefined && data.macroUuid !== undefined) {
    data.macroid = data.macroUuid;
  }

  // BUG-754: native MATT's runmacro `fn` (actions.js ~3155) resolves the macro via
  // `entity` whenever `entity` is present at all — `if (!action.data.entity) { ...macroid...}
  // else { entities = await MonksActiveTiles.getEntities(args, "macros"); }` — so `macroid`
  // is silently ignored while `entity` (frequently the current Tile, per BUG-255-era authoring)
  // wins instead. Strip the precedence-breaking `entity` so `macroid` actually fires; but if
  // `entity` is ITSELF a Macro reference pointing at a different macro than `macroid`, that is
  // a genuine ambiguous conflict — reject rather than silently guess which one the author meant.
  if (action === 'runmacro' && data.macroid !== undefined && data.entity !== undefined) {
    const entityMacroRef = extractMacroRef(data.entity);
    if (entityMacroRef !== null && entityMacroRef !== String(data.macroid)) {
      throw new Error(
        `RUNMACRO_ENTITY_MACROID_CONFLICT: runmacro action specifies both entity (${entityMacroRef}) and macroid (${String(data.macroid)}) referring to different macros — remove one.`,
      );
    }
    delete data.entity;
  }

  // BUG-260: upstream MATT runs a bare "true"/"false" setvariable value through a broken
  // ternary (getValue ~line 335) that stores boolean false for BOTH literals; the "="
  // prefix takes the dedicated safe boolean path (~lines 330-338). Normalize on write.
  if (action === 'setvariable' && typeof data.value === 'string') {
    const v = (data.value as string).trim();
    if (v === 'true' || v === 'false') data.value = `= ${v}`;
  }

  // BUG-262: upstream checkvariable evals `<prop> <comparison>`; a bare unquoted string
  // identifier RHS throws ReferenceError inside that eval and falls back to the original
  // (truthy) comparison string — the check then ALWAYS passes, even on absent variables.
  // Quote bare identifiers so the comparison actually evaluates.
  if (action === 'checkvariable' && typeof data.value === 'string') {
    const m = /^(==|!=)\s*([A-Za-z_][A-Za-z0-9_-]*)$/.exec((data.value as string).trim());
    if (m && !['true', 'false', 'null', 'undefined', 'NaN'].includes(m[2]!)) {
      data.value = `${m[1]} "${m[2]}"`;
    }
  }

  // BUG-259: MATT's runtime getEntities reads match/scene off the entity OBJECT — a bare
  // "tagger:<tag>" string loses both options. Coerce to the canonical object form, and
  // pin scene to the TILE's scene id, not "_active": MATT resolves "_active" against the
  // user's currently-VIEWED scene at fire time, so a tile fired via MCP while the GM views
  // another scene silently matches 0 documents (live-confirmed root cause of BUG-259).
  const taggerScene = sceneId ?? '_active';
  for (const field of ['entity', 'location', 'target']) {
    const value = data[field];
    if (typeof value === 'string' && value.startsWith('tagger:')) {
      data[field] = { id: value, match: 'any', scene: taggerScene };
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      if (typeof obj.id === 'string' && obj.id.startsWith('tagger:')) {
        if (obj.match === undefined) obj.match = 'any';
        if (obj.scene === undefined || obj.scene === '_active') obj.scene = taggerScene;
      }
    }
  }

  if (action === 'scene') {
    const entity = typeof data.entity === 'string' ? data.entity : undefined;
    const sceneid = typeof data.sceneid === 'string' ? data.sceneid : undefined;
    if (data.sceneid === undefined && entity?.startsWith('Scene.')) {
      data.sceneid = entity;
    }
    if (data.entity === undefined && sceneid !== undefined) {
      data.entity = sceneid.startsWith('Scene.') ? sceneid : `Scene.${sceneid}`;
    }
  }

  return data;
}

/** Mint ids for any action lacking one; coerce to {id, action, data}. */
export function normalizeActions(actions: MattActionObjType[] | MattActionInput[], sceneId?: string): Array<{ id: string; action: string; data: Record<string, unknown> }> {
  return (actions ?? []).map((a) => ({
    id: a.id ?? makeMattId(),
    action: a.action,
    data: normalizeActionData(a.action, a.data as Record<string, unknown> | undefined, sceneId),
  }));
}

// ── Phase 5C.1: Tagger selector resolution ────────────────────────────────────
//
// Author-time validation of `tagger:<tag>` entity selectors in MATT action sequences.
// Replaces the soft `optionalDeps.tagger` boolean with real resolution data.
// Design (SA3): one shared helper called from writeActions + handleCreateTriggerTile.
//   - Fail-open: when taggerActive=false, returns empty resolution (current handlers
//     make ZERO Tagger calls, so this preserves the inherently-fail-open path).
//   - Explicit sceneId: game.canvas.id may be null server-side; always pass sceneId.
//   - ZERO_MATCH is a warning, not an error (tag may be applied shortly after author time).

type TaggerResolutionEntry = {
  actionIndex: number;
  field: string;
  tag: string;
  matchedCount: number;
  warn?: 'ZERO_MATCH';
};

type TaggerResolutionResult = {
  taggerResolution: TaggerResolutionEntry[];
  warnings: string[];
};

export async function resolveTaggerSelectorsInSequence(
  actions: Array<{ action: string; data: Record<string, unknown> }>,
  taggerActive: boolean,
  sceneId: string | undefined,
): Promise<TaggerResolutionResult> {
  if (!taggerActive) return { taggerResolution: [], warnings: [] };

  const Tagger = (globalThis as any).Tagger;
  if (!Tagger) return { taggerResolution: [], warnings: [] };

  const taggerResolution: TaggerResolutionEntry[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < actions.length; i++) {
    const data = actions[i]!.data ?? {};
    for (const field of ['entity', 'location', 'target'] as const) {
      const value = data[field as string];

      // Check string value for `tagger:<tag>` prefix
      let rawTag: string | undefined;
      if (typeof value === 'string') {
        const m = value.match(/^tagger:(.+)$/);
        if (m) rawTag = m[1];
      } else if (value && typeof value === 'object') {
        const id = (value as Record<string, unknown>).id;
        if (typeof id === 'string') {
          const m = id.match(/^tagger:(.+)$/);
          if (m) rawTag = m[1];
        }
      }
      if (!rawTag) continue;

      try {
        const opts: Record<string, unknown> = sceneId ? { sceneId } : {};
        const docs = await Tagger.getByTag([rawTag], opts);
        const matchedCount = Array.isArray(docs) ? docs.length : 0;
        const entry: TaggerResolutionEntry = { actionIndex: i, field, tag: rawTag, matchedCount };
        if (matchedCount === 0) {
          entry.warn = 'ZERO_MATCH';
          warnings.push(`action[${i}].${field}: tagger:"${rawTag}" matched 0 documents (tag may not exist yet — WARN only).`);
        }
        taggerResolution.push(entry);
      } catch {
        warnings.push(`action[${i}].${field}: tagger:"${rawTag}" resolution failed — tagger may be loading.`);
      }
    }
  }

  return { taggerResolution, warnings };
}

/** Impact report for a payload containing dangerous actions (CCR-4). */
export function buildImpactReport(actions: Array<{ action: string; data: Record<string, unknown> }>): {
  dangerous: Array<{ action: string; risk: string; body?: string }>;
} {
  const dangerous: Array<{ action: string; risk: string; body?: string }> = [];
  for (const a of actions) {
    if (!isDangerousAction(a.action)) continue;
    const entry: { action: string; risk: string; body?: string } = {
      action: a.action,
      risk:
        ACTION_CATALOG[a.action]?.repairGated
          ? 'REPAIR_GATED — no WFRP4e adapter; fires generic or errors'
          : 'SUPPORTED_WITH_CONFIRMATION — destructive/elevated-risk',
    };
    // Surface the source-visible body for code/macro actions (dossier §4).
    if (a.action === 'runcode' && typeof a.data?.code === 'string') entry.body = a.data.code as string;
    if (a.action === 'runmacro' && (a.data?.entity != null || a.data?.macroid != null || a.data?.macroUuid != null)) {
      const macroRef = a.data.entity ?? a.data.macroid ?? a.data.macroUuid;
      let body = `macro=${JSON.stringify(macroRef)}`;
      // Resolve macro UUID and append source command (dossier §4 — surface source-visible body for safety preview).
      const ent: any = macroRef;
      const uuid: string | null =
        typeof ent === 'string' ? ent : (typeof ent?.id === 'string' ? ent.id : null);
      const macroId = uuid?.startsWith('Macro.') ? uuid.slice('Macro.'.length) : uuid;
      if (uuid && (uuid.includes('Macro.') || macroId)) {
        try {
          const resolver =
            (globalThis as any).fromUuidSync ?? (globalThis as any).foundry?.utils?.fromUuidSync;
          const macro: any =
            (uuid.includes('Macro.') ? resolver?.(uuid) : null) ??
            (macroId ? (globalThis as any).game?.macros?.get?.(macroId) : null);
          const command = macro?.command;
          if (typeof command === 'string' && command.length > 0) {
            body += `\ncommand=\n${command}`;
          }
        } catch {
          // Unresolvable — keep entity-only body (safe default).
        }
      }
      entry.body = body;
    }
    dangerous.push(entry);
  }
  return { dangerous };
}
