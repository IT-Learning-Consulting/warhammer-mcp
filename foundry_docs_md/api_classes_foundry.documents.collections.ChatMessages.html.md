# ChatMessages | Foundry Virtual Tabletop - API Documentation - Version 13

The singleton collection of ChatMessage documents which exist within the active World. This Collection is accessible within the Game object as `game.messages`.

**See**

- [foundry.documents.ChatMessage: The ChatMessage document](https://foundryvtt.com/api/classes/foundry.documents.ChatMessage.html)  
- [foundry.applications.sidebar.tabs.ChatLog: The ChatLog sidebar directory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ChatLog.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.collections.ChatMessages), Expand)

- _WorldCollection_
- **ChatMessages**

---

## Constructors

### constructor

```typescript
new ChatMessages(data?: object[]): ChatMessages
```

**Parameters**

- **data**: `object[]` = `[]`  
  An array of data objects from which to create document instances.

**Returns**  
`ChatMessages`

Inherited from [WorldCollection.constructor](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#constructor)

---

## Properties

### apps

`apps: ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>[]`  
An Array of application references which will be automatically updated when the collection content changes.

Inherited from [WorldCollection.apps](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#apps)

### invalidDocumentIds

`invalidDocumentIds: Set<string> = ...`  
Record the set of document ids where the Document was not initialized because of invalid source data.

Inherited from [WorldCollection.invalidDocumentIds](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#invaliddocumentids)

### Static: documentName

`documentName: string = "ChatMessage"`  
Overrides [WorldCollection.documentName](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#documentname)

---

## Accessors

### contents

```typescript
get contents(): V[]
```

Return an Array of all the entry values in the Collection.

Returns `V[]`  
Inherited from [WorldCollection.contents](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#constructorcollectionv)

### directory

```typescript
get directory(): any
```

Overrides WorldCollection.directory

Returns `any`

### documentClass

```typescript
get documentClass(): typeof Document
```

A reference to the Document class definition which is contained within this DocumentCollection.

Returns `typeof Document`

Inherited from [WorldCollection.documentClass](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#documentClass)

### documentName

```typescript
get documentName(): any
```

Overrides WorldCollection.documentName

Returns `any`

### folders

```typescript
get folders(): Collection<string, documents.Folder>
```

Reference the set of Folders which contain documents in this collection.

Returns `Collection<string, documents.Folder>`

Inherited from [WorldCollection.folders](https://foundryvtt.com/api/classes/foundry.utils.Collection.html)

### name

```typescript
get name(): string
```

The Collection class name.

Returns `string`

Inherited from [WorldCollection.name](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#name)

### Static: instance

```typescript
get instance(): WorldCollection
```

Return a reference to the singleton instance of this WorldCollection, or null if it has not yet been created.

Returns `WorldCollection`

Inherited from [WorldCollection.instance](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#instance)

### Static: registeredSheets

```typescript
get registeredSheets(): DocumentSheet[]
```

Return an array of currently registered sheet classes for this Document type.

Returns `DocumentSheet[]`

Inherited from [WorldCollection.registeredSheets](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#registeredSheets)

---

## Methods

### _getVisibleTreeContents

```typescript
_getVisibleTreeContents(entry: any): any[]
```

**Parameters**

- **entry**: `any`

Returns `any[]`

Inherited from [WorldCollection._getVisibleTreeContents](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#_getVisibleTreeContents)

---

### [iterator]

```typescript
[Symbol.iterator](): MapIterator<any>
```

When iterating over a Collection, iterate over its values instead of its entries.

Returns `MapIterator<any>`

Inherited from [WorldCollection.[iterator]](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#iterator)

---

### createDocument

```typescript
createDocument(
  data: object,
  context?: object,
): Document<object, DocumentConstructionContext>
```

Instantiate a Document for inclusion in the Collection.

**Parameters**

- **data**: `object` — The Document data.
- **context**: `object` = `{}` (Optional) — Document creation context.

Returns  
`Document<object, DocumentConstructionContext>`

Inherited from [WorldCollection.createDocument](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#createDocument)

---

### delete

```typescript
delete(id: any): boolean
```

**Parameters**

- **id**: `any`

Returns `boolean`

Inherited from [WorldCollection.delete](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#delete)

---

### export

```typescript
export(): void
```

Handle export of the chat log to a text file.

Returns `void`

---

### filter

```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

Returns `any[]`  
An Array of matched values.

**See**

Example: Filter the Collection for specific entries

Inherited from [WorldCollection.filter](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#filter)

Example usage:
```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filter(entry => entry.slice(0) === "A");
```

---

### find

```typescript
find(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any
```

Find an entry in the Map using a functional condition.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

Returns `any`  
The value, if found, otherwise undefined.

**See**

Example: Create a new Collection and reference its contents

Inherited from [WorldCollection.find](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#find)

Example usage:
```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A");  // true
```

---

### flush

```typescript
flush(): Promise<any>
```

Allow for bulk deletion of all chat messages, confirm first with a yes/no dialog.

Returns `Promise<any>`

---

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection.

**Parameters**

- **fn**: `(arg0: any) => void` — A function to apply to each element.

Returns `void`

**See**  
Array#forEach

Example: Apply a function to each value in the collection

Inherited from [WorldCollection.forEach](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#forEach)

Example usage:
```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

---

### fromCompendium

```typescript
fromCompendium(
  document: object | Document<object, DocumentConstructionContext>,
  options?: FromCompendiumOptions,
): object
```

Apply data transformations when importing a Document from a Compendium pack.

**Parameters**

- **document**: `object | Document<object, DocumentConstructionContext>` — The source Document, or a plain data object.
- **options**: `FromCompendiumOptions = {}` (Optional) — Additional options which modify how the document is imported.

Returns `object`  
The processed data ready for world Document creation.

Inherited from [WorldCollection.fromCompendium](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#fromCompendium)

---

### get

```typescript
get(
  id: string,
  options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an element from the DocumentCollection by its ID.

**Parameters**

- **id**: `string` — The ID of the Document to retrieve.
- **options**: `{ invalid?: boolean; strict?: boolean } = {}` (Optional)  
  Additional options to configure retrieval.  
  - `invalid?`: `boolean` — Allow retrieving an invalid Document.  
  - `strict?`: `boolean` — Throw an Error if the requested Document does not exist.

Returns  
`Document<object, DocumentConstructionContext>`

**Throws**  
If `strict` is true and the Document cannot be found.

Inherited from [WorldCollection.get](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#get)

---

### getInvalid

```typescript
getInvalid(
  id: string,
  options?: { strict?: boolean },
): void | Document<object, DocumentConstructionContext>
```

Obtain a temporary Document instance for a document id which currently has invalid source data.

**Parameters**

- **id**: `string` — A document ID with invalid source data.
- **options**: `{ strict?: boolean } = {}` (Optional)  
  Additional options to configure retrieval.  
  - `strict?`: `boolean` — Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

Returns `void` | `Document<object, DocumentConstructionContext>`  
An in-memory instance for the invalid Document.

**Throws**  
If `strict` is true and the requested ID is not in the set of invalid IDs for this collection.

Inherited from [WorldCollection.getInvalid](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getInvalid)

---

### getName

```typescript
getName(name: string, options?: { strict?: boolean }): any
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a `name` attribute.

**Parameters**

- **name**: `string` — The name of the entry to retrieve.
- **options**: `{ strict?: boolean } = {}` (Optional)  
  Additional options that affect how entries are retrieved.  
  - `strict?`: `boolean` — Throw an Error if the requested name does not exist. Default false.

Returns `any`  
The retrieved entry value, if one was found, otherwise undefined.

Inherited from [WorldCollection.getName](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getName)

Example usage:
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

**Parameters**

- **pack**: `CompendiumCollection` — The CompendiumCollection instance from which to import.
- **id**: `string` — The ID of the compendium entry to import.
- **updateData**: `object = {}` (Optional) — Optional additional data used to modify the imported Document before it is created.
- **options**: `object = {}` (Optional) — Optional arguments passed to the  
  [WorldCollection.fromCompendium](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#fromCompendium) and  
  [Document.create](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#create) methods.

Returns  
`Promise<Document<object, DocumentConstructionContext>>`  
The imported Document instance.

Inherited from [WorldCollection.importFromCompendium](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#importFromCompendium)

---

### map

```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters**

- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

Returns `any[]`  
An Array of transformed values.

Inherited from [WorldCollection.map](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#map)

---

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
- **initial**: `any` — An initial value which accumulates with each iteration.

Returns `any`  
The accumulated result.

**See**

Example: Reduce a collection to an array of transformed values.

Inherited from [WorldCollection.reduce](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#reduce)

Example usage:
```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, "");  // "ABC"
```

---

### render

```typescript
render(force?: boolean): void
```

**Parameters**

- **force**: `boolean` = `false`

Returns `void`

Overrides [WorldCollection.render](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#render)

---

### sayBubble

```typescript
sayBubble(message: documents.ChatMessage): void
```

If requested, dispatch a Chat Bubble UI for the newly created message.

**Parameters**

- **message**: `documents.ChatMessage` — The ChatMessage document to say.

Returns `void`

---

### search

```typescript
search(
  search: { exclude?: string[]; filters?: FieldFilter[]; query?: string },
): object[] | Document<object, DocumentConstructionContext>[]
```

Find all Documents which match a given search term using a full-text search against their indexed HTML fields and their name. If filters are provided, results are filtered to only those that match the provided values.

**Parameters**

- **search**: `{ exclude?: string[]; filters?: FieldFilter[]; query?: string }` — An object configuring the search.
  - `exclude?`: `string[]` (Optional) — An array of document IDs to exclude from search results.
  - `filters?`: `FieldFilter[]` (Optional) — An array of filters to apply.
  - `query?`: `string` (Optional) — A case-insensitive search string.

Returns `object[] | Document<object, DocumentConstructionContext>[]`

Inherited from [WorldCollection.search](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#search)

---

### set

```typescript
set(id: any, document: any): void
```

**Parameters**

- **id**: `any`
- **document**: `any`

Returns `void`

Inherited from [WorldCollection.set](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#set)

---

### some

```typescript
some(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

Returns `boolean`  
Was the test condition passed by at least one entry?

**See**  
Inherited from [WorldCollection.some](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#some)

---

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

Returns `object[]`  
An array of contained values.

Inherited from [WorldCollection.toJSON](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#toJSON)

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

**Parameters**

- **transformation**: `object | Function` — An object of data or function to apply to all matched objects.
- **condition**: `null | Function` = `null` (Optional) — A function which tests whether to target each object.
- **options**: `object` = `{}` (Optional) — Additional options passed to Document.updateDocuments.

Returns `Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated data once the operation is complete.

Inherited from [WorldCollection.updateAll](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#updateAll)

---

### Protected: _initialize

```typescript
_initialize(): void
```

Protected  
Initialize the DocumentCollection by constructing any initially provided Document instances.

Returns `void`

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

Get the searchable fields for a given document or index, based on its data model.

**Parameters**

- **documentName**: `string` — The document name.
- **type**: `string` (Optional) — A document subtype.

Returns  
`Record<string, SearchableField>`  
A record of searchable DataField definitions.

Inherited from [WorldCollection.getSearchableFields](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#getSearchableFields)

---

### registerSheet

```typescript
static registerSheet(...args: any[]): void
```

Register a Document sheet class as a candidate which can be used to display Documents of a given type. See [DocumentSheetConfig.registerSheet for details](https://foundryvtt.com/api/classes/foundry.applications.apps.DocumentSheetConfig.html#registerSheet).

**Parameters**

- `...args`: `any[]` — Arguments forwarded to the DocumentSheetConfig.registerSheet method.

Returns `void`

**Example:**  
Register a new ActorSheet subclass for use with certain Actor types.

Inherited from [WorldCollection.registerSheet](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#registerSheet)

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

Unregister a Document sheet class, removing it from the list of available sheet Applications to use. See [DocumentSheetConfig.unregisterSheet for details](https://foundryvtt.com/api/classes/foundry.applications.apps.DocumentSheetConfig.html#unregisterSheet).

**Parameters**

- `...args`: `any[]` — Arguments forwarded to the DocumentSheetConfig.unregisterSheet method.

Returns `void`

**Example:**  
Deregister the default ActorSheet subclass to replace it with others.

Inherited from [WorldCollection.unregisterSheet](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html#unregisterSheet)

```typescript
foundry.documents.collections.Actors.unregisterSheet("core", ActorSheet);
```

---

# References

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)