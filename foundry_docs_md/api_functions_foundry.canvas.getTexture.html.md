# getTexture | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
getTexture(
    src: string,
): null | Texture<Resource> | Spritesheet<ISpritesheetData>
```

Get a single texture or sprite sheet from the cache.

### Parameters

- **src**: *string*  
  The texture path to load. This may be a standard texture path or a "virtual texture" beginning with the `#` character that is retrieved from `canvas.sceneTextures`.

### Returns

`null` | `Texture<Resource>` | `Spritesheet<ISpritesheetData>`  
A texture, a sprite sheet, or `null` if not found in cache.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)