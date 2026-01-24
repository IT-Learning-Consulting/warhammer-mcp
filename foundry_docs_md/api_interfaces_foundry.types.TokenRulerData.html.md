# TokenRulerData

Interface **TokenRulerData**

```typescript
interface TokenRulerData {
    passedWaypoints: TokenMeasuredMovementWaypoint[];
    pendingWaypoints: TokenMeasuredMovementWaypoint[];
    plannedMovement: { [userId: string]: TokenPlannedMovement };
}
```

## Properties

- **passedWaypoints**: [TokenMeasuredMovementWaypoint](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html)[]
  
  The waypoints that were already passed by the Token

- **pendingWaypoints**: [TokenMeasuredMovementWaypoint](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html)[]
  
  The waypoints that the Token will try to move to next

- **plannedMovement**: { [userId: string]: [TokenPlannedMovement](https://foundryvtt.com/api/interfaces/foundry.types.TokenPlannedMovement.html) }
  
  Movement planned by Users

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)