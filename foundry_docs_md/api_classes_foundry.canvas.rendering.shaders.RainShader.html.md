# RainShader

Rain shader effect.

**Hierarchy:**  
[AbstractWeatherShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html)  
→ **RainShader**

---

## Properties

### initialUniforms

- **Type:** `object`  
- **Description:** The initial values of the shader uniforms.  
- **Inherited from:** [AbstractWeatherShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#initialuniforms)

---

### speed

- **Type:** `number`  
- **Default:** `1`  
- **Description:** The speed multiplier applied to animation. 0 stops animation.  
- **Inherited from:** [AbstractWeatherShader.speed](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#speed)

---

### Static Properties

#### commonUniforms

```typescript
commonUniforms: {
    alpha: number;
    depthElevation: number;
    effectDimensions: [number, number];
    occlusionTexture: null | Texture<Resource>;
    occlusionWeights: number[];
    reverseOcclusion: boolean;
    reverseTerrain: boolean;
    screenDimensions: [number, number];
    terrainTexture: null | Texture<Resource>;
    terrainWeights: number[];
    time: number;
    tint: number[];
    useOcclusion: boolean;
    useTerrain: boolean;
} = ...
```

- **Description:** Common uniforms for all weather shaders.  
- **Inherited from:** [AbstractWeatherShader.commonUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#commonuniforms)

---

#### COMPUTE_MASK

- **Type:** `string`  
- **Description:** Compute the weather masking value.  
- **Inherited from:** [AbstractWeatherShader.COMPUTE_MASK](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#compute_mask)

---

#### defaultUniforms

```typescript
defaultUniforms: {
    intensity: number;
    opacity: number;
    resolution: number[];
    rotation: number;
    strength: number;
} = ...
```

- **Description:** Default uniforms for a specific class  
- **Overrides:** [AbstractWeatherShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#defaultuniforms)

---

#### FRAGMENT_HEADER

- **Type:** `string`  
- **Description:** Compute the weather masking value.  
- **Inherited from:** [AbstractWeatherShader.FRAGMENT_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#fragment_header)

---

#### fragmentShader

- **Type:** `string`  
- **Description:** The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the `fragmentShader` static field.  
- **Overrides:** [AbstractWeatherShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#fragmentshader)

---

#### vertexShader

- **Type:** `string`  
- **Description:** The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
- **Inherited from:** [AbstractWeatherShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#vertexshader)

---

## Accessors

### scale

```typescript
set scale(scale: number | { x: number; y: number }): void
```

- **Description:** Update the scale of this effect with new values  
- **Parameters:**
  - **scale**: `number | { x: number; y: number }` — The desired scale  
- **Returns:** `void`  
- **Inherited from:** [AbstractWeatherShader.scale](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#scale)

---

## Methods

### _preRender

```typescript
_preRender(mesh: any, renderer: any): void
```

- **Parameters:**
  - **mesh:** `any`  
  - **renderer:** `any`  
- **Returns:** `void`  
- **Inherited from:** [AbstractWeatherShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#_prerender)

---

### reset

```typescript
reset(): void
```

- **Description:** Reset the shader uniforms back to their initial values.  
- **Returns:** `void`  
- **Inherited from:** [AbstractWeatherShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#reset)

---

### _configure

```typescript
protected _configure(): void
```

- **Description:** A one time initialization performed on creation.  
- **Returns:** `void`  
- **Inherited from:** [AbstractWeatherShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#_configure)

---

### Static Methods

#### create

```typescript
static create(initialUniforms: any): AbstractWeatherShader
```

- **Parameters:**
  - **initialUniforms:** `any`  
- **Returns:** `AbstractWeatherShader`  
- **Inherited from:** [AbstractWeatherShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#create)

---

#### createProgram

```typescript
static createProgram(): Program
```

- **Description:** Create the shader program.  
- **Returns:** `Program`  
- **Inherited from:** [AbstractWeatherShader.createProgram](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#createprogram)

---

# See Also

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)