# circleCircleIntersects | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `circleCircleIntersects`

```typescript
circleCircleIntersects(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
): boolean
```

Test whether two circles (with position and radius) intersect.

**Parameters**

- **x0**: *number*  
  x center coordinate of circle A.
- **y0**: *number*  
  y center coordinate of circle A.
- **r0**: *number*  
  radius of circle A.
- **x1**: *number*  
  x center coordinate of circle B.
- **y1**: *number*  
  y center coordinate of circle B.
- **r1**: *number*  
  radius of circle B.

**Returns** *boolean*  
True if the two circles intersect, false otherwise.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)