# TextEditorEnricherConfig

Foundry Virtual Tabletop - API Documentation - Version 13  
[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [CONFIG](https://foundryvtt.com/api/modules/CONFIG.html) / [TextEditorEnricherConfig](https://foundryvtt.com/api/interfaces/CONFIG.TextEditorEnricherConfig.html)

```typescript
interface TextEditorEnricherConfig {
    enricher: TextEditorEnricher;
    id?: string;
    onRender?: (arg0: HTMLEnrichedContentElement) => any;
    pattern: RegExp;
    replaceParent?: boolean;
}
```

## Properties

### enricher
- **Type:** [TextEditorEnricher](https://foundryvtt.com/api/types/CONFIG.TextEditorEnricher.html)  
- **Description:**  
  The function that will be called on each match. It is expected that this returns an HTML element to be inserted into the final enriched content.

### id (optional)
- **Type:** `string`  
- **Description:**  
  A unique ID to assign to the enricher type. Required if you want to use the `onRender` callback.

### onRender (optional)
- **Type:** `(arg0: HTMLEnrichedContentElement) => any`  
- **Description:**  
  An optional callback that is invoked when the enriched content is added to the DOM.

### pattern
- **Type:** `RegExp`  
- **Description:**  
  The string pattern to match. Must be flagged as global.

### replaceParent (optional)
- **Type:** `boolean`  
- **Description:**  
  Hoist the replacement element out of its containing element if it replaces the entire contents of the element.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)