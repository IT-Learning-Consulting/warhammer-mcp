# BasePlaylistSound | Foundry Virtual Tabletop - API Documentation - Version 13

The PlaylistSound Document. Defines the DataSchema and common behaviors for a  
PlaylistSound which are shared between both client and server.

Mixes:  
- PlaylistSoundData

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.BasePlaylistSound), Expand)  
- [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html) (abstract)  
- **BasePlaylistSound**  
- documents.[PlaylistSound](https://foundryvtt.com/api/classes/foundry.documents.PlaylistSound.html)

---

## Constructors

### constructor

```typescript
new BasePlaylistSound(
    data?: Partial<PlaylistSoundData>,
    options?: DocumentConstructionContext,
): BasePlaylistSound
```

**Parameters**

- **data?** : `Partial<PlaylistSoundData>` = `{}`  
  Optional initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options?** : `DocumentConstructionContext` = `{}`  
  Context and data validation options which affect initial model construction.

**Returns:**  
BasePlaylistSound

Inherited from [Document.constructor](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#constructor)

---

## Properties

### _source

`_source: PlaylistSoundData`

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [Document._source](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_source)

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [Document.parent](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#parent)

### LOCALIZATION_PREFIXES

`LOCALIZATION_PREFIXES: string[] = ...`

Overrides [Document.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#localization_prefixes)

### metadata

`metadata: object = ...`

Default metadata which applies to each instance of this Document type.

Overrides [Document.metadata](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#metadata)

---

## Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns:**  
`null | string`

Inherited from Document.id

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns:**  
`boolean`

Inherited from Document.inCompendium

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns:**  
`boolean`

Inherited from Document.invalid

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns:**  
`boolean`

Inherited from Document.isEmbedded

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns:**  
`SchemaField`

Inherited from Document.schema

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns:**  
`string`

Inherited from Document.uuid

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

Inherited from Document.validationFailures

### baseDocument (static)

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns:**  
`typeof Document`

Inherited from Document.baseDocument

### collectionName (static)

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns:**  
`string`

Inherited from Document.collectionName

### database (static)

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns:**  
`abstract.DatabaseBackend`

Inherited from Document.database

### documentName (static)

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns:**  
`string`

Inherited from Document.documentName

### hasTypeData (static)

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns:**  
`boolean`

Inherited from Document.hasTypeData

### hierarchy (static)

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns:**  
`Readonly<Record<string, any>>`

Inherited from Document.hierarchy

### implementation (static)

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns:**  
`typeof Document`

Inherited from Document.implementation

### schema (static)

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns:**  
`SchemaField`

Inherited from Document.schema

### TYPES (static)

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns:**  
`string[]`

Inherited from Document.TYPES

---

## Methods

### _configure (protected)

```typescript
_configure(
  __namedParameters?: { pack?: null; parentCollection?: null }
): void
```

**Parameters**

- **__namedParameters?** : `{ pack?: null; parentCollection?: null }` = `{}`

**Returns:**  
`void`

Inherited from [Document._configure](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_configure)

---

### canUserModify

```typescript
canUserModify(
  user: BaseUser,
  action: string,
  data?: object
): boolean
```

Test whether a given User has permission to perform some action on this Document

**Parameters**

- **user** : `BaseUser`  
  The User attempting modification

- **action** : `string`  
  The attempted action

- **data?** : `object` = `{}`  
  Data involved in the attempted action

**Returns:**  
`boolean`

Inherited from [Document.canUserModify](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusermodify)

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

- **data?** : `object` = `{}`  
  Additional data which overrides current document data at the time of creation

- **context?** : `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method

**Returns:**  
The cloned Document instance (or a Promise resolving to it)

Inherited from [Document.clone](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#clone)

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

- **embeddedName** : `string`  
  The name of the embedded Document type

- **data?** : `object[]` = `[]`  
  An array of data objects used to create multiple documents

- **operation?** : `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow

**Returns:**  
Promise resolving to an array of created Document instances

See [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)  
Inherited from [Document.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createembeddeddocuments)

---

### delete

```typescript
delete(
  operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation?** : `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation

**Returns:**  
Promise resolving to the deleted Document instance or undefined if not deleted

See [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)  
Inherited from [Document.delete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#delete)

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
  embeddedName: string,
  ids: string[],
  operation?: DatabaseDeleteOperation
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- **embeddedName** : `string`  
  The name of the embedded Document type

- **ids** : `string[]`  
  An array of string ids for each Document to be deleted

- **operation?** : `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow

**Returns:**  
Promise resolving to an array of deleted Document instances

See [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)  
Inherited from [Document.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deleteembeddeddocuments)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name

**Parameters**

- **embeddedName** : `string`  
  The name of the embedded Document type

**Returns:**  
The Collection instance of embedded Documents of the requested type

Inherited from [Document.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddedcollection)

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

- **embeddedName** : `string`  
  The name of the embedded Document type

- **id** : `string`  
  The id of the child document to retrieve

- **options?** :  
  - **invalid?** : `boolean`  
    Allow retrieving an invalid Embedded Document.
  - **strict?** : `boolean`  
    Throw an Error if the requested id does not exist.

**Returns:**  
The retrieved embedded Document instance, or undefined

**Throws:**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [Document.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document See the setFlag method for more details on flags

**Parameters**

- **scope** : `string`  
  The flag scope which namespaces the key

- **key** : `string`  
  The flag key

**Returns:**  
The flag value

Inherited from [Document.getFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getflag)

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in  
[CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field  
in favor of User role-based ownership. Otherwise, Documents use granular per-User  
ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's  
role, for example a GAMEMASTER user might still return a result of NONE if they are not  
explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should  
be used.

**Parameters**

- **user?** : `BaseUser`  
  The User being tested

**Returns:**  
A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

Inherited from [Document.getUserLevel](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform  
to its latest data model. The data model is defined by the template.json specification  
included by the game system.

**Returns:**  
The migrated system data object

Inherited from [Document.migrateSystemData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratesystemdata)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any  
changes.

**Returns:**  
`void`

Inherited from [Document.reset](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#reset)

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to  
store flexible or arbitrary data required by either the core software, game systems, or user-  
created modules.

Each flag should be set using a scope which provides a namespace for the flag to help  
prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules  
should use the canonical name attribute for the module Flags set by an individual world  
should "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- **scope** : `string`  
  The flag scope which namespaces the key

- **key** : `string`  
  The flag key

- **value** : `any`  
  The flag value

**Returns:**  
A Promise resolving to the updated document

Inherited from [Document.setFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#setflag)

---

### testUserPermission

```typescript
testUserPermission(
  user: BaseUser,
  permission: DocumentOwnershipLevel,
  options?: { exact?: boolean }
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document

**Parameters**

- **user** : `BaseUser`  
  The User being tested

- **permission** : `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- **options?** : `{ exact?: boolean }` = `{}`  
  Additional options involved in the permission test

  - **exact?** : `boolean`  
    Require the exact permission level requested?

**Returns:**  
`boolean` indicating whether the user has this permission level over the Document

Inherited from [Document.testUserPermission](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:**  
The document source data expressed as a plain object

Inherited from [Document.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted  
object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source?** : `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns:**  
The extracted primitive object

Inherited from [Document.toObject](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath?** : `string`  
  A parent field path already traversed

**Returns:**  
Generator yielding embedded documents

Inherited from [Document.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#traverseembeddeddocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document

**Parameters**

- **scope** : `string`  
  The flag scope which namespaces the key

- **key** : `string`  
  The flag key

**Returns:**  
Promise resolving to the updated document instance

Inherited from [Document.unsetFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#unsetflag)

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

- **data?** : `object` = `{}`  
  Differential update data which modifies the existing values of this document

- **operation?** : `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation

**Returns:**  
Promise resolving to the updated Document instance, or undefined if not updated

See [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)  
Inherited from [Document.update](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#update)

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

- **embeddedName** : `string`  
  The name of the embedded Document type

- **updates?** : `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- **operation?** : `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow

**Returns:**  
Promise resolving to an array of updated Document instances

See [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)  
Inherited from [Document.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(
  changes?: object,
  options?: DataModelUpdateOptions
): object
```

Update the DataModel locally by applying an object of changes to its source data. The  
provided changes are expanded, cleaned, validated, and stored to the source data object for  
this model. The provided changes argument is mutated in this process. The source data is  
then re-initialized to apply those changes to the prepared data. The method returns an  
object of differential changes which modified the original data.

**Parameters**

- **changes?** : `object` = `{}`  
  New values which should be applied to the data model

- **options?** : `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns:**  
An object containing differential keys and values that were changed

**Throws:**  
An error if the requested data model changes were invalid

Inherited from [Document.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are  
provided, missing types are added to it before cleaning and validation. This mutates the  
provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options?** : `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns:**  
`boolean` indicating whether the data source or proposed change is valid. A boolean is always returned if validation is non-strict.

**Throws:**  
An error thrown if validation is strict and a failure occurs.

Inherited from [Document.validate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validate)

---

### _initialize (protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This  
mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options?** : `object` = `{}`  
  Options provided to the model constructor

**Returns:**  
`void`

Inherited from [Document._initialize](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initialize)

---

### _initializeSource (protected)

```typescript
_initializeSource(
  data: object | DataModel<object, DataModelConstructionContext>,
  options?: object
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial  
cleaning operations are applied to the source data.

**Parameters**

- **data** : `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options?** : `object` = `{}`  
  Options provided to the model constructor

**Returns:**  
Migrated and cleaned source data which will be stored to the model instance, which is the  
same object as the `data` argument

Inherited from [Document._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializesource)

---

### _onCreate (protected)

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events  
occur for all connected clients.

**Parameters**

- **data** : `object`  
  The initial data object provided to the document creation request

- **options** : `object`  
  Additional options which modify the creation request

- **userId** : `string`  
  The id of the User requesting the document update

**Returns:**  
`void`

Inherited from [Document._onCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_oncreate)

---

### _onDelete (protected)

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events  
occur for all connected clients.

**Parameters**

- **options** : `object`  
  Additional options which modify the deletion request

- **userId** : `string`  
  The id of the User requesting the document update

**Returns:**  
`void`

Inherited from [Document._onDelete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_ondelete)

---

### _onUpdate (protected)

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events  
occur for all connected clients.

**Parameters**

- **changed** : `object`  
  The differential data that was changed relative to the documents prior values

- **options** : `object`  
  Additional options which modify the update request

- **userId** : `string`  
  The id of the User requesting the document update

**Returns:**  
`void`

Inherited from [Document._onUpdate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onupdate)

---

### _preCreate (protected)

```typescript
_preCreate(
  data: object,
  options: object,
  user: BaseUser
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only  
occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [updateSource](#updatesource).

**Parameters**

- **data** : `object`  
  The initial data object provided to the document creation request

- **options** : `object`  
  Additional options which modify the creation request

- **user** : `BaseUser`  
  The User requesting the document creation

**Returns:**  
Promise resolving to `false` to exclude this Document from the creation operation, or nothing otherwise

Inherited from [Document._preCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_precreate)

---

### _preDelete (protected)

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only  
occur for the client which requested the operation.

**Parameters**

- **options** : `object`  
  Additional options which modify the deletion request

- **user** : `BaseUser`  
  The User requesting the document deletion

**Returns:**  
Promise resolving to `false` to cancel the deletion operation, or nothing otherwise

Inherited from [Document._preDelete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_predelete)

---

### _preUpdate (protected)

```typescript
_preUpdate(
  changes: object,
  options: object,
  user: BaseUser
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only  
occur for the client which requested the operation.

**Parameters**

- **changes** : `object`  
  The candidate changes to the Document

- **options** : `object`  
  Additional options which modify the update request

- **user** : `BaseUser`  
  The User requesting the document update

**Returns:**  
Promise resolving to `false` to cancel the update operation, or nothing otherwise

Inherited from [Document._preUpdate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preupdate)

---

### _initializationOrder (static, protected)

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns:**  
Generator for initialization order arrays

Inherited from [Document._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializationorder)

---

### canUserCreate (static)

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in  
general. This does not guarantee that the User is able to create all Documents of this type, as  
certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with  
the option to create Documents of this type in the UI.

**Parameters**

- **user** : `BaseUser`  
  The User being tested

**Returns:**  
Does the User have a sufficient role to create?

Inherited from [Document.canUserCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusercreate)

---

### cleanData (static)

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source?** : `object` = `{}`  
  The source data object

- **options?** : `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns:**  
The cleaned source data, which is the same object as the `source` argument

Inherited from [Document.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#cleandata)

---

### create (static)

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

- **data?** :  
  - `object`  
  - `Document<object, DocumentConstructionContext>`  
  - Array of `object` or `Document` instances

- **operation?** : `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation

**Returns:**  
Promise resolving to the created Document instance(s) or undefined

See [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

---

### createDocuments (static)

```typescript
static createDocuments(
  data?: (object | Document<object, DocumentConstructionContext>)[],
  operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects  
where each individual object becomes one new Document.

**Parameters**

- **data?** : `(object | Document<object, DocumentConstructionContext>)[]` = `[]`  
  An array of data objects or existing Documents to persist.

- **operation?** : `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation

**Returns:**  
Promise resolving to an array of created Document instances

---

### defineSchema (static)

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    channel: StringField;
    description: StringField;
    fade: NumberField;
    flags: DocumentFlagsField;
    name: StringField;
    path: FilePathField;
    pausedTime: NumberField;
    playing: BooleanField;
    repeat: BooleanField;
    sort: IntegerSortField;
    volume: AlphaField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it  
is accessed and cached for future reuse.

Overrides [Document.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#defineschema)

---

### deleteDocuments (static)

```typescript
static deleteDocuments(
  ids?: string[],
  operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided  
as an array of string ids for the documents to delete.

**Parameters**

- **ids?** : `string[]` = `[]`  
  An array of string ids for the documents to be deleted

- **operation?** : `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation

**Returns:**  
Promise resolving to an array of deleted Document instances

---

### fromJSON (static)

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json** : `string`  
  Serialized document data in string format

**Returns:**  
A constructed data model instance

Inherited from [Document.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromjson)

---

### fromSource (static)

```typescript
static fromSource(
  source: object,
  context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be  
trustworthy and is not strictly validated.

**Parameters**

- **source** : `object`  
  Initial document data which comes from a trusted source.

- **context?** :  
  `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context

**Returns:**  
A constructed DataModel instance

Inherited from [Document.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromsource)

---

### get (static)

```typescript
static get(
  documentId: string,
  operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId** : `string`  
  The Document ID

- **operation?** : `DatabaseGetOperation` = `{}`  
  Parameters of the get operation

**Returns:**  
The retrieved Document, or null

Inherited from [Document.get](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#get)

---

### getCollectionName (static)

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within  
this Document.

**Parameters**

- **name** : `string`  
  An existing collection name or a document name.

**Returns:**  
The provided collection name if it exists, the first available collection for the document name  
provided, or null if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
Actor.implementation.getCollectionName("Item");  // returns "items"
```

Inherited from [Document.getCollectionName](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getcollectionname)

---

### migrateData (static)

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or  
transformations.

**Parameters**

- **source** : `object`  
  The candidate source data from which the model will be constructed

**Returns:**  
Migrated source data, which is the same object as the `source` argument

Inherited from [Document.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedata)

---

### migrateDataSafe (static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely

**Parameters**

- **source** : `object`  
  The candidate source data from which the model will be constructed

**Returns:**  
Migrated source data, which is the same object as the `source` argument

Inherited from [Document.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedatasafe)

---

### shimData (static)

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible  
accessors to it in order to support older code which uses this data.

**Parameters**

- **data** : `object`  
  Data which matches the current schema

- **options?** : `{ embedded?: boolean }` = `{}`  
  Additional shimming options

  - **embedded?** : `boolean`  
    Apply shims to embedded models?

**Returns:**  
Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [Document.shimData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#shimdata)

---

### updateDocuments (static)

```typescript
static updateDocuments(
  updates?: object[],
  operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an  
array of objects where each individual object updates one existing Document.

**Parameters**

- **updates?** : `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- **operation?** : `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation

**Returns:**  
Promise resolving to an array of updated Document instances

---

### validateJoint (static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the  
model. Field-specific validation rules should be defined as part of the DataSchema for the  
model. This method allows for testing aggregate rules which impose requirements on the  
overall model.

**Parameters**

- **data** : `object`  
  Candidate data for the model

**Returns:**  
`void`

**Throws:**  
An error if a validation failure is detected

Inherited from [Document.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validatejoint)

---

### _onCreateOperation (static, protected)

```typescript
static _onCreateOperation(
  documents: Document<object, DocumentConstructionContext>[],
  operation: DatabaseCreateOperation,
  user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-  
operation events occur for all connected clients.  
This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters**

- **documents** : Array of Document instances which were created

- **operation** : DatabaseCreateOperation parameters

- **user** : The User who performed the creation operation

**Returns:**  
`Promise<void>`

Inherited from [Document._onCreateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_oncreateoperation)

---

### _onDeleteOperation (static, protected)

```typescript
static _onDeleteOperation(
  documents: Document<object, DocumentConstructionContext>[],
  operation: DatabaseDeleteOperation,
  user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-  
operation events occur for all connected clients.  
This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters**

- **documents** : Array of Document instances which were deleted

- **operation** : DatabaseDeleteOperation parameters

- **user** : The User who performed the deletion operation

**Returns:**  
`Promise<void>`

Inherited from [Document._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_ondeleteoperation)

---

### _onUpdateOperation (static, protected)

```typescript
static _onUpdateOperation(
  documents: Document<object, DocumentConstructionContext>[],
  operation: DatabaseUpdateOperation,
  user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-  
operation events occur for all connected clients.  
This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters**

- **documents** : Array of Document instances which were updated

- **operation** : DatabaseUpdateOperation parameters

- **user** : The User who performed the update operation

**Returns:**  
`Promise<void>`

Inherited from [Document._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onupdateoperation)

---

### _preCreateOperation (static, protected)

```typescript
static _preCreateOperation(
  documents: Document<object, DocumentConstructionContext>[],
  operation: DatabaseCreateOperation,
  user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-  
operation events only occur for the client which requested the operation.  
This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final  
pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual  
document instances using [updateSource](#updatesource).

**Parameters**

- **documents** : Pending document instances to be created

- **operation** : DatabaseCreateOperation parameters

- **user** : The User requesting the creation operation

**Returns:**  
Promise resolving to `false` to cancel the creation operation entirely, or nothing otherwise

Inherited from [Document._preCreateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_precreateoperation)

---

### _preDeleteOperation (static, protected)

```typescript
static _preDeleteOperation(
  documents: Document<object, DocumentConstructionContext>[],
  operation: DatabaseDeleteOperation,
  user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-  
operation events only occur for the client which requested the operation.  
This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final  
pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object and using [updateSource](#updatesource).

**Parameters**

- **documents** : Document instances to be deleted

- **operation** : DatabaseDeleteOperation parameters

- **user** : The User requesting the deletion operation

**Returns:**  
Promise resolving to `false` to cancel the deletion operation entirely, or nothing otherwise

Inherited from [Document._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_predeleteoperation)

---

### _preUpdateOperation (static, protected)

```typescript
static _preUpdateOperation(
  documents: Document<object, DocumentConstructionContext>[],
  operation: DatabaseUpdateOperation,
  user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-  
operation events only occur for the client which requested the operation.  
This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final  
pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the  
operation.

**Parameters**

- **documents** : Document instances to be updated

- **operation** : DatabaseUpdateOperation parameters

- **user** : The User requesting the update operation

**Returns:**  
Promise resolving to `false` to cancel the update operation entirely, or nothing otherwise

Inherited from [Document._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preupdateoperation)

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)