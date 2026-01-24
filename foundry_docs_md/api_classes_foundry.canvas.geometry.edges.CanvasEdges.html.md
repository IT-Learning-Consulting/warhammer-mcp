# CanvasEdges | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized `Map` class that manages all edges used to restrict perception in a Scene. Integrates with a Quadtree for efficient spatial queries.

## Hierarchy

* _Map_
* **CanvasEdges**

## Methods

### clear

```typescript
clear(): CanvasEdges
```

**Returns**  
`CanvasEdges`

Overrides `Map.clear`.

---

### delete

```typescript
delete(key: any): boolean
```

**Parameters**

- **key**: `any`

**Returns**  
`boolean`

Overrides `Map.delete`.

---

### getEdges

```typescript
getEdges(
    rect: Rectangle, 
    options?: {
        collisionTest?: Function;
        includeInnerBounds?: boolean;
        includeOuterBounds?: boolean;
    },
): Set<Edge>
```

Retrieves edges that intersect with a given rectangle. Utilizes the Quadtree for efficient spatial querying.

**Parameters**

- **rect**: `Rectangle`  
  The rectangle to query against.
- **options** (optional):  
  - **collisionTest?**: `Function`  
    Collision function to test edge inclusion.
  - **includeInnerBounds?**: `boolean`  
    Should inner bounds be added?
  - **includeOuterBounds?**: `boolean`  
    Should outer bounds be added?

**Returns**  
`Set<Edge>`

A set of `Edge` instances that intersect with the provided rectangle.

---

### initialize

```typescript
initialize(): void
```

Clear content and initializes the quadtree.

**Returns**  
`void`

---

### refresh

```typescript
refresh(): void
```

Incrementally refreshes edges by computing intersections between all registered edges. Utilizes the Quadtree to optimize the intersection detection process.

**Returns**  
`void`

---

### set

```typescript
set(key: any, value: any): CanvasEdges
```

**Parameters**

- **key**: `any`
- **value**: `any`

**Returns**  
`CanvasEdges`

Overrides `Map.set`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)