# RegionTokenEnterExitEventData

```typescript
interface RegionTokenEnterExitEventData {
    movement: null | TokenMovementOperation;
    token: TokenDocument;
}
```

## Properties

- **movement**: `null | TokenMovementOperation`  
  The movement if the Token entered/exited by moving out of the Region.

- **token**: `TokenDocument`  
  The Token that entered/exited the Region.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[TokenMovementOperation](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementOperation.html)  
[TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)