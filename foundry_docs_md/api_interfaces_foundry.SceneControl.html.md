# SceneControl

The data structure for a set of controls in the [SceneControls#controls](https://foundryvtt.com/api/classes/foundry.applications.ui.SceneControls.html#controls) record.

```typescript
interface SceneControl {
    activeTool: string;
    icon: string;
    name: string;
    onChange?: (event: Event, active: boolean) => void;
    onToolChange?: (event: Event, tool: SceneControlTool) => void;
    order: number;
    title: string;
    tools: Record<string, SceneControlTool>;
    visible?: boolean;
}
```

## Properties

- **activeTool**: `string`

- **icon**: `string`

- **name**: `string`

- **onChange?**: `(event: Event, active: boolean) => void`  
  A callback invoked when control set is activated or deactivated.

- **onToolChange?**: `(event: Event, tool: SceneControlTool) => void`  
  A callback invoked when the active tool changes.

- **order**: `number`

- **title**: `string`

- **tools**: `Record<string, SceneControlTool>`

- **visible?**: `boolean`

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).