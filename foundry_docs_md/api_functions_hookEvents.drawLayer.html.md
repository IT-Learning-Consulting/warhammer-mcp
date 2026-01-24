# drawLayer | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `drawLayer`

```typescript
drawLayer(layer: CanvasLayer): void
```

A hook event that fires when a `foundry.canvas.layers.CanvasLayer` is drawn. The dispatched event name replaces "Layer" with the named CanvasLayer subclass, i.e. `"drawTokensLayer"`.

#### Parameters

- **layer**: _CanvasLayer_  
  The layer being drawn

#### Returns

- _void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)