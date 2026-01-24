# ChatMessage | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side `ChatMessage` document which extends the common `BaseChatMessage` model.

---

## Hook Events

- [hookEvents.renderChatMessageHTML](https://foundryvtt.com/api/functions/hookEvents.renderChatMessageHTML.html)

## Mixes

- ClientDocumentMixin

## See Also

- [foundry.documents.collections.ChatMessages: The world-level collection of ChatMessage documents](https://foundryvtt.com/api/classes/foundry.documents.collections.ChatMessages.html)

## Hierarchy

- [BaseChatMessage](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html)<this>
- **ChatMessage**

---

## Constructors

```typescript
new ChatMessage(
    data?: Partial<ChatMessageData>,
    options?: DocumentConstructionContext,
): documents.ChatMessage
```

**Parameters**

- **data**: `Partial<ChatMessageData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.ChatMessage`

*Inherited from [BaseChatMessage.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#constructor)*

---

## Properties

### `_source`

```typescript
_source: ChatMessageData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

*Inherited from [BaseChatMessage._source](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_source)*

---

## Accessors

### `alias`

```typescript
get alias(): string
```

Return the recommended String alias for this message. The alias could be a Token name in the case of in-character messages or dice rolls. Alternatively, it could be the name of a User in the case of OOC chat or whispers.

**Returns**  
`string`

---

### `id`

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null` | `string`

*Inherited from ClientDocumentMixin(BaseChatMessage).id*

---

### `inCompendium`

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseChatMessage).inCompendium*

---

### `invalid`

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseChatMessage).invalid*

---

### `isAuthor`

```typescript
get isAuthor(): boolean
```

Is the current User the author of this message?

**Returns**  
`boolean`

---

### `isContentVisible`

```typescript
get isContentVisible(): boolean
```

Return whether the content of the message is visible to the current user. For certain dice rolls, for example, the message itself may be visible while the content of that message is not.

**Returns**  
`boolean`

---

### `isEmbedded`

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseChatMessage).isEmbedded*

---

### `isRoll`

```typescript
get isRoll(): boolean
```

Does this message contain dice rolls?

**Returns**  
`boolean`

---

### `schema`

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

*Inherited from ClientDocumentMixin(BaseChatMessage).schema*

---

### `speakerActor`

```typescript
get speakerActor(): null | documents.Actor
```

The Actor which represents the speaker of this message (if any).

**Returns**  
`null` | `documents.Actor`

---

### `uuid`

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

*Inherited from ClientDocumentMixin(BaseChatMessage).uuid*

---

### `validationFailures`

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

*Inherited from ClientDocumentMixin(BaseChatMessage).validationFailures*

---

### `visible`

```typescript
get visible(): boolean
```

Return whether the ChatMessage is visible to the current User. Messages may not be visible if they are private whispers.

**Returns**  
`boolean`

---

## Static Properties

### `baseDocument`

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

*Inherited from ClientDocumentMixin(BaseChatMessage).baseDocument*

---

### `collectionName`

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

*Inherited from ClientDocumentMixin(BaseChatMessage).collectionName*

---

### `database`

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

*Inherited from ClientDocumentMixin(BaseChatMessage).database*

---

### `documentName`

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

*Inherited from ClientDocumentMixin(BaseChatMessage).documentName*

---

### `hasTypeData`

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseChatMessage).hasTypeData*

---

### `hierarchy`

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

*Inherited from ClientDocumentMixin(BaseChatMessage).hierarchy*

---

### `implementation`

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

*Inherited from ClientDocumentMixin(BaseChatMessage).implementation*

---

### `schema`

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

*Inherited from ClientDocumentMixin(BaseChatMessage).schema*

---

### `TYPES`

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

*Inherited from ClientDocumentMixin(BaseChatMessage).TYPES*

---

## Methods

### `_configure`

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- `__namedParameters`: `{ pack?: null; parentCollection?: null } = {}`

**Returns**  
`void`

*Inherited from [BaseChatMessage._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_configure)*

---

### `_onCreate`

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `data`: `any` — The initial data object provided to the document creation request
- `options`: `any` — Additional options which modify the creation request
- `userId`: `any` — The id of the User requesting the document update

**Returns**  
`void`

Overrides [BaseChatMessage._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_oncreate)

---

### `_onDelete`

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `options`: `any` — Additional options which modify the deletion request
- `userId`: `any` — The id of the User requesting the document update

**Returns**  
`void`

Overrides [BaseChatMessage._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_ondelete)

---

### `_onUpdate`

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `changed`: `any` — The differential data that was changed relative to the documents prior values
- `options`: `any` — Additional options which modify the update request
- `userId`: `any` — The id of the User requesting the document update

**Returns**  
`void`

Overrides [BaseChatMessage._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_onupdate)

---

### `_preCreate`

```typescript
_preCreate(data: any, options: any, user: any): Promise<undefined | false>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation. Modifications to the pending Document instance must be performed using [updateSource](#updateSource).

**Parameters**

- `data`: `any` — The initial data object provided to the document creation request
- `options`: `any` — Additional options which modify the creation request
- `user`: `any` — The User requesting the document creation

**Returns**  
`Promise<undefined | false>`  
Return false to exclude this Document from the creation operation

Overrides [BaseChatMessage._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_precreate)

---

### `applyRollMode`

```typescript
applyRollMode(
    rollMode: "publicroll" | "gmroll" | "blindroll" | "selfroll" | "roll",
): void
```

Update the data of a ChatMessage instance to apply a requested roll mode. This function calls [ChatMessage.applyRollMode](#static-applyRollMode) and updates the source of the ChatMessage.

**Parameters**

- `rollMode`: `"publicroll" | "gmroll" | "blindroll" | "selfroll" | "roll"`  
  The roll mode to apply to this message data. `"roll"` is the current roll mode.

**Returns**  
`void`

---

### `canUserModify`

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- `user`: `BaseUser` — The User attempting modification
- `action`: `string` — The attempted action
- `data`: `object` = `{}` (Optional) — Data involved in the attempted action

**Returns**  
`boolean` — Does the User have permission?

*Inherited from [BaseChatMessage.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#canusermodify)*

---

### `clone`

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- `data`: `object` = `{}` (Optional) — Additional data which overrides current document data at the time of creation
- `context`: `DocumentConstructionContext & DocumentCloneOptions` = `{}` (Optional) — Additional context options passed to the create method

**Returns**  
The cloned Document instance.

*Inherited from [BaseChatMessage.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#clone)*

---

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

- `embeddedName`: `string` — The name of the embedded Document type
- `data`: `object[]` = `[]` — An array of data objects used to create multiple documents
- `operation`: `DatabaseCreateOperation` = `{}` (Optional) — Parameters of the database creation workflow

**Returns**  
`Promise` resolving to an array of created Document instances.

**See Also**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

*Inherited from [BaseChatMessage.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#createembeddeddocuments)*

---

### `delete`

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- `operation`: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` (Optional) — Parameters of the deletion operation

**Returns**  
`Promise` resolving to the deleted Document instance, or `undefined` if not deleted.

**See Also**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [BaseChatMessage.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#delete)*

---

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

- `embeddedName`: `string` — The name of the embedded Document type
- `ids`: `string[]` — An array of string ids for each Document to be deleted
- `operation`: `DatabaseDeleteOperation` = `{}` (Optional) — Parameters of the database deletion workflow

**Returns**  
`Promise` resolving to an array of deleted Document instances.

**See Also**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [BaseChatMessage.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#deleteembeddeddocuments)*

---

### `export`

```typescript
export(): string
```

Export the content of the chat message into a standardized log format.

**Returns**  
`string`

---

### `getEmbeddedCollection`

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- `embeddedName`: `string` — The name of the embedded Document type

**Returns**  
The Collection instance of embedded Documents of the requested type.

*Inherited from [BaseChatMessage.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#getembeddedcollection)*

---

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

- `embeddedName`: `string` — The name of the embedded Document type
- `id`: `string` — The id of the child document to retrieve
- `options`: `{ invalid?: boolean; strict?: boolean } = {}` (Optional) — Additional options which modify how embedded documents are retrieved  
  - `invalid?`: `boolean` — Allow retrieving an invalid Embedded Document.  
  - `strict?`: `boolean` — Throw an Error if the requested id does not exist. See Collection#get

**Returns**  
The retrieved embedded Document instance, or `undefined`.

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

*Inherited from [BaseChatMessage.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#getembeddeddocument)*

---

### `getFlag`

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- `scope`: `string` — The flag scope which namespaces the key
- `key`: `string` — The flag key

**Returns**  
The flag value.

*Inherited from [BaseChatMessage.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#getflag)*

---

### `getRollData`

```typescript
getRollData(): object
```

Obtain a data object used to evaluate any dice rolls associated with this particular chat message.

**Returns**  
`object`

---

### `getUserLevel`

```typescript
getUserLevel(user: any): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- `user`: `any` — The User being tested.

**Returns**  
`DocumentOwnershipNumber`

*Inherited from [BaseChatMessage.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#getuserlevel)*

---

### `migrateSystemData`

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
The migrated system data object.

*Inherited from [BaseChatMessage.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#migratesystemdata)*

---

### `prepareDerivedData`

```typescript
prepareDerivedData(): void
```

**Returns**  
`void`

---

### `renderHTML`

```typescript
renderHTML(
    options?: { canClose?: boolean; canDelete?: boolean },
): Promise<HTMLElement>
```

Render the HTML for the ChatMessage which should be added to the log.

**Parameters**

- `options`: `{ canClose?: boolean; canDelete?: boolean } = {}` (Optional) — Additional options passed to the Handlebars template.  
  - `canClose?`: `boolean` — Render a close button for dismissing chat card notifications.  
  - `canDelete?`: `boolean` — Render a delete button. By default, this is true for GM users.

**Returns**  
`Promise<HTMLElement>`

---

### `reset`

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

*Inherited from [BaseChatMessage.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#reset)*

---

### `setFlag`

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- `scope`: `string` — The flag scope which namespaces the key
- `key`: `string` — The flag key
- `value`: `any` — The flag value

**Returns**  
`Promise<Document>`

*Inherited from [BaseChatMessage.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#setflag)*

---

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

- `user`: `BaseUser` — The User being tested
- `permission`: `DocumentOwnershipLevel` — The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
- `options`: `{ exact?: boolean } = {}` (Optional) — Additional options involved in the permission test  
  - `exact?`: `boolean` — Require the exact permission level requested?

**Returns**  
`boolean`

*Inherited from [BaseChatMessage.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#testuserpermission)*

---

### `toJSON`

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

*Inherited from [BaseChatMessage.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#tojson)*

---

### `toObject`

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- `source`: `boolean` = `true` — Draw values from the underlying data source rather than transformed values

**Returns**  
The extracted primitive object.

*Inherited from [BaseChatMessage.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#toobject)*

---

### `traverseEmbeddedDocuments`

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- `_parentPath`: `string` (Optional) — A parent field path already traversed

**Returns**  
`Generator`

*Inherited from [BaseChatMessage.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#traverseembeddeddocuments)*

---

### `unsetFlag`

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- `scope`: `string` — The flag scope which namespaces the key
- `key`: `string` — The flag key

**Returns**  
`Promise<Document>`

*Inherited from [BaseChatMessage.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#unsetflag)*

---

### `update`

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- `data`: `object` = `{}` (Optional) — Differential update data which modifies the existing values of this document
- `operation`: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` (Optional) — Parameters of the update operation

**Returns**  
The updated Document instance, or `undefined` if not updated.

**See Also**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [BaseChatMessage.update](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#update)*

---

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

- `embeddedName`: `string` — The name of the embedded Document type
- `updates`: `object[]` = `[]` — An array of differential data objects, each used to update a single Document
- `operation`: `DatabaseUpdateOperation` = `{}` (Optional) — Parameters of the database update workflow

**Returns**  
`Promise` resolving to an array of updated Document instances.

**See Also**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [BaseChatMessage.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#updateembeddeddocuments)*

---

### `updateSource`

```typescript
updateSource(
    changes?: object,
    options?: DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- `changes`: `object` = `{}` — New values which should be applied to the data model
- `options`: `DataModelUpdateOptions` = `{}` — Options which determine how the new data is merged

**Returns**  
An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid.

*Inherited from [BaseChatMessage.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#updatesource)*

---

### `validate`

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- `options`: `DataModelValidationOptions` = `{}` — Options which modify how the model is validated

**Returns**  
`boolean` — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

*Inherited from [BaseChatMessage.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#validate)*

---

### `_initialize`

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- `options`: `object` = `{}` (Optional) — Options provided to the model constructor

**Returns**  
`void`

*Inherited from [BaseChatMessage._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_initialize)*

---

### `_initializeSource`

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- `data`: `object | DataModel<object, DataModelConstructionContext>` — The candidate source data from which the model will be constructed
- `options`: `object` = `{}` (Optional) — Options provided to the model constructor

**Returns**  
The migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

*Inherited from [BaseChatMessage._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_initializesource)*

---

### `_preDelete`

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- `options`: `object` — Additional options which modify the deletion request
- `user`: `BaseUser` — The User requesting the document deletion

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

*Inherited from [BaseChatMessage._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_predelete)*

---

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

- `changes`: `object` — The candidate changes to the Document
- `options`: `object` — Additional options which modify the update request
- `user`: `BaseUser` — The User requesting the document update

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

*Inherited from [BaseChatMessage._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_preupdate)*

---

### `_initializationOrder`

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

*Inherited from [BaseChatMessage._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_initializationorder)*

---

### `applyRollMode` (static)

```typescript
static applyRollMode(
    chatData: object,
    rollMode: "publicroll" | "gmroll" | "blindroll" | "selfroll" | "roll",
): object
```

Transform a provided object of ChatMessage data by applying a certain roll mode to the data object.

- Public: `whisper` is set to `[]` and `blind` is set to `false`.
- Self: `whisper` is set to `[game.user.id]` and `blind` is set to `false`.
- Private: `whisper` is set to the GM users unless `whisper` is nonempty and `blind` is set to false.
- Blind: `whisper` is set to the GM users unless `whisper` is nonempty and `blind` is set to true.

**Parameters**

- `chatData`: `object` — The object of ChatMessage data
- `rollMode`: `"publicroll" | "gmroll" | "blindroll" | "selfroll" | "roll"` — The roll mode to apply to this message data. `"roll"` is the current roll mode.

**Returns**  
The modified ChatMessage data with the roll mode applied.

---

### `canUserCreate` (static)

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- `user`: `BaseUser` — The User being tested

**Returns**  
`boolean` — Does the User have a sufficient role to create?

*Inherited from [BaseChatMessage.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#canusercreate)*

---

### `cleanData` (static)

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- `source`: `object` = `{}` (Optional) — The source data object
- `options`: `object` = `{}` (Optional) — Additional options which are passed to field cleaning methods

**Returns**  
The cleaned source data, which is the same object as the `source` argument.

*Inherited from [BaseChatMessage.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#cleandata)*

---

### `create` (static)

```typescript
static create(
    data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- `data`: `object | Document | Array<object | Document>` (Optional) — Initial data used to create this Document, or a Document instance to persist.
- `operation`: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` (Optional) — Parameters of the creation operation

**Returns**  
The created Document instance(s).

**See Also**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});

const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

*Inherited from [BaseChatMessage.create](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#create)*

---

### `createDocuments` (static)

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- `data`: `Array<object | Document>` = `[]` (Optional) — An array of data objects or existing Documents to persist.
- `operation`: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` (Optional) — Parameters of the requested creation operation

**Returns**  
An array of created Document instances.

**Examples**

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

*Inherited from [BaseChatMessage.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#createdocuments)*

---

### `defineSchema` (static)

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    author: DocumentAuthorField;
    blind: BooleanField;
    content: HTMLField;
    emote: BooleanField;
    flags: DocumentFlagsField;
    flavor: HTMLField;
    rolls: ArrayField<JSONField>;
    sound: FilePathField;
    speaker: SchemaField;
    style: NumberField;
    system: TypeDataField;
    timestamp: NumberField;
    title: StringField;
    type: DocumentTypeField;
    whisper: ArrayField<ForeignDocumentField>;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

*Inherited from [BaseChatMessage.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#defineschema)*

---

### `deleteDocuments` (static)

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- `ids`: `string[]` = `[]` (Optional) — An array of string ids for the documents to be deleted
- `operation`: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` (Optional) — Parameters of the database deletion operation

**Returns**  
An array of deleted Document instances.

**Examples**

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

*Inherited from [BaseChatMessage.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#deletedocuments)*

---

### `fromJSON` (static)

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- `json`: `string` — Serialized document data in string format

**Returns**  
A constructed data model instance.

*Inherited from [BaseChatMessage.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#fromjson)*

---

### `fromSource` (static)

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- `source`: `object` — Initial document data which comes from a trusted source.
- `context`: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` (Optional) — Model construction context

**Returns**  
A constructed data model instance.

*Inherited from [BaseChatMessage.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#fromsource)*

---

### `get` (static)

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- `documentId`: `string` — The Document ID
- `operation`: `DatabaseGetOperation` = `{}` (Optional) — Parameters of the get operation

**Returns**  
The retrieved Document, or `null`.

*Inherited from [BaseChatMessage.get](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#get)*

---

### `getCollectionName` (static)

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- `name`: `string` — An existing collection name or a document name.

**Returns**  
The provided collection name if it exists, the first available collection for the document name provided, or `null` if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
Actor.implementation.getCollectionName("Item");  // returns "items"
```

*Inherited from [BaseChatMessage.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#getcollectionname)*

---

### `getSpeaker` (static)

```typescript
static getSpeaker(
    options?: {
        actor?: documents.Actor;
        alias?: string;
        scene?: documents.Scene;
        token?: TokenDocument;
    },
): ChatSpeakerData
```

Attempt to determine who is the speaking character (and token) for a certain Chat Message. First assume that the currently controlled Token is the speaker.

**Parameters**

- `options`: (Optional) Options which affect speaker identification:  
  - `actor?`: `documents.Actor` — The Actor who is speaking  
  - `alias?`: `string` — The name of the speaker to display  
  - `scene?`: `documents.Scene` — The Scene in which the speaker resides  
  - `token?`: `TokenDocument` — The Token who is speaking

**Returns**  
`ChatSpeakerData` — The identified speaker data

---

### `getSpeakerActor` (static)

```typescript
static getSpeakerActor(speaker: Object): null | documents.Actor
```

Obtain an Actor instance which represents the speaker of this message (if any).

**Parameters**

- `speaker`: `Object` — The speaker data object

**Returns**  
`null` | `documents.Actor`

---

### `getWhisperRecipients` (static)

```typescript
static getWhisperRecipients(name: string): documents.User[]
```

Given a string whisper target, return an Array of the user IDs which should be targeted for the whisper.

**Parameters**

- `name`: `string` — The target name of the whisper target

**Returns**  
An array of User instances.

---

### `migrateData` (static)

```typescript
static migrateData(data: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- `data`: `any` — The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

*Inherited from [BaseChatMessage.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#migratedata)*

---

### `migrateDataSafe` (static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- `source`: `object` — The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

*Inherited from [BaseChatMessage.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#migratedatasafe)*

---

### `shimData` (static)

```typescript
static shimData(data: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- `data`: `any` — Data which matches the current schema
- `options`: `any` — Additional shimming options

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

*Inherited from [BaseChatMessage.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#shimdata)*

---

### `updateDocuments` (static)

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- `updates`: `object[]` = `[]` (Optional) — An array of differential data objects, each used to update a single Document
- `operation`: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` (Optional) — Parameters of the database update operation

**Returns**  
An array of updated Document instances.

**Examples**

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

// Update Documents within a Compendium pack
const actor = await pack.getDocument(documentId);
const updates = [{_id: actor.id, name: "New Name"}];
const updated = await Actor.implementation.updateDocuments(updates, {pack: "mymodule.mypack"});
```

*Inherited from [BaseChatMessage.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#updatedocuments)*

---

### `validateJoint` (static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- `data`: `object` — Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

*Inherited from [BaseChatMessage.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#validatejoint)*

---

### `_onCreateOperation` (protected static)

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

- `documents`: Array of Document instances which were created
- `operation`: Parameters of the database creation operation
- `user`: The User who performed the creation operation

**Returns**  
`Promise<void>`

*Inherited from [BaseChatMessage._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_oncreateoperation)*

---

### `_onDeleteOperation` (protected static)

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

- `documents`: Array of Document instances which were deleted
- `operation`: Parameters of the database deletion operation
- `user`: The User who performed the deletion operation

**Returns**  
`Promise<void>`

*Inherited from [BaseChatMessage._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_ondeleteoperation)*

---

### `_onUpdateOperation` (protected static)

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

- `documents`: Array of Document instances which were updated
- `operation`: Parameters of the database update operation
- `user`: The User who performed the update operation

**Returns**  
`Promise<void>`

*Inherited from [BaseChatMessage._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_onupdateoperation)*

---

### `_preCreateOperation` (protected static)

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

- `documents`: Pending document instances to be created
- `operation`: Parameters of the database creation operation
- `user`: The User requesting the creation operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the creation operation entirely.

*Inherited from [BaseChatMessage._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_precreateoperation)*

---

### `_preDeleteOperation` (protected static)

```typescript
static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object using `updateSource`.

**Parameters**

- `documents`: Document instances to be deleted
- `operation`: Parameters of the database update operation
- `user`: The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the deletion operation entirely.

*Inherited from [BaseChatMessage._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_predeleteoperation)*

---

### `_preUpdateOperation` (protected static)

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

- `documents`: Document instances to be updated
- `operation`: Parameters of the database update operation
- `user`: The User requesting the update operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the update operation entirely.

*Inherited from [BaseChatMessage._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseChatMessage.html#_preupdateoperation)*

---

# See also:

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)