# DocumentSheetConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DocumentSheetConfiguration {
    canCreate: boolean;
    document: Document<object, DocumentConstructionContext>;
    editPermission: number;
    sheetConfig: boolean;
    viewPermission: number;
}
```

## Properties

### canCreate
**canCreate**: `boolean`  
Can this sheet class be used to create a new Document?

### document
**document**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
The Document instance associated with this sheet

### editPermission
**editPermission**: `number`  
A permission level in `CONST.DOCUMENT_OWNERSHIP_LEVELS`

### sheetConfig
**sheetConfig**: `boolean`  
Allow sheet configuration as a header button

### viewPermission
**viewPermission**: `number`  
A permission level in `CONST.DOCUMENT_OWNERSHIP_LEVELS`