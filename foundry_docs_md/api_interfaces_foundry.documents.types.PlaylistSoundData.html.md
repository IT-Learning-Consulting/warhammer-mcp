# PlaylistSoundData

```typescript
interface PlaylistSoundData {
  _id: null | string;
  channel: string;
  description: string;
  fade?: number;
  flags: DocumentFlags;
  name: string;
  path: string;
  pausedTime?: number;
  playing?: boolean;
  repeat?: boolean;
  sort?: number;
  volume?: number;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this PlaylistSound document.

- **channel**: `string`  
  A channel in [CONST.AUDIO_CHANNELS](https://foundryvtt.com/api/modules/foundry.constants.html#CONST_AUDIO_CHANNELS) where this sound is played.

- **description**: `string`  
  The description of this sound.

- **fade** *(optional)*: `number`  
  A duration in milliseconds to fade volume transition.

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags.

- **name**: `string`  
  The name of this sound.

- **path**: `string`  
  The audio file path that is played by this sound.

- **pausedTime** *(optional)*: `number`  
  The time in seconds at which playback was paused.

- **playing** *(optional)*: `boolean`  
  Is this sound currently playing?

- **repeat** *(optional)*: `boolean`  
  Does this sound loop?

- **sort** *(optional)*: `number`  
  The sort order of the PlaylistSound relative to others in the same collection.

- **volume** *(optional)*: `number`  
  The audio volume of the sound, from 0 to 1.