# NoteDocument | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side Note document which extends the common BaseNote document model.

**Mixes:**  
ClientDocumentMixin

**See also:**  
- [foundry.documents.Scene](https://foundryvtt.com/api/classes/foundry.documents.Scene.html): The Scene document type which contains Note documents  
- [foundry.applications.sheets.NoteConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.NoteConfig.html): The Note configuration application  

**Hierarchy:**  
- [BaseNote](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html)<this>  
- **NoteDocument**

---

## Constructors

### constructor

```typescript
new NoteDocument(
    data?: Partial<foundry.documents.types.NoteData>,
    options?: foundry.abstract.types.DocumentConstructionContext,
): NoteDocument
```

**Parameters:**

- **data** _(optional)_: `Partial<NoteData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
- **options** _(optional)_: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns:**  
`NoteDocument`

Inherits from: [BaseNote.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#constructor)

---

## Properties

### _source

```typescript
_source: NoteData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherits from: [BaseNote._source](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_source)

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherits from: [BaseNote.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#parent)

### DEFAULT_ICON

```typescript
DEFAULT_ICON: string = "icons/svg/book.svg"
```

The default icon used for newly created Note documents.

Inherits from: [BaseNote.DEFAULT_ICON](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#DEFAULT_ICON)

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[]
```

Inherited from: [BaseNote.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#LOCALIZATION_PREFIXES)

### metadata

```typescript
metadata: object
```

Default metadata which applies to each instance of this Document type.

Inherits from: [BaseNote.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#metadata)

---

## Accessors

### entry

```typescript
get entry(): documents.JournalEntry
```

The associated JournalEntry which is referenced by this Note.

**Returns:** `documents.JournalEntry`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns:** `null` | `string`

Inherits from CanvasDocumentMixin(BaseNote).id

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns:** `boolean`

Inherits from CanvasDocumentMixin(BaseNote).inCompendium

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns:** `boolean`

Inherits from CanvasDocumentMixin(BaseNote).invalid

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns:** `boolean`

Inherits from CanvasDocumentMixin(BaseNote).isEmbedded

### label

```typescript
get label(): string
```

The text label used to annotate this Note

**Returns:** `string`

### page

```typescript
get page(): documents.JournalEntryPage
```

The specific JournalEntryPage within the associated JournalEntry referenced by this Note.

**Returns:** `documents.JournalEntryPage`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns:** `SchemaField`

Inherits from CanvasDocumentMixin(BaseNote).schema

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns:** `string`

Inherits from CanvasDocumentMixin(BaseNote).uuid

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

**Returns:**

```typescript
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

Inherits from CanvasDocumentMixin(BaseNote).validationFailures

---

## Static Accessors

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns:** `typeof Document`

Inherits from CanvasDocumentMixin(BaseNote).baseDocument

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns:** `string`

Inherits from CanvasDocumentMixin(BaseNote).collectionName

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns:** `abstract.DatabaseBackend`

Inherits from CanvasDocumentMixin(BaseNote).database

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns:** `string`

Inherits from CanvasDocumentMixin(BaseNote).documentName

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns:** `boolean`

Inherits from CanvasDocumentMixin(BaseNote).hasTypeData

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns:** `Readonly<Record<string, any>>`

Inherits from CanvasDocumentMixin(BaseNote).hierarchy

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns:** `typeof Document`

Inherits from CanvasDocumentMixin(BaseNote).implementation

### schema

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns:** `SchemaField`

Inherits from CanvasDocumentMixin(BaseNote).schema

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns:** `string[]`

Inherits from CanvasDocumentMixin(BaseNote).TYPES

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters:**

- **__namedParameters** _(optional)_: `{ pack?: null; parentCollection?: null } = {}`

**Returns:** `void`

Inherits from: [BaseNote._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_configure)

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters:**

- **user**: `BaseUser`  
  The User attempting modification
- **action**: `string`  
  The attempted action
- **data** _(optional)_: `object` = `{}`  
  Data involved in the attempted action

**Returns:**  
`boolean` Does the User have permission?

Inherits from: [BaseNote.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#canUserModify)

---

### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters:**

- **data** _(optional)_: `object` = `{}`  
  Additional data which overrides current document data at the time of creation
- **context** _(optional)_: `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method

**Returns:**  
The cloned Document instance (or a Promise that resolves to one)

Inherits from: [BaseNote.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#clone)

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

**Parameters:**

- **embeddedName**: `string`  
  The name of the embedded Document type
- **data** _(optional)_: `object[]` = `[]`  
  An array of data objects used to create multiple documents
- **operation** _(optional)_: `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow

**Returns:**  
`Promise` resolving to an array of created Document instances

**See also:**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherits from: [BaseNote.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#createEmbeddedDocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters:**

- **operation** _(optional)_: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation

**Returns:**  
A Promise resolving to the deleted Document instance, or `undefined` if not deleted

**See also:**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherits from: [BaseNote.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#delete)

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

**Parameters:**

- **embeddedName**: `string`  
  The name of the embedded Document type
- **ids**: `string[]`  
  An array of string ids for each Document to be deleted
- **operation** _(optional)_: `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow

**Returns:**  
`Promise` resolving to an array of deleted Document instances

**See also:**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherits from: [BaseNote.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#deleteEmbeddedDocuments)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters:**

- **embeddedName**: `string`  
  The name of the embedded Document type

**Returns:**  
`DocumentCollection` instance of embedded Documents of the requested type

Inherits from: [BaseNote.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#getEmbeddedCollection)

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

**Parameters:**

- **embeddedName**: `string`  
  The name of the embedded Document type
- **id**: `string`  
  The id of the child document to retrieve
- **options** _(optional)_:  
  - **invalid**?: `boolean` - Allow retrieving an invalid Embedded Document.  
  - **strict**?: `boolean` - Throw an Error if the requested id does not exist. See Collection#get.

**Returns:**  
The retrieved embedded Document instance, or `undefined`

**Throws:**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherits from: [BaseNote.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#getEmbeddedDocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. Flags represent key-value type data used to store flexible or arbitrary data.

**Parameters:**

- **scope**: `string`  
  The flag scope which namespaces the key
- **key**: `string`  
  The flag key

**Returns:**  
The flag value

Inherits from: [BaseNote.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#getFlag)

---

### getUserLevel

```typescript
getUserLevel(user: any): any
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role. To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters:**

- **user**: `any`  
  The User being tested

**Returns:**  
A numeric permission level from `CONST.DOCUMENT_OWNERSHIP_LEVELS`

Inherits from: [BaseNote.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#getUserLevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns:**  
The migrated system data object

Inherits from: [BaseNote.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#migrateSystemData)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:** `void`

Inherits from: [BaseNote.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#reset)

---

### setFlag

```typescript
setFlag(
    scope: string,
    key: string,
    value: any,
): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by core software, game systems, or user-created modules.

- Each flag should be set using a scope which provides a namespace to prevent collisions.
- Core software uses the scope `"core"`.
- Game systems or modules use their canonical module name as scope.
- Individual worlds should use `"world"` as the scope.
- Setting a flag to `null` will delete that flag.

**Parameters:**

- **scope**: `string`  
  The flag scope which namespaces the key
- **key**: `string`  
  The flag key
- **value**: `any`  
  The flag value

**Returns:**  
A Promise resolving to the updated document

Inherits from: [BaseNote.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#setFlag)

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

**Parameters:**

- **user**: `BaseUser`  
  The User being tested
- **permission**: `DocumentOwnershipLevel`  
  The permission level to test
- **options** _(optional)_:  
  - **exact**?: `boolean` - Require the exact permission level requested?

**Returns:**  
`boolean` indicating if the user has this permission level

Inherits from: [BaseNote.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#testUserPermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:**  
The document source data expressed as a plain object

Inherits from: [BaseNote.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#toJSON)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters:**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values.

**Returns:**  
The extracted primitive object

Inherits from: [BaseNote.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#toObject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters:**

- **_parentPath** _(optional)_: `string`  
  A parent field path already traversed

**Returns:**  
A Generator yielding embedded documents

Inherits from: [BaseNote.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#traverseEmbeddedDocuments)

---

### unsetFlag

```typescript
unsetFlag(
    scope: string,
    key: string,
): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters:**

- **scope**: `string`  
  The flag scope which namespaces the key
- **key**: `string`  
  The flag key

**Returns:**  
A Promise resolving to the updated document instance

Inherits from: [BaseNote.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#unsetFlag)

---

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters:**

- **data** _(optional)_: `object` = `{}`  
  Differential update data which modifies the existing values of this document.
- **operation** _(optional)_: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation.

**Returns:**  
A Promise resolving to the updated Document instance, or `undefined` if not updated.

**See also:**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateDocuments)

Inherits from: [BaseNote.update](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#update)

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

**Parameters:**

- **embeddedName**: `string`  
  The name of the embedded Document type
- **updates** _(optional)_: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document
- **operation** _(optional)_: `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow

**Returns:**  
A Promise resolving to an array of updated Document instances

**See also:**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateDocuments)

Inherits from: [BaseNote.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#updateEmbeddedDocuments)

---

### updateSource

```typescript
updateSource(
    changes?: object,
    options?: DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters:**

- **changes** _(optional)_: `object` = `{}`  
  New values which should be applied to the data model
- **options** _(optional)_: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns:**  
An object containing differential keys and values that were changed

**Throws:**  
An error if the requested data model changes were invalid

Inherits from: [BaseNote.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#updateSource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters:**

- **options** _(optional)_: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns:**  
`boolean` Whether the data source or proposed change is reported as valid.

**Throws:**  
An error thrown if validation is strict and a failure occurs.

Inherits from: [BaseNote.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#validate)

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters:**

- **options** _(optional)_: `object` = `{}`  
  Options provided to the model constructor

**Returns:** `void`

Inherits from: [BaseNote._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_initialize)

---

### _initializeSource

```typescript
protected _initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters:**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed
- **options** _(optional)_: `object` = `{}`  
  Options provided to the model constructor

**Returns:**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

Inherits from: [BaseNote._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_initializeSource)

---

### _onCreate

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters:**

- **data**: `object`  
  The initial data object provided to the document creation request
- **options**: `object`  
  Additional options which modify the creation request
- **userId**: `string`  
  The id of the User requesting the document update

**Returns:** `void`

Inherits from: [BaseNote._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_onCreate)

---

### _onDelete

```typescript
protected _onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters:**

- **options**: `object`  
  Additional options which modify the deletion request
- **userId**: `string`  
  The id of the User requesting the document update

**Returns:** `void`

Inherits from: [BaseNote._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_onDelete)

---

### _onUpdate

```typescript
protected _onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters:**

- **changed**: `object`  
  The differential data that was changed relative to the document's prior values
- **options**: `object`  
  Additional options which modify the update request
- **userId**: `string`  
  The id of the User requesting the document update

**Returns:** `void`

Inherits from: [BaseNote._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_onUpdate)

---

### _preCreate

```typescript
protected _preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [updateSource](#updateSource).

**Parameters:**

- **data**: `object`  
  The initial data object provided to the document creation request
- **options**: `object`  
  Additional options which modify the creation request
- **user**: `BaseUser`  
  The User requesting the document creation

**Returns:**  
A Promise resolving to `false` to exclude this Document from the creation operation, or `void`.

Inherits from: [BaseNote._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_preCreate)

---

### _preDelete

```typescript
protected _preDelete(
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters:**

- **options**: `object`  
  Additional options which modify the deletion request
- **user**: `BaseUser`  
  The User requesting the document deletion

**Returns:**  
A Promise resolving to `false` to cancel the deletion operation, or `void`.

Inherits from: [BaseNote._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_preDelete)

---

### _preUpdate

```typescript
protected _preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters:**

- **changes**: `object`  
  The candidate changes to the Document
- **options**: `object`  
  Additional options which modify the update request
- **user**: `BaseUser`  
  The User requesting the document update

**Returns:**  
A Promise resolving to `false` to cancel the update operation, or `void`.

Inherits from: [BaseNote._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_preUpdate)

---

## Static Methods

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns:**  
Generator yielding initialization order arrays

Inherits from: [BaseNote._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_initializationOrder)

---

### canUserCreate

```typescript
static canUserCreate(user: any): any
```

**Parameters:**

- **user**: `any`

**Returns:** `any`

Inherits from: [BaseNote.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#canUserCreate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters:**

- **source** _(optional)_: `object` = `{}`  
  The source data object
- **options** _(optional)_: `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns:**  
The cleaned source data, which is the same object as the `source` argument

Inherits from: [BaseNote.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#cleanData)

---

### create

```typescript
static create(
    data?:
        | object
        | Document<object, DocumentConstructionContext>
        | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<
    | undefined
    | Document<object, DocumentConstructionContext>
    | Document<object, DocumentConstructionContext>[]
>
```

Create a new Document using provided input data, saving it to the database.

**Parameters:**

- **data** _(optional)_:  
  - `object`  
  - OR `Document<object, DocumentConstructionContext>`  
  - OR array of objects or Documents.
  
Initial data used to create this Document, or Document instance to persist.

- **operation** _(optional)_: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation.

**Returns:**  
Promise resolving to created Document instance(s)

**Examples:**

Create a World-level Item:

```typescript
const data = [{ name: "Special Sword", type: "weapon" }];
const created = await Item.implementation.create(data);
```

Create an Actor-owned Item:

```typescript
const data = [{ name: "Special Sword", type: "weapon" }];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, { parent: actor });
```

Create an Item in a Compendium pack:

```typescript
const data = [{ name: "Special Sword", type: "weapon" }];
const created = await Item.implementation.create(data, { pack: "mymodule.mypack" });
```

Inherits from: [BaseNote.create](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#create)

---

### createDialog

```typescript
static createDialog(
    noteData?: {},
    createOptions?: {},
    dialogOptions?: {},
): Promise<any>
```

**Parameters:**

- **noteData** _(optional)_: `{}` = `{}`
- **createOptions** _(optional)_: `{}` = `{}`
- **dialogOptions** _(optional)_: `{}` = `{}`

**Returns:**  
Promise resolving to any

---

### createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data.

**Parameters:**

- **data** _(optional)_: Array of objects or existing Documents to persist.
- **operation** _(optional)_: Parameters of the requested creation operation.

**Returns:**  
Promise resolving to an array of created Document instances

**Examples:**

Create a single Document:

```typescript
const data = [{ name: "New Actor", type: "character", img: "path/to/profile.jpg" }];
const created = await Actor.implementation.createDocuments(data);
```

Create multiple Documents:

```typescript
const data = [{ name: "Tim", type: "npc" }, { name: "Tom", type: "npc" }];
const created = await Actor.implementation.createDocuments(data);
```

Create multiple embedded Documents within a parent:

```typescript
const actor = game.actors.getName("Tim");
const data = [
  { name: "Sword", type: "weapon" },
  { name: "Breastplate", type: "equipment" }
];
const created = await Item.implementation.createDocuments(data, { parent: actor });
```

Create a Document within a Compendium pack:

```typescript
const data = [{ name: "Compendium Actor", type: "character", img: "path/to/profile.jpg" }];
const created = await Actor.implementation.createDocuments(data, { pack: "mymodule.mypack" });
```

Inherits from: [BaseNote.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#createDocuments)

---

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    elevation: NumberField;
    entryId: ForeignDocumentField;
    flags: DocumentFlagsField;
    fontFamily: StringField;
    fontSize: NumberField;
    global: BooleanField;
    iconSize: NumberField;
    pageId: ForeignDocumentField;
    sort: NumberField;
    text: StringField;
    textAnchor: NumberField;
    textColor: ColorField;
    texture: TextureData;
    x: NumberField;
    y: NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns:**  
An object representing the document schema.

Inherits from: [BaseNote.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#defineSchema)

---

### deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids.

**Parameters:**

- **ids** _(optional)_: `string[]` = `[]`  
  An array of string ids for the documents to be deleted.
- **operation** _(optional)_: Parameters of the database deletion operation.

**Returns:**  
Promise resolving to an array of deleted Document instances

**Examples:**

Delete a single Document:

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);
```

Delete multiple Documents:

```typescript
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);
```

Delete multiple embedded Documents within a parent:

```typescript
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], { parent: actor });
```

Delete Documents within a Compendium pack:

```typescript
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], { pack: "mymodule.mypack" });
```

Inherits from: [BaseNote.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#deleteDocuments)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters:**

- **json**: `string`  
  Serialized document data in string format

**Returns:**  
A constructed data model instance

Inherits from: [BaseNote.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#fromJSON)

---

### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters:**

- **source**: `object`  
  Initial document data which comes from a trusted source
- **context** _(optional)_: Model construction context

**Returns:**  
A constructed DataModel instance

Inherits from: [BaseNote.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#fromSource)

---

### get

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters:**

- **documentId**: `string`  
  The Document ID
- **operation** _(optional)_: `DatabaseGetOperation` = `{}`  
  Parameters of the get operation

**Returns:**  
The retrieved Document, or `null`

Inherits from: [BaseNote.get](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#get)

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters:**

- **name**: `string`  
  An existing collection name or a document name.

**Returns:**  
The provided collection name if it exists, the first available collection for the document name provided, or `null` if no appropriate embedded collection could be found.

**Examples:**

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
Actor.implementation.getCollectionName("Item"); // returns "items"
```

Inherits from: [BaseNote.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#getCollectionName)

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters:**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns:**  
Migrated source data, which is the same object as the `source` argument

Inherits from: [BaseNote.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#migrateData)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters:**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns:**  
Migrated source data, which is the same object as the `source` argument

Inherits from: [BaseNote.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#migrateDataSafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters:**

- **data**: `object`  
  Data which matches the current schema
- **options** _(optional)_: `{ embedded?: boolean } = {}`  
  Additional shimming options
  - **embedded**?: `boolean` - Apply shims to embedded models?

**Returns:**  
Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherits from: [BaseNote.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#shimData)

---

### updateDocuments

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data.

**Parameters:**

- **updates** _(optional)_: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document
- **operation** _(optional)_: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation

**Returns:**  
An array of updated Document instances

**Examples:**

Update a single Document:

```typescript
const updates = [{ _id: "12ekjf43kj2312ds", name: "Timothy" }];
const updated = await Actor.implementation.updateDocuments(updates);
```

Update multiple Documents:

```typescript
const updates = [
  { _id: "12ekjf43kj2312ds", name: "Timothy" },
  { _id: "kj549dk48k34jk34", name: "Thomas" }
];
const updated = await Actor.implementation.updateDocuments(updates);
```

Update multiple embedded Documents within a parent:

```typescript
const actor = game.actors.getName("Timothy");
const updates = [
  { _id: sword.id, name: "Magic Sword" },
  { _id: shield.id, name: "Magic Shield" }
];
const updated = await Item.implementation.updateDocuments(updates, { parent: actor });
```

Update Documents within a Compendium pack:

```typescript
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{ _id: actor.id, name: "New Name" }], { pack: "mymodule.mypack" });
```

Inherits from: [BaseNote.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#updateDocuments)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters:**

- **data**: `object`  
  Candidate data for the model

**Returns:** `void`

**Throws:**  
An error if a validation failure is detected

Inherits from: [BaseNote.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#validateJoint)

---

### _onCreateOperation

```typescript
static protected _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were created
- **operation**: `DatabaseCreateOperation`  
  Parameters of the database creation operation
- **user**: `BaseUser`  
  The User who performed the creation operation

**Returns:**  
Promise<void>

Inherits from: [BaseNote._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_onCreateOperation)

---

### _onDeleteOperation

```typescript
static protected _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were deleted
- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation
- **user**: `BaseUser`  
  The User who performed the deletion operation

**Returns:**  
Promise<void>

Inherits from: [BaseNote._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_onDeleteOperation)

---

### _onUpdateOperation

```typescript
static protected _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were updated
- **operation**: `DatabaseUpdateOperation`  
  Parameters of the database update operation
- **user**: `BaseUser`  
  The User who performed the update operation

**Returns:**  
Promise<void>

Inherits from: [BaseNote._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_onUpdateOperation)

---

### _preCreateOperation

```typescript
static protected _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [updateSource](#updateSource).

**Parameters:**

- **documents**: Array of pending Document instances to be created
- **operation**: Parameters of the database creation operation
- **user**: The User requesting the creation operation

**Returns:**  
A Promise resolving to `false` to cancel the creation operation entirely, or `void`.

Inherits from: [BaseNote._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_preCreateOperation)

---

### _preDeleteOperation

```typescript
static protected _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or using [updateSource](#updateSource).

**Parameters:**

- **documents**: Document instances to be deleted
- **operation**: Parameters of the database deletion operation
- **user**: The User requesting the deletion operation

**Returns:**  
A Promise resolving to `false` to cancel the deletion operation entirely, or `void`.

Inherits from: [BaseNote._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_preDeleteOperation)

---

### _preUpdateOperation

```typescript
static protected _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters:**

- **documents**: Document instances to be updated
- **operation**: Parameters of the database update operation
- **user**: The User requesting the update operation

**Returns:**  
A Promise resolving to `false` to cancel the update operation entirely, or `void`.

Inherits from: [BaseNote._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html#_preUpdateOperation)