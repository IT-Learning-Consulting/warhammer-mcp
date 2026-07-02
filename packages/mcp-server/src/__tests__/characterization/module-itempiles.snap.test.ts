// Characterization snapshot — ModuleItempilesTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-contents (read), vault-info (read), create-pile (write), add-currency (write),
// transfer-items (write), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleItempilesTool } from '../../tools/modules/item-piles/item-piles.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleItempilesTool(makeToolDeps(mockReturn));

describe('ModuleItempilesTool — characterization', () => {
  it('get-contents — pile with items', async () => {
    const r = await tool({
      actorUuid: 'Actor.pile01',
      isValidPile: true,
      isContainer: true,
      isMerchant: false,
      isVault: false,
      isLocked: false,
      isClosed: false,
      isEmpty: false,
      itemCount: 2,
      items: [
        { name: 'Sword', type: 'weapon', quantity: 1, uuid: 'Actor.pile01.Item.sw1', id: 'sw1' },
        { name: 'Shield', type: 'weapon', quantity: 1, uuid: 'Actor.pile01.Item.sh1', id: 'sh1' },
      ],
      currencies: { gc: 0, ss: 5, bp: 3 },
      flagData: { type: 'container' },
    }).execute({ action: 'get-contents', actorUuid: 'Actor.pile01' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-contents — empty pile', async () => {
    const r = await tool({
      actorUuid: 'Actor.pile02',
      isValidPile: true,
      isContainer: true,
      isMerchant: false,
      isVault: false,
      isLocked: false,
      isClosed: false,
      isEmpty: true,
      itemCount: 0,
      items: [],
      currencies: { gc: 0, ss: 0, bp: 0 },
      flagData: { type: 'container' },
    }).execute({ action: 'get-contents', actorUuid: 'Actor.pile02' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('vault-info — grid data', async () => {
    const r = await tool({
      subAction: 'grid-data',
      actorUuid: 'Actor.vault01',
      gridData: {
        cols: 10,
        rows: 5,
        enabledCols: 10,
        enabledRows: 5,
        totalSpaces: 50,
        enabledSpaces: 50,
        freeSpaces: 47,
        items: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }],
        freeCells: Array.from({ length: 47 }, (_, i) => i),
      },
    }).execute({ action: 'vault-info', actorUuid: 'Actor.vault01', subAction: 'grid-data' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('create-pile — pile created', async () => {
    const r = await tool({
      type: 'container',
      tokenUuid: 'Scene.s.Token.pile01',
      actorUuid: 'Actor.pile01',
      sceneId: 'Scene.s',
      flagData: { type: 'container', enabled: true },
    }).execute({ action: 'create-pile', sceneId: 'Scene.s', type: 'container', position: { x: 100, y: 200 } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-currency — currency added', async () => {
    const r = await tool({
      actorUuid: 'Actor.pile01',
      currenciesAdded: '5ss 10bp',
      currentCurrencies: { gc: 0, ss: 5, bp: 10 },
    }).execute({ action: 'add-currency', actorUuid: 'Actor.pile01', currencies: '5ss 10bp' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // BUG-423 (XPK-01): fixtures below mirror the handler's NORMALIZED DTOs, which wrap the
  // true Item Piles API resolutions (transferItems → bare array; transferCurrencies →
  // boolean; tradeItems → {itemMoved}). Sourced from the foundry-module fixtures
  // (module-item-piles.test.ts makeRealItemPilesAPI) — never from formatter expectations.
  it('transfer-items — items transferred', async () => {
    const r = await tool({
      mode: 'transfer',
      sourceUuid: 'Actor.pile01',
      targetUuid: 'Actor.pc01',
      targetItemCount: 3,
      result: {
        ok: true,
        itemsTransferred: [{ id: 'sw1' }],
      },
    }).execute({ action: 'transfer-items', sourceUuid: 'Actor.pile01', targetUuid: 'Actor.pc01' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('transfer-currency — {itemDeltas, attributeDeltas} resolution (live-verified shape)', async () => {
    const r = await tool({
      mode: 'transfer',
      sourceUuid: 'Actor.pc01',
      targetUuid: 'Actor.pc02',
      sourceCurrencies: { gc: 1, ss: 2, bp: 0 },
      targetCurrencies: { gc: 0, ss: 10, bp: 4 },
      result: { ok: true, itemDeltas: [{ quantity: 5 }], attributeDeltas: {} },
    }).execute({ action: 'transfer-currency', sourceUuid: 'Actor.pc01', targetUuid: 'Actor.pc02', currencies: '5ss' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('transfer-currency — SILENT NO-OP (empty deltas) warns loudly (BUG-428)', async () => {
    const r = await tool({
      mode: 'transfer',
      sourceUuid: 'Actor.pc01',
      targetUuid: 'Actor.pc02',
      sourceCurrencies: { gc: 1, ss: 5, bp: 0 },
      targetCurrencies: {},
      result: { ok: false, itemDeltas: [], attributeDeltas: {} },
    }).execute({ action: 'transfer-currency', sourceUuid: 'Actor.pc01', targetUuid: 'Actor.pc02', currencies: '2ss' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('trade-items — {itemDeltas, attributeDeltas} resolution (live-verified shape)', async () => {
    const r = await tool({
      merchantUuid: 'Actor.merch01',
      buyerUuid: 'Actor.pc01',
      itemsTraded: 1,
      buyerCurrencies: { gc: 0, ss: 3, bp: 8 },
      buyerItemCount: 5,
      result: { ok: true, itemDeltas: [{ quantity: 1 }], attributeDeltas: {} },
    }).execute({ action: 'trade-items', merchantUuid: 'Actor.merch01', buyerUuid: 'Actor.pc01', items: [{ itemId: 'sw1', quantity: 1 }], confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-pile-state turnTokens — pileActorUuids echoed (BUG-420)', async () => {
    const r = await tool({
      state: 'turnTokens',
      tokenCount: 2,
      pileActorUuids: ['Scene.s.Token.t1.Actor.a1', 'Scene.s.Token.t2.Actor.a1'],
      result: ['Scene.s.Token.t1', 'Scene.s.Token.t2'],
    }).execute({ action: 'set-pile-state', state: 'turnTokens', tokenUuids: ['Scene.s.Token.t1', 'Scene.s.Token.t2'] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleItempilesTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: item-piles is not active'),
    ).execute({ action: 'get-contents', actorUuid: 'Actor.pile01' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
