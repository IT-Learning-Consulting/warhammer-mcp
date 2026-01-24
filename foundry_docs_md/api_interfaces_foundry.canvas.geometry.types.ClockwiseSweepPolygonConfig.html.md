# ClockwiseSweepPolygonConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ClockwiseSweepPolygonConfig {
    edgeTypes?: Record<EdgeType, { mode: 0 | 1 | 2; priority: number }>;
    priority?: number;
}
```

## Properties

### Optional

- **edgeTypes?**: `Record<EdgeType, { mode: 0 | 1 | 2; priority: number }>`
  
  Edge types configuration object. This is not required by most polygons and will be inferred based on the polygon type and priority.

- **priority?**: `number`
  
  Optional priority when it comes to ignore edges from darkness and light sources.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)