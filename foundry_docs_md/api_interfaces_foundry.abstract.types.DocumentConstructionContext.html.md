# DocumentConstructionContext

```typescript
interface DocumentConstructionContext {
  pack?: null | string;
  parent?: null | Document<object, DocumentConstructionContext>;
  strict?: boolean;
}
```

## Properties

- **pack?**: `null | string`  
  The compendium collection ID which contains this Document, if any.

- **parent?**: `null | Document<object, DocumentConstructionContext>`  
  The parent Document of this one, if this one is embedded.

- **strict?**: `boolean`  
  Whether to validate initial data strictly?

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)