# TokenMovementWaypoint | Foundry Virtual Tabletop - API Documentation - Version 13

**Type Alias** `TokenMovementWaypoint`

```typescript
type TokenMovementWaypoint = Omit<
  TokenMeasuredMovementWaypoint,
  "terrain" | "intermediate" | "userId" | "movementId" | "cost"
>
```

This type alias omits the following properties from `TokenMeasuredMovementWaypoint`:

- **terrain**
- **intermediate**
- **userId**
- **movementId**
- **cost**

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).

Relevant links:
- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html)
- [foundry Module](https://foundryvtt.com/api/modules/foundry.html)
- [documents Module](https://foundryvtt.com/api/modules/foundry.documents.html)
- [types Submodule](https://foundryvtt.com/api/modules/foundry.documents.types.html)
- [TokenMovementWaypoint Type](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementWaypoint.html)
- [TokenMeasuredMovementWaypoint Interface](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html)