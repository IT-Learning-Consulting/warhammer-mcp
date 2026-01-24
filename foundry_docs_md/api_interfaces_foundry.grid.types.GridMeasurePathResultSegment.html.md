# GridMeasurePathResultSegment

A segment of [foundry.grid.types.GridMeasurePathResult](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html).

```typescript
interface GridMeasurePathResultSegment {
    cost: number;
    diagonals: number;
    distance: number;
    euclidean: number;
    from: GridMeasurePathResultWaypoint;
    spaces: number;
    to: GridMeasurePathResultWaypoint;
}
```

## Properties

- **cost**: `number`  
  The cost of the direct path ([foundry.grid.BaseGrid#getDirectPath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getdirectpath)) between the two waypoints.

- **diagonals**: `number`  
  The number of diagonals moved along this segment.

- **distance**: `number`  
  The distance travelled in grid units along this segment.

- **euclidean**: `number`  
  The Euclidean length of the straight line segment between the two waypoints.

- **from**: [`GridMeasurePathResultWaypoint`](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultWaypoint.html)  
  The waypoint that this segment starts from.

- **spaces**: `number`  
  The number of spaces moved along this segment.

- **to**: [`GridMeasurePathResultWaypoint`](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultWaypoint.html)  
  The waypoint that this segment goes to.