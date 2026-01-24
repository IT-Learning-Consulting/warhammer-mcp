# TokenRingData

```typescript
interface TokenRingData {
    colors: { background?: string; ring?: string };
    effects?: number;
    enabled?: number;
    subject: { scale?: number; texture?: string };
}
```

## Properties

### colors

- **Type Declaration**: `{ background?: string; ring?: string }`

- **background?**: `string`  
  Color of the background (behind the token, inside the ring).

- **ring?**: `string`  
  Color of the ring.

---

### effects?

- **Type**: `number`  
  Numerical bitmask to toggle effects.  
  **Default:** `0x01`

---

### enabled?

- **Type**: `number`  
  Indicates whether the Dynamic Token ring is enabled.

---

### subject

- **Type Declaration**: `{ scale?: number; texture?: string }`

- **scale?**: `number`  
  Scale of the subject texture.

- **texture?**: `string`  
  Path of the subject texture.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)