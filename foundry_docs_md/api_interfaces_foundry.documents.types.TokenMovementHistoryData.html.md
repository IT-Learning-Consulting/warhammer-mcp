# TokenMovementHistoryData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenMovementHistoryData {
    cost: number;
    diagonals: number;
    distance: number;
    recorded: TokenMovementSectionData;
    spaces: number;
    unrecorded: TokenMovementHistoryData;
}
```

## Properties

- **cost**: `number`  
  The cost of the combined movement path

- **diagonals**: `number`  
  The number of diagonals moved along the combined path

- **distance**: `number`  
  The distance of the combined movement path

- **recorded**: [`TokenMovementSectionData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMovementSectionData.html)  
  The recorded waypoints of the movement path

- **spaces**: `number`  
  The number of spaces moved along the combined path

- **unrecorded**: [`TokenMovementHistoryData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMovementHistoryData.html)  
  The unrecorded waypoints of the movement path

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)