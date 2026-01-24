# findSplice | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `findSplice`

```typescript
findSplice<T>(find: (element: T) => boolean, replace?: T): null | T
```

Find an element within the Array and remove it from the array.

#### Type Parameters

- **T**

#### Parameters

- **find**: `(element: T) => boolean`  
  A function to use as input to `findIndex`.

- **replace?**: `T`  
  A replacement for the spliced element (optional).

#### Returns

`null | T`  
The replacement element, the removed element, or `null` if no element was found.

#### See Also

- [`Array#splice`](https://foundryvtt.com/api/modules/primitives.Array.html#splice)  
- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)