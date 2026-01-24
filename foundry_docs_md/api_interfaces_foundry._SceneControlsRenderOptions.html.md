# _SceneControlsRenderOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface _SceneControlsRenderOptions {
    control?: string;
    event?: Event;
    reset?: boolean;
    toggles?: Record<string, boolean>;
    tool?: string;
}
```

## Properties

### **control?**  
*Type:* `string`  
The control set to activate. If undefined, the current control set remains active.

### **event?**  
*Type:* `Event`  
An event which prompted a re-render.

### **reset?**  
*Type:* `boolean`  
Re-prepare the possible list of controls.

### **toggles?**  
*Type:* `Record<string, boolean>`  
Changes to apply to toggles within the control set.

### **tool?**  
*Type:* `string`  
A specific tool to activate. If undefined, the current tool or default tool for the control set becomes active.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)