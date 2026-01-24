# Class System

Mixes: ClientPackageMixin

Hierarchy: [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.packages.System)

```
BaseSystem<this>
System
```

---

## Properties

### _source

**_source**: *object*  
The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
Inherited from [BaseSystem#_source](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#_source)

---

### availability

**availability**: *number*  
An availability code in `PACKAGE_AVAILABILITY_CODES` which defines whether this package can be used.  
Inherited from [BaseSystem#availability](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#availability)

---

### exclusive

**exclusive**: *boolean*  
A flag which tracks whether this package is a free Exclusive pack.  
Inherited from [BaseSystem#exclusive](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#exclusive)

---

### hasStorage

**hasStorage**: *boolean*  
A flag which tracks if this package has files stored in the persistent storage folder.  
Inherited from [BaseSystem#hasStorage](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#hasstorage)

---

### locked

**locked**: *boolean*  
A flag which tracks whether this package is currently locked.  
Inherited from [BaseSystem#locked](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#locked)

---

### owned

**owned**: *null* | *boolean*  
A flag which tracks whether this package is owned, if it is protected.  
Inherited from [BaseSystem#owned](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#owned)

---

### parent

**parent**: *null* | [DataModel\<object, DataModelConstructionContext>](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)  
An immutable reverse-reference to a parent DataModel to which this model belongs.  
Inherited from [BaseSystem#parent](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#parent)

---

### strictDataCleaning

**strictDataCleaning**: *boolean* = false  
Does the system template request strict type checking of data compared to `template.json` inferred types.  
Inherited from [BaseSystem#strictDataCleaning](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#strictdatacleaning)

---

### tags

**tags**: *string[]*  
A set of Tags that indicate what kind of Package this is, provided by the Website.  
Inherited from [BaseSystem#tags](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#tags)

---

### Static icon

**icon**: *string* = `"fa-dice"`  
The default icon used for this type of Package.  
Inherited from [BaseSystem.icon](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#icon)

---

### Static LOCALIZATION_PREFIXES

**LOCALIZATION_PREFIXES**: *string[]*  
Inherited from [BaseSystem.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#localization_prefixes)

---

### Static type

**type**: *string* = `"system"`  
Define the package type in `CONST.PACKAGE_TYPES` that this class represents. Each BasePackage subclass must define this attribute.  
Inherited from [BaseSystem.type](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#type)

---

## Accessors

### incompatibleWithCoreVersion

```typescript
get incompatibleWithCoreVersion(): boolean
```

Is this Package incompatible with the currently installed core Foundry VTT software version?  
Returns: *boolean*  
Inherited from ClientPackageMixin(BaseSystem).incompatibleWithCoreVersion

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
Returns: *boolean*  
Inherited from ClientPackageMixin(BaseSystem).invalid

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.  
Returns: [SchemaField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)  
Inherited from ClientPackageMixin(BaseSystem).schema

---

### type

```typescript
get type(): string
```

The type of this package instance. A value in `CONST.PACKAGE_TYPES`.  
Returns: *string*  
Inherited from ClientPackageMixin(BaseSystem).type

---

### unavailable

```typescript
get unavailable(): boolean
```

A flag which defines whether this package is unavailable to be used.  
Returns: *boolean*  
Inherited from ClientPackageMixin(BaseSystem).unavailable

---

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.  
Inherited from ClientPackageMixin(BaseSystem).validationFailures

---

### Static collection

```typescript
get collection(): string
```

The named collection to which this package type belongs.  
Returns: *string*

---

### Static schema

```typescript
get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.  
Returns: [SchemaField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)  

---

## Methods

### _configure

```typescript
_configure(options: any): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters:**

- **options**: *any*  
  Additional options modifying the configuration

Returns: *void*  
Overrides [BaseSystem._configure](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#_configure)

---

### clone

```typescript
clone(
    data?: object,
    context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided overrides.

**Parameters:**

- **Optional**  
  **data**: *object* = {}  
  Additional data which overrides current document data at the time of creation

- **Optional**  
  **context**: *DataModelConstructionContext* = {}  
  Context options passed to the data model constructor

Returns: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, DataModelConstructionContext>  
The cloned instance  
Inherited from [BaseSystem.clone](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#clone)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.  
Returns: *void*  
Inherited from [BaseSystem.reset](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#reset)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.  
Returns: *object*  
Inherited from [BaseSystem.toJSON](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters:**

- **Optional**  
  **source**: *boolean* = true  
  Draw values from the underlying data source rather than transformed values

Returns: *object*  
The extracted primitive object  
Inherited from [BaseSystem.toObject](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#toobject)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters:**

- **changes**: *object* = {}  
  New values which should be applied to the data model

- **options**: *DataModelUpdateOptions* = {}  
  Options which determine how the new data is merged

Returns: *object*  
An object containing differential keys and values that were changed

Throws:  
An error if the requested data model changes were invalid  
Inherited from [BaseSystem.updateSource](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters:**

- **options**: *DataModelValidationOptions* = {}  
  Options which modify how the model is validated

Returns: *boolean*  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

Throws:  
An error thrown if validation is strict and a failure occurs.  
Inherited from [BaseSystem.validate](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#validate)

---

### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters:**

- **Optional**  
  **options**: *object* = {}  
  Options provided to the model constructor

Returns: *void*  
Inherited from [BaseSystem._initialize](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#_initialize)

---

### _initializeSource

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters:**

- **data**: *object* | [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, DataModelConstructionContext>  
  The candidate source data from which the model will be constructed

- **Optional**  
  **options**: *object* = {}  
  Options provided to the model constructor

Returns: *object*  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument  
Inherited from [BaseSystem._initializeSource](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#_initializesource)

---

### Static cleanData

```typescript
static cleanData(source: {} = {}, __namedParameters: {} = {}): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters:**

- **source**: {} = {}  
  The source data object

- **__namedParameters**: {} = {}  
  Additional options which are passed to field cleaning methods

Returns: *object*  
The cleaned source data, which is the same object as the `source` argument  
Inherited from [BaseSystem.cleanData](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#cleandata)

---

### Static defineSchema

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

Returns: Object describing schema fields  
Inherited from [BaseSystem.defineSchema](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#defineschema)

---

### Static fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters:**

- **json**: *string*  
  Serialized document data in string format

Returns: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, DataModelConstructionContext>  
A constructed data model instance  
Inherited from [BaseSystem.fromJSON](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#fromjson)

---

### Static fromRemoteManifest

```typescript
static fromRemoteManifest(
    manifestUrl: string,
    options?: { strict?: boolean },
): Promise<ServerPackage>
```

Retrieve the latest Package manifest from a provided remote location.

**Parameters:**

- **manifestUrl**: *string*  
  A remote manifest URL to load

- **options**: { strict?: *boolean* } = {}  
  Additional options which affect package construction

  - **Optional**  
    **strict**?: *boolean*  
    Whether to construct the remote package strictly

Returns: *Promise*<[ServerPackage](https://foundryvtt.com/api/classes/foundry.packages.ServerPackage.html)>  
A Promise which resolves to a constructed ServerPackage instance

Throws:  
An error if the retrieved manifest data is invalid  
Inherited from [BaseSystem.fromRemoteManifest](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#fromremotemanifest)

---

### Static fromSource

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters:**

- **source**: *object*  
  Initial document data which comes from a trusted source.

- **Optional**  
  **context**: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}  
  Model construction context

Returns: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, DataModelConstructionContext>  
Inherited from [BaseSystem.fromSource](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#fromsource)

---

### Static isIncompatibleWithCoreVersion

```typescript
static isIncompatibleWithCoreVersion(availability: number): boolean
```

Test if a given availability is incompatible with the core version.

**Parameters:**

- **availability**: *number*  
  The availability value to test.

Returns: *boolean*  
Inherited from [BaseSystem.isIncompatibleWithCoreVersion](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#isincompatiblewithcoreversion)

---

### Static migrateData

```typescript
static migrateData(data: any, options: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters:**

- **data**: *any*  
  The candidate source data from which the model will be constructed

- **options**: *any*

Returns: *object*  
Migrated source data, which is the same object as the `source` argument  
Inherited from [BaseSystem.migrateData](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#migratedata)

---

### Static migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters:**

- **source**: *object*  
  The candidate source data from which the model will be constructed

Returns: *object*  
Migrated source data, which is the same object as the `source` argument  
Inherited from [BaseSystem.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#migratedatasafe)

---

### Static shimData

```typescript
static shimData(data: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters:**

- **data**: *any*  
  Data which matches the current schema

- **options**: *any*  
  Additional shimming options

Returns: *object*  
Data with added backwards-compatible properties, which is the same object as the `data` argument  
Inherited from [BaseSystem.shimData](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#shimdata)

---

### Static testAvailability

```typescript
static testAvailability(
    data: Partial<PackageManifestData>,
    options?: { release?: any },
): number
```

Check the given compatibility data against the current installation state and determine its availability.

**Parameters:**

- **data**: *Partial<PackageManifestData>*  
  The compatibility data to test.

- **Optional**  
  **options**: { release?: any } = {}  

  - **Optional**  
    **release**?: *any*  
    A specific software release for which to test availability. Tests against the current release by default.

Returns: *number*  
Inherited from [BaseSystem.testAvailability](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#testavailability)

---

### Static testDependencyCompatibility

```typescript
static testDependencyCompatibility(
    compatibility: PackageCompatibility,
    dependency: BasePackage,
): boolean
```

Determine if a dependency is within the given compatibility range.

**Parameters:**

- **compatibility**: [PackageCompatibility](https://foundryvtt.com/api/classes/foundry.packages.PackageCompatibility.html)  
  The compatibility range declared for the dependency, if any

- **dependency**: [BasePackage](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html)  
  The known dependency package

Returns: *boolean*  
Is the dependency compatible with the required range?  
Inherited from [BaseSystem.testDependencyCompatibility](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#testdependencycompatibility)

---

### Static validateId

```typescript
static validateId(id: string): void
```

Validate that a Package ID is allowed.

**Parameters:**

- **id**: *string*  
  The candidate ID

Returns: *void*

Throws:  
An error if the candidate ID is invalid  
Inherited from [BaseSystem.validateId](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#validateid)

---

### Static validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters:**

- **data**: *object*  
  Candidate data for the model

Returns: *void*

Throws:  
An error if a validation failure is detected  
Inherited from [BaseSystem.validateJoint](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#validatejoint)

---

### Static validateVersion

```typescript
static validateVersion(version: string): void
```

Validate that a version is allowed.

**Parameters:**

- **version**: *string*  
  The candidate version

Returns: *void*

Throws:  
An error if the version is invalid  
Inherited from [BaseSystem.validateVersion](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#validateversion)

---

### Static Protected _initializationOrder

```typescript
static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

Returns: *Generator*<[string, DataField], any, any>  
Inherited from [BaseSystem._initializationOrder](https://foundryvtt.com/api/classes/foundry.packages.BaseSystem.html#_initializationorder)