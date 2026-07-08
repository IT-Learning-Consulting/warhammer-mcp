// Phase 1 mcp_coverage_expansion — Actor-config umbrella handler.
//
// Covers 4 actions:
//   get-prototype-token / update-prototype-token / get-art / set-art
//
// Architecture:
//   - Validated replacement for the update-actor dot-path contract (z.record(z.unknown())).
//   - get-prototype-token + get-art are read-only.
//   - update-prototype-token + set-art are writes; both use verifyDocWrite({readSource:true})
//     (F08-safe: reads doc._source, avoids Foundry getter false-positives on TextureData/Color).
//   - CCR-9 BOUNDARY: set-art does NOT write placed-token texture.src.
//     Placed-token art → `token {action:"update", changes:{texture:{src}}}`.
//   - Error tokens: UPDATE_PROTOTYPE_TOKEN_NOT_PERSISTED, SET_ART_NOT_PERSISTED.
//   - HC1 / CCR-3: no CONFIG.WFRP4E / game-rule logic.
//   - NEVER calls ChatMessage.create — all GM feedback routes through notify.*

import {
  ErrorTokens,
  ActorConfigToolInput,
  type ActorConfigToolInputType,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';
import { validateGMAccess as validateGMAccessGate } from '../utils/embeddedCRUDFactory.js';

// ── GM gate ───────────────────────────────────────────────────────────────────

// CORE-04 (mcp_code_quality_v2 Phase C2) — thin local adapter over the canonical
// utils/embeddedCRUDFactory.ts validateGMAccess() gate. This file's throw-only call sites
// stay unchanged; only the underlying isGM check is de-duplicated.
function validateGMAccess(): void {
  if (!validateGMAccessGate().allowed) {
    throw new Error('Access denied: GM-only operation');
  }
}
// ── Actor / Item resolvers ─────────────────────────────────────────────────────

function getActorOrThrow(actorId: string): any {
  const actor = (game.actors as any)?.get(actorId);
  if (!actor) throw new Error(`Actor not found with id "${actorId}"`);
  return actor;
}

function getItemOrThrow(itemId: string): any {
  const item = (game.items as any)?.get(itemId);
  if (!item) throw new Error(`World item not found with id "${itemId}"`);
  return item;
}

// ── Envelope type ─────────────────────────────────────────────────────────────

type Envelope<T> = { success: true; data: T };

// ── Verify helpers ──────────────────────────────────────────────────────────────

// Flatten a value to leaf dot-paths for verifyDocWrite. Plain objects recurse so nested
// prototype-token fields (texture.src, light.dim, ring.colors.ring, …) are each verified
// against _source; arrays and primitives are leaves (compared whole via JSON.stringify).
// Closes the BUG-244 blind spot where nested-object-only payloads skipped verification.
function flattenForVerify(value: unknown, path: string, out: Record<string, unknown>): void {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      flattenForVerify(v, `${path}.${k}`, out);
    }
  } else {
    out[path] = value;
  }
}

// Post-write verify for an art (img / texture.src) field; returns the persisted value.
// Non-empty src → strict equality (drift throws SET_ART_NOT_PERSISTED).
// src === '' (art-clear): Foundry's img FilePathField cleans a blank string to the
// document-type DEFAULT icon (it never persists ""), so for img-type paths we accept any
// non-empty default and only fail if the field was left genuinely empty; the nullable
// prototypeToken.texture.src may legitimately clear to "" or null. (BUG-246.)
function verifyArtWrite(freshDoc: any, path: string, requestedSrc: string): string {
  const actual = (foundry as any).utils.getProperty(freshDoc._source, path);
  if (requestedSrc === '') {
    if (path === 'img' && (actual === undefined || actual === null || actual === '')) {
      throw new Error(
        `${ErrorTokens.SET_ART_NOT_PERSISTED}: art-clear left ${path} empty (expected Foundry to reset it to the default icon)`,
      );
    }
    // BUG-294: for nullable texture paths the clear must have persisted — if the value is
    // still a non-empty string the write did not take.
    if (path !== 'img' && typeof actual === 'string' && actual !== '') {
      throw new Error(
        `${ErrorTokens.SET_ART_NOT_PERSISTED}: art-clear on ${path} did not persist — field still holds "${actual}"`,
      );
    }
    return actual ?? '';
  }
  if (JSON.stringify(actual) !== JSON.stringify(requestedSrc)) {
    throw new Error(
      `${ErrorTokens.SET_ART_NOT_PERSISTED}: ${path}: expected ${JSON.stringify(requestedSrc)}, got ${JSON.stringify(actual)}`,
    );
  }
  return actual;
}

// ── Action handlers ───────────────────────────────────────────────────────────

function getPrototypeToken(
  input: Extract<ActorConfigToolInputType, { action: 'get-prototype-token' }>,
): Envelope<unknown> {
  const actor = getActorOrThrow(input.actorId);
  const prototypeToken = (actor.prototypeToken as any).toObject();
  return { success: true, data: { actorId: input.actorId, actorName: actor.name, prototypeToken } };
}

async function updatePrototypeToken(
  input: Extract<ActorConfigToolInputType, { action: 'update-prototype-token' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('actor-config.update-prototype-token', async () => {
    const actor = getActorOrThrow(input.actorId);

    // Build flat dot-path update payload from modeled changes + extraFields.
    const updatePayload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input.changes)) {
      updatePayload[`prototypeToken.${key}`] = value;
    }
    if (input.extraFields) {
      for (const [key, value] of Object.entries(input.extraFields)) {
        updatePayload[`prototypeToken.${key}`] = value;
      }
    }

    await actor.update(updatePayload);

    // CCR-2a / DP-16: F08-safe post-write verify via _source.
    // Flatten modeled changes to leaf dot-paths so nested objects (texture, light, sight, ring,
    // bar1/2, occludable, turnMarker) are verified too — verifyDocWrite reads _source via
    // foundry.utils.getProperty, which resolves dot-paths into nested objects (BUG-244).
    // `flags` is an arbitrary module record — left unverified (passthrough), as is extraFields.
    const expectedFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input.changes)) {
      if (key === 'flags') continue; // arbitrary module data — do not verify
      flattenForVerify(value, `prototypeToken.${key}`, expectedFields);
    }
    // BUG-496 (Wave 2): extraFields were written but never verified — a dropped
    // passthrough field returned a success envelope. Verify EVERY requested field.
    if (input.extraFields) {
      for (const [key, value] of Object.entries(input.extraFields)) {
        if (key === 'flags' || key.startsWith('flags.')) continue; // arbitrary module data
        flattenForVerify(value, `prototypeToken.${key}`, expectedFields);
      }
    }

    // Re-read from world collection for a fresh doc reference.
    const freshActor = (game.actors as any)?.get(input.actorId);
    if (!freshActor) {
      throw new Error(
        `${ErrorTokens.UPDATE_PROTOTYPE_TOKEN_NOT_PERSISTED}: actor "${input.actorId}" could not be re-read for post-write verification`,
      );
    }
    if (Object.keys(expectedFields).length > 0) {
      verifyDocWrite(freshActor, expectedFields, ErrorTokens.UPDATE_PROTOTYPE_TOKEN_NOT_PERSISTED, {
        readSource: true,
      });
    }

    // BUG-496 (Wave 2): _source can hold the persisted value while the EFFECTIVE
    // prototype token diverges (a system/module override re-clobbers the field in
    // prepared data — the live displayName drop pattern: partial write + success
    // envelope). Compare the effective layer too and surface any divergence loudly
    // instead of returning a silent partial success.
    let effectiveDivergence: string[] = [];
    try {
      const effective = freshActor.prototypeToken?.toObject?.(false) ?? null;
      if (effective) {
        effectiveDivergence = Object.entries(expectedFields)
          .filter(([path, expected]) => {
            const effPath = path.replace(/^prototypeToken\./, '');
            const actual = (foundry as any).utils.getProperty(effective, effPath);
            return JSON.stringify(actual) !== JSON.stringify(expected);
          })
          .map(([path]) => path);
      }
    } catch {
      effectiveDivergence = [];
    }

    notify.updated('actor', actor.name, { summary: `prototype-token updated` });

    const updatedPrototypeToken = ((game.actors as any)?.get(input.actorId) as any)?.prototypeToken?.toObject() ?? null;

    return {
      success: true,
      data: {
        actorId: input.actorId,
        actorName: actor.name,
        requestedChanges: input.changes,
        extraFields: input.extraFields ?? null,
        prototypeToken: updatedPrototypeToken,
        ...(effectiveDivergence.length > 0
          ? {
              warning:
                `PROTOTYPE_TOKEN_EFFECTIVE_OVERRIDE: ${effectiveDivergence.join(', ')} persisted to _source but the ` +
                `EFFECTIVE prototype token shows a different value — a system/module override is re-clobbering the ` +
                `field in prepared data.`,
            }
          : {}),
      },
    } satisfies Envelope<unknown>;
  });
}

function getArt(
  input: Extract<ActorConfigToolInputType, { action: 'get-art' }>,
): Envelope<unknown> {
  const { target } = input;

  if (target.type === 'actor') {
    const actor = getActorOrThrow(target.id);
    return {
      success: true,
      data: {
        target,
        actorImg: actor.img ?? null,
        prototypeTokenTextureSrc: (actor.prototypeToken as any)?._source?.texture?.src ?? null,
      },
    };
  } else {
    const item = getItemOrThrow(target.id);
    return {
      success: true,
      data: {
        target,
        img: item.img ?? null,
      },
    };
  }
}

async function setArt(
  input: Extract<ActorConfigToolInputType, { action: 'set-art' }>,
): Promise<Envelope<unknown>> {
  validateGMAccess();

  return wrappedWrite('actor-config.set-art', async () => {
    const { target, src } = input;

    if (target.type === 'item') {
      // Always writes item.img (world-scope item).
      const item = getItemOrThrow(target.id);
      await item.update({ img: src });

      const freshItem = (game.items as any)?.get(target.id);
      // src === '' resets item.img to the type default (icons/svg/item-bag.svg) — BUG-246.
      const resolvedImg = freshItem ? verifyArtWrite(freshItem, 'img', src) : src;

      notify.updated('item', item.name, {
        summary: src === '' ? `art cleared (reset to default)` : `art set to ${src}`,
      });

      return {
        success: true,
        data: { target, src, written: ['img'], resolvedImg },
      } satisfies Envelope<unknown>;
    }

    // actor target — write actor.img and/or prototypeToken.texture.src per `which`.
    const actor = getActorOrThrow(target.id);
    const which = input.which ?? 'both';
    const updatePayload: Record<string, unknown> = {};
    const written: string[] = [];

    if (which === 'img' || which === 'both') {
      updatePayload['img'] = src;
      written.push('actor.img');
    }
    if (which === 'texture' || which === 'both') {
      // NOTE: CCR-9 boundary — this writes prototypeToken.texture.src (on the Actor document),
      // NOT placed-token texture.src. For placed tokens, use `token {action:"update"}`.
      // BUG-497 (Wave 2, regression of BUG-294): a clear must write NULL, not '' —
      // v13 cleans a blank string on this FilePathField to the document DEFAULT icon,
      // which both violates the BUG-294 clear contract (clear → ''/null) and then
      // hard-fails verifyArtWrite's still-non-empty check. null persists as a true clear.
      updatePayload['prototypeToken.texture.src'] = src === '' ? null : src;
      written.push('prototypeToken.texture.src');
    }

    await actor.update(updatePayload);

    const freshActor = (game.actors as any)?.get(target.id);
    // src === '' resets actor.img to the type default (icons/svg/mystery-man.svg); the nullable
    // prototypeToken.texture.src may clear to "" or null — BUG-246.
    const resolved: Record<string, string> = {};
    if (freshActor) {
      if (which === 'img' || which === 'both') {
        resolved['img'] = verifyArtWrite(freshActor, 'img', src);
      }
      if (which === 'texture' || which === 'both') {
        resolved['prototypeToken.texture.src'] = verifyArtWrite(freshActor, 'prototypeToken.texture.src', src);
      }
    }

    notify.updated('actor', actor.name, {
      summary: src === '' ? `art cleared (${written.join(', ')})` : `art set (${written.join(', ')}) → ${src}`,
    });

    return {
      success: true,
      data: { target, src, which, written, resolved },
    } satisfies Envelope<unknown>;
  });
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function dispatchActorConfig(data: unknown): Promise<Envelope<unknown>> {
  let input: ActorConfigToolInputType;
  try {
    input = ActorConfigToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  validateGMAccess();

  switch (input.action) {
    case 'get-prototype-token':
      return getPrototypeToken(input);
    case 'update-prototype-token':
      return updatePrototypeToken(input);
    case 'get-art':
      return getArt(input);
    case 'set-art':
      return setArt(input);
  }
}
