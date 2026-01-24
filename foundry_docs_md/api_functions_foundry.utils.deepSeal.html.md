# deepSeal | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `deepSeal`

```typescript
deepSeal<T extends object>(obj: T, options?: { strict?: boolean }): T
```

Recursively seals (`Object.seal`) the object (or value). This method **DOES NOT** support cyclical data structures. This method **DOES NOT** support advanced object types like `Set`, `Map`, or other specialized classes.

#### Type Parameters

- `T` extends `object`

#### Parameters

- **obj**: `T`  
  The object (or value) to be sealed.

- **options**?: `{ strict?: boolean } = {}`  
  Options to configure the behaviour of `deepSeal`.

  - **strict**?: `boolean`  
    Throw an Error if `deepSeal` is unable to seal something.

#### Returns

- `T`  
  The same object (or value) that was passed in.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)