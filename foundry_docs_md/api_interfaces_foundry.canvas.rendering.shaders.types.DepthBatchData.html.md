# DepthBatchData | Foundry Virtual Tabletop - API Documentation - Version 13

The batch data that is needed by [foundry.canvas.rendering.shaders.DepthSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.DepthSamplerShader.html) to render an element with batching.

```typescript
interface DepthBatchData {
    _texture: Texture<Resource>;
    elevation: number;
    fadeOcclusion: number;
    indices: number[] | Uint16Array | Uint32Array;
    radialOcclusion: number;
    textureAlphaThreshold: number;
    uvs: Float32Array;
    vertexData: Float32Array;
    visionOcclusion: number;
}
```

## Properties

### **_texture**

- **Type:** `Texture<Resource>`

The texture

### **elevation**

- **Type:** `number`

The elevation

### **fadeOcclusion**

- **Type:** `number`

The amount of FADE occlusion

### **indices**

- **Type:** `number[] | Uint16Array | Uint32Array`

The indices

### **radialOcclusion**

- **Type:** `number`

The amount of RADIAL occlusion

### **textureAlphaThreshold**

- **Type:** `number`

The texture alpha threshold

### **uvs**

- **Type:** `Float32Array`

The texture UVs

### **vertexData**

- **Type:** `Float32Array`

The vertices

### **visionOcclusion**

- **Type:** `number`

The amount of VISION occlusion

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)