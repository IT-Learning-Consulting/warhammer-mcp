# PointEffectSourceData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface PointEffectSourceData {
    angle: number;
    externalRadius: number;
    priority: number;
    radius: number;
    rotation: number;
    walls: boolean;
}
```

## Properties

- **angle**: `number`  
  The angle of emission for this point source.

- **externalRadius**: `number`  
  A secondary radius used for limited angles.

- **priority**: `number`  
  Strength of this source to beat or not negative/positive sources.

- **radius**: `number`  
  The radius of the source.

- **rotation**: `number`  
  The angle of rotation for this point source.

- **walls**: `boolean`  
  Whether or not the source is constrained by walls.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)