# GridData

Interface **GridData** from [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules/foundry.documents.types.html).

```typescript
interface GridData {
    alpha?: number;
    color?: string;
    distance?: number;
    size?: number;
    type?: number;
    units?: string;
}
```

## Properties

- **alpha?**: `number`  
  A number between 0 and 1 for the opacity of the grid lines.

- **color?**: `string`  
  A string representing the color used to render the grid lines.

- **distance?**: `number`  
  The number of distance units which are represented by a single grid space.

- **size?**: `number`  
  The grid size which represents the width (or height) of a single grid space.

- **type?**: `number`  
  The type of grid, a number from `CONST.GRID_TYPES`.

- **units?**: `string`  
  A label for the units of measure which are used for grid distance.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)