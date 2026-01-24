# Interface OccludableBatchData

The batch data that is needed by [foundry.canvas.rendering.shaders.OccludableSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html) to render an element with batching.

```typescript
interface OccludableBatchData {
    _texture: Texture<Resource>;
    _tintRGB: number;
    blendMode: number;
    elevation: number;
    fadeOcclusion: number;
    indices: number[] | Uint16Array | Uint32Array;
    occludedAlpha: number;
    radialOcclusion: number;
    unoccludedAlpha: number;
    uvs: Float32Array;
    vertexData: Float32Array;
    visionOcclusion: number;
    worldAlpha: number;
}
```

## Properties

- **_texture**: `Texture<Resource>`  
  The texture.

- **_tintRGB**: `number`  
  The tint.

- **blendMode**: `number`  
  The blend mode.

- **elevation**: `number`  
  The elevation.

- **fadeOcclusion**: `number`  
  The amount of FADE occlusion.

- **indices**: `number[] | Uint16Array | Uint32Array`  
  The indices.

- **occludedAlpha**: `number`  
  The occluded alpha.

- **radialOcclusion**: `number`  
  The amount of RADIAL occlusion.

- **unoccludedAlpha**: `number`  
  The unoccluded alpha.

- **uvs**: `Float32Array`  
  The texture UVs.

- **vertexData**: `Float32Array`  
  The vertices.

- **visionOcclusion**: `number`  
  The amount of VISION occlusion.

- **worldAlpha**: `number`  
  The world alpha.


[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)