# preMoveToken | Foundry Virtual Tabletop - API Documentation - Version 13

### Function preMoveToken

```typescript
preMoveToken(
    document: TokenDocument,
    movement: DeepReadonly<TokenMovementOperation>,
    operation: Partial<DatabaseUpdateOperation>,
): boolean | void
```

A hook event that fires for every Token document that is about to be moved before the conclusion of an update workflow. This hook only fires for the client who is initiating the update request. The waypoints of the movement are final and cannot be changed. The movement can only be rejected entirely by explicitly returning false.

**Parameters**

- **document**: [TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)  
  The existing Document which was updated

- **movement**: `DeepReadonly<TokenMovementOperation>`  
  The pending movement of the Token

- **operation**: `Partial<DatabaseUpdateOperation>`  
  The update operation that contains the movement  
  ([DatabaseUpdateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html))

**Returns**  
`boolean | void`  
If false, the movement is prevented

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)