# PolygonVertex | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized point data structure used to represent vertices in the context of the  
ClockwiseSweepPolygon. This class is not designed or intended for use outside of that  
context.

---

## Constructors

### constructor

```typescript
new PolygonVertex(
    x: number,
    y: number,
    options?: PolygonVertexOptions,
): PolygonVertex
```

Construct a PolygonVertex by providing `{x, y}` coordinates and vertex options.

**Parameters**

- **x**: `number`  
  The x-coordinate of the vertex
- **y**: `number`  
  The y-coordinate of the vertex
- **options** (optional): [`PolygonVertexOptions`](https://foundryvtt.com/api/interfaces/foundry.PolygonVertexOptions.html) = `{}`  
  Options which modify vertex context or behavior

**Returns**  
`PolygonVertex`

---

## Properties

- **ccwEdges**: `EdgeSet` = ...  
  The subset of edges which continue counter-clockwise from this vertex.

- **collinearVertices**: `Set<PolygonVertex>` = ...  
  The set of vertices collinear to this vertex.

- **cwEdges**: `EdgeSet` = ...  
  The subset of edges which continue clockwise from this vertex.

- **edges**: `EdgeSet` = ...  
  The set of edges which connect to this vertex. This set is initially empty and populated later after vertices are de-duplicated.

- **isBlockingCCW**: `boolean`  
  Does this vertex have non-limited edges or 2+ limited edges counterclockwise?

- **isBlockingCW**: `boolean`  
  Does this vertex have non-limited edges or 2+ limited edges clockwise?

- **isEndpoint**: `boolean`  
  Is this vertex an endpoint of one or more edges?

- **isInternal**: `boolean` = `false`  
  Does this vertex result from an internal collision?

- **isLimitingCCW**: `boolean`  
  Does this vertex have a single counterclockwise limiting edge?

- **isLimitingCW**: `boolean`  
  Does this vertex have a single clockwise limiting edge?

- **restriction**: `number` = `0`  
  The maximum restriction imposed by this vertex.

---

## Accessors

- **isLimited**: `boolean` (getter)  
  Is this vertex limited in type?

  **Returns**  
  `boolean`

---

## Methods

### attachEdge

```typescript
attachEdge(edge: Edge, orientation: number, type: string): void
```

Associate an edge with this vertex.

**Parameters**

- **edge**: `Edge`  
  The edge being attached
- **orientation**: `number`  
  The orientation of the edge with respect to the origin
- **type**: `string`  
  The restriction type of polygon being created

**Returns**  
`void`

---

### equals

```typescript
equals(other: PolygonVertex): boolean
```

Is this vertex the same point as some other vertex?

**Parameters**

- **other**: `PolygonVertex`  
  Some other vertex

**Returns**  
`boolean`  
Are they the same point?

---

### fromPoint (Static)

```typescript
static fromPoint(point: Point, options?: PolygonVertexOptions): PolygonVertex
```

Construct a PolygonVertex instance from some other Point structure.

**Parameters**

- **point**: `Point`  
  The point
- **options** (optional): `PolygonVertexOptions`  
  Additional options that apply to this vertex

**Returns**  
`PolygonVertex`  
The constructed vertex

---

### getKey (Static)

```typescript
static getKey(x: number, y: number): number
```

Determine the sort key to use for this vertex, arranging points from north-west to south-east.

**Parameters**

- **x**: `number`  
  The x-coordinate
- **y**: `number`  
  The y-coordinate

**Returns**  
`number`  
The key used to identify the vertex

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.geometry.edges.PolygonVertex.html) page.