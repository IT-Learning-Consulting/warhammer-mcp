# EnrichmentOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface EnrichmentOptions {
    custom?: boolean;
    documents?: boolean;
    embeds?: boolean;
    links?: boolean;
    relativeTo?: any;
    rollData?: object | Function;
    rolls?: boolean;
    secrets?: boolean;
}
```

## Properties

- **custom?**: `boolean`  
  Apply custom enrichers?

- **documents?**: `boolean`  
  Replace dynamic document links?

- **embeds?**: `boolean`  
  Replace embedded content?

- **links?**: `boolean`  
  Replace hyperlink content?

- **relativeTo?**: `any`  
  A document to resolve relative UUIDs against.

- **rollData?**: `object | Function`  
  The data object providing context for inline rolls, or a function that produces it.

- **rolls?**: `boolean`  
  Replace inline dice rolls?

- **secrets?**: `boolean`  
  Include unrevealed secret tags in the final HTML? If false, unrevealed secret blocks will be removed.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Foundry Virtual Tabletop - API Documentation - Version 13 / foundry / EnrichmentOptions](https://foundryvtt.com/api/interfaces/foundry.EnrichmentOptions.html)