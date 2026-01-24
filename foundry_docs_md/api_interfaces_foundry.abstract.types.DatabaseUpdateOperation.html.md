# DatabaseUpdateOperation | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DatabaseUpdateOperation {
  _result?: (string | object)[];
  _updateData?: Record<string, object>;
  action: "update";
  broadcast: boolean;
  diff?: boolean;
  modifiedTime?: number;
  noHook?: boolean;
  pack: null | string;
  parent?: null | Document<object, DocumentConstructionContext>;
  parentUuid?: null | string;
  recursive?: boolean;
  render?: boolean;
  updates: object[];
}
```

## Properties

### _result? (Optional)
- Type: `(string | object)[]`
- Description: Used internally by the server-side backend.

### _updateData? (Optional)
- Type: `Record<string, object>`
- Description: Used internally by the server-side backend.

### action
- Type: `"update"`
- Description: The action of this database operation.

### broadcast
- Type: `boolean`
- Description: Whether the database operation is broadcast to other connected clients.

### diff? (Optional)
- Type: `boolean`
- Description: Difference each update object against current Document data and only use differential data for the update operation.

### modifiedTime? (Optional)
- Type: `number`
- Description: The timestamp when the operation was performed.

### noHook? (Optional)
- Type: `boolean`
- Description: Block the dispatch of hooks related to this operation.

### pack
- Type: `null | string`
- Description: A compendium collection ID which contains the Documents.

### parent? (Optional)
- Type: `null | [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html>>`
- Description: A parent Document within which Documents are embedded.

### parentUuid? (Optional)
- Type: `null | string`
- Description: A parent Document UUID provided when the parent instance is unavailable.

### recursive? (Optional)
- Type: `boolean`
- Description: Merge objects recursively. If false, inner objects will be replaced explicitly. Use with caution!

### render? (Optional)
- Type: `boolean`
- Description: Re-render Applications whose display depends on the created Documents.

### updates
- Type: `object[]`
- Description: An array of data objects used to update existing Documents. Each update object must contain the `_id` of the target Document.