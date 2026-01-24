# LineCircleIntersection

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [utils](https://foundryvtt.com/api/modules/foundry.utils.html) / [types](https://foundryvtt.com/api/modules/foundry.utils.types.html) / [LineCircleIntersection](https://foundryvtt.com/api/interfaces/foundry.utils.types.LineCircleIntersection.html)

## Interface: `LineCircleIntersection`

```typescript
interface LineCircleIntersection {
    aInside: boolean;
    bInside: boolean;
    contained: boolean;
    intersections: Point[];
    outside: boolean;
    tangent: boolean;
}
```

### Properties

- **aInside**: `boolean`  
  Is point A inside the circle?

- **bInside**: `boolean`  
  Is point B inside the circle?

- **contained**: `boolean`  
  Is the segment AB contained within the circle?

- **intersections**: `Point[]`  
  Intersection points: zero, one, or two.

- **outside**: `boolean`  
  Is the segment AB fully outside the circle?

- **tangent**: `boolean`  
  Is the segment AB tangent to the circle?

---

Point is referenced as [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)