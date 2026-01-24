# DraggableResizeOptions

Interface **DraggableResizeOptions** defines options for draggable resize functionality.

```typescript
interface DraggableResizeOptions {
    resizeX?: boolean;
    resizeY?: boolean;
    rtl?: boolean;
    selector?: string;
}
```

## Properties

- **resizeX?**: `boolean`  
  Enable resizing along the X axis.

- **resizeY?**: `boolean`  
  Enable resizing along the Y axis.

- **rtl?**: `boolean`  
  Modify the resizing direction to be right-to-left.

- **selector?**: `string`  
  A CSS selector for the resize handle.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).