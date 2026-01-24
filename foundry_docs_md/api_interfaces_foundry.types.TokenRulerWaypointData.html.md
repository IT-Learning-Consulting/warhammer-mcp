# TokenRulerWaypointData

Foundry Virtual Tabletop - API Documentation - Version 13  
<https://foundryvtt.com/api/interfaces/foundry.types.TokenRulerWaypointData.html>

```typescript
interface TokenRulerWaypointData {
    actionConfig: TokenMovementActionConfig;
    center: Point;
    hidden: boolean;
    index: number;
    measurement: GridMeasurePathResultWaypoint;
    movementId: null | string;
    next: null | TokenRulerWaypoint;
    previous: null | TokenRulerWaypoint;
    ray: null | Ray;
    size: { height: number; width: number };
    stage: "passed" | "pending" | "planned";
    unreachable: boolean;
}
```

## Properties

### actionConfig

**actionConfig**: [TokenMovementActionConfig](https://foundryvtt.com/api/interfaces/foundry.types.TokenMovementActionConfig.html)  
The config of the movement action.

### center

**center**: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
The center point of the Token at this waypoint.

### hidden

**hidden**: `boolean`  
Is this waypoint hidden?

### index

**index**: `number`  
The index of the waypoint, which is equal to the number of explicit waypoints from the first to this waypoint.

### measurement

**measurement**: [GridMeasurePathResultWaypoint](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResultWaypoint.html)  
The measurements at this waypoint.

### movementId

**movementId**: `null` | `string`  
The ID of movement, or null if planned movement.

### next

**next**: `null` | [TokenRulerWaypoint](https://foundryvtt.com/api/types/foundry.types.TokenRulerWaypoint.html)  
The next waypoint, if any.

### previous

**previous**: `null` | [TokenRulerWaypoint](https://foundryvtt.com/api/types/foundry.types.TokenRulerWaypoint.html)  
The previous waypoint, if any.

### ray

**ray**: `null` | [Ray](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Ray.html)  
The ray from the center point of previous to the center point of this waypoint, or null if there is no previous waypoint.

### size

**size**: `{ height: number; width: number }`  
The size of the Token in pixels at this waypoint.

### stage

**stage**: `"passed"` | `"pending"` | `"planned"`  
The stage this waypoint belongs to.

### unreachable

**unreachable**: `boolean`  
Is this waypoint unreachable?