# activateLayer | Foundry Virtual Tabletop - API Documentation - Version 13

### Function activateLayer

```typescript
activateLayer(layer: InteractionLayer): void
```

A hook event that fires when a [foundry.canvas.layers.InteractionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html) becomes active. The dispatched event name replaces "Layer" with the named InteractionLayer subclass, i.e. "activateTokensLayer".

**Parameters**

- **layer**: _InteractionLayer_  
  The layer becoming active

**Returns**  
_void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)