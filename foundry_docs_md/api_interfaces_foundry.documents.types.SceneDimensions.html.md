# SceneDimensions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface SceneDimensions {
    columns: number;
    distance: number;
    distancePixels: number;
    height: number;
    maxR: number;
    ratio: number;
    rect: Rectangle;
    rows: number;
    sceneHeight: number;
    sceneRect: Rectangle;
    sceneWidth: number;
    sceneX: number;
    sceneY: number;
    size: number;
    units: string;
    width: number;
}
```

## Properties

- **columns**: `number`  
  The number of grid columns on the canvas.

- **distance**: `number`  
  The number of distance units in a single grid space.

- **distancePixels**: `number`  
  The factor to convert distance units to pixels.

- **height**: `number`  
  The height of the canvas.

- **maxR**: `number`  
  The length of the longest line that can be drawn on the canvas.

- **ratio**: `number`  
  The aspect ratio of the scene rectangle.

- **rect**: `Rectangle`  
  The canvas rectangle.

- **rows**: `number`  
  The number of grid rows on the canvas.

- **sceneHeight**: `number`  
  The height of the scene.

- **sceneRect**: `Rectangle`  
  The scene rectangle.

- **sceneWidth**: `number`  
  The width of the scene.

- **sceneX**: `number`  
  The X coordinate of the scene rectangle within the larger canvas.

- **sceneY**: `number`  
  The Y coordinate of the scene rectangle within the larger canvas.

- **size**: `number`  
  The grid size.

- **units**: `string`  
  The units of distance.

- **width**: `number`  
  The width of the canvas.

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).