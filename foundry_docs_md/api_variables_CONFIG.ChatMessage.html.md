# ChatMessage | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable** `ChatMessage` Const

```typescript
ChatMessage: {
    batchSize: number;
    collection: typeof ChatMessages;
    dataModels: Record<string, typeof TypeDataModel>;
    documentClass: typeof documents.ChatMessage;
    popoutClass: typeof ChatPopout;
    sidebarIcon: string;
    template: string;
    typeIcons: Record<string, string>;
    typeLabels: Record<string, string>;
} = ...
```

Configuration for the ChatMessage document

### Type declaration

- **batchSize**: `number`
- **collection**: `typeof [ChatMessages](https://foundryvtt.com/api/classes/foundry.documents.collections.ChatMessages.html)`
- **dataModels**: `Record<string, typeof [TypeDataModel](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)>`
- **documentClass**: `typeof [documents](https://foundryvtt.com/api/modules/foundry.documents.html).[ChatMessage](https://foundryvtt.com/api/classes/foundry.documents.ChatMessage.html)`
- **popoutClass**: `typeof [ChatPopout](https://foundryvtt.com/api/classes/foundry.applications.sidebar.apps.ChatPopout.html)`
- **sidebarIcon**: `string`
- **template**: `string`
- **typeIcons**: `Record<string, string>`
- **typeLabels**: `Record<string, string>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)