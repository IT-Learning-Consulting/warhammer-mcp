# DialogV2Button | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DialogV2Button {
    action: string;
    callback?: DialogV2ButtonCallback;
    class?: string;
    default?: boolean;
    disabled?: boolean;
    icon?: string;
    label: string;
    style?: Record<string, string>;
    type?: string;
}
```

## Properties

### **action**  
Type: `string`  
The button action identifier.

### **callback** (optional)  
Type: [DialogV2ButtonCallback](https://foundryvtt.com/api/types/foundry.DialogV2ButtonCallback.html)  
A function to invoke when the button is clicked. The value returned from this function will be used as the dialog's submitted value. Otherwise, the button's identifier is used.

### **class** (optional)  
Type: `string`  
CSS classes to apply to the button.

### **default** (optional)  
Type: `boolean`  
Whether this button represents the default action to take if the user submits the form without pressing a button, i.e. with an Enter keypress.

### **disabled** (optional)  
Type: `boolean`  
Whether the button is disabled.

### **icon** (optional)  
Type: `string`  
FontAwesome icon classes.

### **label**  
Type: `string`  
The button label. Will be localized.

### **style** (optional)  
Type: `Record<string, string>`  
CSS style to apply to the button.

### **type** (optional)  
Type: `string`  
The button type.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).