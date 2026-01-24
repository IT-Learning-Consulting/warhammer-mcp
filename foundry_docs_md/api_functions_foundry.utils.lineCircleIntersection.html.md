# lineCircleIntersection | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `lineCircleIntersection`

```typescript
lineCircleIntersection(
    a: Point,
    b: Point,
    center: Point,
    radius: number,
    epsilon?: number,
): LineCircleIntersection
```

Determine the intersection between a line segment and a circle.

**Parameters**

- **a**: `Point`  
  The first vertex of the segment

- **b**: `Point`  
  The second vertex of the segment

- **center**: `Point`  
  The center of the circle

- **radius**: `number`  
  The radius of the circle

- **epsilon**: `number` = 1e-8  
  A small tolerance for floating point precision

**Returns**  
`LineCircleIntersection`  
The intersection of the segment AB with the circle

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)