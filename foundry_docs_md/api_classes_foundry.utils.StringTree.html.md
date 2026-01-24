# StringTree

A data structure representing a tree of string nodes with arbitrary object leaves.

## Hierarchy

**StringTree**  
_see also: [WordTree](https://foundryvtt.com/api/classes/foundry.utils.WordTree.html)_

---

## Static Accessors

### leaves

```typescript
get leaves(): symbol
```

The key symbol that stores the leaves of any given node.

**Returns:** `symbol`

---

## Static Methods

### addLeaf

```typescript
addLeaf(strings: string[], entry: any): any
```

Insert an entry into the tree.

**Parameters:**

- **strings**: `string[]`  
  The string parents for the entry.

- **entry**: `any`  
  The entry to store.

**Returns:** `any`  
The node the entry was added to.

---

## Methods

### lookup

```typescript
lookup(
  strings: string[],
  options?: { filterEntries?: StringTreeEntryFilter; limit?: number },
): any[]
```

Traverse the tree along the given string path and return any entries reachable from the node.

**Parameters:**

- **strings**: `string[]`  
  The string path to the desired node.

- **options?**:  
  Optional parameters object:

  - **filterEntries?**: [`StringTreeEntryFilter`](https://foundryvtt.com/api/types/foundry.utils.types.StringTreeEntryFilter.html)  
    A filter function to apply to each candidate entry.

  - **limit?**: `number`  
    The maximum number of items to retrieve.

**Returns:** `any[]`

---

### nodeAtPrefix

```typescript
nodeAtPrefix(strings: string[], options?: { hasLeaves?: boolean }): any
```

Returns the node at the given path through the tree.

**Parameters:**

- **strings**: `string[]`  
  The string path to the desired node.

- **options?**:  
  Optional parameters object:

  - **hasLeaves?**: `boolean`  
    Only return the most recently visited node that has leaves, otherwise return the  
    exact node at the prefix, if it exists.

**Returns:** `any`

---

### _breadthFirstSearch

```typescript
protected _breadthFirstSearch(
  node: any,
  entries: any[],
  queue: any[],
  options?: { filterEntries?: StringTreeEntryFilter; limit?: number },
): void
```

Perform a breadth-first search starting from the given node and retrieving any entries  
reachable from that node, until we reach the limit.

**Parameters:**

- **node**: `any`  
  The starting node.

- **entries**: `any[]`  
  The accumulated entries.

- **queue**: `any[]`  
  The working queue of nodes to search.

- **options?**:  
  Optional parameters object:

  - **filterEntries?**: [`StringTreeEntryFilter`](https://foundryvtt.com/api/types/foundry.utils.types.StringTreeEntryFilter.html)  
    A filter function to apply to each candidate entry.

  - **limit?**: `number`  
    The maximum number of entries to retrieve before stopping.

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)