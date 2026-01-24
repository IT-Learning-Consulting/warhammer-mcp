# SnowShader

Snow shader effect.

[Foundry Virtual Tabletop - API Documentation - Version 13 / foundry / canvas / rendering / shaders / SnowShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SnowShader.html)

## Hierarchy
- [AbstractWeatherShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html)
- SnowShader

---

## Properties

### initialUniforms  
**Type:** `object`  
The initial values of the shader uniforms.  
Inherited from [AbstractWeatherShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#initialuniforms)

---

### speed  
**Type:** `number` = `1`  
The speed multiplier applied to animation. 0 stops animation.  
Inherited from [AbstractWeatherShader.speed](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#speed)

---

### Static Properties

#### commonUniforms  
```typescript
{
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
Common uniforms for all weather shaders.  
Inherited from [AbstractWeatherShader.commonUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#commonuniforms)

---

#### COMPUTE_MASK  
**Type:** `string` = `...`  
Compute the weather masking value.  
Inherited from [AbstractWeatherShader.COMPUTE_MASK](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#compute_mask)

---

#### defaultUniforms  
```typescript
{ direction: number } = ...
```
Default uniforms for a specific class  
Overrides [AbstractWeatherShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#defaultuniforms)

---

#### FRAGMENT_HEADER  
**Type:** `string` = `...`  
Compute the weather masking value.  
Inherited from [AbstractWeatherShader.FRAGMENT_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#fragment_header)

---

#### fragmentShader  
**Type:** `string` = `...`  
The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the fragmentShader static field.  
Overrides [AbstractWeatherShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#fragmentshader)

---

#### vertexShader  
**Type:** `string` = `...`  
The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the vertexShader static field.
Inherited from [AbstractWeatherShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#vertexshader)

---

## Accessors

### set scale  
```typescript
set scale(scale: number | { x: number; y: number }): void
```
Update the scale of this effect with new values.

**Parameters**

- **scale**: `number` | `{ x: number; y: number }`  
  The desired scale.

**Returns:** `void`  
Inherited from `AbstractWeatherShader.scale`

---

## Methods

### _preRender  
```typescript
_preRender(mesh: any, renderer: any): void
```

**Parameters**

- **mesh**: `any`
- **renderer**: `any`

**Returns:** `void`  
Inherited from [_preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#_prerender) in `AbstractWeatherShader`.

---

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.

**Returns:** `void`  
Inherited from [reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#reset) in `AbstractWeatherShader`.

---

### _configure  
```typescript
protected _configure(): void
```
A one time initialization performed on creation.

**Returns:** `void`  
Inherited from [_configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#_configure) in `AbstractWeatherShader`.

---

### Static Methods

#### create  
```typescript
static create(initialUniforms: any): AbstractWeatherShader
```

**Parameters**

- **initialUniforms**: `any`

**Returns:** `AbstractWeatherShader`  
Inherited from [create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#create) in `AbstractWeatherShader`.

---

#### createProgram  
```typescript
static createProgram(): Program
```
Create the shader program.

**Returns:** `Program`  
Inherited from [createProgram](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#createprogram) in `AbstractWeatherShader`.