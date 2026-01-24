# CardsData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CardsData {
    _id: null | string;
    _stats: DocumentStats;
    cards: CardData[];
    description?: string;
    displayCount?: boolean;
    flags: DocumentFlags;
    folder: null | string;
    height: number;
    img?: string;
    name: string;
    ownership?: object;
    rotation: number;
    sort: number;
    system?: object;
    type: string;
    width: number;
}
```

## Properties

### **_id**

- **Type:** `null | string`

The _id which uniquely identifies this stack of Cards document

---

### **_stats**

- **Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)

An object of creation and access information

---

### **cards**

- **Type:** [CardData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CardData.html)[]

A collection of Card documents which currently belong to this stack

---

### **description** (Optional)

- **Type:** `string`

A text description of this stack

---

### **displayCount** (Optional)

- **Type:** `boolean`

Whether or not to publicly display the number of cards in this stack

---

### **flags**

- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)

An object of optional key/value flags

---

### **folder**

- **Type:** `null | string`

The _id of a Folder which contains this document

---

### **height**

- **Type:** `number`

The visible height of this stack

---

### **img** (Optional)

- **Type:** `string`

An image or video which is used to represent the stack of cards

---

### **name**

- **Type:** `string`

The text name of this stack

---

### **ownership** (Optional)

- **Type:** `object`

An object which configures ownership of this Cards

---

### **rotation**

- **Type:** `number`

The angle of rotation of this stack

---

### **sort**

- **Type:** `number`

The sort order of this stack relative to others in its parent collection

---

### **system** (Optional)

- **Type:** `object`

Game system data which is defined by the system template.json model

---

### **type**

- **Type:** `string`

The type of this stack, in BaseCards.metadata.types

---

### **width**

- **Type:** `number`

The visible width of this stack