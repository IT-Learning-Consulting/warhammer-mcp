// services/psychology.ts — wfrp_layer_expansion_v1 Phase 13 (R16).
//
// Design B (Q&A-confirmed): reimplement applyFear's item-creation housekeeping directly
// instead of awaiting the live wfrp4e method. wfrp4e.js:13338-13348 shows applyFear
// creates the Fear extendedTest item via createEmbeddedDocuments, THEN fires the
// extended-test dialog-opening housekeeping call in an un-returned `.then()` — the
// method's own promise resolves before that dialog renders, but the dialog-opening call
// still pops a floating Cool-test dialog on the GM client with nothing to await/cancel
// it. The live Terror method is worse: it `await`s an internal skill-dialog setup call
// that resolves via `SkillDialog.awaitSubmit()` DIRECTLY in its own chain
// (wfrp4e.js:13351-13359), so awaiting it WOULD deadlock the MCP socket (ADR-10.1).
//
// This handler creates the same Fear item (read from `game.wfrp4e.config.systemItems.fear`
// at call time, not hardcoded, to minimize drift) and deliberately SKIPS the
// dialog-opening housekeeping call above — no dialog, no deadlock, DP-16-verifiable.
// `apply-terror` (mcp-server side) reuses this same query key — Terror always inflicts
// Fear — and layers Cool-test→ Broken guidance onto the returned string; the actual
// Broken write is a confirm-gated `apply-condition broken` call in the skill layer once
// the GM reports the sheet-rolled SL.

import { notify } from '../notify.js';

export class PsychologyService {
  constructor(private readonly validateState: () => void) {}

  async applyFear(data: { actorId: string; rating: number; sourceName: string }): Promise<any> {
    this.validateState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);

    const fearTemplate: any = (globalThis as any).game?.wfrp4e?.config?.systemItems?.fear;
    if (!fearTemplate) {
      throw new Error('APPLY_FEAR_TEMPLATE_MISSING: game.wfrp4e.config.systemItems.fear is unavailable');
    }
    const fear = (foundry as any).utils.duplicate(fearTemplate);
    fear.system.SL.target = data.rating;
    (foundry as any).utils.setProperty(fear, 'flags.wfrp4e.fearName', data.sourceName);

    // Deliberately not calling the extended-test dialog-opening housekeeping call here —
    // see file header (ADR-10.1 dialog-path guard).
    const created: any[] = await actor.createEmbeddedDocuments('Item', [fear], { condition: true });
    const createdId: string | undefined = created?.[0]?.id ?? created?.[0]?._id;

    // DP-16 post-write verify — re-read the item off the (now-updated) actor document.
    const verifyItem: any = createdId ? actor.items?.get(createdId) : undefined;
    const targetOk = verifyItem?.system?.SL?.target === data.rating;
    const nameOk = verifyItem?.flags?.wfrp4e?.fearName === data.sourceName;
    if (!verifyItem || !targetOk || !nameOk) {
      throw new Error(
        `APPLY_FEAR_NOT_PERSISTED: Fear item for ${actor.name} did not persist as expected ` +
          `(target=${data.rating}, source="${data.sourceName}")`,
      );
    }

    notify.created('item', verifyItem.name, {
      summary: `Fear ${data.rating} (${data.sourceName}) on ${actor.name}`,
      uuid: actor.uuid,
    });

    return {
      actorId: actor.id,
      fearItemId: verifyItem.id,
      itemName: verifyItem.name,
      rating: data.rating,
      sourceName: data.sourceName,
    };
  }
}
