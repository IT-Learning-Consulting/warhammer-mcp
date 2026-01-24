# NoteData

## Interface NoteData

```typescript
interface NoteData {
  _id: null | string;
  elevation?: number;
  entryId?: null | string;
  flags: DocumentFlags;
  fontFamily?: string;
  fontSize?: number;
  global?: boolean;
  iconSize?: number;
  pageId?: null | string;
  sort?: number;
  text?: string;
  textAnchor?: number;
  textColor?: string;
  texture?: TextureData;
  x?: number;
  y?: number;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this BaseNote embedded document

- **elevation?**: `number`  
  The elevation

- **entryId?**: `null | string`  
  The _id of a JournalEntry document which this Note represents

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **fontFamily?**: `string`  
  The font family used to display the text label on this note, defaults to CONFIG.defaultFontFamily

- **fontSize?**: `number`  
  The font size used to display the text label on this note

- **global?**: `boolean`  
  Whether this map pin is globally visible or requires LoS to see.

- **iconSize?**: `number`  
  The pixel size of the map note icon

- **pageId?**: `null | string`  
  The _id of a specific JournalEntryPage document which this Note represents

- **sort?**: `number`  
  The sort order

- **text?**: `string`  
  Optional text which overrides the title of the linked Journal Entry

- **textAnchor?**: `number`  
  A value in CONST.TEXT_ANCHOR_POINTS which defines where the text label anchors to the note icon.

- **textColor?**: `string`  
  The string that defines the color with which the note text is rendered

- **texture?**: [TextureData](https://foundryvtt.com/api/classes/foundry.data.TextureData.html)  
  An image icon used to represent this note

- **x?**: `number`  
  The x-coordinate position of the center of the note icon

- **y?**: `number`  
  The y-coordinate position of the center of the note icon