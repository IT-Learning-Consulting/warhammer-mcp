# ColorationVisionShader

The default coloration shader used for vision sources.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [ColorationVisionShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html)

## Hierarchy

- _AdaptiveVisionShader_  
- **ColorationVisionShader**  
- _WaveColorationVisionShader_

## Properties

### initialUniforms

Type: `object`  
The initial values of the shader uniforms.  
Inherited from [AdaptiveVisionShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#initialuniforms)

---

## Static Properties

### COMPUTE_ILLUMINATION

Type: `string`  
Compute illumination uniforms  
Inherited from [AdaptiveVisionShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#compute_illumination)

---

### CONSTANTS

Type: `string`  
Inherited from [AdaptiveVisionShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#constants)

---

### CONTRAST

Type: `string` = `""`  
Overrides [AdaptiveVisionShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#contrast)

---

### defaultUniforms

```typescript
{
    ambientBrightest: number[];
    ambientDarkness: number[];
    ambientDaylight: number[];
    attenuation: number;
    brightLevelCorrection: number;
    colorBackground: number[];
    colorEffect: number[];
    colorTint: number[];
    depthElevation: number;
    depthTexture: null;
    dimLevelCorrection: number;
    globalLight: boolean;
    globalLightThresholds: number[];
    linkedToDarknessLevel: boolean;
    primaryTexture: null;
    saturation: number;
    screenDimensions: number[];
    technique: number;
    time: number;
    useSampler: boolean;
    weights: number[];
}
```

The default uniform values for the shader. A subclass of `AbstractBaseShader` must implement the `defaultUniforms` static field.  
Overrides [AdaptiveVisionShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#defaultuniforms)

---

### EXPOSURE

Type: `string` = `""`  
Overrides [AdaptiveVisionShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#exposure)

---

### FALLOFF

Type: `string`  
Incorporate falloff if an attenuation uniform is requested  
Inherited from [AdaptiveVisionShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#falloff)

---

### forceDefaultColor

Type: `boolean` = `false`  
Has this lighting shader a forced default color?  
Inherited from [AdaptiveVisionShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#forcedefaultcolor)

---

### FRAGMENT_BEGIN

Type: `string`  
Inherited from [AdaptiveVisionShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#fragment_begin)

---

### FRAGMENT_END

Type: `string`  
Shader final  
Inherited from [AdaptiveVisionShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#fragment_end)

---

### FRAGMENT_FUNCTIONS

Type: `string`  
Common functions used by the fragment shaders.  
Inherited from [AdaptiveVisionShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#fragment_functions)

---

### FRAGMENT_UNIFORMS

Type: `string`  
Common uniforms shared by fragment shaders.  
Inherited from [AdaptiveVisionShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#fragment_uniforms)

---

### fragmentShader

Type: `string`  
The raw fragment shader used by this class. A subclass of `AbstractBaseShader` must implement the `fragmentShader` static field.  
Overrides [AdaptiveVisionShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#fragmentshader)

---

### SATURATION

Type: `string`  
Saturation adjustment  
Inherited from [AdaptiveVisionShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#saturation)

---

### SHADER_HEADER

Type: `string`  
Memory allocations for the Adaptive Coloration Shader

---

### SHADER_TECHNIQUES

Type: `Record<string, ShaderTechnique>`  
A mapping of available shader techniques  
Inherited from [AdaptiveVisionShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#shader_techniques)

---

### SHADOW

Type: `string` = `""`  
Inherited from [AdaptiveVisionShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#shadow)

---

### SWITCH_COLOR

Type: `string`  
Switch between an inner and outer color, by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true.  
Inherited from [AdaptiveVisionShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#switch_color)

---

### TRANSITION

Type: `string`  
Transition between bright and dim colors, if requested  
Inherited from [AdaptiveVisionShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#transition)

---

### VERTEX_ATTRIBUTES

Type: `string`  
Common attributes for vertex shaders.  
Inherited from [AdaptiveVisionShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#vertex_attributes)

---

### VERTEX_FRAGMENT_VARYINGS

Type: `string`  
Common varyings shared by vertex and fragment shaders.  
Inherited from [AdaptiveVisionShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#vertex_fragment_varyings)

---

### VERTEX_FUNCTIONS

Type: `string` = `""`  
Common functions used by the vertex shaders.  
Inherited from [AdaptiveVisionShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#vertex_functions)

---

### VERTEX_UNIFORMS

Type: `string`  
Common uniforms for vertex shaders.  
Inherited from [AdaptiveVisionShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#vertex_uniforms)

---

### vertexShader

Type: `string`  
The raw vertex shader used by this class. A subclass of `AbstractBaseShader` must implement the `vertexShader` static field.  
Inherited from [AdaptiveVisionShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#vertexshader)

---

## Accessors

### isRequired

```typescript
get isRequired(): boolean
```

Flag whether the coloration shader is currently required. If key uniforms are at their default values, we don't need to render the coloration container.

**Returns:** `boolean`

---

### ADJUSTMENTS

```typescript
static get ADJUSTMENTS(): string
```

The adjustments made into fragment shaders

**Returns:** `string`  
Inherited from `AdaptiveVisionShader.ADJUSTMENTS`

---

### BACKGROUND_TECHNIQUES

```typescript
static get BACKGROUND_TECHNIQUES(): string
```

The coloration technique background shader fragment

**Returns:** `string`  
Inherited from `AdaptiveVisionShader.BACKGROUND_TECHNIQUES`

---

### COLORATION_TECHNIQUES

```typescript
static get COLORATION_TECHNIQUES(): string
```

The coloration technique coloration shader fragment

**Returns:** `string`  
Inherited from `AdaptiveVisionShader.COLORATION_TECHNIQUES`

---

### ILLUMINATION_TECHNIQUES

```typescript
static get ILLUMINATION_TECHNIQUES(): string
```

The coloration technique illumination shader fragment

**Returns:** `string`  
Inherited from `AdaptiveVisionShader.ILLUMINATION_TECHNIQUES`

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`  
Inherited from [AdaptiveVisionShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#reset)

---

### update

```typescript
update(): void
```

Called before rendering.

**Returns:** `void`  
Inherited from [AdaptiveVisionShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#update)

---

### _configure

```typescript
protected _configure(): void
```

Protected  
A one time initialization performed on creation.

**Returns:** `void`  
Inherited from [AdaptiveVisionShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#_configure)

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
Inherited from [AdaptiveVisionShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#_prerender)

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`  
Inherited from [AdaptiveVisionShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#create)

---

### getShaderTechniques

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type.

**Parameters:**

- **shaderType**: `string`  
  Shader type to construct: coloration, illumination, background, etc.

**Returns:** `string`  
The constructed shader adaptive block  
Inherited from [AdaptiveVisionShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html#getshadertechniques)