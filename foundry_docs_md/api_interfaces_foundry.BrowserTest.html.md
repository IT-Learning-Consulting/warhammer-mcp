# BrowserTest | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface BrowserTest {
    match: RegExp;
    message: string;
    minimum: number;
}
```

## Properties

### match

- **Type:** `RegExp`
- **Description:** A regular expression to match the browser against the user agent string.

### message

- **Type:** `string`
- **Description:** A message to display if the user's browser version does not meet the minimum.

### minimum

- **Type:** `number`
- **Description:** The minimum supported version for this browser.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)