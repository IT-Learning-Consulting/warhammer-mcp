# DetectionMode | Foundry Virtual Tabletop - API Documentation - Version 13

A Detection Mode which can be associated with any kind of sense/vision/perception. A token could have multiple detection modes.

## Hierarchy  
(View [Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.perception.DetectionMode), Expand)  

- [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)  
- **DetectionMode**  
- [DetectionModeAll](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeAll.html)  
- [DetectionModeLightPerception](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeLightPerception.html)  
- [DetectionModeInvisibility](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeInvisibility.html)  
- [DetectionModeTremor](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeTremor.html)  
- [DetectionModeDarkvision](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeDarkvision.html)  

---

## Constructors

### constructor

```typescript
new DetectionMode(
    data?: object,
    options?: DataModelConstructionContext,
): DetectionMode
```

**Parameters**

- **data**: `object` = {}  
  Optional  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html) = {}  
  Optional  
  Context and data validation options which affects initial model construction.

**Returns**  
`DetectionMode`

Inherited from [DataModel.constructor](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#constructor)

---

## Properties

### _source

`_source: object`

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [DataModel._source](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_source)

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [DataModel.parent](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#parent)

### _detectionFilter (Static)

`_detectionFilter: undefined | Filter`

An optional filter to apply on the target when it is detected with this mode.

### LOCALIZATION_PREFIXES (Static)

`LOCALIZATION_PREFIXES: string[] = []`

A set of localization prefix paths which are used by this DataModel.

Inherited from [DataModel.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#localization_prefixes)

---

## Accessors

### BASIC_MODE_ID

```typescript
get BASIC_MODE_ID(): "basicSight"
```

The identifier of the basic sight detection mode.

**Returns**  
`"basicSight"`

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from DataModel.invalid

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
[`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)

Inherited from DataModel.schema

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

Inherited from DataModel.validationFailures

### DETECTION_TYPES (Static)

```typescript
get DETECTION_TYPES(): Readonly<{
    MOVE: number;
    OTHER: number;
    SIGHT: number;
    SOUND: number;
}>
```

The types of the detection mode.

**Returns**  
Readonly object with keys: `MOVE`, `OTHER`, `SIGHT`, `SOUND` and their numeric values.

### schema (Static)

```typescript
get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.

**Returns**  
[`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)

Inherited from DataModel.schema

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

- **data**: `object` = {}  
  Optional  
  Additional data which overrides current document data at the time of creation.

- **context**: [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html) = {}  
  Optional  
  Context options passed to the data model constructor.

**Returns**  
The cloned instance of type `DataModel<object, DataModelConstructionContext>`

Inherited from [DataModel.clone](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#clone)

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [DataModel.reset](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#reset)

### testVisibility

```typescript
testVisibility(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    config: CanvasVisibilityTestConfiguration,
): boolean
```

Test visibility of a target object or array of points for a specific vision source.

**Parameters**

- **visionSource**: [`PointVisionSource`](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested.

- **mode**: [`TokenDetectionMode`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration.

- **config**: [`CanvasVisibilityTestConfiguration`](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTestConfiguration.html)  
  The visibility test configuration.

**Returns**  
`boolean` — Is the test target visible?

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

Inherited from [DataModel.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#tojson)

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = true  
  Optional  
  Draw values from the underlying data source rather than transformed values.

**Returns**  
The extracted primitive object.

Inherited from [DataModel.toObject](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#toobject)

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = {}  
  New values which should be applied to the data model.

- **options**: [`DataModelUpdateOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelUpdateOptions.html) = {}  
  Options which determine how the new data is merged.

**Returns**  
An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [DataModel.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#updatesource)

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: [`DataModelValidationOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html) = {}  
  Options which modify how the model is validated.

**Returns**  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [DataModel.validate](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validate)

---

## Protected Methods

### _canDetect

```typescript
_canDetect(visionSource: PointVisionSource, target: null | object): boolean
```

Can this PointVisionSource theoretically detect a certain object based on its properties? This check should not consider the relative positions of either object, only their state.

**Parameters**

- **visionSource**: [`PointVisionSource`](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested.

- **target**: `null | object`  
  The target object being tested.

**Returns**  
`boolean` — Can the target object theoretically be detected by this vision source?

### _configure

```typescript
_configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options**: `object` = {}  
  Optional  
  Additional options modifying the configuration.

**Returns**  
`void`

Inherited from [DataModel._configure](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_configure)

### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: `object` = {}  
  Optional  
  Options provided to the model constructor.

**Returns**  
`void`

Inherited from [DataModel._initialize](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initialize)

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
  The candidate source data from which the model will be constructed.

- **options**: `object` = {}  
  Optional  
  Options provided to the model constructor.

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [DataModel._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializesource)

### _testAngle

```typescript
_testAngle(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    target: null | object,
    test: CanvasVisibilityTest,
): boolean
```

Test whether the target is within the vision angle.

**Parameters**

- **visionSource**: [`PointVisionSource`](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested.

- **mode**: [`TokenDetectionMode`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: [`CanvasVisibilityTest`](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html)  
  The test case being evaluated.

**Returns**  
`boolean` — Is the point within the vision angle?

### _testLOS

```typescript
_testLOS(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    target: null | object,
    test: CanvasVisibilityTest,
): boolean
```

Test whether the line-of-sight requirement for detection is satisfied. Always true if the detection mode bypasses walls, otherwise the test point must be contained by the LOS polygon. The result is cached for the vision source so that later checks for other detection modes do not repeat it.

**Parameters**

- **visionSource**: [`PointVisionSource`](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested.

- **mode**: [`TokenDetectionMode`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: [`CanvasVisibilityTest`](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html)  
  The test case being evaluated.

**Returns**  
`boolean` — Is the LOS requirement satisfied for this test?

### _testPoint

```typescript
_testPoint(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    target: null | object,
    test: CanvasVisibilityTest,
): boolean
```

Evaluate a single test point to confirm whether it is visible. Standard detection rules require that the test point be both within LOS and within range.

**Parameters**

- **visionSource**: [`PointVisionSource`](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested.

- **mode**: [`TokenDetectionMode`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: [`CanvasVisibilityTest`](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html)  
  The test case being evaluated.

**Returns**  
`boolean`

### _testRange

```typescript
_testRange(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    target: null | object,
    test: CanvasVisibilityTest,
): boolean
```

Verify that a target is in range of a source.

**Parameters**

- **visionSource**: [`PointVisionSource`](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested.

- **mode**: [`TokenDetectionMode`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: [`CanvasVisibilityTest`](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html)  
  The test case being evaluated.

**Returns**  
`boolean` — Is the target within range?

---

## Static Methods

### cleanData

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object` = {}  
  Optional  
  The source data object.

- **options**: `object` = {}  
  Optional  
  Additional options which are passed to field cleaning methods.

**Returns**  
The cleaned source data, which is the same object as the `source` argument.

Inherited from [DataModel.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#cleandata)

### defineSchema

```typescript
defineSchema(): {
    angle: BooleanField;
    id: StringField;
    label: StringField;
    tokenConfig: BooleanField;
    type: NumberField;
    walls: BooleanField;
}
```

Overrides [DataModel.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#defineschema)

### fromJSON

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format.

**Returns**  
A constructed data model instance.

Inherited from [DataModel.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromjson)

### fromSource

```typescript
fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}`  
  Optional  
  Model construction context.

**Returns**  
DataModel instance.

Inherited from [DataModel.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromsource)

### getDetectionFilter

```typescript
getDetectionFilter(): undefined | Filter
```

Get the detection filter pertaining to this mode.

**Returns**  
`undefined | Filter`

### migrateData

```typescript
migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [DataModel.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedata)

### migrateDataSafe

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [DataModel.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedatasafe)

### shimData

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema.

- **options**: `{ embedded?: boolean }` = {}  
  Optional  
  Additional shimming options.

  - **embedded**?: `boolean`  
    Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [DataModel.shimData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#shimdata)

### validateJoint

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model.

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from [DataModel.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validatejoint)

---

## Protected Static Methods

### _initializationOrder

```typescript
_initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns**  
`Generator<[string, DataField], any, any>`

Inherited from [DataModel._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializationorder)