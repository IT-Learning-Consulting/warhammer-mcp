# FogExploration | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side `FogExploration` document which extends the common `BaseFogExploration` model.

---

## Mixes

- ClientDocumentMixin

## See Also

- [foundry.documents.collections.FogExplorations](https://foundryvtt.com/api/classes/foundry.documents.collections.FogExplorations.html): The world-level collection of `FogExploration` documents

## Hierarchy

- [BaseFogExploration](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html)<this>
- **FogExploration**

---

## Constructors

### constructor

```typescript
new FogExploration(
    data?: Partial<foundry.documents.types.FogExplorationData>,
    options?: foundry.abstract.types.DocumentConstructionContext,
): documents.FogExploration
```

**Parameters**

- `data` (Optional): `Partial<FogExplorationData>`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated. Default: `{}`

- `options` (Optional): `DocumentConstructionContext`  
  Context and data validation options which affect initial model construction. Default: `{}`

**Returns**  
`documents.FogExploration`

Inherited from [BaseFogExploration.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#constructor)

---

## Properties

### _source

```typescript
_source: foundry.documents.types.FogExplorationData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [BaseFogExploration._source](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_source)

### parent

```typescript
parent: null | foundry.abstract.DataModel<object, foundry.abstract.types.DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BaseFogExploration.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#parent)

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

Inherited from [BaseFogExploration.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#localization_prefixes)

---

## Accessors

### metadata

```typescript
static get metadata(): object
```

Default metadata which applies to each instance of this Document type.

Inherited from [BaseFogExploration.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#metadata)

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

Inherited from `ClientDocumentMixin(BaseFogExploration).id`

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseFogExploration).inCompendium`

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseFogExploration).invalid`

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseFogExploration).isEmbedded`

### schema

```typescript
static get schema(): foundry.data.fields.SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from `ClientDocumentMixin(BaseFogExploration).schema`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseFogExploration).uuid`

### validationFailures

```typescript
get validationFailures(): {
    fields: null | foundry.data.validation.DataModelValidationFailure;
    joint: null | foundry.data.validation.DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

---

### baseDocument

```typescript
static get baseDocument(): typeof foundry.abstract.Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from `ClientDocumentMixin(BaseFogExploration).baseDocument`

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseFogExploration).collectionName`

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from `ClientDocumentMixin(BaseFogExploration).database`

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example `"Actor"`.

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseFogExploration).documentName`

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseFogExploration).hasTypeData`

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from `ClientDocumentMixin(BaseFogExploration).hierarchy`

### implementation

```typescript
static get implementation(): typeof foundry.abstract.Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from `ClientDocumentMixin(BaseFogExploration).implementation`

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

Inherited from `ClientDocumentMixin(BaseFogExploration).TYPES`

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- `__namedParameters` (Optional): `{ pack?: null; parentCollection?: null }`  
  Default: `{}`

**Returns**  
`void`

Inherited from [BaseFogExploration._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_configure)

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `data`: `any` — The initial data object provided to the document creation request.
- `options`: `any` — Additional options which modify the creation request.
- `userId`: `any` — The id of the User requesting the document update.

**Returns**  
`void`

Overrides [BaseFogExploration._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_oncreate)

---

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `options`: `any` — Additional options which modify the deletion request.
- `userId`: `any` — The id of the User requesting the document update.

**Returns**  
`void`

Overrides [BaseFogExploration._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_ondelete)

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `changed`: `any` — The differential data that was changed relative to the document's prior values.
- `options`: `any` — Additional options which modify the update request.
- `userId`: `any` — The id of the User requesting the document update.

**Returns**  
`void`

Overrides [BaseFogExploration._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_onupdate)

---

### _preUpdate

```typescript
_preUpdate(changed: any, options: any, user: any): Promise<undefined | false>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- `changed`: `any` — The candidate changes to the Document.
- `options`: `any` — Additional options which modify the update request.
- `user`: `any` — The User requesting the document update.

**Returns**  
`Promise<undefined | false>`  
A return value of `false` indicates the update operation should be cancelled.

Inherited from [BaseFogExploration._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_preupdate)

---

### canUserModify

```typescript
canUserModify(user: foundry.documents.BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- `user`: `BaseUser` — The User attempting modification.
- `action`: `string` — The attempted action.
- `data` (Optional): `object` — Data involved in the attempted action. Default: `{}`

**Returns**  
`boolean` — Does the User have permission?

Inherited from [BaseFogExploration.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#canusermodify)

---

### clone

```typescript
clone(
    data?: object,
    context?: foundry.abstract.types.DocumentConstructionContext & foundry.abstract.types.DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- `data` (Optional): `object` — Additional data which overrides current document data at the time of creation. Default: `{}`  
- `context` (Optional): `DocumentConstructionContext & DocumentCloneOptions` — Additional context options passed to the create method. Default: `{}`

**Returns**  
`Document` or `Promise<Document>` — The cloned Document instance.

Inherited from [BaseFogExploration.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#clone)

---

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: foundry.abstract.types.DatabaseCreateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

**Parameters**

- `embeddedName`: `string` — The name of the embedded Document type.
- `data` (Optional): `object[]` — An array of data objects used to create multiple documents. Default: `[]`
- `operation` (Optional): `DatabaseCreateOperation` — Parameters of the database creation workflow. Default: `{}`

**Returns**  
`Promise<Document[]>` — An array of created Document instances.

**See Also**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseFogExploration.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#createembeddeddocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<foundry.abstract.types.DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- `operation` (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` — Parameters of the deletion operation. Default: `{}`

**Returns**  
`Promise<undefined | Document>` — The deleted Document instance, or undefined if not deleted.

**See Also**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseFogExploration.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#delete)

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: foundry.abstract.types.DatabaseDeleteOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- `embeddedName`: `string` — The name of the embedded Document type.
- `ids`: `string[]` — An array of string ids for each Document to be deleted.
- `operation` (Optional): `DatabaseDeleteOperation` — Parameters of the database deletion workflow. Default: `{}`

**Returns**  
`Promise<Document[]>` — An array of deleted Document instances.

**See Also**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseFogExploration.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#deleteembeddeddocuments)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- `embeddedName`: `string` — The name of the embedded Document type.

**Returns**  
`DocumentCollection` — The Collection instance of embedded Documents of the requested type.

Inherited from [BaseFogExploration.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#getembeddedcollection)

---

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

**Parameters**

- `embeddedName`: `string` — The name of the embedded Document type.
- `id`: `string` — The id of the child document to retrieve.
- `options` (Optional):  
  - `invalid?`: `boolean` — Allow retrieving an invalid Embedded Document.  
  - `strict?`: `boolean` — Throw an Error if the requested id does not exist. See Collection#get. Default: `{}`

**Returns**  
`Document` — The retrieved embedded Document instance, or undefined.

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseFogExploration.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- `scope`: `string` — The flag scope which namespaces the key.
- `key`: `string` — The flag key.

**Returns**  
`any` — The flag value.

Inherited from [BaseFogExploration.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#getflag)

---

### getTexture

```typescript
getTexture(): null | Texture<Resource>
```

Transform the explored base64 data into a PIXI.Texture object.

**Returns**  
`null | Texture<Resource>`

---

### getUserLevel

```typescript
getUserLevel(user?: foundry.documents.BaseUser): foundry.CONST.DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in `CONST.DOCUMENT_OWNERSHIP_LEVELS`. Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- `user` (Optional): `BaseUser` — The User being tested.

**Returns**  
`DocumentOwnershipNumber` — A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

Inherited from [BaseFogExploration.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns**  
`object` — The migrated system data object.

Inherited from [BaseFogExploration.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#migratesystemdata)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [BaseFogExploration.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#reset)

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the `"core"` scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should `"world"` as the scope.

Flag values can assume almost any data type. Setting a flag value to `null` will delete that flag.

**Parameters**

- `scope`: `string` — The flag scope which namespaces the key.
- `key`: `string` — The flag key.
- `value`: `any` — The flag value.

**Returns**  
`Promise<Document>` — A Promise resolving to the updated document.

Inherited from [BaseFogExploration.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#setflag)

---

### testUserPermission

```typescript
testUserPermission(
    user: foundry.documents.BaseUser,
    permission: foundry.CONST.DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

**Parameters**

- `user`: `BaseUser` — The User being tested.
- `permission`: `DocumentOwnershipLevel` — The permission level from `DOCUMENT_OWNERSHIP_LEVELS` to test.
- `options` (Optional): `{ exact?: boolean }` — Additional options involved in the permission test.

  - `exact?`: `boolean` — Require the exact permission level requested?

**Returns**  
`boolean` — Does the user have this permission level over the Document?

Inherited from [BaseFogExploration.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object` — The document source data expressed as a plain object.

Inherited from [BaseFogExploration.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- `source`: `boolean` — Draw values from the underlying data source rather than transformed values. Default: `true`

**Returns**  
`any` — The extracted primitive object.

Inherited from [BaseFogExploration.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- `_parentPath` (Optional): `string` — A parent field path already traversed.

**Returns**  
`Generator<any, void, any>`

**Yields**  
Inherited from [BaseFogExploration.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#traverseembeddeddocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- `scope`: `string` — The flag scope which namespaces the key.
- `key`: `string` — The flag key.

**Returns**  
`Promise<Document>` — The updated document instance.

Inherited from [BaseFogExploration.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#unsetflag)

---

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<foundry.abstract.types.DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- `data` (Optional): `object` — Differential update data which modifies the existing values of this document. Default: `{}`  
- `operation` (Optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` — Parameters of the update operation. Default: `{}`

**Returns**  
`Promise<undefined | Document>` — The updated Document instance, or undefined if not updated.

**See Also**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseFogExploration.update](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#update)

---

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: foundry.abstract.types.DatabaseUpdateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

**Parameters**

- `embeddedName`: `string` — The name of the embedded Document type.
- `updates` (Optional): `object[]` — An array of differential data objects, each used to update a single Document. Default: `[]`
- `operation` (Optional): `DatabaseUpdateOperation` — Parameters of the database update workflow. Default: `{}`

**Returns**  
`Promise<Document[]>` — An array of updated Document instances.

**See Also**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseFogExploration.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: foundry.abstract.types.DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- `changes`: `object` — New values which should be applied to the data model. Default: `{}`
- `options`: `DataModelUpdateOptions` — Options which determine how the new data is merged. Default: `{}`

**Returns**  
`object` — An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [BaseFogExploration.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#updatesource)

---

### validate

```typescript
validate(options?: foundry.abstract.types.DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- `options`: `DataModelValidationOptions` — Options which modify how the model is validated. Default: `{}`

**Returns**  
`boolean` — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseFogExploration.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#validate)

---

### Protected Methods (Inherited)

- `_initialize(options?: object): void`  
  Initialize the instance by copying data from the source object to instance attributes.  
  [BaseFogExploration._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_initialize)

- `_initializeSource(data: object | DataModel<object, DataModelConstructionContext>, options?: object): object`  
  Initialize the source data for a new DataModel instance. Applies migrations and cleaning.  
  [BaseFogExploration._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_initializesource)

- `_preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>`  
  Pre-process a creation operation for a single Document instance.  
  [BaseFogExploration._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_precreate)

- `_preDelete(options: object, user: BaseUser): Promise<boolean | void>`  
  Pre-process a deletion operation for a single Document instance.  
  [BaseFogExploration._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_predelete)

- `_initializationOrder(): Generator<any[], void, unknown>`  
  Provides initialization order generator.  
  [BaseFogExploration._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_initializationorder)

---

### Static Methods

- `static canUserCreate(user: BaseUser): boolean`  
  Test whether a given User has sufficient permissions to create Documents of this type in general.  
  [BaseFogExploration.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#canusercreate)

- `static cleanData(source?: object, options?: object): object`  
  Clean a data source object to conform to a specific provided schema.  
  [BaseFogExploration.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#cleandata)

- `static create(`  
  ```typescript
  data?:
      | object
      | Document<object, DocumentConstructionContext>
      | (object | Document<object, DocumentConstructionContext>)[],
  operation?: Partial<Omit<DatabaseCreateOperation, "data">>
  ): Promise<
      | undefined
      | Document<object, DocumentConstructionContext>
      | Document<object, DocumentConstructionContext>[]
  >
  ```
  
  Create a new Document using provided input data, saving it to the database.

  [BaseFogExploration.create](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#create)

- `static createDocuments(data?: (object | Document<object, DocumentConstructionContext>)[], operation?: Partial<Omit<DatabaseCreateOperation, "data">>): Promise<Document<object, DocumentConstructionContext>[]>`  
  Create multiple Documents using provided input data.  
  [BaseFogExploration.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#createdocuments)

- `static defineSchema(): { _id: DocumentIdField; _stats: DocumentStatsField; explored: FilePathField; flags: DocumentFlagsField; positions: ObjectField; scene: ForeignDocumentField; timestamp: NumberField; user: ForeignDocumentField; }`  
  Define the data schema for documents of this type.  
  [BaseFogExploration.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#defineschema)

- `static deleteDocuments(ids?: string[], operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>): Promise<Document<object, DocumentConstructionContext>[]>`  
  Delete one or multiple existing Documents using an array of provided ids.  
  [BaseFogExploration.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#deletedocuments)

- `static fromJSON(json: string): DataModel<object, DataModelConstructionContext>`  
  Create a DataModel instance using a provided serialized JSON string.  
  [BaseFogExploration.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#fromjson)

- `static fromSource(source: object, context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions): DataModel<object, DataModelConstructionContext>`  
  Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.  
  [BaseFogExploration.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#fromsource)

- `static get(...args: any[]): null | Document<object, DocumentConstructionContext> | Promise<null | documents.FogExploration>`  
  Get a World-level Document of this type by its id.  
  Overrides [BaseFogExploration.get](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#get)

- `static getCollectionName(name: string): null | string`  
  A compatibility method that returns the appropriate name of an embedded collection within this Document.  
  [BaseFogExploration.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#getcollectionname)

- `static load(query?: { scene?: string; user?: string }, options?: object): Promise<null | documents.FogExploration>`  
  Obtain the fog of war exploration progress for a specific Scene and User.

- `static migrateData(source: object): object`  
  Migrate candidate source data for this DataModel which may require initial cleaning or transformations.  
  [BaseFogExploration.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#migratedata)

- `static migrateDataSafe(source: object): object`  
  Wrap data migration in a try/catch which attempts it safely.  
  [BaseFogExploration.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#migratedatasafe)

- `static shimData(data: object, options?: { embedded?: boolean }): object`  
  Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.  
  [BaseFogExploration.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#shimdata)

- `static updateDocuments(updates?: object[], operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>): Promise<Document<object, DocumentConstructionContext>[]>`  
  Update multiple Document instances using provided differential data.  
  [BaseFogExploration.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#updatedocuments)

- `static validateJoint(data: object): void`  
  Evaluate joint validation rules which apply validation conditions across multiple fields of the model.  
  [BaseFogExploration.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#validatejoint)

- `static _onCreateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseCreateOperation, user: BaseUser): Promise<void>`  
  Protected batch-wise post-process of a creation operation.  
  [BaseFogExploration._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_oncreateoperation)

- `static _onDeleteOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseDeleteOperation, user: BaseUser): Promise<void>`  
  Protected batch-wise post-process of a deletion operation.  
  [BaseFogExploration._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_ondeleteoperation)

- `static _onUpdateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseUpdateOperation, user: BaseUser): Promise<void>`  
  Protected batch-wise post-process of an update operation.  
  [BaseFogExploration._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_onupdateoperation)

- `static _preCreateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseCreateOperation, user: BaseUser): Promise<boolean | void>`  
  Protected batch-wise pre-process of a creation operation.  
  [BaseFogExploration._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_precreateoperation)

- `static _preDeleteOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseDeleteOperation, user: BaseUser): Promise<boolean | void>`  
  Protected batch-wise pre-process of a deletion operation.  
  [BaseFogExploration._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_predeleteoperation)

- `static _preUpdateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseUpdateOperation, user: BaseUser): Promise<boolean | void>`  
  Protected batch-wise pre-process of an update operation.  
  [BaseFogExploration._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html#_preupdateoperation)

---

_For full details, visit the [FogExploration API Documentation](https://foundryvtt.com/api/classes/foundry.documents.FogExploration.html)_