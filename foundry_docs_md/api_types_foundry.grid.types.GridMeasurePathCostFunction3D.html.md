# GridMeasurePathCostFunction3D | Foundry Virtual Tabletop - API Documentation - Version 13

**Type Alias**

```typescript
GridMeasurePathCostFunction3D<SegmentData>
```

A function that returns the cost for a given move between grid spaces in 3D. In square and hexagonal grids the grid spaces are always adjacent unless teleported. The function is never called with the same offsets.

## Type Parameters

- **SegmentData** = {}

## Type declaration

```typescript
(
  from: Readonly<GridOffset3D>,
  to: Readonly<GridOffset3D>,
  distance: number,
  segment: DeepReadonly<SegmentData>,
) => number
```

## Parameters

- **from**: `Readonly<GridOffset3D>`  
  The offset that is moved from

- **to**: `Readonly<GridOffset3D>`  
  The offset that is moved to

- **distance**: `number`  
  The distance between the grid spaces

- **segment**: `DeepReadonly<SegmentData>`  
  The properties of the segment

## Returns

- `number`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

[GridOffset3D Interface](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset3D.html)  
[DeepReadonly Type](https://foundryvtt.com/api/types/foundry.types.DeepReadonly.html)