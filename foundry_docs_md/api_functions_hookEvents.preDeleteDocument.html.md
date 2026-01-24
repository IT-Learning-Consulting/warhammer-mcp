# preDeleteDocument

## Function preDeleteDocument

```typescript
preDeleteDocument(
    document: Document<object, DocumentConstructionContext>,
    options: Partial<DatabaseDeleteOperation>,
    userId: string,
): boolean | void
```

A hook event that fires for every Document type before execution of a deletion workflow. Substitute the Document name in the hook event to target a specific Document type, for example `"preDeleteActor"`. This hook only fires for the client who is initiating the update request.

The hook provides the Document instance which is requested for deletion. Hooked functions may prevent the workflow entirely by explicitly returning `false`.

### Parameters

- **document**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The Document instance being deleted

- **options**: `Partial`<[DatabaseDeleteOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html)>  
  Additional options which modify the deletion request

- **userId**: `string`  
  [The ID of the requesting user, always `game.user.id`](http://game.user.id/)

### Returns

- `boolean` | `void`  
  Explicitly return `false` to prevent deletion of this Document

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)