# PingData

```typescript
interface PingData {
    pull?: boolean;
    scene: string;
    style: string;
    zoom: number;
}
```

## Properties

- **pull?**: `boolean`  
  Pulls all connected clients' views to the pinged coordinates.

- **scene**: `string`  
  The ID of the scene that was pinged.

- **style**: `string`  
  The ping style, see [CONFIG.Canvas.pings](https://foundryvtt.com/api/index.html).

- **zoom**: `number`  
  The zoom level at which the ping was made.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)