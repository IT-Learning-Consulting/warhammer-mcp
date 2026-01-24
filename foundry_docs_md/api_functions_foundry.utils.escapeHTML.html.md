# escapeHTML | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `escapeHTML`

```typescript
escapeHTML(value: any): string
```

Escape the given unescaped string.

Escaped strings are safe to use inside inner HTML of most tags and in most quoted HTML attributes. They are **not** safe to use in `<script>` tags, unquoted attributes, `href`, `onmouseover`, and similar contexts. They must be unescaped first if they are used inside a context that would escape them.

Handles only `&`, `<`, `>`, `"`, and `'`.

#### Parameters

- **value**: `any`  
  An unescaped string

#### Returns

- `string`  
  The escaped string

#### See also

- [foundry.utils.unescapeHTML](https://foundryvtt.com/api/functions/foundry.utils.unescapeHTML.html)

[**Foundry Virtual Tabletop - API Documentation - Version 13**](https://foundryvtt.com/api/index.html)