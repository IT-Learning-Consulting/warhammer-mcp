# JournalEntryData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface JournalEntryData {
  _id: null | string;
  _stats: DocumentStats;
  categories: JournalEntryCategoryData[];
  flags: DocumentFlags;
  folder: null | string;
  name: string;
  ownership?: object;
  pages: JournalEntryPageData[];
  sort?: number;
}
```

## Properties

### _id

- **Type:** `null | string`  
- **Description:**  
  The `_id` which uniquely identifies this JournalEntry document.

### _stats

- **Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
- **Description:**  
  An object of creation and access information.

### categories

- **Type:** `JournalEntryCategoryData[]`  
- **Link:** [JournalEntryCategoryData](https://foundryvtt.com/api/interfaces/foundry.documents.types.JournalEntryCategoryData.html)  
- **Description:**  
  The categories contained within this JournalEntry.

### flags

- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- **Description:**  
  An object of optional key/value flags.

### folder

- **Type:** `null | string`  
- **Description:**  
  The `_id` of a Folder which contains this JournalEntry.

### name

- **Type:** `string`  
- **Description:**  
  The name of this JournalEntry.

### ownership (Optional)

- **Type:** `object`  
- **Description:**  
  An object which configures ownership of this JournalEntry.

### pages

- **Type:** `JournalEntryPageData[]`  
- **Link:** [JournalEntryPageData](https://foundryvtt.com/api/interfaces/foundry.documents.types.JournalEntryPageData.html)  
- **Description:**  
  The pages contained within this JournalEntry document.

### sort (Optional)

- **Type:** `number`  
- **Description:**  
  The numeric sort value which orders this JournalEntry relative to its siblings.