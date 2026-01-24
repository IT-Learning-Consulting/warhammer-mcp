# ToggleBehaviorRegionBehaviorType | Foundry Virtual Tabletop - API Documentation - Version 13

The data model for a behavior that toggles Region Behaviors when one of the subscribed events occurs.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.regionBehaviors.ToggleBehaviorRegionBehaviorType))

- _RegionBehaviorType_
- **ToggleBehaviorRegionBehaviorType**

---

## Constructors

### constructor

```typescript
new ToggleBehaviorRegionBehaviorType(
    data?: {},
    options?: {},
): ToggleBehaviorRegionBehaviorType
```

**Parameters**

- **data**: `{}` = `{}`  
  Initial data object for construction.
- **options**: `{}` = `{}`  
  Options object for construction.

**Returns**  
`ToggleBehaviorRegionBehaviorType`

**Inheritance**  
Inherited from [RegionBehaviorType.constructor](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#constructor)

---

## Properties

### _source

```typescript
_source: object
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [RegionBehaviorType._source](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_source)

### events

```typescript
events: Set<string> = ...
```

The events that are handled by the behavior.

Inherited from [RegionBehaviorType.events](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#events)

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [RegionBehaviorType.parent](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#parent)

### Static events

```typescript
static events: Record<
    string,
    (this: RegionBehaviorType, event: RegionEvent) => Promise<void>
> = {}
```

A RegionBehaviorType may register to always receive certain events by providing a record of handler functions. These handlers are called with the behavior instance as its bound scope.

Inherited from [RegionBehaviorType.events](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#events-1)

### Static LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[] = ...
```

Overrides [RegionBehaviorType.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#localization_prefixes)

### behavior (Accessor)

```typescript
get behavior(): null | documents.RegionBehavior
```

A convenience reference to the RegionBehavior which contains this behavior sub-type.

**Returns**  
`null` | `documents.RegionBehavior`

Inherited from RegionBehaviorType.behavior

### invalid (Accessor)

```typescript
get invalid(): boolean
```
Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from RegionBehaviorType.invalid

### region (Accessor)

```typescript
get region(): null | RegionDocument
```

A convenience reference to the RegionDocument which contains this behavior sub-type.

**Returns**  
`null` | `RegionDocument`

Inherited from RegionBehaviorType.region

### scene (Accessor)

```typescript
get scene(): null | documents.Scene
```

A convenience reference to the Scene which contains this behavior sub-type.

**Returns**  
`null` | `documents.Scene`

Inherited from RegionBehaviorType.scene

### schema (Accessor)

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from RegionBehaviorType.schema

### validationFailures (Accessor)

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

Inherited from RegionBehaviorType.validationFailures

---

## Methods

### _handleRegionEvent

```typescript
_handleRegionEvent(event: any): Promise<void>
```

Overrides [RegionBehaviorType._handleRegionEvent](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_handleregionevent)

**Parameters**

- **event**: `any`  
  The region event to handle.

**Returns**  
`Promise<void>`

---

### clone

```typescript
clone(
    data?: object,
    context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided overrides.

**Parameters**

- **data** (Optional): `object` = `{}`  
  Additional data which overrides current document data at the time of creation.
- **context** (Optional): `DataModelConstructionContext` = `{}`  
  Context options passed to the data model constructor.

**Returns**  
`DataModel<object, DataModelConstructionContext>`  
The cloned instance.

Inherited from [RegionBehaviorType.clone](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#clone)

---

### prepareBaseData

```typescript
prepareBaseData(): void
```

Prepare data related to this DataModel itself, before any derived data is computed.

Called before `ClientDocumentMixin#prepareBaseData` in `ClientDocumentMixin#prepareData`.

**Returns**  
`void`

Inherited from [RegionBehaviorType.prepareBaseData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#preparebasedata)

---

### prepareDerivedData

```typescript
prepareDerivedData(): void
```

Apply transformations or derivations to the values of the source data object. Compute data fields whose values are not stored to the database.

Called before `ClientDocumentMixin#prepareDerivedData` in `ClientDocumentMixin#prepareData`.

**Returns**  
`void`

Inherited from [RegionBehaviorType.prepareDerivedData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#preparederiveddata)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [RegionBehaviorType.reset](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#reset)

---

### toEmbed

```typescript
toEmbed(config: DocumentHTMLEmbedConfig, options?: any): Promise<any>
```

Convert this Document to some HTML display for embedding purposes.

**Parameters**

- **config**: `DocumentHTMLEmbedConfig`  
  Configuration for embedding behavior.
- **options** (Optional): `any` = `{}`  
  The original enrichment options for cases where the Document embed content also contains text that must be enriched.

**Returns**  
`Promise<any>`

Inherited from [RegionBehaviorType.toEmbed](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#toembed)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object`  
The document source data expressed as a plain object.

Inherited from [RegionBehaviorType.toJSON](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source** (Optional): `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values.

**Returns**  
`object`  
The extracted primitive object.

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

**Parameters**

- **changes** (Optional): `object` = `{}`  
  New values which should be applied to the data model.
- **options** (Optional): `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged.

**Returns**  
`object`  
An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [RegionBehaviorType.updateSource](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options** (Optional): `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated.

**Returns**  
`boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [RegionBehaviorType.validate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#validate)

---

## Protected Methods

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options** (Optional): `object` = `{}`  
  Additional options modifying the configuration.

**Returns**  
`void`

Inherited from [RegionBehaviorType._configure](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_configure)

---

### _getTerrainEffects

```typescript
protected _getTerrainEffects<TerrainEffect>(
    token: TokenDocument,
    segment: Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action"> & { preview: boolean }
): TerrainEffect[]
```

Get the terrain effects of this behavior for the movement of the given token. This function is called only for behaviors that are not disabled. The terrain data is created from the terrain effects ([CONFIG.Token.movement.TerrainData.resolveTerrainEffects](https://foundryvtt.com/api/classes/foundry.data.BaseTerrainData.html#resolveterraineffects)). Returns an empty array by default.

**Type Parameters**

- `TerrainEffect`

**Parameters**

- **token**: `TokenDocument`  
  The token being or about to be moved within the region of this behavior.
- **segment**: `Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action"> & { preview: boolean }`  
  The segment data of the token's movement.

**Returns**  
`TerrainEffect[]`  
The terrain effects that apply to this token's movement.

Inherited from [RegionBehaviorType._getTerrainEffects](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_getterraineffects)

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options** (Optional): `object` = `{}`  
  Options provided to the model constructor.

**Returns**  
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

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed.
- **options** (Optional): `object` = `{}`  
  Options provided to the model constructor.

**Returns**  
`object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [RegionBehaviorType._initializeSource](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_initializesource)

---

### _onCreate

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Called by `ClientDocument#_onCreate`.

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request.
- **options**: `object`  
  Additional options which modify the creation request.
- **userId**: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [RegionBehaviorType._onCreate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_oncreate)

---

### _onDelete

```typescript
protected _onDelete(options: object, userId: string): void
```

Called by `ClientDocumentMixin#_onDelete`.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request.
- **userId**: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [RegionBehaviorType._onDelete](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_ondelete)

---

### _onUpdate

```typescript
protected _onUpdate(changed: object, options: object, userId: string): void
```

Called by `ClientDocumentMixin#_onUpdate`.

**Parameters**

- **changed**: `object`  
  The differential data that was changed relative to the documents prior values.
- **options**: `object`  
  Additional options which modify the update request.
- **userId**: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [RegionBehaviorType._onUpdate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_onupdate)

---

### _preDelete

```typescript
protected _preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Called by `ClientDocumentMixin#_preDelete`.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request.
- **user**: `BaseUser`  
  The User requesting the document deletion.

**Returns**  
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

Called by `ClientDocumentMixin#_preUpdate`.

**Parameters**

- **changes**: `object`  
  The candidate changes to the Document.
- **options**: `object`  
  Additional options which modify the update request.
- **user**: `BaseUser`  
  The User requesting the document update.

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

Inherited from [RegionBehaviorType._preUpdate](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_preupdate)

---

## Static Methods

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source** (Optional): `object` = `{}`  
  The source data object.
- **options** (Optional): `object` = `{}`  
  Additional options which are passed to field cleaning methods.

**Returns**  
`object`  
The cleaned source data, which is the same object as the `source` argument.

Inherited from [RegionBehaviorType.cleanData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#cleandata)

---

### defineSchema

```typescript
static defineSchema(): {
    disable: SetField;
    enable: SetField;
    events: SetField;
}
```

Overrides [RegionBehaviorType.defineSchema](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#defineschema)

**Returns**

```typescript
{
  disable: SetField;
  enable: SetField;
  events: SetField;
}
```

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format.

**Returns**  
`DataModel<object, DataModelConstructionContext>`  
A constructed data model instance.

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

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.
- **context** (Optional): `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context.

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [RegionBehaviorType.fromSource](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#fromsource)

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
`object`  
Migrated source data, which is the same object as the `source` argument.

Inherited from [RegionBehaviorType.migrateData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
`object`  
Migrated source data, which is the same object as the `source` argument.

Inherited from [RegionBehaviorType.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema.
- **options** (Optional): `{ embedded?: boolean }` = `{}`  
  Additional shimming options.

**Options**

- **embedded**?: `boolean`  
  Apply shims to embedded models?

**Returns**  
`object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [RegionBehaviorType.shimData](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#shimdata)

---

### validateJoint

```typescript
static validateJoint(data: any): void
```

Validate the joint data of the model.

**Parameters**

- **data**: `any`  
  Data to validate.

**Returns**  
`void`

Overrides [RegionBehaviorType.validateJoint](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#validatejoint)

---

## Protected Static Methods

### _createEventsField

```typescript
protected static _createEventsField(
    options?: { events?: string[]; initial?: string[] },
): SetField
```

Create the events field.

**Parameters**

- **options** (Optional): `{ events?: string[]; initial?: string[] }` = `{}`  
  Options which configure how the events field is declared.

**Options**

- **events**?: `string[]`  
  The event names to restrict to.
- **initial**?: `string[]`  
  The initial set of events that should be default for the field.

**Returns**  
`SetField`

Inherited from [RegionBehaviorType._createEventsField](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_createeventsfield)

---

### _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns**  
`Generator<[string, DataField], any, any>`

Inherited from [RegionBehaviorType._initializationOrder](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_initializationorder)

---

For full API details and related classes, visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.ToggleBehaviorRegionBehaviorType.html).