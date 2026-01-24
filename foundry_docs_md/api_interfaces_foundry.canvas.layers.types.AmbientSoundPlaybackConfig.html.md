# AmbientSoundPlaybackConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface AmbientSoundPlaybackConfig {
    distance: number;
    listener: ElevatedPoint;
    muffled: boolean;
    object: canvas.placeables.AmbientSound;
    sound: Sound;
    source: PointSoundSource;
    volume: number;
    walls: boolean;
}
```

## Properties

- **distance**: *number*  
  The minimum distance between a listener and the AmbientSound origin.

- **listener**: [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
  The coordinates of the closest listener or undefined if there is none.

- **muffled**: *boolean*  
  Is the closest listener muffled.

- **object**: [canvas.placeables.AmbientSound](https://foundryvtt.com/api/classes/foundry.canvas.placeables.AmbientSound.html)  
  An AmbientSound object responsible for the sound, or undefined.

- **sound**: [Sound](https://foundryvtt.com/api/classes/foundry.audio.Sound.html)  
  The Sound node which should be controlled for playback.

- **source**: [PointSoundSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointSoundSource.html)  
  The SoundSource which defines the area of effect for the sound.

- **volume**: *number*  
  The final volume at which the Sound should be played.

- **walls**: *boolean*  
  Is playback constrained or muffled by walls?