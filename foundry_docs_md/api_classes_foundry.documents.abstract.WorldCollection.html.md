# WorldCollection | Foundry Virtual Tabletop - API Documentation - Version 13

A collection of world-level Document objects with a singleton instance per primary Document type. Each primary Document type has an associated subclass of WorldCollection which contains them.

**See**  
[foundry.Game#collections](https://foundryvtt.com/api/classes/foundry.Game.html#collections)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.abstract.WorldCollection), Expand)  
* _DocumentCollection<this>_  
* **WorldCollection**  
  - [Actors](https://foundryvtt.com/api/classes/foundry.documents.collections.Actors.html)  
  - [CardStacks](https://foundryvtt.com/api/classes/foundry.documents.collections.CardStacks.html)  
  - [ChatMessages](https://foundryvtt.com/api/classes/foundry.documents.collections.ChatMessages.html)  
  - [CombatEncounters](https://foundryvtt.com/api/classes/foundry.documents.collections.CombatEncounters.html)  
  - [FogExplorations](https://foundryvtt.com/api/classes/foundry.documents.collections.FogExplorations.html)  
  - [Folders](https://foundryvtt.com/api/classes/foundry.documents.collections.Folders.html)  
  - [Items](https://foundryvtt.com/api/classes/foundry.documents.collections.Items.html)  
  - [Journal](https://foundryvtt.com/api/classes/foundry.documents.collections.Journal.html)  
  - [Macros](https://foundryvtt.com/api/classes/foundry.documents.collections.Macros.html)  
  - [Playlists](https://foundryvtt.com/api/classes/foundry.documents.collections.Playlists.html)  
  - [RollTables](https://foundryvtt.com/api/classes/foundry.documents.collections.RollTables.html)  
  - [Scenes](https://foundryvtt.com/api/classes/foundry.documents.collections.Scenes.html)  
  - [WorldSettings](https://foundryvtt.com/api/classes/foundry.documents.collections.WorldSettings.html)  
  - [Users](https://foundryvtt.com/api/classes/foundry.documents.collections.Users.html)  

---

## Constructors

### constructor

```typescript
new WorldCollection(data?: object[])
```

**Parameters**

- **data**: `object[] = []`  
  An array of data objects from which to create document instances.

**Returns**  
`WorldCollection`

_Inherited from [DocumentCollection.constructor](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#constructor)_

---

## Properties

### apps

`apps: ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>[]`  

An Array of application references which will be automatically updated when the collection content changes.

_Inherited from [DocumentCollection.apps](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#apps)_

### invalidDocumentIds

`invalidDocumentIds: Set<string> = ...`  

Record the set of document ids where the Document was not initialized because of invalid source data.

_Inherited from [DocumentCollection.invalidDocumentIds](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#invaliddocumentids)_

### documentName (Static)

`documentName: string`

---

## Accessors

### contents

```typescript
get contents(): V[]
```

Return an Array of all the entry values in the Collection.

**Returns**  
`V[]`

_Inherited from DirectoryCollectionMixin(DocumentCollection).contents_

### directory

```typescript
get directory(): DocumentDirectory<ClientDocument>
```

Return a reference to the SidebarDirectory application for this WorldCollection.

**Returns**  
`DocumentDirectory<ClientDocument>`

### documentClass

```typescript
get documentClass(): typeof Document
```

A reference to the Document class definition which is contained within this DocumentCollection.

**Returns**  
`typeof Document`

_Inherited from DirectoryCollectionMixin(DocumentCollection).documentClass_

### documentName

```typescript
get documentName(): any
```

**Returns**  
`any`

_Inherited from DirectoryCollectionMixin(DocumentCollection).documentName_

### folders

```typescript
get folders(): Collection<string, documents.Folder>
```

Reference the set of Folders which contain documents in this collection.

**Returns**  
`Collection<string, documents.Folder>`

### name

```typescript
get name(): string
```

The Collection class name.

**Returns**  
`string`

_Inherited from DirectoryCollectionMixin(DocumentCollection).name_

### instance (Static)

```typescript
get instance(): WorldCollection
```

Return a reference to the singleton instance of this WorldCollection, or null if it has not yet been created.

**Returns**  
`WorldCollection`

### registeredSheets (Static)

```typescript
get registeredSheets(): DocumentSheet[]
```

Return an array of currently registered sheet classes for this Document type.

---

## Methods

### _getVisibleTreeContents

```typescript
_getVisibleTreeContents(entry: any): any[]
```

**Parameter**

- **entry**: `any`  

**Returns**  
`any[]`

### [iterator]

```typescript
[iterator](): MapIterator<any>
```

Then iterating over a Collection, we should iterate over its values instead of over its entries.

**Returns**  
`MapIterator<any>`

_Inherited from [DocumentCollection.[iterator]](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#iterator)_

### createDocument

```typescript
createDocument(
  data: object, 
  context?: object
): Document<object, DocumentConstructionContext>
```

Instantiate a Document for inclusion in the Collection.

**Parameters**

- **data**: `object`  
  The Document data.

- **context**: `object = {}` (Optional)  
  Document creation context.

**Returns**  
`Document<object, DocumentConstructionContext>`

_Inherited from [DocumentCollection.createDocument](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#createdocument)_

### delete

```typescript
delete(id: any): boolean
```

**Parameters**

- **id**: `any`  

**Returns**  
`boolean`

_Inherited from [DocumentCollection.delete](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#delete)_

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
An Array of matched values.

**See**  
Example: Filter the Collection for specific entries.

_Inherited from [DocumentCollection.filter](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#filter)_

Example:  
```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filter(entry => entry.slice(0) === "A");
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
The value, if found, otherwise undefined.

**See**  
Example: Create a new Collection and reference its contents.

_Inherited from [DocumentCollection.find](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#find)_

Example:  
```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A"); // true
```

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection.

**Parameters**

- **fn**: `(arg0: any) => void`  
  A function to apply to each element.

**Returns**  
`void`

**See**  
Array#forEach

Example: Apply a function to each value in the collection.

_Inherited from [DocumentCollection.forEach](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#foreach)_

Example:  
```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

### fromCompendium

```typescript
fromCompendium(
  document: object | Document<object, DocumentConstructionContext>, 
  options?: FromCompendiumOptions
): object
```

Apply data transformations when importing a Document from a Compendium pack.

**Parameters**

- **document**: `object | Document<object, DocumentConstructionContext>`  
  The source Document, or a plain data object.

- **options**: `FromCompendiumOptions = {}` (Optional)  
  Additional options which modify how the document is imported.

**Returns**  
`object`  
The processed data ready for world Document creation.

### get

```typescript
get(
  id: string, 
  options?: { invalid?: boolean; strict?: boolean }
): Document<object, DocumentConstructionContext>
```

Get an element from the DocumentCollection by its ID.

**Parameters**

- **id**: `string`  
  The ID of the Document to retrieve.

- **options**: `{ invalid?: boolean; strict?: boolean } = {}` (Optional)  
  Additional options to configure retrieval.

  - **invalid**?: `boolean` (Optional)  
    Allow retrieving an invalid Document.

  - **strict**?: `boolean` (Optional)  
    Throw an Error if the requested Document does not exist.

**Returns**  
`Document<object, DocumentConstructionContext>`

**Throws**  
If strict is true and the Document cannot be found.

_Inherited from [DocumentCollection.get](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#get)_

### getInvalid

```typescript
getInvalid(
  id: string,
  options?: { strict?: boolean }
): void | Document<object, DocumentConstructionContext>
```

Obtain a temporary Document instance for a document id which currently has invalid source data.

**Parameters**

- **id**: `string`  
  A document ID with invalid source data.

- **options**: `{ strict?: boolean } = {}` (Optional)  
  Additional options to configure retrieval.

  - **strict**?: `boolean` (Optional)  
    Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

**Returns**  
`void` | `Document<object, DocumentConstructionContext>`  
An in-memory instance for the invalid Document.

**Throws**  
If strict is true and the requested ID is not in the set of invalid IDs for this collection.

_Inherited from [DocumentCollection.getInvalid](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getinvalid)_

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
  The name of the entry to retrieve.

- **options**: `{ strict?: boolean } = {}` (Optional)  
  Additional options that affect how entries are retrieved.

  - **strict**?: `boolean` (Optional)  
    Throw an Error if the requested name does not exist. Default false.

**Returns**  
`any`  
The retrieved entry value, if one was found, otherwise undefined.

**Example**  
_Inherited from [DocumentCollection.getName](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getname)_

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");  // "Alfred"
c.getName("D");       // undefined
c.getName("D", {strict: true}); // throws Error
```

### importFromCompendium

```typescript
importFromCompendium(
  pack: CompendiumCollection, 
  id: string, 
  updateData?: object, 
  options?: object
): Promise<Document<object, DocumentConstructionContext>>
```

Import a Document from a Compendium collection, adding it to the current World.

**Parameters**

- **pack**: `CompendiumCollection`  
  The CompendiumCollection instance from which to import.

- **id**: `string`  
  The ID of the compendium entry to import.

- **updateData**: `object = {}` (Optional)  
  Optional additional data used to modify the imported Document before it is created.

- **options**: `object = {}` (Optional)  
  Optional arguments passed to the [fromCompendium](#fromCompendium) and [Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create) methods.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
The imported Document instance.

### map

```typescript
map(
  transformer: (arg0: any, arg1: number, arg2: Collection) => any
): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters**

- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns**  
`any[]`  
An Array of transformed values.

_Inherited from [DocumentCollection.map](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#map)_

### reduce

```typescript
reduce(
  reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
  initial: any
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters**

- **reducer**: `(arg0: any, arg1: any, arg2: number, arg3: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.

- **initial**: `any`  
  An initial value which accumulates with each iteration.

**Returns**  
`any`  
The accumulated result.

**See**  
Example: Reduce a collection to an array of transformed values.

_Inherited from [DocumentCollection.reduce](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#reduce)_

Example:  
```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, "");  // "ABC"
```

### render

```typescript
render(force?: boolean, options?: object): void
```

Render any Applications associated with this DocumentCollection.

**Parameters**

- **force**: `boolean = false` (Optional)  
  Force rendering.

- **options**: `object = {}` (Optional)  
  Optional options.

**Returns**  
`void`

_Inherited from [DocumentCollection.render](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#render)_

### search

```typescript
search(
  search: { exclude?: string[]; filters?: FieldFilter[]; query?: string }
): object[] | Document<object, DocumentConstructionContext>[]
```

Find all Documents which match a given search term using a full-text search against their indexed HTML fields and their name. If filters are provided, results are filtered to only those that match the provided values.

**Parameters**

- **search**:  
  An object configuring the search.

  - **exclude**?: `string[]` (Optional)  
    An array of document IDs to exclude from search results.

  - **filters**?: `FieldFilter[]` (Optional)  
    An array of filters to apply.

  - **query**?: `string` (Optional)  
    A case-insensitive search string.

**Returns**  
`object[] | Document<object, DocumentConstructionContext>[]`

_Inherited from [DocumentCollection.search](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#search)_

### set

```typescript
set(id: any, document: any): void
```

**Parameters**

- **id**: `any`  
- **document**: `any`  

**Returns**  
`void`

_Inherited from [DocumentCollection.set](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#set)_

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

_Inherited from [DocumentCollection.some](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#some)_

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns**  
`object[]`  
An array of contained values.

_Inherited from [DocumentCollection.toJSON](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#tojson)_

### updateAll

```typescript
updateAll(
  transformation: object | Function,
  condition?: null | Function,
  options?: object
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update all objects in this DocumentCollection with a provided transformation. Conditionally filter to only apply to Entities which match a certain condition.

**Parameters**

- **transformation**: `object | Function`  
  An object of data or function to apply to all matched objects.

- **condition**: `null | Function = null` (Optional)  
  A function which tests whether to target each object.

- **options**: `object = {}` (Optional)  
  Additional options passed to Document.updateDocuments.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated data once the operation is complete.

_Inherited from [DocumentCollection.updateAll](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#updateall)_

### _initialize (Protected)

```typescript
_initialize(): void
```

Initialize the DocumentCollection by constructing any initially provided Document instances.

**Returns**  
`void`

_Inherited from [DocumentCollection._initialize](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#_initialize)_

### getSearchableFields (Static)

```typescript
getSearchableFields(documentName: string, type?: string): Record<string, SearchableField>
```

Get the searchable fields for a given document or index, based on its data model.

**Parameters**

- **documentName**: `string`  
  The document name.

- **type**: `string` (Optional)  
  A document subtype.

**Returns**  
`Record<string, SearchableField>`  
A record of searchable DataField definitions.

_Inherited from [DocumentCollection.getSearchableFields](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getsearchablefields)_

### registerSheet (Static)

```typescript
registerSheet(...args: any[]): void
```

Register a Document sheet class as a candidate which can be used to display Documents of a given type.

**Parameters**

- **...args**: `any[]`  
  Arguments forwarded to the DocumentSheetConfig.registerSheet method.

**Returns**  
`void`

**Example**  
Register a new ActorSheet subclass for use with certain Actor types.

```typescript
foundry.documents.collections.Actors.registerSheet("dnd5e", ActorSheet5eCharacter, {
  types: ["character"],
  makeDefault: true
});
```

### unregisterSheet (Static)

```typescript
unregisterSheet(...args: any[]): void
```

Unregister a Document sheet class, removing it from the list of available sheet Applications to use.

**Parameters**

- **...args**: `any[]`  
  Arguments forwarded to the DocumentSheetConfig.unregisterSheet method.

**Returns**  
`void`

**Example**  
Deregister the default ActorSheet subclass to replace it with others.

```typescript
foundry.documents.collections.Actors.unregisterSheet("core", ActorSheet);
```

---

**Foundry Virtual Tabletop - API Documentation - Version 13**  
[https://foundryvtt.com/api/index.html](https://foundryvtt.com/api/index.html)