# Combat | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side **Combat** document which extends the common **BaseCombat** model.

---

## Hook Events

- [hookEvents.combatRound](https://foundryvtt.com/api/functions/hookEvents.combatRound.html)
- [hookEvents.combatStart](https://foundryvtt.com/api/functions/hookEvents.combatStart.html)
- [hookEvents.combatTurn](https://foundryvtt.com/api/functions/hookEvents.combatTurn.html)
- [hookEvents.combatTurnChange](https://foundryvtt.com/api/functions/hookEvents.combatTurnChange.html)

## Mixes

- ClientDocumentMixin

## See Also

- [foundry.documents.collections.CombatEncounters](https://foundryvtt.com/api/classes/foundry.documents.collections.CombatEncounters.html): The world-level collection of Combat documents
- [Combatant](https://foundryvtt.com/api/classes/foundry.documents.Combatant.html): The Combatant embedded document which exists within a Combat document
- [foundry.applications.sidebar.tabs.CombatTracker](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CombatTracker.html): The CombatTracker application
- [foundry.applications.apps.CombatTrackerConfig](https://foundryvtt.com/api/classes/foundry.applications.apps.CombatTrackerConfig.html): The CombatTracker configuration application

## Hierarchy

[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.Combat)

```
BaseCombat < this

Combat
```

---

# Class: Combat

---

## Constructors

```typescript
new Combat(
    data?: Partial<CombatData>,
    options?: DocumentConstructionContext,
): documents.Combat
```

**Parameters**

- **data** (Optional): `Partial<CombatData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
- **options** (Optional): `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.Combat`

Inherited from: [BaseCombat.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#constructor)

---

## Properties

### \_source

`_source: CombatData`

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from: [BaseCombat._source](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_source)

### current

`current: CombatHistoryData = ...`

Records the current round, turn, and tokenId to understand changes in the encounter state.

### debounceSetup

`debounceSetup: Function = ...`

Debounce changes to the composition of the Combat encounter to de-duplicate multiple concurrent Combatant changes. If this is the currently viewed encounter, re-render the CombatTracker application.

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from: [BaseCombat.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#parent)

### previous

`previous: CombatHistoryData = undefined`

Tracks the previous round, turn, and tokenId to understand changes in the encounter state.

### turns

`turns: documents.Combatant[] = ...`

Tracks the sorted turn order of this combat encounter.

---

## Static Properties

### CONFIG_SETTING

`CONFIG_SETTING: string = "combatTrackerConfig"`

The configuration setting used to record Combat preferences.

### LOCALIZATION_PREFIXES

`LOCALIZATION_PREFIXES: string[] = [...]`

Inherited from: [BaseCombat.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#localization_prefixes)

### metadata

`metadata: object = ...`

Default metadata which applies to each instance of this Document type.

Inherited from: [BaseCombat.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#metadata)

---

## Accessors

### combatant

```typescript
get combatant(): null | documents.Combatant
```

Get the Combatant who has the current turn.

**Returns**  
`null | documents.Combatant`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

Inherited from: `ClientDocumentMixin(BaseCombat).id`

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

Inherited from: `ClientDocumentMixin(BaseCombat).inCompendium`

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from: `ClientDocumentMixin(BaseCombat).invalid`

### isActive

```typescript
get isActive(): boolean
```

Is this combat active in the current scene?

**Returns**  
`boolean`

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

Inherited from: `ClientDocumentMixin(BaseCombat).isEmbedded`

### nextCombatant

```typescript
get nextCombatant(): documents.Combatant
```

Get the Combatant who has the next turn.

**Returns**  
`documents.Combatant`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from: `ClientDocumentMixin(BaseCombat).schema`

### settings

```typescript
get settings(): object
```

Return the object of settings which modify the Combat Tracker behavior.

**Returns**  
`object`

### started

```typescript
get started(): boolean
```

Has this combat encounter been started?

**Returns**  
`boolean`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

Inherited from: `ClientDocumentMixin(BaseCombat).uuid`

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

**Returns**  
An object containing `fields` and `joint` failures.

Inherited from: `ClientDocumentMixin(BaseCombat).validationFailures`

### visible

```typescript
get visible(): boolean
```

**Returns**  
`boolean`

---

## Static Accessors

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from: `ClientDocumentMixin(BaseCombat).baseDocument`

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

Inherited from: `ClientDocumentMixin(BaseCombat).collectionName`

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from: `ClientDocumentMixin(BaseCombat).database`

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

Inherited from: `ClientDocumentMixin(BaseCombat).documentName`

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

Inherited from: `ClientDocumentMixin(BaseCombat).hasTypeData`

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from: `ClientDocumentMixin(BaseCombat).hierarchy`

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from: `ClientDocumentMixin(BaseCombat).implementation`

### schema

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

Inherited from: `ClientDocumentMixin(BaseCombat).schema`

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

Inherited from: `ClientDocumentMixin(BaseCombat).TYPES`

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- __namedParameters (optional): `{ pack?: null; parentCollection?: null }` = `{}`

**Returns**  
`void`

Inherited from: [BaseCombat._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_configure)

---

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data**: `any`  
  The initial data object provided to the document creation request
- **options**: `any`  
  Additional options which modify the creation request
- **userId**: `any`  
  The id of the User requesting the document update

**Returns**  
`void`

Overrides: [BaseCombat._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_oncreate)

---

### _onCreateDescendantDocuments

```typescript
_onCreateDescendantDocuments(
    parent: any,
    collection: any,
    documents: any,
    data: any,
    options: any,
    userId: any,
): void
```

**Parameters**

- **parent**: `any`
- **collection**: `any`
- **documents**: `any`
- **data**: `any`
- **options**: `any`
- **userId**: `any`

**Returns**  
`void`

Inherited documentation.

---

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `any`  
  Additional options which modify the deletion request
- **userId**: `any`  
  The id of the User requesting the document update

**Returns**  
`void`

Overrides: [BaseCombat._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_ondelete)

---

### _onDeleteDescendantDocuments

```typescript
_onDeleteDescendantDocuments(
    parent: any,
    collection: any,
    documents: any,
    ids: any,
    options: any,
    userId: any,
): void
```

**Parameters**

- **parent**: `any`
- **collection**: `any`
- **documents**: `any`
- **ids**: `any`
- **options**: `any`
- **userId**: `any`

**Returns**  
`void`

Inherited documentation.

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `any`  
  The differential data that was changed relative to the document's prior values
- **options**: `any`  
  Additional options which modify the update request
- **userId**: `any`  
  The id of the User requesting the document update

**Returns**  
`void`

Overrides: [BaseCombat._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_onupdate)

---

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

**Parameters**

- **parent**: `any`
- **collection**: `any`
- **documents**: `any`
- **changes**: `any`
- **options**: `any`
- **userId**: `any`

**Returns**  
`void`

Inherited documentation.

---

### _preUpdate

```typescript
_preUpdate(changed: any, options: any, user: any): Promise<undefined | false>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changed**: `any`  
  The candidate changes to the Document
- **options**: `any`  
  Additional options which modify the update request
- **user**: `any`  
  The User requesting the document update

**Returns**  
`Promise<undefined | false>`

A return of `false` indicates the update operation should be cancelled.

Inherited from: [BaseCombat._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_preupdate)

---

### activate

```typescript
activate(options?: Partial<DatabaseUpdateOperation>): Promise<documents.Combat>
```

A convenience alias for updating this document to become active.

**Parameters**

- **options** (Optional): `Partial<DatabaseUpdateOperation>`  
  Additional context to customize the update workflow

**Returns**  
`Promise<documents.Combat>`

---

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
- **data** (Optional): `object` = `{}`  
  Data involved in the attempted action

**Returns**  
`boolean`

Inherited from: [BaseCombat.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#canusermodify)

---

### clearMovementHistories

```typescript
clearMovementHistories(): Promise<void>
clearMovementHistories(combatants: Iterable<documents.Combatant>): Promise<void>
```

Clear the movement history of all Tokens within this Combat or for specific Combatants.

**Parameters**

- **combatants**: `Iterable<documents.Combatant>`  
  The combatants whose movement history is cleared

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

- **data** (Optional): `object` = `{}`  
  Additional data which overrides current document data at the time of creation
- **context** (Optional): `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method

**Returns**  
`Document` or `Promise<Document>`

Inherited from: [BaseCombat.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#clone)

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

- **embeddedName**: `string`  
  The name of the embedded Document type
- **data** (Optional): `object[]` = `[]`  
  An array of data objects used to create multiple documents
- **operation** (Optional): `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow

**Returns**  
`Promise` resolving to an array of created Document instances.

Inherited from: [BaseCombat.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#createembeddeddocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation** (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation

**Returns**  
`Promise` resolving to the deleted Document instance, or undefined if not deleted.

Inherited from: [BaseCombat.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#delete)

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

- **embeddedName**: `string`  
  The name of the embedded Document type
- **ids**: `string[]`  
  An array of string ids for each Document to be deleted
- **operation** (Optional): `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow

**Returns**  
`Promise` resolving to an array of deleted Document instances.

Inherited from: [BaseCombat.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#deleteembeddeddocuments)

---

### endCombat

```typescript
endCombat(): Promise<documents.Combat>
```

Display a dialog querying the GM whether they wish to end the combat encounter and empty the tracker.

**Returns**  
`Promise<documents.Combat>`

---

### getCombatantsByActor

```typescript
getCombatantsByActor(actor: string | documents.Actor): documents.Combatant[]
```

Get Combatants that represent the given Actor or Actor ID.

**Parameters**

- **actor**: `string | documents.Actor`  
  An Actor ID or an Actor instance

**Returns**  
`documents.Combatant[]`

---

### getCombatantsByToken

```typescript
getCombatantsByToken(token: string | TokenDocument): documents.Combatant[]
```

Get Combatants using its Token id.

**Parameters**

- **token**: `string | TokenDocument`  
  A Token ID or a TokenDocument instance

**Returns**  
`documents.Combatant[]`

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

**Returns**  
`DocumentCollection`

Inherited from: [BaseCombat.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#getembeddedcollection)

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

- **embeddedName**: `string`  
  The name of the embedded Document type
- **id**: `string`  
  The id of the child document to retrieve
- **options** (Optional): `{ invalid?: boolean; strict?: boolean }` = `{}`  
  Additional options which modify how embedded documents are retrieved
  - **invalid** (Optional): `boolean`  
    Allow retrieving an invalid Embedded Document.
  - **strict** (Optional): `boolean`  
    Throw an Error if the requested id does not exist.

**Returns**  
`Document` or `undefined`

**Throws**  
An error if the embedded collection does not exist or if strict is true and the Embedded Document could not be found.

Inherited from: [BaseCombat.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key
- **key**: `string`  
  The flag key

**Returns**  
`any` - The flag value

Inherited from: [BaseCombat.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#getflag)

---

### getTimeDelta

```typescript
getTimeDelta(
    fromRound: number,
    fromTurn: null | number,
    toRound: number,
    toTurn: null | number,
): number
```

Calculate the time delta between two turns.

**Parameters**

- `fromRound`: `number` - The starting round
- `fromTurn`: `null | number` - The starting turn
- `toRound`: `number` - The ending round
- `toTurn`: `null | number` - The ending turn

**Returns**  
`number` - The time delta

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

> This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, use `testUserPermission`.

**Parameters**

- **user** (Optional): `BaseUser`  
  The User being tested

**Returns**  
`DocumentOwnershipNumber`

Inherited from: [BaseCombat.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns**  
`object` - The migrated system data object

Inherited from: [BaseCombat.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#migratesystemdata)

---

### nextRound

```typescript
nextRound(): Promise<documents.Combat>
```

Advance the combat to the next round.

**Returns**  
`Promise<documents.Combat>`

---

### nextTurn

```typescript
nextTurn(): Promise<documents.Combat>
```

Advance the combat to the next turn.

**Returns**  
`Promise<documents.Combat>`

---

### prepareDerivedData

```typescript
prepareDerivedData(): void
```

---

### previousRound

```typescript
previousRound(): Promise<documents.Combat>
```

Rewind the combat to the previous round.

**Returns**  
`Promise<documents.Combat>`

---

### previousTurn

```typescript
previousTurn(): Promise<documents.Combat>
```

Rewind the combat to the previous turn.

**Returns**  
`Promise<documents.Combat>`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from: [BaseCombat.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#reset)

---

### resetAll

```typescript
resetAll(options?: { updateTurn?: boolean }): Promise<documents.Combat>
```

Reset all combatant initiative scores.

**Parameters**

- **options** (Optional): `{ updateTurn?: boolean }` = `{}`  
  Additional options
  - **updateTurn** (Optional): `boolean`  
    Update the Combat turn after resetting initiative scores to keep the turn on the same Combatant.

**Returns**  
`Promise<documents.Combat>`

---

### rollAll

```typescript
rollAll(options?: object): Promise<documents.Combat>
```

Roll initiative for all combatants which have not already rolled.

**Parameters**

- **options** (Optional): `object`  
  Additional options forwarded to the Combat.rollInitiative method

**Returns**  
`Promise<documents.Combat>`

---

### rollInitiative

```typescript
rollInitiative(
    ids: string | string[],
    options?: {
        formula?: null | string;
        messageOptions?: object;
        updateTurn?: boolean;
    },
): Promise<documents.Combat>
```

Roll initiative for one or multiple Combatants within the Combat document.

**Parameters**

- **ids**: `string | string[]`  
  A Combatant id or Array of ids for which to roll
- **options** (Optional):

  - **formula** (Optional): `null | string`  
    A non-default initiative formula to roll. Otherwise, the system default is used.
  - **messageOptions** (Optional): `object`  
    Additional options with which to customize created Chat Messages.
  - **updateTurn** (Optional): `boolean`  
    Update the Combat turn after adding new initiative scores to keep the turn on the same Combatant.

**Returns**  
`Promise<documents.Combat>`

---

### rollNPC

```typescript
rollNPC(options?: object): Promise<documents.Combat>
```

Roll initiative for all non-player actors who have not already rolled.

**Parameters**

- **options** (Optional): `object` = `{}`  
  Additional options forwarded to the Combat.rollInitiative method

**Returns**  
`Promise<documents.Combat>`

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

- **scope**: `string`  
  The flag scope which namespaces the key
- **key**: `string`  
  The flag key
- **value**: `any`  
  The flag value

**Returns**  
`Promise` resolving to the updated document.

Inherited from: [BaseCombat.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#setflag)

---

### setInitiative

```typescript
setInitiative(id: string, value: number): Promise<void>
```

Assign initiative for a single Combatant within the Combat encounter. Update the Combat turn order to maintain the same combatant as the current turn.

**Parameters**

- **id**: `string`  
  The combatant ID for which to set initiative
- **value**: `number`  
  A specific initiative value to set

**Returns**  
`Promise<void>`

---

### setupTurns

```typescript
setupTurns(): documents.Combatant[]
```

Return the Array of combatants sorted into initiative order, breaking ties alphabetically by name.

**Returns**  
`documents.Combatant[]`

---

### startCombat

```typescript
startCombat(): Promise<documents.Combat>
```

Begin the combat encounter, advancing to round 1 and turn 1.

**Returns**  
`Promise<documents.Combat>`

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

- **user**: `BaseUser`  
  The User being tested
- **permission**: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
- **options** (Optional): `{ exact?: boolean }` = `{}`  
  Additional options involved in the permission test
  - **exact** (Optional): `boolean`  
    Require the exact permission level requested?

**Returns**  
`boolean`

Inherited from: [BaseCombat.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#testuserpermission)

---

### toggleSceneLink

```typescript
toggleSceneLink(): Promise<documents.Combat>
```

Toggle whether this combat is linked to the scene or globally available.

**Returns**  
`Promise<documents.Combat>`

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object` – The document source data expressed as a plain object

Inherited from: [BaseCombat.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**  
`any` – The extracted primitive object

Inherited from: [BaseCombat.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath** (Optional): `string`  
  A parent field path already traversed

**Returns**  
`Generator<any, void, any>`

Inherited from: [BaseCombat.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#traverseembeddeddocuments)

---

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

**Returns**  
`Promise` resolving to the updated document instance.

Inherited from: [BaseCombat.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#unsetflag)

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

- **data** (Optional): `object` = `{}`  
  Differential update data which modifies the existing values of this document
- **operation** (Optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation

**Returns**  
`Promise` resolving to the updated Document instance, or undefined if not updated.

Inherited from: [BaseCombat.update](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#update)

---

### updateCombatantActors

```typescript
updateCombatantActors(): void
```

Update active effect durations for all actors present in this Combat encounter.

**Returns**  
`void`

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

- **embeddedName**: `string`  
  The name of the embedded Document type
- **updates** (Optional): `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document
- **operation** (Optional): `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow

**Returns**  
`Promise` resolving to an array of updated Document instances.

Inherited from: [BaseCombat.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes** (Optional): `object` = `{}`  
  New values which should be applied to the data model
- **options**: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns**  
`object` - An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from: [BaseCombat.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options** (Optional): `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns**  
`boolean` - Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from: [BaseCombat.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#validate)

---

## Protected Methods

### _canChangeRound

```typescript
_canChangeRound(user: User): boolean
```

Can a certain User change the Combat round?

**Parameters**

- **user**: `User`  
  The user attempting to change the round

**Returns**  
`boolean` - Is the user allowed to change the round?

Inherited from: [BaseCombat._canChangeRound](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_canchangeround)

---

### _canChangeTurn

```typescript
_canChangeTurn(user: User): boolean
```

Can a certain User change the Combat turn?

**Parameters**

- **user**: `User`  
  The user attempting to change the turn

**Returns**  
`boolean` - Is the user allowed to change the turn?

Inherited from: [BaseCombat._canChangeTurn](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_canchangeturn)

---

### _clearMovementHistoryOnExit

```typescript
_clearMovementHistoryOnExit(combatant: documents.Combatant): Promise<void>
```

Called after `Combat._onExit` and takes care of clearing the movement history of the Combatant's Token. This function is not called for Combatants that don't have a Token. The default implementation clears the movement history always.

**Parameters**

- **combatant**: `documents.Combatant`  
  The Combatant that exited the Combat

**Returns**  
`Promise<void>`

---

### _clearMovementHistoryOnStartTurn

```typescript
_clearMovementHistoryOnStartTurn(
    combatant: documents.Combatant,
    context: CombatTurnEventContext,
): Promise<void>
```

Called after `Combat._onStartTurn` and takes care of clearing the movement history of the Combatant's Token. This function is not called for Combatants that don't have a Token. The default implementation clears the movement history always.

**Parameters**

- **combatant**: `documents.Combatant`  
  The Combatant whose turn just started
- **context**: `CombatTurnEventContext`  
  The context of the turn that just started

**Returns**  
`Promise<void>`

---

### _getCurrentState

```typescript
_getCurrentState(combatant?: documents.Combatant): CombatHistoryData
```

Get the current history state of the Combat encounter.

**Parameters**

- **combatant** (Optional): `documents.Combatant`  
  The new active combatant

**Returns**  
`CombatHistoryData`

---

### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField.initialize` but with some added functionality.

**Parameters**

- **options** (Optional): `object` = `{}`

**Returns**  
`void`

Inherited from: [BaseCombat._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_initialize)

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

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed
- **options** (Optional): `object` = `{}`  
  Options provided to the model constructor

**Returns**  
`object` - Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from: [BaseCombat._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_initializesource)

---

### _manageTurnEvents

```typescript
_manageTurnEvents(): Promise<void>
```

Manage the execution of Combat lifecycle events. This method orchestrates the execution of four events in the following order, as applicable:

1. End Turn  
2. End Round  
3. Begin Round  
4. Begin Turn

Each lifecycle event is an async method, and each is awaited before proceeding.

**Returns**  
`Promise<void>`

---

### _onEndRound

```typescript
_onEndRound(context: CombatRoundEventContext): Promise<void>
```

A workflow that occurs at the end of each Combat Round. This workflow occurs after the Combat document update. This can be overridden to implement system-specific combat tracking behaviors. The default implementation of this function does nothing. This method only executes for one designated GM user. If no GM users are present this method will not be called.

**Parameters**

- **context**: `CombatRoundEventContext`  
  The context of the round that just ended

**Returns**  
`Promise<void>`

---

### _onEndTurn

```typescript
_onEndTurn(
    combatant: documents.Combatant,
    context: CombatTurnEventContext,
): Promise<void>
```

A workflow that occurs at the end of each Combat Turn. This workflow occurs after the Combat document update. This can be overridden to implement system-specific combat tracking behaviors. The default implementation of this function does nothing. This method only executes for one designated GM user. If no GM users are present this method will not be called.

**Parameters**

- **combatant**: `documents.Combatant`  
  The Combatant whose turn just ended
- **context**: `CombatTurnEventContext`  
  The context of the turn that just ended

**Returns**  
`Promise<void>`

---

### _onEnter

```typescript
_onEnter(combatant: documents.Combatant): Promise<void>
```

This workflow occurs after a Combatant is added to the Combat. This can be overridden to implement system-specific combat tracking behaviors. The default implementation of this function does nothing. This method only executes for one designated GM user. If no GM users are present this method will not be called.

**Parameters**

- **combatant**: `documents.Combatant`  
  The Combatant that entered the Combat

**Returns**  
`Promise<void>`

---

### _onExit

```typescript
_onExit(combatant: documents.Combatant): Promise<void>
```

This workflow occurs after a Combatant is removed from the Combat. This can be overridden to implement system-specific combat tracking behaviors. The default implementation of this function does nothing. This method only executes for one designated GM user. If no GM users are present this method will not be called.

**Parameters**

- **combatant**: `documents.Combatant`  
  The Combatant that exited the Combat

**Returns**  
`Promise<void>`

---

### _onStartRound

```typescript
_onStartRound(context: CombatRoundEventContext): Promise<void>
```

A workflow that occurs at the start of each Combat Round. This workflow occurs after the Combat document update. This can be overridden to implement system-specific combat tracking behaviors. The default implementation of this function does nothing. This method only executes for one designated GM user. If no GM users are present this method will not be called.

**Parameters**

- **context**: `CombatRoundEventContext`  
  The context of the round that just started

**Returns**  
`Promise<void>`

---

### _onStartTurn

```typescript
_onStartTurn(
    combatant: documents.Combatant,
    context: CombatTurnEventContext,
): Promise<void>
```

A workflow that occurs at the start of each Combat Turn. This workflow occurs after the Combat document update. This can be overridden to implement system-specific combat tracking behaviors. The default implementation of this function does nothing. This method only executes for one designated GM user. If no GM users are present this method will not be called.

**Parameters**

- **combatant**: `documents.Combatant`  
  The Combatant whose turn just started
- **context**: `CombatTurnEventContext`  
  The context of the turn that just started

**Returns**  
`Promise<void>`

---

### _playCombatSound

```typescript
_playCombatSound(announcement: string): void
```

Loads the registered Combat Theme (if any) and plays the requested type of sound. If multiple exist for that type, one is chosen at random.

**Parameters**

- **announcement**: `string`  
  The announcement that should be played: `"startEncounter"`, `"nextUp"`, or `"yourTurn"`.

**Returns**  
`void`

---

### _preCreate

```typescript
_preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [updateSource](#updateSource).

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request
- **options**: `object`  
  Additional options which modify the creation request
- **user**: `BaseUser`  
  The User requesting the document creation

**Returns**  
`Promise<boolean | void>`

Return `false` to exclude this Document from the creation operation.

Inherited from: [BaseCombat._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_precreate)

---

### _preDelete

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request
- **user**: `BaseUser`  
  The User requesting the document deletion

**Returns**  
`Promise<boolean | void>`

A return value of `false` indicates the deletion operation should be cancelled.

Inherited from: [BaseCombat._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_predelete)

---

### _refreshTokenHUD

```typescript
_refreshTokenHUD(documents: documents.Combatant[]): void
```

Refresh the Token HUD under certain circumstances.

**Parameters**

- **documents**: `documents.Combatant[]`  
  A list of Combatant documents that were added or removed.

**Returns**  
`void`

---

### _sortCombatants

```typescript
_sortCombatants(
    a: documents.Combatant,
    b: documents.Combatant,
): number
```

Define how the array of Combatants is sorted in the displayed list of the tracker. This method can be overridden by a system or module which needs to display combatants in an alternative order. The default sorting rules sort in descending order of initiative using combatant IDs for tiebreakers.

**Parameters**

- **a**: `documents.Combatant` - Some combatant
- **b**: `documents.Combatant` - Some other combatant

**Returns**  
`number`

---

### _updateTurnMarkers

```typescript
_updateTurnMarkers(): void
```

Update display of Token combat turn markers.

**Returns**  
`void`

---

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from: [BaseCombat._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_initializationorder)

---

### canUserCreate

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user**: `BaseUser`  
  The User being tested

**Returns**  
`boolean`

Inherited from: [BaseCombat.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#canusercreate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source** (Optional): `object` = `{}`  
  The source data object
- **options** (Optional): `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns**  
The cleaned source data, which is the same object as the `source` argument.

Inherited from: [BaseCombat.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#cleandata)

---

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

- **data** (Optional): `object | Document | Array<object | Document>`  
  Initial data used to create this Document, or a Document instance to persist.
- **operation** (Optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation

**Returns**  
`Promise` resolving to the created Document instance(s).

Inherited from: [BaseCombat.create](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#create)

---

### createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data** (Optional): `(object | Document)[]` = `[]`   
  An array of data objects or existing Documents to persist.
- **operation** (Optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation

**Returns**  
`Promise` resolving to an array of created Document instances.

Inherited from: [BaseCombat.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#createdocuments)

---

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    active: BooleanField;
    combatants: EmbeddedCollectionField;
    flags: DocumentFlagsField;
    groups: EmbeddedCollectionField;
    round: NumberField;
    scene: ForeignDocumentField;
    sort: IntegerSortField;
    system: TypeDataField;
    turn: NumberField;
    type: DocumentTypeField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**

Schema object defining fields:

- `_id`: DocumentIdField
- `_stats`: DocumentStatsField
- `active`: BooleanField
- `combatants`: EmbeddedCollectionField
- `flags`: DocumentFlagsField
- `groups`: EmbeddedCollectionField
- `round`: NumberField
- `scene`: ForeignDocumentField
- `sort`: IntegerSortField
- `system`: TypeDataField
- `turn`: NumberField
- `type`: DocumentTypeField

Inherited from: [BaseCombat.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#defineschema)

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

- **ids**: `string[]` = `[]`  
  An array of string ids for the documents to be deleted
- **operation** (Optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation

**Returns**  
`Promise` resolving to an array of deleted Document instances.

Inherited from: [BaseCombat.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#deletedocuments)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns**  
`DataModel`

Inherited from: [BaseCombat.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#fromjson)

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

- **source**: `object`  
  Initial document data which comes from a trusted source.
- **context** (Optional): `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context

**Returns**  
`DataModel`

Inherited from: [BaseCombat.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#fromsource)

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

- **documentId**: `string`  
  The Document ID
- **operation** (Optional): `DatabaseGetOperation` = `{}`  
  Parameters of the get operation

**Returns**  
The retrieved Document, or null.

Inherited from: [BaseCombat.get](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#get)

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string`  
  An existing collection name or a document name.

**Returns**  
The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
Actor.implementation.getCollectionName("Item");  // returns "items"
```

Inherited from: [BaseCombat.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#getcollectionname)

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from: [BaseCombat.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from: [BaseCombat.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema
- **options** (Optional): `{ embedded?: boolean }` = `{}`  
  Additional shimming options
  - **embedded** (Optional): `boolean`  
    Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from: [BaseCombat.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#shimdata)

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

- **updates**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document
- **operation** (Optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation

**Returns**  
`Promise` resolving to an array of updated Document instances.

Inherited from: [BaseCombat.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#updatedocuments)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from: [BaseCombat.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#validatejoint)

---

### _onCreateOperation

```typescript
static async _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters**

- **documents**: Documents that were created
- **operation**: Database creation operation parameters
- **user**: User who performed the creation operation

**Returns**  
`Promise<void>`

Inherited from: [BaseCombat._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_oncreateoperation)

---

### _onDeleteOperation

```typescript
static async _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters**

- **documents**: Documents that were deleted
- **operation**: Database deletion operation parameters
- **user**: User who performed the deletion operation

**Returns**  
`Promise<void>`

Inherited from: [BaseCombat._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_ondeleteoperation)

---

### _onUpdateOperation

```typescript
static async _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters**

- **documents**: Documents that were updated
- **operation**: Database update operation parameters
- **user**: User who performed the update operation

**Returns**  
`Promise<void>`

Inherited from: [BaseCombat._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_onupdateoperation)

---

### _preCreateOperation

```typescript
static async _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [updateSource](#updateSource).

**Parameters**

- **documents**: Pending document instances to be created
- **operation**: Database creation operation parameters
- **user**: User requesting the creation operation

**Returns**  
Return `false` to cancel the creation operation entirely.

Inherited from: [BaseCombat._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_precreateoperation)

---

### _preDeleteOperation

```typescript
static async _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or using [updateSource](#updateSource).

**Parameters**

- **documents**: Document instances to be deleted
- **operation**: Database deletion operation parameters
- **user**: User requesting the deletion operation

**Returns**  
Return `false` to cancel the deletion operation entirely.

Inherited from: [BaseCombat._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_predeleteoperation)

---

### _preUpdateOperation

```typescript
static async _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the `data` array of the operation.

**Parameters**

- **documents**: Document instances to be updated
- **operation**: Database update operation parameters
- **user**: User requesting the update operation

**Returns**  
Return `false` to cancel the update operation entirely.

Inherited from: [BaseCombat._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseCombat.html#_preupdateoperation)