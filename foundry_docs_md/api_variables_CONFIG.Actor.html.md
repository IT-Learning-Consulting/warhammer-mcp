# Actor | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable `Actor` Const**

```typescript
Actor: {
    collection: typeof Actors;
    compendiumBanner: string;
    compendiumIndexFields: string[];
    dataModels: Record<string, typeof TypeDataModel>;
    documentClass: typeof documents.Actor;
    sidebarIcon: string;
    trackableAttributes: Record<string, string>;
    typeIcons: Record<string, string>;
    typeLabels: Record<string, string>;
} = ...
```

Configuration for the Actor document

### Properties

- **collection**: `typeof [Actors](https://foundryvtt.com/api/classes/foundry.documents.collections.Actors.html)`
- **compendiumBanner**: `string`
- **compendiumIndexFields**: `string[]`
- **dataModels**: `Record<string, typeof [TypeDataModel](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)>`
- **documentClass**: `typeof documents.[Actor](https://foundryvtt.com/api/classes/foundry.documents.Actor.html)`
- **sidebarIcon**: `string`
- **trackableAttributes**: `Record<string, string>`
- **typeIcons**: `Record<string, string>`
- **typeLabels**: `Record<string, string>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)