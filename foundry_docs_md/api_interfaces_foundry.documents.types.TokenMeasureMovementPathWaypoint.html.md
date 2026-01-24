# TokenMeasureMovementPathWaypoint | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenMeasureMovementPathWaypoint {
    action?: string;
    cost?: number | TokenMovementCostFunction;
    elevation?: number;
    height?: number;
    shape?: TokenShapeType;
    terrain?: null | DataModel<object, DataModelConstructionContext>;
    width?: number;
    x?: number;
    y?: number;
}
```

## Properties

### Optional

- **action?**: `string`  
  The movement action from the previous to this waypoint. Default: the previous or prepared movement action.

- **cost?**: `number` | [TokenMovementCostFunction](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementCostFunction.html)  
  A predetermined cost (nonnegative) or cost function to be used instead of options.cost.

- **elevation?**: `number`  
  The elevation in grid units. Default: the previous or source elevation.

- **height?**: `number`  
  The height in grid spaces (positive). Default: the previous or source height.

- **shape?**: [TokenShapeType](https://foundryvtt.com/api/types/CONST.TokenShapeType.html)  
  The shape type (see [CONST.TOKEN_SHAPES](https://foundryvtt.com/api/variables/CONST.TOKEN_SHAPES.html)). Default: the previous or source shape.

- **terrain?**: `null` | [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>  
  The terrain data of this segment. Default: `null`.

- **width?**: `number`  
  The width in grid spaces (positive). Default: the previous or source width.

- **x?**: `number`  
  The top-left x-coordinate in pixels (integer). Default: the previous or source x-coordinate.

- **y?**: `number`  
  The top-left y-coordinate in pixels (integer). Default: the previous or source y-coordinate.