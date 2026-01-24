# AdventureImportResult

**Interface** AdventureImportResult  
A report of the world Document instances that were created or updated during the import process.

```typescript
interface AdventureImportResult {
    created: Record<string, Document<object, DocumentConstructionContext>[]>;
    updated: Record<string, Document<object, DocumentConstructionContext>[]>;
}
```

## Properties

- **created**: `Record<string, Document<object, DocumentConstructionContext>[]>`  
  Documents created as a result of the import, grouped by document name.

- **updated**: `Record<string, Document<object, DocumentConstructionContext>[]>`  
  Documents updated as a result of the import, grouped by document name.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

[Document class](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
[DocumentConstructionContext interface](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)