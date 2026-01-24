# BaseWorld

The data schema used to define World manifest files. Extends the basic PackageData schema  
with some additional world-specific fields.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.packages.BaseWorld), Expand)

- _BasePackage_
- **BaseWorld**
- _World_

---

## Constructors

### constructor

```typescript
new BaseWorld(
  data: PackageManifestData, 
  options?: object
): BaseWorld
```

**Parameters**

- **data**: _PackageManifestData_  
  Source data for the package

- **options**: _object_ = {}  
  Options which affect DataModel construction

**Returns**  
_BaseWorld_

Inherited from [BasePackage.constructor](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#constructor)

---

## Properties

### _source

```typescript
_source: object
```

The source data object for this DataModel instance. Once constructed, the source object is  
sealed such that no keys may be added nor removed.

Inherited from [BasePackage._source](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_source)

---

### availability

```typescript
availability: number
```

An availability code in `PACKAGE_AVAILABILITY_CODES` which defines whether this package  
can be used.

Inherited from [BasePackage.availability](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#availability)

---

### exclusive

```typescript
exclusive: boolean
```

A flag which tracks whether this package is a free Exclusive pack

Inherited from [BasePackage.exclusive](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#exclusive)

---

### hasStorage

```typescript
hasStorage: boolean
```

A flag which tracks if this package has files stored in the persistent storage folder

Inherited from [BasePackage.hasStorage](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#hasstorage)

---

### locked

```typescript
locked: boolean
```

A flag which tracks whether this package is currently locked.

Inherited from [BasePackage.locked](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#locked)

---

### owned

```typescript
owned: null | boolean
```

A flag which tracks whether this package is owned, if it is protected.

Inherited from [BasePackage.owned](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#owned)

---

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BasePackage.parent](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#parent)

---

### tags

```typescript
tags: string[]
```

A set of Tags that indicate what kind of Package this is, provided by the Website

Inherited from [BasePackage.tags](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#tags)

---

### Static icon

```typescript
icon: string = "fa-globe-asia"
```

The default icon used for this type of Package.

---

### Static LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

Overrides [BasePackage.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#localization_prefixes)

---

### Static type

```typescript
type: string = "world"
```

Overrides [BasePackage.type](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#type)

---

## Accessors

### incompatibleWithCoreVersion

```typescript
get incompatibleWithCoreVersion(): boolean
```

Is this Package incompatible with the currently installed core Foundry VTT software version?

Returns: _boolean_

Inherited from BasePackage.incompatibleWithCoreVersion

---

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved  
failure.

Returns: _boolean_

Inherited from BasePackage.invalid

---

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

Returns: _SchemaField_

Inherited from BasePackage.schema

---

### type

```typescript
get type(): string
```

The type of this package instance. A value in `CONST.PACKAGE_TYPES`.

Returns: _string_

Inherited from BasePackage.type

---

### unavailable

```typescript
get unavailable(): boolean
```

A flag which defines whether this package is unavailable to be used.

Returns: _boolean_

Inherited from BasePackage.unavailable

---

### validationFailures

```typescript
get validationFailures(): {
  fields: null | DataModelValidationFailure;
  joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last  
validated.

Returns:

- **fields**: _null | DataModelValidationFailure_  
- **joint**: _null | DataModelValidationFailure_

Inherited from BasePackage.validationFailures

---

### Static collection

```typescript
get collection(): string
```

The named collection to which this package type belongs

Returns: _string_

Inherited from BasePackage.collection

---

### Static schema

```typescript
get schema(): SchemaField
```

The Data Schema for all instances of this DataModel.

Returns: _SchemaField_

Inherited from BasePackage.schema

---

## Methods

### clone

```typescript
clone(
  data?: object,
  context?: DataModelConstructionContext,
): DataModel<object, DataModelConstructionContext>
```

Clone a model, creating a new data model by combining current data with provided  
overrides.

**Parameters**

- **data**: _object_ = {}  
  Additional data which overrides current document data at the time of creation

- **context**: _DataModelConstructionContext_ = {}  
  Context options passed to the data model constructor

**Returns**  
_DataModel_ instance cloned

Inherited from [BasePackage.clone](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#clone)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any  
changes.

Returns: _void_

Inherited from [BasePackage.reset](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#reset)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

Returns: _object_  
The document source data expressed as a plain object

Inherited from [BasePackage.toJSON](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted  
object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: _boolean_ = true  
  Draw values from the underlying data source rather than transformed values

**Returns**  
The extracted primitive object

Inherited from [BasePackage.toObject](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#toobject)

---

### updateSource

```typescript
updateSource(
  changes?: object, 
  options?: DataModelUpdateOptions
): object
```

Update the DataModel locally by applying an object of changes to its source data. The  
provided changes are expanded, cleaned, validated, and stored to the source data object for  
this model. The provided changes argument is mutated in this process. The source data is  
then re-initialized to apply those changes to the prepared data. The method returns an  
object of differential changes which modified the original data.

**Parameters**

- **changes**: _object_ = {}  
  New values which should be applied to the data model

- **options**: _DataModelUpdateOptions_ = {}  
  Options which determine how the new data is merged

**Returns**  
An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

Inherited from [BasePackage.updateSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#updatesource)

---

### validate

```typescript
validate(
  options?: DataModelValidationOptions
): boolean
```

Validate the data contained in the document to check for type and content. If changes are  
provided, missing types are added to it before cleaning and validation. This mutates the  
provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: _DataModelValidationOptions_ = {}  
  Options which modify how the model is validated

**Returns**  
Whether the data source or proposed change is reported as valid. A boolean is always  
returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BasePackage.validate](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validate)

---

### _configure (Protected)

```typescript
_configure(options?: object): void
```

Configure the data model instance before validation and initialization workflows are  
performed.

**Parameters**

- **options**: _object_ = {}  
  Additional options modifying the configuration

Returns: _void_

Inherited from [BasePackage._configure](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_configure)

---

### _initialize (Protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This  
mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options**: _object_ = {}  
  Options provided to the model constructor

Returns: _void_

Inherited from [BasePackage._initialize](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initialize)

---

### _initializeSource (Protected)

```typescript
_initializeSource(
  data: object | DataModel<object, DataModelConstructionContext>, 
  options?: object
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial  
cleaning operations are applied to the source data.

**Parameters**

- **data**: _object | DataModel_  
  The candidate source data from which the model will be constructed

- **options**: _object_ = {}  
  Options provided to the model constructor

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the  
same object as the `data` argument

Inherited from [BasePackage._initializeSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initializesource)

---

### Static cleanData

```typescript
static cleanData(
  source?: {},
  __namedParameters?: {}
): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: _{}_ = {}  
  The source data object

- **__namedParameters**: _{}_ = {}  
  Additional options which are passed to field cleaning methods

**Returns**  
The cleaned source data, which is the same object as the `source` argument

Inherited from [BasePackage.cleanData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#cleandata)

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

Define the data schema for documents of this type. The schema is populated the first time it  
is accessed and cached for future reuse.

Overrides [BasePackage.defineSchema](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#defineschema)

---

### Static fromJSON

```typescript
static fromJSON(
  json: string
): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: _string_  
  Serialized document data in string format

**Returns**  
A constructed data model instance

Inherited from [BasePackage.fromJSON](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromjson)

---

### Static fromRemoteManifest

```typescript
static fromRemoteManifest(
  manifestUrl: string,
  options?: { strict?: boolean }
): Promise<ServerPackage>
```

Retrieve the latest Package manifest from a provided remote location.

**Parameters**

- **manifestUrl**: _string_  
  A remote manifest URL to load
  
- **options**: _{ strict?: boolean }_ = {}  
  Additional options which affect package construction

  - **strict?**: _boolean_  
    Whether to construct the remote package strictly

**Returns**  
A Promise which resolves to a constructed ServerPackage instance

**Throws**  
An error if the retrieved manifest data is invalid

Inherited from [BasePackage.fromRemoteManifest](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromremotemanifest)

---

### Static fromSource

```typescript
static fromSource(
  source: object,
  context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be  
trustworthy and is not strictly validated.

**Parameters**

- **source**: _object_  
  Initial document data which comes from a trusted source.

- **context**: _Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions_ = {}  
  Model construction context

**Returns**  
DataModel instance constructed

Inherited from [BasePackage.fromSource](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#fromsource)

---

### Static isIncompatibleWithCoreVersion

```typescript
static isIncompatibleWithCoreVersion(
  availability: number
): boolean
```

Test if a given availability is incompatible with the core version.

**Parameters**

- **availability**: _number_  
  The availability value to test.

**Returns**  
_boolean_

Inherited from [BasePackage.isIncompatibleWithCoreVersion](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#isincompatiblewithcoreversion)

---

### Static migrateData

```typescript
static migrateData(
  data: any
): any
```

Migrate candidate source data for this DataModel which may require initial cleaning or  
transformations.

**Parameters**

- **data**: _any_  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument

Overrides [BasePackage.migrateData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#migratedata)

---

### Static migrateDataSafe

```typescript
static migrateDataSafe(
  source: object
): object
```

Wrap data migration in a try/catch which attempts it safely

**Parameters**

- **source**: _object_  
  The candidate source data from which the model will be constructed

**Returns**  
Migrated source data, which is the same object as the `source` argument

Inherited from [BasePackage.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#migratedatasafe)

---

### Static shimData

```typescript
static shimData(
  data: object,
  options?: { embedded?: boolean }
): object
```

Take data which conforms to the current data schema and add backwards-compatible  
accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: _object_  
  Data which matches the current schema

- **options**: _{ embedded?: boolean }_ = {}  
  Additional shimming options

  - **embedded?**: _boolean_  
    Apply shims to embedded models?

**Returns**  
Data with added backwards-compatible properties, which is the same object as the `data`  
argument

Inherited from [BasePackage.shimData](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#shimdata)

---

### Static testAvailability

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

Check the given compatibility data against the current installation state and determine its  
availability.

**Parameters**

- **data**: _Partial&lt;PackageManifestData&gt;_  
  The compatibility data to test.

- **options**: _optional_  
  - **modules?**: _any_  
    A specific collection of modules to test availability against. Tests against the  
    currently installed modules by default.
  - **release?**: _any_  
    A specific software release for which to test availability. Tests against the current  
    release by default.
  - **systemAvailabilityThreshold?**: _number_  
    Ignore the world's own core software compatibility and instead defer entirely to the  
    system's core software compatibility, if the world's availability is less than this.
  - **systems?**: _any_  
    A specific collection of systems to test availability against. Tests against the  
    currently installed systems by default.

**Returns**  
_number_

Overrides [BasePackage.testAvailability](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#testavailability)

---

### Static testDependencyCompatibility

```typescript
static testDependencyCompatibility(
  compatibility: PackageCompatibility,
  dependency: BasePackage
): boolean
```

Determine if a dependency is within the given compatibility range.

**Parameters**

- **compatibility**: _PackageCompatibility_  
  The compatibility range declared for the dependency, if any

- **dependency**: _BasePackage_  
  The known dependency package

**Returns**  
_boolean_  
Is the dependency compatible with the required range?

Inherited from [BasePackage.testDependencyCompatibility](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#testdependencycompatibility)

---

### Static validateId

```typescript
static validateId(id: string): void
```

Validate that a Package ID is allowed.

**Parameters**

- **id**: _string_  
  The candidate ID

**Returns**  
_void_

**Throws**  
An error if the candidate ID is invalid

Inherited from [BasePackage.validateId](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validateid)

---

### Static validateJoint

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the  
model. Field-specific validation rules should be defined as part of the DataSchema for the  
model. This method allows for testing aggregate rules which impose requirements on the  
overall model.

**Parameters**

- **data**: _object_  
  Candidate data for the model

**Returns**  
_void_

**Throws**  
An error if a validation failure is detected

Inherited from [BasePackage.validateJoint](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validatejoint)

---

### Static validateVersion

```typescript
static validateVersion(version: string): void
```

Validate that a version is allowed.

**Parameters**

- **version**: _string_  
  The candidate version

**Returns**  
_void_

**Throws**  
An error if the version is invalid

Inherited from [BasePackage.validateVersion](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#validateversion)

---

### Protected Static _initializationOrder

```typescript
static _initializationOrder(): Generator<[string, DataField], any, any>
```

A generator that orders the DataFields in the DataSchema into an expected initialization  
order.

Returns: _Generator<[string, DataField], any, any>_

Inherited from [BasePackage._initializationOrder](https://foundryvtt.com/api/classes/foundry.packages.BasePackage.html#_initializationorder)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)