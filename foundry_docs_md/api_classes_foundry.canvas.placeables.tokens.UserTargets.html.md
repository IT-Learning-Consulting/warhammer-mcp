# UserTargets | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of Set which manages the Token ids which the User has targeted.

**See**  
[foundry.documents.User#targets](https://foundryvtt.com/api/classes/foundry.documents.User.html#targets)

**Hierarchy**  
*Set*  
**UserTargets**

## Accessors

### ids

```typescript
get ids(): string[]
```

Return the Token IDs which are user targets.

**Returns**  
`string[]`

---

## Methods

### add

```typescript
add(token: canvas.placeables.Token): UserTargets
```

Overrides `Set.add`

**Parameters**

- **token**: `canvas.placeables.Token`

**Returns**  
`UserTargets`

---

### clear

```typescript
clear(): void
```

Overrides `Set.clear`

**Returns**  
`void`

---

### delete

```typescript
delete(token: canvas.placeables.Token): boolean
```

Overrides `Set.delete`

**Parameters**

- **token**: `canvas.placeables.Token`

**Returns**  
`boolean`

---

### map

```typescript
map<U>(
  transform: (
    element: canvas.placeables.Token,
    index: number,
    set: Set<canvas.placeables.Token>,
  ) => U,
): Set<U>
```

Create a new Set where every element is modified by a provided transformation function.

**Type Parameters**

- `U`

**Parameters**

- **transform**:  
  A function to apply to each element. Positional arguments are the element, the index of iteration, and the set being transformed.

**Returns**  
`Set<U>`

**See**  
Array#map  
Inherited from `Set.map`

---

### reduce

```typescript
reduce<U>(
  reducer: (
    accum: U,
    element: canvas.placeables.Token,
    index: number,
    set: Set<canvas.placeables.Token>,
  ) => U,
  initial?: U,
): U
```

Create a new Set with elements that are filtered and transformed by a provided reducer function.

**Type Parameters**

- `U`

**Parameters**

- **reducer**:  
  A reducer function applied to each value. Positional arguments are the accumulator, the element, the index of iteration, and the set being reduced.

- **initial** (optional):  
  The initial value of the returned accumulator.

**Returns**  
`U`

**See**  
Array#reduce  
Inherited from `Set.reduce`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)