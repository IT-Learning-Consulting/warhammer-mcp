# DataModelConstructionContext | Foundry Virtual Tabletop - API Documentation - Version 13

**Type Alias** `DataModelConstructionContext`

```typescript
type DataModelConstructionContext = DataModelConstructionOptions & Pick<
  DataModelValidationOptions,
  "strict" | "fallback" | "dropInvalidEmbedded"
>;
```

- **DataModelConstructionContext** combines the properties of [DataModelConstructionOptions](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelConstructionOptions.html) and a selection (`Pick`) of the properties `"strict"`, `"fallback"`, and `"dropInvalidEmbedded"` from [DataModelValidationOptions](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html).

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)