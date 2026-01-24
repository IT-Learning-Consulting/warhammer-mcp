# BaseItem

The Item Document. Defines the DataSchema and common behaviors for an Item which are shared between both client and server.

**Mixes:**  
- ItemData

**Hierarchy**: [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.BaseItem)  
- *Document*  
- **BaseItem**  
- *documents.Item*

---

## Constructors

### constructor

```typescript
new BaseItem(
    data?: Partial<ItemData>,
    options?: DocumentConstructionContext,
): BaseItem
```

**Parameters**

- **data?**: `Partial<ItemData>` = {}  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options?**: `DocumentConstructionContext` = {}  
  Context and data validation options which affects initial model construction.

**Returns:** `BaseItem`

Inherited from [Document.constructor](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#constructor)

---

## Properties

### _source

```typescript
_source: ItemData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [Document._source](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_source)

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [Document.parent](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#parent)

### DEFAULT_ICON (static)

```typescript
DEFAULT_ICON: string = "icons/svg/item-bag.svg"
```

The default icon used for newly created Item documents.

### LOCALIZATION_PREFIXES (static)

```typescript
LOCALIZATION_PREFIXES: string[]
```

Array of localization prefixes.

Inherited from [Document.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#localization_prefixes)

### metadata (static)

```typescript
metadata: object
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

**Returns:** `null | string`

Inherited from Document.id

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns:** `boolean`

Inherited from Document.inCompendium

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns:** `boolean`

Inherited from Document.invalid

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns:** `boolean`

Inherited from Document.isEmbedded

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns:** `SchemaField`

Inherited from Document.schema

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns:** `string`

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
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns:** `typeof Document`

Inherited from Document.baseDocument

### collectionName (static)

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns:** `string`

Inherited from Document.collectionName

### database (static)

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns:** `abstract.DatabaseBackend`

Inherited from Document.database

### documentName (static)

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns:** `string`

Inherited from Document.documentName

### hasTypeData (static)

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns:** `boolean`

Inherited from Document.hasTypeData

### hierarchy (static)

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns:** `Readonly<Record<string, any>>`

Inherited from Document.hierarchy

### implementation (static)

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns:** `typeof Document`

Inherited from Document.implementation

### schema (static)

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns:** `SchemaField`

Inherited from Document.schema

### TYPES (static)

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns:** `string[]`

Inherited from Document.TYPES

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- **__namedParameters?**: `{ pack?: null; parentCollection?: null }` = {}

**Returns:** `void`

Inherited from [Document._configure](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_configure)

### _initialize

```typescript
_initialize(options: any): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: `any`  
  Options provided to the model constructor

**Returns:** `void`

Overrides [Document._initialize](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initialize)

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser`  
  The User attempting modification

- **action**: `string`  
  The attempted action

- **data?**: `object` = {}  
  Data involved in the attempted action

**Returns:** `boolean`  
Does the User have permission?

Inherited from [Document.canUserModify](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusermodify)

### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
):
    | Document<object, DocumentConstructionContext>
    | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- **data?**: `object` = {}  
  Additional data which overrides current document data at the time of creation

- **context?**: `DocumentConstructionContext & DocumentCloneOptions` = {}  
  Additional context options passed to the create method

**Returns**  
A cloned Document instance, or a Promise resolving to one

Inherited from [Document.clone](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#clone)

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

- **data?**: `object[]` = []  
  An array of data objects used to create multiple documents

- **operation?**: `DatabaseCreateOperation` = {}  
  Parameters of the database creation workflow

**Returns:** A promise resolving to an array of created Document instances.

See also [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [Document.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createembeddeddocuments)

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = {}  
  Parameters of the deletion operation

**Returns:** A promise resolving to the deleted Document instance, or undefined if not deleted.

See also [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [Document.delete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#delete)

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

- **operation?**: `DatabaseDeleteOperation` = {}  
  Parameters of the database deletion workflow

**Returns:** A promise resolving to an array of deleted Document instances.

See also [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [Document.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deleteembeddeddocuments)

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

**Returns:** `DocumentCollection`  
The Collection instance of embedded Documents of the requested type

Inherited from [Document.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddedcollection)

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

- **options?**: `{ invalid?: boolean; strict?: boolean }` = {}  
  Additional options which modify how embedded documents are retrieved

  - **invalid?**: `boolean`  
    Allow retrieving an invalid Embedded Document.

  - **strict?**: `boolean`  
    Throw an Error if the requested id does not exist.

**Returns:** Retrieved embedded Document instance or undefined.

**Throws:** If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [Document.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddeddocument)

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. Flags represent key-value type data used by core software, game systems, or user-created modules.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns:** Flag value (`any`)

Inherited from [Document.getFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getflag)

### getUserLevel

```typescript
getUserLevel(user: any): any
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

Returns the value recorded in Document ownership regardless of User's role.

Use `testUserPermission` to test capabilities.

**Parameters**

- **user**: `any`  
  The User being tested

**Returns:** Numeric permission level (`any`)

Overrides [Document.getUserLevel](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getuserlevel)

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model as defined by the game system's template.json specification.

**Returns:** The migrated system data object.

Inherited from [Document.migrateSystemData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratesystemdata)

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:** `void`

Inherited from [Document.reset](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#reset)

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags are key-value data used by core, game systems, or modules. Use a scope to namespace flags and prevent collisions. Setting value to null deletes the flag.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

- **value**: `any`  
  The flag value

**Returns:** Promise resolving to the updated document.

Inherited from [Document.setFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#setflag)

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

- **options?**: `{ exact?: boolean }` = {}  
  Additional options for the test

  - **exact?**: `boolean`  
    Require the exact permission level requested?

**Returns:** `boolean`

Inherited from [Document.testUserPermission](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#testuserpermission)

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format for serialization.

**Returns:** Plain object representing document source data.

Inherited from [Document.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#tojson)

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. By default draws values from the underlying data source, else from transformed values.

**Parameters**

- **source?**: `boolean` = true  
  Draw values from the underlying data source rather than transformed values.

**Returns:** The extracted primitive object.

Inherited from [Document.toObject](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#toobject)

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath?**: `string`  
  A parent field path already traversed.

**Returns:** Generator yielding embedded documents.

Inherited from [Document.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#traverseembeddeddocuments)

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns:** Promise resolving to the updated document instance.

Inherited from [Document.unsetFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#unsetflag)

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- **data?**: `object` = {}  
  Differential update data which modifies the existing values of this document.

- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = {}  
  Parameters of the update operation.

**Returns:** Promise resolving to the updated Document instance, or undefined if not updated.

See also [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [Document.update](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#update)

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

- **updates?**: `object[]` = []  
  An array of differential data objects, each used to update a single Document.

- **operation?**: `DatabaseUpdateOperation` = {}  
  Parameters of the database update workflow.

**Returns:** Promise resolving to an array of updated Document instances.

See also [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [Document.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateembeddeddocuments)

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The source data is then re-initialized to apply those changes. Returns an object of differential keys and values that were changed.

**Parameters**

- **changes?**: `object` = {}  
  New values which should be applied to the data model.

- **options?**: `DataModelUpdateOptions` = {}  
  Options which determine how the new data is merged.

**Returns:** An object containing differential keys and values that were changed.

**Throws:** Error if data model changes are invalid.

Inherited from [Document.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatesource)

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. Missing types are added before cleaning and validation. Throws error if data is invalid.

**Parameters**

- **options?**: `DataModelValidationOptions` = {}  
  Options which modify how the model is validated.

**Returns:** `boolean`  
Whether the data source or proposed change is valid.

**Throws:** Error if validation is strict and a failure occurs.

Inherited from [Document.validate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validate)

---

## Protected Methods

### _initializeSource

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning are applied to the source data.

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  Candidate source data from which the model will be constructed.

- **options?**: `object` = {}  
  Options provided to the model constructor.

**Returns:** Migrated and cleaned source data (same object as the `data` argument).

Inherited from [Document._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializesource)

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

**Returns:** `void`

Inherited from [Document._onCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_oncreate)

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

**Returns:** `void`

Inherited from [Document._onDelete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_ondelete)

### _onUpdate

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `object`  
  The differential data changed relative to prior values.

- **options**: `object`  
  Additional options which modify the update request.

- **userId**: `string`  
  The id of the User requesting the document update.

**Returns:** `void`

Inherited from [Document._onUpdate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onupdate)

### _preCreate

```typescript
_preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation. Modifications to the pending Document must be done using `updateSource`.

**Parameters**

- **data**: `object`  
  Initial data object for creation.

- **options**: `object`  
  Additional options modifying creation.

- **user**: `BaseUser`  
  User requesting the document creation.

**Returns:**  
Return `false` to exclude this Document from creation, or void.

Inherited from [Document._preCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_precreate)

### _preDelete

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object`  
  Additional options modifying deletion.

- **user**: `BaseUser`  
  User requesting deletion.

**Returns:**  
Return `false` to cancel deletion operation, or void.

Inherited from [Document._preDelete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_predelete)

### _preUpdate

```typescript
_preUpdate(changes: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changes**: `object`  
  Candidate changes to the Document.

- **options**: `object`  
  Additional options modifying update.

- **user**: `BaseUser`  
  User requesting update.

**Returns:**  
Return `false` to cancel update operation, or void.

Inherited from [Document._preUpdate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preupdate)

---

## Static Protected Methods

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

Inherited from [Document._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_initializationorder)

### canUserCreate

```typescript
static canUserCreate(user: any): any
```

**Parameters**

- **user**: `any`

**Returns:** `any`

Overrides [Document.canUserCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusercreate)

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source?**: `object` = {}  
  The source data object.

- **options?**: `object` = {}  
  Additional options passed to field cleaning methods.

**Returns:** The cleaned source data (same object as the source argument).

Inherited from [Document.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#cleandata)

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

- **data?**: `object | Document | (object | Document)[]`  
  Initial data or Document instance(s) to persist.

- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>`  
  Parameters of the creation operation.

**Returns:** Promise resolving to created Document instance(s).

See also [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples:**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const createdWithParent = await Item.implementation.create(data, {parent: actor});

const createdInPack = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create)

### createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Input is an array where each object becomes one new Document.

**Parameters**

- **data?**: `(object | Document)[]` = []  
  Array of data objects or Documents.

- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>` = {}  
  Parameters of the creation operation.

**Returns:** Promise resolving to array of created Document instances.

**Examples:**

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const multipleData = [
  {name: "Tim", type: "npc"},
  {name: "Tom", type: "npc"}
];
const multipleCreated = await Actor.implementation.createDocuments(multipleData);

const actor = game.actors.getName("Tim");
const itemsData = [
  {name: "Sword", type: "weapon"},
  {name: "Breastplate", type: "equipment"}
];
const createdItems = await Item.implementation.createDocuments(itemsData, {parent: actor});

const compendiumData = [
  {name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}
];
const createdInPack = await Actor.implementation.createDocuments(compendiumData, {pack: "mymodule.mypack"});
```

Inherited from [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    effects: EmbeddedCollectionField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    img: FilePathField;
    name: StringField;
    ownership: DocumentOwnershipField;
    sort: IntegerSortField;
    system: TypeDataField;
    type: DocumentTypeField;
}
```

Define the data schema for documents of this type. Populated once and cached.

**Returns:** Schema object with fields:

- _id: DocumentIdField  
- _stats: DocumentStatsField  
- effects: EmbeddedCollectionField  
- flags: DocumentFlagsField  
- folder: ForeignDocumentField  
- img: FilePathField  
- name: StringField  
- ownership: DocumentOwnershipField  
- sort: IntegerSortField  
- system: TypeDataField  
- type: DocumentTypeField  

Overrides [Document.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#defineschema)

### deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of string ids.

**Parameters**

- **ids?**: `string[]` = []  
  Array of IDs to delete.

- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = {}  
  Operation parameters.

**Returns:** Promise resolving to array of deleted Document instances.

**Examples:**

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedItems = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: tim});

const actor = await pack.getDocument(documentId);
const deletedInPack = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data.

**Returns:** Constructed DataModel instance.

Inherited from [Document.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromjson)

### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. Source is presumed trustworthy and not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data from a trusted source.

- **context?**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = {}  
  Model construction context.

**Returns:** Constructed DataModel instance.

Inherited from [Document.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromsource)

### get (static)

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string`  
  The Document ID.

- **operation?**: `DatabaseGetOperation` = {}  
  Parameters of the get operation.

**Returns:** The retrieved Document or null.

Inherited from [Document.get](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#get)

### getCollectionName (static)

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string`  
  An existing collection name or a document name.

**Returns:** The provided collection name if it exists, or first available collection for the document name provided, or null.

**Examples:**

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
Actor.implementation.getCollectionName("Item"); // returns "items"
```

Inherited from [Document.getCollectionName](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getcollectionname)

### getDefaultArtwork (static)

```typescript
static getDefaultArtwork(itemData: ItemData): { img: string }
```

Determine default artwork based on the provided item data.

**Parameters**

- **itemData**: `ItemData`  
  The source item data.

**Returns:** Candidate item image object.

### migrateData (static)

```typescript
static migrateData(source: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `any`  
  Candidate source data.

**Returns:** Migrated source data (same object as argument).

Overrides [Document.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedata)

### migrateDataSafe (static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch and attempts it safely.

**Parameters**

- **source**: `object`  
  Candidate source data.

**Returns:** Migrated source data (same object).

Inherited from [Document.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedatasafe)

### shimData (static)

```typescript
static shimData(source: any, options: any): object
```

Take data matching the current data schema and add backwards-compatible accessors to support older code.

**Parameters**

- **source**: `any`  
  Data matching the current schema.

- **options**: `any`  
  Additional shimming options.

**Returns:** Data with added backwards-compatible properties (same object as argument).

Overrides [Document.shimData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#shimdata)

### updateDocuments (static)

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Each object updates a single Document.

**Parameters**

- **updates?**: `object[]` = []  
  Array of differential data objects.

- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = {}  
  Parameters of the update operation.

**Returns:** Promise resolving to array of updated Document instances.

**Examples:**

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const updatesMultiple = [
  {_id: "12ekjf43kj2312ds", name: "Timothy"},
  {_id: "kj549dk48k34jk34", name: "Thomas"}
];
const updatedMultiple = await Actor.implementation.updateDocuments(updatesMultiple);

const actor = game.actors.getName("Timothy");
const updatesItems = [
  {_id: sword.id, name: "Magic Sword"},
  {_id: shield.id, name: "Magic Shield"}
];
const updatedItems = await Item.implementation.updateDocuments(updatesItems, {parent: actor});

const actorFromPack = await pack.getDocument(documentId);
const updatedInPack = await Actor.implementation.updateDocuments(
  [{_id: actorFromPack.id, name: "New Name"}], 
  {pack: "mymodule.mypack"}
);
```

Inherited from [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

### validateJoint (static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules belong to the DataSchema. Throws error if a validation failure is detected.

**Parameters**

- **data**: `object`  
  Candidate data for the model.

**Returns:** `void`

**Throws:** Error if validation failure is detected.

Inherited from [Document.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validatejoint)

### _onCreateOperation (static, protected)

```typescript
static async _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes. Post-operation events occur for all connected clients. This occurs after individual `_onCreate`.

**Parameters**

- **documents**: Created Document instances.

- **operation**: Database creation operation parameters.

- **user**: User who performed the creation.

**Returns:** Promise<void>

Inherited from [Document._onCreateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_oncreateoperation)

### _onDeleteOperation (static, protected)

```typescript
static async _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation. Post-operation events occur for all connected clients. Runs after individual `_onDelete`.

**Parameters**

- **documents**: Deleted Document instances.

- **operation**: Database deletion operation parameters.

- **user**: User who performed deletion.

**Returns:** Promise<void>

Inherited from [Document._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_ondeleteoperation)

### _onUpdateOperation (static, protected)

```typescript
static async _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation. Runs after individual `_onUpdate`.

**Parameters**

- **documents**: Updated Document instances.

- **operation**: Database update operation parameters.

- **user**: User who performed update.

**Returns:** Promise<void>

Inherited from [Document._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_onupdateoperation)

### _preCreateOperation (static, protected)

```typescript
static async _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, possibly altering instructions or input data. Happens after individual `_preCreate`. Use to cancel creation by returning false.

**Parameters**

- **documents**: Pending documents to create.

- **operation**: Database creation operation parameters.

- **user**: User requesting creation.

**Returns:** Promise resolving boolean or void; `false` cancels creation.

Inherited from [Document._preCreateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_precreateoperation)

### _preDeleteOperation (static, protected)

```typescript
static async _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation; final check before database deletion. Can cancel by returning false.

**Parameters**

- **documents**: Documents to be deleted.

- **operation**: Database deletion operation parameters.

- **user**: User requesting deletion.

**Returns:** Promise resolving boolean or void; `false` cancels deletion.

Inherited from [Document._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_predeleteoperation)

### _preUpdateOperation (static, protected)

```typescript
static async _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation; final pre-flight check before database update. Can cancel by returning false.

**Parameters**

- **documents**: Documents to update.

- **operation**: Database update operation parameters.

- **user**: User requesting update.

**Returns:** Promise resolving boolean or void; `false` cancels update.

Inherited from [Document._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preupdateoperation)

---

For detailed information and documentation see the [Foundry Virtual Tabletop API Documentation - BaseItem](https://foundryvtt.com/api/classes/foundry.documents.BaseItem.html).