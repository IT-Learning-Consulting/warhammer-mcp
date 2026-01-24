# DataFieldValidationOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DataFieldValidationOptions {
    dropInvalidEmbedded?: boolean;
    fallback?: boolean;
    partial?: boolean;
    source?: object;
}
```

## Properties

### Optional

#### **dropInvalidEmbedded**?: `boolean`
If true, invalid embedded documents will emit a warning and be placed in the invalidDocuments collection rather than causing the parent to be considered invalid.

#### **fallback**?: `boolean`
Whether to allow replacing invalid values with valid fallbacks.

#### **partial**?: `boolean`
Whether this is a partial schema validation, or a complete one.

#### **source**?: `object`
The full source object being evaluated.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)