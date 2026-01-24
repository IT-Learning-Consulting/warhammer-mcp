# tearDownLayer | Foundry Virtual Tabletop - API Documentation - Version 13

### Function tearDownLayer

```typescript
tearDownLayer(layer: CanvasLayer): void
```

A hook event that fires when a [foundry.canvas.layers.CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html) is deconstructed. The dispatched event name replaces "Layer" with the named CanvasLayer subclass, i.e. "tearDownTokensLayer".

**Parameters**

- **layer**: _CanvasLayer_  
  The layer being deconstructed

**Returns**  
_void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)