# combatTurn | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `combatTurn`

```typescript
combatTurn(
    combat: documents.Combat,
    updateData: { round: number; turn: number },
    updateOptions: { advanceTime: number; direction: number },
): void
```

A hook event that fires when the turn of the Combat encounter changes. This event fires on the initiating client before any database update occurs.

#### Parameters

- **combat**: _documents.Combat_  
  The Combat encounter which is advancing or rewinding its turn.

- **updateData**: `{ round: number; turn: number }`  
  An object which contains Combat properties that will be updated. Can be mutated.
  - **round**: _number_  
    The current round of Combat.
  - **turn**: _number_  
    The new turn number.

- **updateOptions**: `{ advanceTime: number; direction: number }`  
  An object which contains options provided to the update method. Can be mutated.
  - **advanceTime**: _number_  
    The amount of time in seconds that time is being advanced.
  - **direction**: _number_  
    A signed integer for whether the turn order is advancing or rewinding.

#### Returns

- _void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)