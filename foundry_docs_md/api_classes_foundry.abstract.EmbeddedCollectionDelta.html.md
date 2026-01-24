# EmbeddedCollectionDelta

An embedded collection delta contains delta source objects that can be compared against other objects inside a base embedded collection, and generate new embedded Documents by combining them.

## Hierarchy  
- [EmbeddedCollection](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html)  
- **EmbeddedCollectionDelta**

## Constructors

### constructor

```typescript
new EmbeddedCollectionDelta(
    name: string,
    parent: Document<object, DocumentConstructionContext>,
    sourceArray: object[],
): EmbeddedCollectionDelta
```

**Parameters:**

- **name**: `string`  
  The name of this collection in the parent Document.

- **parent**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The parent Document instance to which this collection belongs.

- **sourceArray**: `object[]`  
  The source data array for the collection in the parent Document data.

**Returns:**  
EmbeddedCollectionDelta  
Inherited from [EmbeddedCollection#constructor](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#constructor)

---

## Properties

- **_source**: `object[]`  
  The source data array from which the embedded collection is created  
  Inherited from [EmbeddedCollection#_source](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#_source)

- **documentClass**: `typeof Document`  
  The Document implementation used to construct instances within this collection.  
  Inherited from [EmbeddedCollection#documentClass](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#documentclass)

- **invalidDocumentIds**: `Set<string>` = ...  
  Record the set of document ids where the Document was not initialized because of invalid source data  
  Inherited from [EmbeddedCollection#invalidDocumentIds](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#invaliddocumentids)

- **model**: `Document<object, DocumentConstructionContext>`  
  The parent Document to which this EmbeddedCollection instance belongs.

- **name**: `string`  
  The name of this collection in the parent Document.  
  Inherited from [EmbeddedCollection#name](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#name)

- **_initialized**: `boolean` = false  
  Has this embedded collection been initialized as a one-time workflow?  
  Inherited from [EmbeddedCollection#_initialized](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#_initialized)

---

## Accessors

- **baseCollection**: `EmbeddedCollection`  
  A convenience getter to return the corresponding base collection.  
  **Returns:** EmbeddedCollection  

- **contents**: `V[]`  
  Return an Array of all the entry values in the Collection  
  **Returns:** `V[]`  
  Inherited from EmbeddedCollection.contents

- **documentName**: `string | void`  
  The Document name of Documents stored in this collection.  
  **Returns:** `string | void`  
  Inherited from EmbeddedCollection.documentName

- **documentsByType**: `Record<string, Document<object, DocumentConstructionContext>[]>`  
  This collection's contents grouped by subtype, lazily (re-)computed as needed. If the document type does not support subtypes, all will be in the "base" group.  
  **Returns:** Record<string, Document<object, DocumentConstructionContext>[]>  
  Inherited from EmbeddedCollection.documentsByType

- **syntheticCollection**: `EmbeddedCollection`  
  A convenience getter to return the corresponding synthetic collection.  
  **Returns:** EmbeddedCollection

---

## Methods

### _delete

```typescript
_delete(key: any, __namedParameters?: { restoreDelta?: boolean }): void
```

**Parameters:**

- **key**: `any`  
- **__namedParameters?**: `{ restoreDelta?: boolean } = {}`  

**Returns:** void  
Overrides [EmbeddedCollection#_delete](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#_delete)

---

### _set

```typescript
_set(key: any, value: any, __namedParameters?: { restoreDelta?: boolean }): void
```

**Parameters:**

- **key**: `any`  
- **value**: `any`  
- **__namedParameters?**: `{ restoreDelta?: boolean } = {}`  

**Returns:** void  
Overrides [EmbeddedCollection#_set](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#_set)

---

### [iterator]

```typescript
[Symbol.iterator](): MapIterator<any>
```

Then iterating over a Collection, we should iterate over its values instead of over its entries

**Returns:** MapIterator<any>  
Inherited from [EmbeddedCollection#iterator](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#iterator)

---

### createDocument

```typescript
createDocument(
    data: any,
    context?: {},
): Document<object, { pack: any; parent: any; parentCollection: string }>
```

**Parameters:**

- **data**: `any`  
- **context?**: `{}` = `{}`  

**Returns:** Document<object, { pack: any; parent: any; parentCollection: string }>  
Overrides [EmbeddedCollection#createDocument](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#createdocument)

---

### delete

```typescript
delete(key: any, options?: {}): void
```

**Parameters:**

- **key**: `any`  
  The embedded Document ID.

- **options?**: `{}` = `{}`  
  Additional options to the delete operation.

**Returns:** void  
Overrides [EmbeddedCollection#delete](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#delete)

---

### filter

```typescript
filter(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any[]
```

Filter the Collection, returning an Array of entries which match a functional condition.

**Parameters:**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being filtered.

**Returns:** any[]  
Inherited from [EmbeddedCollection#filter](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#filter)

---

### find

```typescript
find(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): any
```

Find an entry in the Map using a functional condition.

**Parameters:**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being searched.

**Returns:** any  
The value, if found, otherwise undefined  
Inherited from [EmbeddedCollection#find](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#find)

---

### forEach

```typescript
forEach(fn: (arg0: any) => void): void
```

Apply a function to each element of the collection

**Parameters:**

- **fn**: `(arg0: any) => void`  
  A function to apply to each element

**Returns:** void  
Inherited from [EmbeddedCollection#forEach](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#foreach)

---

### get

```typescript
get(
    id: string,
    options?: { invalid?: boolean; strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Get an element from the EmbeddedCollection by its ID.

**Parameters:**

- **id**: `string`  
  The ID of the Embedded Document to retrieve.

- **options?**: `{ invalid?: boolean; strict?: boolean } = {}`  
  Additional options to configure retrieval.

  - **invalid?**: `boolean`  
    Allow retrieving an invalid Embedded Document.

  - **strict?**: `boolean`  
    Throw an Error if the requested Embedded Document does not exist.

**Returns:** Document<object, DocumentConstructionContext>  
The retrieved document instance, or undefined

**Throws:**  
If strict is true and the Embedded Document cannot be found.  
Inherited from [EmbeddedCollection#get](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#get)

---

### getInvalid

```typescript
getInvalid(
    id: string,
    options?: { strict?: boolean },
): Document<object, DocumentConstructionContext>
```

Obtain a temporary Document instance for a document id which currently has invalid source data.

**Parameters:**

- **id**: `string`  
  A document ID with invalid source data.

- **options?**: `{ strict?: boolean } = {}`  
  Additional options to configure retrieval.

  - **strict?**: `boolean`  
    Throw an Error if the requested ID is not in the set of invalid IDs for this collection.

**Returns:** Document<object, DocumentConstructionContext>  
An in-memory instance for the invalid Document

**Throws:**  
If strict is true and the requested ID is not in the set of invalid IDs for this collection.  
Inherited from [EmbeddedCollection#getInvalid](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#getinvalid)

---

### getName

```typescript
getName(name: string, options?: { strict?: boolean }): any
```

Get an entry from the Collection by name. Use of this method assumes that the objects stored in the collection have a "name" attribute.

**Parameters:**

- **name**: `string`  
  The name of the entry to retrieve.

- **options?**: `{ strict?: boolean } = {}`  
  Additional options that affect how entries are retrieved.

  - **strict?**: `boolean`  
    Throw an Error if the requested name does not exist. Default false.

**Returns:** any  
The retrieved entry value, if one was found, otherwise undefined  

**Example:**  
```js
let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
c.getName("Alfred");  // "Alfred"
c.getName("D");       // undefined
c.getName("D", {strict: true});  // throws Error
```

Inherited from [EmbeddedCollection#getName](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#getname)

---

### initialize

```typescript
initialize(__namedParameters?: { full?: boolean }): void
```

**Parameters:**

- **__namedParameters?**: `{ full?: boolean } = {}`  

**Returns:** void  
Overrides [EmbeddedCollection#initialize](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#initialize)

---

### isTombstone

```typescript
isTombstone(key: string): boolean
```

Determine whether a given ID exists as a tombstone Document in the collection delta.

**Parameters:**

- **key**: `string`  
  The Document ID.

**Returns:** boolean

---

### manages

```typescript
manages(key: string): boolean
```

Determine whether a given ID is managed directly by this collection delta or inherited from the base collection.

**Parameters:**

- **key**: `string`  
  The Document ID.

**Returns:** boolean

---

### map

```typescript
map(transformer: (arg0: any, arg1: number, arg2: Collection) => any): any[]
```

Transform each element of the Collection into a new form, returning an Array of transformed values.

**Parameters:**

- **transformer**: `(arg0: any, arg1: number, arg2: Collection) => any`  
  A transformation function applied to each entry value. Positional arguments are the value, the index of iteration, and the collection being mapped.

**Returns:** any[]  
Inherited from [EmbeddedCollection#map](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#map)

---

### reduce

```typescript
reduce(
    reducer: (arg0: any, arg1: any, arg2: number, arg3: Collection) => any,
    initial: any,
): any
```

Reduce the Collection by applying an evaluator function and accumulating entries.

**Parameters:**

- **reducer**: `(arg0: any, arg1: any, arg2: number, arg3: Collection) => any`  
  A reducer function applied to each entry value. Positional arguments are the accumulator, the value, the index of iteration, and the collection being reduced.

- **initial**: `any`  
  An initial value which accumulates with each iteration

**Returns:** any  
The accumulated result

**Example:**  
```js
let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
let letters = c.reduce((s, l) => {
  return s + l;
}, "");  // "ABC"
```

Inherited from [EmbeddedCollection#reduce](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#reduce)

---

### restoreDocument

```typescript
restoreDocument(id: string): Promise<Document>
```

Restore a Document so that it is no longer managed by the collection delta and instead inherits from the base Document.

**Parameters:**

- **id**: `string`  
  The Document ID.

**Returns:** Promise<Document>  
The restored Document.

---

### restoreDocuments

```typescript
restoreDocuments(ids: string[]): Promise<Document[]>
```

Restore the given Documents so that they are no longer managed by the collection delta and instead inherit directly from their counterparts in the base Actor.

**Parameters:**

- **ids**: `string[]`  
  The IDs of the Documents to restore.

**Returns:** Promise<Document[]>  
An array of updated Document instances.

---

### set

```typescript
set(key: any, value: any, options?: {}): void
```

Add an item to the collection.

**Parameters:**

- **key**: `any`  
  The embedded Document ID.

- **value**: `any`  
  The embedded Document instance.

- **options?**: `{}` = `{}`  
  Additional options to the set operation.

**Returns:** void  
Overrides [EmbeddedCollection#set](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#set)

---

### some

```typescript
some(condition: (arg0: any, arg1: number, arg2: Collection) => boolean): boolean
```

Test whether a condition is met by some entry in the Collection.

**Parameters:**

- **condition**: `(arg0: any, arg1: number, arg2: Collection) => boolean`  
  The functional condition to test. Positional arguments are the value, the index of iteration, and the collection being tested.

**Returns:** boolean  
Was the test condition passed by at least one entry?

Inherited from [EmbeddedCollection#some](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#some)

---

### toJSON

```typescript
toJSON(): object[]
```

Convert the Collection to a primitive array of its contents.

**Returns:** object[]  
An array of contained values  
Inherited from [EmbeddedCollection#toJSON](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#tojson)

---

### toObject

```typescript
toObject(source?: boolean): object[]
```

Convert the EmbeddedCollection to an array of simple objects.

**Parameters:**

- **source?**: `boolean` = `true`  
  Draw data for contained Documents from the underlying data source?

**Returns:** object[]  
The extracted array of primitive objects  
Inherited from [EmbeddedCollection#toObject](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#toobject)

---

### _handleInvalidDocument

```typescript
_handleInvalidDocument(
    id: string,
    err: Error,
    options?: { strict?: boolean },
): void
```

Protected  
Log warnings or errors when a Document is found to be invalid.

**Parameters:**

- **id**: `string`  
  The invalid Document's ID.

- **err**: `Error`  
  The validation error.

- **options?**: `{ strict?: boolean } = {}`  
  Options to configure invalid Document handling.

  - **strict?**: `boolean`  
    Whether to throw an error or only log a warning.

**Returns:** void  
Inherited from [EmbeddedCollection#_handleInvalidDocument](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#_handleinvaliddocument)

---

### _initializeDocument

```typescript
_initializeDocument(
    data: object,
    options?: DocumentConstructionContext,
): null | Document<object, DocumentConstructionContext>
```

Protected  
Initialize an embedded document and store it in the collection. The document may already exist, in which case we are reinitializing it with new _source data. The document may not yet exist, in which case we create a new Document instance using the provided source.

**Parameters:**

- **data**: `object`  
  The Document data.

- **options?**: [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)  
  Initialization options.

**Returns:** null | Document<object, DocumentConstructionContext>  
The initialized document or null if no document was initialized  
Inherited from [EmbeddedCollection#_initializeDocument](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html#_initializedocument)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)