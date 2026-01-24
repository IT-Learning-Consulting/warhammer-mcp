# orient2dFast | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `orient2dFast`

```typescript
orient2dFast(a: Point, b: Point, c: Point): number
```

Determine the relative orientation of three points in two-dimensional space. The result is also an approximation of twice the signed area of the triangle defined by the three points. This method is fast - but not robust against issues of floating point precision. Best used with integer coordinates. Adapted from [https://github.com/mourner/robust-predicates](https://github.com/mourner/robust-predicates).

**Parameters**

- **a**: *Point*  
  An endpoint of segment AB, relative to which point C is tested

- **b**: *Point*  
  An endpoint of segment AB, relative to which point C is tested

- **c**: *Point*  
  A point that is tested relative to segment AB

**Returns** *number*  
The relative orientation of points A, B, and C  
- A positive value if the points are in counter-clockwise order (C lies to the left of AB)  
- A negative value if the points are in clockwise order (C lies to the right of AB)  
- Zero if the points A, B, and C are collinear.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)