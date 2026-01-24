# deleteDocument | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
deleteDocument(
    document: Document<object, DocumentConstructionContext>, 
    options: Partial<DatabaseDeleteOperation>, 
    userId: string,
): void
```

A hook event that fires for every Document type after conclusion of a deletion workflow.  
Substitute the Document name in the hook event to target a specific Document type, for  
example `"deleteActor"`. This hook fires for all connected clients after the deletion has been  
processed.

**Parameters**

- **document**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The existing Document which was deleted

- **options**: Partial<[DatabaseDeleteOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html)>  
  Additional options which modified the deletion request

- **userId**: `string`  
  The ID of the User who triggered the deletion workflow

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)