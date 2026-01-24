# ActorDeltaData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ActorDeltaData {
    _id: null | string;
    effects?: ActiveEffectData[];
    flags: DocumentFlags;
    img?: string;
    items?: ItemData[];
    name?: string;
    ownership?: object;
    system?: object;
    type?: string;
}
```

## Properties

### _id

- **Type:** `null | string`
- **Description:** The _id which uniquely identifies this ActorDelta document

---

### effects (optional)

- **Type:** `ActiveEffectData[]`
- **Description:** An array of embedded active effect data overrides.  
- See also: [ActiveEffectData](https://foundryvtt.com/api/interfaces/foundry.documents.types.ActiveEffectData.html)

---

### flags

- **Type:** `DocumentFlags`
- **Description:** An object of optional key/value flags  
- See also: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)

---

### img (optional)

- **Type:** `string`
- **Description:** The image override, if any.

---

### items (optional)

- **Type:** `ItemData[]`
- **Description:** An array of embedded item data overrides.  
- See also: [ItemData](https://foundryvtt.com/api/interfaces/foundry.documents.types.ItemData.html)

---

### name (optional)

- **Type:** `string`
- **Description:** The name override, if any.

---

### ownership (optional)

- **Type:** `object`
- **Description:** Ownership overrides.

---

### system (optional)

- **Type:** `object`
- **Description:** The system data model override.

---

### type (optional)

- **Type:** `string`
- **Description:** The type override, if any.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)