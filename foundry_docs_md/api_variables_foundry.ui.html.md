# ui | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
const ui: {
  activeWindow:
    | null
    | Application
    | ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>;
  controls: SceneControls;
  hotbar: Hotbar;
  menu: MainMenu;
  nav: SceneNavigation;
  notifications: Notifications;
  pause: GamePause;
  players: Players;
  sidebar: Sidebar;
  windows: Record<string, Application>;
} = ...
```

A collection of application instances

### Type declaration

- **activeWindow**:
  - `null`
  - [`Application`](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html)
  - [`ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>`](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)
- **controls**: [`SceneControls`](https://foundryvtt.com/api/classes/foundry.applications.ui.SceneControls.html)
- **hotbar**: [`Hotbar`](https://foundryvtt.com/api/classes/foundry.applications.ui.Hotbar.html)
- **menu**: [`MainMenu`](https://foundryvtt.com/api/classes/foundry.applications.ui.MainMenu.html)
- **nav**: [`SceneNavigation`](https://foundryvtt.com/api/classes/foundry.applications.ui.SceneNavigation.html)
- **notifications**: [`Notifications`](https://foundryvtt.com/api/classes/foundry.applications.ui.Notifications.html)
- **pause**: [`GamePause`](https://foundryvtt.com/api/classes/foundry.applications.ui.GamePause.html)
- **players**: [`Players`](https://foundryvtt.com/api/classes/foundry.applications.ui.Players.html)
- **sidebar**: [`Sidebar`](https://foundryvtt.com/api/classes/foundry.applications.sidebar.Sidebar.html)
- **windows**: `Record<string, Application>` ([Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html))

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)