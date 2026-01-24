# combatTurnChange | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `combatTurnChange`

```typescript
combatTurnChange(
    combat: documents.Combat,
    prior: CombatHistoryData,
    current: CombatHistoryData
): void
```

A hook event which fires when the turn order of a Combat encounter is progressed. This event fires on all clients after the database update has occurred for the Combat.

**Parameters**

- **combat**: [documents.Combat](https://foundryvtt.com/api/classes/foundry.documents.Combat.html)  
  The Combat encounter for which the turn order has changed

- **prior**: [CombatHistoryData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CombatHistoryData.html)  
  The prior turn state

- **current**: [CombatHistoryData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CombatHistoryData.html)  
  The new turn state

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)