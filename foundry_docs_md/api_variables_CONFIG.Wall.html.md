# Wall | Foundry Virtual Tabletop - API Documentation - Version 13

**Wall**:  
```typescript
{
  animationTypes: Record<string, WallDoorAnimationConfig>;
  documentClass: typeof WallDocument;
  doorSounds: Record<string, WallDoorSound>;
  layerClass: typeof WallsLayer;
  objectClass: typeof canvas.placeables.Wall;
  thresholdAttenuationMultiplier: number;
} = ...
```

Configuration for the Wall embedded document type and its representation on the game Canvas.

## Properties

- **animationTypes**: `Record<string, WallDoorAnimationConfig>`  
  The set of animation types that are supported for Wall door animations.  
  See [WallDoorAnimationConfig](https://foundryvtt.com/api/interfaces/foundry.WallDoorAnimationConfig.html)

- **documentClass**: `typeof WallDocument`  
  The Wall Document class.  
  See [WallDocument](https://foundryvtt.com/api/classes/foundry.documents.WallDocument.html)

- **doorSounds**: `Record<string, WallDoorSound>`  
  Record of door sounds available for walls.  
  See [WallDoorSound](https://foundryvtt.com/api/interfaces/CONFIG.WallDoorSound.html)

- **layerClass**: `typeof WallsLayer`  
  The canvas Layer class responsible for rendering walls.  
  See [WallsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.WallsLayer.html)

- **objectClass**: `typeof canvas.placeables.Wall`  
  The Wall Placeable Object class used on the canvas.  
  See [Wall](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Wall.html)

- **thresholdAttenuationMultiplier**: `number`  
  A numeric multiplier that affects sound attenuation thresholds on walls.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)