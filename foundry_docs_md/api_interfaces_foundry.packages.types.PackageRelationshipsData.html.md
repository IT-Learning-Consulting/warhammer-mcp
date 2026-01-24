# PackageRelationshipsData

```typescript
interface PackageRelationshipsData {
    recommends: RelatedPackage[];
    requires: RelatedPackage[];
    systems: RelatedPackage[];
}
```

## Properties

- **recommends**: `RelatedPackage[]`  
  Packages that are recommended for optimal functionality

- **requires**: `RelatedPackage[]`  
  Packages that are required for base functionality

- **systems**: `RelatedPackage[]`  
  Systems that this Package supports

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)