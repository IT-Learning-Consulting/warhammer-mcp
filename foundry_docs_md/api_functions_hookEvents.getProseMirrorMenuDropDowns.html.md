# getProseMirrorMenuDropDowns | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `getProseMirrorMenuDropDowns`

```typescript
getProseMirrorMenuDropDowns(
    menu: ProseMirrorMenu,
    config: {
        fonts: ProseMirrorDropDownConfig;
        format: ProseMirrorDropDownConfig;
    },
): void
```

A hook event that fires when a `ProseMirrorMenu`'s drop-downs are initialized. The hook provides the `ProseMirrorMenu` instance and an object of drop-down configuration data. Hooked functions may append their own drop-downs or append entries to existing drop-downs.

#### Parameters

- **menu**: [ProseMirrorMenu](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorMenu.html)  
  The `ProseMirrorMenu` instance.

- **config**:  
  An object containing drop-down config:
  - **fonts**: [ProseMirrorDropDownConfig](https://foundryvtt.com/api/interfaces/foundry.prosemirror.types.ProseMirrorDropDownConfig.html)
  - **format**: [ProseMirrorDropDownConfig](https://foundryvtt.com/api/interfaces/foundry.prosemirror.types.ProseMirrorDropDownConfig.html)

#### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)