# ActiveEffect | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable** `ActiveEffect : {`  
&nbsp;&nbsp;&nbsp;&nbsp;**dataModels**: `Record<string, typeof TypeDataModel>;`  
&nbsp;&nbsp;&nbsp;&nbsp;**documentClass**: `typeof documents.ActiveEffect;`  
&nbsp;&nbsp;&nbsp;&nbsp;**legacyTransferral**: `boolean;`  
&nbsp;&nbsp;&nbsp;&nbsp;**typeIcons**: `Record<string, string>;`  
&nbsp;&nbsp;&nbsp;&nbsp;**typeLabels**: `Record<string, string>;`  
`}` = ...

Configuration for the ActiveEffect embedded document type

## Type declaration

- **dataModels**: `Record<string, typeof [TypeDataModel](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)>`
- **documentClass**: `typeof [documents](https://foundryvtt.com/api/modules/foundry.documents.html).[ActiveEffect](https://foundryvtt.com/api/classes/foundry.documents.ActiveEffect.html)`
- **legacyTransferral**: `boolean`  
  If true, Active Effects on Items will be copied to the Actor when the Item is created on the Actor if the Active Effect's transfer property is true, and will be deleted when that Item is deleted from the Actor. If false, Active Effects are never copied to the Actor, but will still apply to the Actor from within the Item if the transfer property on the Active Effect is true.

  **Deprecated**  
  since V11. It can be set to true until V14, at which point it will be removed.

- **typeIcons**: `Record<string, string>`
- **typeLabels**: `Record<string, string>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)