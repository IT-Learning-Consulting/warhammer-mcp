# Class ChromaColorationShader

Chroma animation coloration shader

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [ChromaColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ChromaColorationShader.html)

## Hierarchy

- *[AdaptiveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html)*
- **ChromaColorationShader**

---

## Properties

### initialUniforms

The initial values of the shader uniforms.

**Type:** `object`

Inherited from [AdaptiveColorationShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#initialuniforms)

---

## Static Properties

### COMPUTE_ILLUMINATION

Compute illumination uniforms

**Type:** `string`

Inherited from [AdaptiveColorationShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#compute_illumination)

---

### CONSTANTS

**Type:** `string`

Inherited from [AdaptiveColorationShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#constants)

---

### CONTRAST

Contrast adjustment

**Type:** `string`

Inherited from [AdaptiveColorationShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#contrast)

---

### defaultUniforms

The default uniform values for the shader. A subclass of AbstractBaseShader must implement  
the `defaultUniforms` static field.

```typescript
defaultUniforms: {
    ambientBrightest: number[];
    ambientDarkness: number[];
    ambientDaylight: number[];
    attenuation: number;
    brightLevelCorrection: number;
    color: number[];
    colorationAlpha: number;
    computeIllumination: boolean;
    contrast: number;
    darknessLevelTexture: null;
    depthElevation: number;
    depthTexture: null;
    dimLevelCorrection: number;
    globalLight: boolean;
    globalLightThresholds: number[];
    hasColor: boolean;
    intensity: number;
    primaryTexture: null;
    ratio: number;
    saturation: number;
    screenDimensions: number[];
    shadows: number;
    technique: number;
    time: number;
    useSampler: boolean;
    weights: number[];
} = ...
```

Inherited from [AdaptiveColorationShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#defaultuniforms)

---

### EXPOSURE

Exposure adjustment

**Type:** `string`

Inherited from [AdaptiveColorationShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#exposure)

---

### FALLOFF

Incorporate falloff if an attenuation uniform is requested

**Type:** `string`

Inherited from [AdaptiveColorationShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#falloff)

---

### forceDefaultColor

Overrides [AdaptiveColorationShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#forcedefaultcolor)

**Type:** `boolean`  
**Value:** `true`

---

### FRAGMENT_BEGIN

Initialize fragment with common properties

**Type:** `string`

Inherited from [AdaptiveColorationShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_begin)

---

### FRAGMENT_END

**Type:** `string`

Inherited from [AdaptiveColorationShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_end)

---

### FRAGMENT_FUNCTIONS

Common functions used by the fragment shaders.

**Type:** `string`

Inherited from [AdaptiveColorationShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_functions)

---

### FRAGMENT_UNIFORMS

Common uniforms shared by fragment shaders.

**Type:** `string`

Inherited from [AdaptiveColorationShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_uniforms)

---

### fragmentShader

Overrides [AdaptiveColorationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragmentshader)

**Type:** `string`

---

### SATURATION

Saturation adjustment

**Type:** `string`

Inherited from [AdaptiveColorationShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#saturation)

---

### SHADER_HEADER

Memory allocations for the Adaptive Coloration Shader

**Type:** `string`

Inherited from [AdaptiveColorationShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_header)

---

### SHADER_TECHNIQUES

A mapping of available shader techniques

**Type:** `Record<string, ShaderTechnique>`

Inherited from [AdaptiveColorationShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_techniques)

---

### SHADOW

**Type:** `string`

Inherited from [AdaptiveColorationShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shadow)

---

### SWITCH_COLOR

Switch between an inner and outer color, by comparing distance from center to ratio  
Apply a strong gradient between the two areas if attenuation uniform is set to true

**Type:** `string`

Inherited from [AdaptiveColorationShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#switch_color)

---

### TRANSITION

Transition between bright and dim colors, if requested

**Type:** `string`

Inherited from [AdaptiveColorationShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#transition)

---

### VERTEX_ATTRIBUTES

Common attributes for vertex shaders.

**Type:** `string`

Inherited from [AdaptiveColorationShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_attributes)

---

### VERTEX_FRAGMENT_VARYINGS

Common varyings shared by vertex and fragment shaders.

**Type:** `string`

Inherited from [AdaptiveColorationShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_fragment_varyings)

---

### VERTEX_FUNCTIONS

Common functions used by the vertex shaders.

**Type:** `string`  
**Value:** `""`

Inherited from [AdaptiveColorationShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_functions)

---

### VERTEX_UNIFORMS

Common uniforms for vertex shaders.

**Type:** `string`

Inherited from [AdaptiveColorationShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_uniforms)

---

### vertexShader

The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement  
the `vertexShader` static field.

**Type:** `string`

---

## Accessors

### isRequired

```typescript
get isRequired(): boolean
```

Flag whether the coloration shader is currently required.

**Returns:** `boolean`

Inherited from [AdaptiveColorationShader.isRequired](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#isRequired)

---

### ADJUSTMENTS

```typescript
get ADJUSTMENTS(): string
```

The adjustments made into fragment shaders.

**Returns:** `string`

Inherited from [AdaptiveColorationShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ADJUSTMENTS)

---

### BACKGROUND_TECHNIQUES

```typescript
get BACKGROUND_TECHNIQUES(): string
```

The coloration technique background shader fragment.

**Returns:** `string`

Inherited from [AdaptiveColorationShader.BACKGROUND_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#BACKGROUND_TECHNIQUES)

---

### COLORATION_TECHNIQUES

```typescript
get COLORATION_TECHNIQUES(): string
```

The coloration technique coloration shader fragment.

**Returns:** `string`

Inherited from [AdaptiveColorationShader.COLORATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#COLORATION_TECHNIQUES)

---

### ILLUMINATION_TECHNIQUES

```typescript
get ILLUMINATION_TECHNIQUES(): string
```

The coloration technique illumination shader fragment.

**Returns:** `string`

Inherited from [AdaptiveColorationShader.ILLUMINATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ILLUMINATION_TECHNIQUES)

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`

Inherited from [AdaptiveColorationShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#reset)

---

### update

```typescript
update(): void
```

Called before rendering.

**Returns:** `void`

Inherited from [AdaptiveColorationShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#update)

---

### _configure

```typescript
protected _configure(): void
```

Protected  
A one time initialization performed on creation.

**Returns:** `void`

Inherited from [AdaptiveColorationShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_configure)

---

### _preRender

```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```

Protected  
Perform operations which are required before binding the Shader to the Renderer.

**Parameters:**

- **mesh**: `DisplayObject`  
  The mesh display object linked to this shader.

- **renderer**: `Renderer`  
  The renderer

**Returns:** `void`

Inherited from [AdaptiveColorationShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_preRender)

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`

Inherited from [AdaptiveColorationShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#create)

---

### getShaderTechniques

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type.

**Parameters:**

- **shaderType**: `string`  
  shader type to construct: coloration, illumination, background, etc.

**Returns:** `string`  
the constructed shader adaptive block

Inherited from [AdaptiveColorationShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#getShaderTechniques)