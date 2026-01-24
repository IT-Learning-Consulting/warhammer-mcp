# DetectionModeDarkvision | Foundry Virtual Tabletop - API Documentation - Version 13

A special detection mode which models a form of darkvision (night vision). This mode is the default case which is tested first when evaluating visibility of objects.

## Hierarchy
- [DetectionMode](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html)
- DetectionModeDarkvision

---

## Constructors

### constructor

```typescript
new DetectionModeDarkvision(
    data?: object,
    options?: import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext,
): import("https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeDarkvision.html").DetectionModeDarkvision
```

**Parameters**

- **data**: `object` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: `DataModelConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

---

## Properties

### _source

```typescript
_source: object
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
Inherited from [DetectionMode._source](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_source)

---

### parent

```typescript
parent: null | import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.  
Inherited from [DetectionMode.parent](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#parent)

---

### Static: _detectionFilter

```typescript
static _detectionFilter: undefined | Filter
```

An optional filter to apply on the target when it is detected with this mode.  
Inherited from [DetectionMode._detectionFilter](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_detectionfilter)

---

### Static: LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[] = []
```

A set of localization prefix paths which are used by this DataModel.  
Inherited from [DetectionMode.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#localization_prefixes)

---

## Accessors

### BASIC_MODE_ID

```typescript
get BASIC_MODE_ID(): "basicSight"
```

The identifier of the basic sight detection mode.  
**Returns:** `"basicSight"`  
Inherited from DetectionMode.BASIC_MODE_ID

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
**Returns:** `boolean`  
Inherited from DetectionMode.invalid

---

### schema

```typescript
get schema(): import("https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html").SchemaField
```

Define the data schema for this document instance.  
**Returns:** `SchemaField`  
Inherited from DetectionMode.schema

---

### validationFailures

```typescript
get validationFailures(): {
    fields: null | import("https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html").DataModelValidationFailure;
    joint: null | import("https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html").DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.  
**Returns:** Object with properties:
- `fields`: `null | DataModelValidationFailure`
- `joint`: `null | DataModelValidationFailure`  
Inherited from DetectionMode.validationFailures

---

### Static: DETECTION_TYPES

```typescript
static get DETECTION_TYPES(): Readonly<{
    MOVE: number;
    OTHER: number;
    SIGHT: number;
    SOUND: number;
}>
```

The types of the detection mode.  
**Returns:** Readonly object with numeric values for the keys `MOVE`, `OTHER`, `SIGHT`, `SOUND`  
Inherited from DetectionMode.DETECTION_TYPES

---

### Static: schema

```typescript
static get schema(): import("https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html").SchemaField
```

The Data Schema for all instances of this DataModel.  
**Returns:** `SchemaField`  
Inherited from DetectionMode.schema

---

## Methods

### _canDetect

```typescript
_canDetect(visionSource: any, target: any): boolean
```

**Parameters**
- **visionSource**: `any`
- **target**: `any`

**Returns:** `boolean`

Overrides [DetectionMode._canDetect](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_candetect)

---

### clone

```typescript
clone(
    data?: object,
    context?: import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext,
): import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided overrides.

**Parameters**

- **data**: `object = {}` (Optional)  
  Additional data which overrides current document data at the time of creation.

- **context**: `DataModelConstructionContext = {}` (Optional)  
  Context options passed to the data model constructor.

**Returns:** `DataModel<object, DataModelConstructionContext>`  
Inherited from [DetectionMode.clone](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#clone)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:** `void`  
Inherited from [DetectionMode.reset](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#reset)

---

### testVisibility

```typescript
testVisibility(
    visionSource: import("https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html").PointVisionSource,
    mode: import("https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html").TokenDetectionMode,
    config: import("https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTestConfiguration.html").CanvasVisibilityTestConfiguration,
): boolean
```

Test visibility of a target object or array of points for a specific vision source.

**Parameters**

- **visionSource**: `PointVisionSource`  
  The vision source being tested.

- **mode**: `TokenDetectionMode`  
  The detection mode configuration.

- **config**: `CanvasVisibilityTestConfiguration`  
  The visibility test configuration.

**Returns:** `boolean`  
Is the test target visible?  
Inherited from [DetectionMode.testVisibility](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#testvisibility)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:** `object`  
The document source data expressed as a plain object.  
Inherited from [DetectionMode.toJSON](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean = true` (Optional)  
  Draw values from the underlying data source rather than transformed values.

**Returns:** `object`
  
The extracted primitive object.  
Inherited from [DetectionMode.toObject](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#toobject)

---

### updateSource

```typescript
updateSource(changes?: object, options?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelUpdateOptions.html").DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object = {}` (Optional)  
  New values which should be applied to the data model.

- **options**: `DataModelUpdateOptions = {}` (Optional)  
  Options which determine how the new data is merged.

**Returns:** `object`  
An object containing differential keys and values that were changed.

**Throws:**  
An error if the requested data model changes were invalid.  
Inherited from [DetectionMode.updateSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#updatesource)

---

### validate

```typescript
validate(options?: import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html").DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions = {}` (Optional)  
  Options which modify how the model is validated.

**Returns:** `boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws:**  
An error thrown if validation is strict and a failure occurs.  
Inherited from [DetectionMode.validate](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#validate)

---

### Protected Methods

#### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options**: `object = {}` (Optional)  
  Additional options modifying the configuration.

**Returns:** `void`  
Inherited from [DetectionMode._configure](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_configure)

---

#### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: `object = {}` (Optional)  
  Options provided to the model constructor.

**Returns:** `void`  
Inherited from [DetectionMode._initialize](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initialize)

---

#### _initializeSource

```typescript
protected _initializeSource(
    data: object | import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed.

- **options**: `object = {}` (Optional)  
  Options provided to the model constructor.

**Returns:** `object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.  
Inherited from [DetectionMode._initializeSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initializesource)

---

#### _testAngle

```typescript
protected _testAngle(
    visionSource: import("https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html").PointVisionSource,
    mode: import("https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html").TokenDetectionMode,
    target: null | object,
    test: import("https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html").CanvasVisibilityTest,
): boolean
```

Test whether the target is within the vision angle.

**Parameters**

- **visionSource**: `PointVisionSource`  
  The vision source being tested.

- **mode**: `TokenDetectionMode`  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: `CanvasVisibilityTest`  
  The test case being evaluated.

**Returns:** `boolean`  
Is the point within the vision angle?  
Inherited from [DetectionMode._testAngle](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testangle)

---

#### _testLOS

```typescript
protected _testLOS(
    visionSource: import("https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html").PointVisionSource,
    mode: import("https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html").TokenDetectionMode,
    target: null | object,
    test: import("https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html").CanvasVisibilityTest,
): boolean
```

Test whether the line-of-sight requirement for detection is satisfied. Always true if the detection mode bypasses walls, otherwise the test point must be contained by the LOS polygon. The result is cached for the vision source so that later checks for other detection modes do not repeat it.

**Parameters**

- **visionSource**: `PointVisionSource`  
  The vision source being tested.

- **mode**: `TokenDetectionMode`  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: `CanvasVisibilityTest`  
  The test case being evaluated.

**Returns:** `boolean`  
Is the LOS requirement satisfied for this test?  
Inherited from [DetectionMode._testLOS](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testlos)

---

#### _testPoint

```typescript
protected _testPoint(
    visionSource: import("https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html").PointVisionSource,
    mode: import("https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html").TokenDetectionMode,
    target: null | object,
    test: import("https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html").CanvasVisibilityTest,
): boolean
```

Evaluate a single test point to confirm whether it is visible. Standard detection rules require that the test point be both within LOS and within range.

**Parameters**

- **visionSource**: `PointVisionSource`  
  The vision source being tested.

- **mode**: `TokenDetectionMode`  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: `CanvasVisibilityTest`  
  The test case being evaluated.

**Returns:** `boolean`  
Inherited from [DetectionMode._testPoint](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testpoint)

---

#### _testRange

```typescript
protected _testRange(
    visionSource: import("https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html").PointVisionSource,
    mode: import("https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenDetectionMode.html").TokenDetectionMode,
    target: null | object,
    test: import("https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTest.html").CanvasVisibilityTest,
): boolean
```

Verify that a target is in range of a source.

**Parameters**

- **visionSource**: `PointVisionSource`  
  The vision source being tested.

- **mode**: `TokenDetectionMode`  
  The detection mode configuration.

- **target**: `null | object`  
  The target object being tested.

- **test**: `CanvasVisibilityTest`  
  The test case being evaluated.

**Returns:** `boolean`  
Is the target within range?  
Inherited from [DetectionMode._testRange](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testrange)

---

## Static Methods

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object = {}` (Optional)  
  The source data object.

- **options**: `object = {}` (Optional)  
  Additional options which are passed to field cleaning methods.

**Returns:** `object`  
The cleaned source data, which is the same object as the `source` argument.  
Inherited from [DetectionMode.cleanData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#cleandata)

---

### defineSchema

```typescript
static defineSchema(): {
    angle: import("https://foundryvtt.com/api/classes/foundry.data.fields.BooleanField.html").BooleanField;
    id: import("https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html").StringField;
    label: import("https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html").StringField;
    tokenConfig: import("https://foundryvtt.com/api/classes/foundry.data.fields.BooleanField.html").BooleanField;
    type: import("https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html").NumberField;
    walls: import("https://foundryvtt.com/api/classes/foundry.data.fields.BooleanField.html").BooleanField;
}
```

Defines the data schema for the DetectionModeDarkvision data model.

**Returns:** Object defining the fields with types as shown above.  
Inherited from [DetectionMode.defineSchema](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#defineschema)

---

### fromJSON

```typescript
static fromJSON(json: string): import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format.

**Returns:** A constructed data model instance  
Inherited from [DetectionMode.fromJSON](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#fromjson)

---

### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext, "strict"> &
             import("https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelFromSourceOptions.html").DataModelFromSourceOptions,
): import("https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html").DataModel<object, import("https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html").DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.

- **context**: (Optional) Model construction context.

**Returns:** A constructed data model instance.  
Inherited from [DetectionMode.fromSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#fromsource)

---

### getDetectionFilter

```typescript
static getDetectionFilter(): undefined | Filter
```

Get the detection filter pertaining to this mode.

**Returns:** `undefined | Filter`  
Inherited from [DetectionMode.getDetectionFilter](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#getdetectionfilter)

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns:** Migrated source data, which is the same object as the `source` argument.  
Inherited from [DetectionMode.migrateData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed.

**Returns:** Migrated source data, which is the same object as the `source` argument.  
Inherited from [DetectionMode.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema.

- **options**: `{ embedded?: boolean } = {}` (Optional)  
  Additional shimming options.

- **embedded**?: `boolean` (Optional)  
  Apply shims to embedded models?

**Returns:** `object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument.  
Inherited from [DetectionMode.shimData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#shimdata)

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
**Throws:** An error if a validation failure is detected.  
Inherited from [DetectionMode.validateJoint](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#validatejoint)

---

### Protected Static Method: _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, import("https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html").DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns:** A generator yielding `[string, DataField]` tuples.  
Inherited from [DetectionMode._initializationOrder](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initializationorder)

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionModeDarkvision.html).