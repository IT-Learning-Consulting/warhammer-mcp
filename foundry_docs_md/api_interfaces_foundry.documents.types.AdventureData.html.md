# AdventureData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface AdventureData {
    _id: null | string;
    _stats: DocumentStats;
    actors: ActorData[];
    caption: string;
    cards: CardsData[];
    combats: CombatData[];
    description: string;
    flags: DocumentFlags;
    folders: FolderData[];
    img: string;
    items: ItemData[];
    journal: JournalEntryData[];
    macros: MacroData[];
    name: string;
    playlists: PlaylistData[];
    scenes: SceneData[];
    sort: number;
    tables: RollTableData[];
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this Adventure document

- **_stats**: [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
  An object of creation and access information

- **actors**: [ActorData](https://foundryvtt.com/api/interfaces/foundry.documents.types.ActorData.html)[]  
  An array of included Actor documents

- **caption**: `string`  
  A string caption displayed under the primary image banner

- **cards**: [CardsData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CardsData.html)[]  
  An array of included Cards documents

- **combats**: [CombatData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CombatData.html)[]  
  An array of included Combat documents

- **description**: `string`  
  An HTML text description for the adventure

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **folders**: [FolderData](https://foundryvtt.com/api/interfaces/foundry.documents.types.FolderData.html)[]  
  An array of included Folder documents

- **img**: `string`  
  The file path for the primary image of the adventure

- **items**: [ItemData](https://foundryvtt.com/api/interfaces/foundry.documents.types.ItemData.html)[]  
  An array of included Item documents

- **journal**: [JournalEntryData](https://foundryvtt.com/api/interfaces/foundry.documents.types.JournalEntryData.html)[]  
  An array of included JournalEntry documents

- **macros**: [MacroData](https://foundryvtt.com/api/interfaces/foundry.documents.types.MacroData.html)[]  
  An array of included Macro documents

- **name**: `string`  
  The human-readable name of the Adventure

- **playlists**: [PlaylistData](https://foundryvtt.com/api/interfaces/foundry.documents.types.PlaylistData.html)[]  
  An array of included Playlist documents

- **scenes**: [SceneData](https://foundryvtt.com/api/interfaces/foundry.documents.types.SceneData.html)[]  
  An array of included Scene documents

- **sort**: `number`  
  The sort order of this adventure relative to its siblings

- **tables**: [RollTableData](https://foundryvtt.com/api/interfaces/foundry.documents.types.RollTableData.html)[]  
  An array of included RollTable documents

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)