# Class BaseSystem

The data schema used to define System manifest files. Extends the basic `PackageData` schema with some additional system-specific fields.

[Hierarchy (View Summary, Expand)](https://foundryvtt.com/api/hierarchy.html#foundry.packages.BaseSystem)
- *BasePackage*
- **BaseSystem**
- *System*

---

## Constructors

### constructor

```typescript
new BaseSystem(data: PackageManifestData, options?: object): BaseSystem
```

**Parameters**

- **data**: `PackageManifestData`  
  Source data for the package

- **options**: `object` = `{}`  
  Options which affect DataModel construction

**Returns**  
`BaseSystem`  

_Inherited from [BasePackage.constructor](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#constructor)_

---

## Properties

### _source

`_source: object`  
The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

_Inherited from [BasePackage._source](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_source)_

### availability

`availability: number`  
An availability code in `PACKAGE_AVAILABILITY_CODES` which defines whether this package can be used.

_Inherited from [BasePackage.availability](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#availability)_

### exclusive

`exclusive: boolean`  
A flag which tracks whether this package is a free Exclusive pack.

_Inherited from [BasePackage.exclusive](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#exclusive)_

### hasStorage

`hasStorage: boolean`  
A flag which tracks if this package has files stored in the persistent storage folder.

_Inherited from [BasePackage.hasStorage](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#hasstorage)_

### locked

`locked: boolean`  
A flag which tracks whether this package is currently locked.

_Inherited from [BasePackage.locked](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#locked)_

### owned

`owned: null | boolean`  
A flag which tracks whether this package is owned, if it is protected.

_Inherited from [BasePackage.owned](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#owned)_

### parent

`parent: null | DataModel<object, DataModelConstructionContext>`  
An immutable reverse-reference to a parent DataModel to which this model belongs.

_Inherited from [BasePackage.parent](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#parent)_

### strictDataCleaning

`strictDataCleaning: boolean = false`  
Does the system template request strict type checking of data compared to `template.json` inferred types.

---

## Accessors

### tags

`tags: string[]`  
A set of Tags that indicate what kind of Package this is, provided by the Website.

_Inherited from [BasePackage.tags](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#tags)_

### icon

`static icon: string = "fa-dice"`  
The default icon used for this type of Package.

### LOCALIZATION_PREFIXES

`static LOCALIZATION_PREFIXES: string[] = ...`  

_Inherited from [BasePackage.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#localization_prefixes)_

### type

`static type: string = "system"`  
Define the package type in `CONST.PACKAGE_TYPES` that this class represents. Each `BasePackage` subclass must define this attribute.

Overrides [BasePackage.type](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#type)

---

### incompatibleWithCoreVersion

```typescript
get incompatibleWithCoreVersion(): boolean
```

Is this Package incompatible with the currently installed core Foundry VTT software version?

Returns `boolean`

_Inherited from BasePackage.incompatibleWithCoreVersion_

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

Returns `boolean`

_Inherited from BasePackage.invalid_

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

Returns `SchemaField`

_Inherited from BasePackage.schema_

---

### type

```typescript
get type(): string
```

The type of this package instance. A value in `CONST.PACKAGE_TYPES`.

Returns `string`

_Inherited from BasePackage.type_

---

### unavailable

```typescript
get unavailable(): boolean
```

A flag which defines whether this package is unavailable to be used.

Returns `boolean`

_Inherited from BasePackage.unavailable_

---

### validationFailures

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

_Inherited from BasePackage.validationFailures_

---

### collection

```typescript
static get collection(): string
```

The named collection to which this package type belongs.

Returns `string`

_Inherited from BasePackage.collection_

---

## Methods

### clone

```typescript
clone(
  data?: object,
  context?: DataModelConstructionContext
): DataModel<object, DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided overrides.

**Parameters**

- **data**?: `object` = `{}`  
  Additional data which overrides current document data at the time of creation

- **context**?: `DataModelConstructionContext` = `{}`  
  Context options passed to the data model constructor

**Returns**  
`DataModel<object, DataModelConstructionContext>` The cloned instance

_Inherited from [BasePackage.clone](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#clone)_

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

Returns `void`

_Inherited from [BasePackage.reset](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#reset)_

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

Returns `object` The document source data expressed as a plain object

_Inherited from [BasePackage.toJSON](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#tojson)_

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**?: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**  
`object` The extracted primitive object

_Inherited from [BasePackage.toObject](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#toobject)_

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

- **changes**?: `object` = `{}`  
  New values which should be applied to the data model

- **options**?: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns**  
`object` An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

_Inherited from [BasePackage.updateSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#updatesource)_

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**?: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns**  
`boolean` Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

_Inherited from [BasePackage.validate](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validate)_

---

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options**?: `object` = `{}`  
  Additional options modifying the configuration

Returns `void`

_Inherited from [BasePackage._configure](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_configure)_

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options**?: `object` = `{}`  
  Options provided to the model constructor

Returns `void`

_Inherited from [BasePackage._initialize](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initialize)_

---

### _initializeSource

```typescript
protected _initializeSource(
  data: object | DataModel<object, DataModelConstructionContext>,
  options?: object
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options**?: `object` = `{}`  
  Options provided to the model constructor

**Returns**  
`object` Migrated and cleaned source data which will be stored to the model instance, which is the same object as the data argument

_Inherited from [BasePackage._initializeSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initializesource)_

---

## Static Methods

### cleanData

```typescript
static cleanData(source?: {}, __namedParameters?: {}): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `{}` = `{}`  
  The source data object

- **__namedParameters**: `{}` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns**  
`object` The cleaned source data, which is the same object as the source argument

_Inherited from [BasePackage.cleanData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#cleandata)_

---

### defineSchema

```typescript
static defineSchema(): {
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
} & {
    background: StringField;
    documentTypes: AdditionalTypesField;
    grid: SchemaField;
    initiative: StringField;
    primaryTokenAttribute: StringField;
    secondaryTokenAttribute: StringField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

Overrides [BasePackage.defineSchema](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#defineschema)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns**  
`DataModel<object, DataModelConstructionContext>` A constructed data model instance

_Inherited from [BasePackage.fromJSON](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromjson)_

---

### fromRemoteManifest

```typescript
static fromRemoteManifest(
  manifestUrl: string,
  options?: { strict?: boolean }
): Promise<ServerPackage>
```

Retrieve the latest Package manifest from a provided remote location.

**Parameters**

- **manifestUrl**: `string`  
  A remote manifest URL to load

- **options**?:  
  - **strict**?: `boolean`  
    Whether to construct the remote package strictly

**Returns**  
`Promise<ServerPackage>` A Promise which resolves to a constructed ServerPackage instance

**Throws**  
An error if the retrieved manifest data is invalid

_Inherited from [BasePackage.fromRemoteManifest](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromremotemanifest)_

---

### fromSource

```typescript
static fromSource(
  source: object,
  context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.

- **context**?:  
  Model construction context

**Returns**  
`DataModel<object, DataModelConstructionContext>`

_Inherited from [BasePackage.fromSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromsource)_

---

### isIncompatibleWithCoreVersion

```typescript
static isIncompatibleWithCoreVersion(availability: number): boolean
```

Test if a given availability is incompatible with the core version.

**Parameters**

- **availability**: `number`  
  The availability value to test.

**Returns**  
`boolean`

_Inherited from [BasePackage.isIncompatibleWithCoreVersion](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#isincompatiblewithcoreversion)_

---

### migrateData

```typescript
static migrateData(data: any, options: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **data**: `any`  
  The candidate source data from which the model will be constructed

- **options**: `any`

**Returns**  
`object` Migrated source data, which is the same object as the source argument

Overrides [BasePackage.migrateData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
`object` Migrated source data, which is the same object as the source argument

_Inherited from [BasePackage.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#migratedatasafe)_

---

### shimData

```typescript
static shimData(data: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `any`  
  Data which matches the current schema

- **options**: `any`  
  Additional shimming options

**Returns**  
`object` Data with added backwards-compatible properties, which is the same object as the data argument

Overrides [BasePackage.shimData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#shimdata)

---

### testAvailability

```typescript
static testAvailability(
  data: Partial<PackageManifestData>,
  options?: { release?: any }
): number
```

Check the given compatibility data against the current installation state and determine its availability.

**Parameters**

- **data**: `Partial<PackageManifestData>`  
  The compatibility data to test.

- **options**?:  
  - **release**?: `any`  
    A specific software release for which to test availability. Tests against the current release by default.

**Returns**  
`number`

_Inherited from [BasePackage.testAvailability](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#testavailability)_

---

### testDependencyCompatibility

```typescript
static testDependencyCompatibility(
  compatibility: PackageCompatibility,
  dependency: BasePackage
): boolean
```

Determine if a dependency is within the given compatibility range.

**Parameters**

- **compatibility**: `PackageCompatibility`  
  The compatibility range declared for the dependency, if any

- **dependency**: `BasePackage`  
  The known dependency package

**Returns**  
`boolean` Is the dependency compatible with the required range?

_Inherited from [BasePackage.testDependencyCompatibility](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#testdependencycompatibility)_

---

### validateId

```typescript
static validateId(id: string): void
```

Validate that a Package ID is allowed.

**Parameters**

- **id**: `string`  
  The candidate ID

**Returns**  
`void`

**Throws**  
An error if the candidate ID is invalid

_Inherited from [BasePackage.validateId](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validateid)_

---

### validateJoint

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
An error if a validation failure is detected

_Inherited from [BasePackage.validateJoint](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validatejoint)_

---

### validateVersion

```typescript
static validateVersion(version: string): void
```

Validate that a version is allowed.

**Parameters**

- **version**: `string`  
  The candidate version

**Returns**  
`void`

**Throws**  
An error if the version is invalid

_Inherited from [BasePackage.validateVersion](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validateversion)_

---

### _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns**  
`Generator<[string, DataField], any, any>`

_Inherited from [BasePackage._initializationOrder](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initializationorder)_