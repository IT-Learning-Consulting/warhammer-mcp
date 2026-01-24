# WeatherOcclusionMaskConfiguration

```typescript
interface WeatherOcclusionMaskConfiguration {
    channelWeights: number[];
    enabled: boolean;
    reverse?: boolean;
    texture: Texture<Resource> | RenderTexture;
}
```

## Properties

- **channelWeights**: `number[]`  
  An RGBA array of channel weights applied to the mask texture.

- **enabled**: `boolean`  
  Enable or disable this mask.

- **reverse** (optional): `boolean`  
  If the mask should be reversed.

- **texture**: `Texture<Resource> | RenderTexture`  
  A texture which defines the mask region.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)