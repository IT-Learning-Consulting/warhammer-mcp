# BaseUser | Foundry Virtual Tabletop - API Documentation - Version 13

The User Document. Defines the DataSchema and common behaviors for a User which are shared between both client and server.

## Mixes

- UserData

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.BaseUser))
- _Document_ (https://foundryvtt.com/api/classes/foundry.abstract.Document.html)
- **BaseUser**
- _documents.User_ (https://foundryvtt.com/api/classes/foundry.documents.User.html)

---

# Class: BaseUser

## Constructors

```typescript
new BaseUser(
    data?: Partial<UserData>,
    options?: DocumentConstructionContext
): BaseUser
```

**Parameters**

- **data**: `Partial<UserData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**

- `BaseUser`  
  Inherited from [Document.constructor](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#constructor)

---

## Properties

### _source

```typescript
_source: UserData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [Document._source](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_source)

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [Document.parent](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#parent)

### LOCALIZATION_PREFIXES (Static)

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

Overrides [Document.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#localization_prefixes)

### metadata (Static Accessor)

```typescript
static get metadata(): object
```

Default metadata which applies to each instance of this Document type.

Overrides [Document.metadata](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#metadata)

---

## Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

Returns: `null | string`

Inherited from Document.id

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

Returns: `boolean`

Inherited from Document.inCompendium

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

Returns: `boolean`

Inherited from Document.invalid

### isBanned

```typescript
get isBanned(): boolean
```

A convenience test for whether this User has the NONE role.

Returns: `boolean`

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

Returns: `boolean`

Inherited from Document.isEmbedded

### isGM

```typescript
get isGM(): boolean
```

Test whether the User has a GAMEMASTER or ASSISTANT role in this World?

Returns: `boolean`

### schema (Static Accessor)

```typescript
static get schema(): SchemaField
```

Define the data schema for this document instance.

Returns: `SchemaField`

Inherited from Document.schema

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

Returns: `string`

Inherited from Document.uuid

### validationFailures

```typescript
get validationFailures():
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

Returns:

```typescript
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

Inherited from Document.validationFailures

### baseDocument (Static Accessor)

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

Returns: `typeof Document`

Inherited from Document.baseDocument

### collectionName (Static Accessor)

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

Returns: `string`

Inherited from Document.collectionName

### database (Static Accessor)

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

Returns: `abstract.DatabaseBackend`

Inherited from Document.database

### documentName (Static Accessor)

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

Returns: `string`

Inherited from Document.documentName

### hasTypeData (Static Accessor)

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

Returns: `boolean`

Inherited from Document.hasTypeData

### hierarchy (Static Accessor)

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

Returns: `Readonly<Record<string, any>>`

Inherited from Document.hierarchy

### implementation (Static Accessor)

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

Returns: `typeof Document`

Inherited from Document.implementation

### TYPES (Static Accessor)

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

Returns: `string[]`

Inherited from Document.TYPES

---

## Methods

### _configure (Inherited)

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

Parameters:

- **__namedParameters**: `{ pack?: null; parentCollection?: null }` = `{}`

Returns: `void`

Inherited from [Document._configure](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_configure)

### can

```typescript
can(action: string): boolean
```

Test whether the User is able to perform a certain permission action. The provided permission string may pertain to an explicit permission setting or a named user role.

**Parameters**

- **action**: `string`  
  The action to test

**Returns**

- `boolean`  
  Does the user have the ability to perform this action?

### canUserModify (Inherited)

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document

**Parameters**

- **user**: `BaseUser`  
  The User attempting modification

- **action**: `string`  
  The attempted action

- **data**: `object` = `{}`  
  Data involved in the attempted action

**Returns**

- `boolean`  
  Does the User have permission?

Inherited from [Document.canUserModify](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusermodify)

### clone (Inherited)

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- **data**: `object` = `{}`  
  Additional data which overrides current document data at the time of creation

- **context**: `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method

**Returns**

- `Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>`  
  The cloned Document instance

Inherited from [Document.clone](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#clone)

### createEmbeddedDocuments (Inherited)

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

- **data**: `object[]` = `[]`  
  An array of data objects used to create multiple documents

- **operation**: `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow

**Returns**

- `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of created Document instances

**See Also**

- [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [Document.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createembeddeddocuments)

### delete (Inherited)

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation

**Returns**

- `Promise<undefined | Document<object, DocumentConstructionContext>>`  
  The deleted Document instance, or undefined if not deleted

**See Also**

- [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [Document.delete](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#delete)

### deleteEmbeddedDocuments (Inherited)

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

- **ids**: `string[]`  
  An array of string ids for each Document to be deleted

- **operation**: `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow

**Returns**

- `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of deleted Document instances

**See Also**

- [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [Document.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deleteembeddeddocuments)

### getEmbeddedCollection (Inherited)

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

**Returns**

- `DocumentCollection`  
  The Collection instance of embedded Documents of the requested type

Inherited from [Document.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddedcollection)

### getEmbeddedDocument (Inherited)

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean }
): Document<object, DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

- **id**: `string`  
  The id of the child document to retrieve

- **options**: `{ invalid?: boolean; strict?: boolean }` = `{}`  
  Additional options which modify how embedded documents are retrieved

  - `invalid?`: `boolean`  
    Allow retrieving an invalid Embedded Document.

  - `strict?`: `boolean`  
    Throw an Error if the requested id does not exist. See Collection#get

**Returns**

- `Document<object, DocumentConstructionContext>`  
  The retrieved embedded Document instance, or undefined

**Throws**

- If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [Document.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getembeddeddocument)

### getFlag (Inherited)

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns**

- `any`  
  The flag value

Inherited from [Document.getFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getflag)

### getUserLevel

```typescript
getUserLevel(user: any): 0 | 3
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user**: `any`  
  The User being tested

**Returns**

- `0 | 3`  
  A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

Overrides [Document.getUserLevel](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getuserlevel)

### hasPermission

```typescript
hasPermission(permission: string): boolean
```

Test whether the User has at least a specific permission

**Parameters**

- **permission**: `string`  
  The permission name from USER_PERMISSIONS to test

**Returns**

- `boolean`  
  Does the user have at least this permission?

### hasRole

```typescript
hasRole(role: string | number, exact?: boolean): boolean
```

Test whether the User has at least the permission level of a certain role

**Parameters**

- **role**: `string | number`  
  The role name from USER_ROLES to test

- **exact**: `boolean` = false  
  Require the role match to be exact

**Returns**

- `boolean`  
  Does the user have this role level (or greater)?

### migrateSystemData (Inherited)

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**

- `object`  
  The migrated system data object

Inherited from [Document.migrateSystemData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratesystemdata)

### reset (Inherited)

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**

- `void`

Inherited from [Document.reset](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#reset)

### setFlag (Inherited)

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the `"core"` scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use `"world"` as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

- **value**: `any`  
  The flag value

**Returns**

- `Promise<Document<object, DocumentConstructionContext>>`  
  A Promise resolving to the updated document

Inherited from [Document.setFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#setflag)

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean }
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document

**Parameters**

- **user**: `BaseUser`  
  The User being tested

- **permission**: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- **options**: `{ exact?: boolean }` = `{}`  
  Additional options involved in the permission test

  - `exact?`: `boolean`  
    Require the exact permission level requested?

**Returns**

- `boolean`  
  Does the user have this permission level over the Document?

Inherited from [Document.testUserPermission](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#testuserpermission)

### toJSON (Inherited)

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**

- `object`  
  The document source data expressed as a plain object

Inherited from [Document.toJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#tojson)

### toObject (Inherited)

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**

- `any`  
  The extracted primitive object

Inherited from [Document.toObject](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#toobject)

### traverseEmbeddedDocuments (Inherited)

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath**: `string`  
  A parent field path already traversed

**Returns**

- `Generator<any, void, any>`

Inherited from [Document.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#traverseembeddeddocuments)

### unsetFlag (Inherited)

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns**

- `Promise<Document<object, DocumentConstructionContext>>`  
  The updated document instance

Inherited from [Document.unsetFlag](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#unsetflag)

### update (Inherited)

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- **data**: `object` = `{}`  
  Differential update data which modifies the existing values of this document

- **operation**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation

**Returns**

- `Promise<undefined | Document<object, DocumentConstructionContext>>`  
  The updated Document instance, or undefined not updated

**See Also**

- [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [Document.update](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#update)

### updateEmbeddedDocuments (Inherited)

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: DatabaseUpdateOperation
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

- **updates**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- **operation**: `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow

**Returns**

- `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of updated Document instances

**See Also**

- [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [Document.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateembeddeddocuments)

### updateSource (Inherited)

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes**: `object` = `{}`  
  New values which should be applied to the data model

- **options**: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns**

- `object`  
  An object containing differential keys and values that were changed

**Throws**

- An error if the requested data model changes were invalid

Inherited from [Document.updateSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatesource)

### validate (Inherited)

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns**

- `boolean`  
  Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**

- An error thrown if validation is strict and a failure occurs.

Inherited from [Document.validate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validate)

---

## Protected Methods (Inherited)

- `_initialize(options?: object): void`  
  Initialize the instance by copying data from the source object to instance attributes.

- `_initializeSource(data: object | DataModel<object, DataModelConstructionContext>, options?: object): object`  
  Initialize the source data for a new DataModel instance.

- `_onCreate(data: object, options: object, userId: string): void`  
  Post-process a creation operation for a single Document instance.

- `_onDelete(options: object, userId: string): void`  
  Post-process a deletion operation for a single Document instance.

- `_onUpdate(changed: object, options: object, userId: string): void`  
  Post-process an update operation for a single Document instance.

- `_preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>`  
  Pre-process a creation operation for a single Document instance.

- `_preDelete(options: object, user: BaseUser): Promise<boolean | void>`  
  Pre-process a deletion operation for a single Document instance.

- `_preUpdate(changes: object, options: object, user: BaseUser): Promise<boolean | void>`  
  Pre-process an update operation for a single Document instance.

---

## Static Protected Methods (Inherited)

- `_initializationOrder(): Generator<any[], void, unknown>`

- `_onCreateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseCreateOperation, user: BaseUser): Promise<void>`

- `_onDeleteOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseDeleteOperation, user: BaseUser): Promise<void>`

- `_onUpdateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseUpdateOperation, user: BaseUser): Promise<void>`

- `_preCreateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseCreateOperation, user: BaseUser): Promise<boolean | void>`

- `_preDeleteOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseDeleteOperation, user: BaseUser): Promise<boolean | void>`

- `_preUpdateOperation(documents: Document<object, DocumentConstructionContext>[], operation: DatabaseUpdateOperation, user: BaseUser): Promise<boolean | void>`

---

## Static Methods (Inherited)

### canUserCreate

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- **user**: `BaseUser`  
  The User being tested

**Returns**

- `boolean`  
  Does the User have a sufficient role to create?

Inherited from [Document.canUserCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#canusercreate)

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**: `object` = `{}`  
  The source data object

- **options**: `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns**

- `object`  
  The cleaned source data, which is the same object as the `source` argument

Inherited from [Document.cleanData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#cleandata)

### create

```typescript
static create(
    data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>
): Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- **data**: `object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[]`  
  Initial data used to create this Document, or a Document instance to persist.

- **operation**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation

**Returns**

- `Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>`  
  The created Document instance(s)

**Examples**

Create a World-level Item

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);
```

Create an Actor-owned Item

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});
```

Create an Item in a Compendium pack

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create)

### createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data**: `(object | Document<object, DocumentConstructionContext>)[]` = `[]`  
  An array of data objects or existing Documents to persist.

- **operation**: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation

**Returns**

- `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of created Document instances

**Examples**

Create a single Document

Create multiple Documents

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);
```

Create multiple embedded Documents within a parent

Create a Document within a Compendium pack

```typescript
const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);

const actor = game.actors.getName("Tim");
const dataItems = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const createdItems = await Item.implementation.createDocuments(dataItems, {parent: actor});

const dataPack = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const createdPack = await Actor.implementation.createDocuments(dataPack, {pack: "mymodule.mypack"});
```

Inherited from [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

### defineSchema (Static)

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    avatar: FilePathField;
    character: ForeignDocumentField;
    color: ColorField;
    flags: DocumentFlagsField;
    hotbar: ObjectField;
    name: StringField;
    password: StringField;
    passwordSalt: StringField;
    permissions: ObjectField;
    pronouns: StringField;
    role: NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**

- An object describing the schema fields:

```typescript
{
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    avatar: FilePathField;
    character: ForeignDocumentField;
    color: ColorField;
    flags: DocumentFlagsField;
    hotbar: ObjectField;
    name: StringField;
    password: StringField;
    passwordSalt: StringField;
    permissions: ObjectField;
    pronouns: StringField;
    role: NumberField;
}
```

Overrides [Document.defineSchema](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#defineschema)

### deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids**: `string[]` = `[]`  
  An array of string ids for the documents to be deleted

- **operation**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation

**Returns**

- `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of deleted Document instances

**Examples**

Delete a single Document

Delete multiple Documents

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);
```

Delete multiple embedded Documents within a parent

Delete Documents within a Compendium pack

```typescript
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedItems = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actorInPack = await pack.getDocument(documentId);
const deletedFromPack = await Actor.implementation.deleteDocuments([actorInPack.id], {pack: "mymodule.mypack"});
```

Inherited from [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

### fromJSON (Static)

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- **json**: `string`  
  Serialized document data in string format

**Returns**

- `DataModel<object, DataModelConstructionContext>`  
  A constructed data model instance

Inherited from [Document.fromJSON](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromjson)

### fromSource (Static)

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

- **context**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context

**Returns**

- `DataModel<object, DataModelConstructionContext>`

Inherited from [Document.fromSource](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#fromsource)

### get (Static)

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string`  
  The Document ID

- **operation**: `DatabaseGetOperation` = `{}`  
  Parameters of the get operation

**Returns**

- `null | Document<object, DocumentConstructionContext>`  
  The retrieved Document, or null

Inherited from [Document.get](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#get)

### getCollectionName (Static)

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string`  
  An existing collection name or a document name.

**Returns**

- `null | string`  
  The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

Passing an existing collection name:

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
```

Passing a document name:

```typescript
Actor.implementation.getCollectionName("Item"); // returns "items"
```

Inherited from [Document.getCollectionName](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#getcollectionname)

### migrateData (Static)

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**

- `object`  
  Migrated source data, which is the same object as the `source` argument

Inherited from [Document.migrateData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedata)

### migrateDataSafe (Static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**

- `object`  
  Migrated source data, which is the same object as the `source` argument

Inherited from [Document.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#migratedatasafe)

### shimData (Static)

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema

- **options**: `{ embedded?: boolean }` = `{}`  
  Additional shimming options

  - `embedded?`: `boolean`  
    Apply shims to embedded models?

**Returns**

- `object`  
  Data with added backwards-compatible properties, which is the same object as the `data` argument

Inherited from [Document.shimData](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#shimdata)

### updateDocuments (Static)

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates**: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- **operation**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation

**Returns**

- `Promise<Document<object, DocumentConstructionContext>[]>`  
  An array of updated Document instances

**Examples**

Update a single Document

Update multiple Documents

Update multiple embedded Documents within a parent

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const updatesMultiple = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updatedMultiple = await Actor.implementation.updateDocuments(updatesMultiple);

const actor = game.actors.getName("Timothy");
const updatesEmbedded = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updatedEmbedded = await Item.implementation.updateDocuments(updatesEmbedded, {parent: actor});
```

Update Documents within a Compendium pack

```typescript
const actorInPack = await pack.getDocument(documentId);
const updatedPack = await Actor.implementation.updateDocuments([{_id: actorInPack.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

### validateJoint (Static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- **data**: `object`  
  Candidate data for the model

**Returns**

- `void`

**Throws**

- An error if a validation failure is detected

Inherited from [Document.validateJoint](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#validatejoint)