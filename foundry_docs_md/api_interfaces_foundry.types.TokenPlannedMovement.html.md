# TokenPlannedMovement | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenPlannedMovement {
    foundPath: Omit<TokenMeasuredMovementWaypoint, "userId" | "movementId">[];
    hidden: boolean;
    history: TokenMeasuredMovementWaypoint[];
    searching: boolean;
    unreachableWaypoints: Omit<TokenMeasuredMovementWaypoint, "userId" | "movementId">[];
}
```

## Properties

### foundPath

- **Type:** `Omit<TokenMeasuredMovementWaypoint, "userId" | "movementId">[]`

The found path, which goes through all but the unreachable waypoints.

### hidden

- **Type:** `boolean`

Is the path hidden?

### history

- **Type:** `TokenMeasuredMovementWaypoint[]`

The movement history.

### searching

- **Type:** `boolean`

Is the pathfinding still in progress?

### unreachableWaypoints

- **Type:** `Omit<TokenMeasuredMovementWaypoint, "userId" | "movementId">[]`

The unreachable waypoints, which are those that are not reached by the found path.

---

TokenMeasuredMovementWaypoint interface details can be found [here](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html).

Foundry Virtual Tabletop - API Documentation - Version 13:  
[https://foundryvtt.com/api/index.html](https://foundryvtt.com/api/index.html)