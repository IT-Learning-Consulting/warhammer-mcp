# ForceGridColorationShader

A futuristic Force Grid animation.

**Hierarchy**:  
[AdaptiveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html)  
→ **ForceGridColorationShader**

---

## Properties

### initialUniforms

- **Type**: `object`  
- **Description**: The initial values of the shader uniforms.  
- **Inherited from**: [AdaptiveColorationShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#initialuniforms)

### Static Properties

#### COMPUTE_ILLUMINATION

- **Type**: `string`  
- **Description**: Compute illumination uniforms.  
- **Inherited from**: [AdaptiveColorationShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#compute_illumination)

#### CONSTANTS

- **Type**: `string`  
- **Inherited from**: [AdaptiveColorationShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#constants)

#### CONTRAST

- **Type**: `string`  
- **Description**: Contrast adjustment.  
- **Inherited from**: [AdaptiveColorationShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#contrast)

#### defaultUniforms

- **Type**:  
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
- **Description**: The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
- **Inherited from**: [AdaptiveColorationShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#defaultuniforms)

#### EXPOSURE

- **Type**: `string`  
- **Description**: Exposure adjustment.  
- **Inherited from**: [AdaptiveColorationShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#exposure)

#### FALLOFF

- **Type**: `string`  
- **Description**: Incorporate falloff if an attenuation uniform is requested.  
- **Inherited from**: [AdaptiveColorationShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#falloff)

#### forceDefaultColor

- **Type**: `boolean` = `true`  
- **Description**: Overrides [AdaptiveColorationShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#forcedefaultcolor)

#### FRAGMENT_BEGIN

- **Type**: `string`  
- **Description**: Initialize fragment with common properties.  
- **Inherited from**: [AdaptiveColorationShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_begin)

#### FRAGMENT_END

- **Type**: `string`  
- **Inherited from**: [AdaptiveColorationShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_end)

#### FRAGMENT_FUNCTIONS

- **Type**: `string`  
- **Description**: Common functions used by the fragment shaders.  
- **Inherited from**: [AdaptiveColorationShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_functions)

#### FRAGMENT_UNIFORMS

- **Type**: `string`  
- **Description**: Common uniforms shared by fragment shaders.  
- **Inherited from**: [AdaptiveColorationShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragment_uniforms)

#### fragmentShader

- **Type**: `string`  
- **Description**: Overrides [AdaptiveColorationShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#fragmentshader)

#### SATURATION

- **Type**: `string`  
- **Description**: Saturation adjustment.  
- **Inherited from**: [AdaptiveColorationShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#saturation)

#### SHADER_HEADER

- **Type**: `string`  
- **Description**: Memory allocations for the Adaptive Coloration Shader  
- **Inherited from**: [AdaptiveColorationShader.SHADER_HEADER](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_header)

#### SHADER_TECHNIQUES

- **Type**: `Record<string, [ShaderTechnique](https://foundryvtt.com/api/interfaces/foundry.ShaderTechnique.html)>`  
- **Description**: A mapping of available shader techniques  
- **Inherited from**: [AdaptiveColorationShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shader_techniques)

#### SHADOW

- **Type**: `string`  
- **Inherited from**: [AdaptiveColorationShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#shadow)

#### SWITCH_COLOR

- **Type**: `string`  
- **Description**: Switch between an inner and outer color by comparing distance from center to ratio. Apply a strong gradient between the two areas if attenuation uniform is set to true.  
- **Inherited from**: [AdaptiveColorationShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#switch_color)

#### TRANSITION

- **Type**: `string`  
- **Description**: Transition between bright and dim colors, if requested.  
- **Inherited from**: [AdaptiveColorationShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#transition)

#### VERTEX_ATTRIBUTES

- **Type**: `string`  
- **Description**: Common attributes for vertex shaders.  
- **Inherited from**: [AdaptiveColorationShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_attributes)

#### VERTEX_FRAGMENT_VARYINGS

- **Type**: `string`  
- **Description**: Common varyings shared by vertex and fragment shaders.  
- **Inherited from**: [AdaptiveColorationShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_fragment_varyings)

#### VERTEX_FUNCTIONS

- **Type**: `string` = `""`  
- **Description**: Common functions used by the vertex shaders.  
- **Inherited from**: [AdaptiveColorationShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_functions)

#### VERTEX_UNIFORMS

- **Type**: `string`  
- **Description**: Common uniforms for vertex shaders.  
- **Inherited from**: [AdaptiveColorationShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertex_uniforms)

#### vertexShader

- **Type**: `string`  
- **Description**: The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
- **Inherited from**: [AdaptiveColorationShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#vertexshader)

---

## Accessors

### isRequired

```typescript
get isRequired(): boolean
```

- **Description**: Flag whether the coloration shader is currently required.  
- **Returns**: `boolean`  
- **Inherited from**: [AdaptiveColorationShader.isRequired](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#isRequired)

### ADJUSTMENTS

```typescript
static get ADJUSTMENTS(): string
```

- **Description**: The adjustments made into fragment shaders  
- **Returns**: `string`  
- **Inherited from**: [AdaptiveColorationShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ADJUSTMENTS)

### BACKGROUND_TECHNIQUES

```typescript
static get BACKGROUND_TECHNIQUES(): string
```

- **Description**: The coloration technique background shader fragment  
- **Returns**: `string`  
- **Inherited from**: [AdaptiveColorationShader.BACKGROUND_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#BACKGROUND_TECHNIQUES)

### COLORATION_TECHNIQUES

```typescript
static get COLORATION_TECHNIQUES(): string
```

- **Description**: The coloration technique coloration shader fragment  
- **Returns**: `string`  
- **Inherited from**: [AdaptiveColorationShader.COLORATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#COLORATION_TECHNIQUES)

### ILLUMINATION_TECHNIQUES

```typescript
static get ILLUMINATION_TECHNIQUES(): string
```

- **Description**: The coloration technique illumination shader fragment  
- **Returns**: `string`  
- **Inherited from**: [AdaptiveColorationShader.ILLUMINATION_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#ILLUMINATION_TECHNIQUES)

---

## Methods

### reset

```typescript
reset(): void
```

- **Description**: Reset the shader uniforms back to their initial values.  
- **Returns**: `void`  
- **Inherited from**: [AdaptiveColorationShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#reset)

### update

```typescript
update(): void
```

- **Description**: Called before rendering.  
- **Returns**: `void`  
- **Inherited from**: [AdaptiveColorationShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#update)

### _configure

```typescript
protected _configure(): void
```

- **Description**: A one-time initialization performed on creation.  
- **Returns**: `void`  
- **Inherited from**: [AdaptiveColorationShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_configure)

### _preRender

```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```

- **Description**: Perform operations which are required before binding the Shader to the Renderer.  
- **Parameters**:  
  - **mesh**: `DisplayObject` — The mesh display object linked to this shader.  
  - **renderer**: `Renderer` — The renderer instance.  
- **Returns**: `void`  
- **Inherited from**: [AdaptiveColorationShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#_prerender)

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

- **Description**: A factory method for creating the shader using its defined default values.  
- **Parameters**:  
  - **initialUniforms**: `object` — Initial uniform values to use.  
- **Returns**: `AbstractBaseShader`  
- **Inherited from**: [AdaptiveColorationShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#create)

### getShaderTechniques

```typescript
static getShaderTechniques(shaderType: string): string
```

- **Description**: Construct adaptive shader according to shader type.  
- **Parameters**:  
  - **shaderType**: `string` — The shader type to construct, e.g., coloration, illumination, background, etc.  
- **Returns**: `string` — The constructed shader adaptive block.  
- **Inherited from**: [AdaptiveColorationShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html#getshadertechniques)

---

For more information visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ForceGridColorationShader.html).