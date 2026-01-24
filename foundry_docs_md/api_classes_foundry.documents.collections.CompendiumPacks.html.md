# Class CompendiumPacks

A mapping of `CompendiumCollection` instances, one per Compendium pack.

**Hierarchy:** [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.collections.CompendiumPacks)  
Extends: `Collection<string, CompendiumCollection, this>`

---

## Constructors

### constructor

```typescript
new CompendiumPacks(
    entries: Iterable<readonly [string, CompendiumCollection]>,
): CompendiumPacks
```

**Parameters:**

- **entries**: `Iterable<readonly [string, CompendiumCollection]>`  
  An iterable of entries to initialize the collection.

**Returns:**  
`CompendiumPacks`

_Inherited from [`Collection.constructor`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#constructor)_

---

## Accessors

### contents

```typescript
get contents(): V[]
```

Returns an array of all the entry values in the Collection.

**Returns:**  
`V[]`

_Inherited from `DirectoryCollectionMixin(Collection).contents`_

---

### folders

```typescript
get folders(): Collection<string, documents.Folder>
```

Get a Collection of Folders which contain Compendium Packs.

**Returns:**  
`Collection<string, documents.Folder>`

---

### name

```typescript
get name(): string
```

The Collection class name.

**Returns:**  
`string`

---

## Methods

### _getVisibleTreeContents

```typescript
_getVisibleTreeContents(): CompendiumCollection[]
```

**Returns:**  
`CompendiumCollection[]`

---

### [iterator]

```typescript
[Symbol.iterator](): MapIterator<CompendiumCollection>
```

Then iterating over a Collection, we should iterate over its values instead of over its entries.

**Returns:**  
`MapIterator<CompendiumCollection>`

_Inherited from [`Collection.[iterator]`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#iterator)_

---

### filter

```typescript
filter(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean,
): CompendiumCollection[]
```

Filter the Collection, returning an array of entries which match a functional condition.

**Parameters:**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns:**  
`CompendiumCollection[]` — An array of matched values.

**See:**  
Example: Filter the Collection for specific entries.

_Inherited from [`Collection.filter`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#filter)_

**Example:**

```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filter(entry => entry.slice(0) === "A");
```

---

### find

```typescript
find(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean,
): undefined | CompendiumCollection
```

Find an entry in the Map using a functional condition.

**Parameters:**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

**Returns:**  
`undefined | CompendiumCollection` — The value, if found, otherwise undefined.

**See:**  
Example: Create a new Collection and reference its contents.

_Inherited from [`Collection.find`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#find)_

**Example:**

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A"); // true
```

---

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection.

**Parameters:**

- **fn**: `(arg0: any) => void`  
  A function to apply to each element.

**Returns:**  
`void`

**See:**  
`Array#forEach`

_Inherited from [`Collection.forEach`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#foreach)_

**Example:**

```typescript
let c = new Collection([
  ["a", {active: false}],
  ["b", {active: false}],
  ["c", {active: false}],
]);
c.forEach(e => e.active = true);
```

---

### get

```typescript
get(
    key: string,
    options?: { strict?: boolean },
): undefined | CompendiumCollection
```

Get an element from the Collection by its key.

**Parameters:**

- **key**: `string`  
  The key of the entry to retrieve.

- **options?**:  
  - **strict?**: `boolean` (optional)  
    Throw an Error if the requested key does not exist. Default is false.

**Returns:**  
`undefined | CompendiumCollection` — The retrieved entry value, if the key exists, otherwise undefined.

**Example:**

_Inherited from [`Collection.get`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#get)_

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.get("a"); // "Alfred"
c.get("d"); // undefined
c.get("d", {strict: true}); // throws Error
```

---

### getName

```typescript
getName(
    name: string,
    options?: { strict?: boolean },
): undefined | CompendiumCollection
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a `name` attribute.

**Parameters:**

- **name**: `string`  
  The name of the entry to retrieve.

- **options?**:  
  - **strict?**: `boolean` (optional)  
    Throw an Error if the requested name does not exist. Default is false.

**Returns:**  
`undefined | CompendiumCollection` — The retrieved entry value, if one was found, otherwise undefined.

**Example:**

_Inherited from [`Collection.getName`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#getname)_

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred"); // "Alfred"
c.getName("D"); // undefined
c.getName("D", {strict: true}); // throws Error
```

---

### map

```typescript
map(
    transformer: (arg0: any, arg1: number, arg2: Collection) => any
): any[]
```

Transform each element of the Collection into a new form, returning an array of transformed values.

**Parameters:**

- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns:**  
`any[]` — An array of transformed values.

_Inherited from [`Collection.map`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#map)_

---

### reduce

```typescript
reduce(
    reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
    initial: any,
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters:**

- **reducer**: `(arg0: any, arg1: any, arg2: number, arg3: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.

- **initial**: `any`  
  An initial value which accumulates with each iteration.

**Returns:**  
`any` — The accumulated result.

**See:**  
Example: Reduce a collection to an array of transformed values.

_Inherited from [`Collection.reduce`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#reduce)_

**Example:**

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, ""); // "ABC"
```

---

### some

```typescript
some(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean
): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters:**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns:**  
`boolean` — Was the test condition passed by at least one entry?

**See:**  
Inherited from [`Collection.some`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#some)

---

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns:**  
`object[]` — An array of contained values.

Inherited from [`Collection.toJSON`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#tojson)

---

## Static Methods

### _sortAlphabetical

```typescript
static _sortAlphabetical(a: any, b: any): any
```

**Parameters:**

- **a**: `any`  
- **b**: `any`

**Returns:**  
`any`

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)