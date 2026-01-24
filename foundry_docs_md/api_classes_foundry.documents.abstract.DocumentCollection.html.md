# DocumentCollection | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract subclass of the Collection container which defines a collection of Document instances.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.documents.abstract.DocumentCollection)  
* _Collection_  
* **DocumentCollection**  
* WorldCollection  
* CompendiumCollection  
* CompendiumFolderCollection  

---

## Constructors

### constructor

```typescript
new DocumentCollection(data?: object[]): DocumentCollection
```

**Parameters**

- **data**: `object[] = []`  
  An array of data objects from which to create document instances

**Returns**  
`DocumentCollection`  
Overrides [`Collection.constructor`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#constructor)

---

## Properties

### apps

`apps: ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>[]`  
An Array of application references which will be automatically updated when the collection content changes

### invalidDocumentIds

`invalidDocumentIds: Set<string> = ...`  
Record the set of document ids where the Document was not initialized because of invalid source data

### documentName (Static)

`documentName: string`  
The base Document type which is contained within this DocumentCollection

---

## Accessors

### contents

```typescript
get contents(): V[]
```
Return an Array of all the entry values in the Collection

**Returns**  
`V[]`  
Inherited from `Collection.contents`

### documentClass

```typescript
get documentClass(): typeof Document
```
A reference to the Document class definition which is contained within this DocumentCollection.

**Returns**  
`typeof Document`

### documentName

```typescript
get documentName(): any
```

**Returns**  
`any`

### name

```typescript
get name(): string
```
The Collection class name

**Returns**  
`string`

---

## Methods

### [iterator]

```typescript
[iterator](): MapIterator<any>
```
When iterating over a Collection, it iterates over its values instead of its entries.

**Returns**  
`MapIterator<any>`  
Inherited from [`Collection.[iterator]`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#iterator)

---

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
- **context**: `object = {}`  
  Document creation context.

**Returns**  
`Document<object, DocumentConstructionContext>`

---

### delete

```typescript
delete(id: any): boolean
```

Overrides `Collection.delete`.

**Parameters**

- **id**: `any`  

**Returns**  
`boolean`

---

### filter

```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any[]
```

Filter the Collection, returning an Array of entries that match a functional condition.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns**  
`any[]` - An Array of matched values

**See**  
Example: Filter the Collection for specific entries  
Inherited from [`Collection.filter`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#filter)  

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

**Returns**  
`any` - The value, if found, otherwise undefined

**See**  
Example: Create a new Collection and reference its contents  
Inherited from [`Collection.find`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#find)  

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
c.get("a") === c.find(entry => entry === "A"); // true
```

---

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
Example: Apply a function to each value in the collection  
Inherited from [`Collection.forEach`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#foreach)  

```typescript
let c = new Collection([
  ["a", {active: false}], 
  ["b", {active: false}], 
  ["c", {active: false}]
]);
c.forEach(e => e.active = true);
```

---

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
- **options**: `{ invalid?: boolean; strict?: boolean } = {}`  
  Additional options to configure retrieval.
  - **invalid**?: `boolean` - Allow retrieving an invalid Document.
  - **strict**?: `boolean` - Throw an Error if the requested Document does not exist.

**Returns**  
`Document<object, DocumentConstructionContext>`

**Throws**  
If `strict` is true and the Document cannot be found.

Overrides [`Collection.get`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#get)

---

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
- **options**: `{ strict?: boolean } = {}`  
  Additional options to configure retrieval.
  - **strict**?: `boolean` - Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

**Returns**  
`void` | `Document<object, DocumentConstructionContext>`  
An in-memory instance for the invalid Document.

**Throws**  
If `strict` is true and the requested ID is not in the set of invalid IDs for this collection.

---

### getName

```typescript
getName(name: string, options?: { strict?: boolean }): any
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a `"name"` attribute.

**Parameters**

- **name**: `string`  
  The name of the entry to retrieve
- **options**: `{ strict?: boolean } = {}`  
  Additional options that affect how entries are retrieved.
  - **strict**?: `boolean` - Throw an Error if the requested name does not exist. Default false.

**Returns**  
`any` - The retrieved entry value, if one was found, otherwise undefined.

**Example**  
Get an element from the Collection by name (if applicable)  
Inherited from [`Collection.getName`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#getname)  

```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");          // "Alfred"
c.getName("D");               // undefined
c.getName("D", {strict: true}); // throws Error
```

---

### map

```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters**

- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns**  
`any[]` - An Array of transformed values

Inherited from [`Collection.map`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#map)

---

### reduce

```typescript
reduce(
  reducer: (accumulator: any, currentValue: any, index: number, collection: Collection) => any,
  initial: any
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters**

- **reducer**: `(accumulator: any, currentValue: any, index: number, collection: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.
- **initial**: `any`  
  An initial value which accumulates with each iteration.

**Returns**  
`any` - The accumulated result

**See**  
Example: Reduce a collection to an array of transformed values  
Inherited from [`Collection.reduce`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#reduce)  

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

**Parameters**

- **force**: `boolean = false`  
  Force rendering
- **options**: `object = {}`  
  Optional options

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
  }
): object[] | Document<object, DocumentConstructionContext>[]
```

Find all Documents which match a given search term using a full-text search against their indexed HTML fields and their name. If filters are provided, results are filtered to only those that match the provided values.

**Parameters**

- **search**: `{ exclude?: string[]; filters?: FieldFilter[]; query?: string }`  
  An object configuring the search.
  - **exclude**?: `string[]`  
    An array of document IDs to exclude from search results.
  - **filters**?: `FieldFilter[]`  
    An array of filters to apply.
  - **query**?: `string`  
    A case-insensitive search string.

**Returns**  
`object[]` | `Document<object, DocumentConstructionContext>[]`

---

### set

```typescript
set(id: any, document: any): void
```

Overrides `Collection.set`.

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

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns**  
`boolean` - Was the test condition passed by at least one entry?

**See**  
Inherited from [`Collection.some`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#some)

---

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns**  
`object[]` - An array of contained values

Inherited from [`Collection.toJSON`](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#tojson)

---

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
- **condition**: `null | Function = null`  
  A function which tests whether to target each object.
- **options**: `object = {}`  
  Additional options passed to Document.updateDocuments.

**Returns**  
`Promise<Document<object, DocumentConstructionContext>[]>`  
An array of updated data once the operation is complete.

---

### _initialize (Protected)

```typescript
_initialize(): void
```

Initialize the DocumentCollection by constructing any initially provided Document instances.

**Returns**  
`void`

---

### getSearchableFields (Static)

```typescript
getSearchableFields(
  documentName: string,
  type?: string
): Record<string, SearchableField>
```

Get the searchable fields for a given document or index, based on its data model.

**Parameters**

- **documentName**: `string`  
  The document name.
- **type**: `string` (optional)  
  A document subtype.

**Returns**  
`Record<string, SearchableField>`  
A record of searchable DataField definitions.

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)
- [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)
- [Collection](https://foundryvtt.com/api/classes/foundry.utils.Collection.html)
- [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)