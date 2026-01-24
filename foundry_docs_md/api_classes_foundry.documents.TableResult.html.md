# TableResult

The client-side `TableResult` document which extends the common `BaseTableResult` document model.

**Mixes**  
ClientDocumentMixin

**See**  
[foundry.documents.RollTable](https://foundryvtt.com/api/classes/foundry.documents.RollTable.html): The RollTable document type which contains TableResult documents

**Hierarchy**  
- [BaseTableResult](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html)<this>  
- **TableResult**

---

## Constructors

```typescript
new TableResult(
    data?: Partial<foundry.documents.types.TableResultData>, 
    options?: foundry.abstract.types.DocumentConstructionContext
): documents.TableResult
```

**Parameters**

- **data**: `Partial<TableResultData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.TableResult`  
Inherited from [BaseTableResult.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#constructor)

---

## Properties

- **_source**: `TableResultData`  
  The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.  
  Inherited from [BaseTableResult._source](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_source)

- **parent**: `null | DataModel<object, DataModelConstructionContext>`  
  An immutable reverse-reference to a parent DataModel to which this model belongs.  
  Inherited from [BaseTableResult.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#parent)

- **LOCALIZATION_PREFIXES**: `string[]`  
  Static  
  Localization prefixes related to this document type.

- **metadata**: `object`  
  Static  
  Default metadata which applies to each instance of this Document type.  
  Inherited from [BaseTableResult.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#metadata)

---

## Accessors

- **icon**: `string`  
  A path reference to the icon image used to represent this result.

- **id**: `null | string`  
  The canonical identifier for this Document.  
  Inherited from ClientDocumentMixin(BaseTableResult).id

- **inCompendium**: `boolean`  
  Is this document in a compendium?  
  Inherited from ClientDocumentMixin(BaseTableResult).inCompendium

- **invalid**: `boolean`  
  Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.  
  Inherited from ClientDocumentMixin(BaseTableResult).invalid

- **isEmbedded**: `boolean`  
  Is this document embedded within a parent document?  
  Inherited from ClientDocumentMixin(BaseTableResult).isEmbedded

- **schema**: `SchemaField`  
  Define the data schema for this document instance.  
  Inherited from ClientDocumentMixin(BaseTableResult).schema

- **uuid**: `string`  
  A Universally Unique Identifier (UUID) for this Document instance.  
  Inherited from ClientDocumentMixin(BaseTableResult).uuid

- **validationFailures**:  
  ```typescript
  {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
  }
  ```  
  An array of validation failure instances which may have occurred when this instance was last validated.  
  Inherited from ClientDocumentMixin(BaseTableResult).validationFailures

- **baseDocument**: `typeof Document` (static)  
  The base document definition that this document class extends from.  
  Inherited from ClientDocumentMixin(BaseTableResult).baseDocument

- **collectionName**: `string` (static)  
  The named collection to which this Document belongs.  
  Inherited from ClientDocumentMixin(BaseTableResult).collectionName

- **database**: `abstract.DatabaseBackend` (static)  
  The database backend used to execute operations and handle results.  
  Inherited from ClientDocumentMixin(BaseTableResult).database

- **documentName**: `string` (static)  
  The canonical name of this Document type, for example "Actor".  
  Inherited from ClientDocumentMixin(BaseTableResult).documentName

- **hasTypeData**: `boolean` (static)  
  Does this Document support additional subtypes?  
  Inherited from ClientDocumentMixin(BaseTableResult).hasTypeData

- **hierarchy**: `Readonly<Record<string, any>>` (static)  
  The Embedded Document hierarchy for this Document.  
  Inherited from ClientDocumentMixin(BaseTableResult).hierarchy

- **implementation**: `typeof Document` (static)  
  Return a reference to the configured subclass of this base Document type.  
  Inherited from ClientDocumentMixin(BaseTableResult).implementation

- **TYPES**: `string[]` (static)  
  The allowed types which may exist for this Document class.  
  Inherited from ClientDocumentMixin(BaseTableResult).TYPES

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- **__namedParameters**: `{ pack?: null; parentCollection?: null }` = `{}`

**Returns**  
`void`  
Inherited from [BaseTableResult._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_configure)

---

### _preUpdate

```typescript
_preUpdate(changes: any, options: any, user: any): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changes**: `any`  
  The candidate changes to the Document

- **options**: `any`  
  Additional options which modify the update request

- **user**: `any`  
  The User requesting the document update

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.  
Overrides [BaseTableResult._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_preupdate)

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- **user**: `BaseUser`  
  The User attempting modification

- **action**: `string`  
  The attempted action

- **data**?: `object` = `{}`  
  Data involved in the attempted action

**Returns**  
`boolean`  
Does the User have permission?  
Inherited from [BaseTableResult.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#canusermodify)

---

### clone

```typescript
clone(
    data?: object, 
    context?: DocumentConstructionContext & DocumentCloneOptions
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides.  
The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- **data**?: `object` = `{}`  
  Additional data which overrides current document data at the time of creation

- **context**?: `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method

**Returns**  
`Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>`  
The cloned Document instance  
Inherited from [BaseTableResult.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#clone)

---

### createEmbeddedDocuments

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

- **data**?: `object[]` = `[]`  
  An array of data objects used to create multiple documents

- **operation**?: `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of created Document instances  

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)  
Inherited from [BaseTableResult.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#createembeddeddocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation**?: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The deleted Document instance, or undefined if not deleted  

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)  
Inherited from [BaseTableResult.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#delete)

---

### deleteEmbeddedDocuments

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

- **operation**?: `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of deleted Document instances  

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)  
Inherited from [BaseTableResult.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#deleteembeddeddocuments)

---

### documentToAnchor

```typescript
documentToAnchor(): null | HTMLAnchorElement
```

Create a content-link anchor from this Result's referenced Document.

**Returns**  
`null | HTMLAnchorElement`

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- **embeddedName**: `string`  
  The name of the embedded Document type

**Returns**  
`DocumentCollection`  
The Collection instance of embedded Documents of the requested type  
Inherited from [BaseTableResult.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#getembeddedcollection)

---

### getEmbeddedDocument

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

- **options**?:  
  - **invalid**?: `boolean`  
    Allow retrieving an invalid Embedded Document.

  - **strict**?: `boolean`  
    Throw an Error if the requested id does not exist. See Collection#get

**Returns**  
`Document<object, DocumentConstructionContext>`  
The retrieved embedded Document instance, or undefined  

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.  

Inherited from [BaseTableResult.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns**  
`any`  
The flag value  
Inherited from [BaseTableResult.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#getflag)

---

### getHTML

```typescript
getHTML(): Promise<string>
```

Prepare a string representation for this result.

**Returns**  
`Promise<string>`  
The enriched text to display

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user**?: `BaseUser`  
  The User being tested

**Returns**  
`DocumentOwnershipNumber`  
A numeric permission level from `CONST.DOCUMENT_OWNERSHIP_LEVELS`  
Inherited from [BaseTableResult.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
`object`  
The migrated system data object  
Inherited from [BaseTableResult.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#migratesystemdata)

---

### prepareBaseData

```typescript
prepareBaseData(): void
```

**Returns**  
`void`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`  
Inherited from [BaseTableResult.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#reset)

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by either the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

- **value**: `any`  
  The flag value

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
A Promise resolving to the updated document  
Inherited from [BaseTableResult.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#setflag)

---

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser, 
    permission: DocumentOwnershipLevel, 
    options?: { exact?: boolean }
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

**Parameters**

- **user**: `BaseUser`  
  The User being tested

- **permission**: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- **options**?:  
  - **exact**?: `boolean`  
    Require the exact permission level requested?

**Returns**  
`boolean`  
Does the user have this permission level over the Document?  
Inherited from [BaseTableResult.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object`  
The document source data expressed as a plain object  
Inherited from [BaseTableResult.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**  
`any`  
The extracted primitive object  
Inherited from [BaseTableResult.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath**?: `string`  
  A parent field path already traversed

**Returns**  
`Generator<any, void, any>`  
Inherited from [BaseTableResult.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#traverseembeddeddocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- **scope**: `string`  
  The flag scope which namespaces the key

- **key**: `string`  
  The flag key

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
The updated document instance  
Inherited from [BaseTableResult.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#unsetflag)

---

### update

```typescript
update(
    data?: object, 
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- **data**?: `object` = `{}`  
  Differential update data which modifies the existing values of this document

- **operation**?: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The updated Document instance, or undefined if not updated  

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)  
Inherited from [BaseTableResult.update](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#update)

---

### updateEmbeddedDocuments

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

- **updates**?: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- **operation**?: `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated Document instances  

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)  
Inherited from [BaseTableResult.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#updateembeddeddocuments)

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

- **changes**: `object` = `{}`  
  New values which should be applied to the data model

- **options**: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns**  
`object`  
An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid  
Inherited from [BaseTableResult.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options**: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns**  
`boolean`  
Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.  
Inherited from [BaseTableResult.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#validate)

---

## Protected Methods

### _initialize

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options**?: `object` = `{}`  
  Options provided to the model constructor

**Returns**  
`void`  
Inherited from [BaseTableResult._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_initialize)

---

### _initializeSource

```typescript
_initializeSource(
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
`object`  
Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument  
Inherited from [BaseTableResult._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_initializesource)

---

### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request

- **options**: `object`  
  Additional options which modify the creation request

- **userId**: `string`  
  The id of the User requesting the document update

**Returns**  
`void`  
Inherited from [BaseTableResult._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_onCreate)

---

### _onDelete

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request

- **userId**: `string`  
  The id of the User requesting the document update

**Returns**  
`void`  
Inherited from [BaseTableResult._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_onDelete)

---

### _onUpdate

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `object`  
  The differential data that was changed relative to the documents prior values

- **options**: `object`  
  Additional options which modify the update request

- **userId**: `string`  
  The id of the User requesting the document update

**Returns**  
`void`  
Inherited from [BaseTableResult._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_onUpdate)

---

### _preCreate

```typescript
_preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using `updateSource.`

**Parameters**

- **data**: `object`  
  The initial data object provided to the document creation request

- **options**: `object`  
  Additional options which modify the creation request

- **user**: `BaseUser`  
  The User requesting the document creation

**Returns**  
`Promise<boolean | void>`  
Return false to exclude this Document from the creation operation  
Inherited from [BaseTableResult._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_preCreate)

---

### _preDelete

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request

- **user**: `BaseUser`  
  The User requesting the document deletion

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the deletion operation should be cancelled.  
Inherited from [BaseTableResult._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_preDelete)

---

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`  
Inherited from [BaseTableResult._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_initializationOrder)

---

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
`boolean`  
Does the User have a sufficient role to create?  
Inherited from [BaseTableResult.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#canUserCreate)

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source**?: `object` = `{}`  
  The source data object

- **options**?: `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns**  
`object`  
The cleaned source data, which is the same object as the `source` argument  
Inherited from [BaseTableResult.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#cleanData)

---

### create

```typescript
static create(
    data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[], 
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>
): Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- **data**?:  
  - `object`  
  - `Document<object, DocumentConstructionContext>`  
  - Array of either objects or Documents

  Initial data used to create this Document, or a Document instance to persist.

- **operation**?: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>`  
The created Document instance(s)

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const createdOwned = await Item.implementation.create(data, { parent: actor });

const createdInPack = await Item.implementation.create(data, { pack: "mymodule.mypack" });
```

Inherited from [BaseTableResult.create](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#create)

---

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

- **operation**?: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of created Document instances

**Examples**

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const multipleData = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const multipleCreated = await Actor.implementation.createDocuments(multipleData);

const actor = game.actors.getName("Tim");
const embeddedData = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const createdEmbedded = await Item.implementation.createDocuments(embeddedData, { parent: actor });

const dataPack = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const createdInPack = await Actor.implementation.createDocuments(dataPack, { pack: "mymodule.mypack" });
```

Inherited from [BaseTableResult.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#createDocuments)

---

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    description: HTMLField;
    documentUuid: DocumentUUIDField;
    drawn: BooleanField;
    flags: DocumentFlagsField;
    img: FilePathField;
    name: StringField;
    range: ArrayField<NumberField>;
    type: DocumentTypeField;
    weight: NumberField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**

An object defining the schema fields.

Inherited from [BaseTableResult.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#defineSchema)

---

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

- **operation**?: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of deleted Document instances  

**Examples**

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);

const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedItems = await Item.implementation.deleteDocuments([sword.id, shield.id], { parent: actor });

const actor = await pack.getDocument(documentId);
const deletedPack = await Actor.implementation.deleteDocuments([actor.id], { pack: "mymodule.mypack" });
```

Inherited from [BaseTableResult.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#deleteDocuments)

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
`DataModel<object, DataModelConstructionContext>`  
A constructed data model instance  
Inherited from [BaseTableResult.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#fromJSON)

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

- **context**?: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}`  
  Model construction context

**Returns**  
`DataModel<object, DataModelConstructionContext>`  
Inherited from [BaseTableResult.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#fromSource)

---

### get

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

- **operation**?: `DatabaseGetOperation` = `{}`  
  Parameters of the get operation

**Returns**  
`null | Document<object, DocumentConstructionContext>`  
The retrieved Document, or null  
Inherited from [BaseTableResult.get](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#get)

---

### getCollectionName

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- **name**: `string`  
  An existing collection name or a document name.

**Returns**  
`null | string`  
The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items"); // returns "items"
Actor.implementation.getCollectionName("Item");  // returns "items"
```

Inherited from [BaseTableResult.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#getCollectionName)

---

### migrateData

```typescript
static migrateData(data: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **data**: `any`  
  The candidate source data from which the model will be constructed

**Returns**  
`object`  
Migrated source data, which is the same object as the `source` argument  
Inherited from [BaseTableResult.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#migrateData)

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
`object`  
Migrated source data, which is the same object as the `source` argument  
Inherited from [BaseTableResult.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#migrateDataSafe)

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
`object`  
Data with added backwards-compatible properties, which is the same object as the `data` argument  
Inherited from [BaseTableResult.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#shimData)

---

### updateDocuments

```typescript
static updateDocuments(
    updates?: object[], 
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates**?: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- **operation**?: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated Document instances  

**Examples**

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const multipleUpdates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const multipleUpdated = await Actor.implementation.updateDocuments(multipleUpdates);

const actor = game.actors.getName("Timothy");
const itemUpdates = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updatedItems = await Item.implementation.updateDocuments(itemUpdates, { parent: actor });

const actorFromPack = await pack.getDocument(documentId);
const updatedInPack = await Actor.implementation.updateDocuments([{_id: actorFromPack.id, name: "New Name"}], { pack: "mymodule.mypack" });
```

Inherited from [BaseTableResult.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#updateDocuments)

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
Inherited from [BaseTableResult.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#validateJoint)

---

### _onCreateOperation

```typescript
static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[], 
    operation: DatabaseCreateOperation, 
    user: BaseUser
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were created

- **operation**: `DatabaseCreateOperation`  
  Parameters of the database creation operation

- **user**: `BaseUser`  
  The User who performed the creation operation

**Returns**  
`Promise<void>`  
Inherited from [BaseTableResult._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_onCreateOperation)

---

### _onDeleteOperation

```typescript
static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[], 
    operation: DatabaseDeleteOperation, 
    user: BaseUser
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were deleted

- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation

- **user**: `BaseUser`  
  The User who performed the deletion operation

**Returns**  
`Promise<void>`  
Inherited from [BaseTableResult._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_onDeleteOperation)

---

### _onUpdateOperation

```typescript
static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[], 
    operation: DatabaseUpdateOperation, 
    user: BaseUser
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were updated

- **operation**: `DatabaseUpdateOperation`  
  Parameters of the database update operation

- **user**: `BaseUser`  
  The User who performed the update operation

**Returns**  
`Promise<void>`  
Inherited from [BaseTableResult._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_onUpdateOperation)

---

### _preCreateOperation

```typescript
static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[], 
    operation: DatabaseCreateOperation, 
    user: BaseUser
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using `updateSource`.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  Pending document instances to be created

- **operation**: `DatabaseCreateOperation`  
  Parameters of the database creation operation

- **user**: `BaseUser`  
  The User requesting the creation operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the creation operation entirely  
Inherited from [BaseTableResult._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_preCreateOperation)

---

### _preDeleteOperation

```typescript
static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[], 
    operation: DatabaseDeleteOperation, 
    user: BaseUser
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be deleted

- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database update operation

- **user**: `BaseUser`  
  The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the deletion operation entirely  
Inherited from [BaseTableResult._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_preDeleteOperation)

---

### _preUpdateOperation

```typescript
static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[], 
    operation: DatabaseUpdateOperation, 
    user: BaseUser
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be updated

- **operation**: `DatabaseUpdateOperation`  
  Parameters of the database update operation

- **user**: `BaseUser`  
  The User requesting the update operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the update operation entirely  
Inherited from [BaseTableResult._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseTableResult.html#_preUpdateOperation)

---

For further details please refer to the full [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.documents.TableResult.html).