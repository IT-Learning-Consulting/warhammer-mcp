# CameraViewUserContext

```typescript
interface CameraViewUserContext {
    charname: string;
    controls: Record<string, CameraViewControlContext>;
    css: string;
    hasAudio: boolean;
    hasVideo: boolean;
    hidden: boolean;
    local: boolean;
    nameplates: {
        charname: string;
        css: string;
        hidden: boolean;
        playerName: string;
    };
    settings: AVSettingsData;
    user: User;
    video: { muted: boolean; show: boolean; volume: number };
    volume: { field: DataField; show: boolean; value: number };
}
```

## Properties

### charname

- **charname**: `string`  
  The user's character name.

### controls

- **controls**: `Record<string, CameraViewControlContext>`  

### css

- **css**: `string`  
  The CSS class of the user's camera dock.

### hasAudio

- **hasAudio**: `boolean`  
  Whether the user is broadcasting audio.

### hasVideo

- **hasVideo**: `boolean`  
  Whether the user is broadcasting video.

### hidden

- **hidden**: `boolean`  
  Whether the main camera dock is hidden.

### local

- **local**: `boolean`  
  Whether the user's AV stream is local.

### nameplates

- **nameplates**:  
  ```typescript
  {
      charname: string;
      css: string;
      hidden: boolean;
      playerName: string;
  }
  ```
  
  - **charname**: `string`  
    Whether to show character names on nameplates.  
  - **css**: `string`  
    Nameplate CSS classes.  
  - **hidden**: `boolean`  
    Whether camera nameplates are entirely hidden.  
  - **playerName**: `string`  
    Whether to show player names on nameplates.

### settings

- **settings**: [`AVSettingsData`](https://foundryvtt.com/api/interfaces/foundry.AVSettingsData.html)  
  The user's AV settings.

### user

- **user**: `User`  
  The User instance.

### video

- **video**:  
  ```typescript
  {
      muted: boolean;
      show: boolean;
      volume: number;
  }
  ```
  
  - **muted**: `boolean`  
    Whether to mute the video stream's audio.  
  - **show**: `boolean`  
    Whether to show this user's camera.  
  - **volume**: `number`  
    The video stream's volume.

### volume

- **volume**:  
  ```typescript
  {
      field: DataField;
      show: boolean;
      value: number;
  }
  ```
  
  - **field**: `DataField`  
    The volume range field.  
  - **show**: `boolean`  
    Whether to show a volume bar for this user.  
  - **value**: `number`  
    The user's configured volume level.