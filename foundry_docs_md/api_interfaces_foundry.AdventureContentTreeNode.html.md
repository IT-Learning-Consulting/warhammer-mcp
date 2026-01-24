# AdventureContentTreeNode | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface AdventureContentTreeNode

```typescript
interface AdventureContentTreeNode {
    children: AdventureContentTreeNode[];
    documents: {
        document: ClientDocument;
        id: string;
        name: string;
        state: string;
    }[];
    folder: Folder;
    id: string;
    name: string;
    state: string;
}
```

## Properties

### children

- **children**: `AdventureContentTreeNode[]`  
  An array of child nodes.

### documents

- **documents**: `{ document: ClientDocument; id: string; name: string; state: string }[]`  
  An array of documents.

### folder

- **folder**: `Folder`  
  The Folder at this node level.

### id

- **id**: `string`  
  [An alias for `folder.id`](http://folder.id/)

### name

- **name**: `string`  
  [An alias for `folder.name`](http://folder.name/)

### state

- **state**: `string`  
  The modification state of the Folder.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)