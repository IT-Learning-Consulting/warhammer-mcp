# HotReloadData

```typescript
interface HotReloadData {
    content: string;
    extension: string;
    packageId: string;
    packageType: string;
    path: string;
}
```

## Properties

- **content**: *string*  
  The updated stringified file content

- **extension**: *string*  
  The file extension which was modified, e.g. `"js"`, `"css"`, `"html"`

- **packageId**: *string*  
  The id of the package which was modified

- **packageType**: *string*  
  The type of package which was modified

- **path**: *string*  
  The relative file path which was modified

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)