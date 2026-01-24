# find

```typescript
find<T>(
    test: (element: T, index: number, set: Set<T>) => boolean,
): undefined | T
```

Find the first element in this set which satisfies a certain test criterion.

**Type Parameters**  
- `T`

**Parameters**  
- **test**: `(element: T, index: number, set: Set<T>) => boolean`  
  The test criterion to apply. Positional arguments are the value, the index of iteration, and the set being searched.

**Returns**  
`undefined | T`  
The first element in the set which satisfies the test criterion, or `undefined`.

**See**  
Array#find

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)