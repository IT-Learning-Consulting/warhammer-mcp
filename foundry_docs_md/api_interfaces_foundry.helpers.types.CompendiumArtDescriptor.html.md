# CompendiumArtDescriptor | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CompendiumArtDescriptor {
    credit?: string;
    mapping: string;
    packageId: string;
    priority: number;
    title: string;
}
```

## Properties

### credit?  
*Type:* `string`  
An optional credit string for use by the game system to apply in an appropriate place.

### mapping  
*Type:* `string`  
The path to the art mapping file.

### packageId  
*Type:* `string`  
The ID of the package providing the art.

### priority  
*Type:* `number`  
The package's user-configured priority.

### title  
*Type:* `string`  
The title of the package providing the art.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)