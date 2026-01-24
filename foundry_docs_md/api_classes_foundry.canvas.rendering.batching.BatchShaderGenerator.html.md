# BatchShaderGenerator

A batch shader generator that could handle extra uniforms during initialization.

## Class: BatchShaderGenerator

### Constructor Parameters

- **vertexSrc**  
  The vertex shader source

- **fragTemplate**  
  The fragment shader source template

- **uniforms**  
  Additional uniforms

---

### Methods

#### generateShader

```typescript
generateShader(maxTextures: any): Shader
```

**Parameters**

- **maxTextures**: `any`

**Returns**

- `Shader`

Overrides `PIXI.BatchShaderGenerator.generateShader`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [batching](https://foundryvtt.com/api/modules/foundry.canvas.rendering.batching.html) / [BatchShaderGenerator](https://foundryvtt.com/api/classes/foundry.canvas.rendering.batching.BatchShaderGenerator.html)