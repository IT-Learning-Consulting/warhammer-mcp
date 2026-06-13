// Module Integration v1 Phase 14 — module-mastercrafted MCP tool (mastercrafted integration).
//
// Always-registered umbrella. The foundry-module handler guards on mastercrafted being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). Use module-probe.is-active mastercrafted to pre-flight.
//
// 7 actions: reads (list-recipes, get-recipe, check-craftable, list-pending-crafts) + GM writes
// (execute-craft [confirm-gated], process-delayed-crafts, grant-recipe-discovery).
//
// Anchors: DP-15 (concrete this.query<T> per action — never <any>).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type {
  ListRecipesResult,
  GetRecipeResult,
  CheckCraftableResult,
  ListPendingResult,
  ExecuteCraftResult,
  ProcessDelayedResult,
  GrantDiscoveryResult,
  RecipeSummary,
  PendingCraft,
  SearchResult,
  GetBookResult,
  GenericMastercraftedResult,
} from './schemas.js';

const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `module-mastercrafted/${action} failed: ${message}` }],
    isError: true,
  };
}

function recipeLine(r: RecipeSummary): string {
  const t = r.time ? ` (${r.time}m)` : '';
  return `  • ${r.recipeName}${t} [${r.bookName}] — ${r.ingredients.join('+')} → ${r.products.join('+')} (\`${r.pageUuid}\`)`;
}

function formatList(d: ListRecipesResult): string {
  if (!d.count) return 'module-mastercrafted.list-recipes: no recipes.';
  return `module-mastercrafted.list-recipes: ${d.count} recipe(s):\n${d.recipes.map(recipeLine).join('\n')}`;
}

// BUG-375: a slot's own `name` is null for MCP-authored recipes — the component names live under
// slot.components[].name. Fall back to the joined component names so populated slots don't read "(none)".
function slotLabel(slot: any): string {
  return slot?.name ?? (slot?.components ?? []).map((c: any) => c.name).filter(Boolean).join('+');
}
function formatGet(d: GetRecipeResult): string {
  const f = d.mastercrafted as any;
  return [
    `module-mastercrafted.get-recipe: ${d.name} [${d.bookName ?? '?'}]`,
    `- time: ${f.time ?? '(book default)'}m`,
    `- ingredients: ${(f.ingredients ?? []).map(slotLabel).filter(Boolean).join(', ') || '(none)'}`,
    `- products: ${(f.products ?? []).map(slotLabel).filter(Boolean).join(', ') || '(none)'}`,
  ].join('\n');
}

function formatCheck(d: CheckCraftableResult): string {
  return `module-mastercrafted.check-craftable: ${d.name} — canCraft=${d.canCraft}`;
}

function pendingLine(p: PendingCraft): string {
  const t = p.ready ? 'READY' : `${Math.round(p.remainingSeconds)}s`;
  return `  • ${p.actorName}: ${p.itemsToDeliver.join(', ') || '(items)'} — ${t}`;
}

function formatPending(d: ListPendingResult): string {
  if (!d.count) return 'module-mastercrafted.list-pending-crafts: no pending crafts.';
  return `module-mastercrafted.list-pending-crafts: ${d.count} pending:\n${d.pending.map(pendingLine).join('\n')}`;
}

function formatExecute(d: ExecuteCraftResult): string {
  const lines = [
    `module-mastercrafted.execute-craft: ${d.recipeName} → ${d.timed ? 'queued (timed)' : 'crafted (instant)'}`,
    `- products: ${d.products.join(', ') || '(see recipe)'}`,
  ];
  if (d.timed) lines.push(`- pending craft id(s): ${d.pendingCraftIds.join(', ')}`);
  if (d.quantityPathFixed) lines.push(`- NOTE: set customQuantityPath = "quantity.value" for correct WFRP4e stacking`);
  if (d.quantityPathWarning) lines.push(`- ⚠ ${d.quantityPathWarning}`);
  return lines.join('\n');
}

function formatProcess(d: ProcessDelayedResult): string {
  return `module-mastercrafted.process-delayed-crafts: ${d.resolved} craft(s) resolved across ${d.actorsProcessed} actor(s)`;
}

function formatGrant(d: GrantDiscoveryResult): string {
  return `module-mastercrafted.grant-recipe-discovery: ${d.name} → user ${d.userId} level ${d.level} (${d.level === 2 ? 'Owner' : 'Observer'})`;
}

function formatSearch(d: SearchResult): string {
  if (!d.count) return `module-mastercrafted.search-by-ingredient: no recipes use "${d.query}".`;
  const lines = d.recipes.map((r) => `  • ${r.name} — ${r.ingredients.join('+')} → ${r.products.join('+')} (${r.pageUuid})`);
  return `module-mastercrafted.search-by-ingredient "${d.query}": ${d.count} recipe(s):\n${lines.join('\n')}`;
}

function formatGetBook(d: GetBookResult): string {
  const b = d.book as any;
  return [
    `module-mastercrafted.get-recipe-book: ${d.name} (${d.recipeCount} recipes)`,
    `- default time: ${b?.time ?? '(instant)'}m · require: ${b?.require || '(none)'}`,
  ].join('\n');
}

function formatGenericMc(action: string) {
  return (d: GenericMastercraftedResult): string => {
    const parts = Object.entries(d)
      .filter(([k]) => k !== 'note' && k !== 'book')
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
    return `module-mastercrafted.${action}: ${parts.join(' · ')}`;
  };
}

export interface ModuleMastercraftedToolOptions extends BaseToolOptions {}

export class ModuleMastercraftedTool extends BaseTool {
  constructor(options: ModuleMastercraftedToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-mastercrafted',
        title: 'Mastercrafted (crafting) integration',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Integrate mastercrafted: browse recipe books, check craftability, execute instant or timed crafts, resolve delayed crafting queues, and grant recipe discovery. Recipes live as JournalEntryPages; the module's craft logic is reached via dynamic import (no public craft API).
Conditional: returns MODULE_NOT_ACTIVE when mastercrafted is absent/inactive.
Pre-flight: module-probe.is-active mastercrafted before using this tool.

7 actions:
Reads — list-recipes { filter? }; get-recipe { pageUuid }; check-craftable { pageUuid, actorUuid, inventoryActorUuid? }; list-pending-crafts { actorUuids? }.
GM writes — execute-craft { pageUuid, actorUuid, inventoryActorUuid?, componentSelections? {ingredientId:componentId}, productId?, confirm:true } (consumes ingredients, delivers products; timed recipes queue a pending flag); process-delayed-crafts { actorUuids? } (resolves crafts past their worldTime); grant-recipe-discovery { pageUuid, userId, level?: 1|2 }.

WFRP4e: execute-craft auto-sets the world setting customQuantityPath = "quantity.value" (when unset / the broken "quantity" default) so item quantities stack correctly. Timed recipe "time" is in MINUTES.

Example: { action: "execute-craft", pageUuid: "JournalEntry.x.JournalEntryPage.y", actorUuid: "Actor.z", confirm: true }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'list-recipes', 'get-recipe', 'get-recipe-book', 'check-craftable', 'list-pending-crafts',
                'search-by-ingredient', 'execute-craft', 'process-delayed-crafts', 'grant-recipe-discovery',
                'create-recipe-book', 'create-recipe', 'update-recipe', 'update-recipe-book', 'set-item-tags',
                'add-component', 'remove-component', 'set-component-quantity', 'configure-settings',
                'cancel-pending-craft', 'delete-recipe', 'delete-recipe-book',
              ],
              description: 'Mastercrafted action to perform.',
            },
            filter: { type: 'string', description: 'list-recipes: ingredient name or partial recipe/book title.' },
            pageUuid: { type: 'string', description: 'get-recipe/check-craftable/execute-craft/grant-recipe-discovery: the recipe JournalEntryPage UUID.' },
            actorUuid: { type: 'string', description: 'check-craftable/execute-craft: the crafting actor.' },
            inventoryActorUuid: { type: 'string', description: 'check-craftable/execute-craft: actor whose inventory supplies ingredients (default = actorUuid).' },
            componentSelections: { type: 'object', description: 'execute-craft: map of ingredientId → componentId for tagged/multi-component slots (auto-resolved when omitted).' },
            productId: { type: 'string', description: 'execute-craft: select which product to make (default first).' },
            actorUuids: { type: 'array', items: { type: 'string' }, description: 'list-pending-crafts/process-delayed-crafts: actor UUIDs (all actors if omitted).' },
            userId: { type: 'string', description: 'grant-recipe-discovery: the user to grant access to.' },
            level: { type: 'number', enum: [1, 2], description: 'grant-recipe-discovery: Observer=1 (default) / Owner=2.' },
            bookUuid: { type: 'string', description: 'create-recipe/update-recipe-book/get-recipe-book/delete-recipe-book: the recipe-book JournalEntry UUID.' },
            folderId: { type: 'string', description: 'create-recipe-book: optional folder to create the book in.' },
            name: { type: 'string', description: 'create-recipe/update-recipe/create-recipe-book/update-recipe-book: name.' },
            img: { type: 'string', description: 'create-recipe/update-recipe/update-recipe-book: image path.' },
            time: { type: 'number', description: 'create-recipe/update-recipe/update-recipe-book: craft time in MINUTES (null = inherit/instant).' },
            macroName: { type: 'string', description: 'update-recipe: macro name (format "name|arg1|arg2").' },
            expression: { type: 'string', description: 'update-recipe: roll expression for quantity modifier.' },
            require: { type: 'string', description: 'update-recipe/update-recipe-book: CSV of required tool item names.' },
            sound: { type: 'string', description: 'update-recipe/update-recipe-book: crafting sound path.' },
            modifierList: { type: 'array', items: { type: 'object', properties: { DC: { type: 'number' }, modifier: { type: 'string' } } }, description: 'update-recipe: DC→quantity-modifier ladder.' },
            itemUuid: { type: 'string', description: 'set-item-tags: the Item to tag.' },
            tags: { type: 'array', items: { type: 'string' }, description: 'set-item-tags: tag strings for ingredient matching.' },
            slot: { type: 'string', enum: ['ingredient', 'product'], description: 'add/remove-component, set-component-quantity: which slot family.' },
            slotId: { type: 'string', description: 'add-component (omit = new slot) / remove-component / set-component-quantity: the ingredient/product slot id.' },
            uuid: { type: 'string', description: 'add-component: source item UUID.' },
            componentId: { type: 'string', description: 'remove-component/set-component-quantity: the component id within the slot.' },
            quantity: { type: 'number', description: 'add-component/set-component-quantity: component quantity.' },
            customQuantityPath: { type: 'string', description: 'configure-settings: WFRP4e needs "quantity.value".' },
            enableCauldron: { type: 'boolean', description: 'configure-settings: cauldron UI toggle.' },
            mainFolderName: { type: 'string', description: 'configure-settings: recipe-browser root folder.' },
            dontShowButtonOnNpc: { type: 'boolean', description: 'configure-settings: suppress craft button on NPC sheets.' },
            craftId: { type: 'string', description: 'cancel-pending-craft: the pending craft id (from list-pending-crafts).' },
            confirm: { type: 'boolean', description: 'Required (true) for execute-craft, cancel-pending-craft, delete-recipe, delete-recipe-book.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-mastercrafted action', { action });
    switch (action) {
      case 'list-recipes': return this.run<ListRecipesResult>(action, rawArgs, formatList);
      case 'get-recipe': return this.run<GetRecipeResult>(action, rawArgs, formatGet);
      case 'check-craftable': return this.run<CheckCraftableResult>(action, rawArgs, formatCheck);
      case 'list-pending-crafts': return this.run<ListPendingResult>(action, rawArgs, formatPending);
      case 'execute-craft': return this.run<ExecuteCraftResult>(action, rawArgs, formatExecute);
      case 'process-delayed-crafts': return this.run<ProcessDelayedResult>(action, rawArgs, formatProcess);
      case 'grant-recipe-discovery': return this.run<GrantDiscoveryResult>(action, rawArgs, formatGrant);
      case 'search-by-ingredient': return this.run<SearchResult>(action, rawArgs, formatSearch);
      case 'get-recipe-book': return this.run<GetBookResult>(action, rawArgs, formatGetBook);
      case 'create-recipe-book':
      case 'create-recipe':
      case 'update-recipe':
      case 'update-recipe-book':
      case 'set-item-tags':
      case 'add-component':
      case 'remove-component':
      case 'set-component-quantity':
      case 'configure-settings':
      case 'cancel-pending-craft':
      case 'delete-recipe':
      case 'delete-recipe-book':
        return this.run<GenericMastercraftedResult>(action, rawArgs, formatGenericMc(action));
      default:
        return errorContent('unknown', `unknown action: ${action}`);
    }
  }

  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-mastercrafted', args);
      return text(fmt(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('MODULE_NOT_ACTIVE')) return moduleNotActiveContent('module-mastercrafted', msg);
      return errorContent(action, msg);
    }
  }
}
