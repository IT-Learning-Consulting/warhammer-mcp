# Combat | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable** `Combat` **Const**

```typescript
Combat: {
    collection: typeof CombatEncounters;
    dataModels: Record<string, typeof TypeDataModel>;
    documentClass: typeof documents.Combat;
    initiative: { decimals: number; formula: null };
    initiativeIcon: { hover: string; icon: string };
    settings: CombatConfiguration;
    sidebarIcon: string;
    sounds: {
        epic: {
            label: string;
            nextUp: string[];
            startEncounter: string[];
            yourTurn: string[];
        };
        mc: {
            label: string;
            nextUp: string[];
            startEncounter: string[];
            yourTurn: string[];
        };
    };
    typeIcons: Record<string, string>;
    typeLabels: Record<string, string>;
} = ...
```

Configuration for the Combat document

## Type declaration

- **collection**: `typeof [CombatEncounters](https://foundryvtt.com/api/classes/foundry.documents.collections.CombatEncounters.html)`
- **dataModels**: `Record<string, typeof [TypeDataModel](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)>`
- **documentClass**: `typeof [documents](https://foundryvtt.com/api/modules/foundry.documents.html).[Combat](https://foundryvtt.com/api/classes/foundry.documents.Combat.html)`
- **initiative**:  
  - **decimals**: `number`  
  - **formula**: `null`
- **initiativeIcon**:  
  - **hover**: `string`  
  - **icon**: `string`
- **settings**: `[CombatConfiguration](https://foundryvtt.com/api/classes/foundry.data.CombatConfiguration.html)`
- **sidebarIcon**: `string`
- **sounds**:  
  - **epic**:  
    - **label**: `string`  
    - **nextUp**: `string[]`  
    - **startEncounter**: `string[]`  
    - **yourTurn**: `string[]`
  - **mc**:  
    - **label**: `string`  
    - **nextUp**: `string[]`  
    - **startEncounter**: `string[]`  
    - **yourTurn**: `string[]`
- **typeIcons**: `Record<string, string>`
- **typeLabels**: `Record<string, string>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)