// Module Integration v2 Phase 10 — module-narrator handler (Narrator Tools v1.0.1, elizeuangelo).
//
// Always-registered umbrella. requireModuleActive('narrator-tools') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 6 actions, ONE uniform write architecture (phase10_pre_plan.md §Confirmed-facts #3): every write is
// either a `game.settings.set('narrator-tools','sharedState',…)` broadcast (narrate/scenery) or a
// `ChatMessage.create` with `flags['narrator-tools'].type` (narrate/describe/notify). `configure` is a
// direct typed-setting write. `get-state` is a plain settings read.
//
// D1 — BARE-LEXICAL ACCESS: `narrator-tools` is a classic script (`module.json` "scripts", not
// "esmodules"); `NarratorTools` is a bare top-level `const` (narrator.js:75), NEVER on `globalThis` /
// `window` / `game.modules.get().api`. Reached via a bare `const NarratorTools` type declaration (see
// below) + a `typeof` guard — copies `handlers/modules/robak/robak.ts:25-47` — because warhammer-mcp's
// query dispatch runs in the SAME JS realm as narrator.js (no CDP/eval boundary). NEVER a globalThis-
// qualified lookup for this binding (confirmed undefined live).
//
// D8 — narrator.js's own permission check on narrate/describe (`!user.role >= PERM`) is DEAD CODE
// (operator-precedence bug: `(!user.role) >= PERM` is always false, since !role is a boolean coerced to
// 0/1). We do NOT mirror it — MCP runs as GM regardless; our own isGM()/SETTINGS_MODIFY gates are the
// real access control (D7).
//
// SETTLE-POLL (bounded retry, [[feedback_settle_poll_module_api_verify]]): NarratorTools's own methods
// call `game.settings.set(...)` / `ChatMessage.create(...)` WITHOUT awaiting them (narrator.js:763-767,
// 799-800, 806-807) — the write lands on a LATER tick. An immediate single re-read races the write and
// would false-fail `NARRATOR_NOT_PERSISTED`. Every verify step below polls a few times with a short delay
// before giving up (mirrors the module-api write-verify precedent from mortal-needs/perceptive).
//
// D3 — startPaused (default false): narrate() always seeds `sharedState.narration.paused` from the
// WORLD setting `NarrationStartPaused` (narrator.js:761) — there is no per-call override inside
// narrator.js itself. To honor the caller's `startPaused` (default false — guarantees auto-play, avoids
// the hang-forever trap when `NarrationStartPaused=true` and no live GM tab is present to click Play), the
// handler settle-polls the narrate() write landing, then — ONLY if the resolved value differs — patches
// `sharedState.narration.paused` via our OWN awaited read-modify-write (the same shape as narrator.js's
// own `sharedState.narration` setter), then re-verifies.
//
// D6 — narrate/describe/notify never return a created-ChatMessage reference (createChatMessage's
// non-narration branch has no `return` statement at all; the narration branch returns a Promise tied to
// a `narration_closes` Hook that only resolves via a LIVE isNarrator browser tab — NEVER await that
// promise, it can hang forever, the same deadlock class as an unguarded Dialog per ADR-10.1). We locate
// the created message ourselves: settle-poll search `game.messages.contents` (newest-first) for a
// message whose `flags['narrator-tools'].type` matches and whose `content` matches the transformed
// message text (narrator.js's own `\\n`→`<br>` escape, replicated here for an exact match).
//
// Source of truth: .agents/research/module_integration/phase10_pre_plan.md +
// capability_audit/narrator-tools.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { NarratorInput, type NarratorInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'narrator-tools';

// Bare lexical binding — narrator.js declares `const NarratorTools = {...}` at classic-script top level
// (module.json "scripts", NOT "esmodules"). `typeof` guards a possibly-unresolved binding without
// throwing ReferenceError. NEVER `(globalThis as any).NarratorTools` — confirmed undefined live (D1).
declare const NarratorTools: any;

const WRITE_ACTIONS = new Set(['narrate', 'describe', 'notify', 'scenery', 'configure']);
const SETTINGS_MODIFY_ACTIONS = new Set(['scenery', 'configure']);

// ── Local helpers ──────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}
function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}
function hasSettingsModify(): boolean {
  return Boolean(getGame()?.user?.hasPermission?.('SETTINGS_MODIFY'));
}

function getNarratorTools(): any {
  const nt = typeof NarratorTools !== 'undefined' ? NarratorTools : null;
  if (!nt || typeof nt.scenery !== 'function' || typeof nt.chatMessage?.narrate !== 'function') {
    // The outer dispatch catch prepends NARRATOR_HANDLER_ERROR — do NOT repeat the token here or it doubles.
    throw new Error(
      'NarratorTools is not bound — narrator-tools may not have reached ready state',
    );
  }
  return nt;
}

function getSharedState(): any {
  return getGame()?.settings?.get?.(MODULE_ID, 'sharedState');
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Bounded-retry poll for a value written by a bare-lexical module call whose internal
 * game.settings.set()/ChatMessage.create() is fire-and-forget (not awaited by narrator.js itself — see
 * module header). An immediate single re-read races the later-tick write; poll a few times before
 * declaring NARRATOR_NOT_PERSISTED. [[feedback_settle_poll_module_api_verify]].
 */
async function settlePoll<T>(
  read: () => T,
  isSettled: (v: T) => boolean,
  attempts = 6,
  delayMs = 40,
): Promise<T> {
  let value = read();
  for (let i = 0; i < attempts && !isSettled(value); i++) {
    await sleep(delayMs);
    value = read();
  }
  return value;
}

/** Replicates narrator.js's own content transform (createChatMessage: `message.replace(/\\n/g,'<br>')`) so
 * the post-write message search can match on exact content rather than a fuzzy substring. */
function narratorContentTransform(s: string): string {
  return s.replace(/\\n/g, '<br>');
}

/** Settle-poll search for the ChatMessage narrator.js's own (unawaited) createChatMessage() produced. */
async function findNarratorMessage(type: 'narration' | 'description' | 'notification', rawMessage: string): Promise<any | null> {
  const expectedContent = narratorContentTransform(rawMessage);
  const search = (): any | null => {
    const messages: any[] = getGame()?.messages?.contents ?? [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m?.getFlag?.(MODULE_ID, 'type') === type && String(m.content ?? '') === expectedContent) {
        return m;
      }
    }
    return null;
  };
  return settlePoll(search, (v) => v !== null);
}

function notPersisted(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.NARRATOR_NOT_PERSISTED}: ${detail}` };
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleNarrator(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: NarratorInputType;
  try {
    input = NarratorInput.parse(data);
  } catch (e) {
    return { success: false, error: `${ErrorTokens.NARRATOR_INVALID_INPUT}: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `${ErrorTokens.NARRATOR_ACCESS_DENIED}: ${input.action} requires GM` };
  }
  if (SETTINGS_MODIFY_ACTIONS.has(input.action) && !hasSettingsModify()) {
    return {
      success: false,
      error: `${ErrorTokens.NARRATOR_ACCESS_DENIED}: ${input.action} requires the SETTINGS_MODIFY permission`,
    };
  }

  try {
    switch (input.action) {
      case 'get-state':
        return handleGetState();
      case 'narrate':
        return await handleNarrate(input);
      case 'describe':
        return await handleDescribe(input);
      case 'notify':
        return await handleNotify(input);
      case 'scenery':
        return await handleScenery(input);
      case 'configure':
        return await handleConfigure(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `${ErrorTokens.NARRATOR_UNKNOWN_ACTION}: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `${ErrorTokens.NARRATOR_HANDLER_ERROR}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-state (ungated read) ────────────────────────────────────────────────────

function handleGetState(): Envelope<unknown> {
  const sharedState = getSharedState() ?? { narration: { id: 0, display: false, message: '', paused: false }, scenery: false };
  return { success: true, data: { action: 'get-state', sharedState } };
}

// ── narrate (verify: sharedState.narration + created ChatMessage) ──────────────

type NarrateInput = Extract<NarratorInputType, { action: 'narrate' }>;
async function handleNarrate(input: NarrateInput): Promise<Envelope<unknown>> {
  const nt = getNarratorTools();
  const messages = Array.isArray(input.message) ? input.message : [input.message];
  const firstMessage = messages[0];
  if (firstMessage === undefined) {
    return { success: false, error: `${ErrorTokens.NARRATOR_INVALID_INPUT}: narrate requires at least one message.` };
  }
  const queuedCount = messages.length - 1;

  const options: Record<string, unknown> = {};
  if (input.speaker) options.speaker = { alias: input.speaker };

  const before = getSharedState();
  const priorId = before?.narration?.id;

  // Fire-and-forget by design (D6) — narrate() itself is synchronous and its internal writes are
  // unawaited; do NOT await its return (the narration-branch return is a Promise tied to a live-tab-only
  // Hook and can hang forever — never await it, same deadlock class as an unguarded Dialog).
  nt.chatMessage.narrate(input.message, options);

  const settled = await settlePoll(
    getSharedState,
    (s) => s?.narration?.id !== priorId && s?.narration?.message === firstMessage,
  );
  if (!settled || settled.narration?.id === priorId || settled.narration?.message !== firstMessage) {
    return notPersisted(
      `sharedState.narration did not update to message "${firstMessage.slice(0, 60)}" after narrate.`,
    );
  }

  // D3 — force the resolved startPaused (default false) so a world NarrationStartPaused=true setting
  // can never hang a headless call. Patch ONLY if narrator.js's own seed differs from the resolution.
  const resolvedPaused = input.startPaused ?? false;
  if (settled.narration.paused !== resolvedPaused) {
    const patched = { ...settled, narration: { ...settled.narration, paused: resolvedPaused } };
    await getGame().settings.set(MODULE_ID, 'sharedState', patched);
    const reread = getSharedState();
    if (reread?.narration?.paused !== resolvedPaused) {
      return notPersisted(`narration.paused could not be forced to ${resolvedPaused} after narrate.`);
    }
  }

  const msg = await findNarratorMessage('narration', firstMessage);
  if (!msg) {
    return notPersisted(`no ChatMessage with flags['narrator-tools'].type=='narration' found after narrate.`);
  }

  notify.created('narrator', 'narration', { summary: firstMessage.slice(0, 60) });
  return {
    success: true,
    data: {
      action: 'narrate',
      narrationId: settled.narration.id,
      paused: resolvedPaused,
      messageId: msg.id,
      queuedCount,
    },
  };
}

// ── describe / notify (verify: created ChatMessage flag) ───────────────────────

type DescribeInput = Extract<NarratorInputType, { action: 'describe' }>;
async function handleDescribe(input: DescribeInput): Promise<Envelope<unknown>> {
  const nt = getNarratorTools();
  const options: Record<string, unknown> = {};
  if (input.speaker) options.speaker = { alias: input.speaker };

  nt.chatMessage.describe(input.message, options); // fire-and-forget (D6) — no return value to await

  const msg = await findNarratorMessage('description', input.message);
  if (!msg) {
    return notPersisted(`no ChatMessage with flags['narrator-tools'].type=='description' found after describe.`);
  }
  notify.created('narrator', 'description', { summary: input.message.slice(0, 60) });
  return { success: true, data: { action: 'describe', messageId: msg.id } };
}

type NotifyInput = Extract<NarratorInputType, { action: 'notify' }>;
async function handleNotify(input: NotifyInput): Promise<Envelope<unknown>> {
  const nt = getNarratorTools();
  const options: Record<string, unknown> = {};
  if (input.speaker) options.speaker = { alias: input.speaker };

  nt.chatMessage.notify(input.message, options); // fire-and-forget (D6) — no return value to await

  const msg = await findNarratorMessage('notification', input.message);
  if (!msg) {
    return notPersisted(`no ChatMessage with flags['narrator-tools'].type=='notification' found after notify.`);
  }
  notify.created('narrator', 'notification', { summary: input.message.slice(0, 60) });
  return { success: true, data: { action: 'notify', messageId: msg.id, whisper: msg.whisper ?? [] } };
}

// ── scenery (verify: sharedState.scenery) ───────────────────────────────────────

type SceneryInput = Extract<NarratorInputType, { action: 'scenery' }>;
async function handleScenery(input: SceneryInput): Promise<Envelope<unknown>> {
  const nt = getNarratorTools();
  const before = getSharedState()?.scenery ?? false;
  const expected = input.state ?? !before;

  nt.scenery(input.state); // fire-and-forget (D6) — the setter's settings.set() is unawaited internally

  const after = await settlePoll(() => getSharedState()?.scenery, (v) => v === expected);
  if (after !== expected) {
    return notPersisted(`sharedState.scenery expected ${expected}, got ${String(after)} after scenery.`);
  }
  notify.updated('narrator', 'scenery', { summary: `scenery ${expected ? 'on' : 'off'}` });
  return { success: true, data: { action: 'scenery', scenery: expected } };
}

// ── configure (verify: settings round-trip) ─────────────────────────────────────

type ConfigureInput = Extract<NarratorInputType, { action: 'configure' }>;
async function handleConfigure(input: ConfigureInput): Promise<Envelope<unknown>> {
  await getGame().settings.set(MODULE_ID, input.key, input.value);
  const after = getGame().settings.get(MODULE_ID, input.key);
  // Foundry coerces the value to the setting's registered type (Number/Boolean keys), so `after` may be a
  // number/bool while `input.value` arrived as a string over the MCP boundary. Compare type-tolerantly —
  // the narrator settings are all scalar (string/number/boolean), so a stringified compare is exact.
  if (String(after) !== String(input.value)) {
    return notPersisted(`setting "${input.key}" expected ${JSON.stringify(input.value)}, got ${JSON.stringify(after)} after configure.`);
  }
  notify.updated('narrator', input.key, { summary: `set to ${JSON.stringify(input.value)}` });
  return { success: true, data: { action: 'configure', key: input.key, value: after } };
}
