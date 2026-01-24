# TokenMeasuredMovementWaypoint | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenMeasuredMovementWaypoint {
    action: string;
    checkpoint: boolean;
    cost: number;
    elevation: number;
    explicit: boolean;
    height: number;
    intermediate: boolean;
    movementId: string;
    shape: TokenShapeType;
    snapped: boolean;
    terrain: null | DataModel<object, DataModelConstructionContext>;
    userId: string;
    width: number;
    x: number;
    y: number;
}
```

## Properties

- **action**: `string`  
  The movement action from the previous to this waypoint.

- **checkpoint**: `boolean`  
  Is this waypoint a checkpoint?

- **cost**: `number`  
  The movement cost from the previous to this waypoint (nonnegative).

- **elevation**: `number`  
  The elevation in grid units.

- **explicit**: `boolean`  
  Was this waypoint explicitly placed by the user?

- **height**: `number`  
  The height in grid spaces (positive).

- **intermediate**: `boolean`  
  Is this waypoint intermediate?

- **movementId**: `string`  
  The ID of the movement from the previous to this waypoint.

- **shape**: [TokenShapeType](https://foundryvtt.com/api/types/CONST.TokenShapeType.html)  
  The shape type (see [CONST.TOKEN_SHAPES](https://foundryvtt.com/api/variables/CONST.TOKEN_SHAPES.html)).

- **snapped**: `boolean`  
  Was this waypoint snapped to the grid?

- **terrain**: `null` | [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<`object`, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)`>`  
  The terrain data from the previous to this waypoint.

- **userId**: `string`  
  The ID of the user that moved the token to from the previous to this waypoint.

- **width**: `number`  
  The width in grid spaces (positive).

- **x**: `number`  
  The top-left x-coordinate in pixels (integer).

- **y**: `number`  
  The top-left y-coordinate in pixels (integer).