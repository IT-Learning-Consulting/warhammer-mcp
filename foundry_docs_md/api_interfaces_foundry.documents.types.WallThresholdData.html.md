# WallThresholdData

**Interface** `WallThresholdData`

```typescript
interface WallThresholdData {
    attenuation?: boolean;
    light?: number;
    sight?: number;
    sound?: number;
}
```

## Properties

- **attenuation?**: `boolean`  
  Whether to attenuate the source radius when passing through the wall

- **light?**: `number`  
  Minimum distance from a light source for which this wall blocks light

- **sight?**: `number`  
  Minimum distance from a vision source for which this wall blocks vision

- **sound?**: `number`  
  Minimum distance from a sound source for which this wall blocks sound

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)