# TabsConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TabsConfiguration {
    callback?: null | Function;
    contentSelector: string;
    group?: string;
    initial: string;
    navSelector: string;
}
```

## Properties

### **callback?**
- Type: `null | Function`  
An optional callback function that executes when the active tab is changed.

### **contentSelector**
- Type: `string`  
The CSS selector used to target the content container for these tabs.

### **group?**
- Type: `string`  
The name of the tabs group.

### **initial**
- Type: `string`  
The tab name of the initially active tab.

### **navSelector**
- Type: `string`  
The CSS selector used to target the navigation element for these tabs.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)