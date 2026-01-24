# updateDocument | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
updateDocument(
    document: Document<object, DocumentConstructionContext>,
    changed: object,
    options: Partial<DatabaseUpdateOperation>,
    userId: string,
): void
```

A hook event that fires for every Document type after conclusion of an update workflow.  
Substitute the Document name in the hook event to target a specific Document type, for example `"updateActor"`. This hook fires for all connected clients after the update has been processed.

**Parameters**

- **document**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)`>`

  The existing Document which was updated

- **changed**: `object`

  Differential data that was used to update the document

- **options**: `Partial`<[DatabaseUpdateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html)>

  Additional options which modified the update request

- **userId**: `string`

  The ID of the User who triggered the update workflow

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)