# ActorData

```typescript
interface ActorData {
  _id: null | string;
  _stats: DocumentStats;
  effects: ActiveEffectData[];
  flags: DocumentFlags;
  folder: null | string;
  img?: string;
  items: ItemData[];
  name: string;
  ownership: object;
  prototypeToken: PrototypeTokenData;
  sort: number;
  system: object;
  type: string;
}
```

## Properties

### _id
- **Type:** `null | string`  
- **Description:**  
  The _id which uniquely identifies this Actor document

### _stats
- **Type:** [`DocumentStats`](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
- **Description:**  
  An object of creation and access information

### effects
- **Type:** [`ActiveEffectData[]`](https://foundryvtt.com/api/interfaces/foundry.documents.types.ActiveEffectData.html)  
- **Description:**  
  A Collection of ActiveEffect embedded Documents

### flags
- **Type:** [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- **Description:**  
  An object of optional key/value flags

### folder
- **Type:** `null | string`  
- **Description:**  
  The _id of a Folder which contains this Actor

### img (Optional)
- **Type:** `string`  
- **Description:**  
  An image file path which provides the artwork for this Actor

### items
- **Type:** [`ItemData[]`](https://foundryvtt.com/api/interfaces/foundry.documents.types.ItemData.html)  
- **Description:**  
  A Collection of Item embedded Documents

### name
- **Type:** `string`  
- **Description:**  
  The name of this Actor

### ownership
- **Type:** `object`  
- **Description:**  
  An object which configures ownership of this Actor

### prototypeToken
- **Type:** [`PrototypeTokenData`](https://foundryvtt.com/api/types/foundry.documents.types.PrototypeTokenData.html)  
- **Description:**  
  Default Token settings which are used for Tokens created from this Actor

### sort
- **Type:** `number`  
- **Description:**  
  The numeric sort value which orders this Actor relative to its siblings

### system
- **Type:** `object`  
- **Description:**  
  The system data object which is defined by the system template.json model

### type
- **Type:** `string`  
- **Description:**  
  An Actor subtype which configures the system data model applied

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)