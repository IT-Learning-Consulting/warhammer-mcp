# BlackHoleDarknessShader

Black Hole animation illumination shader

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [BlackHoleDarknessShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BlackHoleDarknessShader.html)

## Hierarchy

- _[AdaptiveDarknessShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html)_
- **BlackHoleDarknessShader**

---

## Properties

### initialUniforms

- **Type:** `object`

The initial values of the shader uniforms.

Inherited from [AdaptiveDarknessShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#initialuniforms)

---

## Static Properties

### COMPUTE_ILLUMINATION

- **Type:** `string` = _..._

Compute illumination uniforms

Inherited from [AdaptiveDarknessShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#compute_illumination)

---

### CONSTANTS

- **Type:** `string` = _..._

Inherited from [AdaptiveDarknessShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#constants)

---

### CONTRAST

- **Type:** `string` = _..._

Contrast adjustment

Inherited from [AdaptiveDarknessShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#contrast)

---

### defaultUniforms

```typescript
{
    ambientBrightest: number[];
    ambientDarkness: number[];
    ambientDaylight: number[];
    borderDistance: number;
    brightLevelCorrection: number;
    color: [number, number, number];
    computeIllumination: boolean;
    darknessLevel: number;
    darknessLevelTexture: null;
    depthElevation: number;
    depthTexture: null;
    dimLevelCorrection: number;
    enableVisionMasking: boolean;
    globalLight: boolean;
    globalLightThresholds: number[];
    intensity: number;
    primaryTexture: null;
    screenDimensions: number[];
    time: number;
    visionTexture: null;
    weights: number[];
}
```

Inherited from [AdaptiveDarknessShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#defaultuniforms)

---

### EXPOSURE

- **Type:** `string` = _..._

Exposure adjustment

Inherited from [AdaptiveDarknessShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#exposure)

---

### FALLOFF

- **Type:** `string` = _..._

Incorporate falloff if an attenuation uniform is requested

Inherited from [AdaptiveDarknessShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#falloff)

---

### forceDefaultColor

- **Type:** `boolean` = `false`

Has this lighting shader a forced default color?

Inherited from [AdaptiveDarknessShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#forcedefaultcolor)

---

### FRAGMENT_BEGIN

- **Type:** `string` = _..._

Initialize fragment with common properties

Inherited from [AdaptiveDarknessShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_begin)

---

### FRAGMENT_END

- **Type:** `string` = _..._

Shader final

Inherited from [AdaptiveDarknessShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_end)

---

### FRAGMENT_FUNCTIONS

- **Type:** `string` = _..._

Common functions used by the fragment shaders.

Inherited from [AdaptiveDarknessShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_functions)

---

### FRAGMENT_UNIFORMS

- **Type:** `string` = _..._

Common uniforms shared by fragment shaders.

Inherited from [AdaptiveDarknessShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_uniforms)

---

### fragmentShader

- **Type:** `string` = _..._

The raw fragment shader used by this class. A subclass of AbstractBaseShader must  
implement the `fragmentShader` static field.

Overrides [AdaptiveDarknessShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragmentshader)

---

### SATURATION

- **Type:** `string` = _..._

Saturation adjustment

Inherited from [AdaptiveDarknessShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#saturation)

---

### SHADER_HEADER

- **Type:** `string` = _..._

Memory allocations for the Adaptive Background Shader

Inherited from [AdaptiveDarknessShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#shader_header)

---

### SHADER_TECHNIQUES

- **Type:** `Record<string, ShaderTechnique>` = _..._

A mapping of available shader techniques

Inherited from [AdaptiveDarknessShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#shader_techniques)

---

### SHADOW

- **Type:** `string` = _..._

Shadow adjustment

Inherited from [AdaptiveDarknessShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#shadow)

---

### SWITCH_COLOR

- **Type:** `string` = _..._

Switch between an inner and outer color, by comparing distance from center to ratio  
Apply a strong gradient between the two areas if attenuation uniform is set to true

Inherited from [AdaptiveDarknessShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#switch_color)

---

### TRANSITION

- **Type:** `string` = _..._

Transition between bright and dim colors, if requested

Inherited from [AdaptiveDarknessShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#transition)

---

### VERTEX_ATTRIBUTES

- **Type:** `string` = _..._

Common attributes for vertex shaders.

Inherited from [AdaptiveDarknessShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_attributes)

---

### VERTEX_FRAGMENT_VARYINGS

- **Type:** `string` = _..._

Common varyings shared by vertex and fragment shaders.

Inherited from [AdaptiveDarknessShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_fragment_varyings)

---

### VERTEX_FUNCTIONS

- **Type:** `string` = `""`

Common functions used by the vertex shaders.

Inherited from [AdaptiveDarknessShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_functions)

---

### VERTEX_UNIFORMS

- **Type:** `string` = _..._

Common uniforms for vertex shaders.

Inherited from [AdaptiveDarknessShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_uniforms)

---

### vertexShader

- **Type:** `string` = _..._

The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement  
the `vertexShader` static field.

Inherited from [AdaptiveDarknessShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertexshader)

---

## Accessors

### isRequired

```typescript
get isRequired(): boolean
```

Flag whether the darkness shader is currently required. Check vision modes requirements  
first, then if key uniforms are at their default values, we don't need to render the background  
container.

**Returns:** `boolean`

Inherited from [AdaptiveDarknessShader.isRequired](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#isRequired)

---

### ADJUSTMENTS

```typescript
static get ADJUSTMENTS(): string
```

The adjustments made into fragment shaders

**Returns:** `string`

Inherited from [AdaptiveDarknessShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#ADJUSTMENTS)

---

### BACKGROUND_TECHNIQUES

```typescript
static get BACKGROUND_TECHNIQUES(): string
```

The coloration technique background shader fragment

**Returns:** `string`

Inherited from [AdaptiveDarknessShader.BACKGROUND_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#BACKGROUND_TECHNIQUES)

---

### COLORATION_TECHNIQUES

```typescript
static get COLORATION_TECHNIQUES(): string
```

The coloration technique coloration shader fragment

**Returns:** `string`

Inherited from [AdaptiveDarknessShader.COLORATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#COLORATION_TECHNIQUES)

---

### ILLUMINATION_TECHNIQUES

```typescript
static get ILLUMINATION_TECHNIQUES(): string
```

The coloration technique illumination shader fragment

**Returns:** `string`

Inherited from [AdaptiveDarknessShader.ILLUMINATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#ILLUMINATION_TECHNIQUES)

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`

Inherited from [AdaptiveDarknessShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#reset)

---

### update

```typescript
update(): void
```

**Returns:** `void`

Inherited from [AdaptiveDarknessShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#update)

---

### _configure

```typescript
protected _configure(): void
```

A one time initialization performed on creation.

**Returns:** `void`

Inherited from [AdaptiveDarknessShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#_configure)

---

### _preRender

```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```

Perform operations which are required before binding the Shader to the Renderer.

**Parameters:**

- **mesh**: `DisplayObject`  
  The mesh display object linked to this shader.
- **renderer**: `Renderer`  
  The renderer

**Returns:** `void`

Inherited from [AdaptiveDarknessShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#_prerender)

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`

Inherited from [AdaptiveDarknessShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#create)

---

### getShaderTechniques

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type

**Parameters:**

- **shaderType**: `string`  
  Shader type to construct: coloration, illumination, background, etc.

**Returns:** `string`  
The constructed shader adaptive block

Inherited from [AdaptiveDarknessShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#getshadertechniques)