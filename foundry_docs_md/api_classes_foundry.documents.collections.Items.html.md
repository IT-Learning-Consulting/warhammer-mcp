# Items

The singleton collection of Item documents which exist within the active World. This Collection is accessible within the Game object as `game.items`.

**See**

- [foundry.documents.Item: The Item document](https://foundryvtt.com/api/classes/foundry.documents.Item.html)
- [foundry.applications.sidebar.tabs.ItemDirectory: The ItemDirectory sidebar directory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ItemDirectory.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.collections.Items), Expand)

- _WorldCollection_
- **Items**

---

## Constructors

### constructor

```typescript
new Items(data?: object[]): Items
```

**Parameters**

- **data**: `object[]` = `[]`  
  An array of data objects from which to create document instances

**Returns**  
`Items`

---

## Properties

### apps

`apps: ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>[]`

An Array of application references which will be automatically updated when the collection content changes

Inherited from [WorldCollection.apps](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#apps)

### invalidDocumentIds

`invalidDocumentIds: Set<string> = ...`

Record the set of document ids where the Document was not initialized because of invalid source data

Inherited from [WorldCollection.invalidDocumentIds](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#invaliddocumentids)

### documentName

`documentName: string = "Item"`

Overrides [WorldCollection.documentName](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#documentname)

---

## Accessors

### contents

```typescript
get contents(): V[]
```

Return an Array of all the entry values in the Collection

**Returns**  
`V[]`

Inherited from WorldCollection.contents

### directory

```typescript
get directory(): DocumentDirectory<ClientDocument>
```

Return a reference to the SidebarDirectory application for this WorldCollection.

**Returns**  
`DocumentDirectory<ClientDocument>`

Inherited from WorldCollection.directory

### documentClass

```typescript
get documentClass(): typeof Document
```

A reference to the Document class definition which is contained within this DocumentCollection.

**Returns**  
`typeof Document`

Inherited from WorldCollection.documentClass

### documentName

```typescript
get documentName(): any
```

**Returns**  
`any`

Inherited from WorldCollection.documentName

### folders

```typescript
get folders(): Collection<string, documents.Folder>
```

Reference the set of Folders which contain documents in this collection

**Returns**  
`Collection<string, documents.Folder>`

Inherited from WorldCollection.folders

### name

```typescript
get name(): string
```

The Collection class name

**Returns**  
`string`

Inherited from WorldCollection.name

### instance

```typescript
static get instance(): WorldCollection
```

Return a reference to the singleton instance of this WorldCollection, or null if it has not yet been created.

**Returns**  
`WorldCollection`

Inherited from WorldCollection.instance

### registeredSheets

```typescript
static get registeredSheets(): DocumentSheet[]
```

Return an array of currently registered sheet classes for this Document type.

**Returns**  
`DocumentSheet[]`

Inherited from WorldCollection.registeredSheets

---

## Methods

### _getVisibleTreeContents

```typescript
_getVisibleTreeContents(entry: any): any[]
```

**Parameters**

- **entry**: `any`

**Returns**  
`any[]`

Inherited from [WorldCollection._getVisibleTreeContents](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#_getvisibletreecontents)

### [iterator]

```typescript
"[iterator]"(): MapIterator<any>
```

Then iterating over a Collection, we should iterate over its values instead of over its entries.

**Returns**  
`MapIterator<any>`

Inherited from [WorldCollection.[iterator]](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#iterator)

### createDocument

```typescript
createDocument(
  data: object,
  context?: object,
): Document<object, DocumentConstructionContext>
```

Instantiate a Document for inclusion in the Collection.

**Parameters**

- **data**: `object`  
  The Document data.
- **context**: `object` = `{}`  
  Document creation context.

**Returns**  
`Document<object, DocumentConstructionContext>`

Inherited from [WorldCollection.createDocument](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#createdocument)

### delete

```typescript
delete(id: any): boolean
```

**Parameters**

- **id**: `any`

**Returns**  
`boolean`

Inherited from [WorldCollection.delete](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#delete)

### filter

```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns**  
`any[]`  
An Array of matched values

**See**

*Example: Filter the Collection for specific entries*

Inherited from [WorldCollection.filter](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#filter)

```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filters(entry => entry.slice(0) === "A");
```

### find

```typescript
find(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any
```

Find an entry in the Map using a functional condition.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

**Returns**  
`any`  
The value, if found, otherwise undefined

**See**

*Example: Create a new Collection and reference its contents*

Inherited from [WorldCollection.find](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#find)

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A"); // true
```

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection

**Parameters**

- **fn**: `(arg0: any) => void`  
  A function to apply to each element

**Returns**  
`void`

**See**

Array#forEach

*Example: Apply a function to each value in the collection*

Inherited from [WorldCollection.forEach](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#foreach)

```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

### fromCompendium

```typescript
fromCompendium(
  document: object | Document<object, DocumentConstructionContext>,
  options?: FromCompendiumOptions,
): object
```

Apply data transformations when importing a Document from a Compendium pack

**Parameters**

- **document**: `object | Document<object, DocumentConstructionContext>`  
  The source Document, or a plain data object
- **options**: `FromCompendiumOptions = {}`  
  Additional options which modify how the document is imported

**Returns**  
`object`  
The processed data ready for world Document creation

Inherited from [WorldCollection.fromCompendium](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#fromcompendium)

### get

```typescript
get(
  id: string,
  options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an element from the DocumentCollection by its ID.

**Parameters**

- **id**: `string`  
  The ID of the Document to retrieve.
- **options**: `{ invalid?: boolean; strict?: boolean } = {}`  
  Additional options to configure retrieval.

  - **invalid**?: `boolean`  
    Allow retrieving an invalid Document.
  - **strict**?: `boolean`  
    Throw an Error if the requested Document does not exist.

**Returns**  
`Document<object, DocumentConstructionContext>`

**Throws**  
If strict is true and the Document cannot be found.

Inherited from [WorldCollection.get](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#get)

### getInvalid

```typescript
getInvalid(
  id: string,
  options?: { strict?: boolean },
): void | Document<object, DocumentConstructionContext>
```

Obtain a temporary Document instance for a document id which currently has invalid source data.

**Parameters**

- **id**: `string`  
  A document ID with invalid source data.
- **options**: `{ strict?: boolean } = {}`  
  Additional options to configure retrieval.

  - **strict**?: `boolean`  
    Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

**Returns**  
`void | Document<object, DocumentConstructionContext>`  
An in-memory instance for the invalid Document

**Throws**  
If strict is true and the requested ID is not in the set of invalid IDs for this collection.

Inherited from [WorldCollection.getInvalid](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getinvalid)

### getName

```typescript
getName(
  name: string,
  options?: { strict?: boolean }
): any
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a "name" attribute.

**Parameters**

- **name**: `string`  
  The name of the entry to retrieve
- **options**: `{ strict?: boolean } = {}`  
  Additional options that affect how entries are retrieved

  - **strict**?: `boolean`  
    Throw an Error if the requested name does not exist. Default false.

**Returns**  
`any`  
The retrieved entry value, if one was found, otherwise undefined

**Example: Get an element from the Collection by name (if applicable)**

Inherited from [WorldCollection.getName](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getname)

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred"); // "Alfred"
c.getName("D");      // undefined
c.getName("D", {strict: true}); // throws Error
```

### importFromCompendium

```typescript
importFromCompendium(
  pack: CompendiumCollection,
  id: string,
  updateData?: object,
  options?: object,
): Promise<Document<object, DocumentConstructionContext>>
```

Import a Document from a Compendium collection, adding it to the current World.

**Parameters**

- **pack**: `CompendiumCollection`  
  The CompendiumCollection instance from which to import
- **id**: `string`  
  The ID of the compendium entry to import
- **updateData**: `object` = `{}`  
  Optional additional data used to modify the imported Document before it is created
- **options**: `object` = `{}`  
  Optional arguments passed to the [WorldCollection.fromCompendium](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#fromcompendium) and [Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create) methods

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
The imported Document instance

Inherited from [WorldCollection.importFromCompendium](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#importfromcompendium)

### map

```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters**

- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns**  
`any[]`  
An Array of transformed values

Inherited from [WorldCollection.map](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#map)

### reduce

```typescript
reduce(
  reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
  initial: any,
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters**

- **reducer**: `(arg0: any, arg1: any, arg2: number, arg3: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.
- **initial**: `any`  
  An initial value which accumulates with each iteration

**Returns**  
`any`  
The accumulated result

**See**

*Example: Reduce a collection to an array of transformed values*

Inherited from [WorldCollection.reduce](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#reduce)

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, ""); // "ABC"
```

### render

```typescript
render(force?: boolean, options?: object): void
```

Render any Applications associated with this DocumentCollection.

**Parameters**

- **force**: `boolean` = `false`  
  Force rendering
- **options**: `object` = `{}`  
  Optional options

**Returns**  
`void`

Inherited from [WorldCollection.render](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#render)

### search

```typescript
search(
  search: { exclude?: string[]; filters?: FieldFilter[]; query?: string },
): object[] | Document<object, DocumentConstructionContext>[]
```

Find all Documents which match a given search term using a full-text search against their indexed HTML fields and their name. If filters are provided, results are filtered to only those that match the provided values.

**Parameters**

- **search**: `{ exclude?: string[]; filters?: FieldFilter[]; query?: string }`  
  An object configuring the search

  - **exclude**?: `string[]`  
    An array of document IDs to exclude from search results
  - **filters**?: `FieldFilter[]`  
    An array of filters to apply
  - **query**?: `string`  
    A case-insensitive search string

**Returns**  
`object[] | Document<object, DocumentConstructionContext>[]`

Inherited from [WorldCollection.search](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#search)

### set

```typescript
set(id: any, document: any): void
```

**Parameters**

- **id**: `any`
- **document**: `any`

**Returns**  
`void`

Inherited from [WorldCollection.set](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#set)

### some

```typescript
some(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns**  
`boolean`  
Was the test condition passed by at least one entry?

Inherited from [WorldCollection.some](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#some)

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns**  
`object[]`  
An array of contained values

Inherited from [WorldCollection.toJSON](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#tojson)

### updateAll

```typescript
updateAll(
  transformation: object | Function,
  condition?: null | Function,
  options?: object,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update all objects in this DocumentCollection with a provided transformation. Conditionally filter to only apply to Entities which match a certain condition.

**Parameters**

- **transformation**: `object | Function`  
  An object of data or function to apply to all matched objects
- **condition**: `null | Function` = `null`  
  A function which tests whether to target each object
- **options**: `object` = `{}`  
  Additional options passed to Document.updateDocuments

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated data once the operation is complete

Inherited from [WorldCollection.updateAll](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#updateall)

---

## Protected Methods

### _initialize

```typescript
_initialize(): void
```

Initialize the DocumentCollection by constructing any initially provided Document instances

**Returns**  
`void`

Inherited from [WorldCollection._initialize](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#_initialize)

---

## Static Methods

### getSearchableFields

```typescript
static getSearchableFields(
  documentName: string,
  type?: string,
): Record<string, SearchableField>
```

Get the searchable fields for a given document or index, based on its data model

**Parameters**

- **documentName**: `string`  
  The document name
- **type**: `string` (optional)  
  A document subtype

**Returns**  
`Record<string, SearchableField>`  
A record of searchable DataField definitions

Inherited from [WorldCollection.getSearchableFields](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getsearchablefields)

### registerSheet

```typescript
static registerSheet(...args: any[]): void
```

Register a Document sheet class as a candidate which can be used to display Documents of a given type. See [foundry.applications.apps.DocumentSheetConfig.registerSheet for details](https://foundryvtt.com/api/classes/foundry.applications.apps.DocumentSheetConfig.html#registersheet).

**Parameters**

- **...args**: `any[]`  
  Arguments forwarded to the DocumentSheetConfig.registerSheet method

**Returns**  
`void`

**Example: Register a new ActorSheet subclass for use with certain Actor types.**

Inherited from [WorldCollection.registerSheet](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#registersheet)

```typescript
foundry.documents.collections.Actors.registerSheet("dnd5e", ActorSheet5eCharacter, {
  types: ["character"],
  makeDefault: true
});
```

### unregisterSheet

```typescript
static unregisterSheet(...args: any[]): void
```

Unregister a Document sheet class, removing it from the list of available sheet Applications to use. See [foundry.applications.apps.DocumentSheetConfig.unregisterSheet for details](https://foundryvtt.com/api/classes/foundry.applications.apps.DocumentSheetConfig.html#unregistersheet).

**Parameters**

- **...args**: `any[]`  
  Arguments forwarded to the DocumentSheetConfig.unregisterSheet method

**Returns**  
`void`

**Example: Deregister the default ActorSheet subclass to replace it with others.**

Inherited from [WorldCollection.unregisterSheet](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#unregistersheet)

```typescript
foundry.documents.collections.Actors.unregisterSheet("core", ActorSheet);
```

---

**Foundry Virtual Tabletop - API Documentation - Version 13**  
[https://foundryvtt.com/api/](https://foundryvtt.com/api/)