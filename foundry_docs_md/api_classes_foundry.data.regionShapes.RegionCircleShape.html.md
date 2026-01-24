# RegionCircleShape

A circle of a [foundry.documents.RegionDocument](https://foundryvtt.com/api/classes/foundry.documents.RegionDocument.html).

## Hierarchy  
* [RegionShape](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html)  
* **RegionCircleShape**

---

## Constructors

### constructor
```typescript
new RegionCircleShape(data: CircleShapeData): RegionCircleShape
```

**Parameters**

- **data**: `CircleShapeData`  
  The circle shape data.

---

## Accessors

### clipperPaths
```typescript
get clipperPaths(): readonly (readonly IntPoint[])[]
```
The Clipper paths of this shape. The winding numbers are 1 or 0.

**Returns**  
`readonly (readonly IntPoint[])[]`  
Inherited from [RegionShape.clipperPaths](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#clipperPaths)

---

### clipperPolyTree
```typescript
get clipperPolyTree(): PolyTree
```
The Clipper polygon tree of this shape.

**Returns**  
`PolyTree`  
Inherited from [RegionShape.clipperPolyTree](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#clipperPolyTree)

---

### data
```typescript
get data(): ShapeData
```
The data of this shape. It is owned by the shape and must not be modified.

**Returns**  
`ShapeData`  
Inherited from [RegionShape.data](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#data)

---

### isHole
```typescript
get isHole(): boolean
```
Is this a hole?

**Returns**  
`boolean`  
Inherited from [RegionShape.isHole](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#isHole)

---

## Methods

### _createClipperPolyTree
```typescript
_createClipperPolyTree(): any[]
```

**Returns**  
`any[]`

Overrides [RegionShape._createClipperPolyTree](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#_createClipperPolyTree)

---

## Static Methods

### create
```typescript
static create(
    data: RectangleShapeData 
       | CircleShapeData 
       | EllipseShapeData 
       | PolygonShapeData
): RegionShape<BaseShapeData>
```

Create the RegionShape from the shape data.

**Parameters**

- **data**: `RectangleShapeData | CircleShapeData | EllipseShapeData | PolygonShapeData`  
  The shape data.

**Returns**  
`RegionShape<BaseShapeData>`  

Inherited from [RegionShape.create](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionShape.html#create)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)