# DocumentStats | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface: DocumentStats

```typescript
interface DocumentStats {
    compendiumSource: null | string;
    coreVersion: null | string;
    createdTime: null | number;
    duplicateSource: null | string;
    lastModifiedBy: null | string;
    modifiedTime: null | number;
    systemId: null | string;
    systemVersion: null | string;
}
```

## Properties

- **compendiumSource**: `null | string`  
  The UUID of the compendium Document this one was imported from.

- **coreVersion**: `null | string`  
  The core version whose schema the Document data is in. It is NOT the version the Document was created or last modified in.

- **createdTime**: `null | number`  
  A timestamp of when the Document was created.

- **duplicateSource**: `null | string`  
  The UUID of the Document this one is a duplicate of.

- **lastModifiedBy**: `null | string`  
  The ID of the user who last modified the Document.

- **modifiedTime**: `null | number`  
  A timestamp of when the Document was last modified.

- **systemId**: `null | string`  
  The package name of the system the Document was created in.

- **systemVersion**: `null | string`  
  The version of the system the Document was created or last modified in.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)