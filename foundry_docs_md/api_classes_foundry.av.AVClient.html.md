# AVClient

An interface for an Audio/Video client which is extended to provide broadcasting functionality.

**Parameters:**

- **master**  
  The master orchestration instance

- **settings**  
  The audio/video settings being used

**Hierarchy:**  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.av.AVClient)

- AVClient  
- *SimplePeerAVClient*

---

## Properties

### master

```typescript
master: AVMaster
```

The master orchestration instance.

---

### settings

```typescript
settings: AVSettings
```

The active audio/video settings being used.

---

## Accessors

### isMuted

```typescript
get isMuted(): boolean
```

Is the current user muted?

**Returns:** `boolean`

---

### isVoiceActivated

```typescript
get isVoiceActivated(): boolean
```

Is audio broadcasting voice-activation enabled?

**Returns:** `boolean`

---

### isVoiceAlways

```typescript
get isVoiceAlways(): boolean
```

Is audio broadcasting always enabled?

**Returns:** `boolean`

---

### isVoicePTT

```typescript
get isVoicePTT(): boolean
```

Is audio broadcasting push-to-talk enabled?

**Returns:** `boolean`

---

## Methods

### connect

```typescript
connect(): Promise<boolean>
```

Connect to any servers or services needed in order to provide audio/video functionality. Any parameters needed in order to establish the connection should be drawn from the settings object. This function should return a boolean for whether the connection attempt was successful.

**Returns:**  
`Promise<boolean>` — Was the connection attempt successful?

---

### disconnect

```typescript
disconnect(): Promise<boolean>
```

Disconnect from any servers or services which are used to provide audio/video functionality. This function should return a boolean for whether a valid disconnection occurred.

**Returns:**  
`Promise<boolean>` — Did a disconnection occur?

---

### getAudioSinks

```typescript
getAudioSinks(): Promise<{ object: any }>
```

Provide an Object of available audio sinks which can be used by this implementation. Each object key should be a device id and the value should be a human-readable label.

**Returns:**  
`Promise<{ object: any }>` — Available audio sinks.

---

### getAudioSources

```typescript
getAudioSources(): Promise<{ object: any }>
```

Provide an Object of available audio sources which can be used by this implementation. Each object key should be a device id and the value should be a human-readable label.

**Returns:**  
`Promise<{ object: any }>` — Available audio sources.

---

### getConnectedUsers

```typescript
getConnectedUsers(): string[]
```

Return an array of Foundry User IDs which are currently connected to A/V. The current user should also be included as a connected user in addition to all peers.

**Returns:**  
`string[]` — The connected User IDs.

---

### getLevelsStreamForUser

```typescript
getLevelsStreamForUser(userId: string): null | MediaStream
```

Provide a MediaStream for monitoring a given user's voice volume levels.

**Parameters:**

- **userId**: `string`  
  The User ID.

**Returns:**  
`null | MediaStream` — The MediaStream for the user, or null if the user does not have one.

---

### getMediaStreamForUser

```typescript
getMediaStreamForUser(userId: string): null | MediaStream
```

Provide a MediaStream instance for a given user ID.

**Parameters:**

- **userId**: `string`  
  The User ID.

**Returns:**  
`null | MediaStream` — The MediaStream for the user, or null if the user does not have one.

---

### getVideoSources

```typescript
getVideoSources(): Promise<{ object: any }>
```

Provide an Object of available video sources which can be used by this implementation. Each object key should be a device id and the value should be a human-readable label.

**Returns:**  
`Promise<{ object: any }>` — Available video sources.

---

### initialize

```typescript
initialize(): Promise<void>
```

One-time initialization actions that should be performed for this client implementation. This will be called only once when the Game object is first set-up.

**Returns:**  
`Promise<void>`

---

### isAudioEnabled

```typescript
isAudioEnabled(): boolean
```

Is outbound audio enabled for the current user?

**Returns:**  
`boolean`

---

### isVideoEnabled

```typescript
isVideoEnabled(): boolean
```

Is outbound video enabled for the current user?

**Returns:**  
`boolean`

---

### onSettingsChanged

```typescript
onSettingsChanged(changed: object): void
```

Handle changes to A/V configuration settings.

**Parameters:**

- **changed**: `object`  
  The settings which have changed.

**Returns:**  
`void`

---

### setUserVideo

```typescript
setUserVideo(userId: string, videoElement: HTMLVideoElement): Promise<void>
```

Set the Video Track for a given User ID to a provided VideoElement.

**Parameters:**

- **userId**: `string`  
  The User ID to set to the element.

- **videoElement**: `HTMLVideoElement`  
  The HTMLVideoElement to which the video should be set.

**Returns:**  
`Promise<void>`

---

### toggleAudio

```typescript
toggleAudio(enable: boolean): void
```

Set whether the outbound audio feed for the current game user is enabled. This method should be used when the user marks themselves as muted or if the gamemaster globally mutes them.

**Parameters:**

- **enable**: `boolean`  
  Whether the outbound audio track should be enabled (`true`) or disabled (`false`).

**Returns:**  
`void`

---

### toggleBroadcast

```typescript
toggleBroadcast(broadcast: boolean): void
```

Set whether the outbound audio feed for the current game user is actively broadcasting. This can only be `true` if audio is enabled, but may be `false` if using push-to-talk or voice activation modes.

**Parameters:**

- **broadcast**: `boolean`  
  Whether outbound audio should be sent to connected peers or not.

**Returns:**  
`void`

---

### toggleVideo

```typescript
toggleVideo(enable: boolean): void
```

Set whether the outbound video feed for the current game user is enabled. This method should be used when the user marks themselves as hidden or if the gamemaster globally hides them.

**Parameters:**

- **enable**: `boolean`  
  Whether the outbound video track should be enabled (`true`) or disabled (`false`).

**Returns:**  
`void`

---

### updateLocalStream

```typescript
updateLocalStream(): Promise<void>
```

Replace the local stream for each connected peer with a re-generated MediaStream.

**Returns:**  
`Promise<void>`