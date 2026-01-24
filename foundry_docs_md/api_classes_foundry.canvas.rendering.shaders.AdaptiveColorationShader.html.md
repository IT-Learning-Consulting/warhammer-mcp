# AdaptiveColorationShader

The default coloration shader used by standard rendering and animations. A fragment shader which creates a light source.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [AdaptiveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html)

## Hierarchy

- [AdaptiveLightingShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html)  
  - **AdaptiveColorationShader**  
    - [BewitchingWaveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BewitchingWaveColorationShader.html)  
    - [ChromaColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ChromaColorationShader.html)  
    - [EmanationColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.EmanationColorationShader.html)  
    - [EnergyFieldColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.EnergyFieldColorationShader.html)  
    - [FairyLightColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.FairyLightColorationShader.html)  
    - [FlameColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.FlameColorationShader.html)  
    - [FogColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.FogColorationShader.html)  
    - [ForceGridColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ForceGridColorationShader.html)  
    - [GhostLightColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GhostLightColorationShader.html)  
    - [HexaDomeColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.HexaDomeColorationShader.html)  
    - [LightDomeColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.LightDomeColorationShader.html)  
    - [PulseColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PulseColorationShader.html)  
    - [RadialRainbowColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.RadialRainbowColorationShader.html)  
    - [RevolvingColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.RevolvingColorationShader.html)  
    - [SirenColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SirenColorationShader.html)  
    - [SmokePatchColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SmokePatchColorationShader.html)  
    - [StarLightColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.StarLightColorationShader.html)  
    - [SunburstColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SunburstColorationShader.html)  
    - [SwirlingRainbowColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.SwirlingRainbowColorationShader.html)  
    - [TorchColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.TorchColorationShader.html)  
    - [VortexColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.VortexColorationShader.html)  
    - [WaveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.WaveColorationShader.html)  

---

## Properties

### initialUniforms

**Type:** `object`

The initial values of the shader uniforms.

Inherited from [AdaptiveLightingShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#initialuniforms).

---

### Static Properties

- **COMPUTE_ILLUMINATION**: `string`  
  Compute illumination uniforms  
  Inherited from [AdaptiveLightingShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#compute_illumination).

- **CONSTANTS**: `string`  
  Inherited from [AdaptiveLightingShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#constants).

- **CONTRAST**: `string`  
  Contrast adjustment  
  Inherited from [AdaptiveLightingShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#contrast).

- **defaultUniforms**:  
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
  
  The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.
  
  Overrides [AdaptiveLightingShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#defaultuniforms).

- **EXPOSURE**: `string`  
  Exposure adjustment  
  Inherited from [AdaptiveLightingShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#exposure).

- **FALLOFF**: `string`  
  Incorporate falloff if an attenuation uniform is requested  
  Inherited from [AdaptiveLightingShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#falloff).

- **forceDefaultColor**: `boolean` = `false`  
  Has this lighting shader a forced default color?  
  Inherited from [AdaptiveLightingShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#forcedefaultcolor).

- **FRAGMENT_BEGIN**: `string`  
  Initialize fragment with common properties  
  Inherited from [AdaptiveLightingShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_begin).

- **FRAGMENT_END**: `string`  
  Overrides [AdaptiveLightingShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_end).

- **FRAGMENT_FUNCTIONS**: `string`  
  Common functions used by the fragment shaders.  
  Inherited from [AdaptiveLightingShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_functions).

- **FRAGMENT_UNIFORMS**: `string`  
  Common uniforms shared by fragment shaders.  
  Inherited from [AdaptiveLightingShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_uniforms).

- **fragmentShader**: `string`  
  The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the `fragmentShader` static field.  
  Overrides [AdaptiveLightingShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragmentshader).

- **SATURATION**: `string`  
  Saturation adjustment  
  Inherited from [AdaptiveLightingShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#saturation).

- **SHADER_HEADER**: `string`  
  Memory allocations for the Adaptive Coloration Shader

- **SHADER_TECHNIQUES**: `Record<string, ShaderTechnique>`  
  A mapping of available shader techniques  
  Inherited from [AdaptiveLightingShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shader_techniques).

- **SHADOW**: `string`  
  Overrides [AdaptiveLightingShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shadow).

- **SWITCH_COLOR**: `string`  
  Switch between an inner and outer color, by comparing distance from center to ratio.  
  Apply a strong gradient between the two areas if attenuation uniform is set to true.  
  Inherited from [AdaptiveLightingShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#switch_color).

- **TRANSITION**: `string`  
  Transition between bright and dim colors, if requested  
  Inherited from [AdaptiveLightingShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#transition).

- **VERTEX_ATTRIBUTES**: `string`  
  Common attributes for vertex shaders.  
  Inherited from [AdaptiveLightingShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_attributes).

- **VERTEX_FRAGMENT_VARYINGS**: `string`  
  Common varyings shared by vertex and fragment shaders.  
  Inherited from [AdaptiveLightingShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_fragment_varyings).

- **VERTEX_FUNCTIONS**: `string` = `""`  
  Common functions used by the vertex shaders.  
  Inherited from [AdaptiveLightingShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_functions).

- **VERTEX_UNIFORMS**: `string`  
  Common uniforms for vertex shaders.  
  Inherited from [AdaptiveLightingShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_uniforms).

- **vertexShader**: `string`  
  The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
  Inherited from [AdaptiveLightingShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertexshader).

---

## Accessors

### isRequired

```typescript
get isRequired(): boolean
```

Flag whether the coloration shader is currently required.

**Returns:** `boolean`

---

### ADJUSTMENTS

```typescript
static get ADJUSTMENTS(): string
```

The adjustments made into fragment shaders.

Overrides `AdaptiveLightingShader.ADJUSTMENTS`.

**Returns:** `string`

---

### BACKGROUND_TECHNIQUES

```typescript
static get BACKGROUND_TECHNIQUES(): string
```

The coloration technique background shader fragment.

Inherited from `AdaptiveLightingShader.BACKGROUND_TECHNIQUES`.

**Returns:** `string`

---

### COLORATION_TECHNIQUES

```typescript
static get COLORATION_TECHNIQUES(): string
```

The coloration technique coloration shader fragment.

Inherited from `AdaptiveLightingShader.COLORATION_TECHNIQUES`.

**Returns:** `string`

---

### ILLUMINATION_TECHNIQUES

```typescript
static get ILLUMINATION_TECHNIQUES(): string
```

The coloration technique illumination shader fragment.

Inherited from `AdaptiveLightingShader.ILLUMINATION_TECHNIQUES`.

**Returns:** `string`

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`

Inherited from [AdaptiveLightingShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#reset)

---

### update

```typescript
update(): void
```

Called before rendering.

**Returns:** `void`

Inherited from [AdaptiveLightingShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#update)

---

### _configure (Protected)

```typescript
protected _configure(): void
```

A one time initialization performed on creation.

**Returns:** `void`

Inherited from [AdaptiveLightingShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_configure)

---

### _preRender (Protected)

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

Inherited from [AdaptiveLightingShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_prerender)

---

### create (Static)

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`

Inherited from [AdaptiveLightingShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#create)

---

### getShaderTechniques (Static)

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type.

**Parameters:**

- **shaderType**: `string`  
  Shader type to construct : coloration, illumination, background, etc.

**Returns:** `string`  
The constructed shader adaptive block.

Inherited from [AdaptiveLightingShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#getshadertechniques)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)