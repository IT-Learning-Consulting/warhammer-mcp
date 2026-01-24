# DocumentIndex

This class is responsible for indexing all documents available in the world. Stores documents using a word tree structure that allows for efficient searching.

## Accessors

### ready

```typescript
get ready(): null | Promise<void>
```

Returns a Promise that resolves when the indexing process is complete.

**Returns** `null | Promise<void>`

## Methods

### addDocument

```typescript
addDocument(doc: Document): void
```

Add an entry to the index.

**Parameters**

- **doc**: `Document`  
  The document entry.

**Returns** `void`

---

### index

```typescript
index(): Promise<void>
```

Index all available documents in the world and store them in a word tree.

**Returns** `Promise<void>`

---

### lookup

```typescript
lookup(
  prefix: string,
  options?: {
    documentTypes?: string[];
    filterEntries?: StringTreeEntryFilter;
    limit?: number;
    ownership?: any;
  },
): Record<string, WordTreeEntry[]>
```

Return entries that match the given string prefix.

**Parameters**

- **prefix**: `string`  
  The prefix.

- **options** (optional):  
  - **documentTypes?**: `string[]`  
    Optionally provide an array of document types. Only entries of that type will be searched for.  
  - **filterEntries?**: [`StringTreeEntryFilter`](https://foundryvtt.com/api/types/foundry.utils.types.StringTreeEntryFilter.html)  
    A filter function to apply to each candidate entry.  
  - **limit?**: `number`  
    The maximum number of items per document type to retrieve. It is important to set this value as very short prefixes will naturally match large numbers of entries.  
  - **ownership?**: `any`  
    Only return entries that the user meets this ownership level for.

**Returns**  
`Record<string, WordTreeEntry[]>`  
A number of entries that have the given prefix, grouped by document type.

---

### removeDocument

```typescript
removeDocument(doc: Document): void
```

Remove an entry from the index.

**Parameters**

- **doc**: `Document`  
  The document entry.

**Returns** `void`

---

### replaceDocument

```typescript
replaceDocument(doc: Document): void
```

Replace an entry in the index with an updated one.

**Parameters**

- **doc**: `Document`  
  The document entry.

**Returns** `void`

---

### _addLeaf (Protected)

```typescript
_addLeaf(doc: object | Document, options?: { pack?: any }): void
```

Protected method. Add a leaf node to the word tree index.

**Parameters**

- **doc**: `object | Document`  
  The document or compendium index entry to add.

- **options** (optional):  
  - **pack?**: `any`  
    The compendium that the index belongs to.

**Returns** `void`

---

### _indexCompendium (Protected)

```typescript
_indexCompendium(pack: CompendiumCollection): void
```

Protected method. Aggregate the compendium index and add it to the word tree index.

**Parameters**

- **pack**: `CompendiumCollection`  
  The compendium pack.

**Returns** `void`

---

### _indexEmbeddedDocuments (Protected)

```typescript
_indexEmbeddedDocuments(parent: Document): void
```

Protected method. Add all of a parent document's embedded documents to the index.

**Parameters**

- **parent**: `Document`  
  The parent document.

**Returns** `void`

---

### _indexWorldCollection (Protected)

```typescript
_indexWorldCollection(documentName: string): void
```

Protected method. Aggregate all documents and embedded documents in a world collection and add them to the index.

**Parameters**

- **documentName**: `string`  
  The name of the documents to index.

**Returns** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)