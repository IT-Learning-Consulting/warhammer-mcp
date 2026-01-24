# FieldFilter

```typescript
interface FieldFilter {
    field: string;
    negate: boolean;
    operator?: string;
    value: any;
}
```

## Properties

- **field**: `string`  
  The dot-delimited path to the field being filtered

- **negate**: `boolean`  
  Negate the filter, returning results which do NOT match the filter criteria

- **operator**?: `string`  
  The search operator, from [CONST.OPERATORS](https://foundryvtt.com/api/index.html)

- **value**: `any`  
  The value against which to test

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)