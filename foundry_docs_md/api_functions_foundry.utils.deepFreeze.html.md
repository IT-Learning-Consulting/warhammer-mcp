# deepFreeze | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `deepFreeze`

```typescript
deepFreeze<const T extends object>(
    obj: T,
    options?: { strict?: boolean },
): Readonly<T>
```

Recursively freezes (`Object.freeze`) the object (or value). This method **does NOT** support cyclical data structures. This method **does NOT** support advanced object types like `Set`, `Map`, or other specialized classes.

**Type Parameters**

- `const T extends object`

**Parameters**

- **obj**: `T`  
  The object (or value).

- **options?**: `{ strict?: boolean } = {}`  
  Options to configure the behaviour of `deepFreeze`.

  - **strict?**: `boolean`  
    Throw an Error if `deepFreeze` is unable to seal something instead of returning the original.

**Returns**

- `Readonly<T>`  
  The same object (or value) that was passed in.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)