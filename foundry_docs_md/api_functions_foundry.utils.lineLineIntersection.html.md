# lineLineIntersection | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
lineLineIntersection(
    a: Point,
    b: Point,
    c: Point,
    d: Point,
    options?: { t1?: boolean },
): null | LineIntersection
```

An internal helper method for computing the intersection between two infinite-length lines.  
Adapted from [http://paulbourke.net/geometry/pointlineplane/](http://paulbourke.net/geometry/pointlineplane/).

## Parameters

- **a**: *Point*  
  The first endpoint of segment AB
- **b**: *Point*  
  The second endpoint of segment AB
- **c**: *Point*  
  The first endpoint of segment CD
- **d**: *Point*  
  The second endpoint of segment CD
- **options**: *{ t1?: boolean }* = {} (Optional)  
  Options which affect the intersection test
  - **t1**?: *boolean* (Optional)  
    Return the optional vector distance from C to D on CD

## Returns

*null* | [LineIntersection](https://foundryvtt.com/api/interfaces/foundry.utils.types.LineIntersection.html)  
An intersection point, or null if no intersection occurred

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)