// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v2 Phase 9 — module-polyglot handler (Polyglot v2.8.2, language obfuscation).
//
// Always-registered umbrella. requireModuleActive('polyglot') is the FIRST active-state check — RETURNS
// the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 9 actions across 3 write/verify shapes (capability_audit/polyglot.md + phase9_pre_plan.md). ZERO
// `game.polyglot.*` method calls — every path is a raw awaited Foundry document/setting write; the
// bundle is a single 175KB minified file with no dialog risk on any of these paths (audit-confirmed).
//
// THREE VERIFY SHAPES in one tool (phase8_carry_forward §2, phase9_pre_plan.md §Write/verify-shapes):
//   1. Speak-language / literacy grant+revoke → embedded skill/talent Item create/delete, verified by
//      re-reading `actor.items`.
//   2. send-in-language → `ChatMessage.create` with a dual write (`flags.polyglot.language` AND a
//      top-level `language` field — the top-level field wins over a live GM's stale TomSelect dropdown
//      per subagent-3), verified via `ChatMessage.get(id).getFlag('polyglot','language')`.
//   3. tag-journal-page → `page.update({'text.content': …})` wrapping a `<span class="polyglot-journal"
//      data-language>` marker, verified by re-reading the page content for the span.
//
// ACCENT-INSENSITIVE RESOLUTION: `resolveLanguage()` folds accents (NFD + combining-mark strip) to match
// free-text input against (a) the live wfrp4e-core.items/wfrp4e.basic compendium `Language (X)` skills
// (canonical spelling incl. diacritics, e.g. "Elthárin"), then (b) the built-in 17-language font map as a
// graceful fallback when neither pack is active, then (c) a homebrew hand-built item as a last resort.
// Every grant ALWAYS creates with the resolved canonical display name, never the caller's raw typing —
// this is what keeps the created item's key aligned with Polyglot's font map.
//
// IDEMPOTENCY: grant-language / grant-literacy pre-check actor.items for a same-name item before create —
// compendium Language/Read-Write items ship `advances.value:0`, so wfrp4e's skill-merge logic will NOT
// block a duplicate create; a double-grant would otherwise silently create two items.
//
// Confirm-gate (CCR-4): revoke-language, revoke-literacy (destructive item-delete) use
// confirm:z.boolean().optional() + a handler `!== true` reject. All other writes stay ungated
// (additive/reversible — settled principle, phase 8).
//
// Source of truth: .agents/research/module_integration/phase9_pre_plan.md +
// capability_audit/polyglot.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { PolyglotInput, type PolyglotInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'polyglot';

// The Read/Write literacy talent lives in the core compendium at a fixed id (phase9_pre_plan.md
// §WFRP4e-data-model). No homebrew fallback is defined for literacy (unlike languages) — if the pack is
// absent, grant-literacy fails loud with POLYGLOT_TARGET_NOT_FOUND.
const READ_WRITE_TALENT_UUID = 'Compendium.wfrp4e-core.items.Item.GogGbYxkVdCmiKqf';

// Built-in wfrp4eLanguageProvider font map (polyglot.js:5371-5423) — graceful fallback for display-name
// resolution when neither wfrp4e-core.items nor wfrp4e.basic is active (Open Q#2).
const BUILTIN_LANGUAGE_DISPLAY: Record<string, string> = {
  reikspiel: 'Reikspiel',
  wastelander: 'Wastelander',
  classical: 'Classical',
  cathan: 'Cathan',
  tilean: 'Tilean',
  estalian: 'Estalian',
  gospodarinyi: 'Gospodarinyi',
  albion: 'Albion',
  norse: 'Norse',
  bretonnian: 'Bretonnian',
  druhir: 'Druhir',
  elthárin: 'Elthárin',
  orcish: 'Orcish',
  queekish: 'Queekish',
  slaan: 'Slaan',
  khazalid: 'Khazalid',
  magick: 'Magick',
};

const WRITE_ACTIONS = new Set([
  'send-in-language',
  'grant-language',
  'grant-literacy',
  'tag-journal-page',
  'revoke-language',
  'revoke-literacy',
]);

// ── Local helpers ──────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}
function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}
function getActor(entityId: string): any | null {
  return getGame()?.actors?.get?.(entityId) ?? null;
}
async function fromUuidGlobal(uuid: string): Promise<any | null> {
  const fn = (globalThis as any).fromUuid;
  if (typeof fn !== 'function') return null;
  return (await fn(uuid)) ?? null;
}

function foldAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.POLYGLOT_TARGET_NOT_FOUND}: ${detail}` };
}
function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.POLYGLOT_CONFIRM_REQUIRED}: ${detail}` };
}

async function findLanguagePacks(): Promise<any[]> {
  const game = getGame();
  const ids = ['wfrp4e-core.items', 'wfrp4e.basic'];
  const packs: any[] = [];
  for (const id of ids) {
    const p = game?.packs?.get?.(id);
    if (p) packs.push(p);
  }
  return packs;
}

interface ResolvedLanguage {
  displayName: string;
  key: string;
  matched: 'compendium' | 'builtin' | 'homebrew';
  compendiumDoc: any | null;
}

/**
 * Accent-insensitive free-text → canonical language resolution (Q1/Q2 of phase9_pre_plan.md).
 * Compendium match wins (exact accented spelling); built-in font map is the graceful fallback when
 * neither language pack is active; homebrew is the last resort (caller's typing, best-effort).
 */
async function resolveLanguage(nameInput: string): Promise<ResolvedLanguage> {
  const folded = foldAccents(nameInput);
  for (const pack of await findLanguagePacks()) {
    try {
      const index = await pack.getIndex();
      const iter: Iterable<any> =
        typeof (index as any).values === 'function' ? (index as any).values() : (index as any);
      for (const e of iter) {
        const m = /^Language\s*\((.+)\)$/.exec(e?.name ?? '');
        const captured = m?.[1];
        if (captured && foldAccents(captured) === folded) {
          const doc = await pack.getDocument(e._id);
          if (doc) return { displayName: captured, key: captured.toLowerCase(), matched: 'compendium', compendiumDoc: doc };
        }
      }
    } catch (err) {
      console.warn(`[warhammer-mcp] resolveLanguage: error scanning pack "${pack.metadata?.id}":`, err);
    }
  }

  const builtinKey = Object.keys(BUILTIN_LANGUAGE_DISPLAY).find((k) => foldAccents(k) === folded);
  if (builtinKey) {
    return {
      displayName: BUILTIN_LANGUAGE_DISPLAY[builtinKey] ?? builtinKey,
      key: builtinKey,
      matched: 'builtin',
      compendiumDoc: null,
    };
  }

  const trimmed = nameInput.trim();
  return { displayName: trimmed, key: trimmed.toLowerCase(), matched: 'homebrew', compendiumDoc: null };
}

function readWriteTalentName(): string {
  return getGame()?.settings?.get?.('polyglot', 'ReadWrite') || 'Read/Write';
}

function scanKnownLanguages(actor: any): string[] {
  const languageRegexSetting: string = getGame()?.settings?.get?.('polyglot', 'LanguageRegex') || 'Language';
  const re = new RegExp(`^${languageRegexSetting}\\s*\\((.+)\\)$`);
  const known: string[] = [];
  for (const item of actor.items) {
    if (item.type !== 'skill') continue;
    const m = re.exec(item.name ?? '');
    const captured = m?.[1];
    if (captured) known.push(captured);
  }
  return known;
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModulePolyglot(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: PolyglotInputType;
  try {
    input = PolyglotInput.parse(data);
  } catch (e) {
    return { success: false, error: `POLYGLOT_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `POLYGLOT_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      // ── reads ──
      case 'list-world-languages':
        return handleListWorldLanguages();
      case 'check-knows-language':
        return handleCheckKnowsLanguage(input);
      case 'check-literacy':
        return handleCheckLiteracy(input);

      // ── writes (ungated) ──
      case 'send-in-language':
        return await handleSendInLanguage(input);
      case 'grant-language':
        return await handleGrantLanguage(input);
      case 'grant-literacy':
        return await handleGrantLiteracy(input);
      case 'tag-journal-page':
        return await handleTagJournalPage(input);

      // ── writes (confirm-gated) ──
      case 'revoke-language':
        return await handleRevokeLanguage(input);
      case 'revoke-literacy':
        return await handleRevokeLiteracy(input);

      default: {
        const _exhaustive: never = input;
        return { success: false, error: `POLYGLOT_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `POLYGLOT_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── reads ────────────────────────────────────────────────────────────────────

function handleListWorldLanguages(): Envelope<unknown> {
  const raw = (getGame()?.settings?.get?.('polyglot', 'Languages') as Record<string, any>) ?? {};
  const languages = Object.entries(raw).map(([key, v]) => ({
    key,
    label: v?.label ?? key,
    font: v?.font ?? null,
  }));
  if (languages.length === 0) {
    return {
      success: true,
      data: {
        action: 'list-world-languages',
        count: 0,
        languages: [],
        note: 'The "Languages" world setting is empty — the provider may not have completed its ready-hook backfill yet (requiresReady). Re-check after a Foundry reload if this looks wrong.',
      },
    };
  }
  return { success: true, data: { action: 'list-world-languages', count: languages.length, languages } };
}

type CheckKnowsInput = Extract<PolyglotInputType, { action: 'check-knows-language' }>;
function handleCheckKnowsLanguage(input: CheckKnowsInput): Envelope<unknown> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
  const known = scanKnownLanguages(actor);
  const folded = foldAccents(input.language);
  const knows = known.some((n) => foldAccents(n) === folded);
  return {
    success: true,
    data: { action: 'check-knows-language', entityId: input.entityId, language: input.language, knows, known },
  };
}

type CheckLiteracyInput = Extract<PolyglotInputType, { action: 'check-literacy' }>;
function handleCheckLiteracy(input: CheckLiteracyInput): Envelope<unknown> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);
  const readWriteName = readWriteTalentName();
  const literate = actor.items.some(
    (i: any) => i.type === 'talent' && (i.name ?? '').toLowerCase() === readWriteName.toLowerCase(),
  );
  const known = scanKnownLanguages(actor);
  return {
    success: true,
    data: { action: 'check-literacy', entityId: input.entityId, literate, literateLanguages: literate ? known : [] },
  };
}

// ── send-in-language (verify: ChatMessage flag) ───────────────────────────────

type SendInLanguageInput = Extract<PolyglotInputType, { action: 'send-in-language' }>;
async function handleSendInLanguage(input: SendInLanguageInput): Promise<Envelope<unknown>> {
  const key = input.language.trim().toLowerCase();
  const ChatMessageCls = (globalThis as any).ChatMessage;
  const styles = (globalThis as any).CONST?.CHAT_MESSAGE_STYLES ?? {};
  const styleValue = styles[input.style ?? 'OTHER'] ?? styles.OTHER ?? 0;

  const createData: Record<string, unknown> = {
    content: input.content,
    // Dual-write (subagent-3): the flag is what Polyglot's renderChatMessageHTML reads; the top-level
    // `language` field is what preCreateChatMessage prioritizes over a live GM's stale TomSelect
    // selection when style !== OTHER. Belt-and-suspenders — always write both.
    flags: { polyglot: { language: key } },
    language: key,
    style: styleValue,
  };
  if (input.speaker) {
    const speakerActor = getActor(input.speaker);
    if (speakerActor) createData.speaker = ChatMessageCls.getSpeaker({ actor: speakerActor });
  }
  if (input.whisper) createData.whisper = input.whisper;
  if (input.rollMode) createData.rollMode = input.rollMode;

  const created = await ChatMessageCls.create(createData);
  const msg = Array.isArray(created) ? created[0] : created;
  if (!msg) {
    return { success: false, error: `${ErrorTokens.POLYGLOT_NOT_PERSISTED}: ChatMessage.create returned nothing for send-in-language.` };
  }

  const fresh = ChatMessageCls.get(msg.id);
  const flagLang = fresh?.getFlag?.('polyglot', 'language');
  if (flagLang !== key) {
    return {
      success: false,
      error: `${ErrorTokens.POLYGLOT_NOT_PERSISTED}: flags.polyglot.language expected "${key}", got "${String(flagLang)}" after send-in-language.`,
    };
  }

  notify.created('polyglot', 'chat message', { summary: `sent in ${key}` });
  return { success: true, data: { action: 'send-in-language', messageId: msg.id, language: key } };
}

// ── grant/revoke-language + grant/revoke-literacy (verify: actor.items) ───────

type GrantLanguageInput = Extract<PolyglotInputType, { action: 'grant-language' }>;
async function handleGrantLanguage(input: GrantLanguageInput): Promise<Envelope<unknown>> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);

  const resolved = await resolveLanguage(input.language);
  const itemName = `Language (${resolved.displayName})`;

  const existing = actor.items.find(
    (i: any) => i.type === 'skill' && (i.name ?? '').toLowerCase() === itemName.toLowerCase(),
  );
  if (existing) {
    return {
      success: true,
      data: {
        action: 'grant-language',
        entityId: input.entityId,
        language: resolved.displayName,
        key: resolved.key,
        alreadyKnown: true,
        itemId: existing.id,
      },
    };
  }

  let itemData: any;
  if (resolved.compendiumDoc) {
    itemData = resolved.compendiumDoc.toObject();
    delete itemData._id;
  } else {
    itemData = {
      type: 'skill',
      name: itemName,
      system: {
        advanced: { value: 'adv' },
        grouped: { value: 'isSpec' },
        characteristic: { value: 'int' },
        advances: { value: 0 },
      },
    };
  }

  await actor.createEmbeddedDocuments('Item', [itemData]);

  const fresh = getActor(input.entityId);
  const createdItem = fresh?.items.find(
    (i: any) => i.type === 'skill' && (i.name ?? '').toLowerCase() === itemName.toLowerCase(),
  );
  if (!createdItem) {
    return {
      success: false,
      error: `${ErrorTokens.POLYGLOT_NOT_PERSISTED}: item "${itemName}" not present on actor "${input.entityId}" after grant-language.`,
    };
  }

  notify.created('polyglot', actor.name ?? input.entityId, { summary: `granted ${itemName}` });
  return {
    success: true,
    data: {
      action: 'grant-language',
      entityId: input.entityId,
      language: resolved.displayName,
      key: resolved.key,
      alreadyKnown: false,
      itemId: createdItem.id,
      source: resolved.matched,
    },
  };
}

type RevokeLanguageInput = Extract<PolyglotInputType, { action: 'revoke-language' }>;
async function handleRevokeLanguage(input: RevokeLanguageInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `revoke-language removes the "${input.language}" Speak skill from actor "${input.entityId}". Re-call with confirm:true.`,
    );
  }
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);

  const resolved = await resolveLanguage(input.language);
  const itemName = `Language (${resolved.displayName})`;
  const matches = actor.items.filter((i: any) => (i.name ?? '').toLowerCase() === itemName.toLowerCase());
  if (matches.length === 0) {
    return targetNotFound(`no "${itemName}" item found on actor "${input.entityId}"`);
  }

  await actor.deleteEmbeddedDocuments(
    'Item',
    matches.map((i: any) => i.id),
  );

  const fresh = getActor(input.entityId);
  const stillPresent = fresh?.items.some((i: any) => (i.name ?? '').toLowerCase() === itemName.toLowerCase());
  if (stillPresent) {
    return {
      success: false,
      error: `${ErrorTokens.POLYGLOT_NOT_PERSISTED}: "${itemName}" still present on actor "${input.entityId}" after revoke-language.`,
    };
  }

  notify.deleted('polyglot', actor.name ?? input.entityId, { summary: `revoked ${itemName}` });
  return {
    success: true,
    data: {
      action: 'revoke-language',
      entityId: input.entityId,
      language: resolved.displayName,
      key: resolved.key,
      deleted: true,
      count: matches.length,
    },
  };
}

type GrantLiteracyInput = Extract<PolyglotInputType, { action: 'grant-literacy' }>;
async function handleGrantLiteracy(input: GrantLiteracyInput): Promise<Envelope<unknown>> {
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);

  const readWriteName = readWriteTalentName();
  const existing = actor.items.find(
    (i: any) => i.type === 'talent' && (i.name ?? '').toLowerCase() === readWriteName.toLowerCase(),
  );
  if (existing) {
    return {
      success: true,
      data: { action: 'grant-literacy', entityId: input.entityId, alreadyKnown: true, itemId: existing.id },
    };
  }

  const source = await fromUuidGlobal(READ_WRITE_TALENT_UUID);
  if (!source) {
    return targetNotFound(
      `"${readWriteName}" talent not found at ${READ_WRITE_TALENT_UUID} (wfrp4e-core.items pack missing or renamed?)`,
    );
  }
  const itemData = source.toObject();
  delete itemData._id;

  await actor.createEmbeddedDocuments('Item', [itemData]);

  const fresh = getActor(input.entityId);
  const createdItem = fresh?.items.find(
    (i: any) => i.type === 'talent' && (i.name ?? '').toLowerCase() === readWriteName.toLowerCase(),
  );
  if (!createdItem) {
    return {
      success: false,
      error: `${ErrorTokens.POLYGLOT_NOT_PERSISTED}: "${readWriteName}" talent not present on actor "${input.entityId}" after grant-literacy.`,
    };
  }

  notify.created('polyglot', actor.name ?? input.entityId, { summary: `granted ${readWriteName}` });
  return {
    success: true,
    data: { action: 'grant-literacy', entityId: input.entityId, alreadyKnown: false, itemId: createdItem.id },
  };
}

type RevokeLiteracyInput = Extract<PolyglotInputType, { action: 'revoke-literacy' }>;
async function handleRevokeLiteracy(input: RevokeLiteracyInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`revoke-literacy removes the Read/Write talent from actor "${input.entityId}". Re-call with confirm:true.`);
  }
  const actor = getActor(input.entityId);
  if (!actor) return targetNotFound(`actor "${input.entityId}" not found`);

  const readWriteName = readWriteTalentName();
  const matches = actor.items.filter(
    (i: any) => i.type === 'talent' && (i.name ?? '').toLowerCase() === readWriteName.toLowerCase(),
  );
  if (matches.length === 0) {
    return targetNotFound(`no "${readWriteName}" talent found on actor "${input.entityId}"`);
  }

  await actor.deleteEmbeddedDocuments(
    'Item',
    matches.map((i: any) => i.id),
  );

  const fresh = getActor(input.entityId);
  const stillPresent = fresh?.items.some(
    (i: any) => i.type === 'talent' && (i.name ?? '').toLowerCase() === readWriteName.toLowerCase(),
  );
  if (stillPresent) {
    return {
      success: false,
      error: `${ErrorTokens.POLYGLOT_NOT_PERSISTED}: "${readWriteName}" talent still present on actor "${input.entityId}" after revoke-literacy.`,
    };
  }

  notify.deleted('polyglot', actor.name ?? input.entityId, { summary: `revoked ${readWriteName}` });
  return {
    success: true,
    data: { action: 'revoke-literacy', entityId: input.entityId, deleted: true, count: matches.length },
  };
}

// ── tag-journal-page (verify: page HTML span) ─────────────────────────────────

type TagJournalPageInput = Extract<PolyglotInputType, { action: 'tag-journal-page' }>;
async function handleTagJournalPage(input: TagJournalPageInput): Promise<Envelope<unknown>> {
  const page = await fromUuidGlobal(input.pageUuid);
  if (!page) return targetNotFound(`journal page "${input.pageUuid}" not found`);

  const key = input.language.trim().toLowerCase();
  const current = String(page.text?.content ?? '');

  let updatedContent: string;
  if (input.text) {
    const idx = current.indexOf(input.text);
    if (idx === -1) return targetNotFound(`substring not found in page "${input.pageUuid}" content`);
    const wrapped = `<span class="polyglot-journal" data-language="${key}">${input.text}</span>`;
    updatedContent = current.slice(0, idx) + wrapped + current.slice(idx + input.text.length);
  } else {
    updatedContent = `<span class="polyglot-journal" data-language="${key}">${current}</span>`;
  }

  await page.update({ 'text.content': updatedContent });

  const fresh = await fromUuidGlobal(input.pageUuid);
  const freshContent = String(fresh?.text?.content ?? '');
  const spanFound = freshContent.includes(`data-language="${key}"`) && freshContent.includes('polyglot-journal');
  if (!spanFound) {
    return {
      success: false,
      error: `${ErrorTokens.POLYGLOT_NOT_PERSISTED}: polyglot-journal span with data-language="${key}" not found in page "${input.pageUuid}" after tag-journal-page.`,
    };
  }

  notify.updated('polyglot', page.name ?? input.pageUuid, { summary: `tagged in ${key}` });
  return { success: true, data: { action: 'tag-journal-page', pageUuid: input.pageUuid, language: key, tagged: true } };
}
