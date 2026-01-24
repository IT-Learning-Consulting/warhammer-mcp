# Cards | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side **Cards** document which extends the common **BaseCards** model. Each Cards document contains **CardsData** which defines its data schema.

---

## Hook Events

- [hookEvents.dealCards](https://foundryvtt.com/api/functions/hookEvents.dealCards.html)
- [hookEvents.passCards](https://foundryvtt.com/api/functions/hookEvents.passCards.html)
- [hookEvents.returnCards](https://foundryvtt.com/api/functions/hookEvents.returnCards.html)

## Mixes

- ClientDocumentMixin

## See also

- [foundry.documents.collections.CardStacks: The world-level collection of Cards documents](https://foundryvtt.com/api/classes/foundry.documents.collections.CardStacks.html)
- [foundry.applications.sheets.CardsConfig: The Cards configuration application](https://foundryvtt.com/api/classes/foundry.applications.sheets.CardsConfig.html)

## Hierarchy

- [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.Cards)

```
BaseCards<this>
Cards
```

---

# Class: Cards

---

## Constructors

```typescript
new Cards(
    data?: Partial<CardsData>,
    options?: DocumentConstructionContext,
): documents.Cards
```

**Parameters**

- Optional  
  **data**: `Partial<CardsData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
- Optional  
  **options**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.Cards`

_Inherited from [BaseCards.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#constructor)_

---

## Properties

### \_source

```typescript
_source: CardsData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

_Inherited from [BaseCards._source](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_source)_

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

_Inherited from [BaseCards.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#parent)_

### DEFAULT_ICON

```typescript
DEFAULT_ICON: string = "icons/svg/card-hand.svg"
```

The default icon used for a cards stack that does not have a custom image set.

_Inherited from [BaseCards.DEFAULT_ICON](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#default_icon)_

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[]
```

_Inherited from [BaseCards.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#localization_prefixes)_

### metadata

```typescript
metadata: object
```

Default metadata which applies to each instance of this Document type.

_Inherited from [BaseCards.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#metadata)_

---

## Accessors

### availableCards

```typescript
get availableCards(): documents.Card[]
```

The Card documents within this stack which are available to be drawn.

**Returns**  
`documents.Card[]`

### canClone

```typescript
get canClone(): boolean
```

Can this Cards document be cloned in a duplicate workflow?

**Returns**  
`boolean`

### drawnCards

```typescript
get drawnCards(): documents.Card[]
```

The Card documents which belong to this stack but have already been drawn.

**Returns**  
`documents.Card[]`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

_Inherited from ClientDocumentMixin(BaseCards).id_

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseCards).inCompendium_

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseCards).invalid_

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseCards).isEmbedded_

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

_Inherited from ClientDocumentMixin(BaseCards).schema_

### thumbnail

```typescript
get thumbnail(): string
```

Provide a thumbnail image path used to represent this document.

**Returns**  
`string`

### typeLabel

```typescript
get typeLabel(): string
```

Returns the localized Label for the type of Card Stack this is.

**Returns**  
`string`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseCards).uuid_

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

_Inherited from ClientDocumentMixin(BaseCards).validationFailures_

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

_Inherited from ClientDocumentMixin(BaseCards).baseDocument_

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseCards).collectionName_

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

_Inherited from ClientDocumentMixin(BaseCards).database_

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseCards).documentName_

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseCards).hasTypeData_

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

_Inherited from ClientDocumentMixin(BaseCards).hierarchy_

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

_Inherited from ClientDocumentMixin(BaseCards).implementation_

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

_Inherited from ClientDocumentMixin(BaseCards).TYPES_

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- __namedParameters: `{ pack?: null; parentCollection?: null } = {}`

**Returns**  
`void`

_Inherited from [BaseCards._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_configure)_

---

### _initialize

```typescript
_initialize(options: any): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- options: `any`  
  Options provided to the model constructor

**Returns**  
`void`

_Inherited from [BaseCards._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_initialize)_

---

### _preCreate

```typescript
_preCreate(data: any, options: any, user: any): Promise<undefined | false>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [updateSource](#updatesource).

**Parameters**

- data: `any` - The initial data object provided to the document creation request
- options: `any` - Additional options which modify the creation request
- user: `any` - The User requesting the document creation

**Returns**  
`Promise<undefined | false>`  
Return false to exclude this Document from the creation operation

Overrides [BaseCards._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_preCreate)

---

### _preDelete

```typescript
_preDelete(options: any, user: any): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- options: `any` - Additional options which modify the deletion request
- user: `any` - The User requesting the document deletion

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

Overrides [BaseCards._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_preDelete)

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- user: `BaseUser` - The User attempting modification
- action: `string` - The attempted action
- Optional  
  data: `object` = `{}` - Data involved in the attempted action

**Returns**  
`boolean`  
Does the User have permission?

Inherited from [BaseCards.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#canUserModify)

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

- Optional  
  data: `object` = `{}` - Additional data which overrides current document data at the time of creation
- Optional  
  context: `DocumentConstructionContext & DocumentCloneOptions` = `{}` - Additional context options passed to the create method

**Returns**  
- `Document<object, DocumentConstructionContext>` or  
- `Promise<Document<object, DocumentConstructionContext>>`  
The cloned Document instance

Inherited from [BaseCards.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#clone)

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

- embeddedName: `string`  
  The name of the embedded Document type
- data: `object[]` = `[]`  
  An array of data objects used to create multiple documents
- Optional  
  operation: `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of created Document instances

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)  
Inherited from [BaseCards.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#createEmbeddedDocuments)

---

### deal

```typescript
deal(
    to: documents.Cards[],
    number?: number,
    options?: {
        action?: string;
        chatNotification?: boolean;
        how?: number;
        updateData?: object;
    },
): Promise<documents.Cards>
```

Deal one or more cards from this Cards document to each of a provided array of Cards destinations. Cards are allocated from the top of the deck in cyclical order until the required number of Cards have been dealt.

**Parameters**

- to: `documents.Cards[]` - An array of other Cards documents to which cards are dealt
- Optional  
  number: `number` = `1` - The number of cards to deal to each other document
- Optional  
  options:

  ```typescript
  {
      action?: string;           // The name of the action being performed, used as part of the dispatched Hook event
      chatNotification?: boolean; // Create a ChatMessage which notifies that this action has occurred
      how?: number;               // How to draw, a value from CONST.CARD_DRAW_MODES
      updateData?: object;        // Modifications to make to each Card as part of the deal operation, for example the displayed face
  } = {}
  ```

**Returns**  
`Promise<documents.Cards>`  
This Cards document after the deal operation has completed.

---

### dealDialog

```typescript
dealDialog(): Promise<null | documents.Cards>
```

Display a dialog which prompts the user to deal cards to some number of hand-type Cards documents.

**Returns**  
`Promise<null | documents.Cards>`

See also: [Cards#deal](#deal)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- Optional  
  operation: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The deleted Document instance, or undefined if not deleted

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)  
Inherited from [BaseCards.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#delete)

---

### deleteDialog

```typescript
deleteDialog(options?: {}): Promise<any>
```

**Parameters**

- options: `{}` = `{}`

**Returns**  
`Promise<any>`

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

- embeddedName: `string`  
  The name of the embedded Document type
- ids: `string[]`  
  An array of string ids for each Document to be deleted
- Optional  
  operation: `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of deleted Document instances

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)  
Inherited from [BaseCards.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#deleteEmbeddedDocuments)

---

### draw

```typescript
draw(
    from: documents.Cards,
    number?: number,
    options?: { how?: number; updateData?: object },
): Promise<documents.Card[]>
```

Draw one or more cards from some other Cards document.

**Parameters**

- from: `documents.Cards` - Some other Cards document from which to draw
- Optional  
  number: `number` = `1` - The number of cards to draw
- Optional  
  options:

  ```typescript
  {
      how?: number;            // How to draw, a value from CONST.CARD_DRAW_MODES
      updateData?: object;     // Modifications to make to each Card as part of the draw operation, for example the displayed face
  } = {}
  ```

**Returns**  
`Promise<documents.Card[]>`  
An array of the Card documents which were drawn

---

### drawDialog

```typescript
drawDialog(): Promise<null | documents.Card[]>
```

Display a dialog which prompts the user to draw cards from some other deck-type Cards documents.

**Returns**  
`Promise<null | documents.Card[]>`

See also: [Cards#draw](#draw)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type

**Returns**  
`DocumentCollection`  
The Collection instance of embedded Documents of the requested type

Inherited from [BaseCards.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#getEmbeddedCollection)

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

- embeddedName: `string`  
  The name of the embedded Document type
- id: `string`  
  The id of the child document to retrieve
- Optional  
  options: `{ invalid?: boolean; strict?: boolean }` = `{}`  
  Additional options which modify how embedded documents are retrieved  
  - **invalid**?: `boolean`  
    Allow retrieving an invalid Embedded Document.  
  - **strict**?: `boolean`  
    Throw an Error if the requested id does not exist. See `Collection#get`

**Returns**  
`Document<object, DocumentConstructionContext>`  
The retrieved embedded Document instance, or undefined

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseCards.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#getEmbeddedDocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

**Parameters**

- scope: `string` - The flag scope which namespaces the key
- key: `string` - The flag key

**Returns**  
`any` - The flag value

Inherited from [BaseCards.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#getFlag)

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role. For example, a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- Optional  
  user: `BaseUser`  
  The User being tested

**Returns**  
`DocumentOwnershipNumber`  
A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

Inherited from [BaseCards.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#getUserLevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns**  
`object` - The migrated system data object

Inherited from [BaseCards.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#migrateSystemData)

---

### pass

```typescript
pass(
    to: documents.Cards,
    ids: string[],
    options?: {
        action?: string;
        chatNotification?: boolean;
        updateData?: object;
    },
): Promise<documents.Card[]>
```

Pass an array of specific Card documents from this document to some other Cards stack.

**Parameters**

- to: `documents.Cards`  
  Some other Cards document that is the destination for the pass operation
- ids: `string[]`  
  The embedded Card ids which should be passed
- Optional  
  options:

  ```typescript
  {
      action?: string;           // The name of the action being performed, used as part of the dispatched Hook event
      chatNotification?: boolean; // Create a ChatMessage which notifies that this action has occurred
      updateData?: object;        // Modifications to make to each Card as part of the pass operation, for example the displayed face
  } = {}
  ```

**Returns**  
`Promise<documents.Card[]>`  
An array of the Card embedded documents created within the destination stack

---

### passDialog

```typescript
passDialog(): Promise<null | documents.Cards>
```

Display a dialog which prompts the user to pass cards from this document to some other Cards document.

**Returns**  
`Promise<null | documents.Cards>`

See also: [Cards#deal](#deal)

---

### playDialog

```typescript
playDialog(card: documents.Card): Promise<null | documents.Card[]>
```

Display a dialog which prompts the user to play a specific Card to some other Cards document.

**Parameters**

- card: `documents.Card`  
  The specific card being played as part of this dialog

**Returns**  
`Promise<null | documents.Card[]>`

See also: [Cards#pass](#pass)

---

### recall

```typescript
recall(options?: { chatNotification?: boolean; updateData?: object }): Promise<documents.Cards>
```

Recall the Cards stack, retrieving all original cards from other stacks where they may have been drawn if this is a deck, otherwise returning all the cards in this stack to the decks where they originated.

**Parameters**

- Optional  
  options:

  ```typescript
  {
    chatNotification?: boolean; // Create a ChatMessage which notifies that this action has occurred
    updateData?: object;         // Modifications to make to each Card as part of the recall operation, e.g. displayed face
  }
  ```

**Returns**  
`Promise<documents.Cards>`  
The Cards document after the recall operation has completed.

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [BaseCards.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#reset)

---

### resetDialog

```typescript
resetDialog(): Promise<null | false | documents.Cards>
```

Display a confirmation dialog for whether the user wishes to reset a Cards stack.

**Returns**  
`Promise<null | false | documents.Cards>`

See also: [Cards#recall](#recall)

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key
- key: `string`  
  The flag key
- value: `any`  
  The flag value

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
A Promise resolving to the updated document

Inherited from [BaseCards.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#setFlag)

---

### shuffle

```typescript
shuffle(options?: { chatNotification?: boolean; updateData?: object }): Promise<documents.Cards>
```

Shuffle this Cards stack, randomizing the sort order of all the cards it contains.

**Parameters**

- Optional  
  options:

  ```typescript
  {
      chatNotification?: boolean; // Create a ChatMessage which notifies that this action has occurred
      updateData?: object;         // Modifications to make to each Card as part of the shuffle operation, e.g. displayed face
  } = {}
  ```

**Returns**  
`Promise<documents.Cards>`  
The Cards document after the shuffle operation has completed

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

- user: `BaseUser`  
  The User being tested
- permission: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
- Optional  
  options:

  ```typescript
  {
      exact?: boolean;
  } = {}
  ```

  Additional options involved in the permission test.  
  - exact?: `boolean` - Require the exact permission level requested?

**Returns**  
`boolean`  
Does the user have this permission level over the Document?

Inherited from [BaseCards.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#testUserPermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object`  
The document source data expressed as a plain object

Inherited from [BaseCards.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#toJSON)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- source: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**  
`any`  
The extracted primitive object

Inherited from [BaseCards.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#toObject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- Optional  
  _parentPath: `string` - A parent field path already traversed

**Returns**  
`Generator<any, void, any>`

Inherited from [BaseCards.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#traverseEmbeddedDocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key
- key: `string`  
  The flag key

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
The updated document instance

Inherited from [BaseCards.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#unsetFlag)

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

- Optional  
  data: `object` = `{}`  
  Differential update data which modifies the existing values of this document
- Optional  
  operation: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The updated Document instance, or undefined not updated

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateDocuments)  
Inherited from [BaseCards.update](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#update)

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

- embeddedName: `string`  
  The name of the embedded Document type
- updates: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document
- Optional  
  operation: `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated Document instances

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateDocuments)  
Inherited from [BaseCards.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#updateEmbeddedDocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- changes: `object` = `{}` - New values which should be applied to the data model
- options: `DataModelUpdateOptions` = `{}` - Options which determine how the new data is merged

**Returns**  
`object` - An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

Inherited from [BaseCards.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#updateSource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- options: `DataModelValidationOptions` = `{}` - Options which modify how the model is validated

**Returns**  
`boolean` - Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseCards.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#validate)

---

### _drawCards

```typescript
protected _drawCards(number: number, how: number): documents.Card[]
```

An internal helper method for drawing a certain number of Card documents from this Cards stack.

**Parameters**

- number: `number` - The number of cards to draw
- how: `number` - A draw mode from CONST.CARD_DRAW_MODES

**Returns**  
`documents.Card[]`  
An array of drawn Card documents

---

### _initializeSource

```typescript
protected _initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- data: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed
- Optional  
  options: `object` = `{}` - Options provided to the model constructor

**Returns**  
`object` - Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

Inherited from [BaseCards._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_initializeSource)

---

### _onCreate

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- data: `object` - The initial data object provided to the document creation request
- options: `object` - Additional options which modify the creation request
- userId: `string` - The id of the User requesting the document update

**Returns**  
`void`

Inherited from [BaseCards._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_onCreate)

---

### _onDelete

```typescript
protected _onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- options: `object` - Additional options which modify the deletion request
- userId: `string` - The id of the User requesting the document update

**Returns**  
`void`

Inherited from [BaseCards._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_onDelete)

---

### _onUpdate

```typescript
protected _onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- changed: `object` - The differential data that was changed relative to the documents prior values
- options: `object` - Additional options which modify the update request
- userId: `string` - The id of the User requesting the document update

**Returns**  
`void`

Inherited from [BaseCards._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_onUpdate)

---

### _preUpdate

```typescript
protected _preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- changes: `object` - The candidate changes to the Document
- options: `object` - Additional options which modify the update request
- user: `BaseUser` - The User requesting the document update

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

Inherited from [BaseCards._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_preUpdate)

---

### sortShuffled

```typescript
protected sortShuffled(a: documents.Card, b: documents.Card): number
```

A sorting function that is used to determine the order of Card documents within a shuffled stack.

**Parameters**

- a: `documents.Card` - The card being sorted
- b: `documents.Card` - Another card being sorted against

**Returns**  
`number`

---

### sortStandard

```typescript
protected sortStandard(a: documents.Card, b: documents.Card): number
```

A sorting function that is used to determine the standard order of Card documents within an un-shuffled stack. Sorting with "en" locale to ensure the same order regardless of which client sorts the deck.

**Parameters**

- a: `documents.Card` - The card being sorted
- b: `documents.Card` - Another card being sorted against

**Returns**  
`number`

---

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from [BaseCards._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_initializationOrder)

---

### canUserCreate

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- user: `BaseUser` - The User being tested

**Returns**  
`boolean`  
Does the User have a sufficient role to create?

Inherited from [BaseCards.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#canUserCreate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- Optional  
  source: `object` = `{}` - The source data object
- Optional  
  options: `object` = `{}` - Additional options which are passed to field cleaning methods

**Returns**  
`object`  
The cleaned source data, which is the same object as the `source` argument

Inherited from [BaseCards.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#cleanData)

---

### create

```typescript
static create(
    data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- Optional  
  data:  
  - object  
  - or Document  
  - or array of objects or Documents  
  Initial data used to create this Document, or a Document instance to persist.
- Optional  
  operation: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>`  
The created Document instance(s)

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createDocuments)

**Examples:**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const data = [{name: "Special Sword", type: "weapon"}];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});

const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseCards.create](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#create)

---

### createDialog

```typescript
static createDialog(
    data?: {},
    createOptions?: {},
    __namedParameters?: {},
): Promise<any>
```

**Parameters**

- data: `{}` = `{}`
- createOptions: `{}` = `{}`
- __namedParameters: `{}` = `{}`

**Returns**  
`Promise<any>`

---

### createDocuments

```typescript
static createDocuments(
    data?: any[],
    context?: {},
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- data: `any[]` = `[]`  
  An array of data objects or existing Documents to persist.
- context: `{}` = `{}`  
  Parameters of the requested creation operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of created Document instances

**Examples:**

```typescript
// Create a single Document
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

// Create multiple Documents
const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);

// Create multiple embedded Documents within a parent
const actor = game.actors.getName("Tim");
const data = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const created = await Item.implementation.createDocuments(data, {parent: actor});

// Create a Document within a Compendium pack
const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

Overrides [BaseCards.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#createDocuments)

---

### defineSchema

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

**Returns**

```typescript
{
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

Inherited from [BaseCards.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#defineSchema)

---

### deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- ids: `string[]` = `[]`  
  An array of string ids for the documents to be deleted
- Optional  
  operation: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of deleted Document instances

**Examples:**

```typescript
// Delete a single Document
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

// Delete multiple Documents
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

// Delete multiple embedded Documents within a parent
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

// Delete Documents within a Compendium pack
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from [BaseCards.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#deleteDocuments)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- json: `string`  
  Serialized document data in string format

**Returns**  
`DataModel<object, DataModelConstructionContext>`  
A constructed data model instance

Inherited from [BaseCards.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#fromJSON)

---

### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- source: `object`  
  Initial document data which comes from a trusted source.
- Optional  
  context: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [BaseCards.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#fromSource)

---

### get

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- documentId: `string`  
  The Document ID
- Optional  
  operation: `DatabaseGetOperation` = `{}`  
  Parameters of the get operation

**Returns**  
`null | Document<object, DocumentConstructionContext>`  
The retrieved Document, or null

Inherited from [BaseCards.get](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#get)

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- name: `string`  
  An existing collection name or a document name.

**Returns**  
`null | string`  
The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples:**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [BaseCards.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#getCollectionName)

---

### migrateData

```typescript
static migrateData(source: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- source: `any`  
  The candidate source data from which the model will be constructed

**Returns**  
`object`  
Migrated source data, which is the same object as the `source` argument

Inherited from [BaseCards.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#migrateData)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- source: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
`object`  
Migrated source data, which is the same object as the `source` argument

Inherited from [BaseCards.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#migrateDataSafe)

---

### shimData

```typescript
static shimData(source: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- source: `any`  
  Data which matches the current schema
- options: `any`  
  Additional shimming options

**Returns**  
`object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [BaseCards.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#shimData)

---

### updateDocuments

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- updates: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document
- Optional  
  operation: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated Document instances

**Examples:**

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
  {_id: sword.id, name: "Magic Sword"},
  {_id: shield.id, name: "Magic Shield"}
];
const updated = await Item.implementation.updateDocuments(updates, {parent: actor});

// Update Documents within a Compendium pack
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [BaseCards.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#updateDocuments)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- data: `object`  
  Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected

Inherited from [BaseCards.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#validateJoint)

---

### _onCreateOperation

```typescript
protected static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual _onCreate workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were created
- operation: `DatabaseCreateOperation`  
  Parameters of the database creation operation
- user: `BaseUser`  
  The User who performed the creation operation

**Returns**  
`Promise<void>`

Inherited from [BaseCards._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_onCreateOperation)

---

### _onDeleteOperation

```typescript
protected static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual _onDelete workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were deleted
- operation: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation
- user: `BaseUser`  
  The User who performed the deletion operation

**Returns**  
`Promise<void>`

Inherited from [BaseCards._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_onDeleteOperation)

---

### _onUpdateOperation

```typescript
protected static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual _onUpdate workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were updated
- operation: `DatabaseUpdateOperation`  
  Parameters of the database update operation
- user: `BaseUser`  
  The User who performed the update operation

**Returns**  
`Promise<void>`

Inherited from [BaseCards._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_onUpdateOperation)

---

### _preCreateOperation

```typescript
protected static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual _preCreate workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [updateSource](#updatesource).

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Pending document instances to be created
- operation: `DatabaseCreateOperation`  
  Parameters of the database creation operation
- user: `BaseUser`  
  The User requesting the creation operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the creation operation entirely

Inherited from [BaseCards._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_preCreateOperation)

---

### _preDeleteOperation

```typescript
protected static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual _preDelete workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object. See [updateSource](#updatesource).

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be deleted
- operation: `DatabaseDeleteOperation`  
  Parameters of the database update operation
- user: `BaseUser`  
  The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the deletion operation entirely

Inherited from [BaseCards._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_preDeleteOperation)

---

### _preUpdateOperation

```typescript
protected static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual _preUpdate workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be updated
- operation: `DatabaseUpdateOperation`  
  Parameters of the database update operation
- user: `BaseUser`  
  The User requesting the update operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the update operation entirely

Inherited from [BaseCards._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCards.html#_preUpdateOperation)

---

This completes the API documentation for the **Cards** class in Foundry Virtual Tabletop Version 13.