# SceneControlTool | Foundry Virtual Tabletop - API Documentation - Version 13

The data structure for a single tool in the [SceneControl#tools](https://foundryvtt.com/api/interfaces/foundry.SceneControl.html#tools) record.

```typescript
interface SceneControlTool {
    active?: boolean;
    button?: boolean;
    icon: string;
    name: string;
    onChange?: (event: Event, active: boolean) => void;
    order: number;
    title: string;
    toggle?: boolean;
    toolclip?: ToolclipConfiguration;
    visible?: boolean;
}
```

## Properties

- **active?**: `boolean`  
  Optional.  

- **button?**: `boolean`  
  Optional.  

- **icon**: `string`  

- **name**: `string`  

- **onChange?**: `(event: Event, active: boolean) => void`  
  Optional. A callback invoked when the tool is activated or deactivated.  

- **order**: `number`  

- **title**: `string`  

- **toggle?**: `boolean`  
  Optional.  

- **toolclip?**: [`ToolclipConfiguration`](https://foundryvtt.com/api/interfaces/foundry.ToolclipConfiguration.html)  
  Optional. Configuration for rendering the tool's toolclip.  

- **visible?**: `boolean`  
  Optional.  

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)