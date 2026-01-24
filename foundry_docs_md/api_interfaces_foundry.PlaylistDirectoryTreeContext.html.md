# PlaylistDirectoryTreeContext | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface: PlaylistDirectoryTreeContext

```typescript
interface PlaylistDirectoryTreeContext {
    children: PlaylistDirectoryTreeContext[];
    depth: number;
    entries: PlaylistRenderContext[];
    folder: Folder;
}
```

### Properties

- **children**: `PlaylistDirectoryTreeContext[]`  
  Render context for this node's children.

- **depth**: `number`  
  The node's depth in the tree.

- **entries**: `PlaylistRenderContext[]`  
  Render context for the Playlist documents at this node.

- **folder**: `Folder`  
  The Folder document that represents this node.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[PlaylistRenderContext](https://foundryvtt.com/api/interfaces/foundry.PlaylistRenderContext.html)  
[Folder](https://foundryvtt.com/api/modules/foundry.html)