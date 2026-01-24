# Combatant | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side **Combatant** document which extends the common **BaseCombatant** model.

Mixes:  
- ClientDocumentMixin

See also:  
- [foundry.documents.Combat](https://foundryvtt.com/api/classes/foundry.documents.Combat.html): The Combat document which contains Combatant embedded documents  
- [foundry.applications.sheets.CombatantConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.CombatantConfig.html): The application which configures a Combatant

Hierarchy:  
- [BaseCombatant](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html)<this>  
- **Combatant**

---

## Constructors

```typescript
new Combatant(
    data?: Partial<CombatantData>,
    options?: DocumentConstructionContext,
): documents.Combatant
```

**Parameters**

- **data**: `Partial<CombatantData> = {}`  
  Optional initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
- **options**: `DocumentConstructionContext = {}`  
  Optional context and data validation options which affects initial model construction.

**Returns**  
`documents.Combatant`

> Inherited from [BaseCombatant.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#constructor)

---

## Properties

### _source

```typescript
_source: CombatantData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

> Inherited from [BaseCombatant._source](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_source)

---

## Accessors

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

> Inherited from [BaseCombatant.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#parent)

### resource

```typescript
resource: null | object = null
```

The current value of the special tracked resource which pertains to this Combatant.

### LOCALIZATION_PREFIXES (static)

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

> Inherited from [BaseCombatant.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#localization_prefixes)

### metadata (static)

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

> Inherited from [BaseCombatant.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#metadata)

### actor

```typescript
get actor(): null | documents.Actor
```

A reference to the Actor document which this Combatant represents, if any.

**Returns**  
`null | documents.Actor`

### combat

```typescript
get combat(): null | documents.Combat
```

A convenience alias of `Combatant#parent` which is more semantically intuitive.

**Returns**  
`null | documents.Combat`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

> Inherited from `ClientDocumentMixin(BaseCombatant).id`

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

> Inherited from `ClientDocumentMixin(BaseCombatant).inCompendium`

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

> Inherited from `ClientDocumentMixin(BaseCombatant).invalid`

### isDefeated

```typescript
get isDefeated(): boolean
```

Has this combatant been marked as defeated?

**Returns**  
`boolean`

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

> Inherited from `ClientDocumentMixin(BaseCombatant).isEmbedded`

### isNPC

```typescript
get isNPC(): boolean
```

This is treated as a non-player combatant if it has no associated actor and no player users who can control it.

**Returns**  
`boolean`

### permission

```typescript
get permission(): any
```

Eschew ClientDocument's redirection to `Combat#permission` in favor of special ownership determination.

**Returns**  
`any`

### players

```typescript
get players(): documents.User[]
```

An array of non-Gamemaster Users who have ownership of this Combatant.

**Returns**  
`documents.User[]`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

> Inherited from `ClientDocumentMixin(BaseCombatant).schema`

### token

```typescript
get token(): null | TokenDocument
```

A reference to the Token document which this Combatant represents, if any.

**Returns**  
`null | TokenDocument`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

> Inherited from `ClientDocumentMixin(BaseCombatant).uuid`

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure,
    joint: null | DataModelValidationFailure,
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

**Returns**  
An object with `fields` and `joint` validation failure instances.

> Inherited from `ClientDocumentMixin(BaseCombatant).validationFailures`

### visible

```typescript
get visible(): any
```

**Returns**  
`any`

### baseDocument (static)

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

> Inherited from `ClientDocumentMixin(BaseCombatant).baseDocument`

### collectionName (static)

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

> Inherited from `ClientDocumentMixin(BaseCombatant).collectionName`

### database (static)

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

> Inherited from `ClientDocumentMixin(BaseCombatant).database`

### documentName (static)

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

> Inherited from `ClientDocumentMixin(BaseCombatant).documentName`

### hasTypeData (static)

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

> Inherited from `ClientDocumentMixin(BaseCombatant).hasTypeData`

### hierarchy (static)

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
A readonly record of the embedded document hierarchy.

> Inherited from `ClientDocumentMixin(BaseCombatant).hierarchy`

### implementation (static)

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

> Inherited from `ClientDocumentMixin(BaseCombatant).implementation`

### schema (static)

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

> Inherited from `ClientDocumentMixin(BaseCombatant).schema`

### TYPES (static)

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

> Inherited from `ClientDocumentMixin(BaseCombatant).TYPES`

---

## Methods

### _configure

```typescript
_configure(
    __namedParameters?: { pack?: null; parentCollection?: null },
): void
```

**Parameters**

- **__namedParameters**: `{ pack?: null; parentCollection?: null } = {}`

**Returns**  
`void`

> Inherited from [BaseCombatant._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_configure)

---

### canUserModify

```typescript
canUserModify(
    user: BaseUser,
    action: string,
    data?: object,
): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser` - The User attempting modification
- **action**: `string` - The attempted action
- **data**: `object = {}` (optional) - Data involved in the attempted action

**Returns**  
`boolean` - Does the User have permission?

> Inherited from [BaseCombatant.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#canusermodify)

---

### clearMovementHistory

```typescript
clearMovementHistory(): Promise<void>
```

Clear the movement history of the Combatant's Token.

**Returns**  
`Promise<void>`

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

- **data**: `object = {}` (optional) - Additional data which overrides current document data at the time of creation
- **context**: `DocumentConstructionContext & DocumentCloneOptions = {}` (optional) - Additional context options passed to the create method

**Returns**  
The cloned Document instance.

> Inherited from [BaseCombatant.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#clone)

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

- **embeddedName**: `string` - The name of the embedded Document type
- **data**: `object[] = []` (optional) - An array of data objects used to create multiple documents
- **operation**: `DatabaseCreateOperation = {}` (optional) - Parameters of the database creation workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of created Document instances

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

> Inherited from [BaseCombatant.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#createembeddeddocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation**: `Partial<Omit<DatabaseDeleteOperation, "ids">> = {}` (optional) - Parameters of the deletion operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>` - The deleted Document instance, or undefined if not deleted

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

> Inherited from [BaseCombatant.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#delete)

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

- **embeddedName**: `string` - The name of the embedded Document type
- **ids**: `string[]` - An array of string ids for each Document to be deleted
- **operation**: `DatabaseDeleteOperation = {}` (optional) - Parameters of the database deletion workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of deleted Document instances

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

> Inherited from [BaseCombatant.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#deleteembeddeddocuments)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string` - The name of the embedded Document type

**Returns**  
`DocumentCollection` - The Collection instance of embedded Documents of the requested type

> Inherited from [BaseCombatant.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#getembeddedcollection)

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

- **embeddedName**: `string` - The name of the embedded Document type
- **id**: `string` - The id of the child document to retrieve
- **options**: `{ invalid?: boolean; strict?: boolean } = {}` (optional) - Additional options which modify how embedded documents are retrieved  
  - **invalid**? `boolean`: Allow retrieving an invalid Embedded Document  
  - **strict**? `boolean`: Throw an Error if the requested id does not exist. See Collection#get

**Returns**  
The retrieved embedded Document instance, or undefined.

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

> Inherited from [BaseCombatant.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

**Parameters**

- **scope**: `string` - The flag scope which namespaces the key
- **key**: `string` - The flag key

**Returns**  
The flag value.

> Inherited from [BaseCombatant.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#getflag)

---

### getInitiativeRoll

```typescript
getInitiativeRoll(formula: string): Roll
```

Get a Roll object which represents the initiative roll for this Combatant.

**Parameters**

- **formula**: `string` - An explicit Roll formula to use for the combatant.

**Returns**  
`Roll` - The unevaluated Roll instance to use for the combatant.

---

### getUserLevel

```typescript
getUserLevel(user: any): any
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.  
This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user**: `any` - The User being tested

**Returns**  
A numeric permission level from `CONST.DOCUMENT_OWNERSHIP_LEVELS`.

> Inherited from [BaseCombatant.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
The migrated system data object.

> Inherited from [BaseCombatant.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#migratesystemdata)

---

### prepareDerivedData

```typescript
prepareDerivedData(): void
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

> Inherited from [BaseCombatant.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#reset)

---

### rollInitiative

```typescript
rollInitiative(formula?: string): Promise<documents.Combatant>
```

Roll initiative for this particular combatant.

**Parameters**

- **formula**: `string` (optional) - A dice formula which overrides the default for this Combatant.

**Returns**  
`Promise<documents.Combatant>` The updated Combatant.

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

**Parameters**

- **scope**: `string` - The flag scope which namespaces the key
- **key**: `string` - The flag key
- **value**: `any` - The flag value

**Returns**  
A Promise resolving to the updated document.

> Inherited from [BaseCombatant.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#setflag)

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

- **user**: `BaseUser` - The User being tested
- **permission**: `DocumentOwnershipLevel` - The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
- **options**: `{ exact?: boolean } = {}` (optional) - Additional options involved in the permission test  
  - **exact**? `boolean`: Require the exact permission level requested?

**Returns**  
`boolean` - Does the user have this permission level over the Document?

> Inherited from [BaseCombatant.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

> Inherited from [BaseCombatant.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean = true` - Draw values from the underlying data source rather than transformed values

**Returns**  
The extracted primitive object.

> Inherited from [BaseCombatant.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(
    _parentPath?: string,
): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath**: `string` (optional) - A parent field path already traversed

**Returns**  
A generator yielding embedded documents.

> Inherited from [BaseCombatant.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#traverseembeddeddocuments)

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

- **scope**: `string` - The flag scope which namespaces the key
- **key**: `string` - The flag key

**Returns**  
A Promise resolving to the updated document instance.

> Inherited from [BaseCombatant.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#unsetflag)

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

- **data**: `object = {}` (optional) - Differential update data which modifies the existing values of this document
- **operation**: `Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` (optional) - Parameters of the update operation

**Returns**  
The updated Document instance, or undefined if not updated.

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

> Inherited from [BaseCombatant.update](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#update)

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

- **embeddedName**: `string` - The name of the embedded Document type
- **updates**: `object[] = []` (optional) - An array of differential data objects, each used to update a single Document
- **operation**: `DatabaseUpdateOperation = {}` (optional) - Parameters of the database update workflow

**Returns**  
An array of updated Document instances.

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

> Inherited from [BaseCombatant.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#updateembeddeddocuments)

---

### updateResource

```typescript
updateResource(): null | object
```

Update the value of the tracked resource for this Combatant.

**Returns**  
`null | object`

---

### updateSource

```typescript
updateSource(
    changes?: object,
    options?: DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object = {}` (optional) - New values which should be applied to the data model
- **options**: `DataModelUpdateOptions = {}` (optional) - Options which determine how the new data is merged

**Returns**  
An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

> Inherited from [BaseCombatant.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions = {}` (optional) - Options which modify how the model is validated

**Returns**  
`boolean` - Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

> Inherited from [BaseCombatant.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#validate)

---

### _getInitiativeFormula (protected)

```typescript
_getInitiativeFormula(): string
```

Acquire the default dice formula which should be used to roll initiative for this combatant. Modules or systems could choose to override or extend this to accommodate special situations.

**Returns**  
The initiative formula to use for this combatant.

---

### _initialize (protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: `object = {}` (optional) - Options provided to the model constructor

**Returns**  
`void`

> Inherited from [BaseCombatant._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_initialize)

---

### _initializeSource (protected)

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>` - The candidate source data from which the model will be constructed
- **options**: `object = {}` (optional) - Options provided to the model constructor

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

> Inherited from [BaseCombatant._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_initializesource)

---

### _onCreate (protected)

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data**: `object` - The initial data object provided to the document creation request
- **options**: `object` - Additional options which modify the creation request
- **userId**: `string` - The id of the User requesting the document update

**Returns**  
`void`

> Inherited from [BaseCombatant._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_oncreate)

---

### _onDelete (protected)

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `object` - Additional options which modify the deletion request
- **userId**: `string` - The id of the User requesting the document update

**Returns**  
`void`

> Inherited from [BaseCombatant._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_ondelete)

---

### _onUpdate (protected)

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `object` - The differential data that was changed relative to the documents prior values
- **options**: `object` - Additional options which modify the update request
- **userId**: `string` - The id of the User requesting the document update

**Returns**  
`void`

> Inherited from [BaseCombatant._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_onupdate)

---

### _preCreate (protected)

```typescript
_preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [updateSource](#updatesource).

**Parameters**

- **data**: `object` - The initial data object provided to the document creation request
- **options**: `object` - Additional options which modify the creation request
- **user**: `BaseUser` - The User requesting the document creation

**Returns**  
`Promise<boolean | void>`  
Return `false` to exclude this Document from the creation operation.

> Inherited from [BaseCombatant._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_precreate)

---

### _preDelete (protected)

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object` - Additional options which modify the deletion request
- **user**: `BaseUser` - The User requesting the document deletion

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

> Inherited from [BaseCombatant._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_predelete)

---

### _prepareGroup (protected)

```typescript
_prepareGroup(): void
```

Prepare derived data based on group membership.

**Returns**  
`void`

---

### _preUpdate (protected)

```typescript
_preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changes**: `object` - The candidate changes to the Document
- **options**: `object` - Additional options which modify the update request
- **user**: `BaseUser` - The User requesting the document update

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

> Inherited from [BaseCombatant._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_preupdate)

---

### _initializationOrder (static)

```typescript
_initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
A generator yielding arrays of any type.

> Inherited from [BaseCombatant._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_initializationorder)

---

### _preCreateOperation (static)

```typescript
_preCreateOperation(documents: any, operation: any, _user: any): Promise<void>
```

Overrides [BaseCombatant._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_precreateoperation)

---

### _preDeleteOperation (static)

```typescript
_preDeleteOperation(_documents: any, operation: any, _user: any): Promise<void>
```

Overrides [BaseCombatant._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_predeleteoperation)

---

### _preUpdateOperation (static)

```typescript
_preUpdateOperation(_documents: any, operation: any, _user: any): Promise<void>
```

Overrides [BaseCombatant._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_preupdateoperation)

---

### canUserCreate (static)

```typescript
canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user**: `BaseUser` - The User being tested

**Returns**  
`boolean` - Does the User have a sufficient role to create?

> Inherited from [BaseCombatant.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#canusercreate)

---

### cleanData (static)

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object = {}` (optional) - The source data object
- **options**: `object = {}` (optional) - Additional options which are passed to field cleaning methods

**Returns**  
The cleaned source data, which is the same object as the source argument.

> Inherited from [BaseCombatant.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#cleandata)

---

### create (static)

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

- **data**: Optional initial data used to create this Document, or a Document instance to persist. Can be a single object, a Document, or array of these.
- **operation**: `Partial<Omit<DatabaseCreateOperation, "data">> = {}` (optional) - Parameters of the creation operation

**Returns**  
Promise resolving to the created Document instance(s).

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});

const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

> Inherited from [BaseCombatant.create](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#create)

---

### createDocuments (static)

```typescript
createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data**: `Array<object | Document<object, DocumentConstructionContext>> = []` - An array of data objects or existing Documents to persist.
- **operation**: `Partial<Omit<DatabaseCreateOperation, "data">> = {}` (optional) - Parameters of the requested creation operation

**Returns**  
A Promise resolving to an array of created Document instances.

**Examples**

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);

const actor = game.actors.getName("Tim");
const data = [
    {name: "Sword", type: "weapon"},
    {name: "Breastplate", type: "equipment"}
];
const created = await Item.implementation.createDocuments(data, {parent: actor});

const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

> Inherited from [BaseCombatant.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#createdocuments)

---

### defineSchema (static)

```typescript
defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    actorId: ForeignDocumentField;
    defeated: BooleanField;
    flags: DocumentFlagsField;
    group: DocumentIdField;
    hidden: BooleanField;
    img: FilePathField;
    initiative: NumberField;
    name: StringField;
    sceneId: ForeignDocumentField;
    system: TypeDataField;
    tokenId: ForeignDocumentField;
    type: DocumentTypeField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
An object describing the fields and their document schema types.

> Inherited from [BaseCombatant.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#defineschema)

---

### deleteDocuments (static)

```typescript
deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids**: `string[] = []` - An array of string ids for the documents to be deleted
- **operation**: `Partial<Omit<DatabaseDeleteOperation, "ids">> = {}` (optional) - Parameters of the database deletion operation

**Returns**  
A Promise resolving to an array of deleted Document instances.

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
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], { parent: actor });

const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], { pack: "mymodule.mypack" });
```

> Inherited from [BaseCombatant.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#deletedocuments)

---

### fromJSON (static)

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string` - Serialized document data in string format

**Returns**  
A constructed data model instance.

> Inherited from [BaseCombatant.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#fromjson)

---

### fromSource (static)

```typescript
fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object` - Initial document data which comes from a trusted source.
- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}` (optional) - Model construction context.

**Returns**  
A constructed data model instance.

> Inherited from [BaseCombatant.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#fromsource)

---

### get (static)

```typescript
get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string` - The Document ID
- **operation**: `DatabaseGetOperation = {}` (optional) - Parameters of the get operation

**Returns**  
The retrieved Document, or null.

> Inherited from [BaseCombatant.get](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#get)

---

### getCollectionName (static)

```typescript
getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string` - An existing collection name or a document name.

**Returns**  
The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

> Inherited from [BaseCombatant.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#getcollectionname)

---

### migrateData (static)

```typescript
migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object` - The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the source argument.

> Inherited from [BaseCombatant.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#migratedata)

---

### migrateDataSafe (static)

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object` - The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the source argument.

> Inherited from [BaseCombatant.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#migratedatasafe)

---

### shimData (static)

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object` - Data which matches the current schema
- **options**: `{ embedded?: boolean } = {}` (optional) - Additional shimming options  
  - **embedded**? `boolean`: Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

> Inherited from [BaseCombatant.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#shimdata)

---

### updateDocuments (static)

```typescript
updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates**: `object[] = []` - An array of differential data objects, each used to update a single Document
- **operation**: `Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` (optional) - Parameters of the database update operation

**Returns**  
A Promise resolving to an array of updated Document instances.

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

> Inherited from [BaseCombatant.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#updatedocuments)

---

### validateJoint (static)

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object` - Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

> Inherited from [BaseCombatant.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#validatejoint)

---

### _onCreateOperation (protected static)

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

- **documents**: `Document<object, DocumentConstructionContext>[]` - The Document instances which were created
- **operation**: `DatabaseCreateOperation` - Parameters of the database creation operation
- **user**: `BaseUser` - The User who performed the creation operation

**Returns**  
`Promise<void>`

> Inherited from [BaseCombatant._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_oncreateoperation)

---

### _onDeleteOperation (protected static)

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

- **documents**: `Document<object, DocumentConstructionContext>[]` - The Document instances which were deleted
- **operation**: `DatabaseDeleteOperation` - Parameters of the database deletion operation
- **user**: `BaseUser` - The User who performed the deletion operation

**Returns**  
`Promise<void>`

> Inherited from [BaseCombatant._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_ondeleteoperation)

---

### _onUpdateOperation (protected static)

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

- **documents**: `Document<object, DocumentConstructionContext>[]` - The Document instances which were updated
- **operation**: `DatabaseUpdateOperation` - Parameters of the database update operation
- **user**: `BaseUser` - The User who performed the update operation

**Returns**  
`Promise<void>`

> Inherited from [BaseCombatant._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombatant.html#_onupdateoperation)

---

For full API details, visit the official [Foundry Virtual Tabletop API Documentation - Combatant](https://foundryvtt.com/api/classes/foundry.documents.Combatant.html)