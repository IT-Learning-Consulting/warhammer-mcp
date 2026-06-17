// Phase 8 (R8.4): tokenmagic sub-family of module-scene-atmosphere — result interfaces + formatters
// extracted VERBATIM from scene-atmosphere.ts (no logic change; the split is purely to land
// each file <=600 lines). Imported back by the main tool's formatResult trampoline.
import { ActorId, TokenId } from '@foundry-mcp/shared';

// ── Phase 3: tokenmagic + automatic-wounds result shapes ──────────────────────

export interface TokenmagicApplyResult {
  placeableId: string; // not a branded id (polymorphic / non-document)
  placeableType: string;
  appliedCount: number;
  filterTypes: string[];
  filterIds: (string | null)[];
  replace: boolean;
  verifiedFilterCount: number | null;
}

export interface TokenmagicUpsertResult {
  placeableId: string; // not a branded id (polymorphic / non-document)
  placeableType: string;
  upsertedCount: number;
  filterTypes: string[];
  filterIds: (string | null)[];
  verifiedFilterCount: number | null;
}

export interface TokenmagicRemoveResult {
  placeableId: string; // not a branded id (polymorphic / non-document)
  placeableType: string;
  filterId: string | null; // not a branded id (polymorphic / non-document)
  filterType: string | null;
  filterInternalId: string | null; // not a branded id (polymorphic / non-document)
  targetDesc: string;
  verifiedRemainingFilterCount: number;
}

export interface TokenmagicQueryResult {
  subAction: string;
  // Fields vary by subAction — typed as unknown; formatter emits all per F03.
  [key: string]: unknown;
}

export interface TokenmagicPresetResult {
  subAction: string;
  [key: string]: unknown;
}

export interface TokenmagicWoundCreateResult {
  tokenId: TokenId;
  tokenName: string;
  damageFraction: number;
  verifiedWoundFilterCount: number;
}

export interface TokenmagicWoundHealResult {
  tokenId: TokenId;
  tokenName: string;
  healingFraction: number;
  verifiedRemainingWoundFilterCount: number;
}

export interface TokenmagicWoundRemoveResult {
  tokenId: TokenId;
  tokenName: string;
  removed: boolean;
  verifiedRemainingWoundFilterCount: number;
}

export interface TokenmagicWoundReapplyResult {
  tokenId: TokenId;
  tokenName: string;
  reapplied: boolean;
  verifiedWoundFilterCount: number;
}

export interface WoundToggleDisableResult {
  actorId: ActorId;
  actorName: string;
  disabled: boolean;
  enabled: boolean;
  toggled: boolean;
  note?: string;
  flagInversionNote: string;
}

export interface WoundSetBloodColorResult {
  tokenId: TokenId;
  tokenName: string;
  color: string;
  verifiedColor: string | null;
  colorMatchesInput: boolean;
}

export type TokenmagicResult =
  | TokenmagicApplyResult
  | TokenmagicUpsertResult
  | TokenmagicRemoveResult
  | TokenmagicQueryResult
  | TokenmagicPresetResult
  | TokenmagicWoundCreateResult
  | TokenmagicWoundHealResult
  | TokenmagicWoundRemoveResult
  | TokenmagicWoundReapplyResult
  | WoundToggleDisableResult
  | WoundSetBloodColorResult;


// ── Phase 3: tokenmagic + wounds formatters (F03 — emit EVERY returned field) ─

export function formatTokenmagicApply(r: TokenmagicApplyResult): string {
  const ids = r.filterIds.map((id, i) => `${r.filterTypes[i]}${id ? `(${id})` : ''}`).join(', ');
  return [
    `tokenmagic: apply OK — ${r.appliedCount} filter(s) on ${r.placeableType}:${r.placeableId}${r.replace ? ' (replace=true)' : ''}.`,
    `Filters: ${ids}`,
    `Verified total filter count: ${r.verifiedFilterCount ?? 'unknown'}`,
  ].join('\n');
}

export function formatTokenmagicUpsert(r: TokenmagicUpsertResult): string {
  const ids = r.filterIds.map((id, i) => `${r.filterTypes[i]}${id ? `(${id})` : ''}`).join(', ');
  return [
    `tokenmagic: upsert OK — ${r.upsertedCount} filter(s) on ${r.placeableType}:${r.placeableId}.`,
    `Filters: ${ids}`,
    `Verified total filter count: ${r.verifiedFilterCount ?? 'unknown'}`,
  ].join('\n');
}

export function formatTokenmagicRemove(r: TokenmagicRemoveResult): string {
  return [
    `tokenmagic: remove OK on ${r.placeableType}:${r.placeableId}.`,
    `Target: ${r.targetDesc}`,
    `filterId: ${r.filterId ?? '(none)'} | filterType: ${r.filterType ?? '(none)'} | filterInternalId: ${r.filterInternalId ?? '(none)'}`,
    `Verified remaining filter count: ${r.verifiedRemainingFilterCount}`,
  ].join('\n');
}

export function formatTokenmagicQuery(r: TokenmagicQueryResult): string {
  // Emit all returned fields generically (F03 — no silent drops for read-only action).
  const sub = r.subAction as string;
  const fields = Object.entries(r)
    .filter(([k]) => k !== 'subAction')
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n  ');
  return `tokenmagic: query/${sub} result:\n  ${fields}`;
}

export function formatTokenmagicPreset(r: TokenmagicPresetResult): string {
  const sub = r.subAction as string;
  const fields = Object.entries(r)
    .filter(([k]) => k !== 'subAction')
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join('\n  ');
  return `tokenmagic: preset/${sub} result:\n  ${fields}`;
}

export function formatTokenmagicWoundCreate(r: TokenmagicWoundCreateResult): string {
  return [
    `tokenmagic-wounds: wound-create OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Damage fraction: ${r.damageFraction.toFixed(2)}`,
    `Verified wound filter count: ${r.verifiedWoundFilterCount}`,
  ].join('\n');
}

export function formatTokenmagicWoundHeal(r: TokenmagicWoundHealResult): string {
  return [
    `tokenmagic-wounds: wound-heal OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Healing fraction: ${r.healingFraction.toFixed(2)}`,
    `Verified remaining wound filter count: ${r.verifiedRemainingWoundFilterCount}`,
  ].join('\n');
}

export function formatTokenmagicWoundRemove(r: TokenmagicWoundRemoveResult): string {
  return [
    `tokenmagic-wounds: wound-remove OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Removed: ${r.removed}`,
    `Verified remaining wound filter count: ${r.verifiedRemainingWoundFilterCount}`,
  ].join('\n');
}

export function formatTokenmagicWoundReapply(r: TokenmagicWoundReapplyResult): string {
  return [
    `tokenmagic-wounds: wound-reapply OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Reapplied: ${r.reapplied}`,
    `Verified wound filter count: ${r.verifiedWoundFilterCount}`,
  ].join('\n');
}

export function formatWoundToggleDisable(r: WoundToggleDisableResult): string {
  const stateLabel = r.disabled ? 'DISABLED (wounds suppressed)' : 'ENABLED (wounds active)';
  return [
    `tokenmagic-wounds: wound-toggle-disable OK — actor "${r.actorName}" (${r.actorId}).`,
    `Wounds now: ${stateLabel} | toggled: ${r.toggled}`,
    r.note ? `Note: ${r.note}` : '',
    `FLAG INVERSION: ${r.flagInversionNote}`,
  ].filter(Boolean).join('\n');
}

export function formatWoundSetBloodColor(r: WoundSetBloodColorResult): string {
  const verifyLabel = r.colorMatchesInput ? 'OK' : `MISMATCH (got ${r.verifiedColor ?? 'null'})`;
  return [
    `tokenmagic-wounds: wound-set-blood-color OK — token "${r.tokenName}" (${r.tokenId}).`,
    `Color: ${r.color} | Verified: ${verifyLabel}`,
  ].join('\n');
}

