# pathCircleIntersects | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `pathCircleIntersects`

```typescript
pathCircleIntersects(
    points: number[] | Point[],
    close: boolean,
    center: Point,
    radius: number,
): boolean
```

Test whether the circle given by the center and radius intersects the path (open or closed).

**Parameters**

- **points**: `number[]` | `Point[]`  
  The points of the path

- **close**: `boolean`  
  If true, the edge from the last to the first point is tested

- **center**: `Point`  
  The center of the circle

- **radius**: `number`  
  The radius of the circle

**Returns**  
`boolean` — Does the circle intersect the path?

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)