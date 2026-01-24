# GridMeasurePathCostFunction2D | Foundry Virtual Tabletop - API Documentation - Version 13

## Type Alias

```typescript
GridMeasurePathCostFunction2D<SegmentData>:
(
  from: Readonly<GridOffset2D>,
  to: Readonly<GridOffset2D>,
  distance: number,
  segment: DeepReadonly<SegmentData>,
) => number
```

A function that returns the cost for a given move between grid spaces in 2D. In square and hexagonal grids the grid spaces are always adjacent unless teleported. The function is never called with the same offsets.

### Type Parameters

- **SegmentData** = {}

### Parameters

- **from**: `Readonly<GridOffset2D>`  
  The offset that is moved from
- **to**: `Readonly<GridOffset2D>`  
  The offset that is moved to
- **distance**: `number`  
  The distance between the grid spaces
- **segment**: `DeepReadonly<SegmentData>`  
  The properties of the segment

### Returns

- `number`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)