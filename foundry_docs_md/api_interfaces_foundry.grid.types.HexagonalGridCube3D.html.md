# HexagonalGridCube3D

3D cube coordinates in a hexagonal grid. q + r + s = 0.

```typescript
interface HexagonalGridCube3D {
    k: number;
    q: number;
    r: number;
    s: number;
}
```

## Properties

- **k**: `number`  
  The vertical coordinate.

- **q**: `number`  
  The coordinate along the E-W (columns) or SW-NE (rows) axis. Equal to the offset column coordinate if column orientation.

- **r**: `number`  
  The coordinate along the NE-SW (columns) or N-S (rows) axis. Equal to the offset row coordinate if row orientation.

- **s**: `number`  
  The coordinate along the SE-NW axis.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)