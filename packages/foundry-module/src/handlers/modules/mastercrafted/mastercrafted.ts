// Module Integration v1 Phase 14 — module-mastercrafted handler (mastercrafted v5.0.8).
//
// Always-registered umbrella. requireModuleActive('mastercrafted') is the FIRST executable statement —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase-1 carry-forward).
//
// 7 actions (dossier thin-session.md §4.6): reads list-recipes, get-recipe, check-craftable,
// list-pending-crafts; GM writes execute-craft (confirm-gated), process-delayed-crafts,
// grant-recipe-discovery.
//
// REACHABILITY (verified mid-execution): the module exposes NO open craft API — `Recipe`/`RecipeBook`
// are ESM-only classes (not on any global; `game.modules.get('mastercrafted').API` only has
// processDelayedCrafting). We reach them via DYNAMIC IMPORT of the module's served ESM files, so
// crafting works despite the absent public API. `RecipeBook.get()` is BUGGED (undefined bookData) →
// NEVER called; we build the Recipe the way the sheet does (RecipeSheet.js:181).
//
// WFRP4e quantity (drift #1): `MASTERCRAFTED_CONST.QUANTITY` is a LIVE getter reading the world setting
// `customQuantityPath`. For WFRP4e it must be "quantity.value"; execute-craft auto-sets it (under its
// confirm gate) when unset or the broken "quantity" default, but respects any other deliberate value.
//
// Time units (§4.2): recipe `time` is MINUTES; _craft stores worldTime + minutes×60 (seconds) as the
// pending-craft actor flag.
//
// Anchors: DP-15 (typed), DP-16 (post-write verify), CCR-3 (notify on writes), CCR-4 (confirm on
// execute-craft; GM-gated writes). Source: phase14_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleMastercraftedInput, type ModuleMastercraftedInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'mastercrafted';
const RECIPE_PAGE_TYPE = 'mastercrafted.mastercrafted';

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

// ── Direct data-model helpers (mastercrafted is a BUNDLED module — its Recipe/RecipeBook classes are
// not exported / not on a global / not importable, BUG-374. We replicate the data model + craft logic
// from `flags.mastercrafted` directly, which is reachable and reliable.) ─────────────

const PAGE_TYPE = 'mastercrafted.mastercrafted';
const fUtils = () => (globalThis as any).foundry?.utils;
function randomId(): string {
  return fUtils()?.randomID?.() ?? Math.random().toString(36).slice(2, 18);
}
function getProp(obj: any, path: string): any {
  return fUtils()?.getProperty ? fUtils().getProperty(obj, path) : path.split('.').reduce((o, k) => o?.[k], obj);
}

/** The item-quantity path the module uses. WFRP4e items store quantity as {value,max}, so the path
 * must be "quantity.value" (the module's bare "quantity" default reads the object → NaN). */
function quantityPath(): string {
  const custom = String((globalThis as any).game?.settings?.get?.(MODULE_ID, 'customQuantityPath') ?? '');
  if (custom) return custom;
  const sysId = (globalThis as any).game?.system?.id;
  return sysId === 'dsa5' || sysId === 'wfrp4e' ? 'quantity.value' : 'quantity';
}

function recipeFlags(page: any): any {
  return page?.flags?.mastercrafted ?? page?._source?.flags?.mastercrafted ?? {};
}

/** Default flags for a new recipe page (mirrors Recipe.getDefaultFlags). */
function defaultRecipeFlags(bookId: string | null): any {
  return {
    recipeBook: bookId ?? null,
    img: '',
    ingredients: [],
    ingredientsInspection: false,
    macroName: '',
    products: [],
    productInspection: false,
    sound: '',
    time: null,
    require: '',
    toolDc: null,
    toolCheck: null,
    abilityCheck: null,
    abilityDc: null,
    expression: '',
    modifierList: [],
  };
}

/** Component object shape (mirrors Component.toObject). */
function makeComponent(uuid: string, name: string, img: string, quantity: number, tags?: string[]): any {
  return { id: randomId(), uuid, name, img, quantity, tags: tags ?? [], resourcePath: '', mode: 'some' };
}
function clone(o: any): any {
  return fUtils()?.deepClone ? fUtils().deepClone(o) : JSON.parse(JSON.stringify(o ?? {}));
}

const WRITE_ACTIONS = new Set([
  'execute-craft', 'process-delayed-crafts', 'grant-recipe-discovery',
  'create-recipe-book', 'create-recipe', 'update-recipe', 'update-recipe-book', 'set-item-tags',
  'add-component', 'remove-component', 'set-component-quantity', 'configure-settings',
  'cancel-pending-craft', 'delete-recipe', 'delete-recipe-book',
]);

export async function dispatchModuleMastercrafted(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModuleMastercraftedInputType;
  try {
    input = ModuleMastercraftedInput.parse(data);
  } catch (e) {
    return { success: false, error: `MASTERCRAFTED_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `MASTERCRAFTED_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'list-recipes':
        return await handleListRecipes(input);
      case 'get-recipe':
        return await handleGetRecipe(input);
      case 'check-craftable':
        return await handleCheckCraftable(input);
      case 'list-pending-crafts':
        return await handleListPending(input);
      case 'execute-craft':
        return await handleExecuteCraft(input);
      case 'process-delayed-crafts':
        return await handleProcessDelayed(input);
      case 'grant-recipe-discovery':
        return await handleGrantDiscovery(input);
      case 'create-recipe-book':
        return await handleCreateRecipeBook(input);
      case 'create-recipe':
        return await handleCreateRecipe(input);
      case 'update-recipe':
        return await handleUpdateRecipe(input);
      case 'update-recipe-book':
        return await handleUpdateRecipeBook(input);
      case 'get-recipe-book':
        return await handleGetRecipeBook(input);
      case 'set-item-tags':
        return await handleSetItemTags(input);
      case 'add-component':
        return await handleAddComponent(input);
      case 'remove-component':
        return await handleRemoveComponent(input);
      case 'set-component-quantity':
        return await handleSetComponentQuantity(input);
      case 'search-by-ingredient':
        return await handleSearchByIngredient(input);
      case 'configure-settings':
        return await handleConfigureSettings(input);
      case 'cancel-pending-craft':
        return await handleCancelPending(input);
      case 'delete-recipe':
        return await handleDeleteRecipe(input);
      case 'delete-recipe-book':
        return await handleDeleteRecipeBook(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `MASTERCRAFTED_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `MASTERCRAFTED_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Reads ───────────────────────────────────────────────────────────────────────

function recipePages(): any[] {
  const out: any[] = [];
  const journals = (globalThis as any).game?.journal?.contents ?? [];
  for (const je of journals) {
    const pages = je.pages?.contents ?? je.pages ?? [];
    for (const page of pages) {
      if (page.type === RECIPE_PAGE_TYPE) out.push({ page, book: je });
    }
  }
  return out;
}

type ListInput = Extract<ModuleMastercraftedInputType, { action: 'list-recipes' }>;
async function handleListRecipes(input: ListInput): Promise<Envelope<unknown>> {
  const needle = input.filter?.toLowerCase();
  const recipes: any[] = [];
  for (const { page, book } of recipePages()) {
    const flags = page.flags?.mastercrafted ?? {};
    const ingredients = (flags.ingredients ?? []).map((i: any) => i.name).filter(Boolean);
    const products = (flags.products ?? []).map((p: any) => p.name).filter(Boolean);
    if (needle) {
      const hay = [page.name, book.name, ...ingredients, ...products].join(' ').toLowerCase();
      if (!hay.includes(needle)) continue;
    }
    recipes.push({
      bookName: book.name,
      recipeName: page.name,
      pageUuid: page.uuid,
      time: flags.time ?? null,
      ingredients,
      products,
    });
  }
  return { success: true, data: { count: recipes.length, recipes } };
}

type GetInput = Extract<ModuleMastercraftedInputType, { action: 'get-recipe' }>;
async function handleGetRecipe(input: GetInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `MASTERCRAFTED_PAGE_NOT_FOUND: ${input.pageUuid}` };
  const flags = page.flags?.mastercrafted ?? {};
  return { success: true, data: { pageUuid: input.pageUuid, name: page.name, bookName: page.parent?.name, mastercrafted: flags } };
}

// ── Craft availability/consumption helpers (replicate _craft, no module class) ────

function itemQty(item: any, qp: string): number {
  return parseFloat(getProp(item.system, qp)) || 0;
}
function actorItems(actor: any): any[] {
  return actor?.items?.contents ?? actor?.items ?? [];
}
/** Is a single ingredient component satisfiable from the actor's inventory? */
function componentAvailable(actor: any, c: any, qp: string): boolean {
  if (c.resourcePath) return (parseFloat(getProp(actor.system, c.resourcePath)) || 0) >= (c.quantity ?? 1);
  const byName = actor.items?.getName?.(c.name);
  let total = byName ? itemQty(byName, qp) : 0;
  if (Array.isArray(c.tags) && c.tags.length) {
    for (const it of actorItems(actor)) {
      if (it === byName) continue;
      const tags = it.getFlag?.(MODULE_ID, 'tags') ?? it.flags?.[MODULE_ID]?.tags ?? [];
      if (c.tags.some((t: string) => tags.includes(t))) total += itemQty(it, qp);
    }
  }
  return total >= (c.quantity ?? 1);
}

type CheckInput = Extract<ModuleMastercraftedInputType, { action: 'check-craftable' }>;
async function handleCheckCraftable(input: CheckInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `MASTERCRAFTED_PAGE_NOT_FOUND: ${input.pageUuid}` };
  const actor = await (globalThis as any).fromUuid?.(input.inventoryActorUuid ?? input.actorUuid);
  if (!actor) return { success: false, error: `MASTERCRAFTED_ACTOR_NOT_FOUND: ${input.inventoryActorUuid ?? input.actorUuid}` };
  const flags = recipeFlags(page);
  const qp = quantityPath();
  const missing: string[] = [];
  for (const ing of flags.ingredients ?? []) {
    const comps = ing.components ?? [];
    const ok = comps.length > 0 && comps.some((c: any) => componentAvailable(actor, c, qp));
    if (!ok) missing.push(ing.name ?? comps[0]?.name ?? 'ingredient');
  }
  return {
    success: true,
    data: { pageUuid: input.pageUuid, name: page.name, canCraft: missing.length === 0, missing },
  };
}

type PendingInput = Extract<ModuleMastercraftedInputType, { action: 'list-pending-crafts' }>;
async function handleListPending(input: PendingInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const now = Number(game?.time?.worldTime ?? 0);
  const actors = input.actorUuids
    ? await Promise.all(input.actorUuids.map((u) => (globalThis as any).fromUuid?.(u)))
    : (game?.actors?.contents ?? []);
  const out: any[] = [];
  for (const actor of actors) {
    if (!actor) continue;
    const flags = actor.flags?.[MODULE_ID] ?? {};
    for (const [craftId, v] of Object.entries<any>(flags)) {
      if (!v || typeof v !== 'object' || v.time == null) continue;
      out.push({
        actorName: actor.name,
        actorUuid: actor.uuid,
        craftId,
        resolveAt: Number(v.time),
        remainingSeconds: Number(v.time) - now,
        itemsToDeliver: (v.items ?? []).map((i: any) => i?.name).filter(Boolean),
        ready: Number(v.time) - now <= 0,
      });
    }
  }
  out.sort((a, b) => a.resolveAt - b.resolveAt);
  return { success: true, data: { count: out.length, pending: out } };
}

// ── Writes ─────────────────────────────────────────────────────────────────────

type ExecuteInput = Extract<ModuleMastercraftedInputType, { action: 'execute-craft' }>;
async function handleExecuteCraft(input: ExecuteInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `MASTERCRAFTED_PAGE_NOT_FOUND: ${input.pageUuid}` };
  const actor = await (globalThis as any).fromUuid?.(input.actorUuid);
  if (!actor) return { success: false, error: `MASTERCRAFTED_ACTOR_NOT_FOUND: ${input.actorUuid}` };
  const inventoryActor = input.inventoryActorUuid ? await (globalThis as any).fromUuid?.(input.inventoryActorUuid) : actor;
  if (!inventoryActor) return { success: false, error: `MASTERCRAFTED_INVENTORY_ACTOR_NOT_FOUND: ${input.inventoryActorUuid}` };

  // WFRP4e customQuantityPath pre-flight (drift #1) — auto-fix only the broken default / empty value.
  let quantityPathFixed = false;
  let quantityPathWarning: string | undefined;
  const cqp = String(game?.settings?.get?.(MODULE_ID, 'customQuantityPath') ?? '');
  if (cqp === '' || cqp === 'quantity') {
    await game.settings.set(MODULE_ID, 'customQuantityPath', 'quantity.value');
    quantityPathFixed = true;
  } else if (cqp !== 'quantity.value') {
    quantityPathWarning = `customQuantityPath is "${cqp}" (not "quantity.value") — left unchanged; WFRP4e item stacking may be wrong.`;
  }

  // Re-implementation of Recipe._craft (BUG-374 — the module class is unreachable in the bundle).
  const flags = recipeFlags(page);
  const qp = quantityPath(); // "quantity.value" after the pre-flight fix

  // 1. Pick the component to consume per ingredient slot (explicit selection → first available → first).
  const toConsume: any[] = [];
  for (const ing of flags.ingredients ?? []) {
    const comps = ing.components ?? [];
    const selId = input.componentSelections?.[ing.id];
    const comp =
      (selId ? comps.find((c: any) => c.id === selId) : undefined) ??
      comps.find((c: any) => componentAvailable(inventoryActor, c, qp)) ??
      comps[0];
    if (comp) toConsume.push(comp);
  }
  // 2. Abort if any ingredient is unsatisfiable (don't consume partial).
  for (const c of toConsume) {
    if (!componentAvailable(inventoryActor, c, qp)) {
      return { success: false, error: `MASTERCRAFTED_INSUFFICIENT_INGREDIENTS: not enough "${c.name}" on ${inventoryActor.name}` };
    }
  }
  // 3. Resolve product item data (uuid → toObject with the recipe quantity).
  const productSlot = input.productId
    ? (flags.products ?? []).find((p: any) => p.id === input.productId)
    : (flags.products ?? [])[0];
  const productData: any[] = [];
  for (const pc of productSlot?.components ?? []) {
    const item = await (globalThis as any).fromUuid?.(pc.uuid);
    if (!item) continue;
    const data = item.toObject();
    if (fUtils()?.setProperty) fUtils().setProperty(data.system, qp, parseFloat(pc.quantity) || 1);
    productData.push(data);
  }
  // 4. Consume ingredients (resourcePath drain, else decrement/delete name + tag-matching items).
  const updates: any[] = [];
  const toDelete: string[] = [];
  const actorUpdates: Record<string, unknown> = {};
  for (const c of toConsume) {
    let remaining = c.quantity ?? 1;
    if (c.resourcePath) {
      const have = parseFloat(getProp(inventoryActor.system, c.resourcePath)) || 0;
      actorUpdates[`system.${c.resourcePath}`] = have - remaining;
      continue;
    }
    const candidates: any[] = [];
    const byName = inventoryActor.items?.getName?.(c.name);
    if (byName) candidates.push(byName);
    if (Array.isArray(c.tags) && c.tags.length) {
      for (const it of actorItems(inventoryActor)) {
        if (it === byName) continue;
        const tags = it.getFlag?.(MODULE_ID, 'tags') ?? it.flags?.[MODULE_ID]?.tags ?? [];
        if (c.tags.some((t: string) => tags.includes(t))) candidates.push(it);
      }
    }
    for (const it of candidates) {
      if (remaining <= 0) break;
      const q = itemQty(it, qp);
      if (q <= remaining) {
        toDelete.push(it.id);
        remaining -= q;
      } else {
        updates.push({ _id: it.id, [`system.${qp}`]: q - remaining });
        remaining = 0;
      }
    }
  }
  if (updates.length) await inventoryActor.updateEmbeddedDocuments('Item', updates);
  if (toDelete.length) await inventoryActor.deleteEmbeddedDocuments('Item', toDelete);
  if (Object.keys(actorUpdates).length) await inventoryActor.update(actorUpdates);

  // 5. Deliver — instant (time 0/null→book default 0) creates items now; timed (>0) queues a pending flag.
  const bookTime = recipeFlags(page.parent)?.time;
  const effTime = Number(flags.time ?? bookTime ?? 0);
  const newPending: string[] = [];
  let isTimed = false;
  if (effTime > 0) {
    const pendingId = randomId();
    await actor.setFlag(MODULE_ID, pendingId, {
      time: Number((globalThis as any).game?.time?.worldTime ?? 0) + effTime * 60,
      items: productData,
    });
    newPending.push(pendingId);
    isTimed = true;
  } else if (productData.length) {
    await actor.createEmbeddedDocuments('Item', productData);
  }

  notify.updated('mastercrafted', page.name, { summary: isTimed ? 'craft queued (timed)' : 'crafted (instant)' });
  return {
    success: true,
    data: {
      pageUuid: input.pageUuid,
      recipeName: page.name,
      actorUuid: input.actorUuid,
      timed: isTimed,
      pendingCraftIds: newPending,
      quantityPathFixed,
      quantityPathWarning,
      products: (page.flags?.mastercrafted?.products ?? []).map((p: any) => p.name).filter(Boolean),
    },
  };
}

type ProcessInput = Extract<ModuleMastercraftedInputType, { action: 'process-delayed-crafts' }>;
async function handleProcessDelayed(input: ProcessInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const api = game?.modules?.get?.(MODULE_ID)?.API;
  if (!api || typeof api.processDelayedCrafting !== 'function') {
    return { success: false, error: 'MASTERCRAFTED_API_UNAVAILABLE: API.processDelayedCrafting is not bound' };
  }
  const actors = input.actorUuids
    ? (await Promise.all(input.actorUuids.map((u) => (globalThis as any).fromUuid?.(u)))).filter(Boolean)
    : (game?.actors?.contents ?? []);

  // Snapshot pending counts to report what resolved.
  const before = new Map<string, number>();
  for (const a of actors) before.set(a.id, Object.keys(a.flags?.[MODULE_ID] ?? {}).length);

  await api.processDelayedCrafting(actors);

  let resolved = 0;
  const perActor: any[] = [];
  for (const a of actors) {
    const after = Object.keys(a.flags?.[MODULE_ID] ?? {}).length;
    const delta = (before.get(a.id) ?? 0) - after;
    if (delta > 0) {
      resolved += delta;
      perActor.push({ actorName: a.name, resolved: delta });
    }
  }
  notify.updated('mastercrafted', `${actors.length} actor(s)`, { summary: `${resolved} delayed craft(s) resolved` });
  return { success: true, data: { actorsProcessed: actors.length, resolved, perActor } };
}

type GrantInput = Extract<ModuleMastercraftedInputType, { action: 'grant-recipe-discovery' }>;
async function handleGrantDiscovery(input: GrantInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `MASTERCRAFTED_PAGE_NOT_FOUND: ${input.pageUuid}` };
  const level = input.level ?? 1;
  await page.update({ [`ownership.${input.userId}`]: level });
  // DP-16 — verify ownership read-back.
  const persisted = page.ownership?.[input.userId] ?? page._source?.ownership?.[input.userId];
  if (Number(persisted) !== level) {
    return { success: false, error: `MASTERCRAFTED_OWNERSHIP_NOT_PERSISTED: read back ${persisted} after writing ${level}` };
  }
  notify.updated('mastercrafted', page.name, { summary: `discovery granted to ${input.userId} (level ${level})` });
  return { success: true, data: { pageUuid: input.pageUuid, name: page.name, userId: input.userId, level } };
}

// ── Phase 14 full-functionality handlers ──────────────────────────────────────

type CreateBookInput = Extract<ModuleMastercraftedInputType, { action: 'create-recipe-book' }>;
async function handleCreateRecipeBook(input: CreateBookInput): Promise<Envelope<unknown>> {
  // Replicate RecipeBook.create — a JournalEntry with book-level flags + one blank recipe page.
  const JE = (globalThis as any).CONFIG?.JournalEntry?.documentClass ?? (globalThis as any).JournalEntry;
  const book = await JE.create({
    name: input.name ?? 'Recipe Book',
    folder: input.folderId ?? null,
    flags: {
      mastercrafted: {
        img: 'icons/sundries/books/book-worn-brown-grey.webp',
        sound: '',
        require: '',
        ingredientsInspection: false,
        productInspection: false,
        macroName: '',
        time: null,
      },
    },
  });
  if (!book) return { success: false, error: 'MASTERCRAFTED_BOOK_NOT_CREATED' };
  await book.createEmbeddedDocuments('JournalEntryPage', [
    { name: 'Recipe', type: PAGE_TYPE, flags: { mastercrafted: defaultRecipeFlags(book.id) } },
  ]);
  notify.created('mastercrafted', book.name, { summary: 'recipe book created' });
  return { success: true, data: { bookUuid: book.uuid, name: book.name, pageCount: book.pages?.size ?? 1 } };
}

type CreateRecipeInput = Extract<ModuleMastercraftedInputType, { action: 'create-recipe' }>;
async function handleCreateRecipe(input: CreateRecipeInput): Promise<Envelope<unknown>> {
  const book = await (globalThis as any).fromUuid?.(input.bookUuid);
  if (!book) return { success: false, error: `MASTERCRAFTED_BOOK_NOT_FOUND: ${input.bookUuid}` };
  const mc = defaultRecipeFlags(book.id);
  if (input.img !== undefined) mc.img = input.img;
  if (input.time !== undefined) mc.time = input.time;
  const [page] = await book.createEmbeddedDocuments('JournalEntryPage', [
    { name: input.name, type: PAGE_TYPE, flags: { mastercrafted: mc } },
  ]);
  if (!page) return { success: false, error: 'MASTERCRAFTED_RECIPE_NOT_CREATED' };
  notify.created('mastercrafted', input.name, { summary: 'recipe created' });
  return { success: true, data: { pageUuid: page.uuid, name: page.name, bookUuid: input.bookUuid } };
}

type UpdateRecipeInput = Extract<ModuleMastercraftedInputType, { action: 'update-recipe' }>;
async function handleUpdateRecipe(input: UpdateRecipeInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `MASTERCRAFTED_PAGE_NOT_FOUND: ${input.pageUuid}` };
  const mc: Record<string, unknown> = {};
  for (const k of ['time', 'macroName', 'expression', 'require', 'sound', 'img', 'modifierList'] as const) {
    if ((input as any)[k] !== undefined) mc[k] = (input as any)[k];
  }
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (Object.keys(mc).length) updateData.flags = { mastercrafted: mc };
  await page.update(updateData);
  notify.updated('mastercrafted', page.name, { summary: `recipe updated (${Object.keys(mc).join(', ') || 'name'})` });
  return { success: true, data: { pageUuid: input.pageUuid, name: page.name, updated: Object.keys(updateData) } };
}

type UpdateBookInput = Extract<ModuleMastercraftedInputType, { action: 'update-recipe-book' }>;
async function handleUpdateRecipeBook(input: UpdateBookInput): Promise<Envelope<unknown>> {
  const book = await (globalThis as any).fromUuid?.(input.bookUuid);
  if (!book) return { success: false, error: `MASTERCRAFTED_BOOK_NOT_FOUND: ${input.bookUuid}` };
  const mc: Record<string, unknown> = {};
  for (const k of ['img', 'sound', 'require', 'time'] as const) {
    if ((input as any)[k] !== undefined) mc[k] = (input as any)[k];
  }
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (Object.keys(mc).length) updateData.flags = { mastercrafted: mc };
  await book.update(updateData);
  notify.updated('mastercrafted', book.name, { summary: 'recipe book updated' });
  return { success: true, data: { bookUuid: input.bookUuid, name: book.name, updated: Object.keys(updateData) } };
}

type GetBookInput = Extract<ModuleMastercraftedInputType, { action: 'get-recipe-book' }>;
async function handleGetRecipeBook(input: GetBookInput): Promise<Envelope<unknown>> {
  const book = await (globalThis as any).fromUuid?.(input.bookUuid);
  if (!book) return { success: false, error: `MASTERCRAFTED_BOOK_NOT_FOUND: ${input.bookUuid}` };
  const data = { id: book.id, name: book.name, ownership: book.ownership ?? book._source?.ownership, ...recipeFlags(book) };
  return { success: true, data: { bookUuid: input.bookUuid, name: book.name, book: data, recipeCount: book.pages?.size ?? 0 } };
}

type SetItemTagsInput = Extract<ModuleMastercraftedInputType, { action: 'set-item-tags' }>;
async function handleSetItemTags(input: SetItemTagsInput): Promise<Envelope<unknown>> {
  const item = await (globalThis as any).fromUuid?.(input.itemUuid);
  if (!item) return { success: false, error: `MASTERCRAFTED_ITEM_NOT_FOUND: ${input.itemUuid}` };
  await item.setFlag(MODULE_ID, 'tags', input.tags);
  const persisted = item.getFlag?.(MODULE_ID, 'tags');
  notify.updated('mastercrafted', item.name, { summary: `tags: ${input.tags.join(', ')}` });
  return { success: true, data: { itemUuid: input.itemUuid, name: item.name, tags: persisted } };
}

/** Resolve a recipe page + a deep-cloned copy of its slot array (ingredients/products). */
async function slotsFor(pageUuid: string, slot: 'ingredient' | 'product'): Promise<{ page: any; arrKey: string; slots: any[] } | { error: string }> {
  const page = await (globalThis as any).fromUuid?.(pageUuid);
  if (!page) return { error: `MASTERCRAFTED_PAGE_NOT_FOUND: ${pageUuid}` };
  const flags = clone(recipeFlags(page));
  const arrKey = slot === 'ingredient' ? 'ingredients' : 'products';
  const slots = Array.isArray(flags[arrKey]) ? flags[arrKey] : [];
  return { page, arrKey, slots };
}

type AddComponentInput = Extract<ModuleMastercraftedInputType, { action: 'add-component' }>;
async function handleAddComponent(input: AddComponentInput): Promise<Envelope<unknown>> {
  const r = await slotsFor(input.pageUuid, input.slot);
  if ('error' in r) return { success: false, error: r.error };
  let slot = input.slotId ? r.slots.find((s: any) => s.id === input.slotId) : undefined;
  if (!slot) {
    slot = { id: randomId(), name: null, components: [] };
    r.slots.push(slot);
  }
  const comp = makeComponent(input.uuid, input.name, input.img ?? '', input.quantity ?? 1, input.slot === 'ingredient' ? input.tags : undefined);
  slot.components = [...(slot.components ?? []), comp];
  await r.page.update({ flags: { mastercrafted: { [r.arrKey]: r.slots } } });
  notify.updated('mastercrafted', r.page.name, { summary: `${input.slot} component added: ${input.name}` });
  return { success: true, data: { pageUuid: input.pageUuid, slot: input.slot, slotId: slot.id, componentId: comp.id, name: input.name } };
}

type RemoveComponentInput = Extract<ModuleMastercraftedInputType, { action: 'remove-component' }>;
async function handleRemoveComponent(input: RemoveComponentInput): Promise<Envelope<unknown>> {
  const r = await slotsFor(input.pageUuid, input.slot);
  if ('error' in r) return { success: false, error: r.error };
  const slot = r.slots.find((s: any) => s.id === input.slotId);
  if (!slot) return { success: false, error: `MASTERCRAFTED_SLOT_NOT_FOUND: ${input.slotId}` };
  slot.components = (slot.components ?? []).filter((c: any) => c.id !== input.componentId);
  // Mirror the module: an emptied slot is removed entirely.
  const newSlots = slot.components.length ? r.slots : r.slots.filter((s: any) => s.id !== input.slotId);
  await r.page.update({ flags: { mastercrafted: { [r.arrKey]: newSlots } } });
  notify.updated('mastercrafted', r.page.name, { summary: `${input.slot} component removed` });
  return { success: true, data: { pageUuid: input.pageUuid, slot: input.slot, slotId: input.slotId, componentId: input.componentId, removed: true } };
}

type SetComponentQtyInput = Extract<ModuleMastercraftedInputType, { action: 'set-component-quantity' }>;
async function handleSetComponentQuantity(input: SetComponentQtyInput): Promise<Envelope<unknown>> {
  const r = await slotsFor(input.pageUuid, input.slot);
  if ('error' in r) return { success: false, error: r.error };
  const slot = r.slots.find((s: any) => s.id === input.slotId);
  const comp = slot?.components?.find((c: any) => c.id === input.componentId);
  if (!comp) return { success: false, error: `MASTERCRAFTED_COMPONENT_NOT_FOUND: ${input.componentId}` };
  comp.quantity = input.quantity;
  await r.page.update({ flags: { mastercrafted: { [r.arrKey]: r.slots } } });
  notify.updated('mastercrafted', r.page.name, { summary: `${input.slot} quantity → ${input.quantity}` });
  return { success: true, data: { pageUuid: input.pageUuid, slot: input.slot, componentId: input.componentId, quantity: input.quantity } };
}

type SearchInput = Extract<ModuleMastercraftedInputType, { action: 'search-by-ingredient' }>;
async function handleSearchByIngredient(input: SearchInput): Promise<Envelope<unknown>> {
  const needle = input.name.toLowerCase();
  const compNames = (slots: any[]) => (slots ?? []).flatMap((s: any) => (s.components ?? []).map((c: any) => c.name)).filter(Boolean);
  const out: any[] = [];
  for (const { page } of recipePages()) {
    const flags = recipeFlags(page);
    const ingredients = compNames(flags.ingredients);
    const products = compNames(flags.products);
    if ([...ingredients, ...products].some((n: string) => String(n).toLowerCase().includes(needle))) {
      out.push({ name: page.name, pageUuid: page.uuid, ingredients, products });
    }
  }
  return { success: true, data: { query: input.name, count: out.length, recipes: out } };
}

type ConfigureSettingsInput = Extract<ModuleMastercraftedInputType, { action: 'configure-settings' }>;
async function handleConfigureSettings(input: ConfigureSettingsInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const keys = ['customQuantityPath', 'enableCauldron', 'mainFolderName', 'dontShowButtonOnNpc'] as const;
  const provided = keys.filter((k) => (input as any)[k] !== undefined);
  if (!provided.length) return { success: false, error: 'MASTERCRAFTED_INVALID_INPUT: configure-settings requires at least one setting' };
  const written: Record<string, unknown> = {};
  for (const k of provided) {
    await game.settings.set(MODULE_ID, k, (input as any)[k]);
    written[k] = game?.settings?.get?.(MODULE_ID, k);
  }
  notify.updated('mastercrafted', 'world settings', { summary: `configured ${provided.join(', ')}` });
  return { success: true, data: { written } };
}

type CancelPendingInput = Extract<ModuleMastercraftedInputType, { action: 'cancel-pending-craft' }>;
async function handleCancelPending(input: CancelPendingInput): Promise<Envelope<unknown>> {
  const actor = await (globalThis as any).fromUuid?.(input.actorUuid);
  if (!actor) return { success: false, error: `MASTERCRAFTED_ACTOR_NOT_FOUND: ${input.actorUuid}` };
  if (actor.flags?.[MODULE_ID]?.[input.craftId] == null) {
    return { success: false, error: `MASTERCRAFTED_CRAFT_NOT_FOUND: no pending craft "${input.craftId}" on ${actor.name}` };
  }
  await actor.unsetFlag(MODULE_ID, input.craftId);
  notify.deleted('mastercrafted', actor.name, { summary: `cancelled pending craft ${input.craftId}` });
  return { success: true, data: { actorUuid: input.actorUuid, craftId: input.craftId, cancelled: true } };
}

type DeleteRecipeInput = Extract<ModuleMastercraftedInputType, { action: 'delete-recipe' }>;
async function handleDeleteRecipe(input: DeleteRecipeInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `MASTERCRAFTED_PAGE_NOT_FOUND: ${input.pageUuid}` };
  const name = page.name;
  await page.delete();
  notify.deleted('mastercrafted', name, { summary: 'recipe deleted' });
  return { success: true, data: { pageUuid: input.pageUuid, name, deleted: true } };
}

type DeleteBookInput = Extract<ModuleMastercraftedInputType, { action: 'delete-recipe-book' }>;
async function handleDeleteRecipeBook(input: DeleteBookInput): Promise<Envelope<unknown>> {
  const book = await (globalThis as any).fromUuid?.(input.bookUuid);
  if (!book) return { success: false, error: `MASTERCRAFTED_BOOK_NOT_FOUND: ${input.bookUuid}` };
  const name = book.name;
  const recipeCount = book.pages?.size ?? 0;
  await book.delete();
  notify.deleted('mastercrafted', name, { summary: `recipe book deleted (${recipeCount} recipes)` });
  return { success: true, data: { bookUuid: input.bookUuid, name, recipesDeleted: recipeCount, deleted: true } };
}
