# CanvasViewPosition

```typescript
interface CanvasViewPosition {
    scale: number;
    x: number;
    y: number;
}
```

## Properties

- **scale**: *number*  
  The zoom level up to `CONFIG.Canvas.maxZoom` which becomes `stage.scale.x` and `stage.scale.y`.

- **x**: *number*  
  The x-coordinate which becomes `stage.pivot.x`.

- **y**: *number*  
  The y-coordinate which becomes `stage.pivot.y`.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)