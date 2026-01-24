# WaveColorationVisionShader

The wave vision shader, used to create waves emanations (ex: tremorsense).

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

## Hierarchy  
- [ColorationVisionShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html)  
- WaveColorationVisionShader

---

## Properties

### initialUniforms  
`initialUniforms: object`  
The initial values of the shader uniforms.  
Inherited from [ColorationVisionShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#initialuniforms)

### Static Properties

- **COMPUTE_ILLUMINATION**  
  `COMPUTE_ILLUMINATION: string = ...`  
  Compute illumination uniforms  
  Inherited from [ColorationVisionShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#compute_illumination)

- **CONSTANTS**  
  `CONSTANTS: string = ...`  
  Inherit Doc  
  Inherited from [ColorationVisionShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#constants)

- **CONTRAST**  
  `CONTRAST: string = ""`  
  Inherited from [ColorationVisionShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#contrast)

- **defaultUniforms**  
  ```typescript
  defaultUniforms: {
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
  } = ...
  ```
  The default uniform values for the shader. A subclass of AbstractBaseShader must implement the defaultUniforms static field.  
  Overrides [ColorationVisionShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#defaultuniforms)

- **EXPOSURE**  
  `EXPOSURE: string = ""`  
  Inherited from [ColorationVisionShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#exposure)

- **FALLOFF**  
  `FALLOFF: string = ...`  
  Incorporate falloff if a attenuation uniform is requested  
  Inherited from [ColorationVisionShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#falloff)

- **forceDefaultColor**  
  `forceDefaultColor: boolean = false`  
  Has this lighting shader a forced default color?  
  Inherited from [ColorationVisionShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#forcedefaultcolor)

- **FRAGMENT_BEGIN**  
  `FRAGMENT_BEGIN: string = ...`  
  Inherited from [ColorationVisionShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#fragment_begin)

- **FRAGMENT_END**  
  `FRAGMENT_END: string = ...`  
  Shader final  
  Inherited from [ColorationVisionShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#fragment_end)

- **FRAGMENT_FUNCTIONS**  
  `FRAGMENT_FUNCTIONS: string = ...`  
  Common functions used by the fragment shaders.  
  Inherited from [ColorationVisionShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#fragment_functions)

- **FRAGMENT_UNIFORMS**  
  `FRAGMENT_UNIFORMS: string = ...`  
  Common uniforms shared by fragment shaders.  
  Inherited from [ColorationVisionShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#fragment_uniforms)

- **fragmentShader**  
  `fragmentShader: string = ...`  
  The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the fragmentShader static field.  
  Overrides [ColorationVisionShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#fragmentshader)

- **SATURATION**  
  `SATURATION: string = ...`  
  Saturation adjustment  
  Inherited from [ColorationVisionShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#saturation)

- **SHADER_HEADER**  
  `SHADER_HEADER: string = ...`  
  Memory allocations for the Adaptive Coloration Shader  
  Inherited from [ColorationVisionShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#shader_header)

- **SHADER_TECHNIQUES**  
  `SHADER_TECHNIQUES: Record<string, ShaderTechnique> = ...`  
  A mapping of available shader techniques  
  Inherited from [ColorationVisionShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#shader_techniques)

- **SHADOW**  
  `SHADOW: string = ""`  
  Inherited from [ColorationVisionShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#shadow)

- **SWITCH_COLOR**  
  `SWITCH_COLOR: string = ...`  
  Switch between an inner and outer color, by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true.  
  Inherited from [ColorationVisionShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#switch_color)

- **TRANSITION**  
  `TRANSITION: string = ...`  
  Transition between bright and dim colors, if requested  
  Inherited from [ColorationVisionShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#transition)

- **VERTEX_ATTRIBUTES**  
  `VERTEX_ATTRIBUTES: string = ...`  
  Common attributes for vertex shaders.  
  Inherited from [ColorationVisionShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#vertex_attributes)

- **VERTEX_FRAGMENT_VARYINGS**  
  `VERTEX_FRAGMENT_VARYINGS: string = ...`  
  Common varyings shared by vertex and fragment shaders.  
  Inherited from [ColorationVisionShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#vertex_fragment_varyings)

- **VERTEX_FUNCTIONS**  
  `VERTEX_FUNCTIONS: string = ""`  
  Common functions used by the vertex shaders.  
  Inherited from [ColorationVisionShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#vertex_functions)

- **VERTEX_UNIFORMS**  
  `VERTEX_UNIFORMS: string = ...`  
  Common uniforms for vertex shaders.  
  Inherited from [ColorationVisionShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#vertex_uniforms)

- **vertexShader**  
  `vertexShader: string = ...`  
  The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the vertexShader static field.  
  Inherited from [ColorationVisionShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#vertexshader)

---

## Accessors

### isRequired  
```typescript
get isRequired(): boolean
```
Flag whether the coloration shader is currently required. If key uniforms are at their default values, we don't need to render the coloration container.

**Returns**: `boolean`  
Overrides [ColorationVisionShader.isRequired](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#isRequired)

### Static Accessors

- **ADJUSTMENTS**  
  ```typescript
  get ADJUSTMENTS(): string
  ```
  The adjustments made into fragment shaders.

  **Returns**: `string`  
  Inherited from `ColorationVisionShader.ADJUSTMENTS`

- **BACKGROUND_TECHNIQUES**  
  ```typescript
  get BACKGROUND_TECHNIQUES(): string
  ```
  The coloration technique background shader fragment.

  **Returns**: `string`  
  Inherited from `ColorationVisionShader.BACKGROUND_TECHNIQUES`

- **COLORATION_TECHNIQUES**  
  ```typescript
  get COLORATION_TECHNIQUES(): string
  ```
  The coloration technique coloration shader fragment.

  **Returns**: `string`

- **ILLUMINATION_TECHNIQUES**  
  ```typescript
  get ILLUMINATION_TECHNIQUES(): string
  ```
  The coloration technique illumination shader fragment.

  **Returns**: `string`  
  Inherited from `ColorationVisionShader.ILLUMINATION_TECHNIQUES`

---

## Methods

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.

**Returns**: `void`  
Inherited from [ColorationVisionShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#reset)

### update  
```typescript
update(): void
```
Called before rendering.

**Returns**: `void`  
Inherited from [ColorationVisionShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#update)

### _configure (protected)  
```typescript
protected _configure(): void
```
A one time initialization performed on creation.

**Returns**: `void`  
Inherited from [ColorationVisionShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#_configure)

### _preRender (protected)  
```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```
Perform operations which are required before binding the Shader to the Renderer.

**Parameters**:  
- **mesh**: `DisplayObject` - The mesh display object linked to this shader.  
- **renderer**: `Renderer` - The renderer.

**Returns**: `void`  
Inherited from [ColorationVisionShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#_prerender)

### create (static)  
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.

**Parameters**:  
- **initialUniforms**: `object`

**Returns**: `AbstractBaseShader`  
Inherited from [ColorationVisionShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#create)

### getShaderTechniques (static)  
```typescript
static getShaderTechniques(shaderType: string): string
```
Construct adaptive shader according to shader type.

**Parameters**:  
- **shaderType**: `string` — shader type to construct: coloration, illumination, background, etc.

**Returns**: `string` — the constructed shader adaptive block  
Inherited from [ColorationVisionShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorationVisionShader.html#getshadertechniques)