# Item | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable** `Item Const`

Configuration for Item document

```typescript
Item: {
    collection: typeof Items;
    compendiumBanner: string;
    compendiumIndexFields: string[];
    dataModels: Record<string, typeof TypeDataModel>;
    documentClass: typeof documents.Item;
    sidebarIcon: string;
    typeIcons: Record<string, string>;
    typeLabels: Record<string, string>;
} = ...
```

- **collection**: `typeof [Items](https://foundryvtt.com/api/classes/foundry.documents.collections.Items.html)`
- **compendiumBanner**: `string`
- **compendiumIndexFields**: `string[]`
- **dataModels**: `Record<string, typeof [TypeDataModel](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)>`
- **documentClass**: `typeof [documents](https://foundryvtt.com/api/modules/foundry.documents.html).[Item](https://foundryvtt.com/api/classes/foundry.documents.Item.html)`
- **sidebarIcon**: `string`
- **typeIcons**: `Record<string, string>`
- **typeLabels**: `Record<string, string>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)