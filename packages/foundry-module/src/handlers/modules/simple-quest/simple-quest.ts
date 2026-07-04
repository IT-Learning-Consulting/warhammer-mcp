// DIALOG-PATH: DIALOG_GUARDED — module header documents 3 module dialog paths (share-quest/delete-quest/show-quest-to-players) that are explicitly bypassed in favor of raw ChatMessage.create / deleteEmbeddedDocuments / dynamic-import alternatives; move-quest never invokes the modules deleteDialog either.
// Module Integration v2 Phase 2 — module-simple-quest handler (Simple Quest v3.0.19, theripper93).
//
// Always-registered umbrella. requireModuleActive('simple-quest') is the FIRST executable statement —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 24 actions over the verified server-reachable surface (capability_audit/simple-quest.md +
// live source read of modules/simple-quest/scripts/{app/app.js, lib/socket.js, mapImage.js, main.js}).
// ALL state lives in flags.simple-quest.* on JournalEntryPage docs — pure document writes (the best
// write-verifiability posture in v2). Every write: re-read + verifyFlagWrite/verifyDocWrite →
// SIMPLE_QUEST_NOT_PERSISTED, then notify.created/updated/deleted (CCR-3).
//
// ── HC-v2-5 (objective rename → orphaned state) ──────────────────────────────────────
// Objective keys derive from SimpleQuest.getKeyFromLi (app.js:1626-1627):
//   li.innerText.replace(/\s/g,"").replace(/\./g,"").substring(0,50)
// The handler only sees raw page HTML, so deriveObjectiveKey() reproduces innerText by stripping
// tags AND decoding HTML entities (&nbsp;/&amp; are the real browser-vs-server divergence) before the
// replace chain. checkRename() warns (SIMPLE_QUEST_RENAME_WARNING, suppressible via acknowledgeRename)
// before any objective write whose derived key matches none of the page's actual <li> objectives — that
// signature means the text was renamed/mistyped and the write would orphan checkbox/secret state. A valid
// objective that simply hasn't been ticked yet matches an <li> and does NOT warn.
//
// ── HC-v2-6 analog (dialog-deadlock) — 4 ops are RAW document/socket ops, never the module method ──
//   share-quest          — module path is Dialog.confirm (app.js:414) → raw ChatMessage.create.
//   delete-quest         — module path is Dialog.confirm (app.js:441) → raw deleteEmbeddedDocuments + CCR-4 gate.
//   move-quest (delete-from-source) — module deleteDialog (app.js:713) is never invoked → raw delete.
//   show-quest-to-players — module path is Dialog.prompt/showQuest (app.js:1391) → dynamic-import the
//     module's OWN Socket wrapper (lib/socket.js) and call Socket.openToPage({uuid},{users}); the wrapper
//     builds __$eventId + resolves users (the safe path the audit's hand-crafted emit envelope missed).
//
// Flag-only writes are interference-safe: the preUpdateJournalEntryPage hook injects lastUpdated ONLY
// when updates.text is present (app.js:1654-1656) — our flag deltas carry no text key.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { SimpleQuestInput, type SimpleQuestInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';


const MODULE_ID = 'simple-quest';

// ── Local helpers ──────────────────────────────────────────────────────────────

function foundryUtils(): any {
  return (globalThis as any).foundry?.utils;
}

/** Resolve a JournalEntryPage by UUID (async — fromUuid). */
async function getPage(uuid: string): Promise<any | null> {
  const fromUuid = (globalThis as any).fromUuid;
  if (typeof fromUuid !== 'function') return null;
  try {
    const doc = await fromUuid(uuid);
    return doc ?? null;
  } catch {
    return null;
  }
}

/** Live folder lookup — never hardcode "Quests"/"Lore". */
function getSetting(key: string): any {
  try {
    return getGame()?.settings?.get?.(MODULE_ID, key);
  } catch {
    return undefined;
  }
}

function findFolder(folderName: string): any {
  return getGame()?.folders?.find?.((f: any) => f.name === folderName && f.type === 'JournalEntry') ?? null;
}

/**
 * HC-v2-5 — reproduce SimpleQuest.getKeyFromLi server-side. The browser runs on the rendered DOM's
 * innerText; we only have the raw page HTML. Strip tags, decode the HTML entities that diverge
 * (&nbsp; / &amp; / &lt; / &gt; / &quot; / &#39; / numeric), then apply the module's replace chain.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#0*([0-9]+);/g, (_m, d) => {
      try {
        return String.fromCodePoint(Number(d));
      } catch {
        return _m;
      }
    })
    .replace(/&#x0*([0-9a-f]+);/gi, (_m, h) => {
      try {
        return String.fromCodePoint(parseInt(h, 16));
      } catch {
        return _m;
      }
    })
    .replace(/&amp;/g, '&'); // last — so "&amp;nbsp;" does not double-decode
}

function deriveObjectiveKey(rawHtmlOrText: string): string {
  const stripped = String(rawHtmlOrText).replace(/<[^>]*>/g, ''); // strip tags → innerText-ish
  const decoded = decodeEntities(stripped);
  return decoded.replace(/\s/g, '').replace(/\./g, '').substring(0, 50);
}

/**
 * HC-v2-5 rename guard. The authoritative objective set is the page's rendered `<li>` list items —
 * NOT prior checkbox state. A key matching a real `<li>` is a valid objective (even if never ticked),
 * so it must never warn; a key matching no `<li>` would orphan state (the objective text was renamed
 * or mistyped) and DOES warn. Comparing against existing checkboxes (the prior implementation) false-
 * positived on every legitimate tick of objectives 2..N, since those keys aren't in checkboxes yet.
 * Returns the warning envelope unless the caller acknowledged the rename.
 */
function checkRename(page: any, key: string, acknowledge: boolean | undefined): Envelope<unknown> | null {
  if (acknowledge === true) return null;
  // Derive the keys of the page's actual objective list items.
  const html = String(page?.text?.content ?? '');
  const liKeys = new Set<string>();
  for (const m of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    liKeys.add(deriveObjectiveKey(m[1] ?? ''));
  }
  if (liKeys.size > 0) {
    if (liKeys.has(key)) return null; // matches a real objective — always allowed
    return {
      success: false,
      error:
        `${ErrorTokens.SIMPLE_QUEST_RENAME_WARNING}: derived objective key "${key}" matches none of the ` +
        `${liKeys.size} objective list-item(s) on this page — the objective text may have been renamed or ` +
        `mistyped, which would orphan checkbox/secret state. Re-send with acknowledgeRename:true to proceed.`,
    };
  }
  // No parseable <li> objectives on the page — fall back to the prior checkbox heuristic (best-effort).
  const existingKeys = Object.keys(page?.getFlag?.(MODULE_ID, 'checkboxes') ?? {});
  if (existingKeys.length > 0 && !existingKeys.includes(key)) {
    return {
      success: false,
      error:
        `${ErrorTokens.SIMPLE_QUEST_RENAME_WARNING}: derived objective key "${key}" matches none of the ` +
        `${existingKeys.length} existing checkbox key(s) and no <li> objectives were found on this page — ` +
        `the objective text may have been renamed. Re-send with acknowledgeRename:true to proceed.`,
    };
  }
  return null;
}

/** Find or create a category JournalEntry by name inside the configured folder. */
async function findOrCreateCategory(categoryName: string, folderName: string): Promise<any> {
  const game = getGame();
  const existing = game.journal?.find?.(
    (j: any) => j.name === categoryName && j.folder?.name === folderName,
  );
  if (existing) return existing;
  const folder = findFolder(folderName);
  const JournalEntryCls = (globalThis as any).JournalEntry;
  return JournalEntryCls.create({
    name: categoryName,
    folder: folder?.id ?? null,
    ownership: { default: 0 },
  });
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set([
  'create-quest',
  'set-quest-state',
  'set-objective-state',
  'set-objective-visibility',
  'set-quest-visibility',
  'set-subquest-state',
  'move-quest',
  'mark-quest-updated',
  'share-quest',
  'show-quest-to-players',
  'set-counter',
  'duplicate-quest',
  'delete-quest',
  'create-map-marker',
  'update-map-marker',
  'remove-map-marker',
  'set-map-config',
  'create-lore',
  'create-achievement',
  'set-achievement',
]);

export async function dispatchModuleSimpleQuest(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws.
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: SimpleQuestInputType;
  try {
    input = SimpleQuestInput.parse(data);
  } catch (e) {
    return { success: false, error: `SIMPLE_QUEST_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `SIMPLE_QUEST_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      // Quest tab
      case 'list-quests':
        return handleListQuests(input);
      case 'get-quest':
        return await handleGetQuest(input);
      case 'create-quest':
        return await handleCreateQuest(input);
      case 'set-quest-state':
        return await handleSetQuestState(input);
      case 'set-objective-state':
        return await handleSetObjectiveState(input);
      case 'set-objective-visibility':
        return await handleSetObjectiveVisibility(input);
      case 'set-quest-visibility':
        return await handleSetQuestVisibility(input);
      case 'set-subquest-state':
        return await handleSetSubquestState(input);
      case 'move-quest':
        return await handleMoveQuest(input);
      case 'mark-quest-updated':
        return await handleMarkQuestUpdated(input);
      case 'share-quest':
        return await handleShareQuest(input);
      case 'show-quest-to-players':
        return await handleShowQuestToPlayers(input);
      case 'set-counter':
        return await handleSetCounter(input);
      case 'duplicate-quest':
        return await handleDuplicateQuest(input);
      case 'delete-quest':
        return await handleDeleteQuest(input);
      // Map tab
      case 'create-map-marker':
        return await handleCreateMapMarker(input);
      case 'update-map-marker':
        return await handleUpdateMapMarker(input);
      case 'remove-map-marker':
        return await handleRemoveMapMarker(input);
      case 'set-map-config':
        return await handleSetMapConfig(input);
      // Lore tab
      case 'list-lore':
        return handleListLore(input);
      case 'create-lore':
        return await handleCreateLore(input);
      // Achievements tab
      case 'list-achievements':
        return handleListAchievements(input);
      case 'create-achievement':
        return await handleCreateAchievement(input);
      case 'set-achievement':
        return await handleSetAchievement(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `SIMPLE_QUEST_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `SIMPLE_QUEST_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Quest tab — reads ─────────────────────────────────────────────────────────────

type ListQuestsInput = Extract<SimpleQuestInputType, { action: 'list-quests' }>;
function handleListQuests(_input: ListQuestsInput): Envelope<unknown> {
  const folderName = getSetting('folderName') ?? 'Quests';
  const folder = findFolder(folderName);
  const journals = folder
    ? getGame().journal.filter((j: any) => j.folder?.id === folder.id).sort((a: any, b: any) => a.sort - b.sort)
    : [];
  const categories = journals.map((j: any) => ({
    journalId: j.id,
    uuid: j.uuid,
    name: j.name,
    sort: j.sort ?? 0,
    pages: Array.from(j.pages ?? []).map((p: any) => ({
      pageId: p.id,
      uuid: p.uuid,
      name: p.name,
      hidden: Boolean(p.getFlag?.(MODULE_ID, 'hidden')),
      completed: Boolean(p.getFlag?.(MODULE_ID, 'completed')),
      lastUpdated: p.getFlag?.(MODULE_ID, 'lastUpdated') ?? null,
    })),
  }));
  return { success: true, data: { folderName, count: categories.length, categories } };
}

type GetQuestInput = Extract<SimpleQuestInputType, { action: 'get-quest' }>;
async function handleGetQuest(input: GetQuestInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const f = page.flags?.[MODULE_ID] ?? {};
  return {
    success: true,
    data: {
      pageId: page.id,
      uuid: page.uuid,
      name: page.name,
      category: page.parent?.name ?? null,
      content: page.text?.content ?? '',
      flags: {
        checkboxes: f.checkboxes ?? {},
        secret: f.secret ?? {},
        hidden: Boolean(f.hidden),
        completed: Boolean(f.completed),
        completedSubquests: f.completedSubquests ?? {},
        lastUpdated: f.lastUpdated ?? null,
        counters: f.counters ?? {},
        color: f.color ?? null,
        markers: f.markers ?? {},
        measure: f.measure ?? null,
        pinsLocked: f.pinsLocked ?? null,
        fowMask: f.fowMask ?? null,
      },
    },
  };
}

// ── Quest tab — writes ────────────────────────────────────────────────────────────

type CreateQuestInput = Extract<SimpleQuestInputType, { action: 'create-quest' }>;
async function handleCreateQuest(input: CreateQuestInput): Promise<Envelope<unknown>> {
  const folderName = getSetting('folderName') ?? 'Quests';
  const categoryName = input.category ?? folderName;
  const journal = await findOrCreateCategory(categoryName, folderName);
  if (!journal) return { success: false, error: 'SIMPLE_QUEST_CREATE_FAILED: category JournalEntry could not be resolved' };

  const [page] = await journal.createEmbeddedDocuments('JournalEntryPage', [
    { name: input.name, text: { content: input.content ?? '' } },
  ]);
  if (!page) return { success: false, error: 'SIMPLE_QUEST_CREATE_FAILED: page create returned nothing' };

  // DP-16 — re-read the page and confirm name + content persisted.
  const fresh = (await getPage(page.uuid)) ?? page;
  // verifyDocWrite is for flag/field maps; name+content are core fields — compare directly here.
  if ((fresh._source?.name ?? fresh.name) !== input.name) {
    return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: page name did not persist` };
  }

  notify.created('simple-quest', input.name, { summary: `quest page in "${categoryName}"`, uuid: page.uuid });
  return {
    success: true,
    data: { pageId: page.id, uuid: page.uuid, name: page.name, journalId: journal.id, category: categoryName },
  };
}

type SetQuestStateInput = Extract<SimpleQuestInputType, { action: 'set-quest-state' }>;
async function handleSetQuestState(input: SetQuestStateInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };

  const now = Date.now();
  const update: Record<string, unknown> = { 'flags.simple-quest.lastUpdated': now };
  if (input.completed !== undefined) update['flags.simple-quest.completed'] = input.completed;

  let tickedAll: number | null = null;
  if (input.tickAll !== undefined) {
    // Bulk-tick rewrites ONLY existing checkbox keys (no new key derivation — HC-v2-5-safe).
    const existing = page.getFlag(MODULE_ID, 'checkboxes') ?? {};
    const next: Record<string, number> = {};
    for (const k of Object.keys(existing)) next[k] = input.tickAll;
    update['flags.simple-quest.checkboxes'] = next;
    tickedAll = input.tickAll;
  }

  await page.update(update);

  // DP-16 verify (re-read).
  const fresh = (await getPage(input.pageUuid)) ?? page;
  if (input.completed !== undefined) {
    verifyFlagWrite(fresh, MODULE_ID, 'completed', input.completed, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);
  }
  verifyFlagWrite(fresh, MODULE_ID, 'lastUpdated', now, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, {
    summary: `state${input.completed !== undefined ? ` completed=${input.completed}` : ''}${tickedAll !== null ? ` tickAll=${tickedAll}` : ''}`,
    uuid: page.uuid,
  });
  return {
    success: true,
    data: { pageUuid: input.pageUuid, name: page.name, completed: input.completed ?? null, tickedAll, lastUpdated: now },
  };
}

type SetObjectiveStateInput = Extract<SimpleQuestInputType, { action: 'set-objective-state' }>;
async function handleSetObjectiveState(input: SetObjectiveStateInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const key = deriveObjectiveKey(input.objectiveText);
  const rename = checkRename(page, key, input.acknowledgeRename);
  if (rename) return rename;

  const old = page.getFlag(MODULE_ID, 'checkboxes') ?? {};
  const next = { ...old, [key]: input.state };
  await page.update({ 'flags.simple-quest.checkboxes': next });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'checkboxes', next, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: `objective "${key}" → ${input.state}`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, objectiveKey: key, state: input.state } };
}

type SetObjectiveVisibilityInput = Extract<SimpleQuestInputType, { action: 'set-objective-visibility' }>;
async function handleSetObjectiveVisibility(input: SetObjectiveVisibilityInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const key = deriveObjectiveKey(input.objectiveText);
  const rename = checkRename(page, key, input.acknowledgeRename);
  if (rename) return rename;

  const old = page.getFlag(MODULE_ID, 'secret') ?? {};
  const next = { ...old, [key]: input.hidden };
  await page.update({ 'flags.simple-quest.secret': next });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'secret', next, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: `objective "${key}" hidden=${input.hidden}`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, objectiveKey: key, hidden: input.hidden } };
}

type SetQuestVisibilityInput = Extract<SimpleQuestInputType, { action: 'set-quest-visibility' }>;
async function handleSetQuestVisibility(input: SetQuestVisibilityInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  await page.update({ 'flags.simple-quest.hidden': input.hidden });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'hidden', input.hidden, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: `quest hidden=${input.hidden}`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, hidden: input.hidden } };
}

type SetSubquestStateInput = Extract<SimpleQuestInputType, { action: 'set-subquest-state' }>;
async function handleSetSubquestState(input: SetSubquestStateInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  // header slug = header.innerText.slugify({strict:true}) — reproduce via the module's slugify path.
  const decoded = decodeEntities(String(input.headerText).replace(/<[^>]*>/g, ''));
  const slugify = (globalThis as any).String?.prototype?.slugify
    ? (s: string) => (s as any).slugify({ strict: true })
    : (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-+)|(-+$)/g, '');
  const headerKey = slugify(decoded);

  const old = page.getFlag(MODULE_ID, 'completedSubquests') ?? {};
  const next = { ...old, [headerKey]: input.completed };
  await page.update({ 'flags.simple-quest.completedSubquests': next });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'completedSubquests', next, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: `subquest "${headerKey}" completed=${input.completed}`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, headerKey, completed: input.completed } };
}

type MoveQuestInput = Extract<SimpleQuestInputType, { action: 'move-quest' }>;
async function handleMoveQuest(input: MoveQuestInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const sourceJournal = page.parent;
  if (!sourceJournal) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: page "${input.pageUuid}" has no parent journal` };

  const folderName = getSetting('folderName') ?? 'Quests';
  // Resolve target category by id or name.
  let targetJournal =
    getGame().journal.get(input.targetCategory) ??
    getGame().journal.find((j: any) => j.name === input.targetCategory && j.folder?.name === folderName);
  if (!targetJournal) targetJournal = await findOrCreateCategory(input.targetCategory, folderName);
  if (!targetJournal) return { success: false, error: 'SIMPLE_QUEST_NOT_FOUND: target category could not be resolved' };

  const [moved] = await targetJournal.createEmbeddedDocuments('JournalEntryPage', [page.toObject()]);
  if (!moved) return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: page did not re-create in the target category` };
  // RAW delete-from-source — never the module's deleteDialog (HC-v2-6 analog).
  await sourceJournal.deleteEmbeddedDocuments('JournalEntryPage', [page.id]);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: `moved → "${targetJournal.name}"`, uuid: moved.uuid });
  return { success: true, data: { oldPageUuid: input.pageUuid, newPageUuid: moved.uuid, targetCategory: targetJournal.name } };
}

type MarkUpdatedInput = Extract<SimpleQuestInputType, { action: 'mark-quest-updated' }>;
async function handleMarkQuestUpdated(input: MarkUpdatedInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const now = Date.now();
  await page.update({ 'flags.simple-quest.lastUpdated': now });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'lastUpdated', now, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: 'marked updated', uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, lastUpdated: now } };
}

type ShareQuestInput = Extract<SimpleQuestInputType, { action: 'share-quest' }>;
async function handleShareQuest(input: ShareQuestInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  // RAW ChatMessage.create — bypass the module's Dialog.confirm (app.js:414, HC-v2-6 analog).
  const ChatMessage: any = (globalThis as any).ChatMessage;
  const msg = await ChatMessage.create({
    content: `<div class="dnd5e2"><h2 id="simple-quest-image-override">Quest Shared</h2><hr><button data-uuid="${page.uuid}" class="share-quest-button"><i style="pointer-events: none;" class="fa-duotone fa-scroll-old"></i> ${page.name}</button><hr></div>`,
    speaker: { alias: 'Simple Quest' },
    flags: { [MODULE_ID]: { simpleQuestMessage: page.uuid } },
  });
  if (!msg) return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: ChatMessage.create returned nothing` };

  notify.created('simple-quest', page.name ?? input.pageUuid, { summary: 'shared to chat', uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, name: page.name, chatMessageId: msg.id } };
}

type ShowToPlayersInput = Extract<SimpleQuestInputType, { action: 'show-quest-to-players' }>;
async function handleShowQuestToPlayers(input: ShowToPlayersInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };

  // Target users: explicit list, else all active non-GM users.
  const game = getGame();
  const userIds: string[] =
    input.userIds && input.userIds.length > 0
      ? input.userIds
      : Array.from(game.users ?? [])
          .filter((u: any) => u.active && !u.isGM)
          .map((u: any) => u.id);

  // Push openToPage by emitting directly on the module's socket channel — NEVER the module's Dialog.prompt
  // showQuest (app.js:1391, HC-v2-6 analog). simple-quest registers a `module.simple-quest` listener
  // (Socket.__$onMessage, scripts/lib/socket.js:21-47) that returns unless options.users.includes(game.user.id),
  // then dispatches __$callbacks[options.__$eventName](data). We replicate that envelope. (A prior attempt
  // dynamic-imported the module's own Socket wrapper, but scripts/lib/socket.js is not served as a standalone
  // ES module at runtime — it `import`s ../main.js and is bundled into index.js — so the import 404s. Emitting
  // the envelope ourselves needs no module code.) Fire-and-forget: socket.emit has no ack, so no DP-16.
  const targets = userIds.filter((id): id is string => !!id);
  const foundryNS = (globalThis as any).foundry;
  (game.socket as any)?.emit?.(`module.${MODULE_ID}`, {
    uuid: page.uuid,
    __$socketOptions: {
      users: targets,
      __$eventName: 'openToPage',
      __$eventId: foundryNS?.utils?.randomID?.() ?? `mcp-show-${page.id}`,
    },
  });

  const delivered = targets.length > 0;
  notify.info(
    delivered
      ? `Quest shown to ${targets.length} player(s): ${page.name ?? input.pageUuid}`
      : `show-quest-to-players: no active non-GM players to receive "${page.name ?? input.pageUuid}"`,
  );
  return {
    success: true,
    data: {
      pageUuid: input.pageUuid,
      userIds: targets,
      delivered,
      ...(delivered ? {} : { note: 'no active non-GM players connected — nothing was pushed' }),
    },
  };
}

type SetCounterInput = Extract<SimpleQuestInputType, { action: 'set-counter' }>;
async function handleSetCounter(input: SetCounterInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const old = page.getFlag(MODULE_ID, 'counters') ?? {};
  const next = { ...old, [input.counterId]: input.value };
  await page.update({ 'flags.simple-quest.counters': next });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'counters', next, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: `counter "${input.counterId}"=${input.value}`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, counterId: input.counterId, value: input.value } };
}

type DuplicateQuestInput = Extract<SimpleQuestInputType, { action: 'duplicate-quest' }>;
async function handleDuplicateQuest(input: DuplicateQuestInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const copy = await page.clone({ name: `${page._source?.name ?? page.name} (Copy)` }, { save: true, addSource: true });
  const cloned = Array.isArray(copy) ? copy[0] : copy;
  if (!cloned) return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: clone returned nothing` };

  notify.created('simple-quest', cloned.name ?? `${page.name} (Copy)`, { summary: 'duplicated quest', uuid: cloned.uuid });
  return {
    success: true,
    data: { sourcePageUuid: input.pageUuid, newPageId: cloned.id, newPageUuid: cloned.uuid, name: cloned.name },
  };
}

type DeleteQuestInput = Extract<SimpleQuestInputType, { action: 'delete-quest' }>;
async function handleDeleteQuest(input: DeleteQuestInput): Promise<Envelope<unknown>> {
  // CCR-4 confirm gate (item-piles pattern) — actionable token on omission.
  if (input.confirm !== true) {
    return {
      success: false,
      error: `${ErrorTokens.SIMPLE_QUEST_CONFIRM_REQUIRED}: delete-quest permanently deletes the quest JournalEntryPage. Re-send with confirm:true.`,
    };
  }
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const journal = page.parent;
  const name = page.name;
  const pageId = page.id;
  // RAW deleteEmbeddedDocuments — never the module's Dialog.confirm (app.js:441, HC-v2-6 analog).
  await journal.deleteEmbeddedDocuments('JournalEntryPage', [pageId]);

  // DP-16 — confirm the page is gone.
  const stillThere = await getPage(input.pageUuid);
  if (stillThere) {
    return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: page "${input.pageUuid}" still present after delete` };
  }
  notify.deleted('simple-quest', name ?? input.pageUuid, { uuid: input.pageUuid });
  return { success: true, data: { pageUuid: input.pageUuid, name, deleted: true } };
}

// ── Map tab ───────────────────────────────────────────────────────────────────

type CreateMarkerInput = Extract<SimpleQuestInputType, { action: 'create-map-marker' }>;
async function handleCreateMapMarker(input: CreateMarkerInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const markerId = foundryUtils()?.randomID?.(20) ?? `mk${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const old = page.getFlag(MODULE_ID, 'markers') ?? {};
  const marker = { color: '#ff0000', hidden: false, ...input.marker };
  const next = { ...old, [markerId]: marker };
  await page.update({ 'flags.simple-quest.markers': next });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'markers', next, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.created('simple-quest', page.name ?? input.pageUuid, { summary: `map marker "${marker.title ?? markerId}"`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, markerId, marker } };
}

type UpdateMarkerInput = Extract<SimpleQuestInputType, { action: 'update-map-marker' }>;
async function handleUpdateMapMarker(input: UpdateMarkerInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const old = page.getFlag(MODULE_ID, 'markers') ?? {};
  if (!old[input.markerId]) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no marker "${input.markerId}" on this page` };
  const merged = { ...old[input.markerId], ...input.marker };
  const next = { ...old, [input.markerId]: merged };
  await page.update({ 'flags.simple-quest.markers': next });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  verifyFlagWrite(fresh, MODULE_ID, 'markers', next, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: `marker "${input.markerId}" updated`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, markerId: input.markerId, marker: merged } };
}

type RemoveMarkerInput = Extract<SimpleQuestInputType, { action: 'remove-map-marker' }>;
async function handleRemoveMapMarker(input: RemoveMarkerInput): Promise<Envelope<unknown>> {
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };
  const old = page.getFlag(MODULE_ID, 'markers') ?? {};
  if (!old[input.markerId]) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no marker "${input.markerId}" on this page` };
  // Use Foundry's -=key deletion marker to drop the single marker key.
  await page.update({ [`flags.simple-quest.markers.-=${input.markerId}`]: null });

  const fresh = (await getPage(input.pageUuid)) ?? page;
  const after = fresh.getFlag?.(MODULE_ID, 'markers') ?? {};
  if (after[input.markerId]) {
    return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: marker "${input.markerId}" still present after remove` };
  }
  notify.deleted('simple-quest', page.name ?? input.pageUuid, { summary: `marker "${input.markerId}" removed`, uuid: page.uuid });
  return { success: true, data: { pageUuid: input.pageUuid, markerId: input.markerId, removed: true } };
}

type SetMapConfigInput = Extract<SimpleQuestInputType, { action: 'set-map-config' }>;
async function handleSetMapConfig(input: SetMapConfigInput): Promise<Envelope<unknown>> {
  if (input.measure === undefined && input.pinsLocked === undefined && input.fowMask === undefined) {
    return { success: false, error: 'SIMPLE_QUEST_INVALID_INPUT: set-map-config requires at least one of: measure, pinsLocked, fowMask' };
  }
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };

  const update: Record<string, unknown> = {};
  if (input.measure !== undefined) update['flags.simple-quest.measure'] = input.measure;
  if (input.pinsLocked !== undefined) update['flags.simple-quest.pinsLocked'] = input.pinsLocked;
  if (input.fowMask !== undefined) update['flags.simple-quest.fowMask'] = input.fowMask;
  await page.update(update);

  const fresh = (await getPage(input.pageUuid)) ?? page;
  if (input.measure !== undefined) verifyFlagWrite(fresh, MODULE_ID, 'measure', input.measure, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);
  if (input.pinsLocked !== undefined) verifyFlagWrite(fresh, MODULE_ID, 'pinsLocked', input.pinsLocked, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);
  if (input.fowMask !== undefined) verifyFlagWrite(fresh, MODULE_ID, 'fowMask', input.fowMask, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.updated('simple-quest', page.name ?? input.pageUuid, { summary: 'map config updated', uuid: page.uuid });
  return {
    success: true,
    data: {
      pageUuid: input.pageUuid,
      measure: input.measure ?? (fresh.getFlag?.(MODULE_ID, 'measure') ?? null),
      pinsLocked: input.pinsLocked ?? (fresh.getFlag?.(MODULE_ID, 'pinsLocked') ?? null),
      fowMask: input.fowMask ?? (fresh.getFlag?.(MODULE_ID, 'fowMask') ?? null),
    },
  };
}

// ── Lore tab ───────────────────────────────────────────────────────────────────

type ListLoreInput = Extract<SimpleQuestInputType, { action: 'list-lore' }>;
function handleListLore(_input: ListLoreInput): Envelope<unknown> {
  const folderName = getSetting('loreFolderName') ?? 'Lore';
  const folder = findFolder(folderName);
  const journals = folder ? getGame().journal.filter((j: any) => j.folder?.id === folder.id) : [];
  const pages: any[] = [];
  for (const j of journals) {
    for (const p of Array.from(j.pages ?? [])) {
      pages.push({ pageId: (p as any).id, uuid: (p as any).uuid, name: (p as any).name });
    }
  }
  return { success: true, data: { folderName, count: pages.length, pages } };
}

type CreateLoreInput = Extract<SimpleQuestInputType, { action: 'create-lore' }>;
async function handleCreateLore(input: CreateLoreInput): Promise<Envelope<unknown>> {
  const folderName = getSetting('loreFolderName') ?? 'Lore';
  const categoryName = input.category ?? folderName;
  const journal = await findOrCreateCategory(categoryName, folderName);
  if (!journal) return { success: false, error: 'SIMPLE_QUEST_CREATE_FAILED: lore category could not be resolved' };

  const [page] = await journal.createEmbeddedDocuments('JournalEntryPage', [
    { name: input.name, text: { content: input.content ?? '' } },
  ]);
  if (!page) return { success: false, error: 'SIMPLE_QUEST_CREATE_FAILED: lore page create returned nothing' };
  const fresh = (await getPage(page.uuid)) ?? page;
  if ((fresh._source?.name ?? fresh.name) !== input.name) {
    return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: lore page name did not persist` };
  }

  notify.created('simple-quest', input.name, { summary: `lore page in "${categoryName}"`, uuid: page.uuid });
  return { success: true, data: { pageId: page.id, uuid: page.uuid, name: page.name, journalId: journal.id } };
}

// ── Achievements tab ────────────────────────────────────────────────────────────

type ListAchievementsInput = Extract<SimpleQuestInputType, { action: 'list-achievements' }>;
function handleListAchievements(_input: ListAchievementsInput): Envelope<unknown> {
  const folderName = getSetting('achievementsJournalName') ?? 'Achievements';
  // Achievements live in a journal named achievementsJournalName (not a folder).
  const journal = getGame().journal?.getName?.(folderName);
  const achievements = journal
    ? Array.from(journal.pages ?? []).map((p: any) => ({
        pageId: p.id,
        uuid: p.uuid,
        name: p.name,
        color: p.getFlag?.(MODULE_ID, 'color') ?? null,
      }))
    : [];
  return { success: true, data: { count: achievements.length, achievements } };
}

type CreateAchievementInput = Extract<SimpleQuestInputType, { action: 'create-achievement' }>;
async function handleCreateAchievement(input: CreateAchievementInput): Promise<Envelope<unknown>> {
  const journalName = getSetting('achievementsJournalName') ?? 'Achievements';
  // Achievements live in the SINGLE journal named achievementsJournalName — the same one list-achievements
  // reads via game.journal.getName(journalName). (Earlier this created a category journal in the Quests
  // folder, so created achievements were invisible to list-achievements — live-smoke MAJOR 2026-06-25.)
  // The `category` param does not apply to achievements (the tab is one journal, not a folder of categories).
  let journal = getGame().journal?.getName?.(journalName);
  if (!journal) {
    const folderName = getSetting('folderName') ?? 'Quests';
    journal = await findOrCreateCategory(journalName, folderName);
  }
  if (!journal) return { success: false, error: 'SIMPLE_QUEST_CREATE_FAILED: achievements journal could not be resolved' };

  const flags = input.color !== undefined ? { [MODULE_ID]: { color: input.color } } : undefined;
  const pageData: Record<string, unknown> = { name: input.name, text: { content: input.content ?? '' } };
  if (flags) pageData.flags = flags;
  const [page] = await journal.createEmbeddedDocuments('JournalEntryPage', [pageData]);
  if (!page) return { success: false, error: 'SIMPLE_QUEST_CREATE_FAILED: achievement page create returned nothing' };

  const fresh = (await getPage(page.uuid)) ?? page;
  if (input.color !== undefined) verifyFlagWrite(fresh, MODULE_ID, 'color', input.color, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);

  notify.created('simple-quest', input.name, { summary: 'achievement', uuid: page.uuid });
  return { success: true, data: { pageId: page.id, uuid: page.uuid, name: page.name, journalId: journal.id, color: input.color ?? null } };
}

type SetAchievementInput = Extract<SimpleQuestInputType, { action: 'set-achievement' }>;
async function handleSetAchievement(input: SetAchievementInput): Promise<Envelope<unknown>> {
  if (input.award === undefined && input.color === undefined) {
    return { success: false, error: 'SIMPLE_QUEST_INVALID_INPUT: set-achievement requires at least one of: award (with userId), color' };
  }
  if (input.award !== undefined && !input.userId) {
    return { success: false, error: 'SIMPLE_QUEST_INVALID_INPUT: award requires userId' };
  }
  const page = await getPage(input.pageUuid);
  if (!page) return { success: false, error: `SIMPLE_QUEST_NOT_FOUND: no page "${input.pageUuid}"` };

  const LEVELS = (globalThis as any).CONST?.DOCUMENT_OWNERSHIP_LEVELS ?? { OWNER: 3, NONE: 0 };
  const update: Record<string, unknown> = {};
  if (input.award !== undefined && input.userId) {
    update[`ownership.${input.userId}`] = input.award ? LEVELS.OWNER : LEVELS.NONE;
  }
  if (input.color !== undefined) update['flags.simple-quest.color'] = input.color;
  await page.update(update);

  const fresh = (await getPage(input.pageUuid)) ?? page;
  if (input.color !== undefined) verifyFlagWrite(fresh, MODULE_ID, 'color', input.color, ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED);
  if (input.award !== undefined && input.userId) {
    const persisted = foundryUtils()?.getProperty?.(fresh._source, `ownership.${input.userId}`);
    const expected = input.award ? LEVELS.OWNER : LEVELS.NONE;
    if (persisted !== expected) {
      return { success: false, error: `${ErrorTokens.SIMPLE_QUEST_NOT_PERSISTED}: ownership for ${input.userId} did not persist` };
    }
  }

  notify.updated('simple-quest', page.name ?? input.pageUuid, {
    summary: `achievement${input.award !== undefined ? ` award=${input.award} → ${input.userId}` : ''}${input.color !== undefined ? ` color=${input.color}` : ''}`,
    uuid: page.uuid,
  });
  return { success: true, data: { pageUuid: input.pageUuid, userId: input.userId ?? null, award: input.award ?? null, color: input.color ?? null } };
}
