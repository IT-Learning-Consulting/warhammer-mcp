# PlaceablesLayerOptions

```typescript
interface PlaceablesLayerOptions {
    confirmDeleteKey: boolean;
    controllableObjects: boolean;
    objectClass: PlaceableObject;
    quadtree: boolean;
    rotatableObjects: boolean;
}
```

## Properties

- **confirmDeleteKey**: _boolean_  
  Confirm placeable object deletion with a dialog?

- **controllableObjects**: _boolean_  
  Can placeable objects in this layer be controlled?

- **objectClass**: [_PlaceableObject_](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)  
  The class used to represent an object on this layer.

- **quadtree**: _boolean_  
  Does this layer use a quadtree to track object positions?

- **rotatableObjects**: _boolean_  
  Can placeable objects in this layer be rotated?

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)