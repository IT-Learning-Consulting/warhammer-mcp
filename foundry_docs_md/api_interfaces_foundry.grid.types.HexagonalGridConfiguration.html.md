# HexagonalGridConfiguration

```typescript
interface HexagonalGridConfiguration {
    alpha?: number;
    color?: ColorSource;
    columns?: boolean;
    diagonals?: GridDiagonalRule;
    distance?: number;
    even?: boolean;
    size: number;
    style?: string;
    thickness?: number;
    units?: string;
}
```

## Properties

### alpha?  
**Type:** `number`  
The alpha of the grid. Default: `1`.

---

### color?  
**Type:** [`ColorSource`](https://foundryvtt.com/api/types/foundry.types.ColorSource.html)  
The color of the grid. Default: `0x000000`.

---

### columns?  
**Type:** `boolean`  
Is this grid column-based (flat-topped) or row-based (pointy-topped)? Default: `false`.

---

### diagonals?  
**Type:** [`GridDiagonalRule`](https://foundryvtt.com/api/types/CONST.GridDiagonalRule.html)  
The rule for diagonal measurement (see [CONST.GRID_DIAGONALS](https://foundryvtt.com/api/variables/CONST.GRID_DIAGONALS.html)).  
Default: `CONST.GRID_DIAGONALS.EQUIDISTANT`.

---

### distance?  
**Type:** `number`  
The distance of a grid space in units (a positive number). Default: `1`.

---

### even?  
**Type:** `boolean`  
Is this grid even or odd? Default: `false`.

---

### size  
**Type:** `number`  
The size of a grid space in pixels (a positive number).

---

### style?  
**Type:** `string`  
The style of the grid. Default: `"solidLines"`.

---

### thickness?  
**Type:** `number`  
The line thickness of the grid. Default: `1`.

---

### units?  
**Type:** `string`  
The units of measurement. Default: `""`.