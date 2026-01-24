# _DocumentDirectoryConfiguration

```typescript
interface _DocumentDirectoryConfiguration {
    collection: DirectoryCollection;
    renderUpdateKeys: string[];
}
```

## Properties

### collection

- **Type:** `DirectoryCollection`  
- **Description:**  
  The Document collection that this directory represents.

### renderUpdateKeys

- **Type:** `string[]`  
- **Description:**  
  Updating one of these properties of a displayed Document will trigger a re-render of the tab.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).