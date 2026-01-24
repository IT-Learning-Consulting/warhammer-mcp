# BasePackage

The data schema used to define a Package manifest. Specific types of packages extend this schema with additional fields.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.packages.BasePackage), Expand

- _DataModel_  
- **BasePackage**  
- _BaseWorld_  
- _BaseSystem_  
- _BaseModule_

---

## Constructors

### constructor

```typescript
new BasePackage(data: PackageManifestData, options?: object): BasePackage
```

- **data**: `PackageManifestData`  
  Source data for the package (Optional)
- **options**: `object = {}`  
  Options which affect DataModel construction (Optional)

**Returns**  
`BasePackage`  
Overrides [DataModel.constructor](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#constructor)

---

## Properties

### _source

- **_source**: `object`  
The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
Inherited from [DataModel._source](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_source)

### availability

- **availability**: `number`  
An availability code in `PACKAGE_AVAILABILITY_CODES` which defines whether this package can be used.

### exclusive

- **exclusive**: `boolean`  
A flag which tracks whether this package is a free Exclusive pack

### hasStorage

- **hasStorage**: `boolean`  
A flag which tracks if this package has files stored in the persistent storage folder

### locked

- **locked**: `boolean`  
A flag which tracks whether this package is currently locked.

### owned

- **owned**: `null | boolean`  
A flag which tracks whether this package is owned, if it is protected.

### parent

- **parent**: `null | DataModel<object, DataModelConstructionContext>`  
An immutable reverse-reference to a parent DataModel to which this model belongs.  
Inherited from [DataModel.parent](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#parent)

### tags

- **tags**: `string[]`  
A set of Tags that indicate what kind of Package this is, provided by the Website

### LOCALIZATION_PREFIXES

- **LOCALIZATION_PREFIXES**: `string[] = ...`  
Overrides [DataModel.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#localization_prefixes)

---

## Accessors

### type (Abstract, Static)

- **type**: `string = "package"`  
Define the package type in `CONST.PACKAGE_TYPES` that this class represents. Each BasePackage subclass must define this attribute.

### incompatibleWithCoreVersion

```typescript
get incompatibleWithCoreVersion(): boolean
```

Is this Package incompatible with the currently installed core Foundry VTT software version?

**Returns**: `boolean`

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
Inherited from DataModel.invalid

**Returns**: `boolean`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.  
Inherited from DataModel.schema

**Returns**: `SchemaField`

### type

```typescript
get type(): string
```

The type of this package instance. A value in `CONST.PACKAGE_TYPES`.

**Returns**: `string`

### unavailable

```typescript
get unavailable(): boolean
```

A flag which defines whether this package is unavailable to be used.

**Returns**: `boolean`

### validationFailures

```typescript
get validationFailures(): {
  fields: null | DataModelValidationFailure;
  joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.  
Inherited from DataModel.validationFailures

**Returns**: `{ fields: null | DataModelValidationFailure; joint: null | DataModelValidationFailure; }`

### collection (Static)

```typescript
get collection(): string
```

The named collection to which this package type belongs.

**Returns**: `string`

---

## Methods

### schema (Static)

```typescript
get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.  
Inherited from DataModel.schema

**Returns**: `SchemaField`

### clone

```typescript
clone(
  data?: object,
  context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided overrides.

- **data**: `object = {}`  
  Additional data which overrides current document data at the time of creation (Optional)
- **context**: `DataModelConstructionContext = {}`  
  Context options passed to the data model constructor (Optional)

**Returns**  
`DataModel<object, DataModelConstructionContext>`  
The cloned instance  
Inherited from [DataModel.clone](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#clone)

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.  
Inherited from [DataModel.reset](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#reset)

**Returns**: `void`

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.  
Inherited from [DataModel.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#tojson)

**Returns**: `object`  
The document source data expressed as a plain object

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

- **source**: `boolean = true` (Optional)  
  Draw values from the underlying data source rather than transformed values

**Returns**: `object`  
The extracted primitive object  
Inherited from [DataModel.toObject](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#toobject)

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

- **changes**: `object = {}` (Optional)  
  New values which should be applied to the data model
- **options**: `DataModelUpdateOptions = {}` (Optional)  
  Options which determine how the new data is merged

**Returns**: `object`  
An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid  
Inherited from [DataModel.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#updatesource)

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

- **options**: `DataModelValidationOptions = {}` (Optional)  
  Options which modify how the model is validated

**Returns**: `boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.  
Inherited from [DataModel.validate](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validate)

---

## Protected Methods

### _configure (Protected)

```typescript
_configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

- **options**: `object = {}` (Optional)  
  Additional options modifying the configuration

**Returns**: `void`  
Inherited from [DataModel._configure](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_configure)

### _initialize (Protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

- **options**: `object = {}` (Optional)  
  Options provided to the model constructor

**Returns**: `void`  
Inherited from [DataModel._initialize](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initialize)

### _initializeSource (Protected)

```typescript
_initializeSource(
  data: object | DataModel<object, DataModelConstructionContext>,
  options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed
- **options**: `object = {}` (Optional)  
  Options provided to the model constructor

**Returns**: `object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument  
Inherited from [DataModel._initializeSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#_initializesource)

---

## Static Methods

### cleanData

```typescript
cleanData(source?: {}, __namedParameters?: {}): object
```

Clean a data source object to conform to a specific provided schema.

- **source**: `{}` = {} (Optional)  
  The source data object
- **__namedParameters**: `{}` = {} (Optional)  
  Additional options which are passed to field cleaning methods

**Returns**: `object`  
The cleaned source data, which is the same object as the `source` argument  
Overrides [DataModel.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#cleandata)

### defineSchema

```typescript
defineSchema(): {
  authors: SetField;
  bugs: StringField;
  changelog: StringField;
  compatibility: PackageCompatibility;
  description: HTMLField;
  download: StringField;
  esmodules: SetField;
  exclusive: BooleanField;
  flags: ObjectField;
  id: StringField;
  languages: SetField;
  license: StringField;
  manifest: StringField;
  media: SetField;
  packFolders: SetField;
  packs: PackageCompendiumPacks;
  persistentStorage: BooleanField;
  protected: BooleanField;
  readme: StringField;
  relationships: PackageRelationships;
  scripts: SetField;
  socket: BooleanField;
  styles: ArrayField<SchemaField>;
  title: StringField;
  url: StringField;
  version: StringField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
The data schema object containing the fields listed above.  
Overrides [DataModel.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#defineschema)

### fromJSON

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

- **json**: `string`  
  Serialized document data in string format

**Returns**  
A constructed data model instance  
Inherited from [DataModel.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromjson)

### fromRemoteManifest

```typescript
fromRemoteManifest(
  manifestUrl: string,
  options?: { strict?: boolean },
): Promise<ServerPackage>
```

Retrieve the latest Package manifest from a provided remote location.

- **manifestUrl**: `string`  
  A remote manifest URL to load
- **options**: `{ strict?: boolean } = {}` (Optional)  
  Additional options which affect package construction
- **strict**?: `boolean`  
  Whether to construct the remote package strictly (Optional)

**Returns**  
A Promise which resolves to a constructed `ServerPackage` instance

**Throws**  
An error if the retrieved manifest data is invalid

### fromSource

```typescript
fromSource(
  source: object,
  context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

- **source**: `object`  
  Initial document data which comes from a trusted source.
- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}` (Optional)  
  Model construction context

**Returns**  
A constructed data model instance  
Inherited from [DataModel.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#fromsource)

### isIncompatibleWithCoreVersion

```typescript
isIncompatibleWithCoreVersion(availability: number): boolean
```

Test if a given availability is incompatible with the core version.

- **availability**: `number`  
  The availability value to test.

**Returns**  
`boolean`

### migrateData

```typescript
migrateData(data: any, __namedParameters?: {}): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

- **data**: `any`  
  The candidate source data from which the model will be constructed
- **__namedParameters**: `{}` = {} (Optional)

**Returns**  
Migrated source data, which is the same object as the `source` argument  
Overrides [DataModel.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedata)

### migrateDataSafe

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument  
Inherited from [DataModel.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#migratedatasafe)

### shimData

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

- **data**: `object`  
  Data which matches the current schema
- **options**: `{ embedded?: boolean } = {}` (Optional)  
  Additional shimming options
- **embedded**?: `boolean` (Optional)  
  Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data` argument  
Inherited from [DataModel.shimData](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#shimdata)

### testAvailability

```typescript
testAvailability(
  data: Partial<PackageManifestData>,
  options?: { release?: any },
): number
```

Check the given compatibility data against the current installation state and determine its availability.

- **data**: `Partial<PackageManifestData>`  
  The compatibility data to test.
- **options**: `{ release?: any } = {}` (Optional)
- **release**?: `any` (Optional)  
  A specific software release for which to test availability. Tests against the current release by default.

**Returns**  
`number`

### testDependencyCompatibility

```typescript
testDependencyCompatibility(
  compatibility: PackageCompatibility,
  dependency: BasePackage,
): boolean
```

Determine if a dependency is within the given compatibility range.

- **compatibility**: `PackageCompatibility`  
  The compatibility range declared for the dependency, if any
- **dependency**: `BasePackage`  
  The known dependency package

**Returns**  
`boolean`  
Is the dependency compatible with the required range?

### validateId

```typescript
validateId(id: string): void
```

Validate that a Package ID is allowed.

- **id**: `string`  
  The candidate ID

**Returns**: `void`

**Throws**  
An error if the candidate ID is invalid

### validateJoint

```typescript
validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

- **data**: `object`  
  Candidate data for the model

**Returns**: `void`

**Throws**  
An error if a validation failure is detected  
Inherited from [DataModel.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html#validatejoint)

### validateVersion

```typescript
validateVersion(version: string): void
```

Validate that a version is allowed.

- **version**: `string`  
  The candidate version

**Returns**: `void`

**Throws**  
An error if the version is invalid

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