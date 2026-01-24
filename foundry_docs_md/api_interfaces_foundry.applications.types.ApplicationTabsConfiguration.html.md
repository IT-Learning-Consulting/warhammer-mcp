# ApplicationTabsConfiguration

An interface representing the configuration for application tabs.

```typescript
interface ApplicationTabsConfiguration {
  /**
   * The tab in this group that will be active on first render
   */
  initial?: string;

  /**
   * A localization path prefix for all tabs in the group: if set, a label is generated for each tab
   * using a full path of `${labelPrefix}.${tabId}`.
   */
  labelPrefix?: string;

  /**
   * An array of tab configuration data
   */
  tabs: {
    /**
     * The icon associated with the tab (optional)
     */
    icon?: string;

    /**
     * The unique identifier for the tab
     */
    id: string;

    /**
     * The label for the tab (optional)
     */
    label?: string;

    /**
     * The tooltip text for the tab (optional)
     */
    tooltip?: string;
  }[];
}
```

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)