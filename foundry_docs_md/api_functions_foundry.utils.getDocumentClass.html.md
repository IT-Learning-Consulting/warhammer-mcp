# getDocumentClass | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
getDocumentClass(documentName: string): undefined | typeof Document
```

Return a reference to the Document class implementation which is configured for use.

**Parameters**

- **documentName**: *string*  
  The canonical Document name, for example `"Actor"`

**Returns**  
*undefined* | *typeof* [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
The configured Document class implementation

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)