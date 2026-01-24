# preUpdateDocument | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
preUpdateDocument(
    document: Document<object, DocumentConstructionContext>,
    changed: object,
    options: Partial<DatabaseUpdateOperation>,
    userId: string,
): boolean | void
```

A hook event that fires for every Document type before execution of an update workflow.  
Substitute the Document name in the hook event to target a specific Document type, for example `"preUpdateActor"`.  
This hook only fires for the client who is initiating the update request.

The hook provides the differential data which will be used to update the Document. Hooked functions may modify that data or prevent the workflow entirely by explicitly returning `false`.

### Parameters

- **document**: [Document\<object, DocumentConstructionContext\>](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
  The Document instance being updated
- **changed**: `object`  
  Differential data that will be used to update the document
- **options**: `Partial<DatabaseUpdateOperation>`  
  Additional options which modify the update request  
  ([DatabaseUpdateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html))
- **userId**: `string`  
  [The ID of the requesting user, always `game.user.id`](http://game.user.id/)

### Returns

`boolean` | `void`  
Explicitly return `false` to prevent update of this Document.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)