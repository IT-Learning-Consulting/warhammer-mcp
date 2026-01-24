# DataFieldValidator | Foundry Virtual Tabletop - API Documentation - Version 13

## Type Alias DataFieldValidator

```typescript
(value: any, options: DataFieldValidationOptions) => boolean | void
```

A Custom DataField validator function.

- A **boolean** return value indicates that the value is valid (**true**) or invalid (**false**) with certainty.
- With an explicit boolean return value, no further validation functions will be evaluated.
- An **undefined** return indicates that the value may be valid but further validation functions should be performed, if defined.
- An **Error** may be thrown which provides a custom error message explaining the reason the value is invalid.

### Parameters

- **value**: `any`  
  The value provided for validation

- **options**: [`DataFieldValidationOptions`](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldValidationOptions.html)  
  Validation options

### Returns

- `boolean` | `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)