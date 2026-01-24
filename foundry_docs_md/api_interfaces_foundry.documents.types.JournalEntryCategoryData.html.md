# JournalEntryCategoryData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface JournalEntryCategoryData {
    _id: null | string;
    _stats: DocumentStats;
    flags: DocumentFlags;
    name: string;
    sort?: number;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this JournalEntryCategory document.

- **_stats**: [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
  An object of creation and access information.

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags.

- **name**: `string`  
  The name of this JournalEntryCategory.

### Optional

- **sort?**: `number`  
  The numeric sort value which orders this category relative to other categories.