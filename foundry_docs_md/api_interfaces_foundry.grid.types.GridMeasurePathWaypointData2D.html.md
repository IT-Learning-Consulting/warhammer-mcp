# GridMeasurePathWaypointData2D | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface GridMeasurePathWaypointData2D {
    cost?: number | GridMeasurePathCostFunction2D<{}>;
    measure?: boolean;
    teleport?: boolean;
}
```

## Properties

### Optional

- **cost?**: `number | GridMeasurePathCostFunction2D<{}>`  
  A predetermined cost (nonnegative) or cost function to be used instead of `options.cost`.

- **measure?**: `boolean`  
  Measure of the segment from the previous to this waypoint? The distance, cost, spaces, diagonals, and Euclidean length of a segment that is not measured are always 0.  
  Default: `true`.

- **teleport?**: `boolean`  
  Teleport to this waypoint?  
  Default: `false`.

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).

Links:  
- [GridMeasurePathCostFunction2D](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction2D.html)  
- [foundry.grid.types](https://foundryvtt.com/api/modules/foundry.grid.types.html)  
- [GridMeasurePathWaypointData2D Interface](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathWaypointData2D.html)