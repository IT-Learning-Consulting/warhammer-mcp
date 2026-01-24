# FolderData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface FolderData {
    _id: null | string;
    _stats: DocumentStats;
    color?: null | string;
    description: string;
    flags: DocumentFlags;
    folder?: null | string;
    name: string;
    sort?: number;
    sorting?: string;
    type: string;
}
```

## Properties

### _id
- **Type:** `null | string`  
- The _id which uniquely identifies this Folder document

### _stats
- **Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
- An object of creation and access information

### color (optional)
- **Type:** `null | string`  
- A color string used for the background color of this Folder

### description
- **Type:** `string`  
- An HTML description of the contents of this folder

### flags
- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- An object of optional key/value flags

### folder (optional)
- **Type:** `null | string`  
- The _id of a parent Folder which contains this Folder

### name
- **Type:** `string`  
- The name of this Folder

### sort (optional)
- **Type:** `number`  
- The numeric sort value which orders this Folder relative to its siblings

### sorting (optional)
- **Type:** `string`  
- The sorting mode used to organize documents within this Folder, in `["a", "m"]`

### type
- **Type:** `string`  
- The document type which this Folder contains, from `CONST.FOLDER_DOCUMENT_TYPES`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)