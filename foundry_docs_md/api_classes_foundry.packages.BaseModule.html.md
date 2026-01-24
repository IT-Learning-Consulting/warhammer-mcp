# BaseModule

The data schema used to define Module manifest files. Extends the basic PackageData schema with some additional module-specific fields.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.packages.BaseModule)  

- _BasePackage_  
- **BaseModule**  
- _Module_

---

## Constructors

### constructor

```typescript
new BaseModule(data: PackageManifestData, options?: object): BaseModule
```

**Parameters**:

- **data**: [`PackageManifestData`](https://foundryvtt.com/api/interfaces/foundry.packages.types.PackageManifestData.html)  
  Source data for the package

- **options**: `object` = {}  
  Options which affect DataModel construction

**Returns**:  
`BaseModule`  
Inherited from [BasePackage.constructor](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#constructor)

---

## Properties

### _source

- Type: `object`  
  The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
  Inherited from [BasePackage._source](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_source)

### availability

- Type: `number`  
  An availability code in PACKAGE_AVAILABILITY_CODES which defines whether this package can be used.  
  Inherited from [BasePackage.availability](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#availability)

### exclusive

- Type: `boolean`  
  A flag which tracks whether this package is a free Exclusive pack  
  Inherited from [BasePackage.exclusive](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#exclusive)

### hasStorage

- Type: `boolean`  
  A flag which tracks if this package has files stored in the persistent storage folder  
  Inherited from [BasePackage.hasStorage](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#hasstorage)

### locked

- Type: `boolean`  
  A flag which tracks whether this package is currently locked.  
  Inherited from [BasePackage.locked](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#locked)

### owned

- Type: `null | boolean`  
  A flag which tracks whether this package is owned, if it is protected.  
  Inherited from [BasePackage.owned](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#owned)

### parent

- Type: `null | DataModel<object, DataModelConstructionContext>`  
  An immutable reverse-reference to a parent DataModel to which this model belongs.  
  Inherited from [BasePackage.parent](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#parent)

### tags

- Type: `string[]`  
  A set of Tags that indicate what kind of Package this is, provided by the Website  
  Inherited from [BasePackage.tags](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#tags)

### icon

- Type: `string = "fa-plug"`  
  The default icon used for this type of Package.

### LOCALIZATION_PREFIXES

- Type: `string[]`  
  Inherited from [BasePackage.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#localization_prefixes)

### type

- Type: `string = "module"`  
  Overrides [BasePackage.type](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#type)

---

## Accessors

### incompatibleWithCoreVersion

```typescript
get incompatibleWithCoreVersion(): boolean
```

Is this Package incompatible with the currently installed core Foundry VTT software version?  
Inherited from BasePackage.incompatibleWithCoreVersion

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
Inherited from BasePackage.invalid

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.  
Inherited from BasePackage.schema

---

### type

```typescript
get type(): string
```

The type of this package instance. A value in CONST.PACKAGE_TYPES.  
Inherited from BasePackage.type

---

### unavailable

```typescript
get unavailable(): boolean
```

A flag which defines whether this package is unavailable to be used.  
Inherited from BasePackage.unavailable

---

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.  
Inherited from BasePackage.validationFailures

---

### collection (Static)

```typescript
get collection(): string
```

The named collection to which this package type belongs  
Inherited from BasePackage.collection

---

### schema (Static)

```typescript
get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.  
Overrides [BasePackage.schema](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#schema)

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

**Parameters**:

- **data**: `object = {}`  
  Additional data which overrides current document data at the time of creation

- **context**: `DataModelConstructionContext = {}`  
  Context options passed to the data model constructor

**Returns**:  
`DataModel<object, DataModelConstructionContext>`  
Inherited from [BasePackage.clone](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#clone)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**:  
`void`  
Inherited from [BasePackage.reset](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#reset)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**:  
`object` The document source data expressed as a plain object  
Inherited from [BasePackage.toJSON](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**:

- **source**: `boolean = true`  
  Draw values from the underlying data source rather than transformed values

**Returns**:  
`object` The extracted primitive object  
Inherited from [BasePackage.toObject](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#toobject)

---

### updateSource

```typescript
updateSource(
    changes?: object,
    options?: DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**:

- **changes**: `object = {}`  
  New values which should be applied to the data model

- **options**: [`DataModelUpdateOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelUpdateOptions.html) = {}  
  Options which determine how the new data is merged

**Returns**:  
`object` An object containing differential keys and values that were changed

**Throws**:  
An error if the requested data model changes were invalid  
Inherited from [BasePackage.updateSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**:

- **options**: [`DataModelValidationOptions`](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DataModelValidationOptions.html) = {}  
  Options which modify how the model is validated

**Returns**:  
`boolean` Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**:  
An error thrown if validation is strict and a failure occurs.  
Inherited from [BasePackage.validate](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validate)

---

## Protected Methods

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**:

- **options**: `object = {}`  
  Additional options modifying the configuration

**Returns**:  
`void`  
Inherited from [BasePackage._configure](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_configure)

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**:

- **options**: `object = {}`  
  Options provided to the model constructor

**Returns**:  
`void`  
Inherited from [BasePackage._initialize](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initialize)

---

### _initializeSource

```typescript
protected _initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**:

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options**: `object = {}`  
  Options provided to the model constructor

**Returns**:  
`object` Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument  
Inherited from [BasePackage._initializeSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initializesource)

---

## Static Methods

### cleanData

```typescript
static cleanData(source?: {}, __namedParameters?: {}): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**:

- **source**: `{}` = {}  
  The source data object

- **__namedParameters**: `{}` = {}  
  Additional options which are passed to field cleaning methods

**Returns**:  
`object` The cleaned source data, which is the same object as the `source` argument  
Inherited from [BasePackage.cleanData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#cleandata)

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
    coreTranslation: BooleanField;
    documentTypes: AdditionalTypesField;
    library: BooleanField;
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

**Parameters**:

- **json**: `string` Serialized document data in string format

**Returns**:  
`DataModel<object, DataModelConstructionContext>` A constructed data model instance  
Inherited from [BasePackage.fromJSON](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromjson)

---

### fromRemoteManifest

```typescript
static fromRemoteManifest(
    manifestUrl: string,
    options?: { strict?: boolean },
): Promise<ServerPackage>
```

Retrieve the latest Package manifest from a provided remote location.

**Parameters**:

- **manifestUrl**: `string`  
  A remote manifest URL to load

- **options**: `{ strict?: boolean } = {}`  
  Additional options which affect package construction  
  Optional:
  - **strict**?: `boolean`  
    Whether to construct the remote package strictly

**Returns**:  
`Promise<ServerPackage>` A Promise which resolves to a constructed ServerPackage instance

**Throws**:  
An error if the retrieved manifest data is invalid  
Inherited from [BasePackage.fromRemoteManifest](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromremotemanifest)

---

### fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**:

- **source**: `object` Initial document data which comes from a trusted source.

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}`  
  Model construction context

**Returns**:  
`DataModel<object, DataModelConstructionContext>`  
Inherited from [BasePackage.fromSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromsource)

---

### isIncompatibleWithCoreVersion

```typescript
static isIncompatibleWithCoreVersion(availability: number): boolean
```

Test if a given availability is incompatible with the core version.

**Parameters**:

- **availability**: `number` The availability value to test.

**Returns**:  
`boolean`  
Inherited from [BasePackage.isIncompatibleWithCoreVersion](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#isincompatiblewithcoreversion)

---

### migrateData

```typescript
static migrateData(data: any, __namedParameters?: {}): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**:

- **data**: `any` The candidate source data from which the model will be constructed

- **__namedParameters**: `{}` = {}

**Returns**:  
`object` Migrated source data, which is the same object as the `source` argument  
Inherited from [BasePackage.migrateData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely

**Parameters**:

- **source**: `object` The candidate source data from which the model will be constructed

**Returns**:  
`object` Migrated source data, which is the same object as the `source` argument  
Inherited from [BasePackage.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#migratedatasafe)

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**:

- **data**: `object` Data which matches the current schema

- **options**: `{ embedded?: boolean } = {}` Additional shimming options  
  Optional:
  - **embedded**?: `boolean` Apply shims to embedded models?

**Returns**:  
`object` Data with added backwards-compatible properties, which is the same object as the `data` argument  
Inherited from [BasePackage.shimData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#shimdata)

---

### testAvailability

```typescript
static testAvailability(
    data: Partial<PackageManifestData>,
    options?: { release?: any },
): number
```

Check the given compatibility data against the current installation state and determine its availability.

**Parameters**:

- **data**: `Partial<PackageManifestData>` The compatibility data to test.

- **options**: `{ release?: any } = {}` Additional options  
  Optional:
  - **release**?: `any` A specific software release for which to test availability. Tests against the current release by default.

**Returns**:  
`number`  
Inherited from [BasePackage.testAvailability](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#testavailability)

---

### testDependencyCompatibility

```typescript
static testDependencyCompatibility(
    compatibility: PackageCompatibility,
    dependency: BasePackage,
): boolean
```

Determine if a dependency is within the given compatibility range.

**Parameters**:

- **compatibility**: [`PackageCompatibility`](https://foundryvtt.com/api/classes/foundry.packages.PackageCompatibility.html)  
  The compatibility range declared for the dependency, if any

- **dependency**: [`BasePackage`](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html)  
  The known dependency package

**Returns**:  
`boolean` Is the dependency compatible with the required range?  
Inherited from [BasePackage.testDependencyCompatibility](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#testdependencycompatibility)

---

### validateId

```typescript
static validateId(id: string): void
```

Validate that a Package ID is allowed.

**Parameters**:

- **id**: `string` The candidate ID

**Returns**:  
`void`

**Throws**:  
An error if the candidate ID is invalid  
Inherited from [BasePackage.validateId](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validateid)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**:

- **data**: `object` Candidate data for the model

**Returns**:  
`void`

**Throws**:  
An error if a validation failure is detected  
Inherited from [BasePackage.validateJoint](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validatejoint)

---

### validateVersion

```typescript
static validateVersion(version: string): void
```

Validate that a version is allowed.

**Parameters**:

- **version**: `string` The candidate version

**Returns**:  
`void`

**Throws**:  
An error if the version is invalid  
Inherited from [BasePackage.validateVersion](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validateversion)

---

## Protected Static Methods

### _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns**:  
`Generator<[string, DataField], any, any>`  
Inherited from [BasePackage._initializationOrder](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initializationorder)

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html).