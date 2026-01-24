# CompendiumCollection | Foundry Virtual Tabletop - API Documentation - Version 13

A collection of Document objects contained within a specific compendium pack. Each Compendium pack has its own associated instance of the `CompendiumCollection` class which contains its contents.

Hook Events:  
- [hookEvents.updateCompendium](https://foundryvtt.com/api/functions/hookEvents.updateCompendium.html)

See also:  
- [foundry.Game#packs](https://foundryvtt.com/api/classes/foundry.Game.html#packs)

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.collections.CompendiumCollection), Expand)  
- [DocumentCollection<this>](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)  
- **CompendiumCollection**

---

## Constructors

### constructor

```typescript
new CompendiumCollection(metadata: object): CompendiumCollection
```

**Parameters:**

- **metadata**: `object`  
  The compendium metadata, an object provided by `game.data`.

**Returns:**  
`CompendiumCollection`

Overrides [DocumentCollection.constructor](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#constructor)

---

## Properties

### applicationClass

`applicationClass: any = foundry.applications.sidebar.apps.Compendium`

A reference to the Application class which provides an interface to interact with this compendium content.

### apps

`apps: ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>[]`

An Array of application references which will be automatically updated when the collection content changes.

Inherited from [DocumentCollection.apps](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#apps)

### index

`index: Collection<string, object>`

A subsidiary collection which contains the more minimal index of the pack.

### invalidDocumentIds

`invalidDocumentIds: Set<string> = ...`

Record the set of document ids where the Document was not initialized because of invalid source data.

Inherited from [DocumentCollection.invalidDocumentIds](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#invaliddocumentids)

### metadata

`metadata: object`

The compendium metadata which defines the compendium content and location.

---

## Accessors

### Static: CACHE_LIFETIME_SECONDS

`CACHE_LIFETIME_SECONDS: number = 300`

The amount of time that Document instances within this `CompendiumCollection` are held in memory. Accessing the contents of the Compendium pack extends the duration of this lifetime.

### Static: CONFIG_SETTING

`CONFIG_SETTING: string = "compendiumConfiguration"`

The named game setting which contains Compendium configurations.

### Static: documentName

`documentName: string`

The base Document type which is contained within this DocumentCollection.  

Inherited from [DocumentCollection.documentName](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#documentname)

### banner

```typescript
get banner(): null | string | void
```

The banner image for this Compendium pack, or the default image for the pack type if no image is set.

### collection

```typescript
get collection(): string
```

The canonical Compendium name - comprised of the originating package and the pack name.

### config

```typescript
get config(): object
```

Access the compendium configuration data for this pack.

### contents

```typescript
get contents(): V[]
```

Return an Array of all the entry values in the Collection.  

Inherited from DirectoryCollectionMixin(DocumentCollection).contents

### documentClass

```typescript
get documentClass(): typeof Document
```

A reference to the Document class definition which is contained within this DocumentCollection.  

Inherited from DirectoryCollectionMixin(DocumentCollection).documentClass

### documentName

```typescript
get documentName(): any
```

Overrides DirectoryCollectionMixin(DocumentCollection).documentName

### folder

```typescript
get folder(): null | documents.Folder
```

Get the Folder that this Compendium is displayed within.

### indexed

```typescript
get indexed(): boolean
```

Has this compendium pack been fully indexed?

### indexFields

```typescript
get indexFields(): Set<string>
```

The index fields which should be loaded for this compendium pack.

### locked

```typescript
get locked(): boolean
```

Track whether the Compendium Collection is locked for editing.

### maxFolderDepth

```typescript
get maxFolderDepth(): number
```

### name

```typescript
get name(): string
```

The Collection class name.  

Inherited from DirectoryCollectionMixin(DocumentCollection).name

### ownership

```typescript
get ownership(): Record<
    Readonly<{ ASSISTANT: 3; GAMEMASTER: 4; NONE: 0; PLAYER: 1; TRUSTED: 2 }>,
    Readonly<{ INHERIT: -1; LIMITED: 1; NONE: 0; OBSERVER: 2; OWNER: 3 }>
>
```

The visibility configuration of this compendium pack.

### sort

```typescript
get sort(): number
```

Get the sort order for this Compendium.

### title

```typescript
get title(): string
```

A convenience reference to the label which should be used as the title for the Compendium pack.

### visible

```typescript
get visible(): boolean
```

Is this Compendium pack visible to the current game User?

---

## Methods

### _getVisibleTreeContents

```typescript
_getVisibleTreeContents(): any
```

### [iterator]

```typescript
[iterator](): MapIterator<any>
```

Then iterating over a Collection, we should iterate over its values instead of over its entries.

Inherited from [DocumentCollection.[iterator]](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#iterator)

### clear

```typescript
clear(): void
```

Overrides DirectoryCollectionMixin(DocumentCollection).clear

### configure

```typescript
configure(configuration?: object): Promise<void>
```

Assign configuration metadata settings to the compendium pack.

**Parameters:**

- **configuration**: `object = {}`  
  The object of compendium settings to define.

**Returns:**  
`Promise<void>` - A Promise which resolves once the setting is updated.

### configureOwnershipDialog

```typescript
configureOwnershipDialog(): Promise<Record<string, string>>
```

Prompt the gamemaster with a dialog to configure ownership of this Compendium pack.

**Returns:**  
`Promise<Record<string, string>>` - The configured ownership for the pack.

### createDocument

```typescript
createDocument(
    data: object,
    context?: object,
): Document<object, DocumentConstructionContext>
```

Instantiate a Document for inclusion in the Collection.

**Parameters:**

- **data**: `object` - The Document data.
- **context**: `object = {}` - Document creation context.

**Returns:**  
`Document<object, DocumentConstructionContext>`

Inherited from [DocumentCollection.createDocument](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#createdocument)

### delete

```typescript
delete(id: any): boolean
```

Overrides [DocumentCollection.delete](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#delete)

**Parameters:**

- **id**: `any` - Document ID to delete.

**Returns:**  
`boolean`

### deleteCompendium

```typescript
deleteCompendium(): Promise<CompendiumCollection>
```

Delete an existing world-level Compendium Collection. This action may only be performed for world-level packs by a Gamemaster User.

**Returns:**  
`Promise<CompendiumCollection>`

### duplicateCompendium

```typescript
duplicateCompendium(label?: string): Promise<CompendiumCollection>
```

Duplicate a compendium pack to the current World.

**Parameters:**

- **label**: `string = {}` - A new Compendium label.

**Returns:**  
`Promise<CompendiumCollection>`

### filter

```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

**Parameters:**

- **condition**: `(value: any, index: number, collection: Collection) => boolean` - The functional condition to test.

**Returns:**  
`any[]` - An Array of matched values.

Example: Filter the Collection for specific entries.

Inherited from [DocumentCollection.filter](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#filter)  
```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filter(entry => entry.slice(0) === "A");
```

### find

```typescript
find(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any
```

Find an entry in the Map using a functional condition.

**Parameters:**

- **condition**: `(value: any, index: number, collection: Collection) => boolean` - The functional condition to test.

**Returns:**  
`any` - The value, if found, otherwise undefined.

Example:  
```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A");  // true
```

Inherited from [DocumentCollection.find](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#find)

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection.

**Parameters:**

- **fn**: `(value: any) => void` - A function to apply to each element.

**Returns:**  
`void`

Example:  
```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

Inherited from [DocumentCollection.forEach](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#foreach)

### get

```typescript
get(key: any, options: any): Document<object, DocumentConstructionContext>
```

Get an element from the DocumentCollection by its ID.

**Parameters:**

- **key**: `any` - The ID of the Document to retrieve.
- **options**: `any` - Additional options to configure retrieval.

**Returns:**  
`Document<object, DocumentConstructionContext>`

Throws if strict is true and the Document cannot be found.

Overrides [DocumentCollection.get](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#get)

### getDocument

```typescript
getDocument(
    id: string,
): undefined | Promise<Document<object, DocumentConstructionContext>>
```

Get a single Document from this Compendium by ID. The document may already be locally cached, otherwise it is retrieved from the server.

**Parameters:**

- **id**: `string` - The requested Document id.

**Returns:**  
`undefined | Promise<Document<object, DocumentConstructionContext>>`

### getDocuments

```typescript
getDocuments(
    query?: object,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Load multiple documents from the Compendium pack using a provided query object.

**Parameters:**

- **query**: `object = {}` - A database query used to retrieve documents from the underlying database.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>`

Examples:  
```typescript
await pack.getDocuments({ type: "weapon" });
await pack.getDocuments({ _id__in: arrayOfIds });
await pack.getDocuments({ type__in: ["weapon", "armor"] });
```

### getIndex

```typescript
getIndex(options?: { fields?: string[] }): Promise<Collection>
```

Load the Compendium index and cache it as the keys and values of the Collection.

**Parameters:**

- **options**: `{ fields?: string[] } = {}` - Options which customize how the index is created.
  - `fields?`: `string[]` - An array of fields to return as part of the index.

**Returns:**  
`Promise<Collection>`

### getInvalid

```typescript
getInvalid(
    id: string,
    options?: { strict?: boolean },
): void | Document<object, DocumentConstructionContext>
```

Obtain a temporary Document instance for a document id which currently has invalid source data.

**Parameters:**

- **id**: `string` - A document ID with invalid source data.
- **options**: `{ strict?: boolean } = {}` - Additional options to configure retrieval.
  - `strict?`: `boolean` - Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

**Returns:**  
`void | Document<object, DocumentConstructionContext>`

Throws if strict is true and the requested ID is not in the set of invalid IDs for this collection.

Inherited from [DocumentCollection.getInvalid](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getinvalid)

### getName

```typescript
getName(name: string, options?: { strict?: boolean }): any
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a "name" attribute.

**Parameters:**

- **name**: `string` - The name of the entry to retrieve.
- **options**: `{ strict?: boolean } = {}` - Additional options that affect how entries are retrieved.
  - `strict?`: `boolean` - Throw an Error if the requested name does not exist. Default false.

**Returns:**  
`any` - The retrieved entry value, if one was found, otherwise undefined.

Example:  
```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");  // "Alfred"
c.getName("D");  // undefined
c.getName("D", {strict: true});  // throws Error
```

Inherited from [DocumentCollection.getName](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getname)

### getUserLevel

```typescript
getUserLevel(user?: User): number
```

Get the ownership level that a User has for this Compendium pack.

**Parameters:**

- **user**: `User = game.user` - The user being tested.

**Returns:**  
`number` - The ownership level in `CONST.DOCUMENT_OWNERSHIP_LEVELS`.

### getUuid

```typescript
getUuid(id: string): string
```

Generate a UUID for a given primary document ID within this Compendium pack.

**Parameters:**

- **id**: `string` - The document ID to generate a UUID for.

**Returns:**  
`string` - The generated UUID, in the form of `"Compendium..."`.

### importAll

```typescript
importAll(
    options?: { folderId?: null | string; folderName?: string },
): Promise<Document<object, DocumentConstructionContext>[]>
```

Fully import the contents of a Compendium pack into a World folder.

**Parameters:**

- **options**: `{ folderId?: null | string; folderName?: string } = {}` - Options which modify the import operation. Additional options are forwarded to [WorldCollection.fromCompendium](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#fromcompendium) and [Document.createDocuments](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#createdocuments).
  - `folderId?`: `null | string` - An existing Folder _id to use.
  - `folderName?`: `string` - A new Folder name to create.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` - The imported Documents, now existing within the World.

### importDialog

```typescript
importDialog(
    options?: object,
): Promise<null | boolean | Document<object, DocumentConstructionContext>[]>
```

Provide a dialog form that prompts the user to import the full contents of a Compendium pack into the World.

**Parameters:**

- **options**: `object = {}` - Additional options passed to the `DialogV2.confirm` method.

**Returns:**  
A promise which resolves in the following ways: an array of imported Documents if the "yes" button was pressed, `false` if the "no" button was pressed, or `null` if the dialog was closed without making a choice.

### importDocument

```typescript
importDocument(
    document: Document<object, DocumentConstructionContext>,
    options?: object,
): Promise<Document<object, DocumentConstructionContext>>
```

Import a Document into this Compendium Collection.

**Parameters:**

- **document**: `Document<object, DocumentConstructionContext>` - The existing Document you wish to import.
- **options**: `object = {}` - Additional options which modify how the data is imported. See `ClientDocumentMixin#toCompendium`.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>>` - The imported Document instance.

### importFolder

```typescript
importFolder(
    folder: documents.Folder,
    options?: { importParents?: boolean },
): Promise<void>
```

Import a Folder into this Compendium Collection.

**Parameters:**

- **folder**: `documents.Folder` - The existing Folder you wish to import.
- **options**: `{ importParents?: boolean } = {}` - Additional options which modify how the data is imported.
  - `importParents?`: `boolean` - Import any parent folders which are not already present in the Compendium.

**Returns:**  
`Promise<void>`

### importFolders

```typescript
importFolders(
    folders: documents.Folder[],
    options?: { importParents?: boolean },
): Promise<void>
```

Import an array of Folders into this Compendium Collection.

**Parameters:**

- **folders**: `documents.Folder[]` - The existing Folders you wish to import.
- **options**: `{ importParents?: boolean } = {}` - Additional options which modify how the data is imported.
  - `importParents?`: `boolean` - Import any parent folders which are not already present in the Compendium.

**Returns:**  
`Promise<void>`

### indexDocument

```typescript
indexDocument(document: Document<object, DocumentConstructionContext>): void
```

Add a Document to the index, capturing its relevant index attributes.

**Parameters:**

- **document**: `Document<object, DocumentConstructionContext>` - The document to index.

**Returns:**  
`void`

### map

```typescript
map(transformer: (value: any, index: number, collection: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters:**

- **transformer**: `(value: any, index: number, collection: Collection) => any` - A transformation function applied to each entry value.

**Returns:**  
`any[]` - An Array of transformed values.

Inherited from [DocumentCollection.map](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#map)

### migrate

```typescript
migrate(): Promise<CompendiumCollection>
```

Migrate a compendium pack. This operation re-saves all documents within the compendium pack to disk, applying the current data model. If the document type has system data, the latest system data template will also be applied to all documents.

**Returns:**  
`Promise<CompendiumCollection>`

### reduce

```typescript
reduce(
    reducer: (accumulator: any, value: any, index: number, collection: Collection) => any,
    initial: any,
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters:**

- **reducer**: `(accumulator: any, value: any, index: number, collection: Collection) => any` - A reducer function applied to each entry value.
- **initial**: `any` - An initial value which accumulates with each iteration.

**Returns:**  
`any` - The accumulated result.

Example:  
```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, "");  // "ABC"
```

Inherited from [DocumentCollection.reduce](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#reduce)

### render

```typescript
render(force: any, options: any): void
```

Render any Applications associated with this DocumentCollection.

**Parameters:**

- **force**: `any` - Force rendering.
- **options**: `any` - Optional options.

**Returns:**  
`void`

Overrides [DocumentCollection.render](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#render)

### search

```typescript
search(
    search: { exclude?: string[]; filters?: FieldFilter[]; query?: string },
): object[] | Document<object, DocumentConstructionContext>[]
```

Find all Documents which match a given search term using a full-text search against their indexed HTML fields and their name. If filters are provided, results are filtered to only those that match the provided values.

**Parameters:**

- **search**:  
  - `exclude?`: `string[]` - An array of document IDs to exclude from search results.  
  - `filters?`: `FieldFilter[]` - An array of filters to apply.  
  - `query?`: `string` - A case-insensitive search string.

**Returns:**  
`object[] | Document<object, DocumentConstructionContext>[]`

Inherited from [DocumentCollection.search](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#search)

### set

```typescript
set(id: any, document: any): void
```

Overrides [DocumentCollection.set](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#set)

**Parameters:**

- **id**: `any`  
- **document**: `any`

**Returns:**  
`void`

### setFolder

```typescript
setFolder(folder: null | string | documents.Folder): Promise<void>
```

Assign this CompendiumCollection to be organized within a specific Folder.

**Parameters:**

- **folder**: `null | string | documents.Folder` - The desired Folder within the World or null to clear the folder.

**Returns:**  
`Promise<void>` - A promise which resolves once the transaction is complete.

### some

```typescript
some(condition: (value: any, index: number, collection: Collection) => boolean): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters:**

- **condition**: `(value: any, index: number, collection: Collection) => boolean` - The functional condition to test.

**Returns:**  
`boolean` - Was the test condition passed by at least one entry?

Inherited from [DocumentCollection.some](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#some)

### testUserPermission

```typescript
testUserPermission(
    user: BaseUser,
    permission: string | number,
    options?: { exact?: boolean },
): boolean
```

Test whether a certain User has a requested permission level (or greater) over the Compendium pack.

**Parameters:**

- **user**: `BaseUser` - The User being tested.
- **permission**: `string | number` - The permission level from DOCUMENT_OWNERSHIP_LEVELS to test.
- **options**: `{ exact?: boolean } = {}` - Additional options involved in the permission test.
  - `exact?`: `boolean` - Require the exact permission level requested?

**Returns:**  
`boolean` - Does the user have this permission level over the Compendium pack?

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns:**  
`object[]` - An array of contained values.

Inherited from [DocumentCollection.toJSON](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#tojson)

### updateAll

```typescript
updateAll(
    transformation: any,
    condition?: null,
    options?: {},
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update all objects in this DocumentCollection with a provided transformation. Conditionally filter to only apply to Entities which match a certain condition.

**Parameters:**

- **transformation**: `any` - An object of data or function to apply to all matched objects.
- **condition**: `null = null` - A function which tests whether to target each object.
- **options**: `{ } = {}` - Additional options passed to Document.updateDocuments.

**Returns:**  
`Promise<Document<object, DocumentConstructionContext>[]>` - An array of updated data once the operation is complete.

Overrides [DocumentCollection.updateAll](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#updateall)

### Protected: _initialize

```typescript
_initialize(): void
```

Protected. Initialize the DocumentCollection by constructing any initially provided Document instances.

Inherited from [DocumentCollection._initialize](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#_initialize)

### Static: _onConfigure

```typescript
static _onConfigure(config: WorldCompendiumConfiguration): void
```

Handle changes to the world compendium configuration setting.

**Parameters:**

- **config**: `WorldCompendiumConfiguration`

### Static: createCompendium

```typescript
static createCompendium(
    metadata: object,
    options?: object,
): Promise<CompendiumCollection>
```

Create a new Compendium Collection using provided metadata.

**Parameters:**

- **metadata**: `object` - The compendium metadata used to create the new pack.
- **options**: `object = {}` - Additional options which modify the Compendium creation request.

**Returns:**  
`Promise<CompendiumCollection>`

### Static: getSearchableFields

```typescript
static getSearchableFields(
    documentName: string,
    type?: string,
): Record<string, SearchableField>
```

Get the searchable fields for a given document or index, based on its data model.

**Parameters:**

- **documentName**: `string` - The document name.
- **type**: `string` (optional) - A document subtype.

**Returns:**  
`Record<string, SearchableField>` - A record of searchable DataField definitions.

Inherited from [DocumentCollection.getSearchableFields](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getsearchablefields)