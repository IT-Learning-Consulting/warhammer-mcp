# Actor | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side Actor document which extends the common BaseActor model.

---

## Hook Events

- [hookEvents.applyCompendiumArt](https://foundryvtt.com/api/functions/hookEvents.applyCompendiumArt.html)
- [hookEvents.modifyTokenAttribute](https://foundryvtt.com/api/functions/hookEvents.modifyTokenAttribute.html)

## Mixes

- ClientDocumentMixin

## See Also

- [foundry.documents.collections.Actors](https://foundryvtt.com/api/classes/foundry.documents.collections.Actors.html): The world-level collection of Actor documents
- [foundry.applications.sheets.ActorSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.ActorSheetV2.html): The Actor configuration application

## Example Usage

**Create a new Actor**

```typescript
let actor = await Actor.implementation.create({
  name: "New Test Actor",
  type: "character",
  img: "artwork/character-profile.jpg"
});
```

**Retrieve an existing Actor**

```typescript
let actor = game.actors.get(actorId);
```

## Hierarchy

- [BaseActor<this>](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html)
- **Actor**

---

# Actor Class Reference

## Constructors

```typescript
new Actor(
    data?: Partial<ActorData>,
    options?: DocumentConstructionContext,
): documents.Actor
```

**Parameters**

- **data** (optional): `Partial<ActorData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options** (optional): `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.Actor`  

_This constructor is inherited from [BaseActor.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#constructor)._

---

## Properties

### _source

```typescript
_source: ActorData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

_Inherited from [BaseActor._source](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_source)._

### overrides

```typescript
overrides: object = ...
```

An object that tracks the changes to the data model which were applied by active effects.

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

_Inherited from [BaseActor.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#parent)._

### statuses

```typescript
statuses: Set<string> = ...
```

The statuses that are applied to this actor by active effects.

### DEFAULT_ICON _(static)_

```typescript
DEFAULT_ICON: string = CONST.DEFAULT_TOKEN
```

The default icon used for newly created Actor documents.

_Inherited from [BaseActor.DEFAULT_ICON](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#default_icon)._

### LOCALIZATION_PREFIXES _(static)_

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

_Inherited from [BaseActor.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#localization_prefixes)._

### metadata _(static)_

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

_Inherited from [BaseActor.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#metadata)._

---

## Accessors

### appliedEffects

```typescript
get appliedEffects(): documents.ActiveEffect[]
```

Retrieve the list of ActiveEffects that are currently applied to this Actor.

**Returns**  
`documents.ActiveEffect[]`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

_Inherited from ClientDocumentMixin(BaseActor).id_

### inCombat

```typescript
get inCombat(): boolean
```

Whether the Actor has at least one Combatant in the active Combat that represents it.

**Returns**  
`boolean`

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActor).inCompendium_

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActor).invalid_

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActor).isEmbedded_

### isToken

```typescript
get isToken(): boolean
```

Test whether an Actor document is a synthetic representation of a Token (`true`) or a full Document (`false`).

**Returns**  
`boolean`

### itemTypes

```typescript
get itemTypes(): Record<string, documents.Item[]>
```

A convenience getter to an object that organizes all embedded Item instances by subtype.  
The object is cached and lazily re-computed as needed.

**Returns**  
`Record<string, documents.Item[]>`

See [foundry.abstract.EmbeddedCollection#documentsByType](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#documentsbytype)

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

_Inherited from ClientDocumentMixin(BaseActor).schema_

### temporaryEffects

```typescript
get temporaryEffects(): documents.ActiveEffect[]
```

An array of ActiveEffect instances which are present on the Actor which have a limited duration.

**Returns**  
`documents.ActiveEffect[]`

### thumbnail

```typescript
get thumbnail(): string
```

Provide a thumbnail image path used to represent this document.

**Returns**  
`string`

### token

```typescript
get token(): null | TokenDocument
```

Return a reference to the TokenDocument which owns this Actor as a synthetic override.

**Returns**  
`null | TokenDocument`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseActor).uuid_

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

_Inherited from ClientDocumentMixin(BaseActor).validationFailures_

---

## Static Accessors

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

_Inherited from ClientDocumentMixin(BaseActor).baseDocument_

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseActor).collectionName_

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

_Inherited from ClientDocumentMixin(BaseActor).database_

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example `"Actor"`.

**Returns**  
`string`

_Inherited from ClientDocumentMixin(BaseActor).documentName_

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

_Inherited from ClientDocumentMixin(BaseActor).hasTypeData_

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

_Inherited from ClientDocumentMixin(BaseActor).hierarchy_

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

_Inherited from ClientDocumentMixin(BaseActor).implementation_

### schema

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

_Inherited from ClientDocumentMixin(BaseActor).schema_

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

_Inherited from ClientDocumentMixin(BaseActor).TYPES_

---

## Methods

### _configure

```typescript
_configure(options?: {}): void
```

**Parameters**

- **options**: `{}` = `{}`

**Returns**  
`void`

Overrides [BaseActor._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_configure).

---

### _initialize

```typescript
_initialize(options: any): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: `any` — Options provided to the model constructor

**Returns**  
`void`

_Inherited from [BaseActor._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_initialize)._

---

### _initializeSource

```typescript
_initializeSource(source: any, options?: {}): any
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **source**: `any` — The candidate source data from which the model will be constructed  
- **options**: `{}` = `{}` — Options provided to the model constructor

**Returns**  
`any` — Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

Overrides [BaseActor._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_initializesource).

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

- **changed**: `any` — The differential data that was changed relative to the document's prior values  
- **options**: `any` — Additional options which modify the update request  
- **userId**: `any` — The id of the User requesting the document update

**Returns**  
`void`

Overrides [BaseActor._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_onupdate).

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

### _preCreate

```typescript
_preCreate(data: any, options: any, user: any): Promise<undefined | false>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.  
Modifications to the pending Document instance must be performed using [updateSource](#updateSource).

**Parameters**

- **data**: `any` — The initial data object provided to the document creation request  
- **options**: `any` — Additional options which modify the creation request  
- **user**: `any` — The User requesting the document creation

**Returns**  
`Promise<undefined | false>` — Return false to exclude this Document from the creation operation

Inherited from [BaseActor._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_precreate).  

---

### _preUpdate

```typescript
_preUpdate(changed: any, options: any, user: any): Promise<undefined | false>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changed**: `any` — The candidate changes to the Document  
- **options**: `any` — Additional options which modify the update request  
- **user**: `any` — The User requesting the document update

**Returns**  
`Promise<undefined | false>` — A return value of false indicates the update operation should be cancelled.

Inherited from [BaseActor._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_preupdate).

---

### allApplicableEffects

```typescript
allApplicableEffects(): Generator<documents.ActiveEffect, void, void>
```

Get all ActiveEffects that may apply to this Actor. If `CONFIG.ActiveEffect.legacyTransferral` is `true`, this is equivalent to `actor.effects.contents`.  
If `false`, this will also return all the transferred ActiveEffects on any of the Actor's owned Items.

**Returns**  
`Generator<documents.ActiveEffect, void, void>`

---

### applyActiveEffects

```typescript
applyActiveEffects(): void
```

Apply any transformations to the Actor data which are caused by ActiveEffects.

**Returns**  
`void`

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser` — The User attempting modification  
- **action**: `string` — The attempted action  
- **data** (optional): `object` = `{}` — Data involved in the attempted action

**Returns**  
`boolean` — Does the User have permission?

Inherited from [BaseActor.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#canusermodify).

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

- **data** (optional): `object` = `{}` — Additional data which overrides current document data at the time of creation  
- **context** (optional): `DocumentConstructionContext & DocumentCloneOptions` = `{}` — Additional context options passed to the create method

**Returns**  
`Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>`

Inherited from [BaseActor.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#clone).

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
- **data** (optional): `object[]` = `[]` — An array of data objects used to create multiple documents  
- **operation** (optional): `DatabaseCreateOperation` = `{}` — Parameters of the database creation workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseActor.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#createembeddeddocuments).

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation** (optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the deletion operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>` — The deleted Document instance, or undefined if not deleted

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseActor.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#delete).

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
- **operation** (optional): `DatabaseDeleteOperation` = `{}` — Parameters of the database deletion workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseActor.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#deleteembeddeddocuments).

---

### getActiveTokens

```typescript
getActiveTokens(
    linked?: boolean,
    document?: boolean,
): (TokenDocument | canvas.placeables.Token)[]
```

Retrieve an Array of active tokens which represent this Actor in the current canvas Scene. If the canvas is not currently active, or there are no linked actors, the returned Array will be empty. If the Actor is a synthetic token actor, only the exact Token which it represents will be returned.

**Parameters**

- **linked** (optional): `boolean` = `false` — Limit results to Tokens which are linked to the Actor. Otherwise return all Tokens including unlinked.  
- **document** (optional): `boolean` = `false` — Return the Document instance rather than the PlaceableObject

**Returns**  
`(TokenDocument | canvas.placeables.Token)[]` — An array of Token instances in the current Scene which reference this Actor.

---

### getDependentTokens

```typescript
getDependentTokens(
    options?: {
        linked?: boolean;
        scenes?: documents.Scene | documents.Scene[];
    },
): TokenDocument[]
```

Get this actor's dependent tokens. If the actor is a synthetic token actor, only the exact Token which it represents will be returned.

**Parameters**

- **options** (optional):  
  - **linked**?: `boolean` — Limit the results to tokens that are linked to the actor.  
  - **scenes**?: `documents.Scene | documents.Scene[]` — A single Scene, or list of Scenes to filter by.

**Returns**  
`TokenDocument[]`

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string` — The name of the embedded Document type

**Returns**  
`DocumentCollection` — The Collection instance of embedded Documents of the requested type

Inherited from [BaseActor.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#getembeddedcollection).

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

- **embeddedName**: `string` — The name of the embedded Document type  
- **id**: `string` — The id of the child document to retrieve  
- **options** (optional): `{ invalid?: boolean; strict?: boolean }` = `{}` — Additional options modifying retrieval  
  - **invalid**?: `boolean` — Allow retrieving an invalid Embedded Document.  
  - **strict**?: `boolean` — Throw an Error if the requested id does not exist. See Collection#get.

**Returns**  
`Document<object, DocumentConstructionContext>` — The retrieved embedded Document instance, or undefined

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseActor.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#getembeddeddocument).

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key  
- **key**: `string` — The flag key

**Returns**  
`any` — The flag value

Inherited from [BaseActor.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#getflag).

---

### getRollData

```typescript
getRollData(): object
```

Return a data object which defines the data schema against which dice rolls can be evaluated. By default, this is directly the Actor's system data, but systems may extend this to include additional properties.  
If overriding or extending this method to add additional properties, care must be taken not to mutate the original object.

**Returns**  
`object`

---

### getTokenDocument

```typescript
getTokenDocument(data?: object, options?: object): Promise<TokenDocument>
```

Create a new Token document, not yet saved to the database, which represents the Actor.

**Parameters**

- **data** (optional): `object` = `{}` — Additional data, such as x, y, rotation, etc. for the created token data  
- **options** (optional): `object` = `{}` — The options passed to the TokenDocument constructor

**Returns**  
`Promise<TokenDocument>` — The created TokenDocument instance

---

### getTokenImages

```typescript
getTokenImages(): Promise<string[]>
```

Get an Array of Token images which could represent this Actor

**Returns**  
`Promise<string[]>`

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html).  
Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.  
To test whether a user has a certain capability over the document, [testUserPermission](#testUserPermission) should be used.

**Parameters**

- **user** (optional): `BaseUser` — The User being tested

**Returns**  
`DocumentOwnershipNumber` — A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

Inherited from [BaseActor.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#getuserlevel).

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
`object` — The migrated system data object

Inherited from [BaseActor.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#migratesystemdata).

---

### modifyTokenAttribute

```typescript
modifyTokenAttribute(
    attribute: string,
    value: number,
    isDelta?: boolean,
    isBar?: boolean,
): Promise<documents.Actor>
```

Handle how changes to a Token attribute bar are applied to the Actor. This allows for game systems to override this behavior and deploy special logic.

**Parameters**

- **attribute**: `string` — The attribute path  
- **value**: `number` — The target attribute value  
- **isDelta**: `boolean` = `false` — Whether the number represents a relative change (`true`) or an absolute change (`false`)  
- **isBar**: `boolean` = `true` — Whether the new value is part of an attribute bar, or just a direct value

**Returns**  
`Promise<documents.Actor>` — The updated Actor document

---

### prepareData

```typescript
prepareData(): void
```

**Returns**  
`void`

Inherited documentation.

---

### prepareEmbeddedDocuments

```typescript
prepareEmbeddedDocuments(): void
```

**Returns**  
`void`

Inherited documentation.

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [BaseActor.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#reset).

---

### rollInitiative

```typescript
rollInitiative(
    options?: {
        createCombatants?: boolean;
        initiativeOptions?: object;
        rerollInitiative?: boolean;
    },
): Promise<null | documents.Combat>
```

Roll initiative for all Combatants in the currently active Combat encounter which are associated with this Actor. If viewing a full Actor document, all Tokens which map to that actor will be targeted for initiative rolls. If viewing a synthetic Token actor, only that particular Token will be targeted for an initiative roll.

**Parameters**

- **options** (optional):  
  - **createCombatants**?: `boolean` — Create new Combatant entries for Tokens associated with this actor.  
  - **initiativeOptions**?: `object` — Additional options passed to the Combat#rollInitiative method.  
  - **rerollInitiative**?: `boolean` — Re-roll the initiative for this Actor if it has already been rolled.

**Returns**  
`Promise<null | documents.Combat>` — A promise which resolves to the Combat document once rolls are complete.

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

Flags set by core software use the `"core"` scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use `"world"` as the scope.

Flag values can assume almost any data type. Setting a flag value to `null` will delete that flag.

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key  
- **key**: `string` — The flag key  
- **value**: `any` — The flag value

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>` — A Promise resolving to the updated document

Inherited from [BaseActor.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#setflag).

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
- **permission**: `DocumentOwnershipLevel` — The permission level from `DOCUMENT_OWNERSHIP_LEVELS` to test  
- **options** (optional): `{ exact?: boolean }` = `{}` — Additional options involved in the permission test  
  - **exact**? `boolean` — Require the exact permission level requested?

**Returns**  
`boolean` — Does the user have this permission level over the Document?

Inherited from [BaseActor.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#testuserpermission).

---

### toggleStatusEffect

```typescript
toggleStatusEffect(
    statusId: string,
    options?: { active?: boolean; overlay?: boolean },
): Promise<undefined | boolean | documents.ActiveEffect>
```

Toggle a configured status effect for the Actor.

**Parameters**

- **statusId**: `string` — A status effect ID defined in `CONFIG.statusEffects`  
- **options** (optional): `{ active?: boolean; overlay?: boolean }` = `{}` — Additional options which modify how the effect is created  
  - **active**?: `boolean` — Force the effect to be active or inactive regardless of its current state  
  - **overlay**?: `boolean` — Display the toggled effect as an overlay

**Returns**  
`Promise<undefined | boolean | documents.ActiveEffect>`  

A promise which resolves to one of the following values:  
- `ActiveEffect` if a new effect needs to be created  
- `true` if it was already an existing effect  
- `false` if an existing effect needed to be removed  
- `undefined` if no changes need to be made

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object` — The document source data expressed as a plain object

Inherited from [BaseActor.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#tojson).

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true` — Draw values from the underlying data source rather than transformed values

**Returns**  
`any` — The extracted primitive object

Inherited from [BaseActor.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#toobject).

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath** (optional): `string` — A parent field path already traversed

**Returns**  
`Generator<any, void, any>`

Inherited from [BaseActor.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#traverseembeddeddocuments).

---

### unsetFlag

```typescript
unsetFlag(
    scope: string,
    key: string,
): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document

**Parameters**

- **scope**: `string` — The flag scope which namespaces the key  
- **key**: `string` — The flag key

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>` — The updated document instance

Inherited from [BaseActor.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#unsetflag).

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

- **data** (optional): `object` = `{}` — Differential update data which modifies the existing values of this document  
- **operation** (optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the update operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>` — The updated Document instance, or undefined if not updated

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseActor.update](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#update).

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
- **updates** (optional): `object[]` = `[]` — An array of differential data objects, each used to update a single Document  
- **operation** (optional): `DatabaseUpdateOperation` = `{}` — Parameters of the database update workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseActor.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#updateembeddeddocuments).

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model.  
The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = `{}` — New values which should be applied to the data model  
- **options**: `DataModelUpdateOptions` = `{}` — Options which determine how the new data is merged

**Returns**  
`object` — An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

Inherited from [BaseActor.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#updatesource).

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added before cleaning and validation.  
This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = `{}` — Options which modify how the model is validated

**Returns**  
`boolean` — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseActor.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#validate).

---

### _onCreate

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data**: `object` — The initial data object provided to the document creation request  
- **options**: `object` — Additional options which modify the creation request  
- **userId**: `string` — The id of the User requesting the document update

**Returns**  
`void`

Inherited from [BaseActor._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_oncreate).

---

### _onDelete

```typescript
protected _onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `object` — Additional options which modify the deletion request  
- **userId**: `string` — The id of the User requesting the document update

**Returns**  
`void`

Inherited from [BaseActor._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_ondelete).

---

### _onEmbeddedDocumentChange

```typescript
protected _onEmbeddedDocumentChange(): void
```

Additional workflows to perform when any descendant document within this Actor changes.

**Returns**  
`void`

---

### _preDelete

```typescript
protected _preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object` — Additional options which modify the deletion request  
- **user**: `BaseUser` — The User requesting the document deletion

**Returns**  
`Promise<boolean | void>` — A return value of false indicates the deletion operation should be cancelled.

Inherited from [BaseActor._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_predelete).

---

### _updateDependentTokens

```typescript
protected _updateDependentTokens(update?: object, options?: any): void
```

Update the active TokenDocument instances which represent this Actor.

**Parameters**

- **update** (optional): `object` = `{}` — The update delta  
- **options** (optional): `any` = `{}` — The database operation that was performed

**Returns**  
`void`

---

### _initializationOrder _(static)_

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from [BaseActor._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_initializationorder).

---

### canUserCreate _(static)_

```typescript
static canUserCreate(user: any): any
```

**Parameters**

- **user**: `any`

**Returns**  
`any`

Inherited from [BaseActor.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#canusercreate).

---

### cleanData _(static)_

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source** (optional): `object` = `{}` — The source data object  
- **options** (optional): `object` = `{}` — Additional options which are passed to field cleaning methods

**Returns**  
`object` — The cleaned source data, which is the same object as the `source` argument

Inherited from [BaseActor.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#cleandata).

---

### create _(static)_

```typescript
static create(
    data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<
    | undefined
    | Document<object, DocumentConstructionContext>
    | Document<object, DocumentConstructionContext>[]
>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- **data** (optional):  
  - `object`  
  - `Document<object, DocumentConstructionContext>`  
  - Array of `object` or `Document<object, DocumentConstructionContext>`  
  Initial data used to create this Document, or a Document instance to persist.

- **operation** (optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
Parameters of the creation operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>` — The created Document instance(s)

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments).

**Example: Create a World-level Item**

**Example: Create an Actor-owned Item**

**Example: Create an Item in a Compendium pack**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const createdWithParent = await Item.implementation.create(data, {parent: actor});

const createdInPack = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseActor.create](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#create).

---

### createDocuments _(static)_

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data** (optional): `(object | Document<object, DocumentConstructionContext>)[]` = `[]` — An array of data objects or existing Documents to persist.  
- **operation** (optional): `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` — Parameters of the requested creation operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of created Document instances

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments).

**Examples:**

- Create a single Document  
- Create multiple Documents  
- Create multiple embedded Documents within a parent  
- Create a Document within a Compendium pack

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const dataMultiple = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const createdMultiple = await Actor.implementation.createDocuments(dataMultiple);

const actor = game.actors.getName("Tim");
const dataOwned = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const createdOwned = await Item.implementation.createDocuments(dataOwned, {parent: actor});

const dataCompendium = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const createdInPack = await Actor.implementation.createDocuments(dataCompendium, {pack: "mymodule.mypack"});
```

Inherited from [BaseActor.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#createdocuments).

---

### defineSchema _(static)_

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    effects: EmbeddedCollectionField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    img: FilePathField;
    items: EmbeddedCollectionField;
    name: StringField;
    ownership: DocumentOwnershipField;
    prototypeToken: EmbeddedDataField;
    sort: IntegerSortField;
    system: TypeDataField;
    type: DocumentTypeField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
An object detailing each field and its type in the schema.

_Inherited from [BaseActor.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#defineschema)._

---

### deleteDocuments _(static)_

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids**: `string[]` = `[]` — An array of string ids for the documents to be deleted  
- **operation** (optional): `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` — Parameters of the database deletion operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of deleted Document instances

**Examples:**

- Delete a single Document
- Delete multiple Documents
- Delete multiple embedded Documents within a parent
- Delete Documents within a Compendium pack

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedItems = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actorFromPack = await pack.getDocument(documentId);
const deletedFromPack = await Actor.implementation.deleteDocuments([actorFromPack.id], {pack: "mymodule.mypack"});
```

Inherited from [BaseActor.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#deletedocuments).

---

### fromJSON _(static)_

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string` — Serialized document data in string format

**Returns**  
`DataModel<object, DataModelConstructionContext>` — A constructed data model instance

Inherited from [BaseActor.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#fromjson).

---

### fromSource _(static)_

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object` — Initial document data which comes from a trusted source.  
- **context** (optional): `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` — Model construction context

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [BaseActor.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#fromsource).

---

### get _(static)_

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string` — The Document ID  
- **operation** (optional): `DatabaseGetOperation` = `{}` — Parameters of the get operation

**Returns**  
`null | Document<object, DocumentConstructionContext>` — The retrieved Document, or null

Inherited from [BaseActor.get](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#get).

---

### getCollectionName _(static)_

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string` — An existing collection name or a document name.

**Returns**  
`null | string` — The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

Passing an existing collection name:

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
```

Passing a document name:

```typescript
Actor.implementation.getCollectionName("Item"); // returns "items"
```

Inherited from [BaseActor.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#getcollectionname).

---

### getDefaultArtwork _(static)_

```typescript
static getDefaultArtwork(
    actorData: ActorData,
): { img: string; texture: { src: string } }
```

Determine default artwork based on the provided actor data.

**Parameters**

- **actorData**: `ActorData` — The source actor data.

**Returns**

```typescript
{
  img: string;
  texture: {
    src: string;
  };
}
```

Candidate actor image and prototype token artwork.

Inherited from [BaseActor.getDefaultArtwork](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#getdefaultartwork).

---

### migrateData _(static)_

```typescript
static migrateData(source: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `any` — The candidate source data from which the model will be constructed

**Returns**  
`object` — Migrated source data, which is the same object as the `source` argument

Inherited from [BaseActor.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#migratedata).

---

### migrateDataSafe _(static)_

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object` — The candidate source data from which the model will be constructed

**Returns**  
`object` — Migrated source data, which is the same object as the `source` argument

Inherited from [BaseActor.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#migratedatasafe).

---

### shimData _(static)_

```typescript
static shimData(source: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **source**: `any` — Data which matches the current schema  
- **options**: `any` — Additional shimming options

**Returns**  
`object` — Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [BaseActor.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#shimdata).

---

### updateDocuments _(static)_

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates** (optional): `object[]` = `[]` — An array of differential data objects, each used to update a single Document  
- **operation** (optional): `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` — Parameters of the database update operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated Document instances

**Examples:**

- Update a single Document  
- Update multiple Documents  
- Update multiple embedded Documents within a parent  
- Update Documents within a Compendium pack

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const multipleUpdates = [
  {_id: "12ekjf43kj2312ds", name: "Timothy"},
  {_id: "kj549dk48k34jk34", name: "Thomas"}
];
const updatedMultiple = await Actor.implementation.updateDocuments(multipleUpdates);

const actor = game.actors.getName("Timothy");
const embeddedUpdates = [
  {_id: sword.id, name: "Magic Sword"},
  {_id: shield.id, name: "Magic Shield"}
];
const updatedEmbedded = await Item.implementation.updateDocuments(embeddedUpdates, {parent: actor});

const actorFromPack = await pack.getDocument(documentId);
const updatedInPack = await Actor.implementation.updateDocuments([{_id: actorFromPack.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [BaseActor.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#updatedocuments).

---

### validateJoint _(static)_

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object` — Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected

Inherited from [BaseActor.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#validatejoint).

---

### _onCreateOperation _(protected static)_

```typescript
protected static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual [_onCreate](#_onCreate) workflows.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were created  
- **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation  
- **user**: `BaseUser` — The User who performed the creation operation

**Returns**  
`Promise<void>`

Inherited from [BaseActor._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_oncreateoperation).

---

### _onDeleteOperation _(protected static)_

```typescript
protected static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual [_onDelete](#_onDelete) workflows.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were deleted  
- **operation**: `DatabaseDeleteOperation` — Parameters of the database deletion operation  
- **user**: `BaseUser` — The User who performed the deletion operation

**Returns**  
`Promise<void>`

Inherited from [BaseActor._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_ondeleteoperation).

---

### _onUpdateOperation _(protected static)_

```typescript
protected static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual [_onUpdate](#_onUpdate) workflows.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — The Document instances which were updated  
- **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation  
- **user**: `BaseUser` — The User who performed the update operation

**Returns**  
`Promise<void>`

Inherited from [BaseActor._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_onupdateoperation).

---

### _preCreateOperation _(protected static)_

```typescript
protected static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual [_preCreate](#_preCreate) workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the `documents` array or alter individual document instances using [updateSource](#updateSource).

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Pending document instances to be created  
- **operation**: `DatabaseCreateOperation` — Parameters of the database creation operation  
- **user**: `BaseUser` — The User requesting the creation operation

**Returns**  
`Promise<boolean | void>` — Return false to cancel the creation operation entirely

Inherited from [BaseActor._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_precreateoperation).

---

### _preDeleteOperation _(protected static)_

```typescript
protected static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual [_preDelete](#_preDelete) workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the `operation` object.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Document instances to be deleted  
- **operation**: `DatabaseDeleteOperation` — Parameters of the database update operation  
- **user**: `BaseUser` — The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>` — Return false to cancel the deletion operation entirely

Inherited from [BaseActor._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_predeleteoperation).

---

### _preUpdateOperation _(protected static)_

```typescript
protected static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual [_preUpdate](#_preUpdate) workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]` — Document instances to be updated  
- **operation**: `DatabaseUpdateOperation` — Parameters of the database update operation  
- **user**: `BaseUser` — The User requesting the update operation

**Returns**  
`Promise<boolean | void>` — Return false to cancel the update operation entirely

Inherited from [BaseActor._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseActor.html#_preupdateoperation).

---

# References

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

---