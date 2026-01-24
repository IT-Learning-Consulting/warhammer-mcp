# Card

The client-side Card document which extends the common BaseCard document model.

Mixes:  
- ClientDocumentMixin

See also:  
- [foundry.documents.Cards: The Cards document type which contains Card embedded documents](https://foundryvtt.com/api/classes/foundry.documents.Cards.html)  
- [foundry.applications.sheets.CardConfig: The Card configuration application](https://foundryvtt.com/api/classes/foundry.applications.sheets.CardConfig.html)

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.Card), Expand):  
- `BaseCard<this>`  
- `Card`


---

## Constructors

```typescript
new Card(
    data?: Partial<import("https://foundryvtt.com/api/interfaces/foundry.documents.types.CardData.html").CardData>,
    options?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext,
): import("https://foundryvtt.com/api/modules/foundry.documents.html").documents.Card
```

**Parameters**

- **data** (Optional): `Partial<CardData>` = {}  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options** (Optional): `DocumentConstructionContext` = {}  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.Card`

Inherited from [BaseCard.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#constructor).

---

## Properties

### _source

```typescript
_source: import("https://foundryvtt.com/api/interfaces/foundry.documents.types.CardData.html").CardData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [BaseCard._source](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_source).

### parent

```typescript
parent: null | import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BaseCard.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#parent).

### DEFAULT_ICON (static)

```typescript
DEFAULT_ICON: string = "icons/svg/card-joker.svg"
```

The default icon used for a Card face that does not have a custom image set.

Inherited from [BaseCard.DEFAULT_ICON](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#default_icon).

### LOCALIZATION_PREFIXES (static)

```typescript
LOCALIZATION_PREFIXES: string[]
```

Inherited from [BaseCard.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#localization_prefixes).

### metadata (static)

```typescript
metadata: object
```

Default metadata which applies to each instance of this Document type.

Inherited from [BaseCard.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#metadata).

---

## Accessors

### currentFace

```typescript
get currentFace(): null | import("https://foundryvtt.com/api/interfaces/foundry.documents.types.CardFaceData.html").CardFaceData
```

The current card face.

**Returns**  
`null | CardFaceData`

### hasNextFace

```typescript
get hasNextFace(): boolean
```

Does this Card have a next face available to flip to?

**Returns**  
`boolean`

### hasPreviousFace

```typescript
get hasPreviousFace(): boolean
```

Does this Card have a previous face available to flip to?

**Returns**  
`boolean`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

Inherited from `ClientDocumentMixin(BaseCard).id`.

### img

```typescript
get img(): string
```

The image of the currently displayed card face or back.

**Returns**  
`string`

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseCard).inCompendium`.

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseCard).invalid`.

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseCard).isEmbedded`.

### isHome

```typescript
get isHome(): boolean
```

A convenience property for whether the Card is within its source Cards stack. Cards in decks are always considered home.

**Returns**  
`boolean`

### schema

```typescript
get schema(): import("https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html").SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from `ClientDocumentMixin(BaseCard).schema`.

### showFace

```typescript
get showFace(): boolean
```

Whether to display the face of this card?

**Returns**  
`boolean`

### source

```typescript
get source(): null | import("https://foundryvtt.com/api/modules/foundry.documents.html").documents.Cards
```

A reference to the source Cards document which defines this Card.

**Returns**  
`null | documents.Cards`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseCard).uuid`.

### validationFailures

```typescript
get validationFailures(): {
    fields: null | import("https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html").DataModelValidationFailure;
    joint: null | import("https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html").DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

**Returns**  
An object containing:

- `fields`: `null | DataModelValidationFailure`
- `joint`: `null | DataModelValidationFailure`

Inherited from `ClientDocumentMixin(BaseCard).validationFailures`.

### baseDocument (static)

```typescript
get baseDocument(): typeof import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from `ClientDocumentMixin(BaseCard).baseDocument`.

### collectionName (static)

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseCard).collectionName`.

### database (static)

```typescript
get database(): import("https://foundryvtt.com/api/modules/foundry.abstract.html").abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from `ClientDocumentMixin(BaseCard).database`.

### documentName (static)

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseCard).documentName`.

### hasTypeData (static)

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseCard).hasTypeData`.

### hierarchy (static)

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from `ClientDocumentMixin(BaseCard).hierarchy`.

### implementation (static)

```typescript
get implementation(): typeof import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from `ClientDocumentMixin(BaseCard).implementation`.

### schema (static)

```typescript
get schema(): import("https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html").SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

Inherited from `ClientDocumentMixin(BaseCard).schema`.

### TYPES (static)

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

Inherited from `ClientDocumentMixin(BaseCard).TYPES`.

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- `__namedParameters` (Optional): `{ pack?: null; parentCollection?: null }` = {}

**Returns**  
`void`

Inherited from [BaseCard._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_configure).

---

### canUserModify

```typescript
canUserModify(user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- `user`: `BaseUser`  
  The User attempting modification.

- `action`: `string`  
  The attempted action.

- `data` (Optional): `object` = {}  
  Data involved in the attempted action.

**Returns**  
`boolean`

Inherited from [BaseCard.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#canusermodify).

---

### clone

```typescript
clone(
    data?: object,
    context?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext & import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentCloneOptions.html").DocumentCloneOptions,
): import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext> | Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- `data` (Optional): `object` = {}  
  Additional data which overrides current document data at the time of creation.

- `context` (Optional): `DocumentConstructionContext & DocumentCloneOptions` = {}  
  Additional context options passed to the create method.

**Returns**  
The cloned Document instance. Either a Document or a Promise resolving to a Document.

Inherited from [BaseCard.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#clone).

---

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html").DatabaseCreateOperation,
): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

**Parameters**

- `embeddedName`: `string`  
  The name of the embedded Document type.

- `data` (Optional): `object[]` = []  
  An array of data objects used to create multiple documents.

- `operation` (Optional): `DatabaseCreateOperation` = {}  
  Parameters of the database creation workflow.

**Returns**  
A promise resolving to an array of created Document instances.

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseCard.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#createembeddeddocuments).

---

### delete

```typescript
delete(
    operation?: Partial<Omit<import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html").DatabaseDeleteOperation, "ids">>,
): Promise<undefined | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- `operation` (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = {}  
  Parameters of the deletion operation.

**Returns**  
A Promise resolving to the deleted Document instance, or undefined if not deleted.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseCard.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#delete).

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html").DatabaseDeleteOperation,
): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- `embeddedName`: `string`  
  The name of the embedded Document type.

- `ids`: `string[]`  
  An array of string ids for each Document to be deleted.

- `operation` (Optional): `DatabaseDeleteOperation` = {}  
  Parameters of the database deletion workflow.

**Returns**  
A Promise resolving to an array of deleted Document instances.

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseCard.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#deleteembeddeddocuments).

---

### discard

```typescript
discard(to: any, __namedParameters?: { updateData?: {} }): Promise<any>
```

**Parameters**

- `to`: `any`  
- `__namedParameters`: `{ updateData?: {} }` = {}

**Returns**  
`Promise<any>`

See also: [`Card#pass`](#pass)

---

### flip

```typescript
flip(face?: null | number): Promise<import("https://foundryvtt.com/api/modules/foundry.documents.html").documents.Card>
```

Flip this card to some other face. A specific face may be requested, otherwise: If the card currently displays a face the card is flipped to the back. If the card currently displays the back it is flipped to the first face.

**Parameters**

- `face` (Optional): `null | number`  
  A specific face to flip the card to.

**Returns**  
A Promise which resolves to a reference to this card after the flip operation is complete.

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- `embeddedName`: `string`  
  The name of the embedded Document type.

**Returns**  
The Collection instance of embedded Documents of the requested type.

Inherited from [BaseCard.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#getembeddeddocument).

---

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

**Parameters**

- `embeddedName`: `string`  
  The name of the embedded Document type.

- `id`: `string`  
  The id of the child document to retrieve.

- `options` (Optional): `{ invalid?: boolean; strict?: boolean }` = {}  
  Additional options which modify how embedded documents are retrieved.

  - `invalid` (Optional): `boolean`  
    Allow retrieving an invalid Embedded Document.

  - `strict` (Optional): `boolean`  
    Throw an Error if the requested id does not exist. See Collection#get.

**Returns**  
The retrieved embedded Document instance, or undefined.

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseCard.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#getembeddeddocument).

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- `scope`: `string`  
  The flag scope which namespaces the key.

- `key`: `string`  
  The flag key.

**Returns**  
The flag value.

Inherited from [BaseCard.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#getflag).

---

### getUserLevel

```typescript
getUserLevel(user?: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser): import("https://foundryvtt.com/api/types/CONST.DocumentOwnershipNumber.html").DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).

Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- `user` (Optional): `BaseUser`  
  The User being tested.

**Returns**  
A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).

Inherited from [BaseCard.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#getuserlevel).

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns**  
The migrated system data object.

Inherited from [BaseCard.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#migratesystemdata).

---

### pass

```typescript
pass(
    to: import("https://foundryvtt.com/api/modules/foundry.documents.html").documents.Cards,
    options?: { updateData?: object },
): Promise<import("https://foundryvtt.com/api/modules/foundry.documents.html").documents.Card>
```

Pass this Card to some other Cards document.

**Parameters**

- `to`: `documents.Cards`  
  A new Cards document this card should be passed to.

- `options` (Optional): `{ updateData?: object }` = {}  
  Options which modify the pass operation.

  - `updateData` (Optional): `object`  
    Modifications to make to the Card as part of the pass operation, for example the displayed face.

**Returns**  
A Promise resolving to a reference to this card after it has been passed to another parent document.

---

### play

```typescript
play(to: any, __namedParameters?: { updateData?: {} }): Promise<any>
```

**Parameters**

- `to`: `any`  
- `__namedParameters`: `{ updateData?: {} }` = {}

**Returns**  
`Promise<any>`

See also: [`Card#pass`](#pass)

---

### prepareDerivedData

```typescript
prepareDerivedData(): void
```

**Returns**  
`void`

---

### recall

```typescript
recall(options?: object): Promise<import("https://foundryvtt.com/api/modules/foundry.documents.html").documents.Card>
```

Recall this Card to its original Cards parent.

**Parameters**

- `options` (Optional): `object` = {}  
  Options which modify the recall operation.

**Returns**  
A Promise resolving to a reference to the recalled card belonging to its original parent.

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [BaseCard.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#reset).

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to `null` will delete that flag.

**Parameters**

- `scope`: `string`  
  The flag scope which namespaces the key.

- `key`: `string`  
  The flag key.

- `value`: `any`  
  The flag value.

**Returns**  
A Promise resolving to the updated document.

Inherited from [BaseCard.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#setflag).

---

### testUserPermission

```typescript
testUserPermission(
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
    permission: import("https://foundryvtt.com/api/types/CONST.DocumentOwnershipLevel.html").DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

**Parameters**

- `user`: `BaseUser`  
  The User being tested.

- `permission`: `DocumentOwnershipLevel`  
  The permission level from `DOCUMENT_OWNERSHIP_LEVELS` to test.

- `options`: `{ exact?: boolean }` = {}  
  Additional options involved in the permission test.

  - `exact` (Optional): `boolean`  
    Require the exact permission level requested?

**Returns**  
`boolean` — Does the user have this permission level over the Document?

Inherited from [BaseCard.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#testuserpermission).

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

Inherited from [BaseCard.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#tojson).

---

### toMessage

```typescript
toMessage(
    messageData?: object,
    options?: object,
): Promise<import("https://foundryvtt.com/api/modules/foundry.documents.html").documents.ChatMessage>
```

Create a chat message which displays this Card.

**Parameters**

- `messageData` (Optional): `object` = {}  
  Additional data which becomes part of the created ChatMessageData.

- `options` (Optional): `object` = {}  
  Options which modify the message creation operation.

**Returns**  
A Promise resolving to the created chat message.

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- `source`: `boolean` = true  
  Draw values from the underlying data source rather than transformed values.

**Returns**  
The extracted primitive object.

Inherited from [BaseCard.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#toobject).

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- `_parentPath` (Optional): `string`  
  A parent field path already traversed.

**Returns**  
A Generator which yields embedded documents.

Inherited from [BaseCard.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#traverseembeddeddocuments).

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- `scope`: `string`  
  The flag scope which namespaces the key.

- `key`: `string`  
  The flag key.

**Returns**  
A Promise resolving to the updated document instance.

Inherited from [BaseCard.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#unsetflag).

---

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html").DatabaseUpdateOperation, "updates">>,
): Promise<undefined | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- `data` (Optional): `object` = {}  
  Differential update data which modifies the existing values of this document.

- `operation` (Optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = {}  
  Parameters of the update operation.

**Returns**  
A Promise resolving to the updated Document instance, or undefined if not updated.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseCard.update](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#update).

---

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html").DatabaseUpdateOperation,
): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

**Parameters**

- `embeddedName`: `string`  
  The name of the embedded Document type.

- `updates` (Optional): `object[]` = []  
  An array of differential data objects, each used to update a single Document.

- `operation` (Optional): `DatabaseUpdateOperation` = {}  
  Parameters of the database update workflow.

**Returns**  
A Promise resolving to an array of updated Document instances.

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseCard.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#updateembeddeddocuments).

---

### updateSource

```typescript
updateSource(changes?: object, options?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelUpdateOptions.html").DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided `changes` argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- `changes` (Optional): `object` = {}  
  New values which should be applied to the data model.

- `options` (Optional): `DataModelUpdateOptions` = {}  
  Options which determine how the new data is merged.

**Returns**  
An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [BaseCard.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#updatesource).

---

### validate

```typescript
validate(options?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html").DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- `options` (Optional): `DataModelValidationOptions` = {}  
  Options which modify how the model is validated.

**Returns**  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseCard.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#validate).

---

### _initialize (protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- `options` (Optional): `object` = {}  
  Options provided to the model constructor.

**Returns**  
`void`

Inherited from [BaseCard._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_initialize).

---

### _initializeSource (protected)

```typescript
_initializeSource(
    data: object | import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- `data`: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed.

- `options` (Optional): `object` = {}  
  Options provided to the model constructor.

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [BaseCard._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_initializesource).

---

### _onCreate (protected)

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `data`: `object`  
  The initial data object provided to the document creation request.

- `options`: `object`  
  Additional options which modify the creation request.

- `userId`: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseCard._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_oncreate).

---

### _onDelete (protected)

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `options`: `object`  
  Additional options which modify the deletion request.

- `userId`: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseCard._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_ondelete).

---

### _onUpdate (protected)

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- `changed`: `object`  
  The differential data that was changed relative to the document's prior values.

- `options`: `object`  
  Additional options which modify the update request.

- `userId`: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseCard._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_onupdate).

---

### _preCreate (protected)

```typescript
_preCreate(
    data: object,
    options: object,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation. Modifications to the pending Document instance must be performed using [`updateSource`](#updateSource).

**Parameters**

- `data`: `object`  
  The initial data object provided to the document creation request.

- `options`: `object`  
  Additional options which modify the creation request.

- `user`: `BaseUser`  
  The User requesting the document creation.

**Returns**  
A Promise that resolves to `false` to exclude this Document from the creation operation, or `void`.

Inherited from [BaseCard._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_precreate).

---

### _preDelete (protected)

```typescript
_preDelete(options: object, user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- `options`: `object`  
  Additional options which modify the deletion request.

- `user`: `BaseUser`  
  The User requesting the document deletion.

**Returns**  
A Promise that resolves to `false` to cancel the deletion operation or `void`.

Inherited from [BaseCard._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_predelete).

---

### _preUpdate (protected)

```typescript
_preUpdate(
    changes: object,
    options: object,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- `changes`: `object`  
  The candidate changes to the Document.

- `options`: `object`  
  Additional options which modify the update request.

- `user`: `BaseUser`  
  The User requesting the document update.

**Returns**  
A Promise that resolves to `false` to cancel the update operation or `void`.

Inherited from [BaseCard._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_preupdate).

---

### _initializationOrder (static)

```typescript
_initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
A Generator yielding arrays of any.

Inherited from [BaseCard._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_initializationorder).

---

### canUserCreate (static)

```typescript
canUserCreate(user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- `user`: `BaseUser`  
  The User being tested.

**Returns**  
`boolean` - Does the User have a sufficient role to create?

Inherited from [BaseCard.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#canusercreate).

---

### cleanData (static)

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- `source` (Optional): `object` = {}  
  The source data object.

- `options` (Optional): `object` = {}  
  Additional options which are passed to field cleaning methods.

**Returns**  
The cleaned source data, which is the same object as the `source` argument.

Inherited from [BaseCard.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#cleandata).

---

### create (static)

```typescript
create(
    data?: object | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext> | (object | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>)[],
    operation?: Partial<Omit<import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html").DatabaseCreateOperation, "data">>,
): Promise<undefined | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext> | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[]>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- `data` (Optional):  
  - An object  
  - Or a Document instance  
  - Or an array of objects or Document instances

- `operation` (Optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = {}  
  Parameters of the creation operation.

**Returns**  
A Promise resolving to the created Document instance(s) or undefined.

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const createdOwned = await Item.implementation.create(data, {parent: actor});

const createdInPack = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseCard.create](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#create).

---

### createDocuments (static)

```typescript
createDocuments(
    data?: (object | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>)[],
    operation?: Partial<Omit<import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html").DatabaseCreateOperation, "data">>,
): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- `data` (Optional): An array of data objects or existing Documents to persist.

- `operation` (Optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = {}  
  Parameters of the requested creation operation.

**Returns**  
A Promise resolving to an array of created Document instances.

**Examples**

```typescript
const dataSingle = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const createdSingle = await Actor.implementation.createDocuments(dataSingle);

const dataMultiple = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const createdMultiple = await Actor.implementation.createDocuments(dataMultiple);

const actor = game.actors.getName("Tim");
const dataOwned = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const createdOwned = await Item.implementation.createDocuments(dataOwned, {parent: actor});

const dataInPack = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const createdInPack = await Actor.implementation.createDocuments(dataInPack, {pack: "mymodule.mypack"});
```

Inherited from [BaseCard.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#createdocuments).

---

### defineSchema (static)

```typescript
defineSchema(): {
    _id: import("https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html").DocumentIdField;
    _stats: import("https://foundryvtt.com/api/classes/foundry.data.fields.DocumentStatsField.html").DocumentStatsField;
    back: import("https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html").SchemaField;
    description: import("https://foundryvtt.com/api/classes/foundry.data.fields.HTMLField.html").HTMLField;
    drawn: import("https://foundryvtt.com/api/classes/foundry.data.fields.BooleanField.html").BooleanField;
    face: import("https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html").NumberField;
    faces: import("https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html").ArrayField<import("https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html").SchemaField>;
    flags: import("https://foundryvtt.com/api/classes/foundry.data.fields.DocumentFlagsField.html").DocumentFlagsField;
    height: import("https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html").NumberField;
    name: import("https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html").StringField;
    origin: import("https://foundryvtt.com/api/classes/foundry.data.fields.ForeignDocumentField.html").ForeignDocumentField;
    rotation: import("https://foundryvtt.com/api/classes/foundry.data.fields.AngleField.html").AngleField;
    sort: import("https://foundryvtt.com/api/classes/foundry.data.fields.IntegerSortField.html").IntegerSortField;
    suit: import("https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html").StringField;
    system: import("https://foundryvtt.com/api/classes/foundry.data.fields.TypeDataField.html").TypeDataField;
    type: import("https://foundryvtt.com/api/classes/foundry.data.fields.DocumentTypeField.html").DocumentTypeField;
    value: import("https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html").NumberField;
    width: import("https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html").NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
A schema object describing fields.

Inherited from [BaseCard.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#defineschema).

---

### deleteDocuments (static)

```typescript
deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html").DatabaseDeleteOperation, "ids">>,
): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- `ids` (Optional): `string[]` = []  
  An array of string ids for the documents to be deleted.

- `operation` (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = {}  
  Parameters of the database deletion operation.

**Returns**  
A Promise resolving to an array of deleted Document instances.

**Examples**

```typescript
const tim = game.actors.getName("Tim");
const deletedSingle = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedEmbedded = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actor = await pack.getDocument(documentId);
const deletedInPack = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from [BaseCard.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#deletedocuments).

---

### fromJSON (static)

```typescript
fromJSON(json: string): import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- `json`: `string`  
  Serialized document data in string format.

**Returns**  
A constructed data model instance.

Inherited from [BaseCard.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#fromjson).

---

### fromSource (static)

```typescript
fromSource(
    source: object,
    context?: Omit<import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext, "strict"> &
        import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelFromSourceOptions.html").DataModelFromSourceOptions,
): import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- `source`: `object`  
  Initial document data which comes from a trusted source.

- `context` (Optional): `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = {}  
  Model construction context.

**Returns**  
A data model instance.

Inherited from [BaseCard.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#fromsource).

---

### get (static)

```typescript
get(
    documentId: string,
    operation?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseGetOperation.html").DatabaseGetOperation,
): null | import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- `documentId`: `string`  
  The Document ID.

- `operation` (Optional): `DatabaseGetOperation` = {}  
  Parameters of the get operation.

**Returns**  
The retrieved Document, or null.

Inherited from [BaseCard.get](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#get).

---

### getCollectionName (static)

```typescript
getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- `name`: `string`  
  An existing collection name or a document name.

**Returns**  
The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [BaseCard.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#getcollectionname).

---

### migrateData (static)

```typescript
migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- `source`: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseCard.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#migratedata).

---

### migrateDataSafe (static)

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- `source`: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseCard.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#migratedatasafe).

---

### shimData (static)

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- `data`: `object`  
  Data which matches the current schema.

- `options` (Optional): `{ embedded?: boolean }` = {}  
  Additional shimming options.

  - `embedded` (Optional): `boolean`  
    Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [BaseCard.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#shimdata).

---

### updateDocuments (static)

```typescript
updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html").DatabaseUpdateOperation, "updates">>,
): Promise<import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- `updates` (Optional): `object[]` = []  
  An array of differential data objects, each used to update a single Document.

- `operation` (Optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = {}  
  Parameters of the database update operation.

**Returns**  
A Promise resolving to an array of updated Document instances.

**Examples**

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const updatesMultiple = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updatedMultiple = await Actor.implementation.updateDocuments(updatesMultiple);

const actor = game.actors.getName("Timothy");
const updatesOwned = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updatedOwned = await Item.implementation.updateDocuments(updatesOwned, {parent: actor});

const actor = await pack.getDocument(documentId);
const updatedInPack = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [BaseCard.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#updatedocuments).

---

### validateJoint (static)

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- `data`: `object`  
  Candidate data for the model.

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from [BaseCard.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#validatejoint).

---

### _onCreateOperation (protected static)

```typescript
_onCreateOperation(
    documents: import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[],
    operation: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html").DatabaseCreateOperation,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters**

- `documents`: array of Document instances which were created.
- `operation`: Parameters of the database creation operation.
- `user`: The User who performed the creation operation.

**Returns**  
A Promise resolving to void.

Inherited from [BaseCard._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_oncreateoperation).

---

### _onDeleteOperation (protected static)

```typescript
_onDeleteOperation(
    documents: import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[],
    operation: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html").DatabaseDeleteOperation,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters**

- `documents`: array of Document instances which were deleted.
- `operation`: Parameters of the database deletion operation.
- `user`: The User who performed the deletion operation.

**Returns**  
A Promise resolving to void.

Inherited from [BaseCard._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_ondeleteoperation).

---

### _onUpdateOperation (protected static)

```typescript
_onUpdateOperation(
    documents: import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[],
    operation: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html").DatabaseUpdateOperation,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters**

- `documents`: array of Document instances which were updated.
- `operation`: Parameters of the database update operation.
- `user`: The User who performed the update operation.

**Returns**  
A Promise resolving to void.

Inherited from [BaseCard._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_onupdateoperation).

---

### _preCreateOperation (protected static)

```typescript
_preCreateOperation(
    documents: import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[],
    operation: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html").DatabaseCreateOperation,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [`updateSource`](#updateSource).

**Parameters**

- `documents`: Pending document instances to be created.
- `operation`: Parameters of the database creation operation.
- `user`: The User requesting the creation operation.

**Returns**  
A Promise that resolves to `false` to cancel the creation operation entirely or `void`.

Inherited from [BaseCard._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_precreateoperation).

---

### _preDeleteOperation (protected static)

```typescript
_preDeleteOperation(
    documents: import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[],
    operation: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseDeleteOperation.html").DatabaseDeleteOperation,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or using [`updateSource`](#updateSource).

**Parameters**

- `documents`: Document instances to be deleted.
- `operation`: Parameters of the database update operation.
- `user`: The User requesting the deletion operation.

**Returns**  
A Promise that resolves to `false` to cancel the deletion operation entirely or `void`.

Inherited from [BaseCard._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_predeleteoperation).

---

### _preUpdateOperation (protected static)

```typescript
_preUpdateOperation(
    documents: import("https://foundryvtt.com/api/classes/foundry.abstract.Document.html").Document<object, import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html").DocumentConstructionContext>[],
    operation: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html").DatabaseUpdateOperation,
    user: import("https://foundryvtt.com/api/classes/foundry.documents.BaseUser.html").BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- `documents`: Document instances to be updated.
- `operation`: Parameters of the database update operation.
- `user`: The User requesting the update operation.

**Returns**  
A Promise that resolves to `false` to cancel the update operation entirely or `void`.

Inherited from [BaseCard._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCard.html#_preupdateoperation).