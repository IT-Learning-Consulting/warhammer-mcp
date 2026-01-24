# _FilePathFieldOptions

Interface `_FilePathFieldOptions`

```typescript
interface _FilePathFieldOptions {
    base64?: boolean;
    categories?: string[];
    initial?: object;
    virtual?: boolean;
    wildcard?: boolean;
}
```

## Properties

- **base64?**: `boolean`  
  Is embedded base64 data supported in lieu of a file path?

- **categories?**: `string[]`  
  A set of categories in [CONST.FILE_CATEGORIES](https://foundryvtt.com/api/variables/CONST.FILE_CATEGORIES.html) which this field supports.

- **initial?**: `object`  
  The initial values of the fields.

- **virtual?**: `boolean`  
  Does the file path field allow specifying a virtual file path which must begin with the `#` character?

- **wildcard?**: `boolean`  
  Does this file path field allow wildcard characters?

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)