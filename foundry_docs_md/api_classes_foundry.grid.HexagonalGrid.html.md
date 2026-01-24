# HexagonalGrid

The hexagonal grid class.

**Hierarchy:**  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.grid.HexagonalGrid)  
* BaseGrid  
* HexagonalGrid  

---

## Constructors

### constructor
```typescript
new HexagonalGrid(config: HexagonalGridConfiguration): HexagonalGrid
```

The hexagonal grid constructor.

**Parameters**

- **config**: `HexagonalGridConfiguration`  
  The grid configuration

**Returns**  
`HexagonalGrid`

Overrides [`BaseGrid.constructor`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#constructor)

---

## Properties

- **config**: `HexagonalGridConfiguration`  
  The grid configuration

- **alpha**: `number` (readonly)  
  The opacity of the grid.  
  Inherited from [`BaseGrid.alpha`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#alpha)

- **color**: `Color` (readonly)  
  The color of the grid.  
  Inherited from [`BaseGrid.color`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#color)

- **columns**: `boolean` (readonly)  
  Is this grid column-based (flat-topped) or row-based (pointy-topped)?

- **diagonals**: `GridDiagonalRule` (readonly)  
  The rule for diagonal measurement (see [CONST.GRID_DIAGONALS](https://foundryvtt.com/api/variables/CONST.GRID_DIAGONALS.html)).

- **distance**: `number` (readonly)  
  The distance of a grid space in units.  
  Inherited from [`BaseGrid.distance`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#distance)

- **even**: `boolean` (readonly)  
  Is this grid even or odd?

- **size**: `number` (readonly)  
  The size of a grid space in pixels.  
  Inherited from [`BaseGrid.size`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#size)

- **sizeX**: `number` (readonly)  
  The width of a grid space in pixels.  
  Inherited from [`BaseGrid.sizeX`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#sizex)

- **sizeY**: `number` (readonly)  
  The height of a grid space in pixels.  
  Inherited from [`BaseGrid.sizeY`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#sizey)

---

## Accessors

- **style**: `string` (readonly)  
  The style of the grid.  
  Inherited from [`BaseGrid.style`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#style)

- **thickness**: `number` (readonly)  
  The thickness of the grid.  
  Inherited from [`BaseGrid.thickness`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#thickness)

- **type**: `2 | 3 | 4 | 5` (readonly)  
  Inherited from [`BaseGrid.type`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#type)

- **units**: `string` (readonly)  
  The distance units used in this grid.  
  Inherited from [`BaseGrid.units`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#units)

- **isGridless**: `boolean` (readonly, getter)  
  Is this a gridless grid?  
  Returns: `boolean`  
  Inherited from `BaseGrid`

- **isHexagonal**: `boolean` (readonly, getter)  
  Is this a hexagonal grid?  
  Returns: `boolean`  
  Inherited from `BaseGrid`

- **isSquare**: `boolean` (readonly, getter)  
  Is this a square grid?  
  Returns: `boolean`  
  Inherited from `BaseGrid`

---

## Methods

### _measurePath
```typescript
_measurePath(
    waypoints: any, 
    __namedParameters: { cost: any }, 
    result: any
): void
```
Overrides [`BaseGrid._measurePath`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#_measurepath).

**Parameters**

- **waypoints**: `any`  
- **__namedParameters**: `{ cost: any }`  
- **result**: `any`  

**Returns**: `void`

---

### calculateDimensions
```typescript
calculateDimensions(
    sceneWidth: any, 
    sceneHeight: any, 
    padding: any
): {
    columns: number;
    height: any;
    rows: number;
    width: any;
    x: number;
    y: number;
}
```
Calculate the total size of the canvas with padding applied, as well as the top-left coordinates of the inner rectangle that houses the scene.

**Parameters**

- **sceneWidth**: `any`  
  The width of the scene.

- **sceneHeight**: `any`  
  The height of the scene.

- **padding**: `any`  
  The percentage of padding.

**Returns**:  
An object containing:  
- **columns**: `number`  
- **height**: any  
- **rows**: `number`  
- **width**: any  
- **x**: `number`  
- **y**: `number`

Overrides [`BaseGrid.calculateDimensions`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#calculatedimensions)

---

### cubeToOffset
```typescript
cubeToOffset(cube: HexagonalGridCube2D): GridOffset2D
```
Convert integer cube coordinates (q, r, s) / (q, r, s, k) into offset coordinates (i, j) / (i, j, k).  
Inverse of [`HexagonalGrid.offsetToCube`](#offsettocube).

**Parameters**

- **cube**: `HexagonalGridCube2D`  
  The cube coordinates

**Returns**  
`GridOffset2D` - The offset coordinates

**See**  
[https://www.redblobgames.com/grids/hexagons/](https://www.redblobgames.com/grids/hexagons/)

---

```typescript
cubeToOffset(cube: HexagonalGridCube3D): GridOffset3D
```

**Parameters**

- **cube**: `HexagonalGridCube3D`  
  The cube coordinates

**Returns**  
`GridOffset3D` - The offset coordinates

---

### cubeToPoint
```typescript
cubeToPoint(cube: HexagonalGridCube2D): Point
```
Convert cube coordinates (q, r, s) / (q, r, s, k) into point coordinates (x, y) / (x, y, elevation).  
Inverse of [`HexagonalGrid.pointToCube`](#pointtocube).

**Parameters**

- **cube**: `HexagonalGridCube2D`  
  The cube coordinates

**Returns**  
`Point` - The point coordinates

**See**  
[https://www.redblobgames.com/grids/hexagons/](https://www.redblobgames.com/grids/hexagons/)

---

```typescript
cubeToPoint(cube: HexagonalGridCube3D): ElevatedPoint
```

**Parameters**

- **cube**: `HexagonalGridCube3D`  
  The cube coordinates

**Returns**  
`ElevatedPoint` - The point coordinates

---

### getAdjacentCubes
```typescript
getAdjacentCubes(coords: HexagonalGridCoordinates2D): HexagonalGridCube2D[]
```
Returns the cube coordinates of grid spaces adjacent to the one corresponding to the given coordinates.

**Parameters**

- **coords**: `HexagonalGridCoordinates2D`  
  The coordinates

**Returns**  
`HexagonalGridCube2D[]` - The adjacent cube coordinates

---

```typescript
getAdjacentCubes(coords: HexagonalGridCoordinates3D): HexagonalGridCube3D[]
```

**Parameters**

- **coords**: `HexagonalGridCoordinates3D`  
  The coordinates

**Returns**  
`HexagonalGridCube3D[]` - The adjacent cube coordinates

---

### getAdjacentOffsets
```typescript
getAdjacentOffsets(coords: any): ({ i: any; j: any; k: any } | { i: any; j: any; k?: undefined })[]
```
Overrides [`BaseGrid.getAdjacentOffsets`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getadjacentoffsets).

**Parameters**

- **coords**: `any`

**Returns**  
Array of objects containing offset coordinates with optional k.

---

### getCenterPoint
```typescript
getCenterPoint(coords: any): Point | { elevation: number; x: number; y: number }
```
Overrides [`BaseGrid.getCenterPoint`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcenterpoint).

**Parameters**

- **coords**: `any`

**Returns**  
`Point` or an object with elevation, x, y.

---

### getCircle
```typescript
getCircle(__namedParameters: { x: any; y: any }, radius: any): { x: any; y: any }[]
```
Overrides [`BaseGrid.getCircle`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcircle).

**Parameters**

- **__namedParameters**: `{ x: any; y: any }`  
- **radius**: `any`

**Returns**  
Array of points `{ x, y }`

---

### getCone
```typescript
getCone(
    origin: Point, 
    radius: number, 
    direction: number, 
    angle: number
): Point[]
```
Get the cone polygon given the radius in grid units and the angle in degrees for this grid.  
The points of the polygon are returned ordered in positive orientation. In gridless grids an approximation of the true cone with a deviation of less than 0.25 pixels is returned.

**Parameters**

- **origin**: `Point`  
  The origin point of the cone

- **radius**: `number`  
  The radius in grid units

- **direction**: `number`  
  The direction in degrees

- **angle**: `number`  
  The angle in degrees

**Returns**  
`Point[]` - The points of the cone polygon

Inherited from [`BaseGrid.getCone`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcone).

---

### getCube
```typescript
getCube(coords: HexagonalGridCoordinates2D): HexagonalGridCube2D
```
Returns the cube coordinates of the grid space corresponding to the given coordinates.

**Parameters**

- **coords**: `HexagonalGridCoordinates2D`

**Returns**  
`HexagonalGridCube2D`

---

```typescript
getCube(coords: HexagonalGridCoordinates3D): HexagonalGridCube3D
```

**Parameters**

- **coords**: `HexagonalGridCoordinates3D`

**Returns**  
`HexagonalGridCube3D`

---

### getDirectPath
```typescript
getDirectPath(
    waypoints: any
): ({ i: any; j: any; k: any } | { i: any; j: any; k?: undefined })[]
```
Overrides [`BaseGrid.getDirectPath`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getdirectpath).

**Parameters**

- **waypoints**: `any`

**Returns**  
Array of offset objects.

**See**  
[https://www.redblobgames.com/grids/hexagons/#line-drawing](https://www.redblobgames.com/grids/hexagons/#line-drawing)

---

### getOffset
```typescript
getOffset(
    coords: any
): { i: any; j: any; k: any } | { i: any; j: any; k?: undefined }
```
Overrides [`BaseGrid.getOffset`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getoffset).

**Parameters**

- **coords**: `any`

**Returns**  
Offset coordinates, with optional k.

---

### getOffsetRange
```typescript
getOffsetRange(
    __namedParameters: { height: any; width: any; x: any; y: any }
): any[]
```
Overrides [`BaseGrid.getOffsetRange`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getoffsetrange).

**Parameters**

- **__namedParameters**: `{ height: any; width: any; x: any; y: any }`

**Returns**  
Array of offsets

---

### getShape
```typescript
getShape(): { x: number; y: number }[]
```
Overrides [`BaseGrid.getShape`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshape).

**Returns**  
Array of points with x, y representing the shape of the hexagon

---

### getShiftedCube
```typescript
getShiftedCube(
    coords: HexagonalGridCoordinates2D, 
    direction: number
): HexagonalGridCube2D
```
Returns the cube coordinates of the grid space corresponding to the given coordinates shifted by one grid space in the given direction.

**Parameters**

- **coords**: `HexagonalGridCoordinates2D`

- **direction**: `number`  
  See [CONST.MOVEMENT_DIRECTIONS](https://foundryvtt.com/api/variables/CONST.MOVEMENT_DIRECTIONS.html)

**Returns**  
`HexagonalGridCube2D`

---

```typescript
getShiftedCube(
    coords: HexagonalGridCoordinates3D, 
    direction: number
): HexagonalGridCube3D
```

**Parameters**

- **coords**: `HexagonalGridCoordinates3D`

- **direction**: `number`  
  See [CONST.MOVEMENT_DIRECTIONS](https://foundryvtt.com/api/variables/CONST.MOVEMENT_DIRECTIONS.html)

**Returns**  
`HexagonalGridCube3D`

---

### getShiftedOffset
```typescript
getShiftedOffset(
    coords: any, 
    direction: any
): { i: any; j: any; k: any } | { i: any; j: any; k?: undefined }
```
Overrides [`BaseGrid.getShiftedOffset`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshiftedoffset).

**Parameters**

- **coords**: `any`  
- **direction**: `any`

**Returns**  
Offset coordinates shifted.

---

### getShiftedPoint
```typescript
getShiftedPoint(
    point: any, 
    direction: any
): Point | { elevation: number; x: number; y: number }
```
Overrides [`BaseGrid.getShiftedPoint`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshiftedpoint).

**Parameters**

- **point**: `any`
- **direction**: `any`

**Returns**  
The shifted point, optionally with elevation

---

### getSnappedPoint
```typescript
getSnappedPoint(
    point: any, 
    __namedParameters: { mode: any; resolution?: number }
): any
```
Overrides [`BaseGrid.getSnappedPoint`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getsnappedpoint).

**Parameters**

- **point**: `any`  
- **__namedParameters**:  
  - **mode**: any  
  - **resolution?**: `number`

**Returns**  
Snapped point

---

### getTopLeftPoint
```typescript
getTopLeftPoint(coords: any): 
    | { elevation: number; x: number; y: number } 
    | { elevation?: undefined; x: number; y: number }
```
Overrides [`BaseGrid.getTopLeftPoint`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#gettopleftpoint).

**Parameters**

- **coords**: `any`

**Returns**  
Top-left point of the grid cell

---

### getTranslatedPoint
```typescript
getTranslatedPoint(
    point: any, 
    direction: any, 
    distance: any
): { elevation: any; x: any; y: any } | { elevation?: undefined; x: any; y: any }
```
Overrides [`BaseGrid.getTranslatedPoint`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#gettranslatedpoint).

**Parameters**

- **point**: `any`  
- **direction**: `any`  
- **distance**: `any`

**Returns**  
Translated point

---

### getVertices
```typescript
getVertices(coords: any): { x: number; y: number }[]
```
Overrides [`BaseGrid.getVertices`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getvertices).

**Parameters**

- **coords**: `any`

**Returns**  
Array of vertex points `{ x, y }`

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
    } = {}
>(
    waypoints: (
        HexagonalGridCoordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData
    )[],
    options?: { cost?: GridMeasurePathCostFunction2D<SegmentData> }
): GridMeasurePathResult
```

Measure a shortest, direct path through the given waypoints.

**Type Parameters**

- **SegmentData** extends `{ cost: never; elevation: never; i: never; j: never; k: never; q: never; r: never; s: never; x: never; y: never }` = `{}`

**Parameters**

- **waypoints**:  
  Array of coordinates for 2D grids: `HexagonalGridCoordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData`  
- **options?**:
  - **cost?**: `GridMeasurePathCostFunction2D<SegmentData>`  
    Function that returns the cost for a given move between grid spaces (default is the distance travelled along the direct path)

**Returns**  
`GridMeasurePathResult`

Inherited from [`BaseGrid.measurePath`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#measurepath)

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
    } = {}
>(
    waypoints: (
        HexagonalGridCoordinates3D & Partial<GridMeasurePathWaypointData3D> & SegmentData
    )[],
    options?: { cost?: GridMeasurePathCostFunction3D<SegmentData> }
): GridMeasurePathResult
```
Same as above for 3D coordinates.

---

### offsetToCube
```typescript
offsetToCube(offset: GridOffset2D): HexagonalGridCube2D
```
Convert offset coordinates (i, j) / (i, j, k) into integer cube coordinates (q, r, s) / (q, r, s, k).  
Inverse of [`HexagonalGrid.cubeToOffset`](#cuboetooffset).

**Parameters**

- **offset**: `GridOffset2D`  
  The offset coordinates

**Returns**  
`HexagonalGridCube2D` - The integer cube coordinates

**See**  
[https://www.redblobgames.com/grids/hexagons/](https://www.redblobgames.com/grids/hexagons/)

---

```typescript
offsetToCube(offset: GridOffset3D): HexagonalGridCube3D
```

**Parameters**

- **offset**: `GridOffset3D`  
  The offset coordinates

**Returns**  
`HexagonalGridCube3D` - The integer cube coordinates

---

### pointToCube
```typescript
pointToCube(point: Point): HexagonalGridCube2D
```
Convert point coordinates (x, y) / (x, y, elevation) into cube coordinates (q, r, s) / (q, r, s, k).  
Inverse of [`HexagonalGrid.cubeToPoint`](#cubetopoint).

**Parameters**

- **point**: `Point`  
  The point

**Returns**  
`HexagonalGridCube2D` - The (fractional) cube coordinates

**See**  
[https://www.redblobgames.com/grids/hexagons/](https://www.redblobgames.com/grids/hexagons/)

---

```typescript
pointToCube(point: ElevatedPoint): HexagonalGridCube3D
```

**Parameters**

- **point**: `ElevatedPoint`  
  The point

**Returns**  
`HexagonalGridCube3D` - The (fractional) cube coordinates

---

### testAdjacency
```typescript
testAdjacency(coords1: any, coords2: any): boolean
```
Overrides [`BaseGrid.testAdjacency`](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#testadjacency).

**Parameters**

- **coords1**: `any`  
- **coords2**: `any`

**Returns**  
`boolean`

---

### Static Methods

#### cubeDistance
```typescript
static cubeDistance(a: HexagonalGridCube2D, b: HexagonalGridCube2D): number
```
Measure the distance in hexagons between two cube coordinates.

**Parameters**

- **a**: `HexagonalGridCube2D`  
  The first cube coordinates

- **b**: `HexagonalGridCube2D`  
  The second cube coordinates

**Returns**  
`number` - The distance between the two cube coordinates in hexagons

**See**  
[https://www.redblobgames.com/grids/hexagons/](https://www.redblobgames.com/grids/hexagons/)

---

#### cubeRound
```typescript
static cubeRound(cube: HexagonalGridCube2D): HexagonalGridCube2D
```
Round the fractional cube coordinates (q, r, s) / (q, r, s, k). The k-coordinate is floored.

**Parameters**

- **cube**: `HexagonalGridCube2D`  
  The fractional cube coordinates

**Returns**  
`HexagonalGridCube2D` - The rounded integer cube coordinates

**See**  
[https://www.redblobgames.com/grids/hexagons/](https://www.redblobgames.com/grids/hexagons/)

---

```typescript
static cubeRound(cube: HexagonalGridCube3D): HexagonalGridCube3D
```

**Parameters**

- **cube**: `HexagonalGridCube3D`  
  The fractional cube coordinates

**Returns**  
`HexagonalGridCube3D` - The rounded integer cube coordinates

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)