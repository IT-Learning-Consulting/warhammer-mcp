# returnCards | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `returnCards`

```typescript
returnCards(
    origin: documents.Cards,
    returned: documents.Card[],
    context: { fromDelete: object[]; toUpdate: Record<string, object[]> },
): void
```

A hook event that fires when Cards are dealt from a deck to other hands.

#### Parameters

- **origin**: `documents.Cards`  
  The origin Cards document.

- **returned**: `documents.Card[]`  
  The cards being returned.

- **context**: `{ fromDelete: object[]; toUpdate: Record<string, object[]> }`  
  Additional context which describes the operation.
  - **fromDelete**: `object[]`  
    Card deletion operations to be performed on the origin Cards document.
  - **toUpdate**: `Record<string, object[]>`  
    A mapping of Card deck IDs to the update operations that will be performed on them.

#### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)