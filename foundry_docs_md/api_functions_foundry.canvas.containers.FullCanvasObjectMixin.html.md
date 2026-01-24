# FullCanvasObjectMixin | Foundry Virtual Tabletop - API Documentation - Version 13

### Function FullCanvasObjectMixin

```typescript
FullCanvasObjectMixin(Base: typeof DisplayObject): any
```

Augment any `PIXI.DisplayObject` to assume bounds that are always aligned with the full visible screen. The bounds of this container do not depend on its children but always fill the entire canvas.

**Parameters**

- **Base**: `typeof DisplayObject`  
  Any `PIXI.DisplayObject` subclass

**Returns**  
`any`  
The decorated subclass with full canvas bounds

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)