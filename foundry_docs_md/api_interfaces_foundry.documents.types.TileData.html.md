# TileData | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface TileData

```typescript
interface TileData {
  _id: null | string;
  alpha?: number;
  elevation?: number;
  flags: DocumentFlags;
  height?: number;
  hidden?: boolean;
  locked?: boolean;
  occlusion?: TileOcclusionData;
  restrictions?: TileRestrictionsData;
  rotation?: number;
  sort?: number;
  texture?: TextureData;
  video?: TileVideoData;
  width?: number;
  x?: number;
  y?: number;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this Tile embedded document

- **alpha?**: `number`  
  The tile opacity

- **elevation?**: `number`  
  The elevation of the tile

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **height?**: `number`  
  The pixel height of the tile

- **hidden?**: `boolean`  
  Is the tile currently hidden?

- **locked?**: `boolean`  
  Is the tile currently locked?

- **occlusion?**: [TileOcclusionData](https://foundryvtt.com/api/interfaces/foundry.documents.types.TileOcclusionData.html)  
  The tile's occlusion settings

- **restrictions?**: [TileRestrictionsData](https://foundryvtt.com/api/interfaces/foundry.documents.types.TileRestrictionsData.html)  
  The tile's restrictions settings

- **rotation?**: `number`  
  The angle of rotation for the tile between 0 and 360

- **sort?**: `number`  
  The z-index ordering of this tile relative to its siblings

- **texture?**: [TextureData](https://foundryvtt.com/api/classes/foundry.data.TextureData.html)  
  An image or video texture which this tile displays.

- **video?**: [TileVideoData](https://foundryvtt.com/api/interfaces/foundry.documents.types.TileVideoData.html)  
  The tile's video settings

- **width?**: `number`  
  The pixel width of the tile

- **x?**: `number`  
  The x-coordinate position of the top-left corner of the tile

- **y?**: `number`  
  The y-coordinate position of the top-left corner of the tile