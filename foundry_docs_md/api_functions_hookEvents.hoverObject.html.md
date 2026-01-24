# hoverObject | Foundry Virtual Tabletop - API Documentation - Version 13

### Function hoverObject

```typescript
hoverObject(object: PlaceableObject, hovered: boolean): void
```

A hook event that fires when a [foundry.canvas.placeables.PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) is hovered over or out. Substitute the PlaceableObject name in the hook event to target a specific PlaceableObject type, for example `"hoverToken"`.

#### Parameters

- **object**: _PlaceableObject_  
  The object instance.

- **hovered**: _boolean_  
  Whether the PlaceableObject is hovered over or not.

#### Returns

_void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)