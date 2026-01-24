# AudioTimeout

A framework for scheduled audio events with more precise and synchronized timing than using `window.setTimeout`. This approach creates an empty audio buffer of the desired duration played using the shared game audio context. The `onended` event of the `AudioBufferSourceNode` provides a very precise way to synchronize audio events. For audio timing, this is preferable because it avoids numerous issues with `window.setTimeout`.

## Examples

```typescript
function playForDuration(sound, duration) {
  sound.play();
  const wait = new AudioTimeout(duration, {callback: () => sound.stop()})
}
```

```typescript
async function playForDuration(sound, duration) {
  sound.play();
  const timeout = new AudioTimeout(delay);
  await timeout.complete;
  sound.stop();
}
```

```typescript
async function playForDuration(sound, duration) {
  sound.play();
  await AudioTimeout.wait(duration);
  sound.stop();
}
```

## Constructor

```typescript
new AudioTimeout(delayMS: number, options?: AudioTimeoutOptions): AudioTimeout
```

Create an AudioTimeout by providing a delay and callback.

**Parameters**

- **delayMS**: `number`  
  A desired delay timing in milliseconds

- **options**: `AudioTimeoutOptions = {}` (optional)  
  Additional options which modify timeout behavior

**Returns**  
`AudioTimeout`

## Properties

### complete

```typescript
complete: Promise<any>
```

Is the timeout complete? This can be used to await the completion of the AudioTimeout if necessary. The Promise resolves to the returned value of the provided callback function.

## Methods

### cancel()

```typescript
cancel(): void
```

Cancel an AudioTimeout by ending it early, rejecting its completion promise, and skipping any callback function.

**Returns**  
`void`

### end()

```typescript
end(): void
```

End the timeout, either on schedule or prematurely. Executes any callback function.

**Returns**  
`void`

## Static Methods

### wait()

```typescript
static wait(delayMS: number, options?: AudioTimeoutOptions): Promise<any>
```

Schedule a task according to some audio timeout.

**Parameters**

- **delayMS**: `number`  
  A desired delay timing in milliseconds

- **options**: `AudioTimeoutOptions` (optional)  
  Additional options which modify timeout behavior

**Returns**  
`Promise<any>`  
A promise which resolves as a returned value of the callback or void

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[AudioTimeoutOptions](https://foundryvtt.com/api/interfaces/foundry.AudioTimeoutOptions.html)