# Class Document<DocumentData, DocumentContext> Abstract

An extension of the base DataModel which defines a Document. Documents are special in that they are persisted to the database and referenced by _id.

## Type Parameters

- **DocumentData** = *object*  
  Initial data from which to construct the Document

- **DocumentContext** = [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)  
  Construction context options

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.abstract.Document), Expand)

- [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)
- Document
- [BaseActiveEffect](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html)  
- [BaseActorDelta](https://foundryvtt.com/api/classes/foundry.documents.BaseActorDelta.html)  
- [BaseActor](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html)  
- [BaseAdventure](https://foundryvtt.com/api/classes/foundry.documents.BaseAdventure.html)  
- [BaseAmbientLight](https://foundryvtt.com/api/classes/foundry.documents.BaseAmbientLight.html)  
- [BaseAmbientSound](https://foundryvtt.com/api/classes/foundry.documents.BaseAmbientSound.html)  
- [BaseCard](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html)  
- [BaseCards](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html)  
- [BaseChatMessage](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html)  
- [BaseCombat](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html)  
- [BaseCombatant](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html)  
- [BaseCombatantGroup](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatantGroup.html)  
- [BaseDrawing](https://foundryvtt.com/api/classes/foundry.documents.BaseDrawing.html)  
- [BaseFogExploration](https://foundryvtt.com/api/classes/foundry.documents.BaseFogExploration.html)  
- [BaseFolder](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html)  
- [BaseItem](https://foundryvtt.com/api/classes/foundry.documents.BaseItem.html)  
- [BaseJournalEntry](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntry.html)  
- [BaseJournalEntryCategory](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryCategory.html)  
- [BaseJournalEntryPage](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html)  
- [BaseMacro](https://foundryvtt.com/api/classes/foundry.documents.BaseMacro.html)  
- [BaseMeasuredTemplate](https://foundryvtt.com/api/classes/foundry.documents.BaseMeasuredTemplate.html)  
- [BaseNote](https://foundryvtt.com/api/classes/foundry.documents.BaseNote.html)  
- [BasePlaylist](https://foundryvtt.com/api/classes/foundry.documents.BasePlaylist.html)  
- [BasePlaylistSound](https://foundryvtt.com/api/classes/foundry.documents.BasePlaylistSound.html)  
- [BaseRollTable](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html)  
- [BaseScene](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html)  
- [BaseRegion](https://foundryvtt.com/api/classes/foundry.documents.BaseRegion.html)  
- [BaseRegionBehavior](https://foundryvtt.com/api/classes/foundry.documents.BaseRegionBehavior.html)  
- [BaseSetting](https://foundryvtt.com/api/classes/foundry.documents.BaseSetting.html)  
- [BaseTableResult](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html)  
- [BaseTile](https://foundryvtt.com/api/classes/foundry.documents.BaseTile.html)  
- [BaseToken](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html)  
- [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)  
- [BaseWall](https://foundryvtt.com/api/classes/foundry.documents.BaseWall.html)

---

# Constructors

### constructor

```typescript
new Document<
    DocumentData extends object = object,
    DocumentContext extends DocumentConstructionContext = DocumentConstructionContext,
>(
    data?: Partial<DocumentData>,
    options?: DocumentContext,
): Document<DocumentData, DocumentContext>
```

- **Type Parameters:**
  - DocumentData extends *object* = *object*
  - DocumentContext extends [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html) = DocumentConstructionContext
- **Parameters:**
  - Optional  
    **data**: Partial<DocumentData> = {}  
    Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
  - Optional  
    **options**: DocumentContext = {}  
    Context and data validation options which affects initial model construction.
- **Returns:**  
  Document<DocumentData, DocumentContext>  
  Inherited from [DataModel.constructor](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#constructor)

---

# Properties

### _source

- **Type:** DocumentData  
- The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
- Inherited from [DataModel._source](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_source)

### parent

- **Type:** *null* | DataModel<object, DataModelConstructionContext>  
- An immutable reverse-reference to a parent DataModel to which this model belongs.  
- Inherited from [DataModel.parent](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#parent)

### LOCALIZATION_PREFIXES

- **Type:** string[]  
- Overrides [DataModel.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#localization_prefixes)

### metadata

- **Type:** Readonly<[DocumentClassMetadata](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentClassMetadata.html)>  
- Default metadata which applies to each instance of this Document type.

---

# Accessors

### id

```typescript
get id(): null | string
```

- The canonical identifier for this Document.
- **Returns:** null | string

### inCompendium

```typescript
get inCompendium(): boolean
```

- Is this document in a compendium?
- **Returns:** boolean

### invalid

```typescript
get invalid(): boolean
```

- Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
- Inherited from DataModel.invalid
- **Returns:** boolean

### isEmbedded

```typescript
get isEmbedded(): boolean
```

- Is this document embedded within a parent document?
- **Returns:** boolean

### schema

```typescript
get schema(): SchemaField
```

- Define the data schema for this document instance.  
- Inherited from DataModel.schema
- **Returns:** SchemaField

### uuid

```typescript
get uuid(): string
```

- A Universally Unique Identifier (uuid) for this Document instance.
- **Returns:** string

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

- An array of validation failure instances which may have occurred when this instance was last validated.  
- Inherited from DataModel.validationFailures
- **Returns:**
  - **fields**: null | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)
  - **joint**: null | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

- The base document definition that this document class extends from.
- **Returns:** typeof Document

### collectionName

```typescript
static get collectionName(): string
```

- The named collection to which this Document belongs.
- **Returns:** string

### database

```typescript
static get database(): abstract.DatabaseBackend
```

- The database backend used to execute operations and handle results.
- **Returns:** abstract.DatabaseBackend

### documentName

```typescript
static get documentName(): string
```

- The canonical name of this Document type, for example "Actor".
- **Returns:** string

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

- Does this Document support additional subtypes?
- **Returns:** boolean

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

- The Embedded Document hierarchy for this Document.
- **Returns:** Readonly<Record<string, any>>

### implementation

```typescript
static get implementation(): typeof Document
```

- Return a reference to the configured subclass of this base Document type.
- **Returns:** typeof Document

### schema (static)

```typescript
static get schema(): SchemaField
```

- Ensure that all Document classes share the same schema of their base declaration.  
- Overrides DataModel.schema
- **Returns:** SchemaField

### TYPES

```typescript
static get TYPES(): string[]
```

- The allowed types which may exist for this Document class.
- **Returns:** string[]

---

# Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

- Overrides [DataModel._configure](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_configure)
- **Parameters:**
  - __namedParameters?: { pack?: null; parentCollection?: null } = {}
- **Returns:** void

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

- **Parameters:**
  - **user**: [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html) — The User attempting modification
  - **action**: string — The attempted action
  - Optional  
    **data**: object = {} — Data involved in the attempted action
- **Returns:** boolean — Does the User have permission?

### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

- **Parameters:**
  - Optional  
    **data**: object = {} — Additional data which overrides current document data at the time of creation
  - Optional  
    **context**: DocumentConstructionContext & DocumentCloneOptions = {} — Additional context options passed to the create method
- **Returns:** Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>  
  The cloned Document instance  
- Overrides [DataModel.clone](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#clone)

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

- **Parameters:**
  - **embeddedName**: string — The name of the embedded Document type
  - **data**: object[] = [] — An array of data objects used to create multiple documents
  - Optional  
    **operation**: DatabaseCreateOperation = {} — Parameters of the database creation workflow
- **Returns:** Promise<Document<object, DocumentConstructionContext>[]> — An array of created Document instances

See also: [Document.createDocuments](#createDocuments)

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

- **Parameters:**
  - Optional  
    **operation**: Partial<Omit<DatabaseDeleteOperation, "ids">> = {} — Parameters of the deletion operation
- **Returns:** Promise<undefined | Document<object, DocumentConstructionContext>> — The deleted Document instance, or undefined if not deleted

See also: [Document.deleteDocuments](#deleteDocuments)

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

- **Parameters:**
  - **embeddedName**: string — The name of the embedded Document type
  - **ids**: string[] — An array of string ids for each Document to be deleted
  - Optional  
    **operation**: DatabaseDeleteOperation = {} — Parameters of the database deletion workflow
- **Returns:** Promise<Document<object, DocumentConstructionContext>[]> — An array of deleted Document instances

See also: [Document.deleteDocuments](#deleteDocuments)

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

- **Parameters:**
  - **embeddedName**: string — The name of the embedded Document type
- **Returns:** DocumentCollection — The Collection instance of embedded Documents of the requested type

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

- **Parameters:**
  - **embeddedName**: string — The name of the embedded Document type
  - **id**: string — The id of the child document to retrieve
  - Optional  
    **options**: { invalid?: boolean; strict?: boolean } = {} — Additional options which modify how embedded documents are retrieved  
    - **invalid**?: boolean — Allow retrieving an invalid Embedded Document.  
    - **strict**?: boolean — Throw an Error if the requested id does not exist. See Collection#get
- **Returns:** Document<object, DocumentConstructionContext> — The retrieved embedded Document instance, or undefined
- **Throws:** If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

- **Parameters:**
  - **scope**: string — The flag scope which namespaces the key
  - **key**: string — The flag key
- **Returns:** any — The flag value

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, testUserPermission should be used.

- **Parameters:**
  - Optional  
    **user**: [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html) — The User being tested
- **Returns:** DocumentOwnershipNumber — A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

- **Returns:** object — The migrated system data object

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.  
Inherited from [DataModel.reset](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#reset)

- **Returns:** void

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module Flags set by an individual world should "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

- **Parameters:**
  - **scope**: string — The flag scope which namespaces the key
  - **key**: string — The flag key
  - **value**: any — The flag value
- **Returns:** Promise<Document<object, DocumentConstructionContext>> — A Promise resolving to the updated document

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

- **Parameters:**
  - **user**: [BaseUser](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html) — The User being tested
  - **permission**: DocumentOwnershipLevel — The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
  - **options**: { exact?: boolean } = {} — Additional options involved in the permission test  
    - Optional  
      **exact**?: boolean — Require the exact permission level requested?
- **Returns:** boolean — Does the user have this permission level over the Document?

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.  
Inherited from [DataModel.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#tojson)

- **Returns:** object — The document source data expressed as a plain object

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

- **Parameters:**
  - **source**: boolean = true — Draw values from the underlying data source rather than transformed values
- **Returns:** any — The extracted primitive object  
Overrides [DataModel.toObject](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#toobject)

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

- **Parameters:**
  - Optional  
    **_parentPath**: string — A parent field path already traversed
- **Returns:** Generator<any, void, any>

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

- **Parameters:**
  - **scope**: string — The flag scope which namespaces the key
  - **key**: string — The flag key
- **Returns:** Promise<Document<object, DocumentConstructionContext>> — The updated document instance

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

- **Parameters:**
  - Optional  
    **data**: object = {} — Differential update data which modifies the existing values of this document
  - Optional  
    **operation**: Partial<Omit<DatabaseUpdateOperation, "updates">> = {} — Parameters of the update operation
- **Returns:** Promise<undefined | Document<object, DocumentConstructionContext>> — The updated Document instance, or undefined not updated

See also: [Document.updateDocuments](#updateDocuments)

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: DatabaseUpdateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

- **Parameters:**
  - **embeddedName**: string — The name of the embedded Document type
  - **updates**: object[] = [] — An array of differential data objects, each used to update a single Document
  - Optional  
    **operation**: DatabaseUpdateOperation = {} — Parameters of the database update workflow
- **Returns:** Promise<Document<object, DocumentConstructionContext>[]> — An array of updated Document instances

See also: [Document.updateDocuments](#updateDocuments)

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

- **Parameters:**
  - **changes**: object = {} — New values which should be applied to the data model
  - **options**: DataModelUpdateOptions = {} — Options which determine how the new data is merged
- **Returns:** object — An object containing differential keys and values that were changed
- **Throws:** An error if the requested data model changes were invalid  
Inherited from [DataModel.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#updatesource)

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

- **Parameters:**
  - **options**: DataModelValidationOptions = {} — Options which modify how the model is validated
- **Returns:** boolean — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.
- **Throws:** An error thrown if validation is strict and a failure occurs.  
Inherited from [DataModel.validate](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validate)

### _initialize (protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

- **Parameters:**
  - Optional  
    **options**: object = {} — Options provided to the model constructor
- **Returns:** void  
Inherited from [DataModel._initialize](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initialize)

### _initializeSource (protected)

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

- **Parameters:**
  - **data**: object | DataModel<object, DataModelConstructionContext> — The candidate source data from which the model will be constructed
  - Optional  
    **options**: object = {} — Options provided to the model constructor
- **Returns:** object — Migrated and cleaned source data which will be stored to the model instance, which is the same object as the data argument  
Inherited from [DataModel._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializesource)

### _onCreate (protected)

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters:**
  - **data**: object — The initial data object provided to the document creation request
  - **options**: object — Additional options which modify the creation request
  - **userId**: string — The id of the User requesting the document update
- **Returns:** void

### _onDelete (protected)

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters:**
  - **options**: object — Additional options which modify the deletion request
  - **userId**: string — The id of the User requesting the document update
- **Returns:** void

### _onUpdate (protected)

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters:**
  - **changed**: object — The differential data that was changed relative to the document's prior values
  - **options**: object — Additional options which modify the update request
  - **userId**: string — The id of the User requesting the document update
- **Returns:** void

### _preCreate (protected)

```typescript
_preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [updateSource](#updateSource).

- **Parameters:**
  - **data**: object — The initial data object provided to the document creation request
  - **options**: object — Additional options which modify the creation request
  - **user**: BaseUser — The User requesting the document creation
- **Returns:** Promise<boolean | void> — Return false to exclude this Document from the creation operation

### _preDelete (protected)

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

- **Parameters:**
  - **options**: object — Additional options which modify the deletion request
  - **user**: BaseUser — The User requesting the document deletion
- **Returns:** Promise<boolean | void> — A return value of false indicates the deletion operation should be cancelled.

### _preUpdate (protected)

```typescript
_preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

- **Parameters:**
  - **changes**: object — The candidate changes to the Document
  - **options**: object — Additional options which modify the update request
  - **user**: BaseUser — The User requesting the document update
- **Returns:** Promise<boolean | void> — A return value of false indicates the update operation should be cancelled.

### _initializationOrder (static)

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

Overrides [DataModel._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializationorder)

- **Returns:** Generator<any[], void, unknown>

### canUserCreate (static)

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

- **Parameters:**
  - **user**: BaseUser — The User being tested
- **Returns:** boolean — Does the User have a sufficient role to create?

### cleanData (static)

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

- **Parameters:**
  - Optional  
    **source**: object = {} — The source data object
  - Optional  
    **options**: object = {} — Additional options which are passed to field cleaning methods
- **Returns:** object — The cleaned source data, which is the same object as the source argument  
Inherited from [DataModel.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#cleandata)

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

- **Parameters:**
  - Optional  
    **data**: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[] — Initial data used to create this Document, or a Document instance to persist.
  - Optional  
    **operation**: Partial<Omit<DatabaseCreateOperation, "data">> = {} — Parameters of the creation operation
- **Returns:** Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]> — The created Document instance(s)

See also: [Document.createDocuments](#createDocuments)

**Examples:**

```typescript
// Create a World-level Item
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

// Create an Actor-owned Item
const data = [{name: "Special Sword", type: "weapon"}];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});

// Create an Item in a Compendium pack
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

### createDocuments (static)

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

- **Parameters:**
  - **data**: (object | Document<object, DocumentConstructionContext>)[] = [] — An array of data objects or existing Documents to persist.
  - Optional  
    **operation**: Partial<Omit<DatabaseCreateOperation, "data">> = {} — Parameters of the requested creation operation
- **Returns:** Promise<Document<object, DocumentConstructionContext>[]> — An array of created Document instances

**Examples:**

```typescript
// Create a single Document
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

// Create multiple Documents
const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);

// Create multiple embedded Documents within a parent
const actor = game.actors.getName("Tim");
const data = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const created = await Item.implementation.createDocuments(data, {parent: actor});

// Create a Document within a Compendium pack
const created = await Item.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

### defineSchema (static, abstract)

```typescript
static defineSchema(): DataSchema
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

- **Returns:** DataSchema  
Inherited from [DataModel.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#defineschema)

### deleteDocuments (static)

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

- **Parameters:**
  - **ids**: string[] = [] — An array of string ids for the documents to be deleted
  - Optional  
    **operation**: Partial<Omit<DatabaseDeleteOperation, "ids">> = {} — Parameters of the database deletion operation
- **Returns:** Promise<Document<object, DocumentConstructionContext>[]> — An array of deleted Document instances

**Examples:**

```typescript
// Delete a single Document
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

// Delete multiple Documents
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

// Delete multiple embedded Documents within a parent
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

// Delete Documents within a Compendium pack
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

### fromJSON (static)

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

- **Parameters:**
  - **json**: string — Serialized document data in string format
- **Returns:** DataModel<object, DataModelConstructionContext> — A constructed data model instance  
Inherited from [DataModel.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromjson)

### fromSource (static)

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

- **Parameters:**
  - **source**: object — Initial document data which comes from a trusted source.
  - Optional  
    **context**: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {} — Model construction context
- **Returns:** DataModel<object, DataModelConstructionContext>  
Inherited from [DataModel.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromsource)

### get (static)

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

- **Parameters:**
  - **documentId**: string — The Document ID
  - Optional  
    **operation**: DatabaseGetOperation = {} — Parameters of the get operation
- **Returns:** null | Document<object, DocumentConstructionContext> — The retrieved Document, or null

### getCollectionName (static)

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

- **Parameters:**
  - **name**: string — An existing collection name or a document name.
- **Returns:** null | string — The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples:**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

### migrateData (static)

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

- **Parameters:**
  - **source**: object — The candidate source data from which the model will be constructed
- **Returns:** object — Migrated source data, which is the same object as the source argument  
Inherited from [DataModel.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedata)

### migrateDataSafe (static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

- **Parameters:**
  - **source**: object — The candidate source data from which the model will be constructed
- **Returns:** object — Migrated source data, which is the same object as the source argument  
Inherited from [DataModel.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedatasafe)

### shimData (static)

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

- **Parameters:**
  - **data**: object — Data which matches the current schema
  - Optional  
    **options**: { embedded?: boolean } = {} — Additional shimming options  
    - **embedded**?: boolean — Apply shims to embedded models?
- **Returns:** object — Data with added backwards-compatible properties, which is the same object as the data argument  
Inherited from [DataModel.shimData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#shimdata)

### updateDocuments (static)

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

- **Parameters:**
  - **updates**: object[] = [] — An array of differential data objects, each used to update a single Document
  - Optional  
    **operation**: Partial<Omit<DatabaseUpdateOperation, "updates">> = {} — Parameters of the database update operation
- **Returns:** Promise<Document<object, DocumentConstructionContext>[]> — An array of updated Document instances

**Examples:**

```typescript
// Update a single Document
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

// Update multiple Documents
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updated = await Actor.implementation.updateDocuments(updates);

// Update multiple embedded Documents within a parent
const actor = game.actors.getName("Timothy");
const updates = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updated = await Item.implementation.updateDocuments(updates, {parent: actor});

// Update Documents within a Compendium pack
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

### validateJoint (static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

- **Parameters:**
  - **data**: object — Candidate data for the model
- **Returns:** void
- **Throws:** An error if a validation failure is detected  
Inherited from [DataModel.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validatejoint)

### _onCreateOperation (protected, static)

```typescript
static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual _onCreate workflows.

- **Parameters:**
  - **documents**: Document<object, DocumentConstructionContext>[] — The Document instances which were created
  - **operation**: DatabaseCreateOperation — Parameters of the database creation operation
  - **user**: BaseUser — The User who performed the creation operation
- **Returns:** Promise<void>

### _onDeleteOperation (protected, static)

```typescript
static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual _onDelete workflows.

- **Parameters:**
  - **documents**: Document<object, DocumentConstructionContext>[] — The Document instances which were deleted
  - **operation**: DatabaseDeleteOperation — Parameters of the database deletion operation
  - **user**: BaseUser — The User who performed the deletion operation
- **Returns:** Promise<void>

### _onUpdateOperation (protected, static)

```typescript
static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual _onUpdate workflows.

- **Parameters:**
  - **documents**: Document<object, DocumentConstructionContext>[] — The Document instances which were updated
  - **operation**: DatabaseUpdateOperation — Parameters of the database update operation
  - **user**: BaseUser — The User who performed the update operation
- **Returns:** Promise<void>

### _preCreateOperation (protected, static)

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

- **Parameters:**
  - **documents**: Document<object, DocumentConstructionContext>[] — Pending document instances to be created
  - **operation**: DatabaseCreateOperation — Parameters of the database creation operation
  - **user**: BaseUser — The User requesting the creation operation
- **Returns:** Promise<boolean | void> — Return false to cancel the creation operation entirely

### _preDeleteOperation (protected, static)

```typescript
static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual _preDelete workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or via [updateSource](#updateSource).

- **Parameters:**
  - **documents**: Document<object, DocumentConstructionContext>[] — Document instances to be deleted
  - **operation**: DatabaseDeleteOperation — Parameters of the database update operation
  - **user**: BaseUser — The User requesting the deletion operation
- **Returns:** Promise<boolean | void> — Return false to cancel the deletion operation entirely

### _preUpdateOperation (protected, static)

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

- **Parameters:**
  - **documents**: Document<object, DocumentConstructionContext>[] — Document instances to be updated
  - **operation**: DatabaseUpdateOperation — Parameters of the database update operation
  - **user**: BaseUser — The User requesting the update operation
- **Returns:** Promise<boolean | void> — Return false to cancel the update operation entirely