# RollTableData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface RollTableData {
    _id: null | string;
    _stats: DocumentStats;
    description?: string;
    displayRoll?: boolean;
    flags: DocumentFlags;
    folder: null | string;
    formula: string;
    img?: string;
    name: string;
    ownership?: object;
    replacement?: boolean;
    results?: TableResultData[];
    sort?: number;
}
```

## Properties

### _id

- **Type:** `null | string`  
- **Description:** The _id which uniquely identifies this RollTable document

---

### _stats

- **Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
- **Description:** An object of creation and access information

---

### description (optional)

- **Type:** `string`  
- **Description:** The HTML text description for this RollTable document

---

### displayRoll (optional)

- **Type:** `boolean`  
- **Description:** Is the Roll result used to draw from this RollTable displayed in chat?

---

### flags

- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- **Description:** An object of optional key/value flags

---

### folder

- **Type:** `null | string`  
- **Description:** The _id of a Folder which contains this RollTable

---

### formula

- **Type:** `string`  
- **Description:** The Roll formula which determines the results chosen from the table

---

### img (optional)

- **Type:** `string`  
- **Description:** An image file path which provides the thumbnail artwork for this RollTable

---

### name

- **Type:** `string`  
- **Description:** The name of this RollTable

---

### ownership (optional)

- **Type:** `object`  
- **Description:** An object which configures ownership of this RollTable

---

### replacement (optional)

- **Type:** `boolean`  
- **Description:** Are results from this table drawn with replacement?

---

### results (optional)

- **Type:** [TableResultData](https://foundryvtt.com/api/interfaces/foundry.documents.types.TableResultData.html)[]  
- **Description:** A Collection of TableResult embedded documents which belong to this RollTable

---

### sort (optional)

- **Type:** `number`  
- **Description:** The numeric sort value which orders this RollTable relative to its siblings