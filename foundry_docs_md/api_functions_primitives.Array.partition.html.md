# partition | Foundry Virtual Tabletop - API Documentation - Version 13

### Function partition

```typescript
partition<T>(rule: (element: T) => boolean): [T[], T[]]
```

Partition an original array into two child arrays based on a logical test. Elements which test as false go into the first result while elements testing as true appear in the second.

**Type Parameters**

- `T`

**Parameters**

- **rule**: `(element: T) => boolean`  
  A function that tests each element of the array.

**Returns**

- `[T[], T[]]`  
  An array of length two whose elements are the partitioned pieces of the original array.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)