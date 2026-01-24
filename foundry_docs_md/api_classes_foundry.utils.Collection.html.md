# Collection | Foundry Virtual Tabletop - API Documentation - Version 13

A reusable storage concept which blends the functionality of an Array with the efficient key-based lookup of a Map. This concept is reused throughout Foundry VTT where a collection of uniquely identified elements is required.

## Type Parameters

- `K`
- `V`

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.utils.Collection))

- *Map*  
- **Collection**  
- [DocumentCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)  
- [CompendiumPacks](https://foundryvtt.com/api/classes/foundry.documents.collections.CompendiumPacks.html)  
- [EmbeddedCollection](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html)  
- [ToursCollection](https://foundryvtt.com/api/classes/foundry.nue.ToursCollection.html)

---

## Constructors

### constructor

```typescript
new Collection<K extends string, V>(
    entries: Iterable<readonly [K, V], any, any>,
): Collection<K, V>
```

**Type Parameters**

- `K extends string`
- `V`

**Parameters**

- **entries**: `Iterable<readonly [K, V]>`  
  The initial entries to populate the Collection.

**Returns**

- `Collection<K, V>`

Overrides `Map.constructor`.

---

## Accessors

### contents

```typescript
get contents(): V[]
```

Return an Array of all the entry values in the Collection.

**Returns**

- `V[]`

---

### [iterator]

```typescript
[Symbol.iterator](): MapIterator<V>
```

When iterating over a Collection, the iteration is performed over its values instead of its entries.

**Returns**

- `MapIterator<V>`

Overrides `Map[Symbol.iterator]`.

---

## Methods

### filter

```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): V[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

**Parameters**

- **condition**: `(value: any, index: number, collection: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns**

- `V[]`  
  An Array of matched values.

**Example: Filter the Collection for specific entries**

```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filter(entry => entry.slice(0) === "A");
```

---

### find

```typescript
find(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean,
): undefined | V
```

Find an entry in the Map using a functional condition.

**Parameters**

- **condition**: `(value: any, index: number, collection: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

**Returns**

- `undefined | V`  
  The value, if found, otherwise undefined.

**Example: Create a new Collection and reference its contents**

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A");  // true
```

---

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection.

**Parameters**

- **fn**: `(value: any) => void`  
  A function to apply to each element.

**Returns**

- `void`

**See**

- Array#forEach

**Example: Apply a function to each value in the collection**

Overrides `Map.forEach`.

```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

---

### get

```typescript
get(key: string, options?: { strict?: boolean }): undefined | V
```

Get an element from the Collection by its key.

**Parameters**

- **key**: `string`  
  The key of the entry to retrieve.

- **options** (optional): `{ strict?: boolean } = {}`  
  Additional options that affect how entries are retrieved.

  - **strict?**: `boolean`  
    Throw an Error if the requested key does not exist. Default is false.

**Returns**

- `undefined | V`  
  The retrieved entry value, if the key exists, otherwise undefined.

**Example: Get an element from the Collection by key**

Overrides `Map.get`.

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.get("a");  // "Alfred"
c.get("d");  // undefined
c.get("d", {strict: true});  // throws Error
```

---

### getName

```typescript
getName(name: string, options?: { strict?: boolean }): undefined | V
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a `"name"` attribute.

**Parameters**

- **name**: `string`  
  The name of the entry to retrieve.

- **options** (optional): `{ strict?: boolean } = {}`  
  Additional options that affect how entries are retrieved.

  - **strict?**: `boolean`  
    Throw an Error if the requested name does not exist. Default is false.

**Returns**

- `undefined | V`  
  The retrieved entry value, if one was found, otherwise undefined.

**Example: Get an element from the Collection by name (if applicable)**

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");  // "Alfred"
c.getName("D");  // undefined
c.getName("D", {strict: true});  // throws Error
```

---

### map

```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters**

- **transformer**: `(value: any, index: number, collection: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns**

- `any[]`  
  An Array of transformed values.

---

### reduce

```typescript
reduce(
    reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
    initial: any,
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters**

- **reducer**: `(accumulator: any, value: any, index: number, collection: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.

- **initial**: `any`  
  An initial value which accumulates with each iteration.

**Returns**

- `any`  
  The accumulated result.

**Example: Reduce a collection to an array of transformed values**

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, "");  // "ABC"
```

---

### some

```typescript
some(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters**

- **condition**: `(value: any, index: number, collection: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns**

- `boolean`  
  Was the test condition passed by at least one entry?

---

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns**

- `object[]`  
  An array of contained values.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)