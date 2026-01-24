# TokenData

```typescript
interface TokenData {
    _id: null | string;
    _movementHistory: object[];
    _regions: string[];
    actorId: null | string;
    actorLink?: boolean;
    alpha?: number;
    bar1?: TokenBarData;
    bar2?: TokenBarData;
    delta?: ActorDeltaData;
    detectionModes: TokenDetectionMode<true>[];
    displayBars?: number;
    displayName?: number;
    disposition?: number;
    elevation?: number;
    flags: DocumentFlags;
    height?: number;
    hidden?: boolean;
    light?: LightData;
    locked?: boolean;
    lockRotation?: boolean;
    name: string;
    occludable: TokenOcclusionData;
    ring: TokenRingData;
    rotation?: number;
    shape?: TokenShapeType;
    sight: TokenSightData;
    sort?: number;
    texture: TextureData;
    width?: number;
    x?: number;
    y?: number;
}
```

## Properties

### _id

- **Type:** `null | string`  
- **Description:** The Token _id which uniquely identifies it within its parent Scene.

---

### _movementHistory

- **Type:** `object[]`  
- **Description:** The movement history of the Token.

---

### _regions

- **Type:** `string[]`

---

### actorId

- **Type:** `null | string`  
- **Description:** The _id of an Actor document which this Token represents.

---

### actorLink (optional)

- **Type:** `boolean`  
- **Description:** Does this Token uniquely represent a singular Actor, or is it one of many?

---

### alpha (optional)

- **Type:** `number`  
- **Description:** The opacity of the token image.

---

### bar1 (optional)

- **Type:** [`TokenBarData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenBarData.html)  
- **Description:** The configuration of the Token's primary resource bar.

---

### bar2 (optional)

- **Type:** [`TokenBarData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenBarData.html)  
- **Description:** The configuration of the Token's secondary resource bar.

---

### delta (optional)

- **Type:** [`ActorDeltaData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.ActorDeltaData.html)  
- **Description:** The ActorDelta embedded document which stores the differences between this token and the base actor it represents.

---

### detectionModes

- **Type:** `TokenDetectionMode<true>[]`  
- **Description:** An array of detection modes which are available to this Token.  
- See [`TokenDetectionMode`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html).

---

### displayBars (optional)

- **Type:** `number`  
- **Description:** The display mode of Token resource bars, from `CONST.TOKEN_DISPLAY_MODES`.

---

### displayName (optional)

- **Type:** `number`  
- **Description:** The display mode of the Token nameplate, from `CONST.TOKEN_DISPLAY_MODES`.

---

### disposition (optional)

- **Type:** `number`  
- **Description:** A displayed Token disposition from `CONST.TOKEN_DISPOSITIONS`.

---

### elevation (optional)

- **Type:** `number`  
- **Description:** The vertical elevation of the Token, in distance units.

---

### flags

- **Type:** [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- **Description:** An object of optional key/value flags.

---

### height (optional)

- **Type:** `number`  
- **Description:** The height of the Token in grid units.

---

### hidden (optional)

- **Type:** `boolean`  
- **Description:** Is the Token currently hidden from player view?

---

### light (optional)

- **Type:** [`LightData`](https://foundryvtt.com/api/classes/foundry.data.LightData.html)  
- **Description:** Configuration of the light source that this Token emits.

---

### locked (optional)

- **Type:** `boolean`  
- **Description:** Is the Token currently locked? A locked token cannot be moved or rotated via standard keyboard or mouse interaction.

---

### lockRotation (optional)

- **Type:** `boolean`  
- **Description:** Prevent the Token image from visually rotating?

---

### name

- **Type:** `string`  
- **Description:** The name used to describe the Token.

---

### occludable

- **Type:** [`TokenOcclusionData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenOcclusionData.html)  
- **Description:** Configuration of occlusion options.

---

### ring

- **Type:** [`TokenRingData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenRingData.html)  
- **Description:** Configuration of the Dynamic Token Ring.

---

### rotation (optional)

- **Type:** `number`  
- **Description:** The rotation of the Token in degrees, from 0 to 360. A value of 0 represents a southward-facing Token.

---

### shape (optional)

- **Type:** [`TokenShapeType`](https://foundryvtt.com/api/types/CONST.TokenShapeType.html)  
- **Description:** The shape of the Token.

---

### sight

- **Type:** [`TokenSightData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenSightData.html)  
- **Description:** Configuration of sight and vision properties for the Token.

---

### sort (optional)

- **Type:** `number`  
- **Description:** The sort order.

---

### texture

- **Type:** [`TextureData`](https://foundryvtt.com/api/classes/foundry.data.TextureData.html)  
- **Description:** The token's texture on the canvas.

---

### width (optional)

- **Type:** `number`  
- **Description:** The width of the Token in grid units.

---

### x (optional)

- **Type:** `number`  
- **Description:** The x-coordinate of the top-left corner of the Token.

---

### y (optional)

- **Type:** `number`  
- **Description:** The y-coordinate of the top-left corner of the Token.