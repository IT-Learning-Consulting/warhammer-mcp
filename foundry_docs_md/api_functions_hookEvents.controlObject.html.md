# controlObject | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `controlObject`

```typescript
controlObject(object: PlaceableObject, controlled: boolean): void
```

A hook event that fires when a [foundry.canvas.placeables.PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) is selected or deselected. Substitute the PlaceableObject name in the hook event to target a specific PlaceableObject type, for example `"controlToken"`.

**Parameters**

- **object**: [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)  
  The object instance which is selected/deselected.

- **controlled**: `boolean`  
  Whether the PlaceableObject is selected or not.

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)