# TokenHexagonalOffsetsData

**Interface** `TokenHexagonalOffsetsData`  
The hexagonal offsets of a Token.

```typescript
interface TokenHexagonalOffsetsData {
    anchor: Point;
    even: GridOffset2D[];
    odd: GridOffset2D[];
}
```

## Properties

- **anchor**: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)  
  The anchor in normalized coordinates.

- **even**: [GridOffset2D[]](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset2D.html)  
  The occupied offsets in an even grid in the 0th row/column.

- **odd**: [GridOffset2D[]](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset2D.html)  
  The occupied offsets in an odd grid in the 0th row/column.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)