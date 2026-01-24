# DatabaseDeleteOperation

```typescript
interface DatabaseDeleteOperation {
    _result?: (string | object)[];
    action: "delete";
    broadcast: boolean;
    deleteAll?: boolean;
    ids: string[];
    modifiedTime?: number;
    noHook?: boolean;
    pack: null | string;
    parent?: null | Document<object, DocumentConstructionContext>;
    parentUuid?: null | string;
    render?: boolean;
    replacements?: Record<string, string>;
}
```

## Properties

- **_result?**: `(string | object)[]`  
  An alias for 'ids' used internally by the server-side backend.

- **action**: `"delete"`  
  The action of this database operation.

- **broadcast**: `boolean`  
  Whether the database operation is broadcast to other connected clients.

- **deleteAll?**: `boolean`  
  Delete all documents in the Collection, regardless of _id.

- **ids**: `string[]`  
  An array of Document ids which should be deleted.

- **modifiedTime?**: `number`  
  The timestamp when the operation was performed.

- **noHook?**: `boolean`  
  Block the dispatch of hooks related to this operation.

- **pack**: `null | string`  
  A compendium collection ID which contains the Documents.

- **parent?**: `null | Document<object, DocumentConstructionContext>`  
  A parent Document within which Documents are embedded. See [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html) and [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html).

- **parentUuid?**: `null | string`  
  A parent Document UUID provided when the parent instance is unavailable.

- **render?**: `boolean`  
  Re-render Applications whose display depends on the deleted Documents.

- **replacements?**: `Record<string, string>`  
  The mapping of IDs of deleted Documents to the UUIDs of the Documents that replace the deleted Documents.