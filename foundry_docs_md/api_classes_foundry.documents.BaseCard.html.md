# BaseCard

The Card Document. Defines the DataSchema and common behaviors for a Card which are shared between both client and server.

---

## Mixes

- CardData

---

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.BaseCard), Expand)

- [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html) (abstract)
- **BaseCard**
- [documents.Card](https://foundryvtt.com/api/modules/foundry.documents.html#Card)

---

## Constructors

### constructor

```typescript
new BaseCard(
    data?: Partial<foundry.documents.types.CardData>,
    options?: foundry.abstract.types.DocumentConstructionContext,
): BaseCard
```

- **Parameters:**
  - `data` (optional): `Partial<CardData>` = `{}`  
    Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
  - `options` (optional): `DocumentConstructionContext` = `{}`  
    Context and data validation options which affects initial model construction.

- **Returns:** `BaseCard`

*Inherited from* [Document.constructor](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#constructor)

---

## Properties

### _source

```typescript
_source: foundry.documents.types.CardData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

*Inherited from* [Document._source](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_source)

---

### parent

```typescript
parent: null | foundry.abstract.DataModel<object, foundry.abstract.types.DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

*Inherited from* [Document.parent](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#parent)

---

### DEFAULT_ICON

```typescript
static DEFAULT_ICON: string = "icons/svg/card-joker.svg"
```

The default icon used for a Card face that does not have a custom image set.

---

### LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[]
```

Overrides [Document.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#localization_prefixes)

---

## Accessors

### metadata

```typescript
static get metadata(): object
```

Default metadata which applies to each instance of this Document type.

Overrides [Document.metadata](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#metadata)

---

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

*Inherited from* Document.id

---

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

*Inherited from* Document.inCompendium

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

*Inherited from* Document.invalid

---

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

*Inherited from* Document.isEmbedded

---

### schema

```typescript
static get schema(): foundry.data.fields.SchemaField
```

Define the data schema for this document instance.

*Inherited from* Document.schema

---

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

*Inherited from* Document.uuid

---

### validationFailures

```typescript
get validationFailures(): {
    fields: null | foundry.data.validation.DataModelValidationFailure;
    joint: null | foundry.data.validation.DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

*Inherited from* Document.validationFailures

---

### baseDocument

```typescript
static get baseDocument(): typeof foundry.abstract.Document
```

The base document definition that this document class extends from.

*Inherited from* Document.baseDocument

---

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

*Inherited from* Document.collectionName

---

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

*Inherited from* Document.database

---

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

*Inherited from* Document.documentName

---

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

*Inherited from* Document.hasTypeData

---

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

*Inherited from* Document.hierarchy

---

### implementation

```typescript
static get implementation(): typeof foundry.abstract.Document
```

Return a reference to the configured subclass of this base Document type.

*Inherited from* Document.implementation

---

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

*Inherited from* Document.TYPES

---

## Methods

### _configure

```typescript
static _configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

*Inherited from* Document._configure

---

### canUserModify

```typescript
canUserModify(
  user: foundry.documents.BaseUser,
  action: string,
  data?: object
): boolean
```

Test whether a given User has permission to perform some action on this Document

- **Parameters:**
  - **user**: `BaseUser` — The User attempting modification
  - **action**: `string` — The attempted action
  - **data** (optional): `object` = `{}` — Data involved in the attempted action

- **Returns:** `boolean` — Does the User have permission?

*Inherited from* Document.canUserModify

---

### clone

```typescript
clone(
  data?: object,
  context?: foundry.abstract.types.DocumentConstructionContext & foundry.abstract.types.DocumentCloneOptions
): Document<object, foundry.abstract.types.DocumentConstructionContext> | Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

- **Parameters:**
  - **data** (optional): `object` = `{}` — Additional data which overrides current document data at the time of creation
  - **context** (optional): `DocumentConstructionContext & DocumentCloneOptions` = `{}` — Additional context options passed to the create method

- **Returns:**  
  `Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>` — The cloned Document instance

*Inherited from* Document.clone

---

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
  embeddedName: string,
  data?: object[],
  operation?: foundry.abstract.types.DatabaseCreateOperation,
): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

- **Parameters:**
  - **embeddedName**: `string` — The name of the embedded Document type
  - **data** (optional): `object[]` = `[]` — An array of data objects used to create multiple documents
  - **operation** (optional): `DatabaseCreateOperation` = `{}` — Parameters of the database creation workflow

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances

- **See:** [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

*Inherited from* Document.createEmbeddedDocuments

---

### delete

```typescript
delete(
  operation?: Partial<Omit<foundry.abstract.types.DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, foundry.abstract.types.DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

- **Parameters:**
  - **operation** (optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the deletion operation

- **Returns:**  
  `Promise<undefined | Document<object, DocumentConstructionContext>>` — The deleted Document instance, or undefined if not deleted

- **See:** [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from* Document.delete

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
  embeddedName: string,
  ids: string[],
  operation?: foundry.abstract.types.DatabaseDeleteOperation,
): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

- **Parameters:**
  - **embeddedName**: `string` — The name of the embedded Document type
  - **ids**: `string[]` — An array of string ids for each Document to be deleted
  - **operation** (optional): `DatabaseDeleteOperation` = `{}` — Parameters of the database deletion workflow

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances

- **See:** [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from* Document.deleteEmbeddedDocuments

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name

- **Parameters:**
  - **embeddedName**: `string` — The name of the embedded Document type

- **Returns:** `DocumentCollection` — The Collection instance of embedded Documents of the requested type

*Inherited from* Document.getEmbeddedCollection

---

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
  embeddedName: string,
  id: string,
  options?: { invalid?: boolean; strict?: boolean },
): Document<object, foundry.abstract.types.DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

- **Parameters:**
  - **embeddedName**: `string` — The name of the embedded Document type
  - **id**: `string` — The id of the child document to retrieve
  - **options** (optional): `{ invalid?: boolean; strict?: boolean }` = `{}` — Additional options which modify how embedded documents are retrieved
    - `invalid`?: `boolean` — Allow retrieving an invalid Embedded Document
    - `strict`?: `boolean` — Throw an Error if the requested id does not exist. See Collection#get

- **Returns:**  
  `Document<object, DocumentConstructionContext>` — The retrieved embedded Document instance, or undefined

- **Throws:** If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

*Inherited from* Document.getEmbeddedDocument

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

- **Parameters:**
  - **scope**: `string` — The flag scope which namespaces the key
  - **key**: `string` — The flag key

- **Returns:** `any` — The flag value

*Inherited from* Document.getFlag

---

### getUserLevel

```typescript
getUserLevel(user?: foundry.documents.BaseUser): foundry.types.CONST.DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in `CONST.DOCUMENT_OWNERSHIP_LEVELS`. Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

- **Parameters:**
  - **user** (optional): `BaseUser` — The User being tested

- **Returns:** `DocumentOwnershipNumber` — A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

*Inherited from* Document.getUserLevel

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

- **Returns:** `object` — The migrated system data object

*Inherited from* Document.migrateSystemData

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

- **Returns:** `void`

*Inherited from* Document.reset

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

- **Parameters:**
  - **scope**: `string` — The flag scope which namespaces the key
  - **key**: `string` — The flag key
  - **value**: `any` — The flag value

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>>` — A Promise resolving to the updated document

*Inherited from* Document.setFlag

---

### testUserPermission

```typescript
testUserPermission(
  user: foundry.documents.BaseUser,
  permission: foundry.types.CONST.DocumentOwnershipLevel,
  options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

- **Parameters:**
  - **user**: `BaseUser` — The User being tested
  - **permission**: `DocumentOwnershipLevel` — The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
  - **options** (optional): `{ exact?: boolean }` = `{}` — Additional options involved in the permission test
    - `exact`?: `boolean` — Require the exact permission level requested?

- **Returns:** `boolean` — Does the user have this permission level over the Document?

*Inherited from* Document.testUserPermission

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

- **Returns:** `object` — The document source data expressed as a plain object

*Inherited from* Document.toJSON

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

- **Parameters:**
  - **source**: `boolean` = `true` — Draw values from the underlying data source rather than transformed values

- **Returns:** `any` — The extracted primitive object

*Inherited from* Document.toObject

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

- **Parameters:**
  - **_parentPath** (optional): `string` — A parent field path already traversed

- **Returns:** `Generator<any, void, any>`

*Inherited from* Document.traverseEmbeddedDocuments

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>>
```

Remove a flag assigned to the document

- **Parameters:**
  - **scope**: `string` — The flag scope which namespaces the key
  - **key**: `string` — The flag key

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>>` — The updated document instance

*Inherited from* Document.unsetFlag

---

### update

```typescript
update(
  data?: object,
  operation?: Partial<Omit<foundry.abstract.types.DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, foundry.abstract.types.DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

- **Parameters:**
  - **data** (optional): `object` = `{}` — Differential update data which modifies the existing values of this document
  - **operation** (optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the update operation

- **Returns:**  
  `Promise<undefined | Document<object, DocumentConstructionContext>>` — The updated Document instance, or undefined if not updated

- **See:** [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from* Document.update

---

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
  embeddedName: string,
  updates?: object[],
  operation?: foundry.abstract.types.DatabaseUpdateOperation,
): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

- **Parameters:**
  - **embeddedName**: `string` — The name of the embedded Document type
  - **updates** (optional): `object[]` = `[]` — An array of differential data objects, each used to update a single Document
  - **operation** (optional): `DatabaseUpdateOperation` = `{}` — Parameters of the database update workflow

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances

- **See:** [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from* Document.updateEmbeddedDocuments

---

### updateSource

```typescript
updateSource(
  changes?: object,
  options?: foundry.abstract.types.DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

- **Parameters:**
  - **changes**: `object` = `{}` — New values which should be applied to the data model
  - **options**: `DataModelUpdateOptions` = `{}` — Options which determine how the new data is merged

- **Returns:** `object` — An object containing differential keys and values that were changed

- **Throws:** An error if the requested data model changes were invalid

*Inherited from* Document.updateSource

---

### validate

```typescript
validate(options?: foundry.abstract.types.DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

- **Parameters:**
  - **options**: `DataModelValidationOptions` = `{}` — Options which modify how the model is validated

- **Returns:** `boolean` — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

- **Throws:** An error thrown if validation is strict and a failure occurs.

*Inherited from* Document.validate

---

## Protected Methods

### _initialize

```typescript
_protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

- **Parameters:**
  - **options** (optional): `object` = `{}` — Options provided to the model constructor

- **Returns:** `void`

*Inherited from* Document._initialize

---

### _initializeSource

```typescript
_protected _initializeSource(
  data: object | foundry.abstract.DataModel<object, foundry.abstract.types.DataModelConstructionContext>,
  options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

- **Parameters:**
  - **data**: `object | DataModel<object, DataModelConstructionContext>` — The candidate source data from which the model will be constructed
  - **options** (optional): `object` = `{}` — Options provided to the model constructor

- **Returns:** `object` — Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

*Inherited from* Document._initializeSource

---

### _onCreate

```typescript
_protected _onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters:**
  - **data**: `object` — The initial data object provided to the document creation request
  - **options**: `object` — Additional options which modify the creation request
  - **userId**: `string` — The id of the User requesting the document update

- **Returns:** `void`

*Inherited from* Document._onCreate

---

### _onDelete

```typescript
_protected _onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters:**
  - **options**: `object` — Additional options which modify the deletion request
  - **userId**: `string` — The id of the User requesting the document update

- **Returns:** `void`

*Inherited from* Document._onDelete

---

### _onUpdate

```typescript
_protected _onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters:**
  - **changed**: `object` — The differential data that was changed relative to the document's prior values
  - **options**: `object` — Additional options which modify the update request
  - **userId**: `string` — The id of the User requesting the document update

- **Returns:** `void`

*Inherited from* Document._onUpdate

---

### _preCreate

```typescript
_protected _preCreate(
  data: object,
  options: object,
  user: foundry.documents.BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using `updateSource`.

- **Parameters:**
  - **data**: `object` — The initial data object provided to the document creation request
  - **options**: `object` — Additional options which modify the creation request
  - **user**: `BaseUser` — The User requesting the document creation

- **Returns:**  
  `Promise<boolean | void>`  
  Return false to exclude this Document from the creation operation

*Inherited from* Document._preCreate

---

### _preDelete

```typescript
_protected _preDelete(options: object, user: foundry.documents.BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

- **Parameters:**
  - **options**: `object` — Additional options which modify the deletion request
  - **user**: `BaseUser` — The User requesting the document deletion

- **Returns:**  
  `Promise<boolean | void>`  
  A return value of false indicates the deletion operation should be cancelled.

*Inherited from* Document._preDelete

---

### _preUpdate

```typescript
_protected _preUpdate(
  changes: object,
  options: object,
  user: foundry.documents.BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

- **Parameters:**
  - **changes**: `object` — The candidate changes to the Document
  - **options**: `object` — Additional options which modify the update request
  - **user**: `BaseUser` — The User requesting the document update

- **Returns:**  
  `Promise<boolean | void>`  
  A return value of false indicates the update operation should be cancelled.

*Inherited from* Document._preUpdate

---

## Static Protected Methods

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

*Inherited from* Document._initializationOrder

---

### canUserCreate

```typescript
static canUserCreate(user: foundry.documents.BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

- **Parameters:**
  - **user**: `BaseUser` — The User being tested

- **Returns:** `boolean` — Does the User have a sufficient role to create?

*Inherited from* Document.canUserCreate

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

- **Parameters:**
  - **source** (optional): `object` = `{}` — The source data object
  - **options** (optional): `object` = `{}` — Additional options which are passed to field cleaning methods

- **Returns:** `object` — The cleaned source data, which is the same object as the `source` argument

*Inherited from* Document.cleanData

---

### create

```typescript
static create(
  data?:
    | object
    | Document<object, foundry.abstract.types.DocumentConstructionContext>
    | (object | Document<object, foundry.abstract.types.DocumentConstructionContext>)[],
  operation?: Partial<Omit<foundry.abstract.types.DatabaseCreateOperation, "data">>,
): Promise<
  | undefined
  | Document<object, foundry.abstract.types.DocumentConstructionContext>
  | Document<object, foundry.abstract.types.DocumentConstructionContext>[]
>
```

Create a new Document using provided input data, saving it to the database.

- **Parameters:**
  - **data** (optional): `object | Document | (object | Document)[]` — Initial data used to create this Document, or a Document instance to persist.
  - **operation** (optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` — Parameters of the creation operation

- **Returns:**  
  `Promise<undefined | Document | Document[]>` — The created Document instance(s)

- **See:** [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

- **Examples:**

  ```typescript
  const data = [{name: "Special Sword", type: "weapon"}];
  const created = await Item.implementation.create(data);
  
  const data = [{name: "Special Sword", type: "weapon"}];
  const actor = game.actors.getName("My Hero");
  const created = await Item.implementation.create(data, {parent: actor});
  
  const data = [{name: "Special Sword", type: "weapon"}];
  const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
  ```

*Inherited from* Document.create

---

### createDocuments

```typescript
static createDocuments(
  data?: (object | Document<object, foundry.abstract.types.DocumentConstructionContext>)[],
  operation?: Partial<Omit<foundry.abstract.types.DatabaseCreateOperation, "data">>,
): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

- **Parameters:**
  - **data** (optional): `(object | Document)[]` = `[]` — An array of data objects or existing Documents to persist.
  - **operation** (optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` — Parameters of the requested creation operation

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances

- **Examples:**
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

*Inherited from* Document.createDocuments

---

### defineSchema

```typescript
static defineSchema(): {
    _id: foundry.data.fields.DocumentIdField;
    _stats: foundry.data.fields.DocumentStatsField;
    back: foundry.data.fields.SchemaField;
    description: foundry.data.fields.HTMLField;
    drawn: foundry.data.fields.BooleanField;
    face: foundry.data.fields.NumberField;
    faces: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField>;
    flags: foundry.data.fields.DocumentFlagsField;
    height: foundry.data.fields.NumberField;
    name: foundry.data.fields.StringField;
    origin: foundry.data.fields.ForeignDocumentField;
    rotation: foundry.data.fields.AngleField;
    sort: foundry.data.fields.IntegerSortField;
    suit: foundry.data.fields.StringField;
    system: foundry.data.fields.TypeDataField;
    type: foundry.data.fields.DocumentTypeField;
    value: foundry.data.fields.NumberField;
    width: foundry.data.fields.NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

*Overrides* [Document.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#defineschema)

---

### deleteDocuments

```typescript
static deleteDocuments(
  ids?: string[],
  operation?: Partial<Omit<foundry.abstract.types.DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

- **Parameters:**
  - **ids** (optional): `string[]` = `[]` — An array of string ids for the documents to be deleted
  - **operation** (optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the database deletion operation

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances

- **Examples:**
  ```typescript
  const tim = game.actors.getName("Tim");
  const deleted = await Actor.implementation.deleteDocuments([tim.id]);

  const tim = game.actors.getName("Tim");
  const tom = game.actors.getName("Tom");
  const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

  const tim = game.actors.getName("Tim");
  const sword = tim.items.getName("Sword");
  const shield = tim.items.getName("Shield");
  const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], { parent: actor });

  const actor = await pack.getDocument(documentId);
  const deleted = await Actor.implementation.deleteDocuments([actor.id], { pack: "mymodule.mypack" });
  ```

*Inherited from* Document.deleteDocuments

---

### fromJSON

```typescript
static fromJSON(json: string): foundry.abstract.DataModel<object, foundry.abstract.types.DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

- **Parameters:**
  - **json**: `string` — Serialized document data in string format

- **Returns:** `DataModel<object, DataModelConstructionContext>` — A constructed data model instance

*Inherited from* Document.fromJSON

---

### fromSource

```typescript
static fromSource(
  source: object,
  context?: Omit<foundry.abstract.types.DataModelConstructionContext, "strict"> & foundry.abstract.types.DataModelFromSourceOptions,
): foundry.abstract.DataModel<object, foundry.abstract.types.DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

- **Parameters:**
  - **source**: `object` — Initial document data which comes from a trusted source.
  - **context** (optional): `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` — Model construction context

- **Returns:** `DataModel<object, DataModelConstructionContext>`

*Inherited from* Document.fromSource

---

### get

```typescript
static get(
  documentId: string,
  operation?: foundry.abstract.types.DatabaseGetOperation,
): null | Document<object, foundry.abstract.types.DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

- **Parameters:**
  - **documentId**: `string` — The Document ID
  - **operation** (optional): `DatabaseGetOperation` = `{}` — Parameters of the get operation

- **Returns:** `null | Document<object, DocumentConstructionContext>` — The retrieved Document, or null

*Inherited from* Document.get

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

- **Parameters:**
  - **name**: `string` — An existing collection name or a document name.

- **Returns:** `null | string` — The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

- **Examples:**

  ```typescript
  Actor.implementation.getCollectionName("items"); // returns "items"
  Actor.implementation.getCollectionName("Item"); // returns "items"
  ```

*Inherited from* Document.getCollectionName

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

- **Parameters:**
  - **source**: `object` — The candidate source data from which the model will be constructed

- **Returns:** `object` — Migrated source data, which is the same object as the `source` argument

*Inherited from* Document.migrateData

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

- **Parameters:**
  - **source**: `object` — The candidate source data from which the model will be constructed

- **Returns:** `object` — Migrated source data, which is the same object as the `source` argument

*Inherited from* Document.migrateDataSafe

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

- **Parameters:**
  - **data**: `object` — Data which matches the current schema
  - **options** (optional): `{ embedded?: boolean }` = `{}` — Additional shimming options
    - **embedded** (optional): `boolean` — Apply shims to embedded models?

- **Returns:** `object` — Data with added backwards-compatible properties, which is the same object as the `data` argument

*Inherited from* Document.shimData

---

### updateDocuments

```typescript
static updateDocuments(
  updates?: object[],
  operation?: Partial<Omit<foundry.abstract.types.DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, foundry.abstract.types.DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

- **Parameters:**
  - **updates** (optional): `object[]` = `[]` — An array of differential data objects, each used to update a single Document
  - **operation** (optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the database update operation

- **Returns:**  
  `Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances

- **Examples:**

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

*Inherited from* Document.updateDocuments

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

- **Parameters:**
  - **data**: `object` — Candidate data for the model

- **Returns:** `void`

- **Throws:** An error if a validation failure is detected

*Inherited from* Document.validateJoint

---

### _onCreateOperation

```typescript
static _onCreateOperation(
  documents: Document<object, foundry.abstract.types.DocumentConstructionContext>[],
  operation: foundry.abstract.types.DatabaseCreateOperation,
  user: foundry.documents.BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

- **Parameters:**
  - **documents**: `Document[]` — The Document instances which were created
  - **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation
  - **user**: `BaseUser` — The User who performed the creation operation

- **Returns:** `Promise<void>`

*Inherited from* Document._onCreateOperation

---

### _onDeleteOperation

```typescript
static _onDeleteOperation(
  documents: Document<object, foundry.abstract.types.DocumentConstructionContext>[],
  operation: foundry.abstract.types.DatabaseDeleteOperation,
  user: foundry.documents.BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

- **Parameters:**
  - **documents**: `Document[]` — The Document instances which were deleted
  - **operation**: `DatabaseDeleteOperation` — Parameters of the database deletion operation
  - **user**: `BaseUser` — The User who performed the deletion operation

- **Returns:** `Promise<void>`

*Inherited from* Document._onDeleteOperation

---

### _onUpdateOperation

```typescript
static _onUpdateOperation(
  documents: Document<object, foundry.abstract.types.DocumentConstructionContext>[],
  operation: foundry.abstract.types.DatabaseUpdateOperation,
  user: foundry.documents.BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

- **Parameters:**
  - **documents**: `Document[]` — The Document instances which were updated
  - **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation
  - **user**: `BaseUser` — The User who performed the update operation

- **Returns:** `Promise<void>`

*Inherited from* Document._onUpdateOperation

---

### _preCreateOperation

```typescript
static _preCreateOperation(
  documents: Document<object, foundry.abstract.types.DocumentConstructionContext>[],
  operation: foundry.abstract.types.DatabaseCreateOperation,
  user: foundry.documents.BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using `updateSource`.

- **Parameters:**
  - **documents**: `Document[]` — Pending document instances to be created
  - **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation
  - **user**: `BaseUser` — The User requesting the creation operation

- **Returns:**  
  `Promise<boolean | void>`  
  Return false to cancel the creation operation entirely

*Inherited from* Document._preCreateOperation

---

### _preDeleteOperation

```typescript
static _preDeleteOperation(
  documents: Document<object, foundry.abstract.types.DocumentConstructionContext>[],
  operation: foundry.abstract.types.DatabaseDeleteOperation,
  user: foundry.documents.BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object using `updateSource`.

- **Parameters:**
  - **documents**: `Document[]` — Document instances to be deleted
  - **operation**: `DatabaseDeleteOperation` — Parameters of the database update operation
  - **user**: `BaseUser` — The User requesting the deletion operation

- **Returns:**  
  `Promise<boolean | void>`  
  Return false to cancel the deletion operation entirely

*Inherited from* Document._preDeleteOperation

---

### _preUpdateOperation

```typescript
static _preUpdateOperation(
  documents: Document<object, foundry.abstract.types.DocumentConstructionContext>[],
  operation: foundry.abstract.types.DatabaseUpdateOperation,
  user: foundry.documents.BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

- **Parameters:**
  - **documents**: `Document[]` — Document instances to be updated
  - **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation
  - **user**: `BaseUser` — The User requesting the update operation

- **Returns:**  
  `Promise<boolean | void>`  
  Return false to cancel the update operation entirely

*Inherited from* Document._preUpdateOperation

---

For full API documentation, visit the official [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html).