# SquareGrid

The square grid class.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [grid](https://foundryvtt.com/api/modules/foundry.grid.html) / [SquareGrid](https://foundryvtt.com/api/classes/foundry.grid.SquareGrid.html)

## Hierarchy

- [BaseGrid](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html)
- **SquareGrid**

---

## Constructors

### constructor

```typescript
new SquareGrid(config: SquareGridConfiguration): SquareGrid
```

- **config**: [SquareGridConfiguration](https://foundryvtt.com/api/interfaces/foundry.grid.types.SquareGridConfiguration.html)  
  The grid configuration

Returns:  
**SquareGrid**  
Overrides [BaseGrid.constructor](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#constructor)  

---

## Properties

### alpha

Type: `number`

The opacity of the grid.

Inherited from [BaseGrid.alpha](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#alpha)  
Readonly

---

### color

Type: [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)

The color of the grid.

Inherited from [BaseGrid.color](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#color)  
Readonly

---

### diagonals

Type: [GridDiagonalRule](https://foundryvtt.com/api/types/CONST.GridDiagonalRule.html)

The rule for diagonal measurement (see [CONST.GRID_DIAGONALS](https://foundryvtt.com/api/variables/CONST.GRID_DIAGONALS.html)).  
Readonly

---

### distance

Type: `number`

The distance of a grid space in units.

Inherited from [BaseGrid.distance](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#distance)  
Readonly

---

### size

Type: `number`

The size of a grid space in pixels.

Inherited from [BaseGrid.size](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#size)  
Readonly

---

### sizeX

Type: `number`

The width of a grid space in pixels.

Inherited from [BaseGrid.sizeX](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#sizex)  
Readonly

---

### sizeY

Type: `number`

The height of a grid space in pixels.

Inherited from [BaseGrid.sizeY](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#sizey)  
Readonly

---

### style

Type: `string`

The style of the grid.

Inherited from [BaseGrid.style](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#style)  
Readonly

---

### thickness

Type: `number`

The thickness of the grid.

Inherited from [BaseGrid.thickness](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#thickness)  
Readonly

---

### type

Type: `1` (equals `GRID_TYPES.SQUARE`)

Overrides [BaseGrid.type](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#type)  
Readonly

---

## Accessors

### units

Type: `string`

The distance units used in this grid.

Inherited from [BaseGrid.units](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#units)  
Readonly

---

### isGridless

```typescript
get isGridless(): boolean
```

Is this a gridless grid?

Returns:  
`boolean`  
Inherited from `BaseGrid.isGridless`

---

### isHexagonal

```typescript
get isHexagonal(): boolean
```

Is this a hexagonal grid?

Returns:  
`boolean`  
Inherited from `BaseGrid.isHexagonal`

---

### isSquare

```typescript
get isSquare(): boolean
```

Is this a square grid?

Returns:  
`boolean`  
Inherited from `BaseGrid.isSquare`

---

## Methods

### _measurePath

```typescript
_measurePath(
    waypoints: any,
    __namedParameters: { cost: any },
    result: any,
): void
```

- **waypoints**: any  
- **__namedParameters**: { cost: any }  
- **result**: any

Returns: `void`  
Overrides [BaseGrid._measurePath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#_measurepath)

---

### calculateDimensions

```typescript
calculateDimensions(
    sceneWidth: any,
    sceneHeight: any,
    padding: any,
): {
    columns: number;
    height: any;
    rows: number;
    width: any;
    x: number;
    y: number;
}
```

- **sceneWidth**: any  
- **sceneHeight**: any  
- **padding**: any  

Returns:  
An object containing:

- **columns**: number  
- **height**: any  
- **rows**: number  
- **width**: any  
- **x**: number  
- **y**: number  

Overrides [BaseGrid.calculateDimensions](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#calculatedimensions)

---

### getAdjacentOffsets

```typescript
getAdjacentOffsets(
    coords: any,
): { i: any; j: any }[] | { i: any; j: any; k: any }[]
```

- **coords**: any

Returns:  
Array of offset objects with properties:

- `i`, `j`  
or  
- `i`, `j`, `k`  

Overrides [BaseGrid.getAdjacentOffsets](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getadjacentoffsets)

---

### getCenterPoint

```typescript
getCenterPoint(
    coords: any,
):
    | { elevation?: undefined; x: number; y: number }
    | { elevation: number; x: number; y: number }
```

- **coords**: any

Returns:  
An object with properties:

- Optional **elevation**: number  
- **x**: number  
- **y**: number  

Overrides [BaseGrid.getCenterPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcenterpoint)

---

### getCircle

```typescript
getCircle(center: any, radius: any): Point[]
```

- **center**: any  
- **radius**: any  

Returns:  
Array of [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
Overrides [BaseGrid.getCircle](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcircle)

---

### getCone

```typescript
getCone(
    origin: Point,
    radius: number,
    direction: number,
    angle: number,
): Point[]
```

Get the cone polygon given the radius in grid units and the angle in degrees for this grid.  
The points of the polygon are returned ordered in positive orientation. In gridless grids an  
approximation of the true cone with a deviation of less than 0.25 pixels is returned.

- **origin**: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
  The origin point of the cone  
- **radius**: number  
  The radius in grid units  
- **direction**: number  
  The direction in degrees  
- **angle**: number  
  The angle in degrees  

Returns:  
Array of [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
Inherited from [BaseGrid.getCone](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcone)

---

### getDirectPath

```typescript
getDirectPath(waypoints: any): GridOffset2D[]
```

- **waypoints**: any

Returns:  
Array of [GridOffset2D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset2D.html)  
Overrides [BaseGrid.getDirectPath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getdirectpath)

---

### getOffset

```typescript
getOffset(
    coords: any,
): { i: any; j: any; k: any } | { i: any; j: any; k?: undefined }
```

- **coords**: any

Returns:  
An object with properties:

- `i`, `j`, `k` (optional)  

Overrides [BaseGrid.getOffset](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getoffset)

---

### getOffsetRange

```typescript
getOffsetRange(
    __namedParameters: { height: any; width: any; x: any; y: any },
): number[]
```

- **__namedParameters**: object containing:

  - **height**: any  
  - **width**: any  
  - **x**: any  
  - **y**: any  

Returns:  
`number[]`  
Overrides [BaseGrid.getOffsetRange](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getoffsetrange)

---

### getShape

```typescript
getShape(): { x: number; y: number }[]
```

Returns:  
Array of objects with properties:  
- **x**: number  
- **y**: number  

Overrides [BaseGrid.getShape](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshape)

---

### getShiftedOffset

```typescript
getShiftedOffset(
    coords: any,
    direction: any,
): { i: any; j: any; k: any } | { i: any; j: any; k?: undefined }
```

- **coords**: any  
- **direction**: any  

Returns:  
An object with properties:

- `i`, `j`, `k` (optional)  

Overrides [BaseGrid.getShiftedOffset](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshiftedoffset)

---

### getShiftedPoint

```typescript
getShiftedPoint(
    point: any,
    direction: any,
):
    | { elevation?: undefined; x: number; y: number }
    | { elevation: number; x: number; y: number }
```

- **point**: any  
- **direction**: any  

Returns:  
An object with properties:

- Optional **elevation**: number  
- **x**: number  
- **y**: number  

Overrides [BaseGrid.getShiftedPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshiftedpoint)

---

### getSnappedPoint

```typescript
getSnappedPoint(
    point: any,
    __namedParameters: { mode: any; resolution?: number },
):
    | undefined
    | { elevation: any; x: any; y: any }
    | { elevation?: undefined; x: any; y: any }
```

- **point**: any  
- **__namedParameters**: object with:

  - **mode**: any  
  - **resolution?**: number (optional)

Returns:

- `undefined` or
- an object with **elevation**, **x**, **y**

Overrides [BaseGrid.getSnappedPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getsnappedpoint)

---

### getTopLeftPoint

```typescript
getTopLeftPoint(
    coords: any,
):
    | { elevation?: undefined; x: number; y: number }
    | { elevation: number; x: number; y: number }
```

- **coords**: any  

Returns:  
An object with properties:

- Optional **elevation**: number  
- **x**: number  
- **y**: number  

Overrides [BaseGrid.getTopLeftPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#gettopleftpoint)

---

### getTranslatedPoint

```typescript
getTranslatedPoint(
    point: any,
    direction: any,
    distance: any,
):
    | { elevation: any; x: any; y: any }
    | { elevation?: undefined; x: any; y: any }
```

- **point**: any  
- **direction**: any  
- **distance**: any  

Returns:  
An object with properties:

- Optional **elevation**: number  
- **x**: number  
- **y**: number  

Overrides [BaseGrid.getTranslatedPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#gettranslatedpoint)

---

### getVertices

```typescript
getVertices(coords: any): { x: number; y: number }[]
```

- **coords**: any

Returns:  
Array of objects with properties:  
- **x**: number  
- **y**: number  

Overrides [BaseGrid.getVertices](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getvertices)

---

### measurePath

```typescript
measurePath<
    SegmentData extends {
        cost: never;
        elevation: never;
        i: never;
        j: never;
        k: never;
        q: never;
        r: never;
        s: never;
        x: never;
        y: never;
    } = {},
>(
    waypoints: (
        GridCoordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData
    )[],
    options?: { cost?: GridMeasurePathCostFunction2D<SegmentData> },
): GridMeasurePathResult
```

Measure a shortest, direct path through the given waypoints.

**Type Parameters**  
- `SegmentData` extends a structure excluding `cost`, `elevation`, `i`, `j`, `k`, `q`, `r`, `s`, `x`, `y`. Defaults to `{}`.

**Parameters**  
- **waypoints**: Array of combined `GridCoordinates2D`, partial `GridMeasurePathWaypointData2D` and `SegmentData`.  
  The waypoints the path must pass through.

- **options?**: Optional  
  Object optionally containing:  
  - **cost?**: [GridMeasurePathCostFunction2D](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction2D.html) function that returns the cost for a given move between grid spaces (default is the distance travelled along the direct path).

Returns:  
[GridMeasurePathResult](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html) — The measurements of the shortest, direct path.  

Inherited from [BaseGrid.measurePath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#measurepath)

---

```typescript
measurePath<
    SegmentData extends {
        cost: never;
        elevation: never;
        i: never;
        j: never;
        k: never;
        q: never;
        r: never;
        s: never;
        x: never;
        y: never;
    } = {},
>(
    waypoints: (
        GridCoordinates3D & Partial<GridMeasurePathWaypointData3D> & SegmentData
    )[],
    options?: { cost?: GridMeasurePathCostFunction3D<SegmentData> },
): GridMeasurePathResult
```

Measure a shortest, direct path through the given waypoints in 3D coordinates.

**Type Parameters**  
- `SegmentData` extends a structure excluding `cost`, `elevation`, `i`, `j`, `k`, `q`, `r`, `s`, `x`, `y`. Defaults to `{}`.

**Parameters**  
- **waypoints**: Array of combined `GridCoordinates3D`, partial `GridMeasurePathWaypointData3D` and `SegmentData`.  
  The waypoints the path must pass through.

- **options?**: Optional  
  Object optionally containing:  
  - **cost?**: [GridMeasurePathCostFunction3D](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction3D.html) function that returns the cost for a given move between grid spaces (default is the distance travelled along the direct path).

Returns:  
[GridMeasurePathResult](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html) — The measurements of the shortest, direct path.  

Inherited from [BaseGrid.measurePath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#measurepath)

---

### testAdjacency

```typescript
testAdjacency(coords1: any, coords2: any): boolean
```

- **coords1**: any  
- **coords2**: any  

Returns:  
`boolean` — Whether the two coordinates are adjacent.

Overrides [BaseGrid.testAdjacency](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#testadjacency)

---

# Links

- [SquareGridConfiguration Interface](https://foundryvtt.com/api/interfaces/foundry.grid.types.SquareGridConfiguration.html)  
- [Color Class](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
- [GridDiagonalRule Type](https://foundryvtt.com/api/types/CONST.GridDiagonalRule.html)  
- [CONST.GRID_DIAGONALS Variable](https://foundryvtt.com/api/variables/CONST.GRID_DIAGONALS.html)  
- [BaseGrid Class](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html)  
- [GridOffset2D Interface](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset2D.html)  
- [Point Interface](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
- [GridCoordinates2D Type](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates2D.html)  
- [GridCoordinates3D Type](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates3D.html)  
- [GridMeasurePathWaypointData2D Interface](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathWaypointData2D.html)  
- [GridMeasurePathWaypointData3D Interface](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathWaypointData3D.html)  
- [GridMeasurePathCostFunction2D Type](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction2D.html)  
- [GridMeasurePathCostFunction3D Type](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction3D.html)  
- [GridMeasurePathResult Interface](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html)