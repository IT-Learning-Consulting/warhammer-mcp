# _PlaylistDirectoryRenderContext | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface _PlaylistDirectoryRenderContext {
  controls: {
    environment: PlaylistDirectoryVolumeContext;
    expanded: boolean;
    interface: PlaylistDirectoryVolumeContext;
    music: PlaylistDirectoryVolumeContext;
  };
  currentlyPlaying: {
    class: string;
    location: { bottom: boolean; top: boolean };
    pin: { caret: string; label: string };
    sounds: PlaylistSoundRenderContext[];
  };
  tree: PlaylistDirectoryTreeContext;
}
```

## Properties

### controls

Volume control context.

- **environment**: _PlaylistDirectoryVolumeContext_  
  Environment volume context.

- **expanded**: _boolean_  
  The expanded state of the volume controls.

- **interface**: _PlaylistDirectoryVolumeContext_  
  Interface volume context.

- **music**: _PlaylistDirectoryVolumeContext_  
  Music volume context.

### currentlyPlaying

Currently playing context.

- **class**: _string_  
  The CSS class of the currently playing widget.

- **location**:  
  - **bottom**: _boolean_  
    The widget is affixed to the bottom of the directory.
  - **top**: _boolean_  
    The widget is affixed to the top of the directory.

- **pin**:  
  Render context for the currently playing pin icon.
  - **caret**: _string_  
    The icon class.
  - **label**: _string_  
    The icon tooltip.

- **sounds**: _PlaylistSoundRenderContext[]_  
  Render context for the currently playing PlaylistSound documents.

### tree

- **tree**: _PlaylistDirectoryTreeContext_  
  Render context for the directory tree.

---

Foundry Virtual Tabletop - API Documentation - Version 13  
[https://foundryvtt.com/api/](https://foundryvtt.com/api/)  
[Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/modules.html) | [foundry](https://foundryvtt.com/api/modules/foundry.html) | [_PlaylistDirectoryRenderContext Interface](https://foundryvtt.com/api/interfaces/foundry._PlaylistDirectoryRenderContext.html)