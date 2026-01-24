# RollTable

The client-side `RollTable` document which extends the common `BaseRollTable` model.

---

## Mixes

- ClientDocumentMixin

---

## See Also

- [`foundry.documents.collections.RollTables`](https://foundryvtt.com/api/classes/foundry.documents.collections.RollTables.html): The world-level collection of RollTable documents
- [`foundry.documents.TableResult`](https://foundryvtt.com/api/classes/foundry.documents.TableResult.html): The embedded TableResult document
- [`foundry.applications.sheets.RollTableSheet`](https://foundryvtt.com/api/classes/foundry.applications.sheets.RollTableSheet.html): The RollTable sheet application

---

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.RollTable), Expand)

- [`BaseRollTable`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html)<this>
- **RollTable**

---

## Constructors

```typescript
new RollTable(
    data?: Partial<RollTableData>,
    options?: DocumentConstructionContext,
): documents.RollTable
```

**Parameters**

- **data?**: `Partial<RollTableData>` = `{}`  
  Initial data used to construct the data object. The provided object will be owned by the  
  constructed model instance and may be mutated.

- **options?**: `DocumentConstructionContext` = `{}`  
  Context and data validation options which affects initial model construction.

**Returns**  
`documents.RollTable`

Inherited from [`BaseRollTable.constructor`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#constructor)

---

## Properties

### _source

```typescript
_source: RollTableData
```

The source data object for this DataModel instance. Once constructed, the source object is  
sealed such that no keys may be added nor removed.

Inherited from [`BaseRollTable._source`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_source)

### parent

```typescript
parent: null | DataModel<object, DataModelConstructionContext>
```

An immutable reverse-reference to a parent DataModel to which this model belongs.

Inherited from [`BaseRollTable.parent`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#parent)

### DEFAULT_ICON

```typescript
DEFAULT_ICON: string = "icons/svg/d20-grey.svg"
```

The default icon used for newly created Macro documents

Inherited from [`BaseRollTable.DEFAULT_ICON`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#default_icon)

### LOCALIZATION_PREFIXES

```typescript
LOCALIZATION_PREFIXES: string[]
```

Inherited from [`BaseRollTable.LOCALIZATION_PREFIXES`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#localization_prefixes)

### metadata

```typescript
metadata: object
```

Default metadata which applies to each instance of this Document type.

Inherited from [`BaseRollTable.metadata`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#metadata)

---

## Accessors

### id

```typescript
get id(): null | string
```

The canonical identifier for this Document.

**Returns**  
`null | string`

Inherited from `ClientDocumentMixin(BaseRollTable).id`

### inCompendium

```typescript
get inCompendium(): boolean
```

Is this document in a compendium?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseRollTable).inCompendium`

### invalid

```typescript
get invalid(): boolean
```

Is the current state of this DataModel invalid? The model is invalid if there is any unresolved  
failure.

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseRollTable).invalid`

### isEmbedded

```typescript
get isEmbedded(): boolean
```

Is this document embedded within a parent document?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseRollTable).isEmbedded`

### schema

```typescript
get schema(): SchemaField
```

Define the data schema for this document instance.

**Returns**  
`SchemaField`

Inherited from `ClientDocumentMixin(BaseRollTable).schema`

### thumbnail

```typescript
get thumbnail(): string
```

Provide a thumbnail image path used to represent this document.

**Returns**  
`string`

### uuid

```typescript
get uuid(): string
```

A Universally Unique Identifier (uuid) for this Document instance.

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseRollTable).uuid`

### validationFailures

```typescript
get validationFailures(): {
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

An array of validation failure instances which may have occurred when this instance was last  
validated.

**Returns**

```typescript
{
    fields: null | DataModelValidationFailure;
    joint: null | DataModelValidationFailure;
}
```

Inherited from `ClientDocumentMixin(BaseRollTable).validationFailures`

### baseDocument

```typescript
static get baseDocument(): typeof Document
```

The base document definition that this document class extends from.

**Returns**  
`typeof Document`

Inherited from `ClientDocumentMixin(BaseRollTable).baseDocument`

### collectionName

```typescript
static get collectionName(): string
```

The named collection to which this Document belongs.

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseRollTable).collectionName`

### database

```typescript
static get database(): abstract.DatabaseBackend
```

The database backend used to execute operations and handle results.

**Returns**  
`abstract.DatabaseBackend`

Inherited from `ClientDocumentMixin(BaseRollTable).database`

### documentName

```typescript
static get documentName(): string
```

The canonical name of this Document type, for example "Actor".

**Returns**  
`string`

Inherited from `ClientDocumentMixin(BaseRollTable).documentName`

### hasTypeData

```typescript
static get hasTypeData(): boolean
```

Does this Document support additional subtypes?

**Returns**  
`boolean`

Inherited from `ClientDocumentMixin(BaseRollTable).hasTypeData`

### hierarchy

```typescript
static get hierarchy(): Readonly<Record<string, any>>
```

The Embedded Document hierarchy for this Document.

**Returns**  
`Readonly<Record<string, any>>`

Inherited from `ClientDocumentMixin(BaseRollTable).hierarchy`

### implementation

```typescript
static get implementation(): typeof Document
```

Return a reference to the configured subclass of this base Document type.

**Returns**  
`typeof Document`

Inherited from `ClientDocumentMixin(BaseRollTable).implementation`

### TYPES

```typescript
static get TYPES(): string[]
```

The allowed types which may exist for this Document class.

**Returns**  
`string[]`

Inherited from `ClientDocumentMixin(BaseRollTable).TYPES`

---

## Methods

### _configure

```typescript
_configure(__namedParameters?: { pack?: null; parentCollection?: null }): void
```

**Parameters**

- __namedParameters: `{ pack?: null; parentCollection?: null } = {}`

**Returns**  
`void`

Inherited from [`BaseRollTable._configure`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_configure)

---

### _createFigureEmbed

```typescript
_createFigureEmbed(content: any, config: any, options: any): Promise<any>
```

**Parameters**

- content: `any`
- config: `any`
- options: `any`

**Returns**  
`Promise<any>`

---

### _initialize

```typescript
_initialize(options: any): void
```

Initialize the instance by copying data from the source object to instance attributes. This  
mirrors the workflow of SchemaField#initialize but with some added functionality.

**Parameters**

- options: `any`  
  Options provided to the model constructor

**Returns**  
`void`

Inherited from [`BaseRollTable._initialize`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_initialize)

---

### _onCreateDescendantDocuments

```typescript
_onCreateDescendantDocuments(
    parent: any,
    collection: any,
    documents: any,
    data: any,
    options: any,
    userId: any,
): void
```

**Parameters**

- parent: `any`
- collection: `any`
- documents: `any`
- data: `any`
- options: `any`
- userId: `any`

**Returns**  
`void`

---

### _onDeleteDescendantDocuments

```typescript
_onDeleteDescendantDocuments(
    parent: any,
    collection: any,
    documents: any,
    ids: any,
    options: any,
    userId: any,
): void
```

**Parameters**

- parent: `any`
- collection: `any`
- documents: `any`
- ids: `any`
- options: `any`
- userId: `any`

**Returns**  
`void`

---

### canUserModify

```typescript
canUserModify(user: BaseUser, action: string, data?: object): boolean
```

Test whether a given User has permission to perform some action on this Document

**Parameters**

- user: `BaseUser`  
  The User attempting modification

- action: `string`  
  The attempted action

- data? : `object` = `{}`  
  Data involved in the attempted action

**Returns**  
`boolean`

Inherited from [`BaseRollTable.canUserModify`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#canUserModify)

---

### clone

```typescript
clone(
    data?: object,
    context?: DocumentConstructionContext & DocumentCloneOptions,
): Document<object, DocumentConstructionContext> | Promise<Document<object, DocumentConstructionContext>>
```

Clone a document, creating a new document by combining current data with provided  
overrides. The cloned document is ephemeral and not yet saved to the database.

**Parameters**

- data? : `object` = `{}`  
  Additional data which overrides current document data at the time of creation

- context? : `DocumentConstructionContext & DocumentCloneOptions` = `{}`  
  Additional context options passed to the create method

**Returns**

- `Document<object, DocumentConstructionContext>`
- `Promise<Document<object, DocumentConstructionContext>>`

The cloned Document instance

Inherited from [`BaseRollTable.clone`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#clone)

---

### createEmbeddedDocuments

```typescript
createEmbeddedDocuments(
    embeddedName: string,
    data?: object[],
    operation?: DatabaseCreateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple embedded Document instances within this parent Document using provided  
input data.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type

- data?: `object[]` = `[]`  
  An array of data objects used to create multiple documents

- operation? : `DatabaseCreateOperation` = `{}`  
  Parameters of the database creation workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments)

Inherited from [`BaseRollTable.createEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#createEmbeddedDocuments)

---

### delete

```typescript
delete(
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<undefined | Document<object, DocumentConstructionContext>>
```

Delete this Document, removing it from the database.

**Parameters**

- operation? : `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the deletion operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext>>`

The deleted Document instance, or undefined if not deleted

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [`BaseRollTable.delete`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#delete)

---

### deleteEmbeddedDocuments

```typescript
deleteEmbeddedDocuments(
    embeddedName: string,
    ids: string[],
    operation?: DatabaseDeleteOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete multiple embedded Document instances within a parent Document using provided  
string ids.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type

- ids: `string[]`  
  An array of string ids for each Document to be deleted

- operation? : `DatabaseDeleteOperation` = `{}`  
  Parameters of the database deletion workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

See also: [Document.deleteDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#deletedocuments)

Inherited from [`BaseRollTable.deleteEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#deleteEmbeddedDocuments)

---

### draw

```typescript
draw(
    options?: {
        displayChat?: boolean;
        recursive?: boolean;
        results?: documents.TableResult[];
        roll?: Roll;
        rollMode?: string;
    },
): Promise<{ RollTableDraw: any }>
```

Draw a result from the RollTable based on the table formula or a provided Roll instance

**Parameters**

- options? :  
  - displayChat?: `boolean`  
    Whether to automatically display the results in chat  
  - recursive?: `boolean`  
    Allow drawing recursively from inner RollTable results  
  - results?: `documents.TableResult[]`  
    One or more table results which have been drawn  
  - roll?: `Roll`  
    An existing Roll instance to use for drawing from the table  
  - rollMode?: `string`  
    The chat roll mode to use when displaying the result

**Returns**  
`Promise<{ RollTableDraw: any }>`

---

### drawMany

```typescript
drawMany(
    number: number,
    options?: {
        displayChat?: boolean;
        recursive?: boolean;
        roll?: Roll;
        rollMode?: string;
    },
): Promise<{ RollTableDraw: any }>
```

Draw multiple results from a RollTable, constructing a final synthetic Roll as a dice pool of  
inner rolls.

**Parameters**

- number: `number`  
  The number of results to draw

- options? :  
  - displayChat?: `boolean`  
    Automatically display the drawn results in chat? Default is true  
  - recursive?: `boolean`  
    Allow drawing recursively from inner RollTable results  
  - roll?: `Roll`  
    An optional pre-configured Roll instance which defines the dice roll to use  
  - rollMode?: `string`  
    Customize the roll mode used to display the drawn results

**Returns**  
`Promise<{ RollTableDraw: any }>`

---

### getEmbeddedCollection

```typescript
getEmbeddedCollection(embeddedName: string): DocumentCollection
```

Obtain a reference to the Array of source data within the data object for a certain embedded  
Document name

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type

**Returns**  
`DocumentCollection`

Inherited from [`BaseRollTable.getEmbeddedCollection`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#getEmbeddedCollection)

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
  The name of the embedded Document type

- id: `string`  
  The id of the child document to retrieve

- options? : `{ invalid?: boolean; strict?: boolean } = {}`  
  Additional options which modify how embedded documents are retrieved  
  - invalid?: `boolean` Allow retrieving an invalid Embedded Document.  
  - strict?: `boolean` Throw an Error if the requested id does not exist. See Collection#get

**Returns**  
`Document<object, DocumentConstructionContext>`

**Throws**  
If the embedded collection does not exist, or if strict is true and the Embedded Document  
could not be found.

Inherited from [`BaseRollTable.getEmbeddedDocument`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#getEmbeddedDocument)

---

### getFlag

```typescript
getFlag(scope: string, key: string): any
```

Get the value of a "flag" for this document. See the `setFlag` method for more details on flags.

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key

- key: `string`  
  The flag key

**Returns**  
`any`

Inherited from [`BaseRollTable.getFlag`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#getFlag)

---

### getResultsForRoll

```typescript
getResultsForRoll(value: number): documents.TableResult[]
```

Get an Array of valid results for a given rolled total

**Parameters**

- value: `number`  
  The rolled value

**Returns**  
`documents.TableResult[]`

---

### getUserLevel

```typescript
getUserLevel(user?: BaseUser): DocumentOwnershipNumber
```

Get the explicit permission level that a User has over this Document, a value in  
[CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html). Compendium content ignores the ownership field  
in favor of User role-based ownership. Otherwise, Documents use granular per-User  
ownership definitions and Embedded Documents defer to their parent ownership.

This method returns the value recorded in Document ownership, regardless of the User's  
role, for example a GAMEMASTER user might still return a result of NONE if they are not  
explicitly denoted as having a level.

To test whether a user has a certain capability over the document, `testUserPermission` should  
be used.

**Parameters**

- user? : `BaseUser`  
  The User being tested

**Returns**  
`DocumentOwnershipNumber`

Inherited from [`BaseRollTable.getUserLevel`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#getUserLevel)

---

### migrateSystemData

```typescript
migrateSystemData(): object
```

For Documents which include game system data, migrate the system data object to conform  
to its latest data model. The data model is defined by the `template.json` specification  
included by the game system.

**Returns**  
`object`

Inherited from [`BaseRollTable.migrateSystemData`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#migrateSystemData)

---

### normalize

```typescript
normalize(): Promise<documents.RollTable>
```

Normalize the probabilities of rolling each item in the RollTable based on their assigned  
weights.

**Returns**  
`Promise<documents.RollTable>`

---

### onEmbed

```typescript
onEmbed(element: any): void
```

**Parameters**

- element: `any`

**Returns**  
`void`

---

### reset

```typescript
reset(): void
```

Reset the state of this data instance back to mirror the contained source data, erasing any  
changes.

**Returns**  
`void`

Inherited from [`BaseRollTable.reset`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#reset)

---

### resetResults

```typescript
resetResults(): Promise<documents.RollTable>
```

Reset the state of the RollTable to return any drawn items to the table.

**Returns**  
`Promise<documents.RollTable>`

---

### roll

```typescript
roll(options?: { _depth?: number; recursive?: boolean; roll?: Roll }): Promise<RollTableDraw>
```

Evaluate a RollTable by rolling its formula and retrieving a drawn result.

Note that this function only performs the roll and identifies the result, the `RollTable.draw`  
function should be called to formalize the draw from the table.

**Parameters**

- options?:  
  - _depth?: `number` - An internal flag used to track recursion depth  
  - recursive?: `boolean` - If a RollTable document is drawn as a result, recursively roll it  
  - roll?: `Roll` - An alternative dice Roll to use instead of the default table formula

**Returns**  
`Promise<RollTableDraw>`

**Example: Draw results using the default table formula**

```typescript
const defaultResults = await table.roll();
```

**Example: Draw results using a custom roll formula**

```typescript
const roll = new Roll("1d20 + @abilities.wis.mod", actor.getRollData());
const customResults = await table.roll({roll});
```

---

### setFlag

```typescript
setFlag(scope: string, key: string, value: any): Promise<Document<object, DocumentConstructionContext>>
```

Assign a "flag" to this document. Flags represent key-value type data which can be used to  
store flexible or arbitrary data required by either the core software, game systems, or user-  
created modules.

Each flag should be set using a scope which provides a namespace for the flag to help  
prevent collisions.

Flags set by the core software use the `"core"` scope. Flags set by game systems or modules  
should use the canonical name attribute for the module Flags set by an individual world  
should `"world"` as the scope.

Flag values can assume almost any data type. Setting a flag value to null will delete that flag.

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key

- key: `string`  
  The flag key

- value: `any`  
  The flag value

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`

Inherited from [`BaseRollTable.setFlag`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#setFlag)

---

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: DocumentOwnershipLevel,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Document

**Parameters**

- user: `BaseUser`  
  The User being tested

- permission: `DocumentOwnershipLevel`  
  The permission level from DOCUMENT_OWNERSHIP_LEVELS to test

- options?: `{ exact?: boolean } = {}`  
  Additional options involved in the permission test  
  - exact?: `boolean` - Require the exact permission level requested?

**Returns**  
`boolean`

Inherited from [`BaseRollTable.testUserPermission`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#testUserPermission)

---

### toCompendium

```typescript
toCompendium(pack: any, options?: {}): any
```

---

### toJSON

```typescript
toJSON(): object
```

Extract the source data for the DataModel into a simple object format that can be serialized.

**Returns**  
`object`

Inherited from [`BaseRollTable.toJSON`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#toJSON)

---

### toMessage

```typescript
toMessage(
    results: documents.TableResult[],
    options?: { messageData?: object; messageOptions?: object; roll?: Roll },
): Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>
```

Display a result drawn from a RollTable in the Chat Log along. Optionally also display the Roll  
which produced the result and configure aspects of the displayed messages.

**Parameters**

- results: `documents.TableResult[]`  
  An Array of one or more TableResult Documents which were drawn and should be  
  displayed.

- options?:  
  - messageData?: `object` - Additional data which customizes the created messages  
  - messageOptions?: `object` - Additional options which customize the created messages  
  - roll?: `Roll` - An optional Roll instance which produced the drawn results

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>`

---

### toObject

```typescript
toObject(source?: boolean): any
```

Copy and transform the DataModel into a plain object. Draw the values of the extracted  
object from the data source (by default) otherwise from its transformed values.

**Parameters**

- source: `boolean` = `true`  
  Draw values from the underlying data source rather than transformed values

**Returns**  
`any`

Inherited from [`BaseRollTable.toObject`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#toObject)

---

### traverseEmbeddedDocuments

```typescript
traverseEmbeddedDocuments(_parentPath?: string): Generator<any, void, any>
```

Iterate over all embedded Documents that are hierarchical children of this Document.

**Parameters**

- _parentPath?: `string`  
  A parent field path already traversed

**Returns**  
`Generator<any, void, any>`

Inherited from [`BaseRollTable.traverseEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#traverseEmbeddedDocuments)

---

### unsetFlag

```typescript
unsetFlag(scope: string, key: string): Promise<Document<object, DocumentConstructionContext>>
```

Remove a flag assigned to the document

**Parameters**

- scope: `string`  
  The flag scope which namespaces the key

- key: `string`  
  The flag key

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`

Inherited from [`BaseRollTable.unsetFlag`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#unsetFlag)

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

- data?: `object` = `{}`  
  Differential update data which modifies the existing values of this document

- operation?: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the update operation

**Returns**  
Promise resolving to the updated Document instance, or `undefined` if not updated

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateDocuments)

Inherited from [`BaseRollTable.update`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#update)

---

### updateEmbeddedDocuments

```typescript
updateEmbeddedDocuments(
    embeddedName: string,
    updates?: object[],
    operation?: DatabaseUpdateOperation,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple embedded Document instances within a parent Document using provided  
differential data.

**Parameters**

- embeddedName: `string`  
  The name of the embedded Document type

- updates?: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- operation?: `DatabaseUpdateOperation` = `{}`  
  Parameters of the database update workflow

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

See also: [Document.updateDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateDocuments)

Inherited from [`BaseRollTable.updateEmbeddedDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#updateEmbeddedDocuments)

---

### updateSource

```typescript
updateSource(changes?: object, options?: DataModelUpdateOptions): object
```

Update the DataModel locally by applying an object of changes to its source data. The  
provided changes are expanded, cleaned, validated, and stored to the source data object for  
this model. The provided changes argument is mutated in this process. The source data is  
then re-initialized to apply those changes to the prepared data. The method returns an  
object of differential changes which modified the original data.

**Parameters**

- changes?: `object` = `{}`  
  New values which should be applied to the data model

- options?: `DataModelUpdateOptions` = `{}`  
  Options which determine how the new data is merged

**Returns**  
`object` containing differential keys and values that were changed

**Throws**  
An error if the requested data model changes were invalid

Inherited from [`BaseRollTable.updateSource`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#updateSource)

---

### validate

```typescript
validate(options?: DataModelValidationOptions): boolean
```

Validate the data contained in the document to check for type and content. If changes are  
provided, missing types are added to it before cleaning and validation. This mutates the  
provided changes. This function throws an error if data within the document is not valid.

**Parameters**

- options?: `DataModelValidationOptions` = `{}`  
  Options which modify how the model is validated

**Returns**  
`boolean` indicating whether the data source or proposed change is valid

**Throws**  
An error thrown if validation is strict and a failure occurs.

Inherited from [`BaseRollTable.validate`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#validate)

---

### _buildEmbedHTML (protected)

```typescript
protected _buildEmbedHTML(
    config: RollTableHTMLEmbedConfig,
    options?: any,
): Promise<null | HTMLElement>
```

Create embedded roll table markup.

**Parameters**

- config: `RollTableHTMLEmbedConfig`  
  Configuration for embedding behavior.

- options?: `any` = `{}`  
  The original enrichment options for cases where the Document embed content also  
  contains text that must be enriched.

**Returns**  
`Promise<null | HTMLElement>`

**Example: Embed the content of a Roll Table as a figure**

```
@Embed[RollTable.kRfycm1iY3XCvP8c]
becomes

<figure class="content-embed" data-content-embed data-uuid="RollTable.kRfycm1iY3XCvP8c" data-id="kRfycm1iY3XCvP8c">
  <table class="roll-table-embed">
    <thead>
      <tr>
        <th>Roll</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1—10</td>
        <td>
          <a class="inline-roll roll" data-mode="roll" data-formula="1d6">
            <i class="fa-solid fa-dice-d20"></i>
            1d6
          </a>
          Orcs attack!
        </td>
      </tr>
      <tr>
        <td>11—20</td>
        <td>No encounter</td>
      </tr>
    </tbody>
  </table>
  <figcaption>
    <div class="embed-caption">
      <p>This is the Roll Table description.</p>
    </div>
    <cite>
      <a class="content-link" data-link data-uuid="RollTable.kRfycm1iY3XCvP8c" data-id="kRfycm1iY3XCvP8c" data-type="RollTable" data-tooltip="Rollable Table">
        <i class="fa-solid fa-table-list"></i>
        Rollable Table
      </a>
    </cite>
  </figcaption>
</figure>
```

---

### _initializeSource (protected)

```typescript
protected _initializeSource(
    data: object | DataModel<object, DataModelConstructionContext>,
    options?: object,
): object
```

Initialize the source data for a new DataModel instance. One-time migrations and initial  
cleaning operations are applied to the source data.

**Parameters**

- data: `object | DataModel<object, DataModelConstructionContext>`  
  The candidate source data from which the model will be constructed

- options?: `object` = `{}`  
  Options provided to the model constructor

**Returns**  
Migrated and cleaned source data which will be stored to the model instance, which is the  
same object as the `data` argument

Inherited from [`BaseRollTable._initializeSource`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_initializeSource)

---

### _onClickEmbedAction (protected)

```typescript
protected _onClickEmbedAction(event: PointerEvent, action: string): Promise<void>
```

Handle a roll from within embedded content.

**Parameters**

- event: `PointerEvent`  
  The originating event

- action: `string`  
  The named action that was clicked

**Returns**  
`Promise<void>`

---

### _onCreate (protected)

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Post-process a creation operation for a single Document instance. Post-operation events  
occur for all connected clients.

**Parameters**

- data: `object`  
  The initial data object provided to the document creation request

- options: `object`  
  Additional options which modify the creation request

- userId: `string`  
  The id of the User requesting the document update

**Returns**  
`void`

Inherited from [`BaseRollTable._onCreate`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_onCreate)

---

### _onDelete (protected)

```typescript
protected _onDelete(options: object, userId: string): void
```

Post-process a deletion operation for a single Document instance. Post-operation events  
occur for all connected clients.

**Parameters**

- options: `object`  
  Additional options which modify the deletion request

- userId: `string`  
  The id of the User requesting the document update

**Returns**  
`void`

Inherited from [`BaseRollTable._onDelete`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_onDelete)

---

### _onUpdate (protected)

```typescript
protected _onUpdate(changed: object, options: object, userId: string): void
```

Post-process an update operation for a single Document instance. Post-operation events  
occur for all connected clients.

**Parameters**

- changed: `object`  
  The differential data that was changed relative to the documents prior values

- options: `object`  
  Additional options which modify the update request

- userId: `string`  
  The id of the User requesting the document update

**Returns**  
`void`

Inherited from [`BaseRollTable._onUpdate`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_onUpdate)

---

### _preCreate (protected)

```typescript
protected _preCreate(data: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a creation operation for a single Document instance. Pre-operation events only  
occur for the client which requested the operation.

Modifications to the pending Document instance must be performed using [`updateSource`](#updateSource).

**Parameters**

- data: `object`  
  The initial data object provided to the document creation request

- options: `object`  
  Additional options which modify the creation request

- user: `BaseUser`  
  The User requesting the document creation

**Returns**  
`Promise<boolean | void>`  
Return `false` to exclude this Document from the creation operation

Inherited from [`BaseRollTable._preCreate`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_preCreate)

---

### _preDelete (protected)

```typescript
protected _preDelete(options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process a deletion operation for a single Document instance. Pre-operation events only  
occur for the client which requested the operation.

**Parameters**

- options: `object`  
  Additional options which modify the deletion request

- user: `BaseUser`  
  The User requesting the document deletion

**Returns**  
`Promise<boolean | void>`  
A return value of `false` indicates the deletion operation should be cancelled.

Inherited from [`BaseRollTable._preDelete`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_preDelete)

---

### _preUpdate (protected)

```typescript
protected _preUpdate(changes: object, options: object, user: BaseUser): Promise<boolean | void>
```

Pre-process an update operation for a single Document instance. Pre-operation events only  
occur for the client which requested the operation.

**Parameters**

- changes: `object`  
  The candidate changes to the Document

- options: `object`  
  Additional options which modify the update request

- user: `BaseUser`  
  The User requesting the document update

**Returns**  
`Promise<boolean | void>`  
A return value of `false` indicates the update operation should be cancelled.

Inherited from [`BaseRollTable._preUpdate`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_preUpdate)

---

### _initializationOrder (protected, static)

```typescript
static _initializationOrder(): Generator<any[], void, unknown>
```

**Returns**  
`Generator<any[], void, unknown>`

Inherited from [`BaseRollTable._initializationOrder`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_initializationOrder)

---

### canUserCreate (static)

```typescript
static canUserCreate(user: BaseUser): boolean
```

Test whether a given User has sufficient permissions to create Documents of this type in  
general. This does not guarantee that the User is able to create all Documents of this type, as  
certain document-specific requirements may also be present.

Generally speaking, this method is used to verify whether a User should be presented with  
the option to create Documents of this type in the UI.

**Parameters**

- user: `BaseUser`  
  The User being tested

**Returns**  
`boolean`  
Does the User have a sufficient role to create?

Inherited from [`BaseRollTable.canUserCreate`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#canUserCreate)

---

### cleanData (static)

```typescript
static cleanData(source?: object, options?: object): object
```

Clean a data source object to conform to a specific provided schema.

**Parameters**

- source?: `object` = `{}`  
  The source data object

- options?: `object` = `{}`  
  Additional options which are passed to field cleaning methods

**Returns**  
`object`  
The cleaned source data, which is the same object as the `source` argument

Inherited from [`BaseRollTable.cleanData`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#cleanData)

---

### create (static)

```typescript
static create(
    data?: object | Document<object, DocumentConstructionContext> | (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>
```

Create a new Document using provided input data, saving it to the database.

**Parameters**

- data?:  
  - `object`  
  - `Document<object, DocumentConstructionContext>`  
  - Array of `object | Document<object, DocumentConstructionContext>`  
  Initial data used to create this Document, or a Document instance to persist.

- operation?: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the creation operation

**Returns**  
`Promise<undefined | Document<object, DocumentConstructionContext> | Document<object, DocumentConstructionContext>[]>`

See also: [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createDocuments)

**Examples**

- Create a World-level Item:

  ```typescript
  const data = [{ name: "Special Sword", type: "weapon" }];
  const created = await Item.implementation.create(data);
  ```

- Create an Actor-owned Item:

  ```typescript
  const data = [{ name: "Special Sword", type: "weapon" }];
  const actor = game.actors.getName("My Hero");
  const created = await Item.implementation.create(data, { parent: actor });
  ```

- Create an Item in a Compendium pack:

  ```typescript
  const data = [{ name: "Special Sword", type: "weapon" }];
  const created = await Item.implementation.create(data, { pack: "mymodule.mypack" });
  ```

Inherited from [`BaseRollTable.create`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#create)

---

### createDocuments (static)

```typescript
static createDocuments(
    data?: (object | Document<object, DocumentConstructionContext>)[],
    operation?: Partial<Omit<DatabaseCreateOperation, "data">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Create multiple Documents using provided input data. Data is provided as an array of objects  
where each individual object becomes one new Document.

**Parameters**

- data?: `(object | Document<object, DocumentConstructionContext>)[]` = `[]`  
  An array of data objects or existing Documents to persist.

- operation?: `Partial<Omit<DatabaseCreateOperation, "data">>` = `{}`  
  Parameters of the requested creation operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

**Examples**

- Create a single Document
- Create multiple Documents
- Create multiple embedded Documents within a parent
- Create a Document within a Compendium pack

Inherited from [`BaseRollTable.createDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#createDocuments)

---

### defineSchema (static)

```typescript
static defineSchema(): {
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    description: HTMLField;
    displayRoll: BooleanField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    formula: StringField;
    img: FilePathField;
    name: StringField;
    ownership: DocumentOwnershipField;
    replacement: BooleanField;
    results: EmbeddedCollectionField;
    sort: IntegerSortField;
}
```

Define the data schema for documents of this type. The schema is populated the first time it  
is accessed and cached for future reuse.

**Returns**

```typescript
{
    _id: DocumentIdField;
    _stats: DocumentStatsField;
    description: HTMLField;
    displayRoll: BooleanField;
    flags: DocumentFlagsField;
    folder: ForeignDocumentField;
    formula: StringField;
    img: FilePathField;
    name: StringField;
    ownership: DocumentOwnershipField;
    replacement: BooleanField;
    results: EmbeddedCollectionField;
    sort: IntegerSortField;
}
```

Inherited from [`BaseRollTable.defineSchema`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#defineSchema)

---

### deleteDocuments (static)

```typescript
static deleteDocuments(
    ids?: string[],
    operation?: Partial<Omit<DatabaseDeleteOperation, "ids">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Delete one or multiple existing Documents using an array of provided ids. Data is provided  
as an array of string ids for the documents to delete.

**Parameters**

- ids?: `string[]` = `[]`  
  An array of string ids for the documents to be deleted

- operation?: `Partial<Omit<DatabaseDeleteOperation, "ids">>` = `{}`  
  Parameters of the database deletion operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

**Examples**

- Delete a single Document
- Delete multiple Documents
- Delete multiple embedded Documents within a parent
- Delete Documents within a Compendium pack

Inherited from [`BaseRollTable.deleteDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#deleteDocuments)

---

### fromFolder (static)

```typescript
static fromFolder(folder: Folder, options?: object): Promise<documents.RollTable>
```

Create a new RollTable document using all of the Documents from a specific Folder as new  
results.

**Parameters**

- folder: `Folder`  
  The Folder document from which to create a roll table

- options?: `object` = `{}`  
  Additional options passed to the RollTable.create method

**Returns**  
`Promise<documents.RollTable>`

---

### fromJSON (static)

```typescript
static fromJSON(json: string): DataModel<object, DataModelConstructionContext>
```

Create a DataModel instance using a provided serialized JSON string.

**Parameters**

- json: `string`  
  Serialized document data in string format

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [`BaseRollTable.fromJSON`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#fromJSON)

---

### fromSource (static)

```typescript
static fromSource(
    source: object,
    context?: Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions,
): DataModel<object, DataModelConstructionContext>
```

Create a new instance of this DataModel from a source record. The source is presumed to be  
trustworthy and is not strictly validated.

**Parameters**

- source: `object`  
  Initial document data which comes from a trusted source.

- context?: `Omit<DataModelConstructionContext, "strict"> & DataModelFromSourceOptions`  
  Model construction context

**Returns**  
`DataModel<object, DataModelConstructionContext>`

Inherited from [`BaseRollTable.fromSource`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#fromSource)

---

### get (static)

```typescript
static get(
    documentId: string,
    operation?: DatabaseGetOperation,
): null | Document<object, DocumentConstructionContext>
```

Get a World-level Document of this type by its id.

**Parameters**

- documentId: `string`  
  The Document ID

- operation?: `DatabaseGetOperation` = `{}`  
  Parameters of the get operation

**Returns**  
`null | Document<object, DocumentConstructionContext>`

Inherited from [`BaseRollTable.get`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#get)

---

### getCollectionName (static)

```typescript
static getCollectionName(name: string): null | string
```

A compatibility method that returns the appropriate name of an embedded collection within  
this Document.

**Parameters**

- name: `string`  
  An existing collection name or a document name.

**Returns**  
`null | string`  
The provided collection name if it exists, the first available collection for the document name  
provided, or null if no appropriate embedded collection could be found.

**Examples**

```typescript
Actor.implementation.getCollectionName("items");
// returns "items"

Actor.implementation.getCollectionName("Item");
// returns "items"
```

Inherited from [`BaseRollTable.getCollectionName`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#getCollectionName)

---

### migrateData (static)

```typescript
static migrateData(source: any): object
```

Migrate candidate source data for this DataModel which may require initial cleaning or  
transformations.

**Parameters**

- source: `any`  
  The candidate source data from which the model will be constructed

**Returns**  
`object`  
Migrated source data, which is the same object as the `source` argument

Inherited from [`BaseRollTable.migrateData`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#migrateData)

---

### migrateDataSafe (static)

```typescript
static migrateDataSafe(source: object): object
```

Wrap data migration in a try/catch which attempts it safely.

**Parameters**

- source: `object`  
  The candidate source data from which the model will be constructed

**Returns**  
`object`  
Migrated source data, which is the same object as the `source` argument

Inherited from [`BaseRollTable.migrateDataSafe`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#migrateDataSafe)

---

### shimData (static)

```typescript
static shimData(source: any, options: any): object
```

Take data which conforms to the current data schema and add backwards-compatible  
accessors to it in order to support older code which uses this data.

**Parameters**

- source: `any`  
  Data which matches the current schema

- options: `any`  
  Additional shimming options

**Returns**  
`object`  
Data with added backwards-compatible properties, which is the same object as the `data`  
argument

Inherited from [`BaseRollTable.shimData`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#shimData)

---

### updateDocuments (static)

```typescript
static updateDocuments(
    updates?: object[],
    operation?: Partial<Omit<DatabaseUpdateOperation, "updates">>,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update multiple Document instances using provided differential data. Data is provided as an  
array of objects where each individual object updates one existing Document.

**Parameters**

- updates?: `object[]` = `[]`  
  An array of differential data objects, each used to update a single Document

- operation?: `Partial<Omit<DatabaseUpdateOperation, "updates">>` = `{}`  
  Parameters of the database update operation

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`

**Examples**

- Update a single Document
- Update multiple Documents
- Update multiple embedded Documents within a parent
- Update Documents within a Compendium pack

Inherited from [`BaseRollTable.updateDocuments`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#updateDocuments)

---

### validateJoint (static)

```typescript
static validateJoint(data: object): void
```

Evaluate joint validation rules which apply validation conditions across multiple fields of the  
model. Field-specific validation rules should be defined as part of the DataSchema for the  
model. This method allows for testing aggregate rules which impose requirements on the  
overall model.

**Parameters**

- data: `object`  
  Candidate data for the model

**Returns**  
`void`

**Throws**  
An error if a validation failure is detected

Inherited from [`BaseRollTable.validateJoint`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#validateJoint)

---

### _onCreateOperation (protected, static)

```typescript
protected static _onCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a creation operation, reacting to database changes which have occurred. Post-  
operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onCreate` workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were created

- operation: `DatabaseCreateOperation`  
  Parameters of the database creation operation

- user: `BaseUser`  
  The User who performed the creation operation

**Returns**  
`Promise<void>`

Inherited from [`BaseRollTable._onCreateOperation`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_onCreateOperation)

---

### _onDeleteOperation (protected, static)

```typescript
protected static _onDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<void>
```

Post-process a deletion operation, reacting to database changes which have occurred. Post-  
operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onDelete` workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were deleted

- operation: `DatabaseDeleteOperation`  
  Parameters of the database deletion operation

- user: `BaseUser`  
  The User who performed the deletion operation

**Returns**  
`Promise<void>`

Inherited from [`BaseRollTable._onDeleteOperation`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_onDeleteOperation)

---

### _onUpdateOperation (protected, static)

```typescript
protected static _onUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<void>
```

Post-process an update operation, reacting to database changes which have occurred. Post-  
operation events occur for all connected clients.

This batch-wise workflow occurs after individual `_onUpdate` workflows.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  The Document instances which were updated

- operation: `DatabaseUpdateOperation`  
  Parameters of the database update operation

- user: `BaseUser`  
  The User who performed the update operation

**Returns**  
`Promise<void>`

Inherited from [`BaseRollTable._onUpdateOperation`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_onUpdateOperation)

---

### _preCreateOperation (protected, static)

```typescript
protected static _preCreateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseCreateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a creation operation, potentially altering its instructions or input data. Pre-  
operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preCreate` workflows and provides a final  
pre-flight check before a database operation occurs.

Modifications to pending documents must mutate the documents array or alter individual  
document instances using [`updateSource`](#updateSource).

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Pending document instances to be created

- operation: `DatabaseCreateOperation`  
  Parameters of the database creation operation

- user: `BaseUser`  
  The User requesting the creation operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the creation operation entirely

Inherited from [`BaseRollTable._preCreateOperation`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_preCreateOperation)

---

### _preDeleteOperation (protected, static)

```typescript
protected static _preDeleteOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseDeleteOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process a deletion operation, potentially altering its instructions or input data. Pre-  
operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preDelete` workflows and provides a final  
pre-flight check before a database operation occurs.

Modifications to the requested deletions are performed by mutating the operation object.  
See also [`updateSource`](#updateSource).

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be deleted

- operation: `DatabaseDeleteOperation`  
  Parameters of the database update operation

- user: `BaseUser`  
  The User requesting the deletion operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the deletion operation entirely

Inherited from [`BaseRollTable._preDeleteOperation`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_preDeleteOperation)

---

### _preUpdateOperation (protected, static)

```typescript
protected static _preUpdateOperation(
    documents: Document<object, DocumentConstructionContext>[],
    operation: DatabaseUpdateOperation,
    user: BaseUser,
): Promise<boolean | void>
```

Pre-process an update operation, potentially altering its instructions or input data. Pre-  
operation events only occur for the client which requested the operation.

This batch-wise workflow occurs after individual `_preUpdate` workflows and provides a final  
pre-flight check before a database operation occurs.

Modifications to the requested updates are performed by mutating the data array of the  
operation.

**Parameters**

- documents: `Document<object, DocumentConstructionContext>[]`  
  Document instances to be updated

- operation: `DatabaseUpdateOperation`  
  Parameters of the database update operation

- user: `BaseUser`  
  The User requesting the update operation

**Returns**  
`Promise<boolean | void>`  
Return false to cancel the update operation entirely

Inherited from [`BaseRollTable._preUpdateOperation`](https://foundryvtt.com/api/classes/foundry.documents.BaseRollTable.html#_preUpdateOperation)