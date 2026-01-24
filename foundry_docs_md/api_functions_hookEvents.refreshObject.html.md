# refreshObject

## Function refreshObject

```typescript
refreshObject(object: PlaceableObject): void
```

A hook event that fires when a [foundry.canvas.placeables.PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) is incrementally refreshed. The dispatched event name replaces "Object" with the named PlaceableObject subclass, i.e. "refreshToken".

### Parameters

- **object**: _PlaceableObject_  
  The object instance being refreshed

### Returns

_void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)