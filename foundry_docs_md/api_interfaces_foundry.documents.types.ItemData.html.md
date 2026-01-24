# ItemData

```typescript
interface ItemData {
    _id: null | string;
    _stats: DocumentStats;
    effects: ActiveEffectData[];
    flags: DocumentFlags;
    folder: null | string;
    img?: string;
    name: string;
    ownership?: object;
    sort?: number;
    system?: object;
    type: string;
}
```

## Properties

### _id
- **Type:** `null | string`  
The _id which uniquely identifies this Item document.

### _stats
- **Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
An object of creation and access information.

### effects
- **Type:** [ActiveEffectData](https://foundryvtt.com/api/interfaces/foundry.documents.types.ActiveEffectData.html)[]  
A collection of ActiveEffect embedded Documents.

### flags
- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
An object of optional key/value flags.

### folder
- **Type:** `null | string`  
The _id of a Folder which contains this Item.

### img? (Optional)
- **Type:** `string`  
An image file path which provides the artwork for this Item.

### name
- **Type:** `string`  
The name of this Item.

### ownership? (Optional)
- **Type:** `object`  
An object which configures ownership of this Item.

### sort? (Optional)
- **Type:** `number`  
The numeric sort value which orders this Item relative to its siblings.

### system? (Optional)
- **Type:** `object`  
The system data object which is defined by the system `template.json` model.

### type
- **Type:** `string`  
An Item subtype which configures the system data model applied.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)