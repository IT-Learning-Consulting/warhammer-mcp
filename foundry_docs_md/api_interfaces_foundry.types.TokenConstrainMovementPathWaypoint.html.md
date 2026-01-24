# TokenConstrainMovementPathWaypoint

```typescript
interface TokenConstrainMovementPathWaypoint {
    action?: string;
    checkpoint?: boolean;
    elevation?: number;
    explicit?: boolean;
    height?: number;
    shape?: TokenShapeType;
    snapped?: boolean;
    terrain?: null | DataModel<object, DataModelConstructionContext>;
    width?: number;
    x?: number;
    y?: number;
}
```

## Properties

### **action?**: *string*  
The movement action from the previous to this waypoint.  
Default: the previous or prepared movement action.

### **checkpoint?**: *boolean*  
Is this waypoint a checkpoint?  
Default: `false`.

### **elevation?**: *number*  
The elevation in grid units.  
Default: the previous or source elevation.

### **explicit?**: *boolean*  
Was this waypoint explicitly placed by the user?  
Default: `false`.

### **height?**: *number*  
The height in grid spaces (positive).  
Default: the previous or source height.

### **shape?**: [*TokenShapeType*](https://foundryvtt.com/api/types/CONST.TokenShapeType.html)  
The shape type (see [CONST.TOKEN_SHAPES](https://foundryvtt.com/api/variables/CONST.TOKEN_SHAPES.html)).  
Default: the previous or source shape.

### **snapped?**: *boolean*  
Was this waypoint snapped to the grid?  
Default: `false`.

### **terrain?**: *null* | [*DataModel*](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<*object*, [*DataModelConstructionContext*](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>  
The terrain data of this segment.  
Default: `null`.

### **width?**: *number*  
The width in grid spaces (positive).  
Default: the previous or source width.

### **x?**: *number*  
The top-left x-coordinate in pixels (integer).  
Default: the previous or source x-coordinate.

### **y?**: *number*  
The top-left y-coordinate in pixels (integer).  
Default: the previous or source y-coordinate.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).