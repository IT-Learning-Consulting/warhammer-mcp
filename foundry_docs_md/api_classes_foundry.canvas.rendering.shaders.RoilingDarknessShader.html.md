# RoilingDarknessShader

Roling mass illumination shader - intended primarily for darkness.

## Hierarchy

- [AdaptiveDarknessShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html)
- RoilingDarknessShader

---

## Properties

### initialUniforms

Type: `object`  
The initial values of the shader uniforms.  
Inherited from [AdaptiveDarknessShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#initialuniforms).

### Static Properties

- **COMPUTE_ILLUMINATION**: `string` = ...  
  Compute illumination uniforms  
  Inherited from [AdaptiveDarknessShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#compute_illumination).

- **CONSTANTS**: `string` = ...  
  Inherit Doc  
  Inherited from [AdaptiveDarknessShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#constants).

- **CONTRAST**: `string` = ...  
  Contrast adjustment  
  Inherited from [AdaptiveDarknessShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#contrast).

- **defaultUniforms**:  
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
  } = ...
  ```
  Inherited from [AdaptiveDarknessShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#defaultuniforms).

- **EXPOSURE**: `string` = ...  
  Exposure adjustment  
  Inherited from [AdaptiveDarknessShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#exposure).

- **FALLOFF**: `string` = ...  
  Incorporate falloff if an attenuation uniform is requested  
  Inherited from [AdaptiveDarknessShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#falloff).

- **forceDefaultColor**: `boolean` = false  
  Has this lighting shader a forced default color?  
  Inherited from [AdaptiveDarknessShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#forcedefaultcolor).

- **FRAGMENT_BEGIN**: `string` = ...  
  Initialize fragment with common properties  
  Inherited from [AdaptiveDarknessShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_begin).

- **FRAGMENT_END**: `string` = ...  
  Shader final  
  Inherited from [AdaptiveDarknessShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_end).

- **FRAGMENT_FUNCTIONS**: `string` = ...  
  Common functions used by the fragment shaders.  
  Inherited from [AdaptiveDarknessShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_functions).

- **FRAGMENT_UNIFORMS**: `string` = ...  
  Common uniforms shared by fragment shaders.  
  Inherited from [AdaptiveDarknessShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragment_uniforms).

- **fragmentShader**: `string` = ...  
  Overrides [AdaptiveDarknessShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#fragmentshader).

- **SATURATION**: `string` = ...  
  Saturation adjustment  
  Inherited from [AdaptiveDarknessShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#saturation).

- **SHADER_HEADER**: `string` = ...  
  Memory allocations for the Adaptive Background Shader  
  Inherited from [AdaptiveDarknessShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#shader_header).

- **SHADER_TECHNIQUES**: `Record<string, ShaderTechnique>` = ...  
  A mapping of available shader techniques  
  Inherited from [AdaptiveDarknessShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#shader_techniques).

- **SHADOW**: `string` = ...  
  Shadow adjustment  
  Inherited from [AdaptiveDarknessShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#shadow).

- **SWITCH_COLOR**: `string` = ...  
  Switch between an inner and outer color, by comparing distance from center to ratio.  
  Apply a strong gradient between the two areas if attenuation uniform is set to true.  
  Inherited from [AdaptiveDarknessShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#switch_color).

- **TRANSITION**: `string` = ...  
  Transition between bright and dim colors, if requested  
  Inherited from [AdaptiveDarknessShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#transition).

- **VERTEX_ATTRIBUTES**: `string` = ...  
  Common attributes for vertex shaders.  
  Inherited from [AdaptiveDarknessShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_attributes).

- **VERTEX_FRAGMENT_VARYINGS**: `string` = ...  
  Common varyings shared by vertex and fragment shaders.  
  Inherited from [AdaptiveDarknessShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_fragment_varyings).

- **VERTEX_FUNCTIONS**: `string` = ""  
  Common functions used by the vertex shaders.  
  Inherited from [AdaptiveDarknessShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_functions).

- **VERTEX_UNIFORMS**: `string` = ...  
  Common uniforms for vertex shaders.  
  Inherited from [AdaptiveDarknessShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertex_uniforms).

- **vertexShader**: `string` = ...  
  The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the vertexShader static field.  
  Inherited from [AdaptiveDarknessShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#vertexshader).

---

## Accessors

### isRequired

```typescript
get isRequired(): boolean
```

Flag whether the darkness shader is currently required. Check vision modes requirements first, then if key uniforms are at their default values, we don't need to render the background container.

**Returns**: `boolean`  
Inherited from AdaptiveDarknessShader.isRequired

### Static Accessors

- **ADJUSTMENTS**

  ```typescript
  get ADJUSTMENTS(): string
  ```
  
  The adjustments made into fragment shaders.

  **Returns**: `string`  
  Inherited from AdaptiveDarknessShader.ADJUSTMENTS

- **BACKGROUND_TECHNIQUES**

  ```typescript
  get BACKGROUND_TECHNIQUES(): string
  ```
  
  The coloration technique background shader fragment.

  **Returns**: `string`  
  Inherited from AdaptiveDarknessShader.BACKGROUND_TECHNIQUES

- **COLORATION_TECHNIQUES**

  ```typescript
  get COLORATION_TECHNIQUES(): string
  ```
  
  The coloration technique coloration shader fragment.

  **Returns**: `string`  
  Inherited from AdaptiveDarknessShader.COLORATION_TECHNIQUES

- **ILLUMINATION_TECHNIQUES**

  ```typescript
  get ILLUMINATION_TECHNIQUES(): string
  ```
  
  The coloration technique illumination shader fragment.

  **Returns**: `string`  
  Inherited from AdaptiveDarknessShader.ILLUMINATION_TECHNIQUES

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns**: `void`  
Inherited from [AdaptiveDarknessShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#reset)

### update

```typescript
update(): void
```

**Returns**: `void`  
Inherited from [AdaptiveDarknessShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#update)

### _configure

```typescript
protected _configure(): void
```

A one time initialization performed on creation.

**Returns**: `void`  
Inherited from [AdaptiveDarknessShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#_configure)

### _preRender

```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```

Perform operations which are required before binding the Shader to the Renderer.

**Parameters**

- **mesh**: `DisplayObject`  
  The mesh display object linked to this shader.
- **renderer**: `Renderer`  
  The renderer

**Returns**: `void`  
Inherited from [AdaptiveDarknessShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#_prerender)

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters**

- **initialUniforms**: `object`  
  Initial uniforms to assign

**Returns**: `AbstractBaseShader`  
Inherited from [AdaptiveDarknessShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#create)

### getShaderTechniques

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type.

**Parameters**

- **shaderType**: `string`  
  Shader type to construct (e.g., coloration, illumination, background, etc.)

**Returns**: `string`  
The constructed shader adaptive block.  
Inherited from [AdaptiveDarknessShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html#getshadertechniques)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)