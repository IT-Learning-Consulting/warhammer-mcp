# AdventureImportData

The data that is planned to be imported for the adventure, categorized into new documents that will be created and existing documents that will be updated.

```typescript
interface AdventureImportData {
    documentCount: number;
    toCreate: Record<string, object[]>;
    toUpdate: Record<string, object[]>;
}
```

## Properties

- **documentCount**: `number`  
  The total count of documents to import

- **toCreate**: `Record<string, object[]>`  
  Arrays of document data to create, organized by document name

- **toUpdate**: `Record<string, object[]>`  
  Arrays of document data to update, organized by document name

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)