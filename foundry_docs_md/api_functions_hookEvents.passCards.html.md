# passCards | Foundry Virtual Tabletop - API Documentation - Version 13

## Function passCards

```typescript
passCards(
    origin: documents.Cards,
    destination: documents.Cards,
    context: {
        action: string;
        fromDelete: object[];
        fromUpdate: object[];
        toCreate: object[];
        toUpdate: object[];
    },
): void
```

A hook event that fires when Cards are passed from one stack to another.

### Parameters

- **origin**: `documents.Cards`  
  The origin Cards document

- **destination**: `documents.Cards`  
  The destination Cards document

- **context**:  
  Additional context which describes the operation
  - **action**: `string`  
    The action name being performed, i.e. "pass", "play", "discard", "draw"
  - **fromDelete**: `object[]`  
    Card deletion operations to be performed in the origin Cards document
  - **fromUpdate**: `object[]`  
    Card update operations to be performed in the origin Cards document
  - **toCreate**: `object[]`  
    Card creation operations to be performed in the destination Cards document
  - **toUpdate**: `object[]`  
    Card update operations to be performed in the destination Cards document

### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)