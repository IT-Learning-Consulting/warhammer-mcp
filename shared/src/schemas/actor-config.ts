// Phase 1 mcp_coverage_expansion — Actor-config umbrella schema.
//
// Covers 4 actions:
//   get-prototype-token / update-prototype-token / get-art / set-art
//
// Validated replacement for the update-actor dot-path contract. Reuses
// TokenWritableFields minus placement-omitted fields (_id, actorId, delta,
// x, y, elevation, shape, sort, hidden, locked, _movementHistory, _regions)
// plus an explicit extraFields passthrough escape (prefer this over .passthrough()
// so callers consciously opt out of validation).
//
// CCR-9: set-art writes actor.img / item.img / actor.prototypeToken.texture.src ONLY.
// It does NOT write placed-token texture.src — use `token {action:"update"}` for that.

import { z } from 'zod';
import { ActorId } from './branded-ids.js';
import { FOUNDRY_ID } from './primitives.js';
import { LightDataSchema } from './light-data.js';
import { TextureDataSchema } from './texture-data.js';

// TOKEN_DISPOSITIONS: SECRET=-2, HOSTILE=-1, NEUTRAL=0, FRIENDLY=1
const DispositionEnum = z.number().int().min(-2).max(1);

// TOKEN_DISPLAY_MODES: 0/10/20/30/40/50
const DisplayModeEnum = z.number().int().min(0).max(50);

const TokenBarInput = z.object({ attribute: z.string().nullable().optional() }).strict();

const TokenSightInput = z
  .object({
    enabled: z.boolean().optional(),
    range: z.number().nullable().optional(),
    angle: z.number().min(0).max(360).optional(),
    visionMode: z.string().optional(),
    color: z.string().nullable().optional(),
    attenuation: z.number().min(0).max(1).optional(),
    brightness: z.number().optional(),
    saturation: z.number().optional(),
    contrast: z.number().optional(),
  })
  .strict();

const TokenOccludableInput = z.object({ radius: z.number().min(0).optional() }).strict();

const TokenRingColorsInput = z
  .object({ ring: z.string().nullable().optional(), background: z.string().nullable().optional() })
  .strict();

const TokenRingSubjectInput = z
  .object({ scale: z.number().positive().optional(), texture: z.string().nullable().optional() })
  .strict();

const TokenRingInput = z
  .object({
    enabled: z.boolean().optional(),
    colors: TokenRingColorsInput.optional(),
    effects: z.number().int().optional(),
    subject: TokenRingSubjectInput.optional(),
  })
  .strict();

const TokenTurnMarkerInput = z
  .object({
    mode: z.number().int().optional(),
    animation: z.string().nullable().optional(),
    src: z.string().nullable().optional(),
    disposition: z.boolean().optional(),
  })
  .strict();

// Prototype-token writable fields — TokenWritableFields minus placement-omitted fields.
// Omitted: _id, actorId, delta, x, y, elevation, shape, sort, hidden, locked,
//          _movementHistory, _regions.
const PrototypeTokenWritableFields = {
  name: z.string().optional(),
  displayName: DisplayModeEnum.optional(),
  actorLink: z.boolean().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  texture: TextureDataSchema.optional(),
  lockRotation: z.boolean().optional(),
  rotation: z.number().min(0).max(360).optional(),
  alpha: z.number().min(0).max(1).optional(),
  disposition: DispositionEnum.optional(),
  displayBars: DisplayModeEnum.optional(),
  bar1: TokenBarInput.optional(),
  bar2: TokenBarInput.optional(),
  light: LightDataSchema.optional(),
  sight: TokenSightInput.optional(),
  occludable: TokenOccludableInput.optional(),
  ring: TokenRingInput.optional(),
  turnMarker: TokenTurnMarkerInput.optional(),
  movementAction: z.string().nullable().optional(),
  flags: z.record(z.unknown()).optional(),
};

// art target discriminator — covers actor.img, item.img,
// and actor.prototypeToken.texture.src (via which).
export const ArtTargetInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('actor'), id: FOUNDRY_ID }).strict(), // id: polymorphic field name — not branded (Phase 1 design)
  z.object({ type: z.literal('item'), id: FOUNDRY_ID }).strict(),  // id: polymorphic field name — not branded (Phase 1 design)
]);

export const ActorConfigGetPrototypeTokenInput = z
  .object({
    action: z.literal('get-prototype-token'),
    actorId: ActorId,
  })
  .strict();

export const ActorConfigUpdatePrototypeTokenInput = z
  .object({
    action: z.literal('update-prototype-token'),
    actorId: ActorId,
    changes: z
      .object(PrototypeTokenWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'PROTOTYPE_TOKEN_EMPTY_PAYLOAD: changes must contain at least one field',
      }),
    extraFields: z.record(z.unknown()).optional(),
  })
  .strict();

export const ActorConfigGetArtInput = z
  .object({
    action: z.literal('get-art'),
    target: ArtTargetInput,
  })
  .strict();

export const ActorConfigSetArtInput = z
  .object({
    action: z.literal('set-art'),
    target: ArtTargetInput,
    // src: empty string = reset art to the document-type default icon. Foundry's img
    // FilePathField cleans "" to the default (mystery-man.svg / item-bag.svg); it never
    // persists as literal "". prototypeToken.texture.src (nullable) may clear to ""/null.
    src: z.string(),
    // which: for actor targets only — 'img' writes actor.img,
    // 'texture' writes prototypeToken.texture.src, 'both' writes both.
    // For item targets, which is ignored (always writes item.img).
    which: z.enum(['img', 'texture', 'both']).optional(),
  })
  .strict();

export const ActorConfigToolInput = z.discriminatedUnion('action', [
  ActorConfigGetPrototypeTokenInput,
  ActorConfigUpdatePrototypeTokenInput,
  ActorConfigGetArtInput,
  ActorConfigSetArtInput,
]);

export type ActorConfigToolInputType = z.infer<typeof ActorConfigToolInput>;
export type ActorConfigGetPrototypeTokenInputType = z.infer<typeof ActorConfigGetPrototypeTokenInput>;
export type ActorConfigUpdatePrototypeTokenInputType = z.infer<typeof ActorConfigUpdatePrototypeTokenInput>;
export type ActorConfigGetArtInputType = z.infer<typeof ActorConfigGetArtInput>;
export type ActorConfigSetArtInputType = z.infer<typeof ActorConfigSetArtInput>;
