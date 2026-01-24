# CanvasQuadtree | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [Quadtree](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html) specifically intended for classifying the location of objects on the game canvas.

## Hierarchy  
- *Quadtree*  
- **CanvasQuadtree**

---

## Constructors

### `constructor`

```typescript
new CanvasQuadtree(options?: object): CanvasQuadtree
```

Create a CanvasQuadtree which references `canvas.dimensions.rect`. We pass an empty object to the parent, then override `_bounds`.

**Parameters**

- **options?**: `object = {}`  
  Additional options passed to the parent Quadtree.

**Returns**  
`CanvasQuadtree`  

Overrides [Quadtree.constructor](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#constructor)

---

## Properties

### `depth`

- Type: `number`

The depth of this node within the root Quadtree.

Inherited from [Quadtree.depth](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#depth)

---

### `maxDepth`

- Type: `number`

The maximum number of levels that the base quadtree is allowed.

Inherited from [Quadtree.maxDepth](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#maxdepth)

---

### `maxObjects`

- Type: `number`

The maximum number of objects allowed within this node before it must split.

Inherited from [Quadtree.maxObjects](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#maxobjects)

---

### `nodes`

- Type: `Quadtree[]`

Children of this node.

Inherited from [Quadtree.nodes](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#nodes)

---

### `objects`

- Type: `QuadtreeObject[]`

The objects contained at this level of the tree.

Inherited from [Quadtree.objects](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#objects)

---

### `root`

- Type: `Quadtree`

The root Quadtree.

Inherited from [Quadtree.root](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#root)

---

### **Protected** `_bounds`

- Type: `Rectangle | { height: number; width: number; x: number; y: number }`

Bounding rectangle of the quadtree.

Inherited from [Quadtree._bounds](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#_bounds)

---

### **Static** `INDICES`

- Type: `{ bl: number; br: number; tl: number; tr: number } = ...`

A constant that enumerates the index order of the quadtree nodes from top-left to bottom-right.

Inherited from [Quadtree.INDICES](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#indices)

---

## Accessors

### `all`

```typescript
get all(): QuadtreeObject[]
```

Return an array of all the objects in the Quadtree (recursive).

**Returns**  
`QuadtreeObject[]`

Inherited from [Quadtree.all](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#all)

---

### `bounds`

```typescript
get bounds(): Rectangle
```

The bounding rectangle of the region.

**Returns**  
`Rectangle`

Inherited from [Quadtree.bounds](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#bounds)

---

### `height`

```typescript
get height(): number
```

The height of the bounding rectangle.

**Returns**  
`number`

Inherited from [Quadtree.height](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#height)

---

### `width`

```typescript
get width(): number
```

The width of the bounding rectangle.

**Returns**  
`number`

Inherited from [Quadtree.width](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#width)

---

### `x`

```typescript
get x(): number
```

The x-coordinate of the bounding rectangle.

**Returns**  
`number`

Inherited from [Quadtree.x](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#x)

---

### `y`

```typescript
get y(): number
```

The y-coordinate of the bounding rectangle.

**Returns**  
`number`

Inherited from [Quadtree.y](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#y)

---

## Methods

### `clear`

```typescript
clear(): Quadtree
```

Clear the quadtree of all existing contents.

**Returns**  
`Quadtree` - The cleared Quadtree.

Inherited from [Quadtree.clear](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#clear)

---

### `getAdjacentNodes`

```typescript
getAdjacentNodes(): Quadtree[]
```

Identify all nodes which are adjacent to this one within the parent Quadtree.

**Returns**  
`Quadtree[]`

Inherited from [Quadtree.getAdjacentNodes](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#getadjacentnodes)

---

### `getChildNodes`

```typescript
getChildNodes(rect: Rectangle): Quadtree[]
```

Obtain the child nodes within the current node which a rectangle belongs to. Note that this function is not recursive, it only returns nodes at the current or child level.

**Parameters**

- **rect**: `Rectangle`  
  The target rectangle.

**Returns**  
`Quadtree[]` - The Quadtree nodes to which the target rectangle belongs.

Inherited from [Quadtree.getChildNodes](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#getchildnodes)

---

### `getLeafNodes`

```typescript
getLeafNodes(rect: Rectangle): Quadtree[]
```

Obtain the leaf nodes to which a target rectangle belongs. This traverses the quadtree recursively obtaining the final nodes which have no children.

**Parameters**

- **rect**: `Rectangle`  
  The target rectangle.

**Returns**  
`Quadtree[]` - The Quadtree nodes to which the target rectangle belongs.

Inherited from [Quadtree.getLeafNodes](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#getleafnodes)

---

### `getObjects`

```typescript
getObjects(
  rect: Rectangle,
  options?: { _s?: Set<any>; collisionTest?: Function }
): Set<any>
```

Get all the objects which could collide with the provided rectangle.

**Parameters**

- **rect**: `Rectangle`  
  The normalized target rectangle.

- **options?**:  
  - **_s?**: `Set<any>` - The existing result set, for internal use.  
  - **collisionTest?**: `Function`  
    Function to further refine objects to return after a potential collision is found.  
    Parameters are the object and rect, and the function should return `true` if the object should be added to the result set.

**Returns**  
`Set<any>` - The objects in the Quadtree which represent potential collisions.

Inherited from [Quadtree.getObjects](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#getobjects)

---

### `insert`

```typescript
insert(obj: QuadtreeObject): Quadtree[]
```

Add a rectangle object to the tree.

**Parameters**

- **obj**: `QuadtreeObject`  
  The object being inserted.

**Returns**  
`Quadtree[]` - The Quadtree nodes the object was added to.

Inherited from [Quadtree.insert](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#insert)

---

### `remove`

```typescript
remove(target: any): Quadtree
```

Remove an object from the quadtree.

**Parameters**

- **target**: `any`  
  The quadtree target being removed.

**Returns**  
`Quadtree` - The Quadtree for method chaining.

Inherited from [Quadtree.remove](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#remove)

---

### `setDimensions`

```typescript
setDimensions(width: number, height: number): Quadtree
```

Re-dimension the bounding rectangle of this Quadtree, clear existing data, and re-insert all objects. Useful if the underlying canvas or region is resized.

**Parameters**

- **width**: `number`  
  The new width of the bounding rectangle.

- **height**: `number`  
  The new height of the bounding rectangle.

**Returns**  
`Quadtree` - This Quadtree for method chaining.

Inherited from [Quadtree.setDimensions](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#setdimensions)

---

### `setPosition`

```typescript
setPosition(x: number, y: number): Quadtree
```

Re-position the bounding rectangle of this Quadtree, clear existing data, and re-insert all objects. Useful if the Quadtree needs to move.

**Parameters**

- **x**: `number`  
  The new x-coordinate of the bounding rectangle.

- **y**: `number`  
  The new y-coordinate of the bounding rectangle.

**Returns**  
`Quadtree` - This Quadtree for method chaining.

Inherited from [Quadtree.setPosition](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#setposition)

---

### `split`

```typescript
split(): Quadtree
```

Split this node into 4 sub-nodes.

**Returns**  
`Quadtree` - The split Quadtree.

Inherited from [Quadtree.split](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#split)

---

### `update`

```typescript
update(obj: QuadtreeObject): Quadtree[]
```

Remove an existing object from the quadtree and re-insert it with a new position.

**Parameters**

- **obj**: `QuadtreeObject`  
  The object being inserted.

**Returns**  
`Quadtree[]` - The Quadtree nodes the object was added to.

Inherited from [Quadtree.update](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#update)

---

### `visualize`

```typescript
visualize(objects?: boolean): void
```

Visualize the nodes and objects in the quadtree.

**Parameters**

- **objects?**: `boolean = false`  
  Visualize the rectangular bounds of objects in the Quadtree. Default is `false`.

**Returns**  
`void`

Inherited from [Quadtree.visualize](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html#visualize)