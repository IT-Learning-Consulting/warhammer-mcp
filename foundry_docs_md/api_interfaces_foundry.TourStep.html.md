# TourStep

A step in a Tour

```typescript
interface TourStep {
    content: string;
    id: string;
    layer?: string;
    restricted?: boolean;
    selector?: string;
    sidebarTab?: string;
    title: string;
    tool?: string;
    tooltipDirection?: "UP" | "DOWN" | "LEFT" | "RIGHT" | "CENTER";
}
```

## Properties

### content

- **type:** `string`  
- Raw HTML content displayed during the step

### id

- **type:** `string`  
- A machine-friendly id of the Tour Step

### layer (Optional)

- **type:** `string`  
- Activates a particular canvas layer and its respective control group. Usable in `CanvasTour` instances.

### restricted (Optional)

- **type:** `boolean`  
- Whether the Step is restricted to the GM only. Defaults to false.

### selector (Optional)

- **type:** `string`  
- A DOM selector which denotes an element to highlight during this step. If omitted, the step is displayed in the center of the screen.

### sidebarTab (Optional)

- **type:** `string`  
- Activates a particular sidebar tab. Usable in `SidebarTour` instances.

### title

- **type:** `string`  
- The title of the step, displayed in the tooltip header

### tool (Optional)

- **type:** `string`  
- Activates a particular tool. Usable in `CanvasTour` instances.

### tooltipDirection (Optional)

- **type:** `"UP" | "DOWN" | "LEFT" | "RIGHT" | "CENTER"`  
- How the tooltip for the step should be displayed relative to the target element. If omitted, the best direction will be attempted to be auto-selected.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).