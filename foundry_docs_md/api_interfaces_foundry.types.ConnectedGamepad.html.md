# ConnectedGamepad | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface ConnectedGamepad

Connected Gamepad info

```typescript
interface ConnectedGamepad {
    activeButtons: Set<string>;
    axes: Map<string, number>;
}
```

### Properties

- **activeButtons**: `Set<string>`  
  The Set of pressed Buttons

- **axes**: `Map<string, number>`  
  A map of axes values

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)