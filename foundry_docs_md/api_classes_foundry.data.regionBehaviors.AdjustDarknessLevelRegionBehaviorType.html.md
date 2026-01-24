# AdjustDarknessLevelRegionBehaviorType | Foundry Virtual Tabletop - API Documentation - Version 13

The data model for a behavior that allows to adjust the darkness level within the Region.

## Class Hierarchy
- [RegionBehaviorType](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html)  
- **AdjustDarknessLevelRegionBehaviorType**

---

## Constructors

### constructor

```typescript
new AdjustDarknessLevelRegionBehaviorType(
    data?: {},
    options?: {},
): AdjustDarknessLevelRegionBehaviorType
```

**Parameters:**

- **data**: `{}` = {}  
- **options**: `{}` = {}

**Returns:**  
`AdjustDarknessLevelRegionBehaviorType`

*Inherited from* [RegionBehaviorType.constructor](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#constructor)

---

## Properties

### _source

`_source: object`  
The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

*Inherited from* [RegionBehaviorType._source](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_source)

### events

`events: Set<string> = ...`  
The events that are handled by the behavior.

*Inherited from* [RegionBehaviorType.events](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#events)

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`  
An immutable reverse-reference to a parent DataModel to which this model belongs.

*Inherited from* [RegionBehaviorType.parent](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#parent)

---

## Accessors

### events

```typescript
events: {
    behaviorUnviewed: (
        ...this: any,
        event: RegionBehaviorUnviewedEvent,
    ) => Promise<void>;

    behaviorViewed: (
        ...this: any,
        event: RegionBehaviorViewedEvent,
    ) => Promise<void>;

    regionBoundary: (
        ...this: any,
        event: RegionRegionBoundaryEvent,
    ) => Promise<void>;
} = ...
```

Overrides [RegionBehaviorType.events](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#events-1)

---

### LOCALIZATION_PREFIXES

`LOCALIZATION_PREFIXES: string[] = ...`  
Overrides [RegionBehaviorType.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#localization_prefixes)

---

### behavior

```typescript
get behavior(): null | documents.RegionBehavior
```

A convenience reference to the RegionBehavior which contains this behavior sub-type.

**Returns:**  
`null | documents.RegionBehavior`

Inherited from `RegionBehaviorType.behavior`

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns:**  
`boolean`

Inherited from [RegionBehaviorType.invalid](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#invalid)

---

### region

```typescript
get region(): null | RegionDocument
```

A convenience reference to the RegionDocument which contains this behavior sub-type.

**Returns:**  
`null | RegionDocument`

Inherited from [RegionBehaviorType.region](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#region)

---

### scene

```typescript
get scene(): null | documents.Scene
```

A convenience reference to the Scene which contains this behavior sub-type.

**Returns:**  
`null | documents.Scene`

Inherited from [RegionBehaviorType.scene](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#scene)

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns:**  
`SchemaField`

Inherited from [RegionBehaviorType.schema](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#schema)

---

### validationFailures

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

Inherited from [RegionBehaviorType.validationFailures](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#validationFailures)

---

### MODES

```typescript
static get MODES(): Readonly<{ BRIGHTEN: 1; DARKEN: 2; OVERRIDE: 0 }>
```

Darkness level behavior modes.

**Returns:**  
`Readonly<{ BRIGHTEN: 1; DARKEN: 2; OVERRIDE: 0 }>`

---

## Methods

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Called by ClientDocumentMixin#_onUpdate.

**Parameters:**

- **changed**: `any`  
  The differential data that was changed relative to the documents prior values
- **options**: `any`  
  Additional options which modify the update request
- **userId**: `any`  
  The id of the User requesting the document update

**Returns:**  
`void`

Overrides [RegionBehaviorType._onUpdate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_onupdate)

---

### clone

```typescript
clone(
    data?: object,
    context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided overrides.

**Parameters:**

- **data**: `object` = {}  
  Additional data which overrides current document data at the time of creation
- **context**: `DataModelConstructionContext` = {}  
  Context options passed to the data model constructor

**Returns:**  
`DataModel<object, DataModelConstructionContext>` — The cloned instance

Inherited from [RegionBehaviorType.clone](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#clone)

---

### prepareBaseData

```typescript
prepareBaseData(): void
```

Prepare data related to this DataModel itself, before any derived data is computed.

Called before ClientDocumentMixin#prepareBaseData in ClientDocumentMixin#prepareData.

**Returns:**  
`void`

Inherited from [RegionBehaviorType.prepareBaseData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#preparebasedata)

---

### prepareDerivedData

```typescript
prepareDerivedData(): void
```

Apply transformations of derivations to the values of the source data object. Compute data fields whose values are not stored to the database.

Called before ClientDocumentMixin#prepareDerivedData in ClientDocumentMixin#prepareData.

**Returns:**  
`void`

Inherited from [RegionBehaviorType.prepareDerivedData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#preparederiveddata)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:**  
`void`

Inherited from [RegionBehaviorType.reset](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#reset)

---

### toEmbed

```typescript
toEmbed(config: DocumentHTMLEmbedConfig, options?: any): Promise<any>
```

Convert this Document to some HTML display for embedding purposes.

**Parameters:**

- **config**: `DocumentHTMLEmbedConfig`  
  Configuration for embedding behavior.
- **options**: `any` = {}  
  The original enrichment options for cases where the Document embed content also contains text that must be enriched.

**Returns:**  
`Promise<any>`

Inherited from [RegionBehaviorType.toEmbed](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#toembed)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:**  
`object` — The document source data expressed as a plain object

Inherited from [RegionBehaviorType.toJSON](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters:**

- **source**: `boolean` = true  
  Draw values from the underlying data source rather than transformed values

**Returns:**  
`object` — The extracted primitive object

Inherited from [RegionBehaviorType.toObject](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#toobject)

---

### updateSource

```typescript
updateSource(
    changes?: object,
    options?: DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters:**

- **changes**: `object` = {}  
  New values which should be applied to the data model
- **options**: `DataModelUpdateOptions` = {}  
  Options which determine how the new data is merged

**Returns:**  
`object` — An object containing differential keys and values that were changed

**Throws:**  
An error if the requested data model changes were invalid

Inherited from [RegionBehaviorType.updateSource](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters:**

- **options**: `DataModelValidationOptions` = {}  
  Options which modify how the model is validated

**Returns:**  
`boolean`

Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws:**  
An error thrown if validation is strict and a failure occurs.

Inherited from [RegionBehaviorType.validate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#validate)

---

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters:**

- **options**: `object` = {}  
  Additional options modifying the configuration

**Returns:**  
`void`

Inherited from [RegionBehaviorType._configure](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_configure)

---

### _getTerrainEffects

```typescript
protected _getTerrainEffects<TerrainEffect>(
    token: TokenDocument,
    segment: Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action"> & { preview: boolean },
): TerrainEffect[]
```

Get the terrain effects of this behavior for the movement of the given token. This function is called only for behaviors that are not disabled. The terrain data is created from the terrain effects ([CONFIG.Token.movement.TerrainData.resolveTerrainEffects](https://foundryvtt.com/api/classes/foundry.data.BaseTerrainData.html#resolveterraineffects)). Returns an empty array by default.

**Type Parameters:**

- **TerrainEffect**

**Parameters:**

- **token**: `TokenDocument`  
  The token being or about to be moved within the region of this behavior
- **segment**: `Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action"> & { preview: boolean }`  
  The segment data of the token's movement

**Returns:**  
`TerrainEffect[]` — The terrain effects that apply to this token's movement

Inherited from [RegionBehaviorType._getTerrainEffects](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_getterraineffects)

---

### _handleRegionEvent

```typescript
protected _handleRegionEvent(event: RegionEvent): Promise<void>
```

Handle the Region event.

**Parameters:**

- **event**: `RegionEvent`  
  The Region event

**Returns:**  
`Promise<void>`

Inherited from [RegionBehaviorType._handleRegionEvent](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_handleregionevent)

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters:**

- **options**: `object` = {}  
  Options provided to the model constructor

**Returns:**  
`void`

Inherited from [RegionBehaviorType._initialize](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_initialize)

---

### _initializeSource

```typescript
protected _initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters:**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed
- **options**: `object` = {}

**Returns:**  
`object` — Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

Inherited from [RegionBehaviorType._initializeSource](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_initializesource)

---

### _onCreate

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Called by ClientDocument#_onCreate.

**Parameters:**

- **data**: `object`  
  The initial data object provided to the document creation request
- **options**: `object`  
  Additional options which modify the creation request
- **userId**: `string`  
  The id of the User requesting the document update

**Returns:**  
`void`

Inherited from [RegionBehaviorType._onCreate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_oncreate)

---

### _onDelete

```typescript
protected _onDelete(options: object, userId: string): void
```

Called by ClientDocumentMixin#_onDelete.

**Parameters:**

- **options**: `object`  
  Additional options which modify the deletion request
- **userId**: `string`  
  The id of the User requesting the document update

**Returns:**  
`void`

Inherited from [RegionBehaviorType._onDelete](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_ondelete)

---

### _preDelete

```typescript
protected _preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Called by ClientDocumentMixin#_preDelete.

**Parameters:**

- **options**: `object`  
  Additional options which modify the deletion request
- **user**: `BaseUser`  
  The User requesting the document deletion

**Returns:**  
`Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.

Inherited from [RegionBehaviorType._preDelete](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_predelete)

---

### _preUpdate

```typescript
protected _preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Called by ClientDocumentMixin#_preUpdate.

**Parameters:**

- **changes**: `object`  
  The candidate changes to the Document
- **options**: `object`  
  Additional options which modify the update request
- **user**: `BaseUser`  
  The User requesting the document update

**Returns:**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

Inherited from [RegionBehaviorType._preUpdate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_preupdate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters:**

- **source**: `object` = {}  
  The source data object
- **options**: `object` = {}  
  Additional options which are passed to field cleaning methods

**Returns:**  
`object` — The cleaned source data, which is the same object as the `source` argument

Inherited from [RegionBehaviorType.cleanData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#cleandata)

---

### defineSchema

```typescript
static defineSchema(): { mode: NumberField; modifier: AlphaField }
```

**Returns:**  
```typescript
{
    mode: NumberField;
    modifier: AlphaField;
}
```

Overrides [RegionBehaviorType.defineSchema](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#defineschema)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters:**

- **json**: `string`  
  Serialized document data in string format

**Returns:**  
`DataModel<object, DataModelConstructionContext>` — A constructed data model instance

Inherited from [RegionBehaviorType.fromJSON](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#fromjson)

---

### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters:**

- **source**: `object`  
  Initial document data which comes from a trusted source.
- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = {}  
  Model construction context

**Returns:**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [RegionBehaviorType.fromSource](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#fromsource)

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters:**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns:**  
`object` — Migrated source data, which is the same object as the `source` argument

Inherited from [RegionBehaviorType.migrateData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters:**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns:**  
`object` — Migrated source data, which is the same object as the `source` argument

Inherited from [RegionBehaviorType.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters:**

- **data**: `object`  
  Data which matches the current schema
- **options**: `{ embedded?: boolean }` = {}  
  Additional shimming options

**Returns:**  
`object` — Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [RegionBehaviorType.shimData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#shimdata)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters:**

- **data**: `object`  
  Candidate data for the model

**Returns:**  
`void`

**Throws:**  
An error if a validation failure is detected

Inherited from [RegionBehaviorType.validateJoint](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#validatejoint)

---

### _createEventsField

```typescript
protected static _createEventsField(
    options?: { events?: string[]; initial?: string[] },
): SetField
```

Create the events field.

**Parameters:**

- **options**: `{ events?: string[]; initial?: string[] }` = {}  
  Options which configure how the events field is declared
  - **events?**: `string[]`  
    The event names to restrict to.
  - **initial?**: `string[]`  
    The initial set of events that should be default for the field

**Returns:**  
`SetField`

Inherited from [RegionBehaviorType._createEventsField](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_createeventsfield)

---

### _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns:**  
`Generator<[string, DataField], any, any>`

*Yields*

Inherited from [RegionBehaviorType._initializationOrder](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_initializationorder)