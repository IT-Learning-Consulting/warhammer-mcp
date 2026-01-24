# SearchFilterConfiguration

Options which customize the behavior of the filter.

```typescript
interface SearchFilterConfiguration {
    callback: SearchFilterCallback;
    contentSelector: string;
    delay?: number;
    initial?: string;
    inputSelector: string;
}
```

## Properties

- **callback**: `SearchFilterCallback`  
  A callback function which executes when the filter changes.  
  [More info](https://foundryvtt.com/api/types/foundry.SearchFilterCallback.html)

- **contentSelector**: `string`  
  The CSS selector used to target the content container for these tabs.

- **delay** (optional): `number`  
  The number of milliseconds to wait for text input before processing. Default: 200.

- **initial** (optional): `string`  
  The initial value of the search query.

- **inputSelector**: `string`  
  The CSS selector used to target the text input element.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)