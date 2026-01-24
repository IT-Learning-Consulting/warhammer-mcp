# TokenMovementData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenMovementData {
  autoRotate: boolean;
  chain: string[];
  constrainOptions: Omit<
    TokenConstrainMovementPathOptions,
    "history" | "preview"
  >;
  destination: TokenPosition;
  history: TokenMovementHistoryData;
  id: string;
  method: TokenMovementMethod;
  origin: TokenPosition;
  passed: TokenMovementSectionData;
  pending: TokenMovementSectionData;
  recorded: boolean;
  showRuler: boolean;
  state: TokenMovementState;
  updateOptions: object;
  user: documents.User;
}
```

## Properties

- **autoRotate**: `boolean`  
  Automatically rotate the token in the direction of movement?

- **chain**: `string[]`  
  The chain of prior movement IDs that this movement is a continuation of

- **constrainOptions**: `Omit<TokenConstrainMovementPathOptions, "history" | "preview">`  
  The options to constrain movement  
  See [TokenConstrainMovementPathOptions](https://foundryvtt.com/api/interfaces/foundry.types.TokenConstrainMovementPathOptions.html)

- **destination**: [`TokenPosition`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenPosition.html)  
  The destination of movement

- **history**: [`TokenMovementHistoryData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMovementHistoryData.html)  
  The waypoints and measurements of the history path

- **id**: `string`  
  The ID of the movement

- **method**: [`TokenMovementMethod`](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementMethod.html)  
  The method of movement

- **origin**: [`TokenPosition`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenPosition.html)  
  The origin of movement

- **passed**: [`TokenMovementSectionData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMovementSectionData.html)  
  The waypoints and measurements of the passed path

- **pending**: [`TokenMovementSectionData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMovementSectionData.html)  
  The waypoints and measurements of the pending path

- **recorded**: `boolean`  
  Was the movement recorded in the movement history?

- **showRuler**: `boolean`  
  Show the ruler during the movement animation of the token?

- **state**: [`TokenMovementState`](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementState.html)  
  The state of the movement

- **updateOptions**: `object`  
  The update options of the movement operation

- **user**: [`documents.User`](https://foundryvtt.com/api/classes/foundry.documents.User.html)  
  The user that moved the token