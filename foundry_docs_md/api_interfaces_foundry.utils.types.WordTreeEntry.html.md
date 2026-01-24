# WordTreeEntry

A leaf entry in the tree.

```typescript
interface WordTreeEntry {
    documentName: string;
    entry: object | Document<object, DocumentConstructionContext>;
    pack?: string;
    uuid: string;
}
```

## Properties

- **documentName**: `string`  
  The document type.

- **entry**: `object` | [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  An object that this entry represents.

- **pack?**: `string`  
  The pack ID. *(optional)*

- **uuid**: `string`  
  The document's UUID.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)