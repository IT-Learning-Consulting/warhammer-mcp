# FogShader

Fog shader effect.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [FogShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.FogShader.html)

## Hierarchy

- [AbstractWeatherShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html)
- **FogShader**

---

## Properties

### initialUniforms

Type: `object`

The initial values of the shader uniforms.

Inherited from [AbstractWeatherShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#initialuniforms).

---

### speed

Type: `number` = 1

The speed multiplier applied to animation. 0 stops animation.

Inherited from [AbstractWeatherShader.speed](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#speed).

---

### commonUniforms

Type:
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
}
```

Common uniforms for all weather shaders.

Inherited from [AbstractWeatherShader.commonUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#commonuniforms).

---

### COMPUTE_MASK

Type: `string`

Compute the weather masking value.

Inherited from [AbstractWeatherShader.COMPUTE_MASK](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#compute_mask).

---

### defaultUniforms

Type:
```typescript
{ intensity: number; rotation: number; slope: number }
```

Default uniforms for a specific class.

Overrides [AbstractWeatherShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#defaultuniforms).

---

### FRAGMENT_HEADER

Type: `string`

Compute the weather masking value.

Inherited from [AbstractWeatherShader.FRAGMENT_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#fragment_header).

---

### vertexShader

Type: `string`

The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the vertexShader static field.

Inherited from [AbstractWeatherShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#vertexshader).

---

## Accessors

### scale

```typescript
set scale(scale: number | { x: number; y: number }): void
```

Update the scale of this effect with new values.

- **scale**: `number | { x: number; y: number }`  
  The desired scale.

Returns: `void`

Inherited from [AbstractWeatherShader.scale](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#scale).

---

## Methods

### _preRender

```typescript
_preRender(mesh: any, renderer: any): void
```

- **mesh**: `any`  
- **renderer**: `any`

Returns: `void`

Inherited from [_preRender method](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#_prerender) in `AbstractWeatherShader`.

---

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

Returns: `void`

Inherited from [reset method](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#reset) in `AbstractWeatherShader`.

---

### _configure

```typescript
_protected _configure(): void
```

Protected. A one-time initialization performed on creation.

Returns: `void`

Inherited from [_configure method](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#_configure) in `AbstractWeatherShader`.

---

## Static Methods

### create

```typescript
static create(initialUniforms: any): AbstractWeatherShader
```

- **initialUniforms**: `any`

Returns: `AbstractWeatherShader`

Inherited from [create method](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#create) in `AbstractWeatherShader`.

---

### createProgram

```typescript
static createProgram(): Program
```

Returns: `Program`

Overrides [createProgram](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html#createprogram) in `AbstractWeatherShader`.

---

### FOG

```typescript
static FOG(mode: number): string
```

Configure the fog complexity according to mode (performance).

- **mode**: `number`

Returns: `string`.

---

### fragmentShader

```typescript
static fragmentShader(mode: any): string
```

- **mode**: `any`

Returns: `string`

Overrides `AbstractWeatherShader.fragmentShader`.

---

### OCTAVES

```typescript
static OCTAVES(mode: number): string
```

Configure the number of octaves into the shaders.

- **mode**: `number`

Returns: `string`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)