# BaseAdventure | Foundry Virtual Tabletop - API Documentation - Version 13

The Adventure Document. Defines the DataSchema and common behaviors for an Adventure which are shared between both client and server.

Mixes:  
- AdventureData

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.BaseAdventure), Expand)  
- _Document_  
- **BaseAdventure**  
- _documents.Adventure_

---

## Constructors

### constructor

```typescript
new BaseAdventure(
    data?: Partial<AdventureData>,
    options?: DocumentConstructionContext,
): BaseAdventure
```

**Parameters**

- **data** _Partial<AdventureData>_ = {}  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options** _DocumentConstructionContext_ = {}  
  Context and data validation options which affects initial model construction.

**Returns**  
_BaseAdventure_

Inherited from [Document.constructor](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#constructor)

---

## Properties

### _source

```typescript
_source: AdventureData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [Document._source](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_source)

---

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [Document.parent](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#parent)

---

### LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[] = ...
```

Overrides [Document.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#localization_prefixes)

---

### metadata

```typescript
static metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

Overrides [Document.metadata](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#metadata)

---

## Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
_null | string_

Inherited from [Document.id](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#id)

---

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
_boolean_

Inherited from [Document.inCompendium](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#inCompendium)

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
_boolean_

Inherited from [Document.invalid](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#invalid)

---

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
_boolean_

Inherited from [Document.isEmbedded](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#isEmbedded)

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
_SchemaField_

Inherited from [Document.schema](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#schema)

---

### thumbnail

```typescript
get thumbnail(): string
```

Provide a thumbnail image path used to represent the Adventure document.

**Returns**  
_string_

---

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
_string_

Inherited from [Document.uuid](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#uuid)

---

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

Inherited from [Document.validationFailures](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validationFailures)

---

## Static Accessors

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
_typeof Document_

Inherited from [Document.baseDocument](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#baseDocument)

---

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
_string_

Inherited from [Document.collectionName](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#collectionName)

---

### contentFields

```typescript
static get contentFields(): Record<string, typeof Document>
```

An array of the fields which provide imported content from the Adventure.

**Returns**  
_Record<string, typeof Document>_

---

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
_abstract.DatabaseBackend_

Inherited from [Document.database](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#database)

---

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
_string_

Inherited from [Document.documentName](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#documentName)

---

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
_boolean_

Inherited from [Document.hasTypeData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#hasTypeData)

---

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
_Readonly<Record<string, any>>_

Inherited from [Document.hierarchy](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#hierarchy)

---

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
_typeof Document_

Inherited from [Document.implementation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#implementation)

---

### schema

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
_SchemaField_

Inherited from [Document.schema](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#schema)

---

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
_string[]_

Inherited from [Document.TYPES](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#TYPES)

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- __namedParameters: { pack?: null; parentCollection?: null } = {}

**Returns**  
_void_

Inherited from [Document._configure](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_configure)

---

### canUserModify

```typescript
canUserModify(
    user: BaseUser,
    action: string,
    data?: object,
): boolean
```

Test whether a given User has permission to perform some action on this Document

**Parameters**

- **user** _BaseUser_  
  The User attempting modification

- **action** _string_  
  The attempted action

- **data** _object_ = {} *(Optional)*  
  Data involved in the attempted action

**Returns**  
_boolean_  
Does the User have permission?

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

- **data** _object_ = {} *(Optional)*  
  Additional data which overrides current document data at the time of creation

- **context** _DocumentConstructionContext & DocumentCloneOptions_ = {} *(Optional)*  
  Additional context options passed to the create method

**Returns**  
`Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>`  
The cloned Document instance

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

- **embeddedName** _string_  
  The name of the embedded Document type

- **data** _object[]_ = []  
  An array of data objects used to create multiple documents

- **operation** _DatabaseCreateOperation_ = {} *(Optional)*  
  Parameters of the database creation workflow

**Returns**  
_Promise<Document<object, DocumentConstructionContext>[]>_  
An array of created Document instances

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

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

- **operation** _Partial<Omit<DatabaseDeleteOperation, "ids">>_ = {} *(Optional)*  
  Parameters of the deletion operation

**Returns**  
_Promise<undefined | Document<object, DocumentConstructionContext>>_  
The deleted Document instance, or undefined if not deleted

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [Document.delete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#delete)

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

- **embeddedName** _string_  
  The name of the embedded Document type

- **ids** _string[]_  
  An array of string ids for each Document to be deleted

- **operation** _DatabaseDeleteOperation_ = {} *(Optional)*  
  Parameters of the database deletion workflow

**Returns**  
_Promise<Document<object, DocumentConstructionContext>[]>_  
An array of deleted Document instances

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [Document.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deleteembeddeddocuments)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name

**Parameters**

- **embeddedName** _string_  
  The name of the embedded Document type

**Returns**  
_DocumentCollection_  
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

- **embeddedName** _string_  
  The name of the embedded Document type

- **id** _string_  
  The id of the child document to retrieve

- **options** _{ invalid?: boolean; strict?: boolean }_ = {} *(Optional)*  
  Additional options which modify how embedded documents are retrieved

  - **invalid**?: _boolean_  
    Allow retrieving an invalid Embedded Document.

  - **strict**?: _boolean_  
    Throw an Error if the requested id does not exist. See Collection#get

**Returns**  
_Document<object, DocumentConstructionContext>_  
The retrieved embedded Document instance, or undefined

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [Document.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

**Parameters**

- **scope** _string_  
  The flag scope which namespaces the key

- **key** _string_  
  The flag key

**Returns**  
_any_  
The flag value

Inherited from [Document.getFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getflag)

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, testUserPermission should be used.

**Parameters**

- **user** _BaseUser_ *(Optional)*  
  The User being tested

**Returns**  
_DocumentOwnershipNumber_  
A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

Inherited from [Document.getUserLevel](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
_object_  
The migrated system data object

Inherited from [Document.migrateSystemData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratesystemdata)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
_void_

Inherited from [Document.reset](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#reset)

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

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module Flags set by an individual world should "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- **scope** _string_  
  The flag scope which namespaces the key

- **key** _string_  
  The flag key

- **value** _any_  
  The flag value

**Returns**  
_Promise<Document<object, DocumentConstructionContext>>_  
A Promise resolving to the updated document

Inherited from [Document.setFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#setflag)

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

- **user** _BaseUser_  
  The User being tested

- **permission** _DocumentOwnershipLevel_  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- **options** _{ exact?: boolean }_ = {} *(Optional)*  
  Additional options involved in the permission test

  - **exact**?: _boolean_ *(Optional)*  
    Require the exact permission level requested?

**Returns**  
_boolean_  
Does the user have this permission level over the Document?

Inherited from [Document.testUserPermission](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
_object_  
The document source data expressed as a plain object

Inherited from [Document.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source** _boolean_ = true  
  Draw values from the underlying data source rather than transformed values

**Returns**  
_any_  
The extracted primitive object

Inherited from [Document.toObject](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath** _string_ *(Optional)*  
  A parent field path already traversed

**Returns**  
_Generator<any, void, any>_

Inherited from [Document.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#traverseEmbeddedDocuments)

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

- **scope** _string_  
  The flag scope which namespaces the key

- **key** _string_  
  The flag key

**Returns**  
_Promise<Document<object, DocumentConstructionContext>>_  
The updated document instance

Inherited from [Document.unsetFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#unsetFlag)

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

- **data** _object_ = {} *(Optional)*  
  Differential update data which modifies the existing values of this document

- **operation** _Partial<Omit<DatabaseUpdateOperation, "updates">>_ = {} *(Optional)*  
  Parameters of the update operation

**Returns**  
_Promise<undefined | Document<object, DocumentConstructionContext>>_  
The updated Document instance, or undefined if not updated

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

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

- **embeddedName** _string_  
  The name of the embedded Document type

- **updates** _object[]_ = []  
  An array of differential data objects, each used to update a single Document

- **operation** _DatabaseUpdateOperation_ = {} *(Optional)*  
  Parameters of the database update workflow

**Returns**  
_Promise<Document<object, DocumentConstructionContext>[]>_  
An array of updated Document instances

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [Document.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateEmbeddedDocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes** _object_ = {}  
  New values which should be applied to the data model

- **options** _DataModelUpdateOptions_ = {}  
  Options which determine how the new data is merged

**Returns**  
_object_  
An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

Inherited from [Document.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateSource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options** _DataModelValidationOptions_ = {}  
  Options which modify how the model is validated

**Returns**  
_boolean_  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [Document.validate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validate)

---

## Protected Methods

### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options** _object_ = {} *(Optional)*  
  Options provided to the model constructor

**Returns**  
_void_

Inherited from [Document._initialize](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initialize)

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

- **data** _object | DataModel<object, DataModelConstructionContext>_  
  The candidate source data from which the model will be constructed

- **options** _object_ = {} *(Optional)*  
  Options provided to the model constructor

**Returns**  
_object_  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [Document._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializeSource)

---

### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data** _object_  
  The initial data object provided to the document creation request

- **options** _object_  
  Additional options which modify the creation request

- **userId** _string_  
  The id of the User requesting the document update

**Returns**  
_void_

Inherited from [Document._onCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onCreate)

---

### _onDelete

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options** _object_  
  Additional options which modify the deletion request

- **userId** _string_  
  The id of the User requesting the document update

**Returns**  
_void_

Inherited from [Document._onDelete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onDelete)

---

### _onUpdate

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed** _object_  
  The differential data that was changed relative to the documents prior values

- **options** _object_  
  Additional options which modify the update request

- **userId** _string_  
  The id of the User requesting the document update

**Returns**  
_void_

Inherited from [Document._onUpdate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onUpdate)

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

Modifications to the pending Document instance must be performed using [updateSource](#updateSource).

**Parameters**

- **data** _object_  
  The initial data object provided to the document creation request

- **options** _object_  
  Additional options which modify the creation request

- **user** _BaseUser_  
  The User requesting the document creation

**Returns**  
_Promise<boolean | void>_  
Return false to exclude this Document from the creation operation

Inherited from [Document._preCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preCreate)

---

### _preDelete

```typescript
_preDelete(
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options** _object_  
  Additional options which modify the deletion request

- **user** _BaseUser_  
  The User requesting the document deletion

**Returns**  
_Promise<boolean | void>_  
A return value of false indicates the deletion operation should be cancelled.

Inherited from [Document._preDelete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preDelete)

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

- **changes** _object_  
  The candidate changes to the Document

- **options** _object_  
  Additional options which modify the update request

- **user** _BaseUser_  
  The User requesting the document update

**Returns**  
_Promise<boolean | void>_  
A return value of false indicates the update operation should be cancelled.

Inherited from [Document._preUpdate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preUpdate)

---

## Static Methods

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
_Generator<any[], void, unknown>_

Inherited from [Document._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializationOrder)

---

### canUserCreate

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user** _BaseUser_  
  The User being tested

**Returns**  
_boolean_  
Does the User have a sufficient role to create?

Inherited from [Document.canUserCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canUserCreate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source** _object_ = {} *(Optional)*  
  The source data object

- **options** _object_ = {} *(Optional)*  
  Additional options which are passed to field cleaning methods

**Returns**  
_object_  
The cleaned source data, which is the same object as the `source` argument

Inherited from [Document.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#cleanData)

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

**Parameters**

- **data** _object | Document<object, DocumentConstructionContext> | Array<object | Document<object, DocumentConstructionContext>>_ = *(Optional)*  
  Initial data used to create this Document, or a Document instance to persist.

- **operation** _Partial<Omit<DatabaseCreateOperation, "data">>_ = {} *(Optional)*  
  Parameters of the creation operation

**Returns**

```typescript
Promise<
  | undefined
  | Document<object, DocumentConstructionContext>
  | Document<object, DocumentConstructionContext>[]
>
```

The created Document instance(s)

**See also**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createDocuments)

**Examples**

- Create a World-level Item

- Create an Actor-owned Item

```javascript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);
const actor = game.actors.getName("My Hero");
const createdOwned = await Item.implementation.create(data, {parent: actor});
```

- Create an Item in a Compendium pack

```javascript
const data = [{name: "Special Sword", type: "weapon"}];
const createdPacked = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create)

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

- **data** _(object | Document<object, DocumentConstructionContext>)[]_ = []  
  An array of data objects or existing Documents to persist.

- **operation** _Partial<Omit<DatabaseCreateOperation, "data">>_ = {} *(Optional)*  
  Parameters of the requested creation operation

**Returns**  
_Promise<Document<object, DocumentConstructionContext>[]>_  
An array of created Document instances

**Examples**

- Create a single Document

- Create multiple Documents

- Create multiple embedded Documents within a parent

```javascript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const dataMultiple = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const createdMultiple = await Actor.implementation.createDocuments(dataMultiple);

const actor = game.actors.getName("Tim");
const dataEmbedded = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const createdEmbedded = await Item.implementation.createDocuments(dataEmbedded, {parent: actor});

const dataPacked = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const createdPacked = await Actor.implementation.createDocuments(dataPacked, {pack: "mymodule.mypack"});
```

Inherited from [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createDocuments)

---

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    actors: SetField;
    caption: HTMLField;
    cards: SetField;
    combats: SetField;
    description: HTMLField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    folders: SetField;
    img: FilePathField;
    items: SetField;
    journal: SetField;
    macros: SetField;
    name: StringField;
    playlists: SetField;
    scenes: SetField;
    sort: IntegerSortField;
    tables: SetField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**

```typescript
{
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    actors: SetField;
    caption: HTMLField;
    cards: SetField;
    combats: SetField;
    description: HTMLField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    folders: SetField;
    img: FilePathField;
    items: SetField;
    journal: SetField;
    macros: SetField;
    name: StringField;
    playlists: SetField;
    scenes: SetField;
    sort: IntegerSortField;
    tables: SetField;
}
```

Overrides [Document.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#defineSchema)

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

- **ids** _string[]_ = []  
  An array of string ids for the documents to be deleted

- **operation** _Partial<Omit<DatabaseDeleteOperation, "ids">>_ = {} *(Optional)*  
  Parameters of the database deletion operation

**Returns**  
_Promise<Document<object, DocumentConstructionContext>[]>_  
An array of deleted Document instances

**Examples**

- Delete a single Document

- Delete multiple Documents

- Delete multiple embedded Documents within a parent

- Delete Documents within a Compendium pack

```javascript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedEmbedded = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actorFromPack = await pack.getDocument(documentId);
const deletedFromPack = await Actor.implementation.deleteDocuments([actorFromPack.id], {pack: "mymodule.mypack"});
```

Inherited from [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deleteDocuments)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json** _string_  
  Serialized document data in string format

**Returns**  
_DataModel<object, DataModelConstructionContext>_  
A constructed data model instance

Inherited from [Document.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromJSON)

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

- **source** _object_  
  Initial document data which comes from a trusted source.

- **context** _Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions_ = {} *(Optional)*  
  Model construction context

**Returns**  
_DataModel<object, DataModelConstructionContext>_

Inherited from [Document.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromSource)

---

### get

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId** _string_  
  The Document ID

- **operation** _DatabaseGetOperation_ = {} *(Optional)*  
  Parameters of the get operation

**Returns**  
_null | Document<object, DocumentConstructionContext>_  
The retrieved Document, or null

Inherited from [Document.get](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#get)

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name** _string_  
  An existing collection name or a document name.

**Returns**  
_null | string_  
The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Example: Passing an existing collection name**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"
```

**Example: Passing a document name**

```typescript
Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [Document.getCollectionName](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getCollectionName)

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source** _object_  
  The candidate source data from which the model will be constructed

**Returns**  
_object_  
Migrated source data, which is the same object as the `source` argument

Inherited from [Document.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migrateData)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely

**Parameters**

- **source** _object_  
  The candidate source data from which the model will be constructed

**Returns**  
_object_  
Migrated source data, which is the same object as the `source` argument

Inherited from [Document.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migrateDataSafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data** _object_  
  Data which matches the current schema

- **options** _{ embedded?: boolean }_ = {} *(Optional)*  
  Additional shimming options

  - **embedded**?: _boolean_ *(Optional)*  
    Apply shims to embedded models?

**Returns**  
_object_  
Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [Document.shimData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#shimData)

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

- **updates** _object[]_ = []  
  An array of differential data objects, each used to update a single Document

- **operation** _Partial<Omit<DatabaseUpdateOperation, "updates">>_ = {} *(Optional)*  
  Parameters of the database update operation

**Returns**  
_Promise<Document<object, DocumentConstructionContext>[]>_  
An array of updated Document instances

**Examples**

- Update a single Document

- Update multiple Documents

- Update multiple embedded Documents within a parent

```javascript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const multipleUpdates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updatedMultiple = await Actor.implementation.updateDocuments(multipleUpdates);

const actor = game.actors.getName("Timothy");
const embeddedUpdates = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updatedEmbedded = await Item.implementation.updateDocuments(embeddedUpdates, {parent: actor});

const packedUpdated = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateDocuments)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data** _object_  
  Candidate data for the model

**Returns**  
_void_

**Throws**  
An error if a validation failure is detected

Inherited from [Document.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validateJoint)

---

## Protected Static Methods

### _onCreateOperation

```typescript
static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual _onCreate workflows.

**Parameters**

- **documents** _Document<object, DocumentConstructionContext>[]_  
  The Document instances which were created

- **operation** _DatabaseCreateOperation_  
  Parameters of the database creation operation

- **user** _BaseUser_  
  The User who performed the creation operation

**Returns**  
_Promise<void>_

Inherited from [Document._onCreateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onCreateOperation)

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

This batch-wise workflow occurs after individual _onDelete workflows.

**Parameters**

- **documents** _Document<object, DocumentConstructionContext>[]_  
  The Document instances which were deleted

- **operation** _DatabaseDeleteOperation_  
  Parameters of the database deletion operation

- **user** _BaseUser_  
  The User who performed the deletion operation

**Returns**  
_Promise<void>_

Inherited from [Document._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onDeleteOperation)

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

This batch-wise workflow occurs after individual _onUpdate workflows.

**Parameters**

- **documents** _Document<object, DocumentConstructionContext>[]_  
  The Document instances which were updated

- **operation** _DatabaseUpdateOperation_  
  Parameters of the database update operation

- **user** _BaseUser_  
  The User who performed the update operation

**Returns**  
_Promise<void>_

Inherited from [Document._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onUpdateOperation)

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

This batch-wise workflow occurs after individual _preCreate workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [updateSource](#updateSource).

**Parameters**

- **documents** _Document<object, DocumentConstructionContext>[]_  
  Pending document instances to be created

- **operation** _DatabaseCreateOperation_  
  Parameters of the database creation operation

- **user** _BaseUser_  
  The User requesting the creation operation

**Returns**  
_Promise<boolean | void>_  
Return false to cancel the creation operation entirely

Inherited from [Document._preCreateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preCreateOperation)

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

This batch-wise workflow occurs after individual _preDelete workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or using [updateSource](#updateSource).

**Parameters**

- **documents** _Document<object, DocumentConstructionContext>[]_  
  Document instances to be deleted

- **operation** _DatabaseDeleteOperation_  
  Parameters of the database update operation

- **user** _BaseUser_  
  The User requesting the deletion operation

**Returns**  
_Promise<boolean | void>_  
Return false to cancel the deletion operation entirely

Inherited from [Document._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preDeleteOperation)

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

This batch-wise workflow occurs after individual _preUpdate workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- **documents** _Document<object, DocumentConstructionContext>[]_  
  Document instances to be updated

- **operation** _DatabaseUpdateOperation_  
  Parameters of the database update operation

- **user** _BaseUser_  
  The User requesting the update operation

**Returns**  
_Promise<boolean | void>_  
Return false to cancel the update operation entirely

Inherited from [Document._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preUpdateOperation)

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)