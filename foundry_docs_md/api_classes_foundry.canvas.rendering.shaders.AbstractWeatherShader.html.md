# AbstractWeatherShader

The base shader class for weather shaders.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.AbstractWeatherShader), Expand

- _AbstractBaseShader_  
- **AbstractWeatherShader**  
  - _FogShader_  
  - _RainShader_  
  - _SnowShader_  

---

## Properties

### initialUniforms  
**Type:** `object`  
The initial values of the shader uniforms.  
Inherited from [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#initialuniforms).

### speed  
**Type:** `number`  
**Default:** `1`  
The speed multiplier applied to animation. 0 stops animation.

### commonUniforms  (static)  
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

### COMPUTE_MASK  (static)  
**Type:** `string`  
Compute the weather masking value.

### defaultUniforms  (static, abstract)  
**Type:** `any`  
Default uniforms for a specific class.  
Overrides [AbstractBaseShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#defaultuniforms).

### FRAGMENT_HEADER  (static)  
**Type:** `string`  
Compute the weather masking value.

### fragmentShader  (static)  
**Type:** `string | ((...args: any[]) => string)`  
**Default:** `""`  
The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the `fragmentShader` static field.  
Inherited from [AbstractBaseShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#fragmentshader).

### vertexShader  (static)  
**Type:** `string`  
The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
Overrides [AbstractBaseShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#vertexshader).

---

## Accessors

### set scale  
```typescript
set scale(scale: number | { x: number; y: number }): void
```
Update the scale of this effect with new values.

**Parameters:**
- **scale**: `number` | `{ x: number; y: number }` — The desired scale

**Returns:** `void`

---

## Methods

### _preRender  
```typescript
_preRender(mesh: any, renderer: any): void
```
Override method called before rendering.

**Parameters:**
- **mesh**: `any`
- **renderer**: `any`

**Returns:** `void`

Overrides [AbstractBaseShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_prerender).

---

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.

**Returns:** `void`

Inherited from [AbstractBaseShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#reset).

---

### _configure  (protected)  
```typescript
_configure(): void
```
A one time initialization performed on creation.

**Returns:** `void`

Inherited from [AbstractBaseShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_configure).

---

### create  (static)  
```typescript
create(initialUniforms: any): AbstractWeatherShader
```
Overrides [AbstractBaseShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#create).

**Parameters:**
- **initialUniforms**: `any`

**Returns:** `AbstractWeatherShader`

---

### createProgram  (static)  
```typescript
createProgram(): Program
```
Create the shader program.

**Returns:** `Program`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)