# Folder | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side Folder document which extends the common BaseFolder model.

Mixes:  
- ClientDocumentMixin

See also:  
- [foundry.documents.collections.Folders](https://foundryvtt.com/api/classes/foundry.documents.collections.Folders.html): The world-level collection of Folder documents  
- [foundry.applications.sheets.FolderConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.FolderConfig.html): The Folder configuration application  

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.Folder), Expand):  
- [BaseFolder](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html)<this>  
- Folder

---

## Constructors

```typescript
new Folder(
    data?: Partial<foundry.documents.types.FolderData>,
    options?: foundry.abstract.types.DocumentConstructionContext,
): documents.Folder
```

**Parameters**

- **data**: `Partial<FolderData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.Folder`

Inherited from [BaseFolder.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#constructor)

---

## Properties

### _source

```typescript
_source: FolderData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

Inherited from [BaseFolder._source](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_source)

### children

```typescript
children: documents.Folder[]
```

An array of other Folders which are the displayed children of this one. This differs from the [results of Folder.getSubfolders](#getsubfolders) because reports the subset of child folders which are displayed to the current User in the UI.

### depth

```typescript
depth: number
```

The depth of this folder in its sidebar tree.

### displayed

```typescript
displayed: boolean = false
```

Return whether the folder is displayed in the sidebar to the current User.

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [BaseFolder.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#parent)

### LOCALIZATION_PREFIXES (Static)

```typescript
LOCALIZATION_PREFIXES: string[] = ...
```

Inherited from [BaseFolder.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#localization_prefixes)

### metadata (Static)

```typescript
metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

Inherited from [BaseFolder.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#metadata)

### SORTING_MODES (Static)

```typescript
SORTING_MODES: string[] = ...
```

Allow folder sorting modes.

Inherited from [BaseFolder.SORTING_MODES](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#sorting_modes)

---

## Accessors

### ancestors

```typescript
get ancestors(): documents.Folder[]
```

Return the list of ancestors of this folder, starting with the parent.

**Returns**  
`documents.Folder[]`

### contents

```typescript
get contents(): any[]
```

The array of the Document instances which are contained within this Folder, unless it's a Folder inside a Compendium pack, in which case it's the array of objects inside the index of the pack that are contained in this Folder.

**Returns**  
`any[]`

### documentClass

```typescript
get documentClass(): Function
```

The reference to the Document type which is contained within this Folder.

**Returns**  
`Function`

### documentCollection

```typescript
get documentCollection(): undefined | Collection<any, any> | WorldCollection
```

The reference to the WorldCollection instance which provides Documents to this Folder, unless it's a Folder inside a Compendium pack, in which case it's the index of the pack. A world Folder containing CompendiumCollections will have neither.

**Returns**  
`undefined | Collection<any, any> | WorldCollection`

### expanded

```typescript
get expanded(): boolean
```

Return whether the folder is currently expanded within the sidebar interface.

**Returns**  
`boolean`

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

Inherited from ClientDocumentMixin(BaseFolder).id

### inCompendium

```typescript
get inCompendium(): boolean
```

**Returns**  
`boolean`

Overrides ClientDocumentMixin(BaseFolder).inCompendium

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BaseFolder).invalid

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BaseFolder).isEmbedded

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from ClientDocumentMixin(BaseFolder).schema

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

Inherited from ClientDocumentMixin(BaseFolder).uuid

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last validated.

**Returns**  
```typescript
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

Inherited from ClientDocumentMixin(BaseFolder).validationFailures

### baseDocument (Static)

```typescript
get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BaseFolder).baseDocument

### collectionName (Static)

```typescript
get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

Inherited from ClientDocumentMixin(BaseFolder).collectionName

### database (Static)

```typescript
get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from ClientDocumentMixin(BaseFolder).database

### documentName (Static)

```typescript
get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

Inherited from ClientDocumentMixin(BaseFolder).documentName

### hasTypeData (Static)

```typescript
get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

Inherited from ClientDocumentMixin(BaseFolder).hasTypeData

### hierarchy (Static)

```typescript
get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from ClientDocumentMixin(BaseFolder).hierarchy

### implementation (Static)

```typescript
get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from ClientDocumentMixin(BaseFolder).implementation

### schema (Static)

```typescript
get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

Inherited from ClientDocumentMixin(BaseFolder).schema

### TYPES (Static)

```typescript
get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

Inherited from ClientDocumentMixin(BaseFolder).TYPES

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**  
- __namedParameters: `{ pack?: null; parentCollection?: null }` = `{}`

**Returns**  
`void`

Inherited from [BaseFolder._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_configure)

### _preCreate

```typescript
_preCreate(data: any, options: any, user: any): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [_updateSource](#updatesource).

**Parameters**

- data: `any`  
  The initial data object provided to the document creation request.

- options: `any`  
  Additional options which modify the creation request.

- user: `any`  
  The User requesting the document creation.

**Returns**  
`Promise<boolean | void>`

Overrides [BaseFolder._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_preCreate)

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document.

**Parameters**

- user: `BaseUser`  
  The User attempting modification.

- action: `string`  
  The attempted action.

- data: `object` = `{}` (Optional)  
  Data involved in the attempted action.

**Returns**  
`boolean`

Inherited from [BaseFolder.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#canusermodify)

---

### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- data: `object` = `{}` (Optional)  
  Additional data which overrides current document data at the time of creation.

- context: `DocumentConstructionContext & DocumentCloneOptions` = `{}` (Optional)  
  Additional context options passed to the create method.

**Returns**  
`Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>`

Inherited from [BaseFolder.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#clone)

---

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided input data.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type.

- data: `object[]` = `[]` (Optional)  
  An array of data objects used to create multiple documents.

- operation: `DatabaseCreateOperation` = `{}` (Optional)  
  Parameters of the database creation workflow.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

See also [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [BaseFolder.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#createembeddeddocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- operation: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` (Optional)  
  Parameters of the deletion operation.

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`

The deleted Document instance, or undefined if not deleted.

See also [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseFolder.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#delete)

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided string ids.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type.

- ids: `string[]`  
  An array of string ids for each Document to be deleted.

- operation: `DatabaseDeleteOperation` = `{}` (Optional)  
  Parameters of the database deletion workflow.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

See also [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [BaseFolder.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#deleteembeddeddocuments)

---

### exportDialog

```typescript
exportDialog(
    pack: null | string,
    options?: { keepFolders?: boolean; keepId?: boolean; merge?: boolean },
): Promise<void>
```

Provide a dialog form that allows for exporting the contents of a Folder into an eligible Compendium pack.

**Parameters**

- pack: `null | string`  
  A pack ID to set as the default choice in the select input.

- options: `{ keepFolders?: boolean; keepId?: boolean; merge?: boolean }` = `{}` (Optional)  
  Additional options which customize how content is exported.

  - keepFolders?: `boolean` (Optional)  
    Retain the existing Folder structure.

  - keepId?: `boolean` (Optional)  
    Retain the original _id attribute when updating a document.

  - merge?: `boolean` (Optional)  
    Update existing entries in the Compendium pack, matching by name.

**Returns**  
`Promise<void>`

---

### exportToCompendium

```typescript
exportToCompendium(
    pack: CompendiumCollection,
    options?: {
        folder?: string;
        keepFolders?: boolean;
        keepId?: boolean;
        updateByName?: boolean;
    },
): Promise<CompendiumCollection>
```

Export all Documents contained in this Folder to a given Compendium pack. Optionally update existing Documents within the Pack by name, otherwise append all new entries.

**Parameters**

- pack: `CompendiumCollection`  
  A Compendium pack to which the documents will be exported.

- options: (Optional)  
  - folder?: `string`  
    A target folder id to which the documents will be exported.

  - keepFolders?: `boolean`  
    Retain the existing Folder structure.

  - keepId?: `boolean`  
    Retain the original _id attribute when updating a document.

  - updateByName?: `boolean`  
    Update existing entries in the Compendium pack, matching by name.

**Returns**  
`Promise<CompendiumCollection>`

See also [ClientDocumentMixin#toCompendium](https://foundryvtt.com/api/modules/foundry.documents.html#ClientDocumentMixin-toCompendium)

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded Document name.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type.

**Returns**  
`DocumentCollection`

Inherited from [BaseFolder.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#getembeddedcollection)

---

### getEmbeddedDocument

```typescript
getEmbeddedDocument(
    embeddedName: string,
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an embedded document by its id from a named collection in the parent document.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type.

- id: `string`  
  The id of the child document to retrieve.

- options: `{ invalid?: boolean; strict?: boolean }` = `{}` (Optional)  
  Additional options which modify how embedded documents are retrieved.

  - invalid?: `boolean` (Optional)  
    Allow retrieving an invalid Embedded Document.

  - strict?: `boolean` (Optional)  
    Throw an Error if the requested id does not exist. See Collection#get.

**Returns**  
`Document<object, DocumentConstructionContext>`

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

Inherited from [BaseFolder.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#getembeddeddocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the setFlag method for more details on flags.

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key.

- key: `string`  
  The flag key.

**Returns**  
`any`

Inherited from [BaseFolder.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#getflag)

---

### getParentFolders

```typescript
getParentFolders(): documents.Folder[]
```

Get the Folder documents which are parent folders of the current folder or any of its parents.

**Returns**  
`documents.Folder[]`

An array of Folder documents which are parent folders of this one.

---

### getSubfolders

```typescript
getSubfolders(recursive?: boolean): documents.Folder[]
```

Get the Folder documents which are sub-folders of the current folder, either direct children or recursively.

**Parameters**

- recursive: `boolean` = `false` (Optional)  
  Identify child folders recursively, if false only direct children are returned.

**Returns**  
`documents.Folder[]`

An array of Folder documents which are subfolders of this one.

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- user: `BaseUser` (Optional)  
  The User being tested.

**Returns**  
`DocumentOwnershipNumber`

Inherited from [BaseFolder.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#getuserlevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
`object`

Inherited from [BaseFolder.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#migratesystemdata)

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

Inherited from [BaseFolder.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#reset)

---

### setFlag

```typescript
setFlag(
    scope: string,
    key: string,
    value: any,
): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to store flexible or arbitrary data required by the core software, game systems, or user-created modules.

Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.

Flags set by the core software use the "core" scope. Flags set by game systems or modules should use the canonical name attribute for the module. Flags set by an individual world should use "world" as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key.

- key: `string`  
  The flag key.

- value: `any`  
  The flag value.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`

Inherited from [BaseFolder.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#setflag)

---

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document.

**Parameters**

- user: `BaseUser`  
  The User being tested.

- permission: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test.

- options: `{ exact?: boolean }` = `{}` (Optional)  
  Additional options involved in the permission test.

  - exact?: `boolean` (Optional)  
    Require the exact permission level requested?

**Returns**  
`boolean`

Inherited from [BaseFolder.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#testuserpermission)

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object`

Inherited from [BaseFolder.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- source: `boolean` = `true` (Optional)  
  Draw values from the underlying data source rather than transformed values.

**Returns**  
`any`

Inherited from [BaseFolder.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#toobject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- _parentPath: `string` (Optional)  
  A parent field path already traversed.

**Returns**  
`Generator<any, void, any>`

Yields

Inherited from [BaseFolder.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#traverseembeddeddocuments)

---

### unsetFlag

```typescript
unsetFlag(
    scope: string,
    key: string,
): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document.

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key.

- key: `string`  
  The flag key.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`

Inherited from [BaseFolder.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#unsetflag)

---

### update

```typescript
update(
    data?: object,
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Update this Document using incremental data, saving it to the database.

**Parameters**

- data: `object` = `{}` (Optional)  
  Differential update data which modifies the existing values of this document.

- operation: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` (Optional)  
  Parameters of the update operation.

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`

The updated Document instance, or undefined if not updated.

See also [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseFolder.update](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#update)

---

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: DatabaseUpdateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided differential data.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type.

- updates: `object[]` = `[]` (Optional)  
  An array of differential data objects, each used to update a single Document.

- operation: `DatabaseUpdateOperation` = `{}` (Optional)  
  Parameters of the database update workflow.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

See also [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

Inherited from [BaseFolder.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#updateembeddeddocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- changes: `object` = `{}` (Optional)  
  New values which should be applied to the data model.

- options: `DataModelUpdateOptions` = `{}` (Optional)  
  Options which determine how the new data is merged.

**Returns**  
`object`

**Throws**  
An error if the requested data model changes were invalid.

Inherited from [BaseFolder.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#updatesource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- options: `DataModelValidationOptions` = `{}` (Optional)  
  Options which modify how the model is validated.

**Returns**  
`boolean`

Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [BaseFolder.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#validate)

---

### _initialize (Protected)

```typescript
_initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- options: `object` = `{}` (Optional)  
  Options provided to the model constructor.

**Returns**  
`void`

Inherited from [BaseFolder._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_initialize)

---

### _initializeSource (Protected)

```typescript
_initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial cleaning operations are applied to the source data.

**Parameters**

- data: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed.

- options: `object` = `{}` (Optional)  
  Options provided to the model constructor.

**Returns**  
`object`

Migrated and cleaned source data which will be stored to the model instance, which is the same object as the `data` argument.

Inherited from [BaseFolder._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_initializesource)

---

### _onCreate (Protected)

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- data: `object`  
  The initial data object provided to the document creation request.

- options: `object`  
  Additional options which modify the creation request.

- userId: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseFolder._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_oncreate)

---

### _onDelete (Protected)

```typescript
_onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- options: `object`  
  Additional options which modify the deletion request.

- userId: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseFolder._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_ondelete)

---

### _onUpdate (Protected)

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- changed: `object`  
  The differential data that was changed relative to the documents prior values.

- options: `object`  
  Additional options which modify the update request.

- userId: `string`  
  The id of the User requesting the document update.

**Returns**  
`void`

Inherited from [BaseFolder._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_onupdate)

---

### _preDelete (Protected)

```typescript
_preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- options: `object`  
  Additional options which modify the deletion request.

- user: `BaseUser`  
  The User requesting the document deletion.

**Returns**  
`Promise<boolean | void>`

A return value of false indicates the deletion operation should be cancelled.

Inherited from [BaseFolder._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_predelete)

---

### _preUpdate (Protected)

```typescript
_preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- changes: `object`  
  The candidate changes to the Document.

- options: `object`  
  Additional options which modify the update request.

- user: `BaseUser`  
  The User requesting the document update.

**Returns**  
`Promise<boolean | void>`

A return value of false indicates the update operation should be cancelled.

Inherited from [BaseFolder._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_preupdate)

---

### _initializationOrder (Static)

```typescript
_initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from [BaseFolder._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_initializationorder)

---

### canUserCreate (Static)

```typescript
canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in general. This does not guarantee that the User is able to create all Documents of this type, as certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with the option to create Documents of this type in the UI.

**Parameters**

- user: `BaseUser`  
  The User being tested.

**Returns**  
`boolean`

Inherited from [BaseFolder.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#canusercreate)

---

### cleanData (Static)

```typescript
cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- source: `object` = `{}` (Optional)  
  The source data object.

- options: `object` = `{}` (Optional)  
  Additional options which are passed to field cleaning methods.

**Returns**  
`object`

The cleaned source data, which is the same object as the `source` argument.

Inherited from [BaseFolder.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#cleandata)

---

### create (Static)

```typescript
create(
    data?:
        | object
        | Document<object, DocumentConstructionContext>
        | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<
    | undefined
    | Document<object, DocumentConstructionContext>
    | Document<object, DocumentConstructionContext>[]
>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- data: (Optional)  
  Initial data used to create this Document, or a Document instance to persist.  
  Can be a single object, a Document instance, or an array of objects or Document instances.

- operation: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` (Optional)  
  Parameters of the creation operation.

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>`

The created Document instance(s).

See also [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Example: Create a World-level Item**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);
```

**Example: Create an Actor-owned Item**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const actor = game.actors.getName("My Hero");
const created = await Item.implementation.create(data, {parent: actor});
```

**Example: Create an Item in a Compendium pack**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseFolder.create](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#create)

---

### createDialog (Static)

```typescript
createDialog(data?: {}, createOptions?: {}, dialogOptions?: {}): Promise<any>
```

**Parameters**

- data: `{}` = `{}`  
- createOptions: `{}` = `{}`  
- dialogOptions: `{}` = `{}`

**Returns**  
`Promise<any>`

---

### createDocuments (Static)

```typescript
createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- data: `(object | Document<object, DocumentConstructionContext>)[]` = `[]`  
  An array of data objects or existing Documents to persist.

- operation: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}` (Optional)  
  Parameters of the requested creation operation.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

**Examples:**

Create a single Document:

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);
```

Create multiple Documents:

```typescript
const data = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const created = await Actor.implementation.createDocuments(data);
```

Create multiple embedded Documents within a parent:

```typescript
const actor = game.actors.getName("Tim");
const data = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const created = await Item.implementation.createDocuments(data, {parent: actor});
```

Create a Document within a Compendium pack:

```typescript
const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data, {pack: "mymodule.mypack"});
```

Inherited from [BaseFolder.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#createdocuments)

---

### defineSchema (Static)

```typescript
defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    color: ColorField;
    description: HTMLField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    name: StringField;
    sort: IntegerSortField;
    sorting: StringField;
    type: DocumentTypeField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**

```typescript
{
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    color: ColorField;
    description: HTMLField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    name: StringField;
    sort: IntegerSortField;
    sorting: StringField;
    type: DocumentTypeField;
}
```

Inherited from [BaseFolder.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#defineschema)

---

### deleteDocuments (Static)

```typescript
deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- ids: `string[]` = `[]`  
  An array of string ids for the documents to be deleted.

- operation: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}` (Optional)  
  Parameters of the database deletion operation.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

**Examples:**

Delete a single Document:

```typescript
const tim = game.actors.getName("Tim");
const deleted = await Actor.implementation.deleteDocuments([tim.id]);
```

Delete multiple Documents:

```typescript
const tim = game.actors.getName("Tim");
const tom = game.actors.getName("Tom");
const deleted = await Actor.implementation.deleteDocuments([tim.id, tom.id]);
```

Delete multiple embedded Documents within a parent:

```typescript
const tim = game.actors.getName("Tim");
const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deleted = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});
```

Delete Documents within a Compendium pack:

```typescript
const actor = await pack.getDocument(documentId);
const deleted = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

Inherited from [BaseFolder.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#deletedocuments)

---

### fromJSON (Static)

```typescript
fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- json: `string`  
  Serialized document data in string format.

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [BaseFolder.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#fromjson)

---

### fromSource (Static)

```typescript
fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be trustworthy and is not strictly validated.

**Parameters**

- source: `object`  
  Initial document data which comes from a trusted source.

- context: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = `{}` (Optional)  
  Model construction context.

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [BaseFolder.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#fromsource)

---

### get (Static)

```typescript
get(
    documentId: any,
    options?: {},
): null | Document<object, DocumentConstructionContext>
```

**Parameters**

- documentId: `any`  
- options: `{}` = `{}` (Optional)

**Returns**  
`null | Document<object, DocumentConstructionContext>`

Inherited from [BaseFolder.get](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#get)

---

### getCollectionName (Static)

```typescript
getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within this Document.

**Parameters**

- name: `string`  
  An existing collection name or a document name.

**Returns**  
`null | string`

The provided collection name if it exists, the first available collection for the document name provided, or null if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [BaseFolder.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#getcollectionname)

---

### migrateData (Static)

```typescript
migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- source: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
`object`

Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseFolder.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#migratedata)

---

### migrateDataSafe (Static)

```typescript
migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- source: `object`  
  The candidate source data from which the model will be constructed.

**Returns**  
`object`

Migrated source data, which is the same object as the `source` argument.

Inherited from [BaseFolder.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#migratedatasafe)

---

### shimData (Static)

```typescript
shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- data: `object`  
  Data which matches the current schema.

- options: `{ embedded?: boolean }` = `{}` (Optional)  
  Additional shimming options.

  - embedded?: `boolean` (Optional)  
    Apply shims to embedded models?

**Returns**  
`object`

Data with added backwards-compatible properties, which is the same object as the `data` argument.

Inherited from [BaseFolder.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#shimdata)

---

### updateDocuments (Static)

```typescript
updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- updates: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document.

- operation: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}` (Optional)  
  Parameters of the database update operation.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

**Examples**

Update a single Document:

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);
```

Update multiple Documents:

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updated = await Actor.implementation.updateDocuments(updates);
```

Update multiple embedded Documents within a parent:

```typescript
const actor = game.actors.getName("Timothy");
const updates = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updated = await Item.implementation.updateDocuments(updates, {parent: actor});
```

Update Documents within a Compendium pack:

```typescript
const actor = await pack.getDocument(documentId);
const updated = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
```

Inherited from [BaseFolder.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#updatedocuments)

---

### validateJoint (Static)

```typescript
validateJoint(data: any): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the model. Field-specific validation rules should be defined as part of the DataSchema for the model. This method allows for testing aggregate rules which impose requirements on the overall model.

**Parameters**

- data: `any`  
  Candidate data for the model.

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected.

Inherited from [BaseFolder.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#validatejoint)

---

### _onCreateOperation (Static, Protected)

```typescript
_onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual [_onCreate](#_oncreate) workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were created.

- operation: `DatabaseCreateOperation`  
  Parameters of the database creation operation.

- user: `BaseUser`  
  The User who performed the creation operation.

**Returns**  
`Promise<void>`

Inherited from [BaseFolder._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_oncreateoperation)

---

### _onDeleteOperation (Static, Protected)

```typescript
_onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual [_onDelete](#_ondelete) workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were deleted.

- operation: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation.

- user: `BaseUser`  
  The User who performed the deletion operation.

**Returns**  
`Promise<void>`

Inherited from [BaseFolder._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_ondeleteoperation)

---

### _onUpdateOperation (Static, Protected)

```typescript
_onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-operation events occur for all connected clients.

This batch-wise workflow occurs after individual [_onUpdate](#_onupdate) workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were updated.

- operation: `DatabaseUpdateOperation`  
  Parameters of the database update operation.

- user: `BaseUser`  
  The User who performed the update operation.

**Returns**  
`Promise<void>`

Inherited from [BaseFolder._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_onupdateoperation)

---

### _preCreateOperation (Static, Protected)

```typescript
_preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual [_preCreate](#_precreate) workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [updateSource](#updatesource).

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Pending document instances to be created.

- operation: `DatabaseCreateOperation`  
  Parameters of the database creation operation.

- user: `BaseUser`  
  The User requesting the creation operation.

**Returns**  
`Promise<boolean | void>`

Return false to cancel the creation operation entirely.

Inherited from [BaseFolder._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_precreateoperation)

---

### _preDeleteOperation (Static, Protected)

```typescript
_preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual [_preDelete](#_predelete) workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or using [updateSource](#updatesource).

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be deleted.

- operation: `DatabaseDeleteOperation`  
  Parameters of the database update operation.

- user: `BaseUser`  
  The User requesting the deletion operation.

**Returns**  
`Promise<boolean | void>`

Return false to cancel the deletion operation entirely.

Inherited from [BaseFolder._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_predeleteoperation)

---

### _preUpdateOperation (Static, Protected)

```typescript
_preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual [_preUpdate](#_preupdate) workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the operation.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be updated.

- operation: `DatabaseUpdateOperation`  
  Parameters of the database update operation.

- user: `BaseUser`  
  The User requesting the update operation.

**Returns**  
`Promise<boolean | void>`

Return false to cancel the update operation entirely.

Inherited from [BaseFolder._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseFolder.html#_preupdateoperation)