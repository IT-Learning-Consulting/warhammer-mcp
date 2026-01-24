# PlaylistDirectoryVolumeContext | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface PlaylistDirectoryVolumeContext {
    aria: Record<string, string>;
    dataset: Record<string, string>;
    field: NumberField;
    modifier: number;
    name?: string;
}
```

## Properties

### **aria**

- **Type**: `Record<string, string>`

HTML ARIA attributes.

### **dataset**

- **Type**: `Record<string, string>`

HTML dataset attributes.

### **field**

- **Type**: [`NumberField`](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html)

The DataField specification for the form input.

### **modifier**

- **Type**: `number`

The volume modifier in the interval `[0, 1]`.

### **name** (Optional)

- **Type**: `string`

The form input name.