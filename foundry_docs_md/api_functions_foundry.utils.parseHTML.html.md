# parseHTML | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
parseHTML(htmlString: string): HTMLElement | HTMLCollection
```

Parse an HTML string, returning a processed `HTMLElement` or `HTMLCollection`. A single `HTMLElement` is returned if the provided string contains only a single top-level element. An `HTMLCollection` is returned if the provided string contains multiple top-level elements.

**Parameters**

- **htmlString**: `string` — The HTML string to parse.

**Returns**

`HTMLElement | HTMLCollection`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)