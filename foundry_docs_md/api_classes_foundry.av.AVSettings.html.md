# AVSettings | Foundry Virtual Tabletop - API Documentation - Version 13

## Class AVSettings

### Properties

- **activity**: `Record<string, AVSettingsData> = {}`  
  Stores the transient AV activity data received from other users.

- **changed**: `() => void`  

### Accessors

- **users**: `object`  
  Return a mapping of AV settings for each game User.

- **verticalDock**: `boolean`  
  A helper to determine if the dock is configured in a vertical position.

- **DEFAULT_USER_SETTINGS**: `object`  
  Default client settings for each connected user.

- **schemaFields**:  
  ```typescript
  {
    client: SchemaField;
    world: SchemaField;
  }
  ```  
  Schemas for world and client settings.

### Static Properties

- **AV_MODES**:  
  ```typescript
  {
    AUDIO: number;
    AUDIO_VIDEO: number;
    DISABLED: number;
    VIDEO: number;
  }
  ```  
  WebRTC Mode, Disabled, Audio only, Video only, Audio & Video

- **DOCK_POSITIONS**:  
  ```typescript
  {
    BOTTOM: string;
    LEFT: string;
    RIGHT: string;
    TOP: string;
  }
  ```  
  AV dock positions.

- **NAMEPLATE_MODES**:  
  ```typescript
  {
    BOTH: number;
    CHAR_ONLY: number;
    OFF: number;
    PLAYER_ONLY: number;
  }
  ```  
  Displayed nameplate options: Off entirely, animate between player and character name, player name only, character name only.

- **VOICE_MODES**:  
  ```typescript
  {
    ACTIVITY: string;
    ALWAYS: string;
    PTT: string;
  }
  ```  
  Voice modes: Always-broadcasting, voice-level triggered, push-to-talk.

### Methods

#### `get users(): object`

Return a mapping of AV settings for each game User.

#### `get verticalDock(): boolean`

A helper to determine if the dock is configured in a vertical position.

#### `get DEFAULT_USER_SETTINGS(): object`

Default client settings for each connected user.

#### `get schemaFields(): { client: SchemaField; world: SchemaField }`

Schemas for world and client settings.

#### `handleUserActivity(userId: string, settings: AVSettingsData): void`

Handle another connected user changing their AV settings.

- **Parameters:**
  - **userId**: `string`  
  - **settings**: [`AVSettingsData`](https://foundryvtt.com/api/interfaces/foundry.AVSettingsData.html)

- **Returns:** `void`

#### `register(): void`

Register world and client WebRTC settings.

- **Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)