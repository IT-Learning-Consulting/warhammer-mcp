# BaseGrid\<Coordinates2D, Coordinates3D> Abstract

The base grid class.

**Type Parameters**

- `Coordinates2D` = [GridCoordinates2D](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates2D.html)
- `Coordinates3D` = [GridCoordinates3D](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates3D.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.grid.BaseGrid))  

BaseGrid  
&nbsp;&nbsp;&nbsp;&nbsp;↳ [GridlessGrid](https://foundryvtt.com/api/classes/foundry.grid.GridlessGrid.html)  
&nbsp;&nbsp;&nbsp;&nbsp;↳ [HexagonalGrid](https://foundryvtt.com/api/classes/foundry.grid.HexagonalGrid.html)  
&nbsp;&nbsp;&nbsp;&nbsp;↳ [SquareGrid](https://foundryvtt.com/api/classes/foundry.grid.SquareGrid.html)  

---

## Constructors

### constructor

```typescript
new BaseGrid<
    Coordinates2D = GridCoordinates2D,
    Coordinates3D = GridCoordinates3D,
>(
    config: GridConfiguration,
): BaseGrid<Coordinates2D, Coordinates3D>
```

The base grid constructor.

**Type Parameters**

- `Coordinates2D` = [GridCoordinates2D](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates2D.html)  
- `Coordinates3D` = [GridCoordinates3D](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates3D.html)

**Parameters**

- **config**: [GridConfiguration](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridConfiguration.html)  
  The grid configuration

**Returns**

- `BaseGrid<Coordinates2D, Coordinates3D>`  

---

## Properties

- **alpha**: `number`  
  The opacity of the grid. (readonly)

- **color**: [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
  The color of the grid. (readonly)

- **distance**: `number`  
  The distance of a grid space in units. (readonly)

- **size**: `number`  
  The size of a grid space in pixels. (readonly)

- **sizeX**: `number`  
  The width of a grid space in pixels. (readonly)

- **sizeY**: `number`  
  The height of a grid space in pixels. (readonly)

- **style**: `string`  
  The style of the grid. (readonly)

- **thickness**: `number`  
  The thickness of the grid. (readonly)

- **type**: [GridType](https://foundryvtt.com/api/types/CONST.GridType.html)  
  The grid type (see [CONST.GRID_TYPES](https://foundryvtt.com/api/variables/CONST.GRID_TYPES.html)). (readonly)

- **units**: `string`  
  The distance units used in this grid. (readonly)

---

## Accessors

### isGridless

```typescript
get isGridless(): boolean
```

Is this a gridless grid?

**Returns**: `boolean`

### isHexagonal

```typescript
get isHexagonal(): boolean
```

Is this a hexagonal grid?

**Returns**: `boolean`

### isSquare

```typescript
get isSquare(): boolean
```

Is this a square grid?

**Returns**: `boolean`

---

## Methods

### calculateDimensions

```typescript
abstract calculateDimensions(
    sceneWidth: number,
    sceneHeight: number,
    padding: number,
): {
    columns: number;
    height: number;
    rows: number;
    width: number;
    x: number;
    y: number;
}
```

Calculate the total size of the canvas with padding applied, as well as the top-left coordinates  
of the inner rectangle that houses the scene.

**Parameters**

- **sceneWidth**: `number`  
  The width of the scene.

- **sceneHeight**: `number`  
  The height of the scene.

- **padding**: `number`  
  The percentage of padding.

**Returns**

An object containing:

- `columns: number`
- `height: number`
- `rows: number`
- `width: number`
- `x: number`
- `y: number`

---

### getAdjacentOffsets

```typescript
abstract getAdjacentOffsets(coords: Coordinates2D): GridOffset2D[]
abstract getAdjacentOffsets(coords: Coordinates3D): GridOffset3D[]
```

Returns the offsets of the grid spaces adjacent to the one corresponding to the given  
coordinates. Returns always an empty array in gridless grids.

**Parameters**

- **coords**: Coordinates2D | Coordinates3D  
  The coordinates

**Returns**

- `GridOffset2D[]` or `GridOffset3D[]`  
  The adjacent offsets

---

### getCenterPoint

```typescript
abstract getCenterPoint(coords: Coordinates2D): Point
abstract getCenterPoint(coords: Coordinates3D): ElevatedPoint
```

Returns the center point of the grid space corresponding to the given coordinates. If given a  
point, the center point of the grid space that contains it is returned. The center point lies in  
the plane of the bottom face of the 3D grid space. In gridless grids a point with the same  
coordinates as the given point is returned.

**Parameters**

- **coords**: Coordinates2D | Coordinates3D  
  The coordinates

**Returns**

- `Point` or `ElevatedPoint`  
  The center point

---

### getCircle

```typescript
abstract getCircle(center: Point, radius: number): Point[]
```

Get the circle polygon given the radius in grid units for this grid. The points of the polygon  
are returned ordered in positive orientation. In gridless grids an approximation of the true  
circle with a deviation of less than 0.25 pixels is returned.

**Parameters**

- **center**: Point  
  The center point of the circle.

- **radius**: number  
  The radius in grid units.

**Returns**

- `Point[]`  
  The points of the circle polygon.

---

### getCone

```typescript
abstract getCone(
    origin: Point,
    radius: number,
    direction: number,
    angle: number,
): Point[]
```

Get the cone polygon given the radius in grid units and the angle in degrees for this grid.  
The points of the polygon are returned ordered in positive orientation. In gridless grids an  
approximation of the true cone with a deviation of less than 0.25 pixels is returned.

**Parameters**

- **origin**: Point  
  The origin point of the cone

- **radius**: number  
  The radius in grid units

- **direction**: number  
  The direction in degrees

- **angle**: number  
  The angle in degrees

**Returns**

- `Point[]`  
  The points of the cone polygon

---

### getDirectPath

```typescript
abstract getDirectPath(waypoints: Coordinates2D[]): GridOffset2D[]
abstract getDirectPath(waypoints: Coordinates3D[]): GridOffset3D[]
```

Returns the sequence of grid offsets of a shortest, direct path passing through the given  
waypoints.

**Parameters**

- **waypoints**: Coordinates2D[] | Coordinates3D[]  
  The waypoints the path must pass through

**Returns**

- `GridOffset2D[]` or `GridOffset3D[]`  
  The sequence of grid offsets of a shortest, direct path

---

### getOffset

```typescript
abstract getOffset(coords: Coordinates2D): GridOffset2D
abstract getOffset(coords: Coordinates3D): GridOffset3D
```

Returns the offset of the grid space corresponding to the given coordinates.

**Parameters**

- **coords**: Coordinates2D | Coordinates3D  
  The coordinates

**Returns**

- `GridOffset2D` or `GridOffset3D`  
  The offset

---

### getOffsetRange

```typescript
abstract getOffsetRange(
    bounds: Rectangle,
): [i0: number, j0: number, i1: number, j1: number]
```

Returns the smallest possible range containing the offsets of all grid spaces that intersect the  
given bounds. If the bounds are empty (nonpositive width or height), then the offset range is  
empty.

**Parameters**

- **bounds**: [Rectangle](https://foundryvtt.com/api/interfaces/foundry.types.Rectangle.html)  
  The bounds

**Returns**

- `[i0: number, j0: number, i1: number, j1: number]`  
  The offset range

**Example**

```typescript
const [i0, j0, i1, j1] = grid.getOffsetRange(bounds);
for (let i = i0; i < i1; i++) {
  for (let j = j0; j < j1; j++) {
    const offset = {i, j};
    // ...
  }
}
```

---

### getShape

```typescript
abstract getShape(): Point[]
```

Returns the points of the grid space shape relative to the center point. The points are  
returned in the same order as in [`BaseGrid#getVertices`](#getVertices). In gridless grids an empty array is  
returned.

**Returns**

- `Point[]`  
  The points of the polygon

---

### getShiftedOffset

```typescript
abstract getShiftedOffset(coords: Coordinates2D, direction: Readonly<number>): GridOffset2D
abstract getShiftedOffset(coords: Coordinates3D, direction: Readonly<number>): GridOffset3D
```

Returns the offset of the grid space corresponding to the given coordinates shifted by one  
grid space in the given direction. The k-coordinate is not changed. In square and hexagonal  
grids with illegal diagonals the offset of the given coordinates is returned if the direction is  
diagonal. In gridless grids the point is shifted by the grid size.

**Parameters**

- **coords**: Coordinates2D | Coordinates3D  
  The coordinates

- **direction**: Readonly<number>  
  The direction (see [CONST.MOVEMENT_DIRECTIONS](https://foundryvtt.com/api/variables/CONST.MOVEMENT_DIRECTIONS.html))

**Returns**

- `GridOffset2D` or `GridOffset3D`  
  The offset

---

### getShiftedPoint

```typescript
abstract getShiftedPoint(point: Point, direction: Readonly<number>): Point
abstract getShiftedPoint(point: ElevatedPoint, direction: Readonly<number>): ElevatedPoint
```

Returns the point shifted by the difference between the grid space corresponding to the  
given coordinates and the shifted grid space in the given direction. The z-coordinate is not  
changed. In square and hexagonal grids with illegal diagonals the point is not shifted if the  
direction is diagonal. In gridless grids the point coordinates are shifted by the grid size.

**Parameters**

- **point**: Point | ElevatedPoint  
  The point that is to be shifted

- **direction**: Readonly<number>  
  The direction (see [CONST.MOVEMENT_DIRECTIONS](https://foundryvtt.com/api/variables/CONST.MOVEMENT_DIRECTIONS.html))

**Returns**

- `Point` or `ElevatedPoint`  
  The shifted point

---

### getSnappedPoint

```typescript
abstract getSnappedPoint(point: Point, behavior: GridSnappingBehavior): Point
abstract getSnappedPoint(point: ElevatedPoint, behavior: GridSnappingBehavior): ElevatedPoint
```

Snaps the given point to the grid. In square and hexagonal grids the z-coordinate of the  
point is rounded to the nearest multiple of the grid size. In gridless grids a point with the  
same coordinates as the given point is returned regardless of the snapping behavior.

**Parameters**

- **point**: Point | ElevatedPoint  
  The point that is to be snapped

- **behavior**: [GridSnappingBehavior](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridSnappingBehavior.html)  
  The snapping behavior

**Returns**

- `Point` or `ElevatedPoint`  
  The snapped point

---

### getTopLeftPoint

```typescript
abstract getTopLeftPoint(coords: Coordinates2D): Point
abstract getTopLeftPoint(coords: Coordinates3D): ElevatedPoint
```

Returns the top-left point of the grid space bounds corresponding to the given coordinates.  
If given a point, the top-left point of the grid space bounds that contains it is returned. The  
top-left point lies in the plane of the bottom face of the 3D grid space. In gridless grids a  
point with the same coordinates as the given point is returned.

**Parameters**

- **coords**: Coordinates2D | Coordinates3D  
  The coordinates

**Returns**

- `Point` or `ElevatedPoint`  
  The top-left point

---

### getTranslatedPoint

```typescript
abstract getTranslatedPoint(point: Point, direction: number, distance: number): Point
abstract getTranslatedPoint(point: ElevatedPoint, direction: number, distance: number): ElevatedPoint
```

Get the point translated in a direction by a distance. The z-coordinate is not changed.

**Parameters**

- **point**: Point | ElevatedPoint  
  The point that is to be translated

- **direction**: number  
  The angle of direction in degrees

- **distance**: number  
  The distance in grid units

**Returns**

- `Point` or `ElevatedPoint`  
  The translated point

---

### getVertices

```typescript
abstract getVertices(coords: Coordinates2D): Point[]
```

Returns the vertices of the grid space corresponding to the given coordinates. The vertices  
are returned ordered in positive orientation with the first vertex being the top-left vertex in  
square grids, the top vertex in row-oriented hexagonal grids, and the left vertex in column-  
oriented hexagonal grids. In gridless grids an empty array is returned.

**Parameters**

- **coords**: Coordinates2D  
  The coordinates

**Returns**

- `Point[]`  
  The vertices

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
    waypoints: (Coordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData)[],
    options?: { cost?: GridMeasurePathCostFunction2D<SegmentData> },
): GridMeasurePathResult
```

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
    waypoints: (Coordinates3D & Partial<GridMeasurePathWaypointData3D> & SegmentData)[],
    options?: { cost?: GridMeasurePathCostFunction3D<SegmentData> },
): GridMeasurePathResult
```

Measure a shortest, direct path through the given waypoints.

**Type Parameters**

- `SegmentData` extends an object with several `never` keys as above.

**Parameters**

- **waypoints**:  
  - `Coordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData` array  
  - or `Coordinates3D & Partial<GridMeasurePathWaypointData3D> & SegmentData` array  
  The waypoints the path must pass through

- **options** (optional):  
  - `cost?`: GridMeasurePathCostFunction2D<SegmentData> or GridMeasurePathCostFunction3D<SegmentData>  
  The function that returns the cost for a given move between grid spaces (default is  
  the distance travelled along the direct path)

**Returns**

- [GridMeasurePathResult](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html)  
  The measurements a shortest, direct path through the given waypoints

---

### testAdjacency

```typescript
abstract testAdjacency(coords1: Coordinates2D, coords2: Coordinates2D): boolean
abstract testAdjacency(coords1: Coordinates3D, coords2: Coordinates3D): boolean
```

Returns true if the grid spaces corresponding to the given coordinates are adjacent to each  
other. In square and hexagonal grids with illegal diagonals the diagonally neighboring grid  
spaces are not adjacent. Returns always false in gridless grids.

**Parameters**

- **coords1**: Coordinates2D | Coordinates3D  
  The first coordinates

- **coords2**: Coordinates2D | Coordinates3D  
  The second coordinates

**Returns**

- `boolean`

---

### _measurePath (protected)

```typescript
protected abstract _measurePath<
    SegmentData extends {
        cost: never;
        elevation: never;
        i: never;
        j: never;
        k: never;
        measure: never;
        q: never;
        r: never;
        s: never;
        x: never;
        y: never;
    },
>(
    waypoints: (Coordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData)[],
    options?: { cost?: GridMeasurePathCostFunction2D<SegmentData> },
    result: GridMeasurePathResult,
): any
```

```typescript
protected abstract _measurePath<
    SegmentData extends {
        cost: never;
        elevation: never;
        i: never;
        j: never;
        k: never;
        measure: never;
        q: never;
        r: never;
        s: never;
        x: never;
        y: never;
    },
>(
    waypoints: (Coordinates3D & Partial<GridMeasurePathWaypointData3D> & SegmentData)[],
    options?: { cost?: GridMeasurePathCostFunction3D<SegmentData> },
    result: GridMeasurePathResult,
): any
```

Measures the path and writes the segments measurements into the result. The waypoint  
measurements are filled in by [BaseGrid#measurePath](#measurePath). Called by [BaseGrid#measurePath](#measurePath).

**Type Parameters**

- `SegmentData` extends an object with several `never` keys as above.

**Parameters**

- **waypoints**:  
  - `Coordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData` array  
  - or `Coordinates3D & Partial<GridMeasurePathWaypointData3D> & SegmentData` array  
  The waypoints the path must pass through

- **options** (optional):  
  - `cost?`: GridMeasurePathCostFunction2D<SegmentData> or GridMeasurePathCostFunction3D<SegmentData>  
  The function that returns the cost for a given move between grid spaces (default is  
  the distance travelled)

- **result**: [GridMeasurePathResult](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html)  
  The measurement result that the measurements need to be written to

**Returns**

- `any`