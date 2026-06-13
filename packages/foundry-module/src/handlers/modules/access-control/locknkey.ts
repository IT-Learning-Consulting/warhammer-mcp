// Module Integration v1 Phase 7A/7B — LocknKey (Lock & Key) action handlers.
//
// Handlers run inside Foundry via CONFIG.queries (no macro bridge). They call the
// LocknKey public API at game.modules.get('LocknKey').api (LnKFlags class +
// createNewcustomKey + TransferItems) directly.
//
// Confirmed signatures (modules-docs/LocknKey/audit.md + live source drift-check 2026-06-13):
//   api.LnKFlags.makeLockable(doc, startLocked?) / disableLock(doc) / setLockedstate(doc, bool)
//   api.LnKFlags.JamLock(lock) / linkKeyLock(item, lock, id?) / setPassKey(obj, passkey)
//   api.LnKFlags.addIdentityKeys(lock, ids) / giveFreeLockCircumvent(token) / removeFreeLockCircumvent(token)
//   api.LnKFlags.setCustomPopups(obj, popups) / resetLPAttempts(lock)
//   api.LnKFlags.isLockable / isLocked / canbePicked / canbeBroken / Lockisjammed / KeyIDs / LockDC / LockBreakDC / LockCCDC
//   api.createNewcustomKey(lock, {KeyName,KeyID,KeyImage,KeyFolder}) / api.TransferItems(src, tgt, itemInfos)
//   LockManager.circumventLock(lock, char, itemID, rollResult, diceResult, methodType) — internal; resolved defensively.
//
// Locked-state writes use LnKFlags.setLockedstate (the blessed setter — it writes
// wall.ds for door walls and the LockedFlag for tokens/tiles, gated internally). We
// gate on isLockable first (EXCLUDED_UNSAFE: raw wall.update may corrupt non-door walls).
//
// notify on writes (CCR-3): document-kind aware (wall/tile/token/item). Reads silent.
// Post-write verify (DP-16): re-read accessors and include in the response.
//
// WFRP4e REPAIR_GATED: no default break/pickpocket formula for WFRP4e — surfaced as
// wfrpRepairGated note where relevant. Key item type defaults to 'cargo' — recommend 'trapping'.

import { notify } from '../../../notify.js';
import type { ModuleAccessControlInputType } from './schemas.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

function getGame(): any {
  return (globalThis as any).game;
}
function getCanvas(): any {
  return (globalThis as any).canvas;
}

/** The LocknKey public API object. Throws a typed error if unavailable. */
function getLnKApi(): any {
  const api = getGame()?.modules?.get?.('LocknKey')?.api;
  if (!api) throw new Error('LOCKNKEY_API_UNAVAILABLE: game.modules.get("LocknKey").api is not exposed.');
  return api;
}

/** LnKFlags static accessor class. */
function getLnKFlags(): any {
  const flags = getLnKApi()?.LnKFlags;
  if (!flags) throw new Error('LOCKNKEY_API_UNAVAILABLE: LnKFlags is not exposed on the LocknKey API.');
  return flags;
}

const COLLECTION: Record<string, string> = { wall: 'walls', token: 'tokens', tile: 'tiles' };

/** Resolve a wall/token/tile embedded document by ID, searching the active scene then all scenes. */
function resolveDoc(documentId: string, documentType: 'wall' | 'token' | 'tile', sceneId?: string): any {
  const game = getGame();
  const coll = COLLECTION[documentType];
  const target = sceneId ? game?.scenes?.get?.(sceneId) : getCanvas()?.scene;
  let doc = target?.[coll]?.get?.(documentId);
  if (doc) return doc;
  for (const s of game?.scenes ?? []) {
    doc = s?.[coll]?.get?.(documentId);
    if (doc) return doc;
  }
  // UUID fallback
  try {
    const fromUuid = (globalThis as any).fromUuidSync?.(documentId);
    if (fromUuid) return fromUuid;
  } catch { /* ignore */ }
  throw new Error(`DOCUMENT_NOT_FOUND: No ${documentType} with id/uuid "${documentId}".`);
}

/** Resolve an actor OR token document (for transfer-items source/target). */
function resolveActorOrToken(id: string): any {
  const game = getGame();
  const actor = game?.actors?.get?.(id);
  if (actor) return actor;
  const tokenDoc = resolveTokenAnyScene(id);
  if (tokenDoc) return tokenDoc;
  try {
    const fromUuid = (globalThis as any).fromUuidSync?.(id);
    if (fromUuid) return fromUuid;
  } catch { /* ignore */ }
  throw new Error(`ACTOR_OR_TOKEN_NOT_FOUND: No actor/token with id/uuid "${id}".`);
}

function resolveTokenAnyScene(id: string): any {
  const game = getGame();
  let t = getCanvas()?.scene?.tokens?.get?.(id);
  if (t) return t;
  for (const s of game?.scenes ?? []) {
    t = s?.tokens?.get?.(id);
    if (t) return t;
  }
  return null;
}

/** Read the full lock state via LnKFlags accessors. */
function readLockState(flags: any, doc: any, documentType: string): Record<string, unknown> {
  const safe = (fn: () => unknown) => { try { return fn(); } catch { return null; } };
  return {
    isLockable: safe(() => flags.isLockable?.(doc)),
    isLocked: safe(() => flags.isLocked?.(doc)),
    pickDC: safe(() => flags.LockDC?.(doc)),
    breakDC: safe(() => flags.LockBreakDC?.(doc)),
    ccDC: safe(() => flags.LockCCDC?.(doc)),
    canbePicked: safe(() => flags.canbePicked?.(doc)),
    canbeBroken: safe(() => flags.canbeBroken?.(doc)),
    jammed: safe(() => flags.Lockisjammed?.(doc)),
    keyIds: safe(() => flags.KeyIDs?.(doc)),
    attemptsLeft: safe(() => flags.LPAttemptsLeft?.(doc)),
    canbeCircumventedFree: safe(() => flags.canbeCircumventedFree?.(doc)),
    lockOnClose: safe(() => doc.getFlag?.('LocknKey', 'LockonCloseFlag')),
    wallDoorState: documentType === 'wall' ? (doc.ds ?? null) : undefined,
  };
}

// ── LnK setter caveats (live-smoke 2026-06-13) ────────────────────────────────────
// Several LnK public flag-setters are FIRE-AND-FORGET: they call an inner async
// #setXxxFlag WITHOUT awaiting it (setCustomPopups @1559, giveFreeLockCircumvent @1317,
// resetLPAttempts @1314). An immediate DP-16 post-write verify therefore races and reads
// stale/empty even though the write lands. Where we verify, we WRITE THE FLAG DIRECTLY via
// awaited doc.setFlag (exactly what the wrapper does internally) for determinism.
//
// Custom popups are keyed by NAME (LnKFlags.js cCustomPopup @49), NOT numeric "0".."5".
// We accept numeric indices (per the dossier API) and translate to names before writing.

const CUSTOM_POPUP_NAMES = [
  'LockLocked',            // 0
  'LocknotPickable',       // 1
  'LocknotBreakable',      // 2
  'LockPasskeyTitle',      // 3
  'LocknotCustom',         // 4
  'CharacternotPickpocketable', // 5
];
const CUSTOM_POPUP_NAME_SET = new Set(CUSTOM_POPUP_NAMES);

// ── Type aliases ────────────────────────────────────────────────────────────────
type GetLockStateInput = Extract<ModuleAccessControlInputType, { action: 'get-lock-state' }>;
type ConfigureLockInput = Extract<ModuleAccessControlInputType, { action: 'configure-lock' }>;
type ConfigureLpAttemptsInput = Extract<ModuleAccessControlInputType, { action: 'configure-lp-attempts' }>;
type CreateKeyInput = Extract<ModuleAccessControlInputType, { action: 'create-key' }>;
type AssignKeyInput = Extract<ModuleAccessControlInputType, { action: 'assign-key' }>;
type SetPasskeyInput = Extract<ModuleAccessControlInputType, { action: 'set-passkey' }>;
type SetCustomPopupInput = Extract<ModuleAccessControlInputType, { action: 'set-custom-popup' }>;
type GrantFreeCircumventInput = Extract<ModuleAccessControlInputType, { action: 'grant-free-circumvent' }>;
type CircumventLockInput = Extract<ModuleAccessControlInputType, { action: 'circumvent-lock' }>;
type TransferItemsInput = Extract<ModuleAccessControlInputType, { action: 'transfer-items' }>;

// ── get-lock-state (LnK branch — documentId present) ─────────────────────────────

export async function handleGetLockStateLnK(input: GetLockStateInput): Promise<Envelope<unknown>> {
  try {
    const flags = getLnKFlags();
    const documentType = (input.documentType ?? 'wall') as 'wall' | 'token' | 'tile';
    const doc = resolveDoc(input.documentId as string, documentType, input.sceneId);
    return {
      success: true,
      data: {
        documentId: input.documentId,
        documentType,
        ...readLockState(flags, doc, documentType),
      },
    };
  } catch (e) {
    return { success: false, error: `GET_LOCK_STATE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── configure-lock ───────────────────────────────────────────────────────────────

export async function handleConfigureLock(input: ConfigureLockInput): Promise<Envelope<unknown>> {
  try {
    const hasAnyField = [
      input.lockable, input.locked, input.startLocked, input.pickDC, input.breakDC,
      input.ccDC, input.jammed, input.lockOnClose,
    ].some((v) => v !== undefined);
    if (!hasAnyField) {
      return { success: false, error: 'CONFIGURE_LOCK_ERROR: Provide at least one field to configure.' };
    }

    const flags = getLnKFlags();
    const doc = resolveDoc(input.documentId, input.documentType, undefined);
    const applied: string[] = [];

    // 1. Lockability
    if (input.lockable === true) {
      await flags.makeLockable?.(doc, input.startLocked ?? false);
      applied.push('makeLockable');
    } else if (input.lockable === false) {
      await flags.disableLock?.(doc);
      applied.push('disableLock');
    }

    // 2. DCs (raw flag writes — DC fields are plain numbers)
    if (input.pickDC !== undefined) { await doc.setFlag('LocknKey', 'LockDCFlag', input.pickDC); applied.push('pickDC'); }
    if (input.breakDC !== undefined) { await doc.setFlag('LocknKey', 'LockBreakDCFlag', input.breakDC); applied.push('breakDC'); }
    if (input.ccDC !== undefined) { await doc.setFlag('LocknKey', 'LockCCDCFlag', input.ccDC); applied.push('ccDC'); }
    if (input.lockOnClose !== undefined) { await doc.setFlag('LocknKey', 'LockonCloseFlag', input.lockOnClose); applied.push('lockOnClose'); }

    // 3. Locked state (gate on isLockable; setLockedstate writes wall.ds for door walls)
    if (input.locked !== undefined) {
      const lockable = (() => { try { return flags.isLockable?.(doc); } catch { return false; } })();
      if (!lockable) {
        return { success: false, error: 'CONFIGURE_LOCK_ERROR: Document is not lockable; set lockable:true first (raw wall.ds writes on non-door walls are unsafe).' };
      }
      await flags.setLockedstate?.(doc, input.locked);
      applied.push(input.locked ? 'locked' : 'unlocked');
    }

    // 4. Jam (JamLock @1250 is fire-and-forget — write LockjammedFlag directly, awaited)
    if (input.jammed === true) { await doc.setFlag('LocknKey', 'LockjammedFlag', true); applied.push('jammed'); }
    else if (input.jammed === false) { await doc.setFlag('LocknKey', 'LockjammedFlag', false); applied.push('unjammed'); }

    const verified = readLockState(flags, doc, input.documentType);
    const docName = doc.name ?? doc.id ?? input.documentId;
    notify.updated(input.documentType, String(docName), { summary: `configure-lock: ${applied.join(', ')}` });

    return {
      success: true,
      data: { documentId: input.documentId, documentType: input.documentType, applied, verified },
    };
  } catch (e) {
    return { success: false, error: `CONFIGURE_LOCK_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── configure-lp-attempts ────────────────────────────────────────────────────────

export async function handleConfigureLpAttempts(input: ConfigureLpAttemptsInput): Promise<Envelope<unknown>> {
  try {
    if (input.attempts === undefined && input.attemptsMax === undefined &&
        input.requiredSuccesses === undefined && !input.reset) {
      return { success: false, error: 'CONFIGURE_LP_ATTEMPTS_ERROR: Provide attempts, attemptsMax, requiredSuccesses, or reset:true.' };
    }
    const flags = getLnKFlags();
    const doc = resolveDoc(input.documentId, input.documentType, undefined);
    const applied: string[] = [];

    if (input.attemptsMax !== undefined) { await doc.setFlag('LocknKey', 'LPAttemptsMaxFlag', input.attemptsMax); applied.push('attemptsMax'); }
    if (input.attempts !== undefined) { await doc.setFlag('LocknKey', 'LPAttemptsFlag', input.attempts); applied.push('attempts'); }
    if (input.requiredSuccesses !== undefined) { await doc.setFlag('LocknKey', 'requiredLPsuccessFlag', input.requiredSuccesses); applied.push('requiredSuccesses'); }
    if (input.reset) { await flags.resetLPAttempts?.(doc); applied.push('reset'); }

    const docName = doc.name ?? doc.id ?? input.documentId;
    notify.updated(input.documentType, String(docName), { summary: `configure-lp-attempts: ${applied.join(', ')}` });

    return {
      success: true,
      data: {
        documentId: input.documentId,
        documentType: input.documentType,
        applied,
        verifiedAttempts: (() => { try { return flags.LPAttemptsLeft?.(doc); } catch { return null; } })(),
        verifiedRequiredSuccesses: doc.getFlag?.('LocknKey', 'requiredLPsuccessFlag') ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `CONFIGURE_LP_ATTEMPTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── create-key ───────────────────────────────────────────────────────────────────

export async function handleCreateKey(input: CreateKeyInput): Promise<Envelope<unknown>> {
  try {
    const api = getLnKApi();
    let lock: any = null;
    if (input.lockDocumentId) {
      if (!input.lockDocumentType) {
        return { success: false, error: 'CREATE_KEY_ERROR: lockDocumentType is required when lockDocumentId is supplied.' };
      }
      lock = resolveDoc(input.lockDocumentId, input.lockDocumentType, undefined);
    }
    const options: Record<string, unknown> = { KeyName: input.keyName };
    if (input.keyImage) options.KeyImage = input.keyImage;
    if (input.keyFolder) options.KeyFolder = input.keyFolder;

    // createNewcustomKey (APIHandler.js:48-61) returns void; it awaits createKeyItem (the key
    // Item IS created) but its internal linkKeyLock is fire-and-forget — so the lock's keyIds
    // and the item's IDKeysFlag are NOT yet readable on return. Resolve the created key Item by
    // NAME (the awaited createKeyItem guarantees it exists), not by the racing IDKeysFlag.
    await api.createNewcustomKey?.(lock, options);

    const named = (getGame()?.items?.filter?.((i: any) => i.name === input.keyName) ?? []);
    const keyItem = named.length ? named[named.length - 1] : null; // newest match
    const keyId = keyItem?.id ?? null;
    const sharedKeyId = keyItem ? (keyItem.getFlag?.('LocknKey', 'IDKeysFlag') || null) : null;

    if (input.removeOnUse && keyItem?.setFlag) {
      await keyItem.setFlag('LocknKey', 'RemoveKeyonUseFlag', true);
    }

    notify.created('item', input.keyName, { summary: `create-key: "${input.keyName}"${lock ? ` linked to ${input.lockDocumentType} ${input.lockDocumentId}` : ' (unlinked)'}` });

    return {
      success: true,
      data: {
        keyName: input.keyName,
        keyItemId: keyId,
        sharedKeyId,
        linkedLockId: input.lockDocumentId ?? null,
        removeOnUse: Boolean(input.removeOnUse),
        removeOnUseSet: Boolean(input.removeOnUse && keyItem?.setFlag),
        keyItemTypeNote: 'WFRP4e default key item type is "cargo"; recommend setting the KeyItemtype world setting to "trapping".',
      },
    };
  } catch (e) {
    return { success: false, error: `CREATE_KEY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── assign-key ───────────────────────────────────────────────────────────────────

export async function handleAssignKey(input: AssignKeyInput): Promise<Envelope<unknown>> {
  try {
    if (!input.keyItemId && (!input.identityIds || input.identityIds.length === 0)) {
      return { success: false, error: 'ASSIGN_KEY_ERROR: Provide keyItemId and/or identityIds.' };
    }
    const flags = getLnKFlags();
    const game = getGame();
    const lock = resolveDoc(input.lockDocumentId, input.lockDocumentType, undefined);
    const applied: string[] = [];

    if (input.keyItemId) {
      let item = game?.items?.get?.(input.keyItemId);
      if (!item) { try { item = (globalThis as any).fromUuidSync?.(input.keyItemId); } catch { /* ignore */ } }
      if (!item) return { success: false, error: `ASSIGN_KEY_ERROR: key Item "${input.keyItemId}" not found.` };
      await flags.linkKeyLock?.(item, lock, input.keyId);
      applied.push('linkKeyLock');
    }

    if (input.identityIds && input.identityIds.length > 0) {
      await flags.addIdentityKeys?.(lock, input.identityIds);
      applied.push(`addIdentityKeys(${input.identityIds.length})`);
    }

    const docName = lock.name ?? lock.id ?? input.lockDocumentId;
    notify.updated(input.lockDocumentType, String(docName), { summary: `assign-key: ${applied.join(', ')}` });

    return {
      success: true,
      data: {
        lockDocumentId: input.lockDocumentId,
        lockDocumentType: input.lockDocumentType,
        applied,
        verifiedKeyIds: (() => { try { return flags.KeyIDs?.(lock); } catch { return null; } })(),
      },
    };
  } catch (e) {
    return { success: false, error: `ASSIGN_KEY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-passkey ───────────────────────────────────────────────────────────────────

export async function handleSetPasskey(input: SetPasskeyInput): Promise<Envelope<unknown>> {
  try {
    const flags = getLnKFlags();
    const doc = resolveDoc(input.documentId, input.documentType, undefined);
    // setPassKey is fire-and-forget on some builds; write PasskeysFlag directly (awaited) so
    // the post-write verify is deterministic. PasskeysFlag is a ';'-delimited accept list.
    await doc.setFlag('LocknKey', 'PasskeysFlag', input.passkey);
    if (input.changeable !== undefined) {
      await doc.setFlag('LocknKey', 'PasskeyChangeableFlag', input.changeable);
    }
    const verifiedHasPasskey = (() => { try { return flags.HasPasskey?.(doc); } catch { return null; } })();
    const docName = doc.name ?? doc.id ?? input.documentId;
    notify.updated(input.documentType, String(docName), { summary: 'set-passkey' });
    return {
      success: true,
      data: {
        documentId: input.documentId,
        documentType: input.documentType,
        passkeySet: true,
        verifiedHasPasskey,
        changeable: input.changeable ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `SET_PASSKEY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── set-custom-popup ──────────────────────────────────────────────────────────────

export async function handleSetCustomPopup(input: SetCustomPopupInput): Promise<Envelope<unknown>> {
  try {
    const doc = resolveDoc(input.documentId, input.documentType, undefined);

    // LnK keys custom popups by NAME (cCustomPopup), not numeric "0".."5". Accept numeric
    // indices (dossier API) OR names; translate to the name-keyed object LnK actually reads.
    const merged = { ...((doc.getFlag?.('LocknKey', 'CustomPopupsFlag') ?? {}) as Record<string, string>) };
    const slotsApplied: string[] = [];
    for (const [k, v] of Object.entries(input.popups)) {
      let name: string | undefined;
      if (CUSTOM_POPUP_NAME_SET.has(k)) name = k;
      else if (/^[0-5]$/.test(k)) name = CUSTOM_POPUP_NAMES[Number(k)];
      if (!name) {
        return { success: false, error: `SET_CUSTOM_POPUP_ERROR: invalid popup slot "${k}". Use 0-5 or one of: ${CUSTOM_POPUP_NAMES.join(', ')}.` };
      }
      merged[name] = String(v);
      slotsApplied.push(name);
    }
    // setCustomPopups (@1559) is fire-and-forget; write the flag directly (awaited) for a
    // deterministic verify + correct name-keyed storage.
    await doc.setFlag('LocknKey', 'CustomPopupsFlag', merged);

    const docName = doc.name ?? doc.id ?? input.documentId;
    notify.updated(input.documentType, String(docName), { summary: `set-custom-popup: ${slotsApplied.join(', ')}` });
    return {
      success: true,
      data: {
        documentId: input.documentId,
        documentType: input.documentType,
        slotsApplied,
        verified: doc.getFlag?.('LocknKey', 'CustomPopupsFlag') ?? null,
      },
    };
  } catch (e) {
    return { success: false, error: `SET_CUSTOM_POPUP_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── grant-free-circumvent ──────────────────────────────────────────────────────────

export async function handleGrantFreeCircumvent(input: GrantFreeCircumventInput): Promise<Envelope<unknown>> {
  try {
    const flags = getLnKFlags();
    const token = resolveDoc(input.tokenId, 'token', undefined);
    const charges = input.charges ?? 1;
    // giveFreeLockCircumvent (@1317) is fire-and-forget AND hardcodes 1 (ignores N). Write
    // FreeLockCircumventsFlag directly (awaited) so N charges work + the verify is deterministic.
    await token.setFlag('LocknKey', 'FreeLockCircumventsFlag', charges);
    const docName = token.name ?? token.id ?? input.tokenId;
    notify.updated('token', String(docName), { summary: `grant-free-circumvent: ${charges} charge(s)` });
    return {
      success: true,
      data: {
        tokenId: input.tokenId,
        charges,
        verifiedHasFreeCircumvent: (() => { try { return flags.hasFreeLockCircumvent?.(token); } catch { return null; } })(),
      },
    };
  } catch (e) {
    return { success: false, error: `GRANT_FREE_CIRCUMVENT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── circumvent-lock (SUPPORTED_WITH_CONFIRMATION) ──────────────────────────────────

export async function handleCircumventLock(input: CircumventLockInput): Promise<Envelope<unknown>> {
  try {
    const flags = getLnKFlags();
    const lock = resolveDoc(input.documentId, input.documentType, undefined);
    // LnK's own circumvention pipeline (LockManager/KeyManager) is bundle-internal + client-
    // initiated (not server-reachable). We re-implement the OUTCOMES via public LnKFlags.
    let matched: boolean | null = null;
    let applied: string;

    if (input.method === 'key' || input.method === 'passkey') {
      if (input.method === 'key') {
        if (!input.keyItemId) return { success: false, error: 'CIRCUMVENT_LOCK_ERROR: method:key requires keyItemId.' };
        let keyItem = getGame()?.items?.get?.(input.keyItemId);
        if (!keyItem) { try { keyItem = (globalThis as any).fromUuidSync?.(input.keyItemId); } catch { /* ignore */ } }
        if (!keyItem) return { success: false, error: `CIRCUMVENT_LOCK_ERROR: key Item "${input.keyItemId}" not found.` };
        matched = Boolean(flags.matchingIDKeys?.(keyItem, lock, input.considerKeyName ?? false));
      } else {
        if (!input.passkey) return { success: false, error: 'CIRCUMVENT_LOCK_ERROR: method:passkey requires passkey.' };
        matched = Boolean(flags.MatchingPasskey?.(lock, input.passkey));
      }
      if (matched) {
        await flags.setLockedstate?.(lock, false);
        applied = 'unlocked';
      } else {
        applied = 'no-match (lock unchanged)';
      }
    } else {
      // pick / break / custom — GM-resolved outcome required.
      if (!input.outcome) {
        return { success: false, error: `CIRCUMVENT_LOCK_ERROR: method:${input.method} requires outcome ('success'|'failure'|'critical-failure').` };
      }
      switch (input.outcome) {
        case 'success':
          await flags.setLockedstate?.(lock, false);
          applied = 'success → unlocked';
          break;
        case 'failure':
          await flags.ReduceLPAttempts?.(lock);
          applied = 'failure → LP attempt reduced';
          break;
        case 'critical-failure':
          await lock.setFlag('LocknKey', 'LockjammedFlag', true); // JamLock is fire-and-forget; write directly
          applied = 'critical-failure → jammed';
          break;
        default:
          applied = 'noop';
      }
    }

    const verified = readLockState(flags, lock, input.documentType);
    const docName = lock.name ?? lock.id ?? input.documentId;
    notify.updated(input.documentType, String(docName), { summary: `circumvent-lock: ${input.method} → ${applied}` });
    return {
      success: true,
      data: {
        documentId: input.documentId,
        documentType: input.documentType,
        method: input.method,
        outcome: input.outcome ?? null,
        matched,
        applied,
        rollResult: input.rollResult ?? null,
        verified,
        wfrpRepairGated: (input.method === 'break')
          ? 'WFRP4e has no default break formula (REPAIR_GATED) — the break roll is rolled externally; this applies the GM-resolved outcome only.'
          : null,
        note: 'OUTCOME-application primitive: re-implements LnK circumvention results via public LnKFlags. LnK\'s own chat/crit/sound/hook side-effects are NOT fired (that pipeline is client-internal).',
      },
    };
  } catch (e) {
    return { success: false, error: `CIRCUMVENT_LOCK_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── transfer-items (SUPPORTED_WITH_CONFIRMATION / GM-auth) ──────────────────────────

export async function handleTransferItems(input: TransferItemsInput): Promise<Envelope<unknown>> {
  try {
    const api = getLnKApi();
    const source = resolveActorOrToken(input.sourceId);
    const target = resolveActorOrToken(input.targetId);
    await api.TransferItems?.(source, target, input.itemInfos);
    notify.updated('item', `${input.itemInfos.length} item(s)`, { summary: `transfer-items: ${input.sourceId} → ${input.targetId}` });
    return {
      success: true,
      data: {
        sourceId: input.sourceId,
        targetId: input.targetId,
        transferredCount: input.itemInfos.length,
        note: 'GM-authoritative transfer — bypasses pickpocket DCs and chat notification (EXCLUDED_UNSAFE for player-facing pickpocket).',
      },
    };
  } catch (e) {
    return { success: false, error: `TRANSFER_ITEMS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
