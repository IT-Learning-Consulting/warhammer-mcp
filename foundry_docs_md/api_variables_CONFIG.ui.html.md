# ui | Foundry Virtual Tabletop - API Documentation - Version 13

## Variable `ui` Const

```typescript
ui: {
    actors: typeof ActorDirectory;
    cards: typeof CardsDirectory;
    chat: typeof ChatLog;
    combat: typeof CombatTracker;
    compendium: typeof CompendiumDirectory;
    controls: typeof SceneControls;
    hotbar: typeof Hotbar;
    items: typeof ItemDirectory;
    journal: typeof JournalDirectory;
    macros: typeof MacroDirectory;
    menu: typeof MainMenu;
    nav: typeof SceneNavigation;
    notifications: typeof Notifications;
    pause: typeof GamePause;
    players: typeof Players;
    playlists: typeof PlaylistDirectory;
    scenes: typeof SceneDirectory;
    settings: typeof Settings;
    sidebar: typeof Sidebar;
    tables: typeof RollTableDirectory;
    webrtc: typeof CameraViews;
} = ...
```

Configure the Application classes used to render various core UI elements in the application.  
The order of this object is relevant, as certain classes need to be constructed and referenced before others.

### Type declaration

- **actors**: typeof [ActorDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ActorDirectory.html)
- **cards**: typeof [CardsDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CardsDirectory.html)
- **chat**: typeof [ChatLog](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ChatLog.html)
- **combat**: typeof [CombatTracker](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CombatTracker.html)
- **compendium**: typeof [CompendiumDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CompendiumDirectory.html)
- **controls**: typeof [SceneControls](https://foundryvtt.com/api/classes/foundry.applications.ui.SceneControls.html)
- **hotbar**: typeof [Hotbar](https://foundryvtt.com/api/classes/foundry.applications.ui.Hotbar.html)
- **items**: typeof [ItemDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ItemDirectory.html)
- **journal**: typeof [JournalDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.JournalDirectory.html)
- **macros**: typeof [MacroDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.MacroDirectory.html)
- **menu**: typeof [MainMenu](https://foundryvtt.com/api/classes/foundry.applications.ui.MainMenu.html)
- **nav**: typeof [SceneNavigation](https://foundryvtt.com/api/classes/foundry.applications.ui.SceneNavigation.html)
- **notifications**: typeof [Notifications](https://foundryvtt.com/api/classes/foundry.applications.ui.Notifications.html)
- **pause**: typeof [GamePause](https://foundryvtt.com/api/classes/foundry.applications.ui.GamePause.html)
- **players**: typeof [Players](https://foundryvtt.com/api/classes/foundry.applications.ui.Players.html)
- **playlists**: typeof [PlaylistDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.PlaylistDirectory.html)
- **scenes**: typeof [SceneDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.SceneDirectory.html)
- **settings**: typeof [Settings](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.Settings.html)
- **sidebar**: typeof [Sidebar](https://foundryvtt.com/api/classes/foundry.applications.sidebar.Sidebar.html)
- **tables**: typeof [RollTableDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.RollTableDirectory.html)
- **webrtc**: typeof [CameraViews](https://foundryvtt.com/api/classes/foundry.applications.apps.av.CameraViews.html)

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)