# RegionSegmentizeMovementPathWaypoint

**Interface** `RegionSegmentizeMovementPathWaypoint`

```typescript
interface RegionSegmentizeMovementPathWaypoint {
    elevation: number;
    teleport?: boolean;
    x: number;
    y: number;
}
```

## Properties

- **elevation**: `number`  
  The elevation in grid units.

- **teleport?**: `boolean` (optional)  
  Teleport from the previous to this waypoint? Default: `false`.

- **x**: `number`  
  The x-coordinate in pixels (integer).

- **y**: `number`  
  The y-coordinate in pixels (integer).

---

&copy; [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)