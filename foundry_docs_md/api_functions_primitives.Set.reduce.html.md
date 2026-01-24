# reduce | Foundry Virtual Tabletop - API Documentation - Version 13

### `reduce<T>(`
&nbsp;&nbsp;&nbsp;&nbsp;`reducer: (accum: any, element: T, index: number, set: Set<T>) => any,`  
&nbsp;&nbsp;&nbsp;&nbsp;`initial?: any`  
`): any`

Create a new Set with elements that are filtered and transformed by a provided reducer function.

**Type Parameters**

- `T`

**Parameters**

- **reducer**: `(accum: any, element: T, index: number, set: Set<T>) => any`  
  A reducer function applied to each value. Positional arguments are the accumulator, the value, the index of iteration, and the set being reduced.

- **initial**: `any` (Optional)  
  The initial value of the returned accumulator.

**Returns**

- `any`  
  The final value of the accumulator.

**See**

- Array#reduce  
- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)