# AbstractBaseShader | Foundry Virtual Tabletop - API Documentation - Version 13

This class defines an interface which all shaders utilize.

**Mixes**  
BaseShaderMixin

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.AbstractBaseShader), Expand)  
_Shader<this>_  
**AbstractBaseShader**  
[GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)  
[AdaptiveLightingShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html)  
[AbstractWeatherShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html)  
[RegionShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.RegionShader.html)  
[BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html)

---

## Properties

### initialUniforms

- **Type:** `object`  
- **Description:** The initial values of the shader uniforms.

### (static) defaultUniforms

- **Type:** `object = {}`  
- **Description:** The default uniform values for the shader. A subclass of `AbstractBaseShader` must implement the `defaultUniforms` static field.

### (static) fragmentShader

- **Type:** `string | (...args: any[]) => string = ""`  
- **Description:** The raw fragment shader used by this class. A subclass of `AbstractBaseShader` must implement the `fragmentShader` static field.

### (static) vertexShader

- **Type:** `string = ""`  
- **Description:** The raw vertex shader used by this class. A subclass of `AbstractBaseShader` must implement the `vertexShader` static field.

---

## Methods

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`

---

### _configure

```typescript
protected _configure(): void
```

Protected  
A one time initialization performed on creation.

**Returns:** `void`

---

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
  The renderer.

**Returns:** `void`

---

### (static) create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)