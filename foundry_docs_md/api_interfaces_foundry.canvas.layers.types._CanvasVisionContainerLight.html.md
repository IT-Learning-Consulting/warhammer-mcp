# _CanvasVisionContainerLight | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface _CanvasVisionContainerLight

```typescript
interface _CanvasVisionContainerLight {
    cached: SpriteMesh;
    mask: any;
    preview: LegacyGraphics;
}
```

### Properties

- **cached**: *SpriteMesh*  
  The sprite with the texture of FOV of cached light sources.

- **mask**: *any*  
  The light perception polygons of vision sources and the FOV of vision sources that provide FOV that should not be committed to fog exploration.

- **preview**: *LegacyGraphics*  

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)