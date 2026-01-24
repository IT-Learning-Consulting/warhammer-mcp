# getPlaceableObjectClass | Foundry Virtual Tabletop - API Documentation - Version 13

### Function getPlaceableObjectClass

```typescript
getPlaceableObjectClass(
    documentName: string,
): undefined | typeof PlaceableObject
```

Return a reference to the PlaceableObject class implementation which is configured for use.

**Parameters**

- **documentName**: *string*  
  The canonical Document name, for example "Actor"

**Returns**  
*undefined* | *typeof* [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)  
The configured PlaceableObject class implementation

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)