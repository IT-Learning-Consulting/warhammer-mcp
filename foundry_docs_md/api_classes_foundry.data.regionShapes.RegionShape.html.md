# RegionShape | Foundry Virtual Tabletop - API Documentation - Version 13

**Class** `RegionShape<ShapeData>` _Abstract_  
A shape of a [foundry.documents.RegionDocument](https://foundryvtt.com/api/classes/foundry.documents.RegionDocument.html).

## Type Parameters

- **ShapeData** = _BaseShapeData_  
  (See [BaseShapeData](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html))

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.regionShapes.RegionShape))

- **RegionShape**  
  - _RegionCircleShape_  
  - _RegionEllipseShape_  
  - _RegionPolygonShape_  
  - _RegionRectangleShape_  

---

## Accessors

### `clipperPaths`

```typescript
get clipperPaths(): readonly (readonly IntPoint[])[]
```

The Clipper paths of this shape. The winding numbers are 1 or 0.

**Returns**  
`readonly (readonly IntPoint[])[]`

---

### `clipperPolyTree`

```typescript
get clipperPolyTree(): PolyTree
```

The Clipper polygon tree of this shape.

**Returns**  
`PolyTree`

---

### `data`

```typescript
get data(): ShapeData
```

The data of this shape. It is owned by the shape and must not be modified.

**Returns**  
`ShapeData`

---

### `isHole`

```typescript
get isHole(): boolean
```

Is this a hole?

**Returns**  
`boolean`

---

## Protected Methods

### `_createClipperPolyTree`

```typescript
protected _createClipperPolyTree(): any
```

Create the Clipper polygon tree of this shape. This function may return a single positively-orientated and non-selfintersecting Clipper path instead of a tree, which is automatically converted to a Clipper polygon tree. This function is called only once. It is not called if the shape is empty.

**Returns**  
`any`

---

## Static Methods

### `create`

```typescript
static create(
  data:
    | RectangleShapeData
    | CircleShapeData
    | EllipseShapeData
    | PolygonShapeData
): RegionShape<BaseShapeData>
```

Create the RegionShape from the shape data.

**Parameters**

- **data**: `RectangleShapeData` | `CircleShapeData` | `EllipseShapeData` | `PolygonShapeData`  
  The shape data.

**Returns**  
`RegionShape<BaseShapeData>`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)