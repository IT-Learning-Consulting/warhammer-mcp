# getProseMirrorMenuItems | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
getProseMirrorMenuItems(
    menu: ProseMirrorMenu,
    config: ProseMirrorMenuItem[],
): void
```

A hook event that fires when a ProseMirrorMenu's buttons are initialized. The hook provides the ProseMirrorMenu instance and an array of button configuration data. Hooked functions may append their own buttons to the list.

**Parameters**

- **menu**: [ProseMirrorMenu](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorMenu.html)  
  The ProseMirrorMenu instance.

- **config**: [ProseMirrorMenuItem](https://foundryvtt.com/api/interfaces/foundry.prosemirror.types.ProseMirrorMenuItem.html)[]  
  The button configuration objects.

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)