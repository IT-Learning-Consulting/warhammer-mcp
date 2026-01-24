# WallDocument

The client-side Wall document which extends the common BaseWall document model.

---

## Mixes

- ClientDocumentMixin

---

## See Also

- [foundry.documents.Scene](https://foundryvtt.com/api/classes/foundry.documents.Scene.html): The Scene document type which contains Wall documents
- [foundry.applications.sheets.WallConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.WallConfig.html): The Wall configuration application

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.WallDocument) | Expand

- BaseWall<this>  
- **WallDocument**

---

## Constructors

### constructor

```typescript
new WallDocument(
    data?: Partial<WallData>,
    options?: DocumentConstructionContext,
): WallDocument
```

**Parameters**

- **data**: `Partial<WallData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`WallDocument`

*Inherited from [BaseWall.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#constructor)*

---

## Properties

### _source

```typescript
_source: WallData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

*Inherited from [BaseWall._source](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_source)*

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

*Inherited from [BaseWall.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#parent)*

---

## Static Properties

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

*Inherited from [BaseWall.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#localization_prefixes)*

---

## Accessors

### metadata

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

*Inherited from [BaseWall.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#metadata)*

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

*Inherited from CanvasDocumentMixin(BaseWall).id*

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

*Inherited from CanvasDocumentMixin(BaseWall).inCompendium*

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

*Inherited from CanvasDocumentMixin(BaseWall).invalid*

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

*Inherited from CanvasDocumentMixin(BaseWall).isEmbedded*

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

*Inherited from CanvasDocumentMixin(BaseWall).schema*

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

*Inherited from CanvasDocumentMixin(BaseWall).uuid*

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

**Returns**

```typescript
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

*Inherited from CanvasDocumentMixin(BaseWall).validationFailures*

---

## Static Getters

### baseDocument

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

*Inherited from CanvasDocumentMixin(BaseWall).baseDocument*

### collectionName

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

*Inherited from CanvasDocumentMixin(BaseWall).collectionName*

### database

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

*Inherited from CanvasDocumentMixin(BaseWall).database*

### documentName

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

*Inherited from CanvasDocumentMixin(BaseWall).documentName*

### hasTypeData

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

*Inherited from CanvasDocumentMixin(BaseWall).hasTypeData*

### hierarchy

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

*Inherited from CanvasDocumentMixin(BaseWall).hierarchy*

### implementation

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

*Inherited from CanvasDocumentMixin(BaseWall).implementation*

### schema

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

*Inherited from CanvasDocumentMixin(BaseWall).schema*

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

*Inherited from CanvasDocumentMixin(BaseWall).TYPES*

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

*Inherited from BaseWall._initializationOrder*

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- `__namedParameters`: `{ pack?: null; parentCollection?: null } = {}`

**Returns**  
`void`

*Inherited from [BaseWall._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_configure)*

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document

**Parameters**

- **user**: `BaseUser`  
  The User attempting modification

- **action**: `string`  
  The attempted action

- **data**: `object` = `{}` (Optional)  
  Data involved in the attempted action

**Returns**  
`boolean`

*Inherited from [BaseWall.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#canusermodify)*

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

- **data**: `object` = `{}` (Optional)  
  Additional data which overrides current document data at the time of creation

- **context**: `DocumentConstructionContext & DocumentCloneOptions` = `{}` (Optional)  
  Additional context options passed to the create method

**Returns**  
The cloned Document instance

*Inherited from [BaseWall.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#clone)*

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
  The name of the embedded Document type

- **data**: `object[]` = `[]` (Optional)  
  An array of data objects used to create multiple documents

- **operation**: `DatabaseCreateOperation` = `{}` (Optional)  
  Parameters of the database creation workflow

**Returns**  
`Promise` resolving with an array of created Document instances

**See Also**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

*Inherited from [BaseWall.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#createembeddeddocuments)*

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` (Optional)  
  Parameters of the deletion operation

**Returns**  
`Promise` resolving to the deleted Document instance, or `undefined` if not deleted

**See Also**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [BaseWall.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#delete)*

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
  The name of the embedded Document type

- **ids**: `string[]`  
  An array of string ids for each Document to be deleted

- **operation**: `DatabaseDeleteOperation` = `{}` (Optional)  
  Parameters of the database deletion workflow

**Returns**  
`Promise` resolving with an array of deleted Document instances

**See Also**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [BaseWall.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#deleteembeddeddocuments)*

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

**Returns**  
`DocumentCollection` - The Collection instance of embedded Documents of the requested type

*Inherited from [BaseWall.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#getembeddedcollection)*

---

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext> | undefined
```

Get an embedded document by its id from a named collection in the parent document.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

- **id**: `string`  
  The id of the child document to retrieve

- **options**: `{ invalid?: boolean; strict?: boolean }` = `{}` (Optional)  
  Additional options which modify how embedded documents are retrieved.

  - **invalid**?: `boolean` — Allow retrieving an invalid Embedded Document.
  - **strict**?: `boolean` — Throw an Error if the requested id does not exist. See Collection#get.

**Returns**  
The retrieved embedded Document instance, or `undefined`

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

*Inherited from [BaseWall.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#getembeddeddocument)*

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns**  
The flag value

*Inherited from [BaseWall.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#getflag)*

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user**: `BaseUser` (Optional)  
  The User being tested

**Returns**  
`DocumentOwnershipNumber` - A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

*Inherited from [BaseWall.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#getuserlevel)*

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
The migrated system data object

*Inherited from [BaseWall.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#migratesystemdata)*

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

*Inherited from [BaseWall.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#reset)*

---

### setFlag

```typescript
setFlag(
    scope: string,
    key: string,
    value: any,
): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the `"core"` scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use `"world"` as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

- **value**: `any`  
  The flag value

**Returns**  
A Promise resolving to the updated document

*Inherited from [BaseWall.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#setflag)*

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
  The User being tested

- **permission**: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- **options**: `{ exact?: boolean }` = `{}` (Optional)  
  Additional options involved in the permission test

  - **exact**?: `boolean` — Require the exact permission level requested?

**Returns**  
`boolean` — Does the user have this permission level over the Document?

*Inherited from [BaseWall.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#testuserpermission)*

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

*Inherited from [BaseWall.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#tojson)*

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**  
The extracted primitive object

*Inherited from [BaseWall.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#toobject)*

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath**: `string` (Optional)  
  A parent field path already traversed

**Returns**  
Generator that yields embedded documents.

*Inherited from [BaseWall.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#traverseembeddeddocuments)*

---

### unsetFlag

```typescript
unsetFlag(
    scope: string,
    key: string,
): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns**  
A Promise resolving to the updated document.

*Inherited from [BaseWall.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#unsetflag)*

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

- **data**: `object` = `{}` (Optional)  
  Differential update data which modifies the existing values of this document

- **operation**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` (Optional)  
  Parameters of the update operation

**Returns**  
The updated Document instance, or undefined if not updated

**See Also**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [BaseWall.update](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#update)*

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
  The name of the embedded Document type

- **updates**: `object[]` = `[]` (Optional)  
  An array of differential data objects, each used to update a single Document

- **operation**: `DatabaseUpdateOperation` = `{}` (Optional)  
  Parameters of the database update workflow

**Returns**  
An array of updated Document instances

**See Also**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [BaseWall.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#updateembeddeddocuments)*

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = `{}`  
  New values which should be applied to the data model

- **options**: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns**  
An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

*Inherited from [BaseWall.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#updatesource)*

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns**  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

*Inherited from [BaseWall.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#validate)*

---

### _initialize (Protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: `object` = `{}` (Optional)  
  Options provided to the model constructor

**Returns**  
`void`

*Inherited from [BaseWall._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_initialize)*

---

### _initializeSource (Protected)

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options**: `object` = `{}` (Optional)  
  Options provided to the model constructor

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

*Inherited from [BaseWall._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_initializesource)*

---

### _onCreate (Protected)

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request

- **options**: `object`  
  Additional options which modify the creation request

- **userId**: `string`  
  The id of the User requesting the document update

**Returns**  
`void`

*Inherited from [BaseWall._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_oncreate)*

---

### _onDelete (Protected)

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request

- **userId**: `string`  
  The id of the User requesting the document update

**Returns**  
`void`

*Inherited from [BaseWall._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_ondelete)*

---

### _onUpdate (Protected)

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `object`  
  The differential data that was changed relative to the documents prior values

- **options**: `object`  
  Additional options which modify the update request

- **userId**: `string`  
  The id of the User requesting the document update

**Returns**  
`void`

*Inherited from [BaseWall._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_onupdate)*

---

### _preCreate (Protected)

```typescript
_preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [updateSource](#updateSource).

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request

- **options**: `object`  
  Additional options which modify the creation request

- **user**: `BaseUser`  
  The User requesting the document creation

**Returns**  
`Promise` resolving to boolean or void. Return false to exclude this Document from the creation operation.

*Inherited from [BaseWall._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_precreate)*

---

### _preDelete (Protected)

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request

- **user**: `BaseUser`  
  The User requesting the document deletion

**Returns**  
`Promise` resolving to boolean or void. Return false to cancel the deletion operation.

*Inherited from [BaseWall._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_predelete)*

---

### _preUpdate (Protected)

```typescript
_preUpdate(changes: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changes**: `object`  
  The candidate changes to the Document

- **options**: `object`  
  Additional options which modify the update request

- **user**: `BaseUser`  
  The User requesting the document update

**Returns**  
`Promise` resolving to boolean or void. Return false to cancel the update operation.

*Inherited from [BaseWall._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#_preupdate)*

---

### Static canUserCreate

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user**: `BaseUser`  
  The User being tested

**Returns**  
`boolean` — Does the User have a sufficient role to create?

*Inherited from [BaseWall.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#canusercreate)*

---

### Static cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object` = `{}` (Optional)  
  The source data object

- **options**: `object` = `{}` (Optional)  
  Additional options which are passed to field cleaning methods

**Returns**  
The cleaned source data, which is the same object as the `source` argument

*Inherited from [BaseWall.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#cleandata)*

---

### Static create

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

**Parameters**

- **data**: `object | Document | Array<object | Document>` (Optional)  
  Initial data used to create this Document, or a Document instance to persist.

- **operation**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` (Optional)  
  Parameters of the creation operation

**Returns**  
The created Document instance(s)

**See Also**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const createdOwned = await Item.implementation.create(data, {parent: actor});

const createdInPack = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

*Inherited from [BaseWall.create](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#create)*

---

### Static createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data**: `(object | Document)[]` = `[]` (Optional)  
  An array of data objects or existing Documents to persist.

- **operation**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` (Optional)  
  Parameters of the requested creation operation

**Returns**  
A Promise resolving to an array of created Document instances

**Examples**

```typescript
const dataSingle = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const createdSingle = await Actor.implementation.createDocuments(dataSingle);

const dataMultiple = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const createdMultiple = await Actor.implementation.createDocuments(dataMultiple);

const actor = game.actors.getName("Tim");
const dataEmbedded = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const createdEmbedded = await Item.implementation.createDocuments(dataEmbedded, {parent: actor});

const dataCompendium = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const createdInPack = await Actor.implementation.createDocuments(dataCompendium, {pack: "mymodule.mypack"});
```

*Inherited from [BaseWall.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#createdocuments)*

---

### Static defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    animation: SchemaField;
    c: ArrayField<NumberField>;
    dir: NumberField;
    door: NumberField;
    doorSound: StringField;
    ds: NumberField;
    flags: DocumentFlagsField;
    light: NumberField;
    move: NumberField;
    sight: NumberField;
    sound: NumberField;
    threshold: SchemaField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
The schema as an object defining fields.

*Inherited from [BaseWall.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#defineschema)*

---

### Static deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids**: `string[]` = `[]` (Optional)  
  An array of string ids for the documents to be deleted

- **operation**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` (Optional)  
  Parameters of the database deletion operation

**Returns**  
A Promise resolving to an array of deleted Document instances

**Examples**

```typescript
const tim = game.actors.getName("Tim");
const deletedOne = await Actor.implementation.deleteDocuments([tim.id]);

const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedEmbedded = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actor = await pack.getDocument(documentId);
const deletedFromPack = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

*Inherited from [BaseWall.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#deletedocuments)*

---

### Static fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns**  
A constructed data model instance

*Inherited from [BaseWall.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#fromjson)*

---

### Static fromSource

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

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` (Optional)  
  Model construction context

**Returns**  
A DataModel instance

*Inherited from [BaseWall.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#fromsource)*

---

### Static get

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string`  
  The Document ID

- **operation**: `DatabaseGetOperation` = `{}` (Optional)  
  Parameters of the get operation

**Returns**  
The retrieved Document, or `null`

*Inherited from [BaseWall.get](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#get)*

---

### Static getCollectionName

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

*Inherited from [BaseWall.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#getcollectionname)*

---

### Static migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument

*Inherited from [BaseWall.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#migratedata)*

---

### Static migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument

*Inherited from [BaseWall.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#migratedatasafe)*

---

### Static shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema

- **options**: `{ embedded?: boolean }` = `{}` (Optional)  
  Additional shimming options

  - **embedded**?: `boolean` — Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

*Inherited from [BaseWall.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#shimdata)*

---

### Static updateDocuments

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- **operation**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` (Optional)  
  Parameters of the database update operation

**Returns**  
A Promise resolving to an array of updated Document instances

**Examples**

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const updatesMultiple = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updatedMultiple = await Actor.implementation.updateDocuments(updatesMultiple);

const actor = game.actors.getName("Timothy");
const updatesEmbedded = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updatedEmbedded = await Item.implementation.updateDocuments(updatesEmbedded, {parent: actor});

const packActor = await pack.getDocument(documentId);
const updatedInPack = await Actor.implementation.updateDocuments([{_id: packActor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

*Inherited from [BaseWall.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#updatedocuments)*

---

### Static validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected

*Inherited from [BaseWall.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html#validatejoint)*

---

### Protected Static Methods (Batch Operation Hooks)

These methods are called after batch database operations have been completed for created, deleted, or updated documents.

- **_onCreateOperation**

```typescript
static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

- **_onDeleteOperation**

```typescript
static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

- **_onUpdateOperation**

```typescript
static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

---

### Protected Static Methods (Pre-Operation Hooks)

These pre-operation hooks are called before batch database operations and allow to modify or cancel the operations.

- **_preCreateOperation**

```typescript
static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

- **_preDeleteOperation**

```typescript
static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

- **_preUpdateOperation**

```typescript
static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

---

*This documentation is based on [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.documents.WallDocument.html).*