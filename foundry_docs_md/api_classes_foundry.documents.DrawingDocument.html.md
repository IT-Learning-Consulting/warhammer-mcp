# DrawingDocument | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side Drawing document which extends the common BaseDrawing model.

## Mixes
- ClientDocumentMixin

## See Also
- [foundry.documents.Scene: The Scene document type which contains Drawing embedded documents](https://foundryvtt.com/api/classes/foundry.documents.Scene.html)
- [foundry.applications.sheets.DrawingConfig: The Drawing configuration application](https://foundryvtt.com/api/classes/foundry.applications.sheets.DrawingConfig.html)

## Hierarchy  
(View [Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.DrawingDocument), Expand)

- BaseDrawing<this>  
- **DrawingDocument**

---

# Constructors

### constructor

```typescript
new DrawingDocument(
    data?: Partial<DrawingData>,
    options?: DocumentConstructionContext,
): DrawingDocument
```

**Parameters**

- **data?**: `Partial<DrawingData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
- **options?**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`DrawingDocument`

Inherited from [BaseDrawing.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#constructor)

---

# Properties

### _source

```typescript
_source: DrawingData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [BaseDrawing._source](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_source)

---

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BaseDrawing.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#parent)

---

### defaultDrawingFields

```typescript
static defaultDrawingFields: (keyof DrawingData)[]
```

Fields included in the drawing defaults setting

---

### LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[]
```

Inherited from [BaseDrawing.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#localization_prefixes)

---

### metadata

```typescript
static metadata: object
```

Default metadata which applies to each instance of this Document type.

Inherited from [BaseDrawing.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#metadata)

---

# Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**: `null | string`

Inherited from CanvasDocumentMixin(BaseDrawing).id

---

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**: `boolean`

Inherited from CanvasDocumentMixin(BaseDrawing).inCompendium

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**: `boolean`

Inherited from CanvasDocumentMixin(BaseDrawing).invalid

---

### isAuthor

```typescript
get isAuthor(): boolean
```

Is the current User the author of this drawing?

**Returns**: `boolean`

---

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**: `boolean`

Inherited from CanvasDocumentMixin(BaseDrawing).isEmbedded

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**: `SchemaField`

Inherited from CanvasDocumentMixin(BaseDrawing).schema

---

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**: `string`

Inherited from CanvasDocumentMixin(BaseDrawing).uuid

---

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

**Returns**:  
```typescript
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

Inherited from CanvasDocumentMixin(BaseDrawing).validationFailures

---

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**: `typeof Document`

Inherited from CanvasDocumentMixin(BaseDrawing).baseDocument

---

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**: `string`

Inherited from CanvasDocumentMixin(BaseDrawing).collectionName

---

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**: `abstract.DatabaseBackend`

Inherited from CanvasDocumentMixin(BaseDrawing).database

---

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**: `string`

Inherited from CanvasDocumentMixin(BaseDrawing).documentName

---

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**: `boolean`

Inherited from CanvasDocumentMixin(BaseDrawing).hasTypeData

---

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**: `Readonly<Record<string, any>>`

Inherited from CanvasDocumentMixin(BaseDrawing).hierarchy

---

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**: `typeof Document`

Inherited from CanvasDocumentMixin(BaseDrawing).implementation

---

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**: `string[]`

Inherited from CanvasDocumentMixin(BaseDrawing).TYPES

---

# Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**  
- **__namedParameters?**: `{ pack?: null; parentCollection?: null }` = `{}`

**Returns**: `void`

Inherited from [BaseDrawing._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_configure)

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser`  
  The User attempting modification.
- **action**: `string`  
  The attempted action.
- **data?**: `object` = `{}`  
  Data involved in the attempted action.

**Returns**: `boolean` - Does the User have permission?

Inherited from [BaseDrawing.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#canusermodify)

---

### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- **data?**: `object` = `{}`  
  Additional data which overrides current document data at the time of creation.
- **context?**: `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method.

**Returns**  
`Document` instance or `Promise` resolving to a cloned Document.

Inherited from [BaseDrawing.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#clone)

---

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type.
- **data?**: `object[]` = `[]`  
  An array of data objects used to create multiple documents.
- **operation?**: `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow.

**Returns**  
`Promise` which resolves to an array of created Document instances.

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseDrawing.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#createembeddeddocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation.

**Returns**  
`Promise` resolving to the deleted Document instance, or `undefined` if not deleted.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseDrawing.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#delete)

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type.
- **ids**: `string[]`  
  An array of string ids for each Document to be deleted.
- **operation?**: `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow.

**Returns**  
`Promise` resolving to an array of deleted Document instances.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseDrawing.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#deleteembeddeddocuments)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Collection of embedded documents within this document for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type.

**Returns**  
A `DocumentCollection` instance of embedded Documents of the requested type.

Inherited from [BaseDrawing.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#getembeddedcollection)

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

- **embeddedName**: `string`  
  The name of the embedded Document type.
- **id**: `string`  
  The id of the child document to retrieve.
- **options?**: `{ invalid?: boolean; strict?: boolean }` = `{}`  
  Additional options which modify how embedded documents are retrieved.
  - **invalid?**: `boolean`  
    Allow retrieving an invalid Embedded Document.
  - **strict?**: `boolean`  
    Throw an Error if the requested id does not exist.

**Returns**  
The retrieved embedded Document instance, or undefined.

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseDrawing.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key.
- **key**: `string`  
  The flag key.

**Returns**  
The flag value.

Inherited from [BaseDrawing.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#getflag)

---

### getUserLevel

```typescript
getUserLevel(user: any): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user**: `any`  
  The User being tested.

**Returns**  
A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).

Inherited from [BaseDrawing.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
The migrated system data object.

Inherited from [BaseDrawing.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#migratesystemdata)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [BaseDrawing.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#reset)

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the `"core"` scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use `"world"` as the scope.

Flag values can assume almost any data type. Setting a flag value to `null` will delete that flag.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key.
- **key**: `string`  
  The flag key.
- **value**: `any`  
  The flag value.

**Returns**  
A `Promise` resolving to the updated document.

Inherited from [BaseDrawing.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#setflag)

---

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

**Parameters**

- **user**: `BaseUser`  
  The User being tested.
- **permission**: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test.
- **options?**: `{ exact?: boolean }` = `{}`  
  Additional options involved in the permission test.
  - **exact?**: `boolean`  
    Require the exact permission level requested.

**Returns**  
`boolean` - Does the user have this permission level over the Document?

Inherited from [BaseDrawing.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

Inherited from [BaseDrawing.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values.

**Returns**  
The extracted primitive object.

Inherited from [BaseDrawing.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath?**: `string`  
  A parent field path already traversed.

**Returns**  
A `Generator` yielding embedded Documents.

Inherited from [BaseDrawing.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#traverseembeddeddocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key.
- **key**: `string`  
  The flag key.

**Returns**  
A `Promise` resolving to the updated document instance.

Inherited from [BaseDrawing.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#unsetflag)

---

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- **data?**: `object` = `{}`  
  Differential update data which modifies the existing values of this document.
- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation.

**Returns**  
The updated Document instance, or `undefined` if not updated.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseDrawing.update](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#update)

---

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: DatabaseUpdateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type.
- **updates?**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document.
- **operation?**: `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow.

**Returns**  
A `Promise` resolving to an array of updated Document instances.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseDrawing.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided `changes` argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes?**: `object` = `{}`  
  New values which should be applied to the data model.
- **options?**: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged.

**Returns**  
An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [BaseDrawing.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options?**: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated.

**Returns**  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseDrawing.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#validate)

---

# Protected Methods

### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options?**: `object` = `{}`  
  Options provided to the model constructor.

**Returns**  
`void`

Inherited from [BaseDrawing._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_initialize)

---

### _initializeSource

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed.
- **options?**: `object` = `{}`  
  Options provided to the model constructor.

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [BaseDrawing._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_initializesource)

---

### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request.
- **options**: `object`  
  Additional options which modify the creation request.
- **userId**: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseDrawing._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_oncreate)

---

### _onDelete

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request.
- **userId**: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseDrawing._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_ondelete)

---

### _onUpdate

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `object`  
  The differential data that was changed relative to the documents prior values.
- **options**: `object`  
  Additional options which modify the update request.
- **userId**: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseDrawing._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_onupdate)

---

### _preCreate

```typescript
_preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [`updateSource`](api_classes_foundry.documents.DrawingDocument.html#20).

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request.
- **options**: `object`  
  Additional options which modify the creation request.
- **user**: `BaseUser`  
  The User requesting the document creation.

**Returns**  
`Promise<boolean | void>`  
Return false to exclude this Document from the creation operation.

Inherited from [BaseDrawing._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_precreate)

---

### _preDelete

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request.
- **user**: `BaseUser`  
  The User requesting the document deletion.

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

Inherited from [BaseDrawing._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_predelete)

---

### _preUpdate

```typescript
_preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changes**: `object`  
  The candidate changes to the Document.
- **options**: `object`  
  Additional options which modify the update request.
- **user**: `BaseUser`  
  The User requesting the document update.

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

Inherited from [BaseDrawing._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_preupdate)

---

# Static Methods

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from [BaseDrawing._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_initializationorder)

---

### canUserCreate

```typescript
static canUserCreate(user: any): any
```

**Parameters**

- **user**: `any`

**Returns**  
`any`

Inherited from [BaseDrawing.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#canusercreate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source?**: `object` = `{}`  
  The source data object.
- **options?**: `object` = `{}`  
  Additional options which are passed to field cleaning methods.

**Returns**  
The cleaned source data, which is the same object as the `source` argument.

Inherited from [BaseDrawing.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#cleandata)

---

### create

```typescript
static create(
    data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<
    undefined |
    Document<object, DocumentConstructionContext> |
    Document<object, DocumentConstructionContext>[]
>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- **data?**: `object | Document | Array<object | Document>`  
  Initial data used to create this Document, or a Document instance to persist.
- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation.

**Returns**  
A `Promise` resolving to the created Document instance(s).

**Examples**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const data = [{name: "Special Sword", type: "weapon"}];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});

const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseDrawing.create](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#create)

---

### createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data?**: `(object | Document)[]` = `[]`  
  An array of data objects or existing Documents to persist.
- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation.

**Returns**  
A `Promise` resolving to an array of created Document instances.

**Examples**

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);

const actor = game.actors.getName("Tim");
const data = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const created = await Item.implementation.createDocuments(data, {parent: actor});

const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseDrawing.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#createdocuments)

---

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    author: DocumentAuthorField;
    bezierFactor: AlphaField;
    elevation: NumberField;
    fillAlpha: AlphaField;
    fillColor: ColorField;
    fillType: NumberField;
    flags: DocumentFlagsField;
    fontFamily: StringField;
    fontSize: NumberField;
    hidden: BooleanField;
    interface: BooleanField;
    locked: BooleanField;
    rotation: AngleField;
    shape: EmbeddedDataField;
    sort: NumberField;
    strokeAlpha: AlphaField;
    strokeColor: ColorField;
    strokeWidth: NumberField;
    text: StringField;
    textAlpha: AlphaField;
    textColor: ColorField;
    texture: FilePathField;
    x: NumberField;
    y: NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

---

### deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids?**: `string[]` = `[]`  
  An array of string ids for the documents to be deleted.
- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation.

**Returns**  
A `Promise` resolving to an array of deleted Document instances.

**Examples**

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from [BaseDrawing.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#deletedocuments)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format.

**Returns**  
A constructed data model instance.

Inherited from [BaseDrawing.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#fromjson)

---

### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.
- **context?**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context.

**Returns**  
The constructed DataModel instance.

Inherited from [BaseDrawing.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#fromsource)

---

### get

```typescript
static get(documentId: string, operation?: DatabaseGetOperation): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string`  
  The Document ID.
- **operation?**: `DatabaseGetOperation` = `{}`  
  Parameters of the get operation.

**Returns**  
The retrieved Document, or `null`.

Inherited from [BaseDrawing.get](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#get)

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string`  
  An existing collection name or a document name.

**Returns**  
The provided collection name if it exists, the first available collection for the document name provided, or `null` if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [BaseDrawing.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#getcollectionname)

---

### migrateData

```typescript
static migrateData(data: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **data**: `any`  
  The candidate source data from which the model will be constructed.

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseDrawing.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseDrawing.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `any`  
  Data which matches the current schema.
- **options**: `any`  
  Additional shimming options.

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [BaseDrawing.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#shimdata)

---

### updateDocuments

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates?**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document.
- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation.

**Returns**  
A `Promise` resolving to an array of updated Document instances.

**Examples**

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updated = await Actor.implementation.updateDocuments(updates);

const actor = game.actors.getName("Timothy");
const updates = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updated = await Item.implementation.updateDocuments(updates, {parent: actor});

const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [BaseDrawing.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#updatedocuments)

---

### validateJoint

```typescript
static validateJoint(data: any): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `any`  
  Candidate data for the model.

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from [BaseDrawing.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#validatejoint)

---

### _onCreateOperation

```typescript
static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters**

- **documents**: `Document[]`  
  The Document instances which were created.
- **operation**: `DatabaseCreateOperation`  
  Parameters of the database creation operation.
- **user**: `BaseUser`  
  The User who performed the creation operation.

**Returns**  
`Promise<void>`

Inherited from [BaseDrawing._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_oncreateoperation)

---

### _onDeleteOperation

```typescript
static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters**

- **documents**: `Document[]`  
  The Document instances which were deleted.
- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation.
- **user**: `BaseUser`  
  The User who performed the deletion operation.

**Returns**  
`Promise<void>`

Inherited from [BaseDrawing._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_ondeleteoperation)

---

### _onUpdateOperation

```typescript
static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters**

- **documents**: `Document[]`  
  The Document instances which were updated.
- **operation**: `DatabaseUpdateOperation`  
  Parameters of the database update operation.
- **user**: `BaseUser`  
  The User who performed the update operation.

**Returns**  
`Promise<void>`

Inherited from [BaseDrawing._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_onupdateoperation)

---

### _preCreateOperation

```typescript
static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using `updateSource`.

**Parameters**

- **documents**: `Document[]`  
  Pending document instances to be created.
- **operation**: `DatabaseCreateOperation`  
  Parameters of the database creation operation.
- **user**: `BaseUser`  
  The User requesting the creation operation.

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the creation operation entirely.

Inherited from [BaseDrawing._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_precreateoperation)

---

### _preDeleteOperation

```typescript
static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object, possibly via `updateSource`.

**Parameters**

- **documents**: `Document[]`  
  Document instances to be deleted.
- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database delete operation.
- **user**: `BaseUser`  
  The User requesting the deletion operation.

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the deletion operation entirely.

Inherited from [BaseDrawing._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_predeleteoperation)

---

### _preUpdateOperation

```typescript
static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- **documents**: `Document[]`  
  Document instances to be updated.
- **operation**: `DatabaseUpdateOperation`  
  Parameters of the database update operation.
- **user**: `BaseUser`  
  The User requesting the update operation.

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the update operation entirely.

Inherited from [BaseDrawing._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html#_preupdateoperation)