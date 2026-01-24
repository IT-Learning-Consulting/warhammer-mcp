# RenderFlags | Foundry Virtual Tabletop - API Documentation - Version 13

A data structure for tracking a set of boolean status flags. This is a restricted set which can only accept flag values which are pre-defined.

## Hierarchy

_Set_

**RenderFlags**

---

## Constructors

### constructor

```typescript
new RenderFlags(
    flags?: Record<string, RenderFlag>,
    config?: { object?: any; priority?: number },
): RenderFlags
```

**Parameters**

- **flags**: `Record<string, RenderFlag>` = {}  
  An object which defines the flags which are supported for tracking  
  Optional

- **config**: `{ object?: any; priority?: number }` = {}  
  Optional configuration  
  - **object**?: `any`  
    The object which owns this RenderFlags instance  
    Optional  
  - **priority**?: `number`  
    The ticker priority at which these render flags are handled  
    Optional

**Returns**  
`RenderFlags`  

Overrides `Set.constructor`

---

## Methods

### clear

```typescript
clear(): Record<string, boolean>
```

**Returns**  
`Record<string, boolean>`  
The flags which were previously set that have been cleared.

**Inheritance**  
Overrides `Set.clear`

---

### handle

```typescript
handle(flag: string): boolean
```

Allow for handling one single flag at a time. This function returns whether the flag needs to be handled and removes it from the pending set.

**Parameters**

- **flag**: `string`

**Returns**  
`boolean`

---

### map

```typescript
map<U>(
    transform: (element: string, index: number, set: Set<string>) => U,
): Set<U>
```

Create a new Set where every element is modified by a provided transformation function.

**Type Parameters**

- U

**Parameters**

- **transform**: `(element: string, index: number, set: Set<string>) => U`  
  The transformation function to apply. Positional arguments are the value, the index of iteration, and the set being transformed.

**Returns**  
`Set<U>`  
A new Set of equal size containing transformed elements.

**See Also**  
Array#map

**Inheritance**  
Inherited from `Set.map`

---

### reduce

```typescript
reduce<U>(
    reducer: (
        accum: U,
        element: string,
        index: number,
        set: Set<string>,
    ) => U,
    initial?: U,
): U
```

Create a new Set with elements that are filtered and transformed by a provided reducer function.

**Type Parameters**

- U

**Parameters**

- **reducer**: `(accum: U, element: string, index: number, set: Set<string>) => U`  
  A reducer function applied to each value. Positional arguments are the accumulator, the value, the index of iteration, and the set being reduced.

- **initial**?: `U`  
  The initial value of the returned accumulator. Optional

**Returns**  
`U`  
The final value of the accumulator.

**See Also**  
Array#reduce

**Inheritance**  
Inherited from `Set.reduce`

---

### set

```typescript
set(changes: Record<string, boolean>): void
```

Activate certain flags, also toggling propagation and reset behaviors.

**Parameters**

- **changes**: `Record<string, boolean>`

**Returns**  
`void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)