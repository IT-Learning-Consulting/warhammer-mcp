# ActiveEffect | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side **ActiveEffect** document which extends the common **BaseActiveEffect** model.  
Each ActiveEffect belongs to the effects collection of its parent Document. Each ActiveEffect contains an **ActiveEffectData** object which provides its source data.

## Hook Events

- [hookEvents.applyActiveEffect](https://foundryvtt.com/api/functions/hookEvents.applyActiveEffect.html)

## Mixes

- ClientDocumentMixin

## See

- [foundry.documents.Actor](https://foundryvtt.com/api/classes/foundry.documents.Actor.html): The Actor document which contains ActiveEffect embedded documents  
- [foundry.documents.Item](https://foundryvtt.com/api/classes/foundry.documents.Item.html): The Item document which contains ActiveEffect embedded documents

## Hierarchy

View Summary, Expand  
<BaseActiveEffect<this>>  
**ActiveEffect**

---

## Constructors

### constructor

```typescript
new ActiveEffect(
    data?: Partial<ActiveEffectData>,
    options?: DocumentConstructionContext,
): documents.ActiveEffect
```

**Parameters**

- **data**?: `Partial<ActiveEffectData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**?: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.ActiveEffect`

Inherited from [BaseActiveEffect.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#constructor)

---

## Properties

### _source

```typescript
_source: ActiveEffectData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [BaseActiveEffect._source](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_source)

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BaseActiveEffect.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#parent)

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

Inherited from [BaseActiveEffect.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#localization_prefixes)

### metadata

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

Inherited from [BaseActiveEffect.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#metadata)

---

## Accessors

### active

```typescript
get active(): boolean
```

Whether the Active Effect is currently applying its changes to the target.

**Returns** `boolean`

---

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns** `null | string`

Inherited from ClientDocumentMixin(BaseActiveEffect).id

---

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns** `boolean`

Inherited from ClientDocumentMixin(BaseActiveEffect).inCompendium

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns** `boolean`

Inherited from ClientDocumentMixin(BaseActiveEffect).invalid

---

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns** `boolean`

Inherited from ClientDocumentMixin(BaseActiveEffect).isEmbedded

---

### isSuppressed

```typescript
get isSuppressed(): boolean
```

Is there some system logic that makes this active effect ineligible for application?

**Returns** `boolean`

---

### isTemporary

```typescript
get isTemporary(): boolean
```

Describe whether the ActiveEffect has a temporary duration based on combat turns or rounds.

**Returns** `boolean`

---

### modifiesActor

```typescript
get modifiesActor(): boolean
```

Does this Active Effect currently modify an Actor?

**Returns** `boolean`

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns** `SchemaField`

Inherited from ClientDocumentMixin(BaseActiveEffect).schema

---

### sourceName

```typescript
get sourceName(): string
```

The source name of the Active Effect.  
The source is retrieved synchronously. Therefore "Unknown" (localized) is returned if the origin points to a document inside a compendium. Returns "None" (localized) if it has no origin, and "Unknown" (localized) if the origin cannot be resolved.

**Returns** `string`

---

### target

```typescript
get target(): null | Document<object, DocumentConstructionContext>
```

Retrieve the Document that this ActiveEffect targets for modification.

**Returns** `null | Document<object, DocumentConstructionContext>`

---

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns** `string`

Inherited from ClientDocumentMixin(BaseActiveEffect).uuid

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
`{ fields: null | DataModelValidationFailure; joint: null | DataModelValidationFailure; }`

Inherited from ClientDocumentMixin(BaseActiveEffect).validationFailures

---

### baseDocument (static)

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BaseActiveEffect).baseDocument

---

### collectionName (static)

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns** `string`

Inherited from ClientDocumentMixin(BaseActiveEffect).collectionName

---

### database (static)

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from ClientDocumentMixin(BaseActiveEffect).database

---

### documentName (static)

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns** `string`

Inherited from ClientDocumentMixin(BaseActiveEffect).documentName

---

### hasTypeData (static)

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns** `boolean`

Inherited from ClientDocumentMixin(BaseActiveEffect).hasTypeData

---

### hierarchy (static)

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from ClientDocumentMixin(BaseActiveEffect).hierarchy

---

## Methods

### implementation (static)

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BaseActiveEffect).implementation

---

### schema (static)

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns** `SchemaField`

Inherited from ClientDocumentMixin(BaseActiveEffect).schema

---

### TYPES (static)

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns** `string[]`

Inherited from ClientDocumentMixin(BaseActiveEffect).TYPES

---

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- **__namedParameters**: `{ pack?: null; parentCollection?: null } = {}`

**Returns** `void`

Inherited from [BaseActiveEffect._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_configure)

---

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data**: `any` — The initial data object provided to the document creation request  
- **options**: `any` — Additional options which modify the creation request  
- **userId**: `any` — The id of the User requesting the document update

**Returns** `void`

Overrides [BaseActiveEffect._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_oncreate)

---

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `any` — Additional options which modify the deletion request  
- **userId**: `any` — The id of the User requesting the document update

**Returns** `void`

Overrides [BaseActiveEffect._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_ondelete)

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `any` — The differential data that was changed relative to the documents prior values  
- **options**: `any` — Additional options which modify the update request  
- **userId**: `any` — The id of the User requesting the document update

**Returns** `void`

Overrides [BaseActiveEffect._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_onupdate)

---

### _preCreate

```typescript
_preCreate(data: any, options: any, user: any): Promise<undefined | false>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.  
Modifications to the pending Document instance must be performed using [updateSource](#updatesource).

**Parameters**

- **data**: `any` — The initial data object provided to the document creation request  
- **options**: `any` — Additional options which modify the creation request  
- **user**: `any` — The User requesting the document creation

**Returns** `Promise<undefined | false>`

Return `false` to exclude this Document from the creation operation.

Overrides [BaseActiveEffect._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_precreate)

---

### apply

```typescript
apply(actor: documents.Actor, change: EffectChangeData): Record<string, any>
```

Apply this ActiveEffect to a provided Actor.

**Parameters**

- **actor**: `documents.Actor` — The Actor to whom this effect should be applied  
- **change**: `EffectChangeData` — The change data being applied

**Returns**  
An object of property paths and their updated values.

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser` — The User attempting modification  
- **action**: `string` — The attempted action  
- **data**?: `object` = `{}` — Data involved in the attempted action

**Returns**  
Does the User have permission?

Inherited from [BaseActiveEffect.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#canusermodify)

---

### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- **data**?: `object` = `{}` — Additional data which overrides current document data at the time of creation  
- **context**?: `DocumentConstructionContext & DocumentCloneOptions` = `{}` — Additional context options passed to the create method

**Returns**  
The cloned Document instance.

Inherited from [BaseActiveEffect.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#clone)

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

- **embeddedName**: `string` — The name of the embedded Document type  
- **data**?: `object[]` = `[]` — An array of data objects used to create multiple documents  
- **operation**?: `DatabaseCreateOperation` = `{}` — Parameters of the database creation workflow

**Returns**  
An array of created Document instances.

See also [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments).  

Inherited from [BaseActiveEffect.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#createembeddeddocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation**?: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the deletion operation

**Returns**  
The deleted Document instance, or undefined if not deleted.

See also [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments).

Inherited from [BaseActiveEffect.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#delete)

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

- **embeddedName**: `string` — The name of the embedded Document type  
- **ids**: `string[]` — An array of string ids for each Document to be deleted  
- **operation**?: `DatabaseDeleteOperation` = `{}` — Parameters of the database deletion workflow

**Returns**  
An array of deleted Document instances.

See also [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments).

Inherited from [BaseActiveEffect.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#deleteembeddeddocuments)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string` — The name of the embedded Document type

**Returns**  
The Collection instance of embedded Documents of the requested type.

Inherited from [BaseActiveEffect.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#getembeddedcollection)

---

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean }
): Document<object, DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

**Parameters**

- **embeddedName**: `string` — The name of the embedded Document type  
- **id**: `string` — The id of the child document to retrieve  
- **options**?: `{ invalid?: boolean; strict?: boolean } = {}` — Additional options which modify how embedded documents are retrieved  
  - **invalid**?: `boolean` — Allow retrieving an invalid Embedded Document.  
  - **strict**?: `boolean` — Throw an Error if the requested id does not exist. See Collection#get

**Returns**  
The retrieved embedded Document instance, or undefined.

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseActiveEffect.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key  
- **key**: `string` — The flag key

**Returns**  
The flag value.

Inherited from [BaseActiveEffect.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#getflag)

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).  
Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.  
To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user**?: `BaseUser` — The User being tested

**Returns**  
A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).

Inherited from [BaseActiveEffect.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
The migrated system data object.

Inherited from [BaseActiveEffect.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#migratesystemdata)

---

### prepareDerivedData

```typescript
prepareDerivedData(): void
```

**Returns** `void`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns** `void`

Inherited from [BaseActiveEffect.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#reset)

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key  
- **key**: `string` — The flag key  
- **value**: `any` — The flag value

**Returns**  
A Promise resolving to the updated document.

Inherited from [BaseActiveEffect.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#setflag)

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

- **user**: `BaseUser` — The User being tested  
- **permission**: `DocumentOwnershipLevel` — The permission level from DOCUMENT_OWNERSHIP_LEVELS to test  
- **options**?: `{ exact?: boolean } = {}` — Additional options involved in the permission test  
  - **exact**?: `boolean` — Require the exact permission level requested?

**Returns**  
Does the user have this permission level over the Document?

Inherited from [BaseActiveEffect.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

Inherited from [BaseActiveEffect.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true` — Draw values from the underlying data source rather than transformed values

**Returns**  
The extracted primitive object.

Inherited from [BaseActiveEffect.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath**?: `string` — A parent field path already traversed

**Returns**  
Generator

Inherited from [BaseActiveEffect.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#traverseembeddeddocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key  
- **key**: `string` — The flag key

**Returns**  
The updated document instance.

Inherited from [BaseActiveEffect.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#unsetflag)

---

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- **data**?: `object` = `{}` — Differential update data which modifies the existing values of this document  
- **operation**?: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the update operation

**Returns**  
The updated Document instance, or undefined not updated.

See also [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments).

Inherited from [BaseActiveEffect.update](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#update)

---

### updateDuration

```typescript
updateDuration(): ActiveEffectDuration
```

Update derived Active Effect duration data. Configure the remaining and label properties to be getters which lazily recompute only when necessary.

**Returns**  
`ActiveEffectDuration`

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

- **embeddedName**: `string` — The name of the embedded Document type  
- **updates**?: `object[]` = `[]` — An array of differential data objects, each used to update a single Document  
- **operation**?: `DatabaseUpdateOperation` = `{}` — Parameters of the database update workflow

**Returns**  
An array of updated Document instances.

See also [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments).

Inherited from [BaseActiveEffect.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data.  
The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**?: `object` = `{}` — New values which should be applied to the data model  
- **options**?: `DataModelUpdateOptions` = `{}` — Options which determine how the new data is merged

**Returns**  
An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [BaseActiveEffect.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = `{}` — Options which modify how the model is validated

**Returns**  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseActiveEffect.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#validate)

---

## Protected Methods (Selected)

### _applyAdd

```typescript
_applyAdd(
    actor: documents.Actor,
    change: EffectChangeData,
    current: any,
    delta: any,
    changes: object,
): void
```

Apply an ActiveEffect that uses an ADD application mode. The way that effects are added depends on the data type of the current value:

- If the current value is null, the change value is assigned directly.  
- If the current type is a string, the change value is concatenated.  
- If the current type is a number, the change value is cast to numeric and added.  
- If the current type is an array, the change value is appended to the existing array if it matches in type.

**Parameters**

- **actor**: `documents.Actor` — The Actor to whom this effect should be applied  
- **change**: `EffectChangeData` — The change data being applied  
- **current**: `any` — The current value being modified  
- **delta**: `any` — The parsed value of the change object  
- **changes**: `object` — An object which accumulates changes to be applied

**Returns** `void`

---

### _applyCustom

```typescript
_applyCustom(
    actor: documents.Actor,
    change: EffectChangeData,
    current: any,
    delta: any,
    changes: object,
): void
```

Apply an ActiveEffect that uses a CUSTOM application mode.

---

### _applyLegacy

```typescript
_applyLegacy(
    actor: documents.Actor,
    change: EffectChangeData,
    changes: Record<string, any>,
): void
```

Apply this ActiveEffect to a provided Actor using a heuristic to infer the value types based on the current value and/or the default value in the template.json.

---

### _applyMultiply

```typescript
_applyMultiply(
    actor: documents.Actor,
    change: EffectChangeData,
    current: any,
    delta: any,
    changes: object,
): void
```

Apply an ActiveEffect that uses a MULTIPLY application mode. Changes which MULTIPLY must be numeric to allow for multiplication.

---

### _applyOverride

```typescript
_applyOverride(
    actor: documents.Actor,
    change: EffectChangeData,
    current: any,
    delta: any,
    changes: object,
): void
```

Apply an ActiveEffect that uses an OVERRIDE application mode. Numeric data is overridden by numbers, while other data types are overridden by any value.

---

### _applyUpgrade

```typescript
_applyUpgrade(
    actor: documents.Actor,
    change: EffectChangeData,
    current: any,
    delta: any,
    changes: object,
): void
```

Apply an ActiveEffect that uses an UPGRADE, or DOWNGRADE application mode. Changes which UPGRADE or DOWNGRADE must be numeric to allow for comparison.

---

### _displayScrollingStatus

```typescript
_displayScrollingStatus(enabled: boolean): void
```

Display changes to active effects as scrolling Token status text.

**Parameters**

- **enabled**: `boolean` — Is the active effect currently enabled?

---

### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**?: `object` = `{}` — Options provided to the model constructor

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

- **data**: `object | DataModel<object, DataModelConstructionContext>` — The candidate source data from which the model will be constructed  
- **options**?: `object` = `{}` — Options provided to the model constructor

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

---

### _preDelete

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object` — Additional options which modify the deletion request  
- **user**: `BaseUser` — The User requesting the document deletion

**Returns**  
A return value of false indicates the deletion operation should be cancelled.

---

### _preUpdate

```typescript
_preUpdate(changes: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changes**: `object` — The candidate changes to the Document  
- **options**: `object` — Additional options which modify the update request  
- **user**: `BaseUser` — The User requesting the document update

**Returns**  
A return value of false indicates the update operation should be cancelled.

---

### _requiresDurationUpdate

```typescript
_requiresDurationUpdate(): boolean
```

Determine whether the ActiveEffect requires a duration update.  
True if the worldTime has changed for an effect whose duration is tracked in seconds. True if the combat turn has changed for an effect tracked in turns where the effect target is a combatant.

**Returns** `boolean`

---

### _initializationOrder (static)

```typescript
_initializationOrder(): Generator<any[], void, unknown>
```

Inherited from [BaseActiveEffect._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_initializationorder)

---

### applyField (static)

```typescript
applyField(model: DataModel, change: EffectChangeData, field?: any): any
```

Apply EffectChangeData to a field within a DataModel.

**Parameters**

- **model**: `DataModel` — The model instance  
- **change**: `EffectChangeData` — The change to apply  
- **field**?: `any` — The field. If not supplied, it will be retrieved from the supplied model.

**Returns**  
The updated value.

---

### canUserCreate (static)

```typescript
canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user**: `BaseUser` — The User being tested

**Returns**  
Does the User have a sufficient role to create?

Inherited from [BaseActiveEffect.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#canusercreate)

---

### cleanData (static)

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**?: `object` = `{}` — The source data object  
- **options**?: `object` = `{}` — Additional options which are passed to field cleaning methods

**Returns**  
The cleaned source data, which is the same object as the `source` argument.

Inherited from [BaseActiveEffect.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#cleandata)

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
    | Document<object, DocumentConstructionContext>[]
>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- **data**?:  
  - `object`  
  - `Document<object, DocumentConstructionContext>`  
  - Array of objects or Document instances to create

- **operation**?: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` — Parameters of the creation operation

**Returns**  
The created Document instance(s).

See also [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples**

- Create a World-level Item

- Create an Actor-owned Item  
```typescript
const data = [{ name: "Special Sword", type: "weapon" }];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, { parent: actor });
```

- Create an Item in a Compendium pack  
```typescript
const data = [{ name: "Special Sword", type: "weapon" }];
const created = await Item.implementation.create(data, { pack: "mymodule.mypack" });
```

Inherited from [BaseActiveEffect.create](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#create)

---

### createDocuments (static)

```typescript
createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data**?: `(object | Document<object, DocumentConstructionContext>)[]` = `[]` — An array of data objects or existing Documents to persist.  
- **operation**?: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` — Parameters of the requested creation operation

**Returns**  
An array of created Document instances.

**Examples**

- Create a single Document  
- Create multiple Documents  
- Create multiple embedded Documents within a parent

```typescript
const data = [{ name: "New Actor", type: "character", img: "path/to/profile.jpg" }];
const created = await Actor.implementation.createDocuments(data);
```

```typescript
const data = [{ name: "Tim", type: "npc" }, { name: "Tom", type: "npc" }];
const created = await Actor.implementation.createDocuments(data);
```

- Create a Document within a Compendium pack

```typescript
const actor = game.actors.getName("Tim");
const data = [{ name: "Sword", type: "weapon" }, { name: "Breastplate", type: "equipment" }];
const created = await Item.implementation.createDocuments(data, { parent: actor });
```

```typescript
const data = [{ name: "Compendium Actor", type: "character", img: "path/to/profile.jpg" }];
const created = await Actor.implementation.createDocuments(data, { pack: "mymodule.mypack" });
```

Inherited from [BaseActiveEffect.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#createdocuments)

---

### defineSchema (static)

```typescript
defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    changes: ArrayField<SchemaField>;
    description: HTMLField;
    disabled: BooleanField;
    duration: SchemaField;
    flags: DocumentFlagsField;
    img: FilePathField;
    name: StringField;
    origin: StringField;
    sort: IntegerSortField;
    statuses: SetField;
    system: TypeDataField;
    tint: ColorField;
    transfer: BooleanField;
    type: DocumentTypeField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

Inherited from [BaseActiveEffect.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#defineschema)

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

- **ids**: `string[]` = `[]` — An array of string ids for the documents to be deleted  
- **operation**?: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the database deletion operation

**Returns**  
An array of deleted Document instances.

**Examples**

- Delete a single Document
- Delete multiple Documents

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);
```

```typescript
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);
```

- Delete multiple embedded Documents within a parent
- Delete Documents within a Compendium pack

```typescript
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], { parent: actor });
```

```typescript
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], { pack: "mymodule.mypack" });
```

Inherited from [BaseActiveEffect.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#deletedocuments)

---

### fromJSON (static)

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string` — Serialized document data in string format

**Returns**  
A constructed data model instance.

Inherited from [BaseActiveEffect.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#fromjson)

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

- **source**: `object` — Initial document data which comes from a trusted source.  
- **context**?: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` — Model construction context

**Returns**  
A constructed data model instance.

Inherited from [BaseActiveEffect.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#fromsource)

---

### fromStatusEffect (static)

```typescript
fromStatusEffect(
    statusId: string,
    options?: DocumentConstructionContext,
): Promise<documents.ActiveEffect>
```

Create an ActiveEffect instance from some status effect ID. Delegates to [ActiveEffect._fromStatusEffect](#_fromstatuseffect) to create the ActiveEffect instance after creating the ActiveEffect data from the status effect data if `CONFIG.statusEffects`.

**Parameters**

- **statusId**: `string` — The status effect ID.  
- **options**?: `DocumentConstructionContext` = `{}` — Additional options to pass to the ActiveEffect constructor.

**Returns**  
The created ActiveEffect instance.

**Throws**  
An error if there is no status effect in `CONFIG.statusEffects` with the given status ID and if the status has implicit statuses but doesn't have a static _id.

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

- **documentId**: `string` — The Document ID  
- **operation**?: `DatabaseGetOperation` = `{}` — Parameters of the get operation

**Returns**  
The retrieved Document, or null.

Inherited from [BaseActiveEffect.get](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#get)

---

### getCollectionName (static)

```typescript
getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string` — An existing collection name or a document name.

**Returns**  
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

Inherited from [BaseActiveEffect.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#getcollectionname)

---

### getInitialDuration (static)

```typescript
getInitialDuration(): { duration: { startTime: number } }
```

Retrieve the initial duration configuration.

**Returns**  
`{ duration: { startTime: number } }`

---

### migrateData (static)

```typescript
migrateData(data: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **data**: `any` — The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseActiveEffect.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#migratedata)

---

### migrateDataSafe (static)

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object` — The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseActiveEffect.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#migratedatasafe)

---

### shimData (static)

```typescript
shimData(data: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `any` — Data which matches the current schema  
- **options**: `any` — Additional shimming options

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [BaseActiveEffect.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#shimdata)

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

- **updates**?: `object[]` = `[]` — An array of differential data objects, each used to update a single Document  
- **operation**?: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the database update operation

**Returns**  
An array of updated Document instances.

**Examples**

- Update a single Document  
- Update multiple Documents  
- Update multiple embedded Documents within a parent  
- Update Documents within a Compendium pack

```typescript
const updates = [{ _id: "12ekjf43kj2312ds", name: "Timothy" }];
const updated = await Actor.implementation.updateDocuments(updates);
```

```typescript
const updates = [
  { _id: "12ekjf43kj2312ds", name: "Timothy" },
  { _id: "kj549dk48k34jk34", name: "Thomas" }
];
const updated = await Actor.implementation.updateDocuments(updates);
```

```typescript
const actor = game.actors.getName("Timothy");
const updates = [
  { _id: sword.id, name: "Magic Sword" },
  { _id: shield.id, name: "Magic Shield" }
];
const updated = await Item.implementation.updateDocuments(updates, { parent: actor });
```

```typescript
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{ _id: actor.id, name: "New Name" }], { pack: "mymodule.mypack" });
```

Inherited from [BaseActiveEffect.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#updatedocuments)

---

### validateJoint (static)

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object` — Candidate data for the model

**Returns** `void`

**Throws**  
An error if a validation failure is detected.

Inherited from [BaseActiveEffect.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#validatejoint)

---

### _fromStatusEffect (protected static)

```typescript
_fromStatusEffect(
    statusId: string,
    effectData: ActiveEffectData,
    options?: DocumentConstructionContext,
): Promise<documents.ActiveEffect>
```

Create an ActiveEffect instance from status effect data. Called by [ActiveEffect.fromStatusEffect](#fromstatuseffect).

**Parameters**

- **statusId**: `string` — The status effect ID  
- **effectData**: `ActiveEffectData` — The status effect data  
- **options**?: `DocumentConstructionContext` — Additional options to pass to the ActiveEffect constructor

**Returns**  
The created ActiveEffect instance.

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

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were created  
- **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation  
- **user**: `BaseUser` — The User who performed the creation operation

**Returns** `Promise<void>`

Inherited from [BaseActiveEffect._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_oncreateoperation)

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

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were deleted  
- **operation**: `DatabaseDeleteOperation` — Parameters of the database deletion operation  
- **user**: `BaseUser` — The User who performed the deletion operation

**Returns** `Promise<void>`

Inherited from [BaseActiveEffect._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_ondeleteoperation)

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

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were updated  
- **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation  
- **user**: `BaseUser` — The User who performed the update operation

**Returns** `Promise<void>`

Inherited from [BaseActiveEffect._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_onupdateoperation)

---

### _preCreateOperation (protected static)

```typescript
_preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.  
This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.  
Modifications to pending documents must mutate the documents array or alter individual document instances using [updateSource](#updatesource).

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Pending document instances to be created  
- **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation  
- **user**: `BaseUser` — The User requesting the creation operation

**Returns**  
Return false to cancel the creation operation entirely.

Inherited from [BaseActiveEffect._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_precreateoperation)

---

### _preDeleteOperation (protected static)

```typescript
_preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.  
This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.  
Modifications to the requested deletions are performed by mutating the operation object or using [updateSource](#updatesource).

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Document instances to be deleted  
- **operation**: `DatabaseDeleteOperation` — Parameters of the database update operation  
- **user**: `BaseUser` — The User requesting the deletion operation

**Returns**  
Return false to cancel the deletion operation entirely.

Inherited from [BaseActiveEffect._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_predeleteoperation)

---

### _preUpdateOperation (protected static)

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

- **documents**: `Document<object, DocumentConstructionContext>[]` — Document instances to be updated  
- **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation  
- **user**: `BaseUser` — The User requesting the update operation

**Returns**  
Return false to cancel the update operation entirely.

Inherited from [BaseActiveEffect._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActiveEffect.html#_preupdateoperation)

---

This concludes the detailed Markdown conversion of the **ActiveEffect** class from the Foundry Virtual Tabletop API Documentation (Version 13).  
All method signatures, parameters, types, return values, inherited members, and links have been preserved and suitably formatted.