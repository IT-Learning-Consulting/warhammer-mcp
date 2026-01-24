# ApplicationRenderOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ApplicationRenderOptions {
    force?: boolean;
    isFirstRender?: boolean;
    parts?: string[];
    position?: ApplicationPosition;
    window?: ApplicationWindowRenderOptions;
}
```

## Properties

### **force?**: `boolean`

Force application rendering. If true, an application which does not yet exist in the DOM is added. If false, only applications which already exist are rendered.

---

### **isFirstRender?**: `boolean`

Is this render the first one for the application? This property is populated automatically.

---

### **parts?**: `string[]`

Some Application classes, for example the HandlebarsApplication, support re-rendering a subset of application parts instead of the full Application HTML.

---

### **position?**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)

A specific position at which to render the Application.

---

### **window?**: [ApplicationWindowRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationWindowRenderOptions.html)

Updates to the Application window frame.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)