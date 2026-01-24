# JournalEntryPage | Foundry Virtual Tabletop - API Documentation - Version 13

The client-side **JournalEntryPage** document which extends the common **BaseJournalEntryPage** document model.

**Mixes**  
ClientDocumentMixin

**See**  
[foundry.documents.JournalEntry](https://foundryvtt.com/api/classes/foundry.documents.JournalEntry.html): The JournalEntry document type which contains JournalEntryPage embedded documents.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.JournalEntryPage), Expand)  
_BaseJournalEntryPage_<this>  
**JournalEntryPage**

---

## Constructors

```typescript
new JournalEntryPage(
    data?: Partial<JournalEntryPageData>,
    options?: DocumentConstructionContext,
): documents.JournalEntryPage
```

**Parameters**

- **data?**: `Partial<JournalEntryPageData>` = {}  
  Initial data used to construct the data object. The provided object will be owned by the constructed model instance and may be mutated.

- **options?**: `DocumentConstructionContext` = {}  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.JournalEntryPage`

*Inherited from [BaseJournalEntryPage.constructor](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#constructor)*

---

## Properties

### _source

```typescript
_source: JournalEntryPageData
```

The source data object for this DataModel instance. Once constructed, the source object is sealed such that no keys may be added nor removed.

*Inherited from [BaseJournalEntryPage._source](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_source)*

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

*Inherited from [BaseJournalEntryPage.parent](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#parent)*

### _toc

```typescript
protected _toc: Record<string, JournalEntryPageHeading>
```

The cached table of contents for this JournalEntryPage.

### LOCALIZATION_PREFIXES

```typescript
static LOCALIZATION_PREFIXES: string[] = ...
```

*Inherited from [BaseJournalEntryPage.LOCALIZATION_PREFIXES](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#localization_prefixes)*

### metadata

```typescript
static metadata: object = ...
```

Default metadata which applies to each instance of this Document type.

*Inherited from [BaseJournalEntryPage.metadata](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#metadata)*

---

## Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).id*

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).inCompendium*

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved failure.

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).invalid*

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).isEmbedded*

### permission

```typescript
get permission(): DocumentOwnershipNumber
```

**Returns**  
`DocumentOwnershipNumber`

### sceneNote

```typescript
get sceneNote(): null | canvas.placeables.Note
```

Return a reference to the Note instance for this Journal Entry Page in the current Scene, if any. If multiple notes are placed for this Journal Entry, only the first will be returned.

**Returns**  
`null | canvas.placeables.Note`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).schema*

### toc

```typescript
get toc(): Record<string, JournalEntryPageHeading>
```

The table of contents for this JournalEntryPage.

**Returns**  
`Record<string, JournalEntryPageHeading>`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).uuid*

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

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).validationFailures*

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).baseDocument*

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).collectionName*

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).database*

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).documentName*

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).hasTypeData*

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).hierarchy*

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).implementation*

### schema

```typescript
static get schema(): SchemaField
```

Ensure that all Document classes share the same schema of their base declaration.

**Returns**  
`SchemaField`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).schema*

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

*Inherited from ClientDocumentMixin(BaseJournalEntryPage).TYPES*

---

## Methods

### _buildEmbedHTML

```typescript
_buildEmbedHTML(config: any, options?: {}): Promise<any>
```

**Parameters**

- **config**: `any`
- **options?**: `{}` = {}

**Returns**  
`Promise<any>`

*Inherited from BaseJournalEntryPage.*

---

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- **__namedParameters?**: `{ pack?: null; parentCollection?: null }` = {}

**Returns**  
`void`

*Inherited from [BaseJournalEntryPage._configure](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_configure)*

---

### _createDocumentLink

```typescript
_createDocumentLink(eventData: any, __namedParameters?: {}): any
```

**Parameters**

- **eventData**: `any`
- **__namedParameters?**: `{}` = {}

**Returns**  
`any`

*Inherited from BaseJournalEntryPage.*

---

### _createFigureEmbed

```typescript
_createFigureEmbed(content: any, config: any, options: any): Promise<any>
```

**Parameters**

- **content**: `any`
- **config**: `any`
- **options**: `any`

**Returns**  
`Promise<any>`

*Inherited from BaseJournalEntryPage.*

---

### _onClickDocumentLink

```typescript
_onClickDocumentLink(event: any): any
```

**Parameters**

- **event**: `any`

**Returns**  
`any`

*Inherited from BaseJournalEntryPage.*

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Post-process an update operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **changed**: `any`  
  The differential data that was changed relative to the documents prior values

- **options**: `any`  
  Additional options which modify the update request

- **userId**: `any`  
  The id of the User requesting the document update

**Returns**  
`void`

Overrides [BaseJournalEntryPage._onUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_onupdate)

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

- **data?**: `object` = {}  
  Data involved in the attempted action

**Returns**  
`boolean` - Does the User have permission?

*Inherited from [BaseJournalEntryPage.canUserModify](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#canusermodify)*

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

- **data?**: `object` = {}  
  Additional data which overrides current document data at the time of creation

- **context?**: `DocumentConstructionContext & DocumentCloneOptions` = {}  
  Additional context options passed to the create method

**Returns**  
`Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>`

*Inherited from [BaseJournalEntryPage.clone](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#clone)*

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

- **embeddedName**: `string`  
  The name of the embedded Document type

- **data?**: `object[]` = []  
  An array of data objects used to create multiple documents

- **operation?**: `DatabaseCreateOperation` = {}  
  Parameters of the database creation workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of created Document instances

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

*Inherited from [BaseJournalEntryPage.createEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#createembeddeddocuments)*

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = {}  
  Parameters of the deletion operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The deleted Document instance, or undefined if not deleted

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [BaseJournalEntryPage.delete](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#delete)*

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

- **embeddedName**: `string`  
  The name of the embedded Document type

- **ids**: `string[]`  
  An array of string ids for each Document to be deleted

- **operation?**: `DatabaseDeleteOperation` = {}  
  Parameters of the database deletion workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of deleted Document instances

**See**  
[Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

*Inherited from [BaseJournalEntryPage.deleteEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#deleteembeddeddocuments)*

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

*Inherited from [BaseJournalEntryPage.getEmbeddedCollection](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#getembeddedcollection)*

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

- **embeddedName**: `string`  
  The name of the embedded Document type

- **id**: `string`  
  The id of the child document to retrieve

- **options?**: `{ invalid?: boolean; strict?: boolean }` = {}  
  Additional options which modify how embedded documents are retrieved

**Returns**  
`Document<object, DocumentConstructionContext>`  
The retrieved embedded Document instance, or undefined

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document could not be found.

*Inherited from [BaseJournalEntryPage.getEmbeddedDocument](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#getembeddeddocument)*

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
`any` - The flag value

*Inherited from [BaseJournalEntryPage.getFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#getflag)*

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in CONST.DOCUMENT_OWNERSHIP_LEVELS. Compendium content ignores the ownership field in favor of User role-based ownership. Otherwise, Documents use granular per-User ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should be used.

**Parameters**

- **user?**: `BaseUser`  
  The User being tested

**Returns**  
`DocumentOwnershipNumber` - A numeric permission level from [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html)

*Inherited from [BaseJournalEntryPage.getUserLevel](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#getuserlevel)*

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform to its latest data model. The data model is defined by the template.json specification included by the game system.

**Returns**  
`object` - The migrated system data object

*Inherited from [BaseJournalEntryPage.migrateSystemData](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#migratesystemdata)*

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any changes.

**Returns**  
`void`

*Inherited from [BaseJournalEntryPage.reset](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#reset)*

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

*Inherited from [BaseJournalEntryPage.setFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#setflag)*

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

- **user**: `BaseUser`  
  The User being tested

- **permission**: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- **options?**: `{ exact?: boolean }` = {}  
  Additional options involved in the permission test

  - **exact?**: `boolean`  
    Require the exact permission level requested?

**Returns**  
`boolean` - Does the user have this permission level over the Document?

*Inherited from [BaseJournalEntryPage.testUserPermission](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#testuserpermission)*

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object` - The document source data expressed as a plain object

*Inherited from [BaseJournalEntryPage.toJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#tojson)*

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.

**Parameters**

- **source**: `boolean` = true  
  Draw values from the underlying data source rather than transformed values

**Returns**  
`any` - The extracted primitive object

*Inherited from [BaseJournalEntryPage.toObject](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#toobject)*

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- **_parentPath?**: `string`  
  A parent field path already traversed

**Returns**  
`Generator<any, void, any>`  
Yields embedded Documents

*Inherited from [BaseJournalEntryPage.traverseEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#traverseembeddeddocuments)*

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

*Inherited from [BaseJournalEntryPage.unsetFlag](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#unsetflag)*

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

- **data?**: `object` = {}  
  Differential update data which modifies the existing values of this document

- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = {}  
  Parameters of the update operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`  
The updated Document instance, or undefined if not updated

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [BaseJournalEntryPage.update](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#update)*

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

- **embeddedName**: `string`  
  The name of the embedded Document type

- **updates?**: `object[]` = []  
  An array of differential data objects, each used to update a single Document

- **operation?**: `DatabaseUpdateOperation` = {}  
  Parameters of the database update workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated Document instances

**See**  
[Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updatedocuments)

*Inherited from [BaseJournalEntryPage.updateEmbeddedDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#updateembeddeddocuments)*

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The provided changes are expanded, cleaned, validated, and stored to the source data object for this model. The provided changes argument is mutated in this process. The source data is then re-initialized to apply those changes to the prepared data. The method returns an object of differential changes which modified the original data.

**Parameters**

- **changes?**: `object` = {}  
  New values which should be applied to the data model

- **options?**: `DataModelUpdateOptions` = {}  
  Options which determine how the new data is merged

**Returns**  
`object` - An object containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

*Inherited from [BaseJournalEntryPage.updateSource](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#updatesource)*

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are provided, missing types are added to it before cleaning and validation. This mutates the provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- **options?**: `DataModelValidationOptions` = {}  
  Options which modify how the model is validated

**Returns**  
`boolean` - Whether the data source or proposed change is reported as valid. A boolean is always returned if validation is non-strict.

**Throws**  
An error thrown if validation is strict and a failure occurs.

*Inherited from [BaseJournalEntryPage.validate](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#validate)*

---

### _embedImagePage

```typescript
protected _embedImagePage(
    config: DocumentHTMLEmbedConfig,
    options?: any,
): Promise<null | HTMLElement | HTMLCollection>
```

Embed image page content.

**Parameters**

- **config**: `DocumentHTMLEmbedConfig`  
  Configuration for embedding behavior.

- **alt**: Alt text for the image, otherwise the caption will be used.

- **options?**: `any` = {}  
  The original enrichment options for cases where the Document embed content also contains text that must be enriched.

**Returns**  
`Promise<null | HTMLElement | HTMLCollection>`

**Example: Create an embedded image from a sibling journal entry page**

```
@Embed[.QnH8yGIHy4pmFBHR classes="small right"]{Special caption}
```
becomes

```html
<figure class="content-embed small right" data-content-embed
        data-uuid="JournalEntry.xFNPjbSEDbWjILNj.JournalEntryPage.QnH8yGIHy4pmFBHR">
  <img src="path/to/image.webp" alt="Special caption">
  <figcaption>
    <strong class="embed-caption">Special caption</strong>
    <cite>
      <a class="content-link" draggable="true" data-link
         data-uuid="JournalEntry.xFNPjbSEDbWjILNj.JournalEntryPage.QnH8yGIHy4pmFBHR"
         data-id="QnH8yGIHy4pmFBHR" data-type="JournalEntryPage" data-tooltip="Image Page">
        <i class="fa-solid fa-file-image"></i> Image Page
      </a>
    </cite>
  </figcaption>
</figure>
```

---

### _embedTextPage

```typescript
protected _embedTextPage(
    config: any,
    options?: any,
): Promise<null | HTMLElement | HTMLCollection>
```

Embed text page content.

**Parameters**

- **config**: `any`  
  Configuration for embedding behavior. This can include enrichment options to override those passed as part of the root enrichment process.

- **options?**: `any` = {}  
  The original enrichment options to propagate to the embedded text page's enrichment.

**Returns**  
`Promise<null | HTMLElement | HTMLCollection>`

**Example: Embed the content of the Journal Entry Page as a figure**

```
@Embed[.yDbDF1ThSfeinh3Y classes="small right"]{Special caption}
```
becomes

```html
<figure class="content-embed small right" data-content-embed
        data-uuid="JournalEntry.ekAeXsvXvNL8rKFZ.JournalEntryPage.yDbDF1ThSfeinh3Y">
  <p>The contents of the page</p>
  <figcaption>
    <strong class="embed-caption">Special caption</strong>
    <cite>
      <a class="content-link" draggable="true" data-link
         data-uuid="JournalEntry.ekAeXsvXvNL8rKFZ.JournalEntryPage.yDbDF1ThSfeinh3Y"
         data-id="yDbDF1ThSfeinh3Y" data-type="JournalEntryPage" data-tooltip="Text Page">
        <i class="fa-solid fa-file-lines"></i> Text Page
      </a>
    </cite>
  <figcaption>
</figure>
```

**Example: Embed the content of the Journal Entry Page into the main content flow**

```
@Embed[.yDbDF1ThSfeinh3Y inline]
```
becomes

```html
<section class="content-embed" data-content-embed
         data-uuid="JournalEntry.ekAeXsvXvNL8rKFZ.JournalEntryPage.yDbDF1ThSfeinh3Y">
  <p>The contents of the page</p>
</section>
```

---

### _initialize

```typescript
protected _initialize(options?: object): void
```

Initialize the instance by copying data from the source object to instance attributes. This mirrors the workflow of `SchemaField#initialize` but with some added functionality.

**Parameters**

- **options?**: `object` = {}  
  Options provided to the model constructor

**Returns**  
`void`

*Inherited from [BaseJournalEntryPage._initialize](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_initialize)*

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

- **data**: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- **options?**: `object` = {}  
  Options provided to the model constructor

**Returns**  
`object` - Migrated and cleaned source data which will be stored to the model instance, which is the same object as the data argument

*Inherited from [BaseJournalEntryPage._initializeSource](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_initializesource)*

---

### _onCreate

```typescript
protected _onCreate(data: object, options: object, userId: string): void
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

*Inherited from [BaseJournalEntryPage._onCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_oncreate)*

---

### _onDelete

```typescript
protected _onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected clients.

**Parameters**

- **options**: `object`  
  Additional options which modify the deletion request

- **userId**: `string`  
  The id of the User requesting the document update

**Returns**  
`void`

*Inherited from [BaseJournalEntryPage._onDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_ondelete)*

---

### _preCreate

```typescript
protected _preCreate(
    data: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [`updateSource`](https://foundryvtt.com/api/classes/foundry.documents.JournalEntryPage.html#updateSource).

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

*Inherited from [BaseJournalEntryPage._preCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_precreate)*

---

### _preDelete

```typescript
protected _preDelete(options: object, user: BaseUser): Promise<boolean | void>
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

*Inherited from [BaseJournalEntryPage._preDelete](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_predelete)*

---

### _preUpdate

```typescript
protected _preUpdate(
    changes: object,
    options: object,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client which requested the operation.

**Parameters**

- **changes**: `object`  
  The candidate changes to the Document

- **options**: `object`  
  Additional options which modify the update request

- **user**: `BaseUser`  
  The User requesting the document update

**Returns**  
`Promise<boolean | void>`  
A return value of false indicates the update operation should be cancelled.

*Inherited from [BaseJournalEntryPage._preUpdate](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_preupdate)*

---

### _initializationOrder

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

*Inherited from [BaseJournalEntryPage._initializationOrder](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_initializationorder)*

---

### buildTOC

```typescript
static buildTOC(
    html: HTMLElement | HTMLElement[],
    options?: { includeElement?: boolean },
): Record<string, JournalEntryPageHeading>
```

Build a table of contents for the given HTML content.

**Parameters**

- **html**: `HTMLElement | HTMLElement[]`  
  The HTML content to generate a ToC outline for.

- **options?**: `{ includeElement?: boolean }` = {}  
  Additional options to configure ToC generation.

  - **includeElement?**: `boolean`  
    Include references to the heading DOM elements in the returned ToC.

**Returns**  
`Record<string, JournalEntryPageHeading>`

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
`boolean` - Does the User have a sufficient role to create?

*Inherited from [BaseJournalEntryPage.canUserCreate](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#canusercreate)*

---

### cleanData

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- **source?**: `object` = {}  
  The source data object

- **options?**: `object` = {}  
  Additional options which are passed to field cleaning methods

**Returns**  
`object` - The cleaned source data, which is the same object as the source argument

*Inherited from [BaseJournalEntryPage.cleanData](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#cleandata)*

---

### create

```typescript
static create(
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

- **data?**: `object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[]`  
  Initial data used to create this Document, or a Document instance to persist.

- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>` = {}  
  Parameters of the creation operation

**Returns**  
A Promise resolving to the created Document instance(s) or undefined.

**See**  
[Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

**Examples:**

```typescript
const data = [{name: "Special Sword", type: "weapon"}];
const created = await Item.implementation.create(data);

const actor = game.actors.getName("My Hero");
const createdOwned = await Item.implementation.create(data, {parent: actor});

const createdInPack = await Item.implementation.create(data, {pack: "mymodule.mypack"});
```

*Inherited from [BaseJournalEntryPage.create](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#create)*

---

### createDocuments

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects where each individual object becomes one new Document.

**Parameters**

- **data?**: `(object | Document<object, DocumentConstructionContext>)[]` = []  
  An array of data objects or existing Documents to persist.

- **operation?**: `Partial<Omit<DatabaseCreateOperation, "data">>` = {}  
  Parameters of the requested creation operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of created Document instances

**Examples:**

```typescript
const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
const created = await Actor.implementation.createDocuments(data);

const dataMultiple = [{name: "Tim", type: "npc"}, {name: "Tom", type: "npc"}];
const createdMultiple = await Actor.implementation.createDocuments(dataMultiple);

const actor = game.actors.getName("Tim");
const items = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
const createdItems = await Item.implementation.createDocuments(items, {parent: actor});

const packData = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
const createdFromPack = await Actor.implementation.createDocuments(packData, {pack: "mymodule.mypack"});
```

*Inherited from [BaseJournalEntryPage.createDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#createdocuments)*

---

### defineSchema

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    category: DocumentIdField;
    flags: DocumentFlagsField;
    image: SchemaField;
    name: StringField;
    ownership: DocumentOwnershipField;
    sort: IntegerSortField;
    src: StringField;
    system: TypeDataField;
    text: SchemaField;
    title: SchemaField;
    type: DocumentTypeField;
    video: SchemaField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it is accessed and cached for future reuse.

**Returns**  
An object describing the schema fields.

*Inherited from [BaseJournalEntryPage.defineSchema](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#defineschema)*

---

### deleteDocuments

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided as an array of string ids for the documents to delete.

**Parameters**

- **ids?**: `string[]` = []  
  An array of string ids for the documents to be deleted

- **operation?**: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = {}  
  Parameters of the database deletion operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of deleted Document instances

**Examples:**

```typescript
const tim = game.actors.getName("Tim");
const deletedSingle = await Actor.implementation.deleteDocuments([tim.id]);

const tom = game.actors.getName("Tom");
const deletedMultiple = await Actor.implementation.deleteDocuments([tim.id, tom.id]);

const sword = tim.items.getName("Sword");
const shield = tim.items.getName("Shield");
const deletedEmbedded = await Item.implementation.deleteDocuments([sword.id, shield.id], {parent: actor});

const actor = await pack.getDocument(documentId);
const deletedInPack = await Actor.implementation.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
```

*Inherited from [BaseJournalEntryPage.deleteDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#deletedocuments)*

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
`DataModel<object, DataModelConstructionContext>` - A constructed data model instance

*Inherited from [BaseJournalEntryPage.fromJSON](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#fromjson)*

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

- **context?**: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions` = {}  
  Model construction context

**Returns**  
`DataModel<object, DataModelConstructionContext>` - A constructed data model instance

*Inherited from [BaseJournalEntryPage.fromSource](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#fromsource)*

---

### get

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- **documentId**: `string`  
  The Document ID

- **operation?**: `DatabaseGetOperation` = {}  
  Parameters of the get operation

**Returns**  
`null | Document<object, DocumentConstructionContext>`  
The retrieved Document, or null

*Inherited from [BaseJournalEntryPage.get](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#get)*

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
Actor.implementation.getCollectionName("items"); 
// returns "items"

Actor.implementation.getCollectionName("Item"); 
// returns "items"
```

*Inherited from [BaseJournalEntryPage.getCollectionName](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#getcollectionname)*

---

### migrateData

```typescript
static migrateData(source: object): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or transformations.

**Parameters**

- **source**: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
`object` - Migrated source data, which is the same object as the source argument

*Inherited from [BaseJournalEntryPage.migrateData](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#migratedata)*

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
`object` - Migrated source data, which is the same object as the source argument

*Inherited from [BaseJournalEntryPage.migrateDataSafe](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#migratedatasafe)*

---

### shimData

```typescript
static shimData(data: object, options?: { embedded?: boolean }): object
```

Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to support older code which uses this data.

**Parameters**

- **data**: `object`  
  Data which matches the current schema

- **options?**: `{ embedded?: boolean }` = {}  
  Additional shimming options

  - **embedded?**: `boolean`  
    Apply shims to embedded models?

**Returns**  
`object` - Data with added backwards-compatible properties, which is the same object as the data argument

*Inherited from [BaseJournalEntryPage.shimData](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#shimdata)*

---

### slugifyHeading

```typescript
static slugifyHeading(heading: string | HTMLHeadingElement): string
```

Convert a heading into slug suitable for use as an identifier.

**Parameters**

- **heading**: `string | HTMLHeadingElement`  
  The heading element or some text content.

**Returns**  
`string`

---

### updateDocuments

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an array of objects where each individual object updates one existing Document.

**Parameters**

- **updates?**: `object[]` = []  
  An array of differential data objects, each used to update a single Document

- **operation?**: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = {}  
  Parameters of the database update operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated Document instances

**Examples:**

```typescript
const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
const updated = await Actor.implementation.updateDocuments(updates);

const updatesMultiple = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}];
const updatedMultiple = await Actor.implementation.updateDocuments(updatesMultiple);

const actor = game.actors.getName("Timothy");
const updatesEmbedded = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
const updatedEmbedded = await Item.implementation.updateDocuments(updatesEmbedded, {parent: actor});
```

**Example: Update Documents within a Compendium pack**

```typescript
const actor = await pack.getDocument(documentId);
const updatedInPack = await Actor.implementation.updateDocuments([{_id: actor.id, name: "New Name"}], 
  {pack: "mymodule.mypack"});
```

*Inherited from [BaseJournalEntryPage.updateDocuments](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#updatedocuments)*

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

*Inherited from [BaseJournalEntryPage.validateJoint](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#validatejoint)*

---

### _flattenTOC

```typescript
protected static _flattenTOC(nodes: JournalEntryPageHeading[]): Record<string, JournalEntryPageHeading>
```

Flatten the tree structure into a single object with each node's slug as the key.

**Parameters**

- **nodes**: `JournalEntryPageHeading[]`  
  The root ToC nodes.

**Returns**  
`Record<string, JournalEntryPageHeading>`

---

### _makeHeadingNode

```typescript
protected static _makeHeadingNode(
    heading: HTMLHeadingElement,
    options?: { includeElement?: boolean },
): JournalEntryPageHeading
```

Construct a table of contents node from a heading element.

**Parameters**

- **heading**: `HTMLHeadingElement`  
  The heading element.

- **options?**: `{ includeElement?: boolean }` = {}  
  Additional options to configure the returned node.

  - **includeElement?**: `boolean`  
    Whether to include the DOM element in the returned ToC node.

**Returns**  
`JournalEntryPageHeading`

---

### _onCreateOperation

```typescript
protected static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
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

*Inherited from [BaseJournalEntryPage._onCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_oncreateoperation)*

---

### _onDeleteOperation

```typescript
protected static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
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

*Inherited from [BaseJournalEntryPage._onDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_ondeleteoperation)*

---

### _onUpdateOperation

```typescript
protected static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
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

*Inherited from [BaseJournalEntryPage._onUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_onupdateoperation)*

---

### _preCreateOperation

```typescript
protected static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual document instances using [`updateSource`](https://foundryvtt.com/api/classes/foundry.documents.JournalEntryPage.html#updateSource).

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

*Inherited from [BaseJournalEntryPage._preCreateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_precreateoperation)*

---

### _preDeleteOperation

```typescript
protected static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object or using [`updateSource`](https://foundryvtt.com/api/classes/foundry.documents.JournalEntryPage.html#updateSource).

**Parameters**

- **documents**: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be deleted

- **operation**: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation

- **user**: `BaseUser`  
  The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the deletion operation entirely

*Inherited from [BaseJournalEntryPage._preDeleteOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_predeleteoperation)*

---

### _preUpdateOperation

```typescript
protected static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
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

*Inherited from [BaseJournalEntryPage._preUpdateOperation](https://foundryvtt.com/api/classes/foundry.documents.BaseJournalEntryPage.html#_preupdateoperation)*