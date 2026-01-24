# AmbientLightData

**Interface** AmbientLightData

```typescript
interface AmbientLightData {
  _id: null | string;
  config: LightData;
  elevation?: number;
  flags: DocumentFlags;
  hidden?: boolean;
  rotation?: number;
  vision?: boolean;
  walls?: boolean;
  x: number;
  y: number;
}
```

## Properties

### _id

- **Type:** `null | string`
- The _id which uniquely identifies this AmbientLight document

### config

- **Type:** [LightData](https://foundryvtt.com/api/classes/foundry.data.LightData.html)
- Light configuration data

### elevation? (optional)

- **Type:** `number`
- The elevation

### flags

- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)
- An object of optional key/value flags

### hidden? (optional)

- **Type:** `boolean`
- Is the light source currently hidden?

### rotation? (optional)

- **Type:** `number`
- The angle of rotation for the tile between 0 and 360

### vision? (optional)

- **Type:** `boolean`
- Whether or not this light source provides a source of vision

### walls? (optional)

- **Type:** `boolean`
- Whether or not this light source is constrained by Walls

### x

- **Type:** `number`
- The x-coordinate position of the origin of the light

### y

- **Type:** `number`
- The y-coordinate position of the origin of the light

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)