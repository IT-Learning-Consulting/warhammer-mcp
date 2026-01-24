# DataModelValidationOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DataModelValidationOptions {
    changes?: object;
    clean?: boolean;
    dropInvalidEmbedded?: boolean;
    fallback?: boolean;
    fields?: boolean;
    joint?: boolean;
    strict?: boolean;
}
```

## Properties

- **changes?**: `object`  
  A specific set of proposed changes to validate, rather than the full source data of the model.

- **clean?**: `boolean`  
  If changes are provided, attempt to clean the changes before validating them? This option mutates the provided changes.

- **dropInvalidEmbedded?**: `boolean`  
  If true, invalid embedded documents will emit a warning and be placed in the invalidDocuments collection rather than causing the parent to be considered invalid. This option mutates the provided changes.

- **fallback?**: `boolean`  
  Allow replacement of invalid values with valid defaults? This option mutates the provided changes.

- **fields?**: `boolean`  
  Validate each individual field.

- **joint?**: `boolean`  
  Perform joint validation on the full data model? Joint validation will be performed by default if no changes are passed. Joint validation will be disabled by default if changes are passed. Joint validation can be performed on a complete set of changes (for example testing a complete data model) by explicitly passing true.

- **strict?**: `boolean`  
  Throw an error if validation fails.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)