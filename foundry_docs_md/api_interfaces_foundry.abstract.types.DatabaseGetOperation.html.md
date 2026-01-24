# Interface DatabaseGetOperation

```typescript
interface DatabaseGetOperation {
    action: "get";
    broadcast?: false;
    index?: boolean;
    indexFields?: string[];
    pack?: null | string;
    parent?: null | Document<object, DocumentConstructionContext>;
    parentUuid?: string;
    query: Record<string, any>;
}
```

## Properties

- **action**: `"get"`  
  The action of this database operation.

- **broadcast?**: `false` (optional)  
  Get requests are never broadcast.

- **index?**: `boolean` (optional)  
  Return indices only instead of full Document records.

- **indexFields?**: `string[]` (optional)  
  An array of field identifiers which should be indexed.

- **pack?**: `null | string` (optional)  
  A compendium collection ID which contains the Documents.

- **parent?**: `null | Document<object, DocumentConstructionContext>` (optional)  
  A parent Document within which Documents are embedded.  
  See [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html) and [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html).

- **parentUuid?**: `string` (optional)  
  A parent Document UUID provided when the parent instance is unavailable.

- **query**: `Record<string, any>`  
  A query object which identifies the set of Documents retrieved.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)