# RulerWaypoint

```typescript
interface RulerWaypoint {
    elevation: number;
    index: number;
    measurement: GridMeasurePathResultWaypoint;
    next: null | RulerWaypoint;
    previous: null | RulerWaypoint;
    ray: null | Ray;
    x: number;
    y: number;
}
```

## Properties

- **elevation**: `number`  
  The elevation in grid units.

- **index**: `number`  
  The index of the waypoint.

- **measurement**: [GridMeasurePathResultWaypoint](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultWaypoint.html)  
  The measurements at this waypoint.

- **next**: `null` | [RulerWaypoint](https://foundryvtt.com/api/interfaces/foundry.types.RulerWaypoint.html)  
  The next waypoint, if any.

- **previous**: `null` | [RulerWaypoint](https://foundryvtt.com/api/interfaces/foundry.types.RulerWaypoint.html)  
  The previous waypoint, if any.

- **ray**: `null` | [Ray](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Ray.html)  
  The ray from the center point of the previous waypoint to the center point of this waypoint, or null if there is no previous waypoint.

- **x**: `number`  
  The x-coordinate in pixels.

- **y**: `number`  
  The y-coordinate in pixels.