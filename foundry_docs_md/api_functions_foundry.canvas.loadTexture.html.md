# loadTexture

```typescript
loadTexture(
    src: string,
    options?: { fallback?: string },
): null | Texture<Resource> | Spritesheet<ISpritesheetData>
```

Load a single asset and return a Promise which resolves once the asset is ready to use.

## Parameters

- **src**: `string`  
  The requested texture source. This may be a standard texture path or a "virtual texture" beginning with the `"#"` character that is retrieved from `canvas.sceneTextures`.

- **options?**: `{ fallback?: string } = {}`  
  Additional options which modify asset loading.

  - **fallback?**: `string`  
    A fallback texture URL to use if the requested source is unavailable.

## Returns

`null | Texture<Resource> | Spritesheet<ISpritesheetData>`  
The loaded Texture or sprite sheet, or `null` if loading failed with no fallback.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)