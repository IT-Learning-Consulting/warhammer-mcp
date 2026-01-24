# FairyLightIlluminationShader | Foundry Virtual Tabletop - API Documentation - Version 13

Fairy light animation illumination shader

Based on the hierarchy:  
[AdaptiveIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html) → **FairyLightIlluminationShader**

---

## Properties

### initialUniforms
- **Type:** `object`  
- **Description:** The initial values of the shader uniforms.  
- **Inherited from:** [AdaptiveIlluminationShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#initialuniforms)

---

## Static Properties

### COMPUTE_ILLUMINATION
- **Type:** `string`  
- **Description:** Compute illumination uniforms  
- **Inherited from:** [AdaptiveIlluminationShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#compute_illumination)

### CONSTANTS
- **Type:** `string`  
- **Inherited from:** [AdaptiveIlluminationShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#constants)

### CONTRAST
- **Type:** `string`  
- **Description:** Contrast adjustment  
- **Inherited from:** [AdaptiveIlluminationShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#contrast)

### defaultUniforms
- **Type:**  
```typescript
{
  ambientBrightest: number[];
  ambientDarkness: number[];
  ambientDaylight: number[];
  attenuation: number;
  brightLevelCorrection: number;
  color: number[];
  colorBackground: number[];
  colorBright: number[];
  colorDim: number[];
  computeIllumination: boolean;
  contrast: number;
  darknessLevel: number;
  darknessLevelTexture: null;
  depthElevation: number;
  depthTexture: null;
  dimLevelCorrection: number;
  exposure: number;
  globalLight: boolean;
  globalLightThresholds: number[];
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
- **Description:** The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
- **Inherited from:** [AdaptiveIlluminationShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#defaultuniforms)

### EXPOSURE
- **Type:** `string`  
- **Inherited from:** [AdaptiveIlluminationShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#exposure)

### FALLOFF
- **Type:** `string`  
- **Description:** Incorporate falloff if an attenuation uniform is requested  
- **Inherited from:** [AdaptiveIlluminationShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#falloff)

### forceDefaultColor
- **Type:** `boolean`  
- **Default:** `false`  
- **Description:** Has this lighting shader a forced default color?  
- **Inherited from:** [AdaptiveIlluminationShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#forcedefaultcolor)

### FRAGMENT_BEGIN
- **Type:** `string`  
- **Description:** Initialize fragment with common properties  
- **Inherited from:** [AdaptiveIlluminationShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_begin)

### FRAGMENT_END
- **Type:** `string`  
- **Inherited from:** [AdaptiveIlluminationShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_end)

### FRAGMENT_FUNCTIONS
- **Type:** `string`  
- **Description:** Common functions used by the fragment shaders.  
- **Inherited from:** [AdaptiveIlluminationShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_functions)

### FRAGMENT_UNIFORMS
- **Type:** `string`  
- **Description:** Common uniforms shared by fragment shaders.  
- **Inherited from:** [AdaptiveIlluminationShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_uniforms)

### fragmentShader
- **Type:** `string`  
- **Description:** Overrides [AdaptiveIlluminationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragmentshader)  
- **Inherited from:** [AdaptiveIlluminationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragmentshader)

### SATURATION
- **Type:** `string`  
- **Description:** Saturation adjustment  
- **Inherited from:** [AdaptiveIlluminationShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#saturation)

### SHADER_HEADER
- **Type:** `string`  
- **Description:** Memory allocations for the Adaptive Illumination Shader  
- **Inherited from:** [AdaptiveIlluminationShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shader_header)

### SHADER_TECHNIQUES
- **Type:** `Record<string, ShaderTechnique>`  
- **Description:** A mapping of available shader techniques  
- **Inherited from:** [AdaptiveIlluminationShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shader_techniques)

### SHADOW
- **Type:** `string`  
- **Description:** Shadow adjustment  
- **Inherited from:** [AdaptiveIlluminationShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shadow)

### SWITCH_COLOR
- **Type:** `string`  
- **Description:** Switch between an inner and outer color, by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true  
- **Inherited from:** [AdaptiveIlluminationShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#switch_color)

### TRANSITION
- **Type:** `string`  
- **Description:** Transition between bright and dim colors, if requested  
- **Inherited from:** [AdaptiveIlluminationShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#transition)

### VERTEX_ATTRIBUTES
- **Type:** `string`  
- **Description:** Common attributes for vertex shaders.  
- **Inherited from:** [AdaptiveIlluminationShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_attributes)

### VERTEX_FRAGMENT_VARYINGS
- **Type:** `string`  
- **Description:** Common varyings shared by vertex and fragment shaders.  
- **Inherited from:** [AdaptiveIlluminationShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_fragment_varyings)

### VERTEX_FUNCTIONS
- **Type:** `string` (default: `""`)  
- **Description:** Common functions used by the vertex shaders.  
- **Inherited from:** [AdaptiveIlluminationShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_functions)

### VERTEX_UNIFORMS
- **Type:** `string`  
- **Description:** Common uniforms for vertex shaders.  
- **Inherited from:** [AdaptiveIlluminationShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_uniforms)

### vertexShader
- **Type:** `string`  
- **Description:** The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
- **Inherited from:** [AdaptiveIlluminationShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertexshader)

---

## Accessors

### isRequired
```typescript
get isRequired(): boolean
```
- **Description:** Flag whether the illumination shader is currently required.  
- **Returns:** `boolean`  
- **Inherited from:** [AdaptiveIlluminationShader.isRequired](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#isrequired)

### ADJUSTMENTS
```typescript
get ADJUSTMENTS(): string
```
- **Description:** The adjustments made into fragment shaders  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveIlluminationShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#adjustments)

### BACKGROUND_TECHNIQUES
```typescript
get BACKGROUND_TECHNIQUES(): string
```
- **Description:** The coloration technique background shader fragment  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveIlluminationShader.BACKGROUND_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#background_techniques)

### COLORATION_TECHNIQUES
```typescript
static get COLORATION_TECHNIQUES(): string
```
- **Description:** The coloration technique coloration shader fragment  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveIlluminationShader.COLORATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#coloration_techniques)

### ILLUMINATION_TECHNIQUES
```typescript
static get ILLUMINATION_TECHNIQUES(): string
```
- **Description:** The coloration technique illumination shader fragment  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveIlluminationShader.ILLUMINATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#illumination_techniques)

---

## Methods

### reset
```typescript
reset(): void
```
- **Description:** Reset the shader uniforms back to their initial values.  
- **Returns:** `void`  
- **Inherited from:** [AdaptiveIlluminationShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#reset)

### update
```typescript
update(): void
```
- **Description:** Called before rendering.  
- **Returns:** `void`  
- **Inherited from:** [AdaptiveIlluminationShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#update)

### _configure (protected)
```typescript
protected _configure(): void
```
- **Description:** A one time initialization performed on creation.  
- **Returns:** `void`  
- **Inherited from:** [AdaptiveIlluminationShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#_configure)

### _preRender (protected)
```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```
- **Description:** Perform operations which are required before binding the Shader to the Renderer.  
- **Parameters:**  
  - **mesh**: `DisplayObject` — The mesh display object linked to this shader.  
  - **renderer**: `Renderer` — The renderer  
- **Returns:** `void`  
- **Inherited from:** [AdaptiveIlluminationShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#_prerender)

### create (static)
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
- **Description:** A factory method for creating the shader using its defined default values  
- **Parameters:**  
  - **initialUniforms**: `object`  
- **Returns:** `AbstractBaseShader`  
- **Inherited from:** [AdaptiveIlluminationShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#create)

### getShaderTechniques (static)
```typescript
static getShaderTechniques(shaderType: string): string
```
- **Description:** Construct adaptive shader according to shader type  
- **Parameters:**  
  - **shaderType**: `string` — shader type to construct : coloration, illumination, background, etc.  
- **Returns:** `string` — the constructed shader adaptive block  
- **Inherited from:** [AdaptiveIlluminationShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#getshadertechniques)

---

For more information see the [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html).