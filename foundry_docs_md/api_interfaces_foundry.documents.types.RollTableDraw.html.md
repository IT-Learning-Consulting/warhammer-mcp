# RollTableDraw | Foundry Virtual Tabletop - API Documentation - Version 13

An object containing the executed Roll and the produced results.

```typescript
interface RollTableDraw {
    results: documents.TableResult[];
    roll: Roll;
}
```

## Properties

- **results**: `documents.TableResult[]`  
  An array of drawn TableResult documents.

- **roll**: `Roll`  
  The Dice roll which generated the draw.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[foundry](https://foundryvtt.com/api/modules/foundry.html) / [documents](https://foundryvtt.com/api/modules/foundry.documents.html) / [types](https://foundryvtt.com/api/modules/foundry.documents.types.html) / [RollTableDraw](https://foundryvtt.com/api/interfaces/foundry.documents.types.RollTableDraw.html)