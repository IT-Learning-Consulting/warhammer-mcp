# deepClone | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
deepClone<T extends object>(original: T, options?: { strict?: boolean }): T
```

Quickly clone a simple piece of data, returning a copy which can be mutated safely. This method **DOES** support recursive data structures containing inner objects or arrays. This method **DOES NOT** support cyclical data structures. This method **DOES NOT** support advanced object types like `Set`, `Map`, or other specialized classes.

**Type Parameters**

- `T` extends `object`

**Parameters**

- **original**: `T`  
  Some sort of data

- **options?**: `{ strict?: boolean }` = `{}`  
  Options to configure the behaviour of `deepClone`

  - **strict?**: `boolean`  
    Throw an `Error` if `deepClone` is unable to clone something instead of returning the original

**Returns**

- `T`  
  The clone of that data

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)