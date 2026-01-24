# ContextMenuOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ContextMenuOptions {
  eventName?: string;
  fixed?: boolean;
  jQuery?: boolean;
  onClose?: ContextMenuCallback;
  onOpen?: ContextMenuCallback;
}
```

## Properties

### **eventName?**: *string*

Optionally override the triggering event which can spawn the menu. If the menu is using fixed positioning, this event must be a `MouseEvent`.

---

### **fixed?**: *boolean*

If true, the context menu is given a fixed position rather than being injected into the target.

---

### **jQuery?**: *boolean*

If true, callbacks will be passed jQuery objects instead of `HTMLElement` instances.

---

### **onClose?**: [ContextMenuCallback](https://foundryvtt.com/api/types/foundry.ContextMenuCallback.html)

A function to call when the context menu is closed.

---

### **onOpen?**: [ContextMenuCallback](https://foundryvtt.com/api/types/foundry.ContextMenuCallback.html)

A function to call when the context menu is opened.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)