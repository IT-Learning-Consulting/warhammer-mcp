# SirenIlluminationShader

Siren light animation illumination shader

[Foundry Virtual Tabletop - API Documentation - Version 13 / foundry / canvas / rendering / shaders / SirenIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SirenIlluminationShader.html)

## Hierarchy  
- [AdaptiveIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html)  
- **SirenIlluminationShader**

---

## Properties

### initialUniforms  
**Type:** `object`  
The initial values of the shader uniforms.  
Inherited from [AdaptiveIlluminationShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#initialuniforms)

### Static Properties

| Name                   | Type                | Description                                                                                   | Inherited From                                                                                          |
|------------------------|---------------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| **COMPUTE_ILLUMINATION** | `string`            | Compute illumination uniforms                                                                | [AdaptiveIlluminationShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#compute_illumination)  |
| **CONSTANTS**           | `string`            | Constants used by the shader                                                                 | [AdaptiveIlluminationShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#constants)                    |
| **CONTRAST**            | `string`            | Contrast adjustment                                                                          | [AdaptiveIlluminationShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#contrast)                        |
| **defaultUniforms**     | `{ ambientBrightest: number[]; ambientDarkness: number[]; ambientDaylight: number[]; angle: number; attenuation: number; beamLength: number; brightLevelCorrection: number; color: number[]; colorBackground: number[]; colorBright: number[]; colorDim: number[]; computeIllumination: boolean; contrast: number; darknessLevel: number; darknessLevelTexture: null; depthElevation: number; depthTexture: null; dimLevelCorrection: number; exposure: number; globalLight: boolean; globalLightThresholds: number[]; gradientFade: number; intensity: number; primaryTexture: null; ratio: number; saturation: number; screenDimensions: number[]; shadows: number; technique: number; time: number; useSampler: boolean; weights: number[]; }` | The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field. Overrides [AdaptiveIlluminationShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#defaultuniforms) |
| **EXPOSURE**            | `string`            | Exposure adjustment                                                                         | [AdaptiveIlluminationShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#exposure)                      |
| **FALLOFF**             | `string`            | Incorporate falloff if an attenuation uniform is requested                                  | [AdaptiveIlluminationShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#falloff)                        |
| **forceDefaultColor**   | `boolean`           = `false`  
Has this lighting shader a forced default color?  
Inherited from [AdaptiveIlluminationShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#forcedefaultcolor) |
| **FRAGMENT_BEGIN**      | `string`            | Initialize fragment with common properties                                                 | [AdaptiveIlluminationShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_begin)          |
| **FRAGMENT_END**        | `string`            | Fragment shader end                                                                        | [AdaptiveIlluminationShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_end)              |
| **FRAGMENT_FUNCTIONS**  | `string`            | Common functions used by the fragment shaders                                             | [AdaptiveIlluminationShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_functions)  |
| **FRAGMENT_UNIFORMS**   | `string`            | Common uniforms shared by fragment shaders                                               | [AdaptiveIlluminationShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragment_uniforms)     |
| **fragmentShader**      | `string`            | The raw fragment shader used by this class. Overrides [AdaptiveIlluminationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#fragmentshader) |
| **SATURATION**          | `string`            | Saturation adjustment                                                                     | [AdaptiveIlluminationShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#saturation)                  |
| **SHADER_HEADER**       | `string`            | Memory allocations for the Adaptive Illumination Shader                                  | [AdaptiveIlluminationShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shader_header)             |
| **SHADER_TECHNIQUES**   | `Record<string, ShaderTechnique>`  
A mapping of available shader techniques  
Inherited from [AdaptiveIlluminationShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shader_techniques) |
| **SHADOW**              | `string`            | Shadow adjustment                                                                         | [AdaptiveIlluminationShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#shadow)                            |
| **SWITCH_COLOR**        | `string`            | Switch between an inner and outer color, by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true | [AdaptiveIlluminationShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#switch_color)               |
| **TRANSITION**          | `string`            | Transition between bright and dim colors, if requested                                   | [AdaptiveIlluminationShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#transition)                  |
| **VERTEX_ATTRIBUTES**   | `string`            | Common attributes for vertex shaders                                                    | [AdaptiveIlluminationShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_attributes)    |
| **VERTEX_FRAGMENT_VARYINGS** | `string`        | Common varyings shared by vertex and fragment shaders                                   | [AdaptiveIlluminationShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_fragment_varyings) |
| **VERTEX_FUNCTIONS**    | `string` = `""`      | Common functions used by the vertex shaders                                            | [AdaptiveIlluminationShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_functions)      |
| **VERTEX_UNIFORMS**     | `string`            | Common uniforms for vertex shaders                                                     | [AdaptiveIlluminationShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertex_uniforms)          |
| **vertexShader**        | `string`            | The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field. Overrides [AdaptiveIlluminationShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#vertexshader) |

---

## Accessors

### isRequired  
```typescript
get isRequired(): boolean
```
Flag whether the illumination shader is currently required.  
**Returns:** `boolean`  
Inherited from `AdaptiveIlluminationShader.isRequired`

### ADJUSTMENTS  
```typescript
get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders  
**Returns:** `string`  
Inherited from `AdaptiveIlluminationShader.ADJUSTMENTS`

### BACKGROUND_TECHNIQUES  
```typescript
get BACKGROUND_TECHNIQUES(): string
```
The coloration technique background shader fragment  
**Returns:** `string`  
Inherited from `AdaptiveIlluminationShader.BACKGROUND_TECHNIQUES`

### COLORATION_TECHNIQUES  
```typescript
static get COLORATION_TECHNIQUES(): string
```
The coloration technique coloration shader fragment  
**Returns:** `string`  
Inherited from `AdaptiveIlluminationShader.COLORATION_TECHNIQUES`

### ILLUMINATION_TECHNIQUES  
```typescript
static get ILLUMINATION_TECHNIQUES(): string
```
The coloration technique illumination shader fragment  
**Returns:** `string`  
Inherited from `AdaptiveIlluminationShader.ILLUMINATION_TECHNIQUES`

---

## Methods

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
**Returns:** `void`  
Inherited from [AdaptiveIlluminationShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#reset)

### update  
```typescript
update(): void
```
Called before rendering.  
**Returns:** `void`  
Inherited from [AdaptiveIlluminationShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#update)

### _configure  
```typescript
protected _configure(): void
```
Protected  
A one time initialization performed on creation.  
**Returns:** `void`  
Inherited from [AdaptiveIlluminationShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#_configure)

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
Inherited from [AdaptiveIlluminationShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#_prerender)

### create  
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`  
Inherited from [AdaptiveIlluminationShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#create)

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
Inherited from [AdaptiveIlluminationShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html#getshadertechniques)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)