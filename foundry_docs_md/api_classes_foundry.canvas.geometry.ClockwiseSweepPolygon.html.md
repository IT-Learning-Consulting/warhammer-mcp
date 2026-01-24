# ClockwiseSweepPolygon

A `PointSourcePolygon` implementation that uses CCW (counter-clockwise) geometry orientation. Sweep around the origin, accumulating collision points based on the set of active walls. This algorithm was created with valuable contributions from [https://github.com/caewok](https://github.com/caewok).

## Hierarchy  
* [PointSourcePolygon](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html)  
* **ClockwiseSweepPolygon**

---

## Properties

### bounds  
**Type:** `Rectangle` = ...  
The rectangular bounds of this polygon  
_Inherited from [PointSourcePolygon.bounds](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#bounds)_

### config  
**Type:** `any` = {}  
The configuration of this polygon.  
_Inherited from [PointSourcePolygon.config](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#config)_

### edges  
**Type:** [EdgeSet](https://foundryvtt.com/api/types/foundry.canvas.geometry.types.EdgeSet.html) = ...  
The set of edges which define potential boundaries of the polygon  

### origin  
**Type:** [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
The origin point of the source polygon.  
_Inherited from [PointSourcePolygon.origin](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#origin)_

### rays  
**Type:** `Ray[]` = []  
A collection of rays which are fired at vertices  

### vertices  
**Type:** [VertexMap](https://foundryvtt.com/api/types/foundry.canvas.geometry.types.VertexMap.html) = ...  
A mapping of vertices which define potential collision points  

---

## Static Properties

### WALL_DIRECTION_MODES  
**Type:** `Readonly<{ BOTH: 2; NORMAL: 0; REVERSED: 1 }>` = ...  
Customize how wall direction of one-way walls is applied  
_Inherited from [PointSourcePolygon.WALL_DIRECTION_MODES](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#wall_direction_modes)_

---

## Accessors

### isConstrained  
`get isConstrained(): boolean`  
An indicator for whether this polygon is constrained by some boundary shape?  
**Returns**: `boolean`  
Inherited from PointSourcePolygon.isConstrained

### useInnerBounds  
`get useInnerBounds(): boolean`  
Is this polygon using inner bounds?  
**Returns**: `boolean`

---

## Methods

### _compute  
```typescript
_compute(): void
```
Perform the implementation-specific computation.  
**Returns:** `void`  
Overrides [PointSourcePolygon._compute](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#_compute)

### _testCollision  
```typescript
_testCollision(ray: any, mode: any): any
```
**Parameters:**  
- **ray**: `any`  
- **mode**: `any`  
**Returns:** `any`  
Overrides [PointSourcePolygon._testCollision](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#_testcollision)

### addPoint  
```typescript
addPoint(__namedParameters: { x: any; y: any }): ClockwiseSweepPolygon
```
This function has been adapted from Clipper's CleanPolygon function. When adding a new point to the polygon, check for collinearity with prior points to cull unnecessary points. This also removes spikes where we traverse points (a, b, a). We also enforce a minimum distance between two points, or a minimum perpendicular distance between three almost collinear points.  

**Parameters:**  
- **__namedParameters**: `{ x: any; y: any }`  

**Returns:** `ClockwiseSweepPolygon`

### applyConstraint  
```typescript
applyConstraint(
    constraint: Rectangle | Polygon | Circle,
    intersectionOptions?: object,
): PointSourcePolygon<any>
```
Apply a constraining boundary shape to an existing PointSourcePolygon. Return a new instance of the polygon with the constraint applied. The new instance is only a "shallow clone", as it shares references to component properties with the original.  

**Parameters:**  
- **constraint**: `Rectangle | Polygon | Circle` - The constraining boundary shape  
- **intersectionOptions?**: `object = {}` - Options passed to the shape intersection method (optional)  

**Returns:** `PointSourcePolygon<any>`  
A new constrained polygon  
Inherited from [PointSourcePolygon.applyConstraint](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#applyconstraint)

### clone  
```typescript
clone(): PointSourcePolygon<any>
```
Create a clone of this polygon. This overrides the default PIXI.Polygon#clone behavior.  

**Returns:** `PointSourcePolygon<any>`  
A cloned instance  
Overrides [PointSourcePolygon.clone](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#clone)

### compute  
```typescript
compute(): PointSourcePolygon<any>
```
Compute the polygon using the origin and configuration options.  

**Returns:** `PointSourcePolygon<any>`  
The computed polygon  
Inherited from [PointSourcePolygon.compute](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#compute)

### contains  
```typescript
contains(x: any, y: any): boolean
```
**Parameters:**  
- **x**: `any`  
- **y**: `any`  

**Returns:** `boolean`  

Inherited from [PointSourcePolygon.contains](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#contains)

### initialize  
```typescript
initialize(origin: any, config: any): void
```
Customize the provided configuration object for this polygon type.  

**Parameters:**  
- **origin**: `any`  
  The provided polygon origin. The elevation defaults to the elevation of `config.source` if passed and otherwise 0.  
- **config**: `any`  
  The provided configuration object  

**Returns:** `void`  
Overrides [PointSourcePolygon.initialize](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#initialize)

### isCompleteCircle  
```typescript
isCompleteCircle(): boolean
```
Determine if the shape is a complete circle. The config object must have angle and a radius properties.  

**Returns:** `boolean`  
Inherited from [PointSourcePolygon.isCompleteCircle](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#iscompletecircle)

### visualize  
```typescript
visualize(): any
```
**Returns:** `any`  
Overrides [PointSourcePolygon.visualize](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#visualize)

---

## Protected Methods

### _constrainBoundaryShapes  
```typescript
_constrainBoundaryShapes(): void
```
Constrain polygon points by applying boundary shapes.  
**Returns:** `void`  
Inherited from [PointSourcePolygon._constrainBoundaryShapes](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#_constrainboundaryshapes)

### _defineBoundingBox  
```typescript
_defineBoundingBox(): Rectangle
```
Compute the aggregate bounding box which is the intersection of all boundary shapes. Round and pad the resulting rectangle by 1 pixel to ensure it always contains the origin.  
**Returns:** `Rectangle`

### _determineEdgeTypes  
```typescript
_determineEdgeTypes(
    type: string,
    priority: number,
    config?: object,
): Record<EdgeType, { mode: 0 | 1 | 2; priority: number }>
```
Determine the edge types and their manner of inclusion for this polygon instance.  

**Parameters:**  
- **type**: `string`  
- **priority**: `number`  
- **config?**: `object = {}` (Optional polygon config which may include deprecated properties)  

**Returns:** `Record<EdgeType, { mode: 0 | 1 | 2; priority: number }>`

### _determineSweepResult  
```typescript
_determineSweepResult(
    vertex: PolygonVertex,
    activeEdges: EdgeSet,
    hasCollinear?: boolean,
): void
```
Determine the result for the sweep at a given vertex.  

**Parameters:**  
- **vertex**: `PolygonVertex` - The target vertex  
- **activeEdges**: `EdgeSet` - The set of active edges  
- **hasCollinear?**: `boolean = false` - Are there collinear vertices behind the target vertex?  

**Returns:** `void`

### _executeSweep  
```typescript
_executeSweep(): void
```
Execute the sweep over wall vertices  
**Returns:** `void`

### _identifyEdges  
```typescript
_identifyEdges(): void
```
Retrieves the super-set of walls that could potentially apply to this polygon. Utilizes a custom collision test and the Quadtree to obtain candidate edges efficiently.  
**Returns:** `void`

### _identifyIntersections  
```typescript
_identifyIntersections(edgeMap: Map<string, Edge>): void
```
Add additional vertices for intersections between edges.  

**Parameters:**  
- **edgeMap**: `Map<string, Edge>`  

**Returns:** `void`

### _identifyVertices  
```typescript
_identifyVertices(): void
```
Consolidate all vertices from identified edges and register them as part of the vertex mapping.  
**Returns:** `void`

### _initializeActiveEdges  
```typescript
_initializeActiveEdges(): EdgeSet
```
Determine the initial set of active edges as those which intersect with the initial ray  

**Returns:** `EdgeSet`  
A set of initially active edges

### _isVertexBehindActiveEdges  
```typescript
_isVertexBehindActiveEdges(
    vertex: PolygonVertex,
    activeEdges: EdgeSet,
): { isBehind: boolean; wasLimited: boolean }
```
Test whether a target vertex is behind some closer active edge. If the vertex is to the left of the edge, it must be behind the edge relative to origin. If the vertex is collinear with the edge, it should be considered "behind" and ignored. We know `edge.vertexA` is ccw to `edge.vertexB` because of the logic in `_identifyVertices.`  

**Parameters:**  
- **vertex**: `PolygonVertex` - The target vertex  
- **activeEdges**: `EdgeSet` - The set of active edges  

**Returns:** `{ isBehind: boolean; wasLimited: boolean }`  
Is the target vertex behind some closer edge?

### _sortVertices  
```typescript
_sortVertices(): PolygonVertex[]
```
Sort vertices clockwise from the initial ray (due west).  

**Returns:** `PolygonVertex[]`  
The array of sorted vertices

### _switchEdge  
```typescript
_switchEdge(result: CollisionResult, activeEdges: EdgeSet): void
```
Switch to a new active edge. Moving from the origin, a collision that first blocks a side must be stored as a polygon point. Subsequent collisions blocking that side are ignored. Once both sides are blocked, we are done. Collisions that limit a side will block if that side was previously limited. If neither side is blocked and the ray internally collides with a non-limited edge, skip without adding polygon endpoints. Sight is unaffected before this edge, and the internal collision can be ignored.  

**Parameters:**  
- **result**: `CollisionResult` - The pending collision result  
- **activeEdges**: `EdgeSet` - The set of currently active edges  

**Returns:** `void`

### _testEdgeInclusion  
```typescript
_testEdgeInclusion(
    edge: Edge,
    edgeTypes: Record<EdgeType, { mode: 0 | 1 | 2; priority: number }>,
): boolean
```
Test whether a wall should be included in the computed polygon for a given origin and type  

**Parameters:**  
- **edge**: `Edge` - The Edge being considered  
- **edgeTypes**: `Record<EdgeType, { mode: 0 | 1 | 2; priority: number }>` - Which types of edges are being used? 0=no, 1=maybe, 2=always  

**Returns:** `boolean`  
Should the edge be included?

### _visualizeCollision  
```typescript
_visualizeCollision(ray: Ray, collisions: PolygonVertex[]): void
```
Visualize the polygon, displaying its computed area, rays, and collision points  

**Parameters:**  
- **ray**: `Ray`  
- **collisions**: `PolygonVertex[]`  

**Returns:** `void`

---

## Static Methods

### applyThresholdAttenuation  
```typescript
static applyThresholdAttenuation(
    polygon: PointSourcePolygon<any>,
): PointSourcePolygon<any>
```
Augment a PointSourcePolygon by adding additional coverage for shapes permitted by threshold walls.  

**Parameters:**  
- **polygon**: `PointSourcePolygon<any>` - The computed polygon  

**Returns:** `PointSourcePolygon<any>`  
The augmented polygon  
Inherited from [PointSourcePolygon.applyThresholdAttenuation](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#applythresholdattenuation)

### benchmark  
```typescript
static benchmark(
    iterations: number,
    origin: Point | ElevatedPoint,
    config: PolygonConfig,
): Promise<void>
```
Benchmark the performance of polygon computation for this source.  

**Parameters:**  
- **iterations**: `number` - The number of test iterations to perform  
- **origin**: `Point|ElevatedPoint` - The origin point to benchmark  
- **config**: `PolygonConfig` - The polygon configuration to benchmark  

**Returns:** `Promise<void>`  
Inherited from [PointSourcePolygon.benchmark](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#benchmark)

### create  
```typescript
static create(
    origin: Point | ElevatedPoint,
    config?: any,
): PointSourcePolygon<any>
```
Compute the polygon given a point origin and radius  

**Parameters:**  
- **origin**: `Point|ElevatedPoint`  
  The origin source point. The elevation defaults to the elevation of `config.source` if passed and otherwise 0.  
- **config?**: `any = {}`  
  Configuration options which customize the polygon computation (optional)  

**Returns:** `PointSourcePolygon<any>`  
The computed polygon instance  
Inherited from [PointSourcePolygon.create](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#create)

### testCollision  
```typescript
static testCollision(
    origin: Point | ElevatedPoint,
    destination: Point | ElevatedPoint,
    config?: PolygonConfig,
): any
```
Test whether a Ray between the origin and destination points would collide with a boundary of this Polygon. A valid wall restriction type is compulsory and must be passed into the config options.  

**Parameters:**  
- **origin**: `Point | ElevatedPoint`  
  An origin point. The elevation defaults to the elevation of `config.source` if passed and otherwise 0.  
- **destination**: `Point | ElevatedPoint`  
  A destination point. The elevation defaults to the elevation of the origin.  
- **config**: `PolygonConfig = {}`  
  The configuration that defines a certain Polygon type  
- **mode** (in config)  
  The collision mode to test: `"any"`, `"all"`, or `"closest"`  

**Returns:** `any`  
The collision result depends on the mode of the test:  
- `any`: returns a boolean for whether any collision occurred  
- `all`: returns a sorted array of `PolygonVertex` instances  
- `closest`: returns a `PolygonVertex` instance or null  
  
Inherited from [PointSourcePolygon.testCollision](https://foundryvtt.com/api/classes/foundry.canvas.geometry.PointSourcePolygon.html#testcollision)