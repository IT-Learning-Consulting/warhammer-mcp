# TokenRegionMovementSegment

```typescript
interface TokenRegionMovementSegment {
    action: string;
    from: TokenPosition;
    snapped: boolean;
    terrain: null | DataModel<object, DataModelConstructionContext>;
    to: TokenPosition;
    type: RegionMovementSegmentType;
}
```

## Properties

- **action**: `string`  
  The movement action between the waypoints.

- **from**: [`TokenPosition`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenPosition.html)  
  The waypoint that this segment starts from.

- **snapped**: `boolean`  
  Is the destination snapped to the grid?

- **terrain**: `null | DataModel<object, DataModelConstructionContext>`  
  The terrain data of this segment.  
  [`DataModel`](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)  
  [`DataModelConstructionContext`](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)

- **to**: [`TokenPosition`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenPosition.html)  
  The waypoint that this segment goes to.

- **type**: [`RegionMovementSegmentType`](https://foundryvtt.com/api/types/CONST.RegionMovementSegmentType.html)  
  The type of this segment (see [CONST.REGION_MOVEMENT_SEGMENTS](https://foundryvtt.com/api/variables/CONST.REGION_MOVEMENT_SEGMENTS.html)).