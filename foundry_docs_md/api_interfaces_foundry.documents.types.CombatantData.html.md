# CombatantData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CombatantData {
  _id: null | string;
  _stats: DocumentStats;
  actorId?: string;
  defeated?: boolean;
  flags: DocumentFlags;
  group?: string;
  hidden?: boolean;
  img?: string;
  initiative?: number;
  name?: string;
  system?: object;
  tokenId?: string;
  type: string;
}
```

## Properties

### _id

- **Type:** `null | string`  
- The `_id` which uniquely identifies this Combatant embedded document.

---

### _stats

- **Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
- An object of creation and access information.

---

### actorId (Optional)

- **Type:** `string`  
- The `_id` of an Actor associated with this Combatant.

---

### defeated (Optional)

- **Type:** `boolean`  
- Has this Combatant been defeated?

---

### flags

- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- An object of optional key/value flags.

---

### group (Optional)

- **Type:** `string`  
- An optional group this Combatant belongs to.

---

### hidden (Optional)

- **Type:** `boolean`  
- Is this Combatant currently hidden?

---

### img (Optional)

- **Type:** `string`  
- A customized image which replaces the Token image in the tracker.

---

### initiative (Optional)

- **Type:** `number`  
- The initiative score for the Combatant which determines its turn order.

---

### name (Optional)

- **Type:** `string`  
- A customized name which replaces the name of the Token in the tracker.

---

### system (Optional)

- **Type:** `object`  
- Game system data which is defined by system data models.

---

### tokenId (Optional)

- **Type:** `string`  
- The `_id` of a Token associated with this Combatant.

---

### type

- **Type:** `string`  
- The type of this Combatant.

---

For more information, see the [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/index.html).