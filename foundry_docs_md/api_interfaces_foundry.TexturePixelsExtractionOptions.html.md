# TexturePixelsExtractionOptions

```typescript
interface TexturePixelsExtractionOptions {
    compression?: 0;
    frame?: Rectangle;
    out?: ArrayBuffer;
    texture?: Texture<Resource> | RenderTexture;
}
```

## Properties

### **compression?**  
*Type:* `0`  
The NONE compression mode.

### **frame?**  
*Type:* `Rectangle`  
The rectangle which the pixels are extracted from.

### **out?**  
*Type:* `ArrayBuffer`  
The optional output buffer to write the pixels to. May be detached. The (new) output buffer is returned.

### **texture?**  
*Type:* `Texture<Resource> | RenderTexture`  
The texture the pixels are extracted from.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)