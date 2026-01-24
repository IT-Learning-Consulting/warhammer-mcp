# EmbeddedCollection | Foundry Virtual Tabletop - API Documentation - Version 13

An extension of the Collection. Used for the specific task of containing embedded Document instances within a parent Document.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.abstract.EmbeddedCollection), Expand

- *Collection*  
- **EmbeddedCollection**  
- *EmbeddedCollectionDelta*  
- *SingletonEmbeddedCollection*  

---

## Constructors

### constructor

```typescript
new EmbeddedCollection(
    name: string,
    parent: Document<object, DocumentConstructionContext>,
    sourceArray: object[],
): EmbeddedCollection
```

**Parameters**

- **name**: `string`  
  The name of this collection in the parent Document.

- **parent**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The parent Document instance to which this collection belongs.

- **sourceArray**: `object[]`  
  The source data array for the collection in the parent Document data.

**Returns**  
`EmbeddedCollection`

---

## Properties

- **_source**: `object[]`  
  The source data array from which the embedded collection is created  
  *(Overrides [Collection.constructor](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#constructor))*

- **documentClass**: `typeof Document`  
  The Document implementation used to construct instances within this collection.

- **invalidDocumentIds**: `Set<string>` = ...  
  Records the set of document ids where the Document was not initialized because of invalid source data.

- **model**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The parent Document to which this EmbeddedCollection instance belongs.

- **name**: `string`  
  The name of this collection in the parent Document.

- **_initialized**: `boolean` = false  
  Has this embedded collection been initialized as a one-time workflow? *(Protected)*

---

## Accessors

- **contents**

  ```typescript
  get contents(): V[]
  ```

  Return an Array of all the entry values in the Collection.  
  *(Inherited from [Collection.contents](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#constructorcollectionv))*

  **Returns**  
  `V[]`

- **documentName**

  ```typescript
  get documentName(): string | void
  ```

  The Document name of Documents stored in this collection.

  **Returns**  
  `string | void`

- **documentsByType**

  ```typescript
  get documentsByType(): Record<
      string,
      Document<object, DocumentConstructionContext>[]
  >
  ```

  This collection's contents grouped by subtype, lazily (re-)computed as needed. If the document type does not support subtypes, all will be in the `"base"` group.

  **Returns**  
  `Record<string, Document<object, DocumentConstructionContext>[]>`

---

## Methods

### [iterator]

```typescript
[Symbol.iterator](): MapIterator<any>
```

When iterating over a Collection, iterate over its values instead of over its entries.  
 *(Inherited from [Collection.[iterator]](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#iterator))*

**Returns**  
`MapIterator<any>`

---

### createDocument

```typescript
createDocument(
    data: object,
    context?: DocumentConstructionContext,
): Document<object, DocumentConstructionContext>
```

Instantiate a Document for inclusion in the Collection.

**Parameters**

- **data**: `object`  
  The Document data.

- **context** (optional): [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html> = `{}`  
  Document creation context.

**Returns**  
[Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>

---

### delete

```typescript
delete(
    key: string,
    options?: { modifySource?: boolean },
): boolean
```

Delete an embedded Document from the collection.

**Parameters**

- **key**: `string`  
  The embedded Document ID.

- **options** (optional): `{ modifySource?: boolean }` = `{}`  
  Additional options to the delete operation.

  - **modifySource** (optional): `boolean`  
    Whether to modify the collection's source as part of the operation.

**Returns**  
`boolean`  
*(Overrides [Collection.delete](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#delete))*

---

### filter

```typescript
filter(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean
): any[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns**  
`any[]`  
An Array of matched values

**See**  
Example: Filter the Collection for specific entries  
Inherited from [Collection.filter](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#filter)

```typescript
let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
let hasA = c.filters(entry => entry.slice(0) === "A");
```

---

### find

```typescript
find(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean
): any
```

Find an entry in the Map using a functional condition.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

**Returns**  
`any`  
The value, if found, otherwise undefined

**See**  
Example: Create a new Collection and reference its contents  
Inherited from [Collection.find](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#find)

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
Inherited from [Collection.forEach](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#foreach)

```typescript
let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
c.forEach(e => e.active = true);
```

---

### get

```typescript
get(
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext> | undefined
```

Get an element from the EmbeddedCollection by its ID.

**Parameters**

- **id**: `string`  
  The ID of the Embedded Document to retrieve.

- **options** (optional): `{ invalid?: boolean; strict?: boolean }` = `{}`  
  Additional options to configure retrieval.

  - **invalid** (optional): `boolean`  
    Allow retrieving an invalid Embedded Document.

  - **strict** (optional): `boolean`  
    Throw an Error if the requested Embedded Document does not exist.

**Returns**  
[Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)> | `undefined`

**Throws**  
If strict is true and the Embedded Document cannot be found.

*(Overrides [Collection.get](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#get))*

---

### getInvalid

```typescript
getInvalid(
    id: string,
    options?: { strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Obtain a temporary Document instance for a document id which currently has invalid source data.

**Parameters**

- **id**: `string`  
  A document ID with invalid source data.

- **options** (optional): `{ strict?: boolean }` = `{}`  
  Additional options to configure retrieval.

  - **strict** (optional): `boolean`  
    Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

**Returns**  
[Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>

**Throws**  
If strict is true and the requested ID is not in the set of invalid IDs for this collection.

---

### getName

```typescript
getName(
    name: string,
    options?: { strict?: boolean }
): any
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a `"name"` attribute.

**Parameters**

- **name**: `string`  
  The name of the entry to retrieve.

- **options** (optional): `{ strict?: boolean }` = `{}`  
  Additional options that affect how entries are retrieved.

  - **strict** (optional): `boolean`  
    Throw an Error if the requested name does not exist. Default false.

**Returns**  
`any`  
The retrieved entry value, if one was found, otherwise undefined.

**Example:**  
```typescript
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");  // "Alfred"
c.getName("D");       // undefined
c.getName("D", {strict: true});  // throws Error
```

*(Inherited from [Collection.getName](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#getname))*

---

### initialize

```typescript
initialize(options?: DocumentConstructionContext): void
```

Initialize the EmbeddedCollection by synchronizing its Document instances with existing `_source` data. This method does **not** modify the `_source` array. It is responsible for creating, updating, or removing Documents from the Collection.

**Parameters**

- **options** (optional): [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html) = `{}`  
  Initialization options.

**Returns**  
`void`

---

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

*(Inherited from [Collection.map](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#map))*

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

- **initial**: `any`  
  An initial value which accumulates with each iteration.

**Returns**  
`any`  
The accumulated result.

**See**  
Example: Reduce a collection to an array of transformed values  
Inherited from [Collection.reduce](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#reduce)

```typescript
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, ""); // "ABC"
```

---

### set

```typescript
set(
    key: string,
    value: Document<object, DocumentConstructionContext>,
    options?: { modifySource?: boolean },
): EmbeddedCollection
```

Add an item to the collection.

**Parameters**

- **key**: `string`  
  The embedded Document ID.

- **value**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The embedded Document instance.

- **options** (optional): `{ modifySource?: boolean }` = `{}`  
  Additional options to the set operation.

  - **modifySource** (optional): `boolean`  
    Whether to modify the collection's source as part of the operation.

**Returns**  
`EmbeddedCollection`  
*(Overrides [Collection.set](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#set))*

---

### some

```typescript
some(
    condition: (arg0: any, arg1: number, arg2: Collection) => boolean
): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns**  
`boolean`  
Was the test condition passed by at least one entry?

**See**  
Inherited from [Collection.some](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#some)

---

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns**  
`object[]`  
An array of contained values.

*(Inherited from [Collection.toJSON](https://foundryvtt.com/api/classes/foundry.utils.Collection.html#tojson))*

---

### toObject

```typescript
toObject(source?: boolean): object[]
```

Convert the EmbeddedCollection to an array of simple objects.

**Parameters**

- **source** (optional): `boolean` = `true`  
  Draw data for contained Documents from the underlying data source?

**Returns**  
`object[]`  
The extracted array of primitive objects.

---

### _delete (Protected)

```typescript
_delete(key: string, options?: object): void
```

Remove the value from the underlying source array.

**Parameters**

- **key**: `string`  
  The Document ID key.

- **options** (optional): `object` = `{}`  
  Additional options to configure deletion behavior.

**Returns**  
`void`

---

### _handleInvalidDocument (Protected)

```typescript
_handleInvalidDocument(
    id: string,
    err: Error,
    options?: { strict?: boolean }
): void
```

Log warnings or errors when a Document is found to be invalid.

**Parameters**

- **id**: `string`  
  The invalid Document's ID.

- **err**: `Error`  
  The validation error.

- **options** (optional): `{ strict?: boolean }` = `{}`  
  Options to configure invalid Document handling.

  - **strict** (optional): `boolean`  
    Whether to throw an error or only log a warning.

**Returns**  
`void`

---

### _initializeDocument (Protected)

```typescript
_initializeDocument(
    data: object,
    options?: DocumentConstructionContext,
): null | Document<object, DocumentConstructionContext>
```

Initialize an embedded document and store it in the collection. The document may already exist, in which case we are reinitializing it with new `_source` data. The document may not yet exist, in which case we create a new Document instance using the provided source.

**Parameters**

- **data**: `object`  
  The Document data.

- **options** (optional): [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)  
  Initialization options.

**Returns**  
`null | Document<object, DocumentConstructionContext>`  
The initialized document or null if no document was initialized.

---

### _set (Protected)

```typescript
_set(key: string, value: Document<object, DocumentConstructionContext>): void
```

Modify the underlying source array to include the Document.

**Parameters**

- **key**: `string`  
  The Document ID key.

- **value**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<`object`, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The Document.

**Returns**  
`void`

---

For full reference, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html).