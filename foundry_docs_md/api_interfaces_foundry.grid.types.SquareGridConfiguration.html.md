# SquareGridConfiguration

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [grid](https://foundryvtt.com/api/modules/foundry.grid.html) / [types](https://foundryvtt.com/api/modules/foundry.grid.types.html) / [SquareGridConfiguration](https://foundryvtt.com/api/interfaces/foundry.grid.types.SquareGridConfiguration.html)

## Interface

```typescript
interface SquareGridConfiguration {
    alpha?: number;
    color?: ColorSource;
    diagonals?: GridDiagonalRule;
    distance?: number;
    size: number;
    style?: string;
    thickness?: number;
    units?: string;
}
```

## Properties

### alpha?  
Type: `number`  
The alpha of the grid. Default: `1`.

### color?  
Type: [ColorSource](https://foundryvtt.com/api/types/foundry.types.ColorSource.html)  
The color of the grid. Default: `0x000000`.

### diagonals?  
Type: [GridDiagonalRule](https://foundryvtt.com/api/types/CONST.GridDiagonalRule.html)  
The rule for diagonal measurement (see [CONST.GRID_DIAGONALS](https://foundryvtt.com/api/variables/CONST.GRID_DIAGONALS.html)). Default: `CONST.GRID_DIAGONALS.EQUIDISTANT`.

### distance?  
Type: `number`  
The distance of a grid space in units (a positive number). Default: `1`.

### size  
Type: `number`  
The size of a grid space in pixels (a positive number).

### style?  
Type: `string`  
The style of the grid. Default: `"solidLines"`.

### thickness?  
Type: `number`  
The line thickness of the grid. Default: `1`.

### units?  
Type: `string`  
The units of measurement. Default: `""`.