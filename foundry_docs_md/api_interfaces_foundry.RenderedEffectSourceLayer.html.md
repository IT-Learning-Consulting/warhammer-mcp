# RenderedEffectSourceLayer | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface RenderedEffectSourceLayer {
  active: boolean;
  mesh: PointSourceMesh;
  reset: boolean;
  shader: AdaptiveLightingShader;
  suppressed: boolean;
}
```

## Properties

- **active**: `boolean`  
  Is this layer actively rendered?

- **mesh**: [PointSourceMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.PointSourceMesh.html)  
  The rendered mesh for this layer

- **reset**: `boolean`  
  Do uniforms need to be reset?

- **shader**: [AdaptiveLightingShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html)  
  The shader instance used for the layer

- **suppressed**: `boolean`  
  Is this layer temporarily suppressed?