# Cards | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable** `Cards` Const

Configuration for the Cards primary Document type

```typescript
Cards: {
    collection: typeof CardStacks;
    compendiumBanner: string;
    compendiumIndexFields: string[];
    dataModels: Record<string, typeof TypeDataModel>;
    documentClass: typeof documents.Cards;
    presets: {
        pokerDark: { label: string; src: string; type: string };
        pokerLight: { label: string; src: string; type: string };
    };
    sidebarIcon: string;
    typeIcons: Record<string, string>;
    typeLabels: Record<string, string>;
} = ...
```

### Properties

- **collection**: `typeof CardStacks`  
  The collection class for card stacks.

- **compendiumBanner**: `string`  
  The banner image used in the compendium UI.

- **compendiumIndexFields**: `string[]`  
  Array of fields used for the compendium index.

- **dataModels**: `Record<string, typeof TypeDataModel>`  
  A record mapping string keys to data model types.

- **documentClass**: `typeof documents.Cards`  
  The primary document class for cards.

- **presets**:  
  - **pokerDark**:  
    - **label**: `string`  
    - **src**: `string`  
    - **type**: `string`  
  - **pokerLight**:  
    - **label**: `string`  
    - **src**: `string`  
    - **type**: `string`

- **sidebarIcon**: `string`  
  Icon used in the sidebar for the cards document type.

- **typeIcons**: `Record<string, string>`  
  Mapping of card types to their icon strings.

- **typeLabels**: `Record<string, string>`  
  Mapping of card types to their label strings.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[CONFIG](https://foundryvtt.com/api/modules/CONFIG.html) / [Cards](https://foundryvtt.com/api/variables/CONFIG.Cards.html)  
[CardStacks](https://foundryvtt.com/api/classes/foundry.documents.collections.CardStacks.html)  
[TypeDataModel](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)  
[documents](https://foundryvtt.com/api/modules/foundry.documents.html) / [Cards](https://foundryvtt.com/api/classes/foundry.documents.Cards.html)