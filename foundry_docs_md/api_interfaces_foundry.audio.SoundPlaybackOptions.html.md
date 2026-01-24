# SoundPlaybackOptions

```typescript
interface SoundPlaybackOptions {
    delay?: number;
    duration?: number;
    fade?: number;
    loop?: boolean;
    loopEnd?: number;
    loopStart?: number;
    offset?: number;
    onended?: null | Function;
    volume?: number;
}
```

## Properties

- **delay?**: `number`  
  A delay in seconds by which to delay playback.

- **duration?**: `number`  
  A limited duration in seconds for which to play.

- **fade?**: `number`  
  A duration in milliseconds over which to fade in playback.

- **loop?**: `boolean`  
  Should sound playback loop?

- **loopEnd?**: `number`  
  Seconds of the Audio buffer when looped playback should restart. Only works for `AudioBufferSourceNode`.

- **loopStart?**: `number`  
  Seconds of the AudioBuffer when looped playback should start. Only works for `AudioBufferSourceNode`.

- **offset?**: `number`  
  An offset in seconds at which to start playback.

- **onended?**: `null` | `Function`  
  A callback function attached to the source node.

- **volume?**: `number`  
  The volume at which to play the sound.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).