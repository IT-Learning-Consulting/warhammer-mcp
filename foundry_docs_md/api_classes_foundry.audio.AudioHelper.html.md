# AudioHelper | Foundry Virtual Tabletop - API Documentation - Version 13

A helper class to provide common functionality for working with the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).  
A singleton instance of this class is available as `game#audio`.

**See:**  
[foundry.Game#audio](https://foundryvtt.com/api/classes/foundry.Game.html#audio)

---

## Properties

### analyzer

**Type:** [AnalysisData](https://foundryvtt.com/api/interfaces/foundry.audio.AnalysisData.html)  
Analyzers for each context, plus an internal ticker. Each context key holds data about its `AnalyserNode`, a `Float32Array` for FFT data, and so on.

---

### buffers

**Type:** [AudioBufferCache](https://foundryvtt.com/api/classes/foundry.audio.AudioBufferCache.html) = ...  
A singleton cache used for audio buffers.

---

### environment

**Type:** `AudioContext`  
A singleton audio context used for playback of environmental audio.

---

### interface

**Type:** `AudioContext`  
A singleton audio context used for playback of interface sounds and effects.

---

### locked

**Type:** `boolean` = true  
A flag for whether video playback is currently locked by awaiting a user gesture.

---

### music

**Type:** `AudioContext`  
A singleton audio context used for playback of music.

---

### pending

**Type:** `Function[]` = []  
A user gesture must be registered before audio can be played. This Array contains the Sound instances which are requested for playback prior to a gesture. Once a gesture is observed, we begin playing all elements of this Array.

**See:** [foundry.audio.Sound](https://foundryvtt.com/api/classes/foundry.audio.Sound.html)

---

### playing

**Type:** `Map<number, Sound>` = ...  
Get a map of the Sound objects which are currently playing.

---

### sounds

**Type:** `Map<string, WeakRef<Sound>>` = ...  
The set of singleton Sound instances which are shared across multiple uses of the same sound path.

---

### unlock

**Type:** `Promise<void>`  
A Promise which resolves once the game audio API is unlocked and ready to use.

---

### Static Properties

| Name                         | Type                    | Description                                                                                     |
|------------------------------|-------------------------|-------------------------------------------------------------------------------------------------|
| `ANALYSIS_TIMEOUT_MS`         | `number` = 1000         | A static inactivity threshold for audio analysis, in milliseconds.                              |
| `AUDIO_CONTEXTS`              | `readonly ContextName[]`| An array containing all possible audio context names.                                          |
| `levelAnalyserNativeInterval` | `number` = 50           | The Native interval for the AudioHelper to analyse audio levels from streams.                   |
| `THRESHOLD_CACHE_SIZE_BYTES`  | `number`                | The cache size threshold after which audio buffers will be expired from the cache (default 1 GB).|

---

## Accessors

### `context`

```typescript
get context(): AudioContext
```

For backwards compatibility, `AudioHelper#context` refers to the context used for music playback.

**Returns:** `AudioContext`

---

### `globalMute`

```typescript
get globalMute(): boolean
```

A global mute which suppresses all 3 audio channels.

**Returns:** `boolean`

---

## Methods

### awaitFirstGesture

```typescript
awaitFirstGesture(): Promise<void>
```

Register an event listener to await the first mousemove gesture and begin playback once observed.

**Returns:** `Promise<void>`  
The unlocked audio context

---

### create

```typescript
create(options: SoundCreationOptions): Sound
```

Create a Sound instance for a given audio source URL.

**Parameters:**

- **options**: [SoundCreationOptions](https://foundryvtt.com/api/interfaces/foundry.audio.SoundCreationOptions.html)  
  Sound creation options

**Returns:** [Sound](https://foundryvtt.com/api/classes/foundry.audio.Sound.html)

---

### debug

```typescript
debug(message: string): void
```

Log a debugging message if the audio debugging flag is enabled.

**Parameters:**

- **message**: `string`  
  The message to log

**Returns:** `void`

---

### disableAnalyzer

```typescript
disableAnalyzer(contextName: ContextName): void
```

Disable the analyzer for a given context, disconnecting the `AnalyserNode`.

**Parameters:**

- **contextName**: [ContextName](https://foundryvtt.com/api/types/foundry.audio.ContextName.html)

**Returns:** `void`

---

### enableAnalyzer

```typescript
enableAnalyzer(
  contextName: ContextName,
  options?: { keepAlive?: boolean },
): void
```

Enable the analyzer for a given context (`music`, `environment`, `interface`), attaching an `AnalyserNode` to its gain node if not already active.

**Parameters:**

- **contextName**: [ContextName](https://foundryvtt.com/api/types/foundry.audio.ContextName.html)
- **options** (optional):  
  - **keepAlive**?: `boolean`  
    If true, this analyzer will not auto-disable after inactivity.

**Returns:** `void`

---

### getAnalyzerContext

```typescript
getAnalyzerContext(): AudioContext
```

Returns a singleton `AudioContext` if one can be created. An audio context may not be available due to limited resources or browser compatibility in which case `null` will be returned.

**Returns:** `AudioContext` or `null`

---

### getBandLevel

```typescript
getBandLevel(
  contextName: ContextName,
  bandName: BandName,
  options?: { ignoreVolume?: boolean },
): number
```

Returns a normalized band value in [0,1]. Optionally, we can subtract the actual gainNode (global) volume from the measurement.

**Important:**  
Local gain applied to [foundry.audio.Sound](https://foundryvtt.com/api/classes/foundry.audio.Sound.html) source can't be ignored.  
If this method needs to activate the analyzer, the latter requires a brief warm-up. One or two frames may be needed before it produces meaningful values (instead of returning 0).

**Parameters:**

- **contextName**: [ContextName](https://foundryvtt.com/api/types/foundry.audio.ContextName.html)
- **bandName**: [BandName](https://foundryvtt.com/api/types/foundry.audio.BandName.html)
- **options** (optional):  
  - **ignoreVolume**?: `boolean`  
    If true, remove the real-time channel volume from the measurement.

**Returns:** `number`  
The normalized band value in [0,1].

---

### getMaxBandLevel

```typescript
getMaxBandLevel(
  band?: BandName,
  options?: { ignoreVolume?: boolean }
): number
```

Retrieve a single "peak" analyzer value across the three main audio contexts (`music`, `environment`, `interface`). This takes the maximum of the three normalized [0,1] values for a given frequency band.

**Parameters:**

- **band** (optional): [BandName](https://foundryvtt.com/api/types/foundry.audio.BandName.html) = `"all"`  
  The frequency band for which to retrieve an analyzer value.
- **options** (optional):  
  - **ignoreVolume**?: `boolean`  
    If true, remove the real-time channel volume from the measurement.

**Returns:** `number`  
A number in the [0,1] range representing the loudest band value among the three contexts.

---

### play

```typescript
play(
  src: string,
  options?: { context?: AudioContext }
): Promise<Sound>
```

Play a single Sound by providing its source.

**Parameters:**

- **src**: `string`  
  The file path to the audio source being played.
- **options** (optional):  
  - **context**?: `AudioContext`  
    A specific AudioContext within which to play.

**Returns:** `Promise<Sound>`  
The created Sound which is now playing.

---

### preload

```typescript
preload(src: string): Promise<Sound>
```

Request that other connected clients begin preloading a certain sound path.

**Parameters:**

- **src**: `string`  
  The source file path requested for preload.

**Returns:** `Promise<Sound>`  
A Promise which resolves once the preload is complete.

---

### startLevelReports

```typescript
startLevelReports(
  id: string,
  stream: MediaStream,
  callback: Function,
  interval?: number,
  smoothing?: number,
): boolean
```

Registers a stream for periodic reports of audio levels. Once added, the callback will be called with the maximum decibel level of the audio tracks in that stream since the last time the event was fired. The interval needs to be a multiple of `AudioHelper.levelAnalyserNativeInterval` which defaults at 50ms.

**Parameters:**

- **id**: `string`  
  An id to assign to this report. Can be used to stop reports.
- **stream**: `MediaStream`  
  The MediaStream instance to report activity on.
- **callback**: `Function`  
  The callback function to call with the decibel level. `callback(dbLevel)`
- **interval** (optional): `number` = 50  
  The interval at which to produce reports.
- **smoothing** (optional): `number` = 0.1  
  The smoothingTimeConstant to set on the audio analyser.

**Returns:** `boolean`  
Returns whether listening to the stream was successful.

---

### stopLevelReports

```typescript
stopLevelReports(id: string): void
```

Stop sending audio level reports. This stops listening to a stream and stops sending reports. If we aren't listening to any more streams, cancel the global analyser timer.

**Parameters:**

- **id**: `string`  
  The id of the reports that passed to `startLevelReports`.

**Returns:** `void`

---

### _activateSocketListeners

```typescript
static _activateSocketListeners(
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
): void
```

Open socket listeners which transact ChatMessage data.

**Parameters:**

- **socket**: `Socket<DefaultEventsMap, DefaultEventsMap>`

**Returns:** `void`

---

### getDefaultSoundName

```typescript
static getDefaultSoundName(src: string): string
```

Given an input file path, determine a default name for the sound based on the filename.

**Parameters:**

- **src**: `string`  
  An input file path.

**Returns:** `string`  
A default sound name for the path.

---

### hasAudioExtension

```typescript
static hasAudioExtension(src: string): boolean
```

Test whether a source file has a supported audio extension type.

**Parameters:**

- **src**: `string`  
  A requested audio source path.

**Returns:** `boolean`  
Does the filename end with a valid audio extension?

---

### inputToVolume

```typescript
static inputToVolume(value: string | number, order?: number): number
```

Returns the volume value based on a range input volume control's position. This is using an exponential approximation of the logarithmic nature of audio level perception.

**Parameters:**

- **value**: `string | number`  
  Value between [0, 1] of the range input.
- **order** (optional): `number` = 1.5  
  The exponent of the curve.

**Returns:** `number`

---

### play (static)

```typescript
static play(
  data: {
    autoplay?: boolean;
    channel?: string;
    loop?: boolean;
    src: string;
    volume?: number;
  },
  socketOptions?: boolean | { recipients: string[] },
): void | Sound
```

Play a one-off sound effect which is not part of a Playlist.

**Parameters:**

- **data**:  
  - **autoplay**? `boolean`  
    Begin playback of the audio effect immediately once it is loaded. Default: `false`.
  - **channel**? `string`  
    An audio channel in `CONST.AUDIO_CHANNELS` where the sound should play. Default: `"interface"`.
  - **loop**? `boolean`  
    Loop the audio effect and continue playing it until it is manually stopped. Default: `false`.
  - **src**: `string`  
    The audio source file path, either a public URL or a local path relative to the public directory.
  - **volume**? `number`  
    The volume level at which to play the audio, between 0 and 1. Default: `1`.
- **socketOptions** (optional): `boolean | { recipients: string[] }`  
  Options which only apply when emitting playback over websocket. As a boolean, emits (`true`) or does not emit (`false`) playback to all other clients. As an object, can configure which recipients (an array of User IDs) should receive the event (all clients by default). Default: `false`.

**Returns:** `void | Sound`  
A Sound instance which controls audio playback, or nothing if `data.autoplay` is false.

**Example:**

```typescript
AudioHelper.play({src: "sounds/lock.wav", volume: 0.8, loop: false}, true);
```

---

### preloadSound

```typescript
static preloadSound(src: string): Promise<Sound>
```

Begin loading the sound for a provided source URL.

**Parameters:**

- **src**: `string`  
  The audio source path to preload.

**Returns:** `Promise<Sound>`  
The created and loaded Sound ready for playback.

---

### registerSettings

```typescript
static registerSettings(): void
```

Register client-level settings for global volume controls.

**Returns:** `void`

---

### volumeToInput

```typescript
static volumeToInput(volume: number, order?: number): number
```

Counterpart to `inputToVolume()`. Returns the input range value based on a volume.

**Parameters:**

- **volume**: `number`  
  Value between [0, 1] of the volume level.
- **order** (optional): `number` = 1.5  
  The exponent of the curve.

**Returns:** `number`

---

### volumeToPercentage

```typescript
static volumeToPercentage(
  volume: number,
  options?: { decimalPlaces?: number; label?: boolean },
): string
```

Converts a volume level to a human-readable percentage value.

**Parameters:**

- **volume**: `number`  
  Value in the interval [0, 1] of the volume level.
- **options** (optional):  
  - **decimalPlaces**?: `number`  
    The number of decimal places to round the percentage to.
  - **label**?: `boolean`  
    Prefix the returned tooltip with a localized 'Volume: ' label. This should be used if the returned string is intended for assistive technologies, such as the aria-valuetext attribute.

**Returns:** `string`

---

# Links

- [Foundry Virtual Tabletop - API Documentation](https://foundryvtt.com/api/index.html) (Version 13)