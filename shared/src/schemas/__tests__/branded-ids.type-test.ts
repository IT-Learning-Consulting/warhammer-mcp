// Compile-time proof that branded IDs bite (PRD Phase 1, R1.1, CCR-Branded-ID).
//
// This file carries NO runtime assertions — it is a *type* test. It is picked up by the
// shared package's `tsc --noEmit` (it lives under `src/**/*` and is NOT named `*.test.*`,
// so the tsconfig `exclude` does not drop it). Each `@ts-expect-error` below MUST suppress
// a real error: if branding stopped working, the error would vanish and `tsc` would fail
// with TS2578 "Unused '@ts-expect-error' directive". Delete any one of the negative lines
// and typecheck FAILS — that is the test.

import { ActorId, TokenId } from '../branded-ids.js';

// `.parse()` returns the branded type — the only way to mint a branded value from a string.
const anActorId: ActorId = ActorId.parse('uX7kP2mN9qR4sT6v');
const aTokenId: TokenId = TokenId.parse('aB1cD3eF5gH7iJ9k');

declare function needsActorId(id: ActorId): void;
declare function needsTokenId(id: TokenId): void;
declare function needsString(s: string): void;

// ── Positive: a branded id IS a subtype of string (flows outward into Foundry APIs). ──
needsString(anActorId);
needsString(aTokenId);

// ── Positive: the matching brand is accepted. ──
needsActorId(anActorId);
needsTokenId(aTokenId);

// ── Negative: a plain string literal is NOT an ActorId (closes the silent bug seam). ──
// @ts-expect-error plain string is not assignable to a branded ActorId
needsActorId('raw-string');

// ── Negative: cross-type substitution is a compile error (the whole point of CCR-Branded-ID). ──
// @ts-expect-error an ActorId is not assignable where a TokenId is required
needsTokenId(anActorId);

// @ts-expect-error a TokenId is not assignable where an ActorId is required
needsActorId(aTokenId);
