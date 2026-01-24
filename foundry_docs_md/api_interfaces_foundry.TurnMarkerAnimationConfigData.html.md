# TurnMarkerAnimationConfigData

The turn marker config data.

```typescript
interface TurnMarkerAnimationConfigData {
    pulse: { max?: number; min?: number; speed?: number };
    shader?: any;
    spin?: number;
}
```

## Properties

### pulse

- **Type:** `{ max?: number; min?: number; speed?: number }`  
- **Description:** The pulse settings.

#### max (optional)

- **Type:** `number`  
- **Description:** The maximum pulse value.

#### min (optional)

- **Type:** `number`  
- **Description:** The minimum pulse value.

#### speed (optional)

- **Type:** `number`  
- **Description:** The speed of the pulse.

---

### shader (optional)

- **Type:** `any`  
- **Description:** A shader class to apply or null.

---

### spin (optional)

- **Type:** `number`  
- **Description:** The spin speed for the animation.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)