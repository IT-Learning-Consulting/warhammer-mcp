# FogExplorationData

Interface **FogExplorationData**

```typescript
interface FogExplorationData {
    _id: null | string;
    explored: string;
    flags: DocumentFlags;
    positions: object;
    scene: string;
    timestamp: number;
    user: string;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this FogExploration document.

- **explored**: `string`  
  The base64 image/jpeg of the explored fog polygon.

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags.

- **positions**: `object`  
  The object of scene positions which have been explored at a certain vision radius.

- **scene**: `string`  
  The _id of the Scene document to which this fog applies.

- **timestamp**: `number`  
  The timestamp at which this fog exploration was last updated.

- **user**: `string`  
  The _id of the User document to which this fog applies.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)