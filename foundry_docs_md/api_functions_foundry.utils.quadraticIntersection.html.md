# quadraticIntersection | Foundry Virtual Tabletop - API Documentation - Version 13

### Function quadraticIntersection

```typescript
quadraticIntersection(
    p0: Point,
    p1: Point,
    center: Point,
    radius: number,
    epsilon?: number,
): { x: any; y: any }[]
```

Determine the points of intersection between a line segment (`p0`, `p1`) and a circle. There will be zero, one, or two intersections. See [https://math.stackexchange.com/a/311956](https://math.stackexchange.com/a/311956).

#### Parameters

- **p0**: `Point`  
  The initial point of the line segment

- **p1**: `Point`  
  The terminal point of the line segment

- **center**: `Point`  
  The center of the circle

- **radius**: `number`  
  The radius of the circle

- **epsilon**?: `number` = 0  
  A small tolerance for floating point precision

#### Returns

`{ x: any; y: any }[]`

[**Foundry Virtual Tabletop - API Documentation - Version 13**](https://foundryvtt.com/api/index.html)