# PointSourceMesh | Foundry Virtual Tabletop - API Documentation - Version 13

Extension of a PIXI.Mesh for PointEffectSources.

## Hierarchy

- *Mesh*
- **PointSourceMesh**

## Constructors

### constructor

```typescript
new PointSourceMesh(
    geometry: Geometry,
    shader: MeshMaterial,
    state?: State,
    drawMode?: DRAW_MODES,
): PointSourceMesh
```

**Parameters**

- **geometry**: *Geometry*  
  The geometry the mesh will use.
- **shader**: *MeshMaterial*  
  The shader the mesh will use.
- **state** (optional): *State*  
  The state that the WebGL context is required to be in to render the mesh. If no state is provided, uses [PIXI.State.for2d](https://foundryvtt.com/api/classes/foundry.canvas.containers.PointSourceMesh.html#1) to create a 2D state for PixiJS.
- **drawMode** (optional): *DRAW_MODES*  
  The drawMode, can be any of the [PIXI.DRAW_MODES](https://foundryvtt.com/api/classes/foundry.canvas.containers.PointSourceMesh.html#1) constants.

**Returns**: *PointSourceMesh*  
Inherited from PIXI.Mesh.constructor

---

## Accessors

### geometry

```typescript
get geometry(): Geometry
set geometry(value: Geometry): void
```

- **get geometry()**  
  **Returns**: *Geometry*  
  Overrides PIXI.Mesh.geometry

- **set geometry(value: Geometry)**  
  **Parameters**  
  - **value**: *Geometry*  
  **Returns**: *void*  
  Overrides PIXI.Mesh.geometry

---

## Methods

### _calculateBounds

```typescript
_calculateBounds(): void
```

**Returns**: *void*  
Overrides PIXI.Mesh._calculateBounds

---

### addChild

```typescript
addChild(): void
```

**Returns**: *void*  
Overrides PIXI.Mesh.addChild

---

### addChildAt

```typescript
addChildAt(): void
```

**Returns**: *void*  
Overrides PIXI.Mesh.addChildAt

---

### calculateBounds

```typescript
calculateBounds(): void
```

**Returns**: *void*  
Overrides PIXI.Mesh.calculateBounds

---

### getLocalBounds

```typescript
getLocalBounds(rect: any): any
```

The local bounds need to be drawn from the underlying geometry.

**Parameters**

- **rect**: *any*

**Returns**: *any*  
Overrides PIXI.Mesh.getLocalBounds