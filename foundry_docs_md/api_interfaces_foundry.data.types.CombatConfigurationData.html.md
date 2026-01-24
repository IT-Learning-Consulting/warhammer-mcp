# CombatConfigurationData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CombatConfigurationData {
    resource: string;
    skipDefeated: boolean;
    turnMarker: {
        animation: string;
        disposition: string;
        enabled: boolean;
        path: string;
    };
}
```

Default combat tracker settings used in Foundry VTT.

## Properties

- **resource**: *string*  
  A resource identifier for the tracker.

- **skipDefeated**: *boolean*  
  Whether to skip defeated tokens during combat.

- **turnMarker**:
  - **animation**: *string*  
    The identifier for the default turn marker animation.
  - **disposition**: *string*  
    Tint the turn marker according to token disposition.
  - **enabled**: *boolean*  
    Whether the turn marker is enabled.
  - **path**: *string*  
    The file path for the turn marker icon.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)