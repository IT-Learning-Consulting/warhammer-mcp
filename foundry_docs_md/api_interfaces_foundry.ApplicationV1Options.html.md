# ApplicationV1Options | Foundry Virtual Tabletop - API Documentation - Version 13

Configuration options which control how the application is rendered. Application subclasses may add additional supported options, but these base configurations are supported for all Applications. The values passed to the constructor are combined with the defaultOptions defined at the class level.

```typescript
interface ApplicationV1Options {
    baseApplication?: null | string;
    classes?: string[];
    dragDrop: DragDropConfiguration[];
    filters: SearchFilterConfiguration[];
    height?: null | string | number;
    id?: string;
    left?: null | number;
    minimizable?: boolean;
    popOut?: boolean;
    resizable?: boolean;
    scale?: null | number;
    scrollY?: string[];
    tabs?: TabsConfiguration[];
    template?: null | string;
    title?: string;
    top?: null | number;
    width?: null | number;
}
```

## Properties

### **baseApplication?**
- Type: `null | string`  
A named "base application" which generates an additional hook.

### **classes?**
- Type: `string[]`  
An array of CSS string classes to apply to the rendered HTML.

### **dragDrop**
- Type: [`DragDropConfiguration`](https://foundryvtt.com/api/interfaces/foundry.DragDropConfiguration.html)[]  
An array of CSS selectors for configuring the application's [foundry.applications.ux.DragDrop](https://foundryvtt.com/api/classes/foundry.applications.ux.DragDrop.html) behaviour.

### **filters**
- Type: [`SearchFilterConfiguration`](https://foundryvtt.com/api/interfaces/foundry.SearchFilterConfiguration.html)[]  
An array of [foundry.applications.ux.SearchFilter configuration objects](https://foundryvtt.com/api/classes/foundry.applications.ux.SearchFilter.html).

### **height?**
- Type: `null | string | number`  
The default pixel height for the rendered HTML.

### **id?**
- Type: `string`  
The default CSS id to assign to the rendered HTML.

### **left?**
- Type: `null | number`  
The default offset-left position for the rendered HTML.

### **minimizable?**
- Type: `boolean`  
Whether the rendered application can be minimized (popOut only).

### **popOut?**
- Type: `boolean`  
Whether to display the application as a pop-out container.

### **resizable?**
- Type: `boolean`  
Whether the rendered application can be drag-resized (popOut only).

### **scale?**
- Type: `null | number`  
A transformation scale for the rendered HTML.

### **scrollY?**
- Type: `string[]`  
A list of unique CSS selectors which target containers that should have their vertical scroll positions preserved during a re-render.

### **tabs?**
- Type: [`TabsConfiguration`](https://foundryvtt.com/api/interfaces/foundry.TabsConfiguration.html)[]  
An array of tabbed container configurations which should be enabled for the application.

### **template?**
- Type: `null | string`  
The default HTML template path to render for this Application.

### **title?**
- Type: `string`  
A default window title string (popOut only).

### **top?**
- Type: `null | number`  
The default offset-top position for the rendered HTML.

### **width?**
- Type: `null | number`  
The default pixel width for the rendered HTML.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)