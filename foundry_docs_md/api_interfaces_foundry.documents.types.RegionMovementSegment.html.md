# RegionMovementSegment

```typescript
interface RegionMovementSegment {
    from: ElevatedPoint;
    teleport: boolean;
    to: ElevatedPoint;
    type: RegionMovementSegmentType;
}
```

## Properties

- **from**: `ElevatedPoint`  
  The waypoint that this segment starts from.

- **teleport**: `boolean`  
  Teleport between the waypoints?

- **to**: `ElevatedPoint`  
  The waypoint that this segment goes to.

- **type**: [RegionMovementSegmentType](https://foundryvtt.com/api/types/CONST.RegionMovementSegmentType.html)  
  The type of this segment (see [CONST.REGION_MOVEMENT_SEGMENTS](https://foundryvtt.com/api/variables/CONST.REGION_MOVEMENT_SEGMENTS.html)).