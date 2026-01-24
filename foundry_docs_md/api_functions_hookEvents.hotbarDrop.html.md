# hotbarDrop | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `hotbarDrop`

```typescript
hotbarDrop(hotbar: Hotbar, data: object, slot: number): void
```

A hook event that fires whenever data is dropped into a Hotbar slot. The hook provides a reference to the Hotbar application, the dropped data, and the target slot. Default handling of the drop event can be prevented by returning `false` within the hooked function.

**Parameters**

- **hotbar**: [Hotbar](https://foundryvtt.com/api/classes/foundry.applications.ui.Hotbar.html)  
  The Hotbar application instance

- **data**: `object`  
  The dropped data object

- **slot**: `number`  
  The target hotbar slot

**Returns**  
`void`  

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)