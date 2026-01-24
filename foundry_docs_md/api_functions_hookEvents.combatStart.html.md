# combatStart

## Function combatStart

```typescript
combatStart(
    combat: documents.Combat,
    updateData: { round: number; turn: number },
): void
```

A hook event that fires when a Combat encounter is started. This event fires on the initiating client before any database update occurs.

### Parameters

- **combat**: `documents.Combat`  
  The Combat encounter which is starting.

- **updateData**: `{ round: number; turn: number }`  
  An object which contains Combat properties that will be updated. Can be mutated.
  - **round**: `number`  
    The initial round.
  - **turn**: `number`  
    The initial turn.

### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)