# DatabaseCreateOperation

```typescript
interface DatabaseCreateOperation {
    _createData?: Record<string, object>;
    _result?: (string | object)[];
    action: "create";
    broadcast: boolean;
    data: object[];
    keepEmbeddedIds?: boolean;
    keepId?: boolean;
    modifiedTime?: number;
    noHook?: boolean;
    pack: null | string;
    parent?: null | Document<object, DocumentConstructionContext>;
    parentUuid?: null | string;
    render?: boolean;
    renderSheet?: boolean;
}
```

## Properties

- **_createData?**: `Record<string, object>`
  
  Used internally by server-side backend

- **_result?**: `(string | object)[]`
  
  Used internally by the server-side backend

- **action**: `"create"`
  
  The action of this database operation

- **broadcast**: `boolean`
  
  Whether the database operation is broadcast to other connected clients

- **data**: `object[]`
  
  An array of data objects from which to create Documents

- **keepEmbeddedIds?**: `boolean`
  
  Retain the _id values of embedded document data instead of generating new ids for each embedded document

- **keepId?**: `boolean`
  
  Retain the _id values of provided data instead of generating new ids

- **modifiedTime?**: `number`
  
  The timestamp when the operation was performed

- **noHook?**: `boolean`
  
  Block the dispatch of hooks related to this operation

- **pack**: `null | string`
  
  A compendium collection ID which contains the Documents

- **parent?**: `null | Document<object, DocumentConstructionContext>`
  
  A parent Document within which Documents are embedded  
  See: [Document class](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
  See: [DocumentConstructionContext interface](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)

- **parentUuid?**: `null | string`
  
  A parent Document UUID provided when the parent instance is unavailable

- **render?**: `boolean`
  
  Re-render Applications whose display depends on the created Documents

- **renderSheet?**: `boolean`
  
  Render the sheet Application for any created Documents

---

Foundry Virtual Tabletop - API Documentation - Version 13  
[https://foundryvtt.com/api/index.html](https://foundryvtt.com/api/index.html)