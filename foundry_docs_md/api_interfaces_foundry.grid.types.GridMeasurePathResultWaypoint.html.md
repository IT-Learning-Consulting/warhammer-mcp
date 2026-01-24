# GridMeasurePathResultWaypoint

A waypoint of [foundry.grid.types.GridMeasurePathResult](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html).

```typescript
interface GridMeasurePathResultWaypoint {
    backward: null | GridMeasurePathResultSegment;
    cost: number;
    diagonals: number;
    distance: number;
    euclidean: number;
    forward: null | GridMeasurePathResultSegment;
    spaces: number;
}
```

## Properties

- **backward**: `null` | [GridMeasurePathResultSegment](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultSegment.html)  
  The segment from the previous waypoint to this waypoint.

- **cost**: `number`  
  The total cost of the direct path ([foundry.grid.BaseGrid#getDirectPath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getdirectpath)) up to this waypoint.

- **diagonals**: `number`  
  The total number of diagonals moved along a direct path up to this waypoint.

- **distance**: `number`  
  The total distance travelled along the path up to this waypoint.

- **euclidean**: `number`  
  The total Euclidean length of the straight line path up to this waypoint.

- **forward**: `null` | [GridMeasurePathResultSegment](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultSegment.html)  
  The segment from this waypoint to the next waypoint.

- **spaces**: `number`  
  The total number of spaces moved along a direct path up to this waypoint.