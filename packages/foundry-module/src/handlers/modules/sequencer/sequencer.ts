// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 5B — module-sequencer handler.
//
// ~16-action umbrella: play-sequence-json / effect/sound managers / database reads /
// preload / permission-write.
//
// Design constraints (dossier §6, §7; SA2 research corrections):
//   - requireModuleActive('sequencer') FIRST — RETURNS failure envelope, never throws.
//   - play-sequence-json: ALLOWLIST guard fires BEFORE Sequence.fromJSON().
//       Allowed types: ["effect","sound","scrollingText","canvasPan","wait"].
//       Reject with UNSAFE_SECTION_EXCLUDED for any other type (including "macro",
//       "animation", "crosshair", "thenDo"). SA2: FunctionSection is not serializable;
//       toJSON() throws on .macro() — so type:"macro" never appears in valid JSON.
//       The allowlist is the correct defense (deny-by-default).
//   - get-effects/get-sounds: extract .data from CanvasEffect (PIXI) objects — never
//       the object itself (SA2). Serialize: {id,name,origin,source,target,sceneId,persist,file,temporary}.
//   - endEffects/endAllEffects already broadcast (push=true default) — no executeAsGM wrapping.
//   - database-*: check entryExists("autoanimations") before returning; DATABASE_NOT_POPULATED
//       when false (SA2 timing note).
//   - play-sequence-json is session-transport only (unversioned toJSON, fragile across upgrades).
//   - preload-for-clients: requires confirm:true (broadcast risk, SUPPORTED_WITH_CONFIRMATION).
//   - end-all-effects / end-all-sounds: require confirm:true (scene-level destructive).
//   - permission-write: GM-only world settings.
//   - CCR-3: notify.updated on writes; no notify on reads.
//   - CCR-4: confirm gates on destructive/broadcast actions.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleSequencerInput, type ModuleSequencerInputType, ALLOWED_SECTION_TYPES } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';


// ── Local helpers ──────────────────────────────────────────────────────────────

function getSequencer(): any {
  const s = (globalThis as any).Sequencer;
  if (!s) throw new Error('SEQUENCER_API_UNAVAILABLE: window.Sequencer not bound');
  return s;
}

function getSequenceClass(): any {
  const s = (globalThis as any).Sequence;
  if (!s) throw new Error('SEQUENCE_CLASS_UNAVAILABLE: window.Sequence not bound');
  return s;
}

/** Serialize a CanvasEffect / PIXI object to safe plain data (SA2). */
function serializeEffect(e: any): Record<string, unknown> {
  const d = e?.data ?? e ?? {};
  return {
    id: d.id ?? e.id ?? null,
    name: d.name ?? e.name ?? null,
    origin: d.origin ?? e.origin ?? null,
    source: d.source ?? e.source ?? null,
    target: d.target ?? e.target ?? null,
    sceneId: d.sceneId ?? e.sceneId ?? null,
    persist: d.persist ?? e.persist ?? false,
    file: d.file ?? e.file ?? null,
    temporary: d.temporary ?? e.temporary ?? null,
  };
}

/** Check whether the Sequencer database is populated (SA2 timing note). */
function isDatabasePopulated(Sequencer: any): boolean {
  try {
    return Boolean(Sequencer.Database?.entryExists?.('autoanimations'));
  } catch {
    return false;
  }
}

// ── Macro-node ALLOWLIST guard (SA2 — allowlist, NOT denylist) ─────────────────
//
// .macro() creates a FunctionSection which is NOT serializable — Sequence.toJSON()
// THROWS on it, so type:"macro" never appears in valid JSON. The allowlist rejects
// any unanticipated section type by default (deny-by-default safety invariant).

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_SECTION_TYPES);

function checkMacroGuard(sequence: Array<{ type: string; [key: string]: unknown }>): string | null {
  for (const section of sequence) {
    if (!ALLOWED_TYPE_SET.has(section.type)) {
      return `UNSAFE_SECTION_EXCLUDED: section type "${section.type}" is not in the safe allowlist [${[...ALLOWED_TYPE_SET].join(', ')}]. Only serializable section types are accepted.`;
    }
  }
  return null;
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleSequencer(data: unknown): Promise<any> {
  const g = requireModuleActive('sequencer');
  if (g) return g;

  const parsed = ModuleSequencerInput.parse(data);

  switch (parsed.action) {
    case 'play-sequence-json':    return handlePlaySequenceJson(parsed);
    case 'end-effects':           return handleEndEffects(parsed);
    case 'end-all-effects':       return handleEndAllEffects(parsed);
    case 'get-effects':           return handleGetEffects(parsed);
    case 'update-effects':        return handleUpdateEffects(parsed);
    case 'play-sound':            return handlePlaySound(parsed);
    case 'end-sounds':            return handleEndSounds(parsed);
    case 'end-all-sounds':        return handleEndAllSounds(parsed);
    case 'get-sounds':            return handleGetSounds(parsed);
    case 'database-search':       return handleDatabaseSearch(parsed);
    case 'database-get-paths':    return handleDatabaseGetPaths(parsed);
    case 'database-entry-exists': return handleDatabaseEntryExists(parsed);
    case 'database-get-entry':    return handleDatabaseGetEntry(parsed);
    case 'preload':               return handlePreload(parsed);
    case 'preload-for-clients':   return handlePreloadForClients(parsed);
    case 'permission-write':      return handlePermissionWrite(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-sequencer action: ${(_exhaustive as any).action}` };
    }
  }
}

// ── Play ──────────────────────────────────────────────────────────────────────

type PlaySeqInput = Extract<ModuleSequencerInputType, { action: 'play-sequence-json' }>;

// BUG-462 (Wave 2, D4): resolve a simplified-section location — {x,y} literal, or a
// placeable id/name resolved against canvas tokens (then measured templates).
function resolveSimpleLocation(loc: unknown): unknown {
  if (loc && typeof loc === 'object' && Number.isFinite((loc as any).x) && Number.isFinite((loc as any).y)) {
    return loc;
  }
  if (typeof loc === 'string') {
    const canvas = (globalThis as any).canvas;
    const token = canvas?.tokens?.get?.(loc)
      ?? canvas?.tokens?.placeables?.find?.((t: any) => t?.name === loc);
    if (token) return token;
    const template = canvas?.templates?.get?.(loc);
    if (template) return template;
  }
  throw new Error(
    `SEQUENCER_LOCATION_UNRESOLVED: could not resolve location ${JSON.stringify(loc)} — pass {x,y} coordinates or a canvas token id/name`,
  );
}

// BUG-462 (Wave 2, D4): server-side simplified-section expander. The taught payload
// shape ([{type:"effect", file:"jb2a.flames.orange"}]) is built through Sequencer's
// own fluent API — so Sequencer applies its own defaults (repetitionsDelay etc.)
// instead of this handler hand-crafting the fragile toJSON sectionData blob.
// Supported simple types: effect + sound ONLY (other types keep toJSON passthrough).
function buildSimplifiedSequence(seq: any, sections: Array<Record<string, unknown>>): void {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]!;
    if (s.type !== 'effect' && s.type !== 'sound') {
      throw new Error(
        `SEQUENCER_UNSUPPORTED_SIMPLE_SECTION: section ${i} has type "${String(s.type)}" — simplified sections ` +
        `support only "effect" and "sound". Other section types must be supplied as full Sequence.toJSON() output.`,
      );
    }
    if (typeof s.file !== 'string' || s.file === '') {
      throw new Error(`SEQUENCER_PLAY_ERROR: simplified section ${i} (${s.type}) requires a non-empty "file" (a DB path like "jb2a.flames.orange" or a file path)`);
    }
    if (s.type === 'effect') {
      const eff = seq.effect().file(s.file);
      if (s.atLocation !== undefined) eff.atLocation(resolveSimpleLocation(s.atLocation));
      if (s.attachTo !== undefined) eff.attachTo(resolveSimpleLocation(s.attachTo));
      if (s.stretchTo !== undefined) eff.stretchTo(resolveSimpleLocation(s.stretchTo));
      if (typeof s.scale === 'number') eff.scale(s.scale);
      if (typeof s.duration === 'number') eff.duration(s.duration);
      if (typeof s.fadeIn === 'number') eff.fadeIn(s.fadeIn);
      if (typeof s.fadeOut === 'number') eff.fadeOut(s.fadeOut);
      if (typeof s.opacity === 'number') eff.opacity(s.opacity);
      if (typeof s.delay === 'number') eff.delay(s.delay);
      if (typeof s.rotate === 'number') eff.rotate(s.rotate);
      if (typeof s.tint === 'string') eff.tint(s.tint);
      if (typeof s.name === 'string') eff.name(s.name);
      if (typeof s.origin === 'string') eff.origin(s.origin);
      if (typeof s.repeats === 'number') {
        eff.repeats(s.repeats, (s.repeatDelayMin as number) ?? 0, (s.repeatDelayMax as number) ?? ((s.repeatDelayMin as number) ?? 0));
      }
      if (s.persist === true) eff.persist();
      if (s.belowTokens === true) eff.belowTokens();
      if (s.waitUntilFinished === true) eff.waitUntilFinished();
    } else {
      const snd = seq.sound().file(s.file);
      if (typeof s.volume === 'number') snd.volume(s.volume);
      if (typeof s.duration === 'number') snd.duration(s.duration);
      if (typeof s.fadeInAudio === 'number') snd.fadeInAudio(s.fadeInAudio);
      if (typeof s.fadeOutAudio === 'number') snd.fadeOutAudio(s.fadeOutAudio);
      if (typeof s.delay === 'number') snd.delay(s.delay);
      if (typeof s.repeats === 'number') {
        snd.repeats(s.repeats, (s.repeatDelayMin as number) ?? 0, (s.repeatDelayMax as number) ?? ((s.repeatDelayMin as number) ?? 0));
      }
      if (s.waitUntilFinished === true) snd.waitUntilFinished();
    }
  }
}

async function handlePlaySequenceJson(input: PlaySeqInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can play sequences' };

  // Macro-node ALLOWLIST guard — fires BEFORE fromJSON (SA2)
  const guardErr = checkMacroGuard(input.sequence as Array<{ type: string; [key: string]: unknown }>);
  if (guardErr) return { success: false, error: guardErr };

  const sections = input.sequence as Array<Record<string, unknown>>;
  const isSerialized = (s: Record<string, unknown>) => Array.isArray((s as any)?.repetitionsDelay);

  // BUG-462 (Wave 2, D4): two accepted payload styles —
  //   simplified (no section carries repetitionsDelay): expanded via the fluent API;
  //   serialized (every section carries repetitionsDelay): raw Sequence.toJSON() passthrough.
  const serializedCount = sections.filter(isSerialized).length;
  if (serializedCount > 0 && serializedCount < sections.length) {
    return {
      success: false,
      error:
        'SEQUENCER_PLAY_ERROR: mixed payload — some sections carry repetitionsDelay (serialized toJSON shape) and ' +
        'some do not (simplified shape). Send either one full Sequence.toJSON() output or an all-simplified section array.',
    };
  }

  if (serializedCount === 0) {
    // Simplified path (the shape every doc teaches: [{type:"effect", file:"jb2a.flames.orange"}]).
    try {
      const Sequence = getSequenceClass();
      const seq = new Sequence();
      buildSimplifiedSequence(seq, sections);
      await seq.play(input.options ?? {});
      notify.updated('sequencer', 'Played sequence', { summary: `${sections.length} simplified section(s)` });
      return {
        success: true,
        data: { played: true, sectionCount: sections.length, mode: 'simplified' },
      };
    } catch (e) {
      return { success: false, error: e instanceof Error && /^SEQUENCER_/.test(e.message) ? e.message : `SEQUENCER_PLAY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  try {
    const Sequence = getSequenceClass();
    // SA2 / live Sequencer v4.0.1: fromJSON is an INSTANCE method that consumes the toJSON()
    // shape { options:{moduleName,softFail}, sections:[...] }, invoked as
    // new Sequence().fromJSON(data).play() (sequencer.js:10686/25849/26167). The public
    // contract keeps input.sequence as the bare section array — wrap it here for the live API.
    const seq = new Sequence();
    // softFail:false — surface real deserialize/render failures through the catch below as
    // SEQUENCER_PLAY_ERROR rather than silently resolving play() on a broken section
    // (softFail:true is a footgun for an MCP tool: success returned, nothing rendered).
    seq.fromJSON({ options: { moduleName: 'warhammer-mcp', softFail: false }, sections: input.sequence });
    await seq.play(input.options ?? {});
    notify.updated('sequencer', 'Played sequence', { summary: `${input.sequence.length} section(s)` });
    return { success: true, data: { played: true, sectionCount: input.sequence.length, note: 'session-transport: toJSON format is unversioned and fragile across Sequencer upgrades' } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_PLAY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── EffectManager ─────────────────────────────────────────────────────────────

type EndEffectsInput = Extract<ModuleSequencerInputType, { action: 'end-effects' }>;
type EndAllEffectsInput = Extract<ModuleSequencerInputType, { action: 'end-all-effects' }>;
type GetEffectsInput = Extract<ModuleSequencerInputType, { action: 'get-effects' }>;
type UpdateEffectsInput = Extract<ModuleSequencerInputType, { action: 'update-effects' }>;

async function handleEndEffects(input: EndEffectsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    await Sequencer.EffectManager.endEffects(input.filter ?? {});
    notify.updated('sequencer', 'Ended effects', { summary: JSON.stringify(input.filter ?? {}) });
    return { success: true, data: { ended: true, filter: input.filter ?? {} } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_END_EFFECTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleEndAllEffects(input: EndAllEffectsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  if (input.confirm !== true) {
    return { success: false, error: 'CONFIRM_REQUIRED: end-all-effects clears all effects on the scene. Re-send with confirm:true.' };
  }
  try {
    const Sequencer = getSequencer();
    await Sequencer.EffectManager.endAllEffects(input.sceneId, true);
    notify.updated('sequencer', 'Ended all effects', { summary: input.sceneId ?? 'current scene' });
    return { success: true, data: { ended: true, sceneId: input.sceneId ?? null } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_END_ALL_EFFECTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleGetEffects(input: GetEffectsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    const raw = Sequencer.EffectManager.getEffects(input.filter ?? {});
    // SA2: extract .data from CanvasEffect (PIXI Container) — never serialize the object
    const effects = (raw as any[]).map(serializeEffect);
    return { success: true, data: { effects, count: effects.length } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_GET_EFFECTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleUpdateEffects(input: UpdateEffectsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    // BUG-307: updateEffects takes TWO positional args (inFilter, inUpdates) — the
    // bundled typings showing a single options arg are stale vs the runtime. Merging
    // both into one object left inUpdates undefined and crashed validateUpdate().
    if (!input.filter || Object.keys(input.filter).length === 0) {
      return {
        success: false,
        error: 'SEQUENCER_UPDATE_EFFECTS_ERROR: filter is required — provide at least one filter key (name, sceneId, source, target, origin, or effects)',
      };
    }
    const result = await Sequencer.EffectManager.updateEffects(input.filter, input.updates ?? {});
    notify.updated('sequencer', 'Updated effects', { summary: JSON.stringify(input.filter) });
    // updateEffects resolves via Promise.allSettled — count outcomes, don't serialize them.
    const settled = Array.isArray(result) ? result : [];
    const updatedCount = settled.filter((r: any) => r?.status === 'fulfilled').length;
    const failedCount = settled.length - updatedCount;
    return { success: true, data: { updatedCount, failedCount } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_UPDATE_EFFECTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── SoundManager ──────────────────────────────────────────────────────────────

type PlaySoundInput = Extract<ModuleSequencerInputType, { action: 'play-sound' }>;
type EndSoundsInput = Extract<ModuleSequencerInputType, { action: 'end-sounds' }>;
type EndAllSoundsInput = Extract<ModuleSequencerInputType, { action: 'end-all-sounds' }>;
type GetSoundsInput = Extract<ModuleSequencerInputType, { action: 'get-sounds' }>;

async function handlePlaySound(input: PlaySoundInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequence = getSequenceClass();
    const seq = new Sequence().sound(input.file);
    // apply options if provided
    await seq.play(input.options ?? {});
    notify.updated('sequencer', 'Played sound', { summary: input.file });
    return { success: true, data: { played: true, file: input.file } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_PLAY_SOUND_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleEndSounds(input: EndSoundsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    await Sequencer.SoundManager.endSounds(input.filter ?? {});
    notify.updated('sequencer', 'Ended sounds', { summary: JSON.stringify(input.filter ?? {}) });
    return { success: true, data: { ended: true, filter: input.filter ?? {} } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_END_SOUNDS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleEndAllSounds(input: EndAllSoundsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  if (input.confirm !== true) {
    return { success: false, error: 'CONFIRM_REQUIRED: end-all-sounds clears all running Sequencer sounds (all scenes). Re-send with confirm:true.' };
  }
  try {
    const Sequencer = getSequencer();
    // Sequencer 4.2.x signature: endAllSounds(push2 = true) — sceneId param removed; ends all sounds globally + broadcasts.
    await Sequencer.SoundManager.endAllSounds(true);
    notify.updated('sequencer', 'Ended all sounds', { summary: 'all scenes' });
    return { success: true, data: { ended: true } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_END_ALL_SOUNDS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleGetSounds(input: GetSoundsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    const raw = Sequencer.SoundManager.getSounds(input.filter ?? {});
    const sounds = (raw as any[]).map(serializeEffect); // same serialization pattern
    return { success: true, data: { sounds, count: sounds.length } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_GET_SOUNDS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Database (read-only) ──────────────────────────────────────────────────────

type DbSearchInput = Extract<ModuleSequencerInputType, { action: 'database-search' }>;
type DbGetPathsInput = Extract<ModuleSequencerInputType, { action: 'database-get-paths' }>;
type DbEntryExistsInput = Extract<ModuleSequencerInputType, { action: 'database-entry-exists' }>;
type DbGetEntryInput = Extract<ModuleSequencerInputType, { action: 'database-get-entry' }>;

function requireDatabase(Sequencer: any): { success: false; error: string } | null {
  if (!isDatabasePopulated(Sequencer)) {
    return { success: false, error: 'DATABASE_NOT_POPULATED: Sequencer.Database has no entries (autoanimations module not active, or modules not yet in ready state). Activate JB2A or autoanimations and retry.' };
  }
  return null;
}

async function handleDatabaseSearch(input: DbSearchInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    const notPopulated = requireDatabase(Sequencer);
    if (notPopulated) return notPopulated;
    const results = Sequencer.Database.searchFor(input.path);
    const paths = Array.isArray(results) ? results : [];
    return { success: true, data: { path: input.path, results: paths, count: paths.length } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_DB_SEARCH_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleDatabaseGetPaths(input: DbGetPathsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    const notPopulated = requireDatabase(Sequencer);
    if (notPopulated) return notPopulated;
    const paths = Sequencer.Database.getPathsUnder(input.path);
    const result = Array.isArray(paths) ? paths : [];
    return { success: true, data: { path: input.path, paths: result, count: result.length } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_DB_GET_PATHS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handleDatabaseEntryExists(input: DbEntryExistsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    const exists = Boolean(Sequencer.Database?.entryExists?.(input.path));
    return { success: true, data: { path: input.path, exists } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_DB_ENTRY_EXISTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/**
 * BUG-256 — Sequencer.Database.getEntry() returns SequencerFile / SequencerFileRangeFind
 * objects (or an array of them), NOT plain path strings. Each carries a `.dbPath` database
 * path (the same readable form database-get-paths returns) and a `.getAllFiles()` accessor.
 * Map each element to a readable string so the response's `files: string[]` contract holds
 * instead of rendering `[object Object]`. Source: sequencer/dist/sequencer.js SequencerFile
 * (dbPath set at construction) + Database.getEntry (returns one entry or an array of entries).
 */
export function sequencerEntryToPath(f: unknown): string {
  if (typeof f === 'string') return f;
  const obj = f as { dbPath?: unknown; file?: unknown; getAllFiles?: () => unknown };
  if (obj && typeof obj.dbPath === 'string') return obj.dbPath;
  if (obj && typeof obj.getAllFiles === 'function') {
    try {
      const all = obj.getAllFiles();
      if (Array.isArray(all)) {
        const strs = all.filter((x): x is string => typeof x === 'string');
        if (strs.length) return strs.join(', ');
      }
    } catch {
      /* fall through to other accessors */
    }
  }
  if (obj && typeof obj.file === 'string') return obj.file;
  return String(f);
}

async function handleDatabaseGetEntry(input: DbGetEntryInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    const notPopulated = requireDatabase(Sequencer);
    if (notPopulated) return notPopulated;
    const entry = Sequencer.Database.getEntry(input.path, { softFail: input.softFail ?? false });
    if (!entry) {
      return { success: false, error: `DATABASE_ENTRY_NOT_FOUND: no entry at path "${input.path}"` };
    }
    const files = (Array.isArray(entry) ? entry : [entry]).map(sequencerEntryToPath);
    return { success: true, data: { path: input.path, files, count: files.length } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_DB_GET_ENTRY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Preloader ─────────────────────────────────────────────────────────────────

type PreloadInput = Extract<ModuleSequencerInputType, { action: 'preload' }>;
type PreloadForClientsInput = Extract<ModuleSequencerInputType, { action: 'preload-for-clients' }>;

async function handlePreload(input: PreloadInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  try {
    const Sequencer = getSequencer();
    await Sequencer.Preloader.preload(input.files, input.showProgressBar ?? false);
    notify.updated('sequencer', 'Preloaded assets', { summary: `${input.files.length} file(s) on GM client` });
    return { success: true, data: { preloaded: input.files.length, target: 'gm-client' } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_PRELOAD_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function handlePreloadForClients(input: PreloadForClientsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED' };
  if (input.confirm !== true) {
    return { success: false, error: 'CONFIRM_REQUIRED: preload-for-clients broadcasts to ALL connected clients (DoS risk). Re-send with confirm:true.' };
  }
  try {
    const Sequencer = getSequencer();
    await Sequencer.Preloader.preloadForClients(input.files, input.showProgressBar ?? false);
    notify.updated('sequencer', 'Preloaded assets for all clients', { summary: `${input.files.length} file(s)` });
    return { success: true, data: { preloaded: input.files.length, target: 'all-clients' } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_PRELOAD_FOR_CLIENTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Permission write ──────────────────────────────────────────────────────────

type PermissionWriteInput = Extract<ModuleSequencerInputType, { action: 'permission-write' }>;

async function handlePermissionWrite(input: PermissionWriteInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can change Sequencer permissions' };
  try {
    const game = (globalThis as any).game;
    await game.settings.set('sequencer', input.key, input.value);
    const verified = game.settings.get('sequencer', input.key);
    // mcp_code_quality_v2 Phase C3 (F03 type-aware redesign): input.value is a Zod z.number()
    // permission-level (0-3), NOT boolean — the prior safety annotation here mislabeled the
    // field type. `value` is a genuine coercion-hazard type (this third-party Sequencer
    // setting's own registered type is not under our control), so the compare is now
    // String()-wrapped (coercion-tolerant) rather than silenced with an unverified annotation.
    if (String(verified) !== String(input.value)) {
      return { success: false, error: `PERMISSION_WRITE_FAILED: setting ${input.key} expected ${input.value} but got ${verified}` };
    }
    notify.updated('sequencer', `Set permission ${input.key} = ${input.value}`, {});
    return { success: true, data: { key: input.key, value: input.value, verified } };
  } catch (e) {
    return { success: false, error: `SEQUENCER_PERMISSION_WRITE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
