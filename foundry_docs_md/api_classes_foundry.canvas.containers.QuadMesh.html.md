# QuadMesh

A basic rectangular mesh with a shader only. Does not natively handle textures (but a bound shader can). Bounds calculations are simplified and the geometry does not need to handle texture coords.

## Hierarchy  
- Container  
- **QuadMesh**  
- _GridMesh_  
- _WeatherShaderEffect_

## Constructors

### constructor

```typescript
new QuadMesh(shaderClass: typeof AbstractBaseShader): QuadMesh
```

**Parameters:**

- **shaderClass**: `typeof AbstractBaseShader`  
  The shader class to use.

**Returns:**  
`QuadMesh`

Overrides `PIXI.Container.constructor`.

## Accessors

### blendMode

```typescript
get blendMode(): BLEND_MODES
```

Assigned blend mode to this mesh.

**Returns:**  
`BLEND_MODES`

### shader

```typescript
get shader(): AbstractBaseShader
```

The shader bound to this mesh.

**Returns:**  
`AbstractBaseShader`

## Methods

### _calculateBounds

```typescript
_calculateBounds(): void
```

Overrides `PIXI.Container._calculateBounds`.

**Returns:**  
`void`

### _render

```typescript
_render(renderer: any): void
```

Overrides `PIXI.Container._render`.

**Parameters:**

- **renderer**: `any`  

**Returns:**  
`void`

### containsPoint

```typescript
containsPoint(point: IPointData): boolean
```

Tests if a point is inside this QuadMesh.

**Parameters:**

- **point**: `IPointData`  

**Returns:**  
`boolean`

### destroy

```typescript
destroy(options: any): void
```

Overrides `PIXI.Container.destroy`.

**Parameters:**

- **options**: `any`  

**Returns:**  
`void`

### setShaderClass

```typescript
setShaderClass(shaderClass: typeof AbstractBaseShader): void
```

Initialize shader based on the shader class type.

**Parameters:**

- **shaderClass**: `typeof AbstractBaseShader`  
  Shader class used. Must inherit from `AbstractBaseShader`.

**Returns:**  
`void`

---

For more details, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html).