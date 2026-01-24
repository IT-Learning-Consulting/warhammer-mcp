# TextureAlphaData

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [TextureAlphaData](https://foundryvtt.com/api/interfaces/foundry.TextureAlphaData.html)

## Interface TextureAlphaData

```typescript
interface TextureAlphaData {
    data: Uint8Array;
    height: number;
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    width: number;
}
```

## Properties

- **data**: `Uint8Array`  
  The array containing the texture alpha values (0-255) with the dimensions `(maxX - minX) × (maxY - minY)`.

- **height**: `number`  
  The height of the (downscaled) texture.

- **maxX**: `number`  
  The maximum x-coordinate with alpha > 0 plus 1.

- **maxY**: `number`  
  The maximum y-coordinate with alpha > 0 plus 1.

- **minX**: `number`  
  The minimum x-coordinate with alpha > 0.

- **minY**: `number`  
  The minimum y-coordinate with alpha > 0.

- **width**: `number`  
  The width of the (downscaled) texture.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)