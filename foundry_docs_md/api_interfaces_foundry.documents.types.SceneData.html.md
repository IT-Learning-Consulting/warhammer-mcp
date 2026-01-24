# SceneData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface SceneData {
    _id: null | string;
    _stats: DocumentStats;
    active?: boolean;
    background?: null | TextureData;
    backgroundColor?: null | string;
    base?: EnvironmentData;
    cycle?: boolean;
    darkness?: number;
    drawings?: DrawingData[];
    environment?: SceneEnvironmentData;
    flags: DocumentFlags;
    fogExploration?: boolean;
    fogExploredColor?: null | string;
    fogOverlay?: null | string;
    fogReset?: number;
    fogUnexploredColor?: null | string;
    folder: null | string;
    foreground?: null | string;
    foregroundElevation?: number;
    grid?: GridData;
    height?: number;
    initial?: null | { scale: number; x: number; y: number };
    journal: null | string;
    journalEntryPage: null | string;
    lights?: AmbientLightData[];
    name: string;
    navigation?: boolean;
    navName?: string;
    navOrder?: number;
    notes?: NoteData[];
    ownership?: object;
    padding?: number;
    playlist: null | string;
    playlistSound: null | string;
    regions?: RegionData[];
    sort?: number;
    sounds?: AmbientSoundData[];
    templates?: MeasuredTemplateData[];
    thumb?: null | string;
    tiles?: TileData[];
    tokens?: TokenData[];
    tokenVision?: boolean;
    walls?: WallData[];
    weather?: string;
    width?: number;
}
```

## Properties

### _id
**Type:** `null | string`  
The `_id` which uniquely identifies this Scene document.

### _stats
**Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
An object of creation and access information.

### active (optional)
**Type:** `boolean`  
Is this scene currently active? Only one scene may be active at a given time.

### background (optional)
**Type:** `null | TextureData`  
An image or video file that provides the background texture for the scene.  
See [TextureData](https://foundryvtt.com/api/classes/foundry.data.TextureData.html).

### backgroundColor (optional)
**Type:** `null | string`  
The color of the canvas displayed behind the scene background.

### base (optional)
**Type:** [EnvironmentData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EnvironmentData.html)  
The base ambience values pertaining to the Scene.

### cycle (optional)
**Type:** `boolean`  
If cycling is activated for the Scene, between base and darkness environment data.

### darkness (optional)
**Type:** `number`  
The ambient darkness level in this Scene, where 0 represents midday (maximum illumination) and 1 represents midnight (maximum darkness).

### drawings (optional)
**Type:** `DrawingData[]`  
A collection of embedded Drawing objects.  
See [DrawingData](https://foundryvtt.com/api/interfaces/foundry.documents.types.DrawingData.html).

### environment (optional)
**Type:** [SceneEnvironmentData](https://foundryvtt.com/api/interfaces/foundry.documents.types.SceneEnvironmentData.html)  
The environment data applied to the Scene.

### flags
**Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
An object of optional key/value flags.

### fogExploration (optional)
**Type:** `boolean`  
Should fog exploration progress be tracked for this Scene?

### fogExploredColor (optional)
**Type:** `null | string`  
A color tint applied to explored regions of fog of war.

### fogOverlay (optional)
**Type:** `null | string`  
A special overlay image or video texture which is used for fog of war.

### fogReset (optional)
**Type:** `number`  
The timestamp at which fog of war was last reset for this Scene.

### fogUnexploredColor (optional)
**Type:** `null | string`  
A color tint applied to unexplored regions of fog of war.

### folder
**Type:** `null | string`  
The `_id` of a Folder which contains this Actor.

### foreground (optional)
**Type:** `null | string`  
An image or video file path providing foreground media for the scene.

### foregroundElevation (optional)
**Type:** `number`  
The elevation of the foreground image.

### grid (optional)
**Type:** [GridData](https://foundryvtt.com/api/interfaces/foundry.documents.types.GridData.html)  
Grid configuration for the scene.

### height (optional)
**Type:** `number`  
The height of the scene canvas, normally the height of the background media.

### initial (optional)
**Type:** `null | { scale: number; x: number; y: number }`  
The initial view coordinates for the scene.

### journal
**Type:** `null | string`  
A JournalEntry document which provides narrative details about this Scene.

### journalEntryPage
**Type:** `null | string`  
A JournalEntry document which provides narrative details about this Scene.

### lights (optional)
**Type:** `AmbientLightData[]`  
A collection of embedded AmbientLight objects.  
See [AmbientLightData](https://foundryvtt.com/api/interfaces/foundry.documents.types.AmbientLightData.html).

### name
**Type:** `string`  
The name of this scene.

### navigation (optional)
**Type:** `boolean`  
Is this scene displayed in the top navigation bar?

### navName (optional)
**Type:** `string`  
A string which overrides Scene name for display in the navigation bar.

### navOrder (optional)
**Type:** `number`  
The sorting order of this Scene in the navigation bar relative to siblings.

### notes (optional)
**Type:** `NoteData[]`  
A collection of embedded Note objects.  
See [NoteData](https://foundryvtt.com/api/interfaces/foundry.documents.types.NoteData.html).

### ownership (optional)
**Type:** `object`  
An object which configures ownership of this Scene.

### padding (optional)
**Type:** `number`  
The proportion of canvas padding applied around the outside of the scene dimensions to provide additional buffer space.

### playlist
**Type:** `null | string`  
A linked Playlist document which should begin automatically playing when this Scene becomes active.

### playlistSound
**Type:** `null | string`  
A linked PlaylistSound document from the selected playlist that will begin automatically playing when this Scene becomes active.

### regions (optional)
**Type:** `RegionData[]`  
A collection of embedded Region objects.  
See [RegionData](https://foundryvtt.com/api/interfaces/foundry.documents.types.RegionData.html).

### sort (optional)
**Type:** `number`  
The numeric sort value which orders this Actor relative to its siblings.

### sounds (optional)
**Type:** `AmbientSoundData[]`  
A collection of embedded AmbientSound objects.  
See [AmbientSoundData](https://foundryvtt.com/api/interfaces/foundry.documents.types.AmbientSoundData.html).

### templates (optional)
**Type:** `MeasuredTemplateData[]`  
A collection of embedded MeasuredTemplate objects.  
See [MeasuredTemplateData](https://foundryvtt.com/api/interfaces/foundry.documents.types.MeasuredTemplateData.html).

### thumb (optional)
**Type:** `null | string`  
A thumbnail image which depicts the scene at lower resolution.

### tiles (optional)
**Type:** `TileData[]`  
A collection of embedded Tile objects.  
See [TileData](https://foundryvtt.com/api/interfaces/foundry.documents.types.TileData.html).

### tokens (optional)
**Type:** `TokenData[]`  
A collection of embedded Token objects.  
See [TokenData](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenData.html).

### tokenVision (optional)
**Type:** `boolean`  
Do Tokens require vision in order to see the Scene environment?

### walls (optional)
**Type:** `WallData[]`  
A collection of embedded Wall objects.  
See [WallData](https://foundryvtt.com/api/interfaces/foundry.documents.types.WallData.html).

### weather (optional)
**Type:** `string`  
A named weather effect which should be rendered in this Scene.

### width (optional)
**Type:** `number`  
The width of the scene canvas, normally the width of the background media.