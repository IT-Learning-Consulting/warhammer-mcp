# Edge | Foundry Virtual Tabletop - API Documentation - Version 13

A data structure used to represent potential edges used by the ClockwiseSweepPolygon.  
Edges are not polygon-specific, meaning they can be reused across many polygon instances.

## Constructors

### constructor

```typescript
new Edge(
    a: Point,
    b: Point,
    options?: {
        direction?: WallDirection;
        id?: string;
        light?: WallSenseType;
        move?: WallSenseType;
        object?: PlaceableObject;
        priority?: number;
        sight?: WallSenseType;
        sound?: WallSenseType;
        threshold?: WallThresholdData;
        type?: EdgeType;
    },
): Edge
```

Construct an Edge by providing the following information.

**Parameters:**

- **a**: `Point`  
  The first endpoint of the edge.

- **b**: `Point`  
  The second endpoint of the edge.

- **options** (optional): Object containing additional options which describe the edge:
  - **direction?**: `WallDirection`  
    A direction of effect for the edge.
  - **id?**: `string`  
    A string used to uniquely identify this edge.
  - **light?**: `WallSenseType`  
    How this edge restricts light.
  - **move?**: `WallSenseType`  
    How this edge restricts movement.
  - **object?**: `PlaceableObject`  
    A PlaceableObject that is responsible for this edge, if any.
  - **priority?**: `number`  
    A source priority for this edge. Typically zero unless this edge was contributed by a high-priority source.
  - **sight?**: `WallSenseType`  
    How this edge restricts sight.
  - **sound?**: `WallSenseType`  
    How this edge restricts sound.
  - **threshold?**: `WallThresholdData`  
    Configuration of threshold data for this edge.
  - **type?**: `EdgeType`  
    The type of edge.

## Properties

- **a**: `Point`  
  The first endpoint of the edge.

- **b**: `Point`  
  The second endpoint of the edge.

- **bounds**: `Rectangle`  
  The rectangular bounds of the edge. Used by the quadtree.

- **direction**: `WallDirection`  
  The direction of effect for the edge.

- **id**: `string`  
  A string used to uniquely identify this edge.

- **intersections**: `{ edge: Edge; intersection: LineIntersection }[] = []`  
  Record other edges which this one intersects with.

- **light**: `WallSenseType`  
  How this edge restricts light.

- **move**: `WallSenseType`  
  How this edge restricts movement.

- **nw**: `Point`  
  The endpoint of the edge which is oriented towards the top-left.

- **se**: `Point`  
  The endpoint of the edge which is oriented towards the bottom-right.

- **sight**: `WallSenseType`  
  How this edge restricts sight.

- **sound**: `WallSenseType`  
  How this edge restricts sound.

- **threshold**: `WallThresholdData`  
  Specialized threshold data for this edge.

- **vertexA**: `PolygonVertex`  
  A PolygonVertex instance. Used as part of ClockwiseSweepPolygon computation.

- **vertexB**: `PolygonVertex`  
  A PolygonVertex instance. Used as part of ClockwiseSweepPolygon computation.

## Methods

### applyThreshold

```typescript
applyThreshold(
    sourceType: string,
    sourceOrigin: Point,
    externalRadius?: number,
): boolean
```

Test whether to apply a proximity threshold to this edge. If the proximity threshold is met, this edge is excluded from perception calculations.

**Parameters:**

- **sourceType**: `string`  
  Sense type for the source.

- **sourceOrigin**: `Point`  
  The origin or position of the source on the canvas.

- **externalRadius** (optional): `number` = 0  
  The external radius of the source.

**Returns:** `boolean`  
True if the edge has a threshold greater than 0 for the source type, and the source type is within that distance.

---

### clone

```typescript
clone(): Edge
```

Create a copy of the Edge which can be safely mutated.

**Returns:** `Edge`

---

### getIntersection

```typescript
getIntersection(other: Edge): void | LineIntersection
```

Get an intersection point between this Edge and another.

**Parameters:**

- **other**: `Edge`  
  The other edge to test intersection with.

**Returns:** `void` | `LineIntersection`

---

### isLimited

```typescript
isLimited(type: "light" | "sight" | "sound" | "move"): boolean
```

Is this edge limited for a particular type?

**Parameters:**

- **type**: `"light"` | `"sight"` | `"sound"` | `"move"`

**Returns:** `boolean`

---

### orientPoint

```typescript
orientPoint(point: Point): number
```

Determine the orientation of this Edge with respect to a reference point.

**Parameters:**

- **point**: `Point`  
  Some reference point, relative to which orientation is determined.

**Returns:** `number`  
An orientation in `CONST.WALL_DIRECTIONS` which indicates whether the Point is left, right, or collinear (both) with the Edge.

---

### recordIntersections

```typescript
recordIntersections(other: Edge): void
```

Record the intersections between two edges.

**Parameters:**

- **other**: `Edge`  
  Another edge to test and record.

**Returns:** `void`

---

### removeIntersections

```typescript
removeIntersections(): void
```

Remove intersections of this edge with all other edges.

**Returns:** `void`

---

## Static Methods

### identifyEdgeIntersections

```typescript
static identifyEdgeIntersections(edges: Iterable<Edge>): void
```

Identify intersections between a provided iterable of edges.

**Parameters:**

- **edges**: `Iterable<Edge>`  
  An iterable of edges.

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)