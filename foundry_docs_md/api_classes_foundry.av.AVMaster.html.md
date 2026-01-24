# AVMaster

The master Audio/Video controller instance. This is available as the singleton `game.webrtc`.

## Properties

### broadcasting

**Type:** `boolean`

A flag to track whether the current user is actively broadcasting their microphone.

### client

**Type:** `AVClient`

The Audio/Video client class.  
[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

## Methods

### activateVoiceDetection

```typescript
activateVoiceDetection(stream: MediaStream, ms?: number): void
```

Activate voice detection tracking for a userId on a provided MediaStream. Currently only a MediaStream is supported because MediaStreamTrack processing is not yet supported cross-browser.

**Parameters**

- **stream**: `MediaStream`  
  The MediaStream which corresponds to that User

- **ms** (optional): `number`  
  A number of milliseconds which represents the voice activation volume interval

**Returns**  
`void`

---

### broadcast

```typescript
broadcast(intent: boolean): any
```

Trigger a change in the audio broadcasting state when using a push-to-talk workflow.

**Parameters**

- **intent**: `boolean`  
  The user's intent to broadcast. Whether an actual broadcast occurs will depend on whether or not the user has muted their audio feed.

**Returns**  
`any`

---

### canUserBroadcastAudio

```typescript
canUserBroadcastAudio(userId: string): boolean
```

A user can broadcast audio if the AV mode is compatible and if they are allowed to broadcast.

**Parameters**

- **userId**: `string`

**Returns**  
`boolean`

---

### canUserBroadcastVideo

```typescript
canUserBroadcastVideo(userId: string): boolean
```

A user can broadcast video if the AV mode is compatible and if they are allowed to broadcast.

**Parameters**

- **userId**: `string`

**Returns**  
`boolean`

---

### canUserShareAudio

```typescript
canUserShareAudio(userId: string): boolean
```

A user can share audio if they are allowed to broadcast and if they have not muted themselves or been blocked.

**Parameters**

- **userId**: `string`

**Returns**  
`boolean`

---

### canUserShareVideo

```typescript
canUserShareVideo(userId: string): boolean
```

A user can share video if they are allowed to broadcast and if they have not hidden themselves or been blocked.

**Parameters**

- **userId**: `string`

**Returns**  
`boolean`

---

### connect

```typescript
connect(): Promise<boolean>
```

Connect to the Audio/Video client.

**Returns**  
`Promise<boolean>`  
Was the connection attempt successful?

---

### deactivateVoiceDetection

```typescript
deactivateVoiceDetection(): void
```

Actions which the orchestration layer should take when a peer user disconnects from the audio/video service.

**Returns**  
`void`

---

### disconnect

```typescript
disconnect(): Promise<boolean>
```

Disconnect from the Audio/Video client.

**Returns**  
`Promise<boolean>`  
Whether an existing connection was terminated?

---

### onSettingsChanged

```typescript
onSettingsChanged(changed: object): undefined | Promise<boolean>
```

Respond to changes which occur to AV Settings. Changes are handled in descending order of impact.

**Parameters**

- **changed**: `object`  
  The object of changed AV settings

**Returns**  
`undefined | Promise<boolean>`

---

### reestablish

```typescript
reestablish(): Promise<void>
```

Callback actions to take when the user becomes disconnected from the server.

**Returns**  
`Promise<void>`