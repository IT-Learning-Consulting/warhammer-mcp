# Quadtree

A Quadtree implementation that supports collision detection for rectangles.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas /](https://foundryvtt.com/api/modules/foundry.canvas.html) [geometry](https://foundryvtt.com/api/modules/foundry.canvas.geometry.html) /  
[Quadtree](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html)

## Constructor Parameters

- **bounds**  
  The outer bounds of the region

- **options**  
  Additional options which configure the Quadtree

  - **options.maxObjects**  
    The maximum number of objects per node

  - **options.maxDepth**  
    The maximum number of levels within the root Quadtree

  - **options._depth**  
    The depth level of the sub-tree. For internal use

  - **options._root**  
    The root of the quadtree. For internal use

## Hierarchy

- Quadtree  
- [CanvasQuadtree](https://foundryvtt.com/api/classes/foundry.canvas.geometry.CanvasQuadtree.html) (extends Quadtree)

---

## Properties

### depth  
**Type:** `number`  
The depth of this node within the root Quadtree

### maxDepth  
**Type:** `number`  
The maximum number of levels that the base quadtree is allowed

### maxObjects  
**Type:** `number`  
The maximum number of objects allowed within this node before it must split

### nodes  
**Type:** `Quadtree[]`  
Children of this node

### objects  
**Type:** `QuadtreeObject[]`  
The objects contained at this level of the tree

### root  
**Type:** `Quadtree`  
The root Quadtree

### _bounds (protected)  
**Type:** `Rectangle | { height: number; width: number; x: number; y: number; }`  
Bounding rectangle of the quadtree.

---

## Accessors

### static INDICES  
**Type:** `{ bl: number; br: number; tl: number; tr: number } = ...`  
A constant that enumerates the index order of the quadtree nodes from top-left to bottom-right.

### get all(): `QuadtreeObject[]`  
Return an array of all the objects in the Quadtree (recursive)  
**Returns:** `QuadtreeObject[]`

### get bounds(): `Rectangle`  
The bounding rectangle of the region  
**Returns:** `Rectangle`

### get height(): `number`  
The height of the bounding rectangle  
**Returns:** `number`

### get width(): `number`  
The width of the bounding rectangle  
**Returns:** `number`

### get x(): `number`  
The x-coordinate of the bounding rectangle  
**Returns:** `number`

### get y(): `number`  
The y-coordinate of the bounding rectangle  
**Returns:** `number`

---

## Methods

### clear

```typescript
clear(): Quadtree
```

Clear the quadtree of all existing contents.  
**Returns:** `Quadtree` — The cleared Quadtree

---

### getAdjacentNodes

```typescript
getAdjacentNodes(): Quadtree[]
```

Identify all nodes which are adjacent to this one within the parent Quadtree.  
**Returns:** `Quadtree[]`

---

### getChildNodes

```typescript
getChildNodes(rect: Rectangle): Quadtree[]
```

Obtain the child nodes within the current node which a rectangle belongs to. Note that this function is not recursive, it only returns nodes at the current or child level.

**Parameters:**

- **rect**: `Rectangle`  
  The target rectangle.

**Returns:** `Quadtree[]`  
The Quadtree nodes to which the target rectangle belongs

---

### getLeafNodes

```typescript
getLeafNodes(rect: Rectangle): Quadtree[]
```

Obtain the leaf nodes to which a target rectangle belongs. This traverses the quadtree recursively obtaining the final nodes which have no children.

**Parameters:**

- **rect**: `Rectangle`  
  The target rectangle.

**Returns:** `Quadtree[]`  
The Quadtree nodes to which the target rectangle belongs

---

### getObjects

```typescript
getObjects(
  rect: Rectangle,
  options?: {
    _s?: Set<any>;
    collisionTest?: Function;
  },
): Set<any>
```

Get all the objects which could collide with the provided rectangle.

**Parameters:**

- **rect**: `Rectangle`  
  The normalized target rectangle

- **options?**:  
  Options affecting the collision test.

  - **_s?**: `Set<any>`  
    The existing result set, for internal use.

  - **collisionTest?**: `Function`  
    Function to further refine objects to return after a potential collision is found. Parameters are the object and rect, and the function should return true if the object should be added to the result set.

**Returns:** `Set<any>`  
The objects in the Quadtree which represent potential collisions

---

### insert

```typescript
insert(obj: QuadtreeObject): Quadtree[]
```

Add a rectangle object to the tree.

**Parameters:**

- **obj**: `QuadtreeObject`  
  The object being inserted

**Returns:** `Quadtree[]`  
The Quadtree nodes the object was added to.

---

### remove

```typescript
remove(target: any): Quadtree
```

Remove an object from the quadtree.

**Parameters:**

- **target**: `any`  
  The quadtree target being removed

**Returns:** `Quadtree`  
The Quadtree for method chaining

---

### setDimensions

```typescript
setDimensions(width: number, height: number): Quadtree
```

Re-dimension the bounding rectangle of this Quadtree, clear existing data, and re-insert all objects. Useful if the underlying canvas or region is resized.

**Parameters:**

- **width**: `number`  
  The new width of the bounding rectangle

- **height**: `number`  
  The new height of the bounding rectangle

**Returns:** `Quadtree`  
This Quadtree for method chaining

---

### setPosition

```typescript
setPosition(x: number, y: number): Quadtree
```

Re-position the bounding rectangle of this Quadtree, clear existing data, and re-insert all objects. Useful if the Quadtree needs to move.

**Parameters:**

- **x**: `number`  
  The new x-coordinate of the bounding rectangle

- **y**: `number`  
  The new y-coordinate of the bounding rectangle

**Returns:** `Quadtree`  
This Quadtree for method chaining

---

### split

```typescript
split(): Quadtree
```

Split this node into 4 sub-nodes.

**Returns:** `Quadtree`  
The split Quadtree

---

### update

```typescript
update(obj: QuadtreeObject): Quadtree[]
```

Remove an existing object from the quadtree and re-insert it with a new position.

**Parameters:**

- **obj**: `QuadtreeObject`  
  The object being inserted

**Returns:** `Quadtree[]`  
The Quadtree nodes the object was added to

---

### visualize

```typescript
visualize(objects?: boolean): void
```

Visualize the nodes and objects in the quadtree.

**Parameters:**

- **objects?**: `boolean` = `false`  
  Visualize the rectangular bounds of objects in the Quadtree. Default is false.

**Returns:** `void`