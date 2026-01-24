# Class World

Mixes: `ClientPackageMixin`

Hierarchy: [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.packages.World)  
Base classes: `BaseWorld<this>` → **World**

---

## Constructors

### constructor

```typescript
new World(data: PackageManifestData, options?: object): World
```

**Parameters**

- **data**: `PackageManifestData`  
  Source data for the package

- **options**: `object` = `{}`  
  Options which affect DataModel construction

**Returns:** `World`  
Inherited from [BaseWorld.constructor](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#constructor)

---

## Properties

### _source

```typescript
_source: object
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
Inherited from [BaseWorld._source](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#_source)

---

### availability

```typescript
availability: number
```

An availability code in `PACKAGE_AVAILABILITY_CODES` which defines whether this package can be used.  
Inherited from [BaseWorld.availability](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#availability)

---

### exclusive

```typescript
exclusive: boolean
```

A flag which tracks whether this package is a free Exclusive pack  
Inherited from [BaseWorld.exclusive](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#exclusive)

---

### hasStorage

```typescript
hasStorage: boolean
```

A flag which tracks if this package has files stored in the persistent storage folder  
Inherited from [BaseWorld.hasStorage](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#hasstorage)

---

### locked

```typescript
locked: boolean
```

A flag which tracks whether this package is currently locked.  
Inherited from [BaseWorld.locked](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#locked)

---

### owned

```typescript
owned: null | boolean
```

A flag which tracks whether this package is owned, if it is protected.  
Inherited from [BaseWorld.owned](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#owned)

---

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.  
Inherited from [BaseWorld.parent](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#parent)

---

### tags

```typescript
tags: string[]
```

A set of Tags that indicate what kind of Package this is, provided by the Website  
Inherited from [BaseWorld.tags](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#tags)

---

## Static Properties

### icon

```typescript
icon: string = "fa-globe-asia"
```

The default icon used for this type of Package.  
Inherited from [BaseWorld.icon](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#icon)

---

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

Inherited from [BaseWorld.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#localization_prefixes)

---

### type

```typescript
type: string = "world"
```

Inherited from [BaseWorld.type](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#type)

---

## Accessors

### incompatibleWithCoreVersion

```typescript
get incompatibleWithCoreVersion(): boolean
```

Is this Package incompatible with the currently installed core Foundry VTT software version?  
**Returns:** `boolean`  
Inherited from `ClientPackageMixin(BaseWorld).incompatibleWithCoreVersion`

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
**Returns:** `boolean`  
Inherited from `ClientPackageMixin(BaseWorld).invalid`

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.  
**Returns:** `SchemaField`  
Inherited from `ClientPackageMixin(BaseWorld).schema`

---

### type

```typescript
get type(): string
```

The type of this package instance. A value in `CONST.PACKAGE_TYPES`.  
**Returns:** `string`  
Inherited from `ClientPackageMixin(BaseWorld).type`

---

### unavailable

```typescript
get unavailable(): boolean
```

A flag which defines whether this package is unavailable to be used.  
**Returns:** `boolean`  
Inherited from `ClientPackageMixin(BaseWorld).unavailable`

---

### validationFailures

```typescript
get validationFailures(): {
  fields: null | DataModelValidationFailure;
  joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.  
**Returns:**  
```typescript
{
  fields: null | DataModelValidationFailure;
  joint: null | DataModelValidationFailure;
}
```
Inherited from `ClientPackageMixin(BaseWorld).validationFailures`

---

## Static Accessors

### collection

```typescript
static get collection(): string
```

The named collection to which this package type belongs  
**Returns:** `string`

---

### schema

```typescript
static get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.  
**Returns:** `SchemaField`

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

- **data**: `object` = `{}` (Optional)  
  Additional data which overrides current document data at the time of creation.

- **context**: `DataModelConstructionContext` = `{}` (Optional)  
  Context options passed to the data model constructor.

**Returns:**  
`DataModel<object, DataModelConstructionContext>`  
The cloned instance  
Inherited from [BaseWorld.clone](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#clone)

---

### getSystemBadge

```typescript
getSystemBadge(system?: any): any
```

Provide data for a system badge displayed for the world which reflects the system ID and its availability.

**Parameters**

- **system**: `any` (Optional)  
  A specific system to use, otherwise use the installed system.

**Returns:** `any`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns:** `void`  
Inherited from [BaseWorld.reset](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#reset)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns:** `object`  
The document source data expressed as a plain object  
Inherited from [BaseWorld.toJSON](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true` (Optional)  
  Draw values from the underlying data source rather than transformed values

**Returns:** `object`  
The extracted primitive object  
Inherited from [BaseWorld.toObject](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#toobject)

---

### updateSource

```typescript
updateSource(
  changes?: object,
  options?: DataModelUpdateOptions,
): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = `{}` (Optional)  
  New values which should be applied to the data model

- **options**: `DataModelUpdateOptions` = `{}` (Optional)  
  Options which determine how the new data is merged

**Returns:** `object`  
An object containing differential keys and values that were changed  

**Throws:**  
An error if the requested data model changes were invalid  
Inherited from [BaseWorld.updateSource](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = `{}` (Optional)  
  Options which modify how the model is validated

**Returns:** `boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws:**  
An error thrown if validation is strict and a failure occurs.  
Inherited from [BaseWorld.validate](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#validate)

---

## Protected Methods

### _configure

```typescript
protected _configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are performed.

**Parameters**

- **options**: `object` = `{}` (Optional)  
  Additional options modifying the configuration

**Returns:** `void`  
Inherited from [BaseWorld._configure](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#_configure)

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options**: `object` = `{}` (Optional)  
  Options provided to the model constructor

**Returns:** `void`  
Inherited from [BaseWorld._initialize](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#_initialize)

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

- **data**: `object` | `DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options**: `object` = `{}` (Optional)  
  Options provided to the model constructor

**Returns:** `object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument  
Inherited from [BaseWorld._initializeSource](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#_initializesource)

---

## Static Methods

### _formatBadDependenciesTooltip

```typescript
static _formatBadDependenciesTooltip(
  availability: any,
  data: any,
  deps: any,
): any
```

**Parameters**

- **availability**: `any`  
- **data**: `any`  
- **deps**: `any`  

**Returns:** `any`  
Inherited

---

### cleanData

```typescript
static cleanData(
  source?: {},
  __namedParameters?: {}
): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `{}` = `{}`  
  The source data object

- **__namedParameters**: `{}` = `{}` (Optional)  
  Additional options which are passed to field cleaning methods

**Returns:** `object`  
The cleaned source data, which is the same object as the `source` argument  
Inherited from [BaseWorld.cleanData](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#cleandata)

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
  background: FilePathField;
  coreVersion: StringField;
  demo: SchemaField;
  description: HTMLField;
  joinTheme: StringField;
  lastPlayed: StringField;
  nextSession: StringField;
  playtime: NumberField;
  resetKeys: BooleanField;
  safeMode: BooleanField;
  system: StringField;
  systemVersion: StringField;
  version: StringField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns:** Object with detailed schema fields  
Inherited from [BaseWorld.defineSchema](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#defineschema)

---

### fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns:** `DataModel<object, DataModelConstructionContext>`  
A constructed data model instance  
Inherited from [BaseWorld.fromJSON](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#fromjson)

---

### fromRemoteManifest

```typescript
static fromRemoteManifest(
  manifestUrl: string,
  options?: { strict?: boolean },
): Promise<ServerPackage>
```

Retrieve the latest Package manifest from a provided remote location.

**Parameters**

- **manifestUrl**: `string`  
  A remote manifest URL to load

- **options**: `{ strict?: boolean } = {}` (Optional)  
  Additional options which affect package construction

  - **strict**?: `boolean`  
    Whether to construct the remote package strictly

**Returns:** `Promise<ServerPackage>`  
A Promise which resolves to a constructed ServerPackage instance

**Throws:**  
An error if the retrieved manifest data is invalid  
Inherited from [BaseWorld.fromRemoteManifest](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#fromremotemanifest)

---

### fromSource

```typescript
static fromSource(
  source: object,
  context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- **source**: `object`  
  Initial document data which comes from a trusted source.

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}` (Optional)  
  Model construction context

**Returns:** `DataModel<object, DataModelConstructionContext>`  
Inherited from [BaseWorld.fromSource](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#fromsource)

---

### getVersionBadge

```typescript
static getVersionBadge(
  availability: any,
  data: any,
  __namedParameters?: {}
): any
```

**Parameters**

- **availability**: `any`  
- **data**: `any`  
- **__namedParameters**: `{}` = `{}`

**Returns:** `any`  
Inherited

---

### isIncompatibleWithCoreVersion

```typescript
static isIncompatibleWithCoreVersion(availability: number): boolean
```

Test if a given availability is incompatible with the core version.

**Parameters**

- **availability**: `number`  
  The availability value to test.

**Returns:** `boolean`  
Inherited from [BaseWorld.isIncompatibleWithCoreVersion](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#isincompatiblewithcoreversion)

---

### migrateData

```typescript
static migrateData(data: any): any
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **data**: `any`  
  The candidate source data from which the model will be constructed

**Returns:** `any`  
Migrated source data, which is the same object as the `source` argument  
Inherited from [BaseWorld.migrateData](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#migratedata)

---

### migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns:** `object`  
Migrated source data, which is the same object as the `source` argument  
Inherited from [BaseWorld.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#migratedatasafe)

---

### shimData

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

- **options**: `{ embedded?: boolean } = {}` (Optional)  
  Additional shimming options

  - **embedded**?: `boolean`  
    Apply shims to embedded models?

**Returns:** `object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument  
Inherited from [BaseWorld.shimData](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#shimdata)

---

### testAvailability

```typescript
static testAvailability(
  data: Partial<PackageManifestData>,
  options?: {
    modules?: any;
    release?: any;
    systemAvailabilityThreshold?: number;
    systems?: any;
  }
): number
```

Check the given compatibility data against the current installation state and determine its availability.

**Parameters**

- **data**: `Partial<PackageManifestData>`  
  The compatibility data to test.

- **options**: object = `{}` (Optional)  
  Optional parameters:

  - **modules**?: `any`  
    A specific collection of modules to test availability against. Tests against the currently installed modules by default.

  - **release**?: `any`  
    A specific software release for which to test availability. Tests against the current release by default.

  - **systemAvailabilityThreshold**?: `number`  
    Ignore the world's own core software compatibility and instead defer entirely to the system's core software compatibility, if the world's availability is less than this.

  - **systems**?: `any`  
    A specific collection of systems to test availability against. Tests against the currently installed systems by default.

**Returns:** `number`  
Inherited from [BaseWorld.testAvailability](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#testavailability)

---

### testDependencyCompatibility

```typescript
static testDependencyCompatibility(
  compatibility: PackageCompatibility,
  dependency: BasePackage,
): boolean
```

Determine if a dependency is within the given compatibility range.

**Parameters**

- **compatibility**: `PackageCompatibility`  
  The compatibility range declared for the dependency, if any

- **dependency**: `BasePackage`  
  The known dependency package

**Returns:** `boolean`  
Is the dependency compatible with the required range?  
Inherited from [BaseWorld.testDependencyCompatibility](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#testdependencycompatibility)

---

### validateId

```typescript
static validateId(id: string): void
```

Validate that a Package ID is allowed.

**Parameters**

- **id**: `string`  
  The candidate ID

**Returns:** `void`

**Throws:**  
An error if the candidate ID is invalid  
Inherited from [BaseWorld.validateId](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#validateid)

---

### validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns:** `void`

**Throws:**  
An error if a validation failure is detected  
Inherited from [BaseWorld.validateJoint](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#validatejoint)

---

### validateVersion

```typescript
static validateVersion(version: string): void
```

Validate that a version is allowed.

**Parameters**

- **version**: `string`  
  The candidate version

**Returns:** `void`

**Throws:**  
An error if the version is invalid  
Inherited from [BaseWorld.validateVersion](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#validateversion)

---

## Protected Static Methods

### _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization order.

**Returns:** `Generator<[string, DataField], any, any>`  
Inherited from [BaseWorld._initializationOrder](https://foundryvtt.com/api/classes/foundry.packages.BaseWorld.html#_initializationorder)