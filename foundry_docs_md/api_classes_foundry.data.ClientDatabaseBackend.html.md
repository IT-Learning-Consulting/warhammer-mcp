# ClientDatabaseBackend

The client-side database backend implementation which handles Document modification operations.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.ClientDatabaseBackend))  
*abstract.* [DatabaseBackend](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html)  
ClientDatabaseBackend

## Methods

### _log

```typescript
_log(level: any, message: any): void
```

**Parameters**

- **level**: *any*  
- **message**: *any*

**Returns** *void*

Overrides [DatabaseBackend._log](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#_log)

---

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
[foundry.abstract.Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create)  
rather than calling this method directly.

**Parameters**

- **documentClass**: *typeof* [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
  The Document class definition
- **operation**: [DatabaseCreateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html)  
  Parameters of the create operation
- **user** (optional): [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
*Promise*<[Document<object, DocumentConstructionContext>][]>  
An array of created Document instances

Inherited from [DatabaseBackend.create](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#create)

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
[foundry.abstract.Document#delete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#delete)  
rather than calling this method directly.

**Parameters**

- **documentClass**: *typeof* [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
  The Document class definition
- **operation**: [DatabaseDeleteOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html)  
  Parameters of the delete operation
- **user** (optional): [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
*Promise*<[Document<object, DocumentConstructionContext>][]>  
An array of deleted Document instances

Inherited from [DatabaseBackend.delete](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#delete)

---

### get

```typescript
get(
  documentClass: typeof Document,
  operation: DatabaseGetOperation,
  user?: BaseUser,
): Promise<object[] | Document<object, DocumentConstructionContext>[]>
```

Retrieve Documents based on provided query parameters. It recommended to use  
CompendiumCollection#getDocuments or CompendiumCollection#getIndex rather than  
calling this method directly.

**Parameters**

- **documentClass**: *typeof* [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
  The Document class definition
- **operation**: [DatabaseGetOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseGetOperation.html)  
  Parameters of the get operation
- **user** (optional): [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
*Promise*<object[] | [Document<object, DocumentConstructionContext>][] >  
An array of retrieved Document instances or index objects

Inherited from [DatabaseBackend.get](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#get)

---

### getCompendiumScopes

```typescript
getCompendiumScopes(): string[]
```

Describe the scopes which are suitable as the namespace for a flag key.

**Returns**  
*string[]*

Overrides [DatabaseBackend.getCompendiumScopes](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#getcompendiumscopes)

---

### getFlagScopes

```typescript
getFlagScopes(): any[]
```

Describe the scopes which are suitable as the namespace for a flag key.

**Returns**  
*any[]*

Overrides [DatabaseBackend.getFlagScopes](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#getflagscopes)

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
[foundry.abstract.Document#update](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#update)  
rather than calling this method directly.

**Parameters**

- **documentClass**: *typeof* [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
  The Document class definition
- **operation**: [DatabaseUpdateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html)  
  Parameters of the update operation
- **user** (optional): [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
  The requesting User

**Returns**  
*Promise*<[Document<object, DocumentConstructionContext>][]>  
An array of updated Document instances

Inherited from [DatabaseBackend.update](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#update)

---

## Protected Methods

### _logError

```typescript
_logError(
  user: BaseUser,
  action: string,
  subject: Document<object, DocumentConstructionContext>,
  context?: {
    pack?: string;
    parent?: Document<object, DocumentConstructionContext>;
  },
): string
```

Construct a standardized error message given the context of an attempted operation.

**Parameters**

- **user**: [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
- **action**: *string*  
- **subject**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, DocumentConstructionContext>  
- **context** (optional):  
  - **pack?**: *string*  
  - **parent?**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, DocumentConstructionContext>  

**Returns**  
*string*

Inherited from [DatabaseBackend._logError](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#_logerror)

---

### _logOperation

```typescript
_logOperation(
  action: string,
  type: string,
  documents: Document[],
  context?: {
    level?: string;
    pack?: string;
    parent?: Document<object, DocumentConstructionContext>;
  },
): void
```

Log a database operation for an embedded document, capturing the action taken and relevant IDs.

**Parameters**

- **action**: *string*  
  The action performed
- **type**: *string*  
  The document type
- **documents**: *Document[]*  
  The documents modified
- **context** (optional):  
  - **level?**: *string*  
    The logging level  
  - **pack?**: *string*  
    A compendium pack within which the operation occurred  
  - **parent?**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, DocumentConstructionContext>  
    A parent document

**Returns**  
*void*

Inherited from [DatabaseBackend._logOperation](https://foundryvtt.com/api/classes/foundry.abstract.DatabaseBackend.html#_logoperation)