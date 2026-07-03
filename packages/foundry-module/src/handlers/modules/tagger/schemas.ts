// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 5A — package-local Zod schema for module-tagger.
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// SA1 corrections:
//   - `tags` is REQUIRED (min 1) on tag/untag — Tagger.addTags/removeTags(docs, undefined) throw.
//   - `sceneId` is optional in schema; handler enforces required-when-no-allScenes.
//   - `returnObjects` is EXCLUDED ENTIRELY — canvas PlaceableObjects don't exist server-side.
// `.strict()` at the umbrella level rejects unknown top-level keys (CCR-5).

import { z } from 'zod';

// Shared doc-ref: single UUID string or array of UUID strings
const DocRefs = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]);

export const ModuleTaggerInput = z.discriminatedUnion('action', [
  // tag — addTags (or toggleTags if toggle:true). tags REQUIRED.
  z.object({
    action: z.literal('tag'),
    uuids: DocRefs,
    tags: z.array(z.string().min(1)).min(1, 'tags must be a non-empty array — Tagger.addTags(docs, undefined) throws synchronously'),
    toggle: z.boolean().optional(),
  }).strict(),

  // untag — removeTags. tags REQUIRED.
  z.object({
    action: z.literal('untag'),
    uuids: DocRefs,
    tags: z.array(z.string().min(1)).min(1, 'tags must be a non-empty array — Tagger.removeTags(docs, undefined) throws synchronously'),
  }).strict(),

  // query — getByTag. returnObjects EXCLUDED. sceneId optional (handler enforces required-when-no-allScenes).
  z.object({
    action: z.literal('query'),
    tags: z.array(z.string().min(1)).min(1),
    sceneId: z.string().optional(),
    matchAny: z.boolean().optional(),
    matchExactly: z.boolean().optional(),
    caseInsensitive: z.boolean().optional(),
    allScenes: z.boolean().optional(),
    ignore: z.array(z.string().min(1)).optional(),   // UUID strings; resolved to Docs in handler
    objects: z.array(z.string().min(1)).optional(),  // UUID strings; resolved to Docs in handler
    // returnObjects intentionally EXCLUDED — canvas PlaceableObjects, never from MCP (dossier §7.1)
  }).strict(),

  // set-tags — setTags (then optionally applyTagRules if applyRules:true).
  z.object({
    action: z.literal('set-tags'),
    uuids: DocRefs,
    tags: z.array(z.string()),
    applyRules: z.boolean().optional(),
  }).strict(),

  // clear-tags — clearAllTags (no tags) or removeTags (with tags).
  // confirm:true required when no tags arg (bulk destructive, CCR-4).
  z.object({
    action: z.literal('clear-tags'),
    uuids: DocRefs,
    tags: z.array(z.string().min(1)).optional(),
    confirm: z.boolean().optional(),
  }).strict(),

  // check-tags — hasTags (check:true) or getTags (check:false / default).
  z.object({
    action: z.literal('check-tags'),
    uuids: DocRefs,
    tags: z.array(z.string()).optional(),
    check: z.boolean().optional(),
    matchAny: z.boolean().optional(),
    matchExactly: z.boolean().optional(),
    caseInsensitive: z.boolean().optional(),
  }).strict(),
]);

export type ModuleTaggerInputType = z.infer<typeof ModuleTaggerInput>;
