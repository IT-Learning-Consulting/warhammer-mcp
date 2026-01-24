# GridMeasurePathResult

_A result of_ [`foundry.grid.BaseGrid#measurePath`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#measurepath).

```typescript
interface GridMeasurePathResult {
    cost: number;
    diagonals: number;
    distance: number;
    euclidean: number;
    segments: GridMeasurePathResultSegment[];
    spaces: number;
    waypoints: GridMeasurePathResultWaypoint[];
}
```

## Properties

- **cost**: `number`  
  The total cost of the direct path ([`foundry.grid.BaseGrid#getDirectPath`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getdirectpath)) through all waypoints.

- **diagonals**: `number`  
  The total number of diagonals moved along a direct path through all waypoints.

- **distance**: `number`  
  The total distance travelled along the path through all waypoints.

- **euclidean**: `number`  
  The total Euclidean length of the straight line path through all waypoints.

- **segments**: [`GridMeasurePathResultSegment`](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultSegment.html)[]  
  The measurements at each segment.

- **spaces**: `number`  
  The total number of spaces moved along a direct path through all waypoints. Moving from a grid space to any of its neighbors counts as 1 step. Always 0 in gridless grids.

- **waypoints**: [`GridMeasurePathResultWaypoint`](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultWaypoint.html)[]  
  The measurements at each waypoint.