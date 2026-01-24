# BaseCards

The Cards Document. Defines the DataSchema and common behaviors for a Cards Document which are shared between both client and server.

- Mixes: `CardsData`
- Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.BaseCards), Expand):

  - _Document_
  - **BaseCards**
  - _documents.Cards_

---

## Constructors

### constructor

```typescript
new BaseCards(
    data?: Partial<CardsData>,
    options?: DocumentConstructionContext,
): BaseCards
```

**Parameters:**

- **data** _Optional_: `Partial<CardsData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options** _Optional_: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns:**  
`BaseCards`

_Inherited from [`Document.constructor`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#constructor)_

---

## Properties

### _source

```typescript
_source: CardsData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

_Inherited from [`Document._source`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_source)_

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

_Inherited from [`Document.parent`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#parent)_

### DEFAULT_ICON

```typescript
static DEFAULT_ICON: string = "icons/svg/card-hand.svg"
```

The default icon used for a cards stack that does not have a custom image set.

### LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[]
```

Overrides [`Document.LOCALIZATION_PREFIXES`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#localization_prefixes).

### metadata

```typescript
static get metadata(): object
```

Default metadata which applies to each instance of this Document type.

Overrides [`Document.metadata`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#metadata).

---

## Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns:**  
`null | string`

_Inherited from Document.id_

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns:**  
`boolean`

_Inherited from Document.inCompendium_

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns:**  
`boolean`

_Inherited from Document.invalid_

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns:**  
`boolean`

_Inherited from Document.isEmbedded_

### schema

```typescript
static get schema(): SchemaField
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns:**  
`SchemaField`

_Inherited from Document.schema_

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns:**  
`string`

_Inherited from Document.uuid_

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

_Inherited from Document.validationFailures_

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns:**  
`typeof Document`

_Inherited from Document.baseDocument_

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns:**  
`string`

_Inherited from Document.collectionName_

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns:**  
`abstract.DatabaseBackend`

_Inherited from Document.database_

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example `"Actor"`.

**Returns:**  
`string`

_Inherited from Document.documentName_

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns:**  
`boolean`

_Inherited from Document.hasTypeData_

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns:**  
`Readonly<Record<string, any>>`

_Inherited from Document.hierarchy_

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns:**  
`typeof Document`

_Inherited from Document.implementation_

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns:**  
`string[]`

_Inherited from Document.TYPES_

---

## Methods

### _configure

```typescript
static _configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters:**

- **__namedParameters** _Optional_: `{ pack?: null; parentCollection?: null }` = `{}`

**Returns:**  
`void`

_Inherited from [`Document._configure`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_configure)_

---

### _initialize

```typescript
_initialize(options: any): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters:**

- **options**: `any` — Options provided to the model constructor

**Returns:**  
`void`

Overrides [`Document._initialize`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initialize)

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters:**

- **user**: `BaseUser` — The User attempting modification.
- **action**: `string` — The attempted action.
- **data** _Optional_: `object` = `{}` — Data involved in the attempted action.

**Returns:**  
`boolean` — Does the User have permission?

_Inherited from [`Document.canUserModify`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusermodify)_

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

- **data** _Optional_: `object` = `{}` — Additional data which overrides current document data at the time of creation.
- **context** _Optional_: `DocumentConstructionContext & DocumentCloneOptions` = `{}` — Additional context options passed to the create method.

**Returns:**

- `Document<object, DocumentConstructionContext>` |  
- `Promise<Document<object, DocumentConstructionContext>>`

The cloned Document instance.

_Inherited from [`Document.clone`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#clone)_

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

- **embeddedName**: `string` — The name of the embedded Document type.
- **data**: `object[]` = `[]` — An array of data objects used to create multiple documents.
- **operation** _Optional_: `DatabaseCreateOperation` = `{}` — Parameters of the database creation workflow.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances.

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

_Inherited from [`Document.createEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createembeddeddocuments)_

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters:**

- **operation** _Optional_: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the deletion operation.

**Returns:**  
`Promise<undefined | Document<object, DocumentConstructionContext>>` — The deleted Document instance, or undefined if not deleted.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

_Inherited from [`Document.delete`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#delete)_

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

- **embeddedName**: `string` — The name of the embedded Document type.
- **ids**: `string[]` — An array of string ids for each Document to be deleted.
- **operation** _Optional_: `DatabaseDeleteOperation` = `{}` — Parameters of the database deletion workflow.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

_Inherited from [`Document.deleteEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deleteembeddeddocuments)_

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters:**

- **embeddedName**: `string` — The name of the embedded Document type.

**Returns:**  
`DocumentCollection` — The Collection instance of embedded Documents of the requested type.

_Inherited from [`Document.getEmbeddedCollection`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddedcollection)_

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

- **embeddedName**: `string` — The name of the embedded Document type.
- **id**: `string` — The id of the child document to retrieve.
- **options** _Optional_: `{ invalid?: boolean; strict?: boolean }` = `{}` — Additional options which modify how embedded documents are retrieved.

  - **invalid** _Optional_: `boolean` — Allow retrieving an invalid Embedded Document.
  - **strict** _Optional_: `boolean` — Throw an Error if the requested id does not exist. See Collection#get.

**Returns:**  
`Document<object, DocumentConstructionContext>` — The retrieved embedded Document instance, or undefined.

**Throws:**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

_Inherited from [`Document.getEmbeddedDocument`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddeddocument)_

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters:**

- **scope**: `string` — The flag scope which namespaces the key.
- **key**: `string` — The flag key.

**Returns:**  
`any` — The flag value.

_Inherited from [`Document.getFlag`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getflag)_

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role. For example, a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters:**

- **user** _Optional_: `BaseUser` — The User being tested.

**Returns:**  
`DocumentOwnershipNumber` — A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).

_Inherited from [`Document.getUserLevel`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getuserlevel)_

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns:**  
`object` — The migrated system data object.

_Inherited from [`Document.migrateSystemData`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratesystemdata)_

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:** `void`

_Inherited from [`Document.reset`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#reset)_

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

Flag values can assume almost any data type. Setting a flag value to `null` will delete that flag.

**Parameters:**

- **scope**: `string` — The flag scope which namespaces the key.
- **key**: `string` — The flag key.
- **value**: `any` — The flag value.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>>` — A Promise resolving to the updated document.

_Inherited from [`Document.setFlag`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#setflag)_

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

- **user**: `BaseUser` — The User being tested.
- **permission**: `DocumentOwnershipLevel` — The permission level from DOCUMENT_OWNERSHIP_LEVELS to test.
- **options** _Optional_: `{ exact?: boolean }` = `{}` — Additional options involved in the permission test.
  - **exact** _Optional_: `boolean` — Require the exact permission level requested?

**Returns:**  
`boolean` — Does the user have this permission level over the Document?

_Inherited from [`Document.testUserPermission`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#testuserpermission)_

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:**  
`object` — The document source data expressed as a plain object.

_Inherited from [`Document.toJSON`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#tojson)_

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters:**

- **source**: `boolean` = `true` — Draw values from the underlying data source rather than transformed values.

**Returns:**  
`any` — The extracted primitive object.

_Inherited from [`Document.toObject`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#toobject)_

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters:**

- **_parentPath** _Optional_: `string` — A parent field path already traversed.

**Returns:**  
`Generator<any, void, any>`

_Yields_ embedded Documents.

_Inherited from [`Document.traverseEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#traverseembeddeddocuments)_

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

- **scope**: `string` — The flag scope which namespaces the key.
- **key**: `string` — The flag key.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>>` — The updated document instance.

_Inherited from [`Document.unsetFlag`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#unsetflag)_

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

- **data** _Optional_: `object` = `{}` — Differential update data which modifies the existing values of this document.
- **operation** _Optional_: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the update operation.

**Returns:**  
`Promise<undefined | Document<object, DocumentConstructionContext>>` — The updated Document instance, or undefined if not updated.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

_Inherited from [`Document.update`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#update)_

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

- **embeddedName**: `string` — The name of the embedded Document type.
- **updates**: `object[]` = `[]` — An array of differential data objects, each used to update a single Document.
- **operation** _Optional_: `DatabaseUpdateOperation` = `{}` — Parameters of the database update workflow.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

_Inherited from [`Document.updateEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateembeddeddocuments)_

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters:**

- **changes** _Optional_: `object` = `{}` — New values which should be applied to the data model.
- **options** _Optional_: `DataModelUpdateOptions` = `{}` — Options which determine how the new data is merged.

**Returns:**  
`object` — An object containing differential keys and values that were changed.

**Throws:**  
An error if the requested data model changes were invalid.

_Inherited from [`Document.updateSource`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatesource)_

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters:**

- **options** _Optional_: `DataModelValidationOptions` = `{}` — Options which modify how the model is validated.

**Returns:**  
`boolean` — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws:**  
An error thrown if validation is strict and a failure occurs.

_Inherited from [`Document.validate`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validate)_

---

### _initializeSource (protected)

```typescript
protected _initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters:**

- **data**: `object | DataModel<object, DataModelConstructionContext>` — The candidate source data from which the model will be constructed.
- **options** _Optional_: `object` = `{}` — Options provided to the model constructor.

**Returns:**  
`object` — Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

_Inherited from [`Document._initializeSource`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializesource)_

---

### _onCreate (protected)

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters:**

- **data**: `object` — The initial data object provided to the document creation request.
- **options**: `object` — Additional options which modify the creation request.
- **userId**: `string` — The id of the User requesting the document update.

**Returns:**  
`void`

_Inherited from [`Document._onCreate`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_oncreate)_

---

### _onDelete (protected)

```typescript
protected _onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters:**

- **options**: `object` — Additional options which modify the deletion request.
- **userId**: `string` — The id of the User requesting the document update.

**Returns:**  
`void`

_Inherited from [`Document._onDelete`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_ondelete)_

---

### _onUpdate (protected)

```typescript
protected _onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters:**

- **changed**: `object` — The differential data that was changed relative to the document's prior values.
- **options**: `object` — Additional options which modify the update request.
- **userId**: `string` — The id of the User requesting the document update.

**Returns:**  
`void`

_Inherited from [`Document._onUpdate`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onupdate)_

---

### _preCreate (protected)

```typescript
protected _preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [`updateSource`](#updatesource).

**Parameters:**

- **data**: `object` — The initial data object provided to the document creation request.
- **options**: `object` — Additional options which modify the creation request.
- **user**: `BaseUser` — The User requesting the document creation.

**Returns:**  
`Promise<boolean | void>` — Return false to exclude this Document from the creation operation.

_Inherited from [`Document._preCreate`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_precreate)_

---

### _preDelete (protected)

```typescript
protected _preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters:**

- **options**: `object` — Additional options which modify the deletion request.
- **user**: `BaseUser` — The User requesting the document deletion.

**Returns:**  
`Promise<boolean | void>` — Return false to cancel the deletion operation.

_Inherited from [`Document._preDelete`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_predelete)_

---

### _preUpdate (protected)

```typescript
protected _preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters:**

- **changes**: `object` — The candidate changes to the Document.
- **options**: `object` — Additional options which modify the update request.
- **user**: `BaseUser` — The User requesting the document update.

**Returns:**  
`Promise<boolean | void>` — Return false to cancel the update operation.

_Inherited from [`Document._preUpdate`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preupdate)_

---

### _initializationOrder (static, protected)

```typescript
static *_initializationOrder(): Generator<any[], void, unknown>
```

**Returns:**  
`Generator<any[], void, unknown>`

_Inherited from [`Document._initializationOrder`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializationorder)_

---

### canUserCreate (static)

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters:**

- **user**: `BaseUser` — The User being tested.

**Returns:**  
`boolean` — Does the User have a sufficient role to create?

_Inherited from [`Document.canUserCreate`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusercreate)_

---

### cleanData (static)

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters:**

- **source** _Optional_: `object` = `{}` — The source data object.
- **options** _Optional_: `object` = `{}` — Additional options which are passed to field cleaning methods.

**Returns:**  
`object` — The cleaned source data, which is the same object as the `source` argument.

_Inherited from [`Document.cleanData`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#cleandata)_

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

**Parameters:**

- **data** _Optional_:  
  - `object` — Initial data used to create this Document.
  - `Document<object, DocumentConstructionContext>` — Or a Document instance to persist.
  - Array of either objects or Document instances.

- **operation** _Optional_: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` — Parameters of the creation operation.

**Returns:**  
`Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>` — The created Document instance(s).

Examples:

```typescript
// Create a World-level Item
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

// Create an Actor-owned Item
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, { parent: actor });

// Create an Item in a Compendium pack
const created = await Item.implementation.create(data, { pack: "mymodule.mypack" });
```

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

---

### createDocuments (static)

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters:**

- **data**: `(object | Document<object, DocumentConstructionContext>)[]` = `[]`  
  An array of data objects or existing Documents to persist.

- **operation** _Optional_: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances.

Examples:

```typescript
// Create a single Document
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

// Create multiple Documents
const data = [
  {name: "Tim", type: "npc"},
  {name: "Tom", type: "npc"}
];
const created = await Actor.implementation.createDocuments(data);

// Create multiple embedded Documents within a parent
const actor = game.actors.getName("Tim");
const data = [
  {name: "Sword", type: "weapon"},
  {name: "Breastplate", type: "equipment"}
];
const created = await Item.implementation.createDocuments(data, { parent: actor });

// Create a Document within a Compendium pack
const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, { pack: "mymodule.mypack" });
```

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

---

### defineSchema (static)

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    cards: EmbeddedCollectionField;
    description: HTMLField;
    displayCount: BooleanField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    height: NumberField;
    img: FilePathField;
    name: StringField;
    ownership: DocumentOwnershipField;
    rotation: AngleField;
    sort: IntegerSortField;
    system: TypeDataField;
    type: DocumentTypeField;
    width: NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

Overrides [`Document.defineSchema`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#defineschema).

---

### deleteDocuments (static)

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters:**

- **ids**: `string[]` = `[]` — An array of string ids for the documents to be deleted.
- **operation** _Optional_: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the database deletion operation.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances.

Examples:

```typescript
// Delete a single Document
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

// Delete multiple Documents
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

// Delete multiple embedded Documents within a parent
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], { parent: actor });

// Delete Documents within a Compendium pack
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack:"mymodule.mypack"});
```

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

---

### fromJSON (static)

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters:**

- **json**: `string` — Serialized document data in string format.

**Returns:**  
`DataModel<object, DataModelConstructionContext>` — A constructed data model instance.

_Inherited from [`Document.fromJSON`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromjson)_

---

### fromSource (static)

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters:**

- **source**: `object` — Initial document data which comes from a trusted source.
- **context** _Optional_: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` — Model construction context.

**Returns:**  
`DataModel<object, DataModelConstructionContext>`

_Inherited from [`Document.fromSource`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromsource)_

---

### get (static)

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters:**

- **documentId**: `string` — The Document ID.
- **operation** _Optional_: `DatabaseGetOperation` = `{}` — Parameters of the get operation.

**Returns:**  
`null | Document<object, DocumentConstructionContext>` — The retrieved Document, or null.

_Inherited from [`Document.get`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#get)_

---

### getCollectionName (static)

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters:**

- **name**: `string` — An existing collection name or a document name.

**Returns:**  
`null | string` — The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

Examples:

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
Actor.implementation.getCollectionName("Item");  // returns "items"
```

_Inherited from [`Document.getCollectionName`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getcollectionname)_

---

### migrateData (static)

```typescript
static migrateData(source: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters:**

- **source**: `any` — The candidate source data from which the model will be constructed.

**Returns:**  
`object` — Migrated source data, which is the same object as the `source` argument.

Overrides [`Document.migrateData`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedata)

---

### migrateDataSafe (static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters:**

- **source**: `object` — The candidate source data from which the model will be constructed.

**Returns:**  
`object` — Migrated source data, which is the same object as the `source` argument.

_Inherited from [`Document.migrateDataSafe`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedatasafe)_

---

### shimData (static)

```typescript
static shimData(source: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters:**

- **source**: `any` — Data which matches the current schema.
- **options**: `any` — Additional shimming options.

**Returns:**  
`object` — Data with added backwards-compatible properties, which is the same object as the `source` argument.

Overrides [`Document.shimData`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#shimdata)

---

### updateDocuments (static)

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters:**

- **updates**: `object[]` = `[]` — An array of differential data objects, each used to update a single Document.
- **operation** _Optional_: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the database update operation.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances.

Examples:

```typescript
// Update a single Document
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

// Update multiple Documents
const updates = [
  {_id: "12ekjf43kj2312ds", name: "Timothy"},
  {_id: "kj549dk48k34jk34", name: "Thomas"}
];
const updated = await Actor.implementation.updateDocuments(updates);

// Update multiple embedded Documents within a parent
const actor = game.actors.getName("Timothy");
const updates = [
  { _id: sword.id, name: "Magic Sword" },
  { _id: shield.id, name: "Magic Shield" }
];
const updated = await Item.implementation.updateDocuments(updates, { parent: actor });

// Update Documents within a Compendium pack
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{ _id: actor.id, name: "New Name" }], { pack: "mymodule.mypack" });
```

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

---

### validateJoint (static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters:**

- **data**: `object` — Candidate data for the model.

**Returns:**  
`void`

**Throws:**  
An error if a validation failure is detected.

_Inherited from [`Document.validateJoint`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validatejoint)_

---

### _onCreateOperation (static, protected)

```typescript
static async _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were created.
- **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation.
- **user**: `BaseUser` — The User who performed the creation operation.

**Returns:**  
`Promise<void>`

_Inherited from [`Document._onCreateOperation`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_oncreateoperation)_

---

### _onDeleteOperation (static, protected)

```typescript
static async _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were deleted.
- **operation**: `DatabaseDeleteOperation` — Parameters of the database deletion operation.
- **user**: `BaseUser` — The User who performed the deletion operation.

**Returns:**  
`Promise<void>`

_Inherited from [`Document._onDeleteOperation`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_ondeleteoperation)_

---

### _onUpdateOperation (static, protected)

```typescript
static async _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were updated.
- **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation.
- **user**: `BaseUser` — The User who performed the update operation.

**Returns:**  
`Promise<void>`

_Inherited from [`Document._onUpdateOperation`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onupdateoperation)_

---

### _preCreateOperation (static, protected)

```typescript
static async _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [`updateSource`](#updatesource).

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Pending document instances to be created.
- **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation.
- **user**: `BaseUser` — The User requesting the creation operation.

**Returns:**  
`Promise<boolean | void>` — Return false to cancel the creation operation entirely.

_Inherited from [`Document._preCreateOperation`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_precreateoperation)_

---

### _preDeleteOperation (static, protected)

```typescript
static async _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or calling [`updateSource`](#updatesource).

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Document instances to be deleted.
- **operation**: `DatabaseDeleteOperation` — Parameters of the database update operation.
- **user**: `BaseUser` — The User requesting the deletion operation.

**Returns:**  
`Promise<boolean | void>` — Return false to cancel the deletion operation entirely.

_Inherited from [`Document._preDeleteOperation`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_predeleteoperation)_

---

### _preUpdateOperation (static, protected)

```typescript
static async _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters:**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Document instances to be updated.
- **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation.
- **user**: `BaseUser` — The User requesting the update operation.

**Returns:**  
`Promise<boolean | void>` — Return false to cancel the update operation entirely.

_Inherited from [`Document._preUpdateOperation`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preupdateoperation)_