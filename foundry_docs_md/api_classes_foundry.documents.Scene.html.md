# Scene | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side Scene document which extends the common BaseScene model.

**Mixes**  
ClientDocumentMixin

**See**  
- [foundry.documents.collections.Scenes](https://foundryvtt.com/api/classes/foundry.documents.collections.Scenes.html): The world-level collection of Scene documents  
- [foundry.applications.sheets.SceneConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.SceneConfig.html): The Scene configuration application

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.Scene))  
_BaseScene<this>_ → **Scene**

---

## Constructors

```typescript
new Scene(
    data?: Partial<SceneData>,
    options?: DocumentConstructionContext,
): documents.Scene
```

- **Parameters**
  - **data** (Optional): `Partial<SceneData> = {}`  
    Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
  - **options** (Optional): `DocumentConstructionContext = {}`  
    Context and data validation options which affects initial model construction.
- **Returns**  
  `documents.Scene`

Inherited from [BaseScene.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#constructor)

---

## Properties

### _source

```typescript
_source: SceneData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [BaseScene._source](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_source)

### dimensions

```typescript
dimensions: SceneDimensions = ...
```

Determine the canvas dimensions this Scene would occupy, if rendered.

### grid

```typescript
grid: BaseGrid<GridCoordinates2D, GridCoordinates3D> = ...
```

The grid instance.

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BaseScene.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#parent)

### LOCALIZATION_PREFIXES (Static)

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

Inherited from [BaseScene.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#localization_prefixes)

### metadata (Static)

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

Inherited from [BaseScene.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#metadata)

---

## Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

Inherited from ClientDocumentMixin(BaseScene).id

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BaseScene).inCompendium

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BaseScene).invalid

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BaseScene).isEmbedded

### isView

```typescript
get isView(): boolean
```

A convenience accessor for whether the Scene is currently viewed.

**Returns**  
`boolean`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from ClientDocumentMixin(BaseScene).schema

### thumbnail

```typescript
get thumbnail(): string
```

Provide a thumbnail image path used to represent this document.

**Returns**  
`string`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

Inherited from ClientDocumentMixin(BaseScene).uuid

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

Inherited from ClientDocumentMixin(BaseScene).validationFailures

### baseDocument (Static)

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BaseScene).baseDocument

### collectionName (Static)

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

Inherited from ClientDocumentMixin(BaseScene).collectionName

### database (Static)

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from ClientDocumentMixin(BaseScene).database

### defaultGrid (Static)

```typescript
get defaultGrid(): BaseGrid<GridCoordinates2D, GridCoordinates3D>
```

The default grid defined by the system.

**Returns**  
`BaseGrid<GridCoordinates2D, GridCoordinates3D>`

### documentName (Static)

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

Inherited from ClientDocumentMixin(BaseScene).documentName

### hasTypeData (Static)

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BaseScene).hasTypeData

### hierarchy

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from ClientDocumentMixin(BaseScene).hierarchy

### implementation (Static)

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BaseScene).implementation

### schema (Static)

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

Inherited from ClientDocumentMixin(BaseScene).schema

### TYPES (Static)

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

Inherited from ClientDocumentMixin(BaseScene).TYPES

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

- **Parameters**  
  `__namedParameters?: { pack?: null; parentCollection?: null } = {}`
- **Returns**  
  `void`

Inherited from [BaseScene._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_configure)

### _initialize

```typescript
_initialize(options: any): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

- **Parameters**  
  `options: any` Options provided to the model constructor
- **Returns**  
  `void`

Inherited from [BaseScene._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_initialize)

### _onClickDocumentLink

```typescript
_onClickDocumentLink(event: any): any
```

- **Parameters**  
  `event: any`
- **Returns**  
  `any`

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters**  
  - `data: any` The initial data object provided to the document creation request  
  - `options: any` Additional options which modify the creation request  
  - `userId: any` The id of the User requesting the document update  
- **Returns**  
  `void`

Overrides [BaseScene._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_oncreate)

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters**  
  - `options: any` Additional options which modify the deletion request  
  - `userId: any` The id of the User requesting the document update  
- **Returns**  
  `void`

Overrides [BaseScene._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_ondelete)

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): undefined | Promise<any>
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

- **Parameters**  
  - `changed: any` The differential data that was changed relative to the documents prior values  
  - `options: any` Additional options which modify the update request  
  - `userId: any` The id of the User requesting the document update  
- **Returns**  
  `undefined | Promise<any>`

Overrides [BaseScene._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_onupdate)

### _onUpdateDescendantDocuments

```typescript
_onUpdateDescendantDocuments(
    parent: any,
    collection: any,
    documents: any,
    changes: any,
    options: any,
    userId: any,
): void
```

- **Parameters**  
  - `parent: any`  
  - `collection: any`  
  - `documents: any`  
  - `changes: any`  
  - `options: any`  
  - `userId: any`
- **Returns**  
  `void`

### _preCreate

```typescript
_preCreate(data: any, options: any, user: any): Promise<undefined | false>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [`updateSource`](#updatesource).

- **Parameters**  
  - `data: any` The initial data object provided to the document creation request  
  - `options: any` Additional options which modify the creation request  
  - `user: any` The User requesting the document creation  
- **Returns**  
  `Promise<undefined | false>`  
  Return false to exclude this Document from the creation operation

Overrides [BaseScene._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_precreate)

### _preCreateDescendantDocuments

```typescript
_preCreateDescendantDocuments(
    parent: any,
    collection: any,
    data: any,
    options: any,
    userId: any,
): void
```

- **Parameters**  
  - `parent: any`  
  - `collection: any`  
  - `data: any`  
  - `options: any`  
  - `userId: any`
- **Returns**  
  `void`

### _preDeleteDescendantDocuments

```typescript
_preDeleteDescendantDocuments(
    parent: any,
    collection: any,
    ids: any,
    options: any,
    userId: any,
): void
```

- **Parameters**  
  - `parent: any`  
  - `collection: any`  
  - `ids: any`  
  - `options: any`  
  - `userId: any`
- **Returns**  
  `void`

### _preUpdate

```typescript
_preUpdate(
    changed: any,
    options: any,
    user: any,
): Promise<undefined | false | Readonly<Notification>>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

- **Parameters**  
  - `changed: any` The candidate changes to the Document  
  - `options: any` Additional options which modify the update request  
  - `user: any` The User requesting the document update  
- **Returns**  
  `Promise<undefined | false | Readonly<Notification>>`  
  A return value of false indicates the update operation should be cancelled.

Overrides [BaseScene._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_preupdate)

### _preUpdateDescendantDocuments

```typescript
_preUpdateDescendantDocuments(
    parent: any,
    collection: any,
    changes: any,
    options: any,
    userId: any,
): void
```

- **Parameters**  
  - `parent: any`  
  - `collection: any`  
  - `changes: any`  
  - `options: any`  
  - `userId: any`
- **Returns**  
  `void`

### activate

```typescript
activate(): Promise<documents.Scene>
```

Set this scene as currently active.

**Returns**  
`Promise<documents.Scene>`  
A Promise which resolves to the current scene once it has been successfully activated.

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

- **Parameters**  
  - `user: BaseUser` The User attempting modification  
  - `action: string` The attempted action  
  - `data?: object = {}` Data involved in the attempted action  
- **Returns**  
  `boolean`  
  Does the User have permission?

Inherited from [BaseScene.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#canusermodify)

### clearMovementHistories

```typescript
clearMovementHistories(): Promise<void>
```

Clear the movement history of all Tokens within this Scene.

**Returns**  
`Promise<void>`

### clone

```typescript
clone(
    createData?: {},
    options?: {},
):
    | Document<object, DocumentConstructionContext>
    | Promise<Document<object, DocumentConstructionContext>>
```

- **Parameters**  
  - `createData?: {} = {}`  
  - `options?: {} = {}`
- **Returns**  
  `Document` or `Promise<Document>`

Overrides [BaseScene.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#clone)

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

- **Parameters**  
  - `embeddedName: string` The name of the embedded Document type  
  - `data?: object[] = []` An array of data objects used to create multiple documents  
  - `operation?: DatabaseCreateOperation = {}` Parameters of the database creation workflow  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of created Document instances
- **See**  
  [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseScene.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#createembeddeddocuments)

### createThumbnail

```typescript
createThumbnail(
    options?: {
        format?: string;
        height?: number;
        img?: null | string;
        quality?: number;
        width?: number;
    },
): Promise<object>
```

Create a 300px by 100px thumbnail image for this scene background.

- **Parameters**
  - **options** (Optional): Object containing:
    - **format**? (`string`): Which image format should be used? `image/png`, `image/jpeg`, or `image/webp`.
    - **height**? (`number`): The desired thumbnail height. Default is 100px.
    - **img**? (`null | string`): A background image to use for thumbnail creation, otherwise the current scene background is used.
    - **quality**? (`number`): What compression quality should be used for jpeg or webp, between 0 and 1.
    - **width**? (`number`): The desired thumbnail width. Default is 300px.
- **Returns**  
  `Promise<object>`  
  The created thumbnail data.

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

- **Parameters**  
  - **operation** (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">> = {}`  
    Parameters of the deletion operation
- **Returns**  
  `Promise<undefined | Document<object, DocumentConstructionContext>>`  
  The deleted Document instance, or undefined if not deleted.
- **See**  
  [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseScene.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#delete)

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

- **Parameters**  
  - `embeddedName: string` The name of the embedded Document type  
  - `ids: string[]` An array of string ids for each Document to be deleted  
  - `operation?: DatabaseDeleteOperation = {}` Parameters of the database deletion workflow  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of deleted Document instances
- **See**  
  [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseScene.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#deleteembeddeddocuments)

### getDimensions

```typescript
getDimensions(): SceneDimensions
```

Get the Canvas dimensions which would be used to display this Scene. Apply padding to enlarge the playable space and round to the nearest 2x grid size to ensure symmetry. The rounding accomplishes that the padding buffer around the map always contains whole grid spaces.

**Returns**  
`SceneDimensions`

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

- **Parameters**  
  - `embeddedName: string` The name of the embedded Document type  
- **Returns**  
  `DocumentCollection`  
  The Collection instance of embedded Documents of the requested type

Inherited from [BaseScene.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#getembeddedcollection)

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext> | undefined
```

Get an embedded document by its id from a named collection in the parent document.

- **Parameters**  
  - `embeddedName: string` The name of the embedded Document type  
  - `id: string` The id of the child document to retrieve  
  - `options?: { invalid?: boolean; strict?: boolean } = {}` Additional options which modify how embedded documents are retrieved  
    - **invalid**? (`boolean`): Allow retrieving an invalid Embedded Document  
    - **strict**? (`boolean`): Throw an Error if the requested id does not exist. See Collection#get
- **Returns**  
  `Document<object, DocumentConstructionContext> | undefined`  
  The retrieved embedded Document instance, or undefined
- **Throws**  
  If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseScene.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#getembeddeddocument)

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

- **Parameters**  
  - `scope: string` The flag scope which namespaces the key  
  - `key: string` The flag key  
- **Returns**  
  `any` The flag value

Inherited from [BaseScene.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#getflag)

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

- **Parameters**  
  - `user?: BaseUser` The User being tested  
- **Returns**  
  `DocumentOwnershipNumber`  
  A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

Inherited from [BaseScene.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#getuserlevel)

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
`object` The migrated system data object

Inherited from [BaseScene.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#migratesystemdata)

### prepareBaseData

```typescript
prepareBaseData(): void
```

**Returns**  
`void`

Inherited from [BaseScene.prepareBaseData](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#preparebasedata)

### pullUsers

```typescript
pullUsers(users?: any[]): void
```

Pull the specified users to this Scene.

- **Parameters**  
  - `users?: any[] = []` An array of User documents or IDs.
- **Returns**  
  `void`

### reset

```typescript
reset(): void
```

**Returns**  
`void`

Overrides [BaseScene.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#reset)

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

- **Parameters**  
  - `scope: string` The flag scope which namespaces the key  
  - `key: string` The flag key  
  - `value: any` The flag value  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>>`  
  A Promise resolving to the updated document

Inherited from [BaseScene.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#setflag)

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

- **Parameters**  
  - `user: BaseUser` The User being tested  
  - `permission: DocumentOwnershipLevel` The permission level from DOCUMENT_OWNERSHIP_LEVELS to test  
  - `options?: { exact?: boolean } = {}` Additional options involved in the permission test  
    - **exact**? (`boolean`): Require the exact permission level requested?  
- **Returns**  
  `boolean` Does the user have this permission level over the Document?

Inherited from [BaseScene.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#testuserpermission)

### toCompendium

```typescript
toCompendium(pack: any, options?: {}): any
```

- **Parameters**  
  - `pack: any`  
  - `options?: {} = {}`
- **Returns**  
  `any`

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object`  
The document source data expressed as a plain object

Inherited from [BaseScene.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#tojson)

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

- **Parameters**  
  - `source: boolean = true` Draw values from the underlying data source rather than transformed values  
- **Returns**  
  `any` The extracted primitive object

Overrides [BaseScene.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#toobject)

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

- **Parameters**  
  - `_parentPath?: string` (Optional) A parent field path already traversed  
- **Returns**  
  `Generator<any, void, any>`

Inherited from [BaseScene.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#traverseembeddeddocuments)

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

- **Parameters**  
  - `scope: string` The flag scope which namespaces the key  
  - `key: string` The flag key  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>>` The updated document instance

Inherited from [BaseScene.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#unsetflag)

### unview

```typescript
unview(): Promise<undefined | documents.Scene>
```

Unview the current Scene, clearing the game canvas.

- **Returns**  
  `Promise<undefined | documents.Scene>`

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

- **Parameters**  
  - `data?: object = {}` Differential update data which modifies the existing values of this document  
  - `operation?: Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` Parameters of the update operation  
- **Returns**  
  `Promise<undefined | Document<object, DocumentConstructionContext>>`  
  The updated Document instance, or undefined not updated  
- **See**  
  [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseScene.update](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#update)

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: DatabaseUpdateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

- **Parameters**  
  - `embeddedName: string` The name of the embedded Document type  
  - `updates?: object[] = []` An array of differential data objects, each used to update a single Document  
  - `operation?: DatabaseUpdateOperation = {}` Parameters of the database update workflow  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of updated Document instances
- **See**  
  [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseScene.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#updateembeddeddocuments)

### updateSource

```typescript
updateSource(changes?: {}, options?: {}): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

- **Parameters**  
  - `changes?: {} = {}` New values which should be applied to the data model  
  - `options?: {} = {}` Options which determine how the new data is merged  
- **Returns**  
  `object` An object containing differential keys and values that were changed
- **Throws**  
  An error if the requested data model changes were invalid

Inherited from [BaseScene.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#updatesource)

### updateTokenRegions

```typescript
updateTokenRegions(): Promise<TokenDocument[]>
updateTokenRegions(tokens: Iterable<TokenDocument>): Promise<TokenDocument[]>
```

For all Tokens in this Scene identify the Regions that each Token is contained in and update the regions of each Token accordingly.

This function doesn't need to be called by the systems/modules unless [TokenDocument.testInsideRegion](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html#testinsideregion) is overridden and non-Token properties other than `Scene#grid.type` and `Scene#grid.size` change that are used in the override of TokenDocument#testInsideRegion.

- **Parameters**  
  `tokens?: Iterable<TokenDocument>` (Optional) The Tokens whose regions should be updated. If not provided, applies to all tokens in the scene.
- **Returns**  
  `Promise<TokenDocument[]>` The array of Tokens whose regions changed.

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

- **Parameters**  
  - `options?: DataModelValidationOptions = {}` Options which modify how the model is validated  
- **Returns**  
  `boolean` Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.
- **Throws**  
  An error thrown if validation is strict and a failure occurs.

Inherited from [BaseScene.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#validate)

### view

```typescript
view(): Promise<documents.Scene>
```

Set this scene as the current view.

- **Returns**  
  `Promise<documents.Scene>`

---

## Protected Methods

### _initializeSource

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

- **Parameters**  
  - `data: object | DataModel<object, DataModelConstructionContext>` The candidate source data from which the model will be constructed  
  - `options?: object = {}` Options provided to the model constructor  
- **Returns**  
  `object` Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

Inherited from [BaseScene._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_initializesource)

### _onActivate

```typescript
_onActivate(active: boolean): void
```

Handle Scene activation workflow if the active state is changed to true.

- **Parameters**  
  - `active: boolean` Is the scene now active?  
- **Returns**  
  `void`

### _preDelete

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

- **Parameters**  
  - `options: object` Additional options which modify the deletion request  
  - `user: BaseUser` The User requesting the document deletion  
- **Returns**  
  `Promise<boolean | void>` A return value of false indicates the deletion operation should be cancelled.

Inherited from [BaseScene._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_predelete)

### _initializationOrder (Static)

```typescript
_initializationOrder(): Generator<any[], void, unknown>
```

- **Returns**  
  `Generator<any[], void, unknown>`

Inherited from [BaseScene._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_initializationorder)

### _onUpdateOperation (Static)

```typescript
_onUpdateOperation(documents: any, operation: any, user: any): Promise<void>
```

- **Parameters**  
  - `documents: any`  
  - `operation: any`  
  - `user: any`  
- **Returns**  
  `Promise<void>`

Overrides [BaseScene._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_onupdateoperation)

### _preCreateOperation (Static)

```typescript
_preCreateOperation(documents: any, operation: any, user: any): Promise<void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [`updateSource`](#updatesource).

- **Parameters**  
  - `documents: any` Pending document instances to be created  
  - `operation: any` Parameters of the database creation operation  
  - `user: any` The User requesting the creation operation  
- **Returns**  
  `Promise<void>`  
  Return false to cancel the creation operation entirely

Overrides [BaseScene._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_precreateoperation)

### canUserCreate (Static)

```typescript
canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

- **Parameters**  
  - `user: BaseUser` The User being tested  
- **Returns**  
  `boolean` Does the User have a sufficient role to create?

Inherited from [BaseScene.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#canusercreate)

### cleanData (Static)

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

- **Parameters**  
  - `source?: object = {}` The source data object  
  - `options?: object = {}` Additional options which are passed to field cleaning methods  
- **Returns**  
  `object` The cleaned source data, which is the same object as the `source` argument

Inherited from [BaseScene.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#cleandata)

### create (Static)

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

- **Parameters**  
  - `data?` (Optional): Initial data used to create this Document, or a Document instance to persist. Can be a single object, a Document instance, or an array of those.  
  - `operation?` (Optional): Parameters of the creation operation  
- **Returns**  
  `Promise<undefined | Document | Document[]>` The created Document instance(s)  

- **Example: Create a World-level Item**

- **Example: Create an Actor-owned Item**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});
```

- **Example: Create an Item in a Compendium pack**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseScene.create](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#create)

### createDocuments (Static)

```typescript
createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

- **Parameters**  
  - `data?: (object | Document<object, DocumentConstructionContext>)[] = []` An array of data objects or existing Documents to persist.  
  - `operation?: Partial<Omit<DatabaseCreateOperation, "data">> = {}` Parameters of the requested creation operation  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>[]>` An array of created Document instances

- **Example: Create a single Document**

- **Example: Create multiple Documents**

- **Example: Create multiple embedded Documents within a parent**

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);
```

- **Example: Create a Document within a Compendium pack**

```typescript
const actor = game.actors.getName("Tim");
const data = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const created = await Item.implementation.createDocuments(data, {parent: actor});

const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseScene.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#createdocuments)

### defineSchema (Static)

```typescript
defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    active: BooleanField;
    background: TextureData;
    backgroundColor: ColorField;
    drawings: EmbeddedCollectionField;
    environment: SchemaField;
    flags: DocumentFlagsField;
    fog: SchemaField;
    folder: ForeignDocumentField;
    foreground: FilePathField;
    foregroundElevation: NumberField;
    grid: SchemaField;
    height: NumberField;
    initial: SchemaField;
    journal: ForeignDocumentField;
    journalEntryPage: ForeignDocumentField;
    lights: EmbeddedCollectionField;
    name: StringField;
    navigation: BooleanField;
    navName: StringField;
    navOrder: NumberField;
    notes: EmbeddedCollectionField;
    ownership: DocumentOwnershipField;
    padding: NumberField;
    playlist: ForeignDocumentField;
    playlistSound: ForeignDocumentField;
    regions: EmbeddedCollectionField;
    sort: IntegerSortField;
    sounds: EmbeddedCollectionField;
    templates: EmbeddedCollectionField;
    thumb: FilePathField;
    tiles: EmbeddedCollectionField;
    tokens: EmbeddedCollectionField;
    tokenVision: BooleanField;
    walls: EmbeddedCollectionField;
    weather: StringField;
    width: NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
Schema object described above.

Inherited from [BaseScene.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#defineschema)

### deleteDocuments (Static)

```typescript
deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

- **Parameters**  
  - `ids?: string[] = []` An array of string ids for the documents to be deleted  
  - `operation?: Partial<Omit<DatabaseDeleteOperation, "ids">> = {}` Parameters of the database deletion operation  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>[]>` An array of deleted Document instances

- **Example: Delete a single Document**

- **Example: Delete multiple Documents**

- **Example: Delete multiple embedded Documents within a parent**

- **Example: Delete Documents within a Compendium pack**

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from [BaseScene.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#deletedocuments)

### fromJSON (Static)

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

- **Parameters**  
  - `json: string` Serialized document data in string format  
- **Returns**  
  `DataModel<object, DataModelConstructionContext>` A constructed data model instance

Inherited from [BaseScene.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#fromjson)

### fromSource (Static)

```typescript
fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

- **Parameters**  
  - `source: object` Initial document data which comes from a trusted source.  
  - `context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}` Model construction context  
- **Returns**  
  `DataModel<object, DataModelConstructionContext>`

Inherited from [BaseScene.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#fromsource)

### get (Static)

```typescript
get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

- **Parameters**  
  - `documentId: string` The Document ID  
  - `operation?: DatabaseGetOperation = {}` Parameters of the get operation  
- **Returns**  
  `null | Document<object, DocumentConstructionContext>` The retrieved Document, or null

Inherited from [BaseScene.get](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#get)

### getCollectionName (Static)

```typescript
getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

- **Parameters**  
  - `name: string` An existing collection name or a document name.  
- **Returns**  
  `null | string` The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

- **Example: Passing an existing collection name**

- **Example: Passing a document name**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [BaseScene.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#getcollectionname)

### migrateData (Static)

```typescript
migrateData(source: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

- **Parameters**  
  - `source: any` The candidate source data from which the model will be constructed  
- **Returns**  
  `object` Migrated source data, which is the same object as the `source` argument

Inherited from [BaseScene.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#migratedata)

### migrateDataSafe (Static)

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

- **Parameters**  
  - `source: object` The candidate source data from which the model will be constructed  
- **Returns**  
  `object` Migrated source data, which is the same object as the `source` argument

Inherited from [BaseScene.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#migratedatasafe)

### shimData (Static)

```typescript
shimData(source: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

- **Parameters**  
  - `source: any` Data which matches the current schema  
  - `options: any` Additional shimming options  
- **Returns**  
  `object` Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [BaseScene.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#shimdata)

### updateDocuments (Static)

```typescript
updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

- **Parameters**  
  - `updates?: object[] = []` An array of differential data objects, each used to update a single Document  
  - `operation?: Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` Parameters of the database update operation  
- **Returns**  
  `Promise<Document<object, DocumentConstructionContext>[]>` An array of updated Document instances

- **Example: Update a single Document**

- **Example: Update multiple Documents**

- **Example: Update multiple embedded Documents within a parent**

- **Example: Update Documents within a Compendium pack**

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

Inherited from [BaseScene.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#updatedocuments)

### validateJoint (Static)

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

- **Parameters**  
  - `data: object` Candidate data for the model  
- **Returns**  
  `void`
- **Throws**  
  An error if a validation failure is detected

Inherited from [BaseScene.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#validatejoint)

### _onCreateOperation (Static, Protected)

```typescript
_onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

- **Parameters**  
  - `documents: Document<object, DocumentConstructionContext>[]` The Document instances which were created  
  - `operation: DatabaseCreateOperation` Parameters of the database creation operation  
  - `user: BaseUser` The User who performed the creation operation  
- **Returns**  
  `Promise<void>`

Inherited from [BaseScene._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_oncreateoperation)

### _onDeleteOperation (Static, Protected)

```typescript
_onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

- **Parameters**  
  - `documents: Document<object, DocumentConstructionContext>[]` The Document instances which were deleted  
  - `operation: DatabaseDeleteOperation` Parameters of the database deletion operation  
  - `user: BaseUser` The User who performed the deletion operation  
- **Returns**  
  `Promise<void>`

Inherited from [BaseScene._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_ondeleteoperation)

### _preDeleteOperation (Static, Protected)

```typescript
_preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object via [`updateSource`](#updatesource).

- **Parameters**  
  - `documents: Document<object, DocumentConstructionContext>[]` Document instances to be deleted  
  - `operation: DatabaseDeleteOperation` Parameters of the database update operation  
  - `user: BaseUser` The User requesting the deletion operation  
- **Returns**  
  `Promise<boolean | void>` Return false to cancel the deletion operation entirely

Inherited from [BaseScene._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_predeleteoperation)

### _preUpdateOperation (Static, Protected)

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

- **Parameters**  
  - `documents: Document<object, DocumentConstructionContext>[]` Document instances to be updated  
  - `operation: DatabaseUpdateOperation` Parameters of the database update operation  
  - `user: BaseUser` The User requesting the update operation  
- **Returns**  
  `Promise<boolean | void>` Return false to cancel the update operation entirely

Inherited from [BaseScene._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseScene.html#_preupdateoperation)

---

*For further reference, visit the [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.documents.Scene.html).*