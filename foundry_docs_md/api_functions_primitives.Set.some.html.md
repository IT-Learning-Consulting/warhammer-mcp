# some | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `some`

```typescript
some<T>(test: (element: T, index: number, set: Set<T>) => boolean): boolean
```

Test whether any element in this `Set` satisfies a certain test criterion.

**Type Parameters**

- `T`

**Parameters**

- **test**: `(element: T, index: number, set: Set<T>) => boolean`  
  The test criterion to apply. Positional arguments are the value, the index of iteration, and the set being tested.

**Returns**

- `boolean`  
  Does any element in the set satisfy the test criterion?

**See**

- [Array#some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)