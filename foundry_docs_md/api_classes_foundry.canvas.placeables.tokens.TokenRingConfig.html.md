# TokenRingConfig | Foundry Virtual Tabletop - API Documentation - Version 13

**Class** TokenRingConfig  
Token Ring configuration Singleton Class.

---

## Examples

Add a new custom ring configuration. Allow only ring pulse, ring gradient and background wave effects.

```typescript
const customConfig = new foundry.canvas.placeables.tokens.DynamicRingData({
  id: "myCustomRingId",
  label: "Custom Ring",
  effects: {
    RING_PULSE: "TOKEN.RING.EFFECTS.RING_PULSE",
    RING_GRADIENT: "TOKEN.RING.EFFECTS.RING_GRADIENT",
    BACKGROUND_WAVE: "TOKEN.RING.EFFECTS.BACKGROUND_WAVE"
  },
  spritesheet: "canvas/tokens/myCustomRings.json",
  framework: {
    shaderClass: MyCustomTokenRingSamplerShader,
    ringClass: TokenRing
  }
});
CONFIG.Token.ring.addConfig(customConfig.id, customConfig);
```

Get a specific ring configuration

```typescript
const config = CONFIG.Token.ring.getConfig("myCustomRingId");
console.log(config.spritesheet);  // Output: canvas/tokens/myCustomRings.json
```

Use a specific ring configuration

```typescript
const success = CONFIG.Token.ring.useConfig("myCustomRingId");
console.log(success);  // Output: true
```

Get the labels of all configurations

```typescript
const configLabels = CONFIG.Token.ring.configLabels;
console.log(configLabels);
```

Get the IDs of all configurations

```typescript
const configIDs = CONFIG.Token.ring.configIDs;
console.log(configIDs);  // Output: ["coreSteel", "coreBronze", "myCustomRingId"]
```

Create a hook to add a custom token ring configuration. This ring configuration will appear in the settings.

```typescript
Hooks.on("initializeDynamicTokenRingConfig", ringConfig => {
  const mySuperPowerRings = new foundry.canvas.placeables.tokens.DynamicRingData({
    id: "myCustomRingId",
    label: "My Super Power Rings",
    effects: {
      RING_PULSE: "TOKEN.RING.EFFECTS.RING_PULSE",
      RING_GRADIENT: "TOKEN.RING.EFFECTS.RING_GRADIENT",
      BACKGROUND_WAVE: "TOKEN.RING.EFFECTS.BACKGROUND_WAVE"
    },
    spritesheet: "canvas/tokens/mySuperPowerRings.json"
  });
  ringConfig.addConfig("mySuperPowerRings", mySuperPowerRings);
});
```

Activate color bands debugging visuals to ease configuration

```typescript
CONFIG.Token.ring.debugColorBands = true;
```

---

# Properties

### debugColorBands
Type: `boolean` = `false`  
All color bands visual debug flag.

### subjectPaths
Type: `Record<string, string>` = `{}`  
A mapping of token subject paths where modules or systems have configured subject images.

---

# Accessors

### Static

#### CORE_TOKEN_RINGS  
Type: `Readonly<Record<string, RingData>>` = ...  
Core token rings used in Foundry VTT. Each key is a string identifier for a ring, and the value is an object containing the ring's data. This object is frozen to prevent any modifications.

#### CORE_TOKEN_RINGS_FIT_MODES  
Type: `object` = ...  
Core token rings fit modes used in Foundry VTT.

---

### Instance

#### get configIDs(): `string[]`  
Get the IDs of all configurations.

**Returns:**  
`string[]` — The names of all configurations.

#### get configLabels(): `Record<string, string>`  
Get the labels of all configurations.

**Returns:**  
`Record<string, string>` — An object with configuration names as keys and localized labels as values.

#### get effects(): `Record<string, string>`  
Get the current effects.

**Returns:**  
`Record<string, string>`

#### get id(): `string`  
Get the current id.

**Returns:**  
`string`

#### get isGridFitMode(): `boolean`  
Is a custom fit mode active?

**Returns:**  
`boolean`

#### get label(): `string`  
Get the current localized label.

**Returns:**  
`string`

#### get ringClass(): `any`  
Get the current ring class.

**Returns:**  
`any`

#### get shaderClass(): `any`  
Get the current shader class.

**Returns:**  
`any`

#### get spritesheet(): `string`  
Get the current spritesheet.

**Returns:**  
`string`

---

# Methods

### addConfig
```typescript
addConfig(id: string, config: RingConfig): void
```
Add a new ring configuration.

**Parameters:**

- **id**: `string`  
  The id of the ring configuration.

- **config**: `RingConfig`  
  The configuration object for the ring.

**Returns:**  
`void`

---

### getConfig
```typescript
getConfig(id: string): RingConfig
```
Get a ring configuration.

**Parameters:**

- **id**: `string`  
  The id of the ring configuration.

**Returns:**  
`RingConfig` — The ring configuration object.

---

### useConfig
```typescript
useConfig(id: string): boolean
```
Use a ring configuration.

**Parameters:**

- **id**: `string`  
  The id of the ring configuration to use.

**Returns:**  
`boolean` — True if the configuration was successfully set, false otherwise.

---

### Static Methods

#### initialize
```typescript
initialize(): void
```
Register the token ring config and initialize it.

**Returns:**  
`void`

#### registerSettings
```typescript
registerSettings(): void
```
Register game settings used by the Token Ring.

**Returns:**  
`void`

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).