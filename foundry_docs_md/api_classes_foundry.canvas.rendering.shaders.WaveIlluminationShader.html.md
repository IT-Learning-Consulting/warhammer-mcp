# WaveIlluminationShader

Wave animation illumination shader

## Hierarchy  
- [AdaptiveIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html)  
- **WaveIlluminationShader**

---

## Properties

### initialUniforms  
**initialUniforms**: *object*  
The initial values of the shader uniforms.  
Inherited from [AdaptiveIlluminationShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#initialuniforms)

---

### Static Properties

- **COMPUTE_ILLUMINATION**: *string*  
  Compute illumination uniforms  
  Inherited from [AdaptiveIlluminationShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#compute_illumination)

- **CONSTANTS**: *string*  
  Inherited from [AdaptiveIlluminationShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#constants)

- **CONTRAST**: *string*  
  Contrast adjustment  
  Inherited from [AdaptiveIlluminationShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#contrast)

- **defaultUniforms**:  
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
  The default uniform values for the shader.  
  A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
  Inherited from [AdaptiveIlluminationShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#defaultuniforms)

- **EXPOSURE**: *string*  
  Inherited from [AdaptiveIlluminationShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#exposure)

- **FALLOFF**: *string*  
  Incorporate falloff if an attenuation uniform is requested  
  Inherited from [AdaptiveIlluminationShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#falloff)

- **forceDefaultColor**: *boolean* = false  
  Has this lighting shader a forced default color?  
  Inherited from [AdaptiveIlluminationShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#forcedefaultcolor)

- **FRAGMENT_BEGIN**: *string*  
  Initialize fragment with common properties  
  Inherited from [AdaptiveIlluminationShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_begin)

- **FRAGMENT_END**: *string*  
  Inherited from [AdaptiveIlluminationShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_end)

- **FRAGMENT_FUNCTIONS**: *string*  
  Common functions used by the fragment shaders.  
  Inherited from [AdaptiveIlluminationShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_functions)

- **FRAGMENT_UNIFORMS**: *string*  
  Common uniforms shared by fragment shaders.  
  Inherited from [AdaptiveIlluminationShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_uniforms)

- **fragmentShader**: *string*  
  Overrides [AdaptiveIlluminationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragmentshader)

- **SATURATION**: *string*  
  Saturation adjustment  
  Inherited from [AdaptiveIlluminationShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#saturation)

- **SHADER_HEADER**: *string*  
  Memory allocations for the Adaptive Illumination Shader  
  Inherited from [AdaptiveIlluminationShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shader_header)

- **SHADER_TECHNIQUES**: *Record<string, [ShaderTechnique](https://foundryvtt.com/api/interfaces/foundry.ShaderTechnique.html)>*  
  A mapping of available shader techniques  
  Inherited from [AdaptiveIlluminationShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shader_techniques)

- **SHADOW**: *string*  
  Shadow adjustment  
  Inherited from [AdaptiveIlluminationShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shadow)

- **SWITCH_COLOR**: *string*  
  Switch between an inner and outer color, by comparing distance from center to ratio.  
  Apply a strong gradient between the two areas if attenuation uniform is set to true  
  Inherited from [AdaptiveIlluminationShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#switch_color)

- **TRANSITION**: *string*  
  Transition between bright and dim colors, if requested  
  Inherited from [AdaptiveIlluminationShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#transition)

- **VERTEX_ATTRIBUTES**: *string*  
  Common attributes for vertex shaders.  
  Inherited from [AdaptiveIlluminationShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_attributes)

- **VERTEX_FRAGMENT_VARYINGS**: *string*  
  Common varyings shared by vertex and fragment shaders.  
  Inherited from [AdaptiveIlluminationShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_fragment_varyings)

- **VERTEX_FUNCTIONS**: *string* = ""  
  Common functions used by the vertex shaders.  
  Inherited from [AdaptiveIlluminationShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_functions)

- **VERTEX_UNIFORMS**: *string*  
  Common uniforms for vertex shaders.  
  Inherited from [AdaptiveIlluminationShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_uniforms)

- **vertexShader**: *string*  
  The raw vertex shader used by this class.  
  A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
  Inherited from [AdaptiveIlluminationShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertexshader)

---

## Accessors

### isRequired  
```typescript
get isRequired(): boolean
```
Flag whether the illumination shader is currently required.  
**Returns:** *boolean*  
Inherited from `AdaptiveIlluminationShader.isRequired`

---

### ADJUSTMENTS  
```typescript
get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders.  
**Returns:** *string*  
Inherited from `AdaptiveIlluminationShader.ADJUSTMENTS`

---

### BACKGROUND_TECHNIQUES  
```typescript
get BACKGROUND_TECHNIQUES(): string
```
The coloration technique background shader fragment.  
**Returns:** *string*  
Inherited from `AdaptiveIlluminationShader.BACKGROUND_TECHNIQUES`

---

### COLORATION_TECHNIQUES  
```typescript
static get COLORATION_TECHNIQUES(): string
```
The coloration technique coloration shader fragment.  
**Returns:** *string*  
Inherited from `AdaptiveIlluminationShader.COLORATION_TECHNIQUES`

---

### ILLUMINATION_TECHNIQUES  
```typescript
static get ILLUMINATION_TECHNIQUES(): string
```
The coloration technique illumination shader fragment.  
**Returns:** *string*  
Inherited from `AdaptiveIlluminationShader.ILLUMINATION_TECHNIQUES`

---

## Methods

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
**Returns:** *void*  
Inherited from [AdaptiveIlluminationShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#reset)

---

### update  
```typescript
update(): void
```
Called before rendering.  
**Returns:** *void*  
Inherited from [AdaptiveIlluminationShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#update)

---

### _configure  
```typescript
protected _configure(): void
```
A one time initialization performed on creation.  
**Returns:** *void*  
Inherited from [AdaptiveIlluminationShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#_configure)

---

### _preRender  
```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```
Perform operations which are required before binding the Shader to the Renderer.

**Parameters:**

- **mesh**: *DisplayObject*  
  The mesh display object linked to this shader.

- **renderer**: *Renderer*  
  The renderer.

**Returns:** *void*  
Inherited from [AdaptiveIlluminationShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#_prerender)

---

### create  
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: *object*

**Returns:** *AbstractBaseShader*  
Inherited from [AdaptiveIlluminationShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#create)

---

### getShaderTechniques  
```typescript
static getShaderTechniques(shaderType: string): string
```
Construct adaptive shader according to shader type.

**Parameters:**

- **shaderType**: *string*  
  Shader type to construct: coloration, illumination, background, etc.

**Returns:** *string*  
The constructed shader adaptive block.  
Inherited from [AdaptiveIlluminationShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#getshadertechniques)

---

_For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.WaveIlluminationShader.html)._