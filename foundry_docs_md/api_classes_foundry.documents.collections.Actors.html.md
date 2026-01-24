# Actors | Foundry Virtual Tabletop - API Documentation - Version 13

The singleton collection of Actor documents which exist within the active World. This Collection is accessible within the Game object as `game.actors`.

**See**

- [`foundry.documents.Actor`](https://foundryvtt.com/api/classes/foundry.documents.Actor.html): The Actor document  
- [`foundry.applications.sidebar.tabs.ActorDirectory`](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ActorDirectory.html): The ActorDirectory sidebar directory

**Example: Retrieve an existing Actor by its id**

```typescript
let actor = game.actors.get(actorId);
```

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.collections.Actors), Expand)

- *WorldCollection*  
- **Actors**

---

## Constructors

### constructor

```typescript
new Actors(data?: object[]): Actors
```

**Parameters**

- **data**: `object[]` = `[]`  
  An array of data objects from which to create document instances.

**Returns**  
`Actors`

*Inherited from* [`WorldCollection.constructor`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#constructor)

---

## Properties

### apps

```typescript
apps: ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>[]
```

An array of application references which will be automatically updated when the collection content changes.

*Inherited from* [`WorldCollection.apps`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#apps)

---

### invalidDocumentIds

```typescript
invalidDocumentIds: Set<string> = ...
```

Record the set of document ids where the Document was not initialized because of invalid source data.

*Inherited from* [`WorldCollection.invalidDocumentIds`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#invaliddocumentids)

---

### Static

#### documentName

```typescript
static documentName: string = "Actor"
```

Overrides [`WorldCollection.documentName`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#documentname)

---

### Accessors

#### contents

```typescript
get contents(): V[]
```

Return an array of all the entry values in the Collection.

**Returns**  
`V[]`

*Inherited from* WorldCollection.contents

---

#### directory

```typescript
get directory(): DocumentDirectory<ClientDocument>
```

Return a reference to the SidebarDirectory application for this WorldCollection.

**Returns**  
`DocumentDirectory<ClientDocument>`

*Inherited from* WorldCollection.directory

---

#### documentClass

```typescript
get documentClass(): typeof Document
```

A reference to the Document class definition which is contained within this DocumentCollection.

**Returns**  
`typeof Document`

*Inherited from* WorldCollection.documentClass

---

#### documentName

```typescript
get documentName(): any
```

**Returns**  
`any`

*Inherited from* WorldCollection.documentName

---

#### folders

```typescript
get folders(): Collection<string, documents.Folder>
```

Reference the set of Folders which contain documents in this collection.

**Returns**  
`Collection<string, documents.Folder>`

*Inherited from* WorldCollection.folders

---

#### name

```typescript
get name(): string
```

The Collection class name.

**Returns**  
`string`

*Inherited from* WorldCollection.name

---

#### tokens

```typescript
get tokens(): Record<string, documents.Actor>
```

A mapping of synthetic Token Actors which are currently active within the viewed Scene. Each Actor is referenced by the [Token.id](http://token.id/).

**Returns**  
`Record<string, documents.Actor>`

---

### Static

#### instance

```typescript
static get instance(): WorldCollection
```

Return a reference to the singleton instance of this WorldCollection, or null if it has not yet been created.

**Returns**  
`WorldCollection`

*Inherited from* WorldCollection.instance

---

#### registeredSheets

```typescript
static get registeredSheets(): DocumentSheet[]
```

Return an array of currently registered sheet classes for this Document type.

**Returns**  
`DocumentSheet[]`

*Inherited from* WorldCollection.registeredSheets

---

## Methods

### _getVisibleTreeContents

```typescript
_getVisibleTreeContents(entry: any): any[]
```

*Inherited from* [`WorldCollection._getVisibleTreeContents`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#_getvisibletreecontents)

**Parameters**

- **entry**: `any`

**Returns**  
`any[]`

---

### [iterator]

```typescript
"[iterator]"(): MapIterator<any>
```

Then iterating over a Collection, we should iterate over its values instead of over its entries.

**Returns**  
`MapIterator<any>`

*Inherited from* [`WorldCollection.[iterator]`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#iterator)

---

### createDocument

```typescript
createDocument(
    data: object,
    context?: object,
): Document<object, DocumentConstructionContext>
```

Instantiate a Document for inclusion in the Collection.

*Inherited from* [`WorldCollection.createDocument`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#createdocument)

**Parameters**

- **data**: `object`  
  The Document data.
- **context**: `object` = `{}` (Optional)  
  Document creation context.

**Returns**  
`Document<object, DocumentConstructionContext>`

---

### delete

```typescript
delete(id: any): boolean
```

*Inherited from* [`WorldCollection.delete`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#delete)

**Parameters**

- **id**: `any`

**Returns**  
`boolean`

---

### filter

```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

*Inherited from* [`WorldCollection.filter`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#filter)

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns**  
`any[]`

**Example**

```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filters(entry => entry.slice(0) === "A");
```

---

### find

```typescript
find(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any
```

Find an entry in the Map using a functional condition.

*Inherited from* [`WorldCollection.find`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#find)

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

**Returns**  
The value, if found, otherwise `undefined`.

**Example**

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A");  // true
```

---

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection.

*Inherited from* [`WorldCollection.forEach`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#foreach)

**Parameters**

- **fn**: `(arg0: any) => void`  
  A function to apply to each element.

**Returns**  
`void`

**Example**

```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

---

### fromCompendium

```typescript
fromCompendium(document: any, options: any): object
```

Apply data transformations when importing a Document from a Compendium pack.

*Overrides* [`WorldCollection.fromCompendium`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#fromcompendium)

**Parameters**

- **document**: `any`  
  The source Document, or a plain data object.
- **options**: `any`  
  Additional options which modify how the document is imported.

**Returns**  
`object`  
The processed data ready for world Document creation.

---

### get

```typescript
get(
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an element from the DocumentCollection by its ID.

*Inherited from* [`WorldCollection.get`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#get)

**Parameters**

- **id**: `string`  
  The ID of the Document to retrieve.
- **options**: `{ invalid?: boolean; strict?: boolean }` = `{}` (Optional)  
  Additional options to configure retrieval.
  - **invalid**?: `boolean`  
    Allow retrieving an invalid Document.
  - **strict**?: `boolean`  
    Throw an Error if the requested Document does not exist.

**Returns**  
`Document<object, DocumentConstructionContext>`

**Throws**  
If `strict` is true and the Document cannot be found.

---

### getInvalid

```typescript
getInvalid(
    id: string,
    options?: { strict?: boolean },
): void | Document<object, DocumentConstructionContext>
```

Obtain a temporary Document instance for a document id which currently has invalid source data.

*Inherited from* [`WorldCollection.getInvalid`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getinvalid)

**Parameters**

- **id**: `string`  
  A document ID with invalid source data.
- **options**: `{ strict?: boolean }` = `{}` (Optional)  
  Additional options to configure retrieval.
  - **strict**?: `boolean`  
    Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

**Returns**  
`void` or `Document<object, DocumentConstructionContext>`  
An in-memory instance for the invalid Document.

**Throws**  
If `strict` is true and the requested ID is not in the set of invalid IDs for this collection.

---

### getName

```typescript
getName(name: string, options?: { strict?: boolean }): any
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a `"name"` attribute.

*Inherited from* [`WorldCollection.getName`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getname)

**Parameters**

- **name**: `string`  
  The name of the entry to retrieve.
- **options**: `{ strict?: boolean }` = `{}` (Optional)  
  Additional options that affect how entries are retrieved.
  - **strict**?: `boolean`  
    Throw an Error if the requested name does not exist. Default false.

**Returns**  
The retrieved entry value, if one was found, otherwise `undefined`.

**Example**

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");  // "Alfred"
c.getName("D");       // undefined
c.getName("D", {strict: true});  // throws Error
```

---

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

*Inherited from* [`WorldCollection.importFromCompendium`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#importfromcompendium)

**Parameters**

- **pack**: `CompendiumCollection`  
  The CompendiumCollection instance from which to import.
- **id**: `string`  
  The ID of the compendium entry to import.
- **updateData**: `object` = `{}` (Optional)  
  Optional additional data used to modify the imported Document before it is created.
- **options**: `object` = `{}` (Optional)  
  Optional arguments passed to the [`WorldCollection.fromCompendium`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#fromcompendium) and [`Document.create`](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create) methods.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>>`  
The imported Document instance.

---

### map

```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

*Inherited from* [`WorldCollection.map`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#map)

**Parameters**

- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns**  
`any[]`  
An array of transformed values.

---

### reduce

```typescript
reduce(
    reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
    initial: any,
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

*Inherited from* [`WorldCollection.reduce`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#reduce)

**Parameters**

- **reducer**: `(arg0: any, arg1: any, arg2: number, arg3: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.
- **initial**: `any`  
  An initial value which accumulates with each iteration.

**Returns**  
`any`  
The accumulated result.

**Example**

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, "");  // "ABC"
```

---

### render

```typescript
render(force?: boolean, options?: object): void
```

Render any Applications associated with this DocumentCollection.

*Inherited from* [`WorldCollection.render`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#render)

**Parameters**

- **force**: `boolean` = `false` (Optional)  
  Force rendering.
- **options**: `object` = `{}` (Optional)  
  Optional options.

**Returns**  
`void`

---

### search

```typescript
search(
    search: {
        exclude?: string[],
        filters?: FieldFilter[],
        query?: string
    },
): object[] | Document<object, DocumentConstructionContext>[]
```

Find all Documents which match a given search term using a full-text search against their indexed HTML fields and their name. If filters are provided, results are filtered to only those that match the provided values.

*Inherited from* [`WorldCollection.search`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#search)

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

---

### set

```typescript
set(id: any, document: any): void
```

*Inherited from* [`WorldCollection.set`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#set)

**Parameters**

- **id**: `any`
- **document**: `any`

**Returns**  
`void`

---

### some

```typescript
some(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): boolean
```

Test whether a condition is met by some entry in the Collection.

*Inherited from* [`WorldCollection.some`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#some)

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns**  
`boolean`  
Was the test condition passed by at least one entry?

---

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

*Inherited from* [`WorldCollection.toJSON`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#tojson)

**Returns**  
`object[]`  
An array of contained values.

---

### updateAll

```typescript
updateAll(
    transformation: object | Function,
    condition?: null | Function,
    options?: object,
): Promise<Document<object, DocumentConstructionContext>[]>
```

Update all objects in this DocumentCollection with a provided transformation. Conditionally filter to only apply to Entities which match a certain condition.

*Inherited from* [`WorldCollection.updateAll`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#updateall)

**Parameters**

- **transformation**: `object | Function`  
  An object of data or function to apply to all matched objects.
- **condition**: `null | Function` = `null` (Optional)  
  A function which tests whether to target each object.
- **options**: `object` = `{}` (Optional)  
  Additional options passed to Document.updateDocuments.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated data once the operation is complete.

---

### _initialize

```typescript
protected _initialize(): void
```

Initialize the DocumentCollection by constructing any initially provided Document instances.

*Inherited from* [`WorldCollection._initialize`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#_initialize)

---

## Static Methods

### getSearchableFields

```typescript
static getSearchableFields(
    documentName: string,
    type?: string,
): Record<string, SearchableField>
```

Get the searchable fields for a given document or index, based on its data model.

*Inherited from* [`WorldCollection.getSearchableFields`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getsearchablefields)

**Parameters**

- **documentName**: `string`  
  The document name.
- **type**: `string` (Optional)  
  A document subtype.

**Returns**  
`Record<string, SearchableField>`  
A record of searchable DataField definitions.

---

### registerSheet

```typescript
static registerSheet(...args: any[]): void
```

Register a Document sheet class as a candidate which can be used to display Documents of a given type.

See [`DocumentSheetConfig.registerSheet`](https://foundryvtt.com/api/classes/foundry.applications.apps.DocumentSheetConfig.html#registersheet) for details.

*Inherited from* [`WorldCollection.registerSheet`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#registersheet)

**Parameters**

- **...args**: `any[]`  
  Arguments forwarded to the DocumentSheetConfig.registerSheet method.

**Returns**  
`void`

**Example**

```typescript
foundry.documents.collections.Actors.registerSheet("dnd5e", ActorSheet5eCharacter, {
  types: ["character"],
  makeDefault: true
});
```

---

### unregisterSheet

```typescript
static unregisterSheet(...args: any[]): void
```

Unregister a Document sheet class, removing it from the list of available sheet Applications to use. See [`DocumentSheetConfig.unregisterSheet`](https://foundryvtt.com/api/classes/foundry.applications.apps.DocumentSheetConfig.html#unregistersheet) for details.

*Inherited from* [`WorldCollection.unregisterSheet`](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#unregistersheet)

**Parameters**

- **...args**: `any[]`  
  Arguments forwarded to the DocumentSheetConfig.unregisterSheet method.

**Returns**  
`void`

**Example**

```typescript
foundry.documents.collections.Actors.unregisterSheet("core", ActorSheet);
```