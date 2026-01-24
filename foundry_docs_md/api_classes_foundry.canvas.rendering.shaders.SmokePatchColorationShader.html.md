# SmokePatchColorationShader

A patch of smoke.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [SmokePatchColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SmokePatchColorationShader.html)

## Hierarchy

- _[AdaptiveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html)_
- **SmokePatchColorationShader**

## Properties

### initialUniforms

**Type:** `object`

The initial values of the shader uniforms.

Inherited from [_AdaptiveColorationShader.initialUniforms_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#initialuniforms)

---

### COMPUTE_ILLUMINATION

**Type:** `string`

Compute illumination uniforms.

Inherited from [_AdaptiveColorationShader.COMPUTE_ILLUMINATION_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#compute_illumination)

---

### CONSTANTS

**Type:** `string`

Inherited from [_AdaptiveColorationShader.CONSTANTS_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#constants)

---

### CONTRAST

**Type:** `string`

Contrast adjustment.

Inherited from [_AdaptiveColorationShader.CONTRAST_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#contrast)

---

### defaultUniforms

**Type:**
```typescript
{
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
}
```

The default uniform values for the shader. A subclass of `AbstractBaseShader` must implement the `defaultUniforms` static field.

Inherited from [_AdaptiveColorationShader.defaultUniforms_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#defaultuniforms)

---

### EXPOSURE

**Type:** `string`

Exposure adjustment.

Inherited from [_AdaptiveColorationShader.EXPOSURE_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#exposure)

---

### FALLOFF

**Type:** `string`

Incorporate falloff if an attenuation uniform is requested.

Inherited from [_AdaptiveColorationShader.FALLOFF_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#falloff)

---

### forceDefaultColor

**Type:** `boolean` `= false`

Has this lighting shader a forced default color?

Inherited from [_AdaptiveColorationShader.forceDefaultColor_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#forcedefaultcolor)

---

### FRAGMENT_BEGIN

**Type:** `string`

Initialize fragment with common properties.

Inherited from [_AdaptiveColorationShader.FRAGMENT_BEGIN_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_begin)

---

### FRAGMENT_END

**Type:** `string`

Inherited from [_AdaptiveColorationShader.FRAGMENT_END_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_end)

---

### FRAGMENT_FUNCTIONS

**Type:** `string`

Common functions used by the fragment shaders.

Inherited from [_AdaptiveColorationShader.FRAGMENT_FUNCTIONS_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_functions)

---

### FRAGMENT_UNIFORMS

**Type:** `string`

Common uniforms shared by fragment shaders.

Inherited from [_AdaptiveColorationShader.FRAGMENT_UNIFORMS_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_uniforms)

---

### fragmentShader

**Type:** `string`

Overrides [_AdaptiveColorationShader.fragmentShader_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragmentshader)

---

### SATURATION

**Type:** `string`

Saturation adjustment.

Inherited from [_AdaptiveColorationShader.SATURATION_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#saturation)

---

### SHADER_HEADER

**Type:** `string`

Memory allocations for the Adaptive Coloration Shader.

Inherited from [_AdaptiveColorationShader.SHADER_HEADER_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_header)

---

### SHADER_TECHNIQUES

**Type:** `Record<string, ShaderTechnique>`

A mapping of available shader techniques.

Inherited from [_AdaptiveColorationShader.SHADER_TECHNIQUES_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_techniques)

---

### SHADOW

**Type:** `string`

Inherited from [_AdaptiveColorationShader.SHADOW_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shadow)

---

### SWITCH_COLOR

**Type:** `string`

Switch between an inner and outer color, by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true.

Inherited from [_AdaptiveColorationShader.SWITCH_COLOR_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#switch_color)

---

### TRANSITION

**Type:** `string`

Transition between bright and dim colors, if requested.

Inherited from [_AdaptiveColorationShader.TRANSITION_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#transition)

---

### VERTEX_ATTRIBUTES

**Type:** `string`

Common attributes for vertex shaders.

Inherited from [_AdaptiveColorationShader.VERTEX_ATTRIBUTES_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_attributes)

---

### VERTEX_FRAGMENT_VARYINGS

**Type:** `string`

Common varyings shared by vertex and fragment shaders.

Inherited from [_AdaptiveColorationShader.VERTEX_FRAGMENT_VARYINGS_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_fragment_varyings)

---

### VERTEX_FUNCTIONS

**Type:** `string` `= ""`

Common functions used by the vertex shaders.

Inherited from [_AdaptiveColorationShader.VERTEX_FUNCTIONS_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_functions)

---

### VERTEX_UNIFORMS

**Type:** `string`

Common uniforms for vertex shaders.

Inherited from [_AdaptiveColorationShader.VERTEX_UNIFORMS_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_uniforms)

---

### vertexShader

**Type:** `string`

The raw vertex shader used by this class. A subclass of `AbstractBaseShader` must implement the `vertexShader` static field.

Inherited from [_AdaptiveColorationShader.vertexShader_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertexshader)

## Accessors

### isRequired

```typescript
get isRequired(): boolean
```

Flag whether the coloration shader is currently required.

**Returns:** `boolean`

Inherited from [_AdaptiveColorationShader.isRequired_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#isRequired)

---

### ADJUSTMENTS

```typescript
static get ADJUSTMENTS(): string
```

The adjustments made into fragment shaders.

**Returns:** `string`

Inherited from [_AdaptiveColorationShader.ADJUSTMENTS_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ADJUSTMENTS)

---

### BACKGROUND_TECHNIQUES

```typescript
static get BACKGROUND_TECHNIQUES(): string
```

The coloration technique background shader fragment.

**Returns:** `string`

Inherited from [_AdaptiveColorationShader.BACKGROUND_TECHNIQUES_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#BACKGROUND_TECHNIQUES)

---

### COLORATION_TECHNIQUES

```typescript
static get COLORATION_TECHNIQUES(): string
```

The coloration technique coloration shader fragment.

**Returns:** `string`

Inherited from [_AdaptiveColorationShader.COLORATION_TECHNIQUES_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#COLORATION_TECHNIQUES)

---

### ILLUMINATION_TECHNIQUES

```typescript
static get ILLUMINATION_TECHNIQUES(): string
```

The coloration technique illumination shader fragment.

**Returns:** `string`

Inherited from [_AdaptiveColorationShader.ILLUMINATION_TECHNIQUES_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ILLUMINATION_TECHNIQUES)

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`

Inherited from [_AdaptiveColorationShader.reset_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#reset)

---

### update

```typescript
update(): void
```

Called before rendering.

**Returns:** `void`

Inherited from [_AdaptiveColorationShader.update_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#update)

---

### _configure

```typescript
protected _configure(): void
```

A one-time initialization performed on creation.

**Returns:** `void`

Inherited from [_AdaptiveColorationShader._configure_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_configure)

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
  The renderer.

**Returns:** `void`

Inherited from [_AdaptiveColorationShader._preRender_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_preRender)

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`

Inherited from [_AdaptiveColorationShader.create_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#create)

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
The constructed shader adaptive block.

Inherited from [_AdaptiveColorationShader.getShaderTechniques_](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#getShaderTechniques)