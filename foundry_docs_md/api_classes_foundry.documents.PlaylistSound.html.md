# PlaylistSound | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side `PlaylistSound` document which extends the common `BasePlaylistSound` model. Each `PlaylistSound` belongs to the sounds collection of a `Playlist` document.

---

## Mixes

- ClientDocumentMixin

---

## See Also

- [`foundry.documents.Playlist`](https://foundryvtt.com/api/classes/foundry.documents.Playlist.html): The Playlist document which contains PlaylistSound embedded documents  
- [`foundry.applications.sheets.PlaylistSoundConfig`](https://foundryvtt.com/api/classes/foundry.applications.sheets.PlaylistSoundConfig.html): The PlaylistSound configuration application  
- [`foundry.audio.Sound`](https://foundryvtt.com/api/classes/foundry.audio.Sound.html): The Sound API which manages web audio playback  

---

## Hierarchy

- [BasePlaylistSound](https://foundryvtt.com/api/classes/foundry.documents.BasePlaylistSound.html)<this>  
- **PlaylistSound**

---

## Constructors

### constructor

```typescript
new PlaylistSound(
    data?: Partial<PlaylistSoundData>, 
    options?: DocumentConstructionContext,
): documents.PlaylistSound
```

Construct a new `PlaylistSound` document.

**Parameters**

- **data** (Optional): `Partial<PlaylistSoundData> = {}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
- **options** (Optional): `DocumentConstructionContext = {}`  
  Context and data validation options which affect initial model construction.

**Returns**  
`documents.PlaylistSound`

_Inherited from BasePlaylistSound.constructor_

---

## Properties

### _source

`_source: PlaylistSoundData`

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

_Inherited from BasePlaylistSound._source_

---

### debounceVolume

`debounceVolume: (volume: number) => void = ...`

A debounced function, accepting a single volume parameter to adjust the volume of this sound.

---

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`

An immutable reverse-reference to a parent DataModel to which this model belongs.

_Inherited from BasePlaylistSound.parent_

---

### sound

`sound: any`

The Sound which manages playback for this playlist sound. The Sound is created lazily when playback is required.

---

### Static Properties

#### LOCALIZATION_PREFIXES

`LOCALIZATION_PREFIXES: string[] = ...`

_Inherited from BasePlaylistSound.LOCALIZATION_PREFIXES_

---

#### metadata

`metadata: object = ...`

Default metadata which applies to each instance of this Document type.

_Inherited from BasePlaylistSound.metadata_

---

## Accessors

### Static

#### VOLUME_DEBOUNCE_MS

`VOLUME_DEBOUNCE_MS: number = 100`

The debounce tolerance for processing rapid volume changes into database updates in milliseconds.

---

### context

```typescript
get context(): undefined | AudioContext
```

The audio context within which this sound is played. This will be undefined if the audio context is not yet active.

**Returns**  
`undefined | AudioContext`

---

### effectiveVolume

```typescript
get effectiveVolume(): number
```

The effective volume at which this playlist sound is played, incorporating the global playlist volume setting.

**Returns**  
`number`

---

### fadeDuration

```typescript
get fadeDuration(): number
```

Determine the fade duration for this PlaylistSound based on its own configuration and that of its parent.

**Returns**  
`number`

---

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

Inherited from ClientDocumentMixin(BasePlaylistSound).id

---

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BasePlaylistSound).inCompendium

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BasePlaylistSound).invalid

---

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BasePlaylistSound).isEmbedded

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from ClientDocumentMixin(BasePlaylistSound).schema

---

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

Inherited from ClientDocumentMixin(BasePlaylistSound).uuid

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
An object containing optional `fields` and `joint` validation failures.

Inherited from ClientDocumentMixin(BasePlaylistSound).validationFailures

---

### Static Properties

#### baseDocument

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BasePlaylistSound).baseDocument

---

#### collectionName

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

Inherited from ClientDocumentMixin(BasePlaylistSound).collectionName

---

#### database

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from ClientDocumentMixin(BasePlaylistSound).database

---

#### documentName

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

Inherited from ClientDocumentMixin(BasePlaylistSound).documentName

---

#### hasTypeData

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BasePlaylistSound).hasTypeData

---

#### hierarchy

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from ClientDocumentMixin(BasePlaylistSound).hierarchy

---

#### implementation

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BasePlaylistSound).implementation

---

#### schema (static)

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

Inherited from ClientDocumentMixin(BasePlaylistSound).schema

---

## Methods

### Static

#### TYPES

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

Inherited from ClientDocumentMixin(BasePlaylistSound).TYPES

---

#### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- __namedParameters (Optional): `{ pack?: null; parentCollection?: null } = {}`

**Returns**  
`void`

Inherited from `BasePlaylistSound._configure`

---

#### _onClickDocumentLink

```typescript
_onClickDocumentLink(event: any): any
```

**Parameters**

- event: `any`

**Returns**  
`any`

_Inherit Doc_

---

#### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- options: `any` - Additional options which modify the deletion request  
- userId: `any` - The id of the User requesting the document update

**Returns**  
`void`

Overrides `BasePlaylistSound._onDelete`

---

#### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- changed: `any` - The differential data that was changed relative to the document's prior values  
- options: `any` - Additional options which modify the update request  
- userId: `any` - The id of the User requesting the document update

**Returns**  
`void`

Overrides `BasePlaylistSound._onUpdate`

---

#### _preUpdate

```typescript
_preUpdate(changed: any, options: any, user: any): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- changed: `any` - The candidate changes to the Document  
- options: `any` - Additional options which modify the update request  
- user: `any` - The User requesting the document update

**Returns**  
`Promise<boolean | void>`

A return value of false indicates the update operation should be cancelled.

Overrides `BasePlaylistSound._preUpdate`

---

#### canUserModify

```typescript
canUserModify(
    user: BaseUser,
    action: string,
    data?: object
): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser` - The User attempting modification  
- **action**: `string` - The attempted action  
- **data** (Optional): `object = {}` - Data involved in the attempted action

**Returns**  
`boolean` - Does the User have permission?

Inherited from `BasePlaylistSound.canUserModify`

---

#### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- **data** (Optional): `object = {}`  
  Additional data which overrides current document data at the time of creation  
- **context** (Optional): `DocumentConstructionContext & DocumentCloneOptions = {}`  
  Additional context options passed to the create method

**Returns**

- The cloned Document instance (or a Promise thereof)

Inherited from `BasePlaylistSound.clone`

---

#### createEmbeddedDocuments

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
- **data** (Optional): `object[] = []` - An array of data objects used to create multiple documents  
- **operation** (Optional): `DatabaseCreateOperation = {}` - Parameters of the database creation workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of created Document instances

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from `BasePlaylistSound.createEmbeddedDocuments`

---

#### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation** (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">> = {}`  
  Parameters of the deletion operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>` - The deleted Document instance, or undefined if not deleted.

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from `BasePlaylistSound.delete`

---

#### deleteEmbeddedDocuments

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
- **operation** (Optional): `DatabaseDeleteOperation = {}` - Parameters of the database deletion workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of deleted Document instances

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from `BasePlaylistSound.deleteEmbeddedDocuments`

---

#### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string` - The name of the embedded Document type

**Returns**  
`DocumentCollection` - The Collection instance of embedded Documents of the requested type

Inherited from `BasePlaylistSound.getEmbeddedCollection`

---

#### getEmbeddedDocument

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
- **options** (Optional): `{ invalid?: boolean; strict?: boolean } = {}`  
  Additional options which modify how embedded documents are retrieved  
  - **invalid** (Optional): `boolean` - Allow retrieving an invalid Embedded Document.  
  - **strict** (Optional): `boolean` - Throw an Error if the requested id does not exist. See Collection#get

**Returns**  
`Document<object, DocumentConstructionContext>` - The retrieved embedded Document instance, or undefined.

**Throws**  
If the embedded collection does not exist, or if `strict` is true and the Embedded Document could not be found.

Inherited from `BasePlaylistSound.getEmbeddedDocument`

---

#### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- **scope**: `string` - The flag scope which namespaces the key  
- **key**: `string` - The flag key

**Returns**  
`any` - The flag value

Inherited from `BasePlaylistSound.getFlag`

---

#### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).  
Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user** (Optional): `BaseUser` - The User being tested

**Returns**  
`DocumentOwnershipNumber` - A numeric permission level from `CONST.DOCUMENT_OWNERSHIP_LEVELS`.

Inherited from `BasePlaylistSound.getUserLevel`

---

#### load

```typescript
load(): Promise<void>
```

Load the audio for this sound for the current client.

**Returns**  
`Promise<void>`

---

#### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
`object` - The migrated system data object

Inherited from `BasePlaylistSound.migrateSystemData`

---

#### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from `BasePlaylistSound.reset`

---

#### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope.  
Flags set by game systems or modules should use the canonical name attribute for the module.  
Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- **scope**: `string` - The flag scope which namespaces the key  
- **key**: `string` - The flag key  
- **value**: `any` - The flag value

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>` - A Promise resolving to the updated document

Inherited from `BasePlaylistSound.setFlag`

---

#### sync

```typescript
sync(): void
```

Synchronize playback for this particular PlaylistSound instance.

**Returns**  
`void`

---

#### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean }
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

**Parameters**

- **user**: `BaseUser` - The User being tested  
- **permission**: `DocumentOwnershipLevel` - The permission level from DOCUMENT_OWNERSHIP_LEVELS to test  
- **options**: `{ exact?: boolean } = {}` - Additional options involved in the permission test  
  - **exact** (Optional): `boolean` - Require the exact permission level requested?

**Returns**  
`boolean` - Does the user have this permission level over the Document?

Inherited from `BasePlaylistSound.testUserPermission`

---

#### toAnchor

```typescript
toAnchor(__namedParameters?: { classes?: never[] }): any
```

**Parameters**

- **__namedParameters**: `{ classes?: never[] } = {}`

**Returns**  
`any`

_Inherit Doc_

---

#### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object` - The document source data expressed as a plain object

Inherited from `BasePlaylistSound.toJSON`

---

#### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean = true` - Draw values from the underlying data source rather than transformed values

**Returns**  
`any` - The extracted primitive object

Inherited from `BasePlaylistSound.toObject`

---

#### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath** (Optional): `string` - A parent field path already traversed

**Returns**  
`Generator<any, void, any>`

Inherited from `BasePlaylistSound.traverseEmbeddedDocuments`

---

#### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- **scope**: `string` - The flag scope which namespaces the key  
- **key**: `string` - The flag key

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>` - The updated document instance

Inherited from `BasePlaylistSound.unsetFlag`

---

#### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- **data** (Optional): `object = {}` - Differential update data which modifies the existing values of this document  
- **operation** (Optional): `Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` - Parameters of the update operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>` - The updated Document instance, or undefined if not updated.

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from `BasePlaylistSound.update`

---

#### updateEmbeddedDocuments

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
- **updates**: `object[] = []` - An array of differential data objects, each used to update a single Document  
- **operation** (Optional): `DatabaseUpdateOperation = {}` - Parameters of the database update workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of updated Document instances

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from `BasePlaylistSound.updateEmbeddedDocuments`

---

#### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data.  
The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided `changes` argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data.  
The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes** (Optional): `object = {}` - New values which should be applied to the data model  
- **options** (Optional): `DataModelUpdateOptions = {}` - Options which determine how the new data is merged

**Returns**  
`object` - An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

Inherited from `BasePlaylistSound.updateSource`

---

#### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options** (Optional): `DataModelValidationOptions = {}` - Options which modify how the model is validated

**Returns**  
`boolean` - Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from `BasePlaylistSound.validate`

---

#### Protected Methods

##### _createSound

```typescript
_createSound(): any
```

Create a Sound used to play this PlaylistSound document.

**Returns**  
`any`

---

##### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options** (Optional): `object = {}` - Options provided to the model constructor

**Returns**  
`void`

Inherited from `BasePlaylistSound._initialize`

---

##### _initializeSource

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>` - The candidate source data from which the model will be constructed  
- **options** (Optional): `object = {}` - Options provided to the model constructor

**Returns**  
`object` - Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from `BasePlaylistSound._initializeSource`

---

##### _onCreate

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

Inherited from `BasePlaylistSound._onCreate`

---

##### _onEnd

```typescript
_onEnd(): Promise<any>
```

Special handling that occurs when a PlaylistSound reaches the natural conclusion of its playback.

**Returns**  
`Promise<any>`

---

##### _onStart

```typescript
_onStart(): Promise<any>
```

Special handling that occurs when playback of a PlaylistSound is started.

**Returns**  
`Promise<any>`

---

##### _onStop

```typescript
_onStop(): Promise<void>
```

Special handling that occurs when a PlaylistSound is manually stopped before its natural conclusion.

**Returns**  
`Promise<void>`

---

##### _preCreate

```typescript
_preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [`updateSource`](#updateSource).

**Parameters**

- **data**: `object` - The initial data object provided to the document creation request  
- **options**: `object` - Additional options which modify the creation request  
- **user**: `BaseUser` - The User requesting the document creation

**Returns**  
`Promise<boolean | void>` - Return `false` to exclude this Document from the creation operation.

Inherited from `BasePlaylistSound._preCreate`

---

##### _preDelete

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object` - Additional options which modify the deletion request  
- **user**: `BaseUser` - The User requesting the document deletion

**Returns**  
`Promise<boolean | void>` - A return value of false indicates the deletion operation should be cancelled.

Inherited from `BasePlaylistSound._preDelete`

---

#### Static Methods

##### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from `BasePlaylistSound._initializationOrder`

---

##### canUserCreate

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user**: `BaseUser` - The User being tested

**Returns**  
`boolean` - Does the User have a sufficient role to create?

Inherited from `BasePlaylistSound.canUserCreate`

---

##### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source** (Optional): `object = {}` - The source data object  
- **options** (Optional): `object = {}` - Additional options which are passed to field cleaning methods

**Returns**  
`object` - The cleaned source data, which is the same object as the `source` argument

Inherited from `BasePlaylistSound.cleanData`

---

##### create

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

- **data** (Optional):  
  - `object`  
  - Or `Document<object, DocumentConstructionContext>`  
  - Or an array of objects or Document instances  
  Initial data used to create this Document, or a Document instance to persist.  
- **operation** (Optional): `Partial<Omit<DatabaseCreateOperation, "data">> = {}`  
  Parameters of the creation operation

**Returns**  
`Promise` resolving to one or multiple created Document instances or `undefined`.

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples**

Create a World-level Item:

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);
```

Create an Actor-owned Item:

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});
```

Create an Item in a Compendium pack:

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from `BasePlaylistSound.create`

---

##### createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data** (Optional): `(object | Document<object, DocumentConstructionContext>)[] = []`  
  An array of data objects or existing Documents to persist.  
- **operation** (Optional): `Partial<Omit<DatabaseCreateOperation, "data">> = {}`  
  Parameters of the requested creation operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of created Document instances

**Examples**

Create a single Document:

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);
```

Create multiple Documents:

```typescript
const data = [
  {name: "Tim", type: "npc"}, 
  {name: "Tom", type: "npc"}
];
const created = await Actor.implementation.createDocuments(data);
```

Create multiple embedded Documents within a parent:

```typescript
const actor = game.actors.getName("Tim");
const data = [
  {name: "Sword", type: "weapon"},
  {name: "Breastplate", type: "equipment"}
];
const created = await Item.implementation.createDocuments(data, {parent: actor});
```

Create a Document within a Compendium pack:

```typescript
const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

Inherited from `BasePlaylistSound.createDocuments`

---

##### defineSchema

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

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
An object defining each field with its corresponding field type.

Inherited from `BasePlaylistSound.defineSchema`

---

##### deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids**: `string[] = []`  
  An array of string ids for the documents to be deleted  
- **operation** (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">> = {}`  
  Parameters of the database deletion operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of deleted Document instances

**Examples**

Delete a single Document:

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);
```

Delete multiple Documents:

```typescript
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);
```

Delete multiple embedded Documents within a parent:

```typescript
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});
```

Delete Documents within a Compendium pack:

```typescript
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from `BasePlaylistSound.deleteDocuments`

---

##### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string` - Serialized document data in string format

**Returns**  
`DataModel<object, DataModelConstructionContext>` - A constructed data model instance

Inherited from `BasePlaylistSound.fromJSON`

---

##### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object` - Initial document data which comes from a trusted source.  
- **context** (Optional): `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}` - Model construction context.

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from `BasePlaylistSound.fromSource`

---

##### get

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string` - The Document ID  
- **operation** (Optional): `DatabaseGetOperation = {}` - Parameters of the get operation

**Returns**  
`null | Document<object, DocumentConstructionContext>` - The retrieved Document, or null

Inherited from `BasePlaylistSound.get`

---

##### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string` - An existing collection name or a document name.

**Returns**  
`null | string` - The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

Passing an existing collection name:

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"
```

Passing a document name:

```typescript
Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from `BasePlaylistSound.getCollectionName`

---

##### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object` - The candidate source data from which the model will be constructed

**Returns**  
`object` - Migrated source data, which is the same object as the `source` argument

Inherited from `BasePlaylistSound.migrateData`

---

##### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object` - The candidate source data from which the model will be constructed

**Returns**  
`object` - Migrated source data, which is the same object as the `source` argument

Inherited from `BasePlaylistSound.migrateDataSafe`

---

##### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object` - Data which matches the current schema  
- **options** (Optional): `{ embedded?: boolean } = {}` - Additional shimming options  
  - **embedded** (Optional): `boolean` - Apply shims to embedded models?

**Returns**  
`object` - Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from `BasePlaylistSound.shimData`

---

##### updateDocuments

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates**: `object[] = []` - An array of differential data objects, each used to update a single Document  
- **operation** (Optional): `Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` - Parameters of the database update operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of updated Document instances

**Examples**

Update a single Document:

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);
```

Update multiple Documents:

```typescript
const updates = [
  {_id: "12ekjf43kj2312ds", name: "Timothy"}, 
  {_id: "kj549dk48k34jk34", name: "Thomas"}
];
const updated = await Actor.implementation.updateDocuments(updates);
```

Update multiple embedded Documents within a parent:

```typescript
const actor = game.actors.getName("Timothy");
const updates = [
  {_id: sword.id, name: "Magic Sword"}, 
  {_id: shield.id, name: "Magic Shield"}
];
const updated = await Item.implementation.updateDocuments(updates, {parent: actor});
```

Update Documents within a Compendium pack:

```typescript
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([
  {_id: actor.id, name: "New Name"}
], {pack: "mymodule.mypack"});
```

Inherited from `BasePlaylistSound.updateDocuments`

---

##### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object` - Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from `BasePlaylistSound.validateJoint`

---

##### _onCreateOperation

```typescript
static _onCreateOperation(
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

Inherited from `BasePlaylistSound._onCreateOperation`

---

##### _onDeleteOperation

```typescript
static _onDeleteOperation(
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

Inherited from `BasePlaylistSound._onDeleteOperation`

---

##### _onUpdateOperation

```typescript
static _onUpdateOperation(
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

Inherited from `BasePlaylistSound._onUpdateOperation`

---

##### _preCreateOperation

```typescript
static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using `updateSource`.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` - Pending document instances to be created  
- **operation**: `DatabaseCreateOperation` - Parameters of the database creation operation  
- **user**: `BaseUser` - The User requesting the creation operation

**Returns**  
`Promise<boolean | void>` - Return false to cancel the creation operation entirely.

Inherited from `BasePlaylistSound._preCreateOperation`

---

##### _preDeleteOperation

```typescript
static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object and using `updateSource`.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` - Document instances to be deleted  
- **operation**: `DatabaseDeleteOperation` - Parameters of the database update operation  
- **user**: `BaseUser` - The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>` - Return false to cancel the deletion operation entirely.

Inherited from `BasePlaylistSound._preDeleteOperation`

---

##### _preUpdateOperation

```typescript
static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` - Document instances to be updated  
- **operation**: `DatabaseUpdateOperation` - Parameters of the database update operation  
- **user**: `BaseUser` - The User requesting the update operation

**Returns**  
`Promise<boolean | void>` - Return false to cancel the update operation entirely.

Inherited from `BasePlaylistSound._preUpdateOperation`

---

# End of PlaylistSound API Documentation