# AdaptiveIlluminationShader | Foundry Virtual Tabletop - API Documentation - Version 13

The default coloration shader used by standard rendering and animations. A fragment shader which creates a solid light source.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.AdaptiveIlluminationShader), Expand

- [AdaptiveLightingShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html)  
  - **AdaptiveIlluminationShader**  
    - [BewitchingWaveIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BewitchingWaveIlluminationShader.html)  
    - [FairyLightIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.FairyLightIlluminationShader.html)  
    - [FlameIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.FlameIlluminationShader.html)  
    - [GhostLightIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GhostLightIlluminationShader.html)  
    - [PulseIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PulseIlluminationShader.html)  
    - [SirenIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SirenIlluminationShader.html)  
    - [SmokePatchIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SmokePatchIlluminationShader.html)  
    - [SunburstIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SunburstIlluminationShader.html)  
    - [TorchIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.TorchIlluminationShader.html)  
    - [VortexIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.VortexIlluminationShader.html)  
    - [WaveIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.WaveIlluminationShader.html)

---

## Properties

### initialUniforms  
`initialUniforms: object`  
The initial values of the shader uniforms.  
Inherited from [AdaptiveLightingShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#initialuniforms)

---

## Static Properties

### COMPUTE_ILLUMINATION  
`COMPUTE_ILLUMINATION: string = ...`  
Compute illumination uniforms  
Inherited from [AdaptiveLightingShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#compute_illumination)

### CONSTANTS  
`CONSTANTS: string = ...`  
Inherited from [AdaptiveLightingShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#constants)

### CONTRAST  
`CONTRAST: string = ...`  
Contrast adjustment  
Inherited from [AdaptiveLightingShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#contrast)

### defaultUniforms  
```typescript
defaultUniforms: {
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
} = ...
```
The default uniform values for the shader.  
A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
Overrides [AdaptiveLightingShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#defaultuniforms)

### EXPOSURE  
`EXPOSURE: string = ...`  
Overrides [AdaptiveLightingShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#exposure)

### FALLOFF  
`FALLOFF: string = ...`  
Incorporate falloff if an attenuation uniform is requested  
Inherited from [AdaptiveLightingShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#falloff)

### forceDefaultColor  
`forceDefaultColor: boolean = false`  
Has this lighting shader a forced default color?  
Inherited from [AdaptiveLightingShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#forcedefaultcolor)

### FRAGMENT_BEGIN  
`FRAGMENT_BEGIN: string = ...`  
Initialize fragment with common properties  
Inherited from [AdaptiveLightingShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_begin)

### FRAGMENT_END  
`FRAGMENT_END: string = ...`  
Overrides [AdaptiveLightingShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_end)

### FRAGMENT_FUNCTIONS  
`FRAGMENT_FUNCTIONS: string = ...`  
Common functions used by the fragment shaders.  
Inherited from [AdaptiveLightingShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_functions)

### FRAGMENT_UNIFORMS  
`FRAGMENT_UNIFORMS: string = ...`  
Common uniforms shared by fragment shaders.  
Inherited from [AdaptiveLightingShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_uniforms)

### fragmentShader  
`fragmentShader: string = ...`  
Overrides [AdaptiveLightingShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragmentshader)

### SATURATION  
`SATURATION: string = ...`  
Saturation adjustment  
Inherited from [AdaptiveLightingShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#saturation)

### SHADER_HEADER  
`SHADER_HEADER: string = ...`  
Memory allocations for the Adaptive Illumination Shader

### SHADER_TECHNIQUES  
`SHADER_TECHNIQUES: Record<string, [ShaderTechnique](https://foundryvtt.com/api/interfaces/foundry.ShaderTechnique.html)> = ...`  
A mapping of available shader techniques  
Inherited from [AdaptiveLightingShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shader_techniques)

### SHADOW  
`SHADOW: string = ...`  
Shadow adjustment  
Inherited from [AdaptiveLightingShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shadow)

### SWITCH_COLOR  
`SWITCH_COLOR: string = ...`  
Switch between an inner and outer color, by comparing distance from center to ratio.  
Apply a strong gradient between the two areas if attenuation uniform is set to true.  
Inherited from [AdaptiveLightingShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#switch_color)

### TRANSITION  
`TRANSITION: string = ...`  
Transition between bright and dim colors, if requested  
Inherited from [AdaptiveLightingShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#transition)

### VERTEX_ATTRIBUTES  
`VERTEX_ATTRIBUTES: string = ...`  
Common attributes for vertex shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_attributes)

### VERTEX_FRAGMENT_VARYINGS  
`VERTEX_FRAGMENT_VARYINGS: string = ...`  
Common varyings shared by vertex and fragment shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_fragment_varyings)

### VERTEX_FUNCTIONS  
`VERTEX_FUNCTIONS: string = ""`  
Common functions used by the vertex shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_functions)

### VERTEX_UNIFORMS  
`VERTEX_UNIFORMS: string = ...`  
Common uniforms for vertex shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_uniforms)

### vertexShader  
`vertexShader: string = ...`  
The raw vertex shader used by this class.  
A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
Inherited from [AdaptiveLightingShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertexshader)

---

## Accessors

### isRequired  
`get isRequired(): boolean`  
Flag whether the illumination shader is currently required.  
**Returns:** `boolean`

### ADJUSTMENTS  
`get ADJUSTMENTS(): string`  
The adjustments made into fragment shaders  
Overrides `AdaptiveLightingShader.ADJUSTMENTS`  
**Returns:** `string`

### BACKGROUND_TECHNIQUES  
`get BACKGROUND_TECHNIQUES(): string`  
The coloration technique background shader fragment  
**Returns:** `string`

### COLORATION_TECHNIQUES  
`get COLORATION_TECHNIQUES(): string`  
The coloration technique coloration shader fragment  
**Returns:** `string`

### ILLUMINATION_TECHNIQUES  
`get ILLUMINATION_TECHNIQUES(): string`  
The coloration technique illumination shader fragment  
**Returns:** `string`

---

## Methods

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
Inherited from [AdaptiveLightingShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#reset)  
**Returns:** `void`

### update  
```typescript
update(): void
```
Called before rendering.  
Inherited from [AdaptiveLightingShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#update)  
**Returns:** `void`

### _configure (protected)  
```typescript
_configure(): void
```
A one-time initialization performed on creation.  
Inherited from [AdaptiveLightingShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_configure)  
**Returns:** `void`

### _preRender (protected)  
```typescript
_preRender(mesh: DisplayObject, renderer: Renderer): void
```
Perform operations which are required before binding the Shader to the Renderer.  

**Parameters:**  
- **mesh**: `DisplayObject` — The mesh display object linked to this shader.  
- **renderer**: `Renderer` — The renderer  

Inherited from [AdaptiveLightingShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_prerender)  
**Returns:** `void`

### create (static)  
```typescript
create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.  

**Parameters:**  
- **initialUniforms**: `object` — Initial uniform values  

**Returns:**  
- `AbstractBaseShader`  

Inherited from [AdaptiveLightingShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#create)

### getShaderTechniques (static)  
```typescript
getShaderTechniques(shaderType: string): string
```
Construct adaptive shader according to shader type.  

**Parameters:**  
- **shaderType**: `string` — shader type to construct: coloration, illumination, background, etc.  

**Returns:**  
- `string` — the constructed shader adaptive block  

Inherited from [AdaptiveLightingShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#getshadertechniques)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)