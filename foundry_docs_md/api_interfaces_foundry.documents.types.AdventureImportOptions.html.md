# AdventureImportOptions

Options which customize how the adventure import process is orchestrated. Modules can use the `preImportAdventure` hook to extend these options by adding `preImport` or `postImport` callbacks.

```typescript
interface AdventureImportOptions {
    dialog?: boolean;
    importFields?: string[];
    postImport?: AdventurePostImportCallback[];
    preImport?: AdventurePreImportCallback[];
}
```

## Properties

### dialog?  
*Type:* `boolean`  
Display a warning dialog if existing documents would be overwritten.

### importFields?  
*Type:* `string[]`  
A subset of adventure fields to import.

### postImport?  
*Type:* [`AdventurePostImportCallback`](https://foundryvtt.com/api/types/foundry.documents.types.AdventurePostImportCallback.html)[]  
An array of awaited post-import callbacks.

### preImport?  
*Type:* [`AdventurePreImportCallback`](https://foundryvtt.com/api/types/foundry.documents.types.AdventurePreImportCallback.html)[]  
An array of awaited pre-import callbacks.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)