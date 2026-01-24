# WordTree | Foundry Virtual Tabletop - API Documentation - Version 13

A data structure for quickly retrieving objects by a string prefix. Note that this works well for languages with alphabets (latin, cyrillic, korean, etc.), but may need more nuanced handling for languages that compose characters and letters.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.utils.WordTree)  

* _StringTree_  
* **WordTree**

## Accessors

### leaves
```typescript
get leaves(): symbol
```
The key symbol that stores the leaves of any given node.

**Returns:** `symbol`  

Inherited from [StringTree.leaves](https://foundryvtt.com/api/classes/foundry.utils.StringTree.html#leaves)

## Methods

### addLeaf
```typescript
addLeaf(string: string, entry: WordTreeEntry): any
```
Insert an entry into the tree.

**Parameters:**

- **string**: `string`  
  The string key for the entry.

- **entry**: [WordTreeEntry](https://foundryvtt.com/api/interfaces/foundry.utils.types.WordTreeEntry.html)  
  The entry to store.

**Returns:** `any`  
The node the entry was added to.

Overrides [StringTree.addLeaf](https://foundryvtt.com/api/classes/foundry.utils.StringTree.html#addleaf)

---

### lookup
```typescript
lookup(
    prefix: string,
    options?: { 
      filterEntries?: StringTreeEntryFilter; 
      limit?: number 
    },
): WordTreeEntry[]
```
Return entries that match the given string prefix.

**Parameters:**

- **prefix**: `string`  
  The prefix.

- **options?**:  
  Additional options to configure behaviour.

  - **filterEntries?**: [StringTreeEntryFilter](https://foundryvtt.com/api/types/foundry.utils.types.StringTreeEntryFilter.html)  
    A filter function to apply to each candidate entry.

  - **limit?**: `number`  
    The maximum number of items to retrieve. It is important to set this value as very  
    short prefixes will naturally match large numbers of entries.

**Returns:**  
[WordTreeEntry](https://foundryvtt.com/api/interfaces/foundry.utils.types.WordTreeEntry.html)[]  
A number of entries that have the given prefix.

Overrides [StringTree.lookup](https://foundryvtt.com/api/classes/foundry.utils.StringTree.html#lookup)

---

### nodeAtPrefix
```typescript
nodeAtPrefix(prefix: string): any
```
Returns the node at the given prefix.

**Parameters:**

- **prefix**: `string`  
  The prefix.

**Returns:** `any`

Overrides [StringTree.nodeAtPrefix](https://foundryvtt.com/api/classes/foundry.utils.StringTree.html#nodeatprefix)

---

### _breadthFirstSearch (Protected)
```typescript
_breadthFirstSearch(
    node: any,
    entries: any[],
    queue: any[],
    options?: { 
      filterEntries?: StringTreeEntryFilter; 
      limit?: number 
    },
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
  Additional options (default `{}`).

  - **filterEntries?**: [StringTreeEntryFilter](https://foundryvtt.com/api/types/foundry.utils.types.StringTreeEntryFilter.html)  
    A filter function to apply to each candidate entry.

  - **limit?**: `number`  
    The maximum number of entries to retrieve before stopping.

**Returns:** `void`  

Inherited from [StringTree._breadthFirstSearch](https://foundryvtt.com/api/classes/foundry.utils.StringTree.html#_breadthfirstsearch)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)