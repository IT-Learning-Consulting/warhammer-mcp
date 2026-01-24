# ToursCollection | Foundry Virtual Tabletop - API Documentation - Version 13

A singleton Tour Collection class responsible for registering and activating Tours, accessible as `game.tours`.

**See**  
[foundry.Game#tours](https://foundryvtt.com/api/classes/foundry.Game.html#tours)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.nue.ToursCollection), Expand)  
- _Collection_  
- **ToursCollection**

---

## Accessors

### `contents`

```typescript
get contents(): V[]
```

Return an Array of all the entry values in the Collection.

**Returns**  
`V[]`

Inherited from `Collection.contents`

---

## Methods

### `[iterator]`

```typescript
[Symbol.iterator](): MapIterator<Tour>
```

Then iterating over a Collection, we should iterate over its values instead of over its entries.

**Returns**  
`MapIterator<Tour>`

Inherited from [Collection.[iterator]](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#iterator)

---

### `filter`

```typescript
filter(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean,
): Tour[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

**Parameters**  
- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns**  
`Tour[]` — An Array of matched values

**See**  
**Example: Filter the Collection for specific entries**

Inherited from [Collection.filter](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#filter)

Example usage:

```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filter(entry => entry.slice(0) === "A");
```

---

### `find`

```typescript
find(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean,
): undefined | Tour
```

Find an entry in the Map using a functional condition.

**Parameters**  
- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

**Returns**  
`undefined | Tour` — The value, if found, otherwise undefined

**See**  
**Example: Create a new Collection and reference its contents**

Inherited from [Collection.find](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#find)

Example usage:

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A");  // true
```

---

### `forEach`

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection.

**Parameters**  
- **fn**: `(arg0: any) => void` — A function to apply to each element

**Returns**  
`void`

**See**  
Array#forEach

**Example: Apply a function to each value in the collection**

Inherited from [Collection.forEach](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#foreach)

Example usage:

```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

---

### `get`

```typescript
get(key: string, options?: { strict?: boolean }): undefined | Tour
```

Get an element from the Collection by its key.

**Parameters**  
- **key**: `string` — The key of the entry to retrieve  
- **options?**: `{ strict?: boolean } = {}` — Additional options that affect how entries are retrieved  
  - **strict?**: `boolean` — Throw an Error if the requested key does not exist. Default `false`.

**Returns**  
`undefined | Tour` — The retrieved entry value, if the key exists, otherwise undefined

**Example: Get an element from the Collection by key**

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.get("a");  // "Alfred"
c.get("d");  // undefined
c.get("d", {strict: true});  // throws Error
```

Inherited from [Collection.get](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#get)

---

### `getName`

```typescript
getName(name: string, options?: { strict?: boolean }): undefined | Tour
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a `"name"` attribute.

**Parameters**  
- **name**: `string` — The name of the entry to retrieve  
- **options?**: `{ strict?: boolean } = {}` — Additional options that affect how entries are retrieved  
  - **strict?**: `boolean` — Throw an Error if the requested name does not exist. Default `false`.

**Returns**  
`undefined | Tour` — The retrieved entry value, if one was found, otherwise undefined

**Example: Get an element from the Collection by name (if applicable)**

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");  // "Alfred"
c.getName("D");       // undefined
c.getName("D", {strict: true});  // throws Error
```

Inherited from [Collection.getName](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#getname)

---

### `map`

```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters**  
- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns**  
`any[]` — An Array of transformed values

Inherited from [Collection.map](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#map)

---

### `reduce`

```typescript
reduce(
    reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
    initial: any,
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters**  
- **reducer**: `(arg0: any, arg1: any, arg2: number, arg3: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.  
- **initial**: `any` — An initial value which accumulates with each iteration.

**Returns**  
`any` — The accumulated result

**See**  
**Example: Reduce a collection to an array of transformed values**

Inherited from [Collection.reduce](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#reduce)

Example usage:

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, "");  // "ABC"
```

---

### `register`

```typescript
register(namespace: string, id: string, tour: Tour): void
```

Register a new Tour.

**Parameters**  
- **namespace**: `string` — The namespace of the Tour  
- **id**: `string` — The machine-readable id of the Tour  
- **tour**: `Tour` — The constructed Tour

**Returns**  
`void`

---

### `set`

```typescript
set(key: string, tour: Tour): ToursCollection
```

Set a Tour to the collection.

**Parameters**  
- **key**: `string`  
- **tour**: `Tour`

**Returns**  
`ToursCollection`

Overrides `Collection.set`

---

### `some`

```typescript
some(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters**  
- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns**  
`boolean` — Was the test condition passed by at least one entry?

**See**  
Inherited from [Collection.some](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#some)

---

### `toJSON`

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns**  
`object[]` — An array of contained values

Inherited from [Collection.toJSON](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#tojson)