# buildUuid

```typescript
buildUuid(
    context: {
        documentName?: string;
        id: string;
        pack?: null | string;
        parent?: null | Document;
    },
): null | string
```

Build a Universally Unique Identifier (uuid) from possibly limited data. An attempt will be made to resolve omitted components, but an identifier and at least one of `documentName`, `parent`, and `pack` are required.

## Parameters

- **context**:  
  Data for building the uuid  
  - **documentName**?: `string`  
    The document name (or type)  
  - **id**: `string`  
    The identifier of the document  
  - **pack**?: `null` | `string`  
    The document's compendium pack, if applicable  
  - **parent**?: `null` | `Document`  
    The document's parent, if any

## Returns

`null` | `string`  
A well-formed Document uuid unless one is unable to be created

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)