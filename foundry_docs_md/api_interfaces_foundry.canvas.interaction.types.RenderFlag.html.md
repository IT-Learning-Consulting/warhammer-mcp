# RenderFlag

```typescript
interface RenderFlag {
    deprecated?: object;
    propagate?: string[];
    reset?: string[];
}
```

## Properties

### **deprecated?**  
*Type:* `object`  
Is this flag deprecated? The deprecation options are passed to `logCompatibilityWarning`. The deprecation message is auto-generated unless a `message` is passed with the options. By default, the message is logged only once.

### **propagate?**  
*Type:* `string[]`  
Activating this flag also sets these flags to `true`.

### **reset?**  
*Type:* `string[]`  
Activating this flag resets these flags to `false`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)