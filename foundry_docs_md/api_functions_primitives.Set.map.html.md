# map

## Function map

```typescript
map<T, U>(transform: (element: T, index: number, set: Set<T>) => U): Set<U>
```

Create a new Set where every element is modified by a provided transformation function.

### Type Parameters

- **T**
- **U**

### Parameters

- **transform**: `(element: T, index: number, set: Set<T>) => U`  
  The transformation function to apply. Positional arguments are the value, the index of iteration, and the set being transformed.

### Returns

`Set<U>`  
A new Set of equal size containing transformed elements.

### See

Array#map

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)