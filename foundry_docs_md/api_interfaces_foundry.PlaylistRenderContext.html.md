# PlaylistRenderContext | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface PlaylistRenderContext {
    css: string;
    disabled: boolean;
    expanded: boolean;
    id: string;
    isOwner: boolean;
    mode: PlaylistDirectoryControlContext;
    name: string;
    sounds: PlaylistSoundRenderContext[];
}
```

## Properties

- **css**: *string*  
  The CSS class.

- **disabled**: *boolean*  
  Whether the Playlist is currently disabled.

- **expanded**: *boolean*  
  Whether the Playlist is expanded in the sidebar.

- **id**: *string*  
  The Playlist ID.

- **isOwner**: *boolean*  
  Whether the current user has ownership of this Playlist.

- **mode**: [PlaylistDirectoryControlContext](https://foundryvtt.com/api/interfaces/foundry.PlaylistDirectoryControlContext.html)  
  The mode icon context.

- **name**: *string*  
  The Playlist name.

- **sounds**: [PlaylistSoundRenderContext](https://foundryvtt.com/api/interfaces/foundry.PlaylistSoundRenderContext.html)[]  
  Render context for this Playlist's PlaylistSounds.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)