# lineSegmentIntersection

```typescript
lineSegmentIntersection(
    a: Point,
    b: Point,
    c: Point,
    d: Point,
    epsilon?: number,
): null | LineIntersection
```

An internal helper method for computing the intersection between two finite line segments.  
Adapted from [http://paulbourke.net/geometry/pointlineplane/](http://paulbourke.net/geometry/pointlineplane/)

## Parameters

- **a**: `Point`  
  The first endpoint of segment AB

- **b**: `Point`  
  The second endpoint of segment AB

- **c**: `Point`  
  The first endpoint of segment CD

- **d**: `Point`  
  The second endpoint of segment CD

- **epsilon**: `number` = 1e-8 (Optional)  
  A small epsilon which defines a tolerance for near-equality

## Returns

`null` | [LineIntersection](https://foundryvtt.com/api/interfaces/foundry.utils.types.LineIntersection.html)  
An intersection point, or null if no intersection occurred

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)