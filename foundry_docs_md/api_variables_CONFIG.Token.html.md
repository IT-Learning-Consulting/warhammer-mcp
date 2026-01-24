# Token | Foundry Virtual Tabletop - API Documentation - Version 13

**Token**:  
```typescript
{
  adjectivesPrefix: string;
  documentClass: typeof TokenDocument;
  hudClass: typeof TokenHUD;
  layerClass: typeof TokenLayer;
  movement: {
    actions: { [action: string]: Partial<TokenMovementActionConfig> };
    defaultAction: string;
    defaultSpeed: number;
    TerrainData: typeof BaseTerrainData;
  };
  objectClass: typeof canvas.placeables.Token;
  prototypeSheetClass: typeof PrototypeTokenConfig;
  ring: TokenRingConfig;
  rulerClass: typeof TokenRuler;
} = ...
```

Configuration for the Token embedded document type and its representation on the game [Canvas](https://foundryvtt.com/api/modules/foundry.canvas.html).

---

## Type declaration

- **adjectivesPrefix**: `string`
- **documentClass**: `typeof [TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)`
- **hudClass**: `typeof [TokenHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.TokenHUD.html)`
- **layerClass**: `typeof [TokenLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TokenLayer.html)`

### movement

- **actions**:  
  `{ [action: string]: Partial<[TokenMovementActionConfig](https://foundryvtt.com/api/interfaces/foundry.types.TokenMovementActionConfig.html)> }`
- **defaultAction**: `string`
- **defaultSpeed**: `number`  
  The default movement animation speed in grid spaces per second.
- **TerrainData**: `typeof [BaseTerrainData](https://foundryvtt.com/api/classes/foundry.data.BaseTerrainData.html)`

---

- **objectClass**: `typeof canvas.placeables.[Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html)`
- **prototypeSheetClass**: `typeof [PrototypeTokenConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.PrototypeTokenConfig.html)`
- **ring**: `[TokenRingConfig](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.TokenRingConfig.html)`
- **rulerClass**: `typeof [TokenRuler](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.TokenRuler.html)`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)