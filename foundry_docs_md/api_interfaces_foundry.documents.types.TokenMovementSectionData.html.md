# TokenMovementSectionData

```typescript
interface TokenMovementSectionData {
    cost: number;
    diagonals: number;
    distance: number;
    spaces: number;
    waypoints: TokenMeasuredMovementWaypoint[];
}
```

## Properties

- **cost**: `number`  
  The cost of the movement path

- **diagonals**: `number`  
  The number of diagonals moved along the path

- **distance**: `number`  
  The distance of the movement path

- **spaces**: `number`  
  The number of spaces moved along the path

- **waypoints**: [`TokenMeasuredMovementWaypoint`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html)[]  
  The waypoints of the movement path