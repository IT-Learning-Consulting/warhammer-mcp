# ShaderTechnique | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ShaderTechnique {
    background?: string;
    coloration?: string;
    id: number;
    illumination?: string;
    label: string;
}
```

## Properties

### background (optional)
- **Type:** `string`  
The background shader fragment when the technique is used.

### coloration (optional)
- **Type:** `string`  
The coloration shader fragment when the technique is used.

### id
- **Type:** `number`  
The numeric identifier of the technique.  
[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

### illumination (optional)
- **Type:** `string`  
The illumination shader fragment when the technique is used.

### label
- **Type:** `string`  
The localization string that labels the technique.