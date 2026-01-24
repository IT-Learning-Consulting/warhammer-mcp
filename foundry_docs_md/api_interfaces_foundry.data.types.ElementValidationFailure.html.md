# ElementValidationFailure

```typescript
interface ElementValidationFailure {
  failure: DataModelValidationFailure;
  id: string | number;
  name?: string;
}
```

## Properties

- **failure**: `DataModelValidationFailure`  
  The element's validation failure.

- **id**: `string | number`  
  Either the element's index or some other identifier for it.

- **name** *(optional)*: `string`  
  Optionally a user-friendly name for the element.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)