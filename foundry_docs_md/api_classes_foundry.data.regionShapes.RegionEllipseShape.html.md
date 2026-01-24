# RegionEllipseShape | Foundry Virtual Tabletop - API Documentation - Version 13

An ellipse of a [foundry.documents.RegionDocument](https://foundryvtt.com/api/classes/foundry.documents.RegionDocument.html).

## Hierarchy

- _[RegionShape](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html)_
- **RegionEllipseShape**

---

## Constructors

### constructor

```typescript
new RegionEllipseShape(data: EllipseShapeData): RegionEllipseShape
```

**Parameters**

- **data**: _EllipseShapeData_

  The ellipse shape data.

---

## Accessors

### clipperPaths

```typescript
get clipperPaths(): readonly (readonly IntPoint[])[]
```

The Clipper paths of this shape. The winding numbers are 1 or 0.

**Returns:** readonly (readonly IntPoint[])[]

_Inherited from [RegionShape.clipperPaths](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#clipperPaths)_

---

### clipperPolyTree

```typescript
get clipperPolyTree(): PolyTree
```

The Clipper polygon tree of this shape.

**Returns:** PolyTree

_Inherited from [RegionShape.clipperPolyTree](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#clipperPolyTree)_

---

### data

```typescript
get data(): ShapeData
```

The data of this shape. It is owned by the shape and must not be modified.

**Returns:** ShapeData

_Inherited from [RegionShape.data](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#data)_

---

### isHole

```typescript
get isHole(): boolean
```

Is this a hole?

**Returns:** boolean

_Inherited from [RegionShape.isHole](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#isHole)_

---

## Methods

### _createClipperPolyTree

```typescript
_createClipperPolyTree(): any[]
```

**Returns:** any[]

Overrides [RegionShape._createClipperPolyTree](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#_createClipperPolyTree)

---

## Static Methods

### create

```typescript
create(
    data:
        | RectangleShapeData
        | CircleShapeData
        | EllipseShapeData
        | PolygonShapeData,
): RegionShape<BaseShapeData>
```

Create the RegionShape from the shape data.

**Parameters**

- **data**: RectangleShapeData | CircleShapeData | EllipseShapeData | PolygonShapeData

  The shape data.

**Returns:** RegionShape<BaseShapeData>

_Inherited from [RegionShape.create](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#create)_