# AmplificationBackgroundVisionShader

Shader specialized in light amplification.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [AmplificationBackgroundVisionShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AmplificationBackgroundVisionShader.html)  

---

## Hierarchy
- [BackgroundVisionShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html)
- **AmplificationBackgroundVisionShader**

---

## Properties

### initialUniforms  
**Type:** `object`  
The initial values of the shader uniforms.  
Inherited from [BackgroundVisionShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#initialuniforms).

### Static Properties

#### COMPUTE_ILLUMINATION  
**Type:** `string`  
Compute illumination uniforms.  
Inherited from [BackgroundVisionShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#compute_illumination).

#### CONSTANTS  
**Type:** `string`  
Inherited from [BackgroundVisionShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#constants).

#### CONTRAST  
**Type:** `string`  
Contrast adjustment.  
Inherited from [BackgroundVisionShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#contrast).

#### defaultUniforms  
```typescript
{
    ambientBrightest: number[];
    ambientDarkness: number[];
    ambientDaylight: number[];
    attenuation: number;
    brightLevelCorrection: number;
    brightness: number;
    colorBackground: number[];
    colorTint: number[];
    colorVision: number[];
    contrast: number;
    darknessLevel: number;
    darknessLevelTexture: null;
    depthElevation: number;
    depthTexture: null;
    dimLevelCorrection: number;
    exposure: number;
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
The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
Overrides [BackgroundVisionShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#defaultuniforms).

#### EXPOSURE  
**Type:** `string`  
Inherited from [BackgroundVisionShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#exposure).

#### FALLOFF  
**Type:** `string`  
Incorporate falloff if an attenuation uniform is requested.  
Inherited from [BackgroundVisionShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#falloff).

#### forceDefaultColor  
**Type:** `boolean` = false  
Has this lighting shader a forced default color?  
Inherited from [BackgroundVisionShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#forcedefaultcolor).

#### FRAGMENT_BEGIN  
**Type:** `string`  
Inherited from [BackgroundVisionShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#fragment_begin).

#### FRAGMENT_END  
**Type:** `string`  
Shader final.  
Inherited from [BackgroundVisionShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#fragment_end).

#### FRAGMENT_FUNCTIONS  
**Type:** `string`  
Common functions used by the fragment shaders.  
Inherited from [BackgroundVisionShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#fragment_functions).

#### FRAGMENT_UNIFORMS  
**Type:** `string`  
Common uniforms shared by fragment shaders.  
Inherited from [BackgroundVisionShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#fragment_uniforms).

#### fragmentShader  
**Type:** `string`  
The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the `fragmentShader` static field.  
Overrides [BackgroundVisionShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#fragmentshader).

#### SATURATION  
**Type:** `string`  
Saturation adjustment.  
Inherited from [BackgroundVisionShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#saturation).

#### SHADER_HEADER  
**Type:** `string`  
Memory allocations for the Adaptive Background Shader.  
Inherited from [BackgroundVisionShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#shader_header).

#### SHADER_TECHNIQUES  
**Type:** `Record<string, ShaderTechnique>`  
A mapping of available shader techniques.  
Inherited from [BackgroundVisionShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#shader_techniques).

#### SHADOW  
**Type:** `string` = `""`  
Inherited from [BackgroundVisionShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#shadow).

#### SWITCH_COLOR  
**Type:** `string`  
Switch between an inner and outer color by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true.  
Inherited from [BackgroundVisionShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#switch_color).

#### TRANSITION  
**Type:** `string`  
Transition between bright and dim colors, if requested.  
Inherited from [BackgroundVisionShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#transition).

#### VERTEX_ATTRIBUTES  
**Type:** `string`  
Common attributes for vertex shaders.  
Inherited from [BackgroundVisionShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#vertex_attributes).

#### VERTEX_FRAGMENT_VARYINGS  
**Type:** `string`  
Common varyings shared by vertex and fragment shaders.  
Inherited from [BackgroundVisionShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#vertex_fragment_varyings).

#### VERTEX_FUNCTIONS  
**Type:** `string` = `""`  
Common functions used by the vertex shaders.  
Inherited from [BackgroundVisionShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#vertex_functions).

#### VERTEX_UNIFORMS  
**Type:** `string`  
Common uniforms for vertex shaders.  
Inherited from [BackgroundVisionShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#vertex_uniforms).

#### vertexShader  
**Type:** `string`  
The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
Inherited from [BackgroundVisionShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#vertexshader).

---

## Accessors

### isRequired  
```typescript
get isRequired(): boolean
```
Flag whether the background shader is currently required. If key uniforms are at their default values, we don't need to render the background container.  
**Returns:** `boolean`  
Overrides [BackgroundVisionShader.isRequired](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#isRequired).

### Static Accessors

#### ADJUSTMENTS  
```typescript
get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders.  
**Returns:** `string`  
Inherited from [BackgroundVisionShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#adjustments).

#### BACKGROUND_TECHNIQUES  
```typescript
get BACKGROUND_TECHNIQUES(): string
```
The coloration technique background shader fragment.  
**Returns:** `string`  
Inherited from [BackgroundVisionShader.BACKGROUND_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#background_techniques).

#### COLORATION_TECHNIQUES  
```typescript
get COLORATION_TECHNIQUES(): string
```
The coloration technique coloration shader fragment.  
**Returns:** `string`  
Inherited from [BackgroundVisionShader.COLORATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#coloration_techniques).

#### ILLUMINATION_TECHNIQUES  
```typescript
get ILLUMINATION_TECHNIQUES(): string
```
The coloration technique illumination shader fragment.  
**Returns:** `string`  
Inherited from [BackgroundVisionShader.ILLUMINATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#illumination_techniques).

---

## Methods

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
**Returns:** `void`  
Inherited from [BackgroundVisionShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#reset).

### update  
```typescript
update(): void
```
Called before rendering.  
**Returns:** `void`  
Inherited from [BackgroundVisionShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#update).

### _configure  
```typescript
protected _configure(): void
```
A one time initialization performed on creation.  
**Returns:** `void`  
Inherited from [BackgroundVisionShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#_configure).

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
Inherited from [BackgroundVisionShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#_prerender).

### Static create  
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`  
Inherited from [BackgroundVisionShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#create).

### Static getShaderTechniques  
```typescript
static getShaderTechniques(shaderType: string): string
```
Construct adaptive shader according to shader type.

**Parameters:**

- **shaderType**: `string`  
  Shader type to construct: coloration, illumination, background, etc.

**Returns:** `string`  
The constructed shader adaptive block.  
Inherited from [BackgroundVisionShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BackgroundVisionShader.html#getshadertechniques).