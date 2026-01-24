# moveToken

## Function moveToken

```typescript
moveToken(
    document: TokenDocument,
    movement: DeepReadonly<TokenMovementOperation>,
    operation: Partial<DatabaseUpdateOperation>,
    user: documents.User,
): void
```

A hook event that fires for every Token document that was moved after conclusion of an update workflow. This hook fires for all connected clients after the update has been processed.

### Parameters

- **document**: [TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)  
  The existing TokenDocument which was updated
- **movement**: `DeepReadonly<TokenMovementOperation>`  
  The movement of the Token
- **operation**: `Partial<[DatabaseUpdateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html)>`  
  The update operation that contains the movement
- **user**: [documents.User](https://foundryvtt.com/api/modules/foundry.documents.html).[User](https://foundryvtt.com/api/classes/foundry.documents.User.html)  
  The User that requested the update operation

### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)