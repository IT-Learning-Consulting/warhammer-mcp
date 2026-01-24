# LightSourceData

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [LightSourceData Interface](https://foundryvtt.com/api/interfaces/foundry.LightSourceData.html)

```typescript
interface LightSourceData {
    alpha: number;
    attenuation: number;
    bright: number;
    coloration: number;
    contrast: number;
    dim: number;
    luminosity: number;
    saturation: number;
    shadows: number;
    vision: boolean;
}
```

## Properties

- **alpha**: `number`  
  An opacity for the emitted light, if any

- **attenuation**: `number`  
  Strength of the attenuation between bright, dim, and dark

- **bright**: `number`  
  The allowed radius of bright vision or illumination

- **coloration**: `number`  
  The coloration technique applied in the shader

- **contrast**: `number`  
  The amount of contrast this light applies to the background texture

- **dim**: `number`  
  The allowed radius of dim vision or illumination

- **luminosity**: `number`  
  The luminosity applied in the shader

- **saturation**: `number`  
  The amount of color saturation this light applies to the background texture

- **shadows**: `number`  
  The depth of shadows this light applies to the background texture

- **vision**: `boolean`  
  Whether or not this source provides a source of vision

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)