# GridMeasurePathWaypointData3D

Interface **GridMeasurePathWaypointData3D**

```typescript
interface GridMeasurePathWaypointData3D {
    cost?: number | GridMeasurePathCostFunction3D<{}>;
    measure?: boolean;
    teleport?: boolean;
}
```

## Properties

### Optional

- **cost?**: `number` | [GridMeasurePathCostFunction3D](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction3D.html)<`{}`>
  
  A predetermined cost (nonnegative) or cost function to be used instead of `options.cost`.

- **measure?**: `boolean`
  
  Measure of the segment from the previous to this waypoint? The distance, cost, spaces, diagonals, and Euclidean length of a segment that is not measured are always 0.  
  Default: `true`.

- **teleport?**: `boolean`
  
  Teleport to this waypoint?  
  Default: `false`.

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).