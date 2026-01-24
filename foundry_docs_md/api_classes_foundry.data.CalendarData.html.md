# CalendarData | Foundry Virtual Tabletop - API Documentation - Version 13

Game Time Calendar configuration data model.

Mixes:  
- CalendarConfig

Type Parameters:  
- `Components`

Hierarchy:  
- [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)  
- CalendarData

---

## Constructors

```typescript
new CalendarData<
  Components extends TimeComponents
>(
  data?: object,
  options?: DataModelConstructionContext,
): CalendarData<Components>
```

### Parameters

- **data**: `object` = {}  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html) = {}  
  Context and data validation options which affects initial model construction.

### Returns

- `CalendarData<Components>`

Inherited from [DataModel.constructor](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#constructor)

---

## Properties

- **_source**: `object`  
  The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
  Inherited from [DataModel._source](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_source)

- **parent**: `null | DataModel<object, DataModelConstructionContext>`  
  An immutable reverse-reference to a parent DataModel to which this model belongs.  
  Inherited from [DataModel.parent](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#parent)

### Static

- **LOCALIZATION_PREFIXES**: `string[] = []`  
  A set of localization prefix paths which are used by this DataModel.  
  Inherited from [DataModel.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#localization_prefixes)

---

## Accessors

- **invalid**

```typescript
get invalid(): boolean
```
Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
Returns `boolean`  
Inherited from `DataModel.invalid`

- **schema**

```typescript
get schema(): SchemaField
```
Define the data schema for this document instance.  
Returns [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)  
Inherited from `DataModel.schema`

- **validationFailures**

```typescript
get validationFailures(): {
  fields: null | DataModelValidationFailure;
  joint: null | DataModelValidationFailure;
}
```
An array of validation failure instances which may have occurred when this instance was last validated.  
Returns an object containing:
- **fields**: `null | DataModelValidationFailure`
- **joint**: `null | DataModelValidationFailure`  
Inherited from `DataModel.validationFailures`

---

## Methods

### Static Methods

- **schema**

```typescript
static get schema(): SchemaField
```
The Data Schema for all instances of this DataModel.  
Returns [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)  
Inherited from `DataModel.schema`

- **add**

```typescript
add(
  startTime: number | Components,
  deltaTime: number | Components
): Components
```
Modify some start time by adding a number of seconds or components to it. The delta components may be negative.

#### Parameters

- **startTime**: `number | Components`  
  The initial time

- **deltaTime**: `number | Components`  
  Differential components to add

#### Returns

- `Components`  
  The resulting time

- **clone**

```typescript
clone(
  data?: object,
  context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```
Clone a model, creating a new data model by combining current data with provided overrides.

#### Parameters

- **data**: `object = {}`  
  Additional data which overrides current document data at the time of creation

- **context**: [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html) = {}  
  Context options passed to the data model constructor

#### Returns

- `DataModel<object, DataModelConstructionContext>`  
  The cloned instance

Inherited from [DataModel.clone](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#clone)

- **componentsToTime**

```typescript
componentsToTime(components: Partial<Components>): number
```
Expand a world time integer into an object containing the relevant time components.

#### Parameters

- **components**: `Partial<Components>`  
  An amount of time expressed as components

#### Returns

- `number`  
  The cumulative time in seconds

- **difference**

```typescript
difference(
  endTime: number | Components,
  startTime?: number | Components,
): Components
```
Compute the difference between some new time and some other time.

#### Parameters

- **endTime**: `number | Components`  
  A time to difference relative to the start time.

- **startTime**: `number | Components` (optional)  
  The starting time. If not provided the current world time is used.

#### Returns

- `Components`  
  The time difference expressed as components

- **format**

```typescript
format(
  time?: number | Components,
  formatter?: string | TimeFormatter = "timestamp",
  options?: object,
): string
```
Format a time using one of several supported display formats.

#### Parameters

- **time**: `number | Components` (optional)  
  The time components to format, by default the current world time.

- **formatter**: `string | TimeFormatter` = `"timestamp"` (optional)  
  The formatter function applied to the time. If a string is provided, it must be a function configured in `CONFIG.time.formatters`.

- **options**: `object` = {} (optional)  
  Options passed to the formatter function

#### Returns

- `string`  
  The formatted date and time string

- **isLeapYear**

```typescript
isLeapYear(year: number): boolean
```
Test whether a year is a leap year.

#### Parameters

- **year**: `number`  
  The year to test

#### Returns

- `boolean`  
  Is it a leap year?

- **reset**

```typescript
reset(): void
```
Reset the state of this data instance back to mirror the contained source data, erasing any changes.

#### Returns

- `void`

Inherited from [DataModel.reset](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#reset)

- **timeToComponents**

```typescript
timeToComponents(time?: number): Components
```
Expand a world time integer into an object containing the relevant time components.

#### Parameters

- **time**: `number` = 0  
  A time in seconds

#### Returns

- `Components`  
  The time expressed as components

- **toJSON**

```typescript
toJSON(): object
```
Extract the source data for the DataModel into a simple object format that can be serialized.

#### Returns

- `object`  
  The document source data expressed as a plain object

Inherited from [DataModel.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#tojson)

- **toObject**

```typescript
toObject(source?: boolean): object
```
Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

#### Parameters

- **source**: `boolean` = true (optional)  
  Draw values from the underlying data source rather than transformed values

#### Returns

- `object`  
  The extracted primitive object

Inherited from [DataModel.toObject](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#toobject)

- **updateSource**

```typescript
updateSource(
  changes?: object,
  options?: DataModelUpdateOptions,
): object
```
Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

#### Parameters

- **changes**: `object` = {} (optional)  
  New values which should be applied to the data model

- **options**: [`DataModelUpdateOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelUpdateOptions.html) = {} (optional)  
  Options which determine how the new data is merged

#### Returns

- `object`  
  An object containing differential keys and values that were changed

#### Throws

- Throws an error if the requested data model changes were invalid.

Inherited from [DataModel.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#updatesource)

- **validate**

```typescript
validate(
  options?: DataModelValidationOptions
): boolean
```
Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

#### Parameters

- **options**: [`DataModelValidationOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html) = {} (optional)  
  Options which modify how the model is validated

#### Returns

- `boolean`  
  Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

#### Throws

- Throws an error if validation is strict and a failure occurs.

Inherited from [DataModel.validate](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validate)

---

## Protected Methods

- **_configure**

```typescript
protected _configure(options?: object): void
```
Configure the data model instance before validation and initialization workflows are performed.

#### Parameters

- **options**: `object` = {} (optional)  
  Additional options modifying the configuration

#### Returns

- `void`

Inherited from [DataModel._configure](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_configure)

- **_initialize**

```typescript
protected _initialize(options?: object): void
```
Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

#### Parameters

- **options**: `object` = {} (optional)  
  Options provided to the model constructor

#### Returns

- `void`

Inherited from [DataModel._initialize](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initialize)

- **_initializeSource**

```typescript
protected _initializeSource(
  data: object | DataModel<object, DataModelConstructionContext>,
  options?: object,
): object
```
Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

#### Parameters

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options**: `object` = {} (optional)  
  Options provided to the model constructor

#### Returns

- `object`  
  Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [DataModel._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializesource)

---

## Static Methods (continued)

- **cleanData**

```typescript
static cleanData(source?: object, options?: object): object
```
Clean a data source object to conform to a specific provided schema.

#### Parameters

- **source**: `object` = {} (optional)  
  The source data object

- **options**: `object` = {} (optional)  
  Additional options which are passed to field cleaning methods

#### Returns

- `object`  
  The cleaned source data, which is the same object as the `source` argument

Inherited from [DataModel.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#cleandata)

- **defineSchema**

```typescript
static defineSchema(): {
  days: SchemaField;
  description: StringField;
  months: SchemaField;
  name: StringField;
  seasons: SchemaField;
  years: SchemaField;
}
```
Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

#### Returns

An object describing the schema fields:

- **days**: [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)
- **description**: [`StringField`](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)
- **months**: [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)
- **name**: [`StringField`](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)
- **seasons**: [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)
- **years**: [`SchemaField`](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)

Overrides [DataModel.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#defineschema)

- **formatAgo**

```typescript
static formatAgo(
  calendar: CalendarData,
  components: TimeComponents,
  options: object
): string
```
Format time components into a "time ago" string using the given calendar configuration.

#### Parameters

- **calendar**: `CalendarData`  
  The configured calendar

- **components**: [`TimeComponents`](https://foundryvtt.com/api/interfaces/foundry.data.types.TimeComponents.html)  
  Time components to format

- **options**: `object`  
  Additional formatting options

#### Returns

- `string`  
  The returned string format

- **formatTimestamp**

```typescript
static formatTimestamp(
  calendar: CalendarData,
  components: TimeComponents,
  options: object
): string
```
Format time components into a timestamp string using the given calendar configuration.

#### Parameters

- **calendar**: `CalendarData`  
  The configured calendar

- **components**: [`TimeComponents`](https://foundryvtt.com/api/interfaces/foundry.data.types.TimeComponents.html)  
  Time components to format

- **options**: `object`  
  Additional formatting options

#### Returns

- `string`  
  The returned string format

- **fromJSON**

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```
Create a DataModel instance using a provided serialized JSON string.

#### Parameters

- **json**: `string`  
  Serialized document data in string format

#### Returns

- `DataModel<object, DataModelConstructionContext>`  
  A constructed data model instance

Inherited from [DataModel.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromjson)

- **fromSource**

```typescript
static fromSource(
  source: object,
  context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```
Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

#### Parameters

- **source**: `object`  
  Initial document data which comes from a trusted source.

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = {} (optional)  
  Model construction context

#### Returns

- `DataModel<object, DataModelConstructionContext>`

Inherited from [DataModel.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromsource)

- **migrateData**

```typescript
static migrateData(source: object): object
```
Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

#### Parameters

- **source**: `object`  
  The candidate source data from which the model will be constructed

#### Returns

- `object`  
  Migrated source data, which is the same object as the `source` argument

Inherited from [DataModel.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedata)

- **migrateDataSafe**

```typescript
static migrateDataSafe(source: object): object
```
Wrap data migration in a try/catch which attempts it safely.

#### Parameters

- **source**: `object`  
  The candidate source data from which the model will be constructed

#### Returns

- `object`  
  Migrated source data, which is the same object as the `source` argument

Inherited from [DataModel.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedatasafe)

- **shimData**

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```
Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

#### Parameters

- **data**: `object`  
  Data which matches the current schema

- **options**: `{ embedded?: boolean }` = {} (optional)  
  Additional shimming options

  - **embedded?**: `boolean` (optional)  
    Apply shims to embedded models?

#### Returns

- `object`  
  Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [DataModel.shimData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#shimdata)

- **validateJoint**

```typescript
static validateJoint(data: object): void
```
Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

#### Parameters

- **data**: `object`  
  Candidate data for the model

#### Returns

- `void`

#### Throws

- Throws an error if a validation failure is detected

Inherited from [DataModel.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validatejoint)

---

## Protected Static Methods

- **_initializationOrder**

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```
A generator that orders the DataFields in the DataSchema into an expected initialization order.

#### Returns

- `Generator<[string, DataField], any, any>`

Inherited from [DataModel._initializationOrder](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializationorder)