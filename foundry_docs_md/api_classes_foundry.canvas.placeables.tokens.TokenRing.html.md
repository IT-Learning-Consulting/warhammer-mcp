# TokenRing

Dynamic Token Ring Manager.

---

## Constructors

### constructor

```typescript
new TokenRing(token: canvas.placeables.Token): TokenRing
```

A TokenRing is constructed by providing a reference to a Token object.

**Parameters**

- **token**: `canvas.placeables.Token`

**Returns**: `TokenRing`

---

## Properties

- **bkgColorLittleEndian**: `number` = 0xFFFFFF

- **bkgName**: `string`

- **bkgUVs**: `Float32Array`

- **colorBand**: [RingColorBand](https://foundryvtt.com/api/interfaces/foundry.canvas.placeables.types.RingColorBand.html)

- **defaultBackgroundColorLittleEndian**: `null | number` = null

- **defaultRingColorLittleEndian**: `null | number` = null

- **effects**: `number` = 0

- **maskName**: `string`

- **maskUVs**: `Float32Array`

- **ringColorLittleEndian**: `number` = 0xFFFFFF

- **ringName**: `string`

- **ringUVs**: `Float32Array`

- **scaleAdjustmentX**: `number` = 1

- **scaleAdjustmentY**: `number` = 1

- **scaleCorrection**: `number` = 1

- **subjectScaleAdjustment**: `number` = 1

- **textureScaleAdjustment**: `number` = 1

---

## Static Properties

- **baseTexture**: `BaseTexture<Resource, IAutoDetectOptions>`

  Token Rings sprite sheet base texture.

- **effects**: `Readonly<{
    BKG_WAVE: 8;
    COLOR_OVER_SUBJECT: 32;
    DISABLED: 0;
    ENABLED: 1;
    INVISIBILITY: 16;
    RING_GRADIENT: 4;
    RING_PULSE: 2;
  }>` 

  The effects which can be applied to a token ring (using bitwise operations).

- **texturesData**: `Record<string, { center: { x: number; y: number }; UVs: Float32Array }>`

  Rings and background textures UVs and center offset.

- **tokenRingSamplerShader**: `any`

  The token ring shader class definition.

---

## Accessors

### token

```typescript
get token(): void | canvas.placeables.Token
```

Reference to the token that should be animated.

**Returns**: `void | canvas.placeables.Token`

### initialized

```typescript
static get initialized(): null | boolean
```

Is the token rings framework enabled? Will be `null` if the system hasn't initialized yet.

**Returns**: `null | boolean`

---

## Methods

### clear

```typescript
clear(): void
```

Clear configuration pertaining to token ring from the mesh.

**Returns**: `void`

### configure

```typescript
configure(mesh?: any): void
```

Configure the sprite mesh.

**Parameters**

- **mesh** (optional): `any`  
  The mesh to which TokenRing functionality is configured (default to `token.mesh`)

**Returns**: `void`

### configureSize

```typescript
configureSize(options?: { fit?: string }): void
```

Configure token ring size according to mesh texture, token dimensions, fit mode, and dynamic ring fit mode.

**Parameters**

- **options** (optional):  
  - **fit** (optional): `string`  
    The desired fit mode

**Returns**: `void`

### configureVisuals

```typescript
configureVisuals(): void
```

Configure the token ring visuals properties.

**Returns**: `void`

### flashColor

```typescript
flashColor(
  color: Color,
  animationOptions?: CanvasAnimationOptions,
): Promise<boolean | void>
```

Flash the ring briefly with a certain color.

**Parameters**

- **color**: [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
  Color to flash.

- **animationOptions** (optional): `CanvasAnimationOptions` = {}  
  Options to customize the animation.

**Returns**: `Promise<boolean | void>`

---

## Static Methods

### createAssetsUVs

```typescript
static createAssetsUVs(): void
```

Create texture UVs for each asset into the token rings sprite sheet.

**Returns**: `void`

### createSpikeEasing

```typescript
static createSpikeEasing(spikePct?: number): Function
```

Create an easing function that spikes in the center. Ideal duration is around 1600ms.

**Parameters**

- **spikePct** (optional): `number` = 0.5  
  Position on [0,1] where the spike occurs.

**Returns**: `Function`

### easeTwoPeaks

```typescript
static easeTwoPeaks(pt: number): number
```

Easing function that produces two peaks before returning to the original value. Ideal duration is around 500ms.

**Parameters**

- **pt**: `number`  
  The proportional animation timing on [0,1].

**Returns**: `number`  
The eased animation progress on [0,1].

### getRingDataBySize

```typescript
static getRingDataBySize(size: number): RingData
```

Get ring and background names for a given size.

**Parameters**

- **size**: `number`  
  The size to match (grid size dimension)

**Returns**: [RingData](https://foundryvtt.com/api/interfaces/foundry.canvas.placeables.types.RingData.html)

### getTextureUVs

```typescript
static getTextureUVs(name: string, scaleCorrection?: number): void | Float32Array
```

Get the UVs array for a given texture name and scale correction.

**Parameters**

- **name**: `string`  
  Name of the texture we want to get UVs.

- **scaleCorrection** (optional): `number` = 1  
  The scale correction applied to UVs.

**Returns**: `void | Float32Array`

### initialize

```typescript
static initialize(): void
```

Initialize the Token Rings system, registering the batch plugin and patching `PrimaryCanvasGroup#addToken`.

**Returns**: `void`

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.TokenRing.html).