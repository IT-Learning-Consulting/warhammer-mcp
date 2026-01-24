# dealCards

## Function dealCards

```typescript
dealCards(
    origin: documents.Cards,
    destinations: documents.Cards[],
    context: {
        action: string;
        fromDelete: object[];
        fromUpdate: object[];
        toCreate: object[];
    },
): void
```

A hook event that fires when Cards are dealt from a deck to other hands.

### Parameters

- **origin**: `documents.Cards`  
  The origin Cards document

- **destinations**: `documents.Cards[]`  
  An array of destination Cards documents

- **context**:  
  Additional context which describes the operation
  - **action**: `string`  
    The action name being performed, i.e. "deal", "pass"
  - **fromDelete**: `object[]`  
    Card deletion operations to be performed in the origin Cards document
  - **fromUpdate**: `object[]`  
    Card update operations to be performed in the origin Cards document
  - **toCreate**: `object[]`  
    An array of Card creation operations to be performed in each destination Cards document

### Returns

- `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)