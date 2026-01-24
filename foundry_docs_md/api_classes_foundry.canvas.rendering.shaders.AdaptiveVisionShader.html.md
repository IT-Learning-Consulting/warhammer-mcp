# AdaptiveVisionShader

**Foundry Virtual Tabletop - API Documentation - Version 13**

This class defines an interface which all adaptive vision shaders extend.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.AdaptiveVisionShader), Expand):

- *AdaptiveLightingShader*
- **AdaptiveVisionShader**
- *BackgroundVisionShader*  
  *IlluminationVisionShader*  
  *ColorationVisionShader*

---

## Properties

### initialUniforms  
**Type:** `object`  
The initial values of the shader uniforms.  
Inherited from [AdaptiveLightingShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#initialuniforms).

---

### Static Properties

#### COMPUTE_ILLUMINATION  
**Type:** `string`  
Compute illumination uniforms.  
Overrides [AdaptiveLightingShader.COMPUTE_ILLUMINATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#compute_illumination).

#### CONSTANTS  
**Type:** `string`  
Inherited from [AdaptiveLightingShader.CONSTANTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#constants).

#### CONTRAST  
**Type:** `string`  
Contrast adjustment.  
Inherited from [AdaptiveLightingShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#contrast).

#### defaultUniforms  
**Type:** `object` = {}  
The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
Inherited from [AdaptiveLightingShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#defaultuniforms).

#### EXPOSURE  
**Type:** `string`  
Overrides [AdaptiveLightingShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#exposure).

#### FALLOFF  
**Type:** `string`  
Incorporate falloff if an attenuation uniform is requested.  
Inherited from [AdaptiveLightingShader.FALLOFF](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#falloff).

#### forceDefaultColor  
**Type:** `boolean` = `false`  
Has this lighting shader a forced default color?  
Inherited from [AdaptiveLightingShader.forceDefaultColor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#forcedefaultcolor).

#### FRAGMENT_BEGIN  
**Type:** `string`  
Overrides [AdaptiveLightingShader.FRAGMENT_BEGIN](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_begin).

#### FRAGMENT_END  
**Type:** `string`  
Shader final.  
Inherited from [AdaptiveLightingShader.FRAGMENT_END](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_end).

#### FRAGMENT_FUNCTIONS  
**Type:** `string`  
Common functions used by the fragment shaders.  
Overrides [AdaptiveLightingShader.FRAGMENT_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_functions).

#### FRAGMENT_UNIFORMS  
**Type:** `string`  
Common uniforms shared by fragment shaders.  
Inherited from [AdaptiveLightingShader.FRAGMENT_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragment_uniforms).

#### fragmentShader  
**Type:** `string | (...args: any[]) => string` = `""`  
The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the `fragmentShader` static field.  
Inherited from [AdaptiveLightingShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#fragmentshader).

#### SATURATION  
**Type:** `string`  
Saturation adjustment.  
Inherited from [AdaptiveLightingShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#saturation).

#### SHADER_TECHNIQUES  
**Type:** `Record<string, ShaderTechnique>`  
A mapping of available shader techniques.  
Overrides [AdaptiveLightingShader.SHADER_TECHNIQUES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shader_techniques).

#### SHADOW  
**Type:** `string` = `""`  
Overrides [AdaptiveLightingShader.SHADOW](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#shadow).

#### SWITCH_COLOR  
**Type:** `string`  
Switch between an inner and outer color, by comparing distance from center to ratio. Applies a strong gradient between the two areas if attenuation uniform is set to true.  
Inherited from [AdaptiveLightingShader.SWITCH_COLOR](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#switch_color).

#### TRANSITION  
**Type:** `string`  
Transition between bright and dim colors, if requested.  
Inherited from [AdaptiveLightingShader.TRANSITION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#transition).

#### VERTEX_ATTRIBUTES  
**Type:** `string`  
Common attributes for vertex shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_attributes).

#### VERTEX_FRAGMENT_VARYINGS  
**Type:** `string`  
Common varyings shared by vertex and fragment shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_FRAGMENT_VARYINGS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_fragment_varyings).

#### VERTEX_FUNCTIONS  
**Type:** `string` = `""`  
Common functions used by the vertex shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_FUNCTIONS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_functions).

#### VERTEX_UNIFORMS  
**Type:** `string`  
Common uniforms for vertex shaders.  
Inherited from [AdaptiveLightingShader.VERTEX_UNIFORMS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertex_uniforms).

#### vertexShader  
**Type:** `string`  
The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
Inherited from [AdaptiveLightingShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#vertexshader).

---

## Accessors

### ADJUSTMENTS  
**Returns:** `string`  
The adjustments made into fragment shaders.  
Inherited from `AdaptiveLightingShader.ADJUSTMENTS`.

### BACKGROUND_TECHNIQUES  
**Returns:** `string`  
The coloration technique background shader fragment.  
Inherited from `AdaptiveLightingShader.BACKGROUND_TECHNIQUES`.

### COLORATION_TECHNIQUES  
**Returns:** `string`  
The coloration technique coloration shader fragment.  
Inherited from `AdaptiveLightingShader.COLORATION_TECHNIQUES`.

### ILLUMINATION_TECHNIQUES  
**Returns:** `string`  
The coloration technique illumination shader fragment.  
Inherited from `AdaptiveLightingShader.ILLUMINATION_TECHNIQUES`.

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.  
Returns `void`.  
Inherited from [AdaptiveLightingShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#reset).

---

### update

```typescript
update(): void
```

Called before rendering.  
Returns `void`.  
Inherited from [AdaptiveLightingShader.update](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#update).

---

### _configure

```typescript
protected _configure(): void
```

Protected  
A one time initialization performed on creation.  
Returns `void`.  
Inherited from [AdaptiveLightingShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_configure).

---

### _preRender

```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```

Protected  
Perform operations which are required before binding the Shader to the Renderer.

Parameters:  
- **mesh**: `DisplayObject` — The mesh display object linked to this shader.  
- **renderer**: `Renderer` — The renderer.

Returns `void`.  
Inherited from [AdaptiveLightingShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#_prerender).

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

Parameters:  
- **initialUniforms**: `object`

Returns:  
`AbstractBaseShader`.

Inherited from [AdaptiveLightingShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#create).

---

### getShaderTechniques

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type.

Parameters:  
- **shaderType**: `string` — Shader type to construct, e.g. coloration, illumination, background, etc.

Returns:  
`string` — The constructed shader adaptive block.

Inherited from [AdaptiveLightingShader.getShaderTechniques](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html#getshadertechniques).

---

For the full context and additional shaders, visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveVisionShader.html).