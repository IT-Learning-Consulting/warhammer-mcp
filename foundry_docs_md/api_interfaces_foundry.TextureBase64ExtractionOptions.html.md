# TextureBase64ExtractionOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TextureBase64ExtractionOptions {
    compression: 1;
    frame?: Rectangle;
    quality?: number;
    texture?: Texture<Resource> | RenderTexture;
    type?: string;
}
```

## Properties

- **compression**: `1`  
  The BASE64 compression mode.  
  **Required**

- **frame**?: `Rectangle`  
  The rectangle which the pixels are extracted from.  
  **Optional**

- **quality**?: `number`  
  The optional image quality. Default: `1`.  
  **Optional**

- **texture**?: `Texture<Resource>` \| `RenderTexture`  
  The texture the pixels are extracted from.  
  **Optional**

- **type**?: `string`  
  The optional image mime type. Default: `"image/png"`.  
  **Optional**

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)