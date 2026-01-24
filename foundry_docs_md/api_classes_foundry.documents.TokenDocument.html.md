# TokenDocument | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side Token document which extends the common BaseToken document model.

> The following fields must not be altered from source during data preparation: `x`, `y`, `elevation`, `width`, `height`, `shape`.

---

## Hook Events

- [hookEvents.moveToken](https://foundryvtt.com/api/functions/hookEvents.moveToken.html)
- [hookEvents.pauseToken](https://foundryvtt.com/api/functions/hookEvents.pauseToken.html)
- [hookEvents.preMoveToken](https://foundryvtt.com/api/functions/hookEvents.preMoveToken.html)
- [hookEvents.stopToken](https://foundryvtt.com/api/functions/hookEvents.stopToken.html)

---

## Mixes

- CanvasDocumentMixin

---

## See

- [foundry.documents.Scene: The Scene document type which contains Token documents](https://foundryvtt.com/api/classes/foundry.documents.Scene.html)
- [foundry.applications.sheets.TokenConfig: The Token configuration application](https://foundryvtt.com/api/classes/foundry.applications.sheets.TokenConfig.html)

---

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.TokenDocument), Expand)

- `<BaseToken<this>>`
- **TokenDocument**

---

## Constructors

### constructor

```typescript
new TokenDocument(
    data?: Partial<foundry.documents.types.TokenData>,
    options?: foundry.abstract.types.DocumentConstructionContext,
): TokenDocument
```

**Parameters**

- **data?**: `Partial<TokenData> = {}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options?**: `DocumentConstructionContext = {}`  
  Context and data validation options which affects initial model construction.

**Returns**: `TokenDocument`

---

## Properties

### _source

```typescript
_source: TokenData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

### actors

```typescript
actors: Collection<string, documents.Actor> = ...
```

A singleton collection which holds a reference to the synthetic token actor by its base actor's ID.

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```
An immutable reverse-reference to a parent DataModel to which this model belongs.

### regions

```typescript
regions: ReadonlySet<RegionDocument> = ...
```

The Regions this Token is currently in.

### DEFAULT_ICON

```typescript
DEFAULT_ICON: string = CONST.DEFAULT_TOKEN
```

The default icon used for newly created Token documents

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

### metadata

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

### MOVEMENT_FIELDS

```typescript
readonly MOVEMENT_FIELDS: string[] = ...
```

The fields of the data model for which changes count as a movement action.

---

## Accessors

### actor

```typescript
get actor(): null | documents.Actor
```

A reference to the Actor this Token modifies. If `actorLink` is true, then the document is the primary Actor document. Otherwise, the Actor document is a synthetic (ephemeral) document constructed using the Token's ActorDelta.

**Returns**: `null | documents.Actor`

### baseActor

```typescript
get baseActor(): null | documents.Actor
```

A reference to the base, World-level Actor this token represents.

**Returns**: `null | documents.Actor`

### combatant

```typescript
get combatant(): null | documents.Combatant
```

Return a reference to a Combatant that represents this Token, if one is present in the current encounter.

**Returns**: `null | documents.Combatant`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**: `null | string`

### inCombat

```typescript
get inCombat(): boolean
```

An indicator for whether this Token is currently involved in the active combat encounter.

**Returns**: `boolean`

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**: `boolean`

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**: `boolean`

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**: `boolean`

### isLinked

```typescript
get isLinked(): boolean
```

A convenient reference for whether this TokenDocument is linked to the Actor it represents, or is a synthetic copy.

**Returns**: `boolean`

### isOwner

```typescript
get isOwner(): boolean
```

An indicator for whether the current User has full control over this Token document.

**Returns**: `boolean`

### isSecret

```typescript
get isSecret(): boolean
```

Does this TokenDocument have the SECRET disposition and is the current user lacking the necessary permissions that would reveal this secret?

**Returns**: `boolean`

### movement

```typescript
get movement(): DeepReadonly<TokenMovementData>
```

The current movement data of this Token document.

**Returns**: `DeepReadonly<TokenMovementData>`

### movementHistory

```typescript
get movementHistory(): TokenMeasuredMovementWaypoint[]
```

The movement history.

**Returns**: `TokenMeasuredMovementWaypoint[]`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**: `SchemaField`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**: `string`

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**: `typeof Document`

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**: `string`

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**: `abstract.DatabaseBackend`

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**: `string`

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**: `boolean`

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**: `Readonly<Record<string, any>>`

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**: `typeof Document`

### schema

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**: `SchemaField`

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**: `string[]`

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- __namedParameters?: `{ pack?: null; parentCollection?: null } = {}`

**Returns**: `void`

---

### _initialize

```typescript
_initialize(options?: {}): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- options?: `{}` = {}

**Returns**: `void`

---

### _initializeSource

```typescript
_initializeSource(data: any, options: any): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- data: `any` — The candidate source data from which the model will be constructed
- options: `any` — Options provided to the model constructor

**Returns**: `object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

---

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- data: `any` — The initial data object provided to the document creation request
- options: `any` — Additional options which modify the creation request
- userId: `any` — The id of the User requesting the document update

**Returns**: `void`

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

- parent: `any`  
- collection: `any`  
- documents: `any`  
- data: `any`  
- options: `any`  
- userId: `any`

**Returns**: `void`

---

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- options: `any` — Additional options which modify the deletion request
- userId: `any` — The id of the User requesting the document update

**Returns**: `void`

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

- parent: `any`  
- collection: `any`  
- documents: `any`  
- ids: `any`  
- options: `any`  
- userId: `any`

**Returns**: `void`

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- changed: `any` — The differential data that was changed relative to the documents prior values
- options: `any` — Additional options which modify the update request
- userId: `any` — The id of the User requesting the document update

**Returns**: `void`

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

- parent: `any`  
- collection: `any`  
- documents: `any`  
- changes: `any`  
- options: `any`  
- userId: `any`

**Returns**: `void`

---

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

**Parameters**

- parent: `any`  
- collection: `any`  
- data: `any`  
- options: `any`  
- userId: `any`

**Returns**: `void`

---

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

**Parameters**

- parent: `any`  
- collection: `any`  
- ids: `any`  
- options: `any`  
- userId: `any`

**Returns**: `void`

---

### _preUpdate

```typescript
_preUpdate(changed: any, options: any, user: any): Promise<undefined | false>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- changed: `any` — The candidate changes to the Document
- options: `any` — Additional options which modify the update request
- user: `any` — The User requesting the document update

**Returns**: `Promise<undefined | false>`  
A return value of false indicates the update operation should be cancelled.

---

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

**Parameters**

- parent: `any`  
- collection: `any`  
- changes: `any`  
- options: `any`  
- userId: `any`

**Returns**: `void`

---

### canUserModify

```typescript
canUserModify(
    user: foundry.documents.BaseUser, 
    action: string, 
    data?: object
): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser` — The User attempting modification
- **action**: `string` — The attempted action
- **data?**: `object = {}` — Data involved in the attempted action

**Returns**: `boolean` — Does the User have permission?

---

### clearMovementHistory

```typescript
clearMovementHistory(): Promise<void>
```

Clear the movement history of this Token.

**Returns**: `Promise<void>`

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

- **data?**: `object = {}` — Additional data which overrides current document data at the time of creation
- **context?**: `DocumentConstructionContext & DocumentCloneOptions = {}` — Additional context options passed to the create method

**Returns**: `Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>` — The cloned Document instance

---

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

**Parameters**

- **embeddedName**: `string` — The name of the embedded Document type
- **data?**: `object[] = []` — An array of data objects used to create multiple documents
- **operation?**: `DatabaseCreateOperation = {}` — Parameters of the database creation workflow

**Returns**: `Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">> = {}` — Parameters of the deletion operation

**Returns**: `Promise<undefined | Document<object, DocumentConstructionContext>>` — The deleted Document instance, or undefined if not deleted

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- **embeddedName**: `string` — The name of the embedded Document type
- **ids**: `string[]` — An array of string ids for each Document to be deleted
- **operation?**: `DatabaseDeleteOperation = {}` — Parameters of the database deletion workflow

**Returns**: `Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

---

### getBarAttribute

```typescript
getBarAttribute(
    barName: string,
    options?: { alternative?: string }
): null | object
```

A helper method to retrieve the underlying data behind one of the Token's attribute bars.

**Parameters**

- **barName**: `string` — The named bar to retrieve the attribute for
- **options?**: `{ alternative?: string } = {}` — Options

Optional options:

- **alternative?**: `string` — An alternative attribute path to get instead of the default one

**Returns**: `null | object` — The attribute displayed on the Token bar, if any

---

### getCenterPoint

```typescript
getCenterPoint(data?: Partial<ElevatedPoint & TokenDimensions>): ElevatedPoint
```

Get the center point of the Token.

**Parameters**

- **data?**: `Partial<ElevatedPoint & TokenDimensions> = {}` — The position and dimensions

**Returns**: `ElevatedPoint` — The center point

Inherited from [BaseToken.getCenterPoint](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getcenterpoint)

---

### getCompleteMovementPath

```typescript
getCompleteMovementPath(
    waypoints: TokenGetCompleteMovementPathWaypoint[]
): TokenCompleteMovementWaypoint[]
```

Get the path of movement with the intermediate steps of the direct path between waypoints.

**Parameters**

- **waypoints**: `TokenGetCompleteMovementPathWaypoint[]` — The waypoints of movement

**Returns**: `TokenCompleteMovementWaypoint[]` — The path of movement with all intermediate steps

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: any): any
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `any` — The name of the embedded Document type

**Returns**: `any` — The Collection instance of embedded Documents of the requested type

Overrides [BaseToken.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getembeddedcollection)

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
- **options?**: `{ invalid?: boolean; strict?: boolean } = {}` — Additional options which modify how embedded documents are retrieved

Optional options:

- **invalid?**: `boolean` — Allow retrieving an invalid Embedded Document.
- **strict?**: `boolean` — Throw an Error if the requested id does not exist. See Collection#get

**Returns**: `Document<object, DocumentConstructionContext>` — The retrieved embedded Document instance, or undefined

Throws if the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseToken.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key
- **key**: `string` — The flag key

**Returns**: `any` — The flag value

Inherited from [BaseToken.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getflag)

---

### getGridSpacePolygon

```typescript
getGridSpacePolygon(data?: Partial<TokenDimensions>): void | Point[]
```

Get the grid space polygon of the Token. Returns undefined in gridless grids because there are no grid spaces.

**Parameters**

- **data?**: `Partial<TokenDimensions> = {}` — The dimensions

**Returns**: `void | Point[]` — The grid space polygon or undefined if gridless

Inherited from [BaseToken.getGridSpacePolygon](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getgridspacepolygon)

---

### getOccupiedGridSpaceOffsets

```typescript
getOccupiedGridSpaceOffsets(
    data?: Partial<Point & TokenDimensions>,
): GridOffset2D[]
```

Get the offsets of grid spaces that are occupied by this Token at the current or given position. The grid spaces the Token occupies are those that are covered by the Token's shape in the snapped position. Returns an empty array in gridless grids.

**Parameters**

- **data?**: `Partial<Point & TokenDimensions> = {}` — The position and dimensions

**Returns**: `GridOffset2D[]` — The offsets of occupied grid spaces

Inherited from [BaseToken.getOccupiedGridSpaceOffsets](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getoccupiedgridspaceoffsets)

---

### getSize

```typescript
getSize(data?: Partial<{ height: number; width: number }>): { height: number; width: number }
```

Get the width and height of the Token in pixels.

**Parameters**

- **data?**: `Partial<{ height: number; width: number }> = {}` — The width and/or height in grid units (must be positive)

**Returns**: `{ height: number; width: number }` — The width and height in pixels

Inherited from [BaseToken.getSize](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getsize)

---

### getSnappedPosition

```typescript
getSnappedPosition(data?: Partial<ElevatedPoint & TokenDimensions>): ElevatedPoint
```

Get the snapped position of the Token.

**Parameters**

- **data?**: `Partial<ElevatedPoint & TokenDimensions> = {}` — The position and dimensions

**Returns**: `ElevatedPoint` — The snapped position

Inherited from [BaseToken.getSnappedPosition](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getsnappedposition)

---

### getUserLevel

```typescript
getUserLevel(user: any): any
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user**: `any` — The User being tested

**Returns**: `any` — A numeric permission level from `CONST.DOCUMENT_OWNERSHIP_LEVELS`

Inherited from [BaseToken.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getuserlevel)

---

### hasStatusEffect

```typescript
hasStatusEffect(statusId: string): boolean
```

Test whether a Token has a specific status effect.

**Parameters**

- **statusId**: `string` — The status effect ID as defined in `CONFIG.statusEffects`

**Returns**: `boolean` — Does the Actor of the Token have this status effect?

---

### measureMovementPath

```typescript
measureMovementPath(
    waypoints: TokenMeasureMovementPathWaypoint[],
    options?: { cost?: TokenMovementCostFunction },
): GridMeasurePathResult
```

Measure the movement path for this Token.

**Parameters**

- **waypoints**: `TokenMeasureMovementPathWaypoint[]` — The waypoints of movement
- **options?**: `{ cost?: TokenMovementCostFunction } = {}` — Additional measurement options

Optional Options:

- **cost?**: `TokenMovementCostFunction` — The function that returns the cost for a given move between grid spaces (default is the distance travelled along the direct path)

**Returns**: `GridMeasurePathResult`

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the `template.json` specification included by the game system.

**Returns**: `object` — The migrated system data object

Inherited from [BaseToken.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#migratesystemdata)

---

### move

```typescript
move(
    waypoints: Partial<TokenMovementWaypoint> | Partial<TokenMovementWaypoint>[],
    options?: Partial<
        Omit<DatabaseUpdateOperation, "updates"> & {
            autoRotate: boolean;
            constrainOptions: any;
            method: TokenMovementMethod;
            showRuler: boolean;
        }
    >,
): Promise<boolean>
```

Move the Token through the given waypoint(s).

**Parameters**

- **waypoints**: `Partial<TokenMovementWaypoint> | Partial<TokenMovementWaypoint>[]` — The waypoint(s) to move the Token through
- **options?**: Partial update operation parameters such as `autoRotate`, `constrainOptions`, `method`, and `showRuler`. Defaults to `{}`.

**Returns**: `Promise<boolean>`  
A Promise that resolves to true if the Token was moved, otherwise resolves to false

---

### pauseMovement

```typescript
pauseMovement(): null | TokenResumeMovementCallback
```

Pause the movement of this Token document. The movement can be resumed after being paused. Only the User that initiated the movement can pause it. Returns a callback that can be used to resume the movement later. Only after all callbacks and keys have been called is the movement of the Token resumed. If the callback is called within the update operation workflow, the movement is resumed after the workflow.

**Returns**: `null | TokenResumeMovementCallback` — The callback to resume movement if the movement was or is paused, otherwise null

#### Example

```typescript
pauseMovement(key: string): null | Promise<boolean>
```

Pause the movement of this Token document. The movement can be resumed after being paused. Only the User that initiated the movement can pause it. Returns a promise that resolves to true if the movement was resumed by [TokenDocument.resumeMovement](#resumeMovement) with the same key that was passed to this function. Only after all callbacks and keys have been called is the movement of the Token resumed. If the callback is called within the update operation workflow, the movement is resumed after the workflow.

// This is an Execute Script Region Behavior that makes the token invisible
// On TOKEN_MOVE_IN...
if (!event.user.isSelf) return;
const resumeMovement = event.data.token.pauseMovement();
event.data.token.toggleStatusEffect("invisible", {active: true});
const resumed = await resumeMovement();
```

---

### prepareBaseData

```typescript
prepareBaseData(): void
```

Prepare base data for the document.

**Returns**: `void`

---

### prepareDerivedData

```typescript
prepareDerivedData(): void
```

Prepare derived data for the document.

**Returns**: `void`

---

### prepareEmbeddedDocuments

```typescript
prepareEmbeddedDocuments(): void
```

Prepare embedded document data.

**Returns**: `void`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**: `void`

Inherited from [BaseToken.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#reset)

---

### resize

```typescript
resize(
    dimensions: Partial<TokenDimensions>,
    options?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<boolean>
```

Resize the token Token such that its center point remains (almost) unchanged. The center point might change slightly because the new (x, y) position is rounded.

**Parameters**

- **dimensions**: `Partial<TokenDimensions>` — The new dimensions
- **options?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` — Parameters of the update operation

**Returns**: `Promise<boolean>` — A Promise that resolves to true if the Token was resized, otherwise resolves to false

---

### resumeMovement

```typescript
resumeMovement(movementId: string, key: string): void
```

Resume the movement given its ID and the key that was passed to [TokenDocument.pauseMovement](#pauseMovement).

**Parameters**

- **movementId**: `string` — The movement ID
- **key**: `string` — The key that was passed to `pauseMovement`

**Returns**: `void`

---

### segmentizeRegionMovementPath

```typescript
segmentizeRegionMovementPath(
    region: RegionDocument,
    waypoints: TokenSegmentizeMovementWaypoint[],
): TokenRegionMovementSegment[]
```

Split the Token movement path through the Region into its segments. The Token and the Region must be in the same Scene.

Implementations of this function are restricted in the following ways:

- The segments must go through the waypoints.
- The `from` position matches the `to` position of the succeeding segment.
- The Token must be contained (w.r.t. `testInsideRegion`) within the Region at the `from` and `to` of MOVE segments.
- The Token must be contained within the Region at the `to` position of ENTER segments.
- The Token must be contained within the Region at the `from` position of EXIT segments.
- The Token must not be contained within the Region at the `from` position of ENTER segments.
- The Token must not be contained within the Region at the `to` position of EXIT segments.
- This function must not use prepared field values that are animated. In particular, it must use the source instead of prepared values of the following fields: `x`, `y`, `elevation`, `width`, `height`, and `shape`.

**Parameters**

- **region**: `RegionDocument` — The region
- **waypoints**: `TokenSegmentizeMovementWaypoint[]` — The waypoints of movement

**Returns**: `TokenRegionMovementSegment[]` — The movement split into its segments

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

**Returns**: `Promise<Document<object, DocumentConstructionContext>>` — A Promise resolving to the updated document

Inherited from [BaseToken.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#setflag)

---

### stopMovement

```typescript
stopMovement(): boolean
```

Stop the movement of this Token document. The movement cannot be continued after being stopped. Only the User that initiated the movement can stop it.

**Returns**: `boolean` — True if the movement was or is stopped, otherwise false

---

### testInsideRegion

```typescript
testInsideRegion(region: RegionDocument): boolean
```

Test whether the Token is inside the Region. This function determines the state of `regions` and [RegionDocument.tokens](https://foundryvtt.com/api/classes/foundry.documents.RegionDocument.html#tokens). The Token and the Region must be in the same Scene.

Implementations of this function are restricted in the following ways:

- If the bounds (given by `getSize`) of the Token do not intersect the Region, then the Token is not contained within the Region.
- If the Token is inside the Region at a particular elevation, then the Token is inside the Region at any elevation within the elevation range of the Region.
- This function must not use prepared field values that are animated. In particular, it must use the source instead of prepared values of the following fields: `x`, `y`, `elevation`, `width`, `height`, and `shape`.
- If this function is overridden, then `segmentizeRegionMovementPath` must be overridden too.
- If an override of this function uses Token document fields other than `x`, `y`, `elevation`, `width`, `height`, and `shape`, ` _couldRegionsChange` must be overridden to return true for changes of these fields. If an override of this function uses non-Token properties other than `Scene.grid.type` and `Scene.grid.size`, `Scene.updateTokenRegions` must be called when any of those properties change.

**Parameters**

- **region**: `RegionDocument` — The region.

**Returns**: `boolean` — Is inside the Region?

---

### testInsideRegion (overload)

```typescript
testInsideRegion(
    region: RegionDocument,
    data: Partial<ElevatedPoint & TokenDimensions>,
): boolean
```

Test whether the Token is inside the Region based on the given position and dimensions. Defaults to the values of the document source.

**Parameters**

- **region**: `RegionDocument` — The region.
- **data**: `Partial<ElevatedPoint & TokenDimensions>` — The position and dimensions.

**Returns**: `boolean` — Is inside the Region?

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

- **user**: `BaseUser` — The User being tested
- **permission**: `DocumentOwnershipLevel` — The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
- **options?**: `{ exact?: boolean } = {}` — Additional options involved in the permission test

Optional:

- **exact?**: `boolean` — Require the exact permission level requested?

**Returns**: `boolean` — Does the user have this permission level over the Document?

Inherited from [BaseToken.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#testuserpermission)

---

### toggleCombatant

```typescript
toggleCombatant(options?: { active?: boolean }): Promise<boolean>
```

Add or remove this Token from a Combat encounter.

**Parameters**

- **options?**: `{ active?: boolean } = {}` — Additional options passed to `TokenDocument.createCombatants` or `TokenDocument.deleteCombatants`

Optional:

- **active?**: `boolean` — Require this token to be an active Combatant or to be removed. Otherwise, the current combat state of the Token is toggled.

**Returns**: `Promise<boolean>` — Is this Token now an active Combatant?

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**: `object` — The document source data expressed as a plain object

Inherited from [BaseToken.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source?**: `boolean = true` — Draw values from the underlying data source rather than transformed values

**Returns**: `any` — The extracted primitive object

Inherited from [BaseToken.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath?**: `string` — A parent field path already traversed

**Returns**: `Generator<any, void, any>`

Inherited from [BaseToken.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#traverseembeddeddocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key
- **key**: `string` — The flag key

**Returns**: `Promise<Document<object, DocumentConstructionContext>>` — The updated document instance

Inherited from [BaseToken.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#unsetflag)

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

- **data?**: `object = {}` — Differential update data which modifies the existing values of this document
- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` — Parameters of the update operation

**Returns**: `Promise<undefined | Document<object, DocumentConstructionContext>>` — The updated Document instance, or undefined not updated

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseToken.update](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#update)

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
- **updates?**: `object[] = []` — An array of differential data objects, each used to update a single Document
- **operation?**: `DatabaseUpdateOperation = {}` — Parameters of the database update workflow

**Returns**: `Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseToken.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(changes?: {}, options?: {}): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes?**: `{ } = {}` — New values which should be applied to the data model
- **options?**: `{ } = {}` — Options which determine how the new data is merged

**Returns**: `object` — An object containing differential keys and values that were changed

Throws an error if the requested data model changes were invalid.

Inherited from [BaseToken.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#updatesource)

---

### updateVisionMode

```typescript
updateVisionMode(visionMode: string, defaults?: boolean): Promise<undefined | TokenDocument>
```

Convenience method to change a token vision mode.

**Parameters**

- **visionMode**: `string` — The vision mode to apply to this token.
- **defaults?**: `boolean = true` — If the vision mode should be updated with its defaults.

**Returns**: `Promise<undefined | TokenDocument>` — The updated Document instance, or undefined not updated.

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options?**: `DataModelValidationOptions = {}` — Options which modify how the model is validated

**Returns**: `boolean` — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

Throws an error thrown if validation is strict and a failure occurs.

Inherited from [BaseToken.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#validate)

---

### _couldRegionsChange

```typescript
_protected _couldRegionsChange(changes: object): boolean
```

Protected method.

Is the Token document updated such that the Regions the Token is contained in may change? Called as part of the preUpdate workflow.

**Parameters**

- **changes**: `object` — The changes.

**Returns**: `boolean` — Could this Token update change Region containment?

---

### _inferMovementAction

```typescript
_protected _inferMovementAction(): string
```

Protected method.

Infer the movement action. The default implementation returns `CONFIG.Token.movement.defaultAction`.

**Returns**: `string`

---

### _inferRingSubjectTexture

```typescript
_protected _inferRingSubjectTexture(): string
```

Protected method.

Infer the subject texture path to use for a token ring.

**Returns**: `string`

---

### _onMovementPaused

```typescript
_protected _onMovementPaused(): void
```

Called when the current movement is paused.

**Returns**: `void`

---

### _onMovementRecorded

```typescript
_protected _onMovementRecorded(): void
```

Called when the movement is recorded or cleared.

**Returns**: `void`

---

### _onMovementStopped

```typescript
_protected _onMovementStopped(): void
```

Called when the current movement is stopped.

**Returns**: `void`

---

### _onRelatedUpdate

```typescript
_protected _onRelatedUpdate(update?: object, operation?: Partial<DatabaseUpdateOperation>): void
```

Whenever the token's actor delta changes, or the base actor changes, perform associated refreshes.

**Parameters**

- **update?**: `object = {}` — The update delta
- **operation?**: `Partial<DatabaseUpdateOperation> = {}` — The database operation that was performed

**Returns**: `void`

---

### _onUpdateMovement

```typescript
_protected _onUpdateMovement(
    movement: DeepReadonly<TokenMovementOperation>,
    operation: Partial<DatabaseUpdateOperation>,
    user: documents.User,
): void
```

Post-process an update operation of a movement.

**Parameters**

- **movement**: `DeepReadonly<TokenMovementOperation>` — The movement of this Token
- **operation**: `Partial<DatabaseUpdateOperation>` — The update operation
- **user**: `documents.User` — The User that requested the update operation

**Returns**: `void`

---

### _preCreate

```typescript
_protected _preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using `updateSource`.

**Parameters**

- **data**: `object` — The initial data object provided to the document creation request
- **options**: `object` — Additional options which modify the creation request
- **user**: `BaseUser` — The User requesting the document creation

**Returns**: `Promise<boolean | void>`  
Return false to exclude this Document from the creation operation.

Inherited from [BaseToken._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_precreate)

---

### _preDelete

```typescript
_protected _preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object` — Additional options which modify the deletion request
- **user**: `BaseUser` — The User requesting the document deletion

**Returns**: `Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

Inherited from [BaseToken._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_predelete)

---

### _prepareDetectionModes

```typescript
_protected _prepareDetectionModes(): void
```

Prepare detection modes which are available to the Token. Ensure that every Token has the basic sight detection mode configured.

**Returns**: `void`

---

### _preUpdateMovement

```typescript
_protected _preUpdateMovement(
    movement: DeepReadonly<Omit<TokenMovementOperation, "autoRotate" | "showRuler">> & Pick<TokenMovementOperation, "autoRotate" | "showRuler">,
    operation: Partial<DatabaseUpdateOperation>,
): Promise<boolean | void>
```

Reject the movement or modify the update operation as needed based on the movement. Called after the movement for this document update has been determined. The waypoints of movement are final and cannot be changed. The movement can only be rejected entirely.

**Parameters**

- **movement**: `DeepReadonly<Omit<TokenMovementOperation, "autoRotate" | "showRuler">> & Pick<TokenMovementOperation, "autoRotate" | "showRuler">` — The pending movement of this Token
- **operation**: `Partial<DatabaseUpdateOperation>` — The update operation

**Returns**: `Promise<boolean | void>`  
If false, the movement is prevented.

---

### _shouldRecordMovementHistory

```typescript
_protected _shouldRecordMovementHistory(): boolean
```

Should the movement of this Token update be recorded in the movement history? Called as part of the preUpdate workflow if the Token is moved.

**Returns**: `boolean`

---

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

Inherited from [BaseToken._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_initializationorder)

---

### _onCreateOperation

```typescript
static _onCreateOperation(documents: any, operation: any, user: any): Promise<void>
```

Overrides [BaseToken._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_oncreateoperation)

---

### _onDeleteOperation

```typescript
static _onDeleteOperation(documents: any, operation: any, user: any): Promise<void>
```

Overrides [BaseToken._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_ondeleteoperation)

---

### _onUpdateOperation

```typescript
static _onUpdateOperation(documents: any, operation: any, user: any): Promise<void>
```

Overrides [BaseToken._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_onupdateoperation)

---

### _preCreateOperation

```typescript
static _preCreateOperation(documents: any, operation: any, user: any): Promise<undefined | false>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

Modifications to pending documents must mutate the documents array or alter individual document instances using `updateSource`.

**Parameters**

- **documents**: `any` — Pending document instances to be created
- **operation**: `any` — Parameters of the database creation operation
- **user**: `any` — The User requesting the creation operation

**Returns**: `Promise<undefined | false>`  
Return false to cancel the creation operation entirely.

Overrides [BaseToken._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_precreateoperation)

---

### _preUpdateOperation

```typescript
static _preUpdateOperation(documents: any, operation: any, user: any): Promise<undefined | false>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- **documents**: `any` — Document instances to be updated
- **operation**: `any` — Parameters of the database update operation
- **user**: `any` — The User requesting the update operation

**Returns**: `Promise<undefined | false>`  
Return false to cancel the update operation entirely.

Overrides [BaseToken._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_preupdateoperation)

---

### canUserCreate

```typescript
static canUserCreate(user: foundry.documents.BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user**: `BaseUser` — The User being tested

**Returns**: `boolean` — Does the User have a sufficient role to create?

Inherited from [BaseToken.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#canusercreate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source?**: `object = {}` — The source data object
- **options?**: `object = {}` — Additional options which are passed to field cleaning methods

**Returns**: `object` — The cleaned source data, which is the same object as the `source` argument

Inherited from [BaseToken.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#cleandata)

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

- **data?**: `object | Document<object, DocumentConstructionContext> | Array<object | Document<object, DocumentConstructionContext>>` — Initial data used to create this Document, or a Document instance to persist.
- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">> = {}` — Parameters of the creation operation

**Returns**: `Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>` — The created Document instance(s)

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseToken.create](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#create)

---

### createCombatants

```typescript
static createCombatants(
    tokens: TokenDocument[],
    options?: { combat?: any },
): Promise<documents.Combatant[]>
```

Create or remove Combatants for an array of provided Token objects.

**Parameters**

- **tokens**: `TokenDocument[]` — The tokens which should be added to the Combat
- **options?**: `{ combat?: any } = {}` — Options which modify the toggle operation

Optional:

- **combat?**: `any` — A specific Combat instance which should be modified. If undefined, the current active combat will be modified if one exists. Otherwise, a new Combat encounter will be created if the requesting user is a Gamemaster.

**Returns**: `Promise<documents.Combatant[]>` — An array of created Combatant documents

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

- **data?**: `(object | Document<object, DocumentConstructionContext>)[] = []` — An array of data objects or existing Documents to persist.
- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">> = {}` — Parameters of the requested creation operation

**Returns**: `Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances

Examples:

- Create a single Document
- Create multiple Documents
- Create multiple embedded Documents within a parent
- Create a Document within a Compendium pack

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

Inherited from [BaseToken.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#createdocuments)

---

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _movementHistory: ArrayField<SchemaField>;
    _regions: ArrayField<ForeignDocumentField>;
    actorId: ForeignDocumentField;
    actorLink: BooleanField;
    alpha: AlphaField;
    bar1: SchemaField;
    bar2: SchemaField;
    delta: ActorDeltaField;
    detectionModes: ArrayField<SchemaField>;
    displayBars: NumberField;
    displayName: NumberField;
    disposition: NumberField;
    elevation: NumberField;
    flags: DocumentFlagsField;
    height: NumberField;
    hidden: BooleanField;
    light: EmbeddedDataField;
    locked: BooleanField;
    lockRotation: BooleanField;
    movementAction: StringField;
    name: StringField;
    occludable: SchemaField;
    ring: SchemaField;
    rotation: AngleField;
    shape: NumberField;
    sight: SchemaField;
    sort: NumberField;
    texture: TextureData;
    turnMarker: SchemaField;
    width: NumberField;
    x: NumberField;
    y: NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

Inherited from [BaseToken.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#defineschema)

---

### deleteCombatants

```typescript
static deleteCombatants(tokens: TokenDocument[], options?: { combat?: any }): Promise<documents.Combatant[]>
```

Remove Combatants for the array of provided Tokens.

**Parameters**

- **tokens**: `TokenDocument[]` — The tokens which should removed from the Combat
- **options?**: `{ combat?: any } = {}` — Options which modify the operation

Optional:

- **combat?**: `any` — A specific Combat instance from which Combatants should be deleted

**Returns**: `Promise<documents.Combatant[]>` — An array of deleted Combatant documents

---

### deleteDocuments

```typescript
static deleteDocuments(ids?: string[], operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids?**: `string[] = []` — An array of string ids for the documents to be deleted
- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">> = {}` — Parameters of the database deletion operation

**Returns**: `Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances

Examples:

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);
```

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string` — Serialized document data in string format

**Returns**: `DataModel<object, DataModelConstructionContext>` — A constructed data model instance

Inherited from [BaseToken.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#fromjson)

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

- **source**: `object` — Initial document data which comes from a trusted source.
- **context?**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}` — Model construction context

**Returns**: `DataModel<object, DataModelConstructionContext>`

Inherited from [BaseToken.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#fromsource)

---

### get

```typescript
static get(documentId: string, operation?: DatabaseGetOperation): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string` — The Document ID
- **operation?**: `DatabaseGetOperation = {}` — Parameters of the get operation

**Returns**: `null | Document<object, DocumentConstructionContext>` — The retrieved Document, or null

Inherited from [BaseToken.get](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#get)

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string` — An existing collection name or a document name.

**Returns**: `null | string` — The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

Examples:

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"
Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [BaseToken.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#getcollectionname)

---

### getTrackedAttributeChoices

```typescript
static getTrackedAttributeChoices(attributes: object): object
```

Inspect the Actor data model and identify the set of attributes which could be used for a Token Bar.

**Parameters**

- **attributes**: `object` — The tracked attributes which can be chosen from

**Returns**: `object` — A nested object of attribute choices to display

---

### getTrackedAttributes

```typescript
static getTrackedAttributes(
    data?: string | object | typeof DataModel | DataModel<object, DataModelConstructionContext> | SchemaField,
    _path?: string[],
): TrackedAttributesDescription
```

Get an Array of attribute choices which could be tracked for Actors in the Combat Tracker.

**Parameters**

- **data?**: `string | object | typeof DataModel | DataModel<object, DataModelConstructionContext> | SchemaField` — The object to explore for attributes, or an Actor type.
- **_path?**: `string[] = []`

**Returns**: `TrackedAttributesDescription`

---

### migrateData

```typescript
static migrateData(data: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **data**: `any` — The candidate source data from which the model will be constructed

**Returns**: `object` — Migrated source data, which is the same object as the `source` argument

Inherited from [BaseToken.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object` — The candidate source data from which the model will be constructed

**Returns**: `object` — Migrated source data, which is the same object as the `source` argument

Inherited from [BaseToken.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `any` — Data which matches the current schema
- **options**: `any` — Additional shimming options

**Returns**: `object` — Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [BaseToken.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#shimdata)

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

- **updates?**: `object[] = []` — An array of differential data objects, each used to update a single Document
- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">> = {}` — Parameters of the database update operation

**Returns**: `Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances

Examples:

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

Inherited from [BaseToken.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#updatedocuments)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object` — Candidate data for the model

**Returns**: `void`

Throws an error if a validation failure is detected.

Inherited from [BaseToken.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#validatejoint)

---

### _getConfiguredTrackedAttributes

```typescript
protected static _getConfiguredTrackedAttributes(type?: string): void | TrackedAttributesDescription
```

Retrieve any configured attributes for a given Actor type.

**Parameters**

- **type?**: `string` — The Actor type.

**Returns**: `void | TrackedAttributesDescription`

---

### _getTrackedAttributesFromObject

```typescript
protected static _getTrackedAttributesFromObject(data: object, _path?: string[]): TrackedAttributesDescription
```

Retrieve an Array of attribute choices from a plain object.

**Parameters**

- **data**: `object` — The object to explore for attributes.
- **_path?**: `string[] = []`

**Returns**: `TrackedAttributesDescription`

---

### _getTrackedAttributesFromSchema

```typescript
protected static _getTrackedAttributesFromSchema(schema: SchemaField, _path?: string[]): TrackedAttributesDescription
```

Retrieve an Array of attribute choices from a SchemaField.

**Parameters**

- **schema**: `SchemaField` — The schema to explore for attributes.
- **_path?**: `string[] = []`

**Returns**: `TrackedAttributesDescription`

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

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or using `updateSource`.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Document instances to be deleted
- **operation**: `DatabaseDeleteOperation` — Parameters of the database update operation
- **user**: `BaseUser` — The User requesting the deletion operation

**Returns**: `Promise<boolean | void>`  
Return false to cancel the deletion operation entirely.

Inherited from [BaseToken._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseToken.html#_predeleteoperation)