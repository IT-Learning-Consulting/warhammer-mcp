# PointSourcePolygon

An extension of `Polygon` which is used to represent the line of sight for a point source.

## Type Parameters

- `PolygonConfig`

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.geometry.PointSourcePolygon))

- _Polygon_
- **PointSourcePolygon**
- [ClockwiseSweepPolygon](https://foundryvtt.com/api/classes/foundry.canvas.geometry.ClockwiseSweepPolygon.html) (inherits)

---

## Properties

### bounds

- **Type:** `Rectangle`
- **Description:** The rectangular bounds of this polygon.

### config

- **Type:** [PolygonConfig](#)
- **Default:** `{}`
- **Description:** The configuration of this polygon.

### origin

- **Type:** [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)
- **Description:** The origin point of the source polygon.

### WALL_DIRECTION_MODES

- **Type:** `Readonly<{ BOTH: 2; NORMAL: 0; REVERSED: 1 }>`
- **Description:** Customize how wall direction of one-way walls is applied.

---

## Accessors

### isConstrained

```typescript
get isConstrained(): boolean
```

- **Description:** An indicator for whether this polygon is constrained by some boundary shape?
- **Returns:** `boolean`

### bounds

- **Type:** `Rectangle`
- **Description:** The rectangular bounds of this polygon.

### config

- **Type:** [PolygonConfig](#)
- **Description:** The configuration of this polygon.

### origin

- **Type:** [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)
- **Description:** The origin point of the source polygon.

---

## Methods

### applyConstraint

```typescript
applyConstraint(
    constraint: Rectangle | Polygon | Circle,
    intersectionOptions?: object,
): PointSourcePolygon<any>
```

- **Description:**  
  Apply a constraining boundary shape to an existing `PointSourcePolygon`. Returns a new instance of the polygon with the constraint applied.  
  The new instance is only a "shallow clone", as it shares references to component properties with the original.

- **Parameters:**
  - **constraint**: `Rectangle | Polygon | Circle`  
    The constraining boundary shape.
  - **intersectionOptions** *(optional)*: `object` = `{}`  
    Options passed to the shape intersection method.

- **Returns:**  
  A new constrained polygon: `PointSourcePolygon<any>`

### clone

```typescript
clone(): PointSourcePolygon<any>
```

- **Description:** Creates a clone of this polygon. This overrides the default `PIXI.Polygon#clone` behavior.

- **Returns:** A cloned instance of `PointSourcePolygon<any>`

### compute

```typescript
compute(): PointSourcePolygon<any>
```

- **Description:** Compute the polygon using the origin and configuration options.

- **Returns:** The computed polygon as `PointSourcePolygon<any>`

### contains

```typescript
contains(x: any, y: any): boolean
```

- **Parameters:**
  - **x**: `any`
  - **y**: `any`

- **Description:**  
  Checks whether a point (`x`, `y`) is contained within the polygon.  
  Overrides `PIXI.Polygon.contains`.

- **Returns:** `boolean`

### initialize

```typescript
initialize(origin: Point | ElevatedPoint, config: PolygonConfig): void
```

- **Description:**  
  Customize the provided configuration object for this polygon type.

- **Parameters:**
  - **origin**: `Point | ElevatedPoint`  
    The provided polygon origin. The elevation defaults to the elevation of `config.source` if passed and otherwise `0`.
  - **config**: `PolygonConfig`  
    The provided configuration object.

- **Returns:** `void`

### isCompleteCircle

```typescript
isCompleteCircle(): boolean
```

- **Description:**  
  Determine if the shape is a complete circle. The `config` object must have `angle` and `radius` properties.

- **Returns:** `boolean`

### visualize

```typescript
visualize(): undefined | Graphics
```

- **Description:**  
  Visualize the polygon, displaying its computed area and applied boundary shapes.

- **Returns:** Either `undefined` or a `Graphics` object representing the rendered debugging shape.

---

## Protected Methods

### _compute

```typescript
_compute(): void
```

- **Description:**  
  Perform the implementation-specific computation.

- **Returns:** `void`

### _constrainBoundaryShapes

```typescript
_constrainBoundaryShapes(): void
```

- **Description:**  
  Constrain polygon points by applying boundary shapes.

- **Returns:** `void`

### _testCollision

```typescript
_testCollision(
    ray: Ray,
    mode: "any" | "closest" | "all",
    destination: ElevatedPoint,
): any
```

- **Description:**  
  Determine the set of collisions which occurs for a `Ray`.

- **Parameters:**
  - **ray**: [Ray](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Ray.html)  
    The Ray to test.
  - **mode**: `"any" | "closest" | "all"`  
    The collision mode being tested.
  - **destination**: [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
    The destination point.

- **Returns:** The collision test result, type varies depending on mode.

---

## Static Methods

### applyThresholdAttenuation

```typescript
static applyThresholdAttenuation(
    polygon: PointSourcePolygon<any>,
): PointSourcePolygon<any>
```

- **Description:** Augment a `PointSourcePolygon` by adding additional coverage for shapes permitted by threshold walls.

- **Parameters:**
  - **polygon:** `PointSourcePolygon<any>`  
    The computed polygon.

- **Returns:** The augmented polygon as `PointSourcePolygon<any>`

### benchmark

```typescript
static benchmark(
    iterations: number,
    origin: Point | ElevatedPoint,
    config: PolygonConfig,
): Promise<void>
```

- **Description:** Benchmark the performance of polygon computation for this source.

- **Parameters:**
  - **iterations:** `number`  
    The number of test iterations to perform.
  - **origin:** `Point | ElevatedPoint`  
    The origin point to benchmark.
  - **config:** `PolygonConfig`  
    The polygon configuration to benchmark.

- **Returns:** `Promise<void>`

### create

```typescript
static create(
    origin: Point | ElevatedPoint,
    config?: any,
): PointSourcePolygon<any>
```

- **Description:** Compute the polygon given a point origin and radius.

- **Parameters:**
  - **origin:** `Point | ElevatedPoint`  
    The origin source point. The elevation defaults to the elevation of `config.source` if passed, otherwise `0`.
  - **config** *(optional)*: `any` = `{}`  
    Configuration options which customize the polygon computation.

- **Returns:** The computed polygon instance of type `PointSourcePolygon<any>`

### testCollision

```typescript
static testCollision(
    origin: Point | ElevatedPoint,
    destination: Point | ElevatedPoint,
    config?: PolygonConfig,
): any
```

- **Description:**  
  Test whether a `Ray` between the origin and destination points would collide with a boundary of this Polygon.  
  A valid wall restriction type is compulsory and must be passed into the config options.

- **Parameters:**
  - **origin:** `Point | ElevatedPoint`  
    An origin point. The elevation defaults to the elevation of `config.source` if passed and otherwise `0`.
  - **destination:** `Point | ElevatedPoint`  
    A destination point. The elevation defaults to the elevation of the origin.
  - **config** *(optional)*: `PolygonConfig` = `{}`  
    The configuration that defines a certain Polygon type.

- **mode**  
  The collision mode to test: `"any"`, `"all"`, or `"closest"` (implied as part of config or usage).

- **Returns:**  
  Depends on the mode of the test:  
  - `any`: returns a boolean for whether any collision occurred  
  - `all`: returns a sorted array of `PolygonVertex` instances  
  - `closest`: returns a `PolygonVertex` instance or `null`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)