# ContextMenuEntry | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ContextMenuEntry {
    callback: ContextMenuJQueryCallback;
    classes?: string;
    condition?: boolean | ContextMenuCondition;
    group?: string;
    icon?: string;
    name: string;
}
```

## Properties

### callback

**Type:** [`ContextMenuJQueryCallback`](https://foundryvtt.com/api/types/foundry.ContextMenuJQueryCallback.html)  
The function to call when the menu item is clicked.

### classes (Optional)

**Type:** `string`  
Additional CSS classes to apply to this menu item.

### condition (Optional)

**Type:** `boolean` | [`ContextMenuCondition`](https://foundryvtt.com/api/types/foundry.ContextMenuCondition.html)  
A function to call or boolean value to determine if this entry appears in the menu.

### group (Optional)

**Type:** `string`  
An identifier for a group this entry belongs to.

### icon (Optional)

**Type:** `string`  
A string containing an HTML icon element for the menu item.

### name

**Type:** `string`  
The context menu label. Can be localized.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)