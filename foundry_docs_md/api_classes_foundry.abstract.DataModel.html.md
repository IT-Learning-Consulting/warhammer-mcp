# DataModel

The abstract base class which defines the data schema contained within a Document.

**Type Parameters**

- `ModelData = object`
- `ModelContext = DataModelConstructionContext`

**Hierarchy**

[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.abstract.DataModel)

- DataModel
- [CalendarData](https://foundryvtt.com/api/classes/foundry.data.CalendarData.html)
- [LightData](https://foundryvtt.com/api/classes/foundry.data.LightData.html)
- [PrototypeToken](https://foundryvtt.com/api/classes/foundry.data.PrototypeToken.html)
- [PrototypeTokenOverrides](https://foundryvtt.com/api/classes/foundry.data.PrototypeTokenOverrides.html)
- [ShapeData](https://foundryvtt.com/api/classes/foundry.data.ShapeData.html)
- [BaseShapeData](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html)
- [TombstoneData](https://foundryvtt.com/api/classes/foundry.data.TombstoneData.html)
- [BaseTerrainData](https://foundryvtt.com/api/classes/foundry.data.BaseTerrainData.html)
- [BasePackage](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html)
- [TypeDataModel](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html)
- [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)
- [ReleaseData](https://foundryvtt.com/api/classes/foundry.config.ReleaseData.html)
- [ServerSettings](https://foundryvtt.com/api/classes/foundry.config.ServerSettings.html)
- [DynamicRingData](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.DynamicRingData.html)
- [TurnMarkerData](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.TurnMarkerData.html)
- [VisionMode](https://foundryvtt.com/api/classes/foundry.canvas.perception.VisionMode.html)
- [DetectionMode](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html)

---

## Constructors

### constructor

```typescript
new DataModel<
    ModelData extends object = object,
    ModelContext extends DataModelConstructionContext = DataModelConstructionContext,
>(
    data?: Partial<ModelData>,
    options?: ModelContext,
): DataModel<ModelData, ModelContext>
```

**Type Parameters**

- `ModelData` extends `object = object`
- `ModelContext` extends [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html) = `DataModelConstructionContext`

**Parameters**

- **data?**: `Partial<ModelData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.
- **options?**: `ModelContext` = `{}`  
  Context and data validation options which affect initial model construction.

**Returns**: `DataModel<ModelData, ModelContext>`

---

## Properties

### _source

```typescript
_source: ModelData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

### LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[] = []
```

A set of localization prefix paths which are used by this DataModel.

---

## Accessors

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**: `boolean`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**: [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)

### validationFailures

```typescript
get validationFailures(): {
  fields: null | DataModelValidationFailure,
  joint: null | DataModelValidationFailure,
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

### static schema

```typescript
static get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.

**Returns**: [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)

---

## Methods

### clone

```typescript
clone(
    data?: object,
    context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided overrides.

**Parameters**

- **data?**: `object` = `{}`  
  Additional data which overrides current document data at the time of creation
- **context?**: [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html) = `{}`  
  Context options passed to the data model constructor

**Returns**: `DataModel<object, DataModelConstructionContext>`  
The cloned instance

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**: `void`

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**: `object`  
The document source data expressed as a plain object

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source?**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**: `object`  
The extracted primitive object

### updateSource

```typescript
updateSource(
    changes?: object,
    options?: DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes?**: `object` = `{}`  
  New values which should be applied to the data model
- **options?**: [`DataModelUpdateOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelUpdateOptions.html) = `{}`  
  Options which determine how the new data is merged

**Returns**: `object`  
An object containing differential keys and values that were changed

**Throws**: An error if the requested data model changes were invalid

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options?**: [`DataModelValidationOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html) = `{}`  
  Options which modify how the model is validated

**Returns**: `boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**: An error thrown if validation is strict and a failure occurs.

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options?**: `object` = `{}`  
  Additional options modifying the configuration

**Returns**: `void`

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options?**: `object` = `{}`  
  Options provided to the model constructor

**Returns**: `void`

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
  The candidate source data from which the model will be constructed
- **options?**: `object` = `{}`  
  Options provided to the model constructor

**Returns**: `object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

---

## Static Methods

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source?**: `object` = `{}`  
  The source data object
- **options?**: `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns**: `object`  
The cleaned source data, which is the same object as the `source` argument

### defineSchema

```typescript
static defineSchema(): DataSchema
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**: [`DataSchema`](https://foundryvtt.com/api/types/foundry.abstract.types.DataSchema.html)

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns**: `DataModel<object, DataModelConstructionContext>`  
A constructed data model instance

### fromSource

```typescript
static fromSource<
    T extends DataModelConstructionContext = DataModelConstructionContext,
>(
    source: object,
    context?: Omit<T, "strict"> & DataModelFromSourceOptions,
): DataModel<object, T>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.
- **context?**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context

**Returns**: `DataModel<object, DataModelConstructionContext>`

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**: `object`  
Migrated source data, which is the same object as the `source` argument

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**: `object`  
Migrated source data, which is the same object as the `source` argument

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema
- **options?**: `{ embedded?: boolean }` = `{}`  
  Additional shimming options
  - **embedded?**: `boolean`  
    Apply shims to embedded models?

**Returns**: `object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns**: `void`

**Throws**: An error if a validation failure is detected

### _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns**: `Generator<[string, DataField], any, any>`

**Yields**: Tuples of `[key: string, DataField]`