# AdventurePreImportCallback

**Module:** [foundry.documents.types](https://foundryvtt.com/api/modules/foundry.documents.types.html)  
**API Documentation:** [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

---

### Type Alias AdventurePreImportCallback

```typescript
(data: AdventureImportData, options: AdventureImportOptions) => Promise<void>
```

A callback function that is invoked and awaited during import data preparation before the adventure import proceeds. This can be used to perform custom pre-processing on the import data.

#### Parameters

- **data**: [AdventureImportData](https://foundryvtt.com/api/interfaces/foundry.documents.types.AdventureImportData.html)  
- **options**: [AdventureImportOptions](https://foundryvtt.com/api/interfaces/foundry.documents.types.AdventureImportOptions.html)

#### Returns

- `Promise<void>`