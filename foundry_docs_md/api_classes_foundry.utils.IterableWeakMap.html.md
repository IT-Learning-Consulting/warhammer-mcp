# IterableWeakMap | Foundry Virtual Tabletop - API Documentation - Version 13

Stores a map of objects with weak references to the keys, allowing them to be garbage collected. Both keys and values can be iterated over, unlike a WeakMap.

## Hierarchy
- _WeakMap_
- **IterableWeakMap**

## Constructors

### `constructor`

```typescript
new IterableWeakMap(entries?: Iterable<[any, any], any, any>): IterableWeakMap
```

**Parameters**

- **entries**: `Iterable<[any, any], any, any>` = `[]`  
  The initial entries.

## Methods

### `[iterator]`

```typescript
"[iterator]"(): Generator<[any, any], void, any>
```

Enumerate the entries.

**Returns**  
`Generator<[any, any], void, any>`

Overrides `WeakMap.constructor`.

---

### `clear`

```typescript
clear(): void
```

Clear all values from the map.

**Returns**  
`void`

---

### `delete`

```typescript
delete(key: any): boolean
```

Remove a key from the map.

**Parameters**

- **key**: `any`  
  The key to remove.

**Returns**  
`boolean`

Overrides `WeakMap.delete`.

---

### `entries`

```typescript
entries(): Generator<[any, any], void, any>
```

Enumerate the entries.

**Returns**  
`Generator<[any, any], void, any>`

---

### `get`

```typescript
get(key: any): any
```

Retrieve a value from the map.

**Parameters**

- **key**: `any`  
  The value's key.

**Returns**  
`any`

Overrides `WeakMap.get`.

---

### `keys`

```typescript
keys(): Generator<any, void, any>
```

Enumerate the keys.

**Returns**  
`Generator<any, void, any>`

---

### `set`

```typescript
set(key: any, value: any): IterableWeakMap
```

Place a value in the map.

**Parameters**

- **key**: `any`  
  The key.
- **value**: `any`  
  The value.

**Returns**  
`IterableWeakMap`

Overrides `WeakMap.set`.

---

### `values`

```typescript
values(): Generator<any, void, any>
```

Enumerate the values.

**Returns**  
`Generator<any, void, any>`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)