# RegionPolygonTreeNode

The node of a [foundry.data.regionShapes.RegionPolygonTree](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTree.html).

## Hierarchy
- **RegionPolygonTreeNode**

  _Extends:_ [RegionPolygonTree](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTree.html)

## Accessors

### bounds

```typescript
get bounds(): null | Rectangle
```

The bounds of the polygon. They are `null` in case of the root node.

**Returns:** `null | Rectangle`

---

### children

```typescript
get children(): readonly RegionPolygonTreeNode[]
```

The children of this node.

**Returns:** `readonly RegionPolygonTreeNode[]`

---

### clipperPath

```typescript
get clipperPath(): null | readonly IntPoint[]
```

The Clipper path of this node. It is empty in case of the root node.

**Returns:** `null | readonly IntPoint[]`

---

### depth

```typescript
get depth(): number
```

The depth of this node. The depth of the root node is 0.

**Returns:** `number`

---

### isHole

```typescript
get isHole(): boolean
```

Is this a hole? The root node is a hole.

**Returns:** `boolean`

---

### parent

```typescript
get parent(): null | RegionPolygonTreeNode
```

The parent of this node or `null` if this is the root node.

**Returns:** `null | RegionPolygonTreeNode`

---

### points

```typescript
get points(): null | readonly number[]
```

The points of the polygon (`[x0, y0, x1, y1, ...]`). They are `null` in case of the root node.

**Returns:** `null | readonly number[]`

---

### polygon

```typescript
get polygon(): null | Polygon
```

The polygon of this node. It is `null` in case of the root node.

**Returns:** `null | Polygon`

---

## Methods

### [iterator]

```typescript
"[iterator]"(): any
```

Iterate recursively over the children in depth-first order.

**Returns:** `any`

---

### testCircle

```typescript
testCircle(center: Point, radius: number): -1 | 0 | 1
```

Test circle containment/intersection with this node.

**Parameters:**

- **center**: Point  
  The center point of the circle.

- **radius**: number  
  The radius of the circle.

**Returns:** `-1 | 0 | 1`

- `-1` : the circle is in the exterior and does not intersect the boundary.
- `0` : the circle intersects the boundary.
- `1` : the circle is in the interior and does not intersect the boundary.

---

### testPoint

```typescript
testPoint(point: Point): boolean
```

Test whether given point is contained within this node.

**Parameters:**

- **point**: Point  
  The point.

**Returns:** `boolean`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)