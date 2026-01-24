# TokenHexagonalShapeData

The hexagonal shape of a Token.

```typescript
interface TokenHexagonalShapeData {
    anchor: Point;
    center: Point;
    offsets: { even: GridOffset2D[]; odd: GridOffset2D[] };
    points: number[];
}
```

## Properties

- **anchor**: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
  The snapping anchor in normalized coordinates, i.e. the top-left grid hex center in the snapped position

- **center**: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
  The center of the shape in normalized coordinates

- **offsets**: { even: [GridOffset2D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset2D.html)[]; odd: [GridOffset2D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset2D.html)[] }  
  The occupied offsets in even/odd rows/columns

- **points**: `number[]`  
  The points in normalized coordinates

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)