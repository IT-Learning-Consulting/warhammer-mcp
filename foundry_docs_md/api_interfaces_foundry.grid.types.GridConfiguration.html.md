# GridConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface GridConfiguration {
    alpha?: number;
    color?: ColorSource;
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
Type: [`ColorSource`](https://foundryvtt.com/api/types/foundry.types.ColorSource.html)  
The color of the grid. Default: `0x000000`.

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

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)