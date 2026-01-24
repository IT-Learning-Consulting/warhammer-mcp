# TokenTerrainMovementWaypoint | Foundry Virtual Tabletop - API Documentation - Version 13

**Type Alias** `TokenTerrainMovementWaypoint`

```typescript
type TokenTerrainMovementWaypoint = Omit<
  TokenMeasuredMovementWaypoint,
  "userId" | "movementId" | "cost"
>;
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

---

- `TokenMeasuredMovementWaypoint`: [TokenMeasuredMovementWaypoint](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html)  
- `Omit`: Utility type to exclude the specified keys `"userId"`, `"movementId"`, and `"cost"` from `TokenMeasuredMovementWaypoint`.