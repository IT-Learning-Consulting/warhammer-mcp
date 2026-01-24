# User | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side User document which extends the common `BaseUser` model. Each User document contains UserData which defines its data schema.

## Mixes
- `ClientDocumentMixin`

## See
- [`foundry.documents.collections.Users`](https://foundryvtt.com/api/classes/foundry.documents.collections.Users.html): The world-level collection of User documents  
- [`foundry.applications.sheets.UserConfig`](https://foundryvtt.com/api/classes/foundry.applications.sheets.UserConfig.html): The User configuration application

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.User), Expand)
- [`BaseUser`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html)<`this`>
- **User**

## Constructors

```typescript
new User(
    data?: Partial<UserData>,
    options?: DocumentConstructionContext,
): documents.User
```

**Parameters**

- `data?: Partial<UserData> = {}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
  
- `options?: DocumentConstructionContext = {}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.User`

*Inherited from [`BaseUser.constructor`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#constructor)*

## Properties

### `_source`

```typescript
_source: UserData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

*Inherited from [`BaseUser._source`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_source)*

### `active`

```typescript
active: boolean = false
```

Track whether the user is currently active in the game.

### `movingTokens`

```typescript
readonly movingTokens: ReadonlySet<TokenDocument>
```

Track the Token documents that this User is currently moving.

### `parent`

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

*Inherited from [`BaseUser.parent`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#parent)*

### `targets`

```typescript
targets: Set<Token> = ...
```

Track references to the current set of Tokens which are targeted by the User.

### `viewedScene`

```typescript
viewedScene: null | string = null
```

Track the ID of the Scene that is currently being viewed by the User.

### Static Properties

#### `LOCALIZATION_PREFIXES`

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

*Inherited from [`BaseUser.LOCALIZATION_PREFIXES`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#localization_prefixes)*

#### `metadata`

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

*Inherited from [`BaseUser.metadata`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#metadata)*

## Accessors

### `id`

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns:** `null | string`

*Inherited from `ClientDocumentMixin(BaseUser).id`*

### `inCompendium`

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns:** `boolean`

*Inherited from `ClientDocumentMixin(BaseUser).inCompendium`*

### `invalid`

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns:** `boolean`

*Inherited from `ClientDocumentMixin(BaseUser).invalid`*

### `isActiveGM`

```typescript
get isActiveGM(): boolean
```

Is this User the active GM?

**Returns:** `boolean`

### `isBanned`

```typescript
get isBanned(): boolean
```

A convenience test for whether this User has the NONE role.

**Returns:** `boolean`

*Inherited from `ClientDocumentMixin(BaseUser).isBanned`*

### `isEmbedded`

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns:** `boolean`

*Inherited from `ClientDocumentMixin(BaseUser).isEmbedded`*

### `isGM`

```typescript
get isGM(): boolean
```

Test whether the User has a GAMEMASTER or ASSISTANT role in this World?

**Returns:** `boolean`

*Inherited from `ClientDocumentMixin(BaseUser).isGM`*

### `isSelf`

```typescript
get isSelf(): boolean
```

A flag for whether this User is the connected client.

**Returns:** `boolean`

### `isTrusted`

```typescript
get isTrusted(): boolean
```

A flag for whether the current User is a Trusted Player.

**Returns:** `boolean`

### `lastActivityTime`

```typescript
get lastActivityTime(): number
```

The timestamp of the last observed activity for the user.

**Returns:** `number`

### `roleLabel`

```typescript
get roleLabel(): string
```

A localized label for this User's role.

**Returns:** `string`

### `schema`

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns:** `SchemaField`

*Inherited from `ClientDocumentMixin(BaseUser).schema`*

### `uuid`

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns:** `string`

*Inherited from `ClientDocumentMixin(BaseUser).uuid`*

### `validationFailures`

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

*Inherited from `ClientDocumentMixin(BaseUser).validationFailures`*

### Static Accessors

- `baseDocument: typeof Document`  
  The base document definition that this document class extends from.

- `collectionName: string`  
  The named collection to which this Document belongs.

- `database: abstract.DatabaseBackend`  
  The database backend used to execute operations and handle results.

- `documentName: string`  
  The canonical name of this Document type, for example "Actor".

- `hasTypeData: boolean`  
  Does this Document support additional subtypes?

- `hierarchy: Readonly<Record<string, any>>`  
  The Embedded Document hierarchy for this Document.

- `implementation: typeof Document`  
  Return a reference to the configured subclass of this base Document type.

- `schema: SchemaField`  
  Ensure that all Document classes share the same schema of their base declaration.

## Methods

### Static Methods

#### `TYPES`

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns:** `string[]`

*Inherited from `ClientDocumentMixin(BaseUser).TYPES`*

### `_configure`

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- `__namedParameters?: { pack?: null; parentCollection?: null } = {}`

**Returns:** `void`

*Inherited from [`BaseUser._configure`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_configure)*

### `_onDelete`

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `options: any`  
  Additional options which modify the deletion request

- `userId: any`  
  The id of the User requesting the document update

**Returns:** `void`

Overrides [`BaseUser._onDelete`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_ondelete)

### `_onUpdate`

```typescript
_onUpdate(changed: any, options: any, userId: any): any
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `changed: any`  
  The differential data that was changed relative to the documents prior values
- `options: any`  
  Additional options which modify the update request
- `userId: any`  
  The id of the User requesting the document update

**Returns:** `any`

Overrides [`BaseUser._onUpdate`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_onupdate)

### `assignHotbarMacro`

```typescript
assignHotbarMacro(
    macro: null | documents.Macro,
    slot?: null | string | number,
    fromSlot?: number,
): Promise<documents.User>
```

Assign a Macro to a numbered hotbar slot between 1 and 50.

**Parameters**

- `macro: null | documents.Macro`  
  The Macro document to assign

- `slot?: null | string | number` (Optional)  
  A specific numbered hotbar slot to fill

- `fromSlot?: number` (Optional, default `{}`)  
  An optional origin slot from which the Macro is being shifted

**Returns:** `Promise<documents.User>`

### `assignPermission`

```typescript
assignPermission(
    permission: string,
    allowed: boolean,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Assign a specific boolean permission to this user. Modifies the user permissions to grant or restrict access to a feature.

**Parameters**

- `permission: string`  
  The permission name from USER_PERMISSIONS

- `allowed: boolean`  
  Whether to allow or restrict the permission

**Returns:**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`

### `broadcastActivity`

```typescript
broadcastActivity(
    activityData?: ActivityData,
    options?: { volatile?: boolean },
): void
```

Submit User activity data to the server for broadcast to other players. This type of data is transient, persisting only for the duration of the session and not saved to any database. Activity data uses a volatile event to prevent unnecessary buffering if the client temporarily loses connection.

**Parameters**

- `activityData: ActivityData = {}`  
  An object of User activity data to submit to the server for broadcast.

- `options?: { volatile?: boolean } = {}` (Optional)  
  If undefined, volatile is inferred from the activity data.

**Returns:** `void`

### `can`

```typescript
can(action: string): boolean
```

Test whether the User is able to perform a certain permission action. The provided permission string may pertain to an explicit permission setting or a named user role.

**Parameters**

- `action: string`  
  The action to test

**Returns:** `boolean`

*Inherited from [`BaseUser.can`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#can)*

### `canUserModify`

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- `user: BaseUser`  
  The User attempting modification

- `action: string`  
  The attempted action

- `data?: object = {}` (Optional)  
  Data involved in the attempted action

**Returns:** `boolean`

*Inherited from [`BaseUser.canUserModify`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#canusermodify)*

### `clone`

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- `data?: object = {}` (Optional)  
  Additional data which overrides current document data at the time of creation

- `context?: DocumentConstructionContext & DocumentCloneOptions = {}` (Optional)  
  Additional context options passed to the create method

**Returns**  
`Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>`

*Inherited from [`BaseUser.clone`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#clone)*

### `createEmbeddedDocuments`

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

**Parameters**

- `embeddedName: string`  
  The name of the embedded Document type

- `data?: object[] = []`  
  An array of data objects used to create multiple documents

- `operation?: DatabaseCreateOperation = {}` (Optional)  
  Parameters of the database creation workflow

**Returns:** `Promise<Document<object, DocumentConstructionContext>[]>`

**See:** [`Document.createDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

*Inherited from [`BaseUser.createEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#createembeddeddocuments)*

### `delete`

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- `operation?: Partial<Omit<DatabaseDeleteOperation, "ids">> = {}` (Optional)  
  Parameters of the deletion operation

**Returns:**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`

**See:** [`Document.deleteDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [`BaseUser.delete`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#delete)*

### `deleteEmbeddedDocuments`

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- `embeddedName: string`  
  The name of the embedded Document type

- `ids: string[]`  
  An array of string ids for each Document to be deleted

- `operation?: DatabaseDeleteOperation = {}` (Optional)  
  Parameters of the database deletion workflow

**Returns:** `Promise<Document<object, DocumentConstructionContext>[]>`

**See:** [`Document.deleteDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [`BaseUser.deleteEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#deleteembeddeddocuments)*

### `getEmbeddedCollection`

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- `embeddedName: string`  
  The name of the embedded Document type

**Returns:** `DocumentCollection`

*Inherited from [`BaseUser.getEmbeddedCollection`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#getembeddedcollection)*

### `getEmbeddedDocument`

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

**Parameters**

- `embeddedName: string`  
  The name of the embedded Document type

- `id: string`  
  The id of the child document to retrieve

- `options?: { invalid?: boolean; strict?: boolean } = {}` (Optional)  
  Additional options which modify how embedded documents are retrieved
  
  - `invalid?: boolean` (Optional)  
    Allow retrieving an invalid Embedded Document.
  
  - `strict?: boolean` (Optional)  
    Throw an Error if the requested id does not exist. See Collection#get

**Returns:** `Document<object, DocumentConstructionContext>`

**Throws:** If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

*Inherited from [`BaseUser.getEmbeddedDocument`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#getembeddeddocument)*

### `getFlag`

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

**Parameters**

- `scope: string`  
  The flag scope which namespaces the key

- `key: string`  
  The flag key

**Returns:** `any`

*Inherited from [`BaseUser.getFlag`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#getflag)*

### `getHotbarMacros`

```typescript
getHotbarMacros(page?: number): { macro: null | documents.Macro; slot: number }[]
```

Get an Array of Macro Documents on this User's Hotbar by page.

**Parameters**

- `page?: number = 1`  
  The hotbar page number

**Returns:**  
Array of objects `{ macro: null | documents.Macro; slot: number }`

### `getUserLevel`

```typescript
getUserLevel(user: any): 0 | 3
```

Get the explicit permission level that a User has over this Document, a value in [`CONST.DOCUMENT_OWNERSHIP_LEVELS`](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- `user: any`  
  The User being tested

**Returns:** `0 | 3`  
A numeric permission level from [`CONST.DOCUMENT_OWNERSHIP_LEVELS`](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

*Inherited from [`BaseUser.getUserLevel`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#getuserlevel)*

### `hasPermission`

```typescript
hasPermission(permission: string): boolean
```

Test whether the User has at least a specific permission.

**Parameters**

- `permission: string`  
  The permission name from USER_PERMISSIONS to test

**Returns:** `boolean`

*Inherited from [`BaseUser.hasPermission`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#haspermission)*

### `hasRole`

```typescript
hasRole(role: string | number, exact?: boolean): boolean
```

Test whether the User has at least the permission level of a certain role.

**Parameters**

- `role: string | number`  
  The role name from USER_ROLES to test

- `exact?: boolean = {}` (Optional)  
  Require the role match to be exact

**Returns:** `boolean`

*Inherited from [`BaseUser.hasRole`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#hasrole)*

### `isDesignated`

```typescript
isDesignated(condition: (user: documents.User) => boolean): boolean
```

Is this User the designated User among the Users that satisfy the given condition? This function calls [`foundry.documents.collections.Users#getDesignatedUser`](https://foundryvtt.com/api/classes/foundry.documents.collections.Users.html#getdesignateduser) and compares the designated User to this User.

**Parameters**

- `condition: (user: documents.User) => boolean`  
  The condition the Users must satisfy

**Returns:** `boolean`

**Example**

```typescript
// Is the current User the designated User to create Tokens?
const isDesignated = game.user.isDesignated(user => user.active && user.can("TOKEN_CREATE"));
```

### `migrateSystemData`

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns:** The migrated system data object

*Inherited from [`BaseUser.migrateSystemData`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#migratesystemdata)*

### `prepareDerivedData`

```typescript
prepareDerivedData(): void
```

**Returns:** `void`

*Inherited from Doc*

### `query`

```typescript
query(
    queryName: string,
    queryData: object,
    queryOptions?: { timeout?: number },
): Promise<any>
```

Query this User.

**Parameters**

- `queryName: string`  
  The query name (must be registered in `CONFIG.queries`)

- `queryData: object`  
  The query data (must be JSON-serializable)

- `queryOptions?: { timeout?: number } = {}` (Optional)  
  The query options
  
  - `timeout?: number` (Optional)  
    The timeout in milliseconds

**Returns:** `Promise<any>`

### `reset`

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:** `void`

*Inherited from [`BaseUser.reset`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#reset)*

### `setFlag`

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

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- `scope: string`  
  The flag scope which namespaces the key

- `key: string`  
  The flag key

- `value: any`  
  The flag value

**Returns:** `Promise<Document<object, DocumentConstructionContext>>`

*Inherited from [`BaseUser.setFlag`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#setflag)*

### `testUserPermission`

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

**Parameters**

- `user: BaseUser`  
  The User being tested

- `permission: DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- `options?: { exact?: boolean } = {}` (Optional)  
  Additional options involved in the permission test
  
  - `exact?: boolean` (Optional)  
    Require the exact permission level requested?

**Returns:** `boolean`

*Inherited from [`BaseUser.testUserPermission`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#testuserpermission)*

### `toJSON`

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:** The document source data expressed as a plain object

*Inherited from [`BaseUser.toJSON`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#tojson)*

### `toObject`

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- `source: boolean = true`  
  Draw values from the underlying data source rather than transformed values

**Returns:** The extracted primitive object

*Inherited from [`BaseUser.toObject`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#toobject)*

### `traverseEmbeddedDocuments`

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- `_parentPath?: string` (Optional)  
  A parent field path already traversed

**Returns:** Generator

*Inherited from [`BaseUser.traverseEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#traverseembeddeddocuments)*

### `unsetFlag`

```typescript
unsetFlag(
    scope: string,
    key: string,
): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- `scope: string`  
  The flag scope which namespaces the key

- `key: string`  
  The flag key

**Returns:** `Promise<Document<object, DocumentConstructionContext>>`

*Inherited from [`BaseUser.unsetFlag`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#unsetflag)*

### `update`

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- `data?: object = {}` (Optional)  
  Differential update data which modifies the existing values of this document

- `operation?: Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` (Optional)  
  Parameters of the update operation

**Returns:**  
The updated Document instance, or `undefined` if not updated

**See:** [`Document.updateDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [`BaseUser.update`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#update)*

### `updateEmbeddedDocuments`

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: DatabaseUpdateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

**Parameters**

- `embeddedName: string`  
  The name of the embedded Document type

- `updates?: object[] = []`  
  An array of differential data objects, each used to update a single Document

- `operation?: DatabaseUpdateOperation = {}` (Optional)  
  Parameters of the database update workflow

**Returns:** `Promise<Document<object, DocumentConstructionContext>[]>`

**See:** [`Document.updateDocuments`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [`BaseUser.updateEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#updateembeddeddocuments)*

### `updateSource`

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided `changes` argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- `changes?: object = {}`  
  New values which should be applied to the data model

- `options?: DataModelUpdateOptions = {}`  
  Options which determine how the new data is merged

**Returns:**  
An object containing differential keys and values that were changed

**Throws:** An error if the requested data model changes were invalid

*Inherited from [`BaseUser.updateSource`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#updatesource)*

### `validate`

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- `options?: DataModelValidationOptions = {}`  
  Options which modify how the model is validated

**Returns:** `boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws:** An error thrown if validation is strict and a failure occurs.

*Inherited from [`BaseUser.validate`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#validate)*

## Protected Methods

### `_initialize`

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- `options?: object = {}` (Optional)  
  Options provided to the model constructor

**Returns:** `void`

*Inherited from [`BaseUser._initialize`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_initialize)*

### `_initializeSource`

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- `data: object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- `options?: object = {}` (Optional)  
  Options provided to the model constructor

**Returns:**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

*Inherited from [`BaseUser._initializeSource`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_initializesource)*

### `_onCreate`

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `data: object`  
  The initial data object provided to the document creation request

- `options: object`  
  Additional options which modify the creation request

- `userId: string`  
  The id of the User requesting the document update

**Returns:** `void`

*Inherited from [`BaseUser._onCreate`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_oncreate)*

### `_preCreate`

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

- `data: object`  
  The initial data object provided to the document creation request

- `options: object`  
  Additional options which modify the creation request

- `user: BaseUser`  
  The User requesting the document creation

**Returns:** `Promise<boolean | void>`  
Return false to exclude this Document from the creation operation.

*Inherited from [`BaseUser._preCreate`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_precreate)*

### `_preDelete`

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- `options: object`  
  Additional options which modify the deletion request

- `user: BaseUser`  
  The User requesting the document deletion

**Returns:** `Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

*Inherited from [`BaseUser._preDelete`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_predelete)*

### `_preUpdate`

```typescript
_preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- `changes: object`  
  The candidate changes to the Document

- `options: object`  
  Additional options which modify the update request

- `user: BaseUser`  
  The User requesting the document update

**Returns:** `Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

*Inherited from [`BaseUser._preUpdate`](https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html#_preupdate)*

### Static Protected Methods

- `_initializationOrder(): Generator<any[], void, unknown>`  
  Defines the initialization order.

- `canUserCreate(user: BaseUser): boolean`  
  Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present. Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

- `cleanData(source?: object, options?: object): object`  
  Clean a data source object to conform to a specific provided schema.

- `create(data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[], operation?: Partial<Omit<DatabaseCreateOperation, "data">>): Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>`  
  Create a new Document using provided input data, saving it to the database.

- `createDocuments(data?: (object | Document<object, DocumentConstructionContext>)[], operation?: Partial<Omit<DatabaseCreateOperation, "data">>): Promise<Document<object, DocumentConstructionContext>[]>`  
  Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

- `defineSchema(): { _id: DocumentIdField; _stats: DocumentStatsField; avatar: FilePathField; character: ForeignDocumentField; color: ColorField; flags: DocumentFlagsField; hotbar: ObjectField; name: StringField; password: StringField; passwordSalt: StringField; permissions: ObjectField; pronouns: StringField; role: NumberField; }`  
  Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

- `deleteDocuments(ids?: string[], operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>): Promise<Document<object, DocumentConstructionContext>[]>`  
  Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

- `fromJSON(json: string): DataModel<object, DataModelConstructionContext>`  
  Create a DataModel instance using a provided serialized JSON string.

- `fromSource(source: object, context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions): DataModel<object, DataModelConstructionContext>`  
  Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

- `get(documentId: string, operation?: DatabaseGetOperation): null | Document<object, DocumentConstructionContext>`  
  Get a World-level Document of this type by its id.

- `getCollectionName(name: string): null | string`  
  A compatibility method that returns the appropriate name of an embedded collection within this Document.

- `migrateData(source: object): object`  
  Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

- `migrateDataSafe(source: object): object`  
  Wrap data migration in a try/catch which attempts it safely.

- `shimData(data: object, options?: { embedded?: boolean }): object`  
  Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

- `updateDocuments(updates?: object[], operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>): Promise<Document<object, DocumentConstructionContext>[]>`  
  Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

- `validateJoint(data: object): void`  
  Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

- `_onCreateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseCreateOperation, user: BaseUser): Promise<void>`  
  Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

- `_onDeleteOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseDeleteOperation, user: BaseUser): Promise<void>`  
  Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

- `_onUpdateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseUpdateOperation, user: BaseUser): Promise<void>`  
  Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

- `_preCreateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseCreateOperation, user: BaseUser): Promise<boolean | void>`  
  Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

- `_preDeleteOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseDeleteOperation, user: BaseUser): Promise<boolean | void>`  
  Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

- `_preUpdateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseUpdateOperation, user: BaseUser): Promise<boolean | void>`  
  Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

---

*For full context and details, refer to the official [Foundry Virtual Tabletop API documentation](https://foundryvtt.com/api/classes/foundry.documents.User.html).*