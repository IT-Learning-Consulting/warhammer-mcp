# updateCompendium | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `updateCompendium`

```typescript
updateCompendium(
    pack: CompendiumCollection,
    documents: Document<object, DocumentConstructionContext>[],
    options: object,
    userId: string,
): void
```

A hook event that fires whenever the contents of a Compendium pack were modified. This hook fires for all connected clients after the update has been processed.

**Parameters**

- **pack**: [CompendiumCollection](https://foundryvtt.com/api/classes/foundry.documents.collections.CompendiumCollection.html)  
  The Compendium pack being modified

- **documents**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>[]  
  The locally-cached Documents which were modified in the operation

- **options**: `object`  
  Additional options which modified the modification request

- **userId**: `string`  
  The ID of the User who triggered the modification workflow

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)