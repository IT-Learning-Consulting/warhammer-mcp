# RelatedPackageData

```typescript
interface RelatedPackageData {
    compatibility?: any;
    id: string;
    manifest?: string;
    reason?: string;
    type: string;
}
```

## Properties

### **Optional** compatibility
- **Type:** `any`  
- The compatibility data with this related Package

### id
- **Type:** `string`  
- The id of the related package

### **Optional** manifest
- **Type:** `string`  
- An explicit manifest URL, otherwise learned from the Foundry web server

### **Optional** reason
- **Type:** `string`  
- The reason for this relationship

### type
- **Type:** `string`  
- The type of the related package

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)