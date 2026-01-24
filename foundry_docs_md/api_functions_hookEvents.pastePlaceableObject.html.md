# pastePlaceableObject | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `pastePlaceableObject`

```typescript
pastePlaceableObject(
    objects: PlaceableObject[],
    data: object[],
    options: { cut: boolean },
): void
```

A hook event that fires when any `PlaceableObject` is pasted onto the Scene. Substitute the `"PlaceableObject"` in the hook event to target a specific `PlaceableObject` type, for example `"pasteToken"`.

#### Parameters

- **objects**: `PlaceableObject[]`  
  The objects that were copied or cut

- **data**: `object[]`  
  The create data if copied, or the update data if cut

- **options**: `{ cut: boolean }`  
  Additional options  
  - **cut**: `boolean`  
    Were the objects cut instead of copied?

#### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)