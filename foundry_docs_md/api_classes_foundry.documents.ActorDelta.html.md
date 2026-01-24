# ActorDelta | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side `ActorDelta` embedded document which extends the common `BaseActorDelta` document model.

Mixes:  
**ClientDocumentMixin**

See also:  
[foundry.documents.TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html) - The TokenDocument document type which contains ActorDelta embedded documents.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.ActorDelta), Expand):
- _BaseActorDelta_<this>
- **ActorDelta**

---

## Constructors

### constructor

```typescript
new ActorDelta(
    data?: Partial<ActorDeltaData>,
    options?: DocumentConstructionContext,
): documents.ActorDelta
```

**Parameters**  
- **data?**: `Partial<ActorDeltaData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.  
  Optional.

- **options?**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.  
  Optional.

**Returns**  
`documents.ActorDelta`

_Inherited from [BaseActorDelta.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#constructor)_

---

## Properties

### _source

```typescript
_source: ActorDeltaData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

_Inherited from [BaseActorDelta._source](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_source)_

---

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

_Inherited from [BaseActorDelta.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#parent)_

---

## Accessors

### Static LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

_Inherited from [BaseActorDelta.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#localization_prefixes)_

---

### Static metadata

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

_Inherited from [BaseActorDelta.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#metadata)_

---

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null` | `string`

_Inherited from ClientDocumentMixin(BaseActorDelta).id_

---

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActorDelta).inCompendium_

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActorDelta).invalid_

---

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActorDelta).isEmbedded_

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

_Inherited from ClientDocumentMixin(BaseActorDelta).schema_

---

### type

```typescript
get type(): string
```

Pass-through the type from the synthetic Actor, if it exists.

**Returns**  
`string`

---

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseActorDelta).uuid_

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

_Inherited from ClientDocumentMixin(BaseActorDelta).validationFailures_

---

### Static baseDocument

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

_Inherited from ClientDocumentMixin(BaseActorDelta).baseDocument_

---

### Static collectionName

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseActorDelta).collectionName_

---

### Static database

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

_Inherited from ClientDocumentMixin(BaseActorDelta).database_

---

### Static documentName

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseActorDelta).documentName_

---

### Static hasTypeData

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActorDelta).hasTypeData_

---

### Static hierarchy

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

_Inherited from ClientDocumentMixin(BaseActorDelta).hierarchy_

---

### Static implementation

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

_Inherited from ClientDocumentMixin(BaseActorDelta).implementation_

---

### Static schema

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

_Inherited from ClientDocumentMixin(BaseActorDelta).schema_

---

### Static TYPES

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

_Inherited from ClientDocumentMixin(BaseActorDelta).TYPES_

---

## Methods

### _configure

```typescript
_configure(options?: {}): void
```

**Parameters**  
- **options?**: `{}` = `{}`

**Returns**  
`void`

Overrides [BaseActorDelta._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_configure)

---

### _dispatchDescendantDocumentEvents

```typescript
_dispatchDescendantDocumentEvents(
    event: any,
    collection: any,
    args: any,
    _parent: any,
): void
```

**Parameters**  
- **event**: `any`  
- **collection**: `any`  
- **args**: `any`  
- **_parent**: `any`

**Returns**  
`void`

Inherit Doc

---

### _initialize

```typescript
_initialize(__namedParameters?: { sceneReset?: boolean }): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**  
- **__namedParameters?**: `{ sceneReset?: boolean }` = `{}`  
  Options provided to the model constructor

**Returns**  
`void`

Overrides [BaseActorDelta._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_initialize)

---

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**  
- **options**: `any`  
  Additional options which modify the deletion request  
- **userId**: `any`  
  The id of the User requesting the document update

**Returns**  
`void`

Overrides [BaseActorDelta._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_ondelete)

---

### _onSheetChange

```typescript
_onSheetChange(): Promise<void>
```

**Returns**  
`Promise<void>`

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**  
- **changed**: `any`  
  The differential data that was changed relative to the documents prior values  
- **options**: `any`  
  Additional options which modify the update request  
- **userId**: `any`  
  The id of the User requesting the document update

**Returns**  
`void`

Overrides [BaseActorDelta._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_onupdate)

---

### _preDelete

```typescript
_preDelete(options: any, user: any): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**  
- **options**: `any`  
  Additional options which modify the deletion request  
- **user**: `any`  
  The User requesting the document deletion

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

Overrides [BaseActorDelta._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_predelete)

---

### apply

```typescript
apply(context?: object): any
```

Apply this ActorDelta to the base Actor and return a synthetic Actor.

**Parameters**  
- **context?**: `object` = `{}`  
  Context to supply to synthetic Actor instantiation. Optional.

**Returns**  
`any`

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
- **data?**: `object` = `{}`  
  Data involved in the attempted action (optional)

**Returns**  
`boolean`

Inherited from [BaseActorDelta.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#canusermodify)

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
  Additional data which overrides current document data at the time of creation (optional)  
- **context?**: `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method (optional)

**Returns**  
`Document<object, DocumentConstructionContext>` or `Promise<Document<object, DocumentConstructionContext>>`

Inherited from [BaseActorDelta.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#clone)

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
- **data?**: `object[]` = `[]`  
  An array of data objects used to create multiple documents (optional)  
- **operation?**: `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow (optional)

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of created Document instances.

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseActorDelta.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#createembeddeddocuments)

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
  Parameters of the deletion operation (optional)

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The deleted Document instance, or undefined if not deleted.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseActorDelta.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#delete)

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
- **operation?**: `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow (optional)

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of deleted Document instances.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseActorDelta.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#deleteembeddeddocuments)

---

### getBaseCollection

```typescript
getBaseCollection(collectionName: string): Collection
```

Retrieve the base actor's collection, if it exists.

**Parameters**  
- **collectionName**: `string`  
  The collection name.

**Returns**  
`Collection`

Inherited from [BaseActorDelta.getBaseCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#getbasecollection)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name

**Parameters**  
- **embeddedName**: `string`  
  The name of the embedded Document type

**Returns**  
`DocumentCollection` - The Collection instance of embedded Documents of the requested type.

Inherited from [BaseActorDelta.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#getembeddedcollection)

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
  The name of the embedded Document type  
- **id**: `string`  
  The id of the child document to retrieve  
- **options?**: `{ invalid?: boolean; strict?: boolean }` = `{}`  
  Additional options which modify how embedded documents are retrieved  
  - **invalid?**: `boolean` — Allow retrieving an invalid Embedded Document. Optional.  
  - **strict?**: `boolean` — Throw an Error if the requested id does not exist. See Collection#get. Optional.

**Returns**  
`Document<object, DocumentConstructionContext>`  
The retrieved embedded Document instance, or throws if not found in strict mode.

Inherited from [BaseActorDelta.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#getembeddeddocument)

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
`any` - The flag value

Inherited from [BaseActorDelta.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#getflag)

---

### getUserLevel

```typescript
getUserLevel(user: any): any
```

**Parameters**  
- **user**: `any`

**Returns**  
`any`

Inherited from [BaseActorDelta.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns**  
`object` - The migrated system data object.

Inherited from [BaseActorDelta.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#migratesystemdata)

---

### prepareEmbeddedDocuments

```typescript
prepareEmbeddedDocuments(): void
```

**Returns**  
`void`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Overrides [BaseActorDelta.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#reset)

---

### restore

```typescript
restore(): Promise<Actor>
```

Restore this delta to empty, inheriting all its properties from the base actor.

**Returns**  
`Promise<Actor>` - The restored synthetic Actor.

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

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**  
- **scope**: `string`  
  The flag scope which namespaces the key  
- **key**: `string`  
  The flag key  
- **value**: `any`  
  The flag value

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
A Promise resolving to the updated document

Inherited from [BaseActorDelta.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#setflag)

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
  The permission level from `DOCUMENT_OWNERSHIP_LEVELS` to test  
- **options?**: `{ exact?: boolean }` = `{}`  
  Additional options involved in the permission test
  - **exact?**: `boolean`  
    Require the exact permission level requested? Optional.

**Returns**  
`boolean`  
Does the user have this permission level over the Document?

Inherited from [BaseActorDelta.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object` - The document source data expressed as a plain object

Inherited from [BaseActorDelta.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): {}
```

**Parameters**  
- **source?**: `boolean` = `true`

**Returns**  
`{}`

Inherited from [BaseActorDelta.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**  
- **_parentPath?**: `string`  
  A parent field path already traversed (optional)

**Returns**  
`Generator<any, void, any>`

Inherited from [BaseActorDelta.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#traverseembeddeddocuments)

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
`Promise<Document<object, DocumentConstructionContext>>` - The updated document instance.

Inherited from [BaseActorDelta.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#unsetflag)

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
  Differential update data which modifies the existing values of this document (optional)  
- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation (optional)

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The updated Document instance, or undefined if not updated.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseActorDelta.update](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#update)

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
- **updates?**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document (optional)  
- **operation?**: `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow (optional)

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of updated Document instances.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseActorDelta.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(changes?: {}, options?: {}): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**  
- **changes?**: `{}` = `{}`  
  New values which should be applied to the data model (optional)  
- **options?**: `{}` = `{}`  
  Options which determine how the new data is merged (optional)

**Returns**  
`object` - An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Overrides [BaseActorDelta.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#updatesource)

---

### updateSyntheticActor

```typescript
updateSyntheticActor(): void
```

Update the synthetic Actor instance with changes from the delta or the base Actor.

**Returns**  
`void`

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**  
- **options?**: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated (optional)

**Returns**  
`boolean` - Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseActorDelta.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#validate)

---

### Protected Methods

#### _initializeSource

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
- **options?**: `object` = `{}`  
  Options provided to the model constructor (optional)

**Returns**  
`object` - Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [BaseActorDelta._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_initializesource)

---

#### _onCreate

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

Inherited from [BaseActorDelta._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_oncreate)

---

#### _preCreate

```typescript
_preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using `updateSource`.

**Parameters**  
- **data**: `object`  
  The initial data object provided to the document creation request  
- **options**: `object`  
  Additional options which modify the creation request  
- **user**: `BaseUser`  
  The User requesting the document creation

**Returns**  
`Promise<boolean | void>`  
Return false to exclude this Document from the creation operation.

Inherited from [BaseActorDelta._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_precreate)

---

#### _preUpdate

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
  The candidate changes to the Document  
- **options**: `object`  
  Additional options which modify the update request  
- **user**: `BaseUser`  
  The User requesting the document update

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

Inherited from [BaseActorDelta._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_preupdate)

---

## Static Methods

### _initializationOrder

```typescript
_initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from [BaseActorDelta._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_initializationorder)

---

### applyDelta

```typescript
applyDelta(
    delta: ActorDelta,
    baseActor: BaseActor,
    context?: object,
): null | BaseActor
```

Apply an ActorDelta to an Actor and return the resultant synthetic Actor.

**Parameters**  
- **delta**: `ActorDelta`  
  The ActorDelta.  
- **baseActor**: `BaseActor`  
  The base Actor.  
- **context?**: `object` = `{}`  
  Context to supply to synthetic Actor instantiation. Optional.

**Returns**  
`null | BaseActor`

Inherited from [BaseActorDelta.applyDelta](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#applydelta)

---

### canUserCreate

```typescript
canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**  
- **user**: `BaseUser`  
  The User being tested

**Returns**  
`boolean`  
Does the User have a sufficient role to create?

Inherited from [BaseActorDelta.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#canusercreate)

---

### cleanData

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**  
- **source?**: `object` = `{}`  
  The source data object (optional)  
- **options?**: `object` = `{}`  
  Additional options which are passed to field cleaning methods (optional)

**Returns**  
`object` - The cleaned source data, which is the same object as the `source` argument.

Inherited from [BaseActorDelta.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#cleandata)

---

### create

```typescript
create(
    data?: 
        | object
        | Document<object, DocumentConstructionContext>
        | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<
    | undefined
    | Document<object, DocumentConstructionContext>
    | Document<object, DocumentConstructionContext>[],
>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**  
- **data?**:  
  - `object` or  
  - `Document<object, DocumentConstructionContext>` or  
  - `(object | Document<object, DocumentConstructionContext>)[]`  
  Initial data used to create this Document, or a Document instance to persist. Optional.  
- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation (optional)

**Returns**  
`Promise` which resolves to:  
- `undefined` or  
- `Document<object, DocumentConstructionContext>` or  
- `Document<object, DocumentConstructionContext>[]`

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

#### Examples

- Create a World-level Item
- Create an Actor-owned Item

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);
```

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});
```

- Create an Item in a Compendium pack

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseActorDelta.create](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#create)

---

### createDocuments

```typescript
createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**  
- **data?**: `(object | Document<object, DocumentConstructionContext>)[]` = `[]`  
  An array of data objects or existing Documents to persist (optional)  
- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation (optional)

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of created Document instances.

#### Examples

- Create a single Document  
- Create multiple Documents  
- Create multiple embedded Documents within a parent

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);
```

```typescript
const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);
```

```typescript
const actor = game.actors.getName("Tim");
const data = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const created = await Item.implementation.createDocuments(data, {parent: actor});
```

- Create a Document within a Compendium pack

```typescript
const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseActorDelta.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#createdocuments)

---

### defineSchema

```typescript
defineSchema(): {
    _id: DocumentIdField;
    effects: EmbeddedCollectionDeltaField;
    flags: DocumentFlagsField;
    img: FilePathField;
    items: EmbeddedCollectionDeltaField;
    name: StringField;
    ownership: DocumentOwnershipField;
    system: ObjectField;
    type: StringField;
}
```

Returns the schema definition object.

Inherited from [BaseActorDelta.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#defineschema)

---

### deleteDocuments

```typescript
deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**  
- **ids?**: `string[]` = `[]`  
  An array of string ids for the documents to be deleted (optional)  
- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation (optional)

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of deleted Document instances.

#### Examples

- Delete a single Document  
- Delete multiple Documents  
- Delete multiple embedded Documents within a parent  
- Delete Documents within a Compendium pack

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);
```

```typescript
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);
```

```typescript
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});
```

```typescript
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from [BaseActorDelta.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#deletedocuments)

---

### fromJSON

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**  
- **json**: `string`  
  Serialized document data in string format

**Returns**  
`DataModel<object, DataModelConstructionContext>` - A constructed data model instance

Inherited from [BaseActorDelta.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#fromjson)

---

### fromSource

```typescript
fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**  
- **source**: `object`  
  Initial document data which comes from a trusted source.  
- **context?**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context (optional)

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [BaseActorDelta.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#fromsource)

---

### get

```typescript
get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**  
- **documentId**: `string`  
  The Document ID  
- **operation?**: `DatabaseGetOperation` = `{}`  
  Parameters of the get operation (optional)

**Returns**  
`null | Document<object, DocumentConstructionContext>`  
The retrieved Document, or null.

Inherited from [BaseActorDelta.get](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#get)

---

### getCollectionName

```typescript
getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**  
- **name**: `string`  
  An existing collection name or a document name.

**Returns**  
`null | string`  
The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

#### Examples

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [BaseActorDelta.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#getcollectionname)

---

### migrateData

```typescript
migrateData(source: any): object
```

**Parameters**  
- **source**: `any`

**Returns**  
`object`

Inherited from [BaseActorDelta.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#migratedata)

---

### migrateDataSafe

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**  
- **source**: `object`

**Returns**  
`object` - Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseActorDelta.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#migratedatasafe)

---

### shimData

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**  
- **data**: `object`  
  Data which matches the current schema  
- **options?**: `{ embedded?: boolean }` = `{}`  
  Additional shimming options  
  - **embedded?**: `boolean` - Apply shims to embedded models? Optional.

**Returns**  
`object` - Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [BaseActorDelta.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#shimdata)

---

### updateDocuments

```typescript
updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**  
- **updates?**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document (optional)  
- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation (optional)

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of updated Document instances.

#### Examples

- Update a single Document  
- Update multiple Documents  
- Update multiple embedded Documents within a parent  
- Update Documents within a Compendium pack

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);
```

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updated = await Actor.implementation.updateDocuments(updates);
```

```typescript
const actor = game.actors.getName("Timothy");
const updates = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updated = await Item.implementation.updateDocuments(updates, {parent: actor});
```

```typescript
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [BaseActorDelta.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#updatedocuments)

---

### validateJoint

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**  
- **data**: `object`  
  Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from [BaseActorDelta.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#validatejoint)

---

### Protected Static Methods

#### _onCreateOperation

```typescript
_onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters**  
- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were created  
- **operation**: `DatabaseCreateOperation`  
  Parameters of the database creation operation  
- **user**: `BaseUser`  
  The User who performed the creation operation

**Returns**  
`Promise<void>`

Inherited from [BaseActorDelta._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_oncreateoperation)

---

#### _onDeleteOperation

```typescript
_onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters**  
- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were deleted  
- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation  
- **user**: `BaseUser`  
  The User who performed the deletion operation

**Returns**  
`Promise<void>`

Inherited from [BaseActorDelta._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_ondeleteoperation)

---

#### _onUpdateOperation

```typescript
_onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters**  
- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were updated  
- **operation**: `DatabaseUpdateOperation`  
  Parameters of the database update operation  
- **user**: `BaseUser`  
  The User who performed the update operation

**Returns**  
`Promise<void>`

Inherited from [BaseActorDelta._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_onupdateoperation)

---

#### _preCreateOperation

```typescript
_preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using `updateSource`.

**Parameters**  
- **documents**: `Document<object, DocumentConstructionContext>[]`  
  Pending document instances to be created  
- **operation**: `DatabaseCreateOperation`  
  Parameters of the database creation operation  
- **user**: `BaseUser`  
  The User requesting the creation operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the creation operation entirely.

Inherited from [BaseActorDelta._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_precreateoperation)

---

#### _preDeleteOperation

```typescript
_preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object using `updateSource`.

**Parameters**  
- **documents**: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be deleted  
- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database update operation  
- **user**: `BaseUser`  
  The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the deletion operation entirely.

Inherited from [BaseActorDelta._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_predeleteoperation)

---

#### _preUpdateOperation

```typescript
_preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**  
- **documents**: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be updated  
- **operation**: `DatabaseUpdateOperation`  
  Parameters of the database update operation  
- **user**: `BaseUser`  
  The User requesting the update operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the update operation entirely.

Inherited from [BaseActorDelta._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html#_preupdateoperation)