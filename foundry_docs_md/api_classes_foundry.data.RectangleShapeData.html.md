# RectangleShapeData

The data model for a rectangular shape.

## Hierarchy  
- [BaseShapeData](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html)  
- RectangleShapeData

---

## Constructors

```typescript
new RectangleShapeData(
    data?: object,
    options?: DataModelConstructionContext,
): RectangleShapeData
```

**Parameters**

- **data**: `object` = {}  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated. *(Optional)*

- **options**: `DataModelConstructionContext` = {}  
  Context and data validation options which affects initial model construction. *(Optional)*

**Returns**  
`RectangleShapeData`

Inherited from [BaseShapeData.constructor](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#constructor)

---

## Properties

### _source

`object`  
The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [BaseShapeData._source](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#_source)

### parent

`null | DataModel<object, DataModelConstructionContext>`  
An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BaseShapeData.parent](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#parent)

### LOCALIZATION_PREFIXES

`string[] = []`  
A set of localization prefix paths which are used by this DataModel.

Inherited from [BaseShapeData.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#localization_prefixes)

### TYPE

`string = ""`  
The type of this shape.

Inherited from [BaseShapeData.TYPE](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#type)

---

## Accessors

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from [BaseShapeData.invalid](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#invalid)

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from [BaseShapeData.schema](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#schema)

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

Inherited from [BaseShapeData.validationFailures](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#validationFailures)

### static schema

```typescript
static get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.

**Returns**  
`SchemaField`

Inherited from [BaseShapeData.schema](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#schema)

### static TYPES

```typescript
static get TYPES(): Readonly<{
    circle: CircleShapeData;
    ellipse: EllipseShapeData;
    polygon: PolygonShapeData;
    rectangle: RectangleShapeData;
}>
```

The possible shape types.

**Returns**  
Readonly of:  
- circle: [CircleShapeData](https://foundryvtt.com/api/classes/foundry.data.CircleShapeData.html)  
- ellipse: [EllipseShapeData](https://foundryvtt.com/api/classes/foundry.data.EllipseShapeData.html)  
- polygon: [PolygonShapeData](https://foundryvtt.com/api/classes/foundry.data.PolygonShapeData.html)  
- rectangle: [RectangleShapeData](https://foundryvtt.com/api/classes/foundry.data.RectangleShapeData.html)

Inherited from [BaseShapeData.TYPES](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#TYPES)

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
  Additional data which overrides current document data at the time of creation *(Optional)*

- **context**: `DataModelConstructionContext` = {}  
  Context options passed to the data model constructor *(Optional)*

**Returns**  
A cloned instance of `DataModel<object, DataModelConstructionContext>`

Inherited from [BaseShapeData.clone](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#clone)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [BaseShapeData.reset](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#reset)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
The document source data expressed as a plain object.

Inherited from [BaseShapeData.toJSON](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#toJSON)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = true  
  Draw values from the underlying data source rather than transformed values *(Optional)*

**Returns**  
The extracted primitive object.

Inherited from [BaseShapeData.toObject](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#toObject)

---

### updateSource

```typescript
updateSource(
    changes?: object, 
    options?: DataModelUpdateOptions
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = {}  
  New values which should be applied to the data model *(Optional)*

- **options**: `DataModelUpdateOptions` = {}  
  Options which determine how the new data is merged *(Optional)*

**Returns**  
An object containing differential keys and values that were changed.

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [BaseShapeData.updateSource](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#updateSource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = {}  
  Options which modify how the model is validated *(Optional)*

**Returns**  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseShapeData.validate](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#validate)

---

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options**: `object` = {}  
  Additional options modifying the configuration *(Optional)*

**Returns**  
`void`

Inherited from [BaseShapeData._configure](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#_configure)

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- **options**: `object` = {}  
  Options provided to the model constructor *(Optional)*

**Returns**  
`void`

Inherited from [BaseShapeData._initialize](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#_initialize)

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
  The candidate source data from which the model will be constructed

- **options**: `object` = {}  
  Options provided to the model constructor *(Optional)*

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [BaseShapeData._initializeSource](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#_initializeSource)

---

### static cleanData

```typescript
static cleanData(
    source?: object, 
    options?: object
): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object` = {}  
  The source data object *(Optional)*

- **options**: `object` = {}  
  Additional options which are passed to field cleaning methods *(Optional)*

**Returns**  
The cleaned source data, which is the same object as the `source` argument.

Inherited from [BaseShapeData.cleanData](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#cleanData)

---

### static defineSchema

```typescript
static defineSchema(): 
    { hole: BooleanField; type: StringField; } 
    & {
        height: NumberField;
        rotation: AngleField;
        width: NumberField;
        x: NumberField;
        y: NumberField;
    }
```

Overrides [BaseShapeData.defineSchema](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#defineSchema).

**Returns**  
An object combining:  
- `hole`: [BooleanField](https://foundryvtt.com/api/classes/foundry.data.fields.BooleanField.html)  
- `type`: [StringField](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)  
and  
- `height`: [NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html)  
- `rotation`: [AngleField](https://foundryvtt.com/api/classes/foundry.data.fields.AngleField.html)  
- `width`: [NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html)  
- `x`: [NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html)  
- `y`: [NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html)

---

### static fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns**  
A constructed data model instance.

Inherited from [BaseShapeData.fromJSON](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#fromJSON)

---

### static fromSource

```typescript
static fromSource(
    source: object, 
    context?: Omit<DataModelConstructionContext, "strict"> 
            & DataModelFromSourceOptions
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = {}  
  Model construction context *(Optional)*

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [BaseShapeData.fromSource](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#fromSource)

---

### static migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseShapeData.migrateData](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#migrateData)

---

### static migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseShapeData.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#migrateDataSafe)

---

### static shimData

```typescript
static shimData(
    data: object, 
    options?: { embedded?: boolean }
): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema

- **options**: `{ embedded?: boolean }` = {}  
  Additional shimming options *(Optional)*

  - **embedded?**: `boolean`  
    Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [BaseShapeData.shimData](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#shimData)

---

### static validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from [BaseShapeData.validateJoint](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#validateJoint)

---

### protected static _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns**  
A `Generator<[string, DataField], any, any>`

Inherited from [BaseShapeData._initializationOrder](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html#_initializationOrder)

---

**See also:** [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)