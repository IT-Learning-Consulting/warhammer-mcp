# CardData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CardData {
    _id: null | string;
    back: CardFaceData;
    description?: string;
    drawn: boolean;
    face: null | number;
    faces: CardFaceData[];
    flags: DocumentFlags;
    height: number;
    name: string;
    origin: string;
    rotation: number;
    sort: number;
    suit?: string;
    system?: object;
    type: string;
    value?: number;
    width: number;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this Card document

- **back**: [CardFaceData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CardFaceData.html)  
  An object of face data which describes the back of this card

- **description?**: `string`  
  A text description of this card which applies to all faces

- **drawn**: `boolean`  
  Whether this card is currently drawn from its source deck

- **face**: `null | number`  
  The index of the currently displayed face, or null if the card is face-down

- **faces**: `CardFaceData[]`  
  An array of face data which represent displayable faces of this card

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **height**: `number`  
  The visible height of this card

- **name**: `string`  
  The text name of this card

- **origin**: `string`  
  The document ID of the origin deck to which this card belongs

- **rotation**: `number`  
  The angle of rotation of this card

- **sort**: `number`  
  The sort order of this card relative to others in the same stack

- **suit?**: `string`  
  An optional suit designation which is used by default sorting

- **system?**: `object`  
  Game system data which is defined by the system template.json model

- **type**: `string`  
  A category of card (for example, a suit) to which this card belongs

- **value?**: `number`  
  An optional numeric value of the card which is used by default sorting

- **width**: `number`  
  The visible width of this card