// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v2 Phase 13C — module-syrinscape handler (Syrinscape Control v1.0.5, Zhell).
//
// Always-registered umbrella. requireModuleActive('syrinscape-control') is the FIRST executable statement —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// DIRECT-CALL (§13C.3): `globalThis.syrinscapeControl.utils.*` are plain functions, no macro-scope dependency —
// the PRD's "macro-runner only" framing is obsolete (module-narrator bare-global precedent).
//
// AUTH GATE (§13C.4): `authToken` world setting missing/blank is non-fatal to the module itself (permanent
// toast, proceeds) but play calls then degrade to a swallowed `false` with no distinguishing error — this
// handler PROACTIVELY pre-checks `game.settings.get('syrinscape-control','authToken')` before calling ANY
// play/stop util, returning a clean SYRINSCAPE_AUTH_MISSING refusal instead of an indistinguishable `false`.
//
// AUDIO-UNLOCK RACE (§13C.6): `syrinscape.player.controlSystem` only exists after `game.audio.unlock` resolves
// post-ready — a defensive `typeof utils.playMood === 'function'` pre-check catches a not-yet-initialized
// client with a clean SYRINSCAPE_NOT_READY instead of a raw throw.
//
// VERIFIABILITY CEILING (§13C.5): play/stop calls await the WS send (resolve = command accepted), but playback
// itself is external (Syrinscape cloud) — there is no document write to verify. `false` from a play util is
// surfaced as SYRINSCAPE_PLAYBACK_REJECTED (the WS-accepted-vs-actually-playing caveat is documented in the
// tool description, not silently swallowed).
//
// CACHE READS (gap-fill, §13C list actions): list-soundsets/list-moods read `game.settings.get('syrinscape-
// control', 'soundsetInfo'|'bulkData')` DIRECTLY — cold/never-populated worlds return `{}`/`[]`, which this
// handler surfaces as an empty list + a "refresh via Syrinscape Browser" hint, NEVER an error, NEVER a REST
// fallback (the `sound.*` REST methods need auth and can throw pre-null-check — gap-fill upstream-bug note).
//
// Source of truth: .agents/research/module_integration/phase13_pre_plan.md §13C + Post-Q&A gap-fill.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { SyrinscapeInput, type SyrinscapeInputType, PLAY_ACTIONS } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';
// BUG-464 (Wave 2): bounded list pages over the cache reads.
import { boundList } from '../../../services/bounded-response.js';


const MODULE_ID = 'syrinscape-control';

// BUG-465: the module's own `storage.isPlaying()` is stop-blind — the WS echo only flips it TRUE on
// play; an accepted stop never clears it, so the documented is-playing read-back was useless for stop
// verification (stayed true across 4 polls / 60s post-stop). Track MCP-issued play/stop intent in a
// handler-scoped set so is-playing reflects the last command WE sent. This is the WS-accepted ceiling,
// NOT confirmed cloud playback, and sounds started outside MCP (Syrinscape Browser) are not tracked —
// documented honestly in the tool description + SKILL error/ceiling notes.
const trackedPlaying = new Set<string>();

function getControl(): any {
  return (globalThis as any).syrinscapeControl;
}
function getAuthToken(): string {
  const raw = getGame()?.settings?.get?.(MODULE_ID, 'authToken');
  return typeof raw === 'string' ? raw.trim() : '';
}

function authMissing(): { success: false; error: string } {
  return {
    success: false,
    error: `${ErrorTokens.SYRINSCAPE_AUTH_MISSING}: the "authToken" world setting (namespace ${MODULE_ID}) is blank. Set a valid Syrinscape auth token before playing sounds.`,
  };
}
function notReady(): { success: false; error: string } {
  return {
    success: false,
    error: `${ErrorTokens.SYRINSCAPE_NOT_READY}: globalThis.syrinscapeControl.utils is not callable yet — the GM client's audio context has not unlocked (no user gesture on this tab since load). Interact with the page once, then retry.`,
  };
}
function playbackRejected(action: string): { success: false; error: string } {
  return {
    success: false,
    error: `${ErrorTokens.SYRINSCAPE_PLAYBACK_REJECTED}: ${action} returned false — the command was sent but Syrinscape rejected it (bad id, wrong soundset scope, or an unresponsive session). This is the WS-accepted-vs-actually-playing ceiling: a truthy return only means Syrinscape accepted the command, not that audio is confirmed playing.`,
  };
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleSyrinscape(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: SyrinscapeInputType;
  try {
    input = SyrinscapeInput.parse(data);
  } catch (e) {
    return { success: false, error: `${ErrorTokens.SYRINSCAPE_INVALID_INPUT}: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (PLAY_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `${ErrorTokens.SYRINSCAPE_ACCESS_DENIED}: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'set-mood':
        return await handlePlayAction(input.action, 'playMood', input.id);
      case 'stop-mood':
        return await handlePlayAction(input.action, 'stopMood', input.id);
      case 'play-element':
        return await handlePlayAction(input.action, 'playElement', input.id);
      case 'stop-element':
        return await handlePlayAction(input.action, 'stopElement', input.id);
      case 'stop-all':
        return await handleStopAll();
      case 'is-playing':
        return handleIsPlaying(input.elementId);
      case 'list-soundsets':
        return handleListSoundsets(input);
      case 'list-moods':
        return handleListMoods(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `${ErrorTokens.SYRINSCAPE_UNKNOWN_ACTION}: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `${ErrorTokens.SYRINSCAPE_HANDLER_ERROR}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── play actions (auth pre-check -> ready pre-check -> direct call) ──────────────

async function handlePlayAction(
  action: 'set-mood' | 'stop-mood' | 'play-element' | 'stop-element',
  fn: 'playMood' | 'stopMood' | 'playElement' | 'stopElement',
  id: string,
): Promise<Envelope<unknown>> {
  if (!getAuthToken()) return authMissing();

  const control = getControl();
  if (typeof control?.utils?.[fn] !== 'function') return notReady();

  const result = await control.utils[fn](id);
  if (result === false) return playbackRejected(action);

  // BUG-465: reflect the accepted command in our tracking set so is-playing is stop-verifiable.
  if (fn === 'playMood' || fn === 'playElement') trackedPlaying.add(String(id));
  else trackedPlaying.delete(String(id)); // stopMood / stopElement

  notify.updated('sound', id, { summary: `syrinscape ${action}` });
  return { success: true, data: { action, id, accepted: true } };
}

async function handleStopAll(): Promise<Envelope<unknown>> {
  if (!getAuthToken()) return authMissing();
  const control = getControl();
  if (typeof control?.utils?.stopAll !== 'function') return notReady();
  await control.utils.stopAll();
  trackedPlaying.clear(); // BUG-465: accepted stop-all clears all tracked play intent.
  notify.updated('sound', 'all syrinscape sounds', { summary: 'stop-all' });
  return { success: true, data: { action: 'stop-all', accepted: true } };
}

// ── is-playing (pure in-memory read, no auth needed) ─────────────────────────────

function handleIsPlaying(elementId: string): Envelope<unknown> {
  // BUG-465: consult OUR tracking set (stop-verifiable) rather than the module's stop-blind
  // storage.isPlaying(). Reflects MCP-issued play/stop commands this session (WS-accepted), not
  // confirmed cloud playback; sounds started outside MCP are not tracked.
  return {
    success: true,
    data: {
      action: 'is-playing',
      elementId,
      playing: trackedPlaying.has(String(elementId)),
      note: 'Reflects MCP play/stop commands issued this session (WS-accepted); not confirmed cloud audio, and untracked for sounds started via the Syrinscape Browser.',
    },
  };
}

// ── list-soundsets / list-moods (cache reads, never REST) ─────────────────────────

interface BulkDataEntry {
  id: string;
  type: 'mood' | 'element';
  name: string;
  soundset: string;
  sub_type?: string;
  product_or_pack?: string;
  status?: string;
  subcategory?: string;
  url?: string;
}
interface SoundsetInfoRow {
  id: string;
  name: string;
  full_name: string;
  url?: string;
  uuid?: string;
}

function readBulkData(): Record<string, BulkDataEntry> {
  const raw = getGame()?.settings?.get?.(MODULE_ID, 'bulkData');
  return raw && typeof raw === 'object' ? raw : {};
}
function readSoundsetInfo(): SoundsetInfoRow[] {
  const raw = getGame()?.settings?.get?.(MODULE_ID, 'soundsetInfo');
  return Array.isArray(raw) ? raw : [];
}

const COLD_CACHE_HINT = 'cache empty — refresh via the Syrinscape Browser once with a valid authToken to populate it.';

// BUG-464 (Wave 2): both list actions are bounded — limit/offset + case-insensitive
// name filter over the cache reads (warm cache measured 53 KB/516 soundsets and
// 721 KB/4,571 moods; both blew the response budget unbounded).
interface ListBounds { limit?: number | undefined; offset?: number | undefined; filter?: string | undefined }

function handleListSoundsets(bounds: ListBounds): Envelope<unknown> {
  const soundsetInfo = readSoundsetInfo();
  if (soundsetInfo.length === 0) {
    return { success: true, data: { action: 'list-soundsets', soundsets: [], hint: COLD_CACHE_HINT } };
  }
  const needle = bounds.filter?.toLowerCase();
  const all = soundsetInfo
    .filter((row) => !needle || String(row.name ?? '').toLowerCase().includes(needle) || String(row.full_name ?? '').toLowerCase().includes(needle))
    .map((row) => ({ id: String(row.id), name: row.name, fullName: row.full_name })); // BUG-465: cache returns numeric ids though typed string
  const bounded = boundList(all, { limit: bounds.limit, offset: bounds.offset });
  return {
    success: true,
    data: {
      action: 'list-soundsets',
      soundsets: bounded.items,
      totalAvailable: bounded.totalAvailable,
      truncated: bounded.truncated,
      offset: bounded.offset,
      limit: bounded.limit,
    },
  };
}

function handleListMoods(input: ListBounds & { soundsetName?: string | undefined }): Envelope<unknown> {
  const bulkData = readBulkData();
  const entries = Object.values(bulkData);
  if (entries.length === 0) {
    return { success: true, data: { action: 'list-moods', moods: [], hint: COLD_CACHE_HINT } };
  }
  const soundsetInfo = readSoundsetInfo();
  const soundsetByName = new Map(soundsetInfo.map((row) => [row.name, row.full_name]));
  const needle = input.filter?.toLowerCase();
  const filtered = entries.filter(
    (e) =>
      e.type === 'mood' &&
      (!input.soundsetName || e.soundset === input.soundsetName) &&
      (!needle || String(e.name ?? '').toLowerCase().includes(needle)),
  );
  const all = filtered.map((e) => ({ id: String(e.id), name: e.name, soundset: e.soundset, soundsetFullName: soundsetByName.get(e.soundset) ?? e.soundset })); // BUG-465: numeric ids coerced to string
  if (all.length === 0) {
    return { success: true, data: { action: 'list-moods', moods: [], hint: input.soundsetName ? `no moods found for soundset "${input.soundsetName}" in the cache; ${COLD_CACHE_HINT}` : COLD_CACHE_HINT } };
  }
  const bounded = boundList(all, { limit: input.limit, offset: input.offset });
  return {
    success: true,
    data: {
      action: 'list-moods',
      moods: bounded.items,
      totalAvailable: bounded.totalAvailable,
      truncated: bounded.truncated,
      offset: bounded.offset,
      limit: bounded.limit,
    },
  };
}
