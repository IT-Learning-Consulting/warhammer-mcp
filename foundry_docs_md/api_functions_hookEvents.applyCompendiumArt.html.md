# applyCompendiumArt | Foundry Virtual Tabletop - API Documentation - Version 13

### Function applyCompendiumArt

```typescript
applyCompendiumArt(
    documentClass: typeof Document,
    source: object,
    pack: CompendiumCollection,
    art: CompendiumArtInfo
): void
```

A hook event that fires when package-provided art is applied to a compendium Document.

**Parameters**

- **documentClass**: `typeof Document`  
  The Document class.

- **source**: `object`  
  The Document's source data.

- **pack**: `CompendiumCollection`  
  The Document's compendium.

- **art**: `CompendiumArtInfo`  
  The art being applied.

**Returns** `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)