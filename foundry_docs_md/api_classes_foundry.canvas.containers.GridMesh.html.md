# GridMesh

The grid mesh, which uses the [foundry.canvas.rendering.shaders.GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html) to render the grid.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.containers.GridMesh), Expand)  
* _QuadMesh_  
* **GridMesh**

---

## Constructor

```typescript
new GridMesh(shaderClass?: typeof import("https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html").GridShader): GridMesh
```

The grid mesh constructor.

**Parameters**

- **shaderClass**: `typeof GridShader` = `GridShader`  
  The shader class

**Returns**  
`GridMesh`

Overrides [QuadMesh.constructor](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#constructor)

---

## Properties

### data

**Type:** [GridMeshData](https://foundryvtt.com/api/interfaces/foundry.canvas.containers.types.GridMeshData.html)  
The data of this mesh.

---

## Accessors

### blendMode

```typescript
get blendMode(): BLEND_MODES
```

Assigned blend mode to this mesh.

**Returns**  
`BLEND_MODES`

Inherited from [QuadMesh.blendMode](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#blendMode)

---

### shader

```typescript
get shader(): AbstractBaseShader
```

The shader bound to this mesh.

**Returns**  
[AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)

Inherited from [QuadMesh.shader](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#shader)

---

## Methods

### _calculateBounds

```typescript
_calculateBounds(): void
```

**Returns**  
`void`

Inherited from [QuadMesh._calculateBounds](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#_calculateBounds)

---

### _render

```typescript
_render(renderer: any): void
```

**Parameters**

- **renderer**: `any`

**Returns**  
`void`

Inherited from [QuadMesh._render](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#_render)

---

### containsPoint

```typescript
containsPoint(point: IPointData): boolean
```

Tests if a point is inside this QuadMesh.

**Parameters**

- **point**: `IPointData`

**Returns**  
`boolean`

Inherited from [QuadMesh.containsPoint](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#containsPoint)

---

### destroy

```typescript
destroy(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

Inherited from [QuadMesh.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#destroy)

---

### initialize

```typescript
initialize(data: Partial<GridMeshData>): GridMesh
```

Initialize and update the mesh given the (partial) data.

**Parameters**

- **data**: `Partial<GridMeshData>`  
  The (partial) data.

**Returns**  
`GridMesh`

---

### setShaderClass

```typescript
setShaderClass(shaderClass: typeof AbstractBaseShader): void
```

Initialize shader based on the shader class type.

**Parameters**

- **shaderClass**: `typeof AbstractBaseShader`  
  Shader class used. Must inherit from AbstractBaseShader.

**Returns**  
`void`

Inherited from [QuadMesh.setShaderClass](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#setShaderClass)

---

## Protected Methods

### _initialize

```typescript
protected _initialize(data: Partial<GridMeshData>): void
```

Initialize the data of this mesh given the (partial) data.

**Parameters**

- **data**: `Partial<GridMeshData>`  
  The (partial) data.

**Returns**  
`void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)