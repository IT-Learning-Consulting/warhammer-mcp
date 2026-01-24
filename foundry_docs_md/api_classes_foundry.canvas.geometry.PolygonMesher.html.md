# PolygonMesher

A helper class used to construct triangulated polygon meshes. Allows adding padding and a specific depth value.

## Constructor

```typescript
constructor(poly: Point[] | PIXI.Polygon, options?: Record<string, number | boolean>)
```

- **poly**: Closed polygon to be processed and converted to a mesh (array of points or PIXI Polygon)
- **options**: Various options such as normalizing, offsetting, adding depth, etc.

## Properties

- **indices**: `number[] = []`  
  Polygon mesh indices

- **options**: `Record<string, number | boolean>`  
  Contains options to apply during the meshing process

- **vertices**: `number[] = []`  
  Polygon mesh vertices

### Static

- **_defaultOptions**: `Record<string, number | boolean> = ...`  
  Default options values

## Methods

### triangulate

```typescript
triangulate(geometry: Geometry): Geometry
```

Execute the triangulation to create indices.

- **Parameters**
  - **geometry**: `Geometry`  
    A geometry to update
- **Returns**: `Geometry`  
  The resulting geometry

### getClipperPathFromPoints

```typescript
static getClipperPathFromPoints(poly: number[] | Polygon, dimension?: number): any
```

Convert a flat points array into a 2-dimensional ClipperLib path.

- **Parameters**
  - **poly**: `number[] | Polygon`  
    PIXI.Polygon or points flat array.
  - **dimension** (optional): `number = 2`  
    Dimension.
- **Returns**: `any`  
  The ClipperLib path.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)