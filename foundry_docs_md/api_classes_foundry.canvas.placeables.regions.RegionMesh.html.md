# RegionMesh | Foundry Virtual Tabletop - API Documentation - Version 13

A mesh of a `foundry.canvas.placeables.Region`.

---

## Hierarchy

- Container
- **RegionMesh**

---

## Constructors

### constructor

```typescript
new RegionMesh(
    region: canvas.placeables.Region, 
    shaderClass?: AbstractBaseShader,
): RegionMesh
```

Create a RegionMesh.

**Parameters**

- **region**: `canvas.placeables.Region`  
  The Region to create the RegionMesh from.

- **shaderClass** (optional): `AbstractBaseShader = RegionShader`  
  The shader class to use.

**Returns**: `RegionMesh`

Overrides `PIXI.Container.constructor`

---

## Properties

### Protected

#### _cachedTint

```typescript
_cachedTint: [red: number, green: number, blue: number, alpha: number] = ...
```

Cached tint value for the shader uniforms.

#### _tintAlphaDirty

```typescript
_tintAlphaDirty: boolean
```

Used to track a tint or alpha change to execute a recomputation of `_cachedTint`.

#### _tintColor

```typescript
_tintColor: Color = ...
```

The tint applied to the mesh. This is a hex value. A value of `0xFFFFFF` will remove any tint effect.

---

## Accessors

### blendMode

```typescript
get blendMode(): BLEND_MODES
```

The blend mode assigned to this RegionMesh.

**Returns**: `BLEND_MODES`

---

### region

```typescript
get region(): RegionMesh
```

The Region of this RegionMesh.

**Returns**: `RegionMesh`

---

### shader

```typescript
get shader(): AbstractBaseShader
```

The shader bound to this RegionMesh.

**Returns**: `AbstractBaseShader`

---

### tint

```typescript
get tint(): number
```

The tint applied to the mesh. This is a hex value.  
A value of `0xFFFFFF` will remove any tint effect.

**Returns**: `number`  
**Default Value**: `0xFFFFFF`

---

## Methods

### _calculateBounds

```typescript
_calculateBounds(): void
```

Overrides `PIXI.Container._calculateBounds`

**Returns**: `void`

---

### _render

```typescript
_render(renderer: any): void
```

Overrides `PIXI.Container._render`

**Parameters**

- **renderer**: `any`

**Returns**: `void`

---

### containsPoint

```typescript
containsPoint(point: Point): boolean
```

Tests if a point is inside this RegionMesh.

**Parameters**

- **point**: [`Point`](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)

**Returns**: `boolean`

---

### destroy

```typescript
destroy(options: any): void
```

Overrides `PIXI.Container.destroy`

**Parameters**

- **options**: `any`

**Returns**: `void`

---

### setShaderClass

```typescript
setShaderClass(shaderClass: typeof AbstractBaseShader): void
```

Initialize shader based on the shader class type.

**Parameters**

- **shaderClass**: `typeof AbstractBaseShader`  
  The shader class, which must inherit from `AbstractBaseShader`.

**Returns**: `void`

---

### updateTransform

```typescript
updateTransform(): void
```

Overrides `PIXI.Container.updateTransform`

**Returns**: `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)