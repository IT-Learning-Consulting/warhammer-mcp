// services/template-apply.ts — MCP Code-Quality Hardening v1, Phase 6 (R6.1/R6.2).
// Template-apply engine, extracted verbatim from FoundryDataAccess (Migrate; Contract → Phase 7). Seam =
// injected validateState; Foundry globals accessed directly (HC1); no auditLog (so validateState-only ctor).
// R6.2 split: _runTemplateApply = executeTemplatePlan(await planTemplateApply(...)). planTemplateApply() builds
// the serializable write plan with NO writes (internal dry-run); executeTemplatePlan() applies WRITE #1 then
// WRITE #2 (order/options preserved). Byte-identical (da-template.snap.test.ts). Tool-level --dryRun → Phase 12.
// WRITE #3 (token name-sync) stays in applyTemplateToToken (post-engine, BUG-055).

import { notify } from '../notify.js';
import { buildOperationReceipt } from './shared/operation-receipt.js';

interface PreResolvedChoices {
  skillGroups?: Record<string, string> | undefined;
  talentGroups?: Record<string, string> | undefined;
  specialisations?: Record<string, string[]> | undefined;
  lores?: string[] | undefined;
  spells?: Record<string, string[]> | undefined;
  trappings?: Record<string, string> | undefined;
}

// Serializable description of the two engine writes (PRD Risk 6.A — derived from the existing writes).
type TemplateWrite =
  | { op: 'actor.update'; updateData: Record<string, any>; options: { skipExperienceChecks: boolean } }
  | { op: 'createEmbeddedDocuments'; documentType: 'Item'; items: any[]; options: { fromTemplate: string; skipSpecialisationChoice: boolean } };

// Plan returned by planTemplateApply: `writes` is the serializable flat array (dry-run surface); `actor` is
// the execution target (not serialized); the rest is the data executeTemplatePlan needs to build the result.
export interface TemplateApplyPlan {
  actor: any;
  templateId: string;
  templateName: string;
  newName: string;
  characteristicDeltas: Record<string, number>;
  writes: TemplateWrite[];
}

export class TemplateApplyService {
  constructor(private readonly validateState: () => void) {}

  async applyTemplate(data: {
    actorId: string;
    templateUuid: string;
    preResolvedChoices?: PreResolvedChoices | undefined;
    dryRun?: boolean | undefined;
  }): Promise<any> {
    this.validateState();

    try {
      const actor = game.actors?.get(data.actorId);
      if (!actor) {
        throw new Error(`Actor not found with ID: ${data.actorId}`);
      }

      const template = await this.resolveTemplateDoc(data.templateUuid);
      if (!template) {
        throw new Error(`Template not found for uuid/id: ${data.templateUuid}`);
      }
      if ((template as any).type !== 'template') {
        throw new Error(`Item "${data.templateUuid}" is type "${(template as any).type}", expected "template"`);
      }

      const templateId: string = (template as any).id ?? data.templateUuid;
      // Phase 12 R12.1: dryRun → build the plan (read-only) and return a serialized preview; zero writes.
      if (data.dryRun) {
        const plan = await this.planTemplateApply(actor, template, templateId, data.preResolvedChoices ?? {});
        return this.serializePlanPreview(plan, actor);
      }
      // Phase 12 R12.2: operation receipt — created = the embedded item ids; updated = the actor itself.
      const result = await this._runTemplateApply(actor, template, templateId, data.preResolvedChoices ?? {});
      return { ...result, ...buildOperationReceipt({ created: result?.applied?.itemIds, updated: [result?.actorId] }) };
    } catch (error) {
      throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Token-delta variant: applies the template into a token's synthetic ActorDelta. World actor + sibling
  // tokens stay untouched. Rejects actorLink=true tokens (their delta is a passthrough — writes would
  // silently mutate the world actor instead).
  async applyTemplateToToken(data: {
    sceneId: string;
    tokenId: string;
    templateUuid: string;
    preResolvedChoices?: PreResolvedChoices | undefined;
    dryRun?: boolean | undefined;
  }): Promise<any> {
    this.validateState();

    try {
      const scene: any = (globalThis as any).game?.scenes?.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found with ID: ${data.sceneId}`);
      }
      const tokenDoc: any = scene.tokens?.get(data.tokenId);
      if (!tokenDoc) {
        throw new Error(`Token not found on scene "${scene.name}": ${data.tokenId}`);
      }
      if (tokenDoc.actorLink === true) {
        throw new Error(
          `Token "${data.tokenId}" is linked (actorLink=true); writes to its delta have no effect. ` +
          `Use apply-template with the world actor ID (${tokenDoc.actorId}) instead.`,
        );
      }
      const actor: any = tokenDoc.actor;
      if (!actor) {
        throw new Error(`Token "${data.tokenId}" has no synthetic actor`);
      }

      const template = await this.resolveTemplateDoc(data.templateUuid);
      if (!template) {
        throw new Error(`Template not found for uuid/id: ${data.templateUuid}`);
      }
      if ((template as any).type !== 'template') {
        throw new Error(`Item "${data.templateUuid}" is type "${(template as any).type}", expected "template"`);
      }

      const templateId: string = (template as any).id ?? data.templateUuid;

      // Phase 12 R12.1: dryRun → serialize the plan + the WRITE #3 token-rename it WOULD perform; zero writes.
      if (data.dryRun) {
        const plan = await this.planTemplateApply(actor, template, templateId, data.preResolvedChoices ?? {});
        const preview = this.serializePlanPreview(plan, actor);
        const tplSys = (template as any).system ?? {};
        const alterPre = (tplSys.alterName?.pre ?? '').trim();
        const alterPost = (tplSys.alterName?.post ?? '').trim();
        const templateRenames = alterPre.length > 0 || alterPost.length > 0;
        let tokenRename: { wouldRename: boolean; plannedName?: string } = { wouldRename: false };
        if (templateRenames && typeof plan.newName === 'string' && plan.newName.length > 0) {
          const siblingCount = Array.from(scene.tokens?.values() ?? []).filter((t: any) => {
            if (!t || t.id === data.tokenId) return false;
            const n = t.name ?? '';
            return n === plan.newName || n.startsWith(`${plan.newName} (`);
          }).length;
          tokenRename = { wouldRename: true, plannedName: `${plan.newName} (${siblingCount + 1})` };
        }
        return { ...preview, sceneId: data.sceneId, tokenId: data.tokenId, tokenRename };
      }

      // Redirect template-triggered condition scripts away from the world actor.
      const baseActor: any = (globalThis as any).game?.actors?.get(tokenDoc.actorId);
      let restoreAddCondition: (() => void) | null = null;
      if (baseActor && baseActor !== actor && typeof baseActor.addCondition === 'function') {
        const originalAddCondition = baseActor.addCondition;
        baseActor.addCondition = async (...args: any[]) => {
          const tokenActor: any = tokenDoc.actor;
          if (tokenActor && tokenActor !== baseActor && typeof tokenActor.addCondition === 'function') {
            return await tokenActor.addCondition(...args);
          }
          return await originalAddCondition.apply(baseActor, args as any);
        };
        restoreAddCondition = () => {
          baseActor.addCondition = originalAddCondition;
        };
      }

      let result: any;
      try {
        result = await this._runTemplateApply(actor, template, templateId, data.preResolvedChoices ?? {});
      } finally {
        if (restoreAddCondition) restoreAddCondition();
      }

      // BUG-053 token-delta sibling: TokenDocument.name is captured at drop-time from the base actor and
      // never re-reads the delta. Sync it + replicate Foundry's create-time auto-numbering (WRITE #3). Skip
      // for non-renaming templates (no alterName) so they keep the drop-time suffix.
      const tplSys = (template as any).system ?? {};
      const alterPre = (tplSys.alterName?.pre ?? '').trim();
      const alterPost = (tplSys.alterName?.post ?? '').trim();
      const templateRenames = alterPre.length > 0 || alterPost.length > 0;
      const appliedName = result?.applied?.name;
      if (templateRenames && typeof appliedName === 'string' && appliedName.length > 0) {
        const siblingCount = Array.from(scene.tokens?.values() ?? []).filter((t: any) => {
          if (!t || t.id === data.tokenId) return false;
          const n = t.name ?? '';
          return n === appliedName || n.startsWith(`${appliedName} (`);
        }).length;
        // BUG-055 contract (apply-template-to-token.test.ts): always suffix, singleton → "(1)" (BUG-277's
        // drop-the-singleton proposal was rejected — the (1) replicates create-time auto-numbering).
        const numberedName = `${appliedName} (${siblingCount + 1})`;
        if (numberedName !== tokenDoc.name) {
          await tokenDoc.update({ name: numberedName });
        }
      }

      notify.updated('token', tokenDoc.name ?? actor.name, {
        summary: `applied template ${(template as any).name}`,
        uuid: tokenDoc.uuid,
        tooltip: { tokenDoc, message: `+${(template as any).name}` },
      });

      // Phase 12 R12.2: operation receipt — created = embedded item ids; updated = the actor delta + its token.
      return {
        ...result,
        sceneId: data.sceneId,
        tokenId: data.tokenId,
        ...buildOperationReceipt({ created: result?.applied?.itemIds, updated: [result?.actorId, data.tokenId] }),
      };
    } catch (error) {
      throw new Error(`Failed to apply template to token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Core template application on any actor-shaped doc (world Actor OR synthetic token-delta). Caller resolves
  // the actor/template/templateId. Phase 6 (R6.2): split into planTemplateApply() + executeTemplatePlan(); this
  // is their composition (behavior-identical, da-template.snap.test.ts).
  private async _runTemplateApply(
    actor: any,
    template: any,
    templateId: string,
    choices: PreResolvedChoices,
  ): Promise<any> {
    return await this.executeTemplatePlan(await this.planTemplateApply(actor, template, templateId, choices));
  }

  // Read/resolve phase (NO writes) — the INTERNAL dry-run surface (R6.2); verbatim head of the pre-Phase-6 _runTemplateApply (HC1).
  async planTemplateApply(
    actor: any,
    template: any,
    templateId: string,
    choices: PreResolvedChoices,
  ): Promise<TemplateApplyPlan> {
    const sys: any = (template as any).system;
    const rng = (): number => Math.random();
    const pick = <T,>(arr: T[]): T | undefined => (arr.length === 0 ? undefined : arr[Math.floor(rng() * arr.length)]);
    // --- name + characteristics (single update payload) ---
    const pre = (sys.alterName?.pre ?? '').trim();
    const post = (sys.alterName?.post ?? '').trim();
    const newName = `${pre} ${actor.name} ${post}`.trim().replace(/\s+/g, ' ');
    const updateData: Record<string, any> = {};
    // BUG-275: only write name fields when the template renames the actor; never write prototypeToken.name on a token delta (DataModelValidationError).
    if (newName !== actor.name) {
      updateData['name'] = newName;
      if (!actor.isToken) {
        updateData['prototypeToken.name'] = newName;
      }
    }
    const characteristicDeltas: Record<string, number> = {};
    const chars = sys.characteristics ?? {};
    for (const key of ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']) {
      const delta = chars[key];
      if (typeof delta === 'number' && delta !== 0) {
        characteristicDeltas[key] = delta;
        const current = Number(foundry.utils.getProperty(actor, `system.characteristics.${key}.advances`)) || 0;
        updateData[`system.characteristics.${key}.advances`] = current + delta;
      }
    }
    // --- skills: group collapse, spec expansion ---
    const skillList: Array<{ name: string; advances: number; group?: number | null; specialisations?: number | null }> =
      (sys.skills?.list ?? []).map((s: any) => ({ ...s }));

    // Group collapse: if multiple entries share a group, pick one (or honor override).
    const ungroupedSkills = skillList.filter(s => s.group == null);
    const skillGroupIds = Array.from(new Set(skillList.filter(s => s.group != null).map(s => String(s.group))));
    const collapsedSkillGroups: typeof skillList = [];
    for (const gid of skillGroupIds) {
      const members = skillList.filter(s => String(s.group) === gid);
      const override = choices.skillGroups?.[gid];
      const chosen = (override && members.find(m => m.name === override)) || pick(members);
      if (chosen) collapsedSkillGroups.push(chosen);
    }
    let resolvedSkills: typeof skillList = ungroupedSkills.concat(collapsedSkillGroups);

    // Spec expansion: skills with specialisations > 1 get expanded to N concrete skill entries.
    const specExpansions: typeof skillList = [];
    for (const s of resolvedSkills) {
      if ((s.specialisations ?? 0) > 1) {
        const overrides = choices.specialisations?.[s.name];
        let picks: string[];
        if (overrides && overrides.length === s.specialisations) {
          picks = overrides;
        } else {
          const allSkills: any[] = (await (globalThis as any).warhammer?.utility?.findAllItems?.('skill', 'Loading Skills')) ?? [];
          // BUG-278: dedupe candidates by name before the loop so used.size can reach
          // candidates.length and the break fires, preventing an infinite spin on duplicates.
          const seenNames = new Set<string>();
          const candidates = allSkills.filter((i: any) => {
            if (i.baseName !== s.name) return false;
            if (seenNames.has(i.name)) return false;
            seenNames.add(i.name);
            return true;
          });
          const used = new Set<string>();
          picks = [];
          while (picks.length < (s.specialisations ?? 1) && candidates.length > 0) {
            const c = pick(candidates);
            if (c && !used.has((c as any).name)) {
              used.add((c as any).name);
              picks.push((c as any).name);
            }
            if (used.size === candidates.length) break;
          }
        }
        for (const p of picks) {
          specExpansions.push({ name: p, advances: s.advances });
        }
      }
    }
    resolvedSkills = resolvedSkills
      .filter(s => !((s.specialisations ?? 0) > 1))
      .concat(specExpansions);
    // --- lore pick (BUG-051: hoisted above skills so `Channelling (Any)` can correlate) ---
    const loreList: Array<{ name: string; number: number }> = (sys.lores?.list ?? []).map((l: any) => ({ ...l }));
    const magicLoresConfig: Record<string, string> = (globalThis as any).game?.wfrp4e?.config?.magicLores ?? {};
    const loreDisplayValues = Object.values(magicLoresConfig) as string[];
    const resolvedLoreNames: string[] = [];
    for (let i = 0; i < loreList.length; i++) {
      const l = loreList[i]!;
      let name = l.name;
      if (name === '*') {
        const override = choices.lores?.[i];
        name = override || (loreDisplayValues.length > 0 ? (pick(loreDisplayValues) as string) : '');
      }
      resolvedLoreNames.push(name);
    }
    // --- trappings resolved BEFORE skills (BUG-051: weapon-group leaks into `Melee (Any)` spec) ---
    const trappingItems = await this.walkTrappingsTree(sys.trappings, actor, choices, resolvedSkills);
    const pickedWeaponGroups: string[] = [];
    for (const it of trappingItems) {
      const wg = foundry.utils.getProperty(it, 'system.weaponGroup.value');
      if (typeof wg === 'string' && wg.length > 0) pickedWeaponGroups.push(wg);
    }
    // --- resolve `(Any)` wildcards in skill names using lore + weapon-group context ---
    const resolveContext = { lores: resolvedLoreNames, weaponGroups: pickedWeaponGroups };
    const wildcardResolvedSkills: typeof resolvedSkills = resolvedSkills.map(s => ({
      ...s,
      name: this.resolveSkillWildcard(s.name, resolveContext, choices),
    }));
    // --- skill compendium lookup (wildcards now concrete) ---
    const skillItems: any[] = [];
    for (const s of wildcardResolvedSkills) {
      const found: any = await (globalThis as any).game?.wfrp4e?.utility?.findSkill?.(s.name);
      if (found) {
        const obj = found.toObject();
        foundry.utils.setProperty(obj, 'system.advances.value', s.advances);
        skillItems.push(obj);
      }
    }
    // --- talents: group collapse + multi-advance duplication ---
    const talentList: Array<{ name: string; advances: number; group?: number | null }> =
      (sys.talents?.list ?? []).map((t: any) => ({ ...t }));
    const ungroupedTalents = talentList.filter(t => t.group == null);
    const talentGroupIds = Array.from(new Set(talentList.filter(t => t.group != null).map(t => String(t.group))));
    const collapsedTalentGroups: typeof talentList = [];
    for (const gid of talentGroupIds) {
      const members = talentList.filter(t => String(t.group) === gid);
      const override = choices.talentGroups?.[gid];
      const chosen = (override && members.find(m => m.name === override)) || pick(members);
      if (chosen) collapsedTalentGroups.push(chosen);
    }
    const resolvedTalents = ungroupedTalents.concat(collapsedTalentGroups);

    const talentItems: any[] = [];
    for (const t of resolvedTalents) {
      const found: any = await (globalThis as any).game?.wfrp4e?.utility?.findTalent?.(t.name);
      if (!found) continue;
      const copies = Math.max(1, t.advances ?? 1);
      for (let i = 0; i < copies; i++) {
        talentItems.push(found.toObject());
      }
    }
    // --- spells (consumes already-picked resolvedLoreNames from above) ---
    const spellItems: any[] = [];
    if (loreList.length > 0) {
      const allSpells: any[] =
        (await (globalThis as any).warhammer?.utility?.findAllItems?.('spell', 'Loading Spells', true, ['system.lore.value'])) ?? [];

      for (let i = 0; i < loreList.length; i++) {
        const lore = loreList[i]!;
        const loreName = resolvedLoreNames[i] ?? '';

        const matching = allSpells.filter((s: any) => {
          const key = s.system?.lore?.value;
          const display = magicLoresConfig[key] ?? key;
          return display === loreName;
        });

        const overrideSpells = choices.spells?.[loreName];
        const picks: any[] = [];
        if (overrideSpells && overrideSpells.length > 0) {
          for (const name of overrideSpells.slice(0, lore.number)) {
            const m = matching.find((s: any) => s.name === name);
            if (m) picks.push(m);
          }
        } else {
          const pool = [...matching];
          for (let k = 0; k < lore.number && pool.length > 0; k++) {
            const idx = Math.floor(rng() * pool.length);
            const [chosen] = pool.splice(idx, 1);
            picks.push(chosen);
          }
        }

        for (const p of picks) {
          spellItems.push(p.toObject ? p.toObject() : p);
        }
      }
    }
    // --- traits (DiffReferenceListModel.awaitDocuments equivalent) ---
    const traitItems: any[] = [];
    const traitEntries: Array<{ uuid: string; diff?: Record<string, unknown> }> = sys.traits?.list ?? [];
    for (const entry of traitEntries) {
      const doc: any = await (globalThis as any).warhammer?.utility?.findItemId?.(entry.uuid);
      if (!doc) continue;
      const obj = doc.toObject();
      if (entry.diff && Object.keys(entry.diff).length > 0) {
        foundry.utils.mergeObject(obj, entry.diff);
      }
      traitItems.push(obj);
    }

    const allItems = [...skillItems, ...talentItems, ...spellItems, ...traitItems, ...trappingItems];

    // Serializable 2-write plan — no Foundry writes here (R6.2 dry-run-returns-plan).
    // BUG-242 / skipSpecialisationChoice (2026-05-19): suppresses the wfrp4e SkillModel._handleSpecialisationChoice
    // UI dialog (wfrp4e.js:28490-28518) that blocks server-side embed of a bare isSpec skill (e.g. "Channelling")
    // on an empty specifier. Concrete specifiers are unaffected. Travels in WRITE #2's options; MUST survive this split (HC1).
    const writes: TemplateWrite[] = [
      { op: 'actor.update', updateData, options: { skipExperienceChecks: true } },
      { op: 'createEmbeddedDocuments', documentType: 'Item', items: allItems, options: { fromTemplate: templateId, skipSpecialisationChoice: true } },
    ];

    return {
      actor,
      templateId,
      templateName: (template as any).name,
      newName,
      characteristicDeltas,
      writes,
    };
  }

  // Apply phase: WRITE #1 (actor.update) then WRITE #2 (createEmbeddedDocuments) in order, options preserved
  // verbatim (HC1 / BUG-242 skipSpecialisationChoice).
  async executeTemplatePlan(plan: TemplateApplyPlan): Promise<any> {
    const { actor, templateId, templateName, newName, characteristicDeltas } = plan;
    const updateWrite = plan.writes[0] as Extract<TemplateWrite, { op: 'actor.update' }>;
    const createWrite = plan.writes[1] as Extract<TemplateWrite, { op: 'createEmbeddedDocuments' }>;

    await actor.update(updateWrite.updateData, updateWrite.options as any);
    const created: any[] = (await (actor as any).createEmbeddedDocuments(
      createWrite.documentType,
      createWrite.items,
      createWrite.options,
    )) ?? [];

    notify.updated('actor', actor.name, { summary: `applied template ${templateName}`, uuid: (actor as any).uuid });

    return {
      success: true,
      actorId: actor.id,
      actorName: actor.name,
      templateId,
      templateName,
      applied: {
        name: newName,
        characteristics: characteristicDeltas,
        itemIds: created.map((i: any) => i.id),
        itemsByType: {
          skill: created.filter((i: any) => i.type === 'skill').length,
          talent: created.filter((i: any) => i.type === 'talent').length,
          spell: created.filter((i: any) => i.type === 'spell').length,
          trait: created.filter((i: any) => i.type === 'trait').length,
          trapping: created.filter((i: any) => !['skill', 'talent', 'spell', 'trait'].includes(i.type)).length,
        },
      },
    };
  }

  // Phase 12 R12.1: serialize a planTemplateApply() result for a dryRun preview (HC1: zero writes). Drops the
  // live `actor` Document (non-serializable) and projects the createEmbeddedDocuments items to {name,type}
  // summaries so the preview stays bounded (full item snapshots would bloat the wire by 10s of KB). The
  // `note` is load-bearing: planTemplateApply resolves unpinned group/specialisation/spell choices with
  // Math.random(), so an unconstrained dryRun shows ONE possible resolution — a later real apply may pick
  // differently unless preResolvedChoices pin every choice.
  private serializePlanPreview(plan: TemplateApplyPlan, actor: any): any {
    const updateWrite = plan.writes[0] as Extract<TemplateWrite, { op: 'actor.update' }>;
    const createWrite = plan.writes[1] as Extract<TemplateWrite, { op: 'createEmbeddedDocuments' }>;
    const plannedItems = (createWrite.items ?? []).map((i: any) => ({ name: i?.name, type: i?.type }));
    return {
      success: true,
      dryRun: true,
      actorId: actor.id,
      actorName: actor.name,
      templateId: plan.templateId,
      templateName: plan.templateName,
      newName: plan.newName,
      characteristicDeltas: plan.characteristicDeltas,
      writes: [
        { op: 'actor.update', updateData: updateWrite.updateData },
        { op: 'createEmbeddedDocuments', documentType: createWrite.documentType, itemCount: plannedItems.length, items: plannedItems },
      ],
      note: 'Preview only — no writes performed. Unconstrained group/specialisation/spell picks may resolve differently on a real apply unless pinned via preResolvedChoices.',
    };
  }

  // Accept either a full UUID (Compendium.pack.Item.id), a bare 16-char id, or a pack-qualified id.
  private async resolveTemplateDoc(uuidOrId: string): Promise<any> {
    if (!uuidOrId) return null;
    const util = (globalThis as any).warhammer?.utility;
    if (util?.findItemId) {
      const doc = await util.findItemId(uuidOrId);
      if (doc) return doc;
    }
    if (uuidOrId.startsWith('Compendium.') && (globalThis as any).fromUuid) {
      return await (globalThis as any).fromUuid(uuidOrId);
    }
    return null;
  }

  // BUG-051/052 — resolve wfrp4e `(Any)`/`( )`/`(*)` skill-spec wildcards (owb1 caster templates) to a
  // concrete specialisation, correlating with resolved lore (Channelling) + trapping weapon-group (Melee/
  // Ranged). Unrecognised bases pass through name-as-is (caller's findSkill may still resolve).
  private resolveSkillWildcard(
    name: string,
    context: { lores: string[]; weaponGroups: string[] },
    choices: { specialisations?: Record<string, string[]> | undefined } = {},
  ): string {
    // Matches empty-or-explicit-wildcard markers only; concrete " (Polearm)"/" (Aqshy)" pass through.
    const ANY_SUFFIX = /\s\((?:Any|\s*|\*)\)$/;
    if (!ANY_SUFFIX.test(name)) return name;

    const base = name.replace(ANY_SUFFIX, '');
    const config: any = (globalThis as any).game?.wfrp4e?.config ?? {};

    // Explicit preResolvedChoices override takes priority: specialisations["Melee (Any)"] = ["Basic"].
    const override = choices.specialisations?.[name]?.[0];
    if (override) return `${base} (${override})`;

    if (base === 'Channelling') {
      const lore = context.lores[0];
      if (lore) return `${base} (${lore})`;
      const lores = Object.values(config.magicLores ?? {}) as string[];
      if (lores.length > 0) return `${base} (${lores[Math.floor(Math.random() * lores.length)]})`;
      return name;
    }

    if (base === 'Melee' || base === 'Ranged') {
      const groupToType: Record<string, string> = config.groupToType ?? {};
      const type = base.toLowerCase();
      const ctxMatch = context.weaponGroups.find(g => groupToType[g] === type);
      const eligibleKeys = Object.keys(groupToType).filter(k => groupToType[k] === type);
      const chosenKey = ctxMatch
        ?? (eligibleKeys.length > 0 ? eligibleKeys[Math.floor(Math.random() * eligibleKeys.length)] : null);
      if (!chosenKey) return name;
      const label = chosenKey.charAt(0).toUpperCase() + chosenKey.slice(1);
      return `${base} (${label})`;
    }

    // Other wildcard bases (Entertain (Any), Language (Any), Play (Any), …) fall through unchanged.
    return name;
  }

  // Walk ChoiceModel.structure. "and" → recurse all; "or" → pick one (override or random with skill-weapon bias); "option" → resolve.
  private async walkTrappingsTree(
    trappings: any,
    parent: any,
    choices: any,
    resolvedSkills: Array<{ name: string }>,
  ): Promise<any[]> {
    if (!trappings?.structure || !Array.isArray(trappings.options)) return [];

    const optionsById = new Map<string, any>();
    for (const opt of trappings.options) optionsById.set(opt.id, opt);

    const skillSpecs = new Set(resolvedSkills.map(s => s.name));

    const resolveOption = async (option: any): Promise<any | null> => {
      if (!option) return null;
      if (option.type === 'filter') {
        const util = (globalThis as any).warhammer?.utility ?? (globalThis as any).game?.wfrp4e?.utility;
        const allItems: any[] = (await util?.findAllItems?.('weapon', 'Loading Weapons')) ?? [];
        const match = (item: any): boolean => {
          for (const f of option.filters ?? []) {
            const v = foundry.utils.getProperty(item, f.path);
            if (f.operation === '=' && v !== f.value) return false;
          }
          return true;
        };
        let candidates = allItems.filter(match);
        if (candidates.length === 0) {
          // Fallback: search any item type.
          const wider: any[] = (await util?.findAllItems?.('armour', 'Loading Armour')) ?? [];
          candidates = wider.filter(match);
        }
        if (candidates.length === 0) {
          const placeholderData = (globalThis as any).game?.wfrp4e?.config?.placeholderItemData ?? { type: 'trapping' };
          return foundry.utils.mergeObject({ name: option.name ?? 'Unknown' }, placeholderData);
        }
        const chosen: any = candidates[Math.floor(Math.random() * candidates.length)];
        return chosen.toObject ? chosen.toObject() : chosen;
      }
      if (option.type === 'placeholder') {
        const placeholderData = (globalThis as any).game?.wfrp4e?.config?.placeholderItemData ?? { type: 'trapping' };
        return foundry.utils.mergeObject({ name: option.name ?? 'Placeholder' }, placeholderData);
      }
      if (option.idType === 'id' || option.idType === 'uuid') {
        const doc: any = await (globalThis as any).warhammer?.utility?.findItemId?.(option.documentId);
        if (!doc) return null;
        const obj = doc.toObject ? doc.toObject() : doc;
        if (option.diff && Object.keys(option.diff).length > 0) {
          foundry.utils.mergeObject(obj, option.diff);
        }
        return obj;
      }
      if (option.idType === 'relative') {
        // BUG-264: relative documentId is "Type.id" (e.g. "ActiveEffect.xyz456") — split[0]=type, split[1]=id.
        const split = String(option.documentId ?? '').split('.');
        if (split[0] === 'ActiveEffect') {
          const eff = parent.effects?.get?.(split[1]);
          return eff?.toObject ? eff.toObject() : null;
        }
        const it = parent.items?.get?.(split[1]);
        return it?.toObject ? it.toObject() : null;
      }
      return null;
    };

    const pickOrBranch = (node: any): any | undefined => {
      const override = choices.trappings?.[node.id];
      if (override) {
        const overridden = node.options?.find((c: any) => c.id === override);
        if (overridden) return overridden;
      }
      // Skill-weapon correlation: prefer an OR branch whose filter weaponGroup matches a resolved skill spec.
      for (const child of node.options ?? []) {
        if (child.type !== 'option') continue;
        const opt = optionsById.get(child.id);
        if (!opt || opt.type !== 'filter') continue;
        const wg = (opt.filters ?? []).find((f: any) => f.path === 'system.weaponGroup.value');
        if (!wg) continue;
        const specSuffix = `(${String(wg.value).charAt(0).toUpperCase()}${String(wg.value).slice(1)})`;
        for (const specName of skillSpecs) {
          if (specName.endsWith(specSuffix)) return child;
        }
      }
      const opts = node.options ?? [];
      return opts[Math.floor(Math.random() * opts.length)];
    };

    const walk = async (node: any): Promise<any[]> => {
      if (!node) return [];
      if (node.type === 'option') {
        const opt = optionsById.get(node.id);
        const resolved = await resolveOption(opt);
        return resolved ? [resolved] : [];
      }
      if (node.type === 'and') {
        const out: any[] = [];
        for (const child of node.options ?? []) {
          out.push(...(await walk(child)));
        }
        return out;
      }
      if (node.type === 'or') {
        const chosen = pickOrBranch(node);
        return chosen ? await walk(chosen) : [];
      }
      return [];
    };

    return await walk(trappings.structure);
  }
}
