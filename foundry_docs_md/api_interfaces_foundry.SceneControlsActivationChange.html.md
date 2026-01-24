# SceneControlsActivationChange | Foundry Virtual Tabletop - API Documentation - Version 13

The data structure provided to the [SceneControl#onChange callback](https://foundryvtt.com/api/interfaces/foundry.SceneControl.html#onchange).

```typescript
interface SceneControlsActivationChange {
    controlChange: string;
    event: Event;
    toggleChanges: Record<string, boolean>;
    toolChange: string;
}
```

## Properties

- **controlChange**: `string`
- **event**: `Event`
- **toggleChanges**: `Record<string, boolean>`
- **toolChange**: `string`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)