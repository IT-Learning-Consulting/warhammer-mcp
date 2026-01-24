# RingData | Foundry Virtual Tabletop - API Documentation - Version 13

Represents the ring- and background-related properties for a given size.

```typescript
interface RingData {
    bkgName: undefined | string;
    colorBand: undefined | RingColorBand;
    defaultBackgroundColorLittleEndian: null | number;
    defaultRingColorLittleEndian: null | number;
    maskName: undefined | string;
    ringName: undefined | string;
    subjectScaleAdjustment: null | number;
}
```

## Properties

- **bkgName**: `undefined | string`  
  The filename of the background asset, if available

- **colorBand**: `undefined | [RingColorBand](https://foundryvtt.com/api/interfaces/foundry.canvas.placeables.types.RingColorBand.html)`  
  Defines color stops for the ring gradient, if applicable

- **defaultBackgroundColorLittleEndian**: `null | number`  
  Default color for the background in little-endian BBGGRR format, or null if not set

- **defaultRingColorLittleEndian**: `null | number`  
  Default color for the ring in little-endian BBGGRR format, or null if not set

- **maskName**: `undefined | string`  
  The filename of the mask asset, if available

- **ringName**: `undefined | string`  
  The filename of the ring asset, if available

- **subjectScaleAdjustment**: `null | number`  
  Scaling factor to adjust how the subject texture fits within the ring, or null if unavailable