# VisionMode

A Vision Mode which can be selected for use by a Token. The selected Vision Mode alters the appearance of various aspects of the canvas while that Token is the POV.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.perception.VisionMode), Expand)  
- [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)  
- **VisionMode**

---

## Constructors

### constructor

```typescript
new VisionMode(data?: object, options?: object): VisionMode
```

Construct a Vision Mode using provided configuration parameters and callback functions.

**Parameters**

- **data**: `object` = `{}`  
  Data which fulfills the model defined by the VisionMode schema. Optional.

- **options**: `object` = `{}`  
  Additional options passed to the DataModel constructor. Optional.

**Returns**: `VisionMode`  
Overrides [DataModel.constructor](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#constructor)

---

## Properties

### _source

```typescript
_source: object
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
Inherited from [DataModel._source](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_source)

---

### animated

```typescript
animated: boolean
```

A flag for whether this vision source is animated.

---

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.  
Inherited from [DataModel.parent](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#parent)

---

### LIGHTING_LEVELS (Static)

```typescript
readonly LIGHTING_LEVELS: Readonly<{
    BRIGHT: 2;
    BRIGHTEST: 3;
    DARKNESS: -2;
    DIM: 1;
    HALFDARK: -1;
    UNLIT: 0;
}> = LIGHTING_LEVELS
```

The lighting illumination levels which are supported.

---

### LIGHTING_VISIBILITY (Static)

```typescript
static LIGHTING_VISIBILITY: { DISABLED: number; ENABLED: number; REQUIRED: number }
```

Flags for how each lighting channel should be rendered for the currently active vision modes:

- **Disabled**: this lighting layer is not rendered, the shaders do not decide.  
- **Enabled**: this lighting layer is rendered normally, and the shaders can choose if they should be rendered or not.  
- **Required**: the lighting layer is rendered, the shaders do not decide.

---

### LOCALIZATION_PREFIXES (Static)

```typescript
static LOCALIZATION_PREFIXES: string[] = []
```

A set of localization prefix paths which are used by this DataModel.  
Inherited from [DataModel.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#localization_prefixes)

---

## Accessors

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
Inherited from DataModel.invalid

**Returns:** `boolean`

---

### perceivesLight

```typescript
get perceivesLight(): boolean
```

Does this vision mode enable light sources? True unless it disables lighting entirely.

**Returns:** `boolean`

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.  
Inherited from DataModel.schema

**Returns:** `SchemaField`

---

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.  
Inherited from DataModel.validationFailures

**Returns:**

```typescript
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

---

### schema (Static)

```typescript
static get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.  
Inherited from DataModel.schema

**Returns:** `SchemaField`

---

## Methods

### _activate (Abstract)

```typescript
_activate(source: PointVisionSource): void
```

Special activation handling that could be implemented by VisionMode subclasses.

**Parameters**

- **source**: `PointVisionSource`  
  Activate this VisionMode for a specific source.

**Returns:** `void`

---

### _deactivate (Abstract)

```typescript
_deactivate(source: PointVisionSource): void
```

Special deactivation handling that could be implemented by VisionMode subclasses.

**Parameters**

- **source**: `PointVisionSource`  
  Deactivate this VisionMode for a specific source.

**Returns:** `void`

---

### activate

```typescript
activate(source: PointVisionSource): void
```

Special handling which is needed when this Vision Mode is activated for a PointVisionSource.

**Parameters**

- **source**: `PointVisionSource`  
  Activate this VisionMode for a specific source.

**Returns:** `void`

---

### animate

```typescript
animate(dt: number): any
```

An animation function which runs every frame while this Vision Mode is active.

**Parameters**

- **dt**: `number`  
  The deltaTime passed by the PIXI Ticker

**Returns:** `any`

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

- **data**: `object` = `{}` (Optional)  
  Additional data which overrides current document data at the time of creation

- **context**: `DataModelConstructionContext` = `{}` (Optional)  
  Context options passed to the data model constructor

**Returns:** `DataModel<object, DataModelConstructionContext>`  
The cloned instance  
Inherited from [DataModel.clone](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#clone)

---

### deactivate

```typescript
deactivate(source: PointVisionSource): void
```

Special handling which is needed when this Vision Mode is deactivated for a PointVisionSource.

**Parameters**

- **source**: `PointVisionSource`  
  Deactivate this VisionMode for a specific source.

**Returns:** `void`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.  
Inherited from [DataModel.reset](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#reset)

**Returns:** `void`

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.  
Inherited from [DataModel.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#tojson)

**Returns:** `object`  
The document source data expressed as a plain object

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true` (Optional)  
  Draw values from the underlying data source rather than transformed values

**Returns:** `object`  
The extracted primitive object  
Inherited from [DataModel.toObject](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#toobject)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = `{}`  
  New values which should be applied to the data model

- **options**: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns:** `object`  
An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid  
Inherited from [DataModel.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns:** `boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.  
Inherited from [DataModel.validate](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validate)

---

### _configure (Protected)

```typescript
_configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.  
Inherited from [DataModel._configure](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_configure)

**Parameters**

- **options**: `object` = `{}` (Optional)  
  Additional options modifying the configuration

**Returns:** `void`

---

### _initialize (Protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.  
Inherited from [DataModel._initialize](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initialize)

**Parameters**

- **options**: `object` = `{}` (Optional)  
  Options provided to the model constructor

**Returns:** `void`

---

### _initializeSource (Protected)

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

- **options**: `object` = `{}` (Optional)  
  Options provided to the model constructor

**Returns:** `object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument  
Inherited from [DataModel._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializesource)

---

### cleanData (Static)

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object` = `{}` (Optional)  
  The source data object

- **options**: `object` = `{}` (Optional)  
  Additional options which are passed to field cleaning methods

**Returns:** `object`  
The cleaned source data, which is the same object as the `source` argument  
Inherited from [DataModel.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#cleandata)

---

### defineSchema (Static)

```typescript
static defineSchema(): {
    canvas: SchemaField;
    id: StringField;
    label: StringField;
    lighting: SchemaField;
    tokenConfig: BooleanField;
    vision: SchemaField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**

```typescript
{
    canvas: SchemaField;
    id: StringField;
    label: StringField;
    lighting: SchemaField;
    tokenConfig: BooleanField;
    vision: SchemaField;
}
```

Overrides [DataModel.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#defineschema)

---

### fromJSON (Static)

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns:** `DataModel<object, DataModelConstructionContext>`  
A constructed data model instance  
Inherited from [DataModel.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromjson)

---

### fromSource (Static)

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

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` (Optional)  
  Model construction context

**Returns:** `DataModel<object, DataModelConstructionContext>`  
Inherited from [DataModel.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromsource)

---

### migrateData (Static)

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns:** `object`  
Migrated source data, which is the same object as the `source` argument  
Inherited from [DataModel.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedata)

---

### migrateDataSafe (Static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns:** `object`  
Migrated source data, which is the same object as the `source` argument  
Inherited from [DataModel.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedatasafe)

---

### shimData (Static)

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema

- **options**: `{ embedded?: boolean }` = `{}` (Optional)  
  Additional shimming options  
  - **embedded**?: `boolean`  
    Apply shims to embedded models?

**Returns:** `object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument  
Inherited from [DataModel.shimData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#shimdata)

---

### validateJoint (Static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns:** `void`

**Throws**  
An error if a validation failure is detected  
Inherited from [DataModel.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validatejoint)

---

### _initializationOrder (Static, Protected)

```typescript
static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.  
Inherited from [DataModel._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializationorder)

**Returns:** `Generator<[string, DataField], any, any>`