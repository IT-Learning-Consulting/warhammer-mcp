# TokenSightData | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface `TokenSightData`

```typescript
interface TokenSightData {
    angle?: number;
    attenuation?: number;
    brightness?: number;
    color?: string;
    contrast?: number;
    enabled: boolean;
    range: null | number;
    saturation?: number;
    visionMode?: string;
}
```

### Properties

- **angle?**: `number`  
  An angle at which the Token can see relative to their direction of facing.

- **attenuation?**: `number`  
  A degree of attenuation which gradually fades the edges of the visible area.

- **brightness?**: `number`  
  An advanced customization for the perceived brightness of the visible area.

- **color?**: `string`  
  A special color which applies a hue to the visible area.

- **contrast?**: `number`  
  An advanced customization for contrast within the visible area.

- **enabled**: `boolean`  
  Should vision computation and rendering be active for this Token?

- **range**: `null | number`  
  How far in distance units the Token can see without the aid of a light source. If `null`, the sight range is unlimited.

- **saturation?**: `number`  
  An advanced customization of color saturation within the visible area.

- **visionMode?**: `string`  
  The vision mode which is used to render the appearance of the visible area.

---

For more details, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html).