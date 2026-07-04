// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Imperial Arcana Phase 7 — module-* umbrella handler (foundry-module side).
//
// CONDITIONAL on the wfrp-imperial-arcana module (HC6/CCR-9): requireModuleActive is the
// FIRST executable statement, RETURNS the MODULE_NOT_ACTIVE envelope, never throws.
// 4 actions (mcp-surface.md §Recommended-approach):
//   - draw-reading     READ-ONLY  — select N distinct numerals for a spread, attach meanings.
//   - record-reading   WRITE      — the ONLY write; CCR-10 record (schemaVersion 1) + post-verify.
//   - search-omens     READ       — list+filter reading records; FAIL LOUD on schemaVersion drift.
//   - recall-callbacks READ       — records linked to one entity UUID, newest-first.
//
// Composition: calls Foundry document APIs DIRECTLY (game.cards / game.journal / game.folders /
// JournalEntry.create) — NOT sibling handlers — to respect the dependency-cruiser handler-isolation
// rule (mirrors module-css using game.settings directly). HC2: nothing here creates an ActiveEffect
// or injects a roll modifier; the Dominant Omen +10 stays manual.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { notify } from '../../../notify.js';
import { ImperialArcanaInput, type ImperialArcanaInputType } from '@foundry-mcp/shared';
import { Envelope } from '../_shared/handler-utils.js';
import {
  MODULE_ID,
  DECK_ID,
  JOURNAL_CARDS_ID,
  CARD_PAGE_IDS,
  CARD_TITLES,
  READING_SCHEMA_VERSION,
  READINGS_FOLDER,
  SPREADS,
  CONJUNCTIONS,
  isNinefold,
  detectConjunctions,
  type SpreadDef,
} from './const.js';


// ── Response shapes (typed; surfaced as structuredContent) ──────────────────────

interface CardMeaning {
  promise: string;
  peril: string;
  line: string;
  omen: string;
}
interface DrawnPosition {
  position: string;
  numeral: number;
  title: string;
  promise: string;
  peril: string;
  line: string;
}
interface ConjunctionView {
  key: string;
  name: string;
  meaning: string;
}
interface ReadingFlags {
  schemaVersion: number;
  numerals: number[];
  spread: string;
  positions: { position: string; numeral: number }[];
  dominantOmen: number | null;
  ninefold: boolean;
  conjunctions: string[];
  linkedUuids: string[];
  session: string;
  date: string;
}
interface RecordSummary {
  journalId: string;
  name: string;
  spread: string;
  spreadName: string;
  numerals: number[];
  dominantOmen: number | null;
  ninefold: boolean;
  conjunctions: string[];
  linkedUuids: string[];
  session: string;
  date: string;
}

// ── Local helpers ───────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Decode the few HTML entities the journal authoring uses + strip inner tags. */
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Read a card's Promise/Peril/Reader's-Line/Dominant-Omen from its Card Index journal page (CCR-4).
 * Mirrors the module's omen.getCardMeaning, which depends on the fixed Phase-3 page structure
 * `<h3>Promise</h3><p>…</p><h3>Peril</h3><p>…</p><h3>Reader's Line</h3><blockquote>…</blockquote>
 * <h3>Dominant Omen</h3><p>…</p>`. Uses a regex (not DOMParser) for node/test portability — same
 * fixed-structure extraction. RE-SYNC if the module changes the Card Index headings (heading drift
 * blanks the text — carry-forward Phase-4 note).
 */
function getCardMeaning(numeral: number): CardMeaning {
  const empty: CardMeaning = { promise: '', peril: '', line: '', omen: '' };
  const pageId = CARD_PAGE_IDS[numeral];
  if (!pageId) return empty;
  const game = (globalThis as any).game;
  const entry = game?.journal?.get?.(JOURNAL_CARDS_ID);
  const page = entry?.pages?.get?.(pageId);
  const html: string = page?.text?.content ?? '';
  if (!html) return empty;
  const after = (label: string): string => {
    const re = new RegExp(
      `<h3[^>]*>\\s*${escapeRegex(label)}\\s*</h3>\\s*<(p|blockquote)[^>]*>([\\s\\S]*?)</\\1>`,
      'i',
    );
    const m = re.exec(html);
    return m ? stripHtml(m[2] ?? '') : '';
  };
  return {
    promise: after('Promise'),
    peril: after('Peril'),
    line: after("Reader's Line"),
    omen: after('Dominant Omen'),
  };
}

/** N distinct numerals 0–35 (Fisher–Yates; runs in the Foundry client where Math.random is fine). */
function pickDistinctNumerals(count: number): number[] {
  const pool = Array.from({ length: 36 }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = pool[i] as number;
    pool[i] = pool[j] as number;
    pool[j] = a;
  }
  return pool.slice(0, count);
}

function conjunctionViews(keys: string[]): ConjunctionView[] {
  return keys
    .map((k) => (CONJUNCTIONS[k] ? { key: k, name: CONJUNCTIONS[k].name, meaning: CONJUNCTIONS[k].meaning } : null))
    .filter((v): v is ConjunctionView => v !== null);
}

function todayIso(): string {
  // Foundry client provides a real Date; mirror the module's ISO yyyy-mm-dd record `date`.
  return new Date().toISOString().slice(0, 10);
}

async function ensureReadingsFolder(): Promise<any> {
  const game = (globalThis as any).game;
  const existing = game?.folders?.find?.(
    (f: any) => f.type === 'JournalEntry' && f.name === READINGS_FOLDER,
  );
  if (existing) return existing;
  const Folder = (globalThis as any).Folder;
  return Folder.create({ name: READINGS_FOLDER, type: 'JournalEntry' });
}

/** Read every CCR-10 reading record in the readings folder. FAILS LOUD on schemaVersion drift. */
function readAllRecords(): RecordSummary[] {
  const game = (globalThis as any).game;
  const folder = game?.folders?.find?.(
    (f: any) => f.type === 'JournalEntry' && f.name === READINGS_FOLDER,
  );
  const journals: any[] = game?.journal?.contents ?? game?.journal ?? [];
  const out: RecordSummary[] = [];
  for (const entry of journals) {
    const flags: ReadingFlags | undefined = entry?.flags?.[MODULE_ID];
    if (!flags || typeof flags.schemaVersion !== 'number') continue; // not a reading record
    // Scope to the readings folder when it exists (the example record + app-written records live there).
    if (folder && (entry.folder?.id ?? entry.folder) !== folder.id) continue;
    if (flags.schemaVersion !== READING_SCHEMA_VERSION) {
      throw new Error(
        `${ErrorTokens.IMPERIAL_ARCANA_RECORD_NOT_PERSISTED}: reading record "${entry.id}" has schemaVersion ` +
          `${flags.schemaVersion}, expected ${READING_SCHEMA_VERSION} (CCR-10 drift — fail loud).`,
      );
    }
    out.push({
      journalId: entry.id,
      name: entry.name,
      spread: flags.spread,
      spreadName: SPREADS[flags.spread]?.name ?? flags.spread,
      numerals: flags.numerals ?? [],
      dominantOmen: flags.dominantOmen ?? null,
      ninefold: !!flags.ninefold,
      conjunctions: flags.conjunctions ?? [],
      linkedUuids: flags.linkedUuids ?? [],
      session: flags.session ?? '',
      date: flags.date ?? '',
    });
  }
  return out;
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchImperialArcana(data: unknown): Promise<any> {
  const g = requireModuleActive(MODULE_ID);
  if (g) return g;

  const parsed = ImperialArcanaInput.parse(data);
  switch (parsed.action) {
    case 'draw-reading':     return handleDrawReading(parsed);
    case 'record-reading':   return handleRecordReading(parsed);
    case 'search-omens':     return handleSearchOmens(parsed);
    case 'recall-callbacks': return handleRecallCallbacks(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown imperial-arcana action: ${(_exhaustive as any).action}` };
    }
  }
}

// ── draw-reading (READ-ONLY) ────────────────────────────────────────────────────

type DrawInput = Extract<ImperialArcanaInputType, { action: 'draw-reading' }>;

async function handleDrawReading(input: DrawInput): Promise<Envelope<unknown>> {
  const spread = SPREADS[input.spread];
  if (!spread) return { success: false, error: `UNKNOWN_SPREAD: "${input.spread}"` };

  const game = (globalThis as any).game;
  const deck = game?.cards?.get?.(DECK_ID);
  if (!deck) {
    return {
      success: false,
      error: `IMPERIAL_ARCANA_DECK_MISSING: the Imperial Arcana deck (${DECK_ID}) is not in this world. Import the module's Adventure pack first.`,
    };
  }

  // Inline / physical reading: the caller supplied the already-dealt numerals → validate + use them
  // (count must match the spread; distinct, since a deck lays distinct cards), so a physical or
  // already-dealt spread gets the SAME envelope — incl. ninefold/conjunctions — with no Card-Index
  // overflow read. Omitted → lay a fresh random spread (the unchanged default live-mode path).
  let numerals: number[];
  if (input.numerals) {
    if (input.numerals.length !== spread.positionCount) {
      return {
        success: false,
        error: `NUMERAL_COUNT_MISMATCH: spread ${spread.key} has ${spread.positionCount} positions but ${input.numerals.length} numerals were given.`,
      };
    }
    if (new Set(input.numerals).size !== input.numerals.length) {
      return {
        success: false,
        error: `DUPLICATE_NUMERALS: a reading lays distinct cards; [${input.numerals.join(', ')}] repeats a numeral.`,
      };
    }
    numerals = [...input.numerals];
  } else {
    numerals = pickDistinctNumerals(spread.positionCount);
  }
  const positions: DrawnPosition[] = spread.positions.map((label, i) => {
    const numeral = numerals[i] as number;
    const m = getCardMeaning(numeral);
    return { position: label, numeral, title: CARD_TITLES[numeral] ?? `#${numeral}`, promise: m.promise, peril: m.peril, line: m.line };
  });
  const conjunctionKeys = detectConjunctions(numerals);

  return {
    success: true,
    data: {
      spread: spread.key,
      spreadName: spread.name,
      question: input.question ?? '',
      positions,
      ninefold: isNinefold(numerals),
      conjunctions: conjunctionViews(conjunctionKeys),
      readOnly: true,
    },
  };
}

// ── record-reading (WRITE — the only one) ───────────────────────────────────────

type RecordInput = Extract<ImperialArcanaInputType, { action: 'record-reading' }>;

function buildReadingFlags(input: RecordInput, spread: SpreadDef): ReadingFlags {
  const positions = spread.positions.map((position, i) => ({ position, numeral: input.numerals[i] as number }));
  return {
    schemaVersion: READING_SCHEMA_VERSION,
    numerals: [...input.numerals],
    spread: spread.key,
    positions,
    dominantOmen: input.dominantOmen ?? null,
    ninefold: isNinefold(input.numerals),
    conjunctions: detectConjunctions(input.numerals),
    linkedUuids: input.linkedUuids ? [...input.linkedUuids] : [],
    session: input.session ?? '',
    date: input.date ?? todayIso(),
  };
}

/** Full per-position narration page (Q2 decision) — Promise/Peril/Reader's-Line from the journal,
 *  with GM-only omen notes in a Foundry secret block (CCR-5). */
function narrationHtml(flags: ReadingFlags, question: string): string {
  const spreadName = SPREADS[flags.spread]?.name ?? flags.spread;
  const head = [
    `<p><strong>Date / Session.</strong> ${esc(flags.date)}${flags.session ? ` — ${esc(flags.session)}` : ''}</p>`,
    `<p><strong>Spread.</strong> ${esc(spreadName)} (${esc(flags.spread)})</p>`,
    question ? `<p><strong>Question.</strong> ${esc(question)}</p>` : '',
  ].join('\n');

  const sections = flags.positions
    .map((p) => {
      const m = getCardMeaning(p.numeral);
      const title = CARD_TITLES[p.numeral] ?? `#${p.numeral}`;
      const star = flags.dominantOmen === p.numeral ? ' ★' : '';
      return [
        `<h3>${esc(p.position)} — ${p.numeral}. ${esc(title)}${star}</h3>`,
        m.promise ? `<p><strong>Promise.</strong> ${esc(m.promise)}</p>` : '',
        m.peril ? `<p><strong>Peril.</strong> ${esc(m.peril)}</p>` : '',
        m.line ? `<blockquote>${esc(m.line)}</blockquote>` : '',
      ].filter(Boolean).join('\n');
    })
    .join('\n');

  const omenNotes: string[] = [];
  if (flags.ninefold) omenNotes.push('<p><strong>Ninefold Aligned</strong> — the numeral sum is divisible by 9.</p>');
  for (const c of conjunctionViews(flags.conjunctions)) {
    omenNotes.push(`<p><strong>${esc(c.name)}.</strong> ${esc(c.meaning)}</p>`);
  }
  const gmBlock = omenNotes.length
    ? `<section class="secret"><div class="ia-gm-note"><h3>Omen Notes (GM)</h3>${omenNotes.join('')}</div></section>`
    : '';

  return [head, '<h2>Cards Drawn</h2>', sections, gmBlock].filter(Boolean).join('\n');
}

async function handleRecordReading(input: RecordInput): Promise<Envelope<unknown>> {
  const spread = SPREADS[input.spread];
  if (!spread) return { success: false, error: `UNKNOWN_SPREAD: "${input.spread}"` };
  if (input.numerals.length !== spread.positionCount) {
    return {
      success: false,
      error: `NUMERAL_COUNT_MISMATCH: spread ${spread.key} has ${spread.positionCount} positions but ${input.numerals.length} numerals were given.`,
    };
  }
  if (input.dominantOmen != null && !input.numerals.includes(input.dominantOmen)) {
    return {
      success: false,
      error: `DOMINANT_OMEN_NOT_DRAWN: dominantOmen ${input.dominantOmen} is not among the drawn numerals [${input.numerals.join(', ')}].`,
    };
  }

  const game = (globalThis as any).game;
  const flags = buildReadingFlags(input, spread);
  const content = narrationHtml(flags, input.question ?? '');
  const name = `Reading: ${spread.name} — ${flags.date}`;

  let entry: any;
  if (input.journalId) {
    // Annotate / overwrite an existing record (flag merge + page rewrite).
    const existing = game?.journal?.get?.(input.journalId);
    if (!existing) return { success: false, error: `RECORD_NOT_FOUND: JournalEntry ${input.journalId} does not exist.` };
    await existing.update({ flags: { [MODULE_ID]: flags } });
    const firstPage = existing.pages?.contents?.[0] ?? existing.pages?.find?.(() => true);
    if (firstPage) await firstPage.update({ 'text.content': content });
    entry = game?.journal?.get?.(input.journalId);
  } else {
    const folder = await ensureReadingsFolder();
    const JournalEntry = (globalThis as any).JournalEntry;
    const userId = game?.user?.id;
    const created = await JournalEntry.create({
      name,
      folder: folder?.id ?? null,
      // GM-only by default; the creating user is OWNER of their own record (CCR-5).
      ownership: { default: 0, ...(userId ? { [userId]: 3 } : {}) },
      pages: [{ name: 'Reading', type: 'text', title: { show: true, level: 1 }, text: { format: 1, content } }],
      flags: { [MODULE_ID]: flags },
    });
    entry = game?.journal?.get?.(created?.id) ?? created;
  }

  if (!entry) {
    throw new Error(`${ErrorTokens.IMPERIAL_ARCANA_RECORD_NOT_PERSISTED}: reading record not found after write.`);
  }
  // DP-16 post-write verify — re-read the persisted flags (the success envelope alone is not proof).
  verifyFlagWrite(entry, MODULE_ID, 'schemaVersion', READING_SCHEMA_VERSION, ErrorTokens.IMPERIAL_ARCANA_RECORD_NOT_PERSISTED);
  verifyFlagWrite(entry, MODULE_ID, 'spread', flags.spread, ErrorTokens.IMPERIAL_ARCANA_RECORD_NOT_PERSISTED);
  verifyFlagWrite(entry, MODULE_ID, 'numerals', flags.numerals, ErrorTokens.IMPERIAL_ARCANA_RECORD_NOT_PERSISTED);

  notify.created('journal', name, { uuid: entry.uuid, summary: `Imperial Arcana reading (${spread.key})` });

  return { success: true, data: { journalId: entry.id, name, flags } };
}

// ── search-omens (READ) ─────────────────────────────────────────────────────────

type SearchInput = Extract<ImperialArcanaInputType, { action: 'search-omens' }>;

function matchesSearch(r: RecordSummary, input: SearchInput): boolean {
  if (input.spread && r.spread !== input.spread) return false;
  if (input.numerals && input.numerals.length) {
    const have = new Set(r.numerals);
    if (!input.numerals.every((n) => have.has(n))) return false; // record must contain ALL queried numerals
  }
  if (input.linkedUuids && input.linkedUuids.length) {
    const have = new Set(r.linkedUuids);
    if (!input.linkedUuids.some((u) => have.has(u))) return false; // intersects ANY queried uuid
  }
  if (input.dateFrom && (!r.date || r.date < input.dateFrom)) return false;
  if (input.dateTo && (!r.date || r.date > input.dateTo)) return false;
  return true;
}

async function handleSearchOmens(input: SearchInput): Promise<Envelope<unknown>> {
  const all = readAllRecords();
  const records = all.filter((r) => matchesSearch(r, input)).sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0));
  return { success: true, data: { count: records.length, records } };
}

// ── recall-callbacks (READ) ─────────────────────────────────────────────────────

type RecallInput = Extract<ImperialArcanaInputType, { action: 'recall-callbacks' }>;

async function handleRecallCallbacks(input: RecallInput): Promise<Envelope<unknown>> {
  const limit = input.limit ?? 20;
  const all = readAllRecords();
  const matched = all
    .filter((r) => r.linkedUuids.includes(input.linkedUuid))
    .sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0))
    .slice(0, limit);
  const records = matched.map((r) => ({
    ...r,
    summary: `${r.spreadName} (${r.spread}) — ${r.date || 'undated'}${r.ninefold ? ' · Ninefold' : ''}${r.conjunctions.length ? ` · ${r.conjunctions.length} conjunction(s)` : ''}`,
  }));
  return { success: true, data: { linkedUuid: input.linkedUuid, count: records.length, records } };
}
