# GhostLightColorationShader

*Foundry Virtual Tabletop - API Documentation - Version 13*

Ghost light animation coloration shader

---

## Hierarchy  
- [AdaptiveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html)  
- **GhostLightColorationShader**

---

## Properties

### initialUniforms

`initialUniforms: object`

The initial values of the shader uniforms.

Inherited from [AdaptiveColorationShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#initialuniforms)

---

## Static Properties

### COMPUTE_ILLUMINATION

`COMPUTE_ILLUMINATION: string = ...`

Compute illumination uniforms

Inherited from [AdaptiveColorationShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#compute_illumination)

---

### CONSTANTS

`CONSTANTS: string = ...`

Inherited from [AdaptiveColorationShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#constants)

---

### CONTRAST

`CONTRAST: string = ...`

Contrast adjustment

Inherited from [AdaptiveColorationShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#contrast)

---

### defaultUniforms

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

The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.

Inherited from [AdaptiveColorationShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#defaultuniforms)

---

### EXPOSURE

`EXPOSURE: string = ...`

Exposure adjustment

Inherited from [AdaptiveColorationShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#exposure)

---

### FALLOFF

`FALLOFF: string = ...`

Incorporate falloff if an attenuation uniform is requested

Inherited from [AdaptiveColorationShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#falloff)

---

### forceDefaultColor

`forceDefaultColor: boolean = false`

Has this lighting shader a forced default color?

Inherited from [AdaptiveColorationShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#forcedefaultcolor)

---

### FRAGMENT_BEGIN

`FRAGMENT_BEGIN: string = ...`

Initialize fragment with common properties

Inherited from [AdaptiveColorationShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_begin)

---

### FRAGMENT_END

`FRAGMENT_END: string = ...`

Inherited from [AdaptiveColorationShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_end)

---

### FRAGMENT_FUNCTIONS

`FRAGMENT_FUNCTIONS: string = ...`

Common functions used by the fragment shaders.

Inherited from [AdaptiveColorationShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_functions)

---

### FRAGMENT_UNIFORMS

`FRAGMENT_UNIFORMS: string = ...`

Common uniforms shared by fragment shaders.

Inherited from [AdaptiveColorationShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_uniforms)

---

### fragmentShader

`fragmentShader: string = ...`

Overrides [AdaptiveColorationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragmentshader)

---

### SATURATION

`SATURATION: string = ...`

Saturation adjustment

Inherited from [AdaptiveColorationShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#saturation)

---

### SHADER_HEADER

`SHADER_HEADER: string = ...`

Memory allocations for the Adaptive Coloration Shader

Inherited from [AdaptiveColorationShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_header)

---

### SHADER_TECHNIQUES

`SHADER_TECHNIQUES: Record<string, ShaderTechnique> = ...`

A mapping of available shader techniques

Inherited from [AdaptiveColorationShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_techniques)

---

### SHADOW

`SHADOW: string = ...`

Inherited from [AdaptiveColorationShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shadow)

---

### SWITCH_COLOR

`SWITCH_COLOR: string = ...`

Switch between an inner and outer color, by comparing distance from center to ratio  
Apply a strong gradient between the two areas if attenuation uniform is set to true

Inherited from [AdaptiveColorationShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#switch_color)

---

### TRANSITION

`TRANSITION: string = ...`

Transition between bright and dim colors, if requested

Inherited from [AdaptiveColorationShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#transition)

---

### VERTEX_ATTRIBUTES

`VERTEX_ATTRIBUTES: string = ...`

Common attributes for vertex shaders.

Inherited from [AdaptiveColorationShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_attributes)

---

### VERTEX_FRAGMENT_VARYINGS

`VERTEX_FRAGMENT_VARYINGS: string = ...`

Common varyings shared by vertex and fragment shaders.

Inherited from [AdaptiveColorationShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_fragment_varyings)

---

### VERTEX_FUNCTIONS

`VERTEX_FUNCTIONS: string = ""`

Common functions used by the vertex shaders.

Inherited from [AdaptiveColorationShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_functions)

---

### VERTEX_UNIFORMS

`VERTEX_UNIFORMS: string = ...`

Common uniforms for vertex shaders.

Inherited from [AdaptiveColorationShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_uniforms)

---

### vertexShader

`vertexShader: string = ...`

The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.

Inherited from [AdaptiveColorationShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertexshader)

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

The adjustments made into fragment shaders

**Returns:** `string`

Inherited from [AdaptiveColorationShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ADJUSTMENTS)

---

### BACKGROUND_TECHNIQUES

```typescript
get BACKGROUND_TECHNIQUES(): string
```

The coloration technique background shader fragment

**Returns:** `string`

Inherited from [AdaptiveColorationShader.BACKGROUND_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#BACKGROUND_TECHNIQUES)

---

### COLORATION_TECHNIQUES

```typescript
get COLORATION_TECHNIQUES(): string
```

The coloration technique coloration shader fragment

**Returns:** `string`

Inherited from [AdaptiveColorationShader.COLORATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#COLORATION_TECHNIQUES)

---

### ILLUMINATION_TECHNIQUES

```typescript
get ILLUMINATION_TECHNIQUES(): string
```

The coloration technique illumination shader fragment

**Returns:** `string`

Inherited from [AdaptiveColorationShader.ILLUMINATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ILLUMINATION_TECHNIQUES)

---

## Methods

### reset()

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`

Inherited from [AdaptiveColorationShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#reset)

---

### update()

```typescript
update(): void
```

Called before rendering.

**Returns:** `void`

Inherited from [AdaptiveColorationShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#update)

---

### _configure()

```typescript
protected _configure(): void
```

Protected  
A one time initialization performed on creation.

**Returns:** `void`

Inherited from [AdaptiveColorationShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_configure)

---

### _preRender(mesh: DisplayObject, renderer: Renderer)

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

### create(initialUniforms: object)

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`  

**Returns:** [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)

Inherited from [AdaptiveColorationShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#create)

---

### getShaderTechniques(shaderType: string)

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type

**Parameters:**

- **shaderType**: `string`  
  shader type to construct: coloration, illumination, background, etc.

**Returns:** `string`  
the constructed shader adaptive block

Inherited from [AdaptiveColorationShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#getShaderTechniques)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)