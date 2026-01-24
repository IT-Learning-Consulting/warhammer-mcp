# AdventurePostImportCallback | Foundry Virtual Tabletop - API Documentation - Version 13

A callback function that is invoked and awaited after import but before the overall import workflow concludes. This can be used to perform additional custom adventure setup steps.

### Type Declaration

```typescript
(result: AdventureImportResult, options: AdventureImportOptions) => Promise<void>
```

### Parameters

- **result**: [AdventureImportResult](https://foundryvtt.com/api/interfaces/foundry.documents.types.AdventureImportResult.html)  
- **options**: [AdventureImportOptions](https://foundryvtt.com/api/interfaces/foundry.documents.types.AdventureImportOptions.html)

### Returns

- `Promise<void>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)