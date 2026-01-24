# GridlessGrid

The gridless grid class.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [grid](https://foundryvtt.com/api/modules/foundry.grid.html) / [GridlessGrid](https://foundryvtt.com/api/classes/foundry.grid.GridlessGrid.html)  
**Hierarchy:** [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.grid.GridlessGrid)  
- *BaseGrid*  
- **GridlessGrid**

---

## Constructors

### constructor

```typescript
new GridlessGrid(config: GridConfiguration): GridlessGrid
```

The base grid constructor.

**Parameters**

- **config**: GridConfiguration  
  The grid configuration

**Returns**  
GridlessGrid  

Inherited from [BaseGrid.constructor](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#constructor)

---

## Properties

All properties are readonly unless otherwise indicated.

### alpha

`alpha: number`  
The opacity of the grid.  

Inherited from [BaseGrid.alpha](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#alpha)

---

### color

`color: Color`  

The color of the grid.  

Inherited from [BaseGrid.color](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#color)

---

### distance

`distance: number`

The distance of a grid space in units.  

Inherited from [BaseGrid.distance](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#distance)

---

### size

`size: number`  

The size of a grid space in pixels.  

Inherited from [BaseGrid.size](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#size)

---

### sizeX

`sizeX: number`  

The width of a grid space in pixels.  

Inherited from [BaseGrid.sizeX](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#sizex)

---

### sizeY

`sizeY: number`  

The height of a grid space in pixels.  

Inherited from [BaseGrid.sizeY](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#sizey)

---

### style

`style: string`  

The style of the grid.  

Inherited from [BaseGrid.style](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#style)

---

### thickness

`thickness: number`  

The thickness of the grid.  

Inherited from [BaseGrid.thickness](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#thickness)

---

### type

`type: 0 = GRID_TYPES.GRIDLESS`  

Overrides [BaseGrid.type](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#type)

---

### units

`units: string`  

The distance units used in this grid.  

Inherited from [BaseGrid.units](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#units)

---

## Accessors

### isGridless

```typescript
get isGridless(): boolean
```

Is this a gridless grid?

**Returns**  
boolean  

Inherited from BaseGrid.isGridless

---

### isHexagonal

```typescript
get isHexagonal(): boolean
```

Is this a hexagonal grid?

**Returns**  
boolean  

Inherited from BaseGrid.isHexagonal

---

### isSquare

```typescript
get isSquare(): boolean
```

Is this a square grid?

**Returns**  
boolean  

Inherited from BaseGrid.isSquare

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

**Parameters**

- **waypoints**: any  
- **__namedParameters**:  
  - **cost**: any  
- **result**: any  

**Returns**: void  

Overrides [BaseGrid._measurePath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#_measurepath)

---

### calculateDimensions

```typescript
calculateDimensions(
  sceneWidth: any,
  sceneHeight: any,
  padding: any,
): { columns: number; height: any; rows: number; width: any; x: number; y: number }
```

**Parameters**

- **sceneWidth**: any  
- **sceneHeight**: any  
- **padding**: any  

**Returns**  
Object containing:  
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
getAdjacentOffsets(coords: any): never[]
```

**Parameters**

- **coords**: any  

**Returns**  
never[]  

Overrides [BaseGrid.getAdjacentOffsets](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getadjacentoffsets)

---

### getCenterPoint

```typescript
getCenterPoint(
  coords: any,
): { elevation?: undefined; x: any; y: any } | { elevation: any; x: any; y: any }
```

**Parameters**

- **coords**: any  

**Returns**  
An object with properties:  
- **elevation** (optional)  
- **x**  
- **y**  

Overrides [BaseGrid.getCenterPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcenterpoint)

---

### getCircle

```typescript
getCircle(__namedParameters: { x: any; y: any }, radius: any): any[]
```

**Parameters**

- **__namedParameters**: { x: any; y: any }  
- **radius**: any  

**Returns**  
any[]  

Overrides [BaseGrid.getCircle](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcircle)

---

### getCone

```typescript
getCone(origin: any, radius: any, direction: any, angle: any): any[]
```

**Parameters**

- **origin**: any  
- **radius**: any  
- **direction**: any  
- **angle**: any  

**Returns**  
any[]  

Overrides [BaseGrid.getCone](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getcone)

---

### getDirectPath

```typescript
getDirectPath(
  waypoints: any,
): ({ i: any; j: any; k: any } | { i: any; j: any; k?: undefined })[]
```

**Parameters**

- **waypoints**: any  

**Returns**  
Array of positions with properties i, j and optionally k.  

Overrides [BaseGrid.getDirectPath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getdirectpath)

---

### getOffset

```typescript
getOffset(
  coords: any,
): { i: any; j: any; k: any } | { i: any; j: any; k?: undefined }
```

**Parameters**

- **coords**: any  

**Returns**  
An offset object with i, j, and optionally k properties.  

Overrides [BaseGrid.getOffset](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getoffset)

---

### getOffsetRange

```typescript
getOffsetRange(__namedParameters: { height: any; width: any; x: any; y: any }): number[]
```

**Parameters**

- **__namedParameters**: { height: any; width: any; x: any; y: any }  

**Returns**  
number[]  

Overrides [BaseGrid.getOffsetRange](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getoffsetrange)

---

### getShape

```typescript
getShape(): never[]
```

**Returns**  
never[]  

Overrides [BaseGrid.getShape](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshape)

---

### getShiftedOffset

```typescript
getShiftedOffset(
  coords: any,
  direction: any,
): { i: any; j: any; k: any } | { i: any; j: any; k?: undefined }
```

**Parameters**

- **coords**: any  
- **direction**: any  

**Returns**  
An offset object with i, j, and optionally k properties.  

Overrides [BaseGrid.getShiftedOffset](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshiftedoffset)

---

### getShiftedPoint

```typescript
getShiftedPoint(
  point: any,
  direction: any,
): { elevation: any; x: any; y: any } | { elevation?: undefined; x: any; y: any }
```

**Parameters**

- **point**: any  
- **direction**: any  

**Returns**  
A point possibly including elevation, x, and y coordinates.  

Overrides [BaseGrid.getShiftedPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getshiftedpoint)

---

### getSnappedPoint

```typescript
getSnappedPoint(
  __namedParameters: { elevation: any; x: any; y: any },
  behavior: any,
): { elevation: any; x: any; y: any } | { elevation?: undefined; x: any; y: any }
```

**Parameters**

- **__namedParameters**: { elevation: any; x: any; y: any }  
- **behavior**: any  

**Returns**  
A point possibly including elevation, x, and y coordinates.  

Overrides [BaseGrid.getSnappedPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#getsnappedpoint)

---

### getTopLeftPoint

```typescript
getTopLeftPoint(
  coords: any,
): { elevation?: undefined; x: any; y: any } | { elevation: any; x: any; y: any }
```

**Parameters**

- **coords**: any  

**Returns**  
A point possibly including elevation, x, and y coordinates.  

Overrides [BaseGrid.getTopLeftPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#gettopleftpoint)

---

### getTranslatedPoint

```typescript
getTranslatedPoint(
  point: any,
  direction: any,
  distance: any,
): { elevation: any; x: any; y: any } | { elevation?: undefined; x: any; y: any }
```

**Parameters**

- **point**: any  
- **direction**: any  
- **distance**: any  

**Returns**  
A point possibly including elevation, x, and y coordinates.  

Overrides [BaseGrid.getTranslatedPoint](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#gettranslatedpoint)

---

### getVertices

```typescript
getVertices(coords: any): never[]
```

**Parameters**

- **coords**: any  

**Returns**  
never[]  

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
  } = {}
>(
  waypoints: (GridCoordinates2D & Partial<GridMeasurePathWaypointData2D> & SegmentData)[],
  options?: { cost?: GridMeasurePathCostFunction2D<SegmentData> },
): GridMeasurePathResult
```

Measure a shortest, direct path through the given waypoints.

**Type Parameters**

- **SegmentData** (defaults to empty object) which must extend:  
  - cost: never  
  - elevation: never  
  - i: never  
  - j: never  
  - k: never  
  - q: never  
  - r: never  
  - s: never  
  - x: never  
  - y: never  

**Parameters**

- **waypoints**: An array of waypoints, each combining GridCoordinates2D, a partial GridMeasurePathWaypointData2D, and SegmentData  
- **options** (optional):  
  - **cost** (optional): A function of type GridMeasurePathCostFunction2D<SegmentData> which returns the cost for a move between grid spaces (default is distance travelled along the direct path)  

**Returns**  
GridMeasurePathResult with measurements of shortest direct path through given waypoints.

Inherited from [BaseGrid.measurePath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#measurepath)

---

### measurePath (3D version)

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
  waypoints: (GridCoordinates3D & Partial<GridMeasurePathWaypointData3D> & SegmentData)[],
  options?: { cost?: GridMeasurePathCostFunction3D<SegmentData> },
): GridMeasurePathResult
```

Measure a shortest, direct path through the given waypoints (3D coordinates).

**Type Parameters**

- Same as 2D version, but waypoints extend GridCoordinates3D with GridMeasurePathWaypointData3D.

**Parameters**

- **waypoints**: An array of waypoints, each combining GridCoordinates3D, a partial GridMeasurePathWaypointData3D, and SegmentData  
- **options** (optional):  
  - **cost** (optional): A function of type GridMeasurePathCostFunction3D<SegmentData> which returns the cost for a move between grid spaces 

**Returns**  
GridMeasurePathResult with measurements of shortest direct path through given waypoints.

Inherited from [BaseGrid.measurePath](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#measurepath)

---

### testAdjacency

```typescript
testAdjacency(coords1: any, coords2: any): boolean
```

**Parameters**

- **coords1**: any  
- **coords2**: any  

**Returns**  
boolean indicating adjacency between two coordinates.

Overrides [BaseGrid.testAdjacency](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html#testadjacency)

---

# Related Types and Interfaces

- [GridConfiguration](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridConfiguration.html)  
- [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
- [GridCoordinates2D](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates2D.html)  
- [GridCoordinates3D](https://foundryvtt.com/api/types/foundry.grid.types.GridCoordinates3D.html)  
- [GridMeasurePathWaypointData2D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathWaypointData2D.html)  
- [GridMeasurePathWaypointData3D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathWaypointData3D.html)  
- [GridMeasurePathCostFunction2D](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction2D.html)  
- [GridMeasurePathCostFunction3D](https://foundryvtt.com/api/types/foundry.grid.types.GridMeasurePathCostFunction3D.html)  
- [GridMeasurePathResult](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridMeasurePathResult.html)  

---

*See also [BaseGrid](https://foundryvtt.com/api/classes/foundry.grid.BaseGrid.html), the base class from which GridlessGrid inherits.*