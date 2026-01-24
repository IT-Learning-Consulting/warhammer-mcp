# TokenMovementActionCostFunction | Foundry Virtual Tabletop - API Documentation - Version 13

## Type Alias

```typescript
TokenMovementActionCostFunction: (
    baseCost: number,
    from: Readonly<import("foundry.grid.types").GridOffset3D>,
    to: Readonly<import("foundry.grid.types").GridOffset3D>,
    distance: number,
    segment: import("foundry.types").DeepReadonly<import("foundry.documents.types").TokenMovementSegmentData>,
) => number
```

### Type declaration

```typescript
(
    baseCost: number,
    from: Readonly<import("foundry.grid.types").GridOffset3D>,
    to: Readonly<import("foundry.grid.types").GridOffset3D>,
    distance: number,
    segment: import("foundry.types").DeepReadonly<import("foundry.documents.types").TokenMovementSegmentData>,
): number
```

### Parameters

- **baseCost**: `number`  
  The base cost (terrain cost)

- **from**: `Readonly<GridOffset3D>`  
  The offset that is moved from  
  See [GridOffset3D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset3D.html)

- **to**: `Readonly<GridOffset3D>`  
  The offset that is moved to  
  See [GridOffset3D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset3D.html)

- **distance**: `number`  
  The distance between the grid spaces

- **segment**: `DeepReadonly<TokenMovementSegmentData>`  
  The properties of the segment  
  See [DeepReadonly](https://foundryvtt.com/api/types/foundry.types.DeepReadonly.html) and [TokenMovementSegmentData](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementSegmentData.html)

### Returns

- `number`  

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)