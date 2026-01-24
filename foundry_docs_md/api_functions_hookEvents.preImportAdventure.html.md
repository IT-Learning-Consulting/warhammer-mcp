# preImportAdventure | Foundry Virtual Tabletop - API Documentation - Version 13

### Function preImportAdventure

```typescript
preImportAdventure(
    adventure: documents.Adventure,
    formData: object,
    toCreate: Record<string, object[]>,
    toUpdate: Record<string, object[]>,
): boolean | void
```

A hook event that fires when Adventure data is being prepared for import. Modules may return `false` from this hook to take over handling of the import workflow.

#### Parameters

- **adventure**: [documents.Adventure](https://foundryvtt.com/api/classes/foundry.documents.Adventure.html)  
  The Adventure document from which content is being imported.

- **formData**: `object`  
  Processed data from the importer form.

- **toCreate**: `Record<string, object[]>`  
  Adventure data which needs to be created in the World.

- **toUpdate**: `Record<string, object[]>`  
  Adventure data which needs to be updated in the World.

#### Returns

- `boolean` | `void`  
  Return `false` to prevent the core software from handling the import.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)