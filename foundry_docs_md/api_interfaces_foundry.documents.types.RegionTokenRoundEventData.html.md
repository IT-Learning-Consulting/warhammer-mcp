# RegionTokenRoundEventData

```typescript
interface RegionTokenRoundEventData {
    combat: documents.Combat;
    combatant: documents.Combatant;
    round: number;
    skipped: boolean;
    token: TokenDocument;
}
```

## Properties

- **combat**: [documents.Combat](https://foundryvtt.com/api/classes/foundry.documents.Combat.html)  
  The Combat

- **combatant**: [documents.Combatant](https://foundryvtt.com/api/classes/foundry.documents.Combatant.html)  
  The Combatant of the Token

- **round**: `number`  
  The round that started/ended

- **skipped**: `boolean`  
  Was the round skipped?

- **token**: [TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)  
  The Token