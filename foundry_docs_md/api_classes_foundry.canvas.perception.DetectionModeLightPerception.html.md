# DetectionModeLightPerception | Foundry Virtual Tabletop - API Documentation - Version 13

This detection mode tests whether the target is visible due to being illuminated by a light source. By default tokens have light perception with an infinite range if light perception isn't explicitly configured.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.perception.DetectionModeLightPerception)  

- *DetectionMode*  
- **DetectionModeLightPerception**

## Constructors

### constructor

```typescript
new DetectionModeLightPerception(
    data?: object,
    options?: DataModelConstructionContext,
): DetectionModeLightPerception
```

**Parameters**

- **data**: `object` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: `DataModelConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

## Properties

### _source

`_source: object`  
The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
Inherited from [DetectionMode._source](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_source).

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`  
An immutable reverse-reference to a parent DataModel to which this model belongs.  
Inherited from [DetectionMode.parent](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#parent).

### _detectionFilter (Static)

`_detectionFilter: undefined | Filter`  
An optional filter to apply on the target when it is detected with this mode.  
Inherited from [DetectionMode._detectionFilter](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_detectionfilter).

### LOCALIZATION_PREFIXES (Static)

`LOCALIZATION_PREFIXES: string[] = []`  
A set of localization prefix paths which are used by this DataModel.  
Inherited from [DetectionMode.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#localization_prefixes).

## Accessors

### BASIC_MODE_ID

```typescript
get BASIC_MODE_ID(): "basicSight"
```
The identifier of the basic sight detection mode.  
Returns `"basicSight"`  
Inherited from DetectionMode.BASIC_MODE_ID

### invalid

```typescript
get invalid(): boolean
```
Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
Returns `boolean`  
Inherited from DetectionMode.invalid

### schema

```typescript
get schema(): SchemaField
```
Define the data schema for this document instance.  
Returns `SchemaField`  
Inherited from DetectionMode.schema

### validationFailures

```typescript
get validationFailures(): {
  fields: null | DataModelValidationFailure;
  joint: null | DataModelValidationFailure;
}
```
An array of validation failure instances which may have occurred when this instance was last validated.  
Inherited from DetectionMode.validationFailures

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
Returns a readonly object with keys: MOVE, OTHER, SIGHT, SOUND.  
Inherited from DetectionMode.DETECTION_TYPES

### schema (Static)

```typescript
get schema(): SchemaField
```
The Data Schema for all instances of this DataModel.  
Returns `SchemaField`  
Inherited from DetectionMode.schema

## Methods

### _canDetect

```typescript
_canDetect(visionSource: any, target: any): boolean
```
Overrides [DetectionMode._canDetect](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_candetect).

**Parameters**

- **visionSource**: `any`
- **target**: `any`

**Returns**  
`boolean`

### _testPoint

```typescript
_testPoint(visionSource: any, mode: any, target: any, test: any): boolean
```
Evaluate a single test point to confirm whether it is visible. Standard detection rules require that the test point be both within Line of Sight (LOS) and within range.  
Overrides [DetectionMode._testPoint](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testpoint).

**Parameters**

- **visionSource**: `any` — The vision source being tested
- **mode**: `any` — The detection mode configuration
- **target**: `any` — The target object being tested
- **test**: `any` — The test case being evaluated

**Returns**  
`boolean`

### clone

```typescript
clone(
    data?: object,
    context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```
Clone a model, creating a new data model by combining current data with provided overrides.  
Inherited from [DetectionMode.clone](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#clone).

**Parameters**

- **data**: `object` = `{}`  
  Additional data which overrides current document data at the time of creation

- **context**: `DataModelConstructionContext` = `{}`  
  Context options passed to the data model constructor

**Returns**  
The cloned instance `[DataModel<object, DataModelConstructionContext>]`

### reset

```typescript
reset(): void
```
Reset the state of this data instance back to mirror the contained source data, erasing any changes.  
Inherited from [DetectionMode.reset](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#reset).

**Returns**  
`void`

### testVisibility

```typescript
testVisibility(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    config: CanvasVisibilityTestConfiguration,
): boolean
```
Test visibility of a target object or array of points for a specific vision source.  
Inherited from [DetectionMode.testVisibility](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#testvisibility).

**Parameters**

- **visionSource**: [PointVisionSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested

- **mode**: [TokenDetectionMode](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration

- **config**: [CanvasVisibilityTestConfiguration](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTestConfiguration.html)  
  The visibility test configuration

**Returns**  
`boolean` — Is the test target visible?

### toJSON

```typescript
toJSON(): object
```
Extract the source data for the DataModel into a simple object format that can be serialized.  
Inherited from [DetectionMode.toJSON](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#tojson).

**Returns**  
`object` — The document source data expressed as a plain object

### toObject

```typescript
toObject(source?: boolean): object
```
Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.  
Inherited from [DetectionMode.toObject](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#toobject).

**Parameters**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**  
`object` — The extracted primitive object

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```
Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

Inherited from [DetectionMode.updateSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#updatesource).

**Parameters**

- **changes**: `object` = `{}`  
  New values which should be applied to the data model

- **options**: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns**  
`object` — An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```
Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.  
Inherited from [DetectionMode.validate](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#validate).

**Parameters**

- **options**: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns**  
`boolean` — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

### _configure (Protected)

```typescript
_configure(options?: object): void
```
Configure the data model instance before validation and initialization workflows are performed.  
Inherited from [DetectionMode._configure](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_configure).

**Parameters**

- **options**: `object` = `{}`  
  Additional options modifying the configuration

**Returns**  
`void`

### _initialize (Protected)

```typescript
_initialize(options?: object): void
```
Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.  
Inherited from [DetectionMode._initialize](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initialize).

**Parameters**

- **options**: `object` = `{}`  
  Options provided to the model constructor

**Returns**  
`void`

### _initializeSource (Protected)

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```
Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.  
Inherited from [DetectionMode._initializeSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initializeSource).

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options**: `object` = `{}`  
  Options provided to the model constructor

**Returns**  
`object` — Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument

### _testAngle (Protected)

```typescript
_testAngle(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    target: null | object,
    test: CanvasVisibilityTest,
): boolean
```
Test whether the target is within the vision angle.  
Inherited from [DetectionMode._testAngle](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testAngle).

**Parameters**

- **visionSource**: [PointVisionSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested

- **mode**: [TokenDetectionMode](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration

- **target**: `null | object`  
  The target object being tested

- **test**: [CanvasVisibilityTest](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html)  
  The test case being evaluated

**Returns**  
`boolean` — Is the point within the vision angle?

### _testLOS (Protected)

```typescript
_testLOS(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    target: null | object,
    test: CanvasVisibilityTest,
): boolean
```
Test whether the line-of-sight requirement for detection is satisfied. Always true if the detection mode bypasses walls, otherwise the test point must be contained by the LOS polygon. The result is cached for the vision source so that later checks for other detection modes do not repeat it.  
Inherited from [DetectionMode._testLOS](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testLOS).

**Parameters**

- **visionSource**: [PointVisionSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested

- **mode**: [TokenDetectionMode](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration

- **target**: `null | object`  
  The target object being tested

- **test**: [CanvasVisibilityTest](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html)  
  The test case being evaluated

**Returns**  
`boolean` — Is the LOS requirement satisfied for this test?

### _testRange (Protected)

```typescript
_testRange(
    visionSource: PointVisionSource,
    mode: TokenDetectionMode,
    target: null | object,
    test: CanvasVisibilityTest,
): boolean
```
Verify that a target is in range of a source.  
Inherited from [DetectionMode._testRange](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testRange).

**Parameters**

- **visionSource**: [PointVisionSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
  The vision source being tested

- **mode**: [TokenDetectionMode](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html)  
  The detection mode configuration

- **target**: `null | object`  
  The target object being tested

- **test**: [CanvasVisibilityTest](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html)  
  The test case being evaluated

**Returns**  
`boolean` — Is the target within range?

### cleanData (Static)

```typescript
cleanData(source?: object, options?: object): object
```
Clean a data source object to conform to a specific provided schema.  
Inherited from [DetectionMode.cleanData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#cleanData).

**Parameters**

- **source**: `object` = `{}`  
  The source data object

- **options**: `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns**  
`object` — The cleaned source data, which is the same object as the `source` argument

### defineSchema (Static)

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
Inherited from [DetectionMode.defineSchema](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#defineSchema).

**Returns**  
An object defining the schema fields:

- **angle**: `BooleanField`
- **id**: `StringField`
- **label**: `StringField`
- **tokenConfig**: `BooleanField`
- **type**: `NumberField`
- **walls**: `BooleanField`

### fromJSON (Static)

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```
Create a DataModel instance using a provided serialized JSON string.  
Inherited from [DetectionMode.fromJSON](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#fromJSON).

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns**  
A constructed data model instance

### fromSource (Static)

```typescript
fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```
Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.  
Inherited from [DetectionMode.fromSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#fromSource).

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context

**Returns**  
A constructed data model instance

### getDetectionFilter (Static)

```typescript
getDetectionFilter(): undefined | Filter
```
Get the detection filter pertaining to this mode.  
Inherited from [DetectionMode.getDetectionFilter](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#getDetectionFilter).

**Returns**  
`undefined | Filter`

### migrateData (Static)

```typescript
migrateData(source: object): object
```
Migrate candidate source data for this DataModel which may require initial cleaning or transformations.  
Inherited from [DetectionMode.migrateData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#migrateData).

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument

### migrateDataSafe (Static)

```typescript
migrateDataSafe(source: object): object
```
Wrap data migration in a try/catch which attempts it safely.  
Inherited from [DetectionMode.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#migrateDataSafe).

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument

### shimData (Static)

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```
Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.  
Inherited from [DetectionMode.shimData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#shimData).

**Parameters**

- **data**: `object`  
  Data which matches the current schema

- **options**: `{ embedded?: boolean }` = `{}`  
  Additional shimming options

  - **embedded?**: `boolean`  
    Apply shims to embedded models?

**Returns**  
`object` — Data with added backwards-compatible properties, which is the same object as the `data` argument

### validateJoint (Static)

```typescript
validateJoint(data: object): void
```
Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.  
Inherited from [DetectionMode.validateJoint](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#validateJoint).

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected

### _initializationOrder (Static, Protected)

```typescript
_initializationOrder(): Generator<[string, DataField], any, any>
```
A generator that orders the DataFields in the DataSchema into an expected initialization order.  
Inherited from [DetectionMode._initializationOrder](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initializationOrder).

**Returns**  
`Generator<[string, DataField], any, any>`

---

For complete details, visit the [DetectionModeLightPerception class documentation](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeLightPerception.html).