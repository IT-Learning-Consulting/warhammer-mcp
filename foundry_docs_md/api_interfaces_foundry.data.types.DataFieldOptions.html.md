# DataFieldOptions

```typescript
interface DataFieldOptions {
    gmOnly?: boolean;
    hint?: string;
    initial?: any;
    label?: string;
    nullable?: boolean;
    required?: boolean;
    validate?: DataFieldValidator;
    validationError?: string;
}
```

## Properties

- **gmOnly?**: `boolean`  
  Can this field only be modified by a gamemaster or assistant gamemaster?

- **hint?**: `string`  
  Localizable help text displayed on forms which render this field.

- **initial?**: `any`  
  The initial value of a field, or a function which assigns that initial value.

- **label?**: `string`  
  A localizable label displayed on forms which render this field.

- **nullable?**: `boolean`  
  Can this field have null values?

- **required?**: `boolean`  
  Is this field required to be populated?

- **validate?**: [`DataFieldValidator`](https://foundryvtt.com/api/types/foundry.data.types.DataFieldValidator.html)  
  A custom data field validation function.

- **validationError?**: `string`  
  A custom validation error string. When displayed will be prepended with the document name, field name, and candidate value.  
  This error string is only used when the return type of the validate function is a boolean.  
  If an Error is thrown in the validate function, the string message of that Error is used.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)