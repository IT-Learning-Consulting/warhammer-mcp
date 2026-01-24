# DatabaseBackend | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract base class extended on both the client and server which defines how Documents are retrieved, created, updated, and deleted.

**Hierarchy** [(View Summary)](https://foundryvtt.com/api/hierarchy.html#foundry.abstract.DatabaseBackend)

- DatabaseBackend
- _ClientDatabaseBackend_

---

## Methods

### create

```typescript
create(
    documentClass: typeof Document,
    operation: DatabaseCreateOperation,
    user?: BaseUser,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create new Documents using provided data and context. It is recommended to use  
[foundry.abstract.Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments) or  
[foundry.abstract.Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create) rather  
than calling this method directly.

**Parameters**

- **documentClass**: `typeof Document`  
  The Document class definition
- **operation**: [`DatabaseCreateOperation`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html)  
  Parameters of the create operation
- **user** (optional): [`BaseUser`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of created Document instances

---

### delete

```typescript
delete(
    documentClass: typeof Document,
    operation: DatabaseDeleteOperation,
    user?: BaseUser,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete Documents using provided ids and context. It is recommended to use  
[foundry.abstract.Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments) or  
[foundry.abstract.Document#delete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#delete) rather  
than calling this method directly.

**Parameters**

- **documentClass**: `typeof Document`  
  The Document class definition
- **operation**: [`DatabaseDeleteOperation`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html)  
  Parameters of the delete operation
- **user** (optional): [`BaseUser`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of deleted Document instances

---

### get

```typescript
get(
    documentClass: typeof Document,
    operation: DatabaseGetOperation,
    user?: BaseUser,
): Promise<object[] | Document<object, DocumentConstructionContext>[]>
```

Retrieve Documents based on provided query parameters. It is recommended to use  
CompendiumCollection#getDocuments or CompendiumCollection#getIndex rather than  
calling this method directly.

**Parameters**

- **documentClass**: `typeof Document`  
  The Document class definition
- **operation**: [`DatabaseGetOperation`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseGetOperation.html)  
  Parameters of the get operation
- **user** (optional): [`BaseUser`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
`Promise<object[] | Document<object, DocumentConstructionContext>[]>`  
An array of retrieved Document instances or index objects

---

### getCompendiumScopes

```typescript
getCompendiumScopes(): string[]
```

Describe the scopes which are suitable as the namespace for a flag key.

**Returns**  
`string[]`

---

### getFlagScopes

```typescript
getFlagScopes(): string[]
```

Describe the scopes which are suitable as the namespace for a flag key.

**Returns**  
`string[]`

---

### update

```typescript
update(
    documentClass: typeof Document,
    operation: DatabaseUpdateOperation,
    user?: BaseUser,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update Documents using provided data and context. It is recommended to use  
[foundry.abstract.Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments) or  
[foundry.abstract.Document#update](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#update) rather  
than calling this method directly.

**Parameters**

- **documentClass**: `typeof Document`  
  The Document class definition
- **operation**: [`DatabaseUpdateOperation`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html)  
  Parameters of the update operation
- **user** (optional): [`BaseUser`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated Document instances

---

## Protected Abstract Methods

### _log

```typescript
protected _log(level: string, message: string): void
```

Log a database operations message.

**Parameters**

- **level**: `string`  
  The logging level
- **message**: `string`  
  The message

**Returns**  
`void`

---

### _logError

```typescript
protected _logError(
    user: BaseUser,
    action: string,
    subject: Document<object, DocumentConstructionContext>,
    context?: {
        pack?: string;
        parent?: Document<object, DocumentConstructionContext>;
    }
): string
```

Construct a standardized error message given the context of an attempted operation.

**Parameters**

- **user**: [`BaseUser`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
- **action**: `string`  
- **subject**: [`Document<object, DocumentConstructionContext>`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
- **context** (optional):  
  - **pack**?: `string`  
  - **parent**?: [`Document<object, DocumentConstructionContext>`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)

**Returns**  
`string`

---

### _logOperation

```typescript
protected _logOperation(
    action: string,
    type: string,
    documents: Document[],
    context?: {
        level?: string;
        pack?: string;
        parent?: Document<object, DocumentConstructionContext>;
    }
): void
```

Log a database operation for an embedded document, capturing the action taken and relevant IDs.

**Parameters**

- **action**: `string`  
  The action performed
- **type**: `string`  
  The document type
- **documents**: `Document[]`  
  The documents modified
- **context** (optional):  
  - **level**?: `string`  
    The logging level  
  - **pack**?: `string`  
    A compendium pack within which the operation occurred  
  - **parent**?: [`Document<object, DocumentConstructionContext>`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
    A parent document

**Returns**  
`void`