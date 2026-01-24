# AdaptiveLightingShader | Foundry Virtual Tabletop - API Documentation - Version 13

This class defines an interface which all adaptive lighting shaders extend.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.AdaptiveLightingShader), Expand

- *AbstractBaseShader*  
- **AdaptiveLightingShader**  
- *AdaptiveBackgroundShader*  
- *AdaptiveColorationShader*  
- *AdaptiveDarknessShader*  
- *AdaptiveIlluminationShader*  
- *AdaptiveVisionShader*

## Properties

### initialUniforms

**Type:** `object`  
The initial values of the shader uniforms.  
Inherited from [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#initialuniforms).

### Static Properties

#### COMPUTE_ILLUMINATION

**Type:** `string`  
Compute illumination uniforms

#### CONSTANTS

**Type:** `string`

#### CONTRAST

**Type:** `string`  
Contrast adjustment

#### defaultUniforms

**Type:** `object` = {}  
The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
Inherited from [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#defaultuniforms).

#### EXPOSURE

**Type:** `string`  
Exposure adjustment

#### FALLOFF

**Type:** `string`  
Incorporate falloff if an attenuation uniform is requested

#### forceDefaultColor

**Type:** `boolean` = false  
Has this lighting shader a forced default color?

#### FRAGMENT_BEGIN

**Type:** `string`  
Initialize fragment with common properties

#### FRAGMENT_END

**Type:** `string`  
Shader final

#### FRAGMENT_FUNCTIONS

**Type:** `string`  
Common functions used by the fragment shaders.

#### FRAGMENT_UNIFORMS

**Type:** `string`  
Common uniforms shared by fragment shaders.

#### fragmentShader

**Type:** `string | (...args: any[]) => string` = ""  
The raw fragment shader used by this class. A subclass of AbstractBaseShader must implement the `fragmentShader` static field.  
Inherited from [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#fragmentshader).

#### SATURATION

**Type:** `string`  
Saturation adjustment

#### SHADER_TECHNIQUES

**Type:** `Record<string, [ShaderTechnique](https://foundryvtt.com/api/interfaces/foundry.ShaderTechnique.html)>`  
A mapping of available shader techniques

#### SHADOW

**Type:** `string`  
Shadow adjustment

#### SWITCH_COLOR

**Type:** `string`  
Switch between an inner and outer color, by comparing distance from center to ratio  
Apply a strong gradient between the two areas if attenuation uniform is set to true

#### TRANSITION

**Type:** `string`  
Transition between bright and dim colors, if requested

#### VERTEX_ATTRIBUTES

**Type:** `string`  
Common attributes for vertex shaders.

#### VERTEX_FRAGMENT_VARYINGS

**Type:** `string`  
Common varyings shared by vertex and fragment shaders.

#### VERTEX_FUNCTIONS

**Type:** `string` = ""  
Common functions used by the vertex shaders.

#### VERTEX_UNIFORMS

**Type:** `string`  
Common uniforms for vertex shaders.

#### vertexShader

**Type:** `string`  
The raw vertex shader used by this class. A subclass of AbstractBaseShader must implement the `vertexShader` static field.  
Overrides [AbstractBaseShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#vertexshader).

## Accessors

### ADJUSTMENTS

```typescript
static get ADJUSTMENTS(): string
```

The adjustments made into fragment shaders.

**Returns:** `string`

### BACKGROUND_TECHNIQUES

```typescript
static get BACKGROUND_TECHNIQUES(): string
```

The coloration technique background shader fragment.

**Returns:** `string`

### COLORATION_TECHNIQUES

```typescript
static get COLORATION_TECHNIQUES(): string
```

The coloration technique coloration shader fragment.

**Returns:** `string`

### ILLUMINATION_TECHNIQUES

```typescript
static get ILLUMINATION_TECHNIQUES(): string
```

The coloration technique illumination shader fragment.

**Returns:** `string`

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.  
Inherited from [AbstractBaseShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#reset).

**Returns:** `void`

### update

```typescript
update(): void
```

Called before rendering.

**Returns:** `void`

### _configure

```typescript
protected _configure(): void
```

A one-time initialization performed on creation.  
Inherited from [AbstractBaseShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_configure).

**Returns:** `void`

### _preRender

```typescript
protected _preRender(mesh: DisplayObject, renderer: Renderer): void
```

Perform operations which are required before binding the Shader to the Renderer.  

**Parameters:**

- **mesh**: `DisplayObject`  
  The mesh display object linked to this shader.
- **renderer**: `Renderer`  
  The renderer

Inherited from [AbstractBaseShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_prerender).

**Returns:** `void`

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)  
Inherited from [AbstractBaseShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#create).

### getShaderTechniques

```typescript
static getShaderTechniques(shaderType: string): string
```

Construct adaptive shader according to shader type.

**Parameters:**

- **shaderType**: `string`  
  Shader type to construct: coloration, illumination, background, etc.

**Returns:** `string`  
The constructed shader adaptive block.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)