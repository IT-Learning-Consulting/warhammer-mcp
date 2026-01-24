# AdaptiveDarknessShader

The default coloration shader used by standard rendering and animations. A fragment shader which creates a solid light source.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

Belongs to the module path: [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html)

---

## Hierarchy  
- _AdaptiveLightingShader_  
- **AdaptiveDarknessShader**  
- _BlackHoleDarknessShader_  
- _MagicalGloomDarknessShader_  
- _RoilingDarknessShader_  
- _DenseSmokeDarknessShader_

---

## Properties

### initialUniforms
- **Type:** `object`  
- **Description:** The initial values of the shader uniforms.  
- **Inherited from:** [AdaptiveLightingShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#initialuniforms)

---

## Static Properties

### COMPUTE_ILLUMINATION
- **Type:** `string`  
- **Description:** Compute illumination uniforms  
- **Inherited from:** [AdaptiveLightingShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#compute_illumination)

---

### CONSTANTS
- **Type:** `string`  
- **Description:** Constants definition  
- **Inherited from:** [AdaptiveLightingShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#constants)

---

### CONTRAST
- **Type:** `string`  
- **Description:** Contrast adjustment  
- **Inherited from:** [AdaptiveLightingShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#contrast)

---

### defaultUniforms
- **Type:**  
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
- **Description:** Overrides default uniforms from AdaptiveLightingShader  
- **Inherited from:** [AdaptiveLightingShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#defaultuniforms)

---

### EXPOSURE
- **Type:** `string`  
- **Description:** Exposure adjustment  
- **Inherited from:** [AdaptiveLightingShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#exposure)

---

### FALLOFF
- **Type:** `string`  
- **Description:** Incorporate falloff if an attenuation uniform is requested  
- **Inherited from:** [AdaptiveLightingShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#falloff)

---

### forceDefaultColor
- **Type:** `boolean` = `false`  
- **Description:** Has this lighting shader a forced default color?  
- **Inherited from:** [AdaptiveLightingShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#forcedefaultcolor)

---

### FRAGMENT_BEGIN
- **Type:** `string`  
- **Description:** Initialize fragment with common properties  
- **Overrides:** [AdaptiveLightingShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_begin)

---

### FRAGMENT_END
- **Type:** `string`  
- **Description:** Shader final  
- **Overrides:** [AdaptiveLightingShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_end)

---

### FRAGMENT_FUNCTIONS
- **Type:** `string`  
- **Description:** Common functions used by the fragment shaders.  
- **Inherited from:** [AdaptiveLightingShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_functions)

---

### FRAGMENT_UNIFORMS
- **Type:** `string`  
- **Description:** Common uniforms shared by fragment shaders.  
- **Inherited from:** [AdaptiveLightingShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_uniforms)

---

### fragmentShader
- **Type:** `string`  
- **Description:**  
  The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the `fragmentShader` static field.  
- **Overrides:** [AdaptiveLightingShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragmentshader)

---

### SATURATION
- **Type:** `string`  
- **Description:** Saturation adjustment  
- **Inherited from:** [AdaptiveLightingShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#saturation)

---

### SHADER_HEADER
- **Type:** `string`  
- **Description:** Memory allocations for the Adaptive Background Shader

---

### SHADER_TECHNIQUES
- **Type:** `Record<string, ShaderTechnique>`  
- **Description:** A mapping of available shader techniques  
- **Inherited from:** [AdaptiveLightingShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shader_techniques)

---

### SHADOW
- **Type:** `string`  
- **Description:** Shadow adjustment  
- **Inherited from:** [AdaptiveLightingShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shadow)

---

### SWITCH_COLOR
- **Type:** `string`  
- **Description:**  
  Switch between an inner and outer color, by comparing distance from center to ratio.  
  Apply a strong gradient between the two areas if attenuation uniform is set to true  
- **Inherited from:** [AdaptiveLightingShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#switch_color)

---

### TRANSITION
- **Type:** `string`  
- **Description:** Transition between bright and dim colors, if requested  
- **Inherited from:** [AdaptiveLightingShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#transition)

---

### VERTEX_ATTRIBUTES
- **Type:** `string`  
- **Description:** Common attributes for vertex shaders.  
- **Inherited from:** [AdaptiveLightingShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_attributes)

---

### VERTEX_FRAGMENT_VARYINGS
- **Type:** `string`  
- **Description:** Common varyings shared by vertex and fragment shaders.  
- **Inherited from:** [AdaptiveLightingShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_fragment_varyings)

---

### VERTEX_FUNCTIONS
- **Type:** `string` = `""`  
- **Description:** Common functions used by the vertex shaders.  
- **Inherited from:** [AdaptiveLightingShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_functions)

---

### VERTEX_UNIFORMS
- **Type:** `string`  
- **Description:** Common uniforms for vertex shaders.  
- **Inherited from:** [AdaptiveLightingShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_uniforms)

---

### vertexShader
- **Type:** `string`  
- **Description:**  
  The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
- **Inherited from:** [AdaptiveLightingShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertexshader)

---

## Accessors

### isRequired
```typescript
get isRequired(): boolean
```
- **Description:**  
  Flag whether the darkness shader is currently required. Check vision modes requirements first, then if key uniforms are at their default values, we don't need to render the background container.
- **Returns:** `boolean`

---

### ADJUSTMENTS
```typescript
static get ADJUSTMENTS(): string
```
- **Description:** The adjustments made into fragment shaders  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveLightingShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#adjustments)

---

### BACKGROUND_TECHNIQUES
```typescript
static get BACKGROUND_TECHNIQUES(): string
```
- **Description:** The coloration technique background shader fragment  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveLightingShader.BACKGROUND_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#background_techniques)

---

### COLORATION_TECHNIQUES
```typescript
static get COLORATION_TECHNIQUES(): string
```
- **Description:** The coloration technique coloration shader fragment  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveLightingShader.COLORATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#coloration_techniques)

---

### ILLUMINATION_TECHNIQUES
```typescript
static get ILLUMINATION_TECHNIQUES(): string
```
- **Description:** The coloration technique illumination shader fragment  
- **Returns:** `string`  
- **Inherited from:** [AdaptiveLightingShader.ILLUMINATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#illumination_techniques)

---

## Methods

### reset
```typescript
reset(): void
```
- **Description:** Reset the shader uniforms back to their initial values.  
- **Returns:** `void`  
- **Inherited from:** [AdaptiveLightingShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#reset)

---

### update
```typescript
update(): void
```
- **Returns:** `void`  
- **Overrides:** [AdaptiveLightingShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#update)

---

### _configure
```typescript
protected _configure(): void
```
- **Description:** A one time initialization performed on creation.  
- **Returns:** `void`  
- **Protected method**  
- **Inherited from:** [AdaptiveLightingShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_configure)

---

### _preRender
```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```
- **Description:**  
  Perform operations which are required before binding the Shader to the Renderer.  
- **Parameters:**  
  - **mesh**: `DisplayObject` — The mesh display object linked to this shader.  
  - **renderer**: `Renderer` — The renderer  
- **Returns:** `void`  
- **Protected method**  
- **Inherited from:** [AdaptiveLightingShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_prerender)

---

### create
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
- **Description:** A factory method for creating the shader using its defined default values  
- **Parameters:**  
  - **initialUniforms**: `object`  
- **Returns:** `AbstractBaseShader`  
- **Inherited from:** [AdaptiveLightingShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#create)

---

### getShaderTechniques
```typescript
static getShaderTechniques(shaderType: string): string
```
- **Description:** Construct adaptive shader according to shader type  
- **Parameters:**  
  - **shaderType**: `string` — shader type to construct : coloration, illumination, background, etc.  
- **Returns:** `string` — the constructed shader adaptive block  
- **Inherited from:** [AdaptiveLightingShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#getshadertechniques)