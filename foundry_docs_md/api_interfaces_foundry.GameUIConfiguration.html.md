# GameUIConfiguration

```typescript
interface GameUIConfiguration {
    chatNotifications: "cards" | "pip";
    colorScheme: {
        applications: "" | "dark" | "light";
        interface: "" | "dark" | "light";
    };
    fade: { opacity: number; speed: number };
    fontScale: number;
    uiScale: number;
}
```

## Properties

- **chatNotifications**: `"cards"` | `"pip"`  
  Specifies the style of chat notifications.

- **colorScheme**:  
  Defines the color schemes used in the UI.
  - **applications**: `""` | `"dark"` | `"light"`  
    Color scheme for applications.
  - **interface**: `""` | `"dark"` | `"light"`  
    Color scheme for the interface.

- **fade**:  
  Controls fade effects.
  - **opacity**: `number`  
    The opacity value of the fade.
  - **speed**: `number`  
    The speed of the fade effect.

- **fontScale**: `number`  
  The scale factor for fonts.

- **uiScale**: `number`  
  The scale factor for the UI.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)