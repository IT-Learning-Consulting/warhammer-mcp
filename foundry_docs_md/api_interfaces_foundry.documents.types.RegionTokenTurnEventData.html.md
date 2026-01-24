# RegionTokenTurnEventData

```typescript
interface RegionTokenTurnEventData {
    combat: documents.Combat;
    combatant: documents.Combatant;
    round: number;
    skipped: boolean;
    token: TokenDocument;
    turn: number;
}
```

## Properties

- **combat**: [documents.Combat](https://foundryvtt.com/api/classes/foundry.documents.Combat.html)  
  The Combat.

- **combatant**: [documents.Combatant](https://foundryvtt.com/api/classes/foundry.documents.Combatant.html)  
  The Combatant of the Token that started/ended its Combat turn.

- **round**: `number`  
  The round of this turn.

- **skipped**: `boolean`  
  Was the turn skipped?

- **token**: [TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)  
  The Token that started/ended its Combat turn.

- **turn**: `number`  
  The turn that started/ended.