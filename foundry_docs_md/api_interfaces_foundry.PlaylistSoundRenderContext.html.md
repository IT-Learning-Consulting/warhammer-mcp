# PlaylistSoundRenderContext | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface PlaylistSoundRenderContext {
    css: string;
    currentTime: string;
    durationTime: string;
    id: string;
    isOwner: boolean;
    name: string;
    pause: { disabled: boolean; icon: string; paused: boolean };
    play: PlaylistDirectoryControlContext;
    playing: boolean;
    playlistId: string;
    repeat: boolean;
    volume: PlaylistDirectoryVolumeContext;
}
```

## Properties

### **css**

- Type: `string`

The CSS class.

---

### **currentTime**

- Type: `string`

The current playing timestamp.

---

### **durationTime**

- Type: `string`

The duration timestamp.

---

### **id**

- Type: `string`

The PlaylistSound ID.

---

### **isOwner**

- Type: `boolean`

Whether the current user has ownership of this PlaylistSound.

---

### **name**

- Type: `string`

The track name.

---

### **pause**

- Type: `{ disabled: boolean; icon: string; paused: boolean }`

PlaylistSound pause context.

#### Type declaration

- **disabled**: `boolean`  
  Whether the pause button is disabled.

- **icon**: `string`  
  The pause icon.

- **paused**: `boolean`  
  Whether the PlaylistSound is currently paused.

---

### **play**

- Type: [`PlaylistDirectoryControlContext`](https://foundryvtt.com/api/interfaces/foundry.PlaylistDirectoryControlContext.html)

The play button context.

---

### **playing**

- Type: `boolean`

Whether the PlaylistSound is currently playing.

---

### **playlistId**

- Type: `string`

The parent Playlist ID.

---

### **repeat**

- Type: `boolean`

Whether the track is set to loop.

---

### **volume**

- Type: [`PlaylistDirectoryVolumeContext`](https://foundryvtt.com/api/interfaces/foundry.PlaylistDirectoryVolumeContext.html)

PlaylistSound volume context.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)