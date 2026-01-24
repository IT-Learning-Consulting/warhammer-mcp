# preCreateDocument | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
preCreateDocument(
    document: Document<object, DocumentConstructionContext>,
    data: object,
    options: Partial<DatabaseCreateOperation>,
    userId: string,
): boolean | void
```

A hook event that fires for every Document type before execution of a creation workflow.  
Substitute the Document name in the hook event to target a specific Document type, for example `"preCreateActor"`. This hook only fires for the client who is initiating the creation request.

The hook provides the pending document instance which will be used for the Document creation. Hooked functions may modify the pending document with `updateSource`, or prevent the workflow entirely by returning `false`.

### Parameters

- **document**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)&lt;object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)&gt;  
  The pending document which is requested for creation

- **data**: `object`  
  The initial data object provided to the document creation request

- **options**: `Partial<[DatabaseCreateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html)>`  
  Additional options which modify the creation request

- **userId**: `string`  
  [The ID of the requesting user, always `game.user.id`](http://game.user.id/)

### Returns

- `boolean` | `void`  
Explicitly return `false` to prevent creation of this Document

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)