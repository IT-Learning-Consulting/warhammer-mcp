# createDocument

```typescript
createDocument(
    document: Document<object, DocumentConstructionContext>,
    options: Partial<DatabaseCreateOperation>,
    userId: string,
): void
```

A hook event that fires for every embedded Document type after conclusion of a creation workflow. Substitute the Document name in the hook event to target a specific type, for example `"createToken"`. This hook fires for all connected clients after the creation has been processed.

**Parameters**

- **document**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>
  
  The new Document instance which has been created
  
- **options**: Partial<[DatabaseCreateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html)>
  
  Additional options which modified the creation request
  
- **userId**: string
  
  The ID of the User who triggered the creation workflow

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)