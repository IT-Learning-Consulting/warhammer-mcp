# PlaylistData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface PlaylistData {
  _id: null | string;
  _stats: DocumentStats;
  channel: string;
  description: string;
  fade?: number;
  flags: DocumentFlags;
  folder: null | string;
  mode?: number;
  name: string;
  ownership?: object;
  playing?: boolean;
  seed?: number;
  sort?: number;
  sorting: string;
  sounds: PlaylistSoundData[];
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this Playlist document

- **_stats**: [`DocumentStats`](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
  An object of creation and access information

- **channel**: `string`  
  A channel in `CONST.AUDIO_CHANNELS` where all sounds in this playlist are played

- **description**: `string`  
  The description of this playlist

### Optional Properties

- **fade**?: `number`  
  A duration in milliseconds to fade volume transition

- **flags**: [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **folder**: `null | string`  
  The _id of a Folder which contains this playlist

- **mode**?: `number`  
  The playback mode for sounds in this playlist

- **name**: `string`  
  The name of this playlist

- **ownership**?: `object`  
  An object which configures ownership of this Playlist

- **playing**?: `boolean`  
  Is this playlist currently playing?

- **seed**?: `number`  
  A seed used for playlist randomization to guarantee that all clients generate the same random order.

- **sort**?: `number`  
  The numeric sort value which orders this playlist relative to its siblings

- **sorting**: `string`  
  The sorting mode used for this playlist.

- **sounds**: [`PlaylistSoundData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.PlaylistSoundData.html)[]  
  A Collection of PlaylistSounds embedded documents which belong to this playlist