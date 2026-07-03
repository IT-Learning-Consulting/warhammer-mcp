// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Imperial Arcana Phase 7 — MIRRORED constants.
//
// ─────────────────────────────────────────────────────────────────────────────
// MIRRORED from the wfrp-imperial-arcana module's `module/const.mjs` + `module/omen.mjs`.
// HC6 forbids this package depending on / importing the module (it is a SEPARATE Foundry
// module, and its const.mjs is browser ESM unreachable from this TS package). The
// Phase-0 mcp-surface.md explicitly sanctioned "mirror, NOT import."
//
// RE-SYNC RULE: if the module ever changes SPREADS, CONJUNCTIONS, the NINEFOLD rule,
// the Card Index page-ID scheme, or the fixed IDs, this file MUST be updated to match —
// a silent drift here mis-lays spreads / mis-detects conjunctions / blanks meanings.
// Source of truth: E:\foundry_v13\data\Data\modules\wfrp-imperial-arcana\module\const.mjs
// (read at Phase 7 authoring, 2026-06-21).
// ─────────────────────────────────────────────────────────────────────────────

export const MODULE_ID = 'wfrp-imperial-arcana';

// Fixed document IDs (CCR-2) — exactly 16 chars; preserved across installs by the Adventure import.
export const DECK_ID = 'ImperialDeck0000'; // the 36-card Cards deck
export const JOURNAL_CARDS_ID = 'ImperialCards000'; // Card Index journal, 36 pages (one per numeral)

// CARD_PAGE_IDS[numeral] — the Card Index page id for a numeral (12-char prefix + 4-digit numeral).
export const CARD_PAGE_IDS: readonly string[] = Object.freeze(
  Array.from({ length: 36 }, (_, n) => `ImperialCard${String(n).padStart(4, '0')}`),
);

// READING_SCHEMA_VERSION — frozen CCR-10 record version. Phase 7 reads it and FAILS LOUD on drift.
export const READING_SCHEMA_VERSION = 1;

// READINGS_FOLDER — the world JournalEntry folder reading records live in (GM-only ownership).
export const READINGS_FOLDER = 'Imperial Arcana — Readings';

// CARD_INDEX — numeral → face-display title (HC4). Slug omitted (asset paths not needed server-side).
export const CARD_TITLES: readonly string[] = Object.freeze([
  'The Fool', 'The Magister', 'The Huntress', 'The Sea', 'The Emperor', 'The Priest',
  'The Lovers', 'War', 'Justice', 'The Hierophant', 'The Wheel of Fate', 'Strength',
  'The Raven', 'Morr', 'Temperance', 'The Ruinous Powers', 'The Tower', 'The Star',
  'Mannslieb', 'The Sun', 'Verena', 'The Old World', 'Morrslieb', 'Ulric', 'Blitzbeil',
  'The Keep', 'Sigmar', 'The Daemon', 'Ace of Hammers', 'Ace of Swords', 'Ace of Shields',
  'Ace of Crowns', 'The Scarlet Empress', 'The Uncrowned', 'The Twin-Tailed Comet',
  'The City of the Damned',
]);

export interface SpreadDef {
  key: string;
  name: string;
  positionCount: number;
  positions: string[];
  defaultDominantOmen: string | string[];
}

// SPREADS — 11 named layouts ("A".."K"). Mirrors const.mjs SPREADS exactly.
export const SPREADS: Readonly<Record<string, SpreadDef>> = Object.freeze({
  A: { key: 'A', name: 'The Three Omens', positionCount: 3, positions: ['The Road Behind', 'The Shadow at Hand', 'The Doom Yet Unwritten'], defaultDominantOmen: 'The Shadow at Hand' },
  B: { key: 'B', name: 'The Stranger at the Door', positionCount: 3, positions: ['The Face Shown', 'The Hand Hidden', 'The Price of Trust'], defaultDominantOmen: 'The Hand Hidden' },
  C: { key: 'C', name: 'Before the Blades Are Drawn', positionCount: 3, positions: ['The Blood Already Spilt', 'The Edge of the Blade', "The Name on Morr's List"], defaultDominantOmen: 'The Edge of the Blade' },
  D: { key: 'D', name: 'The Rot Beneath the Skin', positionCount: 3, positions: ['The Want', 'The Gift', 'The Mark'], defaultDominantOmen: 'The Mark' },
  E: { key: 'E', name: 'The Trail of the Lost', positionCount: 3, positions: ['Their Last Honest Step', 'The Hand Across the Trail', 'What Finds Them First'], defaultDominantOmen: 'The Hand Across the Trail' },
  F: { key: 'F', name: 'Ashes at the Cradle', positionCount: 4, positions: ['The Seed', 'The Invitation', 'The Sign', 'The Choice'], defaultDominantOmen: 'The Choice' },
  G: { key: 'G', name: 'The Nine-Fold Door', positionCount: 5, positions: ['The Hunger', 'The Offer', 'The Taint', 'The Witness', 'The Refusal'], defaultDominantOmen: ['The Witness', 'The Refusal'] },
  H: { key: 'H', name: 'The Broken Crown', positionCount: 5, positions: ['The Claim', 'The Rival Claim', 'Those Beneath the Crown', 'The Hand Behind the Throne', 'The Breaking Point'], defaultDominantOmen: ['Those Beneath the Crown', 'The Breaking Point'] },
  I: { key: 'I', name: 'The Road Through Rain', positionCount: 4, positions: ['The Road', 'The Shelter', 'The Toll', 'The Arrival'], defaultDominantOmen: ['The Toll', 'The Arrival'] },
  J: { key: 'J', name: 'The Pale Cup', positionCount: 4, positions: ['The Source', 'The Suffering', 'The Remedy', 'The Price of Cure'], defaultDominantOmen: ['The Remedy', 'The Source'] },
  K: { key: 'K', name: 'When the Crows Descend', positionCount: 5, positions: ['The Fallen', 'The Saved', 'The Spoils', 'The Grudge', 'What Marches Next'], defaultDominantOmen: ['The Spoils', 'What Marches Next'] },
});

export const SPREAD_KEYS = Object.freeze(Object.keys(SPREADS)) as readonly string[];

export interface ConjunctionDef {
  name: string;
  numerals: number[];
  meaning: string;
}

// CONJUNCTIONS — keyed by member numerals sorted ascending + joined "|". Mirrors const.mjs.
export const CONJUNCTIONS: Readonly<Record<string, ConjunctionDef>> = Object.freeze({
  '4|32': { name: 'Throne and Desire', numerals: [4, 32], meaning: 'Lawful authority faces popular influence, admired rebellion or seductive legitimacy.' },
  '4|33': { name: 'The Denied Succession', numerals: [4, 33], meaning: 'Formal order rests upon someone excluded, dispossessed or silenced.' },
  '32|33': { name: 'The Beloved Exile', numerals: [32, 33], meaning: 'A rejected claimant may gather dangerous admiration.' },
  '4|32|33': { name: 'The Broken Crown', numerals: [4, 32, 33], meaning: 'The conflict concerns office, popularity and grievance at once; ordinary people will pay for whichever claim prevails.' },
  '17|34': { name: 'Hope Made Prophecy', numerals: [17, 34], meaning: 'A private hope becomes public expectation and can no longer be pursued quietly.' },
  '19|34': { name: 'The Revealed Sign', numerals: [19, 34], meaning: 'A claimed prophecy is about to be tested against visible truth.' },
  '34|35': { name: 'The Mordheim Echo', numerals: [34, 35], meaning: 'Salvation, revelation or promised change draws people toward catastrophe and corrupt reward.' },
  '16|35': { name: 'Ruin Upon Ruin', numerals: [16, 35], meaning: 'Collapse exposes an opportunity that is almost certainly dangerous to possess.' },
  '15|27': { name: 'The Offered Hand', numerals: [15, 27], meaning: 'A personal temptation has the backing of a greater corrupt pattern.' },
  '22|35': { name: 'Green Light in the Ruins', numerals: [22, 35], meaning: 'A valuable object or place visibly carries mutation, madness or unnatural alteration.' },
  '12|13': { name: 'The Last Message', numerals: [12, 13], meaning: 'The dead, dying or vanished have left a warning that may still matter.' },
  '8|24': { name: 'Verdict or Axe', numerals: [8, 24], meaning: 'The characters must choose between establishing truth and cutting danger away before proof is complete.' },
  '23|26': { name: 'Two Faiths, One Winter', numerals: [23, 26], meaning: 'Shared survival is threatened by pride, rivalry or competing ideas of honour and belonging.' },
  '25|30': { name: 'Within the Walls', numerals: [25, 30], meaning: 'Protection is possible, but someone must decide who is sheltered and who is left exposed.' },
  '31|32': { name: 'Purchased Applause', numerals: [31, 32], meaning: 'Wealth is buying reputation, allegiance, court favour or public love.' },
  '6|27': { name: 'The Beloved Mask', numerals: [6, 27], meaning: 'Personal devotion offers corruption its most persuasive disguise.' },
});

// NINEFOLD — ≥3 drawn cards whose numeral sum is divisible by 9 (← const.mjs NINEFOLD). Card 0 adds 0.
export const NINEFOLD_MIN_CARDS = 3;
export function isNinefold(numerals: number[]): boolean {
  return numerals.length >= NINEFOLD_MIN_CARDS && numerals.reduce((a, n) => a + n, 0) % 9 === 0;
}

// detectConjunctions — keys of every registered conjunction whose members are all drawn.
export function detectConjunctions(numerals: number[]): string[] {
  const drawn = new Set(numerals);
  const matched: string[] = [];
  for (const [key, entry] of Object.entries(CONJUNCTIONS)) {
    if (entry.numerals.every((n) => drawn.has(n))) matched.push(key);
  }
  return matched;
}
