# filter

```typescript
filter<T>(test: (element: T, index: number, set: Set<T>) => boolean): Set<T>
```

Filter this set to create a subset of elements which satisfy a certain test criterion.

**Type Parameters**

- `T`

**Parameters**

- **test**: `(element: T, index: number, set: Set<T>) => boolean`  
  The test criterion to apply. Positional arguments are the value, the index of iteration, and the set being filtered.

**Returns**

- `Set<T>`  
  A new Set containing only elements which satisfy the test criterion.

**See**

- `Array#filter`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)