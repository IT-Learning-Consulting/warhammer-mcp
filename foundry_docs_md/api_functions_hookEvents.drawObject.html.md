# drawObject | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `drawObject`

```typescript
drawObject(object: PlaceableObject): void
```

A hook event that fires when a [foundry.canvas.placeables.PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) is initially drawn.  
The dispatched event name replaces "Object" with the named PlaceableObject subclass, i.e. "drawToken".

**Parameters**

- **object**: [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)  
  The object instance being drawn

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)