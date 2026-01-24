# RegionShader

The shader used by [`foundry.canvas.placeables.regions.RegionMesh`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.regions.RegionMesh.html).

**Hierarchy:** [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.RegionShader)  
- _AbstractBaseShader_  
- **RegionShader**

---

## Properties

### initialUniforms

- Type: `object`  
- Description: The initial values of the shader uniforms.  
- Inherited from [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#initialuniforms).

### Static Properties

#### defaultUniforms

```typescript
defaultUniforms: {
  canvasDimensions: number[];
  sceneDimensions: number[];
  screenDimensions: number[];
  tintAlpha: number[];
} = ...
```

- Description: Overrides [AbstractBaseShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#defaultuniforms).

#### fragmentShader

- Type: `string`  
- Description: Overrides [AbstractBaseShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#fragmentshader).

#### vertexShader

- Type: `string`  
- Description: Overrides [AbstractBaseShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#vertexshader).

---

## Methods

### _preRender

```typescript
_preRender(mesh: any, renderer: any): void
```

- **Parameters:**
  - **mesh**: `any`  
  - **renderer**: `any`
- **Returns:** `void`  
- Description: Overrides [AbstractBaseShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_prerender).

---

### reset

```typescript
reset(): void
```

- **Returns:** `void`  
- Description: Reset the shader uniforms back to their initial values.  
- Inherited from [AbstractBaseShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#reset).

---

### _configure

```typescript
protected _configure(): void
```

- **Returns:** `void`  
- Description: A one-time initialization performed on creation.  
- Inherited from [AbstractBaseShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_configure).

---

### Static create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

- **Parameters:**
  - **initialUniforms**: `object`  
- **Returns:** `AbstractBaseShader`  
- Description: A factory method for creating the shader using its defined default values.  
- Inherited from [AbstractBaseShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#create).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)