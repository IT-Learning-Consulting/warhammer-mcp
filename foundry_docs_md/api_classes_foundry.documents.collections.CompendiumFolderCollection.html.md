# CompendiumFolderCollection

A Collection of Folder documents within a Compendium pack.

## Hierarchy
- [DocumentCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)
- **CompendiumFolderCollection**

---

## Properties

### apps
- **Type:** `ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>[]`
- An Array of application references which will be automatically updated when the collection content changes
- *Inherited from* [DocumentCollection.apps](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#apps)

### invalidDocumentIds
- **Type:** `Set<string>` = ...
- Record the set of document ids where the Document was not initialized because of invalid source data
- *Inherited from* [DocumentCollection.invalidDocumentIds](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#invaliddocumentids)

### pack
- **Type:** [CompendiumCollection](https://foundryvtt.com/api/classes/foundry.documents.collections.CompendiumCollection.html)
- The CompendiumCollection instance that contains this CompendiumFolderCollection

---

## Accessors

### Static: documentName
- **Type:** `string`
- The base Document type which is contained within this DocumentCollection
- *Inherited from* [DocumentCollection.documentName](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#documentname)

### contents
```typescript
get contents(): V[]
```
- Return an Array of all the entry values in the Collection
- **Returns:** `V[]`
- *Inherited from* DocumentCollection.contents

### documentClass
```typescript
get documentClass(): typeof Document
```
- A reference to the Document class definition which is contained within this DocumentCollection.
- **Returns:** `typeof Document`
- *Inherited from* DocumentCollection.documentClass

### documentName
```typescript
get documentName(): string
```
- **Returns:** `string`
- Overrides DocumentCollection.documentName

---

## Methods

### name
```typescript
get name(): string
```
- The Collection class name
- **Returns:** `string`
- *Inherited from* DocumentCollection.name

### _onModifyContents
```typescript
_onModifyContents(
    action: any,
    documents: any,
    result: any,
    operation: any,
    user: any,
): void
```
- Overrides [DocumentCollection._onModifyContents](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#_onmodifycontents)
- **Parameters:**
  - **action:** `any`
  - **documents:** `any`
  - **result:** `any`
  - **operation:** `any`
  - **user:** `any`
- **Returns:** `void`

### [iterator]
```typescript
"[iterator]"(): MapIterator<any>
```
- Then iterating over a Collection, we should iterate over its values instead of over its entries
- **Returns:** `MapIterator<any>`
- *Inherited from* [DocumentCollection.[iterator]](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#iterator)

### createDocument
```typescript
createDocument(
    data: object,
    context?: object,
): Document<object, DocumentConstructionContext>
```
- Instantiate a Document for inclusion in the Collection.
- **Parameters:**
  - **data:** `object` — The Document data.
  - **Optional** **context:** `object` = `{}` — Document creation context.
- **Returns:** [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, DocumentConstructionContext>
- *Inherited from* [DocumentCollection.createDocument](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#createdocument)

### delete
```typescript
delete(id: any): boolean
```
- *Inherited from* [DocumentCollection.delete](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#delete)
- **Parameters:**
  - **id:** `any`
- **Returns:** `boolean`

### filter
```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any[]
```
- Filter the Collection, returning an Array of entries which match a functional condition.
- **Parameters:**
  - **condition:** `(arg0: any, arg1: number, arg2: Collection) => boolean`  
    The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.
- **Returns:** `any[]` — An Array of matched values
- **See Example:** Filter the Collection for specific entries  
  ```typescript
  let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
  let hasA = c.filter(entry => entry.slice(0) === "A");
  ```
- *Inherited from* [DocumentCollection.filter](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#filter)

### find
```typescript
find(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any
```
- Find an entry in the Map using a functional condition.
- **Parameters:**
  - **condition:** `(arg0: any, arg1: number, arg2: Collection) => boolean`  
    The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.
- **Returns:** `any` — The value, if found, otherwise undefined
- **See Example:** Create a new Collection and reference its contents  
  ```typescript
  let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
  c.get("a") === c.find(entry => entry === "A"); // true
  ```
- *Inherited from* [DocumentCollection.find](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#find)

### forEach
```typescript
forEach(fn: (arg0: any) => void): void
```
- Apply a function to each element of the collection
- **Parameters:**
  - **fn:** `(arg0: any) => void` — A function to apply to each element
- **Returns:** `void`
- **See:** Array#forEach
- **Example:** Apply a function to each value in the collection  
  ```typescript
  let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
  c.forEach(e => e.active = true);
  ```
- *Inherited from* [DocumentCollection.forEach](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#foreach)

### get
```typescript
get(
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```
- Get an element from the DocumentCollection by its ID.
- **Parameters:**
  - **id:** `string` — The ID of the Document to retrieve.
  - **Optional** **options:** `{ invalid?: boolean; strict?: boolean } = {}` — Additional options to configure retrieval.
    - **invalid?** `boolean` — Allow retrieving an invalid Document.
    - **strict?** `boolean` — Throw an Error if the requested Document does not exist.
- **Returns:** [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, DocumentConstructionContext>
- **Throws:** If strict is true and the Document cannot be found.
- *Inherited from* [DocumentCollection.get](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#get)

### getInvalid
```typescript
getInvalid(
    id: string,
    options?: { strict?: boolean },
): void | Document<object, DocumentConstructionContext>
```
- Obtain a temporary Document instance for a document id which currently has invalid source data.
- **Parameters:**
  - **id:** `string` — A document ID with invalid source data.
  - **Optional** **options:** `{ strict?: boolean } = {}` — Additional options to configure retrieval.
    - **strict?** `boolean` — Throw an Error if the requested ID is not in the set of invalid IDs for this collection.
- **Returns:** `void | Document<object, DocumentConstructionContext>` — An in-memory instance for the invalid Document
- **Throws:** If strict is true and the requested ID is not in the set of invalid IDs for this collection.
- *Inherited from* [DocumentCollection.getInvalid](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getinvalid)

### getName
```typescript
getName(name: string, options?: { strict?: boolean }): any
```
- Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a "name" attribute.
- **Parameters:**
  - **name:** `string` — The name of the entry to retrieve
  - **Optional** **options:** `{ strict?: boolean } = {}` — Additional options that affect how entries are retrieved
    - **strict?** `boolean` — Throw an Error if the requested name does not exist. Default false.
- **Returns:** `any` — The retrieved entry value, if one was found, otherwise undefined
- **Example:** Get an element from the Collection by name (if applicable)  
  ```typescript
  let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
  c.getName("Alfred"); // "Alfred"
  c.getName("D"); // undefined
  c.getName("D", {strict: true}); // throws Error
  ```
- *Inherited from* [DocumentCollection.getName](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getname)

### map
```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```
- Transform each element of the Collection into a new form, returning an Array of transformed values
- **Parameters:**
  - **transformer:** `(arg0: any, arg1: number, arg2: Collection) => any` — A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.
- **Returns:** `any[]` — An Array of transformed values
- *Inherited from* [DocumentCollection.map](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#map)

### reduce
```typescript
reduce(
    reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
    initial: any,
): any
```
- Reduce the Collection by applying an evaluator function and accumulating entries.
- **Parameters:**
  - **reducer:** `(arg0: any, arg1: any, arg2: number, arg3: Collection) => any` — A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.
  - **initial:** `any` — An initial value which accumulates with each iteration.
- **Returns:** `any` — The accumulated result
- **See Example:** Reduce a collection to an array of transformed values  
  ```typescript
  let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
  let letters = c.reduce((s, l) => {
    return s + l;
  }, ""); // "ABC"
  ```
- *Inherited from* [DocumentCollection.reduce](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#reduce)

### render
```typescript
render(force: any, options: any): void
```
- Overrides [DocumentCollection.render](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#render)
- **Parameters:**
  - **force:** `any`
  - **options:** `any`
- **Returns:** `void`

### search
```typescript
search(
    search: { exclude?: string[]; filters?: FieldFilter[]; query?: string },
): object[] | Document<object, DocumentConstructionContext>[]
```
- Find all Documents which match a given search term using a full-text search against their indexed HTML fields and their name. If filters are provided, results are filtered to only those that match the provided values.
- **Parameters:**
  - **search:** `{ exclude?: string[]; filters?: FieldFilter[]; query?: string }` — An object configuring the search
    - **Optional** **exclude?** `string[]` — An array of document IDs to exclude from search results
    - **Optional** **filters?** `FieldFilter[]` — An array of filters to apply
    - **Optional** **query?** `string` — A case-insensitive search string
- **Returns:** `object[] | Document<object, DocumentConstructionContext>[]`
- *Inherited from* [DocumentCollection.search](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#search)

### set
```typescript
set(id: any, document: any): void
```
- *Inherited from* [DocumentCollection.set](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#set)
- **Parameters:**
  - **id:** `any`
  - **document:** `any`
- **Returns:** `void`

### some
```typescript
some(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): boolean
```
- Test whether a condition is met by some entry in the Collection.
- **Parameters:**
  - **condition:** `(arg0: any, arg1: number, arg2: Collection) => boolean` — The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.
- **Returns:** `boolean` — Was the test condition passed by at least one entry?
- *Inherited from* [DocumentCollection.some](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#some)

### toJSON
```typescript
toJSON(): object[]
```
- Convert the Collection to a primitive array of its contents.
- **Returns:** `object[]` — An array of contained values
- *Inherited from* [DocumentCollection.toJSON](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#tojson)

### updateAll
```typescript
updateAll(
    transformation: any,
    condition?: null,
    options?: {},
): Promise<Document<object, DocumentConstructionContext>[]>
```
- Update all objects in this DocumentCollection with a provided transformation. Conditionally filter to only apply to Entities which match a certain condition.
- **Parameters:**
  - **transformation:** `any` — An object of data or function to apply to all matched objects.
  - **condition:** `null` = `null` — A function which tests whether to target each object.
  - **options:** `{}` = `{}` — Additional options passed to Document.updateDocuments
- **Returns:** `Promise<Document<object, DocumentConstructionContext>[]>` — An array of updated data once the operation is complete
- Overrides [DocumentCollection.updateAll](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#updateall)

### Protected: _initialize
```typescript
_initialize(): void
```
- Protected  
- Initialize the DocumentCollection by constructing any initially provided Document instances
- **Returns:** `void`
- *Inherited from* [DocumentCollection._initialize](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#_initialize)

---

## Static Methods

### getSearchableFields
```typescript
static getSearchableFields(
    documentName: string,
    type?: string,
): Record<string, SearchableField>
```
- Get the searchable fields for a given document or index, based on its data model.
- **Parameters:**
  - **documentName:** `string` — The document name
  - **Optional** **type:** `string` — A document subtype
- **Returns:** `Record<string, SearchableField>` — A record of searchable DataField definitions
- *Inherited from* [DocumentCollection.getSearchableFields](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html#getsearchablefields)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)