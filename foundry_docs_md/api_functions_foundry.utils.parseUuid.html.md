# parseUuid

```typescript
parseUuid(
    uuid: string,
    options?: { relative?: Document<object, DocumentConstructionContext> },
): null | ResolvedUUID
```

Parse a UUID into its constituent parts, identifying the type and ID of the referenced document. The `ResolvedUUID` result also identifies a "primary" document which is a root-level document either in the game World or in a Compendium pack which is a parent of the referenced document.

**Parameters**

- **uuid**: `string`  
  The UUID to parse.

- **options** *(optional)*: `{ relative?: Document<object, DocumentConstructionContext> } = {}`  
  Options to configure parsing behavior.

  - **relative** *(optional)*: `Document<object, DocumentConstructionContext>`  
    A document to resolve relative UUIDs against.

**Returns**

`null | ResolvedUUID`  
Returns, if possible, the Collection, Document Type, and Document ID to resolve the parent document, as well as the remaining Embedded Document parts, if any.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)