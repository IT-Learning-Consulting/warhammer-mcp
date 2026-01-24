# ActivityData

```typescript
interface ActivityData {
    active?: boolean;
    av?: AVSettingsData;
    cursor?: Point;
    ping?: PingData;
    ruler?: ElevatedPoint[];
    sceneId?: null | string;
    targets?: string[];
}
```

## Properties

- **active?**: `boolean`  
  Whether the user has an open WS connection to the server or not.

- **av?**: [`AVSettingsData`](https://foundryvtt.com/api/interfaces/foundry.AVSettingsData.html)  
  The state of the user's AV settings.

- **cursor?**: [`Point`](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
  The position of the user's cursor.

- **ping?**: [`PingData`](https://foundryvtt.com/api/interfaces/foundry.canvas.interaction.types.PingData.html)  
  Is the user emitting a ping at the cursor coordinates?

- **ruler?**: [`ElevatedPoint[]`](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
  The state of the user's ruler, if they are currently using one.

- **sceneId?**: `null | string`  
  The ID of the scene that the user is viewing.

- **targets?**: `string[]`  
  The IDs of the tokens the user has targeted in the currently viewed scene.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)