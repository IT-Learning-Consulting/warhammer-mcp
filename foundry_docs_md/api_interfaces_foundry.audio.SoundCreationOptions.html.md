# SoundCreationOptions

```typescript
interface SoundCreationOptions {
    autoplay?: boolean;
    autoplayOptions?: SoundPlaybackOptions;
    context?: AudioContext;
    preload?: boolean;
    singleton?: boolean;
    src: string;
}
```

## Properties

- **autoplay?**: `boolean`  
  Begin playing the audio as soon as it is ready?

- **autoplayOptions?**: [`SoundPlaybackOptions`](https://foundryvtt.com/api/interfaces/foundry.audio.SoundPlaybackOptions.html)  
  Options passed to the play method if autoplay is true

- **context?**: `AudioContext`  
  A specific AudioContext to attach the sound to

- **preload?**: `boolean`  
  Begin loading the audio immediately?

- **singleton?**: `boolean`  
  Reuse an existing Sound for this source?

- **src**: `string`  
  The source URL for the audio file

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)