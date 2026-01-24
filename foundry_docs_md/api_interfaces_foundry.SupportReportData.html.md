# SupportReportData

A bundle of metrics for Support.

```typescript
interface SupportReportData {
    activeModuleCount: number;
    actors: number;
    client: string;
    coreVersion: string;
    gpu: string;
    grid: number;
    hasViewedScene: boolean;
    items: number;
    journals: number;
    largestTexture: { 
        height: number; 
        src?: string; 
        width: number; 
    };
    lights: number;
    maxTextureSize: string | number;
    messages: number;
    os: string;
    packs: number;
    padding: number;
    performanceMode: string;
    playlists: number;
    sceneDimensions: string;
    screen: string;
    sounds: number;
    systemVersion: string;
    tables: number;
    tiles: number;
    tokens: number;
    viewport: string;
    walls: number;
    worldScripts: string[];
}
```

## Properties

- **activeModuleCount**: `number`

- **actors**: `number`

- **client**: `string`

- **coreVersion**: `string`

- **gpu**: `string`

- **grid**: `number`

- **hasViewedScene**: `boolean`

- **items**: `number`

- **journals**: `number`

- **largestTexture**:  
  - `height`: `number`  
  - `src?`: `string` (optional)  
  - `width`: `number`

- **lights**: `number`

- **maxTextureSize**: `string | number`

- **messages**: `number`

- **os**: `string`

- **packs**: `number`

- **padding**: `number`

- **performanceMode**: `string`

- **playlists**: `number`

- **sceneDimensions**: `string`

- **screen**: `string`

- **sounds**: `number`

- **systemVersion**: `string`

- **tables**: `number`

- **tiles**: `number`

- **tokens**: `number`

- **viewport**: `string`

- **walls**: `number`

- **worldScripts**: `string[]`

---

For more details, see the [foundry.SupportReportData documentation](https://foundryvtt.com/api/interfaces/foundry.SupportReportData.html).

Related API documentation: [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html)