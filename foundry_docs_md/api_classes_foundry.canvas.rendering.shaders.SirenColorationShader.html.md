# SirenColorationShader | Foundry Virtual Tabletop - API Documentation - Version 13

Siren light animation coloration shader

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.SirenColorationShader)  
- _AdaptiveColorationShader_  
- **SirenColorationShader**

---

## Properties

### initialUniforms  
**Type:** `object`  
The initial values of the shader uniforms.  
Inherited from [AdaptiveColorationShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#initialuniforms).

---

### Static Properties

- **COMPUTE_ILLUMINATION**: `string`  
  Compute illumination uniforms  
  Inherited from [AdaptiveColorationShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#compute_illumination)

- **CONSTANTS**: `string`  
  Inherited from [AdaptiveColorationShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#constants)

- **CONTRAST**: `string`  
  Contrast adjustment  
  Inherited from [AdaptiveColorationShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#contrast)

- **defaultUniforms**:  
  ```typescript
  {
    ambientBrightest: number[];
    ambientDarkness: number[];
    ambientDaylight: number[];
    angle: number;
    attenuation: number;
    beamLength: number;
    brightLevelCorrection: number;
    brightnessPulse: number;
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
    gradientFade: number;
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
  The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
  Overrides [AdaptiveColorationShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#defaultuniforms)

- **EXPOSURE**: `string`  
  Exposure adjustment  
  Inherited from [AdaptiveColorationShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#exposure)

- **FALLOFF**: `string`  
  Incorporate falloff if an attenuation uniform is requested  
  Inherited from [AdaptiveColorationShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#falloff)

- **forceDefaultColor**: `boolean` = false  
  Has this lighting shader a forced default color?  
  Inherited from [AdaptiveColorationShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#forcedefaultcolor)

- **FRAGMENT_BEGIN**: `string`  
  Initialize fragment with common properties  
  Inherited from [AdaptiveColorationShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_begin)

- **FRAGMENT_END**: `string`  
  Inherited from [AdaptiveColorationShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_end)

- **FRAGMENT_FUNCTIONS**: `string`  
  Common functions used by the fragment shaders.  
  Inherited from [AdaptiveColorationShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_functions)

- **FRAGMENT_UNIFORMS**: `string`  
  Common uniforms shared by fragment shaders.  
  Inherited from [AdaptiveColorationShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_uniforms)

- **fragmentShader**: `string`  
  Overrides [AdaptiveColorationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragmentshader)

- **SATURATION**: `string`  
  Saturation adjustment  
  Inherited from [AdaptiveColorationShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#saturation)

- **SHADER_HEADER**: `string`  
  Memory allocations for the Adaptive Coloration Shader  
  Inherited from [AdaptiveColorationShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_header)

- **SHADER_TECHNIQUES**: `Record<string, ShaderTechnique>`  
  A mapping of available shader techniques  
  Inherited from [AdaptiveColorationShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_techniques)

- **SHADOW**: `string`  
  Inherited from [AdaptiveColorationShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shadow)

- **SWITCH_COLOR**: `string`  
  Switch between an inner and outer color, by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true.  
  Inherited from [AdaptiveColorationShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#switch_color)

- **TRANSITION**: `string`  
  Transition between bright and dim colors, if requested  
  Inherited from [AdaptiveColorationShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#transition)

- **VERTEX_ATTRIBUTES**: `string`  
  Common attributes for vertex shaders.  
  Inherited from [AdaptiveColorationShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_attributes)

- **VERTEX_FRAGMENT_VARYINGS**: `string`  
  Common varyings shared by vertex and fragment shaders.  
  Inherited from [AdaptiveColorationShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_fragment_varyings)

- **VERTEX_FUNCTIONS**: `string` = `""`  
  Common functions used by the vertex shaders.  
  Inherited from [AdaptiveColorationShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_functions)

- **VERTEX_UNIFORMS**: `string`  
  Common uniforms for vertex shaders.  
  Inherited from [AdaptiveColorationShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_uniforms)

- **vertexShader**: `string`  
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
Inherited from AdaptiveColorationShader.isRequired

---

### ADJUSTMENTS  
```typescript
get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders

**Returns:** `string`  
Inherited from AdaptiveColorationShader.ADJUSTMENTS

---

### BACKGROUND_TECHNIQUES  
```typescript
get BACKGROUND_TECHNIQUES(): string
```
The coloration technique background shader fragment

**Returns:** `string`  
Inherited from AdaptiveColorationShader.BACKGROUND_TECHNIQUES

---

### COLORATION_TECHNIQUES  
```typescript
get COLORATION_TECHNIQUES(): string
```
The coloration technique coloration shader fragment

**Returns:** `string`  
Inherited from AdaptiveColorationShader.COLORATION_TECHNIQUES

---

### ILLUMINATION_TECHNIQUES  
```typescript
get ILLUMINATION_TECHNIQUES(): string
```
The coloration technique illumination shader fragment

**Returns:** `string`  
Inherited from AdaptiveColorationShader.ILLUMINATION_TECHNIQUES

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

### _configure (protected)  
```typescript
protected _configure(): void
```
A one time initialization performed on creation.

**Returns:** `void`  
Inherited from [AdaptiveColorationShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_configure)

---

### _preRender (protected)  
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
Inherited from [AdaptiveColorationShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_prerender)

---

### create (static)  
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.

**Parameters:**  
- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`  
Inherited from [AdaptiveColorationShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#create)

---

### getShaderTechniques (static)  
```typescript
static getShaderTechniques(shaderType: string): string
```
Construct adaptive shader according to shader type.

**Parameters:**  
- **shaderType**: `string`  
  shader type to construct: coloration, illumination, background, etc.

**Returns:** `string`  
the constructed shader adaptive block  
Inherited from [AdaptiveColorationShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#getshadertechniques)