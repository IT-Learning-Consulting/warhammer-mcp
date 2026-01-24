# importAdventure

## Function importAdventure

```typescript
importAdventure(
    adventure: documents.Adventure,
    formData: object,
    created: Record<string, Document<object, DocumentConstructionContext>>[],
    updated: Record<string, Document<object, DocumentConstructionContext>>[],
): void
```

A hook event that fires after an Adventure has been imported into the World.

### Parameters

- **adventure**: [documents.Adventure](https://foundryvtt.com/api/classes/foundry.documents.Adventure.html)  
  The Adventure document from which content is being imported

- **formData**: `object`  
  Processed data from the importer form

- **created**: `Record<string, Document<object, DocumentConstructionContext>>[]`  
  Documents which were created in the World

- **updated**: `Record<string, Document<object, DocumentConstructionContext>>[]`  
  Documents which were updated in the World

### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)