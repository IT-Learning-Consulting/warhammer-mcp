# ResolvedUUID

```typescript
interface ResolvedUUID {
    collection?: any;
    documentId?: string;
    documentType?: string;
    embedded: string[];
    id: string;
    primaryId?: string;
    primaryType?: string;
    type?: string;
    uuid: string;
}
```

## Properties

- **collection?**: `any`  
  The Collection containing the referenced Document unless that Document is embedded, in which case the Collection of the primary Document.

- **documentId?**: `string`  
  Either the document id or the parent id. Retained for backwards compatibility.

- **documentType?**: `string`  
  Either the document type or the parent type. Retained for backwards compatibility.

- **embedded**: `string[]`  
  Additional Embedded Document parts.

- **id**: `string`  
  The ID of the Document referenced.

- **primaryId?**: `string`  
  The primary Document ID of this UUID. Only present if the Document is embedded.

- **primaryType?**: `string`  
  The primary Document type of this UUID. Only present if the Document is embedded.

- **type?**: `string`  
  The type of Document referenced. Legacy compendium UUIDs will not populate this field if the compendium is not active in the World.

- **uuid**: `string`  
  The original UUID.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)