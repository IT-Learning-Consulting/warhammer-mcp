# PrototypeTokenOverrides

The data model for the `core.prototypeTokenOverrides` setting.

---

## Hierarchy

- [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)
- PrototypeTokenOverrides

---

## Constructors

### constructor

```typescript
new PrototypeTokenOverrides(
    data?: object,
    options?: DataModelConstructionContext,
): PrototypeTokenOverrides
```

**Parameters**

- **data**: `object` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated. *(Optional)*

- **options**: [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html) = `{}`  
  Context and data validation options which affect initial model construction. *(Optional)*

**Returns:** `PrototypeTokenOverrides`

_Inherited from [DataModel.constructor](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#constructor)_

---

## Properties

### _source

`_source: object`

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

_Inherited from [DataModel._source](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_source)_

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`

An immutable reverse-reference to a parent DataModel to which this model belongs.

_Inherited from [DataModel.parent](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#parent)_

### LOCALIZATION_PREFIXES

`LOCALIZATION_PREFIXES: string[] = ...`

Overrides [DataModel.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#localization_prefixes)

### SETTING

`SETTING: "prototypeTokenOverrides"`

The name of the world setting that stores the prototype token overrides.

---

## Accessors

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns:** `boolean`

Inherited from `DataModel.invalid`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns:** [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)

Inherited from `DataModel.schema`

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

Inherited from `DataModel.validationFailures`

### overrides

```typescript
static get overrides(): PrototypeTokenOverrides
```

A cached copy of the currently-configured overrides.

**Returns:** `PrototypeTokenOverrides`

### overrides (setter)

```typescript
static set overrides(value: null | PrototypeTokenOverrides): void
```

Set or clear the cached overrides.

**Parameters**

- **value**: `null | PrototypeTokenOverrides`

**Returns:** `void`

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

- **data**: `object` = `{}`  
  Additional data which overrides current document data at the time of creation. *(Optional)*

- **context**: `DataModelConstructionContext` = `{}`  
  Context options passed to the data model constructor. *(Optional)*

**Returns:** `DataModel<object, DataModelConstructionContext>`  
The cloned instance.

Inherited from [DataModel.clone](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#clone)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:** `void`

Inherited from [DataModel.reset](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#reset)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:** `object`  
The document source data expressed as a plain object.

Inherited from [DataModel.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values. *(Optional)*

**Returns:** `object`  
The extracted primitive object.

Inherited from [DataModel.toObject](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#toobject)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = `{}`  
  New values which should be applied to the data model. *(Optional)*

- **options**: [`DataModelUpdateOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelUpdateOptions.html) = `{}`  
  Options which determine how the new data is merged. *(Optional)*

**Returns:** `object`  
An object containing differential keys and values that were changed.

**Throws:**  
An error if the requested data model changes were invalid.

Inherited from [DataModel.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: [`DataModelValidationOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html) = `{}`  
  Options which modify how the model is validated. *(Optional)*

**Returns:** `boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws:**  
An error thrown if validation is strict and a failure occurs.

Inherited from [DataModel.validate](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validate)

---

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options**: `object` = `{}`  
  Additional options modifying the configuration. *(Optional)*

**Returns:** `void`

Inherited from [DataModel._configure](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_configure)

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options**: `object` = `{}`  
  Options provided to the model constructor. *(Optional)*

**Returns:** `void`

Inherited from [DataModel._initialize](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initialize)

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

- **options**: `object` = `{}`  
  Options provided to the model constructor. *(Optional)*

**Returns:** `object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [DataModel._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializesource)

---

### applyAll

```typescript
static applyAll(): void
```

Apply configured overrides to all Actor documents within the World.

**Returns:** `void`

---

### applyOverrides

```typescript
static applyOverrides(source: object, actorType?: string): void
```

Apply configured overrides to prototype token data.

**Parameters**

- **source**: `object`  
  The prototype token source data on which to operate.

- **actorType**: `string` *(Optional)*  
  The prototype parent's actor type: used to retrieve type-specific overrides.

**Returns:** `void`

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object` = `{}` *(Optional)*  
  The source data object.

- **options**: `object` = `{}` *(Optional)*  
  Additional options which are passed to field cleaning methods.

**Returns:** `object`  
The cleaned source data, which is the same object as the `source` argument.

Inherited from [DataModel.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#cleandata)

---

### defineSchema

```typescript
static defineSchema(): {}
```

Overrides [DataModel.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#defineschema)

**Returns:** `{}`

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format.

**Returns:** `DataModel<object, DataModelConstructionContext>`  
A constructed data model instance.

Inherited from [DataModel.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromjson)

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

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` *(Optional)*  
  Model construction context.

**Returns:** `DataModel<object, DataModelConstructionContext>`

Inherited from [DataModel.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromsource)

---

### localizeFields

```typescript
static localizeFields(fields?: DataField[], cache?: Record<string, string>): void
```

Localize all non-recursive data fields on first load of the application.

**Parameters**

- **fields**: `DataField[]` *(Optional)*  
  Subfields of a recursive field.

- **cache**: `Record<string, string>` = `{}` *(Optional)*  
  A running cache of localization results.

**Returns:** `void`

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns:** `object`  
Migrated source data, which is the same object as the `source` argument.

Inherited from [DataModel.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns:** `object`  
Migrated source data, which is the same object as the `source` argument.

Inherited from [DataModel.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema.

- **options**: `{ embedded?: boolean }` = `{}` *(Optional)*  
  Additional shimming options.

  - **embedded?**: `boolean`  
    Apply shims to embedded models?

**Returns:** `object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [DataModel.shimData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#shimdata)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model.

**Returns:** `void`

**Throws:**  
An error if a validation failure is detected.

Inherited from [DataModel.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validatejoint)

---

### _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns:** `Generator<[string, DataField], any, any>`

Inherited from [DataModel._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializationorder)

---

For more information, see the [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.data.PrototypeTokenOverrides.html).