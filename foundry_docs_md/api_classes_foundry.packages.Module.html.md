# Class Module

Mixes: ClientPackageMixin

Hierarchy: [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.packages.Module)

- BaseModule<this>
- **Module**

---

## Properties

### _source

- Type: `object`  
- Description: The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
- Inherited from [BaseModule._source](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#_source)

### active

- Type: `boolean`  
- Description: Is this package currently active?  
- Inherited from [BaseModule.active](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#active)

### availability

- Type: `number`  
- Description: An availability code in PACKAGE_AVAILABILITY_CODES which defines whether this package can be used.  
- Inherited from [BaseModule.availability](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#availability)

### exclusive

- Type: `boolean`  
- Description: A flag which tracks whether this package is a free Exclusive pack  
- Inherited from [BaseModule.exclusive](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#exclusive)

### hasStorage

- Type: `boolean`  
- Description: A flag which tracks if this package has files stored in the persistent storage folder  
- Inherited from [BaseModule.hasStorage](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#hasstorage)

### locked

- Type: `boolean`  
- Description: A flag which tracks whether this package is currently locked.  
- Inherited from [BaseModule.locked](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#locked)

### owned

- Type: `null | boolean`  
- Description: A flag which tracks whether this package is owned, if it is protected.  
- Inherited from [BaseModule.owned](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#owned)

### parent

- Type: `null | DataModel<object, DataModelConstructionContext>`  
- Description: An immutable reverse-reference to a parent DataModel to which this model belongs.  
- Inherited from [BaseModule.parent](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#parent)

### tags

- Type: `string[]`  
- Description: A set of Tags that indicate what kind of Package this is, provided by the Website  
- Inherited from [BaseModule.tags](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#tags)

### Static icon

- Type: `string = "fa-plug"`  
- Description: The default icon used for this type of Package.  
- Inherited from [BaseModule.icon](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#icon)

### Static LOCALIZATION_PREFIXES

- Type: `string[]` (value not fully shown)  
- Description: Localization prefixes for this module type.  
- Inherited from [BaseModule.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#localization_prefixes)

---

## Accessors

### Static type

- Type: `string = "module"`  
- Inherited from [BaseModule.type](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#type)

### incompatibleWithCoreVersion

```typescript
get incompatibleWithCoreVersion(): boolean
```
- Description: Is this Package incompatible with the currently installed core Foundry VTT software version?  
- Returns: `boolean`  
- Inherited from ClientPackageMixin(BaseModule).incompatibleWithCoreVersion

### invalid

```typescript
get invalid(): boolean
```
- Description: Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
- Returns: `boolean`  
- Inherited from ClientPackageMixin(BaseModule).invalid

### schema

```typescript
get schema(): SchemaField
```
- Description: Define the data schema for this document instance.  
- Returns: `SchemaField`  
- Inherited from ClientPackageMixin(BaseModule).schema

### type

```typescript
get type(): string
```
- Description: The type of this package instance. A value in CONST.PACKAGE_TYPES.  
- Returns: `string`  
- Inherited from ClientPackageMixin(BaseModule).type

### unavailable

```typescript
get unavailable(): boolean
```
- Description: A flag which defines whether this package is unavailable to be used.  
- Returns: `boolean`  
- Inherited from ClientPackageMixin(BaseModule).unavailable

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```
- Description: An array of validation failure instances which may have occurred when this instance was last validated.  
- Returns: An object containing `fields` and `joint` validation failures of type `DataModelValidationFailure` or `null`.  
- Inherited from ClientPackageMixin(BaseModule).validationFailures

### Static collection

```typescript
get collection(): string
```
- Description: The named collection to which this package type belongs.  
- Returns: `string`

---

## Methods

### Static schema

```typescript
get schema(): SchemaField
```
- Description: The Data Schema for all instances of this DataModel.  
- Returns: `SchemaField`

### clone

```typescript
clone(
  data?: object, 
  context?: DataModelConstructionContext
): DataModel<object, DataModelConstructionContext>
```
- Description: Clone a model, creating a new data model by combining current data with provided overrides.  
- Parameters:
  - **data** (optional): `object = {}`  
    Additional data which overrides current document data at the time of creation  
  - **context** (optional): `DataModelConstructionContext = {}`  
    Context options passed to the data model constructor  
- Returns: The cloned instance (`DataModel<object, DataModelConstructionContext>`)  
- Inherited from [BaseModule.clone](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#clone)

### reset

```typescript
reset(): void
```
- Description: Reset the state of this data instance back to mirror the contained source data, erasing any changes.  
- Returns: `void`  
- Inherited from [BaseModule.reset](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#reset)

### toJSON

```typescript
toJSON(): object
```
- Description: Extract the source data for the DataModel into a simple object format that can be serialized.  
- Returns: The document source data expressed as a plain object (`object`)  
- Inherited from [BaseModule.toJSON](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#tojson)

### toObject

```typescript
toObject(source?: boolean): object
```
- Description: Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.  
- Parameters:
  - **source** (optional): `boolean = true`  
    Draw values from the underlying data source rather than transformed values  
- Returns: The extracted primitive object (`object`)  
- Inherited from [BaseModule.toObject](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#toobject)

### updateSource

```typescript
updateSource(
  changes?: object, 
  options?: DataModelUpdateOptions
): object
```
- Description: Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.  
- Parameters:
  - **changes**: `object = {}`  
    New values which should be applied to the data model  
  - **options**: `DataModelUpdateOptions = {}`  
    Options which determine how the new data is merged  
- Returns: An object containing differential keys and values that were changed (`object`)  
- Throws: An error if the requested data model changes were invalid  
- Inherited from [BaseModule.updateSource](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#updatesource)

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```
- Description: Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.  
- Parameters:
  - **options**: `DataModelValidationOptions = {}`  
    Options which modify how the model is validated  
- Returns: Whether the data source or proposed change is reported as valid (`boolean`). A boolean is always returned if validation is non-strict.  
- Throws: An error thrown if validation is strict and a failure occurs.  
- Inherited from [BaseModule.validate](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#validate)

### Protected _configure

```typescript
_protected
_configure(options?: object): void
```
- Description: Configure the data model instance before validation and initialization workflows are performed.  
- Parameters:
  - **options** (optional): `object = {}`  
    Additional options modifying the configuration  
- Returns: `void`  
- Inherited from [BaseModule._configure](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#_configure)

### Protected _initialize

```typescript
_protected
_initialize(options?: object): void
```
- Description: Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.  
- Parameters:
  - **options** (optional): `object = {}`  
    Options provided to the model constructor  
- Returns: `void`  
- Inherited from [BaseModule._initialize](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#_initialize)

### Protected _initializeSource

```typescript
_protected
_initializeSource(
  data: object | DataModel<object, DataModelConstructionContext>, 
  options?: object
): object
```
- Description: Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.  
- Parameters:
  - **data**: `object | DataModel<object, DataModelConstructionContext>`  
    The candidate source data from which the model will be constructed  
  - **options** (optional): `object = {}`  
    Options provided to the model constructor  
- Returns: Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument (`object`)  
- Inherited from [BaseModule._initializeSource](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#_initializesource)

### Static cleanData

```typescript
static cleanData(
  source?: {}, 
  __namedParameters?: {}
): object
```
- Description: Clean a data source object to conform to a specific provided schema.  
- Parameters:
  - **source**: `{}` = {}  
    The source data object  
  - **__namedParameters**: `{}` = {}  
    Additional options which are passed to field cleaning methods  
- Returns: The cleaned source data, which is the same object as the `source` argument (`object`)  
- Inherited from [BaseModule.cleanData](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#cleandata)

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
    coreTranslation: BooleanField;
    documentTypes: AdditionalTypesField;
    library: BooleanField;
}
```
- Description: Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.  
- Returns: Schema object as shown above  
- Inherited from [BaseModule.defineSchema](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#defineschema)

### Static fromJSON

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```
- Description: Create a DataModel instance using a provided serialized JSON string.  
- Parameters:
  - **json**: `string`  
    Serialized document data in string format  
- Returns: A constructed data model instance (`DataModel<object, DataModelConstructionContext>`)  
- Inherited from [BaseModule.fromJSON](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#fromjson)

### Static fromRemoteManifest

```typescript
static fromRemoteManifest(
  manifestUrl: string,
  options?: { strict?: boolean }
): Promise<ServerPackage>
```
- Description: Retrieve the latest Package manifest from a provided remote location.  
- Parameters:
  - **manifestUrl**: `string`  
    A remote manifest URL to load  
  - **options** (optional): `{ strict?: boolean } = {}`  
    Additional options which affect package construction  
    - **strict**?: `boolean` (optional)  
      Whether to construct the remote package strictly  
- Returns: A Promise which resolves to a constructed ServerPackage instance  
- Throws: An error if the retrieved manifest data is invalid  
- Inherited from [BaseModule.fromRemoteManifest](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#fromremotemanifest)

### Static fromSource

```typescript
static fromSource(
  source: object,
  context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions
): DataModel<object, DataModelConstructionContext>
```
- Description: Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.  
- Parameters:
  - **source**: `object`  
    Initial document data which comes from a trusted source.  
  - **context** (optional): `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions = {}`  
    Model construction context  
- Returns: The constructed data model (`DataModel<object, DataModelConstructionContext>`)  
- Inherited from [BaseModule.fromSource](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#fromsource)

### Static isIncompatibleWithCoreVersion

```typescript
static isIncompatibleWithCoreVersion(availability: number): boolean
```
- Description: Test if a given availability is incompatible with the core version.  
- Parameters:
  - **availability**: `number`  
    The availability value to test  
- Returns: `boolean`  
- Inherited from [BaseModule.isIncompatibleWithCoreVersion](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#isincompatiblewithcoreversion)

### Static migrateData

```typescript
static migrateData(data: any, __namedParameters?: {}): object
```
- Description: Migrate candidate source data for this DataModel which may require initial cleaning or transformations.  
- Parameters:
  - **data**: `any`  
    The candidate source data from which the model will be constructed  
  - **__namedParameters**: `{}` = {}  
- Returns: Migrated source data, which is the same object as the `source` argument (`object`)  
- Inherited from [BaseModule.migrateData](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#migratedata)

### Static migrateDataSafe

```typescript
static migrateDataSafe(source: object): object
```
- Description: Wrap data migration in a try/catch which attempts it safely.  
- Parameters:
  - **source**: `object`  
    The candidate source data from which the model will be constructed  
- Returns: Migrated source data, which is the same object as the `source` argument (`object`)  
- Inherited from [BaseModule.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#migratedatasafe)

### Static shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```
- Description: Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.  
- Parameters:
  - **data**: `object`  
    Data which matches the current schema  
  - **options** (optional): `{ embedded?: boolean } = {}`  
    Additional shimming options  
    - **embedded**?: `boolean` (optional)  
      Apply shims to embedded models?  
- Returns: Data with added backwards-compatible properties, which is the same object as the `data` argument (`object`)  
- Inherited from [BaseModule.shimData](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#shimdata)

### Static testAvailability

```typescript
static testAvailability(
  data: Partial<PackageManifestData>,
  options?: { release?: any }
): number
```
- Description: Check the given compatibility data against the current installation state and determine its availability.  
- Parameters:
  - **data**: `Partial<PackageManifestData>`  
    The compatibility data to test.  
  - **options** (optional): `{ release?: any } = {}`  
    Additional options  
    - **release**?: `any` (optional)  
      A specific software release for which to test availability. Tests against the current release by default.  
- Returns: `number`  
- Inherited from [BaseModule.testAvailability](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#testavailability)

### Static testDependencyCompatibility

```typescript
static testDependencyCompatibility(
  compatibility: PackageCompatibility,
  dependency: BasePackage
): boolean
```
- Description: Determine if a dependency is within the given compatibility range.  
- Parameters:
  - **compatibility**: `PackageCompatibility`  
    The compatibility range declared for the dependency, if any  
  - **dependency**: `BasePackage`  
    The known dependency package  
- Returns: `boolean` - Is the dependency compatible with the required range?  
- Inherited from [BaseModule.testDependencyCompatibility](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#testdependencycompatibility)

### Static validateId

```typescript
static validateId(id: string): void
```
- Description: Validate that a Package ID is allowed.  
- Parameters:
  - **id**: `string`  
    The candidate ID  
- Returns: `void`  
- Throws: An error if the candidate ID is invalid  
- Inherited from [BaseModule.validateId](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#validateid)

### Static validateJoint

```typescript
static validateJoint(data: object): void
```
- Description: Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.  
- Parameters:
  - **data**: `object`  
    Candidate data for the model  
- Returns: `void`  
- Throws: An error if a validation failure is detected  
- Inherited from [BaseModule.validateJoint](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#validatejoint)

### Static validateVersion

```typescript
static validateVersion(version: string): void
```
- Description: Validate that a version is allowed.  
- Parameters:
  - **version**: `string`  
    The candidate version  
- Returns: `void`  
- Throws: An error if the version is invalid  
- Inherited from [BaseModule.validateVersion](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#validateversion)

### Protected Static _initializationOrder

```typescript
protected static _initializationOrder(): Generator<[string, DataField], any, any>
```
- Description: A generator that orders the DataFields in the DataSchema into an expected initialization order.  
- Returns: `Generator<[string, DataField], any, any>`  
- Yields:  
- Inherited from [BaseModule._initializationOrder](https://foundryvtt.com/api/classes/foundry.packages.BaseModule.html#_initializationorder)