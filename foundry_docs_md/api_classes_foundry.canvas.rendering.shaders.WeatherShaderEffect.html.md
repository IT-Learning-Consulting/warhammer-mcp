# WeatherShaderEffect | Foundry Virtual Tabletop - API Documentation - Version 13

An interface for defining shader-based weather effects.

**Param: config**  
The config object to create the shader effect

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.WeatherShaderEffect)  

- [QuadMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html)  
- **WeatherShaderEffect**

---

## Accessors

### blendMode

```typescript
get blendMode(): BLEND_MODES
```

Assigned blend mode to this mesh.

**Returns:** `BLEND_MODES`  
Inherited from [QuadMesh.blendMode](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#blendMode)

---

### shader

```typescript
get shader(): AbstractBaseShader
```

The shader bound to this mesh.

**Returns:** [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)  
Inherited from [QuadMesh.shader](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#shader)

---

## Methods

### _calculateBounds

```typescript
_calculateBounds(): void
```

**Returns:** `void`  
Inherited from [QuadMesh._calculateBounds](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#_calculateBounds)

---

### _render

```typescript
_render(renderer: any): void
```

**Parameters:**  
- **renderer**: `any`

**Returns:** `void`  
Inherited from [QuadMesh._render](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#_render)

---

### configure

```typescript
configure(config?: object): void
```

Set shader parameters.

**Parameters:**  
- **config** *(optional)*: `object` = `{}`

**Returns:** `void`

---

### containsPoint

```typescript
containsPoint(point: IPointData): boolean
```

Tests if a point is inside this QuadMesh.

**Parameters:**  
- **point**: `IPointData`

**Returns:** `boolean`  
Inherited from [QuadMesh.containsPoint](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#containsPoint)

---

### destroy

```typescript
destroy(options: any): void
```

**Parameters:**  
- **options**: `any`

**Returns:** `void`  
Inherited from [QuadMesh.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#destroy)

---

### play

```typescript
play(): void
```

Begin animation.

**Returns:** `void`

---

### setShaderClass

```typescript
setShaderClass(shaderClass: typeof AbstractBaseShader): void
```

Initialize shader based on the shader class type.

**Parameters:**  
- **shaderClass**: `typeof AbstractBaseShader`  
  Shader class used. Must inherit from [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html).

**Returns:** `void`  
Inherited from [QuadMesh.setShaderClass](https://foundryvtt.com/api/classes/foundry.canvas.containers.QuadMesh.html#setShaderClass)

---

### stop

```typescript
stop(): void
```

Stop animation.

**Returns:** `void`

---

## Protected Methods

### _initialize

```typescript
_initialize(config: object): void
```

Protected. Initialize the weather effect.

**Parameters:**  
- **config**: `object`  
  Config object.

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)