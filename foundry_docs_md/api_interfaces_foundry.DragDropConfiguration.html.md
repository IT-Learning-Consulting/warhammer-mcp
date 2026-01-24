# DragDropConfiguration

```typescript
interface DragDropConfiguration {
    callbacks?: Record<
        | "dragstart"
        | "drop"
        | "dragover"
        | "dragenter"
        | "dragleave"
        | "dragend",
        (event: DragEvent) => void
    >;
    dragSelector?: null | string;
    dropSelector?: null | string;
    permissions?: Record<"dragstart" | "drop", (selector: string) => boolean>;
}
```

## Properties

### Optional

- **callbacks?**: `Record< "dragstart" | "drop" | "dragover" | "dragenter" | "dragleave" | "dragend", (event: DragEvent) => void >`  
  Callback functions for each action.

- **dragSelector?**: `null | string`  
  The CSS selector used to target draggable elements.

- **dropSelector?**: `null | string`  
  The CSS selector used to target viable drop targets.

- **permissions?**: `Record< "dragstart" | "drop", (selector: string) => boolean >`  
  Permission tests for each action.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Modules Documentation](https://foundryvtt.com/api/modules.html)  
[foundry Namespace](https://foundryvtt.com/api/modules/foundry.html)  
[DragDropConfiguration Interface](https://foundryvtt.com/api/interfaces/foundry.DragDropConfiguration.html)