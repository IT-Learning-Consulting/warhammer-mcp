# DetectionModeTremor | Foundry Virtual Tabletop - API Documentation - Version 13

Detection mode that see creatures in contact with the ground.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.perception.DetectionModeTremor), Expand

- _DetectionMode_  
- **DetectionModeTremor**

---

## Constructors

### constructor

```typescript
new DetectionModeTremor(
    data?: object,
    options?: DataModelConstructionContext,
): DetectionModeTremor
```

**Parameters**

- **data**: _object_ = {}  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated. (Optional)
- **options**: _DataModelConstructionContext_ = {}  
  Context and data validation options which affects initial model construction. (Optional)

---

## Properties

### _source

_type_: object  
The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
Inherited from [DetectionMode._source](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_source)

### parent

_type_: null \| DataModel\<object, DataModelConstructionContext\>  
An immutable reverse-reference to a parent DataModel to which this model belongs.  
Inherited from [DetectionMode.parent](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#parent)

### _detectionFilter *(Static)*

_type_: undefined \| Filter  
An optional filter to apply on the target when it is detected with this mode.  
Inherited from [DetectionMode._detectionFilter](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_detectionfilter)

### LOCALIZATION_PREFIXES *(Static)*

_type_: string[] = []  
A set of localization prefix paths which are used by this DataModel.  
Inherited from [DetectionMode.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#localization_prefixes)

---

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
Returns boolean  
Inherited from DetectionMode.invalid

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.  
Returns SchemaField  
Inherited from DetectionMode.schema

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.  
Returns object with fields and joint validation failures  
Inherited from DetectionMode.validationFailures

### DETECTION_TYPES *(Static)*

```typescript
get DETECTION_TYPES(): Readonly<{
    MOVE: number;
    OTHER: number;
    SIGHT: number;
    SOUND: number;
}>
```

The types of the detection mode.  
Returns a readonly object with detection types keys and number values  
Inherited from DetectionMode.DETECTION_TYPES

### schema *(Static)*

```typescript
get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.  
Returns SchemaField  
Inherited from DetectionMode.schema

---

## Methods

### _canDetect

```typescript
_canDetect(visionSource: any, target: any): boolean
```

**Parameters**

- **visionSource**: any  
- **target**: any  

Returns boolean  
Overrides [DetectionMode._canDetect](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_candetect)

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

- **data**: object = {} (Optional)  
  Additional data which overrides current document data at the time of creation
- **context**: DataModelConstructionContext = {} (Optional)  
  Context options passed to the data model constructor

Returns cloned instance.  
Inherited from [DetectionMode.clone](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#clone)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.  
Returns void  
Inherited from [DetectionMode.reset](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#reset)

---

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

- **visionSource**: PointVisionSource  
  The vision source being tested
- **mode**: TokenDetectionMode  
  The detection mode configuration
- **config**: CanvasVisibilityTestConfiguration  
  The visibility test configuration

Returns boolean — Is the test target visible?  
Inherited from [DetectionMode.testVisibility](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#testvisibility)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.  
Returns object — The document source data expressed as a plain object  
Inherited from [DetectionMode.toJSON](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: boolean = true (Optional)  
  Draw values from the underlying data source rather than transformed values

Returns object — The extracted primitive object  
Inherited from [DetectionMode.toObject](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#toobject)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: object = {} (Optional)  
  New values which should be applied to the data model
- **options**: DataModelUpdateOptions = {} (Optional)  
  Options which determine how the new data is merged

Returns object — An object containing differential keys and values that were changed  
Throws an error if the requested data model changes were invalid  
Inherited from [DetectionMode.updateSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: DataModelValidationOptions = {} (Optional)  
  Options which modify how the model is validated

Returns boolean — Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.  
Throws an error thrown if validation is strict and a failure occurs.  
Inherited from [DetectionMode.validate](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#validate)

---

### _configure *(Protected)*

```typescript
_configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options**: object = {} (Optional)  
  Additional options modifying the configuration

Returns void  
Inherited from [DetectionMode._configure](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_configure)

---

### _initialize *(Protected)*

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: object = {} (Optional)  
  Options provided to the model constructor

Returns void  
Inherited from [DetectionMode._initialize](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initialize)

---

### _initializeSource *(Protected)*

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **data**: object | DataModel<object, DataModelConstructionContext>  
  The candidate source data from which the model will be constructed
- **options**: object = {} (Optional)  
  Options provided to the model constructor

Returns object — Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument  
Inherited from [DetectionMode._initializeSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initializesource)

---

### _testAngle *(Protected)*

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

- **visionSource**: PointVisionSource  
  The vision source being tested
- **mode**: TokenDetectionMode  
  The detection mode configuration
- **target**: null | object  
  The target object being tested
- **test**: CanvasVisibilityTest  
  The test case being evaluated

Returns boolean — Is the point within the vision angle?  
Inherited from [DetectionMode._testAngle](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testangle)

---

### _testLOS *(Protected)*

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

- **visionSource**: PointVisionSource  
  The vision source being tested
- **mode**: TokenDetectionMode  
  The detection mode configuration
- **target**: null | object  
  The target object being tested
- **test**: CanvasVisibilityTest  
  The test case being evaluated

Returns boolean — Is the LOS requirement satisfied for this test?  
Inherited from [DetectionMode._testLOS](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testlos)

---

### _testPoint *(Protected)*

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

- **visionSource**: PointVisionSource  
  The vision source being tested
- **mode**: TokenDetectionMode  
  The detection mode configuration
- **target**: null | object  
  The target object being tested
- **test**: CanvasVisibilityTest  
  The test case being evaluated

Returns boolean  
Inherited from [DetectionMode._testPoint](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testpoint)

---

### _testRange *(Protected)*

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

- **visionSource**: PointVisionSource  
  The vision source being tested
- **mode**: TokenDetectionMode  
  The detection mode configuration
- **target**: null | object  
  The target object being tested
- **test**: CanvasVisibilityTest  
  The test case being evaluated

Returns boolean — Is the target within range?  
Inherited from [DetectionMode._testRange](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_testrange)

---

### cleanData *(Static)*

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: object = {} (Optional)  
  The source data object
- **options**: object = {} (Optional)  
  Additional options which are passed to field cleaning methods

Returns object — The cleaned source data, which is the same object as the `source` argument  
Inherited from [DetectionMode.cleanData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#cleandata)

---

### defineSchema *(Static)*

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

Inherited from [DetectionMode.defineSchema](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#defineschema)

---

### fromJSON *(Static)*

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: string  
  Serialized document data in string format

Returns a constructed data model instance  
Inherited from [DetectionMode.fromJSON](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#fromjson)

---

### fromSource *(Static)*

```typescript
fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: object  
  Initial document data which comes from a trusted source.
- **context**: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {} (Optional)  
  Model construction context

Returns a DataModel instance  
Inherited from [DetectionMode.fromSource](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#fromsource)

---

### getDetectionFilter *(Static)*

```typescript
getDetectionFilter(): Filter
```

Returns a Filter  
Overrides [DetectionMode.getDetectionFilter](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#getdetectionfilter)

---

### migrateData *(Static)*

```typescript
migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: object  
  The candidate source data from which the model will be constructed

Returns object — Migrated source data, which is the same object as the `source` argument  
Inherited from [DetectionMode.migrateData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#migratedata)

---

### migrateDataSafe *(Static)*

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely

**Parameters**

- **source**: object  
  The candidate source data from which the model will be constructed

Returns object — Migrated source data, which is the same object as the `source` argument  
Inherited from [DetectionMode.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#migratedatasafe)

---

### shimData *(Static)*

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: object  
  Data which matches the current schema
- **options**: { embedded?: boolean } = {} (Optional)  
  Additional shimming options
  - **embedded?**: boolean  
    Apply shims to embedded models?

Returns object — Data with added backwards-compatible properties, which is the same object as the `data` argument  
Inherited from [DetectionMode.shimData](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#shimdata)

---

### validateJoint *(Static)*

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: object  
  Candidate data for the model

Returns void  
Throws an error if a validation failure is detected  
Inherited from [DetectionMode.validateJoint](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#validatejoint)

---

### _initializationOrder *(Static, Protected)*

```typescript
_initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

Returns Generator yielding tuple of string and DataField  
Inherited from [DetectionMode._initializationOrder](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html#_initializationorder)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)