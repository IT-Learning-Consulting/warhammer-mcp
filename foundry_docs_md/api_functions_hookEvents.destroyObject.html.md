# destroyObject | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
destroyObject(object: PlaceableObject): void
```

A hook event that fires when a [foundry.canvas.placeables.PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) is destroyed. The dispatched event name replaces "Object" with the named PlaceableObject subclass, i.e. "destroyToken".

**Parameters**

- **object**: [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)  
  The object instance being destroyed

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)