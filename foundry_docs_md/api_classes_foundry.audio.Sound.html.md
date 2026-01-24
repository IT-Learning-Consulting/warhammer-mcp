# Sound | Foundry Virtual Tabletop - API Documentation - Version 13

A container around an AudioNode which manages sound playback in Foundry Virtual Tabletop. Each Sound is either an AudioBufferSourceNode (for short sources) or a MediaElementAudioSourceNode (for long ones). This class provides an interface around both types which allows standardized control over playback.

**See**  
Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.audio.Sound)) (Expand)  

`EventEmitter<Function, this>`  
**Sound**

---

## Constructors

### constructor

```typescript
new Sound(
    src: string,
    options?: { context?: AudioContext; forceBuffer?: boolean },
): Sound
```

Construct a Sound by providing the source URL and other options.

**Parameters**

- **src**: `string`  
  The audio source path, either a relative path or a remote URL

- **options** (optional): `{ context?: AudioContext; forceBuffer?: boolean } = {}`  
  Additional options which configure the Sound

    - **context** (optional): `AudioContext`  
      A non-default audio context within which the sound should play

    - **forceBuffer** (optional): `boolean`  
      Force use of an AudioBufferSourceNode even if the audio duration is long

**Returns**  
`Sound`

Overrides `EventEmitterMixin().constructor`

---

## Properties

- **buffer**: `null | AudioBuffer = null`  
  An AudioBuffer instance, if this Sound uses an AudioBufferSourceNode for playback.

- **destination**: `AudioNode`  
  The AudioNode destination which is the output target for the Sound.

- **effects**: `AudioNode[] = []`  
  A pipeline of AudioNode instances to be applied to Sound playback.

- **element**: `null | HTMLAudioElement = null`  
  An HTMLAudioElement, if this Sound uses a MediaElementAudioSourceNode for playback.

- **gainNode**: `GainNode`  
  The GainNode used to control volume for this sound.

- **id**: `number`  
  A unique integer identifier for this sound.

- **pausedTime**: `number`  
  The time in seconds at which playback was paused.

- **src**: `string`  
  The audio source path. Either a relative path served by the running Foundry VTT game server or a remote URL.

- **startTime**: `number`  
  The time in seconds at which playback was started.

- **_state** (protected): `number = Sound.STATES.NONE`  
  The life-cycle state of the sound.

- **emittedEvents** (static): `string[]`  
  Overrides `EventEmitterMixin().emittedEvents`

- **MAX_BUFFER_DURATION** (static): `number`  
  The maximum duration, in seconds, for which an AudioBufferSourceNode will be used. Otherwise, a MediaElementAudioSourceNode will be used.

- **STATES** (static): `Readonly<{ ... }> `  
  The sequence of container loading states.

---

## Accessors

### context

```typescript
get context(): AudioContext
```

The audio context within which this Sound is played.

**Returns**  
`AudioContext`

---

### currentTime

```typescript
get currentTime(): number
```

The current playback time of the sound.

**Returns**  
`number`

---

### duration

```typescript
get duration(): number
```

The total duration of the audio source in seconds.

**Returns**  
`number`

---

### failed

```typescript
get failed(): boolean
```

Did the audio file fail to load.

**Returns**  
`boolean`

---

### gain

```typescript
get gain(): AudioParam
```

A convenience reference to the GainNode gain audio parameter.

**Returns**  
`AudioParam`

---

### isBuffer

```typescript
get isBuffer(): boolean
```

Does this Sound use an AudioBufferSourceNode? Otherwise, the Sound uses a streamed MediaElementAudioSourceNode.

**Returns**  
`boolean`

---

### loaded

```typescript
get loaded(): boolean
```

Has the audio file been loaded either fully or for streaming.

**Returns**  
`boolean`

---

### loop

```typescript
get loop(): boolean
```

Is the sound looping?

**Returns**  
`boolean`

---

### playing

```typescript
get playing(): boolean
```

Is this sound currently playing?

**Returns**  
`boolean`

---

### sourceNode

```typescript
get sourceNode(): AudioBufferSourceNode | MediaElementAudioSourceNode
```

The AudioSourceNode used to control sound playback.

**Returns**  
`AudioBufferSourceNode | MediaElementAudioSourceNode`

---

### volume

```typescript
get volume(): number
```

The currently playing volume of the sound. Undefined until playback has started for the first time.

**Returns**  
`number`

---

## Methods

### addEventListener

```typescript
addEventListener(
    type: string,
    listener: EmittedEventListener,
    options?: { once?: boolean },
): void
```

Add a new event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being registered for

- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs

- **options** (optional): `{ once?: boolean } = {}`  
  Options which configure the event listener

    - **once** (optional): `boolean`  
      Should the event only be responded to once and then removed

**Returns**  
`void`

**See**  
[addEventListener - MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from `EventEmitterMixin().addEventListener`

---

### applyEffects

```typescript
applyEffects(effects?: AudioNode[]): void
```

Update the array of effects applied to a Sound instance. Optionally a new array of effects can be assigned. If no effects are passed, the current effects are re-applied.

**Parameters**  

- **effects** (optional): `AudioNode[]`  
  An array of AudioNode effects to apply

**Returns**  
`void`

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns**  
`boolean`  
Was default behavior for the event prevented?

**See**  
[dispatchEvent - MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from `EventEmitterMixin().dispatchEvent`

---

### fade

```typescript
fade(
    volume: number,
    options?: { duration?: number; from?: number; type?: string },
): Promise<void>
```

Fade the volume for this sound between its current level and a desired target volume.

**Parameters**

- **volume**: `number`  
  The desired target volume level between 0 and 1

- **options** (optional): `{ duration?: number; from?: number; type?: string } = {}`  
  Additional options that configure the fade operation

    - **duration** (optional): `number`  
      The duration of the fade effect in milliseconds

    - **from** (optional): `number`  
      A volume level to start from, the current volume by default

    - **type** (optional): `string`  
      The type of fade easing, `"linear"` or `"exponential"`

**Returns**  
`Promise<void>`  
A Promise that resolves after the requested fade duration

---

### load

```typescript
load(
    options?: { autoplay?: boolean; autoplayOptions?: SoundPlaybackOptions },
): Promise<Sound>
```

Load the audio source and prepare it for playback, either using an AudioBuffer or a streamed HTMLAudioElement.

**Parameters**

- **options** (optional): `{ autoplay?: boolean; autoplayOptions?: SoundPlaybackOptions } = {}`  
  Additional options which affect resource loading

    - **autoplay** (optional): `boolean`  
      Automatically begin playback of the sound once loaded

    - **autoplayOptions** (optional): [SoundPlaybackOptions](https://foundryvtt.com/api/interfaces/foundry.audio.SoundPlaybackOptions.html)  
      Playback options passed to `Sound#play`, if autoplay

**Returns**  
`Promise<Sound>`  
A Promise which resolves to the Sound once it is loaded

---

### pause

```typescript
pause(): void
```

Pause playback of the Sound. For AudioBufferSourceNode this stops playback after recording the current time. Calling `Sound#play` will resume playback from the pausedTime unless some other offset is passed. For a MediaElementAudioSourceNode this simply calls the `HTMLAudioElement#pause` method directly.

**Returns**  
`void`

---

### play

```typescript
play(options?: SoundPlaybackOptions, ...args: any[]): Promise<Sound>
```

Begin playback for the Sound. This method is asynchronous because playback may not start until after an initially provided delay. The Promise resolves *before* the fade-in of any configured volume transition.

**Parameters**

- **options** (optional): [SoundPlaybackOptions](https://foundryvtt.com/api/interfaces/foundry.audio.SoundPlaybackOptions.html)  
  Options which configure the beginning of sound playback

- **...args**: `any[] = {}`

**Returns**  
`Promise<Sound>`  
A Promise which resolves once playback has started (excluding fade)

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being removed

- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function being removed

**Returns**  
`void`

**See**  
[removeEventListener - MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from `EventEmitterMixin().removeEventListener`

---

### schedule

```typescript
schedule(fn: SoundScheduleCallback, playbackTime: number): Promise<any>
```

Schedule a function to occur at the next occurrence of a specific playbackTime for this Sound.

**Parameters**

- **fn**: [SoundScheduleCallback](https://foundryvtt.com/api/types/foundry.audio.SoundScheduleCallback.html)  
  A function that will be called with this Sound as its single argument

- **playbackTime**: `number`  
  The desired playback time at which the function should be called

**Returns**  
`Promise<any>`  
A Promise which resolves to the returned value of the provided function once it has been evaluated.

**Example: Schedule audio playback changes**

```typescript
sound.schedule(() => console.log("Do something exactly 30 seconds into the track"), 30);
sound.schedule(() => console.log("Do something next time the track loops back to the beginning"), 0);
sound.schedule(() => console.log("Do something 5 seconds before the end of the track"), sound.duration - 5);
```

---

### stop

```typescript
stop(options?: SoundPlaybackOptions): Promise<Sound>
```

Stop playback for the Sound. This method is asynchronous because playback may not stop until after an initially provided delay. The Promise resolves *after* the fade-out of any configured volume transition.

**Parameters**

- **options** (optional): [SoundPlaybackOptions](https://foundryvtt.com/api/interfaces/foundry.audio.SoundPlaybackOptions.html) = `{}`  
  Options which configure the stopping of sound playback

**Returns**  
`Promise<Sound>`  
A Promise which resolves once playback is fully stopped (including fade)

---

### wait

```typescript
wait(duration: number): Promise<void>
```

Wait a certain scheduled duration within this sound's own AudioContext.

**Parameters**

- **duration**: `number`  
  The duration to wait in milliseconds

**Returns**  
`Promise<void>`  
A promise which resolves after the waited duration

---

## Protected Methods

### _connectPipeline

```typescript
protected _connectPipeline(): void
```

Create the audio pipeline used to play this Sound. The GainNode is reused each time to link volume changes across multiple playbacks. The AudioSourceNode is re-created every time that Sound#play is called.

**Returns**  
`void`

---

### _createNodes

```typescript
protected _createNodes(): void
```

Create any AudioNode instances required for playback of this Sound.

**Returns**  
`void`

---

### _disconnectPipeline

```typescript
protected _disconnectPipeline(): void
```

Disconnect the audio pipeline once playback is stopped. Walk backwards along the Sound pipeline from the Sound#destination, disconnecting each node.

**Returns**  
`void`

---

### _load

```typescript
protected _load(): Promise<void>
```

An inner method which handles loading so that it can be de-duplicated under a single shared Promise resolution. This method is factored out to allow for subclasses to override loading behavior.

**Returns**  
`Promise<void>`  
A Promise which resolves once the sound is loaded

**Throws**  
An error if loading failed for any reason

---

### _pause

```typescript
protected _pause(): void
```

Pause playback of the Sound. This method is factored out so that subclass implementations of Sound can implement alternative behavior.

**Returns**  
`void`

---

### _play

```typescript
protected _play(): void
```

Begin playback for the configured pipeline and playback options. This method is factored out so that subclass implementations of Sound can implement alternative behavior.

**Returns**  
`void`

---

### _stop

```typescript
protected _stop(): void
```

Stop playback of the Sound. This method is factored out so that subclass implementations of Sound can implement alternative behavior.

**Returns**  
`void`