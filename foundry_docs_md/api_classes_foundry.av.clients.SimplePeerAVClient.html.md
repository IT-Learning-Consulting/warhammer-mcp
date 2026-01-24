# SimplePeerAVClient

An implementation of the AVClient which uses the simple-peer library and the Foundry socket server for signaling. Credit to bekit#4213 for identifying simple-peer as a viable technology and providing a POC implementation.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.av.clients.SimplePeerAVClient))  
* _AVClient_  
* **SimplePeerAVClient**

---

## Properties

### `audioBroadcastEnabled`

**Type:** `boolean` = `false`  
Is outbound broadcast of local audio enabled?

---

### `levelsStream`

**Type:** `MediaStream` = `null`  
The dedicated audio stream used to measure volume levels for voice activity detection.

---

### `localStream`

**Type:** `MediaStream` = `null`  
The local Stream which captures input video and audio

---

### `master`

**Type:** `AVMaster`  
The master orchestration instance  
Inherited from [AVClient.master](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#master)

---

### `peers`

**Type:** `Map<any, any>` = ...  
A mapping of connected peers

---

### `remoteStreams`

**Type:** `Map<any, any>` = ...  
A mapping of connected remote streams

---

### `settings`

**Type:** `AVSettings`  
The active audio/video settings being used  
Inherited from [AVClient.settings](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#settings)

---

## Accessors

### `get isMuted(): boolean`

Is the current user muted?  
**Returns:** `boolean`  
Inherited from [AVClient.isMuted](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#isMuted)

---

### `get isVoiceActivated(): boolean`

Is audio broadcasting voice-activation enabled?  
**Returns:** `boolean`  
Inherited from [AVClient.isVoiceActivated](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#isVoiceActivated)

---

### `get isVoiceAlways(): boolean`

Is audio broadcasting always enabled?  
**Returns:** `boolean`  
Inherited from [AVClient.isVoiceAlways](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#isVoiceAlways)

---

### `get isVoicePTT(): boolean`

Is audio broadcasting push-to-talk enabled?  
**Returns:** `boolean`  
Inherited from [AVClient.isVoicePTT](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#isVoicePTT)

---

## Methods

### `activateSocketListeners(): void`

Listen for Audio/Video updates on the av socket to broker connections between peers  
**Returns:** `void`

---

### `connect(): Promise<boolean>`

**Returns:** `Promise<boolean>`  
Overrides [AVClient.connect](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#connect)

---

### `connectPeer(userId: string, isInitiator?: boolean): SimplePeer`

Connect to a peer directly, either as the initiator or as the receiver

**Parameters:**

- **userId**: `string`  
  The Foundry user ID with whom we are connecting

- **isInitiator**: `boolean` = `false`  
  Is the current user initiating the connection, or responding to it?

**Returns:** `SimplePeer`  
The constructed and configured SimplePeer instance

---

### `disconnect(): Promise<boolean>`

**Returns:** `Promise<boolean>`  
Overrides [AVClient.disconnect](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#disconnect)

---

### `disconnectAll(): Promise<any[]>`

Disconnect from all current peer streams

**Returns:** `Promise<any[]>`  
A Promise which resolves once all peers have been disconnected

---

### `disconnectPeer(userId: string): Promise<void>`

Disconnect from a peer by stopping current stream tracks and destroying the SimplePeer instance

**Parameters:**

- **userId**: `string`  
  The Foundry user ID from whom we are disconnecting

**Returns:** `Promise<void>`  
A Promise which resolves once the disconnection is complete

---

### `getAudioSinks(): Promise<{ object: any }>`

Provide an Object of available audio sources which can be used by this implementation. Each object key should be a device id and the key should be a human-readable label.

**Returns:** `Promise<{ object: any }>`  
Inherited from [AVClient.getAudioSinks](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#getAudioSinks)

---

### `getAudioSources(): Promise<{ object: any }>`

Provide an Object of available audio sources which can be used by this implementation. Each object key should be a device id and the key should be a human-readable label.

**Returns:** `Promise<{ object: any }>`  
Inherited from [AVClient.getAudioSources](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#getAudioSources)

---

### `getConnectedUsers(): any[]`

**Returns:** `any[]`  
Overrides [AVClient.getConnectedUsers](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#getConnectedUsers)

---

### `getLevelsStreamForUser(userId: any): any`

**Parameters:**

- **userId**: `any`

**Returns:** `any`  
Overrides [AVClient.getLevelsStreamForUser](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#getLevelsStreamForUser)

---

### `getMediaStreamForUser(userId: any): any`

**Parameters:**

- **userId**: `any`

**Returns:** `any`  
Overrides [AVClient.getMediaStreamForUser](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#getMediaStreamForUser)

---

### `getVideoSources(): Promise<{ object: any }>`

Provide an Object of available video sources which can be used by this implementation. Each object key should be a device id and the key should be a human-readable label.

**Returns:** `Promise<{ object: any }>`  
Inherited from [AVClient.getVideoSources](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#getVideoSources)

---

### `initialize(): Promise<void>`

**Returns:** `Promise<void>`  
Overrides [AVClient.initialize](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#initialize)

---

### `initializeLocalStream(): Promise<MediaStream>`

Initialize a local media stream for the current user

**Returns:** `Promise<MediaStream>`

---

### `initializePeerStream(userId: string): Promise<SimplePeer>`

Initialize a stream connection with a new peer

**Parameters:**

- **userId**: `string`  
  The Foundry user ID for which the peer stream should be established

**Returns:** `Promise<SimplePeer>`  
A Promise which resolves once the peer stream is initialized

---

### `isAudioEnabled(): boolean`

**Returns:** `boolean`  
Overrides [AVClient.isAudioEnabled](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#isAudioEnabled)

---

### `isVideoEnabled(): boolean`

**Returns:** `boolean`  
Overrides [AVClient.isVideoEnabled](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#isVideoEnabled)

---

### `onSettingsChanged(changed: any): Promise<void>`

**Parameters:**

- **changed**: `any`

**Returns:** `Promise<void>`  
Overrides [AVClient.onSettingsChanged](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#onSettingsChanged)

---

### `receiveSignal(userId: string, data: object): void`

Receive a request to establish a peer signal with some other User id

**Parameters:**

- **userId**: `string`  
  The Foundry user ID who is requesting to establish a connection

- **data**: `object`  
  The connection details provided by SimplePeer

**Returns:** `void`

---

### `setUserVideo(userId: any, videoElement: any): Promise<void>`

**Parameters:**

- **userId**: `any`  
- **videoElement**: `any`

**Returns:** `Promise<void>`  
Overrides [AVClient.setUserVideo](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#setUserVideo)

---

### `toggleAudio(enabled: any): void`

**Parameters:**

- **enabled**: `any`

**Returns:** `void`  
Overrides [AVClient.toggleAudio](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#toggleAudio)

---

### `toggleBroadcast(enabled: any): void`

**Parameters:**

- **enabled**: `any`

**Returns:** `void`  
Overrides [AVClient.toggleBroadcast](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#toggleBroadcast)

---

### `toggleVideo(enabled: any): void`

**Parameters:**

- **enabled**: `any`

**Returns:** `void`  
Overrides [AVClient.toggleVideo](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#toggleVideo)

---

### `updateLocalStream(): Promise<void>`

Replace the local stream for each connected peer with a re-generated MediaStream.

**Returns:** `Promise<void>`  
Overrides [AVClient.updateLocalStream](https://foundryvtt.com/api/classes/foundry.av.AVClient.html#updateLocalStream)