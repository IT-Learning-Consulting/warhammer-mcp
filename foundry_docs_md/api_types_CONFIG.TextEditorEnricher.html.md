# TextEditorEnricher | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
type TextEditorEnricher = (
  match: RegExpMatchArray,
  options?: EnrichmentOptions,
) => Promise<HTMLElement | null>;
```

**Type declaration**

```typescript
(
  match: RegExpMatchArray,
  options?: EnrichmentOptions,
) => Promise<HTMLElement | null>
```

**Parameters**

- **match**: `RegExpMatchArray`  
  The regular expression match result

- **options**: `EnrichmentOptions` *(Optional)*  
  Options provided to customize text enrichment

**Returns**  
`Promise<HTMLElement | null>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)