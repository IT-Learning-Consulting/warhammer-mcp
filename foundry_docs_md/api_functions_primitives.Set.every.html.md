# every | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
every<T>(test: (element: T, index: number, set: Set<T>) => boolean): boolean
```

Test whether every element in this `Set` satisfies a certain test criterion.

**Type Parameters**

- `T`

**Parameters**

- **test**: `(element: T, index: number, set: Set<T>) => boolean`  
  The test criterion to apply. Positional arguments are the value, the index of iteration, and the set being tested.

**Returns**

- `boolean`  
  Does every element in the set satisfy the test criterion?

**See**

- [Array#every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)