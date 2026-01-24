# RegionPolygonTree

The polygon tree of a Region.  

**Hierarchy:** [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.regionShapes.RegionPolygonTree)
- _RegionPolygonTreeNode_
- **RegionPolygonTree**

---

## Accessors

### `bounds`

```typescript
get bounds(): null | Rectangle
```

The bounds of the polygon. They are `null` in case of the root node.  
Inherited from [RegionPolygonTreeNode.bounds](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#bounds)

**Returns:** `null | Rectangle`

---

### `children`

```typescript
get children(): readonly RegionPolygonTreeNode[]
```

The children of this node.  
Inherited from [RegionPolygonTreeNode.children](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#children)

**Returns:** `readonly RegionPolygonTreeNode[]`

---

### `clipperPath`

```typescript
get clipperPath(): null | readonly IntPoint[]
```

The Clipper path of this node. It is empty in case of the root node.  
Inherited from [RegionPolygonTreeNode.clipperPath](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#clipperPath)

**Returns:** `null | readonly IntPoint[]`

---

### `depth`

```typescript
get depth(): number
```

The depth of this node. The depth of the root node is 0.  
Inherited from [RegionPolygonTreeNode.depth](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#depth)

**Returns:** `number`

---

### `isHole`

```typescript
get isHole(): boolean
```

Is this a hole? The root node is a hole.  
Inherited from [RegionPolygonTreeNode.isHole](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#isHole)

**Returns:** `boolean`

---

### `parent`

```typescript
get parent(): null | RegionPolygonTreeNode
```

The parent of this node or `null` if this is the root node.  
Inherited from [RegionPolygonTreeNode.parent](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#parent)

**Returns:** `null | RegionPolygonTreeNode`

---

### `points`

```typescript
get points(): null | readonly number[]
```

The points of the polygon (`[x0, y0, x1, y1, ...]`). They are `null` in case of the root node.  
Inherited from [RegionPolygonTreeNode.points](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#points)

**Returns:** `null | readonly number[]`

---

### `polygon`

```typescript
get polygon(): null | Polygon
```

The polygon of this node. It is `null` in case of the root node.  
Inherited from [RegionPolygonTreeNode.polygon](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#polygon)

**Returns:** `null | Polygon`

---

## Methods

### `[iterator]`

```typescript
"[iterator]"(): any
```

Iterate recursively over the children in depth-first order.  
Inherited from [RegionPolygonTreeNode.[iterator]](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#iterator)

**Returns:** `any`  
**Yields:** Iterator over the nodes

---

### `testCircle`

```typescript
testCircle(center: Point, radius: number): -1 | 0 | 1
```

Test circle containment/intersection with this node.

**Parameters:**

- **center**: `Point`  
  The center point of the circle.

- **radius**: `number`  
  The radius of the circle.

**Returns:**  
- `-1`: the circle is in the exterior and does not intersect the boundary.  
- `0`: the circle intersects the boundary.  
- `1`: the circle is in the interior and does not intersect the boundary.

Inherited from [RegionPolygonTreeNode.testCircle](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#testCircle)

---

### `testPoint`

```typescript
testPoint(point: Point): boolean
```

Test whether the given point is contained within this node.

**Parameters:**

- **point**: `Point`  
  The point to test.

**Returns:** `boolean`

Inherited from [RegionPolygonTreeNode.testPoint](https://foundryvtt.com/api/classes/foundry.data.regionShapes.RegionPolygonTreeNode.html#testPoint)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)